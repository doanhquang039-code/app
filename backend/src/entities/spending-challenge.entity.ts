import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('SpendingChallenges')
export class SpendingChallenge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  creatorId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ type: 'nvarchar', length: 1000 })
  description: string;

  @Column({ type: 'nvarchar', length: 100 })
  challengeType: string; // 'SAVINGS', 'SPENDING_LIMIT', 'NO_SPEND', 'CATEGORY_LIMIT'

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  targetAmount: number;

  @Column({ type: 'datetime2' })
  startDate: Date;

  @Column({ type: 'datetime2' })
  endDate: Date;

  @Column({ type: 'nvarchar', length: 50, default: 'ACTIVE' })
  status: string; // 'ACTIVE', 'COMPLETED', 'CANCELLED'

  @Column({ type: 'bit', default: false })
  isPublic: boolean;

  @Column({ type: 'int', default: 0 })
  participantCount: number;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  icon: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  rules: string; // JSON

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date;
}
