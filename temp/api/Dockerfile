FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    libpq-dev zip unzip git \
  && docker-php-ext-install pdo_pgsql \
  && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

# Сначала копируем весь код Symfony, чтобы bin/console был на месте
COPY api /app

# Теперь устанавливаем зависимости и выполняем авто-скрипты
RUN composer install --no-interaction --prefer-dist

EXPOSE 9000

CMD ["php-fpm"]
