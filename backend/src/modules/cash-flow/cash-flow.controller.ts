import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CashFlowService } from './cash-flow.service';

@UseGuards(JwtAuthGuard)
@Controller('cash-flow')
export class CashFlowController {
  constructor(private readonly cashFlowService: CashFlowService) {}

  @Get('summary')
  getSummary(@Request() req, @Query('days') days = '30') {
    return this.cashFlowService.getSummary(req.user.userId, Number(days));
  }
}
