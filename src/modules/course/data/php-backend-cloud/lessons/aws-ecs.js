export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'AWS ECS (Fargate)',
  intro: 'ECS (Elastic Container Service) runs Docker containers on AWS. Fargate is the serverless compute engine for ECS — no EC2 instances to manage. It is the standard way to run containerized PHP/Laravel applications on AWS: define a task (container spec), run it as a service behind an ALB, and scale automatically.',
  tags: ['ECS', 'Fargate', 'Task definition', 'Service', 'ECR', 'ALB', 'Auto scaling'],
  seniorExpectations: [
    'Write a Fargate task definition with correct CPU/memory, image, port, environment, and secrets',
    'Configure an ECS service with ALB target group and desired count',
    'Set up auto scaling based on CPU/memory or custom CloudWatch metrics',
    'Manage secrets in ECS via AWS Secrets Manager (not environment variables)',
    'Deploy a new image version via CI/CD: build → push to ECR → force new deployment',
  ],
  segments: [
    { type: 'h2', text: 'ECS Architecture' },
    { type: 'code', lang: 'bash', label: 'Architecture overview', code: `Internet
  ↓
ALB (Application Load Balancer)
  ↓
ECS Service (desired: 3 tasks)
  ├── Task 1 (Fargate) — your PHP container
  ├── Task 2 (Fargate)
  └── Task 3 (Fargate)
       ↓
  RDS (private subnet)
  Redis (ElastiCache)` },

    { type: 'h2', text: 'Task Definition (Terraform)' },
    { type: 'code', lang: 'bash', label: 'HCL', code: `resource "aws_ecs_task_definition" "app" {
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
}` },

    { type: 'h2', text: 'ECS Service with Auto Scaling' },
    { type: 'code', lang: 'bash', label: 'HCL', code: `resource "aws_ecs_service" "app" {
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
}` },

    { type: 'h2', text: 'CI/CD Deployment' },
    { type: 'code', lang: 'bash', label: 'bash — GitHub Actions deploy', code: `aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin $ECR_URL
docker build -t $ECR_URL:$GITHUB_SHA .
docker push $ECR_URL:$GITHUB_SHA

# Update task definition with new image tag
aws ecs update-service \\
  --cluster my-cluster \\
  --service my-app \\
  --force-new-deployment

# Wait for deployment to stabilize
aws ecs wait services-stable --cluster my-cluster --services my-app` },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Task definition = container spec (image, CPU, memory, env, secrets, ports)',
      'ECS service maintains desired count, health checks, rolling deploys',
      'Use Secrets Manager (not env vars) for sensitive values — ECS injects at runtime',
      'Two IAM roles: execution role (ECS agent permissions) and task role (app permissions)',
      'Auto scaling: target tracking (CPU/memory) or step scaling (custom metric)',
    ]},
  ],
};
