export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'AWS VPC & Networking',
  intro: 'A VPC (Virtual Private Cloud) is your isolated network in AWS. Every production architecture starts with a well-designed VPC: public subnets for load balancers and NAT gateways, private subnets for application servers and databases, security groups as stateful firewalls, and NACLs as stateless subnet-level guards.',
  tags: ['VPC', 'Subnets', 'Security groups', 'NACLs', 'NAT Gateway', 'VPC Peering', 'PrivateLink'],
  seniorExpectations: [
    'Design a VPC with public and private subnets across multiple AZs',
    'Configure security groups for ALB → App → RDS traffic flow',
    'Explain NAT Gateway: private subnet internet access without public IPs',
    'Distinguish security groups (stateful, instance level) from NACLs (stateless, subnet level)',
    'Connect VPCs with VPC Peering vs Transit Gateway vs PrivateLink',
  ],
  body: `
<h2>VPC Architecture</h2>
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

<h2>Terraform VPC Setup</h2>
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

<h2>Security Groups — Traffic Flow</h2>
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

<h2>Security Groups vs NACLs</h2>
<table class="ctable">
  <thead><tr><th>Feature</th><th>Security Groups</th><th>NACLs</th></tr></thead>
  <tbody>
    <tr><td>Level</td><td>Instance / ENI</td><td>Subnet</td></tr>
    <tr><td>Stateful</td><td>Yes — return traffic auto-allowed</td><td>No — must allow both directions</td></tr>
    <tr><td>Rules</td><td>Allow only</td><td>Allow + Deny (ordered by rule number)</td></tr>
    <tr><td>Use for</td><td>Primary traffic control</td><td>Subnet-level deny rules, DDoS blocking</td></tr>
  </tbody>
</table>

<h2>VPC Connectivity Options</h2>
<table class="ctable">
  <thead><tr><th>Option</th><th>Use case</th><th>CIDR overlap?</th></tr></thead>
  <tbody>
    <tr><td>VPC Peering</td><td>Connect 2 VPCs (same/different account)</td><td>Not allowed</td></tr>
    <tr><td>Transit Gateway</td><td>Hub for many VPCs + on-premises</td><td>Not allowed</td></tr>
    <tr><td>PrivateLink</td><td>Expose service privately, no peering needed</td><td>Allowed — service-level not VPC-level</td></tr>
    <tr><td>VPN / Direct Connect</td><td>On-premises to AWS</td><td>N/A</td></tr>
  </tbody>
</table>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Public subnet: has route to Internet Gateway, instances can have public IPs</li>
    <li>Private subnet: no IGW route, uses NAT Gateway for outbound internet (software updates, API calls)</li>
    <li>Security groups: stateful (return traffic automatic), allow-only, apply per instance</li>
    <li>Chain security groups: ALB SG → App SG → RDS SG — never open to 0.0.0.0/0 for internal services</li>
    <li>One NAT Gateway per AZ for high availability — a single NAT Gateway is a single AZ dependency</li>
  </ul>
</div>
`,
};
