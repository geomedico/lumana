import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

import {
  Injectable,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Util } from './../utils/util-service.util';
import { ILog } from './../models/log.model';

@Injectable()
export class RedisTimeSeriesConfig implements OnModuleInit {
  private client: RedisClientType;
  private readonly logger = new Logger(RedisTimeSeriesConfig.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly util: Util,
  ) {}

  async onModuleInit() {
    try {
      const REDIS_URI = this.configService.get<string>('REDIS_URI');
      this.client = createClient({ url: REDIS_URI });
      await this.client.connect();
    } catch (err) {
      this.logger.error('RedisDB_A init error:', err);
      throw new InternalServerErrorException(err?.message);
    }
  }

  async logExecutionTime<T>(
    metric: string,
    executionTime: number,
    query?: T,
  ): Promise<void> {
    const timestamp = Date.now();

    const logEntry = JSON.stringify({
      api: metric,
      executionTime,
      timestamp,
      query,
    });

    await this.client.zAdd(metric.trim(), [
      {
        score: timestamp,
        value: logEntry,
      },
    ]);
  }

  async getLogs(metric: string, start: number, end: number): Promise<ILog[]> {
    const logs = await this.client.zRangeByScore(metric.trim(), start, end);
    this.logger.log('logs::', logs);
    return logs.map((log) => this.util.parseLogEntry(log)) as unknown as ILog[];
  }
}
