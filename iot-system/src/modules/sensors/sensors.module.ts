import { Module } from '@nestjs/common';
import { SensorsController } from './sensors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorsService } from './sensors.service';
import { Sensor } from './sensors.entity';
import { CompanyModule } from '../company/company.module';
import { UserSensorService } from './user-sensor.service';
import { UserSensor } from './user-sensor.entity';
import { UsersModule } from '../users/users.module';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sensor, UserSensor]),
    CompanyModule,
    UsersModule,
    LoggingModule,
  ],
  providers: [SensorsService, UserSensorService], // UserSensorService burada olmalı
  controllers: [SensorsController], // Sadece gerçek kontrolörler burada olmalı
  exports: [SensorsService, UserSensorService], // Diğer modüllerde kullanılacaksa
})
export class SensorsModule {}