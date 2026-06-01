# Redis Production Setup

## Безопасность
- Пароль установлен в .env файле
- Опасные команды (FLUSHALL, CONFIG) переименованы
- Redis работает в защищенном режиме

## Память
- Лимит памяти: 256MB
- Политика вытеснения: allkeys-lru

## Бэкапы
- Ежедневные бэкапы в 2:00 AM
- Хранение: 30 дней
- Формат: сжатые RDB + AOF файлы

## Восстановление
./scripts/restore-redis.sh ./backups/redis/backup_file.rdb.gz

## Мониторинг
./scripts/monitor-redis.sh
