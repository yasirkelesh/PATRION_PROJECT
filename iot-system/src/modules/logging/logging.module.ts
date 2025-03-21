import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LogViewerController } from './log-viewer.controller';

@Module({
  controllers: [LogViewerController],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggingModule {}