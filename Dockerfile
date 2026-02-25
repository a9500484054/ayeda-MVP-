# Корневой Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Устанавливаем pnpm глобально
RUN npm install -g pnpm@latest

# Копируем файлы зависимостей
COPY apps/backend/package.json apps/backend/pnpm-lock.yaml ./

# Удаляем старый lockfile если есть и устанавливаем зависимости заново
RUN rm -f pnpm-lock.yaml && \
    pnpm install --prod=false --no-frozen-lockfile

# Копируем исходный код
COPY apps/backend ./

# Явно устанавливаем @nestjs/cli если его нет
RUN if [ ! -d "node_modules/@nestjs/cli" ]; then \
      pnpm add -D @nestjs/cli@latest; \
    fi

# Проверяем что nest cli установлен
RUN ls -la node_modules/@nestjs/cli/bin/ || exit 1

# Собираем приложение
RUN pnpm build

# Финальный образ для backend
FROM node:20-alpine AS backend

WORKDIR /app

# Копируем собранный код
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Устанавливаем pnpm и production зависимости
RUN npm install -g pnpm@latest && \
    pnpm install --prod --no-frozen-lockfile

EXPOSE 4000

CMD ["node", "dist/main"]

# Образ для миграций
FROM node:20-alpine AS migrate

WORKDIR /app

# Устанавливаем pnpm глобально
RUN npm install -g pnpm@latest

# Копируем всё из builder
COPY --from=builder /app ./

# Убеждаемся, что все зависимости есть
RUN pnpm install --no-frozen-lockfile

# Запускаем миграции
CMD ["pnpm", "run", "migration:run"]
