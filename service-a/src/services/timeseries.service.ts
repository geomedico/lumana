import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { TimeseriesRepo } from '../repositories/timeseries.repository';
import { ILog } from './../models/log.model';

@Injectable()
export class TimeseriesService {
  private readonly logger = new Logger(TimeseriesService.name);

  constructor(private readonly timeseriesRepository: TimeseriesRepo) {}

  async getLogs(metric: string, start: number, end: number): Promise<ILog[]> {
    try {
      return this.timeseriesRepository.getLogs(metric, start, end);
    } catch (err) {
      this.logger.error('error retrieving timeseries logs:', err);
      throw new InternalServerErrorException(err?.message);
    }
  }

  async logExecutionTime<T>(
    metric: string,
    executionTime: number,
    query?: T,
  ): Promise<void> {
    try {
      return this.timeseriesRepository.logExecutionTime<T>(
        metric,
        executionTime,
        query,
      );
    } catch (err) {
      this.logger.error('error saving timeseries logs:', err);
      throw new InternalServerErrorException(err?.message);
    }
  }
}
