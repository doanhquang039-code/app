"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
const budget_entity_1 = require("../entities/budget.entity");
const ml_service_1 = require("./ml.service");
const ml_controller_1 = require("./ml.controller");
const prediction_service_1 = require("./prediction.service");
const anomaly_detection_service_1 = require("./anomaly-detection.service");
const recommendation_service_1 = require("./recommendation.service");
let MLModule = class MLModule {
};
exports.MLModule = MLModule;
exports.MLModule = MLModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([transaction_entity_1.Transaction, budget_entity_1.Budget]),
        ],
        providers: [
            ml_service_1.MLService,
            prediction_service_1.PredictionService,
            anomaly_detection_service_1.AnomalyDetectionService,
            recommendation_service_1.RecommendationService,
        ],
        controllers: [ml_controller_1.MLController],
        exports: [ml_service_1.MLService, prediction_service_1.PredictionService, anomaly_detection_service_1.AnomalyDetectionService, recommendation_service_1.RecommendationService],
    })
], MLModule);
//# sourceMappingURL=ml.module.js.map