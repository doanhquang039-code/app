import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIAnalysisController } from './ai-analysis.controller';
import { AIAnalysisService } from './ai-analysis.service';
import { SpendingPattern } from '../../entities/spending-pattern.entity';
import { AIPrediction } from '../../entities/ai-prediction.entity';
import { SpendingAnomaly } from '../../entities/spending-anomaly.entity';
import { Transaction } from '../../entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpendingPattern,
      AIPrediction,
      SpendingAnomaly,
      Transaction,
    ]),
  ],
  controllers: [AIAnalysisController],
  providers: [AIAnalysisService],
  exports: [AIAnalysisService],
})
export class AIAnalysisModule {}
