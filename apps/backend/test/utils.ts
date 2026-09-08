import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
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
