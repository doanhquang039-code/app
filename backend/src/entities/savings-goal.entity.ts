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

@Entity('SavingsGoals')
export class SavingsGoal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  walletId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  targetAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  currentAmount: number;

  @Column({ nullable: true })
  icon: string;

  @Column()
  startDate: Date;

  @Column({ nullable: true, type: 'datetime2' })
  targetDate: Date | null;

  @Column({ default: 'active' }) // 'active', 'completed', 'paused', 'cancelled'
  status: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  progressPercentage: number;

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
}
