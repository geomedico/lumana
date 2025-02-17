import { MongoClient, Db, Collection } from 'mongodb';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';

@Injectable()
export class MongoDBConfig extends EventEmitter implements OnModuleInit {
  private client!: MongoClient;
  private db!: Db;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async onModuleInit(): Promise<void> {
    try {
      this.client = new MongoClient(
        this.configService.get<string>('MONGO_URI_B'),
      );
      await this.client.connect();
      this.db = this.getDatabase('service_b');
      this.emit('mongo_ready');
    } catch (er) {
      return Promise.reject(er);
    }
  }

  getDatabase(dbName: string): Db {
    return this.client?.db(dbName);
  }

  getCollection<T>(name: string): Collection<T> {
    return this.db?.collection<T>(name);
  }
}
