import { Injectable } from '@nestjs/common';
import { RedisTimeSeriesConfig } from '../config/redis-timeseries.config';
import { ILog } from './../models/log.model';

@Injectable()
export class TimeseriesRepo {
  constructor(private readonly redisTimeSeriesRepo: RedisTimeSeriesConfig) {}

  async getLogs(metric: string, start: number, end: number): Promise<ILog[]> {
    return this.redisTimeSeriesRepo.getLogs(metric, start, end);
  }

  async logExecutionTime<T>(
    metric: string,
    executionTime: number,
    query?: T,
  ): Promise<void> {
    return this.redisTimeSeriesRepo.logExecutionTime<T>(
      metric,
      executionTime,
      query,
    );
  }
}
