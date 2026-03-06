import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Check,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

@Entity('users')
@Check(`"CHK_username_length"`, `"username" IS NULL OR length("username") >= 3`)
@Check(`"CHK_bio_length"`, `"bio" IS NULL OR length("bio") <= 1200`)
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ name: 'first_name', nullable: true, length: 100 })
  firstName: string;

  @Column({ name: 'last_name', nullable: true, length: 100 })
  lastName: string;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ nullable: true, length: 512 })
  avatar: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: 'last_login_at', nullable: true, type: 'timestamptz' })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    if (this.email) {
      this.email = this.email.toLowerCase();
    }
  }

  @BeforeInsert()
  validateFields() {
    if (this.username) {
      this.username = this.username.trim();
    }
  }
}
