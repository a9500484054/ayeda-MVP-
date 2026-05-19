import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ example: 'vegetables', description: 'Уникальный код категории' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Овощи', description: 'Название категории' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'carrot', description: 'Иконка из lucide' })
  @IsString()
  @MaxLength(50)
  icon: string;

  @ApiProperty({ required: false, default: 0, description: 'Порядок сортировки' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;
}
