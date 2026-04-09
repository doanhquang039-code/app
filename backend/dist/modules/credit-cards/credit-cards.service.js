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
exports.CreditCardsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const credit_card_entity_1 = require("../../entities/credit-card.entity");
let CreditCardsService = class CreditCardsService {
    creditCardRepository;
    constructor(creditCardRepository) {
        this.creditCardRepository = creditCardRepository;
    }
    async create(userId, createCreditCardDto) {
        const creditCard = this.creditCardRepository.create({
            ...createCreditCardDto,
            userId,
        });
        return this.creditCardRepository.save(creditCard);
    }
    async findAll(userId) {
        return this.creditCardRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id, userId) {
        return this.creditCardRepository.findOne({
            where: { id, userId },
        });
    }
    async update(id, userId, updateCreditCardDto) {
        await this.creditCardRepository.update({ id, userId }, { ...updateCreditCardDto, updatedAt: new Date() });
        return this.findOne(id, userId);
    }
    async remove(id, userId) {
        await this.creditCardRepository.delete({ id, userId });
    }
    async updateBalance(id, userId, newBalance) {
        await this.creditCardRepository.update({ id, userId }, { currentBalance: newBalance, updatedAt: new Date() });
        return this.findOne(id, userId);
    }
    async getAvailableCredit(id, userId) {
        const card = await this.findOne(id, userId);
        if (!card)
            return 0;
        return Number(card.creditLimit) - Number(card.currentBalance);
    }
    async getTotalCreditLimit(userId) {
        const result = await this.creditCardRepository
            .createQueryBuilder('creditCard')
            .select('SUM(creditCard.creditLimit)', 'total')
            .where('creditCard.userId = :userId', { userId })
            .andWhere('creditCard.isActive = :isActive', { isActive: true })
            .getRawOne();
        return parseFloat(result.total) || 0;
    }
    async getTotalCreditUsage(userId) {
        const result = await this.creditCardRepository
            .createQueryBuilder('creditCard')
            .select('SUM(creditCard.currentBalance)', 'total')
            .where('creditCard.userId = :userId', { userId })
            .andWhere('creditCard.isActive = :isActive', { isActive: true })
            .getRawOne();
        return parseFloat(result.total) || 0;
    }
    async getCreditUtilizationRatio(userId) {
        const totalLimit = await this.getTotalCreditLimit(userId);
        const totalUsage = await this.getTotalCreditUsage(userId);
        if (totalLimit === 0)
            return 0;
        return (totalUsage / totalLimit) * 100;
    }
    async getCardsByType(userId, cardType) {
        return this.creditCardRepository.find({
            where: { userId, cardType },
        });
    }
    async getUpcomingBillingCycles(userId) {
        const today = new Date();
        const currentDay = today.getDate();
        const cards = await this.findAll(userId);
        return cards.filter(card => card.billingCycleDayOfMonth && card.billingCycleDayOfMonth <= currentDay + 7);
    }
};
exports.CreditCardsService = CreditCardsService;
exports.CreditCardsService = CreditCardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(credit_card_entity_1.CreditCard)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CreditCardsService);
//# sourceMappingURL=credit-cards.service.js.map