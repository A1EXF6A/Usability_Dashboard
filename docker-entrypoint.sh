#!/bin/bash
set -e

echo "=== Usability Dashboard API - Starting ==="
echo "=== Starting API Server ==="
exec dotnet UsabilityDashboard_API.dll "$@"
