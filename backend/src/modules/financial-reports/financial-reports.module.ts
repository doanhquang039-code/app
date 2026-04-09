import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialReport } from '../../entities/financial-report.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Budget } from '../../entities/budget.entity';
import { FinancialReportsService } from './financial-reports.service';
import { FinancialReportsController } from './financial-reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FinancialReport, Transaction, Budget])],
  controllers: [FinancialReportsController],
  providers: [FinancialReportsService],
  exports: [FinancialReportsService],
})
export class FinancialReportsModule {}
