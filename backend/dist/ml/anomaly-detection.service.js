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
exports.AnomalyDetectionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
let AnomalyDetectionService = class AnomalyDetectionService {
    transactionRepo;
    constructor(transactionRepo) {
        this.transactionRepo = transactionRepo;
    }
    async detectFraudulentTransactions(userId) {
        const transactions = await this.transactionRepo.find({
            where: { userId },
            order: { date: 'DESC' },
            take: 100,
        });
        const fraudulent = [];
        for (const transaction of transactions) {
            const score = await this.calculateFraudScore(transaction, transactions);
            if (score > 0.7) {
                fraudulent.push({
                    transaction,
                    fraudScore: score,
                    reasons: this.getFraudReasons(transaction, transactions),
                    recommendation: 'Review this transaction',
                });
            }
        }
        return fraudulent;
    }
    async detectUnusualSpending(userId) {
        const transactions = await this.transactionRepo.find({
            where: { userId, type: 'expense' },
            order: { date: 'DESC' },
            take: 90,
        });
        const unusual = [];
        const stats = this.calculateStats(transactions);
        for (const transaction of transactions) {
            const zScore = (transaction.amount - stats.mean) / stats.stdDev;
            if (Math.abs(zScore) > 2) {
                unusual.push({
                    transaction,
                    deviation: zScore,
                    severity: Math.abs(zScore) > 3 ? 'high' : 'medium',
                    message: `${Math.abs(zScore).toFixed(1)}x higher than average`,
                });
            }
        }
        return unusual;
    }
    async detectDuplicateTransactions(userId) {
        const transactions = await this.transactionRepo.find({
            where: { userId },
            order: { date: 'DESC' },
            take: 100,
        });
        const duplicates = [];
        for (let i = 0; i < transactions.length; i++) {
            for (let j = i + 1; j < transactions.length; j++) {
                if (this.areSimilar(transactions[i], transactions[j])) {
                    duplicates.push({
                        transaction1: transactions[i],
                        transaction2: transactions[j],
                        similarity: this.calculateSimilarity(transactions[i], transactions[j]),
                        recommendation: 'Possible duplicate',
                    });
                }
            }
        }
        return duplicates;
    }
    async calculateFraudScore(transaction, allTransactions) {
        let score = 0;
        const stats = this.calculateStats(allTransactions);
        const zScore = Math.abs((transaction.amount - stats.mean) / stats.stdDev);
        if (zScore > 3)
            score += 0.3;
        const hour = new Date(transaction.date).getHours();
        if (hour < 6 || hour > 23)
            score += 0.2;
        const sameDay = allTransactions.filter(t => new Date(t.date).toDateString() === new Date(transaction.date).toDateString());
        if (sameDay.length > 10)
            score += 0.2;
        if (transaction.amount % 100 === 0 && transaction.amount > 1000)
            score += 0.1;
        const categoryTransactions = allTransactions.filter(t => t.categoryId === transaction.categoryId);
        const categoryStats = this.calculateStats(categoryTransactions);
        const categoryZScore = Math.abs((transaction.amount - categoryStats.mean) / categoryStats.stdDev);
        if (categoryZScore > 2.5)
            score += 0.2;
        return Math.min(score, 1);
    }
    getFraudReasons(transaction, allTransactions) {
        const reasons = [];
        const stats = this.calculateStats(allTransactions);
        const zScore = Math.abs((transaction.amount - stats.mean) / stats.stdDev);
        if (zScore > 3)
            reasons.push('Unusually high amount');
        const hour = new Date(transaction.date).getHours();
        if (hour < 6 || hour > 23)
            reasons.push('Unusual time of day');
        if (transaction.amount % 100 === 0 && transaction.amount > 1000) {
            reasons.push('Round number (common in fraud)');
        }
        return reasons;
    }
    areSimilar(t1, t2) {
        if (Math.abs(t1.amount - t2.amount) < 0.01) {
            const timeDiff = Math.abs(new Date(t1.date).getTime() - new Date(t2.date).getTime());
            if (timeDiff < 24 * 60 * 60 * 1000) {
                return true;
            }
        }
        return false;
    }
    calculateSimilarity(t1, t2) {
        let similarity = 0;
        const amountDiff = Math.abs(t1.amount - t2.amount);
        similarity += (1 - Math.min(amountDiff / Math.max(t1.amount, t2.amount), 1)) * 0.5;
        const timeDiff = Math.abs(new Date(t1.date).getTime() - new Date(t2.date).getTime());
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        similarity += (1 - Math.min(hoursDiff / 24, 1)) * 0.3;
        if (t1.categoryId === t2.categoryId)
            similarity += 0.2;
        return similarity;
    }
    calculateStats(transactions) {
        const amounts = transactions.map(t => t.amount);
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);
        return { mean, stdDev, variance };
    }
};
exports.AnomalyDetectionService = AnomalyDetectionService;
exports.AnomalyDetectionService = AnomalyDetectionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AnomalyDetectionService);
//# sourceMappingURL=anomaly-detection.service.js.map