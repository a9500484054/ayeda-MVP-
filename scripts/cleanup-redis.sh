#!/bin/bash

# Очистка старых бэкапов (оставляем последние 7)
cd ./backups/redis
ls -t *.gz | tail -n +8 | xargs -r rm

# Очистка логов Redis (если они накапливаются)
docker exec ayeda_redis sh -c "echo '' > /var/log/redis.log" 2>/dev/null

echo "✅ Cleanup completed at $(date)"
