import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WsException,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  // JSON için tip tanımlaması
  interface SensorRegistrationPayload {
    event: string;
    data: string;
  }
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
    transports: ['websocket', 'polling'],
    path: '/socket.io/'
  })
  export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private clients: Map<string, Set<string>> = new Map(); // Socket ID'lerini saklıyoruz
  
    handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
      console.log('sensor_id:', client.handshake.query.sensor_id);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
      // Tüm sensorlar için kontrol et
      this.clients.forEach((clientIds, sensorId) => {
        if (clientIds.has(client.id)) {
          clientIds.delete(client.id);
          console.log(`Client ${client.id} removed from sensor ${sensorId}`);
          
          // Eğer sensör için hiç istemci kalmadıysa, sensörü kaldır
          if (clientIds.size === 0) {
            this.clients.delete(sensorId);
            console.log(`No clients left for sensor ${sensorId}, removing entry`);
          }
        }
      });
    }
  
    @SubscribeMessage('registerSensor')
    handleRegisterSensor(client: Socket, payload: SensorRegistrationPayload) {
      try {
        // JSON payload'dan data değerini al
        let sensorId: string;
        
        if (typeof payload === 'object' && payload !== null) {
          // JSON nesnesinden data'yı al
          sensorId = String(payload.data);
          console.log('Received JSON payload:', payload);
        } else {
          // Eski format (string) - geri uyumluluk için
          sensorId = String(payload);
          console.log('Received string payload:', sensorId);
        }
        
        if (!sensorId || sensorId.trim() === '') {
          throw new WsException('Invalid sensor_id');
        }
        
        if (!this.clients.has(sensorId)) {
          this.clients.set(sensorId, new Set());
        }
        
        this.clients.get(sensorId)!.add(client.id);
        console.log(`Client ${client.id} registered for sensor_id: ${sensorId}`);
        
        // Başarılı yanıt gönder
        client.emit('registerResponse', { success: true, sensorId });
      } catch (error) {
        console.error('Registration error:', error);
        client.emit('error', { message: error.message || 'Registration failed' });
      }
    }
  
    sendMessage(sensorId: string, message: any) {
      try {
        const clientIds = this.clients.get(sensorId);
        if (clientIds && clientIds.size > 0) {
          console.log(`Sending message to ${clientIds.size} clients for sensor ${sensorId}`);
          
          clientIds.forEach(clientId => {
            const socket = this.findSocketById(clientId);
            if (socket) {
              socket.emit('sensorData', message);
            }
          });
        } else {
          console.log(`No clients registered for sensor ${sensorId}`);
        }
      } catch (error) {
        console.error(`Error sending message for sensor ${sensorId}:`, error);
      }
    }
  
    hasClients(sensorId: string): boolean {
      const clientIds = this.clients.get(sensorId);
      console.log(`Checking clients for sensor ${sensorId}:`, clientIds);
      return clientIds ? clientIds.size > 0 : false;
    }
    
    // Socket ID'den Socket nesnesini bulma yardımcı metodu
    private findSocketById(clientId: string): Socket | undefined {
      const sockets = this.server.sockets.sockets;
      return sockets.get(clientId);
    }
  }