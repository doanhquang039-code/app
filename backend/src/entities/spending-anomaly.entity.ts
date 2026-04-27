import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';

@Entity('SpendingAnomalies')
export class SpendingAnomaly {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  transactionId: number;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column({ type: 'nvarchar', length: 100 })
  anomalyType: string; // 'UNUSUAL_AMOUNT', 'UNUSUAL_FREQUENCY', 'UNUSUAL_TIME', 'UNUSUAL_CATEGORY'

  @Column({ type: 'nvarchar', length: 50 })
  severity: string; // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  expectedAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  deviationPercentage: number;

  @Column({ type: 'nvarchar', length: 255 })
  category: string;

  @Column({ type: 'nvarchar', length: 1000 })
  description: string;

  @Column({ type: 'nvarchar', length: 'MAX' })
  analysis: string; // JSON with detailed analysis

  @Column({ type: 'nvarchar', length: 50, default: 'UNREVIEWED' })
  status: string; // 'UNREVIEWED', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_POSITIVE'

  @Column({ type: 'bit', default: false })
  isNotified: boolean;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  userNote: string;

  @CreateDateColumn({ type: 'datetime2' })
  detectedAt: Date;

  @Column({ type: 'datetime2', nullable: true })
  reviewedAt: Date;
}
