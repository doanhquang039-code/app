"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetWorthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const net_worth_snapshot_entity_1 = require("../../entities/net-worth-snapshot.entity");
const wallet_entity_1 = require("../../entities/wallet.entity");
const bank_account_entity_1 = require("../../entities/bank-account.entity");
const credit_card_entity_1 = require("../../entities/credit-card.entity");
const investment_entity_1 = require("../../entities/investment.entity");
const debt_entity_1 = require("../../entities/debt.entity");
const net_worth_service_1 = require("./net-worth.service");
const net_worth_controller_1 = require("./net-worth.controller");
let NetWorthModule = class NetWorthModule {
};
exports.NetWorthModule = NetWorthModule;
exports.NetWorthModule = NetWorthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                net_worth_snapshot_entity_1.NetWorthSnapshot,
                wallet_entity_1.Wallet,
                bank_account_entity_1.BankAccount,
                credit_card_entity_1.CreditCard,
                investment_entity_1.Investment,
                debt_entity_1.Debt,
            ]),
        ],
        controllers: [net_worth_controller_1.NetWorthController],
        providers: [net_worth_service_1.NetWorthService],
        exports: [net_worth_service_1.NetWorthService],
    })
], NetWorthModule);
//# sourceMappingURL=net-worth.module.js.map