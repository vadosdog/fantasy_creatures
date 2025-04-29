#!/bin/sh

chown -R www-data:www-data /app/bootstrap
if [ $TASK_SLOT -eq 1 ]; then
    sudo -E -u www-data php artisan migrate --force || exit 1

    if [ "$APP_ENV" = "production" ]; then
        sudo -E -u www-data php artisan migrate --force --path=database/migrations/history || exit 1
        sudo -E -u www-data php artisan migrate --force --path=database/migrations/clickhouse || exit 1
        sudo -E -u www-data php artisan config:cache
        sudo -E -u www-data php artisan route:cache
    fi

    if [ "$APP_ENV" = "local" ]; then
        sudo -E -u www-data php artisan passport:keys || exit 1
        sudo -E -u www-data chmod 600 storage/oauth-private.key || exit 1
        sudo -E -u www-data chmod 600 storage/oauth-public.key || exit 1
    fi
fi

php-fpm
