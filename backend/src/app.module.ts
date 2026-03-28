import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { Category } from './entities/category.entity';
import { Transaction } from './entities/transaction.entity';
import { AuthModule } from './modules/auth/auth.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CategoriesModule } from './modules/categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: '123456789',
      database: 'ExpenseTrackerDB',
      entities: [User, Wallet, Category, Transaction],
      synchronize: false,
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    }),
    AuthModule,
    TransactionsModule,
    CategoriesModule, // ← thêm vào đây
  ],
})
export class AppModule {}
