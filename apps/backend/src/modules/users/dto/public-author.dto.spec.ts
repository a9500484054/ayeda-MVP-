import { PublicAuthorDto } from './public-author.dto';
import { User } from '../entities/user.entity';

describe('PublicAuthorDto', () => {
  const user = {
    id: 'u1',
    username: 'john',
    avatar: '/a.png',
    email: 'john@secret.com',
    password: '$argon2id$hash',
    role: 'admin',
    settings: { theme: 'dark' },
  } as unknown as User;

  it('fromUser отдаёт только id/username/avatar', () => {
    const dto = PublicAuthorDto.fromUser(user);
    expect(dto).toEqual({ id: 'u1', username: 'john', avatar: '/a.png' });
  });

  it('не пропускает секреты', () => {
    const dto = PublicAuthorDto.fromUser(user)!;
    expect(dto).not.toHaveProperty('email');
    expect(dto).not.toHaveProperty('password');
    expect(dto).not.toHaveProperty('role');
    expect(dto).not.toHaveProperty('settings');
  });

  it('null → null', () => {
    expect(PublicAuthorDto.fromUser(null)).toBeNull();
    expect(PublicAuthorDto.fromUser(undefined)).toBeNull();
  });

  it('avatar по умолчанию null', () => {
    const dto = PublicAuthorDto.fromUser({ id: 'u2', username: 'jane' } as User)!;
    expect(dto.avatar).toBeNull();
  });
});
