export default {
  phase: 'Phase 3 · Modern PHP 8.x',
  title: 'Async PHP & Fibers',
  intro: 'PHP is traditionally synchronous — one request, one process, blocking I/O. PHP 8.1 added Fibers (cooperative coroutines) as a low-level primitive. ReactPHP and Swoole provide true event-loop-based async. For most Laravel applications, queue workers + Redis pipelines achieve concurrency without async PHP.',
  tags: ['Fibers', 'ReactPHP', 'Swoole', 'Event loop', 'Coroutines', 'Non-blocking I/O'],
  seniorExpectations: [
    'Explain PHP\'s concurrency model: processes/threads vs event loops vs fibers',
    'Implement a basic Fiber (PHP 8.1) — suspend and resume execution',
    'Understand how ReactPHP event loop achieves non-blocking I/O',
    'Know when Swoole / RoadRunner / FrankenPHP provide meaningful wins',
    'Explain why Laravel queues are the practical async solution for most applications',
  ],
  body: `
<h2>PHP Concurrency Models</h2>
<table class="ctable">
  <thead><tr><th>Model</th><th>Tool</th><th>Use case</th></tr></thead>
  <tbody>
    <tr><td>Process-based</td><td>PHP-FPM</td><td>Standard request/response — one process per request</td></tr>
    <tr><td>Thread-based</td><td>pthreads (experimental)</td><td>CPU-bound parallel work</td></tr>
    <tr><td>Event loop</td><td>ReactPHP, Swoole</td><td>High I/O concurrency: WebSockets, HTTP servers</td></tr>
    <tr><td>Fibers</td><td>PHP 8.1 built-in</td><td>Cooperative concurrency primitive — basis for async libraries</td></tr>
    <tr><td>Queue workers</td><td>Laravel Queue + Redis</td><td>Background jobs — practical async for web apps</td></tr>
  </tbody>
</table>

<h2>PHP 8.1 Fibers</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Fiber basics</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">$fiber = new Fiber(function(): void {
    echo "Fiber: start\n";
    $value = Fiber::suspend('first suspension'); // yields control back
    echo "Fiber: resumed with '{$value}'\n";
    Fiber::suspend('second suspension');
    echo "Fiber: done\n";
});

$result1 = $fiber->start();        // "Fiber: start", returns 'first suspension'
echo "Main: got '{$result1}'\n";   // "Main: got 'first suspension'"

$result2 = $fiber->resume('hello'); // resumes fiber, "Fiber: resumed with 'hello'"
echo "Main: got '{$result2}'\n";   // "Main: got 'second suspension'"

$fiber->resume();                   // "Fiber: done"
echo "Fiber terminated: " . ($fiber->isTerminated() ? 'yes' : 'no') . "\n";
</code></pre>
</div>

<h2>ReactPHP Event Loop</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Non-blocking HTTP requests</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use React\Http\Browser;
use React\EventLoop\Loop;

$browser = new Browser();

// Fire 3 HTTP requests concurrently
$promises = [
    $browser->get('https://api.example.com/users'),
    $browser->get('https://api.example.com/orders'),
    $browser->get('https://api.example.com/products'),
];

\React\Promise\all($promises)->then(function(array $responses) {
    foreach ($responses as $response) {
        echo $response->getStatusCode() . "\n";
    }
});

Loop::run(); // starts the event loop
// All 3 requests run concurrently — total time = slowest request, not sum
</code></pre>
</div>

<h2>Swoole Coroutines</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Swoole concurrent DB queries</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Swoole\Coroutine;

Coroutine\run(function() {
    // Run two DB queries concurrently
    $ch1 = new Coroutine\Channel(1);
    $ch2 = new Coroutine\Channel(1);

    Coroutine::create(function() use ($ch1) {
        $users = DB::query('SELECT * FROM users LIMIT 100');
        $ch1->push($users);
    });

    Coroutine::create(function() use ($ch2) {
        $orders = DB::query('SELECT * FROM orders LIMIT 100');
        $ch2->push($orders);
    });

    $users  = $ch1->pop(); // waits for first query
    $orders = $ch2->pop(); // waits for second query
    // Both queries ran concurrently
});
</code></pre>
</div>

<div class="callout callout-info">
  <div class="callout-title">Practical Recommendation</div>
  <p>For most Laravel applications, <strong>queue workers + Redis</strong> provide the async concurrency you need. ReactPHP and Swoole are worth considering for real-time features (WebSockets, live notifications) or extremely high I/O workloads. Fibers are a library primitive — use them through higher-level libraries like <a href="#">Amp</a> or <a href="#">ReactPHP 3</a>.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>PHP-FPM: one process per request — simple, stateless, scales horizontally</li>
    <li>Fibers (PHP 8.1): cooperative coroutines — suspend/resume in a single thread, building block for async</li>
    <li>ReactPHP: event loop + promises — non-blocking I/O for HTTP servers, WebSockets, queues</li>
    <li>Swoole: C-extension with thread pool + coroutines — highest performance, changes PHP execution model</li>
    <li>For web apps: Laravel queues + Redis is the practical async solution — no special server required</li>
  </ul>
</div>
`,
};
