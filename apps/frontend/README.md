# Ayeda Frontend

Nuxt 4 frontend for Ayeda: public recipe pages with SSR, cabinet SPA routes, admin routes, menu planner and shopping lists.

## Stack

- Nuxt 4, Vue 3, strict TypeScript
- TailwindCSS, Nuxt-ready component structure
- Pinia stores
- Vee Validate/Zod-ready form layer
- REST API integration through `useApi`; generated OpenAPI client is reserved for `packages/shared-api`

## Environment

Copy `.env.example` to `.env` and adjust values:

```bash
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NUXT_PUBLIC_APP_URL=http://localhost:3000
NUXT_PUBLIC_SENTRY_DSN=
NUXT_PUBLIC_YANDEX_METRICA_ID=
```

## Commands

```bash
pnpm install
pnpm dev
pnpm type-check
pnpm test
pnpm build
```

Generate API client after backend Swagger is available:

```bash
pnpm generate:api
```

## Routes

- `/`, `/recipes`, `/recipes/[srcPath]`, `/blog`, `/about`, `/policy`, `/offer`
- `/cabinet/my-recipes`, `/cabinet/favorites`, `/cabinet/menu-planner`, `/cabinet/shopping-lists`, `/cabinet/profile`
- `/admin`, `/admin/moderate/recipes`, `/admin/moderate/comments`, `/admin/directories`

## Production

```bash
docker build -t ayeda-frontend .
docker run -p 3000:3000 --env-file .env ayeda-frontend
```
