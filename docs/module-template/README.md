# Module template

Эталонный модуль `widgets` — минимальный CRUD с пагинацией, фильтрами и
правами владельца, оформленный по правилам `CONTRIBUTING.md`.

## Как использовать

1. Скопировать `widgets/` в `apps/backend/src/modules/<feature>/`.
2. Заменить `widget`/`Widget`/`widgets` → на своё (регистр учитывать).
3. Поправить импорты (`../../common/...`, `../users/...` — в шаблоне пути даны
   так, будто модуль лежит в `src/modules/<feature>/`).
4. Скопировать `migration.example.ts` в `src/migrations/` под новым именем
   `Create<Feature>Table<Date.now()>.ts`, поправить класс и SQL.
5. Подключить модуль в `apps/backend/src/app.module.ts`.
6. Добавить тесты по образцу `docs/module-template/widgets.e2e-spec.example.ts`.

## Что показывает шаблон

- тонкий контроллер, вся логика в сервисе;
- входные DTO с `class-validator`, `role`/`ownerId`/счётчики недоступны с клиента;
- выходной `WidgetResponseDto` с `@Expose` (никаких сырых entity в ответе);
- `<feature>-query.dto.ts extends PaginationDto` + `PaginatedResponseDto`;
- проверка владельца — в сервисе (`ForbiddenException`), не в контроллере;
- транзакция для многошаговой записи;
- миграция с рабочим `down()`.
