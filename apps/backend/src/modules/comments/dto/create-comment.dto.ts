import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 'Отличный рецепт, спасибо!',
    description: 'Текст комментария',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString({ message: 'Текст комментария должен быть строкой' })
  @MinLength(1, { message: 'Комментарий не может быть пустым' })
  @MaxLength(1000, {
    message: 'Комментарий не может быть длиннее 1000 символов',
  })
  text: string;
}
