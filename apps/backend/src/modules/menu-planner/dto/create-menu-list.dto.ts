import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength, MinLength } from 'class-validator';

export class CreateMenuListDto {
  @ApiProperty({ example: 'Семейное меню', description: 'Название списка меню' })
  @IsString({ message: 'Название должно быть строкой' })
  @MinLength(1, { message: 'Название не может быть пустым' })
  @MaxLength(100, { message: 'Название не должно превышать 100 символов' })
  title: string;

  @ApiProperty({ required: false, example: 'Меню для всей семьи на неделю' })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  description?: string;

  @ApiProperty({ required: false, example: '🍕' })
  @IsOptional()
  @IsString({ message: 'Иконка должна быть строкой' })
  @MaxLength(50, { message: 'Иконка не должна превышать 50 символов' })
  icon?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean({ message: 'isActive должен быть булевым значением' })
  isActive?: boolean;
}
