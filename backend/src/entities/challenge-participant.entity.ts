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
import { SpendingChallenge } from './spending-challenge.entity';

@Entity('ChallengeParticipants')
export class ChallengeParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  challengeId: number;

  @ManyToOne(() => SpendingChallenge)
  @JoinColumn({ name: 'challengeId' })
  challenge: SpendingChallenge;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  currentAmount: number;

  @Column({ type: 'int', default: 0 })
  progress: number; // 0-100

  @Column({ type: 'nvarchar', length: 50, default: 'IN_PROGRESS' })
  status: string; // 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'QUIT'

  @Column({ type: 'datetime2', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', default: 0 })
  rank: number;

  @CreateDateColumn({ type: 'datetime2' })
  joinedAt: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date;
}
