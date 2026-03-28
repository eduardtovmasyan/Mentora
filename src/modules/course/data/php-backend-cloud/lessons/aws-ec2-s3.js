export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'AWS EC2 & S3',
  intro: 'EC2 (Elastic Compute Cloud) provides resizable virtual servers. S3 (Simple Storage Service) provides infinitely scalable object storage. Together they are the foundation of AWS: EC2 runs your application, S3 stores assets, backups, and static files. Senior engineers configure both securely and cost-efficiently.',
  tags: ['EC2', 'AMI', 'Security groups', 'S3', 'Bucket policies', 'IAM roles', 'Presigned URLs'],
  seniorExpectations: [
    'Launch an EC2 instance with the correct instance type, security group, and IAM role',
    'Configure S3 bucket with proper ACLs, versioning, and lifecycle policies',
    'Generate presigned URLs for temporary S3 access without exposing credentials',
    'Use EC2 instance profiles (IAM roles) instead of access keys on EC2',
    'Calculate rough cost: EC2 instance hours, S3 storage + request pricing',
  ],
  body: `
<h2>EC2 Key Concepts</h2>
<table class="ctable">
  <thead><tr><th>Concept</th><th>Description</th></tr></thead>
  <tbody>
    <tr><td>Instance type</td><td>t3.micro (2vCPU, 1GB) → c7g.xlarge (4vCPU, 8GB) — choose based on workload</td></tr>
    <tr><td>AMI</td><td>Amazon Machine Image — base OS snapshot; Amazon Linux 2023, Ubuntu 22.04</td></tr>
    <tr><td>Security group</td><td>Stateful firewall at instance level — inbound/outbound rules</td></tr>
    <tr><td>Key pair</td><td>SSH key for initial access — disable password auth, use SSM Session Manager instead</td></tr>
    <tr><td>IAM role/profile</td><td>Grants EC2 permissions to AWS services — never put access keys on EC2</td></tr>
    <tr><td>EBS volume</td><td>Block storage attached to instance; separate from instance lifecycle</td></tr>
  </tbody>
</table>

<h2>Launch EC2 with Terraform</h2>
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

<h2>S3 Bucket with Policies</h2>
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

<h2>Presigned URLs in PHP</h2>
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
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Use IAM instance profiles on EC2 — never put AWS access keys in .env on EC2 instances</li>
    <li>Block all public S3 access by default — use presigned URLs for temporary access</li>
    <li>S3 versioning: protects against accidental deletion, enables point-in-time recovery</li>
    <li>Lifecycle policies: auto-transition old objects to Glacier (cold storage) to save costs</li>
    <li>Security groups: default deny — explicitly open only required ports (80, 443 inbound; 5432 to RDS)</li>
  </ul>
</div>
`,
};
