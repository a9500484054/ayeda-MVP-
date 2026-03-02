import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Пароль (минимум 6 символов, буквы и цифры)',
    minLength: 6,
    maxLength: 32,
  })
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @MaxLength(32, { message: 'Пароль должен быть не более 32 символов' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, {
    message: 'Пароль должен содержать хотя бы одну букву и одну цифру',
  })
  password: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Имя пользователя',
    minLength: 3,
    maxLength: 50,
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
}
