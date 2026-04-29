"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportImportModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const export_import_controller_1 = require("./export-import.controller");
const export_import_service_1 = require("./export-import.service");
const export_history_entity_1 = require("../../entities/export-history.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
const budget_entity_1 = require("../../entities/budget.entity");
const savings_goal_entity_1 = require("../../entities/savings-goal.entity");
const bill_reminder_entity_1 = require("../../entities/bill-reminder.entity");
let ExportImportModule = class ExportImportModule {
};
exports.ExportImportModule = ExportImportModule;
exports.ExportImportModule = ExportImportModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                export_history_entity_1.ExportHistory,
                transaction_entity_1.Transaction,
                budget_entity_1.Budget,
                savings_goal_entity_1.SavingsGoal,
                bill_reminder_entity_1.BillReminder,
            ]),
        ],
        controllers: [export_import_controller_1.ExportImportController],
        providers: [export_import_service_1.ExportImportService],
        exports: [export_import_service_1.ExportImportService],
    })
], ExportImportModule);
//# sourceMappingURL=export-import.module.js.map