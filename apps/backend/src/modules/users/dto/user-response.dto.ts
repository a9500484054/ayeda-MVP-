import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Expose()
export class UserResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Уникальный идентификатор пользователя',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  email: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Уникальное имя пользователя',
  })
  username: string;

  @ApiProperty({
    example: 'John',
    description: 'Имя',
    required: false,
    nullable: true,
  })
  firstName: string | null;

  @ApiProperty({
    example: 'Doe',
    description: 'Фамилия',
    required: false,
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    example: 'I love cooking and sharing recipes',
    description: 'О себе',
    required: false,
    nullable: true,
  })
  bio: string | null;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL аватара',
    required: false,
    nullable: true,
  })
  avatar: string | null;

  @ApiProperty({
    example: false,
    description: 'Подтвержден ли email',
  })
  isEmailVerified: boolean;

  @ApiProperty({
    enum: ['user', 'moderator', 'admin'],
    example: 'user',
    description: 'Роль пользователя',
  })
  role: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Дата регистрации',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Дата последнего обновления',
  })
  updatedAt: Date;

  @ApiProperty({
    example: null,
    description: 'Дата последнего входа',
    required: false,
    nullable: true,
  })
  lastLoginAt: Date | null;

  @Exclude()
  password: string;

  @Exclude()
  deletedAt: Date;

  @Exclude()
  settings: Record<string, any>;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
