import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { closeTestApp, createTestApp, registerUser } from './utils';

describe('Users authz (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await closeTestApp(app);
  });

  it('GET /users без токена → 401', () =>
    request(app.getHttpServer()).get('/api/v1/users').expect(401));

  it('GET /users обычным пользователем → 403', async () => {
    const { accessToken } = await registerUser(app);
    await request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('PATCH своего профиля с role:admin → 403 (эскалация закрыта)', async () => {
    const { accessToken, userId } = await registerUser(app);
    await request(app.getHttpServer())
      .patch(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ role: 'admin' })
      .expect(403);
  });

  it('PATCH чужого профиля → 403', async () => {
    const a = await registerUser(app);
    const b = await registerUser(app);
    await request(app.getHttpServer())
      .patch(`/api/v1/users/${b.userId}`)
      .set('Authorization', `Bearer ${a.accessToken}`)
      .send({ firstName: 'Hacked' })
      .expect(403);
  });

  it('PATCH своего профиля (безопасные поля) → 200', async () => {
    const { accessToken, userId } = await registerUser(app);
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ firstName: 'E2E' })
      .expect(200);

    expect(res.body.firstName).toBe('E2E');
    expect(res.body).not.toHaveProperty('password');
  });

  it('GET /users/me → текущий пользователь', async () => {
    const { accessToken, userId } = await registerUser(app);
    const res = await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.id).toBe(userId);
    expect(res.body).not.toHaveProperty('password');
  });
});
