import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('query_cache')
@Index(['cache_key'], { unique: true })
@Index(['expires_at'])
@Index(['user_id'])
export class QueryCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, unique: true })
  cache_key: string;

  @Column({ type: 'nvarchar', length: 'MAX' })
  cache_value: string;

  @Column({ type: 'int', nullable: true })
  user_id: number;

  @Column({ type: 'datetime' })
  expires_at: Date;

  @Column({ type: 'int', default: 0 })
  hit_count: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
