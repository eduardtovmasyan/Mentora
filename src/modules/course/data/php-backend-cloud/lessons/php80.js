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
  segments: [
    { type: 'h2', text: 'Named Arguments' },
    { type: 'code', lang: 'php', label: 'PHP 8.0 — Named Arguments', code: `&lt;?php
// Skip middle optional parameters — no need to pass nulls
array_slice(array: $arr, offset: 0, length: 3, preserve_keys: true);
htmlspecialchars($str, double_encode: false);

function createUser(string $name, string $email, string $role = 'user', bool $active = true): void {}

// Old: must pass everything in order
createUser('Ali', 'ali@example.com', 'admin', true);

// New: skip what you don't need, any order
createUser(email: 'ali@example.com', name: 'Ali', role: 'admin');` },

    { type: 'h2', text: 'Match Expression' },
    { type: 'code', lang: 'php', label: 'PHP 8.0 — Match', code: `&lt;?php
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
// Throws UnhandledMatchError if no arm matches — unlike switch which silently skips` },

    { type: 'h2', text: 'Nullsafe Operator & Constructor Promotion' },
    { type: 'code', lang: 'php', label: 'PHP 8.0 — Nullsafe & Promotion', code: `&lt;?php
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
str_ends_with('Hello World', 'World');    // true` },

    { type: 'h2', text: 'Attributes' },
    { type: 'code', lang: 'php', label: 'PHP 8.0 — Attributes', code: `&lt;?php
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
}` },

    { type: 'callout', style: 'info', title: 'JIT Compilation', html: 'PHP 8.0 added JIT via OPcache. JIT compiles bytecode to native machine code at runtime. <strong>When it helps:</strong> CPU-intensive code — math, image processing, algorithms. <strong>When it doesn\'t:</strong> Typical web apps that are I/O-bound (waiting on DB, APIs). Most Laravel apps see under 5% improvement. Enable with <code>opcache.jit=tracing</code>.' },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Named arguments: skip optional params, self-documenting call sites',
      'match: strict ===, returns value, no fall-through, throws on unhandled — safer than switch',
      'Nullsafe ?->: chain returns null on first null. Use when null is expected — not to hide bugs',
      'Constructor promotion: add visibility to constructor param → auto-creates property',
      'str_contains / str_starts_with / str_ends_with — cleaner than old strpos tricks',
      'Attributes: first-class metadata. Frameworks use them for routing, DI, validation.',
    ]},
  ],
};

// ── PHP 8.1 ───────────────────────────────────────────────────────────
