import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('UserFriends')
export class UserFriend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  friendId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'friendId' })
  friend: User;

  @Column({ type: 'nvarchar', length: 50, default: 'PENDING' })
  status: string; // 'PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED'

  @Column({ type: 'bit', default: false })
  canViewTransactions: boolean;

  @Column({ type: 'bit', default: false })
  canViewBudgets: boolean;

  @Column({ type: 'bit', default: false })
  canViewGoals: boolean;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @Column({ type: 'datetime2', nullable: true })
  acceptedAt: Date;
}
