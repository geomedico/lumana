import { WithId } from 'mongodb';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { LogsRepository } from '../repositories/logs.repository';
import { RabbitMQConfig } from '../config/rabbitmq.config';
import { Log } from '../models/log.model';

@Injectable()
export class LogsService implements OnModuleInit {
  private readonly logger = new Logger(LogsService.name);

  constructor(
    private readonly logsRepository: LogsRepository,
    private readonly rabbitMQService: RabbitMQConfig,
  ) {}

  async onModuleInit(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.rabbitMQService.on('rabbit_ready', async () => {
        this.logger.log('✅ LogsService is ready!');
        this.rabbitMQService?.consume('search.completed', async (msg) => {
          await this.logsRepository.storeLog(msg);
        });
        resolve();
      });
    });
  }

  async getLogs(startDate: Date, endDate: Date): Promise<WithId<Log>[]> {
    try {
      return this.logsRepository.findLogs(startDate, endDate);
    } catch (err) {
      this.logger.error('error retrieving logs:', err);
      return Promise.reject(err);
    }
  }
}
