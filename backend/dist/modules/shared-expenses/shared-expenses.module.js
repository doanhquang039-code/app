"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedExpensesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const shared_expense_entity_1 = require("../../entities/shared-expense.entity");
const user_entity_1 = require("../../entities/user.entity");
const shared_expenses_service_1 = require("./shared-expenses.service");
const shared_expenses_controller_1 = require("./shared-expenses.controller");
let SharedExpensesModule = class SharedExpensesModule {
};
exports.SharedExpensesModule = SharedExpensesModule;
exports.SharedExpensesModule = SharedExpensesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([shared_expense_entity_1.SharedExpenseGroup, shared_expense_entity_1.SharedExpense, shared_expense_entity_1.GroupSettlement, user_entity_1.User])],
        controllers: [shared_expenses_controller_1.SharedExpensesController],
        providers: [shared_expenses_service_1.SharedExpensesService],
        exports: [shared_expenses_service_1.SharedExpensesService],
    })
], SharedExpensesModule);
//# sourceMappingURL=shared-expenses.module.js.map