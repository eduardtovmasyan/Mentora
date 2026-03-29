export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'Docker Compose for Local Development',
  intro: 'Docker Compose defines and runs multi-container applications. For PHP development it replaces local LAMP stack installations with reproducible, version-controlled containers: PHP-FPM, Nginx, MySQL, Redis, and optional services. The Compose file is the single source of truth for the development environment.',
  tags: ['docker-compose.yml', 'Services', 'Volumes', 'Networks', 'Health checks', 'Override files'],
  seniorExpectations: [
    'Write a complete docker-compose.yml for a Laravel application',
    'Use override files (docker-compose.override.yml) for dev-specific settings',
    'Configure named volumes for database persistence and bind mounts for code',
    'Add health checks so dependent services wait for DB to be ready',
    'Understand multi-stage Dockerfiles and optimize image size',
  ],

  // ── Structure ────────────────────────────────────────────────────────────
  // Segments define layout only. Text keys are resolved from bodyTexts below.
  // Code segments are always English — never translated.
  segments: [
    { type: 'h2', key: 'h_compose_setup' },
    { type: 'code', lang: 'yaml', label: 'YAML — docker-compose.yml', code: `services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    volumes:
      - .:/var/www/html          # bind mount for live code reload
      - vendor:/var/www/html/vendor # named volume for vendor (faster)
    environment:
      APP_ENV: local
      DB_HOST: mysql
      DB_PORT: 3306
      REDIS_HOST: redis
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app-network

  nginx:
    image: nginx:1.25-alpine
    ports:
      - "8080:80"
    volumes:
      - .:/var/www/html:ro
      - ./docker/nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - app
    networks:
      - app-network

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: app
      MYSQL_USER: app_user
      MYSQL_PASSWORD: secret
      MYSQL_ROOT_PASSWORD: root_secret
    volumes:
      - mysql-data:/var/lib/mysql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data
    ports:
      - "6379:6379"
    networks:
      - app-network

  mailhog:
    image: mailhog/mailhog
    ports:
      - "8025:8025"   # web UI
      - "1025:1025"   # SMTP
    networks:
      - app-network

volumes:
  mysql-data:
  redis-data:
  vendor:

networks:
  app-network:
    driver: bridge` },

    { type: 'h2', key: 'h_multistage' },
    { type: 'code', lang: 'bash', label: 'Dockerfile', code: `FROM php:8.2-fpm-alpine AS base
RUN apk add --no-cache postgresql-dev redis
RUN docker-php-ext-install pdo pdo_pgsql opcache

# Development stage — includes Xdebug, dev tools
FROM base AS development
RUN pecl install xdebug && docker-php-ext-enable xdebug
COPY docker/php/xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini
WORKDIR /var/www/html

# Build stage — install Composer dependencies
FROM base AS build
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Production stage — lean image, no dev tools
FROM base AS production
WORKDIR /var/www/html
COPY --from=build /var/www/html/vendor ./vendor
COPY . .
RUN php artisan config:cache && php artisan route:cache
USER www-data` },

    { type: 'h2', key: 'h_commands' },
    { type: 'code', lang: 'bash', label: 'bash', code: `docker compose up -d          # start all services in background
docker compose up --build     # rebuild images before starting
docker compose down           # stop and remove containers
docker compose down -v        # also remove volumes (wipes DB!)

docker compose exec app php artisan migrate
docker compose exec app composer install
docker compose logs -f app    # tail logs from app service
docker compose ps             # list running containers
docker compose restart nginx  # restart specific service` },

    { type: 'callout', style: 'tip', key: 'callout_override' },

    { type: 'keypoints', key: 'keypoints' },
  ],

  // ── English source text ──────────────────────────────────────────────────
  // This is the English "locale". Russian/Armenian overrides live in ru.ts / hy.ts.
  bodyTexts: {
    h_compose_setup: 'Complete Laravel Compose Setup',
    h_multistage:    'Multi-stage Dockerfile',
    h_commands:      'Common Commands',

    callout_override: {
      title: 'Override files for teams',
      html:  'Use <code>docker-compose.override.yml</code> for developer-specific settings (Xdebug port, personal env vars). Git-ignore it. The base <code>docker-compose.yml</code> is committed and shared. Docker Compose automatically merges both files when running <code>docker compose up</code>.',
    },

    keypoints: {
      title: 'Key Points to Remember',
      items: [
        'Use named volumes for databases (persistence) and bind mounts for source code (live reload)',
        'Health checks: <code>depends_on: service_healthy</code> waits for DB to be ready before starting app',
        'Multi-stage Dockerfile: build/dev stages are large; production stage copies only what\'s needed',
        'Networks: all services in the same network can communicate by service name (mysql, redis)',
        'Never use docker-compose v1 syntax — use Compose Spec (v3.x / no version field)',
      ],
    },
  },
};
