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
import { Transaction } from './transaction.entity';

@Entity('Receipts')
export class Receipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  transactionId: number;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column()
  fileType: string; // IMAGE, PDF

  @Column({ type: 'int' })
  fileSize: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  // OCR extracted data
  @Column({ nullable: true })
  merchantName: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalAmount: number;

  @Column({ type: 'date', nullable: true })
  receiptDate: Date;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  taxAmount: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  items: string; // JSON string of line items

  @Column({ type: 'text', nullable: true })
  rawText: string; // Full OCR text

  @Column({ default: 'PENDING' })
  ocrStatus: string; // PENDING, PROCESSING, COMPLETED, FAILED

  @Column({ type: 'int', default: 0 })
  ocrConfidence: number; // 0-100

  @Column({ type: 'text', nullable: true })
  ocrError: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isLinked: boolean; // Linked to transaction

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  metadata: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
