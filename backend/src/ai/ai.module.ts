import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIAdvisorController } from './ai-advisor.controller';
import { AIAdvisorService } from './ai-advisor.service';
import { Transaction } from '../entities/transaction.entity';
import { Budget } from '../entities/budget.entity';
import { SavingsGoal } from '../entities/savings-goal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Budget, SavingsGoal])],
  controllers: [AIAdvisorController],
  providers: [AIAdvisorService],
  exports: [AIAdvisorService],
})
export class AIModule {}
