import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientResponseDto } from './dto/ingredient-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from 'src/common/dto/pagination.dto';

@ApiTags('ingredients')
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  // 🔒 Создание - только admin/moderator
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Создать ингредиент (admin/moderator)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: IngredientResponseDto })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ингредиент с таким кодом уже существует',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Единица измерения не найдена',
  })
  create(
    @Body() createIngredientDto: CreateIngredientDto,
  ): Promise<IngredientResponseDto> {
    return this.ingredientsService.create(createIngredientDto);
  }

  // ✅ ПУБЛИЧНЫЙ - список ингредиентов (без авторизации)
  @Get()
  @ApiOperation({ summary: 'Получить список всех ингредиентов (публичный)' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<IngredientResponseDto>,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<IngredientResponseDto>> {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;

    const [ingredients, total] =
      await this.ingredientsService.findAllWithPagination(page, limit);

    return new PaginatedResponseDto(ingredients, total, page, limit);
  }

  // ✅ ПУБЛИЧНЫЙ - поиск ингредиентов (без авторизации)
  @Get('search')
  @ApiOperation({ summary: 'Поиск ингредиентов (публичный)' })
  @ApiQuery({ name: 'q', description: 'Поисковый запрос', required: true })
  @ApiQuery({ name: 'page', description: 'Номер страницы', required: false, type: Number })
  @ApiQuery({ name: 'limit', description: 'Количество элементов', required: false, type: Number })
  async search(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedResponseDto<IngredientResponseDto>> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const [ingredients, total] = await this.ingredientsService.searchWithPagination(
      query,
      pageNum,
      limitNum,
    );

    return new PaginatedResponseDto(ingredients, total, pageNum, limitNum);
  }

  // ✅ ПУБЛИЧНЫЙ - получение ингредиента по ID (без авторизации)
  @Get(':id')
  @ApiOperation({ summary: 'Получить ингредиент по ID (публичный)' })
  @ApiParam({ name: 'id', description: 'UUID ингредиента' })
  @ApiResponse({ status: HttpStatus.OK, type: IngredientResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ингредиент не найден',
  })
  findOne(@Param('id') id: string): Promise<IngredientResponseDto> {
    return this.ingredientsService.findOne(id);
  }

  // 🔒 Обновление - только admin/moderator
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Обновить ингредиент (admin/moderator)' })
  @ApiParam({ name: 'id', description: 'UUID ингредиента' })
  @ApiResponse({ status: HttpStatus.OK, type: IngredientResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ингредиент не найден',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ингредиент с таким кодом уже существует',
  })
  update(
    @Param('id') id: string,
    @Body() updateIngredientDto: UpdateIngredientDto,
  ): Promise<IngredientResponseDto> {
    return this.ingredientsService.update(id, updateIngredientDto);
  }

  // 🔒 Удаление - только admin
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить ингредиент (только admin)' })
  @ApiParam({ name: 'id', description: 'UUID ингредиента' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Ингредиент удален',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ингредиент не найден',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.ingredientsService.remove(id);
  }

  // Добавить в класс IngredientsController:

  // ✅ ПУБЛИЧНЫЙ - получение ингредиента по srcPath (без авторизации)
  @Get('by-path/:srcPath')
  @ApiOperation({ summary: 'Получить ингредиент по srcPath (публичный)' })
  @ApiParam({ name: 'srcPath', description: 'Уникальный путь ингредиента' })
  @ApiResponse({ status: HttpStatus.OK, type: IngredientResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ингредиент не найден',
  })
  async findBySrcPath(@Param('srcPath') srcPath: string): Promise<IngredientResponseDto> {
    return this.ingredientsService.findBySrcPath(srcPath);
  }
}
