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
exports.BankAccountsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bank_account_entity_1 = require("../../entities/bank-account.entity");
let BankAccountsService = class BankAccountsService {
    bankAccountRepository;
    constructor(bankAccountRepository) {
        this.bankAccountRepository = bankAccountRepository;
    }
    async create(userId, createBankAccountDto) {
        const bankAccount = this.bankAccountRepository.create({
            ...createBankAccountDto,
            userId,
        });
        return this.bankAccountRepository.save(bankAccount);
    }
    async findAll(userId) {
        return this.bankAccountRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id, userId) {
        return this.bankAccountRepository.findOne({
            where: { id, userId },
        });
    }
    async update(id, userId, updateBankAccountDto) {
        await this.bankAccountRepository.update({ id, userId }, { ...updateBankAccountDto, updatedAt: new Date() });
        return this.findOne(id, userId);
    }
    async remove(id, userId) {
        await this.bankAccountRepository.delete({ id, userId });
    }
    async updateBalance(id, userId, newBalance) {
        await this.bankAccountRepository.update({ id, userId }, { balance: newBalance, updatedAt: new Date() });
        return this.findOne(id, userId);
    }
    async getAccountsByType(userId, accountType) {
        return this.bankAccountRepository.find({
            where: { userId, accountType },
        });
    }
    async getTotalBalance(userId) {
        const result = await this.bankAccountRepository
            .createQueryBuilder('bankAccount')
            .select('SUM(bankAccount.balance)', 'total')
            .where('bankAccount.userId = :userId', { userId })
            .andWhere('bankAccount.isActive = :isActive', { isActive: true })
            .getRawOne();
        return parseFloat(result.total) || 0;
    }
};
exports.BankAccountsService = BankAccountsService;
exports.BankAccountsService = BankAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BankAccountsService);
//# sourceMappingURL=bank-accounts.service.js.map