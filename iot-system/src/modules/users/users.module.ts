import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { CompanyModule } from '../company/company.module';
import { RolesModule } from '../roles/roles.module';
import { LoggingModule } from '../logging/logging.module';


@Module({
  imports: [TypeOrmModule.forFeature([User]), 
  CompanyModule,
  RolesModule,
  LoggingModule,
],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService,TypeOrmModule.forFeature([User])],
})
export class UsersModule {}