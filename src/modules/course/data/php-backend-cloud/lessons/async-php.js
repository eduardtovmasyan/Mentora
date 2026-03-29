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
  segments: [
    { type: 'h2', text: 'PHP Concurrency Models' },
    { type: 'table', headers: ['Model', 'Tool', 'Use case'], rows: [
      ['Process-based', 'PHP-FPM', 'Standard request/response — one process per request'],
      ['Thread-based', 'pthreads (experimental)', 'CPU-bound parallel work'],
      ['Event loop', 'ReactPHP, Swoole', 'High I/O concurrency: WebSockets, HTTP servers'],
      ['Fibers', 'PHP 8.1 built-in', 'Cooperative concurrency primitive — basis for async libraries'],
      ['Queue workers', 'Laravel Queue + Redis', 'Background jobs — practical async for web apps'],
    ]},

    { type: 'h2', text: 'PHP 8.1 Fibers' },
    { type: 'code', lang: 'php', label: 'PHP — Fiber basics', code: `$fiber = new Fiber(function(): void {
    echo "Fiber: start\\n";
    $value = Fiber::suspend('first suspension'); // yields control back
    echo "Fiber: resumed with '{$value}'\\n";
    Fiber::suspend('second suspension');
    echo "Fiber: done\\n";
});

$result1 = $fiber->start();        // "Fiber: start", returns 'first suspension'
echo "Main: got '{$result1}'\\n";   // "Main: got 'first suspension'"

$result2 = $fiber->resume('hello'); // resumes fiber, "Fiber: resumed with 'hello'"
echo "Main: got '{$result2}'\\n";   // "Main: got 'second suspension'"

$fiber->resume();                   // "Fiber: done"
echo "Fiber terminated: " . ($fiber->isTerminated() ? 'yes' : 'no') . "\\n";` },

    { type: 'h2', text: 'ReactPHP Event Loop' },
    { type: 'code', lang: 'php', label: 'PHP — Non-blocking HTTP requests', code: `use React\\Http\\Browser;
use React\\EventLoop\\Loop;

$browser = new Browser();

// Fire 3 HTTP requests concurrently
$promises = [
    $browser->get('https://api.example.com/users'),
    $browser->get('https://api.example.com/orders'),
    $browser->get('https://api.example.com/products'),
];

\\React\\Promise\\all($promises)->then(function(array $responses) {
    foreach ($responses as $response) {
        echo $response->getStatusCode() . "\\n";
    }
});

Loop::run(); // starts the event loop
// All 3 requests run concurrently — total time = slowest request, not sum` },

    { type: 'h2', text: 'Swoole Coroutines' },
    { type: 'code', lang: 'php', label: 'PHP — Swoole concurrent DB queries', code: `use Swoole\\Coroutine;

Coroutine\\run(function() {
    // Run two DB queries concurrently
    $ch1 = new Coroutine\\Channel(1);
    $ch2 = new Coroutine\\Channel(1);

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
});` },

    { type: 'callout', style: 'info', title: 'Practical Recommendation', html: 'For most Laravel applications, <strong>queue workers + Redis</strong> provide the async concurrency you need. ReactPHP and Swoole are worth considering for real-time features (WebSockets, live notifications) or extremely high I/O workloads. Fibers are a library primitive — use them through higher-level libraries like <a href="#">Amp</a> or <a href="#">ReactPHP 3</a>.' },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'PHP-FPM: one process per request — simple, stateless, scales horizontally',
      'Fibers (PHP 8.1): cooperative coroutines — suspend/resume in a single thread, building block for async',
      'ReactPHP: event loop + promises — non-blocking I/O for HTTP servers, WebSockets, queues',
      'Swoole: C-extension with thread pool + coroutines — highest performance, changes PHP execution model',
      'For web apps: Laravel queues + Redis is the practical async solution — no special server required',
    ]},
  ],
};
