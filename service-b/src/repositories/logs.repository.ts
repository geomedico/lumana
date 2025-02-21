import { Collection, InsertOneResult, ObjectId } from 'mongodb';

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MongoDBConfig } from '../config/mongodb.config';
import { Log, OutPutLog } from '../models/log.model';
import { LogEvent } from './../models/log-event.model';

@Injectable()
export class LogsRepository implements OnModuleInit {
  private collection: Collection<Log>;
  private readonly logger = new Logger(LogsRepository.name);

  constructor(private readonly mongoDBService: MongoDBConfig) {}

  async onModuleInit() {
    await this.mongoDBService.isReady();
    this.collection = this.mongoDBService.getCollection<Log>('logs');
    this.logger.log('✅ LogRepository is ready!');
    await this.createIndexes();
  }

  async createIndexes(): Promise<void> {
    await this.collection?.createIndexes([
      { key: { timestamp: 1, apiName: 1 } },
    ]);
  }

  async storeLog(logData: LogEvent): Promise<InsertOneResult<Log>> {
    const timestamp = new Date();
    const { apiName, ...data } = logData || {};

    return this.collection.insertOne({
      _id: new ObjectId(),
      apiName,
      data: JSON.stringify(data, null, 2),
      timestamp,
    });
  }

  async findLogs(startDate: Date, endDate: Date): Promise<OutPutLog> {
    return this.collection
      .find({ timestamp: { $gte: startDate, $lte: endDate } })
      .toArray();
  }
}
