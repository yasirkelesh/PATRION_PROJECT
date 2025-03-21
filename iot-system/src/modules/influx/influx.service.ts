import { Injectable, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { QueryApi } from '@influxdata/influxdb-client';
import { LoggerService } from '../logging/logger.service';

export interface SensorData {
  time: string;
  sensor_id: string;
  temperature: number;
  humidity: number;
}

@Injectable()
export class InfluxService implements OnModuleInit {
  private influxDB: InfluxDB;
  private writeApi;
  private queryApi: QueryApi;

  constructor(
    private loggerService: LoggerService,
  ) {
    this.influxDB = new InfluxDB({
      url: 'http://influxdb:8086',
      token: 'ERJf9jywPo8GPFAIIJBrB',
    });
    this.writeApi = this.influxDB.getWriteApi('myorg', 'iot_data', 's');
    this.queryApi = this.influxDB.getQueryApi('myorg');
  }

  onModuleInit() {
    console.log('InfluxDB servisi başlatıldı');
  }

  @OnEvent('sensor.data.received')
  async handleSensorData(data: any) {
    const point = new Point('sensor_readings')
      .tag('sensor_id', data.sensor_id)
      .floatField('temperature', data.temperature)
      .floatField('humidity', data.humidity)
      .timestamp(data.timestamp);

    this.writeApi.writePoint(point);
    await this.writeApi.flush();
    console.log('Veri InfluxDB\'ye yazıldı:', point);
    this.loggerService.logUserActivity('system', 'sensor_data_received', {
      sensor_id: data.sensor_id,
      timestamp: data.timestamp
    });
  }

  /**
   * Belirli bir sensör ID'sine göre veri sorgulama
   * @param sensorId Sensör ID
   * @param limit Döndürülecek maksimum kayıt sayısı (varsayılan: 100)
   * @param startTime Başlangıç zamanı (opsiyonel, örn: '-24h')
   * @param endTime Bitiş zamanı (opsiyonel)
   */
  async querySensorData(
    sensorId: string, 
    limit: number = 100, 
    startTime: string = '-24h', 
    endTime?: string
  ): Promise<SensorData[]> {
    let timeFilter = `r._time >= ${startTime === '-0' ? 'time(v: 0)' : `time(v: ${startTime})`}`;
    
    if (endTime) {
      timeFilter += ` and r._time <= time(v: ${endTime})`;
    }

    const query = `
      from(bucket: "iot_data")
        |> range(start: ${startTime}${endTime ? `, stop: ${endTime}` : ''})
        |> filter(fn: (r) => r._measurement == "sensor_readings")
        |> filter(fn: (r) => r.sensor_id == "${sensorId}")
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> limit(n: ${limit})
        |> sort(columns: ["_time"], desc: true)
    `;

    console.log('Çalıştırılan Flux sorgusu:', query);
    this.loggerService.logUserActivity('system', 'query_sensor_data', {
      sensor_id: sensorId,
      limit,
      startTime,
      endTime,
    });

    return new Promise((resolve, reject) => {
      const results: SensorData[] = [];

      this.queryApi.queryRows(query, {
        next(row, tableMeta) {
          const tableObject = tableMeta.toObject(row);
          results.push({
            time: tableObject._time,
            sensor_id: tableObject.sensor_id,
            temperature: tableObject.temperature,
            humidity: tableObject.humidity,
          });
        },
        error(error) {
          console.error('Sorgu hatası:', error);
          this.loggerService.logUserActivity('system', 'query_sensor_data_error', {
            sensor_id: sensorId,
            error: error.message,
          });
          reject(error);
        },
        complete() {
          resolve(results);
        },
      });
    });
  }

  /**
   * Son N adet veri noktasını getir
   */
  async getLastNReadings(sensorId: string, n: number = 10): Promise<SensorData[]> {
    return this.querySensorData(sensorId, n);
  }

  /**
   * Belirli bir zaman aralığındaki verileri getir
   */
  async getReadingsInTimeRange(
    sensorId: string, 
    startTime: string, 
    endTime?: string, 
    limit: number = 1000
  ): Promise<SensorData[]> {
    return this.querySensorData(sensorId, limit, startTime, endTime);
  }
}
