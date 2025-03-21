// sensors.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from './sensors.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { UserSensorService } from './user-sensor.service';
import { LoggerService } from '../logging/logger.service';

@Injectable()
export class SensorsService {
  constructor(
    @InjectRepository(Sensor)
    private sensorRepository: Repository<Sensor>,
    private userSensorService: UserSensorService,
    private loggerService: LoggerService,
  ) {}

  async findAll(): Promise<Sensor[]> {
    this.loggerService.logUserActivity('system', 'sensor_list');
    return this.sensorRepository.find();
  }

  async findByCompany(companyId: number): Promise<Sensor[]> {
    this.loggerService.logUserActivity('system', 'sensor_list', { company_id: companyId });
    return this.sensorRepository.find({
      where: { company: { id: companyId } },
    });
  }

  async findByUser(userId: number): Promise<Sensor[]> {
    this.loggerService.logUserActivity('system', 'sensor_list', { user_id: userId });
    const userSensors = await this.userSensorService.getUserSensors(userId);
    return userSensors.map(us => us.sensor);
  }

  async findOne(sensorId: number): Promise<Sensor | null> {
    this.loggerService.logUserActivity('system', 'sensor_view', { sensor_id: sensorId });
    return this.sensorRepository.findOne({
      where: { sensor_id: sensorId },
    });
  }

  async create(createSensorDto: CreateSensorDto): Promise<Sensor> {
    this.loggerService.logUserActivity('system', 'sensor_create', { sensor_id: createSensorDto.sensor_id });
    const sensor = this.sensorRepository.create(createSensorDto);
    return this.sensorRepository.save(sensor);
  }

  async update(sensorId: number, updateSensorDto: UpdateSensorDto): Promise<Sensor | null> {
    this.loggerService.logUserActivity('system', 'sensor_update', { sensor_id: sensorId });
    await this.sensorRepository.update(sensorId, updateSensorDto);
    return this.findOne(sensorId);
  }

  async remove(sensorId: number): Promise<void> {
    this.loggerService.logUserActivity('system', 'sensor_delete', { sensor_id: sensorId });
    await this.sensorRepository.delete(sensorId);
  }

  async checkAccess(userId: number, sensorId: number, userRole: string, userCompanyId?: number): Promise<boolean> {
    // System admin her sensöre erişebilir
    if (userRole === 'system_admin') {
      return true;
    }

    this.loggerService.logUserActivity('system', 'sensor_access_check', { user_id: userId, sensor_id: sensorId });
    const sensor = await this.findOne(sensorId);
    if (!sensor) {
      throw new NotFoundException('Sensor not found');
    }

    // Company admin kendi şirketine ait sensörlere erişebilir
    if (userRole === 'company_admin' && userCompanyId) {
      return sensor.company?.id === userCompanyId;
    }

    // Standard user, kendisine atanmış sensörlere erişebilir
    if (userRole === 'standard_user') {
      return this.userSensorService.isSensorAssignedToUser(userId, sensorId);
    }

    return false;
  }
}