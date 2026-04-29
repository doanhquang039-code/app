import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BankAccount } from './bank-account.entity';
import { Transaction } from './transaction.entity';

@Entity('BankTransactions')
export class BankTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bankAccountId: number;

  @ManyToOne(() => BankAccount, (account) => account.transactions)
  @JoinColumn({ name: 'bankAccountId' })
  bankAccount: BankAccount;

  @Column({ nullable: true })
  transactionId: number; // Linked to Transaction entity

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column()
  externalTransactionId: string; // Bank's transaction ID

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column({ type: 'datetime', nullable: true })
  postedDate: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column()
  type: string; // DEBIT, CREDIT

  @Column()
  description: string;

  @Column({ nullable: true })
  merchantName: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  balance: number; // Balance after transaction

  @Column({ default: 'PENDING' })
  status: string; // PENDING, POSTED, CANCELLED

  @Column({ default: false })
  isReconciled: boolean; // Matched with manual transaction

  @Column({ default: false })
  isDuplicate: boolean;

  @Column({ nullable: true })
  duplicateOfId: number;

  @Column({ type: 'text', nullable: true })
  rawData: string; // Original data from bank

  @Column({ type: 'text', nullable: true })
  metadata: string; // Additional metadata

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
