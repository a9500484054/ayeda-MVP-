import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import redisClient from '../src/config/redis';

/**
 * Поднимает приложение с теми же глобальными настройками, что и main.ts:
 * ValidationPipe, ClassSerializerInterceptor, AllExceptionsFilter, URI-версионирование.
 */
export async function createTestApp(): Promise<INestApplication> {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();

  // как в main.ts — чтобы rate-limit различал клиентов по X-Forwarded-For
  (
    app.getHttpAdapter().getInstance() as {
      set: (k: string, v: unknown) => void;
    }
  ).set('trust proxy', true);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  await app.init();
  return app;
}

export async function closeTestApp(app: INestApplication): Promise<void> {
  await app.close();
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
}

let seq = 0;

/** Уникальный «IP» на каждый вызов — чтобы фикстуры не жгли общий rate-limit. */
export function freshIp(): string {
  seq += 1;
  return `10.${(seq >> 16) & 255}.${(seq >> 8) & 255}.${seq & 255}`;
}

/** Регистрирует нового пользователя, возвращает токены и id. */
export async function registerUser(app: INestApplication): Promise<{
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
}> {
  const uniq = `${Date.now()}${seq}`;
  const email = `e2e_${uniq}@example.com`;
  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .set('X-Forwarded-For', freshIp())
    .send({ email, password: 'Passw0rd1', username: `e2e${uniq}` })
    .expect(201);

  return {
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
    userId: res.body.user.id,
    email,
  };
}

/** Регистрирует пользователя и повышает до admin (через БД + сброс кэша). */
export async function registerAdmin(app: INestApplication): Promise<{
  accessToken: string;
  userId: string;
}> {
  const user = await registerUser(app);
  const ds = app.get(DataSource);
  await ds.query(`UPDATE "users" SET "role" = 'admin' WHERE "id" = $1`, [
    user.userId,
  ]);
  // кэш user:<id> живёт 5 минут — сбрасываем, чтобы RolesGuard увидел admin
  if (redisClient.isOpen) {
    await redisClient.del(`user:${user.userId}`);
    await redisClient.del(`user:email:${user.email}`);
  }
  return { accessToken: user.accessToken, userId: user.userId };
}

/**
 * Рекурсивно заменяет динамические значения (uuid, ISO-даты, slug/srcPath)
 * на плейсхолдеры — чтобы snapshot формы ответа был стабильным.
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

export function normalizeShape(value: unknown, key?: string): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => normalizeShape(v));
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = normalizeShape(v, k);
    }
    return out;
  }
  if (typeof value === 'string') {
    if (UUID_RE.test(value)) return '<uuid>';
    if (ISO_RE.test(value)) return '<date>';
    if (key === 'srcPath' || key === 'slug') return '<slug>';
    if (key === 'email') return '<email>';
    if (key === 'avatar' || key === 'photo' || key === 'featured_image') {
      return value ? '<path>' : value;
    }
    if (
      key === 'title' ||
      key === 'name' ||
      key === 'code' ||
      key === 'text' ||
      key === 'username' ||
      key === 'first_name' ||
      key === 'last_name'
    ) {
      return `<${key}>`;
    }
  }
  return value;
}
