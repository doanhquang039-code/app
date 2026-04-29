import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledTransactionsController } from './scheduled-transactions.controller';
import { ScheduledTransactionsService } from './scheduled-transactions.service';
import { ScheduledTransaction } from '../../entities/scheduled-transaction.entity';
import { Transaction } from '../../entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduledTransaction, Transaction])],
  controllers: [ScheduledTransactionsController],
  providers: [ScheduledTransactionsService],
  exports: [ScheduledTransactionsService],
})
export class ScheduledTransactionsModule {}
