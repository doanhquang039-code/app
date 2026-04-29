import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { BankTransaction } from './bank-transaction.entity';

@Entity('BankAccounts')
export class BankAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  bankName: string;

  @Column()
  accountNumber: string;

  @Column()
  accountType: string; // CHECKING, SAVINGS, CREDIT_CARD

  @Column()
  accountHolderName: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  bankCode: string; // Bank identifier code

  @Column({ nullable: true })
  branchCode: string;

  @Column({ nullable: true })
  swiftCode: string;

  @Column({ nullable: true })
  iban: string;

  // Integration details
  @Column({ nullable: true })
  plaidAccessToken: string; // Plaid integration

  @Column({ nullable: true })
  plaidItemId: string;

  @Column({ nullable: true })
  plaidAccountId: string;

  @Column({ default: 'MANUAL' })
  connectionType: string; // MANUAL, PLAID, OPEN_BANKING, API

  @Column({ default: 'ACTIVE' })
  status: string; // ACTIVE, INACTIVE, DISCONNECTED, ERROR

  @Column({ default: true })
  autoSync: boolean;

  @Column({ type: 'datetime', nullable: true })
  lastSyncedAt: Date;

  @Column({ nullable: true })
  syncFrequency: string; // REALTIME, HOURLY, DAILY, WEEKLY

  @Column({ type: 'text', nullable: true })
  syncError: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => BankTransaction, (transaction) => transaction.bankAccount)
  transactions: BankTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
