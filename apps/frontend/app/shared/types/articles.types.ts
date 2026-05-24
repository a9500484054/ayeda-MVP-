// shared/types/articles.types.ts

export interface SeoData {
  title?: string;
  description?: string;
  keywords?: string[];
  og_image?: string;
  canonical_url?: string;
}

export interface ArticleAuthor {
  id: string;
  username: string;
  email: string;
  avatar?: string | null;
  first_name?: string | null;
  last_name?: string | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featured_image?: string | null;
  categories: string[];
  type: 'article' | 'recipe' | 'news';
  status: 'draft' | 'published' | 'archived';
  views: number;
  seo?: SeoData;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  author: ArticleAuthor;
}

export interface CreateArticleDto {
  title: string;
  content: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  categories?: string[];
  type?: 'article' | 'recipe' | 'news';
  status?: 'draft' | 'published' | 'archived';
  seo?: SeoData;
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  slug?: string;
  excerpt?: string;
  featured_image?: string;
  categories?: string[];
  type?: 'article' | 'recipe' | 'news';
  status?: 'draft' | 'published' | 'archived';
  seo?: SeoData;
}

export interface ArticlesResponse {
  items: Article[];
  total: number;
  page: number;
  limit: number;
}
