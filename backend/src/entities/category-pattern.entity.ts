import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, Unique } from 'typeorm';

@Entity('category_patterns')
@Unique(['user_id', 'category_id', 'year', 'month'])
@Index(['user_id', 'year', 'month'])
@Index(['category_id'])
export class CategoryPattern {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'int' })
  category_id: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_amount: number;

  @Column({ type: 'int', default: 0 })
  transaction_count: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  avg_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentage_of_total: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  trend: string; // INCREASING, DECREASING, STABLE

  @CreateDateColumn()
  created_at: Date;
}
