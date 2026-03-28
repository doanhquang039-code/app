import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailerService: MailerService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDailyReminder() {
    this.logger.log('Đang gửi nhắc nhở chi tiêu hàng ngày...');
    const users = await this.userRepo.find();
    for (const user of users) {
      await this.sendMonthlyReport(user);
    }
  }

  async sendMonthlyReport(user: User) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const transactions = await this.transactionRepo.find({
      where: { userId: user.id },
      relations: ['category'],
    });

    const thisMonthTx = transactions.filter(
      (t) => new Date(t.date) >= startOfMonth,
    );
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
    } catch (error) {
      this.logger.error(
        `Gửi email thất bại cho ${user.email}: ${error.message}`,
      );
    }
  }

  async sendManualReminder(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) {
      await this.sendMonthlyReport(user);
      return { message: `Đã gửi email nhắc nhở tới ${user.email}` };
    }
    return { message: 'Không tìm thấy user' };
  }
}
