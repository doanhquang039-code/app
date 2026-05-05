import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('ThirdPartyIntegrations')
export class ThirdPartyIntegration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  provider: string; // PLAID, STRIPE, PAYPAL, GOOGLE_SHEETS, ZAPIER, IFTTT

  @Column()
  providerName: string;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ type: 'datetime', nullable: true })
  tokenExpiresAt: Date;

  @Column({ nullable: true })
  accountId: string;

  @Column({ nullable: true })
  accountEmail: string;

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, INACTIVE, ERROR, EXPIRED

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  permissions: string; // JSON string of permissions

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  settings: string; // Provider-specific settings

  @Column({ default: true })
  autoSync: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastSyncedAt: Date;

  @Column({ type: 'text', nullable: true })
  syncError: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
