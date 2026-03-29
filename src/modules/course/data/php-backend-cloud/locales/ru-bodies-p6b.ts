import type { ILessonLocale } from '@/modules/course/interfaces/ILessonLocale.ts'

const ruBodiesP6b: Record<string, ILessonLocale> = {
  docker: {
    body: `
<h2>Основные концепции</h2>
<ul>
  <li><strong>Image (Образ):</strong> Доступный только для чтения шаблон, построенный из Dockerfile. Как класс — определение.</li>
  <li><strong>Container (Контейнер):</strong> Запущенный экземпляр образа. Как объект — изолированный процесс.</li>
  <li><strong>Layer (Слой):</strong> Каждая инструкция Dockerfile создаёт слой. Слои кэшируются и используются совместно.</li>
  <li><strong>Registry (Реестр):</strong> Хранилище образов. Docker Hub = публичный. ECR / GHCR = приватный.</li>
  <li><strong>Volume (Том):</strong> Постоянное хранилище, примонтированное в контейнер. Сохраняется после перезапуска.</li>
</ul>

<h2>Кэширование слоёв — самая важная концепция</h2>
<p>Docker строит образ слой за слоем. Каждый слой кэшируется. <strong>Кэш инвалидируется начиная с первого изменённого слоя и ниже.</strong> Поэтому: медленно меняющиеся вещи размещайте вверху (системные пакеты, <code>composer install</code>), а быстро меняющиеся — внизу (исходный код).</p>

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

<h2>Основные команды</h2>
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
  <div class="callout-title">Никогда не встраивайте секреты в образы</div>
  <p>Никогда не копируйте .env-файл или учётные данные в Docker-образ. Образы публикуются в реестры и могут быть загружены. Даже если удалить файл в более позднем слое, он останется в истории слоёв. Передавайте секреты во время выполнения через переменные окружения или AWS Secrets Manager.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Многоэтапная сборка: большой этап сборки + небольшой этап выполнения. В финальном образе только артефакты времени выполнения.</li>
    <li>Кэширование слоёв: сначала копируйте медленно меняющиеся файлы (composer.json), исходный код — последним</li>
    <li>Всегда запускайте контейнер не от root в production — создайте пользователя и переключитесь через USER</li>
    <li>.dockerignore: исключите .git, node_modules, vendor, .env, tests</li>
    <li>Никогда не встраивайте секреты в образы — передавайте во время выполнения</li>
    <li>docker stop = SIGTERM (корректное завершение). docker kill = SIGKILL (немедленное). Предпочтительнее stop.</li>
    <li>Контейнеры не имеют состояния — храните данные в томах или внешних сервисах</li>
  </ul>
</div>
`,
  },
  'docker-compose': {
    body: `
<h2>Полная настройка Laravel Compose</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — docker-compose.yml</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">services:
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
    driver: bridge
</code></pre>
</div>

<h2>Многоэтапный Dockerfile</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Dockerfile</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">FROM php:8.2-fpm-alpine AS base
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
USER www-data
</code></pre>
</div>

<h2>Общие команды</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">docker compose up -d          # start all services in background
docker compose up --build     # rebuild images before starting
docker compose down           # stop and remove containers
docker compose down -v        # also remove volumes (wipes DB!)

docker compose exec app php artisan migrate
docker compose exec app composer install
docker compose logs -f app    # tail logs from app service
docker compose ps             # list running containers
docker compose restart nginx  # restart specific service
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Override-файлы для команд</div>
  <p>Используйте <code>docker-compose.override.yml</code> для настроек, специфичных для разработчика (порт Xdebug, личные переменные окружения). Добавьте его в .gitignore. Базовый <code>docker-compose.yml</code> коммитится и используется совместно. Docker Compose автоматически объединяет оба файла при запуске <code>docker compose up</code>.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Используйте именованные тома для баз данных (персистентность) и bind mount для исходного кода (живая перезагрузка)</li>
    <li>Проверки работоспособности: <code>depends_on: service_healthy</code> ожидает готовности БД перед запуском приложения</li>
    <li>Многоэтапный Dockerfile: этапы сборки/разработки занимают много места; production-этап копирует только необходимое</li>
    <li>Сети: все сервисы в одной сети могут общаться по имени сервиса (mysql, redis)</li>
    <li>Никогда не используйте синтаксис docker-compose v1 — используйте Compose Spec (v3.x / без поля version)</li>
  </ul>
</div>
`,
  },
  terraform: {
    body: `
<h2>Основные концепции</h2>
<ul>
  <li><strong>Provider (Провайдер):</strong> Плагин, взаимодействующий с API (AWS, GCP, Azure). Настраивается с учётными данными.</li>
  <li><strong>Resource (Ресурс):</strong> Объект инфраструктуры для создания (aws_vpc, aws_ecs_service, aws_rds_cluster).</li>
  <li><strong>State (Состояние):</strong> Terraform отслеживает созданные ресурсы в файле состояния. Никогда не редактируйте вручную.</li>
  <li><strong>Plan (План):</strong> Предварительный просмотр изменений перед применением. Показывает, что будет создано/обновлено/удалено.</li>
  <li><strong>Apply (Применение):</strong> Выполнение плана и создание/обновление/удаление реальной инфраструктуры.</li>
  <li><strong>Module (Модуль):</strong> Переиспользуемая группа ресурсов — как функция в программировании.</li>
</ul>

<h2>Базовая структура проекта</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash — Terraform Project Layout</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">infrastructure/
├── main.tf          # main resources
├── variables.tf     # input variables (like function params)
├── outputs.tf       # output values (like return values)
├── providers.tf     # provider configuration
├── terraform.tfvars # variable values (gitignored for secrets)
└── modules/
    ├── vpc/         # reusable VPC module
    └── ecs/         # reusable ECS module
</code></pre>
</div>

<h2>Полный пример: VPC + ECS + RDS</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL — providers.tf</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }

  # Remote state — NEVER use local state in a team
  backend "s3" {
    bucket         = "my-company-terraform-state"
    key            = "my-app/production/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-state-lock"  # prevents concurrent applies
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}
</code></pre>
</div>

<div class="code-block">
<div class="code-header"><span class="code-lang">HCL — main.tf (VPC + Subnets)</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">variable "aws_region"  { default = "eu-west-1" }
variable "app_name"    { default = "my-app" }
variable "environment" { default = "production" }

locals {
  tags = {
    App         = var.app_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = merge(local.tags, { Name = "\${var.app_name}-vpc" })
}

# Public subnets (for ALB)
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = merge(local.tags, { Name = "\${var.app_name}-public-\${count.index}" })
}

# Private subnets (for ECS tasks, RDS)
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags = merge(local.tags, { Name = "\${var.app_name}-private-\${count.index}" })
}

data "aws_availability_zones" "available" { state = "available" }

# RDS PostgreSQL
resource "aws_db_instance" "main" {
  identifier     = "\${var.app_name}-db"
  engine         = "postgres"
  engine_version = "16.2"
  instance_class = "db.t3.micro"
  db_name        = "app"
  username       = "app_user"
  password       = var.db_password  # from terraform.tfvars (gitignored)

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  multi_az               = true     # high availability
  skip_final_snapshot    = false
  deletion_protection    = true

  tags = local.tags
}

# Outputs — reference in other configs or scripts
output "vpc_id"       { value = aws_vpc.main.id }
output "db_endpoint"  { value = aws_db_instance.main.endpoint }
</code></pre>
</div>

<h2>Рабочий процесс Terraform</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash — Terraform Commands</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">terraform init          # download providers + configure backend
terraform validate      # check HCL syntax
terraform fmt           # format files consistently
terraform plan          # preview changes (ALWAYS do this first)
terraform apply         # create/update infrastructure
terraform destroy       # tear down (careful!)

# Workspaces: separate state per environment
terraform workspace new staging
terraform workspace select production
terraform workspace list

# Target a specific resource:
terraform apply -target=aws_ecs_service.main

# Import existing resource into state:
terraform import aws_s3_bucket.media my-existing-bucket-name
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Всегда используйте удалённое состояние (S3 backend) + блокировку DynamoDB в командах — никогда не используйте локальное состояние</li>
    <li>Всегда выполняйте terraform plan перед apply — проверяйте, что изменится</li>
    <li>Никогда не храните секреты в .tf-файлах — используйте переменные + terraform.tfvars (в .gitignore) или AWS Secrets Manager</li>
    <li>Используйте модули для переиспользуемой инфраструктуры — модули VPC, ECS, RDS</li>
    <li>Рабочие пространства: окружения dev/staging/prod с отдельными файлами состояния</li>
    <li>data sources: ссылаются на существующие AWS-ресурсы без управления ими</li>
    <li>locals: вычисляемые значения, используемые многократно — как переменные, но не входные параметры</li>
  </ul>
</div>
`,
  },
  eks: {
    body: `
<h2>Основные объекты Kubernetes</h2>
<table class="ctable">
  <thead><tr><th>Объект</th><th>Назначение</th></tr></thead>
  <tbody>
    <tr><td>Pod</td><td>Минимальная единица развёртывания — один или несколько контейнеров с общей сетью/хранилищем</td></tr>
    <tr><td>Deployment</td><td>Управляет ReplicaSets — объявляет желаемое состояние, обрабатывает rolling-обновления</td></tr>
    <tr><td>Service</td><td>Стабильный IP/DNS для набора подов — ClusterIP, NodePort, LoadBalancer</td></tr>
    <tr><td>Ingress</td><td>Правила маршрутизации HTTP/HTTPS — сопоставляет пути/хосты с Services</td></tr>
    <tr><td>ConfigMap</td><td>Нечувствительная конфигурация, внедряемая как переменные окружения или файлы</td></tr>
    <tr><td>Secret</td><td>Чувствительные данные (в кодировке base64, могут быть зашифрованы в покое с KMS)</td></tr>
    <tr><td>HPA</td><td>Horizontal Pod Autoscaler — масштабирует реплики на основе метрик</td></tr>
  </tbody>
</table>

<h2>Манифест развёртывания PHP-приложения</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — deployment.yaml</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-app
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: php-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1   # at most 1 pod unavailable during update
      maxSurge: 1         # at most 1 extra pod during update
  template:
    metadata:
      labels:
        app: php-app
    spec:
      containers:
        - name: php-app
          image: 123456789.dkr.ecr.eu-west-1.amazonaws.com/my-app:v1.2.3
          ports:
            - containerPort: 9000
          envFrom:
            - configMapRef:
                name: php-app-config
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: php-app-secrets
                  key: db-password
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /health
              port: 9000
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 9000
            initialDelaySeconds: 30
            periodSeconds: 10
</code></pre>
</div>

<h2>Service + Ingress</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — service.yaml + ingress.yaml</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">---
apiVersion: v1
kind: Service
metadata:
  name: php-app-svc
spec:
  selector:
    app: php-app
  ports:
    - port: 80
      targetPort: 9000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: php-app-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:...
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: php-app-svc
                port:
                  number: 80
</code></pre>
</div>

<h2>Horizontal Pod Autoscaler</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — hpa.yaml</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: php-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: php-app
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70  # scale when avg CPU > 70%
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Readiness probe: под получает трафик только когда готов; liveness probe: перезапускает под, если он нездоров</li>
    <li>Requests: используются для планирования; limits: применяются во время выполнения (CPU ограничивается, memory вызывает OOMKilled)</li>
    <li>Rolling update: maxUnavailable=1 + maxSurge=1 = развёртывание без простоя с постепенным переключением</li>
    <li>ConfigMap: нечувствительные переменные окружения; Secret: чувствительные значения (в кодировке base64, используйте AWS Secrets Manager CSI driver для production)</li>
    <li>HPA требует metrics-server; для пользовательских метрик используйте KEDA (Kubernetes Event-Driven Autoscaling)</li>
  </ul>
</div>
`,
  },
  kubernetes: {
    body: `
<h2>Архитектура Kubernetes</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Control plane + worker nodes</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">Control Plane (managed by EKS/GKE):
  ├── API Server      — single entry point for all K8s operations
  ├── etcd            — distributed key-value store (cluster state)
  ├── Scheduler       — assigns pods to nodes
  └── Controller Mgr  — reconciles desired vs actual state (ReplicaSet, Deployment...)

Worker Nodes:
  ├── kubelet         — agent on each node, runs pods
  ├── kube-proxy      — network rules (Service routing)
  └── Container runtime (containerd, Docker)
</code></pre>
</div>

<h2>Основные манифесты</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — ConfigMap + Secret</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">apiVersion: v1
kind: ConfigMap
metadata:
  name: php-app-config
  namespace: production
data:
  APP_ENV: "production"
  APP_URL: "https://api.example.com"
  CACHE_DRIVER: "redis"

---
apiVersion: v1
kind: Secret
metadata:
  name: php-app-secrets
  namespace: production
type: Opaque
data:
  DB_PASSWORD: c2VjcmV0MTIz   # base64 encoded: echo -n 'secret123' | base64
  JWT_SECRET: bXlqd3RzZWNyZXQ=
# In production: use AWS Secrets Manager CSI Driver or External Secrets Operator
# instead of storing secrets in YAML files (which get committed to git)
</code></pre>
</div>

<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — Full Deployment</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">apiVersion: apps/v1
kind: Deployment
metadata:
  name: php-app
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: php-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    metadata:
      labels:
        app: php-app
    spec:
      serviceAccountName: php-app-sa
      containers:
        - name: php-app
          image: 123456789.dkr.ecr.eu-west-1.amazonaws.com/my-app:v1.2.3
          ports:
            - containerPort: 9000
          envFrom:
            - configMapRef:
                name: php-app-config
          env:
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: php-app-secrets
                  key: DB_PASSWORD
          resources:
            requests:
              cpu: "250m"     # 0.25 vCPU — used for scheduling
              memory: "256Mi" # guaranteed allocation
            limits:
              cpu: "500m"     # throttled if exceeded (not killed)
              memory: "512Mi" # OOMKilled if exceeded
          readinessProbe:
            httpGet: { path: /health, port: 9000 }
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /health, port: 9000 }
            initialDelaySeconds: 30
            periodSeconds: 10
</code></pre>
</div>

<h2>Основные команды kubectl</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash — Debugging toolkit</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># View resources
kubectl get pods -n production
kubectl get pods -n production -o wide        # show node assignment
kubectl describe pod php-app-7d4f8c-xk2p9 -n production  # events, conditions

# Logs
kubectl logs php-app-7d4f8c-xk2p9 -n production
kubectl logs php-app-7d4f8c-xk2p9 -n production --previous  # crashed container
kubectl logs -l app=php-app -n production --tail=100         # all pods by label

# Exec into a pod
kubectl exec -it php-app-7d4f8c-xk2p9 -n production -- /bin/sh

# Apply manifests
kubectl apply -f deployment.yaml
kubectl apply -f k8s/                  # apply entire directory

# Rollout management
kubectl rollout status deployment/php-app -n production
kubectl rollout history deployment/php-app -n production
kubectl rollout undo deployment/php-app -n production  # rollback

# Port-forward for local debugging
kubectl port-forward pod/php-app-7d4f8c-xk2p9 8080:9000 -n production
</code></pre>
</div>

<h2>RBAC — ServiceAccount</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — Minimal RBAC for a PHP app</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">apiVersion: v1
kind: ServiceAccount
metadata:
  name: php-app-sa
  namespace: production
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456:role/php-app-role  # IRSA: maps to AWS IAM role
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: php-app-role
  namespace: production
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list"]  # read-only config access
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: php-app-rolebinding
  namespace: production
subjects:
  - kind: ServiceAccount
    name: php-app-sa
roleRef:
  kind: Role
  name: php-app-role
  apiGroup: rbac.authorization.k8s.io
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Requests: минимально гарантированный ресурс; Limits: максимально допустимый — CPU ограничивается, memory вызывает OOMKilled</li>
    <li>Readiness probe: под получает трафик только когда готов; Liveness probe: перезапускает под, если он нездоров</li>
    <li>Rolling update: maxUnavailable + maxSurge определяют, сколько подов заменяется одновременно</li>
    <li>Никогда не храните секреты в base64 в YAML-файлах, коммитируемых в git — используйте External Secrets Operator или CSI driver</li>
    <li>IRSA (IAM Roles for Service Accounts): сопоставляет K8s ServiceAccount с AWS IAM role — никаких учётных данных на подах</li>
  </ul>
</div>
`,
  },
  'github-actions': {
    body: `
<h2>Ключевые концепции</h2>
<ul>
  <li><strong>Workflow (Рабочий процесс):</strong> YAML-файл в <code>.github/workflows/</code>. Запускается событиями (push, PR, расписание).</li>
  <li><strong>Job (Задание):</strong> Группа шагов, выполняемых на одном runner. По умолчанию задания выполняются параллельно.</li>
  <li><strong>Step (Шаг):</strong> Отдельная задача — выполнить команду или использовать готовый action.</li>
  <li><strong>Runner (Исполнитель):</strong> Машина, на которой выполняются задания. GitHub предоставляет ubuntu-latest, windows-latest, macos-latest.</li>
  <li><strong>Action (Действие):</strong> Переиспользуемая единица работы — <code>actions/checkout</code>, <code>aws-actions/configure-aws-credentials</code>.</li>
</ul>

<h2>Полный CI-конвейер PHP/Laravel</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">yaml — .github/workflows/ci.yml</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AWS_REGION: eu-west-1
  ECR_REPOSITORY: my-app

jobs:
  # ── JOB 1: Tests & Code Quality ─────────────────────────────
  test:
    name: Tests (PHP \${{ matrix.php }})
    runs-on: ubuntu-latest
    strategy:
      matrix:
        php: ['8.2', '8.3']  # test across multiple PHP versions

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: secret
          MYSQL_DATABASE: testing
        options: --health-cmd="mysqladmin ping" --health-interval=10s

      redis:
        image: redis:7-alpine
        options: --health-cmd="redis-cli ping"

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ matrix.php }}
          extensions: pdo_mysql, redis, gd, zip
          coverage: xdebug

      - name: Cache Composer dependencies
        uses: actions/cache@v4
        with:
          path: vendor
          key: composer-\${{ hashFiles('composer.lock') }}

      - name: Install dependencies
        run: composer install --no-interaction --prefer-dist

      - name: Copy .env
        run: cp .env.testing .env

      - name: Generate key
        run: php artisan key:generate

      - name: Run PHPStan
        run: vendor/bin/phpstan analyse --level=8

      - name: Run PHP CS Fixer
        run: vendor/bin/php-cs-fixer fix --dry-run --diff

      - name: Run tests
        run: vendor/bin/pest --coverage --coverage-clover coverage.xml
        env:
          DB_HOST: 127.0.0.1
          REDIS_HOST: 127.0.0.1

  # ── JOB 2: Build & Push Docker Image ────────────────────────
  build:
    name: Build & Push to ECR
    runs-on: ubuntu-latest
    needs: test              # only runs if tests pass
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: \${{ env.AWS_REGION }}

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            \${{ steps.login-ecr.outputs.registry }}/\${{ env.ECR_REPOSITORY }}:\${{ github.sha }}
            \${{ steps.login-ecr.outputs.registry }}/\${{ env.ECR_REPOSITORY }}:latest
          cache-from: type=gha      # use GitHub Actions cache for Docker layers
          cache-to: type=gha,mode=max

  # ── JOB 3: Deploy to ECS ────────────────────────────────────
  deploy:
    name: Deploy to ECS
    runs-on: ubuntu-latest
    needs: build
    environment: production    # requires manual approval if configured

    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: \${{ env.AWS_REGION }}

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster my-cluster \
            --service my-app-service \
            --force-new-deployment
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Управление секретами</div>
  <p>Храните все учётные данные в GitHub Settings → Secrets. Обращайтесь к ним как <code>\${{ secrets.MY_SECRET }}</code>. Секреты скрываются в логах. Никогда не вписывайте API-ключи, пароли или AWS-учётные данные прямо в YAML рабочего процесса — они навсегда останутся видимыми в истории git.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Workflow = YAML-файл в .github/workflows/. Запускается git-событиями.</li>
    <li>Задания по умолчанию выполняются параллельно. Используйте <code>needs:</code> для создания зависимостей.</li>
    <li>Matrix builds: одновременное тестирование на нескольких версиях PHP/Node</li>
    <li>Всегда кэшируйте: директорию vendor Composer, слои Docker-сборки</li>
    <li>Используйте <code>environment: production</code> для требования ручного подтверждения перед деплоем</li>
    <li>Secrets: хранятся в GitHub Settings, доступны как \${{ secrets.NAME }}, скрываются в логах</li>
    <li>Рабочие процессы Pull Request: запускайте тесты при каждом PR. Деплой — только при слиянии в main.</li>
  </ul>
</div>
`,
  },
}

export default ruBodiesP6b
