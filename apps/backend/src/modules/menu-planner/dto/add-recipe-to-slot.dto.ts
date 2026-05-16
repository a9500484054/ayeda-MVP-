// add-recipe-to-slot.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AddRecipeToSlotDto {
  @ApiProperty({ description: 'ID рецепта' })
  @IsUUID(4, { message: 'recipeId должен быть UUID' })
  recipeId: string;

  @ApiProperty({
    required: false,
    default: 0,
    description: 'Порядок отображения',
  })
  @IsOptional()
  @IsInt({ message: 'order должен быть целым числом' })
  @Min(0, { message: 'order должен быть >= 0' })
  @Type(() => Number)
  order?: number;

  @ApiProperty({
    required: false,
    description: 'Заметки к рецепту в этом слоте',
  })
  @IsOptional()
  @IsString({ message: 'notes должен быть строкой' })
  notes?: string;
}
