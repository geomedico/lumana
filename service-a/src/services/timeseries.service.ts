import { Injectable, Logger } from '@nestjs/common';
import { TimeseriesRepo } from '../repositories/timeseries.repository';

@Injectable()
export class TimeseriesService {
  private readonly logger = new Logger(TimeseriesService.name);

  constructor(private readonly timeseriesRepository: TimeseriesRepo) { }

  async getLogs(metric: string, start: number, end: number) {
    try {
      return this.timeseriesRepository.getLogs(metric, start, end);
    } catch (err) {
      this.logger.error('error retrieving timeseries logs:', err);
      return Promise.reject(err);
    }
  }

  async logExecutionTime(metric: string, executionTime: number, query?: string): Promise<void> {
    try {
      return this.timeseriesRepository.logExecutionTime(metric, executionTime, query);
    } catch (err) {
      this.logger.error('error saving timeseries logs:', err);
      return Promise.reject(err);
    }
  }
}