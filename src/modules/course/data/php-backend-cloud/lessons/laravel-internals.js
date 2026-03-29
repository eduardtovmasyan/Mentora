export default {
  phase: 'Phase 3 · Modern PHP 8.x',
  title: 'Laravel Internals',
  intro: 'Understanding Laravel at a deep level — the service container, service providers, how middleware works, and Eloquent internals — is what separates a developer who uses Laravel from one who masters it. Senior PHP interviews often go deep on framework internals.',
  tags: ['Service container', 'Service providers', 'Middleware pipeline', 'Eloquent', 'Facades', 'Events'],
  seniorExpectations: [
    'Explain how the service container resolves dependencies',
    'Know the difference between bind(), singleton(), and instance()',
    'Explain how middleware pipeline works (onion model)',
    'Understand Eloquent eager loading and the N+1 problem',
    'Know when Facades are resolved and their drawbacks',
    'Configure and use queued jobs effectively',
  ],
  segments: [
    { type: 'h2', text: 'Service Container' },
    { type: 'p', html: 'The service container is Laravel\'s IoC (Inversion of Control) container — a powerful dependency injection tool that resolves class dependencies automatically.' },
    { type: 'code', lang: 'php', label: 'PHP — Service Container', code: `&lt;?php
// In AppServiceProvider::register()

// bind(): new instance every time it is resolved
$this->app->bind(PaymentGatewayInterface::class, StripeGateway::class);

// singleton(): same instance returned every time (shared state)
$this->app->singleton(CacheManager::class, function ($app) {
    return new CacheManager($app->make('config')['cache']);
};

// instance(): bind an already-created object
$this->app->instance('config', new Config(['debug' => true]));

// Contextual binding: different implementations for different classes
$this->app->when(OrderController::class)
    ->needs(PaymentGatewayInterface::class)
    ->give(StripeGateway::class);

$this->app->when(TestOrderController::class)
    ->needs(PaymentGatewayInterface::class)
    ->give(FakeGateway::class);

// Automatic resolution: Laravel reads constructor type hints and injects
class OrderService
{
    public function __construct(
        private readonly OrderRepository $repo,          // resolved automatically
        private readonly PaymentGatewayInterface $payment, // resolved from binding
    ) {}
}

// Resolve manually:
$service = app(OrderService::class);
$service = resolve(OrderService::class);` },

    { type: 'h2', text: 'Middleware Pipeline' },
    { type: 'p', html: 'Laravel\'s middleware works like an onion — each layer wraps the next. The request passes through all middleware before reaching the controller, then the response passes back through them in reverse order.' },
    { type: 'code', lang: 'php', label: 'PHP — Custom Middleware', code: `&lt;?php
class RateLimitMiddleware
{
    public function handle(Request $request, Closure $next, int $maxAttempts = 60): Response
    {
        $key      = 'rate:' . $request->ip();
        $attempts = Cache::get($key, 0);

        if ($attempts >= $maxAttempts) {
            return response()->json(['error' => 'Too many requests'], 429);
        }

        Cache::increment($key);
        Cache::expire($key, 60);

        $response = $next($request); // pass to next middleware / controller

        // After the controller — add rate limit headers to response
        return $response
            ->header('X-RateLimit-Limit', $maxAttempts)
            ->header('X-RateLimit-Remaining', $maxAttempts - $attempts - 1);
    }
}

// Terminable middleware — runs AFTER response sent to browser
class LogRequestMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        Log::info('Request completed', [
            'url'    => $request->url(),
            'method' => $request->method(),
            'status' => $response->getStatusCode(),
            'time'   => microtime(true) - LARAVEL_START,
        ]);
    }
}` },

    { type: 'h2', text: 'Eloquent & The N+1 Problem' },
    { type: 'code', lang: 'php', label: 'PHP — Eloquent Best Practices', code: `&lt;?php
// N+1 Problem: 1 query for users + N queries for each user's orders
$users = User::all();
foreach ($users as $user) {
    echo $user->orders->count(); // query per user! 100 users = 101 queries
}

// SOLUTION: eager loading with with()
$users = User::with('orders')->get(); // 2 queries total
$users = User::with(['orders', 'profile', 'roles'])->get(); // 4 queries

// Lazy eager loading (load after the fact):
$users = User::all();
$users->load('orders'); // one additional query

// Scopes: reusable query constraints
class Order extends Model
{
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    public function scopeRecent(Builder $query, int $days = 30): Builder
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
$recent = Order::completed()->recent(7)->get();

// Casting: automatic type conversion
protected $casts = [
    'metadata'   => 'array',         // JSON column auto-decoded
    'amount'     => 'integer',
    'is_active'  => 'boolean',
    'published_at' => 'datetime',
    'status'     => OrderStatus::class, // PHP 8.1 enum cast
];` },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'bind(): new instance each resolution. singleton(): shared instance. instance(): pre-built object.',
      'Middleware is an onion — before logic runs inward, after logic runs outward',
      'N+1 problem: always eager load relationships with with(). Use Laravel Debugbar to detect it.',
      'Facades are proxies to the service container — not true static methods',
      'Service providers: register() binds things. boot() runs after all registered.',
      'Model casts: automatic type conversion on get/set — use for JSON, enums, dates',
    ]},
  ],
};
