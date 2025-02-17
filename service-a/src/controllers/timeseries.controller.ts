import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { TimeseriesService } from '../services/timeseries.service';
import { ILog } from './../models/log.model';

@Controller('timeseries')
export class TimeseriesController {
  constructor(private readonly timeseriesService: TimeseriesService) {}

  @Get()
  async getTimeseriesLogs(
    @Query('start', ParseIntPipe) start: number,
    @Query('end', ParseIntPipe) end: number,
    @Query('metric') metric: string,
  ): Promise<ILog[]> {
    return this.timeseriesService.getLogs(metric, start, end);
  }
}
