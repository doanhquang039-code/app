import { Repository } from 'typeorm';
import { BankAccount } from '../../entities/bank-account.entity';
import { BankTransaction } from '../../entities/bank-transaction.entity';
import { ConfigService } from '@nestjs/config';
export declare class PlaidService {
    private bankAccountRepo;
    private bankTransactionRepo;
    private configService;
    private plaidClient;
    constructor(bankAccountRepo: Repository<BankAccount>, bankTransactionRepo: Repository<BankTransaction>, configService: ConfigService);
    createLinkToken(userId: number): Promise<any>;
    exchangePublicToken(userId: number, publicToken: string): Promise<any>;
    private getAccountsFromPlaid;
    getAccounts(userId: number): Promise<BankAccount[]>;
    syncTransactions(userId: number, accountId: number): Promise<any>;
    private getMockTransactions;
    private mapAccountType;
}
