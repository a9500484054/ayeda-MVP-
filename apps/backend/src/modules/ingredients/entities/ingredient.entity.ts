import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Unit } from '../../units/entities/unit.entity';

export interface NutritionInfo {
  calories?: number;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
  fiber?: number;
  sugar?: number;
  [key: string]: number | undefined; // для других полей
}

@Entity('ingredients')
export class Ingredient {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'milk', description: 'Уникальный код ингредиента' })
  @Column({ unique: true, length: 20 })
  code: string;

  @ApiProperty({ example: 'Молоко', description: 'Название ингредиента' })
  @Column({ type: 'citext' })
  name: string;

  @ApiProperty({ type: () => Unit, description: 'Единица измерения' })
  @ManyToOne(() => Unit, { eager: true })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column({ name: 'unit_id' })
  unitId: string;

  @ApiProperty({
    example: { calories: 50, proteins: 3.5, fats: 2.5, carbohydrates: 4.8 },
    description: 'Пищевая ценность',
    type: 'object',
    properties: {
      calories: { type: 'number', example: 50 },
      proteins: { type: 'number', example: 3.5 },
      fats: { type: 'number', example: 2.5 },
      carbohydrates: { type: 'number', example: 4.8 },
    },
    required: ['calories', 'proteins', 'fats', 'carbohydrates'],
  })
  @Column({ type: 'jsonb', name: 'nutrition_info', default: {} })
  nutritionInfo: NutritionInfo;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
