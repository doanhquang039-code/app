import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { Wallet } from '../../entities/wallet.entity';
import { Budget } from '../../entities/budget.entity';
import { User } from '../../entities/user.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AdvancedDashboardController } from './advanced-dashboard.controller';
import { AdvancedDashboardService } from './advanced-dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Wallet, Budget, User])],
  controllers: [DashboardController, AdvancedDashboardController],
  providers: [DashboardService, AdvancedDashboardService],
  exports: [DashboardService, AdvancedDashboardService],
})
export class DashboardModule {}
