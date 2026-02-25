#!/bin/bash

echo "🚀 Ayeda Project Setup"
echo "======================"

# Проверка наличия pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm not found. Installing globally..."
    npm install -g pnpm
else
    echo "✅ pnpm found"
fi

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker Desktop first."
    exit 1
else
    echo "✅ Docker found"
fi

# Установка зависимостей
echo "📦 Installing dependencies..."
pnpm install

# Запуск Docker контейнеров
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Ожидание готовности БД
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Копирование .env файлов
echo "📝 Creating .env files from examples..."
if [ ! -f apps/backend/.env ]; then
    cp apps/backend/.env.example apps/backend/.env
    echo "   ✅ Backend .env created"
else
    echo "   ⏩ Backend .env already exists"
fi

if [ ! -f apps/frontend/.env ]; then
    cp apps/frontend/.env.example apps/frontend/.env
    echo "   ✅ Frontend .env created"
else
    echo "   ⏩ Frontend .env already exists"
fi

# Сборка shared и ui-kit
echo "🏗️ Building shared packages..."
pnpm build:shared &> /dev/null || echo "   ⏩ Shared build skipped (script not ready)"
pnpm build:ui-kit &> /dev/null || echo "   ⏩ UI-kit build skipped (script not ready)"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  📦 Backend: cd apps/backend && pnpm dev"
echo "  🎨 Frontend: cd apps/frontend && pnpm dev"
echo "  📊 Adminer: http://localhost:8080"
echo ""
