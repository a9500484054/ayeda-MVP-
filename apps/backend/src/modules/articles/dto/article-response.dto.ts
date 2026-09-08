import { ApiProperty } from '@nestjs/swagger';
import { Article } from '../entities/article.entity';

class AuthorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  avatar: string | null;

  @ApiProperty({ nullable: true })
  first_name: string | null;

  @ApiProperty({ nullable: true })
  last_name: string | null;
}

class SeoResponseDto {
  @ApiProperty({ required: false })
  title?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false, type: [String] })
  keywords?: string[];

  @ApiProperty({ required: false })
  og_image?: string;

  @ApiProperty({ required: false })
  canonical_url?: string;
}

export class StepResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ nullable: true })
  image: string | null;

  @ApiProperty()
  sort: number;
}

export class ArticleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ nullable: true })
  content: string | null;

  @ApiProperty({ type: [StepResponseDto], nullable: true })
  steps: StepResponseDto[] | null;

  @ApiProperty({ nullable: true })
  excerpt: string | null;

  @ApiProperty({ nullable: true })
  featured_image: string | null;

  @ApiProperty({ type: [String], nullable: true })
  categories: string[] | null;

  @ApiProperty({ enum: ['article', 'tip', 'news'] })
  type: string;

  @ApiProperty({ enum: ['draft', 'published', 'archived'] })
  status: string;

  @ApiProperty()
  views: number;

  @ApiProperty({ nullable: true, type: SeoResponseDto })
  seo: SeoResponseDto | null;

  @ApiProperty({ nullable: true })
  published_at: Date | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ type: AuthorDto })
  author: AuthorDto;

  static from(article: Article): ArticleResponseDto {
    const dto = new ArticleResponseDto();
    dto.id = article.id;
    dto.title = article.title;
    dto.slug = article.slug;
    dto.content = article.content;
    dto.steps = article.steps
      ? article.steps.map((step) => ({
          id: step.id,
          text: step.text,
          image: step.image || null,
          sort: step.sort,
        }))
      : null;
    dto.excerpt = article.excerpt;
    dto.featured_image = article.featuredImage;
    dto.categories = article.categories;
    dto.type = article.type;
    dto.status = article.status;
    dto.views = article.views;
    dto.seo = article.seo;
    dto.published_at = article.publishedAt;
    dto.created_at = article.createdAt;
    dto.updated_at = article.updatedAt;
    dto.author = {
      id: article.author.id,
      username: article.author.username,
      email: article.author.email,
      avatar: article.author.avatar,
      first_name: article.author.firstName,
      last_name: article.author.lastName,
    };
    return dto;
  }
}
