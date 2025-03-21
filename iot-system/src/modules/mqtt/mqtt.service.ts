import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as mqtt from 'mqtt';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { LoggerService } from '../logging/logger.service';

@Injectable()
export class MqttService {
  private client = mqtt.connect('mqtt://mqtt:1883');

  constructor(
    private eventEmitter: EventEmitter2,
    private websocketGateway: WebsocketGateway,
    private loggerService: LoggerService,
  ) {
    this.client.on('connect', () => {
      console.log('MQTT Broker\'a bağlanıldı');
      this.client.subscribe('sensor/data');
    });

    this.client.on('message', (topic, message) => {
      console.log('Mesaj alındı:', message.toString());
      
      try {
        const data = JSON.parse(message.toString());
        

        if (this.isValidSensorData(data)) {
          if (data.sensor_id && this.websocketGateway.hasClients(data.sensor_id)) {
            this.websocketGateway.sendMessage(data.sensor_id, data);
            console.log('Websocket üzerinden mesaj gönderildi');
          }
          this.eventEmitter.emit('sensor.data.received', data); // Event yayınla

          if (data.sensor_id) {
            this.loggerService.logUserActivity('system', 'sensor_data_received', {
              sensor_id: data.sensor_id,
              timestamp: data.timestamp
            });
          }
        } else {
          console.error('Geçersiz sensör veri formatı:', data);
        }
      } catch (error) {
        console.error('JSON ayrıştırma hatası:', error);
      }

      
    });
  }

  //format kontrolü
  private isValidSensorData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.sensor_id === 'string' &&
      typeof data.timestamp === 'number' &&
      typeof data.temperature === 'number' &&
      typeof data.humidity === 'number'
    );
  }
}