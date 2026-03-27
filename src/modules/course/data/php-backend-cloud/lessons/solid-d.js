export default {
  phase: 'Phase 2 · OOP, SOLID & Design Patterns',
  title: 'D — Dependency Inversion Principle',
  intro: 'High-level modules should not depend on low-level modules. Both should depend on abstractions. DIP is what makes dependency injection, service containers, and mock-based testing possible.',
  tags: ['DIP', 'Interfaces', 'Constructor injection', 'Service container', 'Mocking'],
  seniorExpectations: [
    'Explain the two rules of DIP',
    'Refactor concrete dependencies to interface dependencies',
    'Use constructor injection as the preferred pattern',
    'Explain how Laravel\'s service container implements DIP',
    'Write a test that swaps real DB for in-memory implementation',
  ],
  body: `
<h2>The Two Rules</h2>
<ol>
  <li>High-level modules must not import from low-level modules. Both depend on abstractions.</li>
  <li>Abstractions must not depend on details. Details depend on abstractions.</li>
</ol>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — DIP Violation then Fix</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// ✗ BAD: OrderService (high-level) depends directly on MySQLOrderRepository (low-level)
class OrderService
{
    private MySQLOrderRepository $repo;
    public function __construct()
    {
        $this->repo = new MySQLOrderRepository(); // hardwired — can't test without MySQL
    }
}

// ──────────────────────────────────────────────────────────────────
// ✓ GOOD: Both depend on an abstraction (interface)

interface OrderRepositoryInterface
{
    public function save(array $order): void;
    public function findById(int $id): ?array;
}

class MySQLOrderRepository implements OrderRepositoryInterface
{
    public function save(array $order): void    { /* MySQL code */ }
    public function findById(int $id): ?array   { /* MySQL code */ }
}

class InMemoryOrderRepository implements OrderRepositoryInterface
{
    private array $store = [];
    public function save(array $order): void  { $this->store[$order['id']] = $order; }
    public function findById(int $id): ?array { return $this->store[$id] ?? null; }
}

class OrderService
{
    // Depends on abstraction — no knowledge of MySQL
    public function __construct(
        private readonly OrderRepositoryInterface $repo
    ) {}

    public function placeOrder(array $data): void { $this->repo->save($data); }
}

// Production:
$service = new OrderService(new MySQLOrderRepository());

// Test — no database, fast, isolated:
$repo    = new InMemoryOrderRepository();
$service = new OrderService($repo);
$service->placeOrder(['id' => 1, 'total' => 99.99]);
assert($repo->findById(1) !== null);
</code></pre>
</div>

<h2>Laravel Service Container</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel DI Container</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// In AppServiceProvider::register()
$this->app->bind(
    OrderRepositoryInterface::class,
    MySQLOrderRepository::class
);

// Anywhere in the app — Laravel resolves it automatically:
class OrderController extends Controller
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders  // injected automatically
    ) {}
}

// In tests — swap implementation with one line:
$this->app->bind(OrderRepositoryInterface::class, InMemoryOrderRepository::class);
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>DIP: code to interfaces, not implementations</li>
    <li>Constructor injection is the preferred pattern — dependencies are explicit and required</li>
    <li>Makes testing trivial: swap real implementations for fakes/mocks</li>
    <li>Laravel's service container is DIP automated — bind interface once, inject everywhere</li>
    <li>Red flag: <code>new ConcreteClass()</code> inside business logic — can't test without it</li>
  </ul>
</div>
`,
};

// ── PHP 8.0 ───────────────────────────────────────────────────────────
