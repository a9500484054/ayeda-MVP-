import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  IsOptional,
  IsObject,
} from 'class-validator';
import * as ingredientEntity from '../entities/ingredient.entity';

export class CreateIngredientDto {
  @ApiProperty({ example: 'milk', description: 'Уникальный код' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Молоко', description: 'Название' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  unitId: string;

  @ApiProperty({
    example: { calories: 50, proteins: 3.5, fats: 2.5, carbohydrates: 4.8 },
    required: false,
    description: 'Пищевая ценность',
  })
  @IsObject()
  @IsOptional()
  nutritionInfo?: ingredientEntity.NutritionInfo;
}
