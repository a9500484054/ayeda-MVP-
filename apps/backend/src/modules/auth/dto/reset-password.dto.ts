import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIs...',
    description: 'Токен для сброса пароля',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'Новый пароль',
  })
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, {
    message: 'Пароль должен содержать хотя бы одну букву и одну цифру',
  })
  newPassword: string;
}
