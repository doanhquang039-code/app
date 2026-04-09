import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { Category } from './entities/category.entity';
import { Transaction } from './entities/transaction.entity';
import { Budget } from './entities/budget.entity';
import { RecurringTransaction } from './entities/recurring-transaction.entity';
import { SavingsGoal } from './entities/savings-goal.entity';
import { Tag } from './entities/tag.entity';
import { BudgetAlert } from './entities/budget-alert.entity';
import { BillReminder } from './entities/bill-reminder.entity';
import { BankAccount } from './entities/bank-account.entity';
import { CreditCard } from './entities/credit-card.entity';
import { SmartNotification, NotificationRule } from './entities/smart-notification.entity';
import { AuthModule } from './modules/auth/auth.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { UsersModule } from './modules/users/users.module';
import { RecurringTransactionsModule } from './modules/recurring-transactions/recurring-transactions.module';
import { SavingsGoalsModule } from './modules/savings-goals/savings-goals.module';
import { TagsModule } from './modules/tags/tags.module';
import { BudgetAlertsModule } from './modules/budget-alerts/budget-alerts.module';
import { DuplicateDetectionModule } from './modules/duplicate-detection/duplicate-detection.module';
import { BillRemindersModule } from './modules/bill-reminders/bill-reminders.module';
import { FinancialInsightsModule } from './modules/financial-insights/financial-insights.module';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module';
import { CreditCardsModule } from './modules/credit-cards/credit-cards.module';
import { SmartNotificationsModule } from './modules/smart-notifications/smart-notifications.module';
import { AnalyticsData, SpendingForecast } from './entities/analytics.entity';
import { SharedExpenseGroup, SharedExpense, GroupSettlement } from './entities/shared-expense.entity';
import { FinancialReport } from './entities/financial-report.entity';
import { Currency, MultiCurrencyWallet, ExchangeRateHistory } from './entities/multi-currency.entity';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SharedExpensesModule } from './modules/shared-expenses/shared-expenses.module';
import { FinancialReportsModule } from './modules/financial-reports/financial-reports.module';
import { MultiCurrencyModule } from './modules/multi-currency/multi-currency.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '1433')),
        username: configService.get('DB_USERNAME', 'sa'),
        password: configService.get('DB_PASSWORD', '123456789'),
        database: configService.get('DB_DATABASE', 'ExpenseTrackerDB'),
        entities: [User, Wallet, Category, Transaction, Budget, RecurringTransaction, SavingsGoal, Tag, BudgetAlert, BillReminder, BankAccount, CreditCard, SmartNotification, NotificationRule, AnalyticsData, SpendingForecast, SharedExpenseGroup, SharedExpense, GroupSettlement, FinancialReport, Currency, MultiCurrencyWallet, ExchangeRateHistory],
        synchronize: false,
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      }),
    }),
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
        },
      }),
    }),
    AuthModule,
    TransactionsModule,
    CategoriesModule,
    ReportsModule,
    NotificationsModule,
    WalletsModule,
    BudgetsModule,
    DashboardModule,
    UsersModule,
    RecurringTransactionsModule,
    SavingsGoalsModule,
    TagsModule,
    BudgetAlertsModule,
    DuplicateDetectionModule,
    BillRemindersModule,
    FinancialInsightsModule,
    BankAccountsModule,
    CreditCardsModule,
    SmartNotificationsModule,
    AnalyticsModule,
    SharedExpensesModule,
    FinancialReportsModule,
    MultiCurrencyModule,
  ],
})
export class AppModule {}
