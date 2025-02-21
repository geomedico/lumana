import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';

import { SearchService } from './search.service';
import { SearchRepository } from '../repositories/search.repository';
import { RabbitMQConfig } from '../config/rabbitmq.config';
import { IPWhoisService } from './ipwhois.service';
import { TimeseriesService } from './timeseries.service';
import { IpInfo } from '../models/ipinfo.model';
import { TLogs } from './../common/enums';

describe('SearchService', () => {
  let searchService: SearchService;
  let searchRepository: SearchRepository;
  let ipWhoisService: IPWhoisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: SearchRepository,
          useValue: {
            find: jest.fn().mockResolvedValue(null),
            insert: jest.fn().mockResolvedValue(null),
            findWithPagination: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: IPWhoisService,
          useValue: {
            fetchIPData: jest.fn().mockResolvedValue({
              ip: '193.254.165.0',
              country: 'Germany',
              city: 'Berlin',
              currency: 'EUR',
            }),
          },
        },
        {
          provide: RabbitMQConfig,
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

    // Spy on logPusher to track calls
    jest.spyOn(searchService as any, 'logPusher').mockResolvedValue(null);
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

      expect(searchService['logPusher']).toHaveBeenCalledWith({
        apiName: TLogs.SEARCH_API_IP,
        query: mockIp,
        executionTime: expect.any(Number),
        storedData: mockData,
      });

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

      expect(searchService['logPusher']).toHaveBeenCalledWith({
        apiName: TLogs.SEARCH_API_IP,
        query: mockIp,
        executionTime: expect.any(Number),
        storedData: mockData,
      });

      expect(result).toEqual(mockData);
    });

    it('should return HTTP exception when IP is in reserved range', async () => {
      const mockIp = '229.214.26.237';
      const error = new HttpException('reserved range', HttpStatus.BAD_REQUEST);

      (searchRepository.find as jest.Mock).mockResolvedValue(null);
      (ipWhoisService.fetchIPData as jest.Mock).mockRejectedValue(error);

      await expect(searchService.search(mockIp)).rejects.toThrow(HttpException);
      await expect(searchService.search(mockIp)).rejects.toMatchObject({
        response: 'reserved range',
        status: HttpStatus.BAD_REQUEST,
      });
    });

    it('should log an error and reject when fetch fails', async () => {
      const mockIp = '193.254.165.0';
      const error = new Error('Fetch failed');
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      (searchRepository.find as jest.Mock).mockResolvedValue(null);
      (ipWhoisService.fetchIPData as jest.Mock).mockRejectedValue(error);

      await expect(searchService.search(mockIp)).rejects.toThrow(HttpException);
      await expect(searchService.search(mockIp)).rejects.toMatchObject({
        response: `Error fetching data for IP ${mockIp}`,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });

      expect(loggerSpy).toHaveBeenCalledWith(
        `Error fetching data for IP ${mockIp}:`,
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

      expect(searchService['logPusher']).toHaveBeenCalledWith({
        apiName: TLogs.SEARCH_API_FILTER,
        query: filters,
        executionTime: expect.any(Number),
        storedData: {} as unknown as IpInfo,
      });

      expect(result).toEqual(mockData);
    });
  });
});
