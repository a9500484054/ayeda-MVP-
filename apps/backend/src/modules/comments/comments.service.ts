import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import {
  PaginatedResponseDto,
  PaginationDto,
} from 'src/common/dto/pagination.dto';
import { UserRole } from '../users/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
  ) {}

  async create(
    recipeId: string,
    authorId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    // Проверяем существование рецепта
    const recipe = await this.recipesRepository.findOne({
      where: { id: recipeId, deletedAt: IsNull() },
    });
    if (!recipe) {
      throw new NotFoundException('Рецепт не найден');
    }

    const comment = this.commentsRepository.create({
      ...createCommentDto,
      recipeId,
      authorId,
    });

    const savedComment = await this.commentsRepository.save(comment);

    // ✅ Увеличиваем счетчик комментариев у рецепта
    await this.recipesRepository.increment(
      { id: recipeId },
      'commentsCount',
      1
    );

    return savedComment;
  }

  async findAll(
    recipeId: string,
    paginationDto: PaginationDto,
    includeHidden: boolean = false,
  ): Promise<PaginatedResponseDto<Comment>> {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;
    const skip = (page - 1) * limit;

    // Проверяем существование рецепта
    const recipe = await this.recipesRepository.findOne({
      where: { id: recipeId, deletedAt: IsNull() },
    });
    if (!recipe) {
      throw new NotFoundException('Рецепт не найден');
    }

    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .where('comment.recipeId = :recipeId', { recipeId })
      .andWhere('comment.deletedAt IS NULL')
      .orderBy('comment.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    // Если не включено отображение скрытых, фильтруем
    if (!includeHidden) {
      queryBuilder.andWhere('comment.isHidden = :isHidden', { isHidden: false });
    }

    const [comments, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResponseDto(comments, total, page, limit);
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    return comment;
  }

  async update(
    id: string,
    userId: string,
    userRole: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    // Проверяем права на редактирование (только автор)
    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        'Вы не можете редактировать чужой комментарий',
      );
    }

    Object.assign(comment, updateCommentDto);
    return this.commentsRepository.save(comment);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const comment = await this.findOne(id);

    // Проверяем права на удаление (автор, модератор, админ)
    const isAuthor = comment.authorId === userId;
    const isModerator = userRole === UserRole.MODERATOR || userRole === UserRole.ADMIN;

    if (!isAuthor && !isModerator) {
      throw new ForbiddenException('Вы не можете удалить этот комментарий');
    }

    // Сохраняем recipeId для обновления счетчика
    const recipeId = comment.recipeId;

    // Soft delete
    await this.commentsRepository.softDelete(id);

    // ✅ Уменьшаем счетчик комментариев у рецепта
    await this.recipesRepository.decrement(
      { id: recipeId },
      'commentsCount',
      1
    );
  }

  async hide(
    id: string,
    moderatorId: string,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    comment.isHidden = true;
    const savedComment = await this.commentsRepository.save(comment);

    // ⚠️ Опционально: если скрытые комментарии не должны учитываться в счетчике
    // await this.recipesRepository.decrement(
    //   { id: comment.recipeId },
    //   'commentsCount',
    //   1
    // );

    return savedComment;
  }

  async unhide(id: string, moderatorId: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    comment.isHidden = false;
    const savedComment = await this.commentsRepository.save(comment);

    // ⚠️ Опционально: если скрытые комментарии не учитывались в счетчике
    // await this.recipesRepository.increment(
    //   { id: comment.recipeId },
    //   'commentsCount',
    //   1
    // );

    return savedComment;
  }

  async getRecipeCommentsCount(recipeId: string): Promise<number> {
    // Получаем из рецепта (быстрый способ)
    const recipe = await this.recipesRepository.findOne({
      where: { id: recipeId, deletedAt: IsNull() },
      select: ['commentsCount'],
    });

    return recipe?.commentsCount || 0;
  }

    // ==================== НОВЫЙ МЕТОД ДЛЯ МОДЕРАТОРА ====================

  async findModeratorComments(filters: {
    page: number;
    limit: number;
    search?: string;
    recipeId?: string;
    authorId?: string;
    isHidden?: boolean;
    startDate?: Date;
    endDate?: Date;
    sortBy?: 'createdAt' | 'updatedAt';
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<PaginatedResponseDto<Comment>> {
    const {
      page,
      limit,
      search,
      recipeId,
      authorId,
      isHidden,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = filters;

    const skip = (page - 1) * limit;

    const queryBuilder = this.commentsRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.recipe', 'recipe')
      .where('comment.deletedAt IS NULL');

    // Поиск по тексту
    if (search && search.trim()) {
      queryBuilder.andWhere('comment.text ILIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

    // Фильтр по рецепту
    if (recipeId) {
      queryBuilder.andWhere('comment.recipeId = :recipeId', { recipeId });
    }

    // Фильтр по автору
    if (authorId) {
      queryBuilder.andWhere('comment.authorId = :authorId', { authorId });
    }

    // Фильтр по статусу скрытия
    if (isHidden !== undefined) {
      queryBuilder.andWhere('comment.isHidden = :isHidden', { isHidden });
    }

    // Фильтр по дате
    if (startDate) {
      queryBuilder.andWhere('comment.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('comment.createdAt <= :endDate', { endDate });
    }

    // Сортировка
    queryBuilder
      .orderBy(`comment.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [comments, total] = await queryBuilder.getManyAndCount();

    return new PaginatedResponseDto(comments, total, page, limit);
  }

  toResponseDto(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      text: comment.text,
      recipeId: comment.recipeId,
      author: comment.author,
      isHidden: comment.isHidden,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      deletedAt: comment.deletedAt,
    };
  }

}
