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
exports.BudgetAlertsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const budget_alert_entity_1 = require("../../entities/budget-alert.entity");
const budget_entity_1 = require("../../entities/budget.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
let BudgetAlertsService = class BudgetAlertsService {
    budgetAlertRepository;
    budgetRepository;
    transactionRepository;
    constructor(budgetAlertRepository, budgetRepository, transactionRepository) {
        this.budgetAlertRepository = budgetAlertRepository;
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
    }
    async create(userId, dto) {
        if (dto.thresholdPercentage < 0 || dto.thresholdPercentage > 100) {
            throw new common_1.BadRequestException('Threshold phải từ 0-100');
        }
        const budget = await this.budgetRepository.findOne({
            where: { id: dto.budgetId, userId },
        });
        if (!budget) {
            throw new common_1.NotFoundException('Budget không tìm thấy');
        }
        const alert = this.budgetAlertRepository.create({
            userId,
            budgetId: dto.budgetId,
            thresholdPercentage: dto.thresholdPercentage,
            enabled: dto.enabled !== false,
        });
        return await this.budgetAlertRepository.save(alert);
    }
    async findAll(userId) {
        return await this.budgetAlertRepository.find({
            where: { userId },
            relations: ['budget'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(userId, id) {
        const alert = await this.budgetAlertRepository.findOne({
            where: { id, userId },
            relations: ['budget'],
        });
        if (!alert) {
            throw new common_1.NotFoundException('Budget alert không tìm thấy');
        }
        return alert;
    }
    async update(userId, id, dto) {
        const alert = await this.findOne(userId, id);
        if (dto.thresholdPercentage) {
            if (dto.thresholdPercentage < 0 || dto.thresholdPercentage > 100) {
                throw new common_1.BadRequestException('Threshold phải từ 0-100');
            }
            alert.thresholdPercentage = dto.thresholdPercentage;
        }
        if (dto.enabled !== undefined) {
            alert.enabled = dto.enabled;
        }
        return await this.budgetAlertRepository.save(alert);
    }
    async remove(userId, id) {
        const alert = await this.findOne(userId, id);
        await this.budgetAlertRepository.remove(alert);
        return { message: 'Đã xóa budget alert' };
    }
    async checkBudgetStatus(userId, budgetId) {
        const budget = await this.budgetRepository.findOne({
            where: { id: budgetId, userId },
            relations: ['category'],
        });
        if (!budget) {
            throw new common_1.NotFoundException('Budget không tìm thấy');
        }
        const alert = await this.budgetAlertRepository.findOne({
            where: { budgetId, userId },
        });
        const [year, month] = budget.month.split('-');
        const transactions = await this.transactionRepository.find({
            where: {
                userId,
                categoryId: budget.categoryId,
                type: 'expense',
            },
        });
        const spent = transactions
            .filter((t) => {
            const tDate = new Date(t.date);
            return (tDate.getFullYear() === parseInt(year) &&
                tDate.getMonth() === parseInt(month) - 1);
        })
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const percentage = (spent / Number(budget.amount)) * 100;
        return {
            budgetId,
            categoryName: budget.categoryId,
            budgetAmount: budget.amount,
            spent: spent,
            percentage: Math.round(percentage),
            thresholdPercentage: alert?.thresholdPercentage || 80,
            isExceeded: percentage >= (alert?.thresholdPercentage || 80),
            hasAlert: !!alert,
            message: percentage >= 100
                ? 'Đã vượt quá ngân sách'
                : percentage >= (alert?.thresholdPercentage || 80)
                    ? `Đã sử dụng ${Math.round(percentage)}% ngân sách`
                    : 'Ngân sách còn bình thường',
        };
    }
};
exports.BudgetAlertsService = BudgetAlertsService;
exports.BudgetAlertsService = BudgetAlertsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(budget_alert_entity_1.BudgetAlert)),
    __param(1, (0, typeorm_1.InjectRepository)(budget_entity_1.Budget)),
    __param(2, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], BudgetAlertsService);
//# sourceMappingURL=budget-alerts.service.js.map