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
  body: `
<h2>Core Concepts</h2>
<ul>
  <li><strong>Image:</strong> Read-only blueprint built from a Dockerfile. Like a class — a definition.</li>
  <li><strong>Container:</strong> Running instance of an image. Like an object — isolated process.</li>
  <li><strong>Layer:</strong> Each Dockerfile instruction creates a layer. Layers are cached and shared.</li>
  <li><strong>Registry:</strong> Image storage. Docker Hub = public. ECR / GHCR = private.</li>
  <li><strong>Volume:</strong> Persistent storage mounted into the container. Survives restarts.</li>
</ul>

<h2>Layer Caching — Most Important Concept</h2>
<p>Docker builds image layer by layer. Each layer is cached. <strong>Cache is invalidated from the first changed layer downward.</strong> So: put slow-changing things at the top (system packages, <code>composer install</code>) and fast-changing things at the bottom (your source code).</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">Dockerfile — Production Laravel</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># ── STAGE 1: Composer (large, not in final image) ──────────
FROM composer:2.7 AS composer-deps

WORKDIR /app
COPY composer.json composer.lock ./   # copy ONLY dep files first
RUN composer install \                # cached until composer.json changes
    --no-dev --no-scripts --no-interaction \
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

RUN apk add --no-cache libpng-dev libzip-dev postgresql-dev \
 && docker-php-ext-install pdo_pgsql pdo_mysql gd zip opcache \
 && rm -rf /var/cache/apk/*

# OPcache for production
RUN echo "opcache.enable=1\nopcache.validate_timestamps=0\nopcache.memory_consumption=256" \
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
# Final image: ~80MB  vs  ~800MB+ without multi-stage
</code></pre>
</div>

<h2>Essential Commands</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash — Docker CLI</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Build
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
aws ecr get-login-password --region eu-west-1 \
  | docker login --username AWS --password-stdin $REPO
docker tag my-app:1.0 $REPO/my-app:1.0
docker push $REPO/my-app:1.0
</code></pre>
</div>

<div class="callout callout-danger">
  <div class="callout-title">Never Bake Secrets into Images</div>
  <p>Never COPY your .env file or any credentials into a Docker image. Images are pushed to registries and can be pulled. Even if you delete the file in a later layer, it remains in the layer history. Pass secrets at runtime via environment variables or AWS Secrets Manager.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Multi-stage: large build stage + small runtime stage. Only runtime artifacts in final image.</li>
    <li>Layer caching: copy slowly-changing files first (composer.json), source code last</li>
    <li>Always run as non-root in production — create a user and switch with USER</li>
    <li>.dockerignore: exclude .git, node_modules, vendor, .env, tests</li>
    <li>Never bake secrets into images — pass at runtime</li>
    <li>docker stop = SIGTERM (graceful shutdown). docker kill = SIGKILL (immediate). Prefer stop.</li>
    <li>Containers are stateless — store data in volumes or external services</li>
  </ul>
</div>
`,
};

// ── AWS CORE ──────────────────────────────────────────────────────────
