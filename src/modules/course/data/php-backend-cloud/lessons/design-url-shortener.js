export default {
  phase: 'Phase 5 · System Design',
  title: 'System Design · URL Shortener',
  intro: 'Designing a URL shortener (like bit.ly) is a classic system design interview question. It requires generating unique short codes, storing mappings at scale, handling redirects with minimal latency, and providing analytics. Senior engineers discuss ID generation strategies, caching, database choice, and handling 301 vs 302 redirects.',
  tags: ['Base62 encoding', 'ID generation', 'Redis cache', 'Hash collision', '301 vs 302', 'Analytics'],
  seniorExpectations: [
    'Generate unique 7-character short codes using base62 encoding of auto-increment IDs',
    'Design the data model and choose between SQL and NoSQL',
    'Cache hot URLs in Redis with LRU eviction for sub-millisecond redirects',
    'Explain 301 (permanent) vs 302 (temporary) and the analytics trade-off',
    'Scale to billions of URLs: database sharding, CDN edge redirects',
  ],
  body: `
<h2>Requirements</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">System requirements</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Functional
- POST /shorten  → returns short URL (e.g. https://sho.rt/aB3xYz)
- GET  /:code    → redirects to original URL
- Custom aliases (optional)
- URL expiration (optional)
- Click analytics: count, referrer, geo, device

# Non-functional (scale estimation)
- 100M URLs created per day = ~1157 writes/sec
- 10:1 read:write ratio = ~11,570 redirects/sec
- Average URL = 200 bytes → 100M * 200B = 20GB/day storage
- Short code: 7 chars base62 = 62^7 = 3.5 trillion unique codes
</code></pre>
</div>

<h2>Short Code Generation</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Base62 encoding</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class ShortCodeGenerator {
    private const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    private const BASE    = 62;

    // Convert auto-increment ID to base62 short code
    public function encode(int $id): string {
        $code = '';
        while ($id > 0) {
            $code = self::CHARSET[$id % self::BASE] . $code;
            $id   = intdiv($id, self::BASE);
        }
        return str_pad($code, 7, '0', STR_PAD_LEFT);
    }

    public function decode(string $code): int {
        $id = 0;
        foreach (str_split($code) as $char) {
            $id = $id * self::BASE + strpos(self::CHARSET, $char);
        }
        return $id;
    }
}

// ID 1         → "0000001"
// ID 1000000   → "4c92"
// ID 3.5T max  → 7 chars (62^7 = 3,521,614,606,208)
</code></pre>
</div>

<h2>Data Model</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">CREATE TABLE urls (
    id          BIGSERIAL PRIMARY KEY,
    short_code  VARCHAR(10) NOT NULL UNIQUE,
    long_url    TEXT NOT NULL,
    user_id     BIGINT REFERENCES users(id),
    expires_at  TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW(),
    click_count BIGINT DEFAULT 0  -- denormalized for fast read
);
CREATE INDEX idx_urls_short_code ON urls(short_code);

CREATE TABLE clicks (
    id         BIGSERIAL PRIMARY KEY,
    url_id     BIGINT NOT NULL REFERENCES urls(id),
    clicked_at TIMESTAMP DEFAULT NOW(),
    referrer   TEXT,
    ip_hash    VARCHAR(64), -- hashed for privacy
    user_agent TEXT
);
-- Partition clicks by month for efficient purging
</code></pre>
</div>

<h2>Redirect Service with Redis Cache</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel controller</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class RedirectController extends Controller {
    public function redirect(string $code): RedirectResponse {
        // L1: Redis cache hit (sub-millisecond)
        $longUrl = Redis::get("url:{$code}");

        if (!$longUrl) {
            // L2: Database lookup
            $url = Url::where('short_code', $code)
                ->where(fn($q) => $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now()))
                ->firstOrFail();

            $longUrl = $url->long_url;
            Redis::setex("url:{$code}", 86400, $longUrl); // cache 24h
        }

        // Track click asynchronously (don't block the redirect)
        RecordClick::dispatch($code, request()->ip(), request()->userAgent())
            ->onQueue('analytics');

        // 302: temporary redirect — browser won't cache, analytics accurate
        // 301: permanent redirect — browser caches, no future requests (no analytics)
        return redirect($longUrl, 302);
    }
}
</code></pre>
</div>

<h2>Architecture Overview</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">System diagram</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">Write path:
Client → API → Validate URL → DB insert (get auto-increment ID) → encode to base62 → return short URL

Read path (optimized):
Client → CDN edge (cached redirects for popular URLs, 0ms)
       → Load Balancer → App Server → Redis (L1 cache, ~1ms)
                                    → PostgreSQL (L2, ~5ms)
       → 302 redirect to long URL

Analytics path (async):
Redirect → SQS queue → Analytics Worker → ClickHouse / DynamoDB
</code></pre>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: How do you prevent hash collisions?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Using auto-increment IDs with base62 encoding guarantees uniqueness — each ID maps to exactly one code. Hash-based approaches (MD5/SHA of URL) do have collision risk; resolve with sequential probing. Custom aliases must be validated with a unique DB constraint.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Base62 encoding of auto-increment ID = unique, compact, no collision risk</li>
    <li>7 chars base62 = 62^7 ≈ 3.5 trillion codes — enough for any realistic scale</li>
    <li>302 redirect: browser fetches every time → analytics work; 301: browser caches → no repeat requests, no analytics</li>
    <li>Redis LRU cache for hot URLs: 80% of traffic hits 20% of URLs (Pareto principle)</li>
    <li>Scale writes: use a distributed ID generator (Snowflake, UUIDs) to remove DB auto-increment bottleneck</li>
  </ul>
</div>
`,
};
