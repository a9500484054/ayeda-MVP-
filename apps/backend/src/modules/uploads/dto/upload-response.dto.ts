import { ApiProperty } from '@nestjs/swagger';
import { Upload } from '../entities/upload.entity';

export class UploadResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    nullable: true,
  })
  userId: string | null;

  @ApiProperty({ example: '/uploads/recipes/123/image.jpg' })
  path: string;

  @ApiProperty({ example: 'recipe.jpg' })
  originalName: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;

  @ApiProperty({ example: 1024000 })
  size: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    example: 'http://localhost:4000/uploads/recipes/123/image.jpg',
  })
  url: string;

  /** url вычисляется хранилищем и передаётся сюда сервисом. */
  static from(upload: Upload, url: string): UploadResponseDto {
    const dto = new UploadResponseDto();
    dto.id = upload.id;
    dto.userId = upload.userId;
    dto.path = upload.path;
    dto.originalName = upload.originalName;
    dto.mimeType = upload.mimeType;
    dto.size = upload.size;
    dto.createdAt = upload.createdAt;
    dto.url = url;
    return dto;
  }
}
