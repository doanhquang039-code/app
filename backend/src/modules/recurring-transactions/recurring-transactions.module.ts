import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { RecurringTransactionsController } from './recurring-transactions.controller';
import { RecurringTransaction } from '../../entities/recurring-transaction.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Wallet } from '../../entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecurringTransaction, Transaction, Wallet])],
  providers: [RecurringTransactionsService],
  controllers: [RecurringTransactionsController],
})
export class RecurringTransactionsModule {}
