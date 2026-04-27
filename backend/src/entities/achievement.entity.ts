import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Achievements')
export class Achievement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'nvarchar', length: 255 })
  name: string;

  @Column({ type: 'nvarchar', length: 1000 })
  description: string;

  @Column({ type: 'nvarchar', length: 100 })
  category: string; // 'SAVINGS', 'BUDGETING', 'TRACKING', 'STREAK', 'MILESTONE'

  @Column({ type: 'nvarchar', length: 255 })
  icon: string;

  @Column({ type: 'nvarchar', length: 50 })
  rarity: string; // 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'nvarchar', length: 'MAX' })
  criteria: string; // JSON string with achievement criteria

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime2' })
  updatedAt: Date;
}
