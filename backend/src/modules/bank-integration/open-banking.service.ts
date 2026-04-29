import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../entities/bank-account.entity';
import { BankTransaction } from '../../entities/bank-transaction.entity';

@Injectable()
export class OpenBankingService {
  constructor(
    @InjectRepository(BankAccount)
    private bankAccountRepo: Repository<BankAccount>,
    @InjectRepository(BankTransaction)
    private bankTransactionRepo: Repository<BankTransaction>,
  ) {}

  // Connect bank via Open Banking API
  async connectBank(userId: number, bankCode: string, credentials: any): Promise<any> {
    // Mock implementation for Vietnamese banks
    const bankInfo = this.getBankInfo(bankCode);

    const account = this.bankAccountRepo.create({
      userId,
      bankName: bankInfo.name,
      accountNumber: credentials.accountNumber,
      accountType: 'CHECKING',
      accountHolderName: credentials.accountHolderName,
      balance: 0,
      bankCode,
      connectionType: 'OPEN_BANKING',
      status: 'ACTIVE',
      autoSync: true,
    });

    const savedAccount = await this.bankAccountRepo.save(account) as unknown as BankAccount;

    // Sync initial data
    await this.syncBankData(savedAccount.id);

    return {
      success: true,
      message: `Đã kết nối ${bankInfo.name} thành công`,
      account: savedAccount,
    };
  }

  // Sync bank data
  async syncBankData(accountId: number): Promise<any> {
    const account = await this.bankAccountRepo.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Bank account not found');
    }

    // Mock sync - in production, call actual bank API
    const transactions = this.getMockBankTransactions(account.bankCode);

    let importedCount = 0;
    for (const txn of transactions) {
      const existing = await this.bankTransactionRepo.findOne({
        where: {
          bankAccountId: accountId,
          externalTransactionId: txn.id,
        },
      });

      if (!existing) {
        const bankTransaction = this.bankTransactionRepo.create({
          bankAccountId: accountId,
          externalTransactionId: txn.id,
          transactionDate: new Date(txn.date),
          amount: txn.amount,
          type: txn.type,
          description: txn.description,
          merchantName: txn.merchant,
          status: 'POSTED',
        });

        await this.bankTransactionRepo.save(bankTransaction);
        importedCount++;
      }
    }

    account.lastSyncedAt = new Date();
    await this.bankAccountRepo.save(account);

    return {
      success: true,
      importedCount,
    };
  }

  // Get bank info
  private getBankInfo(bankCode: string): any {
    const banks: Record<string, any> = {
      VCB: { name: 'Vietcombank', code: 'VCB' },
      TCB: { name: 'Techcombank', code: 'TCB' },
      VTB: { name: 'Vietinbank', code: 'VTB' },
      BIDV: { name: 'BIDV', code: 'BIDV' },
      ACB: { name: 'ACB', code: 'ACB' },
      MB: { name: 'MB Bank', code: 'MB' },
      VPB: { name: 'VPBank', code: 'VPB' },
      TPB: { name: 'TPBank', code: 'TPB' },
    };

    return banks[bankCode] || { name: 'Unknown Bank', code: bankCode };
  }

  // Mock bank transactions
  private getMockBankTransactions(bankCode: string): any[] {
    return [
      {
        id: `${bankCode}_001`,
        date: '2026-04-29',
        amount: -150000,
        type: 'DEBIT',
        description: 'Mua sắm tại Vinmart',
        merchant: 'Vinmart',
      },
      {
        id: `${bankCode}_002`,
        date: '2026-04-28',
        amount: -85000,
        type: 'DEBIT',
        description: 'Thanh toán Grab',
        merchant: 'Grab',
      },
      {
        id: `${bankCode}_003`,
        date: '2026-04-27',
        amount: 5000000,
        type: 'CREDIT',
        description: 'Chuyển khoản đến',
        merchant: 'Transfer',
      },
    ];
  }

  // Get supported banks
  getSupportedBanks(): any[] {
    return [
      { code: 'VCB', name: 'Vietcombank', logo: '/banks/vcb.png' },
      { code: 'TCB', name: 'Techcombank', logo: '/banks/tcb.png' },
      { code: 'VTB', name: 'Vietinbank', logo: '/banks/vtb.png' },
      { code: 'BIDV', name: 'BIDV', logo: '/banks/bidv.png' },
      { code: 'ACB', name: 'ACB', logo: '/banks/acb.png' },
      { code: 'MB', name: 'MB Bank', logo: '/banks/mb.png' },
      { code: 'VPB', name: 'VPBank', logo: '/banks/vpb.png' },
      { code: 'TPB', name: 'TPBank', logo: '/banks/tpb.png' },
    ];
  }
}
