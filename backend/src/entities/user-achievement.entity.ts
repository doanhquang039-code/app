import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Achievement } from './achievement.entity';

@Entity('UserAchievements')
export class UserAchievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  achievementId: number;

  @ManyToOne(() => Achievement)
  @JoinColumn({ name: 'achievementId' })
  achievement: Achievement;

  @Column({ type: 'int' })
  progress: number; // 0-100

  @Column({ type: 'bit', default: false })
  isUnlocked: boolean;

  @Column({ type: 'datetime2', nullable: true })
  unlockedAt: Date;

  @Column({ type: 'bit', default: false })
  isNotified: boolean;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;
}
