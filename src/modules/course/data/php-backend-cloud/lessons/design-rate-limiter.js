export default {
  phase: 'Phase 5 · System Design',
  title: 'System Design · Rate Limiter',
  intro: 'A rate limiter controls the rate of requests a user or service can make, preventing abuse and protecting downstream services. Common algorithms: token bucket (bursts allowed), leaky bucket (smooth output), fixed window, sliding window. Redis is the standard backend for distributed rate limiting.',
  tags: ['Token bucket', 'Sliding window', 'Redis', 'Lua scripts', 'API gateway', 'Throttling'],
  seniorExpectations: [
    'Explain and compare token bucket, leaky bucket, fixed window, and sliding window algorithms',
    'Implement a distributed rate limiter using Redis atomic operations',
    'Handle rate limit responses: 429 status, Retry-After header',
    'Design rate limiting at multiple levels: per user, per IP, per API key, per endpoint',
    'Implement rate limiting in Laravel middleware',
  ],
  body: `
<h2>Algorithm Comparison</h2>
<table class="ctable">
  <thead><tr><th>Algorithm</th><th>Bursts</th><th>Accuracy</th><th>Memory</th></tr></thead>
  <tbody>
    <tr><td>Fixed window</td><td>Yes (at boundary)</td><td>Low (boundary spike)</td><td>O(1)</td></tr>
    <tr><td>Sliding window log</td><td>No</td><td>High</td><td>O(requests)</td></tr>
    <tr><td>Sliding window counter</td><td>Limited</td><td>Good</td><td>O(1)</td></tr>
    <tr><td>Token bucket</td><td>Yes (up to burst size)</td><td>High</td><td>O(1) per user</td></tr>
    <tr><td>Leaky bucket</td><td>No (smooth output)</td><td>High</td><td>O(1) per user</td></tr>
  </tbody>
</table>

<h2>Token Bucket in Redis (Lua for atomicity)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Redis token bucket</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class TokenBucketRateLimiter {
    private Redis $redis;
    private int $capacity;    // max tokens
    private int $refillRate;  // tokens per second

    public function __construct(Redis $redis, int $capacity = 100, int $refillRate = 10) {
        $this->redis      = $redis;
        $this->capacity   = $capacity;
        $this->refillRate = $refillRate;
    }

    public function allow(string $key): bool {
        $script = <<<'LUA'
            local key       = KEYS[1]
            local capacity  = tonumber(ARGV[1])
            local refill    = tonumber(ARGV[2])
            local now       = tonumber(ARGV[3])

            local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
            local tokens     = tonumber(bucket[1]) or capacity
            local last_refill = tonumber(bucket[2]) or now

            -- Refill tokens based on elapsed time
            local elapsed = now - last_refill
            tokens = math.min(capacity, tokens + elapsed * refill)

            if tokens < 1 then
                return 0  -- rate limited
            end

            tokens = tokens - 1
            redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
            redis.call('EXPIRE', key, 3600)
            return 1  -- allowed
        LUA;

        return (bool) $this->redis->eval(
            $script, 1, $key,
            $this->capacity, $this->refillRate, time()
        );
    }
}
</code></pre>
</div>

<h2>Sliding Window Counter</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Simple sliding window</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class SlidingWindowRateLimiter {
    public function __construct(
        private Redis  $redis,
        private int    $limit    = 100,
        private int    $windowMs = 60_000,
    ) {}

    public function allow(string $identifier): bool {
        $key = "ratelimit:{$identifier}";
        $now = (int)(microtime(true) * 1000);
        $windowStart = $now - $this->windowMs;

        // Atomic: remove old entries + add current + count
        $this->redis->multi();
        $this->redis->zRemRangeByScore($key, '-inf', $windowStart);
        $this->redis->zAdd($key, $now, "{$now}-" . uniqid());
        $this->redis->zCard($key);
        $this->redis->expire($key, (int)($this->windowMs / 1000) + 1);
        $results = $this->redis->exec();

        return $results[2] <= $this->limit;
    }
}
</code></pre>
</div>

<h2>Laravel Rate Limiting</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Define in RouteServiceProvider or route file
RateLimiter::for('api', function (Request $request) {
    return $request->user()
        ? Limit::perMinute(60)->by($request->user()->id)
        : Limit::perMinute(10)->by($request->ip());
});

// Apply to routes
Route::middleware(['throttle:api'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
});

// Response when limited: 429 Too Many Requests
// Headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Token bucket: allows bursts up to capacity; tokens refill at a fixed rate — most user-friendly</li>
    <li>Sliding window: accurate, no boundary spikes, but higher memory for log variant</li>
    <li>Use Redis Lua scripts for atomic check-and-update to prevent race conditions</li>
    <li>Return 429 status with Retry-After header; clients should implement exponential backoff</li>
    <li>Rate limit at multiple levels: IP, user, API key, endpoint — different limits for different tiers</li>
  </ul>
</div>
`,
};
