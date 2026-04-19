import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetWorthSnapshot } from '../../entities/net-worth-snapshot.entity';
import { Wallet } from '../../entities/wallet.entity';
import { BankAccount } from '../../entities/bank-account.entity';
import { CreditCard } from '../../entities/credit-card.entity';
import { Investment } from '../../entities/investment.entity';
import { Debt } from '../../entities/debt.entity';
import { NetWorthService } from './net-worth.service';
import { NetWorthController } from './net-worth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NetWorthSnapshot,
      Wallet,
      BankAccount,
      CreditCard,
      Investment,
      Debt,
    ]),
  ],
  controllers: [NetWorthController],
  providers: [NetWorthService],
  exports: [NetWorthService],
})
export class NetWorthModule {}
