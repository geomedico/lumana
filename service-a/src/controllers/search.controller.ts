import { Controller, Get, Post, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SearchService } from '../services/search.service';
import { IPWhoisDto } from '../dtos/ipwhois.dto';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async search(@Query() data: IPWhoisDto) {
    return this.searchService.search(data.ip);
  }

  @Get('list')
  async searchStoredData(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('currency') currency?: string
  ) {
    return this.searchService.searchStoredData({ country, city, currency }, page, limit);
  }
}