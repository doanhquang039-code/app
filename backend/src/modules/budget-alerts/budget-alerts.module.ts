import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetAlertsService } from './budget-alerts.service';
import { BudgetAlertsController } from './budget-alerts.controller';
import { BudgetAlert } from '../../entities/budget-alert.entity';
import { Budget } from '../../entities/budget.entity';
import { Transaction } from '../../entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BudgetAlert, Budget, Transaction])],
  providers: [BudgetAlertsService],
  controllers: [BudgetAlertsController],
  exports: [BudgetAlertsService],
})
export class BudgetAlertsModule {}
