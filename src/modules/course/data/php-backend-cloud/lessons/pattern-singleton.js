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
  body: `
<h2>Classic Singleton Implementation</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">final class Config {
    private static ?Config $instance = null;
    private array $data = [];

    private function __construct() {
        $this->data = require __DIR__ . '/config.php';
    }

    // Prevent cloning and unserialization
    private function __clone() {}
    public function __wakeup(): void {
        throw new \RuntimeException('Cannot unserialize singleton');
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
$db = Config::getInstance()->get('database');
</code></pre>
</div>

<h2>Why Singleton is an Anti-Pattern</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Hidden dependency (bad)</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class UserService {
    public function create(array $data): User {
        $config = Config::getInstance(); // hidden global dependency
        $maxUsers = $config->get('max_users', 100);
        // ...
    }
}

// You cannot test UserService without the real config file being present
// You cannot inject a test double for Config
</code></pre>
</div>

<h2>Better: Dependency Injection</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Explicit dependency (good)</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">interface ConfigInterface {
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
$service = new UserService($mockConfig);
</code></pre>
</div>

<h2>Singleton vs Static Class</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Static class: all methods are static, no instance, no interface possible
class MathHelper {
    public static function square(int $n): int { return $n ** 2; }
}

// Singleton: has an instance — can implement interfaces, can be subclassed
// Use Singleton when you need polymorphism or interface compliance
// Use static class for pure utility functions with no state
</code></pre>
</div>

<div class="callout callout-warn">
  <div class="callout-title">Laravel: Singleton in the Container</div>
  <p>Laravel's container supports <code>app()->singleton()</code> — registers a class to be instantiated once and reused. This gives singleton lifecycle without the static global access anti-pattern: the instance is injected, not fetched globally.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Singleton: one instance, global access point, lazy creation via static factory method</li>
    <li>Block cloning (<code>__clone</code>) and unserialization (<code>__wakeup</code>) to enforce single instance</li>
    <li>Anti-pattern in testable code: hides dependencies, makes mocking impossible without static proxies</li>
    <li>Prefer DI containers: singleton <em>lifetime</em> managed by the container, dependencies still injected</li>
    <li>Legitimate uses: true globals (config, registry) — but always inject via interface, never call getInstance() directly</li>
  </ul>
</div>
`,
};
