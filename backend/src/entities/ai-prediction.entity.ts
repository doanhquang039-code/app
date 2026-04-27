import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('AIPredictions')
export class AIPrediction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'nvarchar', length: 100 })
  predictionType: string; // 'SPENDING', 'SAVINGS', 'BUDGET_RISK', 'GOAL_ACHIEVEMENT'

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  category: string;

  @Column({ type: 'datetime2' })
  targetDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  predictedAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  actualAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  confidence: number; // 0-100

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  accuracy: number; // Calculated after actual data is available

  @Column({ type: 'nvarchar', length: 'MAX' })
  factors: string; // JSON with factors affecting prediction

  @Column({ type: 'nvarchar', length: 'MAX' })
  recommendations: string; // JSON with AI recommendations

  @Column({ type: 'nvarchar', length: 50, default: 'PENDING' })
  status: string; // 'PENDING', 'VALIDATED', 'EXPIRED'

  @Column({ type: 'bit', default: false })
  isNotified: boolean;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;
}
