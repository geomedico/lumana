import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MongoDBConfig } from './config/mongodb.config';
import { RabbitMQConfig } from './config/rabbitmq.config';

import { LogsController } from './controllers/logs.controller';
import { LogsRepository } from './repositories/logs.repository';

import { LogsService } from './services/logs.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [LogsController],
  providers: [MongoDBConfig, RabbitMQConfig, LogsRepository, LogsService],
})
export class AppModule {}
