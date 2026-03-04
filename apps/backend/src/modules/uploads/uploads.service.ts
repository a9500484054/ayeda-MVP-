import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from './entities/upload.entity';
import { UploadResponseDto } from './dto/upload-response.dto';
import { UploadQueryDto } from './dto/upload-query.dto';
import { StorageService } from './services/storage.service';
import { PaginatedResponseDto } from 'src/common/dto/pagination.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private uploadsRepository: Repository<Upload>,
    private storageService: StorageService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    userId?: string,
    entity: string = 'general',
  ): Promise<Upload> {
    if (!file) {
      throw new BadRequestException('Файл не загружен');
    }

    // Валидация
    this.validateFile(file);

    // Сохраняем файл через абстрактное хранилище
    const fileInfo = await this.storageService.saveFile(file, {
      entity,
      userId: userId || 'anonymous',
    });

    // Сохраняем запись в БД
    const upload = this.uploadsRepository.create({
      userId,
      path: fileInfo.path,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });

    return this.uploadsRepository.save(upload);
  }

  private validateFile(file: Express.Multer.File) {
    // Размер 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(
        'Файл слишком большой. Максимальный размер 10MB',
      );
    }

    // Типы файлов
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Разрешены только изображения (JPEG, PNG, GIF, WEBP)',
      );
    }
  }

  async findAll(query: UploadQueryDto): Promise<PaginatedResponseDto<Upload>> {
    const { page = 1, limit = 10, userId, mimeType } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (userId) where.userId = userId;
    if (mimeType) where.mimeType = mimeType;

    const [uploads, total] = await this.uploadsRepository.findAndCount({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return new PaginatedResponseDto(
      uploads,
      total,
      Number(page),
      Number(limit),
    );
  }

  async findOne(id: string): Promise<Upload> {
    const upload = await this.uploadsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!upload) {
      throw new NotFoundException('Файл не найден');
    }

    return upload;
  }

  async remove(id: string, userId?: string, userRole?: string): Promise<void> {
    const upload = await this.findOne(id);

    // Проверка прав
    const isAdmin = userRole === UserRole.ADMIN;
    const isOwner = upload.userId && upload.userId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Вы не можете удалить этот файл');
    }

    // Удаляем физический файл через абстрактное хранилище
    await this.storageService.deleteFile(upload.path);

    // Удаляем запись из БД
    await this.uploadsRepository.remove(upload);
  }

  async getUserUploads(
    userId: string,
    query: UploadQueryDto,
  ): Promise<PaginatedResponseDto<Upload>> {
    return this.findAll({ ...query, userId });
  }

  toResponseDto(upload: Upload): UploadResponseDto {
    return {
      id: upload.id,
      userId: upload.userId,
      path: upload.path,
      originalName: upload.originalName,
      mimeType: upload.mimeType,
      size: upload.size,
      createdAt: upload.createdAt,
      url: this.storageService.getFileUrl(upload.path),
    };
  }
}
