#!/bin/sh
set -e

echo "Generating prisma client..."
pnpm prisma generate

echo "Running migrations..."
pnpm prisma migrate deploy

echo "Starting app..."
exec node dist/src/main
