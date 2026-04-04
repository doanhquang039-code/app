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
exports.BillRemindersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bill_reminder_entity_1 = require("../../entities/bill-reminder.entity");
const schedule_1 = require("@nestjs/schedule");
let BillRemindersService = class BillRemindersService {
    billReminderRepository;
    constructor(billReminderRepository) {
        this.billReminderRepository = billReminderRepository;
    }
    async create(userId, dto) {
        if (dto.amount <= 0) {
            throw new common_1.BadRequestException('Số tiền phải lớn hơn 0');
        }
        const dueDate = new Date(dto.dueDate);
        if (isNaN(dueDate.getTime())) {
            throw new common_1.BadRequestException('Ngày thanh toán không hợp lệ');
        }
        if (dueDate < new Date()) {
            throw new common_1.BadRequestException('Ngày thanh toán không được trong quá khứ');
        }
        const reminder = this.billReminderRepository.create({
            userId,
            billName: dto.billName,
            description: dto.description,
            amount: dto.amount,
            dueDate,
            reminderEnabled: dto.reminderEnabled !== false,
            remindDaysBefore: dto.remindDaysBefore || 3,
            status: 'upcoming',
        });
        return await this.billReminderRepository.save(reminder);
    }
    async findAll(userId, status) {
        const qb = this.billReminderRepository
            .createQueryBuilder('b')
            .where('b.userId = :userId', { userId })
            .orderBy('b.dueDate', 'ASC');
        if (status) {
            qb.andWhere('b.status = :status', { status });
        }
        return await qb.getMany();
    }
    async findOne(userId, id) {
        const reminder = await this.billReminderRepository.findOne({
            where: { id, userId },
        });
        if (!reminder) {
            throw new common_1.NotFoundException('Nhắc nhở hóa đơn không tìm thấy');
        }
        return reminder;
    }
    async update(userId, id, dto) {
        const reminder = await this.findOne(userId, id);
        if (dto.amount && dto.amount <= 0) {
            throw new common_1.BadRequestException('Số tiền phải lớn hơn 0');
        }
        Object.assign(reminder, {
            billName: dto.billName || reminder.billName,
            description: dto.description !== undefined ? dto.description : reminder.description,
            amount: dto.amount || reminder.amount,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : reminder.dueDate,
            reminderEnabled: dto.reminderEnabled !== undefined ? dto.reminderEnabled : reminder.reminderEnabled,
            remindDaysBefore: dto.remindDaysBefore || reminder.remindDaysBefore,
        });
        return await this.billReminderRepository.save(reminder);
    }
    async remove(userId, id) {
        const reminder = await this.findOne(userId, id);
        await this.billReminderRepository.remove(reminder);
        return { message: 'Đã xóa nhắc nhở hóa đơn' };
    }
    async markAsPaid(userId, id) {
        const reminder = await this.findOne(userId, id);
        reminder.isPaid = true;
        reminder.paidDate = new Date();
        reminder.status = 'paid';
        return await this.billReminderRepository.save(reminder);
    }
    async getUpcomingBills(userId) {
        const now = new Date();
        const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const bills = await this.billReminderRepository.find({
            where: {
                userId,
                isPaid: false,
                dueDate: (0, typeorm_2.MoreThan)(now) && (0, typeorm_2.LessThan)(oneMonthLater),
            },
            order: { dueDate: 'ASC' },
        });
        return bills.map((bill) => {
            const daysUntilDue = Math.ceil((new Date(bill.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return {
                ...bill,
                daysUntilDue,
                isOverdue: daysUntilDue < 0,
            };
        });
    }
    async updateBillStatuses() {
        const now = new Date();
        const bills = await this.billReminderRepository.find({
            where: { isPaid: false },
        });
        for (const bill of bills) {
            if (new Date(bill.dueDate) < now) {
                bill.status = 'overdue';
            }
            else {
                bill.status = 'upcoming';
            }
            await this.billReminderRepository.save(bill);
        }
    }
};
exports.BillRemindersService = BillRemindersService;
__decorate([
    (0, schedule_1.Cron)('0 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillRemindersService.prototype, "updateBillStatuses", null);
exports.BillRemindersService = BillRemindersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bill_reminder_entity_1.BillReminder)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BillRemindersService);
//# sourceMappingURL=bill-reminders.service.js.map