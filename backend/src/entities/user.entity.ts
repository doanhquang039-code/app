import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  password: string | null;

  @Column()
  fullName: string;

  @Column({ unique: true })
  username: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  authProvider?: string;

  @Column({ nullable: true })
  socialProviderId?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'nvarchar', length: 20, default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;
}
