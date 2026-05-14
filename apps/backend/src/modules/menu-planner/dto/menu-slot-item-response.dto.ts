import { ApiProperty } from '@nestjs/swagger';
import { RecipeResponseDto } from '../../recipes/dto/recipe-response.dto';

export class MenuSlotItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slotId: string;

  @ApiProperty()
  recipeId: string;

  @ApiProperty()
  order: number;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => RecipeResponseDto, required: false })
  recipe?: RecipeResponseDto;
}
