import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsBoolean,
  IsObject,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class SeoDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  og_image?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  canonical_url?: string;
}

export class CreateArticleDto {
  @ApiProperty({ description: 'Заголовок статьи', example: '10 советов для начинающих' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'HTML контент', example: '<h1>Совет 1</h1><p>Текст...</p>' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ required: false, description: 'ЧПУ (генерируется если не указан)' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiProperty({ required: false, description: 'Краткое описание' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({ required: false, description: 'Главное изображение' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  featured_image?: string;

  @ApiProperty({ required: false, type: [String], description: 'Категории', example: ['советы', 'кулинария'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiProperty({ enum: ['article', 'tip', 'news'], default: 'article' })
  @IsOptional()
  @IsEnum(['article', 'tip', 'news'])
  type?: string;

  @ApiProperty({ enum: ['draft', 'published'], default: 'draft' })
  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: string;

  @ApiProperty({ required: false, type: SeoDto })
  @IsOptional()
  @IsObject()
  @Type(() => SeoDto)
  seo?: SeoDto;
}
