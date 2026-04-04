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
import { RecurringTransactionsService } from './recurring-transactions.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';
import { QueryRecurringTransactionDto } from './dto/query-recurring-transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('recurring-transactions')
export class RecurringTransactionsController {
  constructor(private recurringService: RecurringTransactionsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateRecurringTransactionDto) {
    return this.recurringService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req, @Query() query: QueryRecurringTransactionDto) {
    return this.recurringService.findAll(req.user.userId, query);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.recurringService.findOne(req.user.userId, +id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateRecurringTransactionDto,
  ) {
    return this.recurringService.update(req.user.userId, +id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.recurringService.remove(req.user.userId, +id);
  }

  @Patch(':id/toggle')
  toggleActive(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.recurringService.toggleActive(
      req.user.userId,
      +id,
      body.isActive,
    );
  }
}
