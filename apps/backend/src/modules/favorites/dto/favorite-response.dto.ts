import { ApiProperty } from '@nestjs/swagger';
import { RecipeResponseDto } from '../../recipes/dto/recipe-response.dto';

export class FavoriteResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  recipeId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ type: () => RecipeResponseDto })
  recipe: RecipeResponseDto;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;
}

export class FavoriteStatusDto {
  @ApiProperty({ example: true })
  isFavorite: boolean;
}
