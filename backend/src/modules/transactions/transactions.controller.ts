import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { BulkImportTransactionsDto } from './dto/bulk-import-transactions.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(req.user.userId, dto);
  }

  @Post('bulk')
  bulkCreate(@Request() req, @Body() dto: BulkImportTransactionsDto) {
    return this.transactionsService.bulkCreate(req.user.userId, dto.items);
  }

  @Get()
  findAll(@Request() req, @Query() query: QueryTransactionDto) {
    return this.transactionsService.findAll(req.user.userId, query);
  }

  @Get('summary')
  getSummary(@Request() req, @Query('month') month: string) {
    return this.transactionsService.getSummary(req.user.userId, month);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.transactionsService.findOne(req.user.userId, +id);
  }

  @Put(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(req.user.userId, +id, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.transactionsService.remove(req.user.userId, +id);
  }
}
