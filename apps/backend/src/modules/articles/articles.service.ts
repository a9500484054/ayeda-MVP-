import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, FindOptionsWhere } from 'typeorm';
import { Article, ArticleStep } from './entities/article.entity';
import { CreateArticleDto, ArticleStepDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponseDto, StepResponseDto } from './dto/article-response.dto';
import { ArticlesQueryDto } from './dto/articles-query.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articlesRepository: Repository<Article>,
  ) {}

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 200);
  }

  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const exists = await this.articlesRepository.findOne({
        where: { slug },
        withDeleted: true,
      });

      if (!exists) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private generateSeoMetadata(article: Partial<Article>, dto: CreateArticleDto): any {
    const seo = dto.seo || {};

    if (!seo.title && article.title) {
      seo.title = article.title;
    }

    if (!seo.description && dto.excerpt) {
      seo.description = dto.excerpt;
    }

    if (!seo.og_image && dto.featured_image) {
      seo.og_image = dto.featured_image;
    }

    if (!seo.canonical_url && dto.slug) {
      seo.canonical_url = dto.slug;
    }

    return Object.keys(seo).length > 0 ? seo : null;
  }

  private normalizeSteps(steps?: ArticleStepDto[]): ArticleStep[] | null {
    if (!steps || steps.length === 0) {
      return null;
    }

    return steps
      .filter(step => step.text.trim().length > 0)
      .map(step => ({
        id: step.id || uuidv4(),
        text: step.text,
        image: step.image || null,
        sort: step.sort || 0,
      }))
      .sort((a, b) => a.sort - b.sort);
  }

  private toResponseDto(article: Article): ArticleResponseDto {
    // Преобразуем steps из ArticleStep[] в StepResponseDto[]
    const steps: StepResponseDto[] | null = article.steps
      ? article.steps.map(step => ({
          id: step.id,
          text: step.text,
          image: step.image || null,
          sort: step.sort,
        }))
      : null;

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      steps: steps,
      excerpt: article.excerpt,
      featured_image: article.featuredImage,
      categories: article.categories,
      type: article.type,
      status: article.status,
      views: article.views,
      seo: article.seo,
      published_at: article.publishedAt,
      created_at: article.createdAt,
      updated_at: article.updatedAt,
      author: {
        id: article.author.id,
        username: article.author.username,
        email: article.author.email,
        avatar: article.author.avatar,
        first_name: article.author.firstName,
        last_name: article.author.lastName,
      },
    };
  }

  async create(userId: string, dto: CreateArticleDto): Promise<ArticleResponseDto> {
    let slug = dto.slug;

    if (!slug) {
      slug = this.generateSlug(dto.title);
      slug = await this.ensureUniqueSlug(slug);
    } else {
      const exists = await this.articlesRepository.findOne({
        where: { slug },
        withDeleted: true,
      });
      if (exists) {
        throw new BadRequestException('Статья с таким slug уже существует');
      }
    }

    const steps = this.normalizeSteps(dto.steps);

    const article = this.articlesRepository.create({
      userId: userId,
      title: dto.title,
      slug: slug,
      content: dto.content || null,
      steps: steps,
      excerpt: dto.excerpt,
      featuredImage: dto.featured_image,
      categories: dto.categories,
      type: dto.type || 'article',
      status: dto.status || 'draft',
      publishedAt: dto.status === 'published' ? new Date() : null,
    });

    article.seo = this.generateSeoMetadata(article, dto);

    const saved = await this.articlesRepository.save(article);

    const withAuthor = await this.articlesRepository.findOne({
      where: { id: saved.id },
      relations: ['author'],
    });

    return this.toResponseDto(withAuthor!);
  }

  async findAll(query: ArticlesQueryDto): Promise<{
    items: ArticleResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, type, status, category, search } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Article> = {};

    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (category) {
      where.categories = In([category]);
    }
    if (search) {
      where.title = Like(`%${search}%`);
    }

    const [items, total] = await this.articlesRepository.findAndCount({
      where: where,
      relations: ['author'],
      skip: skip,
      take: limit,
      order: {
        publishedAt: 'DESC',
        createdAt: 'DESC',
      },
    });

    return {
      items: items.map(item => this.toResponseDto(item)),
      total: total,
      page: page,
      limit: limit,
    };
  }

  async findBySlug(slug: string): Promise<ArticleResponseDto> {
    const article = await this.articlesRepository.findOne({
      where: {
        slug: slug,
        status: 'published',
      },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('Статья не найдена');
    }

    await this.articlesRepository.increment({ id: article.id }, 'views', 1);
    article.views += 1;

    return this.toResponseDto(article);
  }

  async findOne(userId: string, id: string): Promise<ArticleResponseDto> {
    const article = await this.articlesRepository.findOne({
      where: { id: id },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('Статья не найдена');
    }

    if (article.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этой статье');
    }

    return this.toResponseDto(article);
  }

  async update(userId: string, id: string, dto: UpdateArticleDto): Promise<ArticleResponseDto> {
    const article = await this.articlesRepository.findOne({
      where: { id: id },
      relations: ['author'],
    });

    if (!article) {
      throw new NotFoundException('Статья не найдена');
    }

    if (article.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этой статье');
    }

    if (dto.title && dto.title !== article.title) {
      let newSlug = dto.slug;
      if (!newSlug) {
        newSlug = this.generateSlug(dto.title);
        newSlug = await this.ensureUniqueSlug(newSlug);
      }
      article.slug = newSlug;
    }

    if (dto.title !== undefined) {
      article.title = dto.title;
    }

    if (dto.content !== undefined) {
      article.content = dto.content || null;
    }

    if (dto.steps !== undefined) {
      article.steps = this.normalizeSteps(dto.steps);
    }

    if (dto.excerpt !== undefined) {
      article.excerpt = dto.excerpt;
    }

    if (dto.featured_image !== undefined) {
      article.featuredImage = dto.featured_image;
    }

    if (dto.categories !== undefined) {
      article.categories = dto.categories;
    }

    if (dto.type !== undefined) {
      article.type = dto.type;
    }

    if (dto.status !== undefined && dto.status !== article.status) {
      article.status = dto.status;
      if (dto.status === 'published' && !article.publishedAt) {
        article.publishedAt = new Date();
      }
    }

    if (dto.seo !== undefined) {
      article.seo = this.generateSeoMetadata(article, dto as CreateArticleDto);
    }

    const saved = await this.articlesRepository.save(article);
    return this.toResponseDto(saved);
  }

  async publish(userId: string, id: string): Promise<ArticleResponseDto> {
    return this.update(userId, id, { status: 'published' });
  }

  async unpublish(userId: string, id: string): Promise<ArticleResponseDto> {
    return this.update(userId, id, { status: 'draft' });
  }

  async remove(userId: string, id: string): Promise<void> {
    const article = await this.articlesRepository.findOne({
      where: { id: id },
    });

    if (!article) {
      throw new NotFoundException('Статья не найдена');
    }

    if (article.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этой статье');
    }

    await this.articlesRepository.softRemove(article);
  }

  async getAllCategories(): Promise<string[]> {
    const result = await this.articlesRepository
      .createQueryBuilder('article')
      .select('DISTINCT UNNEST(article.categories)', 'category')
      .where('article.categories IS NOT NULL')
      .andWhere('article.status = :status', { status: 'published' })
      .getRawMany();

    return result.map(resultItem => resultItem.category).filter(Boolean);
  }
}
