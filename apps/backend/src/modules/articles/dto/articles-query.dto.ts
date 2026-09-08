import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ArticleStatus, ArticleType } from '../entities/article.entity';

export class ArticlesQueryDto {
  @ApiPropertyOptional({ description: 'Номер страницы', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Количество на странице', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: ArticleType })
  @IsOptional()
  @IsEnum(ArticleType)
  type?: ArticleType;

  @ApiPropertyOptional({ enum: ArticleStatus })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @ApiPropertyOptional({ description: 'Категория (одна)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Поиск по заголовку' })
  @IsOptional()
  @IsString()
  search?: string;
}
