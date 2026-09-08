import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

/**
 * Публичная проекция автора: только то, что можно показать любому.
 * Никаких email/role/настроек/дат.
 */
export class PublicAuthorDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: '/uploads/avatars/…',
  })
  avatar: string | null;

  constructor(user?: Partial<User> | null) {
    this.id = user?.id ?? '';
    this.username = user?.username ?? '';
    this.avatar = user?.avatar ?? null;
  }

  static fromUser(user?: Partial<User> | null): PublicAuthorDto | null {
    return user ? new PublicAuthorDto(user) : null;
  }
}
