import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LikesService } from './likes.service';
import { LikeResponseDto, LikeStatusDto } from './dto/like-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

interface RequestWithUser extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('likes')
@Controller('recipes/:recipeId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Поставить/убрать лайк (тумблер)' })
  @ApiParam({ name: 'recipeId', description: 'UUID рецепта' })
  @ApiResponse({ status: HttpStatus.OK, type: LikeStatusDto })
  async toggleLike(
    @Req() req: RequestWithUser,
    @Param('recipeId') recipeId: string,
  ): Promise<LikeStatusDto> {
    return this.likesService.toggleLike(recipeId, req.user!.id);
  }

  @Get('status')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Получить статус лайка (лайкнул ли пользователь)' })
  @ApiParam({ name: 'recipeId', description: 'UUID рецепта' })
  @ApiResponse({ status: HttpStatus.OK, type: LikeStatusDto })
  async getLikeStatus(
    @Req() req: RequestWithUser,
    @Param('recipeId') recipeId: string,
  ): Promise<LikeStatusDto> {
    return this.likesService.getLikeStatus(recipeId, req.user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех лайков рецепта' })
  @ApiParam({ name: 'recipeId', description: 'UUID рецепта' })
  @ApiResponse({ status: HttpStatus.OK, type: [LikeResponseDto] })
  async getRecipeLikes(
    @Param('recipeId') recipeId: string,
  ): Promise<LikeResponseDto[]> {
    return this.likesService.getRecipeLikes(recipeId);
  }
}

@ApiTags('likes')
@Controller('users/:userId/likes')
export class UserLikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все лайки пользователя' })
  @ApiParam({ name: 'userId', description: 'UUID пользователя' })
  @ApiResponse({ status: HttpStatus.OK, type: [LikeResponseDto] })
  async getUserLikes(
    @Param('userId') userId: string,
  ): Promise<LikeResponseDto[]> {
    return this.likesService.getUserLikes(userId);
  }
}
