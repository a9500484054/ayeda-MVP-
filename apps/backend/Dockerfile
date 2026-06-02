FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ================= DEVELOPMENT =================
FROM node:20-alpine AS development

WORKDIR /app

RUN apk add --no-cache netcat-openbsd

# Копируем package.json и устанавливаем ВСЕ зависимости (включая devDependencies)
COPY package*.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# Устанавливаем переменные окружения для development
ENV NODE_ENV=development

EXPOSE 4000

# В режиме development используем start:dev с hot-reload
# Команда будет переопределена в docker-compose.override.yml
CMD ["npm", "run", "start:dev"]

# ================= PRODUCTION =================
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache netcat-openbsd

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["/entrypoint.sh"]
