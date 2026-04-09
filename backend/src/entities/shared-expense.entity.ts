import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';

@Entity('SharedExpenseGroups')
export class SharedExpenseGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupName: string;

  @Column()
  ownerId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'group_members',
    joinColumn: { name: 'groupId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  members: User[];
}

@Entity('SharedExpenses')
export class SharedExpense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;

  @Column()
  paidByUserId: number;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  splits: string; // JSON - userId: amount pairs

  @Column({ nullable: true })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => SharedExpenseGroup)
  @JoinColumn({ name: 'groupId' })
  group: SharedExpenseGroup;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'paidByUserId' })
  paidByUser: User;
}

@Entity('GroupSettlements')
export class GroupSettlement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  groupId: number;

  @Column()
  fromUserId: number;

  @Column()
  toUserId: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ default: false })
  isSettled: boolean;

  @Column({ nullable: true })
  settledDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => SharedExpenseGroup)
  @JoinColumn({ name: 'groupId' })
  group: SharedExpenseGroup;
}
