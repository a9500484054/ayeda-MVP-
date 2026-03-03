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

@ApiTags('ingredients')
@Controller('ingredients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Post()
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

  @Get()
  @ApiOperation({ summary: 'Получить список всех ингредиентов' })
  @ApiResponse({ status: HttpStatus.OK, type: [IngredientResponseDto] })
  findAll(): Promise<IngredientResponseDto[]> {
    return this.ingredientsService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Поиск ингредиентов по названию или коду' })
  @ApiQuery({ name: 'q', description: 'Поисковый запрос' })
  @ApiResponse({ status: HttpStatus.OK, type: [IngredientResponseDto] })
  search(@Query('q') query: string): Promise<IngredientResponseDto[]> {
    return this.ingredientsService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить ингредиент по ID' })
  @ApiParam({ name: 'id', description: 'UUID ингредиента' })
  @ApiResponse({ status: HttpStatus.OK, type: IngredientResponseDto })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ингредиент не найден',
  })
  findOne(@Param('id') id: string): Promise<IngredientResponseDto> {
    return this.ingredientsService.findOne(id);
  }

  @Patch(':id')
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

  @Delete(':id')
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
}
