import { MLService } from './ml.service';
import { PredictionService } from './prediction.service';
import { AnomalyDetectionService } from './anomaly-detection.service';
import { RecommendationService } from './recommendation.service';
export declare class MLController {
    private mlService;
    private predictionService;
    private anomalyService;
    private recommendationService;
    constructor(mlService: MLService, predictionService: PredictionService, anomalyService: AnomalyDetectionService, recommendationService: RecommendationService);
    predictNextMonth(userId: number): Promise<{
        userId: number;
        predictedSpending: number;
    }>;
    predictBudgetOverrun(userId: number, budgetId: number): Promise<any>;
    predictNextTransaction(userId: number): Promise<any>;
    predictSavingsPotential(userId: number): Promise<any>;
    predictGoalAchievement(userId: number, body: {
        goalAmount: number;
        targetDate: string;
    }): Promise<any>;
    analyzeSpendingTrend(userId: number, months?: number): Promise<any>;
    identifySpendingPatterns(userId: number): Promise<any[]>;
    detectAnomalies(userId: number): Promise<any[]>;
    detectFraud(userId: number): Promise<any[]>;
    detectUnusual(userId: number): Promise<any[]>;
    detectDuplicates(userId: number): Promise<any[]>;
    getRecommendations(userId: number): Promise<any[]>;
    healthCheck(): Promise<{
        status: string;
        services: {
            ml: string;
            prediction: string;
            anomaly: string;
            recommendation: string;
        };
        timestamp: string;
    }>;
}
