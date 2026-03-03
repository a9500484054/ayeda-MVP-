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
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  PaginatedResponseDto,
  PaginationDto,
} from 'src/common/dto/pagination.dto';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Создать категорию (только admin)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: CategoryResponseDto })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Категория с таким кодом/названием уже существует',
  })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  // @Get()
  // @ApiOperation({ summary: 'Получить список всех категорий' })
  // @ApiResponse({ status: HttpStatus.OK, type: [CategoryResponseDto] })
  // findAll(): Promise<CategoryResponseDto[]> {
  //   return this.categoriesService.findAll();
  // }

  @Get()
  @ApiOperation({
    summary: 'Получить список всех категорий (с пагинацией)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<CategoryResponseDto>,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<CategoryResponseDto>> {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;

    const [categories, total] =
      await this.categoriesService.findAllWithPagination(page, limit);

    return new PaginatedResponseDto(categories, total, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить категорию по ID' })
  @ApiParam({ name: 'id', description: 'UUID категории' })
  @ApiResponse({ status: HttpStatus.OK, type: CategoryResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Категория не найдена',
  })
  findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Обновить категорию (только admin)' })
  @ApiParam({ name: 'id', description: 'UUID категории' })
  @ApiResponse({ status: HttpStatus.OK, type: CategoryResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Категория не найдена',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Категория с таким кодом/названием уже существует',
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить категорию (только admin)' })
  @ApiParam({ name: 'id', description: 'UUID категории' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Удалено' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Категория не найдена',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
