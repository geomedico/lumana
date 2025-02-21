import { MongoClient, Db, Collection } from 'mongodb';
import {
  Injectable,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoDBConfig implements OnModuleInit {
  private client!: MongoClient;
  private db!: Db;
  private isConnected = false;
  private readonly logger = new Logger(MongoDBConfig.name);

  constructor(private readonly configService: ConfigService) {}

  public async onModuleInit(): Promise<void> {
    try {
      this.client = new MongoClient(
        this.configService.get<string>('MONGO_URI_B'),
      );
      await this.client.connect();
      this.db = this.getDatabase('service_b');
      this.isConnected = true;
      this.logger.log('✅ MongoDB_B is ready!');
    } catch (err) {
      this.logger.error('MongoDB_B init error:', err);
      throw new InternalServerErrorException(err?.message);
    }
  }

  public async isReady(): Promise<void> {
    while (!this.isConnected) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for MongoDB to be ready
    }
  }

  public getDatabase(dbName: string): Db {
    return this.client?.db(dbName);
  }

  public getCollection<T>(name: string): Collection<T> {
    return this.db?.collection<T>(name);
  }
}
