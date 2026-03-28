export default {
  phase: 'Phase 4 · Databases & APIs',
  title: 'Caching Strategies & Cache Invalidation',
  intro: 'Caching is one of the highest-leverage performance techniques available to backend engineers. Done correctly, it can reduce database load by orders of magnitude and cut response times from hundreds of milliseconds to single digits. Done incorrectly, it serves stale data, causes thundering-herd outages, or grows unboundedly until memory is exhausted. This lesson covers every major caching pattern — cache-aside, read-through, write-through, write-behind — plus the notoriously tricky problems of cache invalidation, cache stampede, TTL design, Redis integration in Laravel, and HTTP-level caching with ETags and Cache-Control headers.',
  tags: ['caching', 'redis', 'laravel', 'performance', 'http-caching', 'cdn', 'ttl', 'invalidation'],
  seniorExpectations: [
    'Explain the difference between cache-aside and read-through and when to prefer each',
    'Describe cache stampede and implement a mutex-lock or probabilistic early-expiration solution',
    'Design a TTL strategy that balances freshness with hit rate for a given access pattern',
    'Implement cache invalidation by dependency tagging rather than time-only expiration',
    'Configure Cache-Control and ETag headers correctly for browser and CDN caching',
    'Identify when a CDN edge cache is appropriate vs an application-level Redis cache',
  ],
  body: `
<h2>Why Caching Exists and Where It Lives</h2>
<p>Every layer of a modern web stack has its own cache: the CPU has L1/L2/L3 caches, the OS has page caches, databases have buffer pools, applications have in-process caches, distributed caches like Redis sit between the app and the database, CDN edge nodes cache HTTP responses, and browsers cache assets locally. As a senior engineer you must reason about which layer to target for a given problem. In-process (APCu in PHP) is fastest but not shared across pods. Redis is shared, durable-optional, and supports rich data structures. CDN caching offloads origin entirely for public content. Choosing the wrong layer — e.g., caching user-specific data on a CDN — causes serious security and correctness bugs.</p>

<h2>Cache-Aside (Lazy Loading)</h2>
<p>Cache-aside is the most common pattern. The application checks the cache first; on a miss it reads from the database, writes the result into the cache, then returns it. The cache is populated lazily — only entries that are actually requested get cached. This avoids pre-warming overhead but means the first request after a cold start (or expiry) always pays the full database cost.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Laravel cache-aside with Redis
class ProductRepository
{
    public function find(int $id): ?Product
    {
        $cacheKey = "product:{$id}";

        // 1. Check cache
        $cached = Cache::get($cacheKey);
        if ($cached !== null) {
            return $cached;
        }

        // 2. Miss — query DB
        $product = Product::find($id);
        if ($product === null) {
            return null;
        }

        // 3. Populate cache with TTL
        Cache::put($cacheKey, $product, now()->addMinutes(60));

        return $product;
    }

    public function update(int $id, array $data): Product
    {
        $product = Product::findOrFail($id);
        $product->update($data);

        // Invalidate on write
        Cache::forget("product:{$id}");

        return $product->fresh();
    }
}
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Tip</div>
  <p>Cache null results too ("negative caching"). If a product does not exist, caching that negative result for 30 seconds prevents a database hit on every repeated request for a non-existent ID — a common denial-of-service vector called cache penetration.</p>
</div>

<h2>Read-Through, Write-Through, and Write-Behind</h2>
<p><strong>Read-through</strong> is cache-aside where the cache library itself fetches from the database on a miss — the application only ever talks to the cache. <strong>Write-through</strong> writes to both the cache and the database synchronously on every mutation; this keeps the cache always warm but doubles write latency. <strong>Write-behind (write-back)</strong> writes only to the cache immediately and flushes to the database asynchronously; this gives low write latency at the cost of potential data loss if the cache node crashes before flushing. Use write-through for data where consistency is critical (financial balances). Use write-behind only when write throughput is the bottleneck and you can tolerate brief data loss (analytics counters).</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Write-through pattern — write to cache AND DB atomically
class InventoryService
{
    public function decrement(int $productId, int $qty): void
    {
        DB::transaction(function () use ($productId, $qty) {
            // Write to DB first inside transaction
            $affected = DB::table('inventory')
                ->where('product_id', $productId)
                ->where('quantity', '>=', $qty)
                ->decrement('quantity', $qty);

            if ($affected === 0) {
                throw new InsufficientStockException();
            }

            // Synchronously update the cache to keep it consistent
            $newQty = DB::table('inventory')
                ->where('product_id', $productId)
                ->value('quantity');

            Cache::put("inventory:{$productId}", $newQty, now()->addMinutes(30));
        });
    }
}

// Write-behind using a queue — fire-and-forget to DB
class ViewCountService
{
    public function increment(int $articleId): void
    {
        // Immediately update Redis counter (fast)
        $count = Cache::increment("views:{$articleId}");

        // Every 100 views, flush to DB asynchronously
        if ($count % 100 === 0) {
            FlushViewCountJob::dispatch($articleId, $count)->onQueue('low');
        }
    }
}
</code></pre>
</div>

<h2>TTL Strategy Design</h2>
<p>TTL (time-to-live) is not just "how long should this be cached" — it is a staleness budget. Short TTLs reduce staleness but increase cache-miss rate and database pressure. Long TTLs improve hit rate but risk serving outdated data. Senior engineers match TTL to the domain: user session tokens might be 15 minutes, a product catalog 60 minutes, a static configuration object 24 hours, and a leaderboard 10 seconds. Add random jitter (±10–20%) to TTLs on hot keys to prevent synchronized mass expiry across a cluster.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// TTL with jitter to prevent thundering herd on bulk expiry
function ttlWithJitter(int $baseSeconds, float $jitterFraction = 0.1): int
{
    $jitter = (int) ($baseSeconds * $jitterFraction);
    return $baseSeconds + random_int(-$jitter, $jitter);
}

Cache::put('leaderboard', $data, ttlWithJitter(60));       // ~54–66s
Cache::put('product_catalog', $catalog, ttlWithJitter(3600)); // ~3240–3960s
</code></pre>
</div>

<h2>Cache Invalidation — The Hardest Problem</h2>
<p>Phil Karlton's famous quote: "There are only two hard things in Computer Science: cache invalidation and naming things." Time-based invalidation (TTL alone) is lazy and imprecise. Event-driven invalidation is precise: when an entity changes, immediately delete or update its cache entry. The challenge is fanout — a single entity change may invalidate dozens of cache keys. Use cache tags (supported by Redis and Memcached drivers in Laravel) to group related keys so you can invalidate an entire logical group atomically.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Laravel cache tags — requires Redis or Memcached driver
class CategoryProductCache
{
    public function getProductsForCategory(int $categoryId): Collection
    {
        return Cache::tags(["category:{$categoryId}", 'products'])
            ->remember("products:category:{$categoryId}", 3600, function () use ($categoryId) {
                return Product::where('category_id', $categoryId)
                    ->with('images', 'variants')
                    ->get();
            });
    }

    // When a product is updated, flush all category caches that contain it
    public function invalidateProduct(Product $product): void
    {
        // Invalidate the specific product key
        Cache::tags(["product:{$product->id}"])->flush();

        // Invalidate the category listing that contains this product
        Cache::tags(["category:{$product->category_id}"])->flush();
    }

    // When a category is deleted, flush everything tagged with it
    public function invalidateCategory(int $categoryId): void
    {
        Cache::tags(["category:{$categoryId}"])->flush();
    }
}
</code></pre>
</div>

<h2>Cache Stampede and Solutions</h2>
<p>A cache stampede (also called thundering herd) happens when a popular cache key expires and many concurrent requests simultaneously find a cache miss and all hit the database simultaneously. This can overload the database and cause cascading failures. There are three main mitigations: (1) <strong>Mutex lock</strong> — only one request regenerates the cache; others wait or serve stale. (2) <strong>Probabilistic early expiration (XFetch)</strong> — each request has a small probability of treating the cache as expired before it actually expires, so cache warming is spread out. (3) <strong>Background refresh</strong> — a scheduled job pre-warms the cache before it expires.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Mutex lock with Redis to prevent stampede
class StampedeProtectedCache
{
    public function get(string $key, int $ttl, callable $callback): mixed
    {
        $value = Cache::get($key);
        if ($value !== null) {
            return $value;
        }

        $lockKey = "lock:{$key}";

        // Try to acquire lock (expires in 10s to prevent deadlock)
        $lock = Cache::lock($lockKey, 10);

        if ($lock->get()) {
            try {
                // Double-check after acquiring lock (another worker may have populated)
                $value = Cache::get($key);
                if ($value !== null) {
                    return $value;
                }

                $value = $callback();
                Cache::put($key, $value, $ttl);
                return $value;
            } finally {
                $lock->release();
            }
        }

        // Could not get lock — wait briefly and retry (serve stale if available)
        usleep(100_000); // 100ms
        return Cache::get($key) ?? $callback();
    }
}

// XFetch probabilistic early expiration
function xfetch(string $key, int $ttl, float $beta, callable $compute): mixed
{
    $stored = Cache::get($key . ':meta');

    if ($stored !== null) {
        [$value, $expiry, $delta] = $stored;
        // Probabilistically decide if we should refresh early
        if ((-$delta * $beta * log(random_int(1, PHP_INT_MAX) / PHP_INT_MAX)) < ($expiry - time())) {
            return $value;
        }
    }

    $start = microtime(true);
    $value = $compute();
    $delta = microtime(true) - $start; // time it took to compute
    $expiry = time() + $ttl;

    Cache::put($key . ':meta', [$value, $expiry, $delta], $ttl);
    return $value;
}
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Tip</div>
  <p>Laravel's <code>Cache::lock()</code> is backed by Redis atomic SETNX under the hood. Always use a try/finally block to ensure the lock is released even if the callback throws an exception, preventing permanent deadlocks.</p>
</div>

<h2>HTTP Caching: Cache-Control, ETags, and CDN</h2>
<p>HTTP caching is free performance for public content. The <code>Cache-Control</code> header tells browsers and CDNs how long to cache a response. <code>ETag</code> is a fingerprint of the response; on the next request the browser sends <code>If-None-Match</code> and the server can respond with 304 Not Modified (no body transfer). <code>Last-Modified</code> / <code>If-Modified-Since</code> is a time-based equivalent. CDNs (CloudFront, Cloudflare) respect these headers and cache responses at edge locations globally, eliminating round-trips to your origin server for cacheable content.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Laravel HTTP response with proper caching headers
class ProductController extends Controller
{
    public function show(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $etag = md5($product->updated_at->timestamp . $product->id);
        $lastModified = $product->updated_at->toRfc7231String();

        // Check if client already has the current version
        if (request()->header('If-None-Match') === $etag) {
            return response()->json(null, 304);
        }

        return response()->json($product)
            ->header('ETag', $etag)
            ->header('Last-Modified', $lastModified)
            ->header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60')
            ->header('Vary', 'Accept-Encoding, Accept-Language');
    }

    public function index(): JsonResponse
    {
        // Private user-specific data — never cache publicly
        return response()->json(auth()->user()->orders)
            ->header('Cache-Control', 'private, no-store');
    }
}

// CDN Cache-Control directives:
// public           — CDN may cache this
// max-age=300      — browser caches for 5 minutes
// s-maxage=3600    — CDN caches for 1 hour (overrides max-age for shared caches)
// stale-while-revalidate=60 — serve stale for 60s while refreshing in background
// no-store         — never cache (sensitive data)
// no-cache         — must revalidate before serving (ETag flow)
</code></pre>
</div>

<h2>Redis in Laravel</h2>
<p>Laravel's cache abstraction supports multiple drivers. Redis is the preferred driver for production because it supports cache tags, atomic operations (INCR, SETNX), pub/sub, and persistence. Configure your <code>.env</code> to use the Redis driver and ensure the Predis or PhpRedis extension is installed. Use separate Redis databases or key prefixes to isolate cache, session, and queue data. Enable Redis Cluster or Redis Sentinel for high availability in production.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// config/database.php Redis configuration
'redis' => [
    'client' => env('REDIS_CLIENT', 'phpredis'),

    'cache' => [
        'url'      => env('REDIS_URL'),
        'host'     => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port'     => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_CACHE_DB', '1'), // Separate DB from sessions/queues
    ],
],

// Direct Redis commands via Facade for operations beyond simple cache
use Illuminate\Support\Facades\Redis;

class RateLimitService
{
    public function attempt(string $key, int $maxAttempts, int $windowSeconds): bool
    {
        $current = Redis::incr($key);

        if ($current === 1) {
            // First request in this window — set expiry
            Redis::expire($key, $windowSeconds);
        }

        return $current <= $maxAttempts;
    }
}

// Atomic pipeline for multiple operations
Redis::pipeline(function ($pipe) use ($userId) {
    $pipe->incr("user:{$userId}:page_views");
    $pipe->expire("user:{$userId}:page_views", 86400);
    $pipe->zadd('active_users', time(), $userId);
});
</code></pre>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: What is cache penetration and how do you prevent it?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Cache penetration occurs when requests are made for keys that do not exist in either the cache or the database — every request misses the cache and hits the database. This can be exploited as a denial-of-service attack. Prevention strategies: (1) <strong>Negative caching</strong> — cache the "not found" result with a short TTL (e.g., 30 seconds) so repeated requests for the same non-existent key are served from cache. (2) <strong>Bloom filter</strong> — maintain a bloom filter of all valid IDs; if the requested ID is not in the bloom filter, return 404 immediately without touching the cache or database. Laravel does not have a built-in bloom filter, but you can use a Redis bit field as an approximation.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: What is the difference between cache eviction and cache invalidation?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p><strong>Cache eviction</strong> is what happens when the cache is full and needs to make room for new entries — the cache itself decides which entries to remove based on an eviction policy (LRU — least recently used, LFU — least frequently used, TTL expiry, random). Eviction is a resource management mechanism. <strong>Cache invalidation</strong> is an explicit, business-logic-driven action: you tell the cache to remove or update a specific entry because the underlying data has changed. Invalidation is about correctness; eviction is about memory management. Both can cause cache misses, but only poor invalidation strategy causes stale data to be served.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: When should you NOT use cache tags in Laravel?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Cache tags are only supported by the Redis and Memcached drivers. If you are using the file or database cache driver (common in small apps or testing), cache tags will throw an exception. Additionally, cache tags in Redis use a secondary data structure to track which keys belong to a tag — this adds memory overhead and one extra Redis round-trip per cache operation. For extremely high-throughput scenarios where every microsecond counts, directly managing cache keys without tags and accepting more explicit invalidation logic can be faster. Always benchmark before optimizing at this level.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Cache-aside (lazy loading) is the most flexible pattern; the application controls all cache reads and writes explicitly.</li>
    <li>Write-through keeps cache and DB in sync at the cost of write latency; write-behind sacrifices durability for write speed.</li>
    <li>TTL alone is not a cache invalidation strategy — combine event-driven invalidation with TTL as a safety net.</li>
    <li>Cache stampede happens when a hot key expires and all concurrent requests hit the DB simultaneously; solve it with mutex locks, probabilistic early expiration, or background pre-warming.</li>
    <li>Use cache tags in Laravel (Redis driver) to group related keys so an entire logical group can be invalidated atomically.</li>
    <li>HTTP Cache-Control and ETag headers enable browser and CDN caching — always set <code>private, no-store</code> for authenticated or sensitive responses.</li>
    <li>Add random jitter (±10–20%) to TTLs on hot keys to prevent synchronized mass expiry across a Redis cluster.</li>
    <li>Negative caching (caching "not found" results) prevents cache penetration attacks that would otherwise hammer the database.</li>
  </ul>
</div>
`,
};
