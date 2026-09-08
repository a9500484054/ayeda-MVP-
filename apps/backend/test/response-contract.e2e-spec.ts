import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  closeTestApp,
  createTestApp,
  normalizeShape,
  registerAdmin,
  registerUser,
} from './utils';

/**
 * Snapshot формы ответов GET-эндпоинтов. Фиксирует текущий контракт 1:1
 * ПЕРЕД рефакторингом слоя ответов (R5). Динамические значения (uuid, даты,
 * slug, email, title/name/...) нормализуются в плейсхолдеры — снимок стабилен,
 * но любое изменение СТРУКТУРЫ ответа его ломает.
 */
const rnd = () =>
  Array.from({ length: 10 }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26)),
  ).join('');

describe('Response contract (e2e snapshots)', () => {
  let app: INestApplication;
  let authorToken: string;
  let recipeId: string;
  let recipeSrcPath: string;
  let articleSlug: string;

  beforeAll(async () => {
    app = await createTestApp();
    const admin = await registerAdmin(app);
    authorToken = (await registerUser(app)).accessToken;
    const H = (t: string) => ({ Authorization: `Bearer ${t}` });

    const tag = rnd();
    const unit = await request(app.getHttpServer())
      .post('/api/v1/units')
      .set(H(admin.accessToken))
      .send({ code: rnd(), name: `e2e unit ${tag}`, short: 'eu', type: 'mass' })
      .expect(201);

    const ingredient = await request(app.getHttpServer())
      .post('/api/v1/ingredients')
      .set(H(admin.accessToken))
      .send({
        code: rnd(),
        srcPath: `e2e-ingr-${tag}`,
        name: `e2e ingredient ${tag}`,
        unitId: unit.body.id,
      })
      .expect(201);

    const category = await request(app.getHttpServer())
      .post('/api/v1/categories')
      .set(H(admin.accessToken))
      .send({ code: rnd().slice(0, 15), name: `e2e category ${tag}` })
      .expect(201);

    recipeSrcPath = `e2e-${rnd()}`;
    const recipe = await request(app.getHttpServer())
      .post('/api/v1/recipes')
      .set(H(authorToken))
      .send({
        title: 'e2e contract recipe',
        description: 'desc',
        difficulty: 'medium',
        type: 'personal',
        cookingTime: 30,
        servings: 2,
        srcPath: recipeSrcPath,
        categoryIds: [category.body.id],
        ingredients: [
          { ingredientId: ingredient.body.id, amount: 100, notes: 'по вкусу' },
        ],
      })
      .expect(201);
    recipeId = recipe.body.id;

    await request(app.getHttpServer())
      .post(`/api/v1/recipes/${recipeId}/comments`)
      .set(H(authorToken))
      .send({ text: 'e2e comment text' })
      .expect(201);

    const article = await request(app.getHttpServer())
      .post('/api/v1/articles')
      .set(H(authorToken))
      .send({
        title: `e2e article ${rnd()}`,
        content: 'article body',
        excerpt: 'short',
        categories: ['советы'],
        type: 'article',
        status: 'published',
      })
      .expect(201);
    articleSlug = article.body.slug;
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('GET /recipes/:id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${authorToken}`)
      .expect(200);
    expect(normalizeShape(res.body)).toMatchSnapshot();
  });

  it('GET /recipes/by-path/:srcPath', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/recipes/by-path/${recipeSrcPath}`)
      .set('Authorization', `Bearer ${authorToken}`)
      .expect(200);
    expect(normalizeShape(res.body)).toMatchSnapshot();
  });

  it('GET /recipes (пагинация)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/recipes?limit=50')
      .expect(200);
    const { data } = res.body;
    // envelope: только набор ключей (значения зависят от состояния БД)
    expect(Object.keys(res.body).sort()).toMatchSnapshot('envelope-keys');
    const ours = data.find((r: { id: string }) => r.id === recipeId);
    expect(normalizeShape(ours)).toMatchSnapshot('item');
  });

  it('GET /recipes/:id/comments', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/recipes/${recipeId}/comments`)
      .expect(200);
    expect(normalizeShape(res.body)).toMatchSnapshot();
  });

  it('GET /articles/:slug', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/articles/${articleSlug}`)
      .expect(200);
    expect(normalizeShape(res.body)).toMatchSnapshot();
  });

  it('GET /articles (пагинация)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/articles?limit=50')
      .expect(200);
    const { items } = res.body;
    expect(Object.keys(res.body).sort()).toMatchSnapshot('envelope-keys');
    const ours = items.find((a: { slug: string }) => a.slug === articleSlug);
    expect(normalizeShape(ours)).toMatchSnapshot('item');
  });
});
