import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from '../../entities/wallet.entity';
import { Transaction } from '../../entities/transaction.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { TransferWalletDto } from './dto/transfer-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async create(userId: number, dto: CreateWalletDto): Promise<Wallet> {
    const wallet = this.walletRepo.create({
      ...dto,
      userId,
      balance: dto.balance ?? 0,
    });
    return this.walletRepo.save(wallet);
  }

  async findAll(userId: number): Promise<Wallet[]> {
    return this.walletRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: number, id: number): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({
      where: { id, userId },
    });
    if (!wallet) throw new NotFoundException('Không tìm thấy ví');
    return wallet;
  }

  async update(
    userId: number,
    id: number,
    dto: UpdateWalletDto,
  ): Promise<Wallet> {
    const wallet = await this.findOne(userId, id);
    Object.assign(wallet, dto);
    return this.walletRepo.save(wallet);
  }

  async remove(userId: number, id: number): Promise<{ message: string }> {
    const wallet = await this.findOne(userId, id);

    // Kiểm tra có transaction nào đang dùng ví này không
    const txCount = await this.transactionRepo.count({
      where: { walletId: id, userId },
    });

    if (txCount > 0) {
      throw new BadRequestException(
        `Không thể xóa ví. Có ${txCount} giao dịch đang sử dụng ví này.`,
      );
    }

    await this.walletRepo.remove(wallet);
    return { message: 'Xóa ví thành công' };
  }

  async transfer(
    userId: number,
    dto: TransferWalletDto,
  ): Promise<{ message: string }> {
    const fromWallet = await this.findOne(userId, dto.fromWalletId);
    const toWallet = await this.findOne(userId, dto.toWalletId);

    if (Number(fromWallet.balance) < dto.amount) {
      throw new BadRequestException('Số dư ví nguồn không đủ');
    }

    // Dùng transaction để đảm bảo tính toàn vẹn dữ liệu
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Chuyển tiền thất bại');
    } finally {
      await queryRunner.release();
    }
  }

  async getTotalBalance(userId: number): Promise<number> {
    const result = await this.walletRepo
      .createQueryBuilder('w')
      .select('SUM(w.balance)', 'total')
      .where('w.userId = :userId', { userId })
      .getRawOne();
    return Number(result?.total) || 0;
  }
}
