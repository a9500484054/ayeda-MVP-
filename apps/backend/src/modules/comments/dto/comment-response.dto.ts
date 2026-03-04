import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class CommentResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Отличный рецепт, спасибо!' })
  text: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  recipeId: string;

  @ApiProperty({ type: () => UserResponseDto, nullable: true })
  author: UserResponseDto | null;

  @ApiProperty({ example: false })
  isHidden: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: null, nullable: true })
  deletedAt: Date | null;
}
