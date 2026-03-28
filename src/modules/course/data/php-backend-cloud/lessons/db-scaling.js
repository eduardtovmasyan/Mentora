export default {
  phase: 'Phase 4 · Databases & APIs',
  title: 'Database Scaling',
  intro: 'A single PostgreSQL or MySQL server can handle millions of rows and thousands of queries per second — but every database has limits. Senior engineers know the scaling ladder: proper indexing, read replicas, connection pooling, partitioning, and horizontal sharding — and apply each at the right threshold.',
  tags: ['Read replicas', 'Connection pooling', 'Partitioning', 'Sharding', 'PgBouncer', 'Indexing'],
  seniorExpectations: [
    'Design a read replica setup and route read vs write traffic in Laravel',
    'Explain connection pooling and why 1000 concurrent connections kills PostgreSQL',
    'Implement table partitioning (range, hash, list) and explain partition pruning',
    'Describe horizontal sharding: how to choose a shard key and handle cross-shard queries',
    'Identify the scaling limit of each approach and when to move to the next',
  ],
  body: `
<h2>Scaling Ladder</h2>
<ol>
  <li><strong>Optimize queries + indexes</strong> — usually enough up to millions of rows</li>
  <li><strong>Read replicas</strong> — offload reads; write to primary, read from replicas</li>
  <li><strong>Connection pooling</strong> (PgBouncer) — handle thousands of app connections on few DB connections</li>
  <li><strong>Table partitioning</strong> — split one large table into smaller pieces by range/hash/list</li>
  <li><strong>Horizontal sharding</strong> — split data across multiple database servers</li>
</ol>

<h2>Read Replicas in Laravel</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — config/database.php</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">'mysql' => [
    'read'  => ['host' => ['read-replica-1.db', 'read-replica-2.db']],
    'write' => ['host' => ['primary.db']],
    'sticky' => true, // after a write, read from primary for that request
    'driver'   => 'mysql',
    'database' => env('DB_DATABASE'),
    'username' => env('DB_USERNAME'),
    'password' => env('DB_PASSWORD'),
],

// DB::select() → read replica
// DB::insert/update/delete() → primary
// DB::statement() → primary
</code></pre>
</div>

<h2>Connection Pooling (PgBouncer)</h2>
<div class="callout callout-warn">
  <div class="callout-title">Why PostgreSQL needs a pooler</div>
  <p>PostgreSQL forks a process per connection. 1000 connections = 1000 processes = ~8GB RAM for connection overhead alone. PgBouncer sits between application and DB: accepts thousands of app connections, maintains a small pool (e.g., 20–100) to PostgreSQL. Each connection is ~5MB of RAM on the DB side.</p>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash — PgBouncer config (pgbouncer.ini)</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">[databases]
myapp = host=db-primary port=5432 dbname=myapp

[pgbouncer]
pool_mode = transaction    # transaction pooling — most efficient
max_client_conn = 5000     # clients connecting to pgbouncer
default_pool_size = 50     # actual connections to PostgreSQL
min_pool_size = 10
server_idle_timeout = 60
</code></pre>
</div>

<h2>Table Partitioning</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — Range partitioning (PostgreSQL)</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Parent table
CREATE TABLE events (
    id          BIGSERIAL,
    event_date  DATE NOT NULL,
    payload     JSONB
) PARTITION BY RANGE (event_date);

-- Partitions (can be automated)
CREATE TABLE events_2024_q1 PARTITION OF events
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE events_2024_q2 PARTITION OF events
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- Query planner uses partition pruning automatically
SELECT * FROM events WHERE event_date BETWEEN '2024-02-01' AND '2024-02-28';
-- Only scans events_2024_q1 — other partitions skipped
</code></pre>
</div>

<h2>Sharding Strategy</h2>
<table class="ctable">
  <thead><tr><th>Approach</th><th>Shard Key</th><th>Pro</th><th>Con</th></tr></thead>
  <tbody>
    <tr><td>By user_id range</td><td>user_id 1–1M → shard1</td><td>Simple routing</td><td>Hot shards if users not uniform</td></tr>
    <tr><td>Hash sharding</td><td>user_id % N</td><td>Even distribution</td><td>Re-sharding is painful</td></tr>
    <tr><td>Directory-based</td><td>Lookup table</td><td>Flexible</td><td>Lookup table is a bottleneck</td></tr>
    <tr><td>By tenant</td><td>tenant_id</td><td>Isolation, easy scaling</td><td>Cross-tenant queries impossible</td></tr>
  </tbody>
</table>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Exhaust indexing + query optimization before considering replicas or sharding</li>
    <li>Read replicas: async replication lag means stale reads — use sticky sessions or read-your-writes logic</li>
    <li>PgBouncer transaction mode: the most efficient pooling but breaks LISTEN/NOTIFY and advisory locks</li>
    <li>Partitioning: queries must include the partition key for pruning to work; each partition has its own indexes</li>
    <li>Sharding: cross-shard JOINs are either impossible or require scatter-gather — design shard key to avoid them</li>
  </ul>
</div>
`,
};
