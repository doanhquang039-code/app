import { Repository } from 'typeorm';
import { BankAccount } from '../../entities/bank-account.entity';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';
export declare class BankAccountsService {
    private bankAccountRepository;
    constructor(bankAccountRepository: Repository<BankAccount>);
    create(userId: number, createBankAccountDto: CreateBankAccountDto): Promise<BankAccount>;
    findAll(userId: number): Promise<BankAccount[]>;
    findOne(id: number, userId: number): Promise<BankAccount | null>;
    update(id: number, userId: number, updateBankAccountDto: UpdateBankAccountDto): Promise<BankAccount | null>;
    remove(id: number, userId: number): Promise<void>;
    updateBalance(id: number, userId: number, newBalance: number): Promise<BankAccount | null>;
    getAccountsByType(userId: number, accountType: string): Promise<BankAccount[]>;
    getTotalBalance(userId: number): Promise<number>;
}
