import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { closeTestApp, createTestApp, freshIp, registerUser } from './utils';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await closeTestApp(app);
  });

  it('register возвращает токены и user без секретов', async () => {
    const uniq = `${Date.now()}a`;
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .set('X-Forwarded-For', freshIp())
      .send({
        email: `a_${uniq}@e.com`,
        password: 'Passw0rd1',
        username: `a${uniq}`,
      })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user).not.toHaveProperty('settings');
    expect(res.body.user).not.toHaveProperty('deletedAt');
  });

  it('login не отдаёт хэш пароля', async () => {
    const { email } = await registerUser(app);
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .set('X-Forwarded-For', freshIp())
      .send({ email, password: 'Passw0rd1' })
      .expect(200);

    expect(res.body.user).not.toHaveProperty('password');
    expect(JSON.stringify(res.body)).not.toMatch(/\$argon2|\$2[aby]\$/);
  });

  it('refresh ротирует токен: старый становится невалидным', async () => {
    const { refreshToken } = await registerUser(app);

    const r1 = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(r1.body.refreshToken).toBeDefined();
    expect(r1.body.refreshToken).not.toEqual(refreshToken);

    // старый токен после ротации отозван
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);

    // новый — валиден
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: r1.body.refreshToken })
      .expect(200);
  });

  it('logout отзывает refresh-токен', async () => {
    const { accessToken, refreshToken } = await registerUser(app);

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(401);
  });

  it('мусорный refresh-токен → 401', () =>
    request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'not-a-jwt' })
      .expect(401));

  it('rate-limit на register: серия запросов упирается в 429', async () => {
    const ip = `198.51.100.${Math.floor(Math.random() * 254) + 1}`;
    let got429 = false;
    for (let i = 0; i < 8; i++) {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .set('X-Forwarded-For', ip)
        .send({});
      if (res.status === 429) {
        got429 = true;
        break;
      }
    }
    expect(got429).toBe(true);
  });
});
