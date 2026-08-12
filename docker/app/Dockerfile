# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Étape 1 — build.
#
# Base PHP et non Node : le plugin Wayfinder appelle `php artisan
# wayfinder:generate` pendant `vite build` pour générer resources/js/{actions,
# routes,wayfinder}. Le front ne peut donc pas être buildé sans PHP + vendor.
# ---------------------------------------------------------------------------
FROM php:8.4-cli-bookworm AS build

RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libzip-dev \
    libicu-dev \
    ca-certificates \
    curl \
    gnupg \
    && docker-php-ext-install zip intl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Dépendances d'abord, sources ensuite : les couches d'install restent en cache
# tant que les lockfiles ne bougent pas.
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# artisan doit pouvoir booter pendant le build (package:discover, wayfinder).
# Ce .env est jetable : le vrai est monté au runtime.
# wayfinder:generate est appelé explicitement avant `npm run build` : le plugin
# Vite l'exécute aussi, mais avale sa sortie d'erreur — un échec y devient un
# « Command failed » sans cause. Ici, l'erreur réelle apparaît dans le log.
#
# Les dossiers de storage/ sont recréés ici : .dockerignore les écarte du
# contexte (on ne veut pas des caches de l'host), mais artisan refuse de booter
# sans storage/framework/views — « Please provide a valid cache path. »
RUN mkdir -p storage/framework/cache/data \
             storage/framework/sessions \
             storage/framework/views \
             storage/logs \
             bootstrap/cache \
    && cp .env.example .env \
    && composer dump-autoload --optimize --no-dev \
    && php artisan key:generate --no-interaction \
    && php artisan wayfinder:generate --with-form \
    && npm run build \
    && rm -rf node_modules .env

# ---------------------------------------------------------------------------
# Étape 2 — runtime : nginx + php-fpm dans un seul conteneur.
# ---------------------------------------------------------------------------
FROM php:8.4-fpm-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    curl \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libicu-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Uniquement le résultat du build : ni node_modules, ni composer, ni Node.
COPY --from=build /var/www/html /var/www/html

RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/app/nginx.conf /etc/nginx/sites-enabled/default
COPY docker/app/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/app/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS http://127.0.0.1/up || exit 1

CMD ["/start.sh"]
