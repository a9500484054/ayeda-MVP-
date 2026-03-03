import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Like } from './entities/like.entity';
import { Recipe } from '../recipes/entities/recipe.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepository: Repository<Like>,
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
    private dataSource: DataSource,
  ) {}

  async toggleLike(
    recipeId: string,
    userId: string,
  ): Promise<{ liked: boolean; likesCount: number }> {
    // Проверяем существование рецепта
    const recipe = await this.recipesRepository.findOne({
      where: { id: recipeId, deletedAt: IsNull() },
    });
    if (!recipe) {
      throw new NotFoundException('Рецепт не найден');
    }

    // Ищем существующий лайк
    const existingLike = await this.likesRepository.findOne({
      where: { recipeId, userId },
    });

    // Используем транзакцию для обновления счетчика
    return await this.dataSource.transaction(async (manager) => {
      if (existingLike) {
        // Удаляем лайк
        await manager.delete(Like, { id: existingLike.id });

        // Уменьшаем счетчик
        await manager.decrement(Recipe, { id: recipeId }, 'likes', 1);

        // Получаем обновленный счетчик
        const updatedRecipe = await manager.findOne(Recipe, {
          where: { id: recipeId },
        });

        return { liked: false, likesCount: updatedRecipe?.likes || 0 };
      } else {
        // Создаем лайк
        const like = manager.create(Like, {
          recipeId,
          userId,
        });
        await manager.save(like);

        // Увеличиваем счетчик
        await manager.increment(Recipe, { id: recipeId }, 'likes', 1);

        // Получаем обновленный счетчик
        const updatedRecipe = await manager.findOne(Recipe, {
          where: { id: recipeId },
        });

        return { liked: true, likesCount: updatedRecipe?.likes || 0 };
      }
    });
  }

  async getLikeStatus(
    recipeId: string,
    userId?: string,
  ): Promise<{ liked: boolean; likesCount: number }> {
    const recipe = await this.recipesRepository.findOne({
      where: { id: recipeId, deletedAt: IsNull() },
    });
    if (!recipe) {
      throw new NotFoundException('Рецепт не найден');
    }

    let liked = false;
    if (userId) {
      const like = await this.likesRepository.findOne({
        where: { recipeId, userId },
      });
      liked = !!like;
    }

    return {
      liked,
      likesCount: recipe.likes,
    };
  }

  async getRecipeLikes(recipeId: string): Promise<Like[]> {
    const recipe = await this.recipesRepository.findOne({
      where: { id: recipeId, deletedAt: IsNull() },
    });
    if (!recipe) {
      throw new NotFoundException('Рецепт не найден');
    }

    return this.likesRepository.find({
      where: { recipeId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserLikes(userId: string): Promise<Like[]> {
    return this.likesRepository.find({
      where: { userId },
      relations: ['recipe', 'recipe.author'],
      order: { createdAt: 'DESC' },
    });
  }
}
