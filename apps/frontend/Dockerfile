# apps/frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Устанавливаем pnpm
RUN npm install -g pnpm@latest

# Копируем всё сразу
COPY . .

# Устанавливаем зависимости (включая dev)
RUN pnpm install

EXPOSE 3000

# Запускаем в режиме разработки
CMD ["pnpm", "run", "dev"]
