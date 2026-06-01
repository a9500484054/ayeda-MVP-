#!/bin/bash

# Создаем директорию для бэкапов если её нет
mkdir -p ./backups/redis

# Добавляем timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔄 Starting Redis backup at $TIMESTAMP"

# Создаем бэкап с паролем из .env
source .env
docker exec ayeda_redis redis-cli -a "$REDIS_PASSWORD" SAVE

# Копируем RDB файл
docker cp ayeda_redis:/data/dump.rdb "./backups/redis/redis_${TIMESTAMP}.rdb"

# Копируем AOF файл (если используется)
docker cp ayeda_redis:/data/appendonly.aof "./backups/redis/appendonly_${TIMESTAMP}.aof" 2>/dev/null

# Сжимаем бэкапы
gzip "./backups/redis/redis_${TIMESTAMP}.rdb"
if [ -f "./backups/redis/appendonly_${TIMESTAMP}.aof" ]; then
    gzip "./backups/redis/appendonly_${TIMESTAMP}.aof"
fi

# Удаляем бэкапы старше 30 дней
find ./backups/redis -type f -mtime +30 -delete

echo "✅ Redis backup completed: redis_${TIMESTAMP}.rdb.gz"
echo "📁 Location: ./backups/redis/"

# Выводим информацию о размере
ls -lh ./backups/redis/*.gz | tail -1
