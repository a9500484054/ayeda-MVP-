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
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginatedResponseDto, PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  // @Get()
  // @ApiOperation({ summary: 'Получение списка всех пользователей' })
  // @ApiOkResponse({
  //   description: 'Список пользователей',
  //   type: [UserResponseDto],
  // })
  // async findAll(): Promise<UserResponseDto[]> {
  //   const users = await this.usersService.findAll();
  //   return users.map((user) => new UserResponseDto(user));
  // }
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
    // Значения по умолчанию уже есть в DTO, но на всякий случай
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
  @UseGuards(JwtAuthGuard) // Защищаем эндпоинт JWT токеном
  @ApiBearerAuth() // Добавляем в Swagger документацию
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
  @ApiBody({ type: UpdateUserDto }) // Добавить эту строку!
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
}
