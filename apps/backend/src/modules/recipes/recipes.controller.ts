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

  @Get('search')
  @ApiOperation({ summary: 'Полнотекстовый поиск рецептов' })
  @ApiQuery({ name: 'q', description: 'Поисковый запрос' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<RecipeResponseDto>,
  })
  async search(
    @Query('q') query: string,
    @Query() paginationDto: any,
  ): Promise<PaginatedResponseDto<RecipeResponseDto>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const page = Number(paginationDto.page) || 1;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const limit = Number(paginationDto.limit) || 10;

    const [recipes, total] = await this.recipesService.search(query, {
      page,
      limit,
    });

    const recipeDtos = recipes.map((recipe) =>
      this.recipesService.toResponseDto(recipe),
    );

    return new PaginatedResponseDto(recipeDtos, total, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить рецепт по ID' })
  @ApiParam({ name: 'id', description: 'UUID рецепта' })
  @ApiResponse({ status: HttpStatus.OK, type: RecipeResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Рецепт не найден',
  })
  async findOne(@Param('id') id: string): Promise<RecipeResponseDto> {
    const recipe = await this.recipesService.findOne(id);
    return this.recipesService.toResponseDto(recipe);
  }

  @Get('by-path/:srcPath')
  @ApiOperation({ summary: 'Получить рецепт по srcPath (slug)' })
  @ApiParam({ name: 'srcPath', description: 'ЧПУ рецепта' })
  @ApiResponse({ status: HttpStatus.OK, type: RecipeResponseDto })
  async findBySrcPath(
    @Param('srcPath') srcPath: string,
  ): Promise<RecipeResponseDto> {
    const recipe = await this.recipesService.findBySrcPath(srcPath);
    return this.recipesService.toResponseDto(recipe);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
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
}
