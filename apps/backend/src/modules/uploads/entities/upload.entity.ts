import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

@Entity('uploads')
export class Upload {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ example: '/uploads/recipes/123/image.jpg' })
  @Column({ length: 512 })
  path: string;

  @ApiProperty({ example: 'recipe.jpg' })
  @Column({ name: 'original_name', length: 255 })
  originalName: string;

  @ApiProperty({ example: 'image/jpeg' })
  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @ApiProperty({ example: 1024000 })
  @Column({ type: 'bigint' })
  size: number;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
