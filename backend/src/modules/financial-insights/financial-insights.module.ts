import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinancialInsightsService } from './financial-insights.service';
import { FinancialInsightsController } from './financial-insights.controller';
import { Transaction } from '../../entities/transaction.entity';
import { Category } from '../../entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Category])],
  providers: [FinancialInsightsService],
  controllers: [FinancialInsightsController],
  exports: [FinancialInsightsService],
})
export class FinancialInsightsModule {}
