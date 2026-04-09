import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('FinancialReports')
export class FinancialReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  month: number; // 1-12

  @Column()
  year: number;

  @Column()
  reportType: string; // MONTHLY, QUARTERLY, YEARLY, CUSTOM

  @Column({ type: 'text' })
  reportData: string; // JSON - complete report structure

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalIncome: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  totalExpense: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  netSavings: number;

  @Column({ nullable: true })
  filePath: string;

  @Column({ default: 'pending' })
  status: string; // pending, generated, sent

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
