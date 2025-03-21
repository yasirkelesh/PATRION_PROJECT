import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface LogEntry {
  user_id: string;
  timestamp: number;
  action: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class LoggerService {
  private readonly logDir = 'logs';
  private readonly logFile: string;

  constructor(
  ) {
    // Log dizini oluştur
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    this.logFile = path.join(this.logDir, 'user-activity.log');
  }

  // Kullanıcı aktivitesini logla
  logUserActivity(userId: string, action: string, metadata?: Record<string, any>): void {
    const logEntry: LogEntry = {
      user_id: userId,
      timestamp: Math.floor(Date.now() / 1000),
      action,
      ...(metadata && { metadata }),
    };

    this.writeToJsonFile(logEntry);
  }

  // Tüm logları veya belirli bir kullanıcının loglarını sayfalı olarak getir
  getUserLogs(userId?: string, page: number = 1, pageSize: number = 50): { logs: LogEntry[], total: number } {
    const allLogs = this.getAllLogs(userId);
    const total = allLogs.length;
    
    // Sayfalama için dilimleme
    const startIndex = (page - 1) * pageSize;
    const logs = allLogs.slice(startIndex, startIndex + pageSize);
    this.logUserActivity('system', 'viewed_logs', { page, pageSize });
    return { logs, total };
  }

  // Tüm logları veya belirli bir kullanıcının tüm loglarını getir (iç metot)
  private getAllLogs(userId?: string): LogEntry[] {
    if (!fs.existsSync(this.logFile)) {
      return [];
    }

    const logs: LogEntry[] = [];
    const fileContent = fs.readFileSync(this.logFile, 'utf8');
    
    // Satır satır JSON logları oku
    const lines = fileContent.split('\n').filter(line => line.trim());
    for (const line of lines) {
      try {
        const log = JSON.parse(line);
        if (!userId || log.user_id === userId) {
          logs.push(log);
        }
      } catch (error) {
        console.error('JSON parsing error:', error);
      }
    }

    // Timestamp'e göre sırala (yeniden eskiye)
    this.logUserActivity('system', 'viewed_logs');
    return logs.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Saatlik aktivite dağılımını hesapla
  getHourlyDistribution(action?: string): Record<number, number> {
    const logs = this.getAllLogs();
    const hourlyDistribution: Record<number, number> = {};
    
    // Tüm saatler için 0 değeri ile başlat
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = 0;
    }
    
    // Logları saatlerine göre dağıt
    logs
      .filter(log => !action || log.action === action)
      .forEach(log => {
        const hour = new Date(log.timestamp * 1000).getHours();
        hourlyDistribution[hour]++;
      });
    this.logUserActivity('system', 'viewed_hourly_distribution', { action });
    return hourlyDistribution;
  }

  // JSON dosyasına yaz
  private writeToJsonFile(logEntry: LogEntry): void {
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(this.logFile, logLine, { encoding: 'utf8' });
  }
}