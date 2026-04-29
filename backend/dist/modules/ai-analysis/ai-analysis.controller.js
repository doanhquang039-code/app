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
exports.AIAnalysisController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const ai_analysis_service_1 = require("./ai-analysis.service");
const swagger_1 = require("@nestjs/swagger");
let AIAnalysisController = class AIAnalysisController {
    aiAnalysisService;
    constructor(aiAnalysisService) {
        this.aiAnalysisService = aiAnalysisService;
    }
    async analyzePatterns(req, months) {
        const patterns = await this.aiAnalysisService.analyzeSpendingPatterns(req.user.userId, months ? Number(months) : 6);
        return {
            success: true,
            message: `Đã phát hiện ${patterns.length} mẫu chi tiêu`,
            patterns,
        };
    }
    async getPatterns(req) {
        return await this.aiAnalysisService.getUserPatterns(req.user.userId);
    }
    async detectAnomalies(req) {
        const anomalies = await this.aiAnalysisService.detectAnomalies(req.user.userId);
        return {
            success: true,
            message: `Phát hiện ${anomalies.length} giao dịch bất thường`,
            anomalies,
        };
    }
    async getAnomalies(req, status) {
        return await this.aiAnalysisService.getUserAnomalies(req.user.userId, status);
    }
    async updateAnomalyStatus(req, anomalyId, data) {
        return await this.aiAnalysisService.updateAnomalyStatus(req.user.userId, anomalyId, data.status, data.note);
    }
    async generatePredictions(req) {
        const predictions = await this.aiAnalysisService.generatePredictions(req.user.userId);
        return {
            success: true,
            message: `Đã tạo ${predictions.length} dự đoán`,
            predictions,
        };
    }
    async getPredictions(req) {
        return await this.aiAnalysisService.getUserPredictions(req.user.userId);
    }
    async getInsights(req) {
        const patterns = await this.aiAnalysisService.getUserPatterns(req.user.userId);
        const anomalies = await this.aiAnalysisService.getUserAnomalies(req.user.userId, 'UNREVIEWED');
        const predictions = await this.aiAnalysisService.getUserPredictions(req.user.userId);
        return {
            summary: {
                patternsDetected: patterns.length,
                anomaliesFound: anomalies.length,
                predictionsGenerated: predictions.length,
            },
            patterns: patterns.slice(0, 5),
            recentAnomalies: anomalies.slice(0, 5),
            upcomingPredictions: predictions.slice(0, 5),
            recommendations: this.generateTopRecommendations(patterns, anomalies, predictions),
        };
    }
    generateTopRecommendations(patterns, anomalies, predictions) {
        const recommendations = [];
        const criticalAnomalies = anomalies.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');
        if (criticalAnomalies.length > 0) {
            recommendations.push({
                type: 'ALERT',
                priority: 'HIGH',
                message: `Phát hiện ${criticalAnomalies.length} giao dịch bất thường cần xem xét`,
                action: 'Kiểm tra chi tiết trong mục Anomalies',
            });
        }
        const increasingTrends = patterns.filter(p => {
            try {
                const insights = JSON.parse(p.insights);
                return insights.direction === 'INCREASING';
            }
            catch {
                return false;
            }
        });
        if (increasingTrends.length > 0) {
            recommendations.push({
                type: 'WARNING',
                priority: 'MEDIUM',
                message: `${increasingTrends.length} danh mục có xu hướng chi tiêu tăng`,
                action: 'Cân nhắc điều chỉnh ngân sách',
            });
        }
        const highConfidencePredictions = predictions.filter(p => p.confidence > 80);
        if (highConfidencePredictions.length > 0) {
            const totalPredicted = highConfidencePredictions.reduce((sum, p) => sum + parseFloat(p.predictedAmount.toString()), 0);
            recommendations.push({
                type: 'INFO',
                priority: 'MEDIUM',
                message: `Dự kiến chi tiêu tháng tới: ${Math.round(totalPredicted).toLocaleString()}đ`,
                action: 'Lập kế hoạch ngân sách phù hợp',
            });
        }
        return recommendations;
    }
};
exports.AIAnalysisController = AIAnalysisController;
__decorate([
    (0, common_1.Post)('patterns/analyze'),
    (0, swagger_1.ApiOperation)({ summary: 'Phân tích mẫu chi tiêu (chạy AI analysis)' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('months')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AIAnalysisController.prototype, "analyzePatterns", null);
__decorate([
    (0, common_1.Get)('patterns'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách mẫu chi tiêu đã phát hiện' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIAnalysisController.prototype, "getPatterns", null);
__decorate([
    (0, common_1.Post)('anomalies/detect'),
    (0, swagger_1.ApiOperation)({ summary: 'Phát hiện chi tiêu bất thường' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIAnalysisController.prototype, "detectAnomalies", null);
__decorate([
    (0, common_1.Get)('anomalies'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách chi tiêu bất thường' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AIAnalysisController.prototype, "getAnomalies", null);
__decorate([
    (0, common_1.Put)('anomalies/:anomalyId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật trạng thái chi tiêu bất thường' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('anomalyId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Object]),
    __metadata("design:returntype", Promise)
], AIAnalysisController.prototype, "updateAnomalyStatus", null);
__decorate([
    (0, common_1.Post)('predictions/generate'),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo dự đoán chi tiêu' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIAnalysisController.prototype, "generatePredictions", null);
__decorate([
    (0, common_1.Get)('predictions'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách dự đoán' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIAnalysisController.prototype, "getPredictions", null);
__decorate([
    (0, common_1.Get)('insights'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy tổng hợp insights từ AI' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIAnalysisController.prototype, "getInsights", null);
exports.AIAnalysisController = AIAnalysisController = __decorate([
    (0, swagger_1.ApiTags)('AI Analysis'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('ai-analysis'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ai_analysis_service_1.AIAnalysisService])
], AIAnalysisController);
//# sourceMappingURL=ai-analysis.controller.js.map