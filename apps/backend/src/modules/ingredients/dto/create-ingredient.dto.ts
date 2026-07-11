import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsUUID,
  IsOptional,
  IsObject,
  IsUrl,
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

  @ApiPropertyOptional({
    example: 'Свежее пастеризованное молоко 3.2% жирности',
    description: 'Описание ингредиента',
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/milk.jpg',
    description: 'URL фото ингредиента',
  })
  @IsUrl()
  @IsOptional()
  @MaxLength(512)
  photo?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  unitId: string;

  @ApiPropertyOptional({
    example: { calories: 50, proteins: 3.5, fats: 2.5, carbohydrates: 4.8 },
    description: 'Пищевая ценность',
  })
  @IsObject()
  @IsOptional()
  nutritionInfo?: ingredientEntity.NutritionInfo;

  @ApiPropertyOptional({
    example: {
      title: 'Молоко - полезные свойства',
      description: 'Все о молоке',
      keywords: ['молоко', 'польза', 'состав']
    },
    description: 'SEO данные',
  })
  @IsObject()
  @IsOptional()
  seo?: ingredientEntity.SeoData;
}
