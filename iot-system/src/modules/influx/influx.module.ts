import { Module } from '@nestjs/common';
import { InfluxService } from './influx.service';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [LoggingModule],
  providers: [InfluxService],
  exports: [InfluxService],
})
export class InfluxModule {}