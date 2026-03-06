import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'soups', description: 'Уникальный код категории' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[a-z-]+$/, {
    message:
      'Код должен содержать только латинские буквы в нижнем регистре и дефисы',
  })
  code: string;

  @ApiProperty({ example: 'Супы', description: 'Название категории' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Первые блюда', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
