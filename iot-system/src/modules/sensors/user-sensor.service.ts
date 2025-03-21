// user-sensor.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSensor } from './user-sensor.entity';
import { User } from '../users/users.entity';
import { Sensor } from './sensors.entity';

@Injectable()
export class UserSensorService {
  constructor(
    @InjectRepository(UserSensor)
    private userSensorRepository: Repository<UserSensor>,
  ) {}

  async assignSensorToUser(userId: number, sensorId: number): Promise<UserSensor> {
    const userSensor = new UserSensor();
    userSensor.user = { id: userId } as User;
    userSensor.sensor = { sensor_id: sensorId } as Sensor;
    
    return this.userSensorRepository.save(userSensor);
  }

  async removeSensorFromUser(userId: number, sensorId: number): Promise<void> {
    await this.userSensorRepository.delete({
      user: { id: userId },
      sensor: { sensor_id: sensorId },
    });
  }

  async getUserSensors(userId: number): Promise<UserSensor[]> {
    return this.userSensorRepository.find({
      where: { user: { id: userId } },
      relations: ['sensor'],
    });
  }

  async isSensorAssignedToUser(userId: number, sensorId: number): Promise<boolean> {
    const count = await this.userSensorRepository.count({
      where: {
        user: { id: userId },
        sensor: { sensor_id: sensorId },
      },
    });
    
    return count > 0;
  }
}