import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('error_logs')
@Index(['severity', 'is_resolved'])
@Index(['created_at'])
@Index(['user_id'])
export class ErrorLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  error_type: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  error_message: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  stack_trace: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  endpoint: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  request_data: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  severity: string; // LOW, MEDIUM, HIGH, CRITICAL

  @Column({ type: 'bit', default: false })
  is_resolved: boolean;

  @Column({ type: 'datetime', nullable: true })
  resolved_at: Date;

  @Column({ type: 'int', nullable: true })
  resolved_by: number;

  @CreateDateColumn()
  created_at: Date;
}
