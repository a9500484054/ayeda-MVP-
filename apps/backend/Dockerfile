FROM node:22-alpine

WORKDIR /app

# Устанавливаем pnpm
RUN npm install -g pnpm@latest

# Копируем всё сразу
COPY . .

# Устанавливаем зависимости без скриптов, потом собираем нужные
RUN pnpm install --ignore-scripts

EXPOSE 4000

CMD ["pnpm", "run", "start:dev"]
