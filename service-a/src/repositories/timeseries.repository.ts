import { Injectable } from '@nestjs/common';
import { RedisTimeSeriesConfig } from '../config/redis-timeseries.config';

@Injectable()
export class TimeseriesRepo {
  constructor(private readonly redisTimeSeriesRepo: RedisTimeSeriesConfig) {}

  async getLogs(metric: string, start: number, end: number) {
    return this.redisTimeSeriesRepo.getLogs(metric, start, end);
  }

  async logExecutionTime(metric: string, executionTime: number, query?: string) {
    return this.redisTimeSeriesRepo.logExecutionTime(metric, executionTime, query);
  }
}