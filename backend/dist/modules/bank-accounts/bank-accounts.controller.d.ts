import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';
export declare class BankAccountsController {
    private readonly bankAccountsService;
    constructor(bankAccountsService: BankAccountsService);
    create(req: any, createBankAccountDto: CreateBankAccountDto): Promise<import("../../entities/bank-account.entity").BankAccount>;
    findAll(req: any): Promise<import("../../entities/bank-account.entity").BankAccount[]>;
    getTotalBalance(req: any): Promise<{
        totalBalance: number;
    }>;
    findOne(id: string, req: any): Promise<import("../../entities/bank-account.entity").BankAccount | null>;
    update(id: string, req: any, updateBankAccountDto: UpdateBankAccountDto): Promise<import("../../entities/bank-account.entity").BankAccount | null>;
    remove(id: string, req: any): Promise<void>;
    updateBalance(id: string, req: any, { balance }: {
        balance: number;
    }): Promise<import("../../entities/bank-account.entity").BankAccount | null>;
    getAccountsByType(accountType: string, req: any): Promise<import("../../entities/bank-account.entity").BankAccount[]>;
}
