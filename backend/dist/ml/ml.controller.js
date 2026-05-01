"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLController = void 0;
const common_1 = require("@nestjs/common");
const ml_service_1 = require("./ml.service");
const prediction_service_1 = require("./prediction.service");
const anomaly_detection_service_1 = require("./anomaly-detection.service");
const recommendation_service_1 = require("./recommendation.service");
let MLController = class MLController {
    mlService;
    predictionService;
    anomalyService;
    recommendationService;
    constructor(mlService, predictionService, anomalyService, recommendationService) {
        this.mlService = mlService;
        this.predictionService = predictionService;
        this.anomalyService = anomalyService;
        this.recommendationService = recommendationService;
    }
    async predictNextMonth(userId) {
        const prediction = await this.mlService.predictNextMonthSpending(userId);
        return { userId, predictedSpending: prediction };
    }
    async predictBudgetOverrun(userId, budgetId) {
        return await this.predictionService.predictBudgetOverrun(userId, budgetId);
    }
    async predictNextTransaction(userId) {
        return await this.predictionService.predictNextTransaction(userId);
    }
    async predictSavingsPotential(userId) {
        return await this.predictionService.predictSavingsPotential(userId);
    }
    async predictGoalAchievement(userId, body) {
        return await this.predictionService.predictGoalAchievement(userId, body.goalAmount, new Date(body.targetDate));
    }
    async analyzeSpendingTrend(userId, months) {
        return await this.mlService.analyzeSpendingTrend(userId, months || 12);
    }
    async identifySpendingPatterns(userId) {
        return await this.mlService.identifySpendingPatterns(userId);
    }
    async detectAnomalies(userId) {
        return await this.mlService.detectAnomalies(userId);
    }
    async detectFraud(userId) {
        return await this.anomalyService.detectFraudulentTransactions(userId);
    }
    async detectUnusual(userId) {
        return await this.anomalyService.detectUnusualSpending(userId);
    }
    async detectDuplicates(userId) {
        return await this.anomalyService.detectDuplicateTransactions(userId);
    }
    async getRecommendations(userId) {
        return await this.recommendationService.getPersonalizedRecommendations(userId);
    }
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
};
exports.MLController = MLController;
__decorate([
    (0, common_1.Get)('predict/next-month/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MLController.prototype, "predictNextMonth", null);
__decorate([
    (0, common_1.Get)('predict/budget-overrun/:userId/:budgetId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('budgetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], MLController.prototype, "predictBudgetOverrun", null);
__decorate([
    (0, common_1.Get)('predict/next-transaction/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MLController.prototype, "predictNextTransaction", null);
__decorate([
    (0, common_1.Get)('predict/savings-potential/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MLController.prototype, "predictSavingsPotential", null);
__decorate([
    (0, common_1.Post)('predict/goal-achievement/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], MLController.prototype, "predictGoalAchievement", null);
__decorate([
    (0, common_1.Get)('analyze/trend/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], MLController.prototype, "analyzeSpendingTrend", null);
__decorate([
    (0, common_1.Get)('analyze/patterns/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MLController.prototype, "identifySpendingPatterns", null);
__decorate([
    (0, common_1.Get)('anomaly/detect/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MLController.prototype, "detectAnomalies", null);
__decorate([
    (0, common_1.Get)('anomaly/fraud/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MLController.prototype, "detectFraud", null);
__decorate([
    (0, common_1.Get)('anomaly/unusual/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MLController.prototype, "detectUnusual", null);
__decorate([
    (0, common_1.Get)('anomaly/duplicates/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MLController.prototype, "detectDuplicates", null);
__decorate([
    (0, common_1.Get)('recommend/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], MLController.prototype, "getRecommendations", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MLController.prototype, "healthCheck", null);
exports.MLController = MLController = __decorate([
    (0, common_1.Controller)('ml'),
    __metadata("design:paramtypes", [ml_service_1.MLService,
        prediction_service_1.PredictionService,
        anomaly_detection_service_1.AnomalyDetectionService,
        recommendation_service_1.RecommendationService])
], MLController);
//# sourceMappingURL=ml.controller.js.map