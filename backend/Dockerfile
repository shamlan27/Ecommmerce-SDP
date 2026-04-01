FROM php:8.3-cli-alpine

WORKDIR /var/www

# Install system dependencies and required PHP extensions for Laravel.
RUN apk add --no-cache \
    bash \
    curl \
    git \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    unzip \
    zip \
    && docker-php-ext-install \
    bcmath \
    intl \
    mbstring \
    pdo_mysql \
    zip

# Install Composer.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy dependency manifests first for better Docker layer caching.
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Copy application code.
COPY . .

# Ensure writable Laravel directories exist.
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV PORT=8080

EXPOSE 8080

CMD ["sh", "docker/start.sh"]
