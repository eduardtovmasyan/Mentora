export default {
  phase: 'Phase 2 · OOP & Design Patterns',
  title: 'Pattern · Decorator',
  intro: 'The Decorator pattern attaches additional responsibilities to an object dynamically by wrapping it in decorator objects that implement the same interface. It is a composable alternative to subclassing — you can stack multiple decorators without a combinatorial explosion of subclasses.',
  tags: ['Structural', 'Wrapper', 'Composition over inheritance', 'Transparent', 'Middleware'],
  seniorExpectations: [
    'Implement a decorator that wraps a component implementing the same interface',
    'Stack multiple decorators to compose behaviour at runtime',
    'Explain why decorators favour composition over inheritance',
    'Identify real-world PHP decorators: PSR-15 middleware, monolog handlers, cache layers',
    'Know when to use Decorator vs Proxy vs Strategy',
  ],
  body: `
<h2>Structure</h2>
<p>All decorators and the concrete component implement the same interface. The decorator holds a reference to the wrapped component and delegates to it, adding behaviour before/after.</p>

<h2>Example: Logger Decorators</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">interface Logger {
    public function log(string $level, string $message): void;
}

// Concrete component
class FileLogger implements Logger {
    public function __construct(private string $path) {}
    public function log(string $level, string $message): void {
        file_put_contents($this->path, "[$level] $message\n", FILE_APPEND);
    }
}

// Base decorator
abstract class LoggerDecorator implements Logger {
    public function __construct(protected Logger $inner) {}
}

// Adds timestamps
class TimestampLogger extends LoggerDecorator {
    public function log(string $level, string $message): void {
        $ts = date('Y-m-d H:i:s');
        $this->inner->log($level, "[$ts] $message");
    }
}

// Filters below a minimum level
class MinLevelLogger extends LoggerDecorator {
    private const LEVELS = ['debug' => 0, 'info' => 1, 'warning' => 2, 'error' => 3];

    public function __construct(Logger $inner, private string $minLevel) {
        parent::__construct($inner);
    }

    public function log(string $level, string $message): void {
        if ((self::LEVELS[$level] ?? 0) >= (self::LEVELS[$this->minLevel] ?? 0)) {
            $this->inner->log($level, $message);
        }
    }
}

// Stack decorators at runtime — order matters
$logger = new TimestampLogger(
    new MinLevelLogger(
        new FileLogger('/var/log/app.log'),
        'warning'
    )
);

$logger->log('debug',   'Cache hit');   // filtered out
$logger->log('warning', 'Disk 90%');    // logged with timestamp
$logger->log('error',   'DB timeout');  // logged with timestamp
</code></pre>
</div>

<h2>HTTP Middleware as Decorator (PSR-15)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — PSR-15 middleware is Decorator in disguise</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Psr\Http\Message\{ResponseInterface, ServerRequestInterface};
use Psr\Http\Server\{MiddlewareInterface, RequestHandlerInterface};

class AuthMiddleware implements MiddlewareInterface {
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        if (!$request->hasHeader('Authorization')) {
            return new Response(401);
        }
        return $handler->handle($request); // delegate to next handler
    }
}
</code></pre>
</div>

<h2>Caching Decorator</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">interface UserRepository {
    public function find(int $id): ?User;
}

class CachingUserRepository implements UserRepository {
    public function __construct(
        private UserRepository $inner,
        private CacheInterface $cache,
        private int $ttl = 300,
    ) {}

    public function find(int $id): ?User {
        return $this->cache->remember("user:{$id}", $this->ttl,
            fn() => $this->inner->find($id)
        );
    }
}

// Transparent to callers — they just see UserRepository
$repo = new CachingUserRepository(new DatabaseUserRepository($db), $cache);
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Decorator wraps a component in objects that implement the same interface — transparent to callers</li>
    <li>Decorators are composable: stack them like layers, each adding one responsibility</li>
    <li>Favours composition over inheritance — avoids combinatorial subclass explosion</li>
    <li>Real PHP examples: PSR-15 middleware, Monolog handlers, Laravel cache/queue decorators</li>
    <li>Difference from Proxy: Decorator adds behaviour; Proxy controls access (auth, lazy loading, remote)</li>
  </ul>
</div>
`,
};
