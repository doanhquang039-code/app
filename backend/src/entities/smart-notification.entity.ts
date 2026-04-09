import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('SmartNotifications')
export class SmartNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column()
  type: string; // BUDGET_ALERT, SPENDING_PATTERN, SAVINGS_GOAL, BILL_DUE, CREDIT_CARD, RECURRING, ANOMALY

  @Column({ nullable: true })
  severity: string; // INFO, WARNING, DANGER

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  actionUrl: string;

  @Column({ nullable: true })
  metadata: string; // JSON string with additional data

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}

@Entity('NotificationRules')
export class NotificationRule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  ruleName: string;

  @Column()
  ruleType: string; // BUDGET_THRESHOLD, SPENDING_ANOMALY, RECURRING_REMINDER, CREDIT_USAGE, GOAL_PROGRESS

  @Column({ type: 'text' })
  condition: string; // JSON string with condition logic

  @Column({ type: 'text', nullable: true })
  action: string; // JSON string with action logic

  @Column({ default: true })
  isEnabled: boolean;

  @Column({ nullable: true })
  frequency: string; // ONCE, DAILY, WEEKLY, MONTHLY

  @Column({ nullable: true })
  notificationChannel: string; // EMAIL, IN_APP, SMS, PUSH

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
