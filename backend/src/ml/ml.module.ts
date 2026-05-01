import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Budget } from '../entities/budget.entity';
import { MLService } from './ml.service';
import { MLController } from './ml.controller';
import { PredictionService } from './prediction.service';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { RecommendationService } from './recommendation.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Transaction, Budget]),
  ],
  providers: [
    MLService,
    PredictionService,
    AnomalyDetectionService,
    RecommendationService,
  ],
  controllers: [MLController],
  exports: [MLService, PredictionService, AnomalyDetectionService, RecommendationService],
})
export class MLModule {}
