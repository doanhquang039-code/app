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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("../../entities/subscription.entity");
const subscription_payment_entity_1 = require("../../entities/subscription-payment.entity");
const schedule_1 = require("@nestjs/schedule");
let SubscriptionsService = class SubscriptionsService {
    subscriptionRepo;
    paymentRepo;
    constructor(subscriptionRepo, paymentRepo) {
        this.subscriptionRepo = subscriptionRepo;
        this.paymentRepo = paymentRepo;
    }
    async createSubscription(userId, data) {
        const nextBillingDate = this.calculateNextBillingDate(data.startDate, data.billingCycle);
        const subscription = this.subscriptionRepo.create({
            userId,
            ...data,
            nextBillingDate,
            status: 'ACTIVE',
            totalPaid: 0,
            paymentCount: 0,
        });
        const savedSubscription = await this.subscriptionRepo.save(subscription);
        return savedSubscription;
    }
    async getUserSubscriptions(userId, status) {
        const where = { userId };
        if (status) {
            where.status = status;
        }
        return await this.subscriptionRepo.find({
            where,
            relations: ['category'],
            order: { nextBillingDate: 'ASC' },
        });
    }
    async getSubscription(userId, subscriptionId) {
        const subscription = await this.subscriptionRepo.findOne({
            where: { id: subscriptionId, userId },
            relations: ['category'],
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found');
        }
        return subscription;
    }
    async updateSubscription(userId, subscriptionId, data) {
        const subscription = await this.getSubscription(userId, subscriptionId);
        Object.assign(subscription, data);
        if (data.billingCycle) {
            subscription.nextBillingDate = this.calculateNextBillingDate(subscription.nextBillingDate, data.billingCycle);
        }
        return await this.subscriptionRepo.save(subscription);
    }
    async cancelSubscription(userId, subscriptionId) {
        const subscription = await this.getSubscription(userId, subscriptionId);
        subscription.status = 'CANCELLED';
        subscription.autoRenew = false;
        return await this.subscriptionRepo.save(subscription);
    }
    async pauseSubscription(userId, subscriptionId) {
        const subscription = await this.getSubscription(userId, subscriptionId);
        subscription.status = 'PAUSED';
        return await this.subscriptionRepo.save(subscription);
    }
    async resumeSubscription(userId, subscriptionId) {
        const subscription = await this.getSubscription(userId, subscriptionId);
        subscription.status = 'ACTIVE';
        return await this.subscriptionRepo.save(subscription);
    }
    async deleteSubscription(userId, subscriptionId) {
        const subscription = await this.getSubscription(userId, subscriptionId);
        await this.subscriptionRepo.remove(subscription);
    }
    async getSubscriptionStats(userId) {
        const subscriptions = await this.getUserSubscriptions(userId);
        const active = subscriptions.filter(s => s.status === 'ACTIVE');
        const paused = subscriptions.filter(s => s.status === 'PAUSED');
        const cancelled = subscriptions.filter(s => s.status === 'CANCELLED');
        const monthlyCost = active.reduce((sum, sub) => {
            const amount = parseFloat(sub.amount.toString());
            switch (sub.billingCycle) {
                case 'DAILY':
                    return sum + amount * 30;
                case 'WEEKLY':
                    return sum + amount * 4;
                case 'MONTHLY':
                    return sum + amount;
                case 'QUARTERLY':
                    return sum + amount / 3;
                case 'YEARLY':
                    return sum + amount / 12;
                default:
                    return sum;
            }
        }, 0);
        const yearlyCost = monthlyCost * 12;
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const upcomingRenewals = active.filter(s => new Date(s.nextBillingDate) <= thirtyDaysFromNow);
        const byCategory = this.groupByCategory(active);
        return {
            total: subscriptions.length,
            active: active.length,
            paused: paused.length,
            cancelled: cancelled.length,
            monthlyCost: Math.round(monthlyCost),
            yearlyCost: Math.round(yearlyCost),
            upcomingRenewals: upcomingRenewals.length,
            byCategory,
            topSubscriptions: this.getTopSubscriptions(active, 5),
        };
    }
    groupByCategory(subscriptions) {
        const groups = subscriptions.reduce((acc, sub) => {
            const category = sub.category?.name || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = { category, count: 0, totalCost: 0 };
            }
            acc[category].count += 1;
            acc[category].totalCost += parseFloat(sub.amount.toString());
            return acc;
        }, {});
        return Object.values(groups).sort((a, b) => b.totalCost - a.totalCost);
    }
    getTopSubscriptions(subscriptions, limit) {
        return subscriptions
            .sort((a, b) => parseFloat(b.amount.toString()) - parseFloat(a.amount.toString()))
            .slice(0, limit)
            .map(s => ({
            id: s.id,
            name: s.name,
            amount: s.amount,
            billingCycle: s.billingCycle,
            provider: s.provider,
        }));
    }
    async getUpcomingRenewals(userId, days = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return await this.subscriptionRepo.find({
            where: {
                userId,
                status: 'ACTIVE',
                nextBillingDate: (0, typeorm_2.LessThan)(futureDate),
            },
            relations: ['category'],
            order: { nextBillingDate: 'ASC' },
        });
    }
    async recordPayment(userId, subscriptionId, data) {
        const subscription = await this.getSubscription(userId, subscriptionId);
        const payment = this.paymentRepo.create({
            subscriptionId,
            amount: data.amount || subscription.amount,
            paymentDate: data.paymentDate || new Date(),
            dueDate: subscription.nextBillingDate,
            status: 'PAID',
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            transactionId: data.transactionId,
            isAutomatic: data.isAutomatic || false,
        });
        await this.paymentRepo.save(payment);
        subscription.totalPaid += parseFloat(payment.amount.toString());
        subscription.paymentCount += 1;
        subscription.nextBillingDate = this.calculateNextBillingDate(subscription.nextBillingDate, subscription.billingCycle);
        subscription.reminderSent = false;
        await this.subscriptionRepo.save(subscription);
        return payment;
    }
    async getPaymentHistory(userId, subscriptionId) {
        await this.getSubscription(userId, subscriptionId);
        return await this.paymentRepo.find({
            where: { subscriptionId },
            relations: ['transaction'],
            order: { paymentDate: 'DESC' },
        });
    }
    calculateNextBillingDate(currentDate, billingCycle) {
        const nextDate = new Date(currentDate);
        switch (billingCycle) {
            case 'DAILY':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'WEEKLY':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'MONTHLY':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'QUARTERLY':
                nextDate.setMonth(nextDate.getMonth() + 3);
                break;
            case 'YEARLY':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }
        return nextDate;
    }
    async processRenewals() {
        console.log('Processing subscription renewals...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dueSubscriptions = await this.subscriptionRepo.find({
            where: {
                status: 'ACTIVE',
                autoRenew: true,
                nextBillingDate: (0, typeorm_2.LessThan)(tomorrow),
            },
        });
        for (const subscription of dueSubscriptions) {
            try {
                const payment = this.paymentRepo.create({
                    subscriptionId: subscription.id,
                    amount: subscription.amount,
                    paymentDate: new Date(),
                    dueDate: subscription.nextBillingDate,
                    status: 'PENDING',
                    isAutomatic: true,
                });
                await this.paymentRepo.save(payment);
                console.log(`Created pending payment for subscription ${subscription.id}`);
            }
            catch (error) {
                console.error(`Failed to process renewal for subscription ${subscription.id}:`, error);
            }
        }
    }
    async sendReminders() {
        console.log('Sending subscription reminders...');
        const subscriptions = await this.subscriptionRepo.find({
            where: {
                status: 'ACTIVE',
                reminderEnabled: true,
                reminderSent: false,
            },
        });
        for (const subscription of subscriptions) {
            const daysUntilBilling = Math.ceil((new Date(subscription.nextBillingDate).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24));
            if (daysUntilBilling <= subscription.reminderDaysBefore) {
                subscription.reminderSent = true;
                await this.subscriptionRepo.save(subscription);
                console.log(`Sent reminder for subscription ${subscription.id}`);
            }
        }
    }
};
exports.SubscriptionsService = SubscriptionsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionsService.prototype, "processRenewals", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionsService.prototype, "sendReminders", null);
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(subscription_payment_entity_1.SubscriptionPayment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map