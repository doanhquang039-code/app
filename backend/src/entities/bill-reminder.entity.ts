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

@Entity('BillReminders')
export class BillReminder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  billName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column()
  dueDate: Date; // Ngày hóa đơn phải thanh toán

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  paidDate: Date;

  @Column({ default: 'upcoming' }) // 'upcoming', 'overdue', 'paid'
  status: string;

  @Column({ default: true })
  reminderEnabled: boolean;

  @Column({ type: 'int', default: 3 }) // Remind X days before
  remindDaysBefore: number;

  @Column({ default: false })
  reminderSent: boolean;

  @Column({ nullable: true })
  reminderSentDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
