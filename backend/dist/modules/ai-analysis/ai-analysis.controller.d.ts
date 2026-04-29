import { AIAnalysisService } from './ai-analysis.service';
export declare class AIAnalysisController {
    private readonly aiAnalysisService;
    constructor(aiAnalysisService: AIAnalysisService);
    analyzePatterns(req: any, months?: string): Promise<{
        success: boolean;
        message: string;
        patterns: import("../../entities/spending-pattern.entity").SpendingPattern[];
    }>;
    getPatterns(req: any): Promise<import("../../entities/spending-pattern.entity").SpendingPattern[]>;
    detectAnomalies(req: any): Promise<{
        success: boolean;
        message: string;
        anomalies: import("../../entities/spending-anomaly.entity").SpendingAnomaly[];
    }>;
    getAnomalies(req: any, status?: string): Promise<import("../../entities/spending-anomaly.entity").SpendingAnomaly[]>;
    updateAnomalyStatus(req: any, anomalyId: number, data: {
        status: string;
        note?: string;
    }): Promise<import("../../entities/spending-anomaly.entity").SpendingAnomaly>;
    generatePredictions(req: any): Promise<{
        success: boolean;
        message: string;
        predictions: import("../../entities/ai-prediction.entity").AIPrediction[];
    }>;
    getPredictions(req: any): Promise<import("../../entities/ai-prediction.entity").AIPrediction[]>;
    getInsights(req: any): Promise<{
        summary: {
            patternsDetected: number;
            anomaliesFound: number;
            predictionsGenerated: number;
        };
        patterns: import("../../entities/spending-pattern.entity").SpendingPattern[];
        recentAnomalies: import("../../entities/spending-anomaly.entity").SpendingAnomaly[];
        upcomingPredictions: import("../../entities/ai-prediction.entity").AIPrediction[];
        recommendations: {
            type: string;
            priority: string;
            message: string;
            action: string;
        }[];
    }>;
    private generateTopRecommendations;
}
