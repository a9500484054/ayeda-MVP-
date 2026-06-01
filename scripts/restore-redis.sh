#!/bin/bash

# Проверяем аргумент (файл бэкапа)
if [ -z "$1" ]; then
    echo "❌ Usage: ./restore-redis.sh <backup-file>"
    echo "Example: ./restore-redis.sh ./backups/redis/redis_20240101_120000.rdb.gz"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restoring Redis from backup: $BACKUP_FILE"

# Останавливаем Redis
docker stop ayeda_redis

# Распаковываем бэкап
gunzip -c "$BACKUP_FILE" > ./temp_restore.rdb

# Копируем файл в контейнер
docker cp ./temp_restore.rdb ayeda_redis:/data/dump.rdb

# Удаляем временный файл
rm ./temp_restore.rdb

# Запускаем Redis
docker start ayeda_redis

echo "✅ Redis restored successfully!"
echo "⚠️  Check logs: docker logs ayeda_redis"
