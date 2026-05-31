import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, IsBoolean, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCategoryDto {
  @ApiProperty({ required: false, description: 'Уникальный код категории' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiProperty({ required: false, description: 'Название категории' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false, description: 'Иконка из lucide' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({ required: false, description: 'Порядок сортировки' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;

  @ApiProperty({ required: false, description: 'Активна ли категория' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;
}
