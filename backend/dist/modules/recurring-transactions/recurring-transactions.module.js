"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringTransactionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const recurring_transactions_service_1 = require("./recurring-transactions.service");
const recurring_transactions_controller_1 = require("./recurring-transactions.controller");
const recurring_transaction_entity_1 = require("../../entities/recurring-transaction.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
const wallet_entity_1 = require("../../entities/wallet.entity");
let RecurringTransactionsModule = class RecurringTransactionsModule {
};
exports.RecurringTransactionsModule = RecurringTransactionsModule;
exports.RecurringTransactionsModule = RecurringTransactionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([recurring_transaction_entity_1.RecurringTransaction, transaction_entity_1.Transaction, wallet_entity_1.Wallet])],
        providers: [recurring_transactions_service_1.RecurringTransactionsService],
        controllers: [recurring_transactions_controller_1.RecurringTransactionsController],
    })
], RecurringTransactionsModule);
//# sourceMappingURL=recurring-transactions.module.js.map