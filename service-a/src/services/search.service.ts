import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { performance } from 'perf_hooks';
import { IPWhoisService } from './ipwhois.service';
import { TimeseriesService } from './timeseries.service';
import { SearchRepository } from './../repositories/search.repository';
import { RabbitMQConfig } from './../config/rabbitmq.config';
import { IpInfo, SearchFilter } from './../models/ipinfo.model';
import { TLogs } from './../common/enums';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  constructor(
    private readonly searchRepository: SearchRepository,
    private readonly ipWhoisService: IPWhoisService,
    private readonly rabbitMQService: RabbitMQConfig,
    private readonly redisTimeSeriesService: TimeseriesService,
  ) {}

  private async logPusher<Q extends string | SearchFilter, T extends IpInfo>({
    storedData,
    executionTime,
    query,
    apiName,
  }: {
    storedData: T;
    executionTime: number;
    query: Q;
    apiName: TLogs;
  }): Promise<T | T[]> {
    return Promise.allSettled([
      this.rabbitMQService.publish('search.completed', {
        apiName,
        query,
        result: storedData,
      }),
      this.redisTimeSeriesService.logExecutionTime(
        apiName,
        executionTime,
        query,
      ),
    ]).then(() => storedData);
  }

  async search(ip: string): Promise<IpInfo> {
    const startTime = performance.now();

    try {
      let storedData = await this.searchRepository.find(ip);

      if (!storedData) {
        storedData = await this.ipWhoisService.fetchIPData(ip);
        await this.searchRepository.insert(storedData);
      }

      const executionTime = performance.now() - startTime;

      await this.logPusher<string, IpInfo>({
        apiName: TLogs.SEARCH_API_IP,
        query: ip,
        executionTime,
        storedData,
      });

      return storedData;
    } catch (error) {
      this.logger.error(`Error fetching data for IP ${ip}:`, error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Error fetching data for IP ${ip}`,
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
        return this.logPusher<SearchFilter, IpInfo>({
          apiName: TLogs.SEARCH_API_FILTER,
          query: filters,
          executionTime,
          storedData: {} as unknown as IpInfo,
        });
      });

      const result = await resultPromise;

      executionTimePromise.catch((err) =>
        this.logger.warn('Failed to log execution time:', err),
      );

      return result;
    } catch (error) {
      this.logger.error('Search failed:', error);
      throw error instanceof HttpException
        ? error
        : new HttpException('Search failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
