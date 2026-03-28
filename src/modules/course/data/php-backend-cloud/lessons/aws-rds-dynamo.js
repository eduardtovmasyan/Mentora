export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'AWS RDS, Aurora & DynamoDB',
  intro: 'AWS offers managed relational databases (RDS, Aurora) and a fully managed NoSQL database (DynamoDB). RDS handles MySQL/PostgreSQL with automated backups, Multi-AZ, and read replicas. Aurora is a cloud-native rewrite that delivers 5x PostgreSQL performance. DynamoDB provides single-digit millisecond latency at any scale.',
  tags: ['RDS', 'Aurora', 'Multi-AZ', 'Read replicas', 'DynamoDB', 'Partition key', 'GSI'],
  seniorExpectations: [
    'Configure RDS with Multi-AZ for HA and read replicas for read scaling',
    'Explain Aurora vs RDS: storage layer differences, Global Database, Serverless v2',
    'Design DynamoDB single-table with partition key + sort key for access patterns',
    'Configure DynamoDB on-demand vs provisioned capacity and when to use each',
    'Implement DynamoDB Streams for change data capture',
  ],
  body: `
<h2>RDS vs Aurora vs DynamoDB</h2>
<table class="ctable">
  <thead><tr><th>Feature</th><th>RDS PostgreSQL</th><th>Aurora PostgreSQL</th><th>DynamoDB</th></tr></thead>
  <tbody>
    <tr><td>Engine</td><td>Standard PostgreSQL</td><td>Cloud-native PostgreSQL compatible</td><td>Proprietary NoSQL</td></tr>
    <tr><td>Replication</td><td>Async to replicas</td><td>6-way sync across 3 AZs</td><td>Built-in multi-AZ</td></tr>
    <tr><td>Failover</td><td>~60–120s (Multi-AZ)</td><td>~30s</td><td>Automatic, seamless</td></tr>
    <tr><td>Read replicas</td><td>Up to 15, async</td><td>Up to 15, low-lag</td><td>Global Tables</td></tr>
    <tr><td>Scaling</td><td>Manual resize</td><td>Serverless v2: auto ACU</td><td>Auto on-demand</td></tr>
    <tr><td>Cost</td><td>Medium</td><td>Higher (20-40% over RDS)</td><td>Pay per request</td></tr>
  </tbody>
</table>

<h2>RDS Terraform Configuration</h2>
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

<h2>DynamoDB Single-Table Design</h2>
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
  <p>Aurora Serverless v2 auto-scales in 0.5 ACU increments from 0.5 to 128 ACUs. It scales up in seconds under load and scales down during idle. Ideal for variable workloads, dev/staging environments, and applications with unpredictable peaks. Minimum cost is the minimum ACU allocation even when idle — scale to zero requires Aurora Serverless v1 (has cold start).</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>RDS Multi-AZ: synchronous standby, automatic failover ~60–120s — for HA, not read scaling</li>
    <li>Read replicas: asynchronous, used for read scaling — replica lag can cause stale reads</li>
    <li>Aurora: 6-way replication across 3 AZs, ~30s failover, up to 15 low-lag replicas</li>
    <li>DynamoDB: design around access patterns first — there are no JOINs, schema is driven by queries</li>
    <li>DynamoDB on-demand: unpredictable traffic; provisioned + auto-scaling: predictable high-volume (cheaper)</li>
  </ul>
</div>
`,
};
