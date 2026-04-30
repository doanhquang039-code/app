"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ai_advisor_controller_1 = require("./ai-advisor.controller");
const ai_advisor_service_1 = require("./ai-advisor.service");
const transaction_entity_1 = require("../entities/transaction.entity");
const budget_entity_1 = require("../entities/budget.entity");
const savings_goal_entity_1 = require("../entities/savings-goal.entity");
let AIModule = class AIModule {
};
exports.AIModule = AIModule;
exports.AIModule = AIModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([transaction_entity_1.Transaction, budget_entity_1.Budget, savings_goal_entity_1.SavingsGoal])],
        controllers: [ai_advisor_controller_1.AIAdvisorController],
        providers: [ai_advisor_service_1.AIAdvisorService],
        exports: [ai_advisor_service_1.AIAdvisorService],
    })
], AIModule);
//# sourceMappingURL=ai.module.js.map