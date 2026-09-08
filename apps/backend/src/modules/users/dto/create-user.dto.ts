import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
    required: true,
  })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль (минимум 6 символов, буквы и цифры)',
    minLength: 6,
    maxLength: 32,
    required: true,
  })
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(32, { message: 'Пароль должен быть не более 32 символов' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
    message: 'Пароль должен содержать хотя бы одну букву и одну цифру',
  })
  password: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Уникальное имя пользователя',
    minLength: 3,
    maxLength: 50,
    required: true,
  })
  @IsString()
  @MinLength(3, { message: 'Имя пользователя должно быть не менее 3 символов' })
  @MaxLength(50, {
    message: 'Имя пользователя должно быть не более 50 символов',
  })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message:
      'Имя пользователя может содержать только буквы, цифры и подчеркивания',
  })
  username: string;

  @ApiProperty({
    required: false,
    enum: UserRole,
    example: UserRole.USER,
    description: 'Роль (только для администратора через POST /users)',
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
