import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedExpenseGroup, SharedExpense, GroupSettlement } from '../../entities/shared-expense.entity';
import { User } from '../../entities/user.entity';
import { SharedExpensesService } from './shared-expenses.service';
import { SharedExpensesController } from './shared-expenses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SharedExpenseGroup, SharedExpense, GroupSettlement, User])],
  controllers: [SharedExpensesController],
  providers: [SharedExpensesService],
  exports: [SharedExpensesService],
})
export class SharedExpensesModule {}
