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
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
let QueueService = class QueueService {
    emailQueue;
    notificationQueue;
    reportQueue;
    analyticsQueue;
    constructor(emailQueue, notificationQueue, reportQueue, analyticsQueue) {
        this.emailQueue = emailQueue;
        this.notificationQueue = notificationQueue;
        this.reportQueue = reportQueue;
        this.analyticsQueue = analyticsQueue;
    }
    async sendWelcomeEmail(userId, email) {
        await this.emailQueue.add('welcome', { userId, email }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
        });
    }
    async sendBudgetAlert(userId, budgetData) {
        await this.emailQueue.add('budget-alert', { userId, budgetData }, {
            priority: 1,
            attempts: 3,
        });
    }
    async sendMonthlyReport(userId) {
        await this.emailQueue.add('monthly-report', { userId }, {
            attempts: 2,
        });
    }
    async sendPushNotification(userId, notification) {
        await this.notificationQueue.add('push', { userId, notification }, {
            attempts: 3,
        });
    }
    async sendInAppNotification(userId, notification) {
        await this.notificationQueue.add('in-app', { userId, notification });
    }
    async generateExcelReport(userId, params) {
        await this.reportQueue.add('excel', { userId, params }, {
            timeout: 60000,
            attempts: 2,
        });
    }
    async generatePDFReport(userId, params) {
        await this.reportQueue.add('pdf', { userId, params }, {
            timeout: 60000,
            attempts: 2,
        });
    }
    async calculateUserAnalytics(userId) {
        await this.analyticsQueue.add('user-analytics', { userId }, {
            attempts: 2,
        });
    }
    async calculateGlobalAnalytics() {
        await this.analyticsQueue.add('global-analytics', {}, {
            repeat: {
                cron: '0 0 * * *',
            },
        });
    }
    async updateLeaderboard() {
        await this.analyticsQueue.add('leaderboard', {}, {
            repeat: {
                cron: '0 * * * *',
            },
        });
    }
    async getJobCounts(queueName) {
        const queue = this.getQueue(queueName);
        return await queue.getJobCounts();
    }
    async getActiveJobs(queueName) {
        const queue = this.getQueue(queueName);
        return await queue.getActive();
    }
    async getFailedJobs(queueName) {
        const queue = this.getQueue(queueName);
        return await queue.getFailed();
    }
    async retryFailedJobs(queueName) {
        const queue = this.getQueue(queueName);
        const failed = await queue.getFailed();
        for (const job of failed) {
            await job.retry();
        }
    }
    async cleanQueue(queueName, grace = 5000) {
        const queue = this.getQueue(queueName);
        await queue.clean(grace, 'completed');
        await queue.clean(grace, 'failed');
    }
    getQueue(name) {
        switch (name) {
            case 'email':
                return this.emailQueue;
            case 'notification':
                return this.notificationQueue;
            case 'report':
                return this.reportQueue;
            case 'analytics':
                return this.analyticsQueue;
            default:
                throw new Error(`Queue ${name} not found`);
        }
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bull_1.InjectQueue)('email')),
    __param(1, (0, bull_1.InjectQueue)('notification')),
    __param(2, (0, bull_1.InjectQueue)('report')),
    __param(3, (0, bull_1.InjectQueue)('analytics')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], QueueService);
//# sourceMappingURL=queue.service.js.map