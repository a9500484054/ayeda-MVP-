import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User, UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedResponseDto, PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard'; // Добавьте импорт RolesGuard
import { UsersCacheService } from './users.cache.service';
import { Roles } from '../../common/decorators/roles.decorator'; // Исправьте путь
import redisClient from 'src/config/redis';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersCacheService: UsersCacheService, // Исправьте синтаксис конструктора
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создание нового пользователя' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'Пользователь успешно создан',
    type: UserResponseDto,
  })
  @ApiConflictResponse({
    description: 'Пользователь с таким email или username уже существует',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    return new UserResponseDto(user);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список всех пользователей (с пагинацией)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список пользователей с пагинацией',
    type: PaginatedResponseDto<UserResponseDto>,
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const page = Number(paginationDto.page) || 1;
    const limit = Number(paginationDto.limit) || 10;

    const [users, total] = await this.usersService.findAllWithPagination(
      page,
      limit,
    );

    return new PaginatedResponseDto(
      users.map((user) => new UserResponseDto(user)),
      total,
      page,
      limit,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение текущего авторизованного пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Данные текущего пользователя',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Не авторизован',
  })
  async getCurrentUser(@Req() req): Promise<UserResponseDto> {
    const userId = req.user.id;
    const user = await this.usersService.findOne(userId);
    return new UserResponseDto(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение пользователя по ID' })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiOkResponse({
    description: 'Пользователь найден',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return new UserResponseDto(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновление данных пользователя' })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'Пользователь обновлен',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<User>,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, updateData);
    return new UserResponseDto(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удаление пользователя (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Пользователь удален',
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }

  @Post('cache/clear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Очистка кэша пользователей (только админ)' })
  async clearCache() {
    await this.usersCacheService.clearAllUsersCache();
    return { message: 'Cache cleared successfully' };
  }

  @Get('cache/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Статистика кэша пользователей (только админ)' })
  async getCacheStats() {
    const keys = await redisClient.keys('user:*');
    const stats = {
      totalCachedUsers: keys.length,
      keys: keys,
      memory: await redisClient.info('memory').then(info => {
        const match = info.match(/used_memory_human:(\d+\.?\d*\s*\w+)/);
        return match ? match[1] : 'unknown';
      })
    };
    return stats;
  }
}
