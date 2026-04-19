import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('investments')
@UseGuards(JwtAuthGuard)
export class InvestmentsController {
  constructor(private readonly service: InvestmentsService) {}

  @Get()
  async findAll(@Req() req) {
    return this.service.findAll(req.user.id);
  }

  @Get('portfolio')
  async getPortfolio(@Req() req) {
    return this.service.getPortfolioSummary(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Req() req) {
    return this.service.findOne(id, req.user.id);
  }

  @Post()
  async create(@Body() data: any, @Req() req) {
    return this.service.create(req.user.id, data);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: any, @Req() req) {
    return this.service.update(id, req.user.id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Req() req) {
    return this.service.remove(id, req.user.id);
  }

  @Get(':id/transactions')
  async getTransactions(@Param('id') id: number, @Req() req) {
    return this.service.getTransactions(id, req.user.id);
  }

  @Post(':id/transactions')
  async addTransaction(@Param('id') id: number, @Body() data: any, @Req() req) {
    return this.service.addTransaction(id, req.user.id, data);
  }
}
