import { Repository } from 'typeorm';
import { BillReminder } from '../../entities/bill-reminder.entity';
import { CreateBillReminderDto } from './dto/create-bill-reminder.dto';
import { UpdateBillReminderDto } from './dto/update-bill-reminder.dto';
export declare class BillRemindersService {
    private billReminderRepository;
    constructor(billReminderRepository: Repository<BillReminder>);
    create(userId: number, dto: CreateBillReminderDto): Promise<BillReminder>;
    findAll(userId: number, status?: string): Promise<BillReminder[]>;
    findOne(userId: number, id: number): Promise<BillReminder>;
    update(userId: number, id: number, dto: UpdateBillReminderDto): Promise<BillReminder>;
    remove(userId: number, id: number): Promise<{
        message: string;
    }>;
    markAsPaid(userId: number, id: number): Promise<BillReminder>;
    getUpcomingBills(userId: number): Promise<{
        daysUntilDue: number;
        isOverdue: boolean;
        id: number;
        userId: number;
        billName: string;
        description: string;
        amount: number;
        dueDate: Date;
        isPaid: boolean;
        paidDate: Date;
        status: string;
        reminderEnabled: boolean;
        remindDaysBefore: number;
        reminderSent: boolean;
        reminderSentDate: Date;
        createdAt: Date;
        updatedAt: Date;
        user: import("../../entities/user.entity").User;
    }[]>;
    updateBillStatuses(): Promise<void>;
}
