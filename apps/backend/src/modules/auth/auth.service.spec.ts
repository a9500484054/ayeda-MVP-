import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { IsNull } from 'typeorm';
import { AuthService } from './auth.service';
import { User, UserRole } from '../users/entities/user.entity';

jest.mock('src/utils/redis.utils', () => ({
  setUserSession: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('argon2', () => ({
  verify: jest.fn(),
  hash: jest.fn(),
}));

function buildUser(overrides: Partial<Record<string, unknown>> = {}): User {
  return {
    id: 'user-1',
    email: 'user@example.com',
    username: 'user',
    password: 'hashed-password',
    role: UserRole.USER,
    isEmailVerified: false,
    lastLoginAt: null,
    ...overrides,
  } as unknown as User;
}

describe('AuthService', () => {
  let usersService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
  };
  let jwtService: { sign: jest.Mock; verify: jest.Mock };
  let configService: { get: jest.Mock };
  let refreshTokenRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let emailService: {
    sendVerificationEmail: jest.Mock;
    sendPasswordResetEmail: jest.Mock;
  };
  let service: AuthService;

  const secrets: Record<string, string> = {
    JWT_ACCESS_SECRET: 'access-secret',
    JWT_REFRESH_SECRET: 'refresh-secret',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt'),
      verify: jest.fn(),
    };
    configService = {
      get: jest.fn(
        (key: string, fallback?: string) => secrets[key] ?? fallback,
      ),
    };
    refreshTokenRepository = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
      create: jest.fn().mockImplementation((entity) => entity),
      update: jest.fn(),
      delete: jest.fn(),
    };
    emailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(true),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    };

    service = new AuthService(
      usersService as never,
      jwtService as never,
      configService as never,
      refreshTokenRepository as never,
      emailService as never,
    );
  });

  describe('register', () => {
    it('бросает ConflictException, если email уже занят', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.register({
          email: 'user@example.com',
          password: 'Password123',
          username: 'user',
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(usersService.create).not.toHaveBeenCalled();
    });

    it('создаёт пользователя, отправляет verification-письмо и выдаёт токены', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const created = buildUser();
      usersService.create.mockResolvedValue(created);
      usersService.findOne.mockResolvedValue(created);

      const result = await service.register({
        email: 'user@example.com',
        password: 'Password123',
        username: 'user',
      });

      expect(usersService.create).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password123',
        username: 'user',
      });
      expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(result.accessToken).toBe('signed-jwt');
      expect(result.refreshToken).toBe('signed-jwt');
      expect(result.user.email).toBe('user@example.com');
      expect(refreshTokenRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('бросает UnauthorizedException, если пользователь не найден', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('бросает UnauthorizedException при неверном пароле', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'user@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('при верном пароле обновляет lastLoginAt и возвращает токены', async () => {
      const user = buildUser();
      usersService.findByEmail.mockResolvedValue(user);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      usersService.update.mockResolvedValue(user);

      const result = await service.login({
        email: 'user@example.com',
        password: 'correct',
      });

      expect(usersService.update).toHaveBeenCalledWith(
        user.id,
        expect.objectContaining({ lastLoginAt: expect.any(Date) }),
      );
      expect(result.accessToken).toBe('signed-jwt');
      expect(result.user.id).toBe(user.id);
    });
  });

  describe('refresh', () => {
    const rawRefreshToken = 'raw-refresh-token';

    it('бросает UnauthorizedException, если подпись/срок JWT не проходят', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refresh(rawRefreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(refreshTokenRepository.findOne).not.toHaveBeenCalled();
    });

    it('бросает UnauthorizedException, если запись токена не найдена/отозвана/просрочена', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1' });
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.refresh(rawRefreshToken)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('при валидном токене отзывает старый и выдаёт новую пару (ротация)', async () => {
      const user = buildUser();
      jwtService.verify.mockReturnValue({ sub: user.id });
      const tokenRecord = {
        id: 'rt-1',
        userId: user.id,
        tokenHash: 'hash',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000_000),
        user,
      };
      refreshTokenRepository.findOne.mockResolvedValue(tokenRecord);

      const result = await service.refresh(rawRefreshToken);

      expect(tokenRecord.revokedAt).toBeInstanceOf(Date);
      expect(refreshTokenRepository.save).toHaveBeenCalledWith(tokenRecord);
      expect(result.accessToken).toBe('signed-jwt');
      // Новая пара сохраняется отдельной записью — save должен быть вызван и для отзыва, и для новой записи
      expect(refreshTokenRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('logout / logoutAll', () => {
    it('logout отзывает только переданный refresh-токен пользователя', async () => {
      await service.logout('user-1', 'raw-token');

      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          tokenHash: expect.any(String),
        }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });

    it('logoutAll отзывает все активные refresh-токены пользователя', async () => {
      await service.logoutAll('user-1');

      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1' }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });

  describe('changePassword', () => {
    it('бросает UnauthorizedException при неверном старом пароле', async () => {
      usersService.findOne.mockResolvedValue(buildUser());
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword('user-1', {
          oldPassword: 'wrong',
          newPassword: 'NewPassword123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('при верном старом пароле обновляет пароль и отзывает остальные refresh-токены', async () => {
      usersService.findOne.mockResolvedValue(buildUser());
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (argon2.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      const result = await service.changePassword(
        'user-1',
        { oldPassword: 'correct', newPassword: 'NewPassword123' },
        'current-refresh-token',
      );

      expect(usersService.update).toHaveBeenCalledWith('user-1', {
        password: 'new-hashed-password',
      });
      // "все, кроме текущего" — использован Not(hash(currentRefreshToken))
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1' }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
      expect(result).toEqual({ message: 'Пароль успешно изменен' });
    });

    it('без currentRefreshToken отзывает все refresh-токены (logoutAll)', async () => {
      usersService.findOne.mockResolvedValue(buildUser());
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (argon2.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      await service.changePassword('user-1', {
        oldPassword: 'correct',
        newPassword: 'NewPassword123',
      });

      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: 'user-1', revokedAt: IsNull() },
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });

  describe('verifyEmail', () => {
    it('бросает UnauthorizedException для токена другого типа', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-1',
        type: 'password-reset',
      });

      await expect(service.verifyEmail('token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('подтверждает email при валидном токене', async () => {
      const user = buildUser({ isEmailVerified: false });
      jwtService.verify.mockReturnValue({
        sub: user.id,
        type: 'email-verification',
      });
      usersService.findOne.mockResolvedValue(user);
      usersService.update.mockResolvedValue({ ...user, isEmailVerified: true });

      const result = await service.verifyEmail('token');

      expect(usersService.update).toHaveBeenCalledWith(user.id, {
        isEmailVerified: true,
      });
      expect(result).toEqual({ message: 'Email успешно подтвержден' });
    });

    it('если email уже подтверждён — не трогает БД повторно', async () => {
      const user = buildUser({ isEmailVerified: true });
      jwtService.verify.mockReturnValue({
        sub: user.id,
        type: 'email-verification',
      });
      usersService.findOne.mockResolvedValue(user);

      const result = await service.verifyEmail('token');

      expect(usersService.update).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Email уже подтвержден' });
    });
  });

  describe('forgotPassword', () => {
    it('не раскрывает существование пользователя, если email не найден', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'nobody@example.com',
      });

      expect(result).toEqual({ message: 'Инструкции отправлены на email' });
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('отправляет письмо сброса пароля, если пользователь найден', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      const result = await service.forgotPassword({
        email: 'user@example.com',
      });

      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ message: 'Инструкции отправлены на email' });
    });
  });

  describe('resetPassword', () => {
    it('бросает UnauthorizedException для невалидного/просроченного токена', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('expired');
      });

      await expect(
        service.resetPassword({ token: 'bad', newPassword: 'NewPassword123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('меняет пароль и отзывает все refresh-токены при валидном токене', async () => {
      const user = buildUser();
      jwtService.verify.mockReturnValue({
        sub: user.id,
        type: 'password-reset',
      });
      usersService.findOne.mockResolvedValue(user);
      (argon2.hash as jest.Mock).mockResolvedValue('new-hashed-password');

      const result = await service.resetPassword({
        token: 'good',
        newPassword: 'NewPassword123',
      });

      expect(usersService.update).toHaveBeenCalledWith(user.id, {
        password: 'new-hashed-password',
      });
      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: user.id, revokedAt: IsNull() },
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
      expect(result).toEqual({ message: 'Пароль успешно изменен' });
    });
  });
});
