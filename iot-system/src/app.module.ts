import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { User } from './modules/users/users.entity';
import { SensorsModule } from './modules/sensors/sensors.module';
import { Sensor } from './modules/sensors/sensors.entity';
import { MqttModule } from './modules/mqtt/mqtt.module';
import { InfluxModule } from './modules/influx/influx.module';
import { WebsocketGateway } from './modules/websocket/websocket.gateway';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { Company } from './modules/company/company.entity';
import { Role } from './modules/roles/roles.entity';
import { InfluxService } from './modules/influx/influx.service';
import { InfluxController } from './modules/influx/influx.controller';
import { LoggingModule } from './modules/logging/logging.module';
import { LoggingMiddleware } from './modules/logging/logging.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'db',
      port: 5432,
      username: 'admin',
      password: '0YEQiQN6Y7UyU2N',
      database: 'iot_db',
      entities: [User, Sensor, Company, Role],
      synchronize: false,
    }),
    UsersModule,
    SensorsModule,
    MqttModule,
    InfluxModule,
    WebsocketModule,
    AuthModule,
    CompanyModule,
    LoggingModule, 
  ],
  controllers: [AppController, InfluxController],
  providers: [AppService, WebsocketGateway, InfluxService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}