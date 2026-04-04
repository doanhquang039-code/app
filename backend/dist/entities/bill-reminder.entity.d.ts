import { User } from './user.entity';
export declare class BillReminder {
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
    user: User;
}
