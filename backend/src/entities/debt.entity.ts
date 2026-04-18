import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('Debts')
export class Debt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  type: string; // 'lend' or 'borrow'

  @Column()
  personName: string;

  @Column({ nullable: true })
  personPhone: string;

  @Column({ nullable: true })
  personEmail: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestRate: number;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ default: 'active' })
  status: string; // active, paid, overdue, cancelled

  @Column({ default: true })
  reminderEnabled: boolean;

  @Column({ type: 'int', default: 3 })
  reminderDaysBefore: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}

@Entity('DebtPayments')
export class DebtPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  debtId: number;

  @Column()
  userId: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column()
  paymentDate: Date;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Debt)
  @JoinColumn({ name: 'debtId' })
  debt: Debt;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
