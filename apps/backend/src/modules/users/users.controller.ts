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
  ForbiddenException,
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
import { UserRole } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  PaginatedResponseDto,
  PaginationDto,
} from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard'; // Добавьте импорт RolesGuard
import { UsersCacheService } from './users.cache.service';
import { Roles } from '../../common/decorators/roles.decorator'; // Исправьте путь
import redisClient from 'src/config/redis';

interface AuthedRequest {
  user: { id: string; email: string; role: UserRole };
}

const STAFF_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.MODERATOR];

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersCacheService: UsersCacheService, // Исправьте синтаксис конструктора
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создание пользователя (только администратор)' })
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Список пользователей с пагинацией (admin/moderator)',
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получение пользователя по ID (сам или admin/moderator)',
  })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiOkResponse({
    description: 'Пользователь найден',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async findOne(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
  ): Promise<UserResponseDto> {
    this.assertSelfOrStaff(req, id);
    const user = await this.usersService.findOne(id);
    return new UserResponseDto(user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Обновление данных пользователя (сам или администратор)',
  })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'Пользователь обновлен',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async update(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const isSelf = req.user.id === id;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('Вы можете изменять только свой профиль');
    }
    if (updateDto.role !== undefined && !isAdmin) {
      throw new ForbiddenException(
        'Изменение роли доступно только администратору',
      );
    }

    const user = await this.usersService.update(id, updateDto);
    return new UserResponseDto(user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Удаление пользователя (сам или администратор, soft delete)',
  })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Пользователь удален',
  })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async remove(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    const isSelf = req.user.id === id;
    const isAdmin = req.user.role === UserRole.ADMIN;
    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('Вы можете удалить только свой аккаунт');
    }
    await this.usersService.remove(id);
  }

  private assertSelfOrStaff(req: AuthedRequest, id: string): void {
    const isSelf = req.user.id === id;
    const isStaff = STAFF_ROLES.includes(req.user.role);
    if (!isSelf && !isStaff) {
      throw new ForbiddenException('Недостаточно прав для просмотра профиля');
    }
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
      memory: await redisClient.info('memory').then((info) => {
        const match = info.match(/used_memory_human:(\d+\.?\d*\s*\w+)/);
        return match ? match[1] : 'unknown';
      }),
    };
    return stats;
  }
}
