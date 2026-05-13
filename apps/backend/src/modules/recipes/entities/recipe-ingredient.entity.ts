import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Recipe } from './recipe.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { Unit } from 'src/modules/units/entities/unit.entity';

@Entity('recipe_ingredients')
export class RecipeIngredient {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recipe_id' })
  recipeId: string;

  @ManyToOne(() => Recipe, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe;

  @Column({ name: 'ingredient_id' })
  ingredientId: string;

  @ManyToOne(() => Ingredient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'ingredient_id' })
  ingredient: Ingredient;

  @Column({ name: 'unit_id', nullable: true }) // ← Добавляем колонку если её нет
  unitId?: string;

  @ManyToOne(() => Unit, { onDelete: 'RESTRICT', nullable: true }) // ← Добавляем связь с Unit
  @JoinColumn({ name: 'unit_id' })
  unit?: Unit;

  @ApiProperty({ example: 200, description: 'Количество' })
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ example: 'по вкусу', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;
}
