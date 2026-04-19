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
exports.InvestmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const investment_entity_1 = require("../../entities/investment.entity");
let InvestmentsService = class InvestmentsService {
    investmentRepo;
    txRepo;
    constructor(investmentRepo, txRepo) {
        this.investmentRepo = investmentRepo;
        this.txRepo = txRepo;
    }
    async findAll(userId) {
        return this.investmentRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    }
    async findOne(id, userId) {
        return this.investmentRepo.findOne({ where: { id, userId } });
    }
    async create(userId, data) {
        const investment = this.investmentRepo.create({ ...data, userId });
        if (investment.currentPrice && investment.quantity) {
            investment.currentValue = Number(investment.currentPrice) * Number(investment.quantity);
            investment.profitLoss = investment.currentValue - Number(investment.totalInvested);
            investment.profitLossPercentage = Number(investment.totalInvested) > 0
                ? (investment.profitLoss / Number(investment.totalInvested)) * 100 : 0;
        }
        return this.investmentRepo.save(investment);
    }
    async update(id, userId, data) {
        if (data.currentPrice) {
            const existing = await this.findOne(id, userId);
            if (existing) {
                const qty = data.quantity || existing.quantity;
                data.currentValue = Number(data.currentPrice) * Number(qty);
                data.profitLoss = data.currentValue - Number(existing.totalInvested);
                data.profitLossPercentage = Number(existing.totalInvested) > 0
                    ? (data.profitLoss / Number(existing.totalInvested)) * 100 : 0;
            }
        }
        await this.investmentRepo.update({ id, userId }, data);
        const updated = await this.findOne(id, userId);
        if (!updated)
            throw new common_1.NotFoundException('Không tìm thấy khoản đầu tư');
        return updated;
    }
    async remove(id, userId) {
        await this.investmentRepo.delete({ id, userId });
    }
    async getPortfolioSummary(userId) {
        const investments = await this.findAll(userId);
        const holding = investments.filter(i => i.status === 'holding');
        const totalInvested = holding.reduce((s, i) => s + Number(i.totalInvested), 0);
        const totalCurrentValue = holding.reduce((s, i) => s + Number(i.currentValue || i.totalInvested), 0);
        const totalProfitLoss = totalCurrentValue - totalInvested;
        const profitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
        const byType = {};
        holding.forEach(i => {
            if (!byType[i.type])
                byType[i.type] = { count: 0, invested: 0, currentValue: 0 };
            byType[i.type].count++;
            byType[i.type].invested += Number(i.totalInvested);
            byType[i.type].currentValue += Number(i.currentValue || i.totalInvested);
        });
        return {
            totalInvested,
            totalCurrentValue,
            totalProfitLoss,
            profitLossPercentage: Math.round(profitLossPercentage * 100) / 100,
            holdingCount: holding.length,
            soldCount: investments.filter(i => i.status === 'sold').length,
            byType,
        };
    }
    async getTransactions(investmentId, userId) {
        return this.txRepo.find({ where: { investmentId, userId }, order: { transactionDate: 'DESC' } });
    }
    async addTransaction(investmentId, userId, data) {
        const tx = this.txRepo.create({ ...data, investmentId, userId });
        return this.txRepo.save(tx);
    }
};
exports.InvestmentsService = InvestmentsService;
exports.InvestmentsService = InvestmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(investment_entity_1.Investment)),
    __param(1, (0, typeorm_1.InjectRepository)(investment_entity_1.InvestmentTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], InvestmentsService);
//# sourceMappingURL=investments.service.js.map