import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Query,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { UploadResponseDto } from './dto/upload-response.dto';
import { UploadQueryDto } from './dto/upload-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/entities/user.entity';
import { PaginatedResponseDto } from 'src/common/dto/pagination.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        entity: {
          type: 'string',
          enum: ['recipes', 'avatars', 'general'],
          default: 'general',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Загрузить файл (авторизация)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UploadResponseDto })
  async uploadFile(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
    @Query('entity') entity: string = 'general',
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    const upload = await this.uploadsService.uploadFile(
      file,
      req.user.id,
      entity,
    );
    return this.uploadsService.toResponseDto(upload);
  }

  @Post('public')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Загрузить файл публично (без авторизации)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UploadResponseDto })
  async uploadPublicFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    const upload = await this.uploadsService.uploadFile(
      file,
      undefined,
      'public',
    );
    return this.uploadsService.toResponseDto(upload);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все файлы (пагинация)' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<UploadResponseDto>,
  })
  async findAll(
    @Query() query: UploadQueryDto,
  ): Promise<PaginatedResponseDto<UploadResponseDto>> {
    const result = await this.uploadsService.findAll(query);

    const data = result.data.map(upload =>
      this.uploadsService.toResponseDto(upload)
    );

    return new PaginatedResponseDto(
      data,
      result.total,
      result.page,
      result.limit,
    );
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Получить файлы пользователя' })
  @ApiParam({ name: 'userId', description: 'UUID пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<UploadResponseDto>,
  })
  async getUserUploads(
    @Param('userId') userId: string,
    @Query() query: UploadQueryDto,
  ): Promise<PaginatedResponseDto<UploadResponseDto>> {
    const result = await this.uploadsService.getUserUploads(userId, query);

    const data = result.data.map(upload =>
      this.uploadsService.toResponseDto(upload)
    );

    return new PaginatedResponseDto(
      data,
      result.total,
      result.page,
      result.limit,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить информацию о файле' })
  @ApiParam({ name: 'id', description: 'UUID файла' })
  @ApiResponse({ status: HttpStatus.OK, type: UploadResponseDto })
  async findOne(@Param('id') id: string): Promise<UploadResponseDto> {
    const upload = await this.uploadsService.findOne(id);
    return this.uploadsService.toResponseDto(upload);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить свой файл' })
  @ApiParam({ name: 'id', description: 'UUID файла' })
  async remove(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.uploadsService.remove(id, req.user.id, req.user.role);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить любой файл (только admin)' })
  @ApiParam({ name: 'id', description: 'UUID файла' })
  async adminRemove(@Param('id') id: string): Promise<void> {
    await this.uploadsService.remove(id, undefined, UserRole.ADMIN);
  }
}
