import { BankIntegrationService } from './bank-integration.service';
import { PlaidService } from './plaid.service';
export declare class BankIntegrationController {
    private readonly bankService;
    private readonly plaidService;
    constructor(bankService: BankIntegrationService, plaidService: PlaidService);
    createPlaidLinkToken(req: any): Promise<any>;
    exchangePlaidToken(req: any, data: {
        publicToken: string;
    }): Promise<any>;
    getPlaidAccounts(req: any): Promise<import("../../entities/bank-account.entity").BankAccount[]>;
    syncPlaidTransactions(req: any, accountId: number): Promise<any>;
    createBankAccount(req: any, data: any): Promise<import("../../entities/bank-account.entity").BankAccount>;
    getBankAccounts(req: any): Promise<import("../../entities/bank-account.entity").BankAccount[]>;
    getBankAccount(req: any, id: number): Promise<import("../../entities/bank-account.entity").BankAccount>;
    updateBankAccount(req: any, id: number, data: any): Promise<import("../../entities/bank-account.entity").BankAccount>;
    deleteBankAccount(req: any, id: number): Promise<{
        success: boolean;
        message: string;
    }>;
    syncBankAccount(req: any, id: number): Promise<any>;
    setPrimaryAccount(req: any, id: number): Promise<import("../../entities/bank-account.entity").BankAccount>;
    getBankTransactions(req: any, accountId?: number, startDate?: string, endDate?: string): Promise<import("../../entities/bank-transaction.entity").BankTransaction[]>;
    getUnreconciledTransactions(req: any): Promise<import("../../entities/bank-transaction.entity").BankTransaction[]>;
    reconcileTransaction(req: any, id: number, data: {
        transactionId: number;
    }): Promise<import("../../entities/bank-transaction.entity").BankTransaction>;
    createTransactionFromBank(req: any, id: number): Promise<import("../../entities/transaction.entity").Transaction>;
    autoReconcile(req: any): Promise<any>;
    getBankStats(req: any): Promise<any>;
    getBalanceHistory(req: any, accountId: number, days?: number): Promise<any[]>;
}
