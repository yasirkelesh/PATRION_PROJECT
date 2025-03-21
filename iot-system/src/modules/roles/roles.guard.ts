// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    console.log('User from request:', user); // Debug için
    
    if (!user || !user.role) {
      console.log('User or role not found:', user);
      return false;
    }
    
    // user.role burada bir Role objesi, role.name ile kontrol etmeliyiz
    return requiredRoles.includes(user.role.name);
  }
}