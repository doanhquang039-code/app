import { Injectable } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { TransactionsService } from './transactions.service';

@Injectable()
export class TransactionsViewModel {
  constructor(private readonly transactionsService: TransactionsService) {}

  create(userId: number, dto: CreateTransactionDto) {
    return this.transactionsService.create(userId, dto);
  }

  bulkCreate(userId: number, items: CreateTransactionDto[]) {
    return this.transactionsService.bulkCreate(userId, items);
  }

  findAll(userId: number, query: QueryTransactionDto) {
    return this.transactionsService.findAll(userId, query);
  }

  getSummary(userId: number, month?: string) {
    return this.transactionsService.getSummary(userId, month);
  }

  findOne(userId: number, id: number) {
    return this.transactionsService.findOne(userId, id);
  }

  update(userId: number, id: number, dto: UpdateTransactionDto) {
    return this.transactionsService.update(userId, id, dto);
  }

  remove(userId: number, id: number) {
    return this.transactionsService.remove(userId, id);
  }
}
