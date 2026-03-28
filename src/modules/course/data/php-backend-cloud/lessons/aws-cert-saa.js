export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'AWS SAA-C03 Exam Prep',
  intro: 'The AWS Solutions Architect Associate (SAA-C03) exam tests your ability to design scalable, cost-effective, fault-tolerant systems on AWS. It covers compute, storage, networking, databases, security, and architecture best practices. This lesson covers the core topics and high-frequency exam areas.',
  tags: ['Well-Architected', 'HA design', 'Cost optimization', 'Security pillar', 'DR strategies', 'Exam tips'],
  seniorExpectations: [
    'Apply the AWS Well-Architected Framework 6 pillars to system designs',
    'Design highly available architectures: Multi-AZ, Auto Scaling, ALB',
    'Choose the right storage service: S3, EBS, EFS, Glacier, Storage Gateway',
    'Design disaster recovery: backup/restore, pilot light, warm standby, multi-site',
    'Optimize costs: Reserved Instances, Savings Plans, Spot instances, S3 intelligent tiering',
  ],
  body: `
<h2>Well-Architected Framework — 6 Pillars</h2>
<table class="ctable">
  <thead><tr><th>Pillar</th><th>Key practices</th></tr></thead>
  <tbody>
    <tr><td>Operational Excellence</td><td>IaC (CloudFormation/Terraform), CI/CD, runbooks, observability</td></tr>
    <tr><td>Security</td><td>Least privilege IAM, encryption at rest + in transit, VPC isolation, WAF</td></tr>
    <tr><td>Reliability</td><td>Multi-AZ, Auto Scaling, health checks, backups, chaos engineering</td></tr>
    <tr><td>Performance Efficiency</td><td>Right-sizing, CloudFront CDN, ElastiCache, read replicas, Lambda</td></tr>
    <tr><td>Cost Optimization</td><td>Reserved/Spot instances, auto scaling down, S3 lifecycle, cost budgets</td></tr>
    <tr><td>Sustainability</td><td>Right-sizing, managed services, scale to zero, Graviton processors</td></tr>
  </tbody>
</table>

<h2>High Availability Architecture</h2>
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

<h2>Storage Service Selection</h2>
<table class="ctable">
  <thead><tr><th>Service</th><th>Type</th><th>Use case</th></tr></thead>
  <tbody>
    <tr><td>S3 Standard</td><td>Object</td><td>Frequently accessed files, backups, static assets</td></tr>
    <tr><td>S3 Infrequent Access</td><td>Object</td><td>Monthly access, lower price, higher retrieval fee</td></tr>
    <tr><td>S3 Glacier Instant</td><td>Object</td><td>Archives, millisecond retrieval</td></tr>
    <tr><td>S3 Glacier Deep Archive</td><td>Object</td><td>Compliance archives, 12h retrieval, cheapest</td></tr>
    <tr><td>EBS gp3</td><td>Block</td><td>EC2 boot volumes, databases, single-instance access</td></tr>
    <tr><td>EFS</td><td>File (NFS)</td><td>Shared file system across multiple EC2/ECS instances</td></tr>
    <tr><td>FSx for Lustre</td><td>File</td><td>HPC, ML training data, high throughput</td></tr>
  </tbody>
</table>

<h2>Disaster Recovery Strategies</h2>
<table class="ctable">
  <thead><tr><th>Strategy</th><th>RTO</th><th>RPO</th><th>Cost</th></tr></thead>
  <tbody>
    <tr><td>Backup & Restore</td><td>Hours</td><td>Hours</td><td>Low</td></tr>
    <tr><td>Pilot Light</td><td>10–30 min</td><td>Minutes</td><td>Low-medium</td></tr>
    <tr><td>Warm Standby</td><td>Minutes</td><td>Seconds</td><td>Medium</td></tr>
    <tr><td>Multi-site Active/Active</td><td>Seconds</td><td>Near zero</td><td>High</td></tr>
  </tbody>
</table>

<h2>High-Frequency Exam Topics</h2>
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
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Multi-AZ = high availability (same region, automatic failover); Multi-Region = disaster recovery</li>
    <li>S3: object storage (not block/file) — great for unstructured data, static files, backups</li>
    <li>Aurora Serverless v2: auto-scales ACUs, good for variable workloads; cheaper than always-on RDS for low traffic</li>
    <li>DR: Backup/Restore cheapest; Active/Active most expensive — choose based on RTO/RPO requirements</li>
    <li>Exam tip: "most cost-effective" usually means S3, Spot, or Serverless; "most available" means Multi-AZ + Auto Scaling</li>
  </ul>
</div>
`,
};
