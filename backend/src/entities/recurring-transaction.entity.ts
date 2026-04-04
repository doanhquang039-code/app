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
import { Wallet } from './wallet.entity';
import { Category } from './category.entity';

@Entity('RecurringTransactions')
export class RecurringTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  walletId: number;

  @Column()
  categoryId: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column() // 'income' or 'expense'
  type: string;

  @Column({ nullable: true })
  note: string;

  @Column() // 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'
  frequency: string;

  @Column({ nullable: true }) // For monthly: day of month (1-31), for weekly: days (0-6)
  frequencyDay: string;

  @Column()
  startDate: Date;

  @Column({ nullable: true, type: 'datetime2' })
  endDate: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastExecutedDate: Date;

  @Column({ nullable: true })
  nextExecutionDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
