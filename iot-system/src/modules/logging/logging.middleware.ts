import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const userId = this.extractUserId(req) || 'anonymous';
    
    if (req.url.includes('/logs') || req.url.includes('/api/logs')) {
      this.loggerService.logUserActivity(userId, 'viewed_logs', {
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }
    
    next();
  }

  private extractUserId(req: Request): string | null {
    if (req.user) {
      return (req.user as any).id || (req.user as any).userId || null;
    }
    return null;
  }
}