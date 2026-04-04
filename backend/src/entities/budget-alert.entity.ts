import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Budget } from './budget.entity';

@Entity('BudgetAlerts')
export class BudgetAlert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  budgetId: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  thresholdPercentage: number; // e.g., 80 means alert at 80% spent

  @Column({ default: true })
  enabled: boolean;

  @Column({ default: false })
  notified: boolean; // Has user been notified?

  @Column({ nullable: true })
  lastNotificationDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Budget)
  @JoinColumn({ name: 'budgetId' })
  budget: Budget;
}
