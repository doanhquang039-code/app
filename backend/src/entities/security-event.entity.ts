import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('security_events')
@Index(['user_id', 'created_at'])
@Index(['severity', 'is_resolved'])
@Index(['event_type'])
export class SecurityEvent {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Column({ type: 'varchar', length: 50 })
  event_type: string; // SUSPICIOUS_LOGIN, PASSWORD_CHANGE, etc.

  @Column({ type: 'varchar', length: 20 })
  severity: string; // LOW, MEDIUM, HIGH, CRITICAL

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_address: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  user_agent: string;

  @Column({ type: 'bit', default: false })
  is_resolved: boolean;

  @Column({ type: 'datetime', nullable: true })
  resolved_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
