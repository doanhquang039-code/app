import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../entities/bank-account.entity';
import { BankTransaction } from '../../entities/bank-transaction.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PlaidService {
  private plaidClient: any;

  constructor(
    @InjectRepository(BankAccount)
    private bankAccountRepo: Repository<BankAccount>,
    @InjectRepository(BankTransaction)
    private bankTransactionRepo: Repository<BankTransaction>,
    private configService: ConfigService,
  ) {
    // Initialize Plaid client
    // const plaid = require('plaid');
    // this.plaidClient = new plaid.PlaidApi(
    //   new plaid.Configuration({
    //     basePath: plaid.PlaidEnvironments[this.configService.get('PLAID_ENV')],
    //     baseOptions: {
    //       headers: {
    //         'PLAID-CLIENT-ID': this.configService.get('PLAID_CLIENT_ID'),
    //         'PLAID-SECRET': this.configService.get('PLAID_SECRET'),
    //       },
    //     },
    //   }),
    // );
  }

  // Create link token for Plaid Link
  async createLinkToken(userId: number): Promise<any> {
    try {
      // Mock response for development
      return {
        linkToken: `link-sandbox-${Date.now()}`,
        expiration: new Date(Date.now() + 3600000).toISOString(),
      };

      // Production code:
      // const response = await this.plaidClient.linkTokenCreate({
      //   user: { client_user_id: userId.toString() },
      //   client_name: 'Expense Tracker',
      //   products: ['transactions'],
      //   country_codes: ['US', 'VN'],
      //   language: 'en',
      // });
      // return response.data;
    } catch (error) {
      throw new Error(`Failed to create link token: ${error.message}`);
    }
  }

  // Exchange public token for access token
  async exchangePublicToken(userId: number, publicToken: string): Promise<any> {
    try {
      // Mock response for development
      const accessToken = `access-sandbox-${Date.now()}`;
      const itemId = `item-sandbox-${Date.now()}`;

      // Get accounts
      const accounts = await this.getAccountsFromPlaid(accessToken);

      // Save accounts to database
      const savedAccounts: BankAccount[] = [];
      for (const account of accounts) {
        const bankAccount = this.bankAccountRepo.create({
          userId,
          bankName: account.institution_name || 'Unknown Bank',
          accountNumber: account.mask || '****',
          accountType: this.mapAccountType(account.type),
          accountHolderName: account.name,
          balance: account.balances.current || 0,
          currency: account.balances.iso_currency_code || 'VND',
          plaidAccessToken: accessToken,
          plaidItemId: itemId,
          plaidAccountId: account.account_id,
          connectionType: 'PLAID',
          status: 'ACTIVE',
          autoSync: true,
        });

        const saved = await this.bankAccountRepo.save(bankAccount) as unknown as BankAccount;
        savedAccounts.push(saved);
      }

      return {
        success: true,
        message: 'Đã kết nối ngân hàng thành công',
        accounts: savedAccounts,
      };

      // Production code:
      // const response = await this.plaidClient.itemPublicTokenExchange({
      //   public_token: publicToken,
      // });
      // const accessToken = response.data.access_token;
      // const itemId = response.data.item_id;
    } catch (error) {
      throw new Error(`Failed to exchange token: ${error.message}`);
    }
  }

  // Get accounts from Plaid
  private async getAccountsFromPlaid(accessToken: string): Promise<any[]> {
    // Mock data for development
    return [
      {
        account_id: 'acc_123',
        name: 'Checking Account',
        mask: '1234',
        type: 'depository',
        subtype: 'checking',
        institution_name: 'Vietcombank',
        balances: {
          current: 10000000,
          available: 9500000,
          iso_currency_code: 'VND',
        },
      },
      {
        account_id: 'acc_456',
        name: 'Savings Account',
        mask: '5678',
        type: 'depository',
        subtype: 'savings',
        institution_name: 'Vietcombank',
        balances: {
          current: 50000000,
          available: 50000000,
          iso_currency_code: 'VND',
        },
      },
    ];

    // Production code:
    // const response = await this.plaidClient.accountsGet({
    //   access_token: accessToken,
    // });
    // return response.data.accounts;
  }

  // Get accounts for user
  async getAccounts(userId: number): Promise<BankAccount[]> {
    return await this.bankAccountRepo.find({
      where: { userId, connectionType: 'PLAID', isActive: true },
    });
  }

  // Sync transactions from Plaid
  async syncTransactions(userId: number, accountId: number): Promise<any> {
    const account = await this.bankAccountRepo.findOne({
      where: { id: accountId, userId },
    });

    if (!account || !account.plaidAccessToken) {
      throw new Error('Bank account not found or not connected via Plaid');
    }

    try {
      // Mock transactions for development
      const transactions = this.getMockTransactions(account.plaidAccountId);

      let importedCount = 0;
      for (const txn of transactions) {
        // Check if transaction already exists
        const existing = await this.bankTransactionRepo.findOne({
          where: {
            bankAccountId: accountId,
            externalTransactionId: txn.transaction_id,
          },
        });

        if (!existing) {
          const bankTransaction = this.bankTransactionRepo.create({
            bankAccountId: accountId,
            externalTransactionId: txn.transaction_id,
            transactionDate: new Date(txn.date),
            postedDate: new Date(txn.authorized_date || txn.date),
            amount: txn.amount,
            type: txn.amount < 0 ? 'CREDIT' : 'DEBIT',
            description: txn.name,
            merchantName: txn.merchant_name,
            category: txn.category?.[0],
            status: 'POSTED',
            rawData: JSON.stringify(txn),
          });

          await this.bankTransactionRepo.save(bankTransaction);
          importedCount++;
        }
      }

      // Update last synced time
      account.lastSyncedAt = new Date();
      await this.bankAccountRepo.save(account);

      return {
        success: true,
        message: `Đã đồng bộ ${importedCount} giao dịch mới`,
        importedCount,
        totalTransactions: transactions.length,
      };

      // Production code:
      // const response = await this.plaidClient.transactionsGet({
      //   access_token: account.plaidAccessToken,
      //   start_date: '2026-01-01',
      //   end_date: '2026-04-29',
      // });
      // const transactions = response.data.transactions;
    } catch (error) {
      account.syncError = error.message;
      await this.bankAccountRepo.save(account);
      throw error;
    }
  }

  // Mock transactions for development
  private getMockTransactions(accountId: string): any[] {
    return [
      {
        transaction_id: 'txn_001',
        account_id: accountId,
        date: '2026-04-28',
        authorized_date: '2026-04-28',
        name: 'Starbucks Coffee',
        merchant_name: 'Starbucks',
        amount: 85000,
        category: ['Food and Drink', 'Restaurants', 'Coffee Shop'],
      },
      {
        transaction_id: 'txn_002',
        account_id: accountId,
        date: '2026-04-27',
        authorized_date: '2026-04-27',
        name: 'Grab Ride',
        merchant_name: 'Grab',
        amount: 45000,
        category: ['Travel', 'Taxi'],
      },
      {
        transaction_id: 'txn_003',
        account_id: accountId,
        date: '2026-04-26',
        authorized_date: '2026-04-26',
        name: 'Salary Deposit',
        merchant_name: 'Company ABC',
        amount: -15000000,
        category: ['Income', 'Payroll'],
      },
    ];
  }

  // Map Plaid account type to our account type
  private mapAccountType(plaidType: string): string {
    const typeMap: Record<string, string> = {
      depository: 'CHECKING',
      credit: 'CREDIT_CARD',
      loan: 'LOAN',
      investment: 'INVESTMENT',
    };

    return typeMap[plaidType] || 'CHECKING';
  }
}
