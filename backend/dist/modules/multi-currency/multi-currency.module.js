"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiCurrencyModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const multi_currency_entity_1 = require("../../entities/multi-currency.entity");
const multi_currency_service_1 = require("./multi-currency.service");
const multi_currency_controller_1 = require("./multi-currency.controller");
let MultiCurrencyModule = class MultiCurrencyModule {
};
exports.MultiCurrencyModule = MultiCurrencyModule;
exports.MultiCurrencyModule = MultiCurrencyModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([multi_currency_entity_1.Currency, multi_currency_entity_1.MultiCurrencyWallet, multi_currency_entity_1.ExchangeRateHistory])],
        controllers: [multi_currency_controller_1.MultiCurrencyController],
        providers: [multi_currency_service_1.MultiCurrencyService],
        exports: [multi_currency_service_1.MultiCurrencyService],
    })
], MultiCurrencyModule);
//# sourceMappingURL=multi-currency.module.js.map