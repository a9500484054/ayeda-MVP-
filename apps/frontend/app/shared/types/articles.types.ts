// shared/types/articles.types.ts

export interface ArticleStep {
  id?: string;
  text: string;
  image: string | null;
  sort: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  steps: ArticleStep[] | null;
  excerpt: string | null;
  featured_image: string | null;
  categories: string[] | null;
  type: 'article' | 'tip' | 'news';
  status: 'draft' | 'published' | 'archived';
  views: number;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    og_image?: string;
    canonical_url?: string;
  } | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    first_name: string | null;
    last_name: string | null;
  };
}

export interface CreateArticleDto {
  title: string;
  slug?: string;
  content?: string;
  steps?: Omit<ArticleStep, 'id'>[];
  excerpt?: string;
  featured_image?: string;
  categories?: string[];
  type?: 'article' | 'tip' | 'news';
  status?: 'draft' | 'published' | 'archived';
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    og_image?: string;
    canonical_url?: string;
  };
}

export interface UpdateArticleDto {
  title?: string;
  slug?: string;
  content?: string | null;
  steps?: ArticleStep[];
  excerpt?: string | null;
  featured_image?: string | null;
  categories?: string[] | null;
  type?: 'article' | 'tip' | 'news';
  status?: 'draft' | 'published' | 'archived';
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    og_image?: string;
    canonical_url?: string;
  } | null;
}

export interface ArticlesResponse {
  items: Article[];
  total: number;
  page: number;
  limit: number;
}
