import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('Investments')
export class Investment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column()
  type: string; // stock, crypto, mutual_fund, gold, real_estate, bond, savings_deposit

  @Column({ nullable: true })
  symbol: string;

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  buyPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  currentPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalInvested: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  currentValue: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  profitLoss: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  profitLossPercentage: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ nullable: true })
  platform: string;

  @Column()
  buyDate: Date;

  @Column({ nullable: true })
  sellDate: Date;

  @Column({ default: 'holding' })
  status: string; // holding, sold, matured

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  icon: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}

@Entity('InvestmentTransactions')
export class InvestmentTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  investmentId: number;

  @Column()
  userId: number;

  @Column()
  type: string; // buy, sell, dividend, interest

  @Column({ type: 'decimal', precision: 18, scale: 8, nullable: true })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  fee: number;

  @Column()
  transactionDate: Date;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Investment)
  @JoinColumn({ name: 'investmentId' })
  investment: Investment;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
