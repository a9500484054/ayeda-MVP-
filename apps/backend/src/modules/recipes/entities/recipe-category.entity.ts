import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Recipe } from './recipe.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('recipe_categories')
export class RecipeCategory {
  @ApiProperty()
  @PrimaryColumn({ name: 'recipe_id' })
  recipeId: string;

  @ApiProperty()
  @PrimaryColumn({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Recipe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
