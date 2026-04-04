import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Wallet } from './wallet.entity';
import { Category } from './category.entity';
import { Tag } from './tag.entity';

@Entity('Transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  walletId: number;

  @Column()
  categoryId: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column()
  type: string;

  @Column({ nullable: true })
  note: string;

  @Column()
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'walletId' })
  wallet: Wallet;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToMany(() => Tag, (tag) => tag.transactions, { cascade: true })
  @JoinTable({
    name: 'transaction_tags',
    joinColumn: { name: 'transactionId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
