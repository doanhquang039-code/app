import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('user_preferences')
@Index(['user_id'], { unique: true })
export class UserPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  user_id: number;

  @Column({ type: 'varchar', length: 20, default: 'light' })
  theme: string; // light, dark, auto

  @Column({ type: 'varchar', length: 10, default: 'vi' })
  language: string; // vi, en

  @Column({ type: 'varchar', length: 10, default: 'VND' })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: 'DD/MM/YYYY' })
  date_format: string;

  @Column({ type: 'varchar', length: 20, default: '24h' })
  time_format: string;

  @Column({ type: 'bit', default: true })
  notification_email: boolean;

  @Column({ type: 'bit', default: false })
  notification_sms: boolean;

  @Column({ type: 'bit', default: true })
  notification_push: boolean;

  @Column({ type: 'bit', default: true })
  notification_in_app: boolean;

  @Column({ type: 'int', default: 80 })
  budget_alert_threshold: number; // Percentage

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 100000 })
  low_balance_alert: number;

  @Column({ type: 'bit', default: true })
  weekly_report: boolean;

  @Column({ type: 'bit', default: true })
  monthly_report: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
