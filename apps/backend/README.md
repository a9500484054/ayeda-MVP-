# AyEda — backend

API сервиса планирования питания и покупок: рецепты, ингредиенты, комментарии,
лайки/избранное, планировщик меню, списки покупок, статьи, загрузки, админ-панель.

**Стек:** NestJS 11 · TypeORM 0.3 · PostgreSQL 15 · Redis 7 · JWT (access + rotating refresh).

Архитектура и конвенции — [`../../docs/architecture.md`](../../docs/architecture.md)
и [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md). Эталонный модуль —
[`../../docs/module-template/`](../../docs/module-template/).

## Запуск (Docker, рекомендуется)

Из корня монорепы:

```bash
docker compose up -d           # postgres + redis + backend (dev, watch) + pgadmin
```

- API: <http://localhost:3001/api/v1>
- Swagger: <http://localhost:3001/api/docs>
- Health: <http://localhost:3001/health>

Dev-контейнер монтирует исходники и запускает `nest start --watch` — правки
`.ts` подхватываются без пересборки. После изменения зависимостей — пересобрать
образ: `docker compose build backend`.

## Запуск локально (без Docker)

```bash
pnpm install                                   # из корня монорепы
cp apps/backend/.env.example apps/backend/.env  # заполнить DB_*, REDIS_URL, JWT_*
pnpm --filter backend migration:run
pnpm --filter backend start:dev
```

Нужны запущенные PostgreSQL и Redis (можно поднять только их:
`docker compose up -d postgres redis`).

## Команды

| Команда | Что делает |
|---|---|
| `pnpm --filter backend start:dev` | dev-сервер с hot-reload |
| `pnpm --filter backend build` | сборка в `dist/` |
| `pnpm --filter backend lint` | ESLint (проверка) · `lint:fix` — с автоправкой |
| `pnpm --filter backend type-check` | `tsc --noEmit` (код + тесты) |
| `pnpm --filter backend test` | unit-тесты |
| `pnpm --filter backend test:e2e` | e2e (нужны Postgres + Redis) |
| `pnpm --filter backend migration:run` | применить миграции |
| `pnpm --filter backend migration:revert` | откатить последнюю |

## Миграции

Пишутся вручную в `src/migrations/` (`<PascalCase><unix-ms>.ts`, обязателен
`down()`). `synchronize` всегда выключен. В проде `docker/entrypoint.sh`
прогоняет `node dist/migration-run.js` перед стартом.

## Переменные окружения

См. `.env.example`. Ключевые: `DB_*`, `REDIS_URL`, `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET`, `CORS_ORIGIN` (список доменов через запятую; в dev
дополнительно разрешён любой `localhost`), `SMTP_*`.

## CI

`.github/workflows/backend-ci.yml` на каждый push в `main` и PR:
`install → migration:run → lint → type-check → test → test:e2e → build`
(Postgres и Redis — как service-контейнеры).
