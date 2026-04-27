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

@Entity('UserPoints')
export class UserPoints {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', default: 0 })
  totalPoints: number;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 0 })
  currentLevelPoints: number;

  @Column({ type: 'int', default: 100 })
  nextLevelPoints: number;

  @Column({ type: 'int', default: 0 })
  dailyStreak: number;

  @Column({ type: 'int', default: 0 })
  longestStreak: number;

  @Column({ type: 'datetime2', nullable: true })
  lastActivityDate: Date;

  @Column({ type: 'nvarchar', length: 100, default: 'Người mới' })
  rank: string; // 'Người mới', 'Đồng', 'Bạc', 'Vàng', 'Bạch kim', 'Kim cương', 'Huyền thoại'

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date;
}
