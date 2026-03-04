import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Req,
  Query,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import {
  FavoriteResponseDto,
  FavoriteStatusDto,
} from './dto/favorite-response.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginatedResponseDto, PaginationDto } from 'src/common/dto/pagination.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('favorites')
@Controller('recipes/:recipeId/favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecipeFavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Добавить/удалить рецепт в избранное (тумблер)' })
  @ApiParam({ name: 'recipeId', description: 'UUID рецепта' })
  @ApiResponse({ status: HttpStatus.OK, type: FavoriteStatusDto })
  async toggleFavorite(
    @Req() req: RequestWithUser,
    @Param('recipeId') recipeId: string,
  ): Promise<FavoriteStatusDto> {
    return this.favoritesService.toggleFavorite(recipeId, req.user.id);
  }

  @Get('status')
  @ApiOperation({ summary: 'Проверить, есть ли рецепт в избранном' })
  @ApiParam({ name: 'recipeId', description: 'UUID рецепта' })
  @ApiResponse({ status: HttpStatus.OK, type: FavoriteStatusDto })
  async getFavoriteStatus(
    @Req() req: RequestWithUser,
    @Param('recipeId') recipeId: string,
  ): Promise<FavoriteStatusDto> {
    return this.favoritesService.getFavoriteStatus(recipeId, req.user.id);
  }
}

@ApiTags('favorites')
@Controller('users/:userId/favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserFavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить все избранные рецепты пользователя (с пагинацией)',
  })
  @ApiParam({ name: 'userId', description: 'UUID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<FavoriteResponseDto>,
  })
  async getUserFavorites(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<FavoriteResponseDto>> {
    const result = await this.favoritesService.getUserFavorites(
      userId,
      paginationDto,
    );
    return {
      ...result,
      data: result.data.map((favorite) =>
        this.mapToFavoriteResponseDto(favorite),
      ),
    };
  }

  private mapToFavoriteResponseDto(favorite: any): FavoriteResponseDto {
    return {
      ...favorite,
      recipe: {
        ...favorite.recipe,
        categories: favorite.recipe.categories.map((cat: any) => ({
          id: cat.id,
          code: cat.code,
          name: cat.name,
          description: cat.description,
        })),
      },
    };
  }
}
