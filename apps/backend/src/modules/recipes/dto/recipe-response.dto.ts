import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { UnitResponseDto } from '../../units/dto/unit-response.dto';
import { IngredientResponseDto } from '../../ingredients/dto/ingredient-response.dto';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { RecipeStatus, RecipeType, Difficulty } from '../enums/recipe.enums';

export class RecipePhotoDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg' })
  src: string;
}

// DTO для шага
export class RecipeStepDto {
  @ApiProperty({ example: 1 })
  sort: number;

  @ApiProperty({ example: 'Нарежьте лук и морковь' })
  text: string;

  @ApiProperty({
    required: false,
    example: 'https://storage.example.com/step1.jpg',
  })
  image?: string;
}

export class RecipeIngredientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: () => IngredientResponseDto })
  ingredient: IngredientResponseDto;

  @ApiProperty({ example: 200 })
  amount: number;

  @ApiProperty({ type: () => UnitResponseDto, required: false })
  unit?: UnitResponseDto;

  @ApiProperty({ required: false })
  notes?: string;
}

// Основной Response DTO
export class RecipeResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Борщ' })
  title: string;

  @ApiProperty({ required: false, example: 'Традиционный русский суп' })
  description?: string;

  @ApiProperty({ required: false, example: 30 })
  cookingTime?: number;

  @ApiProperty({ required: false, example: 4 })
  servings?: number;

  @ApiProperty({ required: false, example: 250 })
  calories?: number;

  @ApiProperty({ enum: Difficulty, example: Difficulty.MEDIUM })
  difficulty: Difficulty;

  @ApiProperty({ enum: RecipeStatus, example: RecipeStatus.PUBLIC })
  status: RecipeStatus;

  @ApiProperty({ enum: RecipeType, example: RecipeType.COMMUNITY })
  type: RecipeType;

  // Фото с правильным типом
  @ApiProperty({
    required: false,
    type: RecipePhotoDto,
    description: 'Фото рецепта',
    example: { id: 'uuid', src: 'https://example.com/photo.jpg' },
  })
  photo?: RecipePhotoDto;

  @ApiProperty({ required: false, example: 'https://youtube.com/watch?v=...' })
  video?: string;

  @ApiProperty({
    type: [RecipeStepDto],
    required: false,
    description: 'Шаги приготовления',
    example: [
      { sort: 1, text: 'Шаг 1', image: 'https://example.com/step1.jpg' },
      { sort: 2, text: 'Шаг 2' },
    ],
  })
  steps?: RecipeStepDto[];

  @ApiProperty({ example: 'borshch-recept' })
  srcPath: string;

  @ApiProperty({ example: 42 })
  likes: number;

  @ApiProperty({ type: () => UserResponseDto })
  author: UserResponseDto;

  @ApiProperty({ type: [RecipeIngredientResponseDto] })
  ingredients: RecipeIngredientResponseDto[];

  @ApiProperty({ type: [CategoryResponseDto] })
  categories: CategoryResponseDto[];

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ required: false, example: '2024-01-01T00:00:00.000Z' })
  publishedAt?: Date;
}
