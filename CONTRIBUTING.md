# Contributing

Правила для backend (`apps/backend`). Полная картина — `docs/architecture.md`,
эталонный модуль — `docs/module-template/`.

## Пакетный менеджер

Только **pnpm** (монорепа — pnpm workspace). `npm install` / `yarn` не использовать.

```bash
pnpm install                              # из корня
pnpm --filter backend start:dev
pnpm --filter backend test
pnpm --filter backend migration:run
```

## Структура модуля

Каждая фича — папка в `src/modules/<feature>/`:

```
<feature>.module.ts
<feature>.controller.ts
<feature>.service.ts
dto/
  create-<feature>.dto.ts        входной, class-validator
  update-<feature>.dto.ts        PartialType(Create…) или явный
  <feature>-response.dto.ts      выходной, class-transformer (@Expose)
  <feature>-query.dto.ts         фильтры, extends PaginationDto
entities/<feature>.entity.ts
enums/                           если есть перечисления
```

Проще всего — скопировать `docs/module-template/` и переименовать.

## DTO

- **Входные** (`@Body()`, `@Query()`) — только классы с декораторами `class-validator`.
  `@Body() x: Partial<Entity>` / `any` / интерфейс — **запрещено** (обходит `ValidationPipe`).
- Поля, которыми нельзя управлять с клиента (`role`, `status`, `isEmailVerified`,
  счётчики, `id`, даты) — в DTO **не выносим**, либо разрешаем только под ролью
  и проверяем в сервисе.
- **Выходные** — классы `*-response.dto.ts`. Секреты (`password`, `settings`,
  внутренние поля) помечаем `@Exclude()`. Никаких `@Body() → save() → return entity`.
- Пагинируемые списки возвращаем `PaginatedResponseDto<T>`.
- Числа из query: полагаемся на `@Type(() => Number)` в DTO + `transform: true`,
  не пишем `Number(x) || 1` в контроллерах.

## Контроллер

- Тонкий: guard-ы, `@Body()/@Param()/@Query()` DTO, вызов сервиса, возврат response-DTO.
- Права: `@UseGuards(JwtAuthGuard)` + `@Roles(...)` для ролевых ограничений.
  Проверку «это ресурс текущего пользователя» делает **сервис**, не контроллер.
- Никакой бизнес-логики, транзакций, обращений к репозиториям.
- `@ApiOperation` / `@ApiResponse` на каждый эндпоинт.

## Сервис

- Вся бизнес-логика и права на конкретную сущность (`ForbiddenException`, если чужое).
- Любая операция с несколькими записями — в `dataSource.transaction(async (m) => …)`.
- Денормализованные счётчики меняем в той же транзакции, что и источник;
  плюс есть ночная сверка-cron.
- Кэш через `cacheGetOrSet` (`utils/redis.utils`), инвалидация — по конкретным ключам
  (`clearCachePattern` использует SCAN). `KEYS` не использовать.

## Ошибки и логи

- Бросаем только `HttpException` и наследников (`NotFoundException`, `ForbiddenException`, …).
  Формат ответа держит `AllExceptionsFilter` — руками ошибки не форматируем.
- Логи — только `Logger` (`private readonly logger = new Logger(X.name)`).
  `console.*` в коде приложения запрещён (ок только в `main.ts` bootstrap до DI).

## Миграции

- Имя файла и класса: `<PascalCase><unix-ms>` — напр. `AddColorToWidgets1730000000123`.
  Timestamp — реальный `Date.now()`, без коллизий с существующими.
- Пишем вручную (не `migration:generate`), всегда рабочий `down()`.
- `IF EXISTS` / `IF NOT EXISTS` в DDL для идемпотентности отката.
- Уже применённые миграции не переименовываем и не редактируем — только новые.

## Аутентификация в тестах/ручках

- Защищённые эндпоинты — `@UseGuards(JwtAuthGuard)` (+ `@ApiBearerAuth()`).
- Публичные с опциональным юзером — `@UseGuards(OptionalJwtAuthGuard)`.
- Чувствительные к брутфорсу — `@Throttle({ default: { limit, ttl } })`.

## Перед PR

```bash
pnpm --filter backend lint
pnpm --filter backend exec tsc --noEmit
pnpm --filter backend test
pnpm --filter backend build
```

CI гоняет то же самое. Pre-commit (husky + lint-staged) прогоняет lint/prettier по staged-файлам.
