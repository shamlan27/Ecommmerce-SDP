FROM php:8.3-fpm-alpine

WORKDIR /var/www

# Install system dependencies.
RUN apk add --no-cache \
    bash \
    curl \
    git \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    unzip

# Install PHP extensions required by Laravel.
RUN docker-php-ext-install \
    bcmath \
    intl \
    mbstring \
    pdo_mysql \
    zip

# Install Composer.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy composer files.
COPY backend/composer.json backend/composer.lock* ./

# Install dependencies.
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy application.
COPY backend/ .

# Set permissions.
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV PORT=8080

# Use the official PHP-FPM configuration.
EXPOSE 8080

CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=8080"]
