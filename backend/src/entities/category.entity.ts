import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('Categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  color: string; // VD: #FF5733

  @Column()
  type: string; // 'income' | 'expense'

  @Column({ nullable: true })
  parentId: number; // null = category cha

  @Column({ default: false })
  isDefault: boolean; // true = hiển thị cho tất cả user

  @Column({ default: true })
  isActive: boolean; // false = đã ẩn

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.children)
  @JoinColumn({ name: 'parentId' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}
