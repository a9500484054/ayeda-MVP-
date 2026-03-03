import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsEnum, IsInt, Min, IsString } from 'class-validator';
import { RecipeStatus, RecipeType, Difficulty } from '../enums/recipe.enums';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class RecipeQueryDto extends PaginationDto {
  @ApiProperty({ enum: RecipeStatus, required: false })
  @IsOptional()
  @IsEnum(RecipeStatus)
  status?: RecipeStatus;

  @ApiProperty({ enum: RecipeType, required: false })
  @IsOptional()
  @IsEnum(RecipeType)
  type?: RecipeType;

  @ApiProperty({ enum: Difficulty, required: false })
  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    required: false,
    description: 'Минимальное время приготовления',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minCookingTime?: number;

  @ApiProperty({
    required: false,
    description: 'Максимальное время приготовления',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxCookingTime?: number;
}
