export default {
  phase: 'Phase 6 · Security & Performance',
  title: 'PHP Performance Optimisation',
  intro: 'Performance is not an afterthought — it is a first-class engineering concern. PHP applications in production live and die by OPcache hit rates, FPM pool tuning, and the discipline to catch N+1 queries before they reach production. This lesson covers the full stack of PHP performance tooling and techniques expected of a senior engineer: profiling with Xdebug, Blackfire, and Tideways; OPcache and preloading; FPM pool sizing; memory management; and architectural patterns like lazy loading that prevent waste at the object level.',
  tags: ['opcache', 'xdebug', 'blackfire', 'php-fpm', 'n+1', 'profiling', 'performance', 'preload'],
  seniorExpectations: [
    'Explain OPcache internals and how opcache.preload eliminates repeated compilation overhead',
    'Read a Blackfire or Tideways flame graph and identify the critical path',
    'Diagnose and fix N+1 query problems in an ORM-heavy codebase',
    'Size PHP-FPM pools correctly using the formula: RAM / average worker memory',
    'Articulate trade-offs between memory_limit, object pooling, and lazy instantiation',
    'Know when profiling in production is safe and how to use sampling profilers (Tideways) vs tracing profilers (Xdebug)',
  ],
  body: `
<h2>OPcache: PHP's Bytecode Cache</h2>
<p>Every PHP request without OPcache compiles every included file from source to opcode. OPcache stores compiled bytecode in shared memory so subsequent requests skip compilation entirely. On a warm cache, file parsing overhead drops to near zero — this alone can cut response times by 30–60% on large frameworks like Laravel.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">INI</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-ini">; php.ini — production OPcache settings
opcache.enable=1
opcache.memory_consumption=256        ; MB of shared memory for bytecode
opcache.interned_strings_buffer=16    ; MB for interned strings pool
opcache.max_accelerated_files=20000   ; must exceed your file count (find . -name "*.php" | wc -l)
opcache.validate_timestamps=0         ; DISABLE in production — files never recompiled on change
opcache.revalidate_freq=0             ; irrelevant when validate_timestamps=0
opcache.save_comments=1               ; required by Doctrine annotations, PHPStan
opcache.enable_cli=0                  ; usually off unless running preload via CLI
opcache.jit=trampoline                ; PHP 8.x JIT — best mode for web workloads
opcache.jit_buffer_size=64M
</code></pre>
</div>

<div class="callout callout-warn">
  <div class="callout-title">Warning</div>
  <p>Setting <code>validate_timestamps=0</code> means OPcache never picks up file changes. You MUST restart PHP-FPM or call <code>opcache_reset()</code> after every deployment. Forgetting this is one of the most common causes of "my code change isn't taking effect" in production.</p>
</div>

<h2>opcache.preload (PHP 8.0+)</h2>
<p>Preloading goes a step further than OPcache caching: a designated PHP script runs once at FPM startup and loads a curated set of classes into shared memory permanently. Those classes are available in every worker without any file I/O or compilation. Laravel ships a preload generator via <code>php artisan optimize</code> that produces a <code>preload.php</code> listing framework and application classes.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">INI</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-ini">; php.ini
opcache.preload=/var/www/app/preload.php
opcache.preload_user=www-data          ; required when running FPM as root
</code></pre>
</div>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// preload.php — minimal example
$files = require __DIR__ . '/vendor/composer/autoload_classmap.php';

foreach (array_values($files) as $file) {
    if (str_starts_with($file, __DIR__ . '/vendor/laravel/')) {
        opcache_compile_file($file);
    }
}
</code></pre>
</div>

<div class="callout callout-info">
  <div class="callout-title">Info</div>
  <p>Preloaded classes cannot be unloaded short of restarting FPM. In development this is impractical — only enable preloading in production containers where restarts are part of the deploy pipeline.</p>
</div>

<h2>Profiling: Xdebug, Blackfire, and Tideways</h2>
<p>Profiling falls into two categories: <strong>tracing profilers</strong> record every function call (Xdebug) — extremely detailed but carry a 10–100x overhead, making them development-only tools. <strong>Sampling profilers</strong> (Tideways, Datadog APM) interrupt execution at intervals to build a statistical picture with typically under 5% overhead, making them safe in production. Blackfire is a hybrid: it instruments specific requests on demand via a browser extension or CLI probe.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Triggering an Xdebug profile dump programmatically (dev only)
xdebug_start_profiling();

$result = runExpensiveOperation();

xdebug_stop_profiling();
// Output: cachegrind.out.{pid} — open with KCachegrind or Webgrind
</code></pre>
</div>

<p>Blackfire's CLI lets you profile any script without touching application code:</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">Bash</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Profile a single HTTP request
blackfire curl https://app.local/api/orders

# Profile a PHP script
blackfire run php artisan queue:work --once

# Compare two profiles to measure a regression
blackfire run --reference=1 php bench.php
</code></pre>
</div>

<h2>The N+1 Query Problem</h2>
<p>N+1 is the single most common performance issue in ORM-heavy PHP applications. It occurs when fetching a collection of N records causes N additional queries — one per record — to load a related model. The fix is always eager loading. Identifying it requires a query log or a tool like Laravel Debugbar, Clockwork, or Telescope.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// BAD — N+1: 1 query to get orders, then 1 per order to get user
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->user->name; // lazy loads user every iteration
}

// GOOD — eager loading collapses to 2 queries total
$orders = Order::with('user')->get();
foreach ($orders as $order) {
    echo $order->user->name; // already in memory
}

// BETTER — select only needed columns to reduce memory and I/O
$orders = Order::with(['user:id,name,email'])
    ->select(['id', 'user_id', 'total', 'created_at'])
    ->whereStatus('completed')
    ->get();
</code></pre>
</div>

<div class="callout callout-warn">
  <div class="callout-title">Warning</div>
  <p>Eager loading all relations on all queries is equally harmful. Loading 10,000 related records into PHP memory to display a paginated list of 25 rows is a memory leak, not a performance improvement. Eager load only what the current request renders.</p>
</div>

<h2>PHP-FPM Pool Configuration</h2>
<p>PHP-FPM manages a pool of worker processes that serve requests. Pool size is the most impactful single tuning lever: too few workers and requests queue; too many and the server swaps. The formula is straightforward: <code>max_children = available_RAM / average_worker_RSS</code>. Measure worker RSS with <code>ps --no-headers -o rss -C php-fpm | awk '{sum+=$1} END {print sum/NR/1024 " MB"}'</code>.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">INI</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-ini">; /etc/php/8.3/fpm/pool.d/www.conf
[www]
pm = dynamic
pm.max_children = 50          ; hard ceiling — never exceed available RAM
pm.start_servers = 10         ; warm start to avoid cold-start latency
pm.min_spare_servers = 5
pm.max_spare_servers = 20
pm.max_requests = 500         ; recycle workers to prevent memory leaks from extensions
pm.request_terminate_timeout = 30s

; For CPU-bound workloads, consider pm = static with max_children = nCPU * 2
</code></pre>
</div>

<h2>memory_limit Tuning and Reducing Object Allocations</h2>
<p>PHP's garbage collector is generational but still imposes overhead proportional to the number of live objects. Senior engineers reduce allocations by preferring value arrays over DTOs for internal processing, reusing buffer objects, and using generators instead of materialising full collections into memory. <code>memory_limit</code> should be set per pool context — CLI workers processing large imports legitimately need more memory than web workers serving API responses.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// BAD — loads entire 1M row result set into a PHP array
function exportAllOrders(): array {
    return Order::all()->toArray(); // exhausts memory_limit
}

// GOOD — generator streams rows one at a time
function exportAllOrders(): \Generator {
    Order::query()
        ->select(['id', 'total', 'created_at'])
        ->chunkById(1000, function (Collection $chunk) {
            foreach ($chunk as $order) {
                yield $order->toArray();
            }
        });
}

// GOOD — lazy collection for in-memory pipeline
Order::lazy()->each(function (Order $order) {
    // processes one at a time, never loads all into RAM
    dispatch(new ExportOrderJob($order->id));
});
</code></pre>
</div>

<h2>Lazy Loading at the Architecture Level</h2>
<p>Lazy loading is not just an ORM concept. At the service-container level it means deferring the instantiation of expensive services until they are actually needed. Laravel's service providers support deferred registration with the <code>$defer</code> property. At the object level, lazy proxies (Symfony's <code>LazyGhostTrait</code>, or PHP 8.4 native lazy objects) wrap a class and only construct the real instance on first property access.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Deferred Laravel service provider
class ReportingServiceProvider extends ServiceProvider
{
    // This service is only registered when first resolved from the container
    protected $defer = true;

    public function register(): void
    {
        $this->app->singleton(ReportingEngine::class, function ($app) {
            // Expensive: opens DB connections, loads config, warms caches
            return new ReportingEngine(
                $app->make(ReportRepository::class),
                config('reporting')
            );
        });
    }

    public function provides(): array
    {
        return [ReportingEngine::class];
    }
}
</code></pre>
</div>

<h2>Common Bottlenecks Checklist</h2>
<p>Performance investigations follow a predictable pattern. Work through this checklist before reaching for architectural changes — most production issues are resolved at the query or cache layer.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">Bash</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># 1. OPcache hit rate — should be > 99% in production
php -r "print_r(opcache_get_status()['opcache_statistics']);"

# 2. Slow query log (MySQL) — catch anything > 100ms
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.1;
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

# 3. FPM listen queue — non-zero means workers are saturated
grep "listen queue" /var/log/php-fpm/www.log

# 4. Memory per worker
ps --no-headers -o rss,comm -C php-fpm | sort -rn | head -5
</code></pre>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Why is Xdebug's tracing profiler unsuitable for production use?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Xdebug instruments every function call, recording entry and exit timestamps, argument values, and memory snapshots. This overhead is multiplicative — a request that takes 50ms normally may take 500ms–5s under Xdebug tracing. The resulting cachegrind files are also large (tens of MB per request). In production this would cause immediate latency spikes and disk exhaustion. Sampling profilers like Tideways interrupt execution statistically (e.g., every 10ms) and impose under 2% overhead, making them safe to run continuously in production.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: How do you calculate the correct pm.max_children value for a PHP-FPM pool?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Measure the average RSS (resident set size) of your FPM workers under realistic load using <code>ps --no-headers -o rss -C php-fpm</code>. Divide the RAM available to FPM (total RAM minus OS, MySQL, Redis, etc.) by that average. For example: 4 GB available, 80 MB average worker = 51 max_children. Round down to leave headroom. Set <code>pm.max_requests</code> to periodically recycle workers and prevent slow memory leaks from C extensions from accumulating over days.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: What is opcache.preload and when should you use it?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>opcache.preload specifies a PHP script that runs once when PHP-FPM starts. That script uses <code>opcache_compile_file()</code> or <code>require</code> to load classes into shared memory permanently. All subsequent workers share those compiled classes with zero I/O cost. It is most beneficial for large frameworks (Laravel, Symfony) where the same 2,000–5,000 framework files are loaded on every request. Use it only in production where FPM restarts are part of the deployment process, since preloaded classes cannot be updated without a restart.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Set <code>opcache.validate_timestamps=0</code> in production and restart FPM on every deploy to ensure cache consistency.</li>
    <li>opcache.preload (PHP 8.0+) loads framework classes into shared memory at FPM startup, eliminating per-request compilation for the hottest code paths.</li>
    <li>Use Blackfire or Tideways for profiling — Xdebug tracing is development-only due to its multiplicative overhead.</li>
    <li>N+1 queries are the #1 ORM performance killer; fix with eager loading but only load what the current request renders.</li>
    <li>Size FPM pools with: <code>max_children = available_RAM / average_worker_RSS</code>; set <code>max_requests</code> to recycle workers.</li>
    <li>Prefer generators and lazy collections over materialising entire datasets into PHP arrays.</li>
    <li>Deferred service providers and lazy proxies prevent instantiation of expensive services until first use.</li>
    <li>Always check OPcache hit rate, slow query log, FPM listen queue, and per-worker memory before reaching for architectural changes.</li>
  </ul>
</div>
`,
};
