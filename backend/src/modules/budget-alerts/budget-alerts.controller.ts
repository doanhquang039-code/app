import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BudgetAlertsService } from './budget-alerts.service';
import { CreateBudgetAlertDto } from './dto/create-budget-alert.dto';
import { UpdateBudgetAlertDto } from './dto/update-budget-alert.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('budget-alerts')
export class BudgetAlertsController {
  constructor(private budgetAlertsService: BudgetAlertsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateBudgetAlertDto) {
    return this.budgetAlertsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.budgetAlertsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.budgetAlertsService.findOne(req.user.userId, +id);
  }

  @Get('budget/:budgetId/status')
  checkStatus(@Request() req, @Param('budgetId') budgetId: string) {
    return this.budgetAlertsService.checkBudgetStatus(req.user.userId, +budgetId);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateBudgetAlertDto,
  ) {
    return this.budgetAlertsService.update(req.user.userId, +id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.budgetAlertsService.remove(req.user.userId, +id);
  }
}
