export default {
  phase: 'Phase 8 · DevOps & Certifications',
  title: 'Docker Mastery',
  intro: 'Docker packages your application with all its dependencies into a portable container that runs identically on your laptop, in CI, and in production. Every senior backend and cloud engineer is expected to write production Dockerfiles, understand layer caching, and deploy to a container registry.',
  tags: ['Dockerfile', 'Multi-stage build', 'Layer caching', 'Non-root user', 'ECR', 'Best practices'],
  seniorExpectations: [
    'Write a production multi-stage Dockerfile for a PHP/Laravel app',
    'Explain layer caching and optimize file copy order',
    'Always run containers as non-root',
    'Know ENTRYPOINT vs CMD',
    'Push/pull images from AWS ECR',
    'Explain why secrets must never be baked into images',
  ],

  // ── Structure ────────────────────────────────────────────────────────────
  // Segments define layout only. Text keys are resolved from bodyTexts below.
  // Code segments are always English — never translated.
  segments: [
    { type: 'h2', key: 'h_core_concepts' },
    { type: 'ul', key: 'ul_core_concepts' },

    { type: 'h2', key: 'h_layer_caching' },
    { type: 'p',  key: 'p_layer_caching' },
    { type: 'code', lang: 'dockerfile', label: 'Dockerfile — Production Laravel', code: `# ── STAGE 1: Composer (large, not in final image) ──────────
FROM composer:2.7 AS composer-deps

WORKDIR /app
COPY composer.json composer.lock ./   # copy ONLY dep files first
RUN composer install \\                # cached until composer.json changes
    --no-dev --no-scripts --no-interaction \\
    --prefer-dist --optimize-autoloader
COPY . .
RUN composer dump-autoload --optimize --no-dev

# ── STAGE 2: Node / frontend assets ────────────────────────
FROM node:20-alpine AS node-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY resources/ resources/
COPY vite.config.js ./
RUN npm run build

# ── STAGE 3: Production runtime (lean, only what's needed) ─
FROM php:8.3-fpm-alpine AS production

RUN apk add --no-cache libpng-dev libzip-dev postgresql-dev \\
 && docker-php-ext-install pdo_pgsql pdo_mysql gd zip opcache \\
 && rm -rf /var/cache/apk/*

# OPcache for production
RUN echo "opcache.enable=1\\nopcache.validate_timestamps=0\\nopcache.memory_consumption=256" \\
    >> /usr/local/etc/php/conf.d/opcache.ini

# Non-root user — security best practice
RUN addgroup -g 1001 -S www && adduser -u 1001 -S www -G www

WORKDIR /var/www/html

# Copy from build stages — only runtime artifacts
COPY --from=composer-deps --chown=www:www /app/vendor    ./vendor
COPY --from=composer-deps --chown=www:www /app/app       ./app
COPY --from=composer-deps --chown=www:www /app/config    ./config
COPY --from=composer-deps --chown=www:www /app/routes    ./routes
COPY --from=composer-deps --chown=www:www /app/bootstrap ./bootstrap
COPY --from=node-build    --chown=www:www /app/public     ./public
COPY --chown=www:www . .

RUN chmod -R 775 storage bootstrap/cache

USER www      # never run as root in production
EXPOSE 9000
CMD ["php-fpm"]
# Final image: ~80MB  vs  ~800MB+ without multi-stage` },

    { type: 'h2', key: 'h_essential_commands' },
    { type: 'code', lang: 'bash', label: 'bash — Docker CLI', code: `# Build
docker build -t my-app:1.0 .
docker build -t my-app:1.0 --no-cache .    # ignore layer cache

# Run
docker run -d -p 8080:80 my-app:1.0         # detached + port map
docker run -e APP_ENV=production my-app:1.0 # env var
docker run -v $(pwd)/storage:/app/storage my-app:1.0  # volume

# Debug
docker ps                                    # running containers
docker logs -f my-container                  # follow logs
docker exec -it my-container /bin/sh         # shell inside
docker exec my-container php artisan migrate # run command
docker stats                                 # CPU / RAM

# Cleanup
docker stop my-container                     # graceful (SIGTERM)
docker rm my-container                       # remove stopped container
docker system prune -a                       # remove all unused

# AWS ECR workflow
REPO=123456789.dkr.ecr.eu-west-1.amazonaws.com
aws ecr get-login-password --region eu-west-1 \\
  | docker login --username AWS --password-stdin $REPO
docker tag my-app:1.0 $REPO/my-app:1.0
docker push $REPO/my-app:1.0` },

    { type: 'callout', style: 'warn', key: 'callout_secrets' },

    { type: 'keypoints', key: 'keypoints' },
  ],

  // ── English source text ──────────────────────────────────────────────────
  // This is the English "locale". Russian/Armenian overrides live in ru.ts / hy.ts.
  bodyTexts: {
    h_core_concepts: 'Core Concepts',
    ul_core_concepts: [
      '<strong>Image:</strong> Read-only blueprint built from a Dockerfile. Like a class — a definition.',
      '<strong>Container:</strong> Running instance of an image. Like an object — isolated process.',
      '<strong>Layer:</strong> Each Dockerfile instruction creates a layer. Layers are cached and shared.',
      '<strong>Registry:</strong> Image storage. Docker Hub = public. ECR / GHCR = private.',
      '<strong>Volume:</strong> Persistent storage mounted into the container. Survives restarts.',
    ],

    h_layer_caching: 'Layer Caching — Most Important Concept',
    p_layer_caching: 'Docker builds image layer by layer. Each layer is cached. <strong>Cache is invalidated from the first changed layer downward.</strong> So: put slow-changing things at the top (system packages, <code>composer install</code>) and fast-changing things at the bottom (your source code).',

    h_essential_commands: 'Essential Commands',

    callout_secrets: {
      title: 'Never Bake Secrets into Images',
      html:  'Never COPY your .env file or any credentials into a Docker image. Images are pushed to registries and can be pulled. Even if you delete the file in a later layer, it remains in the layer history. Pass secrets at runtime via environment variables or AWS Secrets Manager.',
    },

    keypoints: {
      title: 'Key Points to Remember',
      items: [
        'Multi-stage: large build stage + small runtime stage. Only runtime artifacts in final image.',
        'Layer caching: copy slowly-changing files first (composer.json), source code last',
        'Always run as non-root in production — create a user and switch with USER',
        '.dockerignore: exclude .git, node_modules, vendor, .env, tests',
        'Never bake secrets into images — pass at runtime',
        'docker stop = SIGTERM (graceful shutdown). docker kill = SIGKILL (immediate). Prefer stop.',
        'Containers are stateless — store data in volumes or external services',
      ],
    },
  },
};

// ── AWS CORE ──────────────────────────────────────────────────────────
