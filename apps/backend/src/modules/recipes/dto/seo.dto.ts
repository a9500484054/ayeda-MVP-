import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, MaxLength } from 'class-validator';

export class SeoDto {
  @ApiProperty({
    required: false,
    example: 'Борщ - традиционный русский суп',
    description: 'SEO заголовок (до 60 символов)'
  })
  @IsOptional()
  @IsString({ message: 'SEO заголовок должен быть строкой' })
  @MaxLength(60, { message: 'SEO заголовок не должен превышать 60 символов' })
  title?: string;

  @ApiProperty({
    required: false,
    example: 'Узнайте как приготовить традиционный борщ по классическому рецепту',
    description: 'SEO описание (до 160 символов)'
  })
  @IsOptional()
  @IsString({ message: 'SEO описание должно быть строкой' })
  @MaxLength(160, { message: 'SEO описание не должно превышать 160 символов' })
  description?: string;

  @ApiProperty({
    required: false,
    example: ['борщ', 'русская кухня', 'суп', 'рецепт'],
    description: 'SEO ключевые слова',
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'SEO ключевые слова должны быть массивом' })
  @IsString({ each: true, message: 'Каждое ключевое слово должно быть строкой' })
  keywords?: string[];
}
