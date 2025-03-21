import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { InfluxService, SensorData } from './influx.service';

@Controller('api/sensors')
export class InfluxController {
  constructor(private readonly influxService: InfluxService) {}

  /**
   * Belirli bir sensörün son n kaydını getir
   * GET /api/sensors/:sensorId/readings?limit=10
   */
  @Get(':sensorId/readings')
  async getSensorReadings(
    @Param('sensorId') sensorId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('start') startTime?: string,
    @Query('end') endTime?: string,
  ): Promise<SensorData[]> {
    if (startTime) {
      return this.influxService.getReadingsInTimeRange(sensorId, startTime, endTime, limit);
    } else {
      return this.influxService.getLastNReadings(sensorId, limit);
    }
  }
}