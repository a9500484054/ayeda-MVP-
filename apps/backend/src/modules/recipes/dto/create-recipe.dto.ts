import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsArray,
  ValidateNested,
  IsUrl,
  Matches,
  MinLength,
} from 'class-validator';
import { RecipeType, Difficulty } from '../enums/recipe.enums';

export class RecipePhotoDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString({ message: 'ID фото должен быть строкой' })
  id: string;

  @ApiProperty({ example: 'https://storage.example.com/recipe.jpg' })
  @IsUrl({}, { message: 'URL фото должен быть корректным адресом' })
  src: string;
}

export class RecipeStepDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: 'Номер шага должен быть целым числом' })
  @Min(1, { message: 'Номер шага должен быть больше 0' })
  sort: number;

  @ApiProperty({ example: 'Нарежьте лук' })
  @IsString({ message: 'Текст шага должен быть строкой' })
  @MinLength(3, { message: 'Текст шага должен содержать минимум 3 символа' })
  text: string;

  @ApiProperty({ required: false, example: 'https://example.com/step1.jpg' })
  @IsOptional()
  @IsUrl({}, { message: 'URL изображения должен быть корректным адресом' })
  image?: string;
}

export class RecipeIngredientDto {
  @ApiProperty({ example: '483c7d7f-c9e0-4567-8471-03159f1132e5' })
  @IsString({ message: 'ID ингредиента должен быть строкой' })
  ingredientId: string;

  @ApiProperty({ example: 200 })
  @IsInt({ message: 'Количество должно быть целым числом' })
  @Min(1, { message: 'Количество должно быть больше 0' })
  amount: number;

  @ApiProperty({
    example: 'fcc85090-5ca6-42ae-bce1-a6ad08ef2a36',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'ID единицы измерения должен быть строкой' })
  unitId?: string;

  @ApiProperty({ example: 'по вкусу', required: false })
  @IsOptional()
  @IsString({ message: 'Примечание должно быть строкой' })
  notes?: string;
}

export class CreateRecipeDto {
  @ApiProperty({ example: 'Борщ' })
  @IsString({ message: 'Название должно быть строкой' })
  @MinLength(3, { message: 'Название должно содержать минимум 3 символа' })
  title: string;

  @ApiProperty({ example: 'Традиционный русский суп', required: false })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsInt({ message: 'Время приготовления должно быть целым числом' })
  @Min(1, { message: 'Время приготовления должно быть больше 0' })
  cookingTime?: number;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @IsInt({ message: 'Количество порций должно быть целым числом' })
  @Min(1, { message: 'Количество порций должно быть больше 0' })
  @Max(99, { message: 'Количество порций не может быть больше 99' })
  servings?: number;

  @ApiProperty({ example: 250, required: false })
  @IsOptional()
  @IsInt({ message: 'Калорийность должна быть целым числом' })
  @Min(0, { message: 'Калорийность не может быть отрицательной' })
  calories?: number;

  @ApiProperty({ enum: Difficulty, example: Difficulty.MEDIUM })
  @IsEnum(Difficulty, {
    message: 'Уровень сложности должен быть easy, medium или hard',
  })
  difficulty: Difficulty;

  @ApiProperty({ enum: RecipeType, example: RecipeType.PERSONAL })
  @IsEnum(RecipeType, {
    message: 'Тип рецепта должен быть personal или community',
  })
  type: RecipeType;

  @ApiProperty({ required: false, type: RecipePhotoDto })
  @IsOptional()
  @ValidateNested({ message: 'Некорректный формат фото' })
  @Type(() => RecipePhotoDto)
  photo?: RecipePhotoDto;

  @ApiProperty({ required: false, example: 'https://youtube.com/watch?v=...' })
  @IsOptional()
  @IsUrl({}, { message: 'URL видео должен быть корректным адресом' })
  video?: string;

  @ApiProperty({ type: [RecipeStepDto], required: false })
  @IsOptional()
  @IsArray({ message: 'Шаги должны быть массивом' })
  @ValidateNested({ each: true, message: 'Некорректный формат шага' })
  @Type(() => RecipeStepDto)
  steps?: RecipeStepDto[];

  @ApiProperty({ example: 'borshch-recept' })
  @IsString({ message: 'srcPath должен быть строкой' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'srcPath должен содержать только латиницу, цифры и дефисы',
  })
  srcPath: string;

  @ApiProperty({ type: [RecipeIngredientDto] })
  @IsArray({ message: 'Ингредиенты должны быть массивом' })
  @ValidateNested({ each: true, message: 'Некорректный формат ингредиента' })
  @Type(() => RecipeIngredientDto)
  ingredients: RecipeIngredientDto[];

  @ApiProperty({
    type: [String],
    example: ['c776d565-7890-4e94-a1e4-bc42c2ce3742'],
  })
  @IsArray({ message: 'ID категорий должны быть массивом' })
  @IsString({ each: true, message: 'Каждый ID категории должен быть строкой' })
  categoryIds: string[];
}
