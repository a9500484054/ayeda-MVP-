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
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';
import { RecipeQueryDto } from './dto/recipe-query.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { RecipeStatus } from './enums/recipe.enums';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать рецепт' })
  @ApiResponse({ status: HttpStatus.CREATED, type: RecipeResponseDto })
  async create(
    @Req() req: RequestWithUser,
    @Body() createRecipeDto: CreateRecipeDto,
  ): Promise<RecipeResponseDto> {
    const recipe = await this.recipesService.create(
      req.user.id,
      createRecipeDto,
    );
    return this.recipesService.toResponseDto(recipe);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список рецептов (с пагинацией и фильтрами)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<RecipeResponseDto>,
  })
  async findAll(
    @Query() query: RecipeQueryDto,
  ): Promise<PaginatedResponseDto<RecipeResponseDto>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const [recipes, total] = await this.recipesService.findAll(query);

    const recipeDtos = recipes.map((recipe) =>
      this.recipesService.toResponseDto(recipe),
    );

    return new PaginatedResponseDto(recipeDtos, total, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить рецепт по ID' })
  @ApiParam({ name: 'id', description: 'UUID рецепта' })
  @ApiResponse({ status: HttpStatus.OK, type: RecipeResponseDto })
  async findOne(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<RecipeResponseDto> {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const recipe = await this.recipesService.findOne(id, userId, userRole);

    if (recipe.status === RecipeStatus.PUBLIC) {
      this.recipesService.incrementViews(id).catch(err => {
        console.error('Failed to increment views:', err);
      });
    }

    return this.recipesService.toResponseDto(recipe);
  }

  @Get('by-path/:srcPath')
  @ApiOperation({ summary: 'Получить рецепт по srcPath (slug)' })
  @ApiParam({ name: 'srcPath', description: 'ЧПУ рецепта' })
  @ApiResponse({ status: HttpStatus.OK, type: RecipeResponseDto })
  async findBySrcPath(
    @Param('srcPath') srcPath: string,
    @Req() req: RequestWithUser,
  ): Promise<RecipeResponseDto> {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const recipe = await this.recipesService.findBySrcPath(srcPath, userId, userRole);

    if (recipe.status === RecipeStatus.PUBLIC) {
      this.recipesService.incrementViews(recipe.id).catch(err => {
        console.error('Failed to increment views:', err);
      });
    }

    return this.recipesService.toResponseDto(recipe);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить рецепт' })
  @ApiParam({ name: 'id', description: 'UUID рецепта' })
  @ApiResponse({ status: HttpStatus.OK, type: RecipeResponseDto })
  async update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ): Promise<RecipeResponseDto> {
    const recipe = await this.recipesService.update(
      req.user.id,
      id,
      updateRecipeDto,
    );
    return this.recipesService.toResponseDto(recipe);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить рецепт (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID рецепта' })
  async remove(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.recipesService.remove(req.user.id, id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Опубликовать рецепт (для модераторов)' })
  @ApiParam({ name: 'id', description: 'UUID рецепта' })
  async publish(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<RecipeResponseDto> {
    const recipe = await this.recipesService.publish(id, req.user.id);
    return this.recipesService.toResponseDto(recipe);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отклонить рецепт (для модераторов)' })
  @ApiParam({ name: 'id', description: 'UUID рецепта' })
  async reject(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<RecipeResponseDto> {
    const recipe = await this.recipesService.reject(id, req.user.id);
    return this.recipesService.toResponseDto(recipe);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отправить рецепт на модерацию' })
  @ApiParam({ name: 'id', description: 'UUID рецепта' })
  @ApiResponse({ status: HttpStatus.OK, type: RecipeResponseDto })
  async submitForModeration(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<RecipeResponseDto> {
    const recipe = await this.recipesService.submitForModeration(
      id,
      req.user.id,
    );
    return this.recipesService.toResponseDto(recipe);
  }

  @Post(':id/make-private')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Сделать рецепт приватным (только для автора)' })
  @ApiParam({ name: 'id', description: 'UUID рецепта' })
  @ApiResponse({ status: HttpStatus.OK, type: RecipeResponseDto })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Нет прав' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Нельзя сделать приватным опубликованный рецепт' })
  async makePrivate(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<RecipeResponseDto> {
    const recipe = await this.recipesService.makePrivate(id, req.user.id);
    return this.recipesService.toResponseDto(recipe);
  }

  // ==================== ПОИСКОВЫЕ ЭНДПОИНТЫ ====================

  @Get('search/public')
  @ApiOperation({ summary: 'Публичный поиск рецептов (только опубликованные)' })
  @ApiQuery({ name: 'q', description: 'Поисковый запрос', required: false })
  @ApiQuery({ name: 'page', description: 'Номер страницы', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Рецептов на странице', required: false, example: 12 })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedResponseDto<RecipeResponseDto> })
  async searchPublic(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
  ): Promise<PaginatedResponseDto<RecipeResponseDto>> {
    const [recipes, total] = await this.recipesService.searchPublic(query, {
      page: Number(page),
      limit: Number(limit),
    });

    const recipeDtos = recipes.map((recipe) =>
      this.recipesService.toResponseDto(recipe),
    );

    return new PaginatedResponseDto(recipeDtos, total, Number(page), Number(limit));
  }

  @Get('search/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Поиск по своим рецептам (все статусы)' })
  @ApiQuery({ name: 'q', description: 'Поисковый запрос', required: false })
  @ApiQuery({ name: 'page', description: 'Номер страницы', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Рецептов на странице', required: false, example: 12 })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedResponseDto<RecipeResponseDto> })
  async searchMyRecipes(
    @Req() req: RequestWithUser,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
  ): Promise<PaginatedResponseDto<RecipeResponseDto>> {
    const [recipes, total] = await this.recipesService.searchMyRecipes(
      req.user.id,
      query,
      { page: Number(page), limit: Number(limit) },
    );

    const recipeDtos = recipes.map((recipe) =>
      this.recipesService.toResponseDto(recipe),
    );

    return new PaginatedResponseDto(recipeDtos, total, Number(page), Number(limit));
  }

  @Get('search/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Поиск по избранным рецептам' })
  @ApiQuery({ name: 'q', description: 'Поисковый запрос', required: false })
  @ApiQuery({ name: 'page', description: 'Номер страницы', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Рецептов на странице', required: false, example: 12 })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedResponseDto<RecipeResponseDto> })
  async searchFavorites(
    @Req() req: RequestWithUser,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
  ): Promise<PaginatedResponseDto<RecipeResponseDto>> {
    const [recipes, total] = await this.recipesService.searchFavorites(
      req.user.id,
      query,
      { page: Number(page), limit: Number(limit) },
    );

    const recipeDtos = recipes.map((recipe) =>
      this.recipesService.toResponseDto(recipe),
    );

    return new PaginatedResponseDto(recipeDtos, total, Number(page), Number(limit));
  }

  @Get('search/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Поиск по публичным + своим рецептам' })
  @ApiQuery({ name: 'q', description: 'Поисковый запрос', required: false })
  @ApiQuery({ name: 'page', description: 'Номер страницы', required: false, example: 1 })
  @ApiQuery({ name: 'limit', description: 'Рецептов на странице', required: false, example: 12 })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedResponseDto<RecipeResponseDto> })
  async searchPublicAndMy(
    @Req() req: RequestWithUser,
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
  ): Promise<PaginatedResponseDto<RecipeResponseDto>> {
    const [recipes, total] = await this.recipesService.searchPublicAndMy(
      req.user.id,
      query,
      { page: Number(page), limit: Number(limit) },
    );

    const recipeDtos = recipes.map((recipe) =>
      this.recipesService.toResponseDto(recipe),
    );

    return new PaginatedResponseDto(recipeDtos, total, Number(page), Number(limit));
  }

  @Get('search')
  @ApiOperation({ summary: 'Поиск рецептов (устаревший, используйте /search/public)' })
  @ApiQuery({ name: 'q', description: 'Поисковый запрос' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedResponseDto<RecipeResponseDto> })
  async searchLegacy(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 12,
  ): Promise<PaginatedResponseDto<RecipeResponseDto>> {
    const [recipes, total] = await this.recipesService.search(query, {
      page: Number(page),
      limit: Number(limit),
    });

    const recipeDtos = recipes.map((recipe) =>
      this.recipesService.toResponseDto(recipe),
    );

    return new PaginatedResponseDto(recipeDtos, total, Number(page), Number(limit));
  }
}
