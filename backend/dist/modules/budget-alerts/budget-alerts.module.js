"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetAlertsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const budget_alerts_service_1 = require("./budget-alerts.service");
const budget_alerts_controller_1 = require("./budget-alerts.controller");
const budget_alert_entity_1 = require("../../entities/budget-alert.entity");
const budget_entity_1 = require("../../entities/budget.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
let BudgetAlertsModule = class BudgetAlertsModule {
};
exports.BudgetAlertsModule = BudgetAlertsModule;
exports.BudgetAlertsModule = BudgetAlertsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([budget_alert_entity_1.BudgetAlert, budget_entity_1.Budget, transaction_entity_1.Transaction])],
        providers: [budget_alerts_service_1.BudgetAlertsService],
        controllers: [budget_alerts_controller_1.BudgetAlertsController],
        exports: [budget_alerts_service_1.BudgetAlertsService],
    })
], BudgetAlertsModule);
//# sourceMappingURL=budget-alerts.module.js.map