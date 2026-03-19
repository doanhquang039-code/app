import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
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

  @Column()
  type: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}