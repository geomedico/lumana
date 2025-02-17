import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';

import { SearchService } from './search.service';
import { SearchRepository } from '../repositories/search.repository';
import { RabbitMQService } from '../config/rabbitmq.config';
import { IPWhoisService } from './ipwhois.service';
import { TimeseriesService } from './timeseries.service';
import { IpInfo } from '../models/ipinfo.model';
import { TLogs } from './../common/enums';

describe('SearchService', () => {
  let searchService: SearchService;
  let searchRepository: SearchRepository;
  let ipWhoisService: IPWhoisService;
  let rabbitMQService: RabbitMQService;
  let redisTimeSeriesService: TimeseriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: SearchRepository,
          useValue: {
            find: jest.fn(),
            insert: jest.fn(),
            findWithPagination: jest.fn(),
          },
        },
        {
          provide: IPWhoisService,
          useValue: {
            fetchIPData: jest.fn(),
          },
        },
        {
          provide: RabbitMQService,
          useValue: {
            publish: jest.fn(),
          },
        },
        {
          provide: TimeseriesService,
          useValue: {
            logExecutionTime: jest.fn(),
          },
        },
      ],
    }).compile();

    searchService = module.get<SearchService>(SearchService);
    searchRepository = module.get<SearchRepository>(SearchRepository);
    ipWhoisService = module.get<IPWhoisService>(IPWhoisService);
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);
    redisTimeSeriesService = module.get<TimeseriesService>(TimeseriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return stored data if found in database', async () => {
      const mockIp = '193.254.165.0';
      const mockData: Partial<IpInfo> = {
        ip: mockIp,
        country: 'Germany',
        city: 'Berlin',
        currency: 'EUR',
      };

      (searchRepository.find as jest.Mock).mockResolvedValue(mockData);

      const result = await searchService.search(mockIp);

      expect(searchRepository.find).toHaveBeenCalledWith(mockIp);
      expect(ipWhoisService.fetchIPData).not.toHaveBeenCalled();
      expect(searchRepository.insert).not.toHaveBeenCalled();
      expect(rabbitMQService.publish).toHaveBeenCalledWith('search.completed', {
        query: mockIp,
        result: mockData,
      });
      expect(redisTimeSeriesService.logExecutionTime).toHaveBeenCalledWith(
        TLogs.SEARCH_API_IP,
        expect.any(Number),
        mockIp,
      );
      expect(result).toEqual(mockData);
    });

    it('should fetch data if not found and store it', async () => {
      const mockIp = '193.254.165.0';
      const mockData: Partial<IpInfo> = {
        ip: mockIp,
        country: 'Germany',
        city: 'Berlin',
        currency: 'EUR',
      };

      (searchRepository.find as jest.Mock).mockResolvedValue(null);
      (ipWhoisService.fetchIPData as jest.Mock).mockResolvedValue(mockData);
      (searchRepository.insert as jest.Mock).mockResolvedValue(mockData);

      const result = await searchService.search(mockIp);

      expect(searchRepository.find).toHaveBeenCalledWith(mockIp);
      expect(ipWhoisService.fetchIPData).toHaveBeenCalledWith(mockIp);
      expect(searchRepository.insert).toHaveBeenCalledWith(mockData);
      expect(rabbitMQService.publish).toHaveBeenCalledWith('search.completed', {
        query: mockIp,
        result: mockData,
      });
      expect(redisTimeSeriesService.logExecutionTime).toHaveBeenCalledWith(
        TLogs.SEARCH_API_IP,
        expect.any(Number),
        mockIp,
      );
      expect(result).toEqual(mockData);
    });

    it('should log an error and reject when fetch fails', async () => {
      const mockIp = '193.254.165.0';
      const error = new Error('Fetch failed');
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      (searchRepository.find as jest.Mock).mockResolvedValue(null);
      (ipWhoisService.fetchIPData as jest.Mock).mockRejectedValue(error);

      await expect(searchService.search(mockIp)).rejects.toThrow(error);

      expect(loggerSpy).toHaveBeenCalledWith(
        `Error fetching data for IP ${mockIp} from IPWhois:`,
        error,
      );
    });
  });

  describe('searchStoredData', () => {
    it('should return stored data with pagination', async () => {
      const filters = { country: 'DE', city: 'Berlin' };
      const page = 1;
      const limit = 10;
      const mockData: Partial<IpInfo>[] = [
        {
          ip: '193.254.165.0',
          country: 'Germany',
          city: 'Berlin',
          currency: 'EUR',
        },
      ];

      (searchRepository.findWithPagination as jest.Mock).mockResolvedValue(
        mockData,
      );

      const result = await searchService.searchStoredData(filters, page, limit);

      expect(searchRepository.findWithPagination).toHaveBeenCalledWith(
        filters,
        page,
        limit,
      );
      expect(redisTimeSeriesService.logExecutionTime).toHaveBeenCalledWith(
        TLogs.SEARCH_API_FILTER,
        expect.any(Number),
        JSON.stringify(filters),
      );
      expect(result).toEqual(mockData);
    });

    it('should log an error and reject when search fails', async () => {
      const filters = { country: 'Germany', city: 'Berlin' };
      const page = 1;
      const limit = 10;
      const error = new Error('Search failed');
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      (searchRepository.findWithPagination as jest.Mock).mockRejectedValue(
        error,
      );

      await expect(
        searchService.searchStoredData(filters, page, limit),
      ).rejects.toThrow(error);

      expect(loggerSpy).toHaveBeenCalledWith(
        'Error Search stored data:',
        error,
      );
    });
  });
});
