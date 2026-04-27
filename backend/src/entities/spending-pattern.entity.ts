import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('SpendingPatterns')
export class SpendingPattern {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'nvarchar', length: 100 })
  patternType: string; // 'RECURRING', 'SEASONAL', 'ANOMALY', 'TREND'

  @Column({ type: 'nvarchar', length: 255 })
  category: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  averageAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  minAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  maxAmount: number;

  @Column({ type: 'int' })
  frequency: number; // Times per month

  @Column({ type: 'nvarchar', length: 100 })
  timePattern: string; // 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY'

  @Column({ type: 'int', nullable: true })
  dayOfWeek: number; // 0-6 for weekly patterns

  @Column({ type: 'int', nullable: true })
  dayOfMonth: number; // 1-31 for monthly patterns

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  confidence: number; // 0-100

  @Column({ type: 'nvarchar', length: 'MAX' })
  insights: string; // JSON with detailed insights

  @Column({ type: 'datetime2' })
  periodStart: Date;

  @Column({ type: 'datetime2' })
  periodEnd: Date;

  @Column({ type: 'int', default: 0 })
  occurrences: number;

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date;
}
