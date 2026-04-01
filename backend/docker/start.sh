#!/bin/sh
set -e

# Ensure app key exists in production environment variables.
if [ -z "$APP_KEY" ]; then
  echo "APP_KEY is not set. Please add APP_KEY in Railway variables."
  exit 1
fi

# Cache config/routes for faster boot when possible.
php artisan config:cache || true
php artisan route:cache || true

# Run migrations at startup.
php artisan migrate --force || true

# Start Laravel HTTP server on Railway assigned port.
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
