import { connect, Channel, Connection } from 'amqplib';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter } from 'events';

@Injectable()
export class RabbitMQConfig extends EventEmitter implements OnModuleInit {
  private connection!: Connection;
  private channel!: Channel;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async onModuleInit() {
    this.connection = await connect(this.configService.get<string>('RABBITMQ_URI'));
    this.channel = await this.connection.createChannel();
    await this.channel?.assertQueue('search.completed', { durable: false });
    await this.emit('rabbit_ready');
  }

  async consume(queue: string, callback: (msg: any) => void) {
    await this.channel?.consume(queue, (msg) => {
      if (msg !== null) {
        callback(JSON.parse(msg.content.toString()));
        this.channel.ack(msg);
      }
    });
  }
}