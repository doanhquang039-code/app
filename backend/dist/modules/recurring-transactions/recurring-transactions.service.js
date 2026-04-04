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
exports.RecurringTransactionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const recurring_transaction_entity_1 = require("../../entities/recurring-transaction.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
const wallet_entity_1 = require("../../entities/wallet.entity");
const schedule_1 = require("@nestjs/schedule");
let RecurringTransactionsService = class RecurringTransactionsService {
    recurringRepository;
    transactionRepository;
    walletRepository;
    constructor(recurringRepository, transactionRepository, walletRepository) {
        this.recurringRepository = recurringRepository;
        this.transactionRepository = transactionRepository;
        this.walletRepository = walletRepository;
    }
    async create(userId, dto) {
        if (dto.amount <= 0) {
            throw new common_1.BadRequestException('Số tiền phải lớn hơn 0');
        }
        const startDate = new Date(dto.startDate);
        if (isNaN(startDate.getTime())) {
            throw new common_1.BadRequestException('Ngày bắt đầu không hợp lệ');
        }
        const nextExecutionDate = this.calculateNextExecution(startDate, dto.frequency, dto.frequencyDay);
        const recurring = this.recurringRepository.create({
            userId,
            walletId: dto.walletId,
            categoryId: dto.categoryId,
            amount: dto.amount,
            type: dto.type,
            note: dto.note,
            frequency: dto.frequency,
            frequencyDay: dto.frequencyDay,
            startDate,
            endDate: dto.endDate ? new Date(dto.endDate) : null,
            nextExecutionDate,
            isActive: true,
        });
        return await this.recurringRepository.save(recurring);
    }
    async findAll(userId, query) {
        const qb = this.recurringRepository
            .createQueryBuilder('r')
            .leftJoinAndSelect('r.category', 'category')
            .leftJoinAndSelect('r.wallet', 'wallet')
            .where('r.userId = :userId', { userId })
            .orderBy('r.nextExecutionDate', 'ASC');
        if (query.frequency) {
            qb.andWhere('r.frequency = :frequency', { frequency: query.frequency });
        }
        if (query.isActive) {
            qb.andWhere('r.isActive = :isActive', {
                isActive: query.isActive === 'true',
            });
        }
        return await qb.getMany();
    }
    async findOne(userId, id) {
        const recurring = await this.recurringRepository.findOne({
            where: { id, userId },
            relations: ['category', 'wallet'],
        });
        if (!recurring) {
            throw new common_1.NotFoundException('Không tìm thấy giao dịch định kỳ');
        }
        return recurring;
    }
    async update(userId, id, dto) {
        const recurring = await this.findOne(userId, id);
        if (dto.amount && dto.amount <= 0) {
            throw new common_1.BadRequestException('Số tiền phải lớn hơn 0');
        }
        if (dto.frequency ||
            dto.frequencyDay ||
            dto.startDate) {
            recurring.nextExecutionDate = this.calculateNextExecution(dto.startDate || recurring.startDate, dto.frequency || recurring.frequency, dto.frequencyDay || recurring.frequencyDay);
        }
        if (dto.walletId)
            recurring.walletId = dto.walletId;
        if (dto.categoryId)
            recurring.categoryId = dto.categoryId;
        if (dto.amount)
            recurring.amount = dto.amount;
        if (dto.type)
            recurring.type = dto.type;
        if (dto.note)
            recurring.note = dto.note;
        if (dto.frequency)
            recurring.frequency = dto.frequency;
        if (dto.frequencyDay)
            recurring.frequencyDay = dto.frequencyDay;
        if (dto.startDate)
            recurring.startDate = new Date(dto.startDate);
        if (dto.endDate)
            recurring.endDate = new Date(dto.endDate);
        return await this.recurringRepository.save(recurring);
    }
    async remove(userId, id) {
        const recurring = await this.findOne(userId, id);
        await this.recurringRepository.remove(recurring);
        return { message: 'Đã xóa giao dịch định kỳ' };
    }
    async toggleActive(userId, id, isActive) {
        const recurring = await this.findOne(userId, id);
        recurring.isActive = isActive;
        return await this.recurringRepository.save(recurring);
    }
    async executeRecurringTransactions() {
        const now = new Date();
        const recurringTransactions = await this.recurringRepository.find({
            where: {
                isActive: true,
                nextExecutionDate: (0, typeorm_2.LessThanOrEqual)(now),
            },
        });
        for (const recurring of recurringTransactions) {
            if (recurring.endDate && recurring.endDate < now) {
                recurring.isActive = false;
                await this.recurringRepository.save(recurring);
                continue;
            }
            const transaction = this.transactionRepository.create({
                userId: recurring.userId,
                walletId: recurring.walletId,
                categoryId: recurring.categoryId,
                amount: recurring.amount,
                type: recurring.type,
                note: `[Auto] ${recurring.note || 'Giao dịch định kỳ'}`,
                date: now,
            });
            await this.transactionRepository.save(transaction);
            await this.updateWalletBalance(recurring.walletId, recurring.amount, recurring.type);
            recurring.lastExecutedDate = now;
            recurring.nextExecutionDate = this.calculateNextExecution(now, recurring.frequency, recurring.frequencyDay);
            await this.recurringRepository.save(recurring);
        }
    }
    calculateNextExecution(fromDate, frequency, frequencyDay) {
        const next = new Date(fromDate);
        switch (frequency) {
            case 'daily':
                next.setDate(next.getDate() + 1);
                break;
            case 'weekly':
                next.setDate(next.getDate() + 7);
                break;
            case 'biweekly':
                next.setDate(next.getDate() + 14);
                break;
            case 'monthly':
                const day = frequencyDay ? parseInt(frequencyDay) : fromDate.getDate();
                next.setMonth(next.getMonth() + 1);
                next.setDate(day);
                break;
            case 'quarterly':
                next.setMonth(next.getMonth() + 3);
                break;
            case 'yearly':
                next.setFullYear(next.getFullYear() + 1);
                break;
        }
        return next;
    }
    async updateWalletBalance(walletId, amount, type) {
        const wallet = await this.walletRepository.findOne({
            where: { id: walletId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Ví không tìm thấy');
        }
        if (type === 'income') {
            wallet.balance = Number(wallet.balance) + Number(amount);
        }
        else {
            wallet.balance = Number(wallet.balance) - Number(amount);
        }
        await this.walletRepository.save(wallet);
    }
};
exports.RecurringTransactionsService = RecurringTransactionsService;
__decorate([
    (0, schedule_1.Cron)('0 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RecurringTransactionsService.prototype, "executeRecurringTransactions", null);
exports.RecurringTransactionsService = RecurringTransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(recurring_transaction_entity_1.RecurringTransaction)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(2, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RecurringTransactionsService);
//# sourceMappingURL=recurring-transactions.service.js.map