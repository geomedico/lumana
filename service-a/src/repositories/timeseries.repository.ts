import { Injectable } from '@nestjs/common';
import { RedisTimeSeriesConfig } from '../config/redis-timeseries.config';
import { ILog } from './../models/log.model';

@Injectable()
export class TimeseriesRepo {
  constructor(private readonly redisTimeSeriesRepo: RedisTimeSeriesConfig) {}

  async getLogs(metric: string, start: number, end: number): Promise<ILog[]> {
    return this.redisTimeSeriesRepo.getLogs(metric, start, end);
  }

  async logExecutionTime(
    metric: string,
    executionTime: number,
    query?: string,
  ): Promise<void> {
    return this.redisTimeSeriesRepo.logExecutionTime(
      metric,
      executionTime,
      query,
    );
  }
}
