// main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express'; // 👈 ДОБАВИТЬ
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import redisClient from './config/redis';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // 👈 ИЗМЕНИТЬ (добавить <NestExpressApplication>)

  // За обратным прокси (nginx) — доверяем первому hop'у, чтобы rate-limit
  // видел реальный IP клиента из X-Forwarded-For
  app.set('trust proxy', 1);

  // Заголовки безопасности. CSP выключаем — API отдаёт JSON, а дефолтный CSP
  // ломает Swagger UI на /api/docs
  app.use(helmet({ contentSecurityPolicy: false }));

  // CORS: список доменов из CORS_ORIGIN (через запятую). Запросы без Origin
  // (SSR, curl, Swagger, мобильные) пропускаем
  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // origin отсутствует у не-браузерных запросов (SSR, curl, Swagger) — пропускаем.
      // Неразрешённый Origin: не бросаем 500, просто не отдаём CORS-заголовки —
      // браузер сам заблокирует ответ
      callback(null, !origin || corsOrigins.includes(origin));
    },
    credentials: true,
  });

  // 👇 ДОБАВИТЬ СТАТИЧЕСКУЮ РАЗДАЧУ ФАЙЛОВ 👇
  // Раздача загруженных файлов (аватары, изображения и т.д.)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Cookies
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  app.use(cookieParser());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Serialization
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Единый формат ошибок + логирование 5xx
  app.useGlobalFilters(new AllExceptionsFilter());

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // Дожидаемся подключения Redis
  await redisClient.connect();

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Ayeda API')
    .setDescription(
      'Документация API для сервиса планирования питания и покупок',
    )
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
