#!/bin/bash
set -e

echo "=== Usability Dashboard API - Starting ==="

echo "=== Esperando a PostgreSQL en postgres:5432 ==="
for i in $(seq 1 30); do
  if (echo > /dev/tcp/postgres/5432) 2>/dev/null; then
    echo "=== PostgreSQL está listo ==="
    break
  fi
  echo "PostgreSQL no está listo (intento $i/30), reintentando en 2s..."
  sleep 2
done

echo "=== Starting API Server ==="
exec dotnet UsabilityDashboard_API.dll "$@"
