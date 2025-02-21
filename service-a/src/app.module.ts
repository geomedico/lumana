import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongoDBConfig } from './config/mongodb.config';
import { RabbitMQConfig } from './config/rabbitmq.config';
import { RedisTimeSeriesConfig } from './config/redis-timeseries.config';

import { SearchController } from './controllers/search.controller';
import { TimeseriesController } from './controllers/timeseries.controller';
import { SearchService } from './services/search.service';
import { IPWhoisService } from './services/ipwhois.service';
import { TimeseriesService } from './services/timeseries.service';
import { SearchRepository } from './repositories/search.repository';
import { TimeseriesRepo } from './repositories/timeseries.repository';

import { UtilsModule } from './utils/utils.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule, UtilsModule],
  controllers: [SearchController, TimeseriesController],
  providers: [
    MongoDBConfig,
    RedisTimeSeriesConfig,
    RabbitMQConfig,
    TimeseriesRepo,
    SearchRepository,
    IPWhoisService,
    TimeseriesService,
    SearchService,
  ],
})
export class AppModule {}
