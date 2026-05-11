import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('login_history')
@Index(['user_id', 'created_at'])
@Index(['ip_address'])
@Index(['is_successful'])
export class LoginHistory {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'varchar', length: 20 })
  login_type: string; // password, google, facebook

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_address: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  user_agent: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location: string; // City, Country

  @Column({ type: 'varchar', length: 50, nullable: true })
  device_type: string; // mobile, desktop, tablet

  @Column({ type: 'bit' })
  is_successful: boolean;

  @Column({ type: 'varchar', length: 200, nullable: true })
  failure_reason: string;

  @CreateDateColumn()
  created_at: Date;
}
