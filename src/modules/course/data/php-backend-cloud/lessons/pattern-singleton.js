export default {
  phase: 'Phase 2 · OOP & Design Patterns',
  title: 'Pattern · Singleton',
  intro: 'The Singleton pattern ensures a class has only one instance and provides a global access point to it. In PHP it is used for config objects, connection pools, and loggers — but is widely considered an anti-pattern when it hides dependencies. Modern PHP favors dependency injection containers over Singleton.',
  tags: ['Creational', 'Single instance', 'Static factory', 'Anti-pattern', 'DI alternative'],
  seniorExpectations: [
    'Implement a thread-safe (or PHP-safe) Singleton with lazy instantiation',
    'Explain why Singleton is considered an anti-pattern in testable code',
    'Distinguish Singleton from static classes',
    'Show how a DI container solves the same problem without the drawbacks',
    'Know legitimate use cases: configuration, service locator pattern',
  ],
  segments: [
    { type: 'h2', key: 'h_classic' },
    { type: 'code', lang: 'php', label: 'PHP', code: `final class Config {
    private static ?Config $instance = null;
    private array $data = [];

    private function __construct() {
        $this->data = require __DIR__ . '/config.php';
    }

    // Prevent cloning and unserialization
    private function __clone() {}
    public function __wakeup(): void {
        throw new \\RuntimeException('Cannot unserialize singleton');
    }

    public static function getInstance(): static {
        if (static::$instance === null) {
            static::$instance = new static();
        }
        return static::$instance;
    }

    public function get(string $key, mixed $default = null): mixed {
        return $this->data[$key] ?? $default;
    }
}

// Usage
$db = Config::getInstance()->get('database');` },
    { type: 'h2', key: 'h_antipattern' },
    { type: 'code', lang: 'php', label: 'PHP — Hidden dependency (bad)', code: `class UserService {
    public function create(array $data): User {
        $config = Config::getInstance(); // hidden global dependency
        $maxUsers = $config->get('max_users', 100);
        // ...
    }
}

// You cannot test UserService without the real config file being present
// You cannot inject a test double for Config` },
    { type: 'h2', key: 'h_di' },
    { type: 'code', lang: 'php', label: 'PHP — Explicit dependency (good)', code: `interface ConfigInterface {
    public function get(string $key, mixed $default = null): mixed;
}

class UserService {
    public function __construct(private ConfigInterface $config) {} // explicit

    public function create(array $data): User {
        $maxUsers = $this->config->get('max_users', 100);
        // Testable: inject a mock ConfigInterface
    }
}

// In tests:
$mockConfig = $this->createMock(ConfigInterface::class);
$mockConfig->method('get')->willReturn(10);
$service = new UserService($mockConfig);` },
    { type: 'h2', key: 'h_vs_static' },
    { type: 'code', lang: 'php', label: 'PHP', code: `// Static class: all methods are static, no instance, no interface possible
class MathHelper {
    public static function square(int $n): int { return $n ** 2; }
}

// Singleton: has an instance — can implement interfaces, can be subclassed
// Use Singleton when you need polymorphism or interface compliance
// Use static class for pure utility functions with no state` },
    { type: 'callout', style: 'warn', key: 'callout_laravel' },
    { type: 'keypoints', key: 'keypoints' },
  ],
  bodyTexts: {
    h_classic: 'Classic Singleton Implementation',
    h_antipattern: 'Why Singleton is an Anti-Pattern',
    h_di: 'Better: Dependency Injection',
    h_vs_static: 'Singleton vs Static Class',
    callout_laravel: {
      title: 'Laravel: Singleton in the Container',
      html: "Laravel's container supports <code>app()->singleton()</code> — registers a class to be instantiated once and reused. This gives singleton lifecycle without the static global access anti-pattern: the instance is injected, not fetched globally.",
    },
    keypoints: {
      title: 'Key Points to Remember',
      items: [
        'Singleton: one instance, global access point, lazy creation via static factory method',
        'Block cloning (<code>__clone</code>) and unserialization (<code>__wakeup</code>) to enforce single instance',
        'Anti-pattern in testable code: hides dependencies, makes mocking impossible without static proxies',
        'Prefer DI containers: singleton <em>lifetime</em> managed by the container, dependencies still injected',
        'Legitimate uses: true globals (config, registry) — but always inject via interface, never call getInstance() directly',
      ],
    },
  },
};
