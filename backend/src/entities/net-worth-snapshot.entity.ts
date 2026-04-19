import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('NetWorthSnapshots')
export class NetWorthSnapshot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'date' })
  snapshotDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  walletTotal: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  bankTotal: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  investmentTotal: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  receivablesTotal: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  borrowingsTotal: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  creditCardDebtTotal: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  netWorth: number;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
