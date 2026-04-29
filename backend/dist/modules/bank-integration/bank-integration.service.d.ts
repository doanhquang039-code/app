import { Repository } from 'typeorm';
import { BankAccount } from '../../entities/bank-account.entity';
import { BankTransaction } from '../../entities/bank-transaction.entity';
import { Transaction } from '../../entities/transaction.entity';
export declare class BankIntegrationService {
    private bankAccountRepo;
    private bankTransactionRepo;
    private transactionRepo;
    constructor(bankAccountRepo: Repository<BankAccount>, bankTransactionRepo: Repository<BankTransaction>, transactionRepo: Repository<Transaction>);
    createBankAccount(userId: number, data: any): Promise<BankAccount>;
    getUserBankAccounts(userId: number): Promise<BankAccount[]>;
    getBankAccount(userId: number, accountId: number): Promise<BankAccount>;
    updateBankAccount(userId: number, accountId: number, data: any): Promise<BankAccount>;
    deleteBankAccount(userId: number, accountId: number): Promise<void>;
    setPrimaryAccount(userId: number, accountId: number): Promise<BankAccount>;
    syncBankAccount(userId: number, accountId: number): Promise<any>;
    getBankTransactions(userId: number, filters: any): Promise<BankTransaction[]>;
    getUnreconciledTransactions(userId: number): Promise<BankTransaction[]>;
    reconcileTransaction(userId: number, bankTransactionId: number, transactionId: number): Promise<BankTransaction>;
    createTransactionFromBankTransaction(userId: number, bankTransactionId: number): Promise<Transaction>;
    autoReconcileTransactions(userId: number): Promise<any>;
    private isSameDay;
    private similarDescription;
    getBankAccountStats(userId: number): Promise<any>;
    getBalanceHistory(userId: number, accountId: number, days?: number): Promise<any[]>;
}
