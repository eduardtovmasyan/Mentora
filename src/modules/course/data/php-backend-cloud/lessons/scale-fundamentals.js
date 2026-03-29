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
  segments: [
    { type: 'h2', text: 'Horizontal vs Vertical Scaling' },
    { type: 'ul', items: [
      '<strong>Vertical scaling (scale up):</strong> Bigger server — more CPU, RAM, faster storage. Simple, no code changes, but has a hard limit and single point of failure. Good for: databases (initially).',
      '<strong>Horizontal scaling (scale out):</strong> More servers. Unlimited ceiling, fault tolerant. Requires stateless application design and a load balancer. Good for: web/API servers, workers.',
    ]},

    { type: 'h2', text: 'Latency Numbers Every Developer Should Know' },
    { type: 'code', lang: 'bash', label: 'Reference — Latency Numbers', code: `L1 cache reference              ~0.5 ns
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
# Cache everything that's expensive to recompute` },

    { type: 'h2', text: 'Back-of-Envelope Estimation' },
    { type: 'code', lang: 'bash', label: 'System Design — Estimation Example', code: `# Example: Design Twitter. Estimate scale first.

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
# - Stateless API servers behind load balancer` },

    { type: 'h2', text: 'CAP Theorem' },
    { type: 'p', html: 'In a distributed system you can have at most TWO of:' },
    { type: 'ul', items: [
      '<strong>Consistency:</strong> Every read gets the most recent write (or an error)',
      '<strong>Availability:</strong> Every request gets a response (not guaranteed to be latest)',
      '<strong>Partition tolerance:</strong> System works even when network partitions occur',
    ]},
    { type: 'p', html: 'Network partitions always happen in real distributed systems — so the real choice is: <strong>CP</strong> (consistent + partition tolerant, may be unavailable) or <strong>AP</strong> (available + partition tolerant, may return stale data).' },
    { type: 'ul', items: [
      'CP examples: HBase, Zookeeper — refuse requests during partition to stay consistent',
      'AP examples: Cassandra, DynamoDB — stay available, risk returning stale data',
    ]},

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Vertical scaling: bigger machine. Horizontal: more machines. Most systems start vertical, go horizontal.',
      'RAM access ~100ns. SSD ~100µs. Network ~1ms. Know these for estimation.',
      'Back-of-envelope: estimate DAU, then QPS (DAU * ops_per_day / 86400), then storage',
      'Stateless services: no server-side session state → any server can handle any request → horizontal scaling works',
      'CAP: in practice, choose CP (consistent) or AP (available) during network partition',
      'Always state assumptions before estimating in system design interviews',
    ]},
  ],
};
