import { Controller, Get, Query } from '@nestjs/common';
import { LogsService } from './../services/logs.service';
import { OutPutLog } from './../models/log.model';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async getLogs(
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<OutPutLog> {
    return this.logsService.getLogs(new Date(start), new Date(end));
  }
}
