import { Collection, InsertOneResult, WithId, ObjectId } from 'mongodb';

import { Injectable, OnModuleInit } from '@nestjs/common';
import { MongoDBConfig } from '../config/mongodb.config';
import { Log } from '../models/log.model';

@Injectable()
export class LogsRepository implements OnModuleInit {
  private collection: Collection<Log>;

  constructor(private readonly mongoDBService: MongoDBConfig) {}

  async onModuleInit() {
    console.log('🔍 Waiting for MongoDB to be ready...');
    await new Promise<void>((resolve) => {
      if (this.mongoDBService['db']) {
        resolve();
      } else {
        this.mongoDBService.on('mongo_ready', async () => {
          console.log('✅ MongoDB_B is ready!');
          this.collection = this.mongoDBService.getCollection<Log>('logs');
          console.log('✅ LogRepository is ready!');
          await this.createIndexes();
          resolve();
        });
      }
    });
  }

  async createIndexes(): Promise<void> {
    await this.collection?.createIndexes([{ key: { timestamp: 1 } }]);
  }

  async storeLog(logData: Record<string, any>): Promise<InsertOneResult<Log>> {
    const timestamp = new Date();
    return this.collection.insertOne({
      _id: new ObjectId(),
      data: JSON.stringify(logData, null, 2),
      timestamp,
    });
  }

  async findLogs(startDate: Date, endDate: Date): Promise<WithId<Log>[]> {
    return this.collection
      .find({ timestamp: { $gte: startDate, $lte: endDate } })
      .toArray();
  }
}
