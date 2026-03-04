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
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { UserRole } from '../users/entities/user.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from 'src/common/dto/pagination.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('comments')
@Controller('recipes/:recipeId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать комментарий' })
  @ApiParam({ name: 'recipeId', description: 'UUID рецепта' })
  @ApiResponse({ status: HttpStatus.CREATED, type: CommentResponseDto })
  async create(
    @Req() req: RequestWithUser,
    @Param('recipeId') recipeId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.create(
      recipeId,
      req.user.id,
      createCommentDto,
    );
    return this.commentsService.toResponseDto(comment);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить все комментарии к рецепту (с пагинацией)',
  })
  @ApiParam({ name: 'recipeId', description: 'UUID рецепта' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<CommentResponseDto>,
  })
  async findAll(
    @Param('recipeId') recipeId: string,
    @Query() paginationDto: PaginationDto,
    @Req() req: RequestWithUser,
  ): Promise<PaginatedResponseDto<CommentResponseDto>> {
    // Модераторы видят скрытые комментарии
    const includeHidden =
      req.user?.role === UserRole.MODERATOR ||
      req.user?.role === UserRole.ADMIN;

    const result = await this.commentsService.findAll(recipeId, paginationDto, includeHidden);

    const commentDtos = result.data.map(comment =>
      this.commentsService.toResponseDto(comment)
    );

    return new PaginatedResponseDto(
      commentDtos,
      result.total,
      result.page,
      result.limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить комментарий по ID' })
  @ApiParam({ name: 'recipeId', description: 'UUID рецепта' })
  @ApiParam({ name: 'id', description: 'UUID комментария' })
  @ApiResponse({ status: HttpStatus.OK, type: CommentResponseDto })
  async findOne(@Param('id') id: string): Promise<CommentResponseDto> {
    const comment = await this.commentsService.findOne(id);
    return this.commentsService.toResponseDto(comment);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить комментарий (только автор)' })
  @ApiParam({ name: 'recipeId', description: 'UUID рецепта' })
  @ApiParam({ name: 'id', description: 'UUID комментария' })
  @ApiResponse({ status: HttpStatus.OK, type: CommentResponseDto })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.update(
      id,
      req.user.id,
      req.user.role,
      updateCommentDto,
    );
    return this.commentsService.toResponseDto(comment);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить комментарий (автор, модератор, админ)' })
  @ApiParam({ name: 'recipeId', description: 'UUID рецепта' })
  @ApiParam({ name: 'id', description: 'UUID комментария' })
  async remove(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.commentsService.remove(id, req.user.id, req.user.role);
  }

  @Post(':id/hide')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Скрыть комментарий (только модератор/админ)' })
  @ApiParam({ name: 'recipeId', description: 'UUID рецепта' })
  @ApiParam({ name: 'id', description: 'UUID комментария' })
  @ApiResponse({ status: HttpStatus.OK, type: CommentResponseDto })
  async hide(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.hide(id, req.user.id);
    return this.commentsService.toResponseDto(comment);
  }

  @Post(':id/unhide')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Показать скрытый комментарий (только модератор/админ)',
  })
  @ApiParam({ name: 'recipeId', description: 'UUID рецепта' })
  @ApiParam({ name: 'id', description: 'UUID комментария' })
  @ApiResponse({ status: HttpStatus.OK, type: CommentResponseDto })
  async unhide(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<CommentResponseDto> {
    const comment = await this.commentsService.unhide(id, req.user.id);
    return this.commentsService.toResponseDto(comment);
  }
}
