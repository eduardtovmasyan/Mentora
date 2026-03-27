export default {
  phase: 'Phase 5 · System Design',
  title: 'Scalability Fundamentals',
  intro: 'Before designing any large system you need the vocabulary and mental models of scalability: horizontal vs vertical scaling, latency numbers, back-of-envelope estimation, stateless services, and the CAP theorem. These are the building blocks every system design answer uses.',
  tags: ['Horizontal scaling', 'Vertical scaling', 'Latency numbers', 'Back-of-envelope', 'Stateless', 'CAP theorem'],
  seniorExpectations: [
    'Estimate QPS, storage, and bandwidth from first principles',
    'Explain horizontal vs vertical scaling trade-offs',
    'Recite key latency numbers (L1 cache, RAM, SSD, network)',
    'Explain CAP theorem with a concrete example',
    'Design for stateless services to enable horizontal scaling',
  ],
  body: `
<h2>Horizontal vs Vertical Scaling</h2>
<ul>
  <li><strong>Vertical scaling (scale up):</strong> Bigger server — more CPU, RAM, faster storage. Simple, no code changes, but has a hard limit and single point of failure. Good for: databases (initially).</li>
  <li><strong>Horizontal scaling (scale out):</strong> More servers. Unlimited ceiling, fault tolerant. Requires stateless application design and a load balancer. Good for: web/API servers, workers.</li>
</ul>

<h2>Latency Numbers Every Developer Should Know</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Reference — Latency Numbers</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">L1 cache reference              ~0.5 ns
L2 cache reference              ~7 ns
RAM access                      ~100 ns        (200x L1 cache)
SSD random read                 ~100 µs        (1,000x RAM)
HDD random seek                 ~10 ms         (100,000x SSD)
Send 1KB over 1Gbps network     ~10 µs
Data center round trip          ~500 µs
Cross-country packet (US)       ~40 ms
Packet New York → Europe        ~150 ms

# Rules of thumb:
# Memory is fast. Disk is slow. Network is in between.
# A database query hitting disk = 10ms+ before your query logic runs
# Cache everything that's expensive to recompute
</code></pre>
</div>

<h2>Back-of-Envelope Estimation</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">System Design — Estimation Example</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Example: Design Twitter. Estimate scale first.

# Users:
# 300M monthly active users
# 100M daily active users (DAU)
# 50M tweets per day

# Write QPS:
# 50M tweets/day / 86,400 seconds = ~580 tweets/second
# Peak: 3x average = ~1,750 writes/second

# Read QPS:
# Twitter is read-heavy — 100:1 read/write ratio
# 1,750 * 100 = ~175,000 reads/second
# → Need aggressive caching, CDN for media

# Storage per year:
# 1 tweet = 280 chars = ~280 bytes text
# + metadata (user_id, timestamp, etc) = ~500 bytes total
# 50M * 365 = 18B tweets/year
# 18B * 500 bytes = 9TB/year just for tweet text
# Media (images, video): 50x more = ~450TB/year

# Bandwidth:
# Read: 175,000 req/s * 500 bytes = 87.5 MB/s
# Media: add 100x for images = ~8.7 GB/s outbound

# Conclusions from estimation:
# - Need sharded database (9TB/year, 1,750 writes/s)
# - Need massive CDN for media (8.7 GB/s)
# - Need Redis caching for home timeline (175k reads/s impossible without cache)
# - Stateless API servers behind load balancer
</code></pre>
</div>

<h2>CAP Theorem</h2>
<p>In a distributed system you can have at most TWO of:</p>
<ul>
  <li><strong>Consistency:</strong> Every read gets the most recent write (or an error)</li>
  <li><strong>Availability:</strong> Every request gets a response (not guaranteed to be latest)</li>
  <li><strong>Partition tolerance:</strong> System works even when network partitions occur</li>
</ul>
<p>Network partitions always happen in real distributed systems — so the real choice is: <strong>CP</strong> (consistent + partition tolerant, may be unavailable) or <strong>AP</strong> (available + partition tolerant, may return stale data).</p>
<ul>
  <li>CP examples: HBase, Zookeeper — refuse requests during partition to stay consistent</li>
  <li>AP examples: Cassandra, DynamoDB — stay available, risk returning stale data</li>
</ul>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Vertical scaling: bigger machine. Horizontal: more machines. Most systems start vertical, go horizontal.</li>
    <li>RAM access ~100ns. SSD ~100µs. Network ~1ms. Know these for estimation.</li>
    <li>Back-of-envelope: estimate DAU, then QPS (DAU * ops_per_day / 86400), then storage</li>
    <li>Stateless services: no server-side session state → any server can handle any request → horizontal scaling works</li>
    <li>CAP: in practice, choose CP (consistent) or AP (available) during network partition</li>
    <li>Always state assumptions before estimating in system design interviews</li>
  </ul>
</div>
`,
};
