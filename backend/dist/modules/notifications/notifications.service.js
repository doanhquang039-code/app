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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const transaction_entity_1 = require("../../entities/transaction.entity");
const user_entity_1 = require("../../entities/user.entity");
const mailer_1 = require("@nestjs-modules/mailer");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    transactionRepo;
    userRepo;
    mailerService;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(transactionRepo, userRepo, mailerService) {
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
        this.mailerService = mailerService;
    }
    async sendDailyReminder() {
        this.logger.log('Đang gửi nhắc nhở chi tiêu hàng ngày...');
        const users = await this.userRepo.find();
        for (const user of users) {
            await this.sendMonthlyReport(user);
        }
    }
    async sendMonthlyReport(user) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const transactions = await this.transactionRepo.find({
            where: { userId: user.id },
            relations: ['category'],
        });
        const thisMonthTx = transactions.filter((t) => new Date(t.date) >= startOfMonth);
        const totalExpense = thisMonthTx
            .filter((t) => t.type === 'expense')
            .reduce((s, t) => s + Number(t.amount), 0);
        const totalIncome = thisMonthTx
            .filter((t) => t.type === 'income')
            .reduce((s, t) => s + Number(t.amount), 0);
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: '💰 Nhắc nhở chi tiêu hàng ngày',
                html: `
          <h2>Xin chào ${user.email}!</h2>
          <p>Tổng kết chi tiêu tháng này:</p>
          <ul>
            <li>💚 Tổng thu: <strong>${totalIncome.toLocaleString('vi-VN')} đ</strong></li>
            <li>❤️ Tổng chi: <strong>${totalExpense.toLocaleString('vi-VN')} đ</strong></li>
            <li>💛 Số dư: <strong>${(totalIncome - totalExpense).toLocaleString('vi-VN')} đ</strong></li>
          </ul>
          <p>Hãy tiếp tục quản lý chi tiêu thông minh nhé!</p>
        `,
            });
            this.logger.log(`Đã gửi email cho ${user.email}`);
        }
        catch (error) {
            this.logger.error(`Gửi email thất bại cho ${user.email}: ${error.message}`);
        }
    }
    async sendManualReminder(userId) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (user) {
            await this.sendMonthlyReport(user);
            return { message: `Đã gửi email nhắc nhở tới ${user.email}` };
        }
        return { message: 'Không tìm thấy user' };
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "sendDailyReminder", null);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        mailer_1.MailerService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map