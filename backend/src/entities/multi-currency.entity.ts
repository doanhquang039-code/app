import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Wallet } from './wallet.entity';

@Entity('Currencies')
export class Currency {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // USD, EUR, VND, etc.

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, default: 1 })
  exchangeRate: number; // to base currency (USD)

  @Column({ nullable: true })
  icon: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('MultiCurrencyWallets')
export class MultiCurrencyWallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  walletId: number;

  @Column()
  currencyCode: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;
}

@Entity('ExchangeRateHistories')
export class ExchangeRateHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fromCurrency: string;

  @Column()
  toCurrency: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  rate: number;

  @Column()
  date: Date;

  @CreateDateColumn()
  createdAt: Date;
}
