// noinspection JSAnnotator,JSDuplicatedDeclaration
export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'Terraform & Infrastructure as Code',
  intro: 'Terraform lets you define AWS infrastructure as code — VPCs, ECS services, RDS databases, IAM roles — in declarative HCL files. Instead of clicking through the console, you write code, commit it, review it, and apply it. Infrastructure becomes reproducible and version-controlled.',
  tags: ['HCL', 'Providers', 'Resources', 'State', 'Modules', 'Remote state', 'Plan & Apply'],
  seniorExpectations: [
    'Write Terraform to create a VPC with public and private subnets',
    'Manage Terraform state remotely with S3 + DynamoDB locking',
    'Use modules to organize reusable infrastructure',
    'Use workspaces for dev/staging/prod environments',
    'Explain the terraform plan / apply / destroy workflow',
    'Use data sources to reference existing AWS resources',
  ],

  // ── Structure ────────────────────────────────────────────────────────────
  // Segments define layout only. Text keys are resolved from bodyTexts below.
  // Code segments are always English — never translated.
  segments: [
    { type: 'h2', key: 'h_core_concepts' },
    { type: 'ul', key: 'ul_core_concepts' },

    { type: 'h2', key: 'h_project_structure' },
    { type: 'code', lang: 'bash', label: 'Terraform Project Layout', code: `infrastructure/
├── main.tf          # main resources
├── variables.tf     # input variables (like function params)
├── outputs.tf       # output values (like return values)
├── providers.tf     # provider configuration
├── terraform.tfvars # variable values (gitignored for secrets)
└── modules/
    ├── vpc/         # reusable VPC module
    └── ecs/         # reusable ECS module` },

    { type: 'h2', key: 'h_complete_example' },
    { type: 'code', lang: 'hcl', label: 'HCL — providers.tf', code: `terraform {
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
}` },

    { type: 'code', lang: 'hcl', label: 'HCL — main.tf (VPC + Subnets)', code: `variable "aws_region"  { default = "eu-west-1" }
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
output "db_endpoint"  { value = aws_db_instance.main.endpoint }` },

    { type: 'h2', key: 'h_workflow' },
    { type: 'code', lang: 'bash', label: 'bash — Terraform Commands', code: `terraform init          # download providers + configure backend
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
terraform import aws_s3_bucket.media my-existing-bucket-name` },

    { type: 'keypoints', key: 'keypoints' },
  ],

  // ── English source text ──────────────────────────────────────────────────
  // This is the English "locale". Russian/Armenian overrides live in ru.ts / hy.ts.
  bodyTexts: {
    h_core_concepts: 'Core Concepts',
    ul_core_concepts: [
      '<strong>Provider:</strong> Plugin that talks to an API (AWS, GCP, Azure). Configured with credentials.',
      '<strong>Resource:</strong> Infrastructure object to create (<code>aws_vpc</code>, <code>aws_ecs_service</code>, <code>aws_rds_cluster</code>).',
      '<strong>State:</strong> Terraform tracks what it has created in a state file. Never edit manually.',
      '<strong>Plan:</strong> Preview changes before applying. Shows what will be created/updated/destroyed.',
      '<strong>Apply:</strong> Execute the plan and create/update/destroy real infrastructure.',
      '<strong>Module:</strong> Reusable group of resources — like a function in programming.',
    ],

    h_project_structure: 'Basic Project Structure',

    h_complete_example: 'Complete Example: VPC + ECS + RDS',

    h_workflow: 'Terraform Workflow',

    keypoints: {
      title: 'Key Points to Remember',
      items: [
        'Always use remote state (S3 backend) + DynamoDB locking in teams — never local state',
        'Always run terraform plan before apply — review what will change',
        'Never store secrets in .tf files — use variables + terraform.tfvars (gitignored) or AWS Secrets Manager',
        'Use modules for reusable infrastructure — VPC, ECS, RDS modules',
        'Workspaces: dev/staging/prod environments with separate state files',
        'data sources: reference existing AWS resources without managing them',
        'locals: computed values used multiple times — like variables but not inputs',
      ],
    },
  },
};
