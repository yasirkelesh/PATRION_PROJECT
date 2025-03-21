import { Controller, Get, Query, UseGuards, Param, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { JwtAuthGuard} from '../auth/auth.guard';

@Controller('api/logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogViewerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Get()
  @Roles('system_admin')
  getAllLogs(
    @Query('userId') userId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize?: number,
  ) {
    return this.loggerService.getUserLogs(userId, page, pageSize);
  }

  @Get('user/:userId')
  @Roles('system_admin')
  getUserLogs(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize?: number,
  ) {
    return this.loggerService.getUserLogs(userId, page, pageSize);
  }

  @Get('stats')
  @Roles('system_admin')
  getLogStats() {
    return {
      hourlyDistribution: this.loggerService.getHourlyDistribution(),
      logViewsDistribution: this.loggerService.getHourlyDistribution('viewed_logs'),
    };
  }
}