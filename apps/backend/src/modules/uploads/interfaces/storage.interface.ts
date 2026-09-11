export interface StorageOptions {
  entity: string; // recipes, avatars, general
  userId: string; // ID пользователя или 'anonymous'
  fileName?: string; // опциональное имя файла
  // Расширение сохраняемого файла, выведенное из провалидированного mimetype
  // (а не из клиентского file.originalname — иначе можно прислать image/png
  // с именем evil.html и получить stored XSS при статической раздаче)
  extension: string;
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
