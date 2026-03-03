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
      // 1. Создаем рецепт
      const recipe = manager.create(Recipe, {
        ...createRecipeDto,
        authorId: userId,
        status:
          createRecipeDto.type === 'community'
            ? RecipeStatus.PENDING
            : RecipeStatus.PRIVATE,
      });
      const saved = await manager.save(recipe);

      // // 2. Добавляем ингредиенты (с защитой от дубликатов)
      // if (createRecipeDto.ingredients?.length) {
      //   // Удаляем дубликаты по ingredientId + unitId
      //   const uniqueIngredients = createRecipeDto.ingredients.filter(
      //     (item, index, self) =>
      //       index ===
      //       self.findIndex(
      //         (t) =>
      //           t.ingredientId === item.ingredientId &&
      //           t.unitId === item.unitId,
      //       ),
      //   );

      //   const recipeIngredients = await Promise.all(
      //     uniqueIngredients.map(async (item) => {
      //       // Проверяем существование ингредиента
      //       await this.ingredientsService.findOne(item.ingredientId);

      //       // Если указана единица измерения, проверяем её
      //       if (item.unitId) {
      //         await this.unitsService.findOne(item.unitId);
      //       }

      //       return manager.create(RecipeIngredient, {
      //         recipeId: saved.id,
      //         ingredientId: item.ingredientId,
      //         amount: item.amount,
      //         unitId: item.unitId,
      //         notes: item.notes,
      //       });
      //     }),
      //   );
      //   await manager.save(recipeIngredients);
      // }

      // // 3. Добавляем категории (с защитой от дубликатов)
      // if (createRecipeDto.categoryIds?.length) {
      //   // Удаляем дубликаты categoryIds
      //   const uniqueCategoryIds = [...new Set(createRecipeDto.categoryIds)];

      //   const recipeCategories = await Promise.all(
      //     uniqueCategoryIds.map(async (categoryId) => {
      //       // Проверяем существование категории
      //       await this.categoriesService.findOne(categoryId);

      //       return manager.create(RecipeCategory, {
      //         recipeId: saved.id,
      //         categoryId,
      //       });
      //     }),
      //   );
      //   await manager.save(recipeCategories);
      // }

      return saved;
    });

    // После транзакции загружаем все связи
    return this.findOneWithRelations(savedRecipe.id);
  }

  async findOneWithRelations(id: string): Promise<Recipe> {
    const recipe = await this.recipesRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.author', 'author')
      .leftJoinAndSelect('recipe.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.ingredient', 'ingredient')
      .leftJoinAndSelect('ingredients.unit', 'unit')
      .leftJoinAndSelect('recipe.categories', 'rc')
      .leftJoinAndSelect('rc.category', 'category')
      .where('recipe.id = :id', { id })
      .andWhere('recipe.deletedAt IS NULL')
      .getOne();

    if (!recipe) {
      throw new NotFoundException('Рецепт не найден');
    }

    return recipe;
  }

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
      .leftJoinAndSelect('ingredients.unit', 'unit')
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

  async findOne(id: string): Promise<Recipe> {
    return this.findOneWithRelations(id);
  }

  async findBySrcPath(srcPath: string): Promise<Recipe> {
    const recipe = await this.recipesRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.author', 'author')
      .leftJoinAndSelect('recipe.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.ingredient', 'ingredient')
      .leftJoinAndSelect('ingredients.unit', 'unit')
      .leftJoinAndSelect('recipe.categories', 'rc')
      .leftJoinAndSelect('rc.category', 'category')
      .where('recipe.srcPath = :srcPath', { srcPath })
      .andWhere('recipe.deletedAt IS NULL')
      .getOne();

    if (!recipe) {
      throw new NotFoundException('Рецепт не найден');
    }

    return recipe;
  }

  async update(
    userId: string,
    id: string,
    updateRecipeDto: UpdateRecipeDto,
  ): Promise<Recipe> {
    const recipe = await this.findOneWithRelations(id);

    if (recipe.authorId !== userId) {
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
      // 1. Получаем текущий рецепт
      const recipeToUpdate = await manager.findOne(Recipe, {
        where: { id },
      });

      if (!recipeToUpdate) {
        throw new NotFoundException('Рецепт не найден');
      }

      // 2. Обновляем поля рецепта
      const { ingredients, categoryIds, ...recipeFields } = updateRecipeDto;

      Object.entries(recipeFields).forEach(([key, value]) => {
        if (value !== undefined) {
          recipeToUpdate[key] = value;
        }
      });
      recipeToUpdate.updatedAt = new Date();
      await manager.save(recipeToUpdate); // Используем save вместо update

      // 3. Обновляем ингредиенты (если они переданы)
      if (updateRecipeDto.ingredients) {
        await manager.delete(RecipeIngredient, { recipeId: id });

        if (updateRecipeDto.ingredients.length > 0) {
          const uniqueIngredients = updateRecipeDto.ingredients.filter(
            (item, index, self) =>
              index === self.findIndex(
                (t) => t.ingredientId === item.ingredientId && t.unitId === item.unitId
              )
          );

          const recipeIngredients = uniqueIngredients.map((item) => {
            return manager.create(RecipeIngredient, {
              recipeId: id,
              ingredientId: item.ingredientId,
              amount: item.amount,
              unitId: item.unitId,
              notes: item.notes,
            });
          });

          await manager.save(recipeIngredients);
        }
      }

      // 4. Обновляем категории (если они переданы)
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

    return this.findOneWithRelations(id);
  }

  async remove(userId: string, id: string): Promise<void> {
    const recipe = await this.findOneWithRelations(id);

    const user = await this.usersService.findOne(userId);
    if (recipe.authorId !== userId && user.role !== 'admin') {
      throw new ForbiddenException('Вы не можете удалить этот рецепт');
    }

    await this.recipesRepository.softDelete(id);
  }

  async publish(id: string, moderatorId: string): Promise<Recipe> {
    const recipe = await this.findOneWithRelations(id);

    if (recipe.status !== RecipeStatus.PENDING) {
      throw new BadRequestException('Рецепт должен быть на модерации');
    }

    recipe.status = RecipeStatus.PUBLIC;
    recipe.publishedAt = new Date();

    // Автоматически меняем тип на COMMUNITY при публикации
    if (recipe.type === RecipeType.PERSONAL) {
      recipe.type = RecipeType.COMMUNITY;
    }

    return this.recipesRepository.save(recipe);
  }

  async reject(id: string, moderatorId: string): Promise<Recipe> {
    const recipe = await this.findOneWithRelations(id);

    if (recipe.status !== RecipeStatus.PENDING) {
      throw new BadRequestException('Рецепт должен быть на модерации');
    }

    recipe.status = RecipeStatus.REJECTED;
    return this.recipesRepository.save(recipe);
  }

  async search(query: string, paginationDto: any): Promise<[Recipe[], number]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.recipesRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.author', 'author')
      .leftJoinAndSelect('recipe.ingredients', 'ingredients')
      .leftJoinAndSelect('ingredients.ingredient', 'ingredient')
      .leftJoinAndSelect('recipe.categories', 'rc')
      .leftJoinAndSelect('rc.category', 'category')
      .where('recipe.deletedAt IS NULL')
      .andWhere('recipe.status = :status', { status: RecipeStatus.PUBLIC })
      .andWhere(
        `recipe.search_vector @@ plainto_tsquery('russian', :query)`,
        { query },
      )
      .orderBy('recipe.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    return queryBuilder.getManyAndCount();
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
        unit: ri.unit,
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
    };
  }

  async submitForModeration(id: string, userId: string): Promise<Recipe> {
    const recipe = await this.findOneWithRelations(id);

    // Проверяем, что пользователь - автор рецепта
    if (recipe.authorId !== userId) {
      throw new ForbiddenException(
        'Вы не можете отправить чужой рецепт на модерацию',
      );
    }

    // Проверяем, что рецепт еще не опубликован
    if (recipe.status === RecipeStatus.PUBLIC) {
      throw new BadRequestException(
        'Опубликованный рецепт нельзя отправить на модерацию',
      );
    }

    // Если рецепт уже на модерации - тоже нельзя
    if (recipe.status === RecipeStatus.PENDING) {
      throw new BadRequestException('Рецепт уже на модерации');
    }

    // Меняем статус на PENDING (из любого статуса, кроме PUBLIC и PENDING)
    recipe.status = RecipeStatus.PENDING;
    recipe.updatedAt = new Date();

    return this.recipesRepository.save(recipe);
  }
}
