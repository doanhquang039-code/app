"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditCardsController = void 0;
const common_1 = require("@nestjs/common");
const credit_cards_service_1 = require("./credit-cards.service");
const credit_card_dto_1 = require("./dto/credit-card.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let CreditCardsController = class CreditCardsController {
    creditCardsService;
    constructor(creditCardsService) {
        this.creditCardsService = creditCardsService;
    }
    create(req, createCreditCardDto) {
        return this.creditCardsService.create(req.user.id, createCreditCardDto);
    }
    findAll(req) {
        return this.creditCardsService.findAll(req.user.id);
    }
    async getTotalCreditLimit(req) {
        const totalLimit = await this.creditCardsService.getTotalCreditLimit(req.user.id);
        return { totalLimit };
    }
    async getTotalCreditUsage(req) {
        const totalUsage = await this.creditCardsService.getTotalCreditUsage(req.user.id);
        return { totalUsage };
    }
    async getCreditUtilizationRatio(req) {
        const ratio = await this.creditCardsService.getCreditUtilizationRatio(req.user.id);
        return { utilizationRatio: ratio.toFixed(2) };
    }
    async getUpcomingBillingCycles(req) {
        const upcomingCycles = await this.creditCardsService.getUpcomingBillingCycles(req.user.id);
        return { upcomingCycles };
    }
    findOne(id, req) {
        return this.creditCardsService.findOne(+id, req.user.id);
    }
    async getAvailableCredit(id, req) {
        const available = await this.creditCardsService.getAvailableCredit(+id, req.user.id);
        return { availableCredit: available };
    }
    update(id, req, updateCreditCardDto) {
        return this.creditCardsService.update(+id, req.user.id, updateCreditCardDto);
    }
    remove(id, req) {
        return this.creditCardsService.remove(+id, req.user.id);
    }
    updateBalance(id, req, { balance }) {
        return this.creditCardsService.updateBalance(+id, req.user.id, balance);
    }
    getCardsByType(cardType, req) {
        return this.creditCardsService.getCardsByType(req.user.id, cardType);
    }
};
exports.CreditCardsController = CreditCardsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, credit_card_dto_1.CreateCreditCardDto]),
    __metadata("design:returntype", void 0)
], CreditCardsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CreditCardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('analytics/total-limit'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreditCardsController.prototype, "getTotalCreditLimit", null);
__decorate([
    (0, common_1.Get)('analytics/total-usage'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreditCardsController.prototype, "getTotalCreditUsage", null);
__decorate([
    (0, common_1.Get)('analytics/utilization-ratio'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreditCardsController.prototype, "getCreditUtilizationRatio", null);
__decorate([
    (0, common_1.Get)('analytics/upcoming-billing'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreditCardsController.prototype, "getUpcomingBillingCycles", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CreditCardsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/available-credit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CreditCardsController.prototype, "getAvailableCredit", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, credit_card_dto_1.UpdateCreditCardDto]),
    __metadata("design:returntype", void 0)
], CreditCardsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CreditCardsController.prototype, "remove", null);
__decorate([
    (0, common_1.Put)(':id/balance'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CreditCardsController.prototype, "updateBalance", null);
__decorate([
    (0, common_1.Get)('type/:cardType'),
    __param(0, (0, common_1.Param)('cardType')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CreditCardsController.prototype, "getCardsByType", null);
exports.CreditCardsController = CreditCardsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('credit-cards'),
    __metadata("design:paramtypes", [credit_cards_service_1.CreditCardsService])
], CreditCardsController);
//# sourceMappingURL=credit-cards.controller.js.map