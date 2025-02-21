import { WithId } from 'mongodb';
import {
  Injectable,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { LogsRepository } from '../repositories/logs.repository';
import { RabbitMQConfig } from '../config/rabbitmq.config';
import { Log } from './../models/log.model';
import { LogEvent } from './../models/log-event.model';

@Injectable()
export class LogsService implements OnModuleInit {
  private readonly logger = new Logger(LogsService.name);

  constructor(
    private readonly logsRepository: LogsRepository,
    private readonly rabbitMQService: RabbitMQConfig,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.rabbitMQService.isReady();
      this.logger.log('✅ LogsService is ready!');
      this.rabbitMQService?.consume(
        'search.completed',
        async (msg: LogEvent) => {
          this.logger.log('LogsService msg::', msg);
          await this.logsRepository.storeLog(msg);
        },
      );
    } catch (err) {
      throw new InternalServerErrorException(err?.message);
    }
  }

  async getLogs(startDate: Date, endDate: Date): Promise<WithId<Log>[]> {
    try {
      return this.logsRepository.findLogs(startDate, endDate);
    } catch (err) {
      this.logger.error('error retrieving logs:', err);
      throw new InternalServerErrorException(err?.message);
    }
  }
}
