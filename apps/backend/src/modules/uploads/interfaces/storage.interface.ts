export interface StorageOptions {
  entity: string; // recipes, avatars, general
  userId: string; // ID пользователя или 'anonymous'
  fileName?: string; // опциональное имя файла
}

export interface UploadedFileInfo {
  path: string; // относительный путь /uploads/recipes/123/file.jpg
  url: string; // полный URL для доступа
  size: number;
  mimeType: string;
  originalName: string;
}

export interface IStorageService {
  saveFile(
    file: Express.Multer.File,
    options: StorageOptions,
  ): Promise<UploadedFileInfo>;

  deleteFile(filePath: string): Promise<void>;

  getFileUrl(filePath: string): string;
}
