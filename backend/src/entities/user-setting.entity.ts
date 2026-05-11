import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, Unique } from 'typeorm';

@Entity('user_settings')
@Unique(['user_id', 'setting_key'])
@Index(['user_id'])
export class UserSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'varchar', length: 100 })
  setting_key: string;

  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  setting_value: string;

  @Column({ type: 'varchar', length: 20, default: 'string' })
  setting_type: string; // string, number, boolean, json

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
