"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_entity_1 = require("../../entities/wallet.entity");
const transaction_entity_1 = require("../../entities/transaction.entity");
let WalletsService = class WalletsService {
    walletRepo;
    transactionRepo;
    dataSource;
    constructor(walletRepo, transactionRepo, dataSource) {
        this.walletRepo = walletRepo;
        this.transactionRepo = transactionRepo;
        this.dataSource = dataSource;
    }
    async create(userId, dto) {
        const wallet = this.walletRepo.create({
            ...dto,
            userId,
            balance: dto.balance ?? 0,
        });
        return this.walletRepo.save(wallet);
    }
    async findAll(userId) {
        return this.walletRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(userId, id) {
        const wallet = await this.walletRepo.findOne({
            where: { id, userId },
        });
        if (!wallet)
            throw new common_1.NotFoundException('Không tìm thấy ví');
        return wallet;
    }
    async update(userId, id, dto) {
        const wallet = await this.findOne(userId, id);
        Object.assign(wallet, dto);
        return this.walletRepo.save(wallet);
    }
    async remove(userId, id) {
        const wallet = await this.findOne(userId, id);
        const txCount = await this.transactionRepo.count({
            where: { walletId: id, userId },
        });
        if (txCount > 0) {
            throw new common_1.BadRequestException(`Không thể xóa ví. Có ${txCount} giao dịch đang sử dụng ví này.`);
        }
        await this.walletRepo.remove(wallet);
        return { message: 'Xóa ví thành công' };
    }
    async transfer(userId, dto) {
        const fromWallet = await this.findOne(userId, dto.fromWalletId);
        const toWallet = await this.findOne(userId, dto.toWalletId);
        if (Number(fromWallet.balance) < dto.amount) {
            throw new common_1.BadRequestException('Số dư ví nguồn không đủ');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            fromWallet.balance = Number(fromWallet.balance) - dto.amount;
            toWallet.balance = Number(toWallet.balance) + dto.amount;
            await queryRunner.manager.save(fromWallet);
            await queryRunner.manager.save(toWallet);
            await queryRunner.commitTransaction();
            return {
                message: `Đã chuyển ${dto.amount.toLocaleString('vi-VN')} đ từ "${fromWallet.name}" sang "${toWallet.name}"`,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw new common_1.BadRequestException('Chuyển tiền thất bại');
        }
        finally {
            await queryRunner.release();
        }
    }
    async getTotalBalance(userId) {
        const result = await this.walletRepo
            .createQueryBuilder('w')
            .select('SUM(w.balance)', 'total')
            .where('w.userId = :userId', { userId })
            .getRawOne();
        return Number(result?.total) || 0;
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.Wallet)),
    __param(1, (0, typeorm_1.InjectRepository)(transaction_entity_1.Transaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map