import { Collection, InsertOneResult, ObjectId } from 'mongodb';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MongoDBConfig } from '../config/mongodb.config';
import { IpInfo } from '../models/ipinfo.model';

interface IAddFieldSearch {
  currency_code: string;
  country_code: string;
}

@Injectable()
export class SearchRepository implements OnModuleInit {
  private readonly logger = new Logger(SearchRepository.name);

  private collection: Collection<IpInfo>;
  constructor(private readonly mongoDBService: MongoDBConfig) {}

  async onModuleInit() {
    this.logger.log('🔍 Waiting for MongoDB to be ready...');
    await new Promise<void>((resolve) => {
      if (this.mongoDBService['db']) {
        resolve();
      } else {
        this.mongoDBService.on('mongo_ready', async () => {
          this.logger.log('✅ MongoDB_A is ready!');
          this.collection = this.mongoDBService.getCollection<IpInfo>('ips');
          this.logger.log('✅ SearchRepository is ready!');
          await this.createIndexes();
          resolve();
        });
      }
    });
  }

  async createIndexes(): Promise<void> {
    await this.collection?.createIndexes([
      { key: { ip: 1 }, unique: true },
      { key: { currency: 1 } },
      { key: { country: 1 } },
      { key: { city: 1 } },
      { key: { timestamp: 1 } },
    ]);
  }

  async find(ip: string): Promise<IpInfo | null> {
    return this.collection?.findOne({ ip });
  }

  async findWithPagination(
    filters: Partial<IpInfo>,
    page: number,
    limit: number,
  ): Promise<IpInfo[] | null> {
    type QueryType = Pick<IpInfo, 'city'> & IAddFieldSearch;
    const query = {} as QueryType;
    if (filters.city) query.city = capitalizeFirstLetter(filters.city);
    if (filters.country) query.country_code = filters.country.toUpperCase();
    if (filters.currency) query.currency_code = filters.currency.toUpperCase();

    return this.collection
      ?.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    function capitalizeFirstLetter([first = '', ...rest]: string): string {
      return [first.toUpperCase(), ...rest].join('');
    }
  }

  async insert(data: IpInfo): Promise<InsertOneResult<IpInfo>> {
    return this.collection?.insertOne({
      ...data,
      _id: new ObjectId(),
      timestamp: new Date(),
    });
  }
}
