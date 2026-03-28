export default {
  phase: 'Phase 3 · Modern PHP 8.x',
  title: 'PHP PSR Standards',
  intro: 'PHP-FIG (Framework Interoperability Group) produces PSR (PHP Standard Recommendations) that define common interfaces and coding standards. PSR-4 autoloading, PSR-7/15 HTTP, PSR-3 logging, PSR-11 containers, and PSR-12 coding style are the standards every senior PHP engineer must know and apply.',
  tags: ['PSR-4', 'PSR-3', 'PSR-7', 'PSR-11', 'PSR-12', 'PSR-15', 'Autoloading'],
  seniorExpectations: [
    'Explain PSR-4 autoloading: namespace to directory mapping, composer.json configuration',
    'Use PSR-3 logger interface — never type-hint against Monolog directly',
    'Understand PSR-7 immutable request/response objects and why immutability matters',
    'Implement a PSR-15 middleware with RequestHandlerInterface',
    'Apply PSR-11 container interface for framework-agnostic dependency injection',
  ],
  body: `
<h2>PSR-4: Autoloading</h2>
<p>Maps namespace prefixes to filesystem directories. Composer implements this.</p>
<div class="code-block">
<div class="code-header"><span class="code-lang">JSON — composer.json</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-json">{
  "autoload": {
    "psr-4": {
      "App\\": "src/",
      "Tests\\": "tests/"
    }
  }
}
</code></pre>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Class file must match namespace</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// File: src/Services/UserService.php
namespace App\Services;

class UserService { /* ... */ }
// Class App\Services\UserService maps to src/Services/UserService.php
</code></pre>
</div>

<h2>PSR-3: Logger Interface</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;

// Type-hint against the interface — not Monolog\Logger
class OrderService {
    public function __construct(private LoggerInterface $logger) {}

    public function createOrder(array $data): Order {
        $this->logger->info('Creating order', ['data' => $data]);
        try {
            $order = Order::create($data);
            $this->logger->info('Order created', ['id' => $order->id]);
            return $order;
        } catch (\Exception $e) {
            $this->logger->error('Order creation failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
// Swap Monolog for any PSR-3 logger in tests or production
</code></pre>
</div>

<h2>PSR-7: HTTP Messages (Immutable)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\ResponseInterface;

// PSR-7 objects are IMMUTABLE — with* methods return new instances
function addJsonHeader(ResponseInterface $response): ResponseInterface {
    return $response->withHeader('Content-Type', 'application/json');
    // $response itself is unchanged — returns a NEW response
}

// Reading request data
function handleRequest(ServerRequestInterface $request): void {
    $method = $request->getMethod();              // GET, POST, ...
    $path   = $request->getUri()->getPath();      // /api/users
    $body   = $request->getParsedBody();          // decoded POST data
    $query  = $request->getQueryParams();         // $_GET equivalent
    $header = $request->getHeaderLine('Accept');  // single header value
}
</code></pre>
</div>

<h2>PSR-15: Middleware</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Psr\Http\Server\{MiddlewareInterface, RequestHandlerInterface};
use Psr\Http\Message\{ServerRequestInterface, ResponseInterface};

class RateLimitMiddleware implements MiddlewareInterface {
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        $ip = $request->getServerParams()['REMOTE_ADDR'];

        if ($this->isRateLimited($ip)) {
            return new Response(429, [], 'Too Many Requests');
        }

        return $handler->handle($request); // pass to next middleware
    }
}
</code></pre>
</div>

<h2>PSR-11: Container Interface</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Psr\Container\ContainerInterface;

class ServiceFactory {
    public function __construct(private ContainerInterface $container) {}

    public function make(string $id): mixed {
        return $this->container->get($id);
    }
}
// Works with Laravel, Symfony, PHP-DI, or any PSR-11 container
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>PSR-4: namespace → directory mapping; run <code>composer dump-autoload</code> after adding new paths</li>
    <li>PSR-3: type-hint <code>LoggerInterface</code> not <code>Monolog\Logger</code> — framework-agnostic logging</li>
    <li>PSR-7: request/response are <strong>immutable</strong> — every modification returns a new object</li>
    <li>PSR-15: middleware receives request + next handler, calls <code>$handler->handle($request)</code> to continue the chain</li>
    <li>PSR-11: container interface — inject it only in factories, never in domain classes</li>
  </ul>
</div>
`,
};
