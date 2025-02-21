import { connect, Channel, Connection } from 'amqplib';
import {
  Injectable,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LogEvent } from './../models/log-event.model';

@Injectable()
export class RabbitMQConfig implements OnModuleInit {
  private connection!: Connection;
  private channel!: Channel;
  private isConnected = false;

  private readonly logger = new Logger(RabbitMQConfig.name);

  constructor(private readonly configService: ConfigService) {}

  public async onModuleInit() {
    try {
      this.connection = await connect(
        this.configService.get<string>('RABBITMQ_URI'),
      );
      this.channel = await this.connection.createChannel();
      await this.channel?.assertQueue('search.completed', { durable: false });
      this.isConnected = true;
    } catch (err) {
      this.logger.error('RabbitMQ_B init error:', err);
      throw new InternalServerErrorException(err?.message);
    }
  }

  public async isReady(): Promise<void> {
    while (!this.isConnected) {
      await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for MongoDB to be ready
    }
  }

  public async consume(queue: string, callback: (msg: LogEvent) => void) {
    await this.channel?.consume(queue, (msg: { content: LogEvent }) => {
      if (msg !== null) {
        callback(JSON.parse(msg.content.toString()));
        this.channel.ack(msg);
      }
    });
  }
}
