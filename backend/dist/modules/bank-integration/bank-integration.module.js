"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankIntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bank_integration_controller_1 = require("./bank-integration.controller");
const bank_integration_service_1 = require("./bank-integration.service");
const plaid_service_1 = require("./plaid.service");
const open_banking_service_1 = require("./open-banking.service");
const bank_account_entity_1 = require("../../entities/bank-account.entity");
const bank_transaction_entity_1 = require("../../entities/bank-transaction.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
let BankIntegrationModule = class BankIntegrationModule {
};
exports.BankIntegrationModule = BankIntegrationModule;
exports.BankIntegrationModule = BankIntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([bank_account_entity_1.BankAccount, bank_transaction_entity_1.BankTransaction, transaction_entity_1.Transaction]),
        ],
        controllers: [bank_integration_controller_1.BankIntegrationController],
        providers: [bank_integration_service_1.BankIntegrationService, plaid_service_1.PlaidService, open_banking_service_1.OpenBankingService],
        exports: [bank_integration_service_1.BankIntegrationService],
    })
], BankIntegrationModule);
//# sourceMappingURL=bank-integration.module.js.map