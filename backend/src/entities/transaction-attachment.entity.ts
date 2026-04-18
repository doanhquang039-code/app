import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from './transaction.entity';
import { User } from './user.entity';

@Entity('TransactionAttachments')
export class TransactionAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transactionId: number;

  @Column()
  userId: number;

  @Column()
  fileName: string;

  @Column()
  fileUrl: string;

  @Column()
  fileType: string; // image/jpeg, image/png, application/pdf

  @Column({ nullable: true })
  fileSize: number;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
