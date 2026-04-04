import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SavingsGoalsService } from './savings-goals.service';
import { CreateSavingsGoalDto } from './dto/create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './dto/update-savings-goal.dto';
import { QuerySavingsGoalDto } from './dto/query-savings-goal.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('savings-goals')
export class SavingsGoalsController {
  constructor(private savingsGoalsService: SavingsGoalsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateSavingsGoalDto) {
    return this.savingsGoalsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req, @Query() query: QuerySavingsGoalDto) {
    return this.savingsGoalsService.findAll(req.user.userId, query);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.savingsGoalsService.findOne(req.user.userId, +id);
  }

  @Get(':id/progress')
  getProgress(@Request() req, @Param('id') id: string) {
    return this.savingsGoalsService.getProgress(req.user.userId, +id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateSavingsGoalDto,
  ) {
    return this.savingsGoalsService.update(req.user.userId, +id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.savingsGoalsService.remove(req.user.userId, +id);
  }

  @Post(':id/add')
  addToGoal(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { amount: number },
  ) {
    return this.savingsGoalsService.addToGoal(req.user.userId, +id, body.amount);
  }

  @Post(':id/withdraw')
  withdrawFromGoal(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { amount: number },
  ) {
    return this.savingsGoalsService.withdrawFromGoal(
      req.user.userId,
      +id,
      body.amount,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.savingsGoalsService.updateStatus(req.user.userId, +id, body.status);
  }
}
