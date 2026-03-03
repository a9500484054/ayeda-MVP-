import { ApiProperty } from '@nestjs/swagger';
import { UnitResponseDto } from '../../units/dto/unit-response.dto';
import * as ingredientEntity from '../entities/ingredient.entity';

export class IngredientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: () => UnitResponseDto })
  unit: UnitResponseDto;

  @ApiProperty({
    example: { calories: 50, proteins: 3.5, fats: 2.5, carbohydrates: 4.8 },
    type: 'object',
    additionalProperties: true, // <-- Добавьте эту строку
  })
  nutritionInfo: ingredientEntity.NutritionInfo;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
