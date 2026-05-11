import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity('monthly_statistics')
@Unique(['user_id', 'year', 'month'])
@Index(['user_id', 'year', 'month'])
export class MonthlyStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_income: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_expense: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  net_amount: number;

  @Column({ type: 'int', default: 0 })
  transaction_count: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  avg_daily_expense: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  savings_rate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  budget_adherence: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
