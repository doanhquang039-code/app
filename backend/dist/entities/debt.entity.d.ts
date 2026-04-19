import { User } from './user.entity';
export declare class Debt {
    id: number;
    userId: number;
    title: string;
    description: string;
    type: string;
    personName: string;
    personPhone: string;
    personEmail: string;
    totalAmount: number;
    paidAmount: number;
    currency: string;
    interestRate: number;
    startDate: Date;
    dueDate: Date;
    status: string;
    reminderEnabled: boolean;
    reminderDaysBefore: number;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
export declare class DebtPayment {
    id: number;
    debtId: number;
    userId: number;
    amount: number;
    paymentDate: Date;
    paymentMethod: string;
    note: string;
    createdAt: Date;
    debt: Debt;
    user: User;
}
