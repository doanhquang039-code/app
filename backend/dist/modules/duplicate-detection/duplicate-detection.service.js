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
exports.DuplicateDetectionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../../entities/transaction.entity");
let DuplicateDetectionService = class DuplicateDetectionService {
    transactionRepository;
    constructor(transactionRepository) {
        this.transactionRepository = transactionRepository;
    }
    async detectDuplicates(userId, options) {
        const timeDiffMinutes = options?.timeDiffMinutes || 30;
        const amountTolerance = options?.amountTolerance || 0;
        const transactions = await this.transactionRepository.find({
            where: { userId },
            relations: ['category', 'wallet'],
            order: { date: 'DESC' },
        });
        const duplicateGroups = [];
        const processed = new Set();
        for (let i = 0; i < transactions.length; i++) {
            if (processed.has(transactions[i].id))
                continue;
            const group = [transactions[i]];
            processed.add(transactions[i].id);
            for (let j = i + 1; j < transactions.length; j++) {
                if (processed.has(transactions[j].id))
                    continue;
                if (this.isSuspiciousDuplicate(transactions[i], transactions[j], timeDiffMinutes, amountTolerance)) {
                    group.push(transactions[j]);
                    processed.add(transactions[j].id);
                }
            }
            if (group.length > 1) {
                duplicateGroups.push({
                    suspicionLevel: this.calculateSuspicionLevel(group),
                    transactions: group.map((t) => ({
                        id: t.id,
                        amount: t.amount,
                        type: t.type,
                        date: t.date,
                        category: t.category?.name,
                        wallet: t.wallet?.name,
                        note: t.note,
                    })),
                });
            }
        }
        return {
            totalDuplicateGroups: duplicateGroups.length,
            groups: duplicateGroups.sort((a, b) => b.suspicionLevel - a.suspicionLevel),
        };
    }
    async findSimilar(userId, transactionId) {
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId, userId },
            relations: ['category', 'wallet'],
        });
        if (!transaction) {
            return { message: 'Giao dịch không tìm thấy' };
        }
        const allTransactions = await this.transactionRepository.find({
            where: { userId },
            relations: ['category', 'wallet'],
        });
        const similar = allTransactions
            .filter((t) => t.id !== transaction.id)
            .filter((t) => t.type === transaction.type &&
            t.categoryId === transaction.categoryId &&
            this.isSimilarAmount(Number(t.amount), Number(transaction.amount), 0.1) &&
            this.isWithinTimeWindow(new Date(t.date), new Date(transaction.date), 60))
            .map((t) => ({
            id: t.id,
            amount: t.amount,
            type: t.type,
            date: t.date,
            category: t.category?.name,
            wallet: t.wallet?.name,
            note: t.note,
        }));
        return {
            originalTransaction: {
                id: transaction.id,
                amount: transaction.amount,
                type: transaction.type,
                date: transaction.date,
                category: transaction.category?.name,
                wallet: transaction.wallet?.name,
            },
            similarCount: similar.length,
            similarTransactions: similar,
        };
    }
    isSuspiciousDuplicate(t1, t2, timeDiffMinutes, amountTolerance) {
        if (t1.type !== t2.type ||
            t1.categoryId !== t2.categoryId ||
            t1.walletId !== t2.walletId) {
            return false;
        }
        if (!this.isSimilarAmount(Number(t1.amount), Number(t2.amount), amountTolerance)) {
            return false;
        }
        return this.isWithinTimeWindow(new Date(t1.date), new Date(t2.date), timeDiffMinutes);
    }
    isSimilarAmount(amount1, amount2, tolerance) {
        const diff = Math.abs(amount1 - amount2);
        const maxDiff = amount1 * tolerance;
        return diff <= maxDiff;
    }
    isWithinTimeWindow(date1, date2, minutes) {
        const diffMs = Math.abs(date1.getTime() - date2.getTime());
        const diffMinutes = diffMs / (1000 * 60);
        return diffMinutes <= minutes;
    }
    calculateSuspicionLevel(transactions) {
        let score = 0;
        score += Math.min(transactions.length * 20, 40);
        const amounts = transactions.map((t) => Number(t.amount));
        const allExact = amounts.every((a) => a === amounts[0]);
        if (allExact)
            score += 30;
        const times = transactions.map((t) => new Date(t.date).getTime());
        const maxTimeDiff = Math.max(...times) - Math.min(...times);
        const maxTimeDiffMinutes = maxTimeDiff / (1000 * 60);
        if (maxTimeDiffMinutes < 5)
            score += 30;
        else if (maxTimeDiffMinutes < 30)
            score += 15;
        return Math.min(score, 100);
    }
};
exports.DuplicateDetectionService = DuplicateDetectionService;
exports.DuplicateDetectionService = DuplicateDetectionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DuplicateDetectionService);
//# sourceMappingURL=duplicate-detection.service.js.map