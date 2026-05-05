import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('VoiceCommands')
export class VoiceCommand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text' })
  originalText: string;

  @Column({ type: 'text', nullable: true })
  processedText: string;

  @Column()
  intent: string; // ADD_TRANSACTION, GET_BALANCE, VIEW_BUDGET, etc.

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  entities: string; // JSON string of extracted entities

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence: number; // 0-100

  @Column({ default: 'PENDING' })
  status: string; // PENDING, PROCESSING, COMPLETED, FAILED

  @Column({ nullable: true })
  actionTaken: string; // What action was performed

  @Column({ type: 'int', nullable: true })
  relatedEntityId: number; // ID of created transaction, etc.

  @Column({ nullable: true })
  relatedEntityType: string; // TRANSACTION, BUDGET, etc.

  @Column({ type: 'text', nullable: true })
  response: string; // Response to user

  @Column({ nullable: true })
  audioFilePath: string; // Path to audio file if stored

  @Column({ type: 'int', nullable: true })
  audioDuration: number; // Duration in seconds

  @Column({ nullable: true })
  language: string; // en, vi, etc.

  @Column({ nullable: true })
  deviceType: string; // MOBILE, WEB, SMART_SPEAKER

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
