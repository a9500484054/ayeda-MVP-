import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, Not, MoreThan } from 'typeorm';
import { createHash, randomUUID } from 'crypto';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmailService } from '../email/email.service';
import { setUserSession } from 'src/utils/redis.utils';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private emailService: EmailService,
  ) {}

  // ========== РЕГИСТРАЦИЯ ==========
  async register(registerDto: RegisterDto) {
    // Проверяем, не существует ли пользователь
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Создаем пользователя через UsersService
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      username: registerDto.username,
    });

    // Отправляем письмо для подтверждения email
    await this.sendVerificationEmail(user.id);

    // Генерируем токены
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: new UserResponseDto(user),
    };
  }

  // ========== ВХОД ==========
  async login(loginDto: LoginDto) {
    // Ищем пользователя по email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Проверяем пароль
    const isPasswordValid = await argon2.verify(
      user.password,
      loginDto.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Обновляем lastLoginAt
    await this.usersService.update(user.id, { lastLoginAt: new Date() });

    // Генерируем токены
    const tokens = await this.generateTokens(user);

    // Сохраняем сессию в Redis
    await setUserSession(user.id, {
      userId: user.id,
      email: user.email,
      role: user.role,
      lastLoginAt: new Date(),
    }, 86400); // 24 часа

    return {
      ...tokens,
      user: new UserResponseDto(user),
    };
  }

  // ========== ОБНОВЛЕНИЕ ТОКЕНОВ ==========
  async refresh(refreshToken: string) {
    // Сначала проверяем подпись и срок самого refresh-JWT
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify<{ sub: string }>(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Недействительный refresh токен');
    }

    // Один индексированный поиск по детерминированному хэшу
    const tokenHash = this.hashToken(refreshToken);
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: {
        userId: payload.sub,
        tokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Недействительный refresh токен');
    }

    // Ротация: отзываем старый токен и выдаём новую пару
    tokenRecord.revokedAt = new Date();
    await this.refreshTokenRepository.save(tokenRecord);

    return this.generateTokens(tokenRecord.user);
  }

  // ========== ВЫХОД ==========
  async logout(userId: string, refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.refreshTokenRepository.update(
      { userId, tokenHash, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    return { success: true };
  }

  // ========== ВЫХОД СО ВСЕХ УСТРОЙСТВ ==========
  async logoutAll(userId: string) {
    // Отзываем все refresh токены пользователя
    await this.refreshTokenRepository.update(
      {
        userId,
        revokedAt: IsNull(),
      },
      { revokedAt: new Date() },
    );

    return { success: true };
  }

  // ========== ПОДТВЕРЖДЕНИЕ EMAIL ==========
  async sendVerificationEmail(userId: string) {
    const user = await this.usersService.findOne(userId);

    // Если email уже подтвержден
    if (user.isEmailVerified) {
      return { message: 'Email уже подтвержден' };
    }

    // Генерируем токен для подтверждения email (живет 24 часа)
    const verificationToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'email-verification',
      },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '24h',
      },
    );

    // Отправляем реальное письмо
    await this.emailService.sendVerificationEmail({
      email: user.email,
      token: verificationToken,
      username: user.username,
    });

    return { message: 'Письмо с подтверждением отправлено на email' };
  }

  async verifyEmail(token: string) {
    try {
      // Проверяем токен
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      // Проверяем тип токена
      if (payload.type !== 'email-verification') {
        throw new UnauthorizedException('Недействительный токен');
      }

      // Находим пользователя
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      // Если уже подтвержден
      if (user.isEmailVerified) {
        return { message: 'Email уже подтвержден' };
      }

      // Подтверждаем email
      await this.usersService.update(user.id, { isEmailVerified: true });

      return { message: 'Email успешно подтвержден' };
    } catch (error) {
      throw new UnauthorizedException('Недействительный или истекший токен');
    }
  }

  // ========== ЗАБЫЛ ПАРОЛЬ ==========
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Безопасность: не говорим, что пользователь не найден
      return { message: 'Инструкции отправлены на email' };
    }

    // Генерируем токен для сброса пароля (живет 1 час)
    const resetToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'password-reset',
      },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '1h',
      },
    );

    // Отправляем реальное письмо
    await this.emailService.sendPasswordResetEmail({
      email: user.email,
      token: resetToken,
    });

    return { message: 'Инструкции отправлены на email' };
  }

  // ========== СБРОС ПАРОЛЯ ==========
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      // Проверяем токен
      const payload = this.jwtService.verify(resetPasswordDto.token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      // Проверяем тип токена
      if (payload.type !== 'password-reset') {
        throw new UnauthorizedException('Недействительный токен');
      }

      // Находим пользователя
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Пользователь не найден');
      }

      // Хешируем новый пароль
      const hashedPassword = await argon2.hash(resetPasswordDto.newPassword);

      // Обновляем пароль
      await this.usersService.update(user.id, { password: hashedPassword });

      // Отзываем все refresh токены (для безопасности)
      await this.logoutAll(user.id);

      return { message: 'Пароль успешно изменен' };
    } catch (error) {
      throw new UnauthorizedException('Недействительный или истекший токен');
    }
  }

  // ========== СМЕНА ПАРОЛЯ (авторизованный пользователь) ==========
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    currentRefreshToken?: string,
  ) {
    const user = await this.usersService.findOne(userId);

    // Проверяем старый пароль
    const isPasswordValid = await argon2.verify(
      user.password,
      changePasswordDto.oldPassword,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный старый пароль');
    }

    // Хешируем новый пароль
    const hashedPassword = await argon2.hash(changePasswordDto.newPassword);

    // Обновляем пароль
    await this.usersService.update(userId, { password: hashedPassword });

    // Отзываем все refresh токены, кроме текущего
    if (currentRefreshToken) {
      await this.refreshTokenRepository.update(
        {
          userId,
          revokedAt: IsNull(),
          tokenHash: Not(this.hashToken(currentRefreshToken)),
        },
        { revokedAt: new Date() }
      );
    } else {
      // Если нет текущего токена - отзываем все
      await this.logoutAll(userId);
    }

    return { message: 'Пароль успешно изменен' };
  }

  // ========== ГЕНЕРАЦИЯ ТОКЕНОВ ==========
  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    // jti делает каждый refresh-токен уникальным даже при выпуске в одну секунду —
    // иначе повторный refresh даёт байт-в-байт тот же JWT и ротация ломается
    const refreshToken = this.jwtService.sign(
      { ...payload, jti: randomUUID() },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );

    // Сохраняем refresh токен в БД
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  // ========== СОХРАНЕНИЕ REFRESH TOKEN ==========
  private async saveRefreshToken(userId: string, token: string) {
    const expiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = new Date();

    // Парсим строку типа '7d' в миллисекунды
    const expiresInMs = this.parseExpiresIn(expiresIn);
    expiresAt.setTime(expiresAt.getTime() + expiresInMs);

    const tokenHash = this.hashToken(token);

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);
  }

  // ========== ХЕШИРОВАНИЕ ТОКЕНОВ ==========
  // Детерминированный SHA-256: refresh-токен — высокоэнтропийный JWT, argon2
  // тут не нужен, а детерминизм позволяет искать запись одним индексным запросом
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  // ========== ПАРСИНГ ВРЕМЕНИ ==========
  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1), 10);

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }

  // ========== ОЧИСТКА ПРОСРОЧЕННЫХ ТОКЕНОВ ==========
  // Ежедневно в 03:00: удаляем протухшие и давно отозванные refresh-токены,
  // чтобы таблица не росла бесконечно
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanExpiredTokens() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepository.delete({ expiresAt: LessThan(now) });
    await this.refreshTokenRepository.delete({
      revokedAt: LessThan(thirtyDaysAgo),
    });
  }
}
