import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { closeTestApp, createTestApp, registerUser } from './utils';

describe('Recipes (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    token = (await registerUser(app)).accessToken;
  });
  afterAll(async () => {
    await closeTestApp(app);
  });

  const makeBody = (over: Record<string, unknown> = {}) => ({
    title: `e2e recipe ${Date.now()}`,
    difficulty: 'medium',
    type: 'personal',
    srcPath: `e2e-recipe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    categoryIds: [],
    ingredients: [],
    ...over,
  });

  it('обычный юзер не может создать сразу public (обход модерации закрыт)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send(makeBody({ status: 'public' }))
      .expect(201);

    expect(res.body.status).not.toBe('public');
    expect(['private', 'pending', 'draft']).toContain(res.body.status);
  });

  it('владелец может редактировать свой рецепт', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send(makeBody())
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/recipes/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'e2e updated' })
      .expect(200);
  });

  it('в списке author не содержит email/role', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/recipes')
      .set('Authorization', `Bearer ${token}`)
      .send(makeBody())
      .expect(201);

    const list = await request(app.getHttpServer())
      .get('/api/v1/recipes?limit=5')
      .expect(200);

    for (const r of list.body.data) {
      if (r.author) {
        expect(r.author).not.toHaveProperty('email');
        expect(r.author).not.toHaveProperty('role');
        expect(Object.keys(r.author).sort()).toEqual(['avatar', 'id', 'username']);
      }
    }
  });

  it('неизвестный id → 404 в едином формате', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/recipes/00000000-0000-0000-0000-000000000000')
      .expect(404);

    expect(res.body).toMatchObject({
      statusCode: 404,
      error: expect.any(String),
      message: expect.anything(),
      path: expect.stringContaining('/recipes/'),
      timestamp: expect.any(String),
    });
  });

  it('создание рецепта требует токен', () =>
    request(app.getHttpServer()).post('/api/v1/recipes').send(makeBody()).expect(401));
});
