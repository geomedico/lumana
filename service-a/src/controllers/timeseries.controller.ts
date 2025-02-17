import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { TimeseriesService } from '../services/timeseries.service';

@Controller('timeseries')
export class TimeseriesController {
  constructor(private readonly timeseriesService: TimeseriesService) {}

  @Get()
  async getTimeseriesLogs(
    @Query('start', ParseIntPipe) start: number,
    @Query('end', ParseIntPipe) end: number,
    @Query('metric') metric: string
  ) {
    return this.timeseriesService.getLogs(metric, start, end);
  }
}