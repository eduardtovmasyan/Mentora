export default {
  phase: 'Phase 3 · Modern PHP 8.x',
  title: 'PHP 8.1 — Enums, Readonly & Fibers',
  intro: 'PHP 8.1 brought enums, readonly properties, fibers, intersection types, and the never return type. Enums alone eliminated entire classes of bugs that came from using string constants or class constants.',
  tags: ['Enums', 'Backed enums', 'Readonly', 'Fibers', 'Intersection types', 'never'],
  seniorExpectations: [
    'Design backed enums for domain status types',
    'Know from() throws; tryFrom() returns null',
    'Use readonly for DTOs and value objects',
    'Explain what a Fiber is and how it relates to async PHP',
    'Know intersection types vs union types',
  ],
  body: `
<h2>Enums</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP 8.1 — Enums</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Pure enum — no scalar value, just named cases
enum Direction { case North; case South; case East; case West; }

// Backed enum — each case has a string or int value (for DB/JSON)
enum OrderStatus: string
{
    case Pending   = 'pending';
    case Paid      = 'paid';
    case Shipped   = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    // Enums can have methods
    public function label(): string
    {
        return match($this) {
            self::Pending   => 'Awaiting Payment',
            self::Paid      => 'Payment Received',
            self::Shipped   => 'Out for Delivery',
            self::Delivered => 'Delivered',
            self::Cancelled => 'Order Cancelled',
        };
    }

    public function isFinal(): bool
    {
        return in_array($this, [self::Delivered, self::Cancelled]);
    }
}

// From database value:
$status = OrderStatus::from('paid');         // OrderStatus::Paid — throws ValueError if invalid
$status = OrderStatus::tryFrom('unknown');   // null — safe for user input

// To database value:
$db = OrderStatus::Paid->value;              // 'paid'
$name = OrderStatus::Paid->name;             // 'Paid' (built-in)

// All cases:
$all = OrderStatus::cases(); // [OrderStatus::Pending, ...]

// Type-safe — no more magic strings!
function processOrder(OrderStatus $status): void { /* ... */ }
processOrder(OrderStatus::Paid); // ✓
// processOrder('paid');          // ✗ TypeError
</code></pre>
</div>

<h2>Readonly & Fibers</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP 8.1 — Readonly & Fibers</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// readonly: set once in constructor, immutable after
class User
{
    public readonly int    $id;
    public readonly string $email;
    public string $name; // NOT readonly — can change

    public function __construct(int $id, string $email, string $name)
    {
        $this->id    = $id;
        $this->email = $email;
        $this->name  = $name;
    }
}
$user = new User(1, 'ali@example.com', 'Ali');
$user->name  = 'Alisher'; // ✓ mutable
// $user->id = 2;          // ✗ Fatal: Cannot modify readonly

// ── FIBERS ────────────────────────────────────────────────────
// Fibers = cooperative concurrency (not parallelism)
// A Fiber can pause itself (Fiber::suspend) and resume later
$fiber = new Fiber(function(): void {
    $value = Fiber::suspend('paused'); // pause, send 'paused' to caller
    echo "Resumed with: {$value}\n";
};

$result = $fiber->start();          // runs until first suspend → 'paused'
$fiber->resume('hello world');      // resumes → prints "Resumed with: hello world"

// Fibers are the primitive that libraries like ReactPHP and Amp build on
// They enable writing async code in a synchronous style

// ── OTHER 8.1 FEATURES ────────────────────────────────────────
// Intersection types (must implement BOTH):
function process(Serializable&Countable $data): void {}

// never return type — function always throws or exits:
function abort(string $msg): never { throw new \RuntimeException($msg); }

// First-class callables:
$fn = strlen(...);          // closure wrapping strlen
$fn = $obj->method(...);    // closure wrapping method
$lengths = array_map(strlen(...), ['hello', 'world']);
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Enums: pure (no value) or backed (string/int). Use backed enums for DB/JSON storage</li>
    <li><code>from()</code> throws ValueError on invalid value. <code>tryFrom()</code> returns null — use tryFrom for user input</li>
    <li>Readonly: set once in constructor, cannot be modified after. Perfect for immutable objects</li>
    <li>Fibers: cooperative multitasking. Suspend/resume. Foundation of async PHP.</li>
    <li>Intersection types: <code>A&amp;B</code> = must implement BOTH. Union types: <code>A|B</code> = implements either.</li>
    <li>never return type: the function never returns — it throws or exits. Helps static analysis.</li>
  </ul>
</div>
`,
};

// ── SQL INDEXES ───────────────────────────────────────────────────────
