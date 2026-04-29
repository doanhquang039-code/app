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
exports.ScheduledTransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const scheduled_transaction_entity_1 = require("../../entities/scheduled-transaction.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
const schedule_1 = require("@nestjs/schedule");
let ScheduledTransactionsService = class ScheduledTransactionsService {
    scheduledRepo;
    transactionRepo;
    constructor(scheduledRepo, transactionRepo) {
        this.scheduledRepo = scheduledRepo;
        this.transactionRepo = transactionRepo;
    }
    async create(userId, data) {
        const nextExecutionDate = this.calculateNextExecution(new Date(data.startDate), data.frequency, data);
        const scheduled = this.scheduledRepo.create({
            userId,
            ...data,
            nextExecutionDate,
            status: 'ACTIVE',
        });
        return await this.scheduledRepo.save(scheduled);
    }
    async findAll(userId) {
        return await this.scheduledRepo.find({
            where: { userId },
            relations: ['category', 'wallet'],
            order: { nextExecutionDate: 'ASC' },
        });
    }
    async findOne(userId, id) {
        const scheduled = await this.scheduledRepo.findOne({
            where: { id, userId },
            relations: ['category', 'wallet'],
        });
        if (!scheduled) {
            throw new common_1.NotFoundException('Scheduled transaction not found');
        }
        return scheduled;
    }
    async update(userId, id, data) {
        const scheduled = await this.findOne(userId, id);
        Object.assign(scheduled, data);
        if (data.frequency || data.startDate) {
            scheduled.nextExecutionDate = this.calculateNextExecution(scheduled.nextExecutionDate, scheduled.frequency, scheduled);
        }
        return await this.scheduledRepo.save(scheduled);
    }
    async pause(userId, id) {
        const scheduled = await this.findOne(userId, id);
        scheduled.status = 'PAUSED';
        return await this.scheduledRepo.save(scheduled);
    }
    async resume(userId, id) {
        const scheduled = await this.findOne(userId, id);
        scheduled.status = 'ACTIVE';
        return await this.scheduledRepo.save(scheduled);
    }
    async remove(userId, id) {
        const scheduled = await this.findOne(userId, id);
        await this.scheduledRepo.remove(scheduled);
    }
    async getUpcoming(userId, days = 30) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);
        return await this.scheduledRepo.find({
            where: {
                userId,
                status: 'ACTIVE',
                nextExecutionDate: (0, typeorm_2.LessThan)(futureDate),
            },
            relations: ['category', 'wallet'],
            order: { nextExecutionDate: 'ASC' },
        });
    }
    async executeNow(userId, id) {
        const scheduled = await this.findOne(userId, id);
        return await this.executeScheduled(scheduled);
    }
    async executeScheduled(scheduled) {
        const transaction = this.transactionRepo.create({
            userId: scheduled.userId,
            type: scheduled.type,
            amount: scheduled.amount,
            categoryId: scheduled.categoryId,
            walletId: scheduled.walletId,
            date: new Date(),
        });
        const savedTransaction = await this.transactionRepo.save(transaction);
        scheduled.executedCount += 1;
        scheduled.lastExecutionDate = new Date();
        scheduled.nextExecutionDate = this.calculateNextExecution(new Date(), scheduled.frequency, scheduled);
        if (scheduled.occurrences && scheduled.executedCount >= scheduled.occurrences) {
            scheduled.status = 'COMPLETED';
        }
        await this.scheduledRepo.save(scheduled);
        return savedTransaction;
    }
    async processScheduledTransactions() {
        console.log('Processing scheduled transactions...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dueTransactions = await this.scheduledRepo.find({
            where: {
                status: 'ACTIVE',
                autoExecute: true,
                nextExecutionDate: (0, typeorm_2.LessThan)(tomorrow),
            },
        });
        for (const scheduled of dueTransactions) {
            try {
                await this.executeScheduled(scheduled);
                console.log(`Executed scheduled transaction ${scheduled.id}`);
            }
            catch (error) {
                console.error(`Failed to execute scheduled transaction ${scheduled.id}:`, error);
                scheduled.executionError = error.message;
                await this.scheduledRepo.save(scheduled);
            }
        }
    }
    calculateNextExecution(currentDate, frequency, data) {
        const nextDate = new Date(currentDate);
        switch (frequency) {
            case 'DAILY':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'WEEKLY':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'BIWEEKLY':
                nextDate.setDate(nextDate.getDate() + 14);
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
        if (data.adjustForWeekends) {
            const dayOfWeek = nextDate.getDay();
            if (dayOfWeek === 0)
                nextDate.setDate(nextDate.getDate() + 1);
            if (dayOfWeek === 6)
                nextDate.setDate(nextDate.getDate() + 2);
        }
        return nextDate;
    }
};
exports.ScheduledTransactionsService = ScheduledTransactionsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledTransactionsService.prototype, "processScheduledTransactions", null);
exports.ScheduledTransactionsService = ScheduledTransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(scheduled_transaction_entity_1.ScheduledTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ScheduledTransactionsService);
//# sourceMappingURL=scheduled-transactions.service.js.map