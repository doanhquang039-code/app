import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { DebtsService } from './debts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('debts')
@UseGuards(JwtAuthGuard)
export class DebtsController {
  constructor(private readonly service: DebtsService) {}

  @Get()
  async findAll(@Req() req) {
    return this.service.findAll(req.user.id);
  }

  @Get('summary')
  async getSummary(@Req() req) {
    return this.service.getSummary(req.user.id);
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

  @Get(':id/payments')
  async getPayments(@Param('id') id: number, @Req() req) {
    return this.service.getPayments(id, req.user.id);
  }

  @Post(':id/payments')
  async addPayment(@Param('id') id: number, @Body() data: any, @Req() req) {
    return this.service.addPayment(id, req.user.id, data);
  }
}
