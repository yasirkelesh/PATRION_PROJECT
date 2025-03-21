// roles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './roles.entity';
import { RolesService } from './roles.service';
import { LoggingModule } from '../logging/logging.module';


@Module({
  imports: [TypeOrmModule.forFeature([Role]), LoggingModule],
  providers: [RolesService],
  exports: [TypeOrmModule.forFeature([Role]), RolesService],
})
export class RolesModule {}