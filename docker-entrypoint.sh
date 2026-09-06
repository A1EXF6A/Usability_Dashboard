#!/bin/bash
set -e

echo "=== Usability Dashboard API - Starting ==="

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if dotnet ef migrations list --project ./Migrations 2>/dev/null; then
        echo "PostgreSQL is ready!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "PostgreSQL not ready yet. Attempt $RETRY_COUNT/$MAX_RETRIES. Waiting 5 seconds..."
    sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "WARNING: Could not verify PostgreSQL connection, proceeding anyway..."
fi

# Apply migrations
echo "Applying database migrations..."
dotnet ef database update --project ./Migrations --startup-project . --no-build 2>/dev/null || \
    echo "Note: Migrations may have already been applied or will be applied on first request."

# Execute seed data if DATABASE_SEED=true
if [ "$DATABASE_SEED" = "true" ]; then
    echo "Checking for seed data..."
    # Seed data will be applied through the application
fi

echo "=== Starting API Server ==="
exec dotnet UsabilityDashboard_API.dll "$@"
