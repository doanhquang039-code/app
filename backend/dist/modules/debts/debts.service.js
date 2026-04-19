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
exports.DebtsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const debt_entity_1 = require("../../entities/debt.entity");
let DebtsService = class DebtsService {
    debtRepo;
    paymentRepo;
    constructor(debtRepo, paymentRepo) {
        this.debtRepo = debtRepo;
        this.paymentRepo = paymentRepo;
    }
    async findAll(userId) {
        return this.debtRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    }
    async findOne(id, userId) {
        return this.debtRepo.findOne({ where: { id, userId } });
    }
    async create(userId, data) {
        const debt = this.debtRepo.create({ ...data, userId });
        return this.debtRepo.save(debt);
    }
    async update(id, userId, data) {
        await this.debtRepo.update({ id, userId }, data);
        const updated = await this.findOne(id, userId);
        if (!updated)
            throw new common_1.NotFoundException('Không tìm thấy khoản nợ');
        return updated;
    }
    async remove(id, userId) {
        await this.debtRepo.delete({ id, userId });
    }
    async getSummary(userId) {
        const debts = await this.findAll(userId);
        const totalLent = debts.filter(d => d.type === 'lend').reduce((s, d) => s + Number(d.totalAmount), 0);
        const totalBorrowed = debts.filter(d => d.type === 'borrow').reduce((s, d) => s + Number(d.totalAmount), 0);
        const totalLentPaid = debts.filter(d => d.type === 'lend').reduce((s, d) => s + Number(d.paidAmount), 0);
        const totalBorrowedPaid = debts.filter(d => d.type === 'borrow').reduce((s, d) => s + Number(d.paidAmount), 0);
        const activeDebts = debts.filter(d => d.status === 'active').length;
        const overdueDebts = debts.filter(d => d.status === 'overdue' || (d.dueDate && new Date(d.dueDate) < new Date() && d.status === 'active')).length;
        return {
            totalLent,
            totalBorrowed,
            totalLentPaid,
            totalBorrowedPaid,
            remainingLent: totalLent - totalLentPaid,
            remainingBorrowed: totalBorrowed - totalBorrowedPaid,
            activeDebts,
            overdueDebts,
            totalDebts: debts.length,
        };
    }
    async getPayments(debtId, userId) {
        return this.paymentRepo.find({ where: { debtId, userId }, order: { paymentDate: 'DESC' } });
    }
    async addPayment(debtId, userId, data) {
        const payment = this.paymentRepo.create({ ...data, debtId, userId });
        const saved = await this.paymentRepo.save(payment);
        const debt = await this.findOne(debtId, userId);
        if (debt) {
            const newPaidAmount = Number(debt.paidAmount) + Number(data.amount);
            const updateData = { paidAmount: newPaidAmount };
            if (newPaidAmount >= Number(debt.totalAmount)) {
                updateData.status = 'paid';
            }
            await this.debtRepo.update({ id: debtId }, updateData);
        }
        return saved;
    }
};
exports.DebtsService = DebtsService;
exports.DebtsService = DebtsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(debt_entity_1.Debt)),
    __param(1, (0, typeorm_1.InjectRepository)(debt_entity_1.DebtPayment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DebtsService);
//# sourceMappingURL=debts.service.js.map