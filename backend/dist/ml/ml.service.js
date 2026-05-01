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
exports.MLService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../entities/transaction.entity");
let MLService = class MLService {
    transactionRepo;
    constructor(transactionRepo) {
        this.transactionRepo = transactionRepo;
    }
    async predictNextMonthSpending(userId) {
        const transactions = await this.transactionRepo.find({
            where: { userId, type: 'expense' },
            order: { date: 'DESC' },
            take: 180,
        });
        if (transactions.length < 30) {
            return 0;
        }
        const monthlySpending = this.groupByMonth(transactions);
        const { slope, intercept } = this.linearRegression(monthlySpending);
        const nextMonth = monthlySpending.length;
        const prediction = slope * nextMonth + intercept;
        return Math.max(0, prediction);
    }
    async analyzeSpendingTrend(userId, months = 12) {
        const transactions = await this.transactionRepo.find({
            where: { userId, type: 'expense' },
            order: { date: 'DESC' },
            take: months * 30,
        });
        const monthlyData = this.groupByMonth(transactions);
        return {
            trend: this.calculateTrend(monthlyData),
            seasonality: this.detectSeasonality(monthlyData),
            volatility: this.calculateVolatility(monthlyData),
            forecast: this.forecastNextMonths(monthlyData, 3),
        };
    }
    async identifySpendingPatterns(userId) {
        const transactions = await this.transactionRepo.find({
            where: { userId },
            order: { date: 'DESC' },
            take: 365,
        });
        const patterns = this.clusterTransactions(transactions);
        return patterns.map(pattern => ({
            category: pattern.category,
            avgAmount: pattern.avgAmount,
            frequency: pattern.frequency,
            timeOfDay: pattern.timeOfDay,
            dayOfWeek: pattern.dayOfWeek,
            confidence: pattern.confidence,
        }));
    }
    async detectAnomalies(userId) {
        const transactions = await this.transactionRepo.find({
            where: { userId },
            order: { date: 'DESC' },
            take: 90,
        });
        const anomalies = [];
        const stats = this.calculateStatistics(transactions);
        for (const transaction of transactions) {
            const zScore = (transaction.amount - stats.mean) / stats.stdDev;
            if (Math.abs(zScore) > 2.5) {
                anomalies.push({
                    transaction,
                    zScore,
                    severity: Math.abs(zScore) > 3 ? 'high' : 'medium',
                    reason: `Amount is ${Math.abs(zScore).toFixed(1)} standard deviations from average`,
                });
            }
        }
        return anomalies;
    }
    groupByMonth(transactions) {
        const monthlyMap = new Map();
        transactions.forEach(t => {
            const month = new Date(t.date).toISOString().slice(0, 7);
            monthlyMap.set(month, (monthlyMap.get(month) || 0) + t.amount);
        });
        return Array.from(monthlyMap.values()).reverse();
    }
    linearRegression(data) {
        const n = data.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = data;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        return { slope, intercept };
    }
    calculateTrend(data) {
        if (data.length < 2)
            return 'insufficient_data';
        const { slope } = this.linearRegression(data);
        if (slope > 0.05)
            return 'increasing';
        if (slope < -0.05)
            return 'decreasing';
        return 'stable';
    }
    detectSeasonality(data) {
        if (data.length < 12)
            return null;
        const quarters = [0, 0, 0, 0];
        data.forEach((value, index) => {
            quarters[index % 4] += value;
        });
        const avgQuarter = quarters.reduce((a, b) => a + b) / 4;
        const seasonalityIndex = quarters.map(q => (q / avgQuarter - 1) * 100);
        return {
            detected: Math.max(...seasonalityIndex.map(Math.abs)) > 20,
            pattern: seasonalityIndex,
        };
    }
    calculateVolatility(data) {
        if (data.length < 2)
            return 0;
        const mean = data.reduce((a, b) => a + b) / data.length;
        const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance);
        return (stdDev / mean) * 100;
    }
    forecastNextMonths(data, months) {
        const { slope, intercept } = this.linearRegression(data);
        const forecast = [];
        for (let i = 1; i <= months; i++) {
            const predicted = slope * (data.length + i - 1) + intercept;
            forecast.push(Math.max(0, predicted));
        }
        return forecast;
    }
    clusterTransactions(transactions) {
        const categoryMap = new Map();
        transactions.forEach(t => {
            const category = t.categoryId?.toString() || 'uncategorized';
            if (!categoryMap.has(category)) {
                categoryMap.set(category, {
                    category,
                    amounts: [],
                    hours: [],
                    days: [],
                });
            }
            const data = categoryMap.get(category);
            data.amounts.push(t.amount);
            data.hours.push(new Date(t.date).getHours());
            data.days.push(new Date(t.date).getDay());
        });
        return Array.from(categoryMap.values()).map(data => ({
            category: data.category,
            avgAmount: data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length,
            frequency: data.amounts.length,
            timeOfDay: this.getMostCommon(data.hours),
            dayOfWeek: this.getMostCommon(data.days),
            confidence: Math.min(data.amounts.length / 10, 1),
        }));
    }
    calculateStatistics(transactions) {
        const amounts = transactions.map(t => t.amount);
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const variance = amounts.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);
        return { mean, stdDev, variance };
    }
    getMostCommon(arr) {
        const counts = new Map();
        arr.forEach(val => counts.set(val, (counts.get(val) || 0) + 1));
        let maxCount = 0;
        let mostCommon = arr[0];
        counts.forEach((count, val) => {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = val;
            }
        });
        return mostCommon;
    }
};
exports.MLService = MLService;
exports.MLService = MLService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MLService);
//# sourceMappingURL=ml.service.js.map