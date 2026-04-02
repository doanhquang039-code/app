import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { TransferWalletDto } from './dto/transfer-wallet.dto';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    create(req: any, dto: CreateWalletDto): Promise<import("../../entities/wallet.entity").Wallet>;
    findAll(req: any): Promise<import("../../entities/wallet.entity").Wallet[]>;
    getTotalBalance(req: any): Promise<number>;
    findOne(req: any, id: string): Promise<import("../../entities/wallet.entity").Wallet>;
    update(req: any, id: string, dto: UpdateWalletDto): Promise<import("../../entities/wallet.entity").Wallet>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
    transfer(req: any, dto: TransferWalletDto): Promise<{
        message: string;
    }>;
}
