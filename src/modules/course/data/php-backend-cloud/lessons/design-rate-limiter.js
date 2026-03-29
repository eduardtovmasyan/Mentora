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
  segments: [
    { type: 'h2', text: 'Algorithm Comparison' },
    { type: 'table', headers: ['Algorithm', 'Bursts', 'Accuracy', 'Memory'], rows: [
      ['Fixed window', 'Yes (at boundary)', 'Low (boundary spike)', 'O(1)'],
      ['Sliding window log', 'No', 'High', 'O(requests)'],
      ['Sliding window counter', 'Limited', 'Good', 'O(1)'],
      ['Token bucket', 'Yes (up to burst size)', 'High', 'O(1) per user'],
      ['Leaky bucket', 'No (smooth output)', 'High', 'O(1) per user'],
    ]},

    { type: 'h2', text: 'Token Bucket in Redis (Lua for atomicity)' },
    { type: 'code', lang: 'php', label: 'PHP — Redis token bucket', code: `class TokenBucketRateLimiter {
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
}` },

    { type: 'h2', text: 'Sliding Window Counter' },
    { type: 'code', lang: 'php', label: 'PHP — Simple sliding window', code: `class SlidingWindowRateLimiter {
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
}` },

    { type: 'h2', text: 'Laravel Rate Limiting' },
    { type: 'code', lang: 'php', label: 'PHP', code: `// Define in RouteServiceProvider or route file
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
// Headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After` },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Token bucket: allows bursts up to capacity; tokens refill at a fixed rate — most user-friendly',
      'Sliding window: accurate, no boundary spikes, but higher memory for log variant',
      'Use Redis Lua scripts for atomic check-and-update to prevent race conditions',
      'Return 429 status with Retry-After header; clients should implement exponential backoff',
      'Rate limit at multiple levels: IP, user, API key, endpoint — different limits for different tiers',
    ]},
  ],
};
