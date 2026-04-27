import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { Transaction } from './transaction.entity';

@Entity('SubscriptionPayments')
export class SubscriptionPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subscriptionId: number;

  @ManyToOne(() => Subscription)
  @JoinColumn({ name: 'subscriptionId' })
  subscription: Subscription;

  @Column({ nullable: true })
  transactionId: number;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'datetime2' })
  paymentDate: Date;

  @Column({ type: 'datetime2' })
  dueDate: Date;

  @Column({ type: 'nvarchar', length: 50, default: 'PENDING' })
  status: string; // 'PENDING', 'PAID', 'FAILED', 'SKIPPED'

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  paymentMethod: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  notes: string;

  @Column({ type: 'bit', default: false })
  isAutomatic: boolean;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;
}
