// Образец e2e. Положить в apps/backend/test/widgets.e2e-spec.ts,
// поднять приложение как в test/jest-e2e.json.
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Widgets (e2e)', () => {
  let app: INestApplication;
  let token: string; // получить через POST /auth/register в beforeAll

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    const reg = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: `w${Date.now()}@e.com`, password: 'Passw0rd1', username: `w${Date.now()}` });
    token = reg.body.accessToken;
  });

  afterAll(async () => app.close());

  it('POST /widgets требует токен', () =>
    request(app.getHttpServer()).post('/api/v1/widgets').send({ title: 'x' }).expect(401));

  it('POST /widgets отклоняет лишние поля', () =>
    request(app.getHttpServer())
      .post('/api/v1/widgets')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Валидный тайтл', ownerId: 'hack', status: 'published' })
      .expect(400));

  it('CRUD своего виджета', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/widgets')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Мой виджет' })
      .expect(201);

    expect(created.body.status).toBe('draft'); // сервер, не клиент
    const id = created.body.id;

    await request(app.getHttpServer())
      .patch(`/api/v1/widgets/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Переименован' })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/widgets/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });
});
