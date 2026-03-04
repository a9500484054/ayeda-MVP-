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

    return this.commentsRepository.save(comment);
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

    const where: any = {
      recipeId,
      deletedAt: IsNull(),
    };

    // Если не включено отображение скрытых, фильтруем
    if (!includeHidden) {
      where.isHidden = false;
    }

    const [comments, total] = await this.commentsRepository.findAndCount({
      where,
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

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

    // Soft delete
    await this.commentsRepository.softDelete(id);
  }

  async hide(
    id: string,
    moderatorId: string,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    comment.isHidden = true;
    return this.commentsRepository.save(comment);
  }

  async unhide(id: string, moderatorId: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    comment.isHidden = false;
    return this.commentsRepository.save(comment);
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
