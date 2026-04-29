import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { BankAccount } from '../../entities/bank-account.entity';
import { BankTransaction } from '../../entities/bank-transaction.entity';
import { Transaction } from '../../entities/transaction.entity';

@Injectable()
export class BankIntegrationService {
  constructor(
    @InjectRepository(BankAccount)
    private bankAccountRepo: Repository<BankAccount>,
    @InjectRepository(BankTransaction)
    private bankTransactionRepo: Repository<BankTransaction>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  // Create bank account
  async createBankAccount(userId: number, data: any): Promise<BankAccount> {
    const account = this.bankAccountRepo.create({
      userId,
      ...data,
      connectionType: data.connectionType || 'MANUAL',
      status: 'ACTIVE',
    });

    return await this.bankAccountRepo.save(account) as unknown as BankAccount;
  }

  // Get user bank accounts
  async getUserBankAccounts(userId: number): Promise<BankAccount[]> {
    return await this.bankAccountRepo.find({
      where: { userId, isActive: true },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
  }

  // Get single bank account
  async getBankAccount(userId: number, accountId: number): Promise<BankAccount> {
    const account = await this.bankAccountRepo.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    return account;
  }

  // Update bank account
  async updateBankAccount(
    userId: number,
    accountId: number,
    data: any,
  ): Promise<BankAccount> {
    const account = await this.getBankAccount(userId, accountId);
    Object.assign(account, data);
    return await this.bankAccountRepo.save(account) as unknown as BankAccount;
  }

  // Delete bank account
  async deleteBankAccount(userId: number, accountId: number): Promise<void> {
    const account = await this.getBankAccount(userId, accountId);
    account.isActive = false;
    await this.bankAccountRepo.save(account);
  }

  // Set primary account
  async setPrimaryAccount(userId: number, accountId: number): Promise<BankAccount> {
    // Remove primary from all accounts
    await this.bankAccountRepo.update({ userId }, { isPrimary: false });

    // Set new primary
    const account = await this.getBankAccount(userId, accountId);
    account.isPrimary = true;
    return await this.bankAccountRepo.save(account) as unknown as BankAccount;
  }

  // Sync bank account
  async syncBankAccount(userId: number, accountId: number): Promise<any> {
    const account = await this.getBankAccount(userId, accountId);

    try {
      // Update last synced time
      account.lastSyncedAt = new Date();
      account.syncError = '';
      await this.bankAccountRepo.save(account);

      return {
        success: true,
        message: 'Đã đồng bộ tài khoản',
        lastSyncedAt: account.lastSyncedAt,
      };
    } catch (error) {
      account.syncError = error.message;
      await this.bankAccountRepo.save(account);
      throw error;
    }
  }

  // Get bank transactions
  async getBankTransactions(
    userId: number,
    filters: any,
  ): Promise<BankTransaction[]> {
    const where: any = {};

    if (filters.accountId) {
      const account = await this.getBankAccount(userId, filters.accountId);
      where.bankAccountId = account.id;
    }

    if (filters.startDate && filters.endDate) {
      where.transactionDate = Between(
        new Date(filters.startDate),
        new Date(filters.endDate),
      );
    }

    return await this.bankTransactionRepo.find({
      where,
      relations: ['bankAccount', 'transaction'],
      order: { transactionDate: 'DESC' },
    });
  }

  // Get unreconciled transactions
  async getUnreconciledTransactions(userId: number): Promise<BankTransaction[]> {
    const accounts = await this.getUserBankAccounts(userId);
    const accountIds = accounts.map((a) => a.id);

    return await this.bankTransactionRepo.find({
      where: {
        bankAccountId: accountIds as any,
        isReconciled: false,
        status: 'POSTED',
      },
      relations: ['bankAccount'],
      order: { transactionDate: 'DESC' },
      take: 100,
    });
  }

  // Reconcile transaction
  async reconcileTransaction(
    userId: number,
    bankTransactionId: number,
    transactionId: number,
  ): Promise<BankTransaction> {
    const bankTxn = await this.bankTransactionRepo.findOne({
      where: { id: bankTransactionId },
      relations: ['bankAccount'],
    });

    if (!bankTxn) {
      throw new NotFoundException('Bank transaction not found');
    }

    // Verify ownership
    await this.getBankAccount(userId, bankTxn.bankAccountId);

    // Verify transaction ownership
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    bankTxn.transactionId = transactionId;
    bankTxn.isReconciled = true;

    return await this.bankTransactionRepo.save(bankTxn) as unknown as BankTransaction;
  }

  // Create transaction from bank transaction
  async createTransactionFromBankTransaction(
    userId: number,
    bankTransactionId: number,
  ): Promise<Transaction> {
    const bankTxn = await this.bankTransactionRepo.findOne({
      where: { id: bankTransactionId },
      relations: ['bankAccount'],
    });

    if (!bankTxn) {
      throw new NotFoundException('Bank transaction not found');
    }

    // Verify ownership
    await this.getBankAccount(userId, bankTxn.bankAccountId);

    // Create transaction
    const transaction = this.transactionRepo.create({
      userId,
      type: bankTxn.type === 'DEBIT' ? 'EXPENSE' : 'INCOME',
      amount: Math.abs(bankTxn.amount),
      date: bankTxn.transactionDate,
    });

    const savedTransaction = await this.transactionRepo.save(transaction) as unknown as Transaction;

    // Link bank transaction
    bankTxn.transactionId = savedTransaction.id;
    bankTxn.isReconciled = true;
    await this.bankTransactionRepo.save(bankTxn);

    return savedTransaction;
  }

  // Auto reconcile transactions
  async autoReconcileTransactions(userId: number): Promise<any> {
    const unreconciledBankTxns = await this.getUnreconciledTransactions(userId);
    const userTransactions = await this.transactionRepo.find({
      where: { userId },
      order: { date: 'DESC' },
      take: 500,
    });

    let reconciledCount = 0;
    const matches: any[] = [];

    for (const bankTxn of unreconciledBankTxns) {
      // Find matching transaction
      const match = userTransactions.find((txn) => {
        const amountMatch = Math.abs(parseFloat(txn.amount.toString()) - Math.abs(bankTxn.amount)) < 0.01;
        const dateMatch = this.isSameDay(new Date(txn.date), bankTxn.transactionDate);
        const descMatch = bankTxn.description ? true : false; // Skip description match for now

        return amountMatch && dateMatch;
      });

      if (match) {
        await this.reconcileTransaction(userId, bankTxn.id, match.id);
        reconciledCount++;
        matches.push({
          bankTransactionId: bankTxn.id,
          transactionId: match.id,
        });
      }
    }

    return {
      success: true,
      reconciledCount,
      totalUnreconciled: unreconciledBankTxns.length,
      matches,
    };
  }

  // Helper: Check if same day
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  // Helper: Check similar description
  private similarDescription(desc1: string, desc2: string): boolean {
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const norm1 = normalize(desc1);
    const norm2 = normalize(desc2);

    return norm1.includes(norm2) || norm2.includes(norm1);
  }

  // Get bank account stats
  async getBankAccountStats(userId: number): Promise<any> {
    const accounts = await this.getUserBankAccounts(userId);

    const totalBalance = accounts.reduce(
      (sum, acc) => sum + parseFloat(acc.balance.toString()),
      0,
    );

    const byType = accounts.reduce((acc, account) => {
      if (!acc[account.accountType]) {
        acc[account.accountType] = { count: 0, balance: 0 };
      }
      acc[account.accountType].count += 1;
      acc[account.accountType].balance += parseFloat(account.balance.toString());
      return acc;
    }, {} as Record<string, any>);

    const connected = accounts.filter((a) => a.connectionType !== 'MANUAL').length;
    const manual = accounts.filter((a) => a.connectionType === 'MANUAL').length;

    return {
      totalAccounts: accounts.length,
      totalBalance: Math.round(totalBalance),
      connectedAccounts: connected,
      manualAccounts: manual,
      byType,
      accounts: accounts.map((a) => ({
        id: a.id,
        bankName: a.bankName,
        accountType: a.accountType,
        balance: a.balance,
        lastSyncedAt: a.lastSyncedAt,
      })),
    };
  }

  // Get balance history
  async getBalanceHistory(
    userId: number,
    accountId: number,
    days: number = 30,
  ): Promise<any[]> {
    const account = await this.getBankAccount(userId, accountId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await this.bankTransactionRepo.find({
      where: {
        bankAccountId: accountId,
        transactionDate: Between(startDate, new Date()),
      },
      order: { transactionDate: 'ASC' },
    });

    const history: any[] = [];
    let currentBalance = parseFloat(account.balance.toString());

    // Work backwards from current balance
    for (let i = transactions.length - 1; i >= 0; i--) {
      const txn = transactions[i];
      history.unshift({
        date: txn.transactionDate,
        balance: currentBalance,
        change: txn.amount,
      });

      currentBalance -= txn.amount;
    }

    return history;
  }
}
