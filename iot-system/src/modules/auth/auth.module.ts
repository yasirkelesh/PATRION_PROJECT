import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from   './local.strategy';
import { UsersModule } from '../users/users.module';
import { jwtConstants } from './constants';
import { LoggingModule } from '../logging/logging.module';


@Module({
    imports: [
      UsersModule,
      PassportModule,
      LoggingModule,
      JwtModule.register({
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '60m' },
      }),

    ],
    providers: [AuthService, JwtStrategy, LocalStrategy],
    controllers: [AuthController],
  })
export class AuthModule {}
