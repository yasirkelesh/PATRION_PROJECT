import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { UserSensorService } from './user-sensor.service';
import { Sensor } from './sensors.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { JwtAuthGuard} from '../auth/auth.guard';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Controller('Sensors')
export class SensorsController {
  constructor(
    private sensorsService: SensorsService,
    private userSensorService: UserSensorService,
    private usersService: UsersService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('system_admin', 'company_admin', 'standard_user')
  @Get()
  async findAll(@Req() req: Request): Promise<Sensor[]> {
    const currentUser: any = req.user;
    
    // System admin -> tüm sensörler
    if (currentUser.role.name === 'system_admin') {
      return this.sensorsService.findAll();
    }
    
    // Company admin -> şirketine ait sensörler
    if (currentUser.role.name === 'company_admin') {
      if (!currentUser.company || !currentUser.company.id) {
        throw new ForbiddenException('Company admin must be associated with a company');
      }
      return this.sensorsService.findByCompany(currentUser.company.id);
    }
    
    // Standard user -> kendisine atanmış sensörler
    if (currentUser.role.name === 'standard_user') {
      return this.sensorsService.findByUser(currentUser.id);
    }
    
    throw new ForbiddenException('You do not have permission to access sensors');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('system_admin', 'company_admin', 'standard_user')
  @Get(':sensor_id')
  async findOne(@Param('sensor_id') sensorId: string, @Req() req: Request): Promise<Sensor | null> {
    const currentUser: any = req.user;
    const sensorIdNum = +sensorId;
    
    // Erişim kontrolü
    const hasAccess = await this.sensorsService.checkAccess(
      currentUser.id,
      sensorIdNum,
      currentUser.role.name,
      currentUser.company?.id
    );
    
    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to access this sensor');
    }
    
    return this.sensorsService.findOne(sensorIdNum);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('system_admin', 'company_admin')
  @Post()
  async create(@Body() createSensorDto: CreateSensorDto, @Req() req: Request): Promise<Sensor> {
    const currentUser: any = req.user;
    
    // System admin -> herhangi bir şirkete sensör ekleyebilir
    if (currentUser.role.name === 'system_admin') {
      return this.sensorsService.create(createSensorDto);
    }
    
    // Company admin -> sadece kendi şirketine sensör ekleyebilir
    if (currentUser.role.name === 'company_admin') {
      if (!currentUser.company || !currentUser.company.id) {
        throw new ForbiddenException('Company admin must be associated with a company');
      }
      
      // Şirket bilgisini admin'in şirketiyle değiştir
      const companySpecificDto = {
        ...createSensorDto,
        company_id: currentUser.company.id
      };
      
      return this.sensorsService.create(companySpecificDto);
    }
    
    throw new ForbiddenException('You do not have permission to create sensors');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('system_admin', 'company_admin')
  @Put(':sensor_id')
  async update(
    @Param('sensor_id') sensorId: string, 
    @Body() updateSensorDto: UpdateSensorDto, 
    @Req() req: Request
  ): Promise<Sensor | null> {
    const currentUser: any = req.user;
    const sensorIdNum = +sensorId;
    
    // Erişim kontrolü (sadece admin ve company admin için)
    const hasAccess = await this.sensorsService.checkAccess(
      currentUser.id,
      sensorIdNum,
      currentUser.role.name,
      currentUser.company?.id
    );
    
    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to update this sensor');
    }
    
    // Company admin ise şirket değiştirmeye izin verme
    if (currentUser.role.name === 'company_admin' && 
        updateSensorDto.company_id && 
        updateSensorDto.company_id !== currentUser.company.id) {
      throw new ForbiddenException('Company admins cannot change sensor company');
    }
    
    return this.sensorsService.update(sensorIdNum, updateSensorDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('system_admin', 'company_admin')
  @Delete(':sensor_id')
  async remove(@Param('sensor_id') sensorId: string, @Req() req: Request): Promise<void> {
    const currentUser: any = req.user;
    const sensorIdNum = +sensorId;
    
    // Erişim kontrolü
    const hasAccess = await this.sensorsService.checkAccess(
      currentUser.id,
      sensorIdNum,
      currentUser.role.name,
      currentUser.company?.id
    );
    
    if (!hasAccess) {
      throw new ForbiddenException('You do not have permission to delete this sensor');
    }
    
    return this.sensorsService.remove(sensorIdNum);
  }
  
  // KULLANICI-SENSÖR İLİŞKİ YÖNETİMİ
  
  @Post('assign/:sensor_id/user/:user_id')
  async assignSensorToUser(
    @Param('sensor_id') sensorId: string,
    @Param('user_id') userId: string,
    @Req() req: Request
  ) {
    const currentUser: any = req.user;
    const sensorIdNum = +sensorId;
    const userIdNum = +userId;
    
    const sensor = await this.sensorsService.findOne(sensorIdNum);
    if (!sensor) {
      throw new NotFoundException('Sensor not found');
    }
    
    // System admin her işlemi yapabilir
    if (currentUser.role.name === 'system_admin') {
      return this.userSensorService.assignSensorToUser(userIdNum, sensorIdNum);
    }
    
    // Company admin sadece kendi şirketindeki sensörleri kendi şirketindeki kullanıcılara atayabilir
    if (currentUser.role.name === 'company_admin') {
      if (!currentUser.company || !currentUser.company.id) {
        throw new ForbiddenException('Company admin must be associated with a company');
      }
      
      // Sensör şirket kontrolü
      if (sensor.company?.id !== currentUser.company.id) {
        throw new ForbiddenException('You can only assign sensors from your company');
      }
      
      // Kullanıcı şirket kontrolü için kullanıcıyı getir
      const user = await this.usersService.findOne(userIdNum);
      
      if (!user || user.company?.id !== currentUser.company.id) {
        throw new ForbiddenException('You can only assign sensors to users from your company');
      }
      
      return this.userSensorService.assignSensorToUser(userIdNum, sensorIdNum);
    }
    
    throw new ForbiddenException('You do not have permission to assign sensors');
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('system_admin', 'company_admin')
  @Delete('assign/:sensor_id/user/:user_id')
  async removeSensorFromUser(
    @Param('sensor_id') sensorId: string,
    @Param('user_id') userId: string,
    @Req() req: Request
  ) {
    const currentUser: any = req.user;
    const sensorIdNum = +sensorId;
    const userIdNum = +userId;
    
    const sensor = await this.sensorsService.findOne(sensorIdNum);
    if (!sensor) {
      throw new NotFoundException('Sensor not found');
    }
    
    // System admin her işlemi yapabilir
    if (currentUser.role.name === 'system_admin') {
      return this.userSensorService.removeSensorFromUser(userIdNum, sensorIdNum);
    }
    
    // Company admin sadece kendi şirketindeki sensörleri kendi şirketindeki kullanıcılardan kaldırabilir
    if (currentUser.role.name === 'company_admin') {
      if (!currentUser.company || !currentUser.company.id) {
        throw new ForbiddenException('Company admin must be associated with a company');
      }
      
      // Sensör şirket kontrolü
      if (sensor.company?.id !== currentUser.company.id) {
        throw new ForbiddenException('You can only remove sensors from your company');
      }
      
      // Kullanıcı şirket kontrolü için kullanıcıyı getir
      const user = await this.usersService.findOne(userIdNum);
      
      if (!user || user.company?.id !== currentUser.company.id) {
        throw new ForbiddenException('You can only remove sensors from users in your company');
      }
      
      // İlişkinin var olduğunu kontrol et
      /* const assignment = await this.userSensorService.findAssignment(userIdNum, sensorIdNum);
      if (!assignment) {
        throw new NotFoundException('Sensor is not assigned to this user');
      } */
      
      return this.userSensorService.removeSensorFromUser(userIdNum, sensorIdNum);
    }
    
    throw new ForbiddenException('You do not have permission to remove sensor assignments');
  }
}