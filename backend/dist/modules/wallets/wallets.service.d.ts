import { Repository, DataSource } from 'typeorm';
import { Wallet } from '../../entities/wallet.entity';
import { Transaction } from '../../entities/transaction.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { TransferWalletDto } from './dto/transfer-wallet.dto';
export declare class WalletsService {
    private walletRepo;
    private transactionRepo;
    private dataSource;
    constructor(walletRepo: Repository<Wallet>, transactionRepo: Repository<Transaction>, dataSource: DataSource);
    create(userId: number, dto: CreateWalletDto): Promise<Wallet>;
    findAll(userId: number): Promise<Wallet[]>;
    findOne(userId: number, id: number): Promise<Wallet>;
    update(userId: number, id: number, dto: UpdateWalletDto): Promise<Wallet>;
    remove(userId: number, id: number): Promise<{
        message: string;
    }>;
    transfer(userId: number, dto: TransferWalletDto): Promise<{
        message: string;
    }>;
    getTotalBalance(userId: number): Promise<number>;
}
