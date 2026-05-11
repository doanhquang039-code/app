import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('session_cache')
@Index(['session_id'], { unique: true })
@Index(['user_id'])
@Index(['expires_at'])
export class SessionCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, unique: true })
  session_id: string;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  session_data: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_address: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  user_agent: string;

  @Column({ type: 'datetime', default: () => 'GETDATE()' })
  last_activity: Date;

  @Column({ type: 'datetime' })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
