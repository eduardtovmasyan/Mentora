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

  segments: [
    { type: 'h2', key: 'h_two_rules' },
    { type: 'ul', key: 'ul_two_rules' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — DIP Violation then Fix',
      code: `<?php
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
assert($repo->findById(1) !== null);`,
    },
    { type: 'h2', key: 'h_laravel_container' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — Laravel DI Container',
      code: `<?php
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
$this->app->bind(OrderRepositoryInterface::class, InMemoryOrderRepository::class);`,
    },
    { type: 'keypoints', key: 'keypoints' },
  ],

  bodyTexts: {
    h_two_rules: 'The Two Rules',
    ul_two_rules: [
      'High-level modules must not import from low-level modules. Both depend on abstractions.',
      'Abstractions must not depend on details. Details depend on abstractions.',
    ],
    h_laravel_container: 'Laravel Service Container',
    keypoints: {
      title: 'Key Points to Remember',
      items: [
        'DIP: code to interfaces, not implementations',
        'Constructor injection is the preferred pattern — dependencies are explicit and required',
        'Makes testing trivial: swap real implementations for fakes/mocks',
        "Laravel's service container is DIP automated — bind interface once, inject everywhere",
        'Red flag: <code>new ConcreteClass()</code> inside business logic — can\'t test without it',
      ],
    },
  },
};

// ── PHP 8.0 ───────────────────────────────────────────────────────────
