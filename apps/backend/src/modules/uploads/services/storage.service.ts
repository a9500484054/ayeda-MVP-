import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from './local-storage.service';
import {
  IStorageService,
  StorageOptions,
  UploadedFileInfo,
} from '../interfaces/storage.interface';

@Injectable()
export class StorageService implements IStorageService {
  private storage: IStorageService;

  constructor(
    private configService: ConfigService,
    private localStorageService: LocalStorageService,
  ) {
    // Выбираем хранилище на основе конфига
    const storageType = this.configService.get('STORAGE_TYPE', 'local');

    switch (storageType) {
      case 's3':
        // this.storage = s3StorageService;
        throw new Error('S3 storage not implemented yet');
      case 'local':
      default:
        this.storage = localStorageService;
    }
  }

  async saveFile(
    file: Express.Multer.File,
    options: StorageOptions,
  ): Promise<UploadedFileInfo> {
    return this.storage.saveFile(file, options);
  }

  async deleteFile(filePath: string): Promise<void> {
    return this.storage.deleteFile(filePath);
  }

  getFileUrl(filePath: string): string {
    return this.storage.getFileUrl(filePath);
  }
}
