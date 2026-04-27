import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('PointsHistory')
export class PointsHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'nvarchar', length: 100 })
  action: string; // 'TRANSACTION_ADDED', 'BUDGET_CREATED', 'GOAL_ACHIEVED', 'DAILY_LOGIN', etc.

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  description: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  metadata: string; // JSON

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;
}
