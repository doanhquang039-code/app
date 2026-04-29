"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAnalysisModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ai_analysis_controller_1 = require("./ai-analysis.controller");
const ai_analysis_service_1 = require("./ai-analysis.service");
const spending_pattern_entity_1 = require("../../entities/spending-pattern.entity");
const ai_prediction_entity_1 = require("../../entities/ai-prediction.entity");
const spending_anomaly_entity_1 = require("../../entities/spending-anomaly.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
let AIAnalysisModule = class AIAnalysisModule {
};
exports.AIAnalysisModule = AIAnalysisModule;
exports.AIAnalysisModule = AIAnalysisModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                spending_pattern_entity_1.SpendingPattern,
                ai_prediction_entity_1.AIPrediction,
                spending_anomaly_entity_1.SpendingAnomaly,
                transaction_entity_1.Transaction,
            ]),
        ],
        controllers: [ai_analysis_controller_1.AIAnalysisController],
        providers: [ai_analysis_service_1.AIAnalysisService],
        exports: [ai_analysis_service_1.AIAnalysisService],
    })
], AIAnalysisModule);
//# sourceMappingURL=ai-analysis.module.js.map