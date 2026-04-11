#!/bin/sh
set -e

echo "Generating prisma client..."
npx prisma generate

echo "Running migrations..."
npx prisma migrate deploy

echo "Starting app..."
npm run start:prod
