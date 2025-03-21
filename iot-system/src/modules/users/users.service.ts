// users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import { CompanyService } from '../company/company.service';
import { Company } from '../company/company.entity';
import { Role } from '../roles/roles.entity';
import { LoggerService } from '../logging/logger.service';


import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private loggerService: LoggerService,
  ) {}

  findAll(): Promise<User[]> {
    this.loggerService.logUserActivity('system', 'user_list', {});
    return this.usersRepository.find({
      relations: ['role', 'company'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'company'],
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    this.loggerService.logUserActivity('system', 'user_detail', { user_id: id });
    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: ['role', 'company'],
    });
    
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    this.loggerService.logUserActivity('system', 'user_detail', { user_id: user.id });
    return user;
  }

  async findByCompany(companyId: number): Promise<User[]> {
  this.loggerService.logUserActivity('system', 'user_list', { company_id: companyId });
  return this.usersRepository.find({
    where: { company: { id: companyId } },
    relations: ['role', 'company']
  });
}
  findOneByUserId(userId: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: userId } });
  }
  findOneWithPermissions(id: number): Promise<User | null> {
    this.loggerService.logUserActivity('system', 'user_detail', { user_id: id });
    return this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
  }

  /*async create(createUserDto: CreateUserDto): Promise<User> {
    const salt = await bcryptjs.genSalt();
    const hashedPassword = await bcryptjs.hash(createUserDto.password, salt);
    const user = new User();
    user.username = createUserDto.username;
    user.password = hashedPassword;
    user.role = createUserDto.role_id;
    user.company = createUserDto.company_id;
    return this.usersRepository.save(user);
  } */

    async create(createUserDto: CreateUserDto): Promise<User> {
      const salt = await bcryptjs.genSalt();
      const hashedPassword = await bcryptjs.hash(createUserDto.password, salt);
      
      // Rol bulma
      const role = await this.roleRepository.findOne({ where: { id: createUserDto.role_id } });
      if (!role) {
        throw new NotFoundException(`Role with ID ${createUserDto.role_id} not found`);
      }
      
      const user = new User();
      user.username = createUserDto.username;
      user.password = hashedPassword;
      user.role = role;
      
      // Company ID varsa, company'yi atayalım
      if (createUserDto.company_id) {
        const company = await this.companyRepository.findOne({ where: { id: createUserDto.company_id } });
        if (!company) {
          throw new NotFoundException(`Company with ID ${createUserDto.company_id} not found`);
        }
        user.company = company;
      }
      this.loggerService.logUserActivity('system', 'user_create', { user_id: user.id });
      return this.usersRepository.save(user);
    }

    
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}