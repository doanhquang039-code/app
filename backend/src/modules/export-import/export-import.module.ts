import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportImportController } from './export-import.controller';
import { ExportImportService } from './export-import.service';
import { ExportHistory } from '../../entities/export-history.entity';
import { Transaction } from '../../entities/transaction.entity';
import { Budget } from '../../entities/budget.entity';
import { SavingsGoal } from '../../entities/savings-goal.entity';
import { BillReminder } from '../../entities/bill-reminder.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExportHistory,
      Transaction,
      Budget,
      SavingsGoal,
      BillReminder,
    ]),
  ],
  controllers: [ExportImportController],
  providers: [ExportImportService],
  exports: [ExportImportService],
})
export class ExportImportModule {}
