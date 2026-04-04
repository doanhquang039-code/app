export declare class CreateBillReminderDto {
    billName: string;
    description?: string;
    amount: number;
    dueDate: Date;
    reminderEnabled?: boolean;
    remindDaysBefore?: number;
}
