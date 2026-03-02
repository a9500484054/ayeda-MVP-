import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'oldPassword123',
    description: 'Старый пароль',
  })
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  oldPassword: string;

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
