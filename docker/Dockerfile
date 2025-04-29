FROM node:20-alpine as node
WORKDIR /app/
COPY ./front /app/

FROM php:8.3-fpm-alpine as app
RUN apk --no-cache add \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    libxpm-dev \
    freetype-dev \
    autoconf \
    gcc \
    make \
    libc-dev \
    pkgconfig \
    linux-headers \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd exif \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del autoconf gcc make libc-dev pkgconfig linux-headers

WORKDIR /app/
COPY docker/conf/php/php.ini $PHP_INI_DIR/conf.d/
COPY docker/conf/php/www.conf /usr/local/etc/php-fpm.d/
COPY docker/conf/cron/crontab /etc/crontabs/www-data
COPY --from=composer:2.5.5 /usr/bin/composer /usr/bin/composer
COPY ./database /app/database/
COPY ./tests /app/tests/
COPY composer.* /app/
RUN composer install -n --ansi --no-scripts
COPY ./ /app/
RUN chown www-data:www-data /app/storage/

FROM nginx:latest as nginx
WORKDIR /app/
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
ENV NGINX_ACCESS_LOG "/dev/stdout"
