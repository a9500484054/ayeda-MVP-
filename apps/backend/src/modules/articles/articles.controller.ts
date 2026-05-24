import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { ArticlesQueryDto } from './dto/articles-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать статью' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ArticleResponseDto })
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список статей' })
  @ApiResponse({ status: HttpStatus.OK, type: [ArticleResponseDto] })
  async findAll(@Query() query: ArticlesQueryDto): Promise<{ items: ArticleResponseDto[]; total: number; page: number; limit: number }> {
    return this.articlesService.findAll(query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Получить список всех категорий' })
  @ApiResponse({ status: HttpStatus.OK, type: [String] })
  async getCategories(): Promise<string[]> {
    return this.articlesService.getAllCategories();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Получить статью по slug (публичная страница)' })
  @ApiParam({ name: 'slug', description: 'ЧПУ статьи' })
  @ApiResponse({ status: HttpStatus.OK, type: ArticleResponseDto })
  async findBySlug(@Param('slug') slug: string): Promise<ArticleResponseDto> {
    return this.articlesService.findBySlug(slug);
  }

  @Get('id/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить статью по ID (для редактирования)' })
  @ApiParam({ name: 'id', description: 'UUID статьи' })
  @ApiResponse({ status: HttpStatus.OK, type: ArticleResponseDto })
  async findOne(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить статью' })
  @ApiParam({ name: 'id', description: 'UUID статьи' })
  @ApiResponse({ status: HttpStatus.OK, type: ArticleResponseDto })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.update(req.user.id, id, dto);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Опубликовать статью' })
  @ApiParam({ name: 'id', description: 'UUID статьи' })
  @ApiResponse({ status: HttpStatus.OK, type: ArticleResponseDto })
  async publish(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.publish(req.user.id, id);
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Снять с публикации' })
  @ApiParam({ name: 'id', description: 'UUID статьи' })
  @ApiResponse({ status: HttpStatus.OK, type: ArticleResponseDto })
  async unpublish(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<ArticleResponseDto> {
    return this.articlesService.unpublish(req.user.id, id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить статью (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID статьи' })
  async remove(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.articlesService.remove(req.user.id, id);
  }
}
