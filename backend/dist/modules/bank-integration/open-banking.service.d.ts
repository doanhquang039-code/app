import { Repository } from 'typeorm';
import { BankAccount } from '../../entities/bank-account.entity';
import { BankTransaction } from '../../entities/bank-transaction.entity';
export declare class OpenBankingService {
    private bankAccountRepo;
    private bankTransactionRepo;
    constructor(bankAccountRepo: Repository<BankAccount>, bankTransactionRepo: Repository<BankTransaction>);
    connectBank(userId: number, bankCode: string, credentials: any): Promise<any>;
    syncBankData(accountId: number): Promise<any>;
    private getBankInfo;
    private getMockBankTransactions;
    getSupportedBanks(): any[];
}
