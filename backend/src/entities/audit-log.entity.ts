import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('AuditLogs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  action: string; // CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT

  @Column()
  entityType: string; // Transaction, Budget, Wallet, etc.

  @Column({ nullable: true })
  entityId: number;

  @Column({ type: 'text', nullable: true })
  oldValue: string; // JSON

  @Column({ type: 'text', nullable: true })
  newValue: string; // JSON

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
