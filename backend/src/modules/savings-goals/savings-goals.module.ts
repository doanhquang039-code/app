import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingsGoalsService } from './savings-goals.service';
import { SavingsGoalsController } from './savings-goals.controller';
import { SavingsGoal } from '../../entities/savings-goal.entity';
import { Wallet } from '../../entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SavingsGoal, Wallet])],
  providers: [SavingsGoalsService],
  controllers: [SavingsGoalsController],
})
export class SavingsGoalsModule {}
