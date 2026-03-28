import type { ILessonLocale } from '@/modules/course/interfaces/ILessonLocale.ts'

const ruBodiesP4: Record<string, ILessonLocale> = {
  'laravel-internals': {
    body: `
<h2>Service Container</h2>
<p>Service Container — это IoC (Inversion of Control) контейнер Laravel — мощный инструмент внедрения зависимостей, который автоматически разрешает зависимости классов.</p>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Service Container</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
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
$service = resolve(OrderService::class);
</code></pre>
</div>

<h2>Middleware Pipeline</h2>
<p>Middleware в Laravel работает как луковица — каждый слой оборачивает следующий. Запрос проходит через все middleware прежде чем попасть в контроллер, затем ответ проходит обратно через них в обратном порядке.</p>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Custom Middleware</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
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
}
</code></pre>
</div>

<h2>Eloquent и проблема N+1</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Eloquent Best Practices</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
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
];
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>bind(): новый экземпляр при каждом разрешении. singleton(): общий экземпляр. instance(): заранее созданный объект.</li>
    <li>Middleware — это луковица: логика «до» выполняется вглубь, логика «после» — наружу</li>
    <li>Проблема N+1: всегда используйте жадную загрузку связей через with(). Используйте Laravel Debugbar для её обнаружения.</li>
    <li>Facades — это прокси к service container, а не настоящие статические методы</li>
    <li>Service providers: register() регистрирует привязки. boot() выполняется после регистрации всего.</li>
    <li>Приведение типов в модели: автоматическое преобразование при чтении/записи — используйте для JSON, enum, дат</li>
  </ul>
</div>
`,
  },

  'laravel-queues': {
    body: `
<h2>Создание и отправка задания (Job)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">php artisan make:job SendWelcomeEmail
php artisan make:job ProcessPayment
</code></pre>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Job class</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class SendWelcomeEmail implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;           // retry up to 3 times
    public int $backoff = 60;        // wait 60s between retries
    public int $timeout = 30;        // kill after 30s

    public function __construct(public readonly User $user) {}

    public function handle(MailerInterface $mailer): void {
        $mailer->to($this->user->email)->send(new WelcomeMail($this->user));
    }

    public function failed(\Throwable $e): void {
        Log::error('Welcome email failed', [
            'user_id' => $this->user->id,
            'error'   => $e->getMessage(),
        ]);
        // Notify Slack, increment failure counter, etc.
    }
}

// Dispatch
SendWelcomeEmail::dispatch($user);
SendWelcomeEmail::dispatch($user)->onQueue('emails');  // specific queue
SendWelcomeEmail::dispatch($user)->delay(now()->addMinutes(5)); // delayed
</code></pre>
</div>

<h2>Цепочки заданий (Job Chaining)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Sequential jobs</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Jobs run in sequence — second starts only after first succeeds
Bus::chain([
    new ProcessPayment($order),
    new SendOrderConfirmation($order),
    new UpdateInventory($order),
])->dispatch();
</code></pre>
</div>

<h2>Пакетная обработка заданий (Job Batching)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Parallel jobs with callbacks</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">$batch = Bus::batch([
    new ImportUsersChunk($chunk1),
    new ImportUsersChunk($chunk2),
    new ImportUsersChunk($chunk3),
])
->then(fn(Batch $b) => Log::info("All {$b->totalJobs} chunks imported"))
->catch(fn(Batch $b, \Throwable $e) => Log::error('Import failed', ['error' => $e->getMessage()]))
->finally(fn(Batch $b) => Cache::forget('import_lock'))
->dispatch();

echo $batch->id; // UUID to track batch progress
</code></pre>
</div>

<h2>Ограничение частоты запуска заданий</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class SendSmsNotification implements ShouldQueue {
    public function middleware(): array {
        // Max 5 SMS per second (Twilio limit)
        return [new RateLimited('sms-notifications')];
    }
}

// In AppServiceProvider
RateLimiter::for('sms-notifications', fn($job) =>
    Limit::perSecond(5)
);
</code></pre>
</div>

<h2>Запуск воркеров</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash — Development + Production</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Development
php artisan queue:work --tries=3 --timeout=60

# Production: Supervisor keeps workers running
# /etc/supervisor/conf.d/laravel-worker.conf
[program:laravel-worker]
command=php /var/www/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
numprocs=8
autostart=true
autorestart=true

# Horizon (Redis only) — beautiful dashboard + metrics
composer require laravel/horizon
php artisan horizon
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>Задания реализуют ShouldQueue — Laravel сериализует их и помещает в настроенный драйвер очереди</li>
    <li>Устанавливайте <code>$tries</code>, <code>$backoff</code> и <code>$timeout</code> для каждого задания; реализуйте <code>failed()</code> для оповещений</li>
    <li>Цепочки: последовательные задания, каждое ждёт предыдущего; Пакеты: параллельные задания с отслеживанием прогресса</li>
    <li>Middleware ограничения частоты: управляйте потоком заданий, чтобы соблюдать лимиты внешних API</li>
    <li>Продакшн: Supervisor для управления процессами, Laravel Horizon для очередей Redis с метриками</li>
  </ul>
</div>
`,
  },

  'graphql': {
    body: `
<h2>GraphQL vs REST — честные компромиссы</h2>
<p>REST ориентирован на ресурсы: каждый эндпоинт соответствует существительному (<code>/products/42</code>). Сервер диктует форму ответа. GraphQL ориентирован на операции: клиент описывает нужный граф данных, а сервер его выполняет. REST выигрывает по простоте, кэшируемости (HTTP-методы + URL хорошо ложатся на CDN-кэш) и зрелости инструментов. GraphQL выигрывает по устранению избыточной выборки (мобильные клиенты получают только нужные данные), устранению недостаточной выборки (нет цепочек запросов) и строгой типизации через Schema Definition Language. Неправильный ответ — «всегда используй GraphQL». Выбирайте REST для простых CRUD API, публичных интеграций и всего, что требует агрессивного HTTP-кэширования. Выбирайте GraphQL для сложных многосущностных дашбордов, мобильных приложений с ограниченным трафиком и команд, где фронтенд развивается быстрее бэкенда.</p>

<h2>Schema Definition Language</h2>
<p>SDL — это система типов GraphQL. У каждого поля есть тип; типы могут быть скалярными (String, Int, Float, Boolean, ID) или объектными, которые вы определяете сами. Восклицательный знак обозначает non-null. Типы <code>Query</code>, <code>Mutation</code> и <code>Subscription</code> являются точками входа в граф. Input-типы используются исключительно в аргументах мутаций — нельзя переиспользовать output-типы как input.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">GraphQL SDL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-graphql">type Product {
  id: ID!
  name: String!
  price: Float!
  category: Category!      # Nested object — this is where N+1 happens
  reviews: [Review!]!
  inStock: Boolean!
  createdAt: String!
}

type Category {
  id: ID!
  name: String!
  products: [Product!]!
}

type Review {
  id: ID!
  rating: Int!
  body: String!
  author: User!
}

# Input types for mutations
input CreateProductInput {
  name: String!
  price: Float!
  categoryId: ID!
}

input UpdateProductInput {
  name: String
  price: Float
  categoryId: ID
}

type Query {
  product(id: ID!): Product
  products(first: Int, after: String): ProductConnection!
  searchProducts(query: String!, first: Int): ProductConnection!
}

type Mutation {
  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: ID!, input: UpdateProductInput!): Product!
  deleteProduct(id: ID!): Boolean!
}

# Cursor-based pagination envelope
type ProductConnection {
  edges: [ProductEdge!]!
  pageInfo: PageInfo!
}

type ProductEdge {
  node: Product!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
</code></pre>
</div>

<h2>Резолверы и модель выполнения</h2>
<p>У каждого поля в схеме GraphQL есть функция-резолвер — функция, возвращающая данные для этого поля. Если явный резолвер не определён, резолвер по умолчанию возвращает свойство с тем же именем из родительского объекта. Движок выполнения вызывает резолверы в глубину, начиная с корневого резолвера Query/Mutation. Это означает, что если запрос возвращает 100 продуктов и у каждого есть поле <code>category</code>, резолвер категории будет вызван 100 раз — по одному на каждый продукт. Это и есть проблема N+1.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Lighthouse (Laravel GraphQL) — custom resolver using @field directive
// graphql/schema.graphql:
// type Query {
//   product(id: ID! @eq): Product @find
//   products: [Product!]! @paginate(defaultCount: 20)
// }

// Lighthouse built-in directives handle common cases:
// @find         — find single model by argument
// @paginate     — paginate a model list
// @create       — create model from input
// @update       — update model from input
// @delete       — delete model by ID
// @belongsTo    — resolve BelongsTo relation (with batching)
// @hasMany      — resolve HasMany relation (with batching)

// Custom resolver class
namespace App\GraphQL\Queries;

use App\Models\Product;

class ProductSearch
{
    public function __invoke(mixed $root, array $args): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return Product::query()
            ->where('name', 'like', "%{$args['query']}%")
            ->with('category') // eager load to prevent N+1
            ->paginate($args['first'] ?? 20);
    }
}

// Mutation resolver
namespace App\GraphQL\Mutations;

class CreateProduct
{
    public function __invoke(mixed $root, array $args): Product
    {
        return Product::create([
            'name'        => $args['input']['name'],
            'price'       => $args['input']['price'],
            'category_id' => $args['input']['categoryId'],
        ]);
    }
}
</code></pre>
</div>

<h2>Проблема N+1 и пакетная загрузка (DataLoader)</h2>
<p>Проблема N+1 — наиболее критическая проблема производительности в GraphQL. Когда запрос списка возвращает N элементов и каждый элемент разрешает связанную сущность, вы получаете N+1 запросов к базе данных: 1 для списка и N для связанных сущностей. Каноническое решение — DataLoader: утилита пакетирования и кэширования, которая собирает все запрошенные ID в течение одного тика цикла событий, затем выполняет один запрос <code>WHERE id IN (...)</code>. В Lighthouse директивы связей (<code>@belongsTo</code>, <code>@hasMany</code>) автоматически используют встроенные пакетные загрузчики.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Manual DataLoader-style batching in PHP (concept)
// Lighthouse handles this automatically for Eloquent relations

// Without batching — N+1 problem (100 products = 101 queries)
$products = Product::all();
foreach ($products as $product) {
    // Each call fires SELECT * FROM categories WHERE id = ?
    echo $product->category->name;
}

// With Eloquent eager loading — 2 queries total
$products = Product::with('category', 'reviews.author')->get();
foreach ($products as $product) {
    echo $product->category->name; // already loaded
}

// In Lighthouse schema — @belongsTo uses batch loading automatically
// type Product {
//   category: Category! @belongsTo  # Lighthouse batches this internally
//   reviews: [Review!]! @hasMany    # Also batched
// }

// Custom batch loader for non-Eloquent data sources
use Nuwave\Lighthouse\Execution\DataLoader\BatchLoader;

class ExternalPricingLoader extends BatchLoader
{
    public function resolve(): array
    {
        $ids = array_keys($this->keys);

        // Single API call for all product IDs
        $prices = ExternalPricingService::fetchBatch($ids);

        return collect($prices)->keyBy('product_id')->toArray();
    }
}
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Совет</div>
  <p>Всегда используйте Laravel Telescope или счётчик запросов в разработке для обнаружения N+1 проблем до продакшна. В Lighthouse включение <code>LIGHTHOUSE_QUERY_LOG=true</code> в <code>.env</code> будет логировать все SQL-запросы на каждый GraphQL-запрос, чтобы сразу находить незагружаемые пакетно резолверы.</p>
</div>

<h2>Фрагменты и переменные</h2>
<p>Фрагменты позволяют клиентам определять переиспользуемые выборки полей, которые можно встроить в несколько запросов. Это критически важно для поддерживаемости фронтенда — фрагмент <code>ProductCard</code> можно определить один раз и использовать в запросе главной страницы, запросе поиска и запросе корзины. Переменные заменяют встроенные литеральные значения, позволяя переиспользовать запросы и предотвращая инъекции, поскольку пользовательский ввод хранится отдельно от строки запроса.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">GraphQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-graphql"># Fragment definition
fragment ProductCard on Product {
  id
  name
  price
  inStock
  category {
    id
    name
  }
}

# Query using fragment and variables
query GetProducts($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    edges {
      node {
        ...ProductCard    # Spread the fragment
        reviews {
          rating
          body
        }
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# Variables sent alongside the query (JSON)
# { "first": 20, "after": "eyJpZCI6MTAwfQ==" }
</code></pre>
</div>

<h2>Курсорная пагинация</h2>
<p>Пагинация на основе смещения (<code>LIMIT 20 OFFSET 100</code>) ломается на высоконагруженных лентах, потому что строки, вставленные между страницами, приводят к пропуску или дублированию элементов. Курсорная пагинация использует непрозрачный токен (обычно base64-закодированный <code>id</code> или временная метка <code>created_at</code>), обозначающий последнюю просмотренную позицию. Следующий запрос получает элементы после этого курсора через <code>WHERE id > :cursor LIMIT 20</code>. Это стабильно независимо от одновременных вставок. Спецификация Relay Connection формализует конверт (<code>edges</code>, <code>node</code>, <code>cursor</code>, <code>pageInfo</code>), который Lighthouse реализует по умолчанию.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Manual cursor pagination for custom resolvers
class ProductCursorPaginator
{
    public function paginate(int $first, ?string $after): array
    {
        $query = Product::orderBy('id')->limit($first + 1);

        if ($after !== null) {
            $afterId = base64_decode($after); // decode opaque cursor
            $query->where('id', '>', $afterId);
        }

        $products = $query->get();
        $hasNextPage = $products->count() > $first;
        $items = $products->take($first);

        $edges = $items->map(fn(Product $p) => [
            'node'   => $p,
            'cursor' => base64_encode((string) $p->id),
        ]);

        return [
            'edges' => $edges,
            'pageInfo' => [
                'hasNextPage'     => $hasNextPage,
                'hasPreviousPage' => $after !== null,
                'startCursor'     => $edges->first()['cursor'] ?? null,
                'endCursor'       => $edges->last()['cursor'] ?? null,
            ],
        ];
    }
}

// In Lighthouse schema — @paginate uses cursor pagination automatically:
// type Query {
//   products: [Product!]! @paginate(type: CONNECTION, defaultCount: 20)
// }
</code></pre>
</div>

<h2>Подписки (Subscriptions)</h2>
<p>GraphQL Subscriptions отправляют обновления в реальном времени от сервера клиенту через постоянное соединение (как правило, WebSocket). Они определяются в схеме как запросы, но используют корневой тип <code>Subscription</code>. В Lighthouse подписки транслируются через Laravel Echo и Pusher или настраиваемый WebSocket-драйвер. Каждый резолвер подписки должен реализовывать метод <code>subscribe</code>, определяющий, какие клиенты получают данную трансляцию.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// graphql/schema.graphql
// type Subscription {
//   orderStatusUpdated(orderId: ID!): Order! @subscription
// }

// Subscription class
namespace App\GraphQL\Subscriptions;

use Nuwave\Lighthouse\Schema\Types\GraphQLSubscription;
use Nuwave\Lighthouse\Subscriptions\Subscriber;

class OrderStatusUpdated extends GraphQLSubscription
{
    // Unique channel name per subscriber
    public function encodeTopic(Subscriber $subscriber, string $fieldName): string
    {
        return 'order-status-' . $subscriber->args['orderId'];
    }

    // Filter: only send to subscribers watching this specific order
    public function filter(Subscriber $subscriber, mixed $root): bool
    {
        return $root->id === (int) $subscriber->args['orderId'];
    }
}

// Trigger subscription broadcast from mutation
use Nuwave\Lighthouse\Subscriptions\Contracts\BroadcastsSubscriptions;

class UpdateOrderStatus
{
    public function __invoke(mixed $root, array $args, mixed $context, mixed $info): Order
    {
        $order = Order::findOrFail($args['id']);
        $order->update(['status' => $args['status']]);

        // Broadcast to all subscribers watching this order
        app(BroadcastsSubscriptions::class)->queueBroadcast(
            new OrderStatusUpdated(),
            'orderStatusUpdated',
            $order
        );

        return $order;
    }
}
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Совет</div>
  <p>GraphQL не имеет нативного HTTP-кэширования, как REST, поскольку все запросы — это POST на один эндпоинт. Используйте persisted queries (хэширование запроса с отправкой только хэша) вместе с GET-запросами, чтобы включить CDN-кэширование общих запросов. Apollo Server и Lighthouse поддерживают persisted queries.</p>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Как обрабатывать авторизацию в GraphQL — на уровне резолвера или на уровне схемы?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Необходимы оба уровня. Авторизация на уровне схемы (директива <code>@guard</code> Lighthouse) отклоняет неаутентифицированные запросы до запуска резолвера. Авторизация на уровне полей (директива <code>@can</code> или ручные проверки внутри резолверов) обеспечивает детальные права доступа на каждую сущность — например, пользователь может читать только свои заказы, а не чужие. Никогда не полагайтесь только на авторизацию на уровне схемы, потому что аутентифицированный злоумышленник всё равно может попытаться прочитать данные, к которым не должен иметь доступа. Правило: аутентифицируйте на уровне схемы/маршрута, авторизуйте на уровне резолвера/поля.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Когда вы бы выбрали REST вместо GraphQL даже для сложного приложения?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Выбирайте REST когда: (1) Нужно агрессивное HTTP-кэширование на уровне CDN — единый POST-эндпоинт GraphQL затрудняет это без persisted queries. (2) Ваш API публичен и используется третьими сторонами, более знакомыми с REST-конвенциями. (3) Команда небольшая и накладные расходы на обслуживание схемы, инструменты (генерация кода, persisted queries) и отладку планов выполнения GraphQL перевешивают преимущества гибкости. (4) Модель данных простая и плоская — мощь GraphQL раскрывается в глубоко вложенных, связанных графах; для простого CRUD это избыточно. (5) Загрузка файлов является приоритетом — multipart-загрузка файлов в GraphQL неудобна по сравнению с REST.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Что такое schema stitching и federation в GraphQL?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>В архитектуре микросервисов каждый сервис может владеть своей схемой GraphQL. Schema stitching (более старый подход) объединяет несколько схем в одну на уровне шлюза. Apollo Federation (современный подход) позволяет каждому сервису декларировать, какими типами он владеет и какие расширяет, а шлюз компонует их в единый граф. Federation предпочтительнее, потому что каждый сервис остаётся независимо развёртываемым, а компоновка схемы происходит декларативно. Lighthouse не поддерживает federation нативно, но можно использовать Node.js Apollo Gateway перед несколькими сервисами на Lighthouse.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>GraphQL устраняет избыточную и недостаточную выборку, позволяя клиентам указывать именно нужные данные.</li>
    <li>Проблема N+1 — наиболее распространённая ловушка производительности GraphQL: каждый резолвер вложенного объекта вызывается отдельно без пакетирования. Используйте DataLoader или встроенные пакетные загрузчики Lighthouse.</li>
    <li>Директивы Lighthouse (<code>@find</code>, <code>@paginate</code>, <code>@belongsTo</code>, <code>@hasMany</code>, <code>@create</code>, <code>@update</code>) покрывают наиболее распространённые паттерны резолверов без написания PHP-кода.</li>
    <li>Используйте курсорную пагинацию (Relay Connection Spec) вместо пагинации со смещением для стабильных, последовательных результатов на высоконагруженных лентах.</li>
    <li>Авторизация на двух уровнях: аутентификация на уровне схемы/маршрута, авторизация для каждого поля/сущности внутри резолверов.</li>
    <li>Подписки GraphQL требуют постоянных WebSocket-соединений — проектируйте инфраструктуру (горизонтальное масштабирование, sticky sessions или общее состояние) соответственно.</li>
    <li>REST не устарел — он превосходит GraphQL для простых API, публичных интеграций и сценариев с агрессивным HTTP-кэшированием.</li>
    <li>Используйте переменные вместо встроенных литералов в запросах для предотвращения инъекций и повторного использования запросов.</li>
  </ul>
</div>
`,
  },

  'oauth2': {
    body: `
<h2>OAuth 2.0 потоки (Flows)</h2>
<table class="ctable">
  <thead><tr><th>Поток</th><th>Сценарий использования</th><th>Тип клиента</th></tr></thead>
  <tbody>
    <tr><td>Authorization Code + PKCE</td><td>Веб-приложения, SPA, мобильные</td><td>Публичный или конфиденциальный</td></tr>
    <tr><td>Client Credentials</td><td>Машина-к-машине (M2M)</td><td>Конфиденциальный (сервер)</td></tr>
    <tr><td>Device Code</td><td>TV, CLI, IoT</td><td>Публичный</td></tr>
    <tr><td>Implicit (устарел)</td><td>Старые SPA</td><td>Избегайте — используйте Auth Code + PKCE</td></tr>
  </tbody>
</table>

<h2>Поток Authorization Code с PKCE</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — PKCE generation</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Step 1: Generate code verifier and challenge
$codeVerifier  = bin2hex(random_bytes(32)); // 64-char random string
$codeChallenge = rtrim(strtr(base64_encode(hash('sha256', $codeVerifier, true)), '+/', '-_'), '=');

// Store code verifier in session
Session::put('pkce_verifier', $codeVerifier);

// Step 2: Redirect to auth server
$authUrl = 'https://auth.example.com/authorize?' . http_build_query([
    'response_type'         => 'code',
    'client_id'             => config('oauth.client_id'),
    'redirect_uri'          => route('oauth.callback'),
    'scope'                 => 'openid profile email',
    'state'                 => csrf_token(), // CSRF protection
    'code_challenge'        => $codeChallenge,
    'code_challenge_method' => 'S256',
]);
return redirect($authUrl);

// Step 3: Exchange code for tokens (callback)
function handleCallback(Request $request): void {
    // Verify state (CSRF)
    if ($request->state !== session('_token')) abort(403);

    $response = Http::post('https://auth.example.com/token', [
        'grant_type'    => 'authorization_code',
        'code'          => $request->code,
        'redirect_uri'  => route('oauth.callback'),
        'client_id'     => config('oauth.client_id'),
        'code_verifier' => session('pkce_verifier'), // proves possession
    ]);
    $tokens = $response->json();
    // Store access_token, refresh_token securely
}
</code></pre>
</div>

<h2>Структура и верификация JWT</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — JWT manual implementation</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">function jwtSign(array $payload, string $secret): string {
    $header  = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64url_encode(json_encode($payload));
    $sig     = base64url_encode(hash_hmac('sha256', "{$header}.{$payload}", $secret, true));
    return "{$header}.{$payload}.{$sig}";
}

function jwtVerify(string $token, string $secret): array {
    [$header, $payload, $sig] = explode('.', $token);
    $expected = base64url_encode(hash_hmac('sha256', "{$header}.{$payload}", $secret, true));

    if (!hash_equals($expected, $sig)) throw new \RuntimeException('Invalid JWT signature');

    $claims = json_decode(base64url_decode($payload), true);
    if ($claims['exp'] < time()) throw new \RuntimeException('JWT expired');

    return $claims;
}

// In production use firebase/php-jwt or lcobucci/jwt library
// Issue token
$token = jwtSign([
    'sub'   => $user->id,
    'email' => $user->email,
    'roles' => ['user'],
    'iat'   => time(),
    'exp'   => time() + 3600, // 1 hour
], config('app.jwt_secret'));
</code></pre>
</div>

<h2>Ротация Refresh Token</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Secure refresh token handling</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class TokenService {
    public function refresh(string $refreshToken): array {
        $stored = RefreshToken::where('token', hash('sha256', $refreshToken))
            ->where('expires_at', '>', now())
            ->where('revoked', false)
            ->firstOrFail();

        // Rotation: revoke old token, issue new pair
        $stored->update(['revoked' => true]);

        $newRefresh = bin2hex(random_bytes(32));
        RefreshToken::create([
            'user_id'    => $stored->user_id,
            'token'      => hash('sha256', $newRefresh),
            'expires_at' => now()->addDays(30),
        ]);

        return [
            'access_token'  => $this->issueAccessToken($stored->user_id),
            'refresh_token' => $newRefresh, // send plain token to client
        ];
    }
}
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Laravel Sanctum vs Passport</div>
  <p><strong>Sanctum</strong>: простая токен-аутентификация для SPA и мобильных приложений. Без полного OAuth-сервера. Используйте для собственных клиентов. <strong>Passport</strong>: полная реализация OAuth 2.0 сервера. Используйте, когда нужно авторизовать сторонние приложения (как GitHub OAuth apps). Оба используют систему guard Laravel.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>Всегда используйте Authorization Code + PKCE для публичных клиентов (SPA, мобильные) — никогда implicit flow</li>
    <li>JWT: проверяйте подпись И срок действия; используйте RS256 (асимметричный) для многосервисных сред</li>
    <li>Refresh tokens: храните в хэшированном виде, ротируйте при использовании, отзывайте при подозрительном повторном использовании</li>
    <li>Никогда не храните JWT в localStorage (риск XSS) — используйте httpOnly secure cookies для веб-приложений</li>
    <li>OpenID Connect = OAuth 2.0 + слой идентификации (id_token с данными пользователя)</li>
  </ul>
</div>
`,
  },

  'sql-fundamentals': {
    body: `
<h2>Порядок выполнения SQL</h2>
<p>SQL пишется в одном порядке, но выполняется в другом. Понимание этого критически важно — это объясняет, почему нельзя использовать псевдонимы из SELECT в WHERE, и почему существует HAVING:</p>
<ol>
  <li><strong>FROM & JOIN</strong> — какие таблицы?</li>
  <li><strong>WHERE</strong> — фильтрация строк (до агрегации, использует индексы)</li>
  <li><strong>GROUP BY</strong> — группировка строк</li>
  <li><strong>HAVING</strong> — фильтрация групп (после агрегации)</li>
  <li><strong>SELECT</strong> — какие столбцы вернуть</li>
  <li><strong>DISTINCT</strong> — удаление дубликатов</li>
  <li><strong>ORDER BY</strong> — сортировка результатов</li>
  <li><strong>LIMIT / OFFSET</strong> — пагинация</li>
</ol>

<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — Core Queries</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Full example: top 5 customers by 2024 revenue
SELECT
    c.id,
    c.name,
    COUNT(o.id)       AS total_orders,
    SUM(o.total)      AS revenue,
    AVG(o.total)      AS avg_order
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id
WHERE o.created_at BETWEEN '2024-01-01' AND '2024-12-31'
  AND o.status = 'completed'
GROUP BY c.id, c.name
HAVING revenue > 1000          -- filter AFTER aggregation
ORDER BY revenue DESC
LIMIT 5;

-- COUNT traps:
SELECT
    COUNT(*)           AS all_rows,        -- counts NULLs
    COUNT(phone)       AS has_phone,       -- ignores NULLs!
    COUNT(DISTINCT city) AS unique_cities  -- distinct non-null values
FROM customers;
</code></pre>
</div>

<h2>Все типы JOIN</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — JOINs</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- INNER JOIN: only rows matching in BOTH tables
SELECT u.name, d.name AS dept
FROM users u
INNER JOIN departments d ON u.department_id = d.id;

-- LEFT JOIN: ALL rows from left + matched from right (NULL if no match)
SELECT u.name, d.name AS dept  -- users with no dept get NULL for dept
FROM users u
LEFT JOIN departments d ON u.department_id = d.id;

-- Anti-join: find users with NO department
SELECT u.name FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE d.id IS NULL;

-- Self-join: employees and their managers (same table)
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
</code></pre>
</div>

<h2>CTE и оконные функции</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — CTEs & Windows</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- CTE: named temporary result set — makes complex queries readable
WITH monthly_revenue AS (
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
           SUM(total) AS revenue
    FROM orders
    WHERE status = 'completed'
    GROUP BY month
),
ranked AS (
    SELECT *, RANK() OVER (ORDER BY revenue DESC) AS rnk
    FROM monthly_revenue
)
SELECT month, revenue, rnk
FROM ranked WHERE rnk <= 3;

-- Window functions: aggregate WITHOUT collapsing rows
SELECT
    name,
    department,
    salary,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg,
    RANK()      OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,
    LAG(salary) OVER (ORDER BY hire_date)      AS prev_salary
FROM employees;

-- Recursive CTE: traverse category tree
WITH RECURSIVE tree AS (
    SELECT id, name, parent_id, 0 AS depth
    FROM categories WHERE parent_id IS NULL  -- anchor
    UNION ALL
    SELECT c.id, c.name, c.parent_id, t.depth + 1
    FROM categories c JOIN tree t ON c.parent_id = t.id
)
SELECT REPEAT('  ', depth) || name AS hierarchy FROM tree;
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>Порядок выполнения: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</li>
    <li>WHERE фильтрует строки до группировки (использует индексы). HAVING фильтрует группы после агрегации.</li>
    <li>COUNT(*) считает все строки включая NULL. COUNT(column) игнорирует NULL — частая ловушка!</li>
    <li>INNER JOIN = только совпадения. LEFT JOIN = все строки левой таблицы, NULL для несовпавших правых.</li>
    <li>Паттерн anti-join: LEFT JOIN + WHERE right.id IS NULL — найти строки без совпадений</li>
    <li>CTE (WITH): именование промежуточных результатов для читаемых сложных запросов</li>
    <li>Оконные функции: RANK, ROW_NUMBER, LAG, LEAD, SUM OVER — агрегация без схлопывания строк</li>
  </ul>
</div>
`,
  },

  'sql-advanced': {
    body: `
<h2>Оконные функции</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Running total of sales per salesperson
SELECT salesperson_id, sale_date, amount,
    SUM(amount) OVER (
        PARTITION BY salesperson_id
        ORDER BY sale_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM sales;

-- Rank users by score within each country
SELECT user_id, country, score,
    RANK()       OVER (PARTITION BY country ORDER BY score DESC) AS rank,
    DENSE_RANK() OVER (PARTITION BY country ORDER BY score DESC) AS dense_rank,
    ROW_NUMBER() OVER (PARTITION BY country ORDER BY score DESC) AS row_num
FROM users;

-- Lead/Lag: compare with previous/next row
SELECT order_date, total,
    LAG(total)  OVER (ORDER BY order_date) AS prev_total,
    LEAD(total) OVER (ORDER BY order_date) AS next_total,
    total - LAG(total) OVER (ORDER BY order_date) AS delta
FROM orders;
</code></pre>
</div>

<h2>Top-N по группе</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">WITH ranked AS (
    SELECT category_id, product_id, revenue,
        ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY revenue DESC) AS rn
    FROM products
)
SELECT * FROM ranked WHERE rn <= 3;
</code></pre>
</div>

<h2>Рекурсивные CTE</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — Org chart traversal</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">WITH RECURSIVE org_tree AS (
    SELECT id, name, manager_id, 0 AS depth
    FROM employees WHERE manager_id IS NULL  -- anchor
    UNION ALL
    SELECT e.id, e.name, e.manager_id, ot.depth + 1
    FROM employees e
    JOIN org_tree ot ON e.manager_id = ot.id  -- recursive
)
SELECT depth, name FROM org_tree ORDER BY depth;
</code></pre>
</div>

<h2>EXPLAIN ANALYZE</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name;

-- Seq Scan on large table → add index
-- Nested Loop with many rows → consider Hash Join
-- High actual vs estimated rows → run ANALYZE to refresh stats
</code></pre>
</div>

<h2>Коррелированный подзапрос → JOIN</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Slow: correlated subquery executes once per user row
SELECT id, name, (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS cnt
FROM users u;

-- Fast: single aggregating JOIN
SELECT u.id, u.name, COALESCE(o.cnt, 0) AS cnt
FROM users u
LEFT JOIN (SELECT user_id, COUNT(*) AS cnt FROM orders GROUP BY user_id) o
    ON o.user_id = u.id;
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>PARTITION BY делит строки на группы для оконных вычислений; ORDER BY задаёт порядок фрейма</li>
    <li>RANK() имеет пропуски (1,1,3); DENSE_RANK() — нет (1,1,2); ROW_NUMBER() всегда уникален</li>
    <li>Рекурсивный CTE: якорный запрос + UNION ALL + рекурсивный член, соединяющийся обратно с CTE</li>
    <li>EXPLAIN ANALYZE: найдите Seq Scan на больших таблицах, устаревшую статистику, производительность nested loop</li>
    <li>Коррелированный подзапрос = N выполнений; JOIN с производной таблицей = 1 сканирование — всегда предпочитайте JOIN</li>
  </ul>
</div>
`,
  },

  'sql-indexes': {
    body: `
<h2>Как работают B-Tree индексы</h2>
<p>B-tree индекс — это <strong>отдельная отсортированная структура данных</strong> с указателями на строки таблицы. Как указатель в книге — вместо чтения каждой страницы для поиска «аутентификация», перейдите сразу к номеру страницы. Поиск в B-tree — <strong>O(log n)</strong>. Для 1М строк: ~20 сравнений против 1 000 000 без индекса.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — Creating Indexes</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Single column
CREATE INDEX idx_users_email ON users (email);
CREATE UNIQUE INDEX idx_users_email ON users (email);

-- ALWAYS index foreign keys — MySQL won't do it automatically
CREATE INDEX idx_orders_customer ON orders (customer_id);

-- Composite index — column ORDER matters (leftmost prefix rule)
CREATE INDEX idx_orders_lookup ON orders (customer_id, status, created_at);

-- ✓ Uses the index:
SELECT * FROM orders WHERE customer_id = 5;
SELECT * FROM orders WHERE customer_id = 5 AND status = 'paid';
SELECT * FROM orders WHERE customer_id = 5 AND status = 'paid' AND created_at > '2024-01-01';

-- ✗ Does NOT use the index (skips leftmost columns):
SELECT * FROM orders WHERE status = 'paid';
SELECT * FROM orders WHERE created_at > '2024-01-01';

-- Covering index: all columns the query needs are IN the index
-- MySQL never touches the actual table row → fastest possible
CREATE INDEX idx_orders_covering ON orders (customer_id, status, total);
EXPLAIN SELECT SUM(total) FROM orders WHERE customer_id = 5 AND status = 'completed';
-- Extra: "Using index" ← never hit the table
</code></pre>
</div>

<h2>Чтение EXPLAIN</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — EXPLAIN Output</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">EXPLAIN SELECT * FROM users WHERE email = 'ali@example.com';

-- type column (BEST → WORST):
-- const    → primary key / unique index — single row — fastest
-- eq_ref   → unique index join
-- ref      → non-unique index — multiple rows
-- range    → index range scan (BETWEEN, >, <, IN)
-- index    → full index scan — slow but better than ALL
-- ALL      → full TABLE scan — YOUR ENEMY — fix this!

-- key column:
-- NULL     = no index used = bad
-- idx_name = which index MySQL chose

-- rows column: estimated rows examined — lower is better

-- Extra column:
-- "Using index"      → covering index — fastest
-- "Using where"      → filter after index lookup
-- "Using filesort"   → no index for ORDER BY — slow!
-- "Using temporary"  → temp table — very slow!

-- BAD: wrapping indexed column in a function kills the index
EXPLAIN SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- type: ALL — can't use index on created_at!

-- GOOD: let MySQL use a range on the raw column
EXPLAIN SELECT * FROM users
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31 23:59:59';
-- type: range
</code></pre>
</div>

<h2>Золотые правила</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — Indexing Rules</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- RULE 1: Never wrap indexed columns in functions
-- ✗ BAD:
WHERE LOWER(email) = 'ali@example.com'   -- index on email is useless
WHERE DATE(created_at) = '2024-01-15'    -- index on created_at is useless

-- ✓ GOOD: wrap the constant, not the column
WHERE email = LOWER('Ali@Example.com')
WHERE created_at >= '2024-01-15' AND created_at < '2024-01-16'

-- RULE 2: Composite index — equality columns first, range last
-- Good for: WHERE status='paid' AND created_at > X
CREATE INDEX good ON orders (status, created_at);
-- Bad for same query:
CREATE INDEX bad  ON orders (created_at, status); -- range on created_at blocks status use

-- RULE 3: When NOT to add an index
-- - Small tables (< 1000 rows) — full scan is negligible
-- - Columns rarely in WHERE/JOIN/ORDER BY
-- - Very low cardinality (boolean, gender) — optimizer may skip it anyway
-- - Write-heavy tables — every INSERT/UPDATE/DELETE must update all indexes

-- RULE 4: Avoid OFFSET for pagination — use keyset instead
-- ✗ BAD: reads 100000 rows then discards them
SELECT * FROM orders ORDER BY id LIMIT 10 OFFSET 100000;

-- ✓ GOOD: keyset pagination — always O(log n)
SELECT * FROM orders WHERE id > :last_seen_id ORDER BY id LIMIT 10;
</code></pre>
</div>

<h2>Вопросы на собеседовании</h2>
<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)"><span class="qa-q-text">Q: Запрос работает медленно. Опишите процесс отладки.</span><span class="qa-arrow">▼</span></div>
  <div class="qa-a"><p>Шаг 1: запустите EXPLAIN. Смотрите на type (ALL = плохо), key (NULL = нет индекса), rows (большое значение = сканирование многих строк). Шаг 2: проверьте, проиндексированы ли столбцы в WHERE/JOIN. Шаг 3: проверьте наличие функций на индексированных столбцах. Шаг 4: проверьте порядок столбцов в составном индексе — он должен соответствовать разделению равенство/диапазон в вашем запросе. Шаг 5: проверьте Extra на наличие «Using filesort» или «Using temporary». Шаг 6: добавьте или скорректируйте индексы, снова запустите EXPLAIN для проверки улучшения. Если запрос всё ещё медленный после индексации, изучите структуру запроса — возможно, коррелированный подзапрос можно переписать как JOIN.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>B-tree: отсортированный, поиск O(log n). Без индекса = O(n) полное сканирование</li>
    <li>Правило крайнего левого префикса составного индекса: (a,b,c) помогает (a), (a,b), (a,b,c) — но не (b) отдельно</li>
    <li>Покрывающий индекс: все нужные столбцы в индексе → никогда не читает строку таблицы. «Using index» в EXPLAIN.</li>
    <li>НИКОГДА не оборачивайте индексированные столбцы в функции — используйте необработанный столбец в WHERE</li>
    <li>EXPLAIN type=ALL — ваш враг. key=NULL означает, что индекс не используется.</li>
    <li>Всегда индексируйте столбцы FK в MySQL — это не происходит автоматически, как в PostgreSQL</li>
    <li>Столбцы равенства первыми, столбцы диапазона последними в составных индексах</li>
  </ul>
</div>
`,
  },

  'sql-transactions': {
    body: `
<h2>Свойства ACID</h2>
<table class="ctable">
  <thead><tr><th>Свойство</th><th>Значение</th><th>Пример</th></tr></thead>
  <tbody>
    <tr><td>Atomicity (Атомарность)</td><td>Всё или ничего</td><td>Банковский перевод: дебет + кредит оба фиксируются или оба откатываются</td></tr>
    <tr><td>Consistency (Согласованность)</td><td>Из одного корректного состояния в другое</td><td>Ограничение баланса аккаунта: не может быть отрицательным</td></tr>
    <tr><td>Isolation (Изоляция)</td><td>Параллельные транзакции не видят частичного состояния</td><td>Два пользователя бронируют последнее место — только один успешен</td></tr>
    <tr><td>Durability (Долговечность)</td><td>Зафиксированные данные переживают сбои</td><td>Платёж, зафиксированный до краша сервера, не теряется</td></tr>
  </tbody>
</table>

<h2>Уровни изоляции и аномалии</h2>
<table class="ctable">
  <thead><tr><th>Уровень</th><th>Грязное чтение</th><th>Неповторяемое чтение</th><th>Фантомное чтение</th></tr></thead>
  <tbody>
    <tr><td>READ UNCOMMITTED</td><td>Возможно</td><td>Возможно</td><td>Возможно</td></tr>
    <tr><td>READ COMMITTED</td><td>Нет</td><td>Возможно</td><td>Возможно</td></tr>
    <tr><td>REPEATABLE READ</td><td>Нет</td><td>Нет</td><td>Возможно (MySQL: Нет)</td></tr>
    <tr><td>SERIALIZABLE</td><td>Нет</td><td>Нет</td><td>Нет</td></tr>
  </tbody>
</table>

<h2>Пессимистическая блокировка</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">BEGIN;
SELECT balance FROM accounts WHERE id = 42 FOR UPDATE;
-- Other transactions waiting for id=42 will block until COMMIT/ROLLBACK
UPDATE accounts SET balance = balance - 100 WHERE id = 42;
UPDATE accounts SET balance = balance + 100 WHERE id = 99;
COMMIT;
</code></pre>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">DB::transaction(function() use ($fromId, $toId, $amount) {
    // Always lock in consistent order (smaller ID first) to prevent deadlocks
    [$first, $second] = $fromId < $toId
        ? [$fromId, $toId]
        : [$toId, $fromId];

    Account::whereIn('id', [$first, $second])
        ->orderBy('id')
        ->lockForUpdate()
        ->get()
        ->keyBy('id');

    $from = Account::find($fromId);
    if ($from->balance < $amount) throw new InsufficientFundsException();
    $from->decrement('balance', $amount);
    Account::find($toId)->increment('balance', $amount);
});
</code></pre>
</div>

<h2>Оптимистическая блокировка</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Schema: add version column
ALTER TABLE products ADD COLUMN version INT DEFAULT 0;

-- Read
SELECT id, name, stock, version FROM products WHERE id = 42;
-- Returns: id=42, stock=10, version=5

-- Conditional update — fails if someone else updated meanwhile
UPDATE products
SET stock = 9, version = version + 1
WHERE id = 42 AND version = 5;
-- affected_rows = 0 means conflict → retry or return error
</code></pre>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel with optimistic lock</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Eloquent doesn't have built-in optimistic locking — implement manually:
$product = Product::find(42);
$updated = Product::where('id', 42)
    ->where('version', $product->version)
    ->update(['stock' => $product->stock - 1, 'version' => $product->version + 1]);

if (!$updated) {
    throw new OptimisticLockException('Concurrent update detected, please retry');
}
</code></pre>
</div>

<div class="callout callout-info">
  <div class="callout-title">MVCC в PostgreSQL</div>
  <p>PostgreSQL использует Multi-Version Concurrency Control: каждая запись создаёт новую версию строки. Читатели видят согласованный снапшот и никогда не блокируют писателей. Писатели никогда не блокируют читателей. Только конфликты запись-запись вызывают блокировки. Именно поэтому уровня изоляции PostgreSQL по умолчанию (READ COMMITTED) обычно достаточно для большинства приложений.</p>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Как предотвратить взаимоблокировки (deadlocks)?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <ul>
      <li><strong>Согласованный порядок блокировок:</strong> всегда блокируйте ресурсы в одном порядке (например, по возрастанию первичного ключа)</li>
      <li><strong>Короткие транзакции:</strong> получите блокировки, выполните работу, освободите — минимизируйте время удержания блокировок</li>
      <li><strong>Таймауты блокировок:</strong> SET lock_timeout = '5s' для быстрого сбоя вместо бесконечного ожидания</li>
      <li><strong>Оптимистическая блокировка:</strong> полностью избегает блокировок — обрабатывает конфликты при фиксации</li>
    </ul>
  </div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>Изоляция по умолчанию в PostgreSQL — READ COMMITTED; в MySQL InnoDB по умолчанию — REPEATABLE READ</li>
    <li>Пессимистическая: блокировка строки через FOR UPDATE — блокирует других писателей; используйте для ресурсов с высокой конкурентностью</li>
    <li>Оптимистическая: столбец версии + условное обновление — без блокировок; лучшая пропускная способность при низкой конкурентности</li>
    <li>Предотвращение deadlocks: всегда получайте блокировки в одном и том же порядке во всех транзакциях</li>
    <li>MVCC: читатели никогда не блокируют писателей, и писатели никогда не блокируют читателей (PostgreSQL, InnoDB)</li>
  </ul>
</div>
`,
  },

  'sql-injection': {
    body: `
<h2>Уязвимость</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Vulnerable code</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// NEVER do this — user input directly in query string
$username = $_POST['username']; // attacker input: admin'--
$query = "SELECT * FROM users WHERE username = '$username'";
// Resulting query: SELECT * FROM users WHERE username = 'admin'--'
// The -- comments out the rest — bypasses password check

// Attacker could also use: ' OR '1'='1
// Making query: SELECT * FROM users WHERE username = '' OR '1'='1'
// Returns ALL users
</code></pre>
</div>

<h2>Исправление: параметризованные запросы (PDO)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Safe PDO</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// PDO prepared statement — parameter is NEVER part of SQL string
$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? AND password_hash = ?');
$stmt->execute([$username, hash('sha256', $password)]);
$user = $stmt->fetch();

// Named parameters
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute([':email' => $email]);

// PDO with ATTR_EMULATE_PREPARES = false is critical on MySQL
// (true mode just does string escaping, not real parameterization)
$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_EMULATE_PREPARES   => false, // MUST be false for real parameterization
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
</code></pre>
</div>

<h2>Laravel / Eloquent</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Safe and unsafe Eloquent</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// SAFE: Eloquent automatically parameterizes values
User::where('email', $email)->first();
DB::table('users')->where('status', $status)->get();

// SAFE: explicit binding
DB::select('SELECT * FROM users WHERE email = ?', [$email]);
DB::select('SELECT * FROM users WHERE email = :email', ['email' => $email]);

// DANGEROUS: raw expressions with user input
User::whereRaw("name = '{$name}'")->get();     // VULNERABLE
DB::statement("DROP TABLE {$tableName}");      // VULNERABLE

// SAFE: whereRaw with bindings
User::whereRaw('name = ?', [$name])->get();    // OK
User::whereRaw('created_at > :date', ['date' => $date])->get(); // OK

// Identifiers (column names, table names) CANNOT be parameterized
// Always whitelist them:
$allowedColumns = ['name', 'email', 'created_at'];
$column = in_array($request->sort, $allowedColumns) ? $request->sort : 'name';
User::orderBy($column)->get();
</code></pre>
</div>

<h2>SQL-инъекция второго порядка</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Scenario</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Step 1: Register with username: admin'--
# Input is safely stored in DB: INSERT uses parameterized query

# Step 2: Change password — application retrieves username from DB, uses it unsafely:
$username = $user->username; // retrieved from DB: "admin'--"
$sql = "UPDATE users SET password = '$newHash' WHERE username = '$username'";
# Resulting: UPDATE users SET password = '...' WHERE username = 'admin'--'
# Actually updates admin's password, not the attacker's!
</code></pre>
</div>

<h2>Минимальные привилегии</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — DB user permissions</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Application DB user: only needs SELECT, INSERT, UPDATE, DELETE
CREATE USER app_user WITH PASSWORD 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- Never GRANT DROP, CREATE, TRUNCATE, or superuser privileges

-- Separate read-only replica user
CREATE USER readonly_user WITH PASSWORD 'password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>Никогда не конкатенируйте пользовательский ввод в SQL — всегда используйте параметризованные запросы / prepared statements</li>
    <li>PDO: установите ATTR_EMULATE_PREPARES=false для реальной параметризации в MySQL</li>
    <li>Eloquent безопасен для значений — но whereRaw() с интерполяцией строк уязвим</li>
    <li>Имена столбцов/таблиц нельзя параметризовать — используйте явный белый список</li>
    <li>SQLi второго порядка: данные хранятся безопасно, но позже используются небезопасно — относитесь к значениям из БД тоже как к недоверенным</li>
    <li>Минимальные привилегии: у пользователя БД приложения не должно быть прав DROP, CREATE или суперпользователя</li>
  </ul>
</div>
`,
  },

  'db-design': {
    body: `
<h2>Нормальные формы</h2>
<table class="ctable">
  <thead><tr><th>Форма</th><th>Правило</th><th>Пример нарушения</th></tr></thead>
  <tbody>
    <tr><td>1NF</td><td>Атомарные значения, нет повторяющихся групп</td><td>Столбец tags со значением "php,mysql,redis"</td></tr>
    <tr><td>2NF</td><td>Нет частичной зависимости от составного ключа</td><td>order_items(order_id, product_id, product_name) — product_name зависит только от product_id</td></tr>
    <tr><td>3NF</td><td>Нет транзитивной зависимости</td><td>users(id, zip_code, city) — city зависит от zip_code, а не от id</td></tr>
    <tr><td>BCNF</td><td>Каждый детерминант является потенциальным ключом</td><td>Редко на практике — обычно достаточно 3NF</td></tr>
  </tbody>
</table>

<h2>Связи</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — M:N with junction table</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">CREATE TABLE users (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE roles (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Junction table for M:N relationship
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT    NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)  -- composite PK prevents duplicates
);

-- Index for reverse lookup (find all users with a role)
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
</code></pre>
</div>

<h2>UUID vs Auto-increment</h2>
<table class="ctable">
  <thead><tr><th>Аспект</th><th>Auto-increment (BIGSERIAL)</th><th>UUID v4</th><th>UUID v7 (упорядоченный)</th></tr></thead>
  <tbody>
    <tr><td>Производительность индекса</td><td class="o1">Последовательный — отличная</td><td class="on">Случайный — фрагментация индекса</td><td class="olog">Последовательный — хорошая</td></tr>
    <tr><td>Глобальная уникальность</td><td>Нет (только в рамках БД)</td><td>Да</td><td>Да</td></tr>
    <tr><td>Безопасность (перечислимость)</td><td>Предсказуемый</td><td>Непредсказуемый</td><td>Непредсказуемый</td></tr>
    <tr><td>Размер хранения</td><td>8 байт</td><td>16 байт</td><td>16 байт</td></tr>
  </tbody>
</table>

<h2>Паттерн мягкого удаления (Soft Delete)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;

-- "Delete" a user
UPDATE users SET deleted_at = NOW() WHERE id = 42;

-- Every query MUST filter deleted rows — easy to forget
SELECT * FROM users WHERE deleted_at IS NULL;

-- Partial index makes this efficient
CREATE INDEX idx_users_active ON users(email) WHERE deleted_at IS NULL;
</code></pre>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel SoftDeletes</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Model {
    use SoftDeletes; // adds deleted_at, filters automatically in all queries

    // $user->delete()        → sets deleted_at
    // User::withTrashed()    → includes soft-deleted
    // User::onlyTrashed()    → only soft-deleted
    // $user->restore()       → clears deleted_at
    // $user->forceDelete()   → permanent delete
}
</code></pre>
</div>

<h2>Паттерны денормализации</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — Cached computed column</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Instead of COUNT(comments) on every page load, cache it
ALTER TABLE posts ADD COLUMN comment_count INT DEFAULT 0;

-- Update via trigger or application logic when comment is added/deleted
CREATE OR REPLACE FUNCTION update_comment_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>3NF — цель для OLTP-схем; денормализуйте только при измеренных проблемах производительности</li>
    <li>Таблицы связи M:N нуждаются в составном PK и индексах на обоих столбцах внешних ключей</li>
    <li>Используйте UUID v7 (с временным порядком) для распределённых систем — избегает фрагментации индекса случайного UUID v4</li>
    <li>Мягкое удаление: каждый запрос требует WHERE deleted_at IS NULL — используйте частичные индексы и трейты ORM</li>
    <li>Техники денормализации: кэшированные столбцы счётчиков, сводные таблицы, материализованные представления, JSON-блобы</li>
  </ul>
</div>
`,
  },

  'db-scaling': {
    body: `
<h2>Лестница масштабирования</h2>
<ol>
  <li><strong>Оптимизация запросов + индексы</strong> — обычно достаточно до миллионов строк</li>
  <li><strong>Реплики для чтения</strong> — разгрузка чтений; запись в primary, чтение из реплик</li>
  <li><strong>Пул соединений</strong> (PgBouncer) — обработка тысяч соединений приложения через небольшое число соединений к БД</li>
  <li><strong>Партиционирование таблиц</strong> — разбивка большой таблицы на части по диапазону/хэшу/списку</li>
  <li><strong>Горизонтальное шардирование</strong> — распределение данных по нескольким серверам баз данных</li>
</ol>

<h2>Реплики чтения в Laravel</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — config/database.php</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">'mysql' => [
    'read'  => ['host' => ['read-replica-1.db', 'read-replica-2.db']],
    'write' => ['host' => ['primary.db']],
    'sticky' => true, // after a write, read from primary for that request
    'driver'   => 'mysql',
    'database' => env('DB_DATABASE'),
    'username' => env('DB_USERNAME'),
    'password' => env('DB_PASSWORD'),
],

// DB::select() → read replica
// DB::insert/update/delete() → primary
// DB::statement() → primary
</code></pre>
</div>

<h2>Пул соединений (PgBouncer)</h2>
<div class="callout callout-warn">
  <div class="callout-title">Почему PostgreSQL нужен пулер</div>
  <p>PostgreSQL создаёт процесс на каждое соединение. 1000 соединений = 1000 процессов = ~8 ГБ RAM только на накладные расходы соединений. PgBouncer располагается между приложением и БД: принимает тысячи соединений приложения, поддерживает небольшой пул (например, 20–100) к PostgreSQL. Каждое соединение занимает ~5 МБ RAM на стороне БД.</p>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash — PgBouncer config (pgbouncer.ini)</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">[databases]
myapp = host=db-primary port=5432 dbname=myapp

[pgbouncer]
pool_mode = transaction    # transaction pooling — most efficient
max_client_conn = 5000     # clients connecting to pgbouncer
default_pool_size = 50     # actual connections to PostgreSQL
min_pool_size = 10
server_idle_timeout = 60
</code></pre>
</div>

<h2>Партиционирование таблиц</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — Range partitioning (PostgreSQL)</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Parent table
CREATE TABLE events (
    id          BIGSERIAL,
    event_date  DATE NOT NULL,
    payload     JSONB
) PARTITION BY RANGE (event_date);

-- Partitions (can be automated)
CREATE TABLE events_2024_q1 PARTITION OF events
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');

CREATE TABLE events_2024_q2 PARTITION OF events
    FOR VALUES FROM ('2024-04-01') TO ('2024-07-01');

-- Query planner uses partition pruning automatically
SELECT * FROM events WHERE event_date BETWEEN '2024-02-01' AND '2024-02-28';
-- Only scans events_2024_q1 — other partitions skipped
</code></pre>
</div>

<h2>Стратегия шардирования</h2>
<table class="ctable">
  <thead><tr><th>Подход</th><th>Ключ шарда</th><th>Преимущества</th><th>Недостатки</th></tr></thead>
  <tbody>
    <tr><td>По диапазону user_id</td><td>user_id 1–1M → shard1</td><td>Простая маршрутизация</td><td>Горячие шарды при неравномерном распределении пользователей</td></tr>
    <tr><td>Хэш-шардирование</td><td>user_id % N</td><td>Равномерное распределение</td><td>Решардинг болезнен</td></tr>
    <tr><td>На основе каталога</td><td>Таблица поиска</td><td>Гибкость</td><td>Таблица поиска — узкое место</td></tr>
    <tr><td>По тенанту</td><td>tenant_id</td><td>Изоляция, лёгкое масштабирование</td><td>Межтенантные запросы невозможны</td></tr>
  </tbody>
</table>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>Исчерпайте возможности индексирования и оптимизации запросов до рассмотрения реплик или шардирования</li>
    <li>Реплики чтения: асинхронная задержка репликации означает устаревшие данные — используйте sticky sessions или логику read-your-writes</li>
    <li>PgBouncer в режиме транзакций: наиболее эффективный пулинг, но ломает LISTEN/NOTIFY и advisory locks</li>
    <li>Партиционирование: запросы должны включать ключ партиции для работы pruning; у каждой партиции свои индексы</li>
    <li>Шардирование: cross-shard JOIN либо невозможны, либо требуют scatter-gather — проектируйте ключ шарда, чтобы их избежать</li>
  </ul>
</div>
`,
  },

  'rest-api': {
    body: `
<h2>Проектирование URL, ориентированных на ресурсы</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">REST URL conventions</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Good: nouns, hierarchical, plural
GET    /api/v1/users              # list users
POST   /api/v1/users              # create user
GET    /api/v1/users/42           # get user 42
PUT    /api/v1/users/42           # replace user 42
PATCH  /api/v1/users/42           # partial update user 42
DELETE /api/v1/users/42           # delete user 42

GET    /api/v1/users/42/orders    # user's orders (nested resource)
POST   /api/v1/orders/5/cancel    # action as sub-resource (not a verb URL)

# Bad: verbs in URLs
POST /api/getUser                 # bad
POST /api/createUser              # bad
GET  /api/deleteUser?id=42        # bad — GET must be safe/idempotent
</code></pre>
</div>

<h2>HTTP статус-коды</h2>
<table class="ctable">
  <thead><tr><th>Код</th><th>Значение</th><th>Когда использовать</th></tr></thead>
  <tbody>
    <tr><td>200 OK</td><td>Успех с телом</td><td>Ответы GET, PATCH, PUT</td></tr>
    <tr><td>201 Created</td><td>Ресурс создан</td><td>POST, создающий ресурс; добавьте заголовок Location</td></tr>
    <tr><td>204 No Content</td><td>Успех, нет тела</td><td>DELETE, PATCH без тела ответа</td></tr>
    <tr><td>400 Bad Request</td><td>Ошибка клиента</td><td>Ошибки валидации — верните детали</td></tr>
    <tr><td>401 Unauthorized</td><td>Не аутентифицирован</td><td>Отсутствующий/недействительный токен</td></tr>
    <tr><td>403 Forbidden</td><td>Аутентифицирован, но нет доступа</td><td>У пользователя нет прав на этот ресурс</td></tr>
    <tr><td>404 Not Found</td><td>Ресурс не найден</td><td>ID не существует</td></tr>
    <tr><td>409 Conflict</td><td>Конфликт состояния</td><td>Дублирующийся email, сбой оптимистической блокировки</td></tr>
    <tr><td>422 Unprocessable</td><td>Семантическая ошибка</td><td>Синтаксис корректен, но нарушены бизнес-правила</td></tr>
    <tr><td>429 Too Many</td><td>Превышен лимит запросов</td><td>Добавьте заголовок Retry-After</td></tr>
    <tr><td>500 Server Error</td><td>Неожиданная ошибка</td><td>Необработанные исключения — логируйте, не раскрывайте детали</td></tr>
  </tbody>
</table>

<h2>Паттерн API Resource в Laravel</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// API Resource — controls shape of JSON response
class UserResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'created_at' => $this->created_at->toIso8601String(),
            'orders'     => OrderResource::collection($this->whenLoaded('orders')),
            // whenLoaded: include relationship only if eager-loaded (avoids N+1)
        ];
    }
}

// Controller
class UserController extends Controller {
    public function index(Request $request): AnonymousResourceCollection {
        $users = User::query()
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->sort, fn($q, $s) => $q->orderBy($s))
            ->paginate(20);

        return UserResource::collection($users);
        // Auto-wraps in { data: [...], links: {...}, meta: {...} }
    }

    public function store(StoreUserRequest $request): UserResource {
        $user = User::create($request->validated());
        return (new UserResource($user))->response()->setStatusCode(201);
    }
}
</code></pre>
</div>

<h2>Единый формат ответа об ошибке</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Structured error responses</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// app/Exceptions/Handler.php — standardize all error responses
public function render($request, Throwable $e): Response {
    if ($request->expectsJson()) {
        if ($e instanceof ValidationException) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        }

        if ($e instanceof ModelNotFoundException) {
            return response()->json(['message' => 'Resource not found'], 404);
        }
    }
    return parent::render($request, $e);
}

// All errors follow: { "message": "...", "errors": { "field": ["..."] } }
</code></pre>
</div>

<h2>Пагинация</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">JSON — Pagination response</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-json">{
  "data": [...],
  "meta": {
    "current_page": 2,
    "per_page": 20,
    "total": 158,
    "last_page": 8
  },
  "links": {
    "first": "/api/v1/users?page=1",
    "prev":  "/api/v1/users?page=1",
    "next":  "/api/v1/users?page=3",
    "last":  "/api/v1/users?page=8"
  }
}
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Курсорная vs офсетная пагинация</div>
  <p><strong>Офсетная</strong> (<code>?page=2</code>): простая, но медленная на больших таблицах (OFFSET 10000 сканирует 10000 строк). Также смещается при вставке/удалении записей. <strong>Курсорная</strong> (<code>?cursor=eyJpZCI6MTAwfQ</code>): использует WHERE id &gt; last_seen_id — O(log n) с индексом, стабильная. Используйте курсорную для лент и высоконагруженных API.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>URL — существительные (ресурсы), HTTP-методы — глаголы — никогда PUT /cancelOrder</li>
    <li>201 + заголовок Location при создании; 204 при удалении; 200 + тело при обновлении</li>
    <li>Возвращайте ошибки валидации как структурированный JSON с сообщениями на уровне полей (422)</li>
    <li>Версионируйте с первого дня: /api/v1/ — изменить болезненно; удалить болезненно; версионирование бесплатно</li>
    <li>Курсорная пагинация для списков > 1000 строк — офсетная деградирует линейно с номером страницы</li>
  </ul>
</div>
`,
  },

  'auth-jwt': {
    body: `
<h2>Структура JWT</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">JWT anatomy</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9    # Header (base64url)
.eyJzdWIiOiIxMjMiLCJlbWFpbCI6ImFsaWNlQHRlc3QuY29tIiwiZXhwIjoxNzA5MDAwMDAwfQ==  # Payload
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  # Signature

# Decoded header:  { "alg": "HS256", "typ": "JWT" }
# Decoded payload: { "sub": "123", "email": "alice@test.com", "exp": 1709000000 }
# Signature: HMAC-SHA256(base64url(header) + "." + base64url(payload), secret)
</code></pre>
</div>

<h2>Выдача и верификация JWT в PHP</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — using firebase/php-jwt</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService {
    private string $secret;
    private int    $accessTtl  = 3600;     // 1 hour
    private int    $refreshTtl = 2592000;  // 30 days

    public function __construct() {
        $this->secret = config('app.jwt_secret');
    }

    public function issueAccessToken(User $user): string {
        return JWT::encode([
            'sub'   => $user->id,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name'),
            'iat'   => time(),
            'exp'   => time() + $this->accessTtl,
        ], $this->secret, 'HS256');
    }

    public function verify(string $token): object {
        // Throws ExpiredException, SignatureInvalidException, etc.
        return JWT::decode($token, new Key($this->secret, 'HS256'));
    }
}

// Auth Middleware
class JwtMiddleware {
    public function handle(Request $request, Closure $next): Response {
        $token = $request->bearerToken(); // reads Authorization: Bearer <token>
        if (!$token) return response()->json(['message' => 'Unauthenticated'], 401);

        try {
            $claims = app(JwtService::class)->verify($token);
            $request->merge(['auth_user_id' => $claims->sub]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        return $next($request);
    }
}
</code></pre>
</div>

<h2>HS256 vs RS256</h2>
<table class="ctable">
  <thead><tr><th>Алгоритм</th><th>Тип ключа</th><th>Верификация</th><th>Используйте когда</th></tr></thead>
  <tbody>
    <tr><td>HS256</td><td>Общий секрет</td><td>Нужен тот же секрет</td><td>Один сервис — секрет остаётся на одном сервере</td></tr>
    <tr><td>RS256</td><td>RSA приватный+публичный</td><td>Только публичный ключ</td><td>Несколько сервисов — каждый верифицирует публичным ключом, не зная приватного</td></tr>
    <tr><td>ES256</td><td>ECDSA пара ключей</td><td>Только публичный ключ</td><td>То же что RS256, но меньшие токены и быстрее</td></tr>
  </tbody>
</table>

<h2>Ротация Refresh Token</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class AuthController extends Controller {
    public function login(LoginRequest $request): JsonResponse {
        $user = User::where('email', $request->email)->firstOrFail();
        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return response()->json($this->issueTokenPair($user));
    }

    public function refresh(Request $request): JsonResponse {
        $token   = $request->input('refresh_token');
        $stored  = RefreshToken::where('token', hash('sha256', $token))
            ->where('expires_at', '>', now())
            ->where('revoked', false)
            ->firstOrFail();

        // Rotation: revoke old, issue new pair
        $stored->update(['revoked' => true]);
        $user = User::find($stored->user_id);

        return response()->json($this->issueTokenPair($user));
    }

    private function issueTokenPair(User $user): array {
        $refreshToken = bin2hex(random_bytes(32));
        RefreshToken::create([
            'user_id'    => $user->id,
            'token'      => hash('sha256', $refreshToken),
            'expires_at' => now()->addDays(30),
        ]);

        return [
            'access_token'  => app(JwtService::class)->issueAccessToken($user),
            'refresh_token' => $refreshToken,
            'expires_in'    => 3600,
        ];
    }
}
</code></pre>
</div>

<h2>Безопасность хранения токенов</h2>
<div class="callout callout-warn">
  <div class="callout-title">localStorage уязвим для XSS</div>
  <p>Хранение JWT в <code>localStorage</code> означает, что любая XSS-атака может их похитить. Используйте <strong>httpOnly secure cookies</strong> для веб-приложений — JavaScript не может читать httpOnly cookies, что блокирует кражу токенов через XSS. Для SPA используйте Laravel Sanctum с аутентификацией на основе cookie-сессий вместо JWT. Резервируйте JWT для мобильных приложений и сервер-к-серверных API.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>JWT: header.payload.signature — всё закодировано в base64url; payload читаем, но подпись проверяется</li>
    <li>Всегда валидируйте: exp (срок действия), iat (время выдачи) и aud (аудитория)</li>
    <li>HS256: один общий секрет; RS256: приватный ключ подписывает, публичный верифицирует — используйте RS256 для нескольких сервисов</li>
    <li>Короткоживущие access tokens (1 час) + долгоживущие refresh tokens (30 дней) с ротацией при использовании</li>
    <li>Никогда не храните JWT в localStorage — используйте httpOnly cookies или Laravel Sanctum для SPA</li>
  </ul>
</div>
`,
  },

  'redis': {
    body: `
<h2>Основные типы данных</h2>
<table class="ctable">
  <thead><tr><th>Тип</th><th>Команды</th><th>Сценарий использования</th></tr></thead>
  <tbody>
    <tr><td>String</td><td>GET/SET/INCR/EXPIRE</td><td>Кэш, счётчики, сессии, rate limits</td></tr>
    <tr><td>Hash</td><td>HGET/HSET/HMGET/HDEL</td><td>Профили пользователей, объекты, конфиг</td></tr>
    <tr><td>List</td><td>LPUSH/RPUSH/LPOP/LRANGE</td><td>Очереди, ленты активности, последние элементы</td></tr>
    <tr><td>Set</td><td>SADD/SMEMBERS/SINTER/SUNION</td><td>Теги, уникальные посетители, списки друзей</td></tr>
    <tr><td>Sorted Set</td><td>ZADD/ZRANGE/ZRANK/ZRANGEBYSCORE</td><td>Лидерборды, приоритетные очереди, временные ряды</td></tr>
  </tbody>
</table>

<h2>Строки — кэш и счётчики</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel Cache with Redis</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Cache-aside pattern
function getUser(int $id): ?array {
    $key = "user:{$id}";

    $cached = Redis::get($key);
    if ($cached) return json_decode($cached, true);

    $user = DB::table('users')->find($id);
    if ($user) Redis::setex($key, 3600, json_encode($user)); // TTL 1 hour
    return $user;
}

// Atomic counter (INCR is atomic — no race conditions)
Redis::incr("page_views:{$slug}");
Redis::incrby("user_score:{$userId}", 10);

// Rate limiting
$key = "rate_limit:{$ip}";
$hits = Redis::incr($key);
if ($hits === 1) Redis::expire($key, 60); // set TTL on first hit
if ($hits > 100) abort(429);
</code></pre>
</div>

<h2>Хэши — объекты</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Store user profile as hash — update individual fields without re-encoding
Redis::hset("user:123", 'name', 'Alice', 'email', 'alice@test.com', 'score', '42');
Redis::hset("user:123", 'score', '43'); // update one field

$profile = Redis::hgetall("user:123"); // ['name' => 'Alice', 'email' => ..., 'score' => '43']
$score   = Redis::hget("user:123", 'score');

// Hash vs String JSON:
// Hash: update single field = 1 write; String JSON: decode, modify, re-encode, write
</code></pre>
</div>

<h2>Sorted Sets — лидерборд</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">$board = 'leaderboard:weekly';

// Add/update score
Redis::zadd($board, 1500, 'alice');
Redis::zadd($board, 2300, 'bob');
Redis::zadd($board, 1800, 'carol');

// Top 10 with scores (highest first)
$top = Redis::zrevrange($board, 0, 9, 'WITHSCORES');
// ['bob' => 2300, 'carol' => 1800, 'alice' => 1500]

// Alice's rank (0-indexed from bottom, so invert for display)
$rank = Redis::zrevrank($board, 'alice'); // 2 (0-indexed) → display as #3

// Users with score between 1000 and 2000
$mid = Redis::zrangebyscore($board, 1000, 2000, ['withscores' => true]);
</code></pre>
</div>

<h2>Lists — очередь</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Producer: push jobs to right
Redis::rpush('jobs:email', json_encode(['to' => 'alice@test.com', 'template' => 'welcome']));

// Consumer: pop from left (FIFO queue)
$job = Redis::lpop('jobs:email');

// Blocking pop — waits up to 30s for a job (efficient worker loop)
$job = Redis::blpop('jobs:email', 30);

// Recent items (keep last 100)
Redis::lpush("recent:{$userId}", $itemId);
Redis::ltrim("recent:{$userId}", 0, 99); // keep only first 100
</code></pre>
</div>

<h2>Pub/Sub</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel Broadcasting</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Publisher
Redis::publish('notifications', json_encode([
    'user_id' => 42,
    'message' => 'Your order has shipped',
]));

// Subscriber (long-running process)
Redis::subscribe(['notifications'], function($message, $channel) {
    $data = json_decode($message, true);
    // Push to WebSocket, process notification...
});
</code></pre>
</div>

<h2>Персистентность: RDB vs AOF</h2>
<table class="ctable">
  <thead><tr><th>Режим</th><th>Как работает</th><th>Восстановление</th><th>Производительность</th></tr></thead>
  <tbody>
    <tr><td>RDB (снапшот)</td><td>Периодический fork + дамп в .rdb файл</td><td>Потеря до нескольких минут</td><td>Быстрая (нет накладных расходов на запись)</td></tr>
    <tr><td>AOF (append-only)</td><td>Логирование каждой команды записи</td><td>Потеря до 1 сек (fsync=everysec)</td><td>Небольшие накладные расходы на запись</td></tr>
    <tr><td>RDB + AOF</td><td>Оба включены</td><td>Почти нулевые потери</td><td>Надёжнее всего для продакшна</td></tr>
  </tbody>
</table>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты</div>
  <ul>
    <li>Всегда устанавливайте TTL на кэшируемые ключи — неограниченный рост кэша в конечном счёте вызовет OOM</li>
    <li>INCR атомарен — используйте для счётчиков и rate limits без накладных расходов WATCH/MULTI</li>
    <li>Sorted sets для лидербордов: O(log n) вставка, O(log n + k) запрос диапазона</li>
    <li>BLPOP для очередей воркеров: блокируется эффективно вместо опроса через sleep()</li>
    <li>Используйте AOF + RDB в продакшне; Redis только для кэша может работать без персистентности (maxmemory + allkeys-lru)</li>
  </ul>
</div>
`,
  },
}

export default ruBodiesP4
