import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { RecipeCategory } from './entities/recipe-category.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeQueryDto } from './dto/recipe-query.dto';
import { UsersService } from '../users/users.service';
import { IngredientsService } from '../ingredients/ingredients.service';
import { CategoriesService } from '../categories/categories.service';
import { UnitsService } from '../units/units.service';
import { RecipeStatus, RecipeType } from './enums/recipe.enums';
import { RecipeResponseDto } from './dto/recipe-response.dto';
import { UserRole } from '../users/entities/user.entity';
import { Favorite } from '../favorites/entities/favorite.entity';

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
    @InjectRepository(RecipeIngredient)
    private recipeIngredientRepository: Repository<RecipeIngredient>,
    @InjectRepository(RecipeCategory)
    private recipeCategoryRepository: Repository<RecipeCategory>,
    private usersService: UsersService,
    private ingredientsService: IngredientsService,
    private categoriesService: CategoriesService,
    private unitsService: UnitsService,
    private dataSource: DataSource,
    @InjectRepository(Favorite)
    private favoritesRepository: Repository<Favorite>,
  ) {}

  async create(
    userId: string,
    createRecipeDto: CreateRecipeDto,
  ): Promise<Recipe> {
    // Проверяем существование автора
    const author = await this.usersService.findOne(userId);

    // Проверяем уникальность srcPath
    const existingPath = await this.recipesRepository.findOne({
      where: { srcPath: createRecipeDto.srcPath },
    });
    if (existingPath) {
      throw new BadRequestException('Рецепт с таким srcPath уже существует');
    }

    // Используем транзакцию для создания рецепта со связями
    const savedRecipe = await this.dataSource.transaction(async (manager) => {
      // Создаем рецепт
      const recipe = manager.create(Recipe, {
        ...createRecipeDto,
        authorId: userId,
        status: createRecipeDto.status
          ? createRecipeDto.status
          : (createRecipeDto.type === RecipeType.COMMUNITY
              ? RecipeStatus.PENDING
              : RecipeStatus.PRIVATE),
      });
      const saved = await manager.save(recipe);
      return saved;
    });

    // После транзакции загружаем все связи (используем внутренний метод без проверки прав)
    return this.findOneWithRelationsInternal(savedRecipe.id);
  }

  // async findOneWithRelations(id: string, userId?: string, userRole?: string): Promise<Recipe> {
  //   const queryBuilder = this.recipesRepository
  //     .createQueryBuilder('recipe')
  //     .leftJoinAndSelect('recipe.author', 'author')
  //     .leftJoinAndSelect('recipe.ingredients', 'ingredients')
  //     .leftJoinAndSelect('ingredients.ingredient', 'ingredient')
  //     .leftJoinAndSelect('ingredients.unit', 'unit')
  //     .leftJoinAndSelect('recipe.categories', 'rc')
  //     .leftJoinAndSelect('rc.category', 'category')
  //     .where('recipe.id = :id', { id })
  //     .andWhere('recipe.deletedAt IS NULL');

  //   const recipe = await queryBuilder.getOne();

  //   if (!recipe) {
  //     throw new NotFoundException('Рецепт не найден');
  //   }

  //   // Проверка прав доступа
  //   const isOwner = userId && recipe.authorId === userId;
  //   const isAdminOrModerator = userRole === UserRole.ADMIN || userRole === UserRole.MODERATOR;
  //   const isPublic = recipe.status === RecipeStatus.PUBLIC;

  //   if (!isPublic && !isOwner && !isAdminOrModerator) {
  //     throw new ForbiddenException('У вас нет доступа к этому рецепту');
  //   }

  //   return recipe;
  // }

  async findAll(query: RecipeQueryDto): Promise<[Recipe[], number]> {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      difficulty,
      authorId,
      categoryId,
      minCookingTime,
      maxCookingTime,
    } = query;

    const skip = (Number(page) - 1) * Number(limit);

    const queryBuilder = this.recipesRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.author', 'author')
      .leftJoinAndSelect('recipe.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.ingredient', 'ingredient')
      .leftJoinAndSelect('ingredients.unit', 'unit') // ← Добавляем загрузку unit
      .leftJoinAndSelect('recipe.categories', 'rc')
      .leftJoinAndSelect('rc.category', 'category')
      .where('recipe.deletedAt IS NULL');

    if (status) {
      queryBuilder.andWhere('recipe.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('recipe.type = :type', { type });
    }

    if (difficulty) {
      queryBuilder.andWhere('recipe.difficulty = :difficulty', { difficulty });
    }

    if (authorId) {
      queryBuilder.andWhere('recipe.authorId = :authorId', { authorId });
    }

    if (categoryId) {
      queryBuilder.andWhere('rc.categoryId = :categoryId', { categoryId });
    }

    if (minCookingTime) {
      queryBuilder.andWhere('recipe.cookingTime >= :minCookingTime', {
        minCookingTime,
      });
    }

    if (maxCookingTime) {
      queryBuilder.andWhere('recipe.cookingTime <= :maxCookingTime', {
        maxCookingTime,
      });
    }

    queryBuilder.orderBy('recipe.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    return queryBuilder.getManyAndCount();
  }

  async findOne(id: string, userId?: string, userRole?: string): Promise<Recipe> {
    return this.findOneWithRelations(id, userId, userRole);
  }

  async findBySrcPath(
    srcPath: string,
    userId?: string,
    userRole?: string,
  ): Promise<Recipe> {

    console.log('========== findBySrcPath ==========');
    console.log('srcPath:', srcPath);
    console.log('userId:', userId);
    console.log('userRole:', userRole);

    const recipe = await this.recipesRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.author', 'author')
      .leftJoinAndSelect('recipe.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.ingredient', 'ingredient')
      .leftJoinAndSelect('ingredient.unit', 'unit')
      .leftJoinAndSelect('recipe.categories', 'rc')
      .leftJoinAndSelect('rc.category', 'category')
      .where('recipe.srcPath = :srcPath', { srcPath })
      .andWhere('recipe.deletedAt IS NULL')
      .getOne();

    console.log('recipe found:', !!recipe);

    if (!recipe) {
      throw new NotFoundException('Рецепт не найден');
    }

    console.log('recipe.authorId:', recipe.authorId);
    console.log('recipe.status:', recipe.status);

    const isOwner = !!userId && recipe.authorId === userId;

    const isAdminOrModerator =
      userRole === UserRole.ADMIN ||
      userRole === UserRole.MODERATOR;

    const isPublic = recipe.status === RecipeStatus.PUBLIC;

    console.log('isOwner:', isOwner);
    console.log('isAdminOrModerator:', isAdminOrModerator);
    console.log('isPublic:', isPublic);

    console.log('UserRole.ADMIN:', UserRole.ADMIN);
    console.log('UserRole.MODERATOR:', UserRole.MODERATOR);

    console.log('ACCESS RESULT:', {
      denied: !isPublic && !isOwner && !isAdminOrModerator,
    });

    if (!isPublic && !isOwner && !isAdminOrModerator) {
      throw new ForbiddenException('У вас нет доступа к этому рецепту');
    }

    return recipe;
  }

  async update(
    userId: string,
    id: string,
    updateRecipeDto: UpdateRecipeDto,
  ): Promise<Recipe> {
    // Получаем пользователя и рецепт с проверкой прав
    const user = await this.usersService.findOne(userId);
    const recipe = await this.findOneWithRelations(id, userId, user.role);

    const isOwner = recipe.authorId === userId;
    const isAdminOrModerator = user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR;

    if (!isOwner && !isAdminOrModerator) {
      throw new ForbiddenException('Вы не можете редактировать этот рецепт');
    }

    if (updateRecipeDto.srcPath && updateRecipeDto.srcPath !== recipe.srcPath) {
      const existingPath = await this.recipesRepository.findOne({
        where: { srcPath: updateRecipeDto.srcPath },
      });
      if (existingPath) {
        throw new BadRequestException('Рецепт с таким srcPath уже существует');
      }
    }

    await this.dataSource.transaction(async (manager) => {
      const recipeToUpdate = await manager.findOne(Recipe, {
        where: { id },
      });

      if (!recipeToUpdate) {
        throw new NotFoundException('Рецепт не найден');
      }

      const { ingredients, categoryIds, ...recipeFields } = updateRecipeDto;

      Object.entries(recipeFields).forEach(([key, value]) => {
        if (value !== undefined) {
          recipeToUpdate[key] = value;
        }
      });

      if (updateRecipeDto.status === RecipeStatus.PUBLIC && recipeToUpdate.status !== RecipeStatus.PUBLIC) {
        recipeToUpdate.publishedAt = new Date();
      }

      recipeToUpdate.updatedAt = new Date();
      await manager.save(recipeToUpdate);

      if (updateRecipeDto.ingredients) {
        await manager.delete(RecipeIngredient, { recipeId: id });

        if (updateRecipeDto.ingredients.length > 0) {
          const uniqueIngredients = updateRecipeDto.ingredients.filter(
            (item, index, self) =>
              index === self.findIndex(
                (t) => t.ingredientId === item.ingredientId
              )
          );

          const recipeIngredients = uniqueIngredients.map((item) => {
            return manager.create(RecipeIngredient, {
              recipeId: id,
              ingredientId: item.ingredientId,
              amount: item.amount,
              notes: item.notes,
            });
          });

          await manager.save(recipeIngredients);
        }
      }

      if (updateRecipeDto.categoryIds) {
        await manager.delete(RecipeCategory, { recipeId: id });

        if (updateRecipeDto.categoryIds.length > 0) {
          const uniqueCategoryIds = [...new Set(updateRecipeDto.categoryIds)];

          const recipeCategories = uniqueCategoryIds.map((categoryId) => {
            return manager.create(RecipeCategory, {
              recipeId: id,
              categoryId,
            });
          });

          await manager.save(recipeCategories);
        }
      }
    });

    // Возвращаем обновленный рецепт (используем внутренний метод)
    return this.findOneWithRelationsInternal(id);
  }

  async remove(userId: string, id: string): Promise<void> {
    const user = await this.usersService.findOne(userId);
    const recipe = await this.findOneWithRelations(id, userId, user.role);

    const isOwner = recipe.authorId === userId;
    const isAdminOrModerator = user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR;

    if (!isOwner && !isAdminOrModerator) {
      throw new ForbiddenException('Вы не можете удалить этот рецепт');
    }

    await this.recipesRepository.softDelete(id);
  }

  async publish(id: string, moderatorId: string): Promise<Recipe> {
    const moderator = await this.usersService.findOne(moderatorId);
    const recipe = await this.findOneWithRelations(id, moderatorId, moderator.role);

    if (recipe.status !== RecipeStatus.PENDING) {
      throw new BadRequestException('Рецепт должен быть на модерации');
    }

    recipe.status = RecipeStatus.PUBLIC;
    recipe.publishedAt = new Date();

    if (recipe.type === RecipeType.PERSONAL) {
      recipe.type = RecipeType.COMMUNITY;
    }

    return this.recipesRepository.save(recipe);
  }

  async reject(id: string, moderatorId: string): Promise<Recipe> {
    const moderator = await this.usersService.findOne(moderatorId);
    const recipe = await this.findOneWithRelations(id, moderatorId, moderator.role);

    if (recipe.status !== RecipeStatus.PENDING) {
      throw new BadRequestException('Рецепт должен быть на модерации');
    }

    recipe.status = RecipeStatus.REJECTED;
    return this.recipesRepository.save(recipe);
  }

  // async search(query: string, paginationDto: any): Promise<[Recipe[], number]> {
  //   const { page, limit } = paginationDto;
  //   const skip = (page - 1) * limit;

  //   const queryBuilder = this.recipesRepository
  //     .createQueryBuilder('recipe')
  //     .leftJoinAndSelect('recipe.author', 'author')
  //     .leftJoinAndSelect('recipe.ingredients', 'ingredients')
  //     .leftJoinAndSelect('ingredients.ingredient', 'ingredient')
  //     .leftJoinAndSelect('recipe.categories', 'rc')
  //     .leftJoinAndSelect('rc.category', 'category')
  //     .where('recipe.deletedAt IS NULL')
  //     .andWhere('recipe.status = :status', { status: RecipeStatus.PUBLIC })
  //     .andWhere(
  //       `recipe.search_vector @@ plainto_tsquery('russian', :query)`,
  //       { query },
  //     )
  //     .orderBy('recipe.createdAt', 'DESC')
  //     .skip(skip)
  //     .take(limit);

  //   return queryBuilder.getManyAndCount();
  // }

  async incrementViews(id: string): Promise<void> {
    await this.recipesRepository.increment(
      { id },
      'viewsCount',
      1
    );
  }

  toResponseDto(recipe: Recipe): RecipeResponseDto {
    const categories =
      recipe.categories?.map((rc) => ({
        id: rc.category.id,
        code: rc.category.code,
        name: rc.category.name,
        description: rc.category.description,
        createdAt: rc.category.createdAt,
        updatedAt: rc.category.updatedAt,
      })) || [];

    const ingredients =
      recipe.ingredients?.map((ri) => ({
        id: ri.id,
        ingredient: ri.ingredient,
        amount: ri.amount,
        unit: ri.ingredient.unit || null, // Получаем unit из связанного ингредиента
        notes: ri.notes,
      })) || [];

    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      cookingTime: recipe.cookingTime,
      servings: recipe.servings,
      calories: recipe.calories,
      difficulty: recipe.difficulty,
      status: recipe.status,
      type: recipe.type,
      photo: recipe.photo,
      video: recipe.video,
      steps: recipe.steps,
      srcPath: recipe.srcPath,
      likes: recipe.likes,
      author: recipe.author,
      ingredients,
      categories,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      publishedAt: recipe.publishedAt,
      seo: recipe.seo,
      commentsCount: recipe.commentsCount || 0, // ✅ ДОБАВЬТЕ ЭТУ СТРОКУ
      viewsCount: recipe.viewsCount || 0, // ✅ Добавьте эту строку
    };
  }

  async submitForModeration(id: string, userId: string): Promise<Recipe> {
    // Получаем пользователя для его роли
    const user = await this.usersService.findOne(userId);

    // Передаем userId и userRole в findOneWithRelations
    const recipe = await this.findOneWithRelations(id, userId, user.role);

    // Проверяем, что пользователь - автор рецепта
    if (recipe.authorId !== userId) {
      throw new ForbiddenException(
        'Вы не можете отправить чужой рецепт на модерацию',
      );
    }

    // Нельзя отправить на модерацию уже опубликованный рецепт
    if (recipe.status === RecipeStatus.PUBLIC) {
      throw new BadRequestException(
        'Опубликованный рецепт нельзя отправить на модерацию',
      );
    }

    // Если рецепт уже на модерации - тоже нельзя
    if (recipe.status === RecipeStatus.PENDING) {
      throw new BadRequestException('Рецепт уже на модерации');
    }

    // Меняем статус
    recipe.status = RecipeStatus.PENDING;
    recipe.updatedAt = new Date();

    return this.recipesRepository.save(recipe);
  }

  async makePrivate(id: string, userId: string): Promise<Recipe> {
    // Получаем пользователя для его роли
    const user = await this.usersService.findOne(userId);

    // Передаем userId и userRole в findOneWithRelations
    const recipe = await this.findOneWithRelations(id, userId, user.role);

    // Проверяем, что пользователь - автор рецепта
    if (recipe.authorId !== userId) {
      throw new ForbiddenException('Вы можете сделать приватным только свой рецепт');
    }

    // Нельзя сделать приватным опубликованный рецепт
    if (recipe.status === RecipeStatus.PUBLIC) {
      throw new BadRequestException('Опубликованный рецепт нельзя сделать приватным');
    }

    // Проверяем, не является ли уже рецепт приватным
    if (recipe.status === RecipeStatus.PRIVATE) {
      throw new BadRequestException('Рецепт уже является приватным');
    }

    // Меняем статус на PRIVATE
    recipe.status = RecipeStatus.PRIVATE;
    recipe.updatedAt = new Date();

    return this.recipesRepository.save(recipe);
  }

  // Добавьте эти методы в существующий RecipesService

  // ==================== ПОИСК ====================

  // 1. Публичный поиск (без авторизации)
  async searchPublic(query: string, paginationDto: any): Promise<[Recipe[], number]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.buildSearchQuery(query)
      .andWhere('recipe.status = :status', { status: RecipeStatus.PUBLIC });

    queryBuilder
      .orderBy('recipe.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    return queryBuilder.getManyAndCount();
  }

  // 2. Поиск по своим рецептам (все статусы)
  async searchMyRecipes(userId: string, query: string, paginationDto: any): Promise<[Recipe[], number]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.buildSearchQuery(query)
      .andWhere('recipe.authorId = :userId', { userId })
      .andWhere('recipe.deletedAt IS NULL');

    queryBuilder
      .orderBy('recipe.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    return queryBuilder.getManyAndCount();
  }

  // 3. Поиск по избранным рецептам (с использованием Favorite Repository)
  async searchFavorites(userId: string, query: string, paginationDto: any): Promise<[Recipe[], number]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    // Получаем избранные рецепты
    const favorites = await this.favoritesRepository.find({
      where: { userId },
      relations: ['recipe'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Фильтруем по поиску и статусу
    let recipes = favorites
      .map(f => f.recipe)
      .filter(r => r && r.status === RecipeStatus.PUBLIC && r.deletedAt === null);

    if (query && query.trim()) {
      const searchTerm = query.trim().toLowerCase();
      recipes = recipes.filter(recipe =>
        recipe.title?.toLowerCase().includes(searchTerm) ||
        recipe.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Загружаем полные данные для найденных рецептов
    if (recipes.length === 0) {
      return [[], 0];
    }

    const recipeIds = recipes.map(r => r.id);
    const recipesWithRelations = await this.recipesRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.author', 'author')
      .leftJoinAndSelect('recipe.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.ingredient', 'ingredient')
      .leftJoinAndSelect('ingredients.unit', 'unit')
      .leftJoinAndSelect('recipe.categories', 'rc')
      .leftJoinAndSelect('rc.category', 'category')
      .where('recipe.id IN (:...ids)', { ids: recipeIds })
      .orderBy('recipe.createdAt', 'DESC')
      .getMany();

    return [recipesWithRelations, recipesWithRelations.length];
  }

  // 4. Комбинированный поиск (публичные + свои рецепты)
  async searchPublicAndMy(userId: string, query: string, paginationDto: any): Promise<[Recipe[], number]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.buildSearchQuery(query)
      .andWhere(
        '(recipe.status = :publicStatus OR recipe.authorId = :userId)',
        {
          publicStatus: RecipeStatus.PUBLIC,
          userId: userId,
        }
      )
      .andWhere('recipe.deletedAt IS NULL');

    queryBuilder
      .orderBy('recipe.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    return queryBuilder.getManyAndCount();
  }

  // Базовый метод построения поискового запроса (DRY принцип)
  private buildSearchQuery(query: string) {
    const queryBuilder = this.recipesRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.author', 'author')
      .leftJoinAndSelect('recipe.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.ingredient', 'ingredient')
      .leftJoinAndSelect('ingredients.unit', 'unit')
      .leftJoinAndSelect('recipe.categories', 'rc')
      .leftJoinAndSelect('rc.category', 'category');

    if (query && query.trim()) {
      const searchTerm = query.trim();
      queryBuilder.andWhere(
        '(recipe.title ILIKE :search OR recipe.description ILIKE :search)',
        { search: `%${searchTerm}%` }
      );
    }

    return queryBuilder;
  }

  // Для обратной совместимости (старый метод search)
  async search(query: string, paginationDto: any): Promise<[Recipe[], number]> {
    return this.searchPublic(query, paginationDto);
  }

  // ==================== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ====================

  // Приватный метод для внутреннего использования (БЕЗ проверки прав)
  private async findOneWithRelationsInternal(id: string): Promise<Recipe> {
    const queryBuilder = this.recipesRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.author', 'author')
      .leftJoinAndSelect('recipe.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.ingredient', 'ingredient')
      .leftJoinAndSelect('ingredient.unit', 'unit')  // ← ИСПРАВЛЕНО
      .leftJoinAndSelect('recipe.categories', 'rc')
      .leftJoinAndSelect('rc.category', 'category')
      .where('recipe.id = :id', { id })
      .andWhere('recipe.deletedAt IS NULL');

    const recipe = await queryBuilder.getOne();

    if (!recipe) {
      throw new NotFoundException('Рецепт не найден');
    }

    return recipe;
  }

  // Публичный метод для API (С проверкой прав)
  async findOneWithRelations(id: string, userId?: string, userRole?: string): Promise<Recipe> {
    const recipe = await this.findOneWithRelationsInternal(id);

    const isOwner = userId && recipe.authorId === userId;
    const isAdminOrModerator = userRole === UserRole.ADMIN || userRole === UserRole.MODERATOR;
    const isPublic = recipe.status === RecipeStatus.PUBLIC;

    if (!isPublic && !isOwner && !isAdminOrModerator) {
      throw new ForbiddenException('У вас нет доступа к этому рецепту');
    }

    return recipe;
  }
}
