import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('api_logs')
@Index(['user_id', 'created_at'])
@Index(['endpoint'])
@Index(['status_code'])
@Index(['created_at'])
export class ApiLog {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Column({ type: 'varchar', length: 500 })
  endpoint: string;

  @Column({ type: 'varchar', length: 10 })
  method: string;

  @Column({ type: 'int', nullable: true })
  status_code: number;

  @Column({ type: 'int', nullable: true })
  response_time_ms: number;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  request_body: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  response_body: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_address: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  user_agent: string;

  @CreateDateColumn()
  created_at: Date;
}
