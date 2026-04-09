import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../entities/bank-account.entity';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto/bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private bankAccountRepository: Repository<BankAccount>,
  ) {}

  async create(userId: number, createBankAccountDto: CreateBankAccountDto): Promise<BankAccount> {
    const bankAccount = this.bankAccountRepository.create({
      ...createBankAccountDto,
      userId,
    });
    return this.bankAccountRepository.save(bankAccount);
  }

  async findAll(userId: number): Promise<BankAccount[]> {
    return this.bankAccountRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<BankAccount | null> {
    return this.bankAccountRepository.findOne({
      where: { id, userId },
    });
  }

  async update(id: number, userId: number, updateBankAccountDto: UpdateBankAccountDto): Promise<BankAccount | null> {
    await this.bankAccountRepository.update(
      { id, userId },
      { ...updateBankAccountDto, updatedAt: new Date() },
    );
    return this.findOne(id, userId);
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.bankAccountRepository.delete({ id, userId });
  }

  async updateBalance(id: number, userId: number, newBalance: number): Promise<BankAccount | null> {
    await this.bankAccountRepository.update(
      { id, userId },
      { balance: newBalance, updatedAt: new Date() },
    );
    return this.findOne(id, userId);
  }

  async getAccountsByType(userId: number, accountType: string): Promise<BankAccount[]> {
    return this.bankAccountRepository.find({
      where: { userId, accountType },
    });
  }

  async getTotalBalance(userId: number): Promise<number> {
    const result = await this.bankAccountRepository
      .createQueryBuilder('bankAccount')
      .select('SUM(bankAccount.balance)', 'total')
      .where('bankAccount.userId = :userId', { userId })
      .andWhere('bankAccount.isActive = :isActive', { isActive: true })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }
}
