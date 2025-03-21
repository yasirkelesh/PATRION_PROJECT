// users.controller.ts
import { Controller, Get, Post, Put, Delete, Body,Req, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { CreateUserDto} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard} from '../auth/auth.guard';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { Request } from 'express';
import { ForbiddenException } from '@nestjs/common';


@Controller('users')

export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('system_admin', 'company_admin')
  @Get()
  async findAll(@Req() req: Request): Promise<User[]> {
    // req.user artık TypeScript tarafından tanınacak
    const currentUser: any = req.user;
    
    // System admin ise tüm kullanıcıları getir
    if (currentUser.role.name === 'system_admin') {
      return this.usersService.findAll();
    }
    
    // Company admin ise sadece kendi şirketine ait kullanıcıları getir
    if (currentUser.role.name === 'company_admin') {
      if (!currentUser.company || !currentUser.company.id) {
        throw new ForbiddenException('Company admin must be associated with a company');
      }
      return this.usersService.findByCompany(currentUser.company.id);
    }
    
    throw new ForbiddenException('You do not have permission to access this resource');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('system_admin', 'company_admin')
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request): Promise<User | null> {
    const currentUser: any = req.user;
    const userId = +id;
    
    // System admin ise direkt erişim ver
    if (currentUser.role.name === 'system_admin') {
      return this.usersService.findOne(userId);
    }
    
    // Company admin ise, kullanıcının kendi şirketinde olup olmadığını kontrol et
    if (currentUser.role.name === 'company_admin') {
      const user = await this.usersService.findOne(userId);
      if (!user || user.company?.id !== currentUser.company?.id) {
        throw new ForbiddenException('You can only view users from your company');
      }
      return user;
    }
    
    throw new ForbiddenException('You do not have permission to access this resource');
  }

  //@UseGuards(JwtAuthGuard,RolesGuard)
  //@Roles('system_admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('system_admin', 'company_admin')
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request): Promise<User> {
    const currentUser: any = req.user;
    
    // System admin ise kısıtlama olmadan kullanıcı oluşturabilir
    if (currentUser.role.name === 'system_admin') {
      return this.usersService.create(createUserDto);
    }
    
    // Company admin ise, sadece kendi şirketine bağlı kullanıcı oluşturabilir
    if (currentUser.role.name === 'company_admin') {
      if (!currentUser.company || !currentUser.company.id) {
        throw new ForbiddenException('Company admin must be associated with a company');
      }
      
      // Company admin sadece standard_user rolüne sahip kullanıcılar oluşturabilir
      // Burada role_id değerini sizin veritabanınızdaki standard_user role_id değerine göre ayarlamalısınız
      if (createUserDto.role_id !== 3) { // standard_user role_id değerini kontrol edin
        throw new ForbiddenException('Company admins can only create standard users');
      }
      
      // Şirket bilgisini zorunlu olarak admin'in şirketi yapıyoruz
      return this.usersService.create({
        ...createUserDto,
        company_id: currentUser.company.id
      });
    }
    
    throw new ForbiddenException('You do not have permission to create users');
  }
  

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('system_admin', 'company_admin')
  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto, 
    @Req() req: Request
  ): Promise<User | null> {
    const currentUser: any = req.user;
    const userId = +id;
    
    // System admin ise direkt erişim ver
    if (currentUser.role.name === 'system_admin') {
      return this.usersService.update(userId, updateUserDto);
    }
    
    // Company admin ise, kullanıcının kendi şirketinde olup olmadığını kontrol et
    if (currentUser.role.name === 'company_admin') {
      const user = await this.usersService.findOne(userId);
      if (!user || user.company?.id !== currentUser.company?.id) {
        throw new ForbiddenException('You can only update users from your company');
      }
      
      // Role değişimine izin verme
      if (updateUserDto.role_id && user.role.id !== updateUserDto.role_id) {
        throw new ForbiddenException('Company admins cannot change user roles');
      }
      
      // Şirket değişimine izin verme
      if (updateUserDto.company_id && updateUserDto.company_id !== currentUser.company.id) {
        throw new ForbiddenException('Company admins cannot change user company');
      }
      
      return this.usersService.update(userId, updateUserDto);
    }
    
    throw new ForbiddenException('You do not have permission to update users');
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('system_admin', 'company_admin')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const currentUser: any = req.user;
    const userId = +id;
    
    // System admin ise direkt erişim ver
    if (currentUser.role.name === 'system_admin') {
      return this.usersService.remove(userId);
    }
    
    // Company admin ise, kullanıcının kendi şirketinde olup olmadığını kontrol et
    if (currentUser.role.name === 'company_admin') {
      const user = await this.usersService.findOne(userId);
      if (!user || user.company?.id !== currentUser.company?.id) {
        throw new ForbiddenException('You can only delete users from your company');
      }
      
      // Company admin diğer adminleri silemez
      if (user.role.name === 'company_admin') {
        throw new ForbiddenException('Company admins cannot delete other company admins');
      }
      
      return this.usersService.remove(userId);
    }
    
    throw new ForbiddenException('You do not have permission to delete users');
  }
}