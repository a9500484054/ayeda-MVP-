import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from 'src/common/dto/pagination.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
  ) {}

  async toggleFavorite(
    recipeId: string,
    userId: string,
  ): Promise<{ isFavorite: boolean }> {
    // Проверяем существование рецепта
    const recipe = await this.recipesRepository.findOne({
      where: {
        id: recipeId,
        deletedAt: IsNull(),
      },
    });
    if (!recipe) {
      throw new NotFoundException('Рецепт не найден');
    }

    // Ищем существующее избранное
    const existingFavorite = await this.favoritesRepository.findOne({
      where: { recipeId, userId },
    });

    if (existingFavorite) {
      // Удаляем из избранного
      await this.favoritesRepository.remove(existingFavorite);
      return { isFavorite: false };
    } else {
      // Добавляем в избранное
      const favorite = this.favoritesRepository.create({
        recipeId,
        userId,
      });
      await this.favoritesRepository.save(favorite);
      return { isFavorite: true };
    }
  }

  async getFavoriteStatus(
    recipeId: string,
    userId: string,
  ): Promise<{ isFavorite: boolean }> {
    const recipe = await this.recipesRepository.findOne({
      where: {
        id: recipeId,
        deletedAt: IsNull(),
      },
    });
    if (!recipe) {
      throw new NotFoundException('Рецепт не найден');
    }

    const favorite = await this.favoritesRepository.findOne({
      where: { recipeId, userId },
    });

    return { isFavorite: !!favorite };
  }

  async getUserFavorites(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Favorite>> {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;
    const skip = (page - 1) * limit;

    const [favorites, total] = await this.favoritesRepository.findAndCount({
      where: { userId },
      relations: [
        'recipe',
        'recipe.author',
        'recipe.ingredients',
        'recipe.categories',
      ],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return new PaginatedResponseDto(favorites, total, page, limit);
  }

  async checkRecipeInUserFavorites(
    recipeId: string,
    userId: string,
  ): Promise<boolean> {
    const count = await this.favoritesRepository.count({
      where: { recipeId, userId },
    });
    return count > 0;
  }

  async getRecipeFavoritesCount(recipeId: string): Promise<number> {
    return this.favoritesRepository.count({
      where: { recipeId },
    });
  }
}
