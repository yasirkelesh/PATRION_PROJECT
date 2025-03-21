// roles.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './roles.entity';
import { LoggerService } from '../logging/logger.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private loggerService: LoggerService,
  ) {}

  findAll(): Promise<Role[]> {
    this.loggerService.logUserActivity('system', 'roles_listed');
    return this.rolesRepository.find();
  }

  findOne(id: number): Promise<Role | null> {
    this.loggerService.logUserActivity('system', 'role_viewed', { role_id: id });
    return this.rolesRepository.findOne({ where: { id } });
  }

  findByName(name: string): Promise<Role | null> {
    this.loggerService.logUserActivity('system', 'role_viewed', { role_name: name });
    return this.rolesRepository.findOne({ where: { name } });
  }
}