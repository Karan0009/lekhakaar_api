#!/bin/sh

# Stop and remove existing containers (if running)
# docker stop lekhakaar-api 2>/dev/null || true
# docker stop lekhakaar-api-mq 2>/dev/null || true
# docker rm lekhakaar-api 2>/dev/null || true
# docker rm lekhakaar-api-mq 2>/dev/null || true

echo "🚀 Stopping and removing existing containers..."

docker-compose down

echo "🔄 Building new images..."
docker-compose build

echo "🚢 Starting containers..."
docker-compose up -d

echo "✅ Services are up and running!"
