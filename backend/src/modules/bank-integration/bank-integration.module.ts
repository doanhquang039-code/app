import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankIntegrationController } from './bank-integration.controller';
import { BankIntegrationService } from './bank-integration.service';
import { PlaidService } from './plaid.service';
import { OpenBankingService } from './open-banking.service';
import { BankAccount } from '../../entities/bank-account.entity';
import { BankTransaction } from '../../entities/bank-transaction.entity';
import { Transaction } from '../../entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BankAccount, BankTransaction, Transaction]),
  ],
  controllers: [BankIntegrationController],
  providers: [BankIntegrationService, PlaidService, OpenBankingService],
  exports: [BankIntegrationService],
})
export class BankIntegrationModule {}
