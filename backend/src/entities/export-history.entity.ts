import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('ExportHistory')
export class ExportHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'nvarchar', length: 100 })
  exportType: string; // 'EXCEL', 'CSV', 'PDF', 'JSON'

  @Column({ type: 'nvarchar', length: 255 })
  fileName: string;

  @Column({ type: 'nvarchar', length: 500 })
  filePath: string;

  @Column({ type: 'nvarchar', length: 100 })
  dataType: string; // 'TRANSACTIONS', 'BUDGETS', 'REPORTS', 'ALL'

  @Column({ type: 'datetime2', nullable: true })
  startDate: Date;

  @Column({ type: 'datetime2', nullable: true })
  endDate: Date;

  @Column({ type: 'int' })
  recordCount: number;

  @Column({ type: 'bigint' })
  fileSize: number; // bytes

  @Column({ type: 'nvarchar', length: 50, default: 'COMPLETED' })
  status: string; // 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  errorMessage: string;

  @CreateDateColumn({ type: 'datetime2' })
  createdAt: Date;

  @Column({ type: 'datetime2', nullable: true })
  expiresAt: Date; // File auto-delete after 7 days
}
