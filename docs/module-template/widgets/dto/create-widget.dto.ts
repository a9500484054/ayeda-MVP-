import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Только то, что клиент реально задаёт при создании.
 * ownerId, status, id, даты, счётчики сюда НЕ попадают:
 * ownerId ставит сервер из req.user, status меняется отдельной ручкой.
 */
export class CreateWidgetDto {
  @ApiProperty({ example: 'Мой виджет' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({ required: false, example: 'Описание' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
