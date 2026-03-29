import type { ILessonLocale } from '@/modules/course/interfaces/ILessonLocale.ts'

const ruBodiesP6a: Record<string, ILessonLocale> = {
  'aws-core': {
    body: `
<h2>Глобальная инфраструктура AWS</h2>
<ul>
  <li><strong>Регион (Region):</strong> Географическая область с несколькими изолированными центрами обработки данных. Примеры: eu-west-1 (Ирландия), us-east-1 (Северная Вирджиния). Выбирайте регион близко к вашим пользователям, чтобы минимизировать задержку.</li>
  <li><strong>Зона доступности (AZ):</strong> Один или несколько отдельных центров обработки данных внутри региона с резервированием питания, сети и каналов связи. eu-west-1 содержит 3 AZ: eu-west-1a, eu-west-1b, eu-west-1c.</li>
  <li><strong>Граничный узел (Edge Location):</strong> Конечные точки CDN CloudFront. Более 400 по всему миру. Кэшируют статический контент ближе к пользователям.</li>
</ul>
<p><strong>Зачем нужно несколько зон доступности?</strong> Если вы развёртываете приложение в двух AZ, отказ одного центра обработки данных не выведет его из строя. Это основа высокой доступности в AWS.</p>

<h2>IAM — Identity & Access Management</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">IAM — Core Concepts</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># IAM User — a person or service with long-term credentials (access key + secret)
# Use for: developers needing CLI access, CI/CD systems (if no better option)
# DON'T use for: EC2, Lambda, ECS — use roles instead

# IAM Group — collection of users with same permissions
# Example: "developers" group → attach AdministratorAccess policy

# IAM Role — temporary credentials assumed by AWS services or users
# No long-term credentials. Automatically rotated.
# Use for: EC2 accessing S3, Lambda reading DynamoDB, ECS tasks, cross-account

# IAM Policy — JSON document defining what actions are allowed/denied
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-app-uploads/*"
    }
  ]
}

# Attach a policy to a role using AWS CLI:
aws iam attach-role-policy \
  --role-name my-app-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
</code></pre>
</div>

<h2>Лучшие практики IAM</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">IAM — Best Practices</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># 1. ROOT ACCOUNT: protect with MFA, never use for daily work
#    Root = unlimited power, no restrictions
#    Create an IAM admin user for daily use instead

# 2. LEAST PRIVILEGE: grant only what is needed
#    Bad: AttachPolicy AmazonS3FullAccess (access to ALL buckets)
#    Good: Custom policy allowing GetObject only on specific bucket

# 3. ROLES OVER KEYS for AWS services
#    EC2 instance profile (role) → auto-rotating credentials
#    vs access key in .env → never rotated, can be leaked

# 4. MFA on all IAM users that have console access

# 5. NEVER commit AWS credentials to git
#    Use environment variables, Secrets Manager, or IAM roles

# 6. AUDIT: use CloudTrail to log all API calls

# Create an EC2 instance profile (role for EC2):
aws iam create-role \
  --role-name my-ec2-role \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Principal":{"Service":"ec2.amazonaws.com"},
      "Action":"sts:AssumeRole"
    }]
  }'

# Attach permissions to the role:
aws iam attach-role-policy \
  --role-name my-ec2-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

# Create instance profile and add role:
aws iam create-instance-profile --instance-profile-name my-ec2-profile
aws iam add-role-to-instance-profile \
  --instance-profile-name my-ec2-profile \
  --role-name my-ec2-role
</code></pre>
</div>

<h2>Модель разделённой ответственности</h2>
<p>AWS и клиенты совместно несут ответственность за безопасность — однако разграничение зависит от типа сервиса:</p>
<ul>
  <li><strong>AWS отвечает за:</strong> Безопасность облака — оборудование, центры обработки данных, сетевую инфраструктуру, гипервизор и программное обеспечение управляемых сервисов.</li>
  <li><strong>Вы отвечаете за:</strong> Безопасность в облаке — обновление ОС (EC2), безопасность приложений, права IAM, шифрование данных, сетевую конфигурацию, правила брандмауэра.</li>
</ul>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Регион = географическая область. AZ = изолированный центр обработки данных внутри региона. Развёртывайте в 2+ AZ для высокой доступности.</li>
    <li>IAM User = долгосрочные учётные данные. IAM Role = временные учётные данные для сервисов.</li>
    <li>Всегда используйте роли для сервисов AWS (EC2, Lambda, ECS) — никогда не размещайте ключи доступа в конфигурационных файлах</li>
    <li>Минимальные привилегии: предоставляйте только конкретные действия и ресурсы, которые действительно необходимы</li>
    <li>Root-аккаунт: включите MFA, не используйте для повседневной работы</li>
    <li>Разделённая ответственность: AWS обеспечивает безопасность инфраструктуры; вы обеспечиваете безопасность своего приложения и данных</li>
  </ul>
</div>
`,
  },
  'aws-ec2-s3': {
    body: `
<h2>Ключевые концепции EC2</h2>
<table class="ctable">
  <thead><tr><th>Концепция</th><th>Описание</th></tr></thead>
  <tbody>
    <tr><td>Тип инстанса</td><td>t3.micro (2vCPU, 1GB) → c7g.xlarge (4vCPU, 8GB) — выбирайте исходя из нагрузки</td></tr>
    <tr><td>AMI</td><td>Amazon Machine Image — базовый снимок ОС; Amazon Linux 2023, Ubuntu 22.04</td></tr>
    <tr><td>Группа безопасности</td><td>Stateful-брандмауэр на уровне инстанса — правила входящего/исходящего трафика</td></tr>
    <tr><td>Пара ключей</td><td>SSH-ключ для первоначального доступа — отключите аутентификацию по паролю, вместо этого используйте SSM Session Manager</td></tr>
    <tr><td>IAM роль/профиль</td><td>Предоставляет EC2 доступ к сервисам AWS — никогда не размещайте ключи доступа на EC2</td></tr>
    <tr><td>Том EBS</td><td>Блочное хранилище, подключённое к инстансу; независимо от жизненного цикла инстанса</td></tr>
  </tbody>
</table>

<h2>Запуск EC2 через Terraform</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_iam_role" "ec2" {
  name = "my-app-ec2-role"
  assume_role_policy = jsonencode({
    Statement = [{ Action = "sts:AssumeRole", Effect = "Allow",
      Principal = { Service = "ec2.amazonaws.com" } }]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "my-app-ec2-profile"
  role = aws_iam_role.ec2.name
}

resource "aws_instance" "app" {
  ami                  = "ami-0c55b159cbfafe1f0" # Amazon Linux 2023
  instance_type        = "t3.small"
  subnet_id            = aws_subnet.private[0].id
  iam_instance_profile = aws_iam_instance_profile.ec2.name
  vpc_security_group_ids = [aws_security_group.app.id]

  user_data = filebase64("scripts/bootstrap.sh")

  tags = { Name = "my-app" }
}
</code></pre>
</div>

<h2>Бакет S3 с политиками</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL — Secure S3 bucket</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_s3_bucket" "media" {
  bucket = "my-app-media-uploads"
}

resource "aws_s3_bucket_public_access_block" "media" {
  bucket                  = aws_s3_bucket.media.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_lifecycle_configuration" "media" {
  bucket = aws_s3_bucket.media.id
  rule {
    id     = "archive-old"
    status = "Enabled"
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }
}
</code></pre>
</div>

<h2>Предподписанные URL в PHP</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel S3 presigned URL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Aws\S3\S3Client;

// Upload directly from browser to S3 (no server proxy needed)
function generateUploadUrl(string $key): string {
    $s3 = new S3Client(['region' => 'eu-west-1', 'version' => 'latest']);

    $cmd = $s3->getCommand('PutObject', [
        'Bucket'      => config('filesystems.disks.s3.bucket'),
        'Key'         => $key,
        'ContentType' => 'image/jpeg',
    ]);

    return (string) $s3->createPresignedRequest($cmd, '+15 minutes')->getUri();
}

// Generate download URL (time-limited read access)
$url = Storage::disk('s3')->temporaryUrl(
    'uploads/user-123/avatar.jpg',
    now()->addMinutes(30)
);
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Используйте профили инстансов IAM на EC2 — никогда не размещайте ключи доступа AWS в файле .env на EC2-инстансах</li>
    <li>Блокируйте весь публичный доступ к S3 по умолчанию — используйте предподписанные URL для временного доступа</li>
    <li>Версионирование S3: защищает от случайного удаления, позволяет восстановить данные на определённый момент времени</li>
    <li>Политики жизненного цикла: автоматически переводите старые объекты в Glacier (холодное хранилище) для экономии средств</li>
    <li>Группы безопасности: запрет по умолчанию — явно открывайте только необходимые порты (80, 443 входящий; 5432 для RDS)</li>
  </ul>
</div>
`,
  },
  'aws-ecs': {
    body: `
<h2>Архитектура ECS</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Architecture overview</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">Internet
  ↓
ALB (Application Load Balancer)
  ↓
ECS Service (desired: 3 tasks)
  ├── Task 1 (Fargate) — your PHP container
  ├── Task 2 (Fargate)
  └── Task 3 (Fargate)
       ↓
  RDS (private subnet)
  Redis (ElastiCache)
</code></pre>
</div>

<h2>Определение задачи (Terraform)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_ecs_task_definition" "app" {
  family                   = "my-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512   # 0.5 vCPU
  memory                   = 1024  # 1 GB

  execution_role_arn = aws_iam_role.ecs_execution.arn  # pull image, write logs
  task_role_arn      = aws_iam_role.ecs_task.arn       # app permissions (S3, SQS, etc.)

  container_definitions = jsonencode([{
    name  = "php-app"
    image = "\${var.ecr_repo_url}:latest"
    portMappings = [{ containerPort = 9000 }]

    environment = [
      { name = "APP_ENV", value = "production" }
    ]

    secrets = [
      { name = "DB_PASSWORD",   valueFrom = aws_secretsmanager_secret.db.arn },
      { name = "REDIS_PASSWORD", valueFrom = aws_secretsmanager_secret.redis.arn }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"  = "/ecs/my-app"
        "awslogs-region" = var.aws_region
        "awslogs-stream-prefix" = "php"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
  }])
}
</code></pre>
</div>

<h2>Сервис ECS с автомасштабированием</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_ecs_service" "app" {
  name            = "my-app"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 3
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "php-app"
    container_port   = 9000
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
}

# Auto scaling
resource "aws_appautoscaling_target" "ecs" {
  resource_id        = "service/\${aws_ecs_cluster.main.name}/\${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
  min_capacity       = 2
  max_capacity       = 20
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "cpu-scaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace
  policy_type        = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    target_value = 70  # scale when CPU > 70%
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}
</code></pre>
</div>

<h2>Деплой через CI/CD</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash — GitHub Actions deploy</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin $ECR_URL
docker build -t $ECR_URL:$GITHUB_SHA .
docker push $ECR_URL:$GITHUB_SHA

# Update task definition with new image tag
aws ecs update-service \
  --cluster my-cluster \
  --service my-app \
  --force-new-deployment

# Wait for deployment to stabilize
aws ecs wait services-stable --cluster my-cluster --services my-app
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Определение задачи = спецификация контейнера (образ, CPU, память, переменные окружения, секреты, порты)</li>
    <li>Сервис ECS поддерживает желаемое количество задач, проверки работоспособности и скользящее обновление</li>
    <li>Используйте Secrets Manager (не переменные окружения) для чувствительных данных — ECS внедряет их во время выполнения</li>
    <li>Две IAM роли: execution role (разрешения агента ECS) и task role (разрешения приложения)</li>
    <li>Автомасштабирование: отслеживание цели (CPU/память) или ступенчатое масштабирование (пользовательская метрика)</li>
  </ul>
</div>
`,
  },
  'aws-lambda': {
    body: `
<h2>Модель выполнения Lambda</h2>
<table class="ctable">
  <thead><tr><th>Параметр</th><th>Значение / Примечания</th></tr></thead>
  <tbody>
    <tr><td>Максимальный таймаут</td><td>15 минут</td></tr>
    <tr><td>Память</td><td>128MB – 10GB; CPU масштабируется линейно вместе с памятью</td></tr>
    <tr><td>Холодный старт</td><td>~100мс–1с при первом вызове; уменьшайте с помощью provisioned concurrency</td></tr>
    <tr><td>Параллелизм</td><td>До 1000 одновременных выполнений по умолчанию (можно увеличить)</td></tr>
    <tr><td>Временное хранилище</td><td>/tmp до 10GB</td></tr>
    <tr><td>Стоимость</td><td>$0.20/миллион запросов + $0.0000166667/GB-секунда</td></tr>
  </tbody>
</table>

<h2>PHP на Lambda с Bref</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">composer require bref/bref
vendor/bin/bref init
</code></pre>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — serverless.yml (Serverless Framework)</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">service: my-php-app
provider:
  name: aws
  region: eu-west-1
  runtime: provided.al2

plugins:
  - ./vendor/bref/bref

functions:
  # HTTP function — API Gateway triggers
  api:
    handler: public/index.php
    layers:
      - arn:aws:lambda:eu-west-1:534081306603:layer:php-82-fpm:63
    events:
      - httpApi:
          path: /{proxy+}
          method: any

  # Worker function — SQS triggers
  worker:
    handler: worker.php
    layers:
      - arn:aws:lambda:eu-west-1:534081306603:layer:php-82:63
    events:
      - sqs:
          arn: !GetAtt MyQueue.Arn
          batchSize: 10

  # Cron job — EventBridge triggers
  cron:
    handler: cron.php
    layers:
      - arn:aws:lambda:eu-west-1:534081306603:layer:php-82:63
    events:
      - schedule: rate(1 hour)
</code></pre>
</div>

<h2>Обработчик Lambda</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — worker.php</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">require __DIR__ . '/vendor/autoload.php';

use Bref\Context\Context;

return function (array $event, Context $context): void {
    // SQS event: $event['Records'] contains array of messages
    foreach ($event['Records'] as $record) {
        $body = json_decode($record['body'], true);
        processJob($body);
        // Bref automatically deletes successfully processed messages from SQS
    }
};
</code></pre>
</div>

<h2>Provisioned Concurrency (устранение холодного старта)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">functions:
  api:
    handler: public/index.php
    provisionedConcurrency: 5  # Keep 5 warm instances; eliminates cold starts
    # Cost: you pay for these 5 instances 24/7
    # Only for latency-sensitive endpoints (< 100ms response requirement)
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Когда использовать Lambda, а когда ECS</div>
  <p><strong>Lambda</strong>: событийно-ориентированная обработка, переменная нагрузка, кратковременные задачи (&lt;15мин), важность масштабирования до нуля (снижение стоимости dev/staging). <strong>ECS Fargate</strong>: долго работающие HTTP-серверы, WebSocket-соединения, обработка &gt;15мин, стабильная нагрузка. Холодный старт PHP в Lambda составляет ~300мс с Bref — приемлемо для большинства API-вызовов, но избегайте для требований с задержкой менее 100мс без provisioned concurrency.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Lambda: оплата за вызов + длительность — идеально для событийно-ориентированных и переменных нагрузок</li>
    <li>Bref: среда выполнения PHP для Lambda — поддерживает HTTP (режим FPM) и CLI (обработчик событий)</li>
    <li>Холодный старт: первый вызов инициализирует контейнер — ~300мс для PHP; используйте provisioned concurrency для чувствительных к задержке API</li>
    <li>Память = CPU: увеличение с 512MB до 1024MB вдвое сокращает время выполнения — зачастую дешевле, несмотря на более высокую стоимость в мс</li>
    <li>Lambda Layers: позволяют совместно использовать среду выполнения PHP и зависимости vendor между несколькими функциями</li>
  </ul>
</div>
`,
  },
  'aws-cloudwatch': {
    body: `
<h2>Группы логов и срок хранения</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL — Terraform CloudWatch log group</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/my-app"
  retention_in_days = 30  # don't keep logs forever — costs add up
  kms_key_id        = aws_kms_key.logs.arn  # encrypt at rest
}

resource "aws_cloudwatch_log_group" "nginx" {
  name              = "/ecs/my-app/nginx"
  retention_in_days = 7
}
</code></pre>
</div>

<h2>Алармы CloudWatch</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL — Error rate and latency alarms</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_cloudwatch_metric_alarm" "error_rate" {
  alarm_name          = "my-app-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5XXError"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10  # more than 10 errors per minute
  alarm_description   = "High 5xx error rate on ALB"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
  }
}

resource "aws_cloudwatch_metric_alarm" "p99_latency" {
  alarm_name          = "my-app-high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  extended_statistic  = "p99"
  threshold           = 0.5  # 500ms
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
</code></pre>
</div>

<h2>Запросы CloudWatch Logs Insights</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">CloudWatch Insights — Common queries</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Find all errors in last hour
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100

# Top 10 slowest API endpoints
fields @timestamp, request_path, duration_ms
| filter duration_ms > 0
| stats avg(duration_ms) as avg_ms, max(duration_ms) as max_ms, count() as hits
    by request_path
| sort avg_ms desc
| limit 10

# 5xx errors grouped by status code
fields @timestamp, status_code
| filter status_code >= 500
| stats count() as error_count by status_code, bin(5m) as time_bucket
| sort time_bucket desc
</code></pre>
</div>

<h2>Пользовательские метрики из PHP (EMF)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Embedded Metric Format</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Emit custom metric by writing structured JSON to stdout (CloudWatch Agent parses it)
function emitMetric(string $name, float $value, string $unit = 'Count'): void {
    $emf = [
        '_aws' => [
            'Timestamp'  => (int)(microtime(true) * 1000),
            'CloudWatchMetrics' => [[
                'Namespace'  => 'MyApp',
                'Dimensions' => [['Service', 'Environment']],
                'Metrics'    => [['Name' => $name, 'Unit' => $unit]],
            ]],
        ],
        'Service'     => 'order-service',
        'Environment' => config('app.env'),
        $name         => $value,
    ];
    error_log(json_encode($emf)); // writes to CloudWatch Logs → auto extracted as metric
}

emitMetric('OrdersCreated', 1);
emitMetric('PaymentDuration', $durationMs, 'Milliseconds');
emitMetric('CartAbandoned',   1);
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Устанавливайте срок хранения логов — неуправляемые группы логов накапливаются и стоят денег</li>
    <li>Создавайте алармы для 4 золотых сигналов: задержка, трафик, ошибки, насыщение</li>
    <li>CloudWatch Logs Insights: структурированные JSON-логи позволяют выполнять мощные агрегирующие запросы</li>
    <li>EMF: записывайте JSON с _aws.CloudWatchMetrics в stdout — CloudWatch автоматически извлекает их как метрики</li>
    <li>Container Insights: включите для каждого кластера, чтобы получать метрики CPU, памяти и сети ECS на уровне задач</li>
  </ul>
</div>
`,
  },
  'aws-sqs-sns': {
    body: `
<h2>Типы очередей SQS</h2>
<table class="ctable">
  <thead><tr><th>Функция</th><th>Стандартная очередь</th><th>FIFO-очередь</th></tr></thead>
  <tbody>
    <tr><td>Порядок</td><td>Наилучший (не гарантирован)</td><td>Строгий порядок внутри группы</td></tr>
    <tr><td>Доставка</td><td>Не менее одного раза (возможны дубликаты)</td><td>Обработка ровно один раз</td></tr>
    <tr><td>Пропускная способность</td><td>Неограниченная (практически)</td><td>3000 сообщений/с с пакетной обработкой</td></tr>
    <tr><td>Сценарий использования</td><td>Электронная почта, фоновые задачи, уведомления</td><td>Финансовые транзакции, обработка заказов</td></tr>
  </tbody>
</table>

<h2>Terraform: SQS + SNS Fan-out</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_sns_topic" "order_placed" {
  name = "order-placed"
}

resource "aws_sqs_queue" "email_queue" {
  name                       = "order-emails"
  visibility_timeout_seconds = 300  # Must be >= your job timeout
  message_retention_seconds  = 86400 # 1 day

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.email_dlq.arn
    maxReceiveCount     = 3  # Retry 3 times before sending to DLQ
  })
}

resource "aws_sqs_queue" "email_dlq" {
  name                      = "order-emails-dlq"
  message_retention_seconds = 1209600 # 14 days — time to investigate
}

resource "aws_sqs_queue" "inventory_queue" {
  name                       = "order-inventory"
  visibility_timeout_seconds = 120
}

# Subscribe both queues to the SNS topic
resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.order_placed.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.email_queue.arn
}

resource "aws_sns_topic_subscription" "inventory" {
  topic_arn = aws_sns_topic.order_placed.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.inventory_queue.arn
}
</code></pre>
</div>

<h2>Объяснение таймаута видимости</h2>
<div class="callout callout-warn">
  <div class="callout-title">Критично: правильно настраивайте таймаут видимости</div>
  <p>Когда потребитель читает сообщение, SQS скрывает его (таймаут видимости). Если сообщение не удалено до истечения таймаута, SQS делает его видимым снова для повторной попытки. Если ваша задача занимает 60с, а таймаут равен 30с, SQS повторно доставит сообщение другому воркеру → <strong>дублирующаяся обработка</strong>. Устанавливайте таймаут не менее 2× максимального времени выполнения задачи.</p>
</div>

<h2>Laravel + SQS</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — .env + job</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// .env
QUEUE_CONNECTION=sqs
AWS_DEFAULT_REGION=eu-west-1
SQS_PREFIX=https://sqs.eu-west-1.amazonaws.com/123456789012
SQS_QUEUE=my-default-queue

// Dispatch to specific queue
ProcessOrder::dispatch($order)->onQueue('orders');

// Run worker
// php artisan queue:work sqs --queue=orders --timeout=120

// ECS worker task: process SQS messages in a separate ECS service
// Scale worker tasks based on SQS queue depth (ApproximateNumberOfMessages)
</code></pre>
</div>

<h2>Масштабирование SQS с ECS</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL — Auto scale workers based on queue depth</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_appautoscaling_policy" "sqs_depth" {
  name        = "sqs-depth-scaling"
  policy_type = "TargetTrackingScaling"
  # ...
  target_tracking_scaling_policy_configuration {
    customized_metric_specification {
      metric_name = "ApproximateNumberOfMessages"
      namespace   = "AWS/SQS"
      statistic   = "Average"
      dimensions  = [{ name = "QueueName", value = "my-worker-queue" }]
    }
    target_value = 10  # scale to keep ~10 messages per worker
  }
}
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Стандартный SQS: не менее одного раза → делайте потребителей идемпотентными; FIFO: ровно один раз + по порядку</li>
    <li>Таймаут видимости должен быть больше максимального времени выполнения задачи — иначе возникает дублирующаяся обработка</li>
    <li>SNS fan-out: одна публикация → несколько очередей SQS → независимые потребители в своём темпе</li>
    <li>DLQ: сообщения, превысившие maxReceiveCount попыток, попадают сюда — отслеживайте глубину DLQ для алармов</li>
    <li>Масштабируйте ECS-воркеры на основе метрики SQS ApproximateNumberOfMessages</li>
  </ul>
</div>
`,
  },
  'aws-security': {
    body: `
<h2>AWS WAF — Межсетевой экран для веб-приложений</h2>
<p>AWS WAF работает на уровне 7 и проверяет HTTP/HTTPS-трафик до того, как он достигает вашего приложения. Он подключается к CloudFront, Application Load Balancer, API Gateway и AppSync. WAF оценивает запросы по <strong>Web ACL</strong>, состоящим из правил и групп правил.</p>

<p><strong>Типы правил:</strong></p>
<ul>
  <li><strong>Управляемые группы правил (Managed Rule Groups)</strong> — наборы правил, поддерживаемые AWS (например, <code>AWSManagedRulesCommonRuleSet</code>, <code>AWSManagedRulesSQLiRuleSet</code>). Автоматически обновляются AWS.</li>
  <li><strong>Пользовательские правила (Custom Rules)</strong> — сопоставление по IP-наборам, геолокации, строкам, регулярным выражениям, размеру запроса или телу JSON.</li>
  <li><strong>Правила на основе частоты (Rate-Based Rules)</strong> — блокировка IP-адреса после превышения N запросов в 5-минутном окне. Обязательны для защиты от брутфорс-атак и подбора учётных данных.</li>
  <li><strong>Группы правил (Rule Groups)</strong> — многократно используемые наборы правил, которыми можно делиться между несколькими Web ACL.</li>
</ul>

<p>Каждое правило имеет действие: <strong>Allow</strong> (разрешить), <strong>Block</strong> (заблокировать) или <strong>Count</strong> (подсчитать; полезно для тестирования перед применением). Правила оцениваются в порядке приоритета; первое совпадение побеждает.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">json</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-json">{
  "Name": "RateLimitLoginEndpoint",
  "Priority": 1,
  "Action": { "Block": {} },
  "Statement": {
    "RateBasedStatement": {
      "Limit": 100,
      "AggregateKeyType": "IP",
      "ScopeDownStatement": {
        "ByteMatchStatement": {
          "SearchString": "/api/login",
          "FieldToMatch": { "UriPath": {} },
          "TextTransformations": [{ "Priority": 0, "Type": "NONE" }],
          "PositionalConstraint": "STARTS_WITH"
        }
      }
    }
  },
  "VisibilityConfig": {
    "SampledRequestsEnabled": true,
    "CloudWatchMetricsEnabled": true,
    "MetricName": "RateLimitLogin"
  }
}
</code></pre>
</div>

<div class="callout callout-info">
  <div class="callout-title">Модель ценообразования WAF</div>
  <p>WAF взимает плату за каждый Web ACL ($5/месяц), за каждое правило ($1/месяц) и за миллион запросов ($0.60). Управляемые группы правил добавляют $1–$20/месяц за группу. Всегда запускайте новые правила в режиме Count, чтобы оценить ложные срабатывания перед переключением в режим Block.</p>
</div>

<h2>AWS Shield — Защита от DDoS</h2>
<p>Shield защищает от объёмных и протокол-уровневых DDoS-атак.</p>
<ul>
  <li><strong>Shield Standard</strong> — Бесплатный, всегда активен. Защищает от распространённых атак уровня 3/4 (SYN-флуд, UDP-отражение). Автоматически применяется ко всем ресурсам AWS.</li>
  <li><strong>Shield Advanced</strong> — $3 000/месяц на организацию. Добавляет защиту от DDoS на уровне 7, доступ к команде реагирования AWS DDoS (DRT), защиту от расходов (кредиты за масштабирование, вызванное атакой), и почти в реальном времени видимость атак в CloudWatch.</li>
</ul>

<p>Shield Advanced оправдывает затраты только в том случае, если ваше приложение генерирует значительный доход и требует гарантий SLA во время атак. Для большинства производственных PHP-приложений достаточно Shield Standard + правил WAF на основе частоты запросов.</p>

<h2>Amazon GuardDuty — Интеллектуальное обнаружение угроз</h2>
<p>GuardDuty — это региональный сервис обнаружения угроз на базе машинного обучения. Он анализирует <strong>VPC Flow Logs</strong>, <strong>DNS-логи</strong>, <strong>события CloudTrail</strong>, а также (опционально) события данных S3 и аудит-логи EKS без необходимости явно включать эти логи.</p>

<p><strong>Категории обнаруженных угроз:</strong></p>
<ul>
  <li><code>Backdoor:EC2/C&amp;CActivity</code> — инстанс взаимодействует с известной инфраструктурой управления и контроля</li>
  <li><code>CryptoCurrency:EC2/BitcoinTool</code> — активность по майнингу криптовалюты</li>
  <li><code>UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B</code> — успешный вход в консоль из необычной геолокации</li>
  <li><code>Recon:EC2/PortProbeUnprotectedPort</code> — внешнее сканирование портов</li>
  <li><code>Trojan:EC2/DNSDataExfiltration</code> — утечка данных через DNS</li>
</ul>

<p>Обнаруженным угрозам присваивается степень серьёзности (Low/Medium/High) и они передаются в EventBridge, что позволяет автоматизировать реагирование: изолировать EC2-инстанс, отозвать учётные данные IAM или уведомить дежурного через SNS.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">yaml</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml"># EventBridge rule to auto-isolate on HIGH GuardDuty finding
Resources:
  GuardDutyHighFindingRule:
    Type: AWS::Events::Rule
    Properties:
      EventPattern:
        source: [aws.guardduty]
        detail-type: [GuardDuty Finding]
        detail:
          severity: [{ numeric: [">=", 7] }]
      Targets:
        - Arn: !GetAtt RemediationLambda.Arn
          Id: IsolateInstance

  RemediationLambdaPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref RemediationLambda
      Action: lambda:InvokeFunction
      Principal: events.amazonaws.com
      SourceArn: !GetAtt GuardDutyHighFindingRule.Arn
</code></pre>
</div>

<h2>AWS Security Hub</h2>
<p>Security Hub агрегирует обнаруженные угрозы из GuardDuty, Inspector, Macie, Firewall Manager и сторонних инструментов в единой панели управления. Он оценивает ваш аккаунт по стандартам безопасности: <strong>AWS Foundational Security Best Practices</strong>, <strong>CIS AWS Foundations Benchmark</strong> и <strong>PCI DSS</strong>.</p>

<p>Каждая проверка контроля даёт результат: пройдена/не пройдена. Проваленные контроли приоритизируются по степени серьёзности. Security Hub использует формат ASFF (Amazon Security Finding Format), поэтому все обнаруженные угрозы имеют единую схему. Агрегация между аккаунтами через делегированный аккаунт администратора даёт видимость всей организации в одном месте.</p>

<div class="callout callout-info">
  <div class="callout-title">Сначала включите Security Hub</div>
  <p>Security Hub необходимо включать для каждого региона. Включите его во всех регионах, где у вас есть рабочие нагрузки, затем настройте центральный регион агрегации. Без этого вы пропустите угрозы, обнаруженные для ресурсов в неосновных регионах.</p>
</div>

<h2>Лучшие практики IAM</h2>
<p>Ошибки IAM — наиболее распространённая причина взлома AWS-аккаунтов. Старшие инженеры должны систематически соблюдать следующие правила:</p>
<ul>
  <li><strong>Не использовать root-аккаунт</strong> — Заблокируйте root-аккаунт с помощью MFA. Используйте его только для создания первого администраторского пользователя и для задач биллинга. Настройте CloudWatch-аларм для событий CloudTrail при входе под root.</li>
  <li><strong>Минимальные привилегии</strong> — Предоставляйте только те действия и ресурсы, которые действительно необходимы. Используйте <code>aws iam simulate-principal-policy</code> для проверки эффективных прав.</li>
  <li><strong>Границы разрешений (Permission boundaries)</strong> — Предотвращайте эскалацию привилегий в многокомандных средах, ограничивая максимальные разрешения независимо от того, какие политики прикреплены.</li>
  <li><strong>Политики управления сервисами (SCP)</strong> — На уровне AWS Organizations SCP действуют как ограничители, которые не могут быть переопределены политиками на уровне аккаунта.</li>
  <li><strong>Никаких долгоживущих ключей доступа</strong> — Используйте IAM-роли для EC2, Lambda и ECS-задач. Для доступа людей используйте AWS SSO / IAM Identity Center с временными учётными данными.</li>
  <li><strong>MFA для всех пользователей IAM</strong> — Применяйте через условие политики, требующее <code>aws:MultiFactorAuthPresent: true</code> для чувствительных действий.</li>
</ul>

<div class="code-block">
<div class="code-header"><span class="code-lang">json</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-json">{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyWithoutMFA",
      "Effect": "Deny",
      "NotAction": [
        "iam:CreateVirtualMFADevice",
        "iam:EnableMFADevice",
        "iam:GetUser",
        "iam:ListMFADevices",
        "sts:GetSessionToken"
      ],
      "Resource": "*",
      "Condition": {
        "BoolIfExists": {
          "aws:MultiFactorAuthPresent": "false"
        }
      }
    }
  ]
}
</code></pre>
</div>

<h2>Secrets Manager vs SSM Parameter Store</h2>
<p>Оба сервиса хранят чувствительную конфигурацию, но предназначены для разных задач:</p>

<table style="width:100%;border-collapse:collapse;margin:1rem 0;">
  <thead>
    <tr style="background:var(--surface-2,#f4f4f4)">
      <th style="padding:8px;text-align:left;border:1px solid var(--border,#ddd)">Функция</th>
      <th style="padding:8px;text-align:left;border:1px solid var(--border,#ddd)">Secrets Manager</th>
      <th style="padding:8px;text-align:left;border:1px solid var(--border,#ddd)">SSM Parameter Store</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Автоматическая ротация</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Да (встроенная для RDS, Redshift, DocumentDB)</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Нет (вручную или через Lambda)</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Стоимость</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">$0.40/секрет/месяц + $0.05/10 тыс. API-вызовов</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Бесплатно (Standard), $0.05/расширенный параметр/месяц</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Шифрование</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Всегда зашифровано KMS</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">SecureString использует KMS; String/StringList — открытый текст</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Совместный доступ между аккаунтами</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Да, через политику на основе ресурсов</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Нет</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Лучше подходит для</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Пароли баз данных, API-ключи, требующие ротации</td>
      <td style="padding:8px;border:1px solid var(--border,#ddd)">Конфигурация приложения, флаги функций, несекретные переменные</td>
    </tr>
  </tbody>
</table>

<p>В PHP-приложении извлекайте секреты во время выполнения (не во время сборки) и кэшируйте их на время жизни процесса, чтобы минимизировать количество API-вызовов. Используйте встроенное кэширование AWS SDK для Secrets Manager.</p>

<h2>Безопасность VPC: группы безопасности, NACL и Flow Logs</h2>
<p><strong>Группы безопасности (SG)</strong> — это stateful-брандмауэры на уровне инстанса. Если вы разрешаете входящий трафик, обратный трафик разрешается автоматически. Правила только разрешающие; явных правил запрета нет. Ссылайтесь на другие группы безопасности по ID, а не по CIDR-диапазонам, чтобы строить динамические отношения доверия (например, разрешать трафик только от группы безопасности ALB).</p>

<p><strong>Сетевые ACL (NACL)</strong> — это stateless-брандмауэры на уровне подсети. Вы должны определить как входящие, так и исходящие правила. Они оцениваются в порядке номеров правил, первое совпадение побеждает. NACL — правильный инструмент для блокировки конкретных IP-диапазонов на уровне подсети — например, для блокировки IP известного злоумышленника для всех ресурсов в подсети без изменения каждой группы безопасности.</p>

<p><strong>VPC Flow Logs</strong> фиксируют метаданные (не полезную нагрузку) об IP-трафике: исходный/целевой IP, порты, протокол, байты, действие (ACCEPT/REJECT) и время начала/окончания. Они публикуются в CloudWatch Logs или S3. Используйте их для:</p>
<ul>
  <li>Криминалистики после инцидента — восстановление того, какие IP-адреса подключались к скомпрометированному инстансу</li>
  <li>Проверки корректной работы правил групп безопасности (записи REJECT)</li>
  <li>Обнаружения неожиданных исходящих соединений (возможная утечка данных)</li>
</ul>

<div class="code-block">
<div class="code-header"><span class="code-lang">bash</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Enable VPC Flow Logs to S3 via AWS CLI
aws ec2 create-flow-logs \
  --resource-type VPC \
  --resource-ids vpc-0abc1234def567890 \
  --traffic-type ALL \
  --log-destination-type s3 \
  --log-destination arn:aws:s3:::my-vpc-flow-logs-bucket/flow-logs/ \
  --log-format '\${version} \${account-id} \${interface_id} \${srcaddr} \${dstaddr} \${srcport} \${dstport} \${protocol} \${packets} \${bytes} \${start} \${end} \${action} \${log-status}'

# Query Flow Logs with Athena (after creating table)
# Find all REJECT traffic to port 22
SELECT srcaddr, dstaddr, srcport, action, COUNT(*) as attempts
FROM vpc_flow_logs
WHERE dstport = 22 AND action = 'REJECT'
  AND date_partition = '2025/01/15'
GROUP BY srcaddr, dstaddr, srcport, action
ORDER BY attempts DESC
LIMIT 20;
</code></pre>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">В: В чём разница между группой безопасности и NACL и когда использовать каждую из них?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <p>Группы безопасности являются <strong>stateful</strong> и работают на уровне инстанса/ENI — они отслеживают состояние соединения, поэтому обратный трафик разрешается автоматически. NACL являются <strong>stateless</strong> и работают на уровне подсети — каждый пакет оценивается независимо, поэтому вам нужны явные правила и для входящего, и для исходящего трафика. Используйте группы безопасности как основной инструмент контроля (они более детализированы и проще в управлении). Используйте NACL для экстренной блокировки на уровне подсети — например, для отбрасывания трафика с известного вредоносного диапазона IP-адресов для всех ресурсов в подсети без изменения отдельных групп безопасности.</p>
  </div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">В: Когда следует использовать Secrets Manager вместо SSM Parameter Store?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <p>Используйте <strong>Secrets Manager</strong>, когда вам нужна автоматическая ротация (особенно для учётных данных RDS), совместный доступ к секретам между аккаунтами или детализированный журнал аудита доступа к секретам — и когда стоимость приемлема. Используйте <strong>SSM Parameter Store</strong> для значений конфигурации приложения, несекретных переменных окружения или запросов с высокой частотой, где важна стоимость (уровень Standard бесплатный). Для паролей баз данных в production встроенная ротация Secrets Manager значительно снижает риск взлома.</p>
  </div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">В: GuardDuty включён в вашем аккаунте. Вы получили угрозу CryptoCurrency:EC2/BitcoinTool. Каковы ваши следующие шаги?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <p>1. <strong>Немедленно изолируйте</strong> — измените группу безопасности инстанса, чтобы заблокировать весь входящий/исходящий трафик, кроме трафика к вашему криминалистическому бастиону. Не завершайте работу инстанса сразу — сохраните улики. 2. <strong>Создайте снимки томов EBS</strong> для криминалистического анализа. 3. <strong>Проверьте CloudTrail</strong> — как злоумышленник получил доступ? Ищите необычные API-вызовы, использование учётных данных или недавно созданных IAM-пользователей. 4. <strong>Ротируйте все учётные данные</strong>, к которым инстанс имел доступ (ключи доступа ролей профиля инстанса, если они долгоживущие, секреты Secrets Manager). 5. <strong>Завершите работу и замените</strong> инстанс из чистого AMI. 6. <strong>Разбор полётов</strong> — был ли AMI скомпрометирован? Была ли уязвима зависимость? Устраните вектор атаки перед повторным развёртыванием.</p>
  </div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Правила WAF оцениваются в порядке приоритета; всегда тестируйте новые правила в режиме Count перед переключением в режим Block.</li>
    <li>Shield Standard бесплатен и всегда активен; Shield Advanced ($3 тыс./месяц) оправдан только для высокодоходных приложений, подверженных DDoS.</li>
    <li>GuardDuty анализирует VPC Flow Logs, DNS и CloudTrail без необходимости вручную настраивать эти источники — достаточно его включить.</li>
    <li>Security Hub централизует угрозы из GuardDuty, Inspector, Macie и сторонних инструментов; используйте его для отслеживания соответствия стандартам CIS и AWS FSBP.</li>
    <li>Никогда не используйте root-аккаунт для повседневных операций; заблокируйте его с помощью MFA и настройте аларм на любое использование через CloudTrail.</li>
    <li>Secrets Manager обеспечивает автоматическую ротацию (критично для учётных данных баз данных); SSM Parameter Store дешевле для конфигурационных значений без ротации.</li>
    <li>Группы безопасности являются stateful (на уровне инстанса); NACL являются stateless (на уровне подсети). Используйте группы безопасности для основного контроля, NACL — для экстренной блокировки на уровне подсети.</li>
    <li>VPC Flow Logs фиксируют метаданные пакетов (не полезную нагрузку) и необходимы для криминалистики после инцидента и проверки корректной работы правил брандмауэра.</li>
  </ul>
</div>
`,
  },
  'aws-cert-saa': {
    body: `
<h2>Well-Architected Framework — 6 столпов</h2>
<table class="ctable">
  <thead><tr><th>Столп</th><th>Ключевые практики</th></tr></thead>
  <tbody>
    <tr><td>Операционное совершенство</td><td>IaC (CloudFormation/Terraform), CI/CD, runbook'и, наблюдаемость</td></tr>
    <tr><td>Безопасность</td><td>Минимальные привилегии IAM, шифрование в покое и в транзите, изоляция VPC, WAF</td></tr>
    <tr><td>Надёжность</td><td>Multi-AZ, автомасштабирование, проверки работоспособности, резервные копии, хаос-инжиниринг</td></tr>
    <tr><td>Производительность</td><td>Правильный подбор размера, CDN CloudFront, ElastiCache, реплики для чтения, Lambda</td></tr>
    <tr><td>Оптимизация затрат</td><td>Зарезервированные/Spot-инстансы, автомасштабирование вниз, жизненный цикл S3, бюджеты</td></tr>
    <tr><td>Устойчивость</td><td>Правильный подбор размера, управляемые сервисы, масштабирование до нуля, процессоры Graviton</td></tr>
  </tbody>
</table>

<h2>Архитектура высокой доступности</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Architecture pattern — Multi-AZ web app</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">Region: eu-west-1

AZ-1 (eu-west-1a)                AZ-2 (eu-west-1b)
├── Public subnet                 ├── Public subnet
│   └── NAT Gateway              │   └── NAT Gateway
├── Private subnet               ├── Private subnet
│   └── ECS Tasks (3 of 6)      │   └── ECS Tasks (3 of 6)
└── Database subnet              └── Database subnet
    └── RDS Primary                  └── RDS Standby (Multi-AZ)

ALB spans both AZs
Route 53 health check → ALB
</code></pre>
</div>

<h2>Выбор сервиса хранилища</h2>
<table class="ctable">
  <thead><tr><th>Сервис</th><th>Тип</th><th>Сценарий использования</th></tr></thead>
  <tbody>
    <tr><td>S3 Standard</td><td>Объектное</td><td>Часто используемые файлы, резервные копии, статические ресурсы</td></tr>
    <tr><td>S3 Infrequent Access</td><td>Объектное</td><td>Ежемесячный доступ, более низкая цена, более высокая плата за получение</td></tr>
    <tr><td>S3 Glacier Instant</td><td>Объектное</td><td>Архивы, миллисекундное получение</td></tr>
    <tr><td>S3 Glacier Deep Archive</td><td>Объектное</td><td>Комплаенс-архивы, получение за 12ч, самый дешёвый</td></tr>
    <tr><td>EBS gp3</td><td>Блочное</td><td>Загрузочные тома EC2, базы данных, доступ с одного инстанса</td></tr>
    <tr><td>EFS</td><td>Файловое (NFS)</td><td>Общая файловая система для нескольких EC2/ECS инстансов</td></tr>
    <tr><td>FSx for Lustre</td><td>Файловое</td><td>HPC, данные для обучения ML, высокая пропускная способность</td></tr>
  </tbody>
</table>

<h2>Стратегии аварийного восстановления</h2>
<table class="ctable">
  <thead><tr><th>Стратегия</th><th>RTO</th><th>RPO</th><th>Стоимость</th></tr></thead>
  <tbody>
    <tr><td>Резервное копирование и восстановление</td><td>Часы</td><td>Часы</td><td>Низкая</td></tr>
    <tr><td>Pilot Light</td><td>10–30 мин</td><td>Минуты</td><td>Низкая-средняя</td></tr>
    <tr><td>Warm Standby</td><td>Минуты</td><td>Секунды</td><td>Средняя</td></tr>
    <tr><td>Multi-site Active/Active</td><td>Секунды</td><td>Почти ноль</td><td>Высокая</td></tr>
  </tbody>
</table>

<h2>Часто встречающиеся темы на экзамене</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Key facts to remember</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># S3
- Max object size: 5TB (use multipart upload for > 5GB)
- S3 Standard: 99.999999999% (11 9s) durability
- S3 Transfer Acceleration: uses CloudFront edge locations for faster uploads

# EC2
- Reserved Instances: up to 72% discount (1 or 3 year commitment)
- Spot Instances: up to 90% discount, can be interrupted with 2-min warning
- Savings Plans: flexible like Reserved but applies to any instance type

# Database
- RDS Multi-AZ: synchronous replication, automatic failover (~60-120s)
- RDS Read Replicas: async replication, up to 15 replicas, can be cross-region
- Aurora: 6-way replication across 3 AZs, 5x performance vs MySQL RDS

# Networking
- VPC peering: connect two VPCs (same or different account/region)
- Transit Gateway: hub-and-spoke to connect many VPCs + on-premises
- PrivateLink: expose service privately without peering (no VPC CIDR overlap issue)
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Multi-AZ = высокая доступность (тот же регион, автоматическое переключение); Multi-Region = аварийное восстановление</li>
    <li>S3: объектное хранилище (не блочное/файловое) — отлично для неструктурированных данных, статических файлов, резервных копий</li>
    <li>Aurora Serverless v2: автоматически масштабирует ACU, хорошо подходит для переменных нагрузок; дешевле, чем всегда работающий RDS при низком трафике</li>
    <li>DR: резервное копирование/восстановление — самое дешёвое; Active/Active — самое дорогое — выбирайте исходя из требований RTO/RPO</li>
    <li>Подсказка для экзамена: «наиболее экономичный» обычно означает S3, Spot или Serverless; «наиболее доступный» означает Multi-AZ + Auto Scaling</li>
  </ul>
</div>
`,
  },
  'aws-cert-dva': {
    body: `
<h2>Веса доменов (DVA-C02)</h2>
<table class="ctable">
  <thead><tr><th>Домен</th><th>Вес</th></tr></thead>
  <tbody>
    <tr><td>Разработка с сервисами AWS</td><td>32%</td></tr>
    <tr><td>Безопасность</td><td>26%</td></tr>
    <tr><td>Развёртывание</td><td>24%</td></tr>
    <tr><td>Устранение неполадок и оптимизация</td><td>18%</td></tr>
  </tbody>
</table>

<h2>Проектирование ключей DynamoDB</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">DynamoDB best practices</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Partition key: choose for uniform distribution
# BAD: using status (Active/Inactive) → hot partition
# BAD: using date → all writes go to today's partition
# GOOD: user_id, order_id (high cardinality, random distribution)

# Composite key: PK + SK for hierarchical data (single-table design)
# PK: USER#123        SK: PROFILE      → user profile
# PK: USER#123        SK: ORDER#456    → user's order
# PK: USER#123        SK: ORDER#789    → user's other order

# Query: get all items for USER#123 → SK begins_with('ORDER')

# Global Secondary Index (GSI): alternate access pattern
# GSI PK: email → query by email (not primary key)
# Max 20 GSIs per table

# Capacity modes:
# On-demand: pay per request, auto-scales, use for unpredictable traffic
# Provisioned: set RCU/WCU, cheaper for predictable high traffic
</code></pre>
</div>

<h2>Интеграция API Gateway + Lambda</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — SAM template</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 30
    MemorySize: 512
    Runtime: provided.al2
    Layers:
      - !Sub arn:aws:lambda:eu-west-1:534081306603:layer:php-82-fpm:63

Resources:
  ApiFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: public/index.php
      Events:
        ApiEvent:
          Type: HttpApi
          Properties:
            Path: /{proxy+}
            Method: ANY
            Auth:
              Authorizer: CognitoAuth

  CognitoAuth:
    Type: AWS::Serverless::HttpApi
    Properties:
      Auth:
        DefaultAuthorizer: CognitoAuthorizer
        Authorizers:
          CognitoAuthorizer:
            JwtConfiguration:
              issuer: !Sub https://cognito-idp.eu-west-1.amazonaws.com/\${UserPool}
              audience:
                - !Ref UserPoolClient
</code></pre>
</div>

<h2>AWS X-Ray (распределённое трассирование)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — X-Ray instrumentation</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Aws\XRay\XRay;

// Instrument an HTTP call
$tracer = XRay::getTracer();
$segment = $tracer->beginSegment('my-app');
$subsegment = $tracer->beginSubsegment('payment-service-call');

try {
    $response = Http::post('https://payments.internal/charge', $data);
    $subsegment->putAnnotation('status', $response->status());
} finally {
    $tracer->endSubsegment();
}

// In Lambda: X-Ray enabled automatically — just add annotations
$subsegment->putMetadata('order', ['id' => $orderId, 'amount' => $amount]);
$tracer->endSegment();
</code></pre>
</div>

<h2>CI/CD через CodePipeline</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Architecture: CodePipeline stages</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">Source Stage:
  - CodeCommit / GitHub / S3 (zip artifact)

Build Stage (CodeBuild):
  - buildspec.yml: install, test, build Docker image
  - Push to ECR
  - Output: imagedefinitions.json

Test Stage (CodeBuild):
  - Run integration tests against staging environment
  - Quality gate: coverage > 80%, 0 critical findings

Deploy Stage (CodeDeploy / ECS):
  - Blue/green deployment to ECS
  - CodeDeploy shifts traffic: 10% → 50% → 100% with health check gates
  - Automatic rollback on CloudWatch alarm
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>DynamoDB: ключ секции должен распределять нагрузку — избегайте горячих секций (статус, дата в качестве PK)</li>
    <li>GSI: позволяет альтернативные шаблоны запросов, но стоит дополнительных RCU/WCU</li>
    <li>API Gateway: proxy-интеграция передаёт сырое событие в Lambda; без proxy требуются шаблоны маппинга</li>
    <li>X-Ray: трассирует запросы через Lambda, API Gateway, DynamoDB, SQS — находит узкие места в задержке</li>
    <li>SAM: расширение CloudFormation для serverless — проще, чем чистый CFN для Lambda + API Gateway</li>
  </ul>
</div>
`,
  },
  'aws-rds-dynamo': {
    body: `
<h2>RDS vs Aurora vs DynamoDB</h2>
<table class="ctable">
  <thead><tr><th>Функция</th><th>RDS PostgreSQL</th><th>Aurora PostgreSQL</th><th>DynamoDB</th></tr></thead>
  <tbody>
    <tr><td>Движок</td><td>Стандартный PostgreSQL</td><td>Cloud-native, совместимый с PostgreSQL</td><td>Проприетарный NoSQL</td></tr>
    <tr><td>Репликация</td><td>Асинхронная на реплики</td><td>6-кратная синхронная по 3 AZ</td><td>Встроенный Multi-AZ</td></tr>
    <tr><td>Переключение при сбое</td><td>~60–120с (Multi-AZ)</td><td>~30с</td><td>Автоматическое, бесшовное</td></tr>
    <tr><td>Реплики для чтения</td><td>До 15, асинхронные</td><td>До 15, с малой задержкой</td><td>Global Tables</td></tr>
    <tr><td>Масштабирование</td><td>Ручное изменение размера</td><td>Serverless v2: автоматические ACU</td><td>Автоматически по требованию</td></tr>
    <tr><td>Стоимость</td><td>Средняя</td><td>Выше (на 20-40% больше RDS)</td><td>Оплата за запрос</td></tr>
  </tbody>
</table>

<h2>Конфигурация RDS через Terraform</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_db_instance" "main" {
  identifier     = "my-app-db"
  engine         = "postgres"
  engine_version = "16.2"
  instance_class = "db.t3.medium"
  db_name        = "app"
  username       = "app_user"
  password       = var.db_password

  # High availability
  multi_az = true       # synchronous standby in another AZ, auto-failover

  # Storage
  allocated_storage     = 100  # GB
  max_allocated_storage = 500  # autoscaling limit
  storage_encrypted     = true
  storage_type          = "gp3"

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Protection
  deletion_protection = true
  skip_final_snapshot = false
  final_snapshot_identifier = "my-app-db-final"

  # Backups
  backup_retention_period = 7   # 7 days
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  # Monitoring
  performance_insights_enabled = true
  monitoring_interval          = 60
  monitoring_role_arn          = aws_iam_role.rds_monitoring.arn
}

# Read replica
resource "aws_db_instance" "replica" {
  identifier          = "my-app-db-replica"
  replicate_source_db = aws_db_instance.main.identifier
  instance_class      = "db.t3.small"
  skip_final_snapshot = true
}
</code></pre>
</div>

<h2>Дизайн одной таблицы DynamoDB</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Single table — multiple entity types</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Access patterns drive the schema design
# PK = partition key, SK = sort key

# User entity
PK: USER#alice         SK: PROFILE
{ id: "alice", email: "...", created_at: "..." }

# User's orders
PK: USER#alice         SK: ORDER#2024-01-15#ord-123
{ order_id: "ord-123", total: 99.00, status: "shipped" }
PK: USER#alice         SK: ORDER#2024-01-20#ord-456

# Query: get alice's orders after 2024-01-01
KeyConditionExpression: PK = "USER#alice" AND SK BETWEEN "ORDER#2024-01-01" AND "ORDER#2024-12-31"

# GSI for order lookup by order ID
GSI PK: ORDER_ID       GSI SK: (not needed)
PK: ORDER#ord-123      SK: (metadata)
</code></pre>
</div>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — DynamoDB with AWS SDK</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Aws\DynamoDb\DynamoDbClient;
use Aws\DynamoDb\Marshaler;

$client    = new DynamoDbClient(['region' => 'eu-west-1', 'version' => 'latest']);
$marshaler = new Marshaler();

// Put item
$client->putItem([
    'TableName' => 'app-table',
    'Item'      => $marshaler->marshalItem([
        'PK'         => 'USER#alice',
        'SK'         => 'PROFILE',
        'email'      => 'alice@test.com',
        'created_at' => date('c'),
    ]),
]);

// Query — all orders for alice
$result = $client->query([
    'TableName'                 => 'app-table',
    'KeyConditionExpression'    => 'PK = :pk AND begins_with(SK, :sk_prefix)',
    'ExpressionAttributeValues' => $marshaler->marshalItem([
        ':pk'        => 'USER#alice',
        ':sk_prefix' => 'ORDER#',
    ]),
]);
$orders = array_map([$marshaler, 'unmarshalItem'], $result['Items']);
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Aurora Serverless v2</div>
  <p>Aurora Serverless v2 автоматически масштабируется с шагом 0.5 ACU от 0.5 до 128 ACU. Масштабируется вверх за секунды под нагрузкой и масштабируется вниз в период простоя. Идеально подходит для переменных нагрузок, сред разработки/тестирования и приложений с непредсказуемыми пиками. Минимальная стоимость — минимальный объём ACU, даже в простое — масштабирование до нуля требует Aurora Serverless v1 (есть холодный старт).</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>RDS Multi-AZ: синхронный резерв, автоматическое переключение ~60–120с — для высокой доступности, не для масштабирования чтения</li>
    <li>Реплики для чтения: асинхронные, используются для масштабирования чтения — задержка репликации может приводить к устаревшим данным</li>
    <li>Aurora: 6-кратная репликация по 3 AZ, ~30с переключение при сбое, до 15 реплик с малой задержкой</li>
    <li>DynamoDB: проектируйте схему исходя из шаблонов доступа — JOIN'ов нет, схема определяется запросами</li>
    <li>DynamoDB on-demand: непредсказуемый трафик; provisioned + автомасштабирование: предсказуемый высокий объём (дешевле)</li>
  </ul>
</div>
`,
  },
  'aws-vpc': {
    body: `
<h2>Архитектура VPC</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Standard VPC layout</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">VPC: 10.0.0.0/16

AZ eu-west-1a                   AZ eu-west-1b
├── Public subnet 10.0.1.0/24   ├── Public subnet 10.0.2.0/24
│   ├── ALB                     │   ├── ALB
│   └── NAT Gateway             │   └── NAT Gateway
│                               │
├── Private subnet 10.0.11.0/24 ├── Private subnet 10.0.12.0/24
│   └── ECS Tasks / EC2         │   └── ECS Tasks / EC2
│                               │
└── DB subnet 10.0.21.0/24      └── DB subnet 10.0.22.0/24
    └── RDS Primary                 └── RDS Standby (Multi-AZ)

Internet Gateway → attached to VPC (enables public subnet internet access)
NAT Gateway → in public subnet, enables private subnet outbound internet (no inbound)
</code></pre>
</div>

<h2>Настройка VPC через Terraform</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "my-app-vpc" }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.\${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "public-\${count.index + 1}" }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index + 11}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  tags = { Name = "private-\${count.index + 1}" }
}

resource "aws_nat_gateway" "ngw" {
  count         = 2
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
}

resource "aws_route_table" "private" {
  count  = 2
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.ngw[count.index].id
  }
}
</code></pre>
</div>

<h2>Группы безопасности — поток трафика</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL — Security group chain</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_security_group" "alb" {
  vpc_id = aws_vpc.main.id
  ingress { from_port=443 to_port=443 protocol="tcp" cidr_blocks=["0.0.0.0/0"] }
  ingress { from_port=80  to_port=80  protocol="tcp" cidr_blocks=["0.0.0.0/0"] }
  egress  { from_port=0   to_port=0   protocol="-1"  cidr_blocks=["0.0.0.0/0"] }
}

resource "aws_security_group" "app" {
  vpc_id = aws_vpc.main.id
  # Only accept traffic FROM the ALB security group
  ingress {
    from_port       = 9000
    to_port         = 9000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  egress { from_port=0 to_port=0 protocol="-1" cidr_blocks=["0.0.0.0/0"] }
}

resource "aws_security_group" "rds" {
  vpc_id = aws_vpc.main.id
  # Only accept traffic FROM the app security group
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
}
</code></pre>
</div>

<h2>Группы безопасности vs NACL</h2>
<table class="ctable">
  <thead><tr><th>Функция</th><th>Группы безопасности</th><th>NACL</th></tr></thead>
  <tbody>
    <tr><td>Уровень</td><td>Инстанс / ENI</td><td>Подсеть</td></tr>
    <tr><td>Stateful</td><td>Да — обратный трафик разрешён автоматически</td><td>Нет — необходимо разрешать оба направления</td></tr>
    <tr><td>Правила</td><td>Только разрешение</td><td>Разрешение + Запрет (по номеру правила)</td></tr>
    <tr><td>Использовать для</td><td>Основного контроля трафика</td><td>Правил запрета на уровне подсети, блокировки DDoS</td></tr>
  </tbody>
</table>

<h2>Варианты подключения VPC</h2>
<table class="ctable">
  <thead><tr><th>Вариант</th><th>Сценарий использования</th><th>Перекрытие CIDR?</th></tr></thead>
  <tbody>
    <tr><td>VPC Peering</td><td>Соединение 2 VPC (один/разные аккаунты)</td><td>Не допускается</td></tr>
    <tr><td>Transit Gateway</td><td>Концентратор для множества VPC + on-premises</td><td>Не допускается</td></tr>
    <tr><td>PrivateLink</td><td>Приватный доступ к сервису без пиринга</td><td>Допускается — на уровне сервиса, не VPC</td></tr>
    <tr><td>VPN / Direct Connect</td><td>On-premises к AWS</td><td>Н/П</td></tr>
  </tbody>
</table>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Публичная подсеть: имеет маршрут к Internet Gateway, инстансы могут иметь публичные IP</li>
    <li>Приватная подсеть: нет маршрута к IGW, использует NAT Gateway для исходящего интернета (обновления ПО, API-вызовы)</li>
    <li>Группы безопасности: stateful (обратный трафик автоматический), только разрешение, применяются к инстансу</li>
    <li>Цепочка групп безопасности: ALB SG → App SG → RDS SG — никогда не открывайте 0.0.0.0/0 для внутренних сервисов</li>
    <li>Один NAT Gateway на AZ для высокой доступности — единственный NAT Gateway является зависимостью одной AZ</li>
  </ul>
</div>
`,
  },
}

export default ruBodiesP6a
