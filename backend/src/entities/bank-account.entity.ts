import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('BankAccounts')
export class BankAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  bankName: string;

  @Column()
  accountNumber: string;

  @Column()
  accountHolder: string;

  @Column({ nullable: true })
  accountType: string; // Savings, Checking, BusinessAccount

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({ nullable: true })
  branchCode: string;

  @Column({ nullable: true })
  ifscCode: string;

  @Column({ nullable: true })
  routingNumber: string;

  @Column({ nullable: true })
  swiftCode: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  linkedWalletId: number; // Link to wallet for auto-sync

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
