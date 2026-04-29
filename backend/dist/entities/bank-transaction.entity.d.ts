import { BankAccount } from './bank-account.entity';
import { Transaction } from './transaction.entity';
export declare class BankTransaction {
    id: number;
    bankAccountId: number;
    bankAccount: BankAccount;
    transactionId: number;
    transaction: Transaction;
    externalTransactionId: string;
    transactionDate: Date;
    postedDate: Date;
    amount: number;
    type: string;
    description: string;
    merchantName: string;
    category: string;
    location: string;
    balance: number;
    status: string;
    isReconciled: boolean;
    isDuplicate: boolean;
    duplicateOfId: number;
    rawData: string;
    metadata: string;
    createdAt: Date;
    updatedAt: Date;
}
