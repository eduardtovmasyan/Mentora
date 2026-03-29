export default {
  phase: 'Phase 8 · DevOps & Certifications',
  title: 'GitHub Actions CI/CD',
  intro: 'GitHub Actions lets you automate your entire software delivery pipeline — run tests, lint code, build Docker images, and deploy to AWS — triggered by any git event. It is the most widely used CI/CD platform for open source and increasingly for enterprise.',
  tags: ['Workflows', 'Jobs', 'Steps', 'Secrets', 'Matrix builds', 'Docker build', 'Deploy to ECS'],
  seniorExpectations: [
    'Write a complete PHP CI pipeline (lint, test, build, push, deploy)',
    'Use matrix builds to test across PHP versions',
    'Manage secrets properly — never hardcode credentials',
    'Implement caching for composer and Docker layers',
    'Set up environment-based deployments (staging/production)',
  ],

  // ── Structure ────────────────────────────────────────────────────────────
  // Segments define layout only. Text keys are resolved from bodyTexts below.
  // Code segments are always English — never translated.
  segments: [
    { type: 'h2', key: 'h_concepts' },
    { type: 'ul', key: 'ul_concepts' },

    { type: 'h2', key: 'h_pipeline' },
    { type: 'code', lang: 'yaml', label: '.github/workflows/ci.yml', code: `name: CI/CD Pipeline

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
          aws ecs update-service \\
            --cluster my-cluster \\
            --service my-app-service \\
            --force-new-deployment` },

    { type: 'callout', style: 'tip', key: 'callout_secrets' },

    { type: 'keypoints', key: 'keypoints' },
  ],

  // ── English source text ──────────────────────────────────────────────────
  // This is the English "locale". Russian/Armenian overrides live in ru.ts / hy.ts.
  bodyTexts: {
    h_concepts: 'Key Concepts',
    ul_concepts: [
      '<strong>Workflow:</strong> YAML file in <code>.github/workflows/</code>. Triggered by events (push, PR, schedule).',
      '<strong>Job:</strong> A group of steps that run on the same runner. Jobs run in parallel by default.',
      '<strong>Step:</strong> Individual task — run a command or use a pre-built action.',
      '<strong>Runner:</strong> The machine that executes jobs. GitHub provides ubuntu-latest, windows-latest, macos-latest.',
      '<strong>Action:</strong> Reusable unit of work — <code>actions/checkout</code>, <code>aws-actions/configure-aws-credentials</code>.',
    ],

    h_pipeline: 'Complete PHP/Laravel CI Pipeline',

    callout_secrets: {
      title: 'Secrets Management',
      html: 'Store all credentials in GitHub Settings → Secrets. Access them as <code>${{ secrets.MY_SECRET }}</code>. Secrets are masked in logs. Never hardcode API keys, passwords, or AWS credentials in your workflow YAML — they would be visible in your git history forever.',
    },

    keypoints: {
      title: 'Key Points to Remember',
      items: [
        'Workflow = YAML file in .github/workflows/. Triggered by git events.',
        'Jobs run in parallel by default. Use <code>needs:</code> to create dependencies.',
        'Matrix builds: test across multiple PHP/Node versions simultaneously',
        'Always cache: composer vendor directory, Docker build layers',
        'Use <code>environment: production</code> to require manual approval before deploy',
        'Secrets: stored in GitHub Settings, accessed as ${{ secrets.NAME }}, masked in logs',
        'Pull Request workflows: run tests on every PR. Deploy only on merge to main.',
      ],
    },
  },
};
