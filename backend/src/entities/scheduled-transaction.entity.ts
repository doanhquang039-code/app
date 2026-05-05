import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Wallet } from './wallet.entity';

@Entity('ScheduledTransactions')
export class ScheduledTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column()
  type: string; // INCOME, EXPENSE

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  walletId: number;

  @ManyToOne(() => Wallet, { nullable: true })
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Scheduling
  @Column()
  frequency: string; // DAILY, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, YEARLY, CUSTOM

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'int', nullable: true })
  occurrences: number; // Number of times to repeat

  @Column({ type: 'int', default: 0 })
  executedCount: number;

  @Column({ type: 'date', nullable: true })
  nextExecutionDate: Date;

  @Column({ type: 'date', nullable: true })
  lastExecutionDate: Date;

  // Custom scheduling (cron-like)
  @Column({ nullable: true })
  customPattern: string; // e.g., "every 2 weeks on Monday"

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  daysOfWeek: string; // JSON string: '[1,3,5]' for Mon, Wed, Fri

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  daysOfMonth: string; // JSON string: '[1,15]' for 1st and 15th

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  monthsOfYear: string; // JSON string: '[1,6,12]' for Jan, Jun, Dec

  // Smart features
  @Column({ default: false })
  useAIOptimization: boolean; // AI suggests best execution time

  @Column({ default: false })
  adjustForWeekends: boolean; // Move to next business day

  @Column({ default: false })
  adjustForHolidays: boolean;

  @Column({ default: false })
  notifyBeforeExecution: boolean;

  @Column({ type: 'int', default: 24 })
  notificationHoursBefore: number;

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, PAUSED, COMPLETED, CANCELLED

  @Column({ default: true })
  autoExecute: boolean;

  @Column({ type: 'text', nullable: true })
  executionError: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
