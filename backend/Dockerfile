FROM php:8.3-fpm

WORKDIR /var/www

# Install system dependencies.
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    curl \
    git \
    libicu-dev \
    libzip-dev \
    unzip \
    && rm -rf /var/lib/apt/lists/*

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

# Install dependencies with verbose output for troubleshooting.
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --verbose || true

# Copy application.
COPY backend/ .

# Set permissions.
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=8080"]
