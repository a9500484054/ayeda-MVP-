#!/bin/sh

set -e

echo "⏳ Waiting for Postgres..."

until nc -z $DB_HOST 5432; do
  sleep 1
done

echo "✅ Postgres is up"

echo "📦 Running migrations..."

node dist/migration-run.js

echo "🚀 Starting backend..."

node dist/main.js
