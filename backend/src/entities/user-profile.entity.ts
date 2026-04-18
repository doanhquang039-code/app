import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('UserProfiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ default: 'VND' })
  defaultCurrency: string;

  @Column({ default: 'vi' })
  language: string;

  @Column({ default: 'Asia/Ho_Chi_Minh' })
  timezone: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  monthlyIncomeTarget: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  monthlyExpenseLimit: number;

  @Column({ default: true })
  notificationEnabled: boolean;

  @Column({ default: true })
  emailNotification: boolean;

  @Column({ default: true })
  darkMode: boolean;

  @Column({ default: false })
  biometricEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
