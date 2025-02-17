import { MongoClient, Db, Collection } from 'mongodb';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';

@Injectable()
export class MongoDBConfig extends EventEmitter implements OnModuleInit {
  public client!: MongoClient;
  private db!: Db;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async connect(): Promise<void> {
    const MONGO_URI = this.configService.get<string>('MONGO_URI_A');
    this.client = new MongoClient(MONGO_URI);
    await this.client.connect();
    this.db = this.client?.db('service_a');
    this.emit('mongo_ready');
  }

  getCollection<T>(name: string): Collection<T> {
    return this.db?.collection<T>(name);
  }

  async closeConnection(): Promise<void> {
    await this.client?.close();
  }
}
