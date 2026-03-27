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
  body: `
<h2>Core Concepts</h2>
<ul>
  <li><strong>Provider:</strong> Plugin that talks to an API (AWS, GCP, Azure). Configured with credentials.</li>
  <li><strong>Resource:</strong> Infrastructure object to create (aws_vpc, aws_ecs_service, aws_rds_cluster).</li>
  <li><strong>State:</strong> Terraform tracks what it has created in a state file. Never edit manually.</li>
  <li><strong>Plan:</strong> Preview changes before applying. Shows what will be created/updated/destroyed.</li>
  <li><strong>Apply:</strong> Execute the plan and create/update/destroy real infrastructure.</li>
  <li><strong>Module:</strong> Reusable group of resources — like a function in programming.</li>
</ul>

<h2>Basic Project Structure</h2>
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

<h2>Complete Example: VPC + ECS + RDS</h2>
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

<h2>Terraform Workflow</h2>
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
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Always use remote state (S3 backend) + DynamoDB locking in teams — never local state</li>
    <li>Always run terraform plan before apply — review what will change</li>
    <li>Never store secrets in .tf files — use variables + terraform.tfvars (gitignored) or AWS Secrets Manager</li>
    <li>Use modules for reusable infrastructure — VPC, ECS, RDS modules</li>
    <li>Workspaces: dev/staging/prod environments with separate state files</li>
    <li>data sources: reference existing AWS resources without managing them</li>
    <li>locals: computed values used multiple times — like variables but not inputs</li>
  </ul>
</div>
`,
};
