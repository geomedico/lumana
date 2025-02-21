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
  public client!: MongoClient;
  private db!: Db;
  private isConnected = false;
  private readonly logger = new Logger(MongoDBConfig.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async connect(): Promise<void> {
    try {
      const MONGO_URI = this.configService.get<string>('MONGO_URI_A');
      this.client = new MongoClient(MONGO_URI);
      await this.client.connect();
      this.db = this.client?.db('service_a');
      this.isConnected = true;
      this.logger.log('✅ MongoDB_A is ready!');
    } catch (err) {
      this.logger.error('MongoDB_A init error:', err);
      throw new InternalServerErrorException(err?.message);
    }
  }

  async isReady(): Promise<void> {
    while (!this.isConnected) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  getCollection<T>(name: string): Collection<T> {
    return this.db?.collection<T>(name);
  }

  async closeConnection(): Promise<void> {
    await this.client?.close();
  }
}
