import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsObject,
  MaxLength,
  IsNotEmpty,
  ValidateNested,
  IsNumber,
  IsUUID,
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

export class ArticleStepDto {
  @ApiProperty({ description: 'ID шага (для существующих)' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'Текст шага' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ required: false, description: 'URL изображения шага' })
  @IsOptional()
  @IsString()
  image?: string | null;

  @ApiProperty({ description: 'Порядок сортировки' })
  @IsNumber()
  sort: number;
}

export class CreateArticleDto {
  @ApiProperty({ description: 'Заголовок статьи', example: '10 советов для начинающих' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ required: false, description: 'HTML контент (устаревает, используйте steps)' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ type: [ArticleStepDto], required: false, description: 'Шаги статьи' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticleStepDto)
  steps?: ArticleStepDto[];

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
