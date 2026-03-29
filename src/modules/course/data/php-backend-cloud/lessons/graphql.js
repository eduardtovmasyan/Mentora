export default {
  phase: 'Phase 4 · Databases & APIs',
  title: 'GraphQL — Schema, Resolvers & the N+1 Problem',
  intro: 'GraphQL is a query language for APIs that lets clients request exactly the data they need — no more, no less. Unlike REST where the server defines fixed resource shapes, GraphQL gives clients the power to compose queries spanning multiple entities in a single round-trip. This flexibility comes with real engineering challenges: the N+1 query problem can silently destroy database performance, schema design requires deliberate thinking about ownership and authorization, and subscriptions introduce stateful long-lived connections that REST never had to manage. This lesson covers the full picture from schema design through resolvers, DataLoader batching, pagination, and Lighthouse integration in Laravel.',
  tags: ['graphql', 'laravel', 'lighthouse', 'api', 'n+1', 'dataloader', 'resolvers', 'pagination'],
  seniorExpectations: [
    'Explain the N+1 problem in GraphQL and implement DataLoader-style batching to solve it',
    'Design a GraphQL schema with proper types, mutations, and input objects',
    'Implement cursor-based pagination correctly for a GraphQL list field',
    'Describe tradeoffs between GraphQL and REST and articulate when to choose each',
    'Configure Lighthouse in a Laravel application with custom resolvers and directives',
    'Handle authorization at the resolver level using field-level guards',
  ],
  segments: [
    { type: 'h2', text: 'GraphQL vs REST — Honest Tradeoffs' },
    { type: 'p', html: 'REST is resource-oriented: each endpoint maps to a noun (<code>/products/42</code>). The server dictates the response shape. GraphQL is operation-oriented: the client describes the data graph it needs and the server fulfills it. REST wins on simplicity, cacheability (HTTP verbs + URLs map cleanly to CDN caches), and tooling maturity. GraphQL wins on over-fetching elimination (mobile clients only get what they need), under-fetching elimination (no request waterfalls), and strong typing via the Schema Definition Language. The wrong answer is "always use GraphQL." Choose REST for simple CRUD APIs, public integrations, and anything that must leverage HTTP caching aggressively. Choose GraphQL for complex, multi-entity dashboards, mobile apps with bandwidth constraints, and teams where the frontend evolves faster than the backend.' },

    { type: 'h2', text: 'Schema Definition Language' },
    { type: 'p', html: 'The SDL is GraphQL\'s type system. Every field has a type; types can be scalar (String, Int, Float, Boolean, ID) or object types you define. Exclamation marks denote non-null. The <code>Query</code>, <code>Mutation</code>, and <code>Subscription</code> types are the entry points to the graph. Input types are used exclusively for mutation arguments — you cannot reuse output types as inputs.' },
    { type: 'code', lang: 'graphql', label: 'GraphQL SDL', code: `type Product {
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
}` },

    { type: 'h2', text: 'Resolvers and the Execution Model' },
    { type: 'p', html: 'Every field in a GraphQL schema has a resolver function — a function that returns data for that field. If no explicit resolver is defined, the default resolver returns the property of the same name from the parent object. The execution engine calls resolvers depth-first, starting at the root Query/Mutation resolver. This means that if you query 100 products and each product has a <code>category</code> field, the category resolver will be called 100 times — one per product. That is the N+1 problem.' },
    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php
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
namespace App\\GraphQL\\Queries;

use App\\Models\\Product;

class ProductSearch
{
    public function __invoke(mixed $root, array $args): \\Illuminate\\Contracts\\Pagination\\LengthAwarePaginator
    {
        return Product::query()
            ->where('name', 'like', "%{$args['query']}%")
            ->with('category') // eager load to prevent N+1
            ->paginate($args['first'] ?? 20);
    }
}

// Mutation resolver
namespace App\\GraphQL\\Mutations;

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
}` },

    { type: 'h2', text: 'The N+1 Problem and DataLoader Batching' },
    { type: 'p', html: 'The N+1 problem is the most critical performance issue in GraphQL. When a list query returns N items and each item resolves a related entity, you get N+1 database queries: 1 for the list, then N for the related entities. The canonical solution is DataLoader — a batching and caching utility that collects all IDs requested during a single tick of the event loop, then fires a single <code>WHERE id IN (...)</code> query. In Lighthouse, relationship directives (<code>@belongsTo</code>, <code>@hasMany</code>) use built-in batch loaders automatically.' },
    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php
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
use Nuwave\\Lighthouse\\Execution\\DataLoader\\BatchLoader;

class ExternalPricingLoader extends BatchLoader
{
    public function resolve(): array
    {
        $ids = array_keys($this->keys);

        // Single API call for all product IDs
        $prices = ExternalPricingService::fetchBatch($ids);

        return collect($prices)->keyBy('product_id')->toArray();
    }
}` },

    { type: 'callout', style: 'tip', title: 'Tip', html: 'Always use Laravel Telescope or a query counter in development to detect N+1 issues before they reach production. In Lighthouse, enabling <code>LIGHTHOUSE_QUERY_LOG=true</code> in your <code>.env</code> will log all SQL queries per GraphQL request so you can spot unbatched resolvers immediately.' },

    { type: 'h2', text: 'Fragments and Variables' },
    { type: 'p', html: 'Fragments let clients define reusable field selections that can be spread into multiple queries. This is critical for frontend maintainability — a <code>ProductCard</code> fragment can be defined once and reused across the homepage query, the search query, and the cart query. Variables replace inline literal values, enabling query reuse and preventing injection by keeping user input out of the query string itself.' },
    { type: 'code', lang: 'graphql', label: 'GraphQL', code: `# Fragment definition
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
# { "first": 20, "after": "eyJpZCI6MTAwfQ==" }` },

    { type: 'h2', text: 'Cursor-Based Pagination' },
    { type: 'p', html: 'Offset-based pagination (<code>LIMIT 20 OFFSET 100</code>) breaks on high-traffic feeds because rows inserted between pages cause items to be skipped or duplicated. Cursor-based pagination uses an opaque token (typically a base64-encoded <code>id</code> or <code>created_at</code> timestamp) that marks the last seen position. The next query fetches items after that cursor with <code>WHERE id > :cursor LIMIT 20</code>. This is stable regardless of concurrent inserts. The Relay Connection Specification formalizes the envelope (<code>edges</code>, <code>node</code>, <code>cursor</code>, <code>pageInfo</code>) that Lighthouse implements by default.' },
    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php
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
// }` },

    { type: 'h2', text: 'Subscriptions' },
    { type: 'p', html: 'GraphQL Subscriptions push real-time updates from server to client over a persistent connection (typically WebSocket). They are defined in the schema like queries but use the <code>Subscription</code> root type. In Lighthouse, subscriptions broadcast through Laravel Echo and Pusher or a custom WebSocket driver. Each subscription resolver must implement a <code>subscribe</code> method that determines which clients receive a given broadcast.' },
    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php
// graphql/schema.graphql
// type Subscription {
//   orderStatusUpdated(orderId: ID!): Order! @subscription
// }

// Subscription class
namespace App\\GraphQL\\Subscriptions;

use Nuwave\\Lighthouse\\Schema\\Types\\GraphQLSubscription;
use Nuwave\\Lighthouse\\Subscriptions\\Subscriber;

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
use Nuwave\\Lighthouse\\Subscriptions\\Contracts\\BroadcastsSubscriptions;

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
}` },

    { type: 'callout', style: 'tip', title: 'Tip', html: 'GraphQL does not have native HTTP caching like REST because all requests are POST to a single endpoint. Use persisted queries (hashing the query and sending only the hash) combined with GET requests to enable CDN caching of common queries. Apollo Server and Lighthouse both support persisted queries.' },

    { type: 'qa', pairs: [
      {
        q: 'Q: How do you handle authorization in GraphQL — at the resolver level or schema level?',
        a: '<p>Both levels are needed. Schema-level authorization (Lighthouse\'s <code>@guard</code> directive) rejects unauthenticated requests before the resolver even runs. Field-level authorization (<code>@can</code> directive or manual checks inside resolvers) enforces fine-grained permissions per entity — e.g., a user can only read their own orders, not other users\'. Never rely solely on schema-level auth, because a malicious user who is authenticated can still attempt to read data they should not have access to. The rule: authenticate at the schema level, authorize at the resolver/field level.</p>',
      },
      {
        q: 'Q: When would you choose REST over GraphQL even for a complex application?',
        a: '<p>Choose REST when: (1) You need aggressive HTTP caching at the CDN level — GraphQL\'s single POST endpoint makes this hard without persisted queries. (2) Your API is public and consumed by third parties who are more familiar with REST conventions. (3) Your team is small and the overhead of schema maintenance, tooling (code generation, persisted queries), and debugging GraphQL execution plans outweighs the flexibility benefit. (4) Your data model is simple and flat — GraphQL\'s power comes from deeply nested, connected graphs; for simple CRUD it is over-engineering. (5) File uploads are a first-class concern — multipart file uploads in GraphQL are awkward compared to REST.</p>',
      },
      {
        q: 'Q: What is schema stitching and federation in GraphQL?',
        a: '<p>In a microservices architecture, each service may own its own GraphQL schema. Schema stitching (older approach) merges multiple schemas into one at the gateway layer. Apollo Federation (modern approach) lets each service declare which types it owns and which it extends, and a gateway composes them into a unified graph. Federation is preferred because each service remains independently deployable and the schema composition happens declaratively. Lighthouse does not natively support federation, but you can use a Node.js Apollo Gateway in front of multiple Lighthouse services.</p>',
      },
    ]},

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'GraphQL eliminates over-fetching and under-fetching by letting clients specify exactly what data they need.',
      'The N+1 problem is the most common GraphQL performance pitfall — every nested object resolver fires individually without batching. Use DataLoader or Lighthouse\'s built-in batch loaders.',
      'Lighthouse directives (<code>@find</code>, <code>@paginate</code>, <code>@belongsTo</code>, <code>@hasMany</code>, <code>@create</code>, <code>@update</code>) handle the most common resolver patterns with zero custom PHP code.',
      'Use cursor-based pagination (Relay Connection Spec) instead of offset pagination for stable, consistent results on high-traffic feeds.',
      'Authorize at two levels: authenticate at the schema/route level, authorize per field/entity inside resolvers.',
      'GraphQL subscriptions require stateful WebSocket connections — design your infrastructure (horizontal scaling, sticky sessions or shared state) accordingly.',
      'REST is not obsolete — it outperforms GraphQL for simple APIs, public integrations, and scenarios requiring aggressive HTTP caching.',
      'Use variables instead of inline literals in queries to prevent injection and enable query reuse.',
    ]},
  ],
};
