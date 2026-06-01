# ==================== Development Stage ====================
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "start:dev"]

# ==================== Builder Stage ====================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Копируем src для миграций (ВАЖНО!)
COPY --from=development /app/src ./src

# ==================== Production Stage ====================
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src

EXPOSE 4000

CMD ["node", "dist/main.js"]
