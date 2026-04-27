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
import { Category } from './category.entity';

@Entity('Subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'nvarchar', length: 10 })
  currency: string;

  @Column({ type: 'nvarchar', length: 50 })
  billingCycle: string; // 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'datetime2' })
  startDate: Date;

  @Column({ type: 'datetime2', nullable: true })
  endDate: Date;

  @Column({ type: 'datetime2' })
  nextBillingDate: Date;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  provider: string; // Netflix, Spotify, etc.

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  website: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  icon: string;

  @Column({ type: 'nvarchar', length: 50, default: 'ACTIVE' })
  status: string; // 'ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED'

  @Column({ type: 'bit', default: true })
  autoRenew: boolean;

  @Column({ type: 'bit', default: true })
  reminderEnabled: boolean;

  @Column({ type: 'int', default: 3 })
  reminderDaysBefore: number;

  @Column({ type: 'bit', default: false })
  reminderSent: boolean;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalPaid: number;

  @Column({ type: 'int', default: 0 })
  paymentCount: number;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date;
}
