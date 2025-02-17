import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQConfig } from '../config/rabbitmq.config';

@Injectable()
export class SearchSubscriber implements OnModuleInit {
  constructor(private readonly rabbitMQService: RabbitMQConfig) {}

  onModuleInit() {
    this.rabbitMQService.consume('search.completed', (msg) => {
      console.log('Received Search Event:', msg);
    });
  }
}
