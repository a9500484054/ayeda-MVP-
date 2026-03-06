import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Check,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { RecipeCategory } from './recipe-category.entity';
import { RecipeStatus, RecipeType, Difficulty } from '../enums/recipe.enums';

export interface RecipePhoto {
  id: string;
  src: string;
}

export interface RecipeStep {
  sort: number;
  text: string;
  image?: string;
}

@Entity('recipes')
@Check(`"CHK_title_length"`, `"title" IS NULL OR length("title") >= 3`)
@Check(`"CHK_servings_positive"`, `"servings" IS NULL OR "servings" > 0`)
export class Recipe {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Борщ' })
  @Column({ length: 200 })
  title: string;

  @ApiProperty({ example: 'Традиционный русский суп', required: false })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 30,
    description: 'Время приготовления (мин)',
    required: false,
  })
  @Column({ name: 'cooking_time', nullable: true })
  cookingTime: number;

  @ApiProperty({
    example: 4,
    description: 'Количество порций',
    required: false,
  })
  @Column({ nullable: true })
  servings: number;

  @ApiProperty({
    example: 250,
    description: 'Калорийность на порцию',
    required: false,
  })
  @Column({ nullable: true })
  calories: number;

  @ApiProperty({ enum: Difficulty, example: Difficulty.MEDIUM })
  @Column({
    type: 'enum',
    enum: Difficulty,
    default: Difficulty.MEDIUM,
  })
  difficulty: Difficulty;

  @ApiProperty({ enum: RecipeStatus, example: RecipeStatus.DRAFT })
  @Column({
    type: 'enum',
    enum: RecipeStatus,
    default: RecipeStatus.DRAFT,
  })
  status: RecipeStatus;

  @ApiProperty({ enum: RecipeType, example: RecipeType.PERSONAL })
  @Column({
    type: 'enum',
    enum: RecipeType,
    default: RecipeType.PERSONAL,
  })
  type: RecipeType;

  @ApiProperty({
    example: { id: 'uuid', src: 'url' },
    required: false,
  })
  @Column({ type: 'jsonb', nullable: true })
  photo: RecipePhoto;

  @ApiProperty({ example: 'https://youtube.com/...', required: false })
  @Column({ length: 1024, nullable: true })
  video: string;

  @ApiProperty({
    example: [{ sort: 1, text: 'Шаг 1', image: 'url' }],
    required: false,
    type: 'array',
  })
  @Column({ type: 'jsonb', nullable: true })
  steps: RecipeStep[];

  @ApiProperty({ example: 'borshch-recept' })
  @Column({ name: 'src_path', length: 120, unique: true })
  srcPath: string;

  @ApiProperty({ example: 0 })
  @Column({ default: 0 })
  likes: number;

  @ApiProperty()
  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @OneToMany(() => RecipeIngredient, (ri) => ri.recipe, { cascade: true })
  ingredients: RecipeIngredient[];

  @OneToMany(() => RecipeCategory, (rc) => rc.recipe, { cascade: true })
  categories: RecipeCategory[];

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ required: false })
  @Column({ name: 'published_at', nullable: true })
  publishedAt: Date;

  @ApiProperty({ required: false })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // Полнотекстовый поиск (генерируется базой)
  // @Column({ type: 'tsvector', name: 'search_vector', select: false })
  // searchVector: any;
}
