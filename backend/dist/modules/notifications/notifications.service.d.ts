import { Repository } from 'typeorm';
import { Transaction } from '../../entities/transaction.entity';
import { User } from '../../entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
export declare class NotificationsService {
    private transactionRepo;
    private userRepo;
    private mailerService;
    private readonly logger;
    constructor(transactionRepo: Repository<Transaction>, userRepo: Repository<User>, mailerService: MailerService);
    sendDailyReminder(): Promise<void>;
    sendMonthlyReport(user: User): Promise<void>;
    sendManualReminder(userId: number): Promise<{
        message: string;
    }>;
}
