export default {
  phase: 'Phase 3 · Modern PHP 8.x',
  title: 'PHP 8.0 Features',
  intro: 'PHP 8.0 was the biggest release in a decade. Named arguments, match expressions, nullsafe operator, union types, attributes, constructor promotion, and JIT. Senior PHP developers must know all of these and explain the WHY behind each.',
  tags: ['Named arguments', 'match', 'Nullsafe ?->', 'Union types', 'Attributes', 'Constructor promotion', 'JIT'],
  seniorExpectations: [
    'Use named arguments on both built-in and custom functions',
    'Explain why match is safer than switch (3 reasons)',
    'Chain nullsafe operators correctly without hiding bugs',
    'Write and read PHP attributes via Reflection',
    'Know when JIT helps and when it doesn\'t',
  ],
  body: `
<h2>Named Arguments</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP 8.0 — Named Arguments</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Skip middle optional parameters — no need to pass nulls
array_slice(array: $arr, offset: 0, length: 3, preserve_keys: true);
htmlspecialchars($str, double_encode: false);

function createUser(string $name, string $email, string $role = 'user', bool $active = true): void {}

// Old: must pass everything in order
createUser('Ali', 'ali@example.com', 'admin', true);

// New: skip what you don't need, any order
createUser(email: 'ali@example.com', name: 'Ali', role: 'admin');
</code></pre>
</div>

<h2>Match Expression</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP 8.0 — Match</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// match: strict (===), returns value, no fall-through, throws on unhandled
$label = match($status) {
    1       => 'Active',
    2, 3    => 'Pending',    // multiple conditions per arm
    4       => 'Inactive',
    default => 'Unknown',
};

// match(true) for conditions:
function httpMessage(int $code): string
{
    return match(true) {
        $code >= 500 => 'Server Error',
        $code >= 400 => 'Client Error',
        $code >= 300 => 'Redirect',
        $code >= 200 => 'Success',
        default      => 'Unknown',
    };
}
// Throws UnhandledMatchError if no arm matches — unlike switch which silently skips
</code></pre>
</div>

<h2>Nullsafe Operator & Constructor Promotion</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP 8.0 — Nullsafe & Promotion</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Nullsafe: chain stops and returns null at first null — no pyramid of doom
$city = $user?->getAddress()?->getCity()?->getName() ?? 'Unknown';

// Constructor promotion: add visibility modifier to parameter → auto-creates property
class Product
{
    // Old: declare, list in params, assign — 3 places per property
    // New: one line per property
    public function __construct(
        private string $name,
        private float  $price,
        public readonly string $sku = '',  // readonly + promotion
    ) {}
}

// Union types: accept multiple types strictly
function formatId(int|string $id): string { return (string) $id; }

// New string functions (finally!)
str_contains('Hello World', 'World');     // true
str_starts_with('Hello World', 'Hello');  // true
str_ends_with('Hello World', 'World');    // true
</code></pre>
</div>

<h2>Attributes</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP 8.0 — Attributes</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Attributes = machine-readable metadata — replaces docblock @annotations
// They are first-class PHP constructs: type-checked, IDE-supported, no regex parsing

#[Attribute]
class Route
{
    public function __construct(
        public readonly string $path,
        public readonly string $method = 'GET',
    ) {}
}

class UserController
{
    #[Route('/users', 'GET')]
    public function index(): array { return []; }

    #[Route('/users/{id}', 'GET')]
    public function show(int $id): array { return []; }
}

// Read via Reflection — how frameworks auto-register routes:
$rc = new ReflectionClass(UserController::class);
foreach ($rc->getMethods() as $method) {
    foreach ($method->getAttributes(Route::class) as $attr) {
        $route = $attr->newInstance();
        echo "{$route->method} {$route->path} => {$method->getName()}\n";
    }
}
</code></pre>
</div>

<div class="callout callout-info">
  <div class="callout-title">JIT Compilation</div>
  <p>PHP 8.0 added JIT via OPcache. JIT compiles bytecode to native machine code at runtime. <strong>When it helps:</strong> CPU-intensive code — math, image processing, algorithms. <strong>When it doesn't:</strong> Typical web apps that are I/O-bound (waiting on DB, APIs). Most Laravel apps see under 5% improvement. Enable with <code>opcache.jit=tracing</code>.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Named arguments: skip optional params, self-documenting call sites</li>
    <li>match: strict ===, returns value, no fall-through, throws on unhandled — safer than switch</li>
    <li>Nullsafe ?->: chain returns null on first null. Use when null is expected — not to hide bugs</li>
    <li>Constructor promotion: add visibility to constructor param → auto-creates property</li>
    <li>str_contains / str_starts_with / str_ends_with — cleaner than old strpos tricks</li>
    <li>Attributes: first-class metadata. Frameworks use them for routing, DI, validation.</li>
  </ul>
</div>
`,
};

// ── PHP 8.1 ───────────────────────────────────────────────────────────
