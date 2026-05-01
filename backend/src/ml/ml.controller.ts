import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { MLService } from './ml.service';
import { PredictionService } from './prediction.service';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { RecommendationService } from './recommendation.service';

@Controller('ml')
export class MLController {
  constructor(
    private mlService: MLService,
    private predictionService: PredictionService,
    private anomalyService: AnomalyDetectionService,
    private recommendationService: RecommendationService,
  ) {}

  // Predictions
  @Get('predict/next-month/:userId')
  async predictNextMonth(@Param('userId') userId: number) {
    const prediction = await this.mlService.predictNextMonthSpending(userId);
    return { userId, predictedSpending: prediction };
  }

  @Get('predict/budget-overrun/:userId/:budgetId')
  async predictBudgetOverrun(
    @Param('userId') userId: number,
    @Param('budgetId') budgetId: number,
  ) {
    return await this.predictionService.predictBudgetOverrun(userId, budgetId);
  }

  @Get('predict/next-transaction/:userId')
  async predictNextTransaction(@Param('userId') userId: number) {
    return await this.predictionService.predictNextTransaction(userId);
  }

  @Get('predict/savings-potential/:userId')
  async predictSavingsPotential(@Param('userId') userId: number) {
    return await this.predictionService.predictSavingsPotential(userId);
  }

  @Post('predict/goal-achievement/:userId')
  async predictGoalAchievement(
    @Param('userId') userId: number,
    @Body() body: { goalAmount: number; targetDate: string },
  ) {
    return await this.predictionService.predictGoalAchievement(
      userId,
      body.goalAmount,
      new Date(body.targetDate),
    );
  }

  // Analysis
  @Get('analyze/trend/:userId')
  async analyzeSpendingTrend(
    @Param('userId') userId: number,
    @Query('months') months?: number,
  ) {
    return await this.mlService.analyzeSpendingTrend(userId, months || 12);
  }

  @Get('analyze/patterns/:userId')
  async identifySpendingPatterns(@Param('userId') userId: number) {
    return await this.mlService.identifySpendingPatterns(userId);
  }

  // Anomaly Detection
  @Get('anomaly/detect/:userId')
  async detectAnomalies(@Param('userId') userId: number) {
    return await this.mlService.detectAnomalies(userId);
  }

  @Get('anomaly/fraud/:userId')
  async detectFraud(@Param('userId') userId: number) {
    return await this.anomalyService.detectFraudulentTransactions(userId);
  }

  @Get('anomaly/unusual/:userId')
  async detectUnusual(@Param('userId') userId: number) {
    return await this.anomalyService.detectUnusualSpending(userId);
  }

  @Get('anomaly/duplicates/:userId')
  async detectDuplicates(@Param('userId') userId: number) {
    return await this.anomalyService.detectDuplicateTransactions(userId);
  }

  // Recommendations
  @Get('recommend/:userId')
  async getRecommendations(@Param('userId') userId: number) {
    return await this.recommendationService.getPersonalizedRecommendations(userId);
  }

  // Health check
  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      services: {
        ml: 'available',
        prediction: 'available',
        anomaly: 'available',
        recommendation: 'available',
      },
      timestamp: new Date().toISOString(),
    };
  }
}
