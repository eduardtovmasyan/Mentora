export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'AWS Foundations & IAM',
  intro: 'AWS is the dominant cloud platform with 33% market share. Before learning specific services, you must understand the global infrastructure (regions, AZs), the IAM permission model, and the shared responsibility model. These underpin everything else in AWS.',
  tags: ['Regions', 'Availability Zones', 'IAM', 'Policies', 'Roles', 'Least privilege', 'Shared responsibility'],
  seniorExpectations: [
    'Explain the difference between a region and an availability zone',
    'Write an IAM policy granting least-privilege access',
    'Distinguish IAM users, groups, roles, and policies',
    'Know when to use IAM roles vs access keys',
    'Explain the shared responsibility model',
  ],
  body: `
<h2>AWS Global Infrastructure</h2>
<ul>
  <li><strong>Region:</strong> A geographic area with multiple isolated data centers. Examples: eu-west-1 (Ireland), us-east-1 (N. Virginia). Choose region close to your users to minimize latency.</li>
  <li><strong>Availability Zone (AZ):</strong> One or more discrete data centers within a region, with redundant power/networking/connectivity. eu-west-1 has 3 AZs: eu-west-1a, eu-west-1b, eu-west-1c.</li>
  <li><strong>Edge Location:</strong> CloudFront CDN endpoints. 400+ worldwide. Cache static content close to users.</li>
</ul>
<p><strong>Why multiple AZs?</strong> If you deploy to two AZs, a single data center failure doesn't take down your app. This is the foundation of high availability in AWS.</p>

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

<h2>IAM Best Practices</h2>
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

<h2>Shared Responsibility Model</h2>
<p>AWS and customers share security responsibility — but the split depends on the service type:</p>
<ul>
  <li><strong>AWS is responsible for:</strong> Security OF the cloud — hardware, data centers, network infrastructure, hypervisor, managed service software.</li>
  <li><strong>You are responsible for:</strong> Security IN the cloud — OS patching (EC2), application security, IAM permissions, data encryption, network configuration, firewall rules.</li>
</ul>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Region = geographic area. AZ = isolated data center within a region. Deploy across 2+ AZs for HA.</li>
    <li>IAM User = long-term credentials. IAM Role = temporary credentials for services.</li>
    <li>Always use roles for AWS services (EC2, Lambda, ECS) — never access keys in config files</li>
    <li>Least privilege: grant only the specific actions and resources needed</li>
    <li>Root account: enable MFA, don't use for daily work</li>
    <li>Shared responsibility: AWS secures the infrastructure; you secure your application and data</li>
  </ul>
</div>
`,
};
