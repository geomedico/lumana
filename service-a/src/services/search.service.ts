import { Injectable, Logger } from '@nestjs/common';
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
    try {
      const startTime = Date.now();
      let storedData = await this.searchRepository.find(ip);
      if (!storedData) {
        const fetchedData = await this.ipWhoisService.fetchIPData(ip);
        await this.searchRepository.insert(fetchedData);
        storedData = fetchedData;
      }

      this.rabbitMQService.publish('search.completed', {
        query: ip,
        result: storedData,
      });
      const executionTime = Date.now() - startTime;

      await this.redisTimeSeriesService.logExecutionTime(
        TLogs.SEARCH_API_IP,
        executionTime,
        ip,
      );

      return storedData;
    } catch (error) {
      this.logger.error(
        `Error fetching data for IP ${ip} from IPWhois:`,
        error,
      );
      return Promise.reject(error);
    }
  }

  async searchStoredData(
    filters: Partial<IpInfo>,
    page: number,
    limit: number,
  ): Promise<IpInfo[] | null> {
    try {
      const startTime = Date.now();
      const result = await this.searchRepository.findWithPagination(
        filters,
        page,
        limit,
      );
      const executionTime = Date.now() - startTime;
      await this.redisTimeSeriesService.logExecutionTime(
        TLogs.SEARCH_API_FILTER,
        executionTime,
        JSON.stringify(filters),
      );

      return result;
    } catch (error) {
      this.logger.error('Error Search stored data:', error);
      return Promise.reject(error);
    }
  }
}
