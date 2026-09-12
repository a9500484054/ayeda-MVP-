# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Проект

АуЕда — SaaS-сервис для планирования питания: рецепты, планировщик меню, автогенерация списков покупок, community-обмен рецептами. pnpm-монорепа:

- `apps/backend` — NestJS 11 + TypeORM 0.3 (PostgreSQL 15) + Redis 7, JWT-аутентификация
- `apps/frontend` — Nuxt 4 (Vue 3) + Pinia + Tailwind (`@nuxt/ui`)
- `apps/storybook` — Storybook для `packages/ui-kit`
- `packages/shared` — общие TS-типы/константы (роли, статусы рецептов, единицы измерения)
- `packages/ui-kit` — общие Vue-компоненты (`Button` и т.д.)

Только pnpm workspaces — `npm install` / `yarn` не используются (`preinstall`-скрипт блокирует это через `only-allow`).

## Backend работает в Docker

Dev-backend крутится в контейнере `ayeda_backend` (`docker-compose.override.yml`): `apps/backend` смонтирован в `/repo/apps/backend`, запускается `pnpm run start:dev` (Nest watch-режим — правки `.ts`-файлов не требуют рестарта). Локальный `apps/backend/node_modules` может быть не установлен/устаревшим, поэтому проверки бэкенда лучше гонять внутри контейнера:

```bash
docker exec ayeda_backend sh -c "cd /repo/apps/backend && pnpm exec tsc --noEmit -p tsconfig.build.json"
docker exec ayeda_backend sh -c "cd /repo/apps/backend && pnpm run migration:run"
docker exec ayeda_postgres psql -U ayeda -d ayeda_dev -c "..."
docker exec ayeda_redis redis-cli -a <REDIS_PASSWORD из apps/backend/.env> --no-auth-warning ...
```

API доступен с хоста на `http://localhost:3001` (контейнер слушает 4000). Для пересборки прод-образа: `docker compose build backend && docker compose up -d --build backend`.

## Частые команды

Запускать из корня репозитория, если не указано иное; `pnpm --filter <app>` — команда для конкретного пакета workspace.

```bash
pnpm install                          # установка всех workspace-пакетов
pnpm lint                             # eslint по всему репозиторию

# backend (apps/backend)
pnpm --filter backend start:dev       # локальный (не-Docker) dev-сервер
pnpm --filter backend lint
pnpm --filter backend type-check      # tsc --noEmit по build- и spec-tsconfig
pnpm --filter backend test            # unit-тесты jest
pnpm --filter backend test -- <путь или -t "имя">   # один тестовый файл / тест по имени
pnpm --filter backend test:e2e        # e2e-тесты jest (нужны доступные Postgres + Redis)
pnpm --filter backend build
pnpm --filter backend migration:run
pnpm --filter backend migration:revert
npm_config_name=AddFoo1234 pnpm --filter backend migration:generate   # генерит черновик из diff сущностей — всё равно дорабатывать руками по правилам Contributing

# frontend (apps/frontend)
pnpm --filter frontend dev
pnpm --filter frontend lint
pnpm --filter frontend type-check     # nuxt typecheck
pnpm --filter frontend test           # vitest run
pnpm --filter frontend test:e2e       # playwright
pnpm --filter frontend build
pnpm --filter frontend generate:api   # перегенерировать типизированный клиент из swagger.json запущенного backend
```

CI (`.github/workflows/backend-ci.yml`, `frontend-ci.yml`) прогоняет для каждого приложения независимо, на свежих Postgres/Redis из service-контейнеров: migrate → lint → type-check → test (+ e2e для backend) → build. Перед тем как считать backend-задачу готовой, пройти ту же последовательность — см. «Перед PR» в `CONTRIBUTING.md`.

## Архитектура backend

Слои строгие: `HTTP → Controller → Service → Repository (TypeORM) → PostgreSQL`, Redis сервисы используют для кэша/rate-limit/дедупа.

- **Controller** — только транспорт: guard-ы, DTO из `@Body()/@Param()/@Query()`, вызов сервиса, возврат response-DTO. Никакой бизнес-логики, транзакций, обращений к репозиториям, никаких проверок «это моё?» (это дело сервиса).
- **Service** — вся бизнес-логика, проверка владения ресурсом (`ForbiddenException` при несовпадении), транзакции. Запись нескольких записей — через `dataSource.transaction(async (m) => …)`. Денормализованные счётчики меняются в той же транзакции, что и источник, ночной cron сверяет их как страховку.
- **DTO — граница модуля**: входные DTO (`@Body()`, `@Query()`) — только классы `class-validator`, никогда `Partial<Entity>`/`any`/голый интерфейс (это обходит глобальный `ValidationPipe`). Поля, неподконтрольные клиенту (`role`, `status`, `isEmailVerified`, счётчики, `id`, даты), в input DTO не выносятся либо разрешаются только под ролью и перепроверяются в сервисе. Выходные DTO — классы `*-response.dto.ts` на `class-transformer` (`@Expose`/`@Exclude`) — сырую entity наружу отдавать нельзя. Пагинируемые списки возвращают `PaginatedResponseDto<T>`; query-DTO списков наследуют `common/dto/pagination.dto.ts`.
- **Ошибки** — бросаем только `HttpException`/наследников; глобальный `AllExceptionsFilter` (в `main.ts`) единообразно форматирует любой ответ и логирует 5xx со стеком (стек в ответ клиенту не попадает). Вручную ошибки не форматируем.
- **Логи** — только `Logger` (`private readonly logger = new Logger(X.name)`); `console.*` запрещён вне bootstrap в `main.ts`.
- **Кэш** — `cacheGetOrSet` из `utils/redis.utils`; инвалидация точечными ключами или `clearCachePattern` (на основе SCAN) — `KEYS` не использовать никогда.

### Структура модуля

Каждая фича — папка `src/modules/<feature>/`: `<feature>.module.ts`, `.controller.ts`, `.service.ts`, `dto/` (`create-*.dto.ts`, `update-*.dto.ts` — обычно `PartialType(Create…)`, `*-response.dto.ts`, `*-query.dto.ts`), `entities/*.entity.ts`, опционально `enums/` и специфичные для модуля `guards/`. `docs/module-template/widgets/` — рабочий эталонный CRUD-модуль (плюс `docs/module-template/widgets.e2e-spec.example.ts` и `migration.example.ts`) — для новых модулей копировать его, а не писать с нуля; полное описание — в `docs/architecture.md` и `CONTRIBUTING.md`.

Граф зависимостей модулей (mermaid-исходник — в `docs/architecture.md`): `Auth → Users, Email`; `Recipes → Users, Ingredients, Categories, Units, Favorites`; `RecipeIngredients → Recipes, Ingredients, Units`; `Comments/Likes/Favorites → Recipes`; `MenuPlanner → Recipes`; `ShoppingLists → ShoppingCategories`.

### Аутентификация

Access-JWT (15 мин, `JWT_ACCESS_SECRET`) через `Authorization: Bearer`. Refresh-JWT (7 дней, `JWT_REFRESH_SECRET`, с `jti`) хранится на сервере в виде SHA-256-хэша и ротируется (старый токен отзывается) на каждый `/auth/refresh`. `JwtStrategy.validate` подгружает `User` из БД (кэш 5 мин) в `req.user`. Роли — `user`/`moderator`/`admin`, проверяются `RolesGuard` + `@Roles(...)` (`common/decorators`, `common/guards`); «это ресурс текущего пользователя» — всегда проверка на уровне сервиса, не guard-а. Защищённые роуты: `@UseGuards(JwtAuthGuard)` + `@ApiBearerAuth()`; публичные с опциональным юзером: `OptionalJwtAuthGuard`; чувствительные к брутфорсу: `@Throttle({ default: { limit, ttl } })` (дефолт глобально — 120/мин/IP через `ThrottlerGuard`).

### Миграции

Пишутся вручную (не как есть из `migration:generate`), имя `<PascalCase><unix-ms>` (например `AddColorToWidgets1730000000123`, реальный `Date.now()` — без коллизий), всегда с рабочим `down()`, `IF EXISTS`/`IF NOT EXISTS` для идемпотентного отката. Уже применённую миграцию никогда не переименовывать и не редактировать — только добавлять новые. `synchronize` всегда `false`. Локально: `pnpm --filter backend migration:run` (через `src/data-source.ts`); в проде `entrypoint.sh` запускает `dist/migration-run.js` перед стартом приложения.

## Frontend

- Запросы к API идут через `useApi()` (`apps/frontend/app/composables/useApi.ts`) — обёртку над `fetch`, которая берёт `apiBase` из runtime config, ставит bearer-заголовок и делает автоматический refresh-и-повтор запроса при 401. Композаблы по ресурсам (`useRecipesApi`, `useUsersApi` и т.д.) оборачивают её — для новых эндпоинтов следовать этому паттерну, а не дёргать `fetch`/`useApi` напрямую из компонентов.
- Состояние — в Pinia-сторах в `app/stores/` (например `userStore`, `menuPlannerStore`, `shoppingListsStore`).
- `pnpm --filter frontend generate:api` перегенерирует типизированный клиент из OpenAPI/Swagger запущенного backend (`@hey-api/openapi-ts`) — по скрипту нужен backend на `localhost:3000`, `/api/swagger.json`; реальный порт стоит перепроверить перед использованием.
- Компоненты `packages/ui-kit` (экспорты вроде `Button` из `packages/ui-kit/src/index.ts`) — общие элементы дизайн-системы; их стоит переиспользовать вместо дублирования компонентов на месте, новые общие компоненты добавлять туда же со Storybook-историей в `apps/storybook/stories`.
