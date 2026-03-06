import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('categories')
export class Category {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'soups', description: 'Уникальный код категории' })
  @Column({ unique: true, length: 20 })
  code: string;

  @ApiProperty({ example: 'Супы', description: 'Название категории' })
  @Column({ unique: true, length: 100 })
  name: string;

  @ApiProperty({ example: 'Первые блюда', required: false })
  @Column({ nullable: true })
  description: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
