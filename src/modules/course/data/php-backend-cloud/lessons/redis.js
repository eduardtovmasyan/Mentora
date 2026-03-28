export default {
  phase: 'Phase 4 · Databases & APIs',
  title: 'Redis — All Data Types',
  intro: 'Redis is an in-memory data structure store used as a cache, message broker, and real-time database. Its five core data types — Strings, Hashes, Lists, Sets, and Sorted Sets — each solve specific problems. Senior engineers choose the right type, configure persistence, set TTLs, and use Redis for rate limiting, sessions, and leaderboards.',
  tags: ['Strings', 'Hashes', 'Lists', 'Sets', 'Sorted Sets', 'Pub/Sub', 'Persistence', 'Lua'],
  seniorExpectations: [
    'Know all 5 core data types and choose the right one for each use case',
    'Implement cache-aside, write-through, and write-behind caching patterns',
    'Use Redis for rate limiting, session storage, leaderboards, and pub/sub',
    'Configure RDB vs AOF persistence and understand the durability trade-offs',
    'Use MULTI/EXEC transactions and Lua scripts for atomic operations',
  ],
  body: `
<h2>Core Data Types</h2>
<table class="ctable">
  <thead><tr><th>Type</th><th>Commands</th><th>Use case</th></tr></thead>
  <tbody>
    <tr><td>String</td><td>GET/SET/INCR/EXPIRE</td><td>Cache, counters, sessions, rate limits</td></tr>
    <tr><td>Hash</td><td>HGET/HSET/HMGET/HDEL</td><td>User profiles, objects, config</td></tr>
    <tr><td>List</td><td>LPUSH/RPUSH/LPOP/LRANGE</td><td>Queues, activity feeds, recent items</td></tr>
    <tr><td>Set</td><td>SADD/SMEMBERS/SINTER/SUNION</td><td>Tags, unique visitors, friend lists</td></tr>
    <tr><td>Sorted Set</td><td>ZADD/ZRANGE/ZRANK/ZRANGEBYSCORE</td><td>Leaderboards, priority queues, time-series</td></tr>
  </tbody>
</table>

<h2>Strings — Cache & Counters</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel Cache with Redis</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Cache-aside pattern
function getUser(int $id): ?array {
    $key = "user:{$id}";

    $cached = Redis::get($key);
    if ($cached) return json_decode($cached, true);

    $user = DB::table('users')->find($id);
    if ($user) Redis::setex($key, 3600, json_encode($user)); // TTL 1 hour
    return $user;
}

// Atomic counter (INCR is atomic — no race conditions)
Redis::incr("page_views:{$slug}");
Redis::incrby("user_score:{$userId}", 10);

// Rate limiting
$key = "rate_limit:{$ip}";
$hits = Redis::incr($key);
if ($hits === 1) Redis::expire($key, 60); // set TTL on first hit
if ($hits > 100) abort(429);
</code></pre>
</div>

<h2>Hashes — Objects</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Store user profile as hash — update individual fields without re-encoding
Redis::hset("user:123", 'name', 'Alice', 'email', 'alice@test.com', 'score', '42');
Redis::hset("user:123", 'score', '43'); // update one field

$profile = Redis::hgetall("user:123"); // ['name' => 'Alice', 'email' => ..., 'score' => '43']
$score   = Redis::hget("user:123", 'score');

// Hash vs String JSON:
// Hash: update single field = 1 write; String JSON: decode, modify, re-encode, write
</code></pre>
</div>

<h2>Sorted Sets — Leaderboard</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">$board = 'leaderboard:weekly';

// Add/update score
Redis::zadd($board, 1500, 'alice');
Redis::zadd($board, 2300, 'bob');
Redis::zadd($board, 1800, 'carol');

// Top 10 with scores (highest first)
$top = Redis::zrevrange($board, 0, 9, 'WITHSCORES');
// ['bob' => 2300, 'carol' => 1800, 'alice' => 1500]

// Alice's rank (0-indexed from bottom, so invert for display)
$rank = Redis::zrevrank($board, 'alice'); // 2 (0-indexed) → display as #3

// Users with score between 1000 and 2000
$mid = Redis::zrangebyscore($board, 1000, 2000, ['withscores' => true]);
</code></pre>
</div>

<h2>Lists — Queue</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Producer: push jobs to right
Redis::rpush('jobs:email', json_encode(['to' => 'alice@test.com', 'template' => 'welcome']));

// Consumer: pop from left (FIFO queue)
$job = Redis::lpop('jobs:email');

// Blocking pop — waits up to 30s for a job (efficient worker loop)
$job = Redis::blpop('jobs:email', 30);

// Recent items (keep last 100)
Redis::lpush("recent:{$userId}", $itemId);
Redis::ltrim("recent:{$userId}", 0, 99); // keep only first 100
</code></pre>
</div>

<h2>Pub/Sub</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel Broadcasting</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Publisher
Redis::publish('notifications', json_encode([
    'user_id' => 42,
    'message' => 'Your order has shipped',
]));

// Subscriber (long-running process)
Redis::subscribe(['notifications'], function($message, $channel) {
    $data = json_decode($message, true);
    // Push to WebSocket, process notification...
});
</code></pre>
</div>

<h2>Persistence: RDB vs AOF</h2>
<table class="ctable">
  <thead><tr><th>Mode</th><th>How</th><th>Recovery</th><th>Performance</th></tr></thead>
  <tbody>
    <tr><td>RDB (snapshot)</td><td>Periodic fork + dump to .rdb file</td><td>Up to minutes of loss</td><td>Fast (no write overhead)</td></tr>
    <tr><td>AOF (append-only)</td><td>Log every write command</td><td>Up to 1s loss (fsync=everysec)</td><td>Slight write overhead</td></tr>
    <tr><td>RDB + AOF</td><td>Both enabled</td><td>Near-zero loss</td><td>Safest for production</td></tr>
  </tbody>
</table>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Always set TTLs on cached keys — unbounded cache growth eventually OOMs</li>
    <li>INCR is atomic — use for counters and rate limits without WATCH/MULTI overhead</li>
    <li>Sorted sets power leaderboards: O(log n) insert, O(log n + k) range query</li>
    <li>BLPOP for worker queues: blocks efficiently instead of polling with sleep()</li>
    <li>Use AOF + RDB in production; cache-only Redis can use no persistence (maxmemory + allkeys-lru)</li>
  </ul>
</div>
`,
};
