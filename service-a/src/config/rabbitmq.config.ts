import {
  Injectable,
  OnModuleInit,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { connect, Connection, Channel } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { LogEvent } from './../models/log-event.model';
import { IpInfo } from './../models/ipinfo.model';

@Injectable()
export class RabbitMQConfig implements OnModuleInit {
  private connection!: Connection;
  private channel!: Channel;
  private readonly logger = new Logger(RabbitMQConfig.name);

  constructor(private readonly configService: ConfigService) {}

  private async init() {
    const RABBITMQ_URI = this.configService.get<string>('RABBITMQ_URI');
    this.connection = await connect(RABBITMQ_URI);
    this.channel = await this.connection.createChannel();
  }

  public async onModuleInit() {
    try {
      await this.init();
    } catch (err) {
      this.logger.error('RabbitMQ_A init error:', err);
      throw new InternalServerErrorException(err?.message);
    }
  }

  public async publish(queue: string, message: LogEvent<IpInfo>) {
    await this.channel.assertQueue(queue, { durable: false });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }

  public async subscribe(
    queue: string,
    callback: (msg: LogEvent<IpInfo>) => void,
  ) {
    await this.channel.assertQueue(queue, { durable: false });
    this.channel.consume(queue, (msg: { content: LogEvent<IpInfo> }) => {
      if (msg !== null) {
        callback(JSON.parse(msg.content.toString()));
        this.channel.ack(msg);
      }
    });
  }
}
