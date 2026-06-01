#!/bin/bash

source .env

echo "📊 Redis Monitoring Report"
echo "=========================="
echo ""

# Проверка статуса
if docker exec ayeda_redis redis-cli -a "$REDIS_PASSWORD" ping 2>/dev/null | grep -q PONG; then
    echo "✅ Status: Running"
else
    echo "❌ Status: Down"
    exit 1
fi

echo ""

# Информация о памяти
echo "💾 Memory Usage:"
docker exec ayeda_redis redis-cli -a "$REDIS_PASSWORD" INFO memory 2>/dev/null | grep -E "used_memory_human|maxmemory_human|mem_fragmentation_ratio"
echo ""

# Информация о ключах
echo "🔑 Keyspace:"
docker exec ayeda_redis redis-cli -a "$REDIS_PASSWORD" INFO keyspace 2>/dev/null
echo ""

# Статистика
echo "📈 Statistics:"
docker exec ayeda_redis redis-cli -a "$REDIS_PASSWORD" INFO stats 2>/dev/null | grep -E "total_connections_received|total_commands_processed|keyspace_hits|keyspace_misses"
echo ""

# Проверка использования памяти относительно лимита
USED_MEM=$(docker exec ayeda_redis redis-cli -a "$REDIS_PASSWORD" INFO memory 2>/dev/null | grep "used_memory_human" | cut -d: -f2 | tr -d ' \r')
MAX_MEM=$(docker exec ayeda_redis redis-cli -a "$REDIS_PASSWORD" CONFIG GET maxmemory 2>/dev/null | tail -1)

echo "⚠️  Memory Alert: $USED_MEM / $(numfmt --to=iec $MAX_MEM)"
