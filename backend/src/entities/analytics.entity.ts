import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('AnalyticsData')
export class AnalyticsData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  date: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalIncome: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalExpense: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  savingsAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  savingsRatePercentage: number;

  @Column({ nullable: true })
  period: string; // daily, weekly, monthly, yearly

  @Column({ type: 'text', nullable: true })
  categoryBreakdown: string; // JSON - category-wise spending

  @Column({ type: 'text', nullable: true })
  trends: string; // JSON - trend data

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}

@Entity('SpendingForecasts')
export class SpendingForecast {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  categoryId: number;

  @Column()
  month: number; // 1-12

  @Column()
  year: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  predictedAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  actualAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  confidence: number; // 0-100

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
