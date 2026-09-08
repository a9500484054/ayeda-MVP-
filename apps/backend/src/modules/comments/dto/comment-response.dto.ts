import { ApiProperty } from '@nestjs/swagger';
import { PublicAuthorDto } from '../../users/dto/public-author.dto';
import { Comment } from '../entities/comment.entity';

export class CommentResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Отличный рецепт, спасибо!' })
  text: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  recipeId: string;

  @ApiProperty({ type: () => PublicAuthorDto, nullable: true })
  author: PublicAuthorDto | null;

  @ApiProperty({ example: false })
  isHidden: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: null, nullable: true })
  deletedAt: Date | null;

  static from(comment: Comment): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = comment.id;
    dto.text = comment.text;
    dto.recipeId = comment.recipeId;
    dto.author = PublicAuthorDto.fromUser(comment.author);
    dto.isHidden = comment.isHidden;
    dto.createdAt = comment.createdAt;
    dto.updatedAt = comment.updatedAt;
    dto.deletedAt = comment.deletedAt;
    return dto;
  }
}
