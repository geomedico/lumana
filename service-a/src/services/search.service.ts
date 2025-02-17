import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { performance } from 'perf_hooks';
import { SearchRepository } from '../repositories/search.repository';
import { RabbitMQService } from '../config/rabbitmq.config';
import { IPWhoisService } from './ipwhois.service';
import { TimeseriesService } from './timeseries.service';
import { IpInfo } from './../models/ipinfo.model';
import { TLogs } from './../common/enums';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  constructor(
    private readonly searchRepository: SearchRepository,
    private readonly ipWhoisService: IPWhoisService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly redisTimeSeriesService: TimeseriesService,
  ) {}

  async search(ip: string): Promise<IpInfo> {
    const startTime = performance.now();

    try {
      let storedData = await this.searchRepository.find(ip);

      if (!storedData) {
        storedData = await this.ipWhoisService.fetchIPData(ip);
        await this.searchRepository.insert(storedData);
      }

      const executionTime = performance.now() - startTime;

      await Promise.allSettled([
        this.rabbitMQService.publish('search.completed', {
          query: ip,
          result: storedData,
        }),
        this.redisTimeSeriesService.logExecutionTime(
          TLogs.SEARCH_API_IP,
          executionTime,
          ip,
        ),
      ]);

      return storedData;
    } catch (error) {
      this.logger.error(`Error fetching data for IP ${ip}:`, error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async searchStoredData(
    filters: Partial<IpInfo>,
    page: number,
    limit: number,
  ): Promise<IpInfo[] | null> {
    const startTime = performance.now();
    try {
      const resultPromise = this.searchRepository.findWithPagination(
        filters,
        page,
        limit,
      );

      const executionTimePromise = resultPromise.then(() => {
        const executionTime = performance.now() - startTime;
        return this.redisTimeSeriesService.logExecutionTime(
          TLogs.SEARCH_API_FILTER,
          executionTime,
          JSON.stringify(filters),
        );
      });

      const result = await resultPromise;

      executionTimePromise.catch((err) =>
        this.logger.warn('Failed to log execution time:', err),
      );
      return result;
    } catch (error) {
      this.logger.error('Error Search stored data:', error);
      return Promise.reject(error);
    }
  }
}
