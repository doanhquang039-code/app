import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Wallet } from '../../entities/wallet.entity';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionsViewModel } from './transactions.view-model';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Wallet])],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsViewModel],
})
export class TransactionsModule {}
