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
exports.AIAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const spending_pattern_entity_1 = require("../../entities/spending-pattern.entity");
const ai_prediction_entity_1 = require("../../entities/ai-prediction.entity");
const spending_anomaly_entity_1 = require("../../entities/spending-anomaly.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
let AIAnalysisService = class AIAnalysisService {
    patternRepo;
    predictionRepo;
    anomalyRepo;
    transactionRepo;
    constructor(patternRepo, predictionRepo, anomalyRepo, transactionRepo) {
        this.patternRepo = patternRepo;
        this.predictionRepo = predictionRepo;
        this.anomalyRepo = anomalyRepo;
        this.transactionRepo = transactionRepo;
    }
    async analyzeSpendingPatterns(userId, months = 6) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);
        const transactions = await this.transactionRepo.find({
            where: {
                userId,
                date: (0, typeorm_2.MoreThan)(startDate),
                type: 'EXPENSE',
            },
            relations: ['category'],
            order: { date: 'ASC' },
        });
        const patterns = [];
        const categoryGroups = this.groupByCategory(transactions);
        for (const [category, txns] of Object.entries(categoryGroups)) {
            const recurringPattern = this.detectRecurringPattern(txns);
            if (recurringPattern) {
                const pattern = this.patternRepo.create({
                    userId,
                    patternType: 'RECURRING',
                    category,
                    ...recurringPattern,
                    periodStart: startDate,
                    periodEnd: new Date(),
                    isActive: true,
                });
                const savedPattern = await this.patternRepo.save(pattern);
                patterns.push(savedPattern);
            }
            const seasonalPattern = this.detectSeasonalPattern(txns);
            if (seasonalPattern) {
                const pattern = this.patternRepo.create({
                    userId,
                    patternType: 'SEASONAL',
                    category,
                    ...seasonalPattern,
                    periodStart: startDate,
                    periodEnd: new Date(),
                    isActive: true,
                });
                const savedPattern = await this.patternRepo.save(pattern);
                patterns.push(savedPattern);
            }
            const trendPattern = this.detectTrend(txns);
            if (trendPattern) {
                const pattern = this.patternRepo.create({
                    userId,
                    patternType: 'TREND',
                    category,
                    ...trendPattern,
                    periodStart: startDate,
                    periodEnd: new Date(),
                    isActive: true,
                });
                const savedPattern = await this.patternRepo.save(pattern);
                patterns.push(savedPattern);
            }
        }
        return patterns;
    }
    groupByCategory(transactions) {
        return transactions.reduce((groups, txn) => {
            const category = txn.category?.name || 'Uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(txn);
            return groups;
        }, {});
    }
    detectRecurringPattern(transactions) {
        if (transactions.length < 3)
            return null;
        const amounts = transactions.map(t => parseFloat(t.amount.toString()));
        const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const minAmount = Math.min(...amounts);
        const maxAmount = Math.max(...amounts);
        const monthSpan = this.getMonthSpan(transactions);
        const frequency = Math.round(transactions.length / monthSpan);
        const variance = (maxAmount - minAmount) / avgAmount;
        if (variance > 0.3)
            return null;
        const timePattern = this.detectTimePattern(transactions);
        const insights = {
            message: `Chi tiêu định kỳ ${frequency} lần/tháng`,
            averageAmount: avgAmount,
            consistency: Math.round((1 - variance) * 100),
            nextExpectedDate: this.predictNextDate(transactions, timePattern),
        };
        return {
            averageAmount: avgAmount,
            minAmount,
            maxAmount,
            frequency,
            timePattern: timePattern.pattern,
            dayOfWeek: timePattern.dayOfWeek,
            dayOfMonth: timePattern.dayOfMonth,
            confidence: Math.min(95, 60 + (transactions.length * 5)),
            insights: JSON.stringify(insights),
            occurrences: transactions.length,
        };
    }
    detectSeasonalPattern(transactions) {
        if (transactions.length < 6)
            return null;
        const monthlyData = this.groupByMonth(transactions);
        const months = Object.keys(monthlyData);
        if (months.length < 3)
            return null;
        const monthlyAverages = months.map(month => {
            const txns = monthlyData[month];
            const total = txns.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
            return total / txns.length;
        });
        const avgOfAverages = monthlyAverages.reduce((a, b) => a + b, 0) / monthlyAverages.length;
        const maxAvg = Math.max(...monthlyAverages);
        const minAvg = Math.min(...monthlyAverages);
        const seasonalVariance = (maxAvg - minAvg) / avgOfAverages;
        if (seasonalVariance < 0.3)
            return null;
        const insights = {
            message: 'Phát hiện mẫu chi tiêu theo mùa',
            peakMonth: this.findPeakMonth(monthlyData),
            lowMonth: this.findLowMonth(monthlyData),
            seasonalVariance: Math.round(seasonalVariance * 100),
        };
        return {
            averageAmount: avgOfAverages,
            minAmount: minAvg,
            maxAmount: maxAvg,
            frequency: Math.round(transactions.length / months.length),
            timePattern: 'SEASONAL',
            confidence: Math.min(90, 50 + (months.length * 10)),
            insights: JSON.stringify(insights),
            occurrences: transactions.length,
        };
    }
    detectTrend(transactions) {
        if (transactions.length < 4)
            return null;
        const amounts = transactions.map(t => parseFloat(t.amount.toString()));
        const n = amounts.length;
        const sumX = (n * (n + 1)) / 2;
        const sumY = amounts.reduce((a, b) => a + b, 0);
        const sumXY = amounts.reduce((sum, y, i) => sum + (i + 1) * y, 0);
        const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const avgAmount = sumY / n;
        const trendPercentage = (slope / avgAmount) * 100;
        if (Math.abs(trendPercentage) < 5)
            return null;
        const trendDirection = slope > 0 ? 'INCREASING' : 'DECREASING';
        const insights = {
            message: `Chi tiêu ${trendDirection === 'INCREASING' ? 'tăng' : 'giảm'} dần`,
            trendPercentage: Math.round(Math.abs(trendPercentage)),
            direction: trendDirection,
            projection: this.projectTrend(amounts, slope, 3),
        };
        return {
            averageAmount: avgAmount,
            minAmount: Math.min(...amounts),
            maxAmount: Math.max(...amounts),
            frequency: Math.round(transactions.length / this.getMonthSpan(transactions)),
            timePattern: 'TREND',
            confidence: Math.min(85, 40 + (transactions.length * 8)),
            insights: JSON.stringify(insights),
            occurrences: transactions.length,
        };
    }
    detectTimePattern(transactions) {
        const dates = transactions.map(t => new Date(t.date));
        const daysOfWeek = dates.map(d => d.getDay());
        const mostCommonDay = this.findMostCommon(daysOfWeek);
        const dayFrequency = daysOfWeek.filter(d => d === mostCommonDay).length / daysOfWeek.length;
        if (dayFrequency > 0.6) {
            return { pattern: 'WEEKLY', dayOfWeek: mostCommonDay, dayOfMonth: null };
        }
        const daysOfMonth = dates.map(d => d.getDate());
        const mostCommonDate = this.findMostCommon(daysOfMonth);
        const dateFrequency = daysOfMonth.filter(d => Math.abs(d - mostCommonDate) <= 2).length / daysOfMonth.length;
        if (dateFrequency > 0.6) {
            return { pattern: 'MONTHLY', dayOfWeek: null, dayOfMonth: mostCommonDate };
        }
        return { pattern: 'IRREGULAR', dayOfWeek: null, dayOfMonth: null };
    }
    findMostCommon(arr) {
        const counts = arr.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
        return Number(Object.keys(counts).reduce((a, b) => counts[Number(a)] > counts[Number(b)] ? a : b));
    }
    getMonthSpan(transactions) {
        if (transactions.length === 0)
            return 1;
        const dates = transactions.map(t => new Date(t.date));
        const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
        const latest = new Date(Math.max(...dates.map(d => d.getTime())));
        return Math.max(1, Math.round((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    }
    groupByMonth(transactions) {
        return transactions.reduce((groups, txn) => {
            const date = new Date(txn.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!groups[monthKey]) {
                groups[monthKey] = [];
            }
            groups[monthKey].push(txn);
            return groups;
        }, {});
    }
    findPeakMonth(monthlyData) {
        let maxTotal = 0;
        let peakMonth = '';
        for (const [month, txns] of Object.entries(monthlyData)) {
            const total = txns.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
            if (total > maxTotal) {
                maxTotal = total;
                peakMonth = month;
            }
        }
        return peakMonth;
    }
    findLowMonth(monthlyData) {
        let minTotal = Infinity;
        let lowMonth = '';
        for (const [month, txns] of Object.entries(monthlyData)) {
            const total = txns.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
            if (total < minTotal) {
                minTotal = total;
                lowMonth = month;
            }
        }
        return lowMonth;
    }
    predictNextDate(transactions, timePattern) {
        const lastDate = new Date(Math.max(...transactions.map(t => new Date(t.date).getTime())));
        const nextDate = new Date(lastDate);
        if (timePattern.pattern === 'WEEKLY') {
            nextDate.setDate(nextDate.getDate() + 7);
        }
        else if (timePattern.pattern === 'MONTHLY') {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }
        else {
            nextDate.setDate(nextDate.getDate() + 30);
        }
        return nextDate;
    }
    projectTrend(amounts, slope, months) {
        const lastAmount = amounts[amounts.length - 1];
        const projection = [];
        for (let i = 1; i <= months; i++) {
            projection.push(Math.max(0, lastAmount + (slope * i)));
        }
        return projection;
    }
    async detectAnomalies(userId) {
        const recentTransactions = await this.transactionRepo.find({
            where: {
                userId,
                type: 'EXPENSE',
                date: (0, typeorm_2.MoreThan)(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
            },
            relations: ['category'],
            order: { date: 'DESC' },
        });
        const historicalTransactions = await this.transactionRepo.find({
            where: {
                userId,
                type: 'EXPENSE',
                date: (0, typeorm_2.Between)(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
            },
            relations: ['category'],
        });
        const anomalies = [];
        for (const txn of recentTransactions) {
            const category = txn.category?.name || 'Uncategorized';
            const historicalInCategory = historicalTransactions.filter(t => (t.category?.name || 'Uncategorized') === category);
            if (historicalInCategory.length < 3)
                continue;
            const amounts = historicalInCategory.map(t => parseFloat(t.amount.toString()));
            const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            const stdDev = this.calculateStdDev(amounts, avgAmount);
            const txnAmount = parseFloat(txn.amount.toString());
            const deviation = Math.abs(txnAmount - avgAmount);
            const deviationPercentage = (deviation / avgAmount) * 100;
            if (deviation > 2 * stdDev || deviationPercentage > 50) {
                const severity = this.calculateSeverity(deviationPercentage);
                const analysis = {
                    historicalAverage: avgAmount,
                    standardDeviation: stdDev,
                    deviationInStdDev: deviation / stdDev,
                    comparisonPeriod: '6 months',
                    recommendation: this.getAnomalyRecommendation(severity, category, txnAmount, avgAmount),
                };
                const anomaly = this.anomalyRepo.create({
                    userId,
                    transactionId: txn.id,
                    anomalyType: 'UNUSUAL_AMOUNT',
                    severity,
                    amount: txnAmount,
                    expectedAmount: avgAmount,
                    deviationPercentage,
                    category,
                    description: `Chi tiêu ${category} cao hơn ${Math.round(deviationPercentage)}% so với trung bình`,
                    analysis: JSON.stringify(analysis),
                    status: 'UNREVIEWED',
                    isNotified: false,
                });
                anomalies.push(await this.anomalyRepo.save(anomaly));
            }
        }
        return anomalies;
    }
    calculateStdDev(values, mean) {
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(avgSquaredDiff);
    }
    calculateSeverity(deviationPercentage) {
        if (deviationPercentage > 200)
            return 'CRITICAL';
        if (deviationPercentage > 100)
            return 'HIGH';
        if (deviationPercentage > 50)
            return 'MEDIUM';
        return 'LOW';
    }
    getAnomalyRecommendation(severity, category, amount, avgAmount) {
        if (severity === 'CRITICAL') {
            return `Chi tiêu ${category} cao bất thường. Kiểm tra lại giao dịch và xem xét điều chỉnh ngân sách.`;
        }
        else if (severity === 'HIGH') {
            return `Chi tiêu ${category} cao hơn bình thường. Cân nhắc giảm chi tiêu trong thời gian tới.`;
        }
        else {
            return `Chi tiêu ${category} hơi cao. Theo dõi để đảm bảo không vượt ngân sách.`;
        }
    }
    async generatePredictions(userId) {
        const patterns = await this.patternRepo.find({
            where: { userId, isActive: true },
        });
        const predictions = [];
        for (const pattern of patterns) {
            const insights = JSON.parse(pattern.insights);
            const targetDate = new Date();
            targetDate.setMonth(targetDate.getMonth() + 1);
            let predictedAmount = pattern.averageAmount;
            let confidence = pattern.confidence;
            if (pattern.patternType === 'TREND') {
                const trendData = insights.projection;
                if (trendData && trendData.length > 0) {
                    predictedAmount = trendData[0];
                }
            }
            const factors = {
                historicalAverage: pattern.averageAmount,
                frequency: pattern.frequency,
                patternType: pattern.patternType,
                recentTrend: insights.direction || 'STABLE',
            };
            const recommendations = this.generateRecommendations(pattern, predictedAmount);
            const prediction = this.predictionRepo.create({
                userId,
                predictionType: 'SPENDING',
                category: pattern.category,
                targetDate,
                predictedAmount,
                confidence,
                factors: JSON.stringify(factors),
                recommendations: JSON.stringify(recommendations),
                status: 'PENDING',
                isNotified: false,
            });
            predictions.push(await this.predictionRepo.save(prediction));
        }
        return predictions;
    }
    generateRecommendations(pattern, predictedAmount) {
        const recommendations = [];
        if (pattern.patternType === 'TREND') {
            const insights = JSON.parse(pattern.insights);
            if (insights.direction === 'INCREASING') {
                recommendations.push({
                    type: 'WARNING',
                    message: `Chi tiêu ${pattern.category} đang tăng dần. Cân nhắc đặt giới hạn ngân sách.`,
                    priority: 'HIGH',
                });
            }
        }
        if (pattern.patternType === 'RECURRING') {
            recommendations.push({
                type: 'INFO',
                message: `Dự kiến chi tiêu ${pattern.category}: ${Math.round(predictedAmount).toLocaleString()}đ`,
                priority: 'MEDIUM',
            });
        }
        return recommendations;
    }
    async getUserPatterns(userId) {
        return await this.patternRepo.find({
            where: { userId, isActive: true },
            order: { confidence: 'DESC' },
        });
    }
    async getUserAnomalies(userId, status) {
        const where = { userId };
        if (status) {
            where.status = status;
        }
        return await this.anomalyRepo.find({
            where,
            relations: ['transaction'],
            order: { detectedAt: 'DESC' },
            take: 50,
        });
    }
    async getUserPredictions(userId) {
        return await this.predictionRepo.find({
            where: { userId, status: 'PENDING' },
            order: { targetDate: 'ASC' },
        });
    }
    async updateAnomalyStatus(userId, anomalyId, status, note) {
        const anomaly = await this.anomalyRepo.findOne({
            where: { id: anomalyId, userId },
        });
        if (!anomaly) {
            throw new Error('Anomaly not found');
        }
        anomaly.status = status;
        anomaly.reviewedAt = new Date();
        if (note) {
            anomaly.userNote = note;
        }
        return await this.anomalyRepo.save(anomaly);
    }
};
exports.AIAnalysisService = AIAnalysisService;
exports.AIAnalysisService = AIAnalysisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(spending_pattern_entity_1.SpendingPattern)),
    __param(1, (0, typeorm_1.InjectRepository)(ai_prediction_entity_1.AIPrediction)),
    __param(2, (0, typeorm_1.InjectRepository)(spending_anomaly_entity_1.SpendingAnomaly)),
    __param(3, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AIAnalysisService);
//# sourceMappingURL=ai-analysis.service.js.map