import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('CreditCards')
export class CreditCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  cardholderName: string;

  @Column()
  cardNumber: string; // Store encrypted

  @Column()
  cardType: string; // Visa, MasterCard, AmEx, etc.

  @Column()
  issuingBank: string;

  @Column()
  expiryMonth: number;

  @Column()
  expiryYear: number;

  @Column()
  cvv: string; // Store encrypted

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  creditLimit: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  interestRate: number; // Annual percentage rate

  @Column({ type: 'int', nullable: true })
  billingCycleDayOfMonth: number;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  linkedWalletId: number; // For tracking card payments

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
