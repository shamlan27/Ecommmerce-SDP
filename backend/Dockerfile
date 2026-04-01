FROM php:8.3-cli-alpine

WORKDIR /var/www

# Install system dependencies and required PHP extensions for Laravel.
RUN apk add --no-cache \
    bash \
    curl \
    git \
    icu-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    libxpm-dev \
    libzip-dev \
    oniguruma-dev \
    unzip \
    zip \
    && docker-php-ext-configure gd --with-jpeg --with-webp \
    && docker-php-ext-install \
    bcmath \
    ctype \
    curl \
    dom \
    fileinfo \
    filter \
    gd \
    hash \
    intl \
    json \
    mbstring \
    openssl \
    pcre \
    pdo \
    pdo_mysql \
    session \
    tokenizer \
    xml \
    zip

# Install Composer.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy dependency manifests first for better Docker layer caching.
COPY backend/composer.json backend/composer.lock* ./

# Install PHP dependencies.
RUN composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --no-progress \
    --no-suggest

# Copy application code.
COPY backend/ .

# Ensure writable Laravel directories exist.
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chmod -R 777 storage bootstrap/cache

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV PORT=8080

EXPOSE 8080

CMD ["sh", "docker/start.sh"]
