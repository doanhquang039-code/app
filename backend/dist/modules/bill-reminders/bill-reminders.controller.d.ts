import { BillRemindersService } from './bill-reminders.service';
import { CreateBillReminderDto } from './dto/create-bill-reminder.dto';
import { UpdateBillReminderDto } from './dto/update-bill-reminder.dto';
export declare class BillRemindersController {
    private billRemindersService;
    constructor(billRemindersService: BillRemindersService);
    create(req: any, dto: CreateBillReminderDto): Promise<import("../../entities/bill-reminder.entity").BillReminder>;
    findAll(req: any, status?: string): Promise<import("../../entities/bill-reminder.entity").BillReminder[]>;
    getUpcoming(req: any): Promise<{
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
    findOne(req: any, id: string): Promise<import("../../entities/bill-reminder.entity").BillReminder>;
    update(req: any, id: string, dto: UpdateBillReminderDto): Promise<import("../../entities/bill-reminder.entity").BillReminder>;
    markAsPaid(req: any, id: string): Promise<import("../../entities/bill-reminder.entity").BillReminder>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
}
