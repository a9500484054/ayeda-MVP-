import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Recipe } from '../recipes/entities/recipe.entity';
import { User } from '../users/entities/user.entity';
import { Comment } from '../comments/entities/comment.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Category } from '../categories/entities/category.entity';
import { RecipeStatus } from '../recipes/enums/recipe.enums';
import { DashboardResponseDto, StatItemDto, RecentRecipeDto } from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getDashboardData(): Promise<DashboardResponseDto> {
    // Получаем все счетчики параллельно для производительности
    const [
      totalUsers,
      totalRecipes,
      totalComments,
      totalIngredients,
      totalCategories,
      pendingModeration,
      recentRecipes,
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getTotalRecipes(),
      this.getTotalComments(),
      this.getTotalIngredients(),
      this.getTotalCategories(),
      this.getPendingModerationCount(),
      this.getRecentRecipes(5), // Последние 5 рецептов
    ]);

    // Формируем статистику для карточек
    const stats: StatItemDto[] = [
      {
        label: 'Рецептов на модерации',
        value: pendingModeration,
        icon: 'i-lucide-clock',
        trend: this.getTrend(pendingModeration, 'pending'),
        color: 'warning',
      },
      {
        label: 'Всего рецептов',
        value: totalRecipes,
        icon: 'i-lucide-utensils',
        trend: this.getTrend(totalRecipes, 'recipes'),
        color: 'info',
      },
      {
        label: 'Пользователей',
        value: totalUsers,
        icon: 'i-lucide-users',
        trend: this.getTrend(totalUsers, 'users'),
        color: 'success',
      },
      {
        label: 'Комментариев',
        value: totalComments,
        icon: 'i-lucide-message-circle',
        trend: this.getTrend(totalComments, 'comments'),
        color: 'secondary',
      },
      {
        label: 'Ингредиентов',
        value: totalIngredients,
        icon: 'i-lucide-carrot',
        trend: this.getTrend(totalIngredients, 'ingredients'),
        color: 'primary',
      },
      {
        label: 'Категорий',
        value: totalCategories,
        icon: 'i-lucide-tags',
        trend: this.getTrend(totalCategories, 'categories'),
        color: 'neutral',
      },
    ];

    return {
      stats,
      recentRecipes,
      totalUsers,
      totalRecipes,
      totalComments,
      totalIngredients,
      totalCategories,
      pendingModeration,
    };
  }

  // ==================== PRIVATE METHODS ====================

  private async getTotalUsers(): Promise<number> {
    return this.userRepository.count({
      where: { deletedAt: IsNull() },
    });
  }

  private async getTotalRecipes(): Promise<number> {
    return this.recipeRepository.count({
      where: { deletedAt: IsNull() },
    });
  }

  private async getTotalComments(): Promise<number> {
    return this.commentRepository.count({
      where: { deletedAt: IsNull() },
    });
  }

  private async getTotalIngredients(): Promise<number> {
    return this.ingredientRepository.count();
  }

  private async getTotalCategories(): Promise<number> {
    return this.categoryRepository.count();
  }

  private async getPendingModerationCount(): Promise<number> {
    return this.recipeRepository.count({
      where: {
        status: RecipeStatus.PENDING,
        deletedAt: IsNull(),
      },
    });
  }

  private async getRecentRecipes(limit: number = 5): Promise<RecentRecipeDto[]> {
    const recipes = await this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.author', 'author')
      .where('recipe.deletedAt IS NULL')
      .orderBy('recipe.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return recipes.map((recipe) => ({
      id: recipe.id,
      title: recipe.title,
      author: recipe.author?.username || 'Удаленный пользователь',
      status: recipe.status,
      date: recipe.createdAt,
    }));
  }

  // ==================== HELPER METHODS ====================

  private getTrend(value: number, type: string): string {
    // В реальном приложении здесь нужно сравнивать с данными за предыдущий период
    // Сейчас возвращаем случайный тренд для демонстрации
    const trends: Record<string, string> = {
      pending: value > 0 ? `+${Math.floor(value * 0.1) || 1}` : '0',
      recipes: `+${Math.floor(value * 0.05) || 1}`,
      users: `+${Math.floor(value * 0.03) || 1}`,
      comments: `+${Math.floor(value * 0.07) || 1}`,
      ingredients: `+${Math.floor(value * 0.02) || 1}`,
      categories: `+${Math.floor(value * 0.08) || 1}`,
    };

    return trends[type] || '+0';
  }
}
