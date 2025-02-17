import { connect, Connection, Channel } from 'amqplib';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection!: Connection;
  private channel!: Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.init();
  }

  async init() {
    const RABBITMQ_URI = this.configService.get<string>('RABBITMQ_URI');
    this.connection = await connect(RABBITMQ_URI);
    this.channel = await this.connection.createChannel();
  }

  async publish(queue: string, message: any) {
    await this.channel.assertQueue(queue, { durable: false });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }

  async subscribe(queue: string, callback: (msg: any) => void) {
    await this.channel.assertQueue(queue, { durable: false });
    this.channel.consume(queue, (msg) => {
      if (msg !== null) {
        callback(JSON.parse(msg.content.toString()));
        this.channel.ack(msg);
      }
    });
  }
}
