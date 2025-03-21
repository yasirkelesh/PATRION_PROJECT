import { Strategy, ExtractJwt } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService, // Repository yerine service kullanın
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    // payload içerisinde sub yerine username var, buna göre kullanıcıyı bulalım
    const user = await this.usersService.findByUsername(payload.username);
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    console.log('payload', payload);
    console.log('user', user);
    
    // Kullanıcı bilgilerini döndür
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      company: user.company
    };
  }
}