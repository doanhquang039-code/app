import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity('daily_statistics')
@Unique(['user_id', 'stat_date'])
@Index(['user_id', 'stat_date'])
@Index(['stat_date'])
export class DailyStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'date' })
  stat_date: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_income: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_expense: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  net_amount: number;

  @Column({ type: 'int', default: 0 })
  transaction_count: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  avg_transaction_amount: number;

  @Column({ type: 'int', nullable: true })
  top_category_id: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  top_category_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
