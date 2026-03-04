import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  IStorageService,
  StorageOptions,
  UploadedFileInfo,
} from '../interfaces/storage.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
  private readonly uploadRoot: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadRoot = path.join(process.cwd(), 'uploads');
    this.baseUrl = this.configService.get('BASE_URL', 'http://localhost:4000');
  }

  async saveFile(
    file: Express.Multer.File,
    options: StorageOptions,
  ): Promise<UploadedFileInfo> {
    const { entity, userId } = options;

    // Генерируем уникальное имя файла
    const fileExt = path.extname(file.originalname);
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

    // Путь: /uploads/recipes/123/
    const relativeDir = path.join('uploads', entity, userId);
    const absoluteDir = path.join(this.uploadRoot, entity, userId);

    // Создаем папку, если нет
    await fs.mkdir(absoluteDir, { recursive: true });

    // Полный путь к файлу
    const absolutePath = path.join(absoluteDir, uniqueFileName);
    const relativePath = path.join(relativeDir, uniqueFileName).replace(/\\/g, '/');

    // Сохраняем файл
    await fs.writeFile(absolutePath, file.buffer);

    return {
      path: `/${relativePath}`,
      url: `${this.baseUrl}/${relativePath}`,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
    };
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const absolutePath = path.join(process.cwd(), filePath);
      await fs.access(absolutePath);
      await fs.unlink(absolutePath);
      console.log(`✅ Файл удален физически: ${absolutePath}`);

      // Пытаемся удалить пустую папку
      await this.removeEmptyDir(path.dirname(absolutePath));
    } catch (error) {
      console.error('❌ Ошибка при удалении файла:', error);
      throw new Error('Не удалось удалить файл');
    }
  }

  getFileUrl(filePath: string): string {
    return `${this.baseUrl}${filePath}`;
  }

  private async removeEmptyDir(dirPath: string): Promise<void> {
    try {
      const files = await fs.readdir(dirPath);
      if (files.length === 0) {
        await fs.rmdir(dirPath);
        console.log(`📁 Пустая папка удалена: ${dirPath}`);
      }
    } catch (error) {
      // Игнорируем ошибки при удалении папки
    }
  }
}
