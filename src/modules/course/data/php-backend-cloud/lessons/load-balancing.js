export default {
  phase: 'Phase 5 · System Design',
  title: 'Load Balancing',
  intro: 'Load balancers distribute incoming traffic across multiple servers to achieve horizontal scalability, high availability, and fault tolerance. They operate at L4 (TCP/UDP) or L7 (HTTP/HTTPS) and use algorithms like round-robin, least connections, and consistent hashing. AWS ALB and Nginx are the most common in PHP deployments.',
  tags: ['L4 vs L7', 'Round-robin', 'Least connections', 'Health checks', 'Sticky sessions', 'ALB'],
  seniorExpectations: [
    'Explain L4 vs L7 load balancing and when to use each',
    'Compare round-robin, least connections, IP hash, and weighted algorithms',
    'Design sticky sessions vs stateless architecture for horizontally scaled PHP',
    'Configure health checks to remove unhealthy instances automatically',
    'Architect a multi-tier load balancing setup (ALB → application → RDS)',
  ],
  body: `
<h2>L4 vs L7 Load Balancing</h2>
<table class="ctable">
  <thead><tr><th>Layer</th><th>Sees</th><th>Can route by</th><th>Examples</th></tr></thead>
  <tbody>
    <tr><td>L4 (Transport)</td><td>TCP/UDP only</td><td>IP, port</td><td>AWS NLB, HAProxy TCP</td></tr>
    <tr><td>L7 (Application)</td><td>HTTP headers, URL, body</td><td>Path, host, headers, cookies</td><td>AWS ALB, Nginx, Traefik</td></tr>
  </tbody>
</table>

<h2>Load Balancing Algorithms</h2>
<table class="ctable">
  <thead><tr><th>Algorithm</th><th>How it works</th><th>Best for</th></tr></thead>
  <tbody>
    <tr><td>Round-robin</td><td>Each server in turn</td><td>Homogeneous servers, similar request cost</td></tr>
    <tr><td>Weighted round-robin</td><td>Server A gets 3x traffic of Server B</td><td>Mixed server sizes</td></tr>
    <tr><td>Least connections</td><td>Route to server with fewest active connections</td><td>Long-lived connections, variable request cost</td></tr>
    <tr><td>IP hash</td><td>Hash(client_ip) → server</td><td>Sticky sessions without cookies</td></tr>
    <tr><td>Consistent hashing</td><td>Virtual ring, minimal reshuffling when nodes change</td><td>Cache clusters, distributed systems</td></tr>
  </tbody>
</table>

<h2>AWS ALB Configuration (Terraform)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_lb" "app" {
  name               = "my-app-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
}

resource "aws_lb_target_group" "app" {
  name     = "my-app-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app.arn
  port              = 443
  protocol          = "HTTPS"
  certificate_arn   = aws_acm_certificate.cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
</code></pre>
</div>

<h2>Stateless Architecture vs Sticky Sessions</h2>
<div class="callout callout-tip">
  <div class="callout-title">Always prefer stateless</div>
  <p><strong>Sticky sessions</strong> pin a user to one server — if that server dies, the session is lost. They also prevent even load distribution. <strong>Stateless architecture</strong> stores sessions in Redis (shared), tokens in JWTs (client-side), or uses distributed caches. Any server can handle any request.</p>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Stateless session with Redis</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// config/session.php
'driver'     => 'redis',
'connection' => 'session',

// config/database.php — dedicated Redis connection for sessions
'redis' => [
    'session' => [
        'url'  => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => 1, // separate DB from cache
    ],
],
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>L7 load balancers enable path-based routing (/api → service A, /static → CDN, /ws → WebSocket service)</li>
    <li>Health checks: configure both healthy and unhealthy thresholds; use /health endpoint that checks DB connectivity</li>
    <li>Stateless > sticky sessions: store sessions in Redis, use JWT for authentication tokens</li>
    <li>Consistent hashing minimizes cache misses when nodes are added/removed (only K/N keys remap)</li>
    <li>Connection draining: ALB waits for in-flight requests before deregistering an unhealthy instance</li>
  </ul>
</div>
`,
};
