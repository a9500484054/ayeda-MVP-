# Контекст сборки — КОРЕНЬ монорепы (pnpm workspace).
# docker compose: build.context = ".", dockerfile = "apps/backend/Dockerfile".

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

# ---------- build: ставим зависимости и собираем ----------
FROM base AS build
# сперва только манифесты — чтобы слой с install кэшировался
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY apps/storybook/package.json apps/storybook/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile --filter backend

COPY apps/backend apps/backend
RUN pnpm --filter backend run build
# самодостаточное прод-дерево (hoisted node_modules только с prod-зависимостями).
# --legacy: бэкенд не тянет workspace-пакеты, инъекция не нужна
RUN pnpm --filter backend deploy --prod --legacy /out

# ---------- development (hot-reload, исходники монтируются) ----------
FROM base AS development
RUN apk add --no-cache netcat-openbsd
ENV NODE_ENV=development
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/
COPY apps/storybook/package.json apps/storybook/
COPY packages/ packages/
RUN pnpm install --frozen-lockfile --filter backend
COPY apps/backend apps/backend
WORKDIR /repo/apps/backend
EXPOSE 4000
CMD ["pnpm", "run", "start:dev"]

# ---------- production ----------
FROM node:20-alpine AS production
RUN apk add --no-cache netcat-openbsd
WORKDIR /app
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /repo/apps/backend/dist ./dist
COPY --from=build /repo/apps/backend/package.json ./package.json
COPY apps/backend/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["/entrypoint.sh"]
