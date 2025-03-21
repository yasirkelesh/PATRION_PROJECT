import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MqttService } from './mqtt.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [EventEmitterModule.forRoot(), LoggingModule],
  providers: [MqttService, WebsocketGateway],
  exports: [MqttService],
})
export class MqttModule {}