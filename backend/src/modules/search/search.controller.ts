import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Post('transactions/:userId')
  async searchTransactions(
    @Param('userId') userId: number,
    @Body() filters: any,
  ) {
    return await this.searchService.searchTransactions(userId, filters);
  }

  @Post('advanced/:userId')
  async advancedSearch(
    @Param('userId') userId: number,
    @Body() searchParams: any,
  ) {
    return await this.searchService.advancedSearch(userId, searchParams);
  }

  @Get('filter-options/:userId')
  async getFilterOptions(@Param('userId') userId: number) {
    return await this.searchService.getFilterOptions(userId);
  }
}
