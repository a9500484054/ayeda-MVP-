import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';

export interface ArticleStep {
  id: string;
  text: string;
  image?: string | null;
  sort: number;
}

@Entity('articles')
export class Article {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 200, unique: true })
  slug: string;

  @ApiProperty({ nullable: true })
  @Column({ type: 'text', nullable: true })
  content: string | null;

  @ApiProperty({ type: 'jsonb', nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  steps: ArticleStep[] | null;

  @ApiProperty({ nullable: true })
  @Column({ type: 'varchar', length: 500, nullable: true })
  excerpt: string | null;

  @ApiProperty({ nullable: true })
  @Column({ name: 'featured_image', type: 'varchar', length: 500, nullable: true })
  featuredImage: string | null;

  @ApiProperty({ type: [String], nullable: true })
  @Column({ type: 'text', array: true, nullable: true })
  categories: string[] | null;

  @ApiProperty({ default: 'article' })
  @Column({ type: 'varchar', length: 20, default: 'article' })
  type: string;

  @ApiProperty({ default: 'draft' })
  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string;

  @ApiProperty({ default: 0 })
  @Column({ type: 'integer', default: 0 })
  views: number;

  @ApiProperty({ nullable: true, type: 'object', additionalProperties: true })
  @Column({ type: 'jsonb', nullable: true })
  seo: any;

  @ApiProperty({ nullable: true })
  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz' })
  deletedAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  author: User;
}
