import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnitResponseDto } from '../../units/dto/unit-response.dto';
import * as ingredientEntity from '../entities/ingredient.entity';

export class IngredientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  srcPath: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ description: 'Описание ингредиента' })
  description?: string;

  @ApiPropertyOptional({ description: 'URL фото ингредиента' })
  photo?: string;

  @ApiProperty({ type: () => UnitResponseDto })
  unit: UnitResponseDto;

  @ApiProperty({
    example: { calories: 50, proteins: 3.5, fats: 2.5, carbohydrates: 4.8 },
    type: 'object',
    additionalProperties: true,
  })
  nutritionInfo: ingredientEntity.NutritionInfo;

  @ApiPropertyOptional({
    description: 'SEO данные',
    type: 'object',
    additionalProperties: true,
  })
  seo?: ingredientEntity.SeoData;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
