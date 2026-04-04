export declare class CreateRecurringTransactionDto {
    walletId: number;
    categoryId: number;
    amount: number;
    type: string;
    note?: string;
    frequency: string;
    frequencyDay?: string;
    startDate: Date;
    endDate?: Date;
}
