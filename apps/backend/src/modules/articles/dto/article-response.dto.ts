import { ApiProperty } from '@nestjs/swagger';

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
}
