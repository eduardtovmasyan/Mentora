export default {
  phase: 'Phase 5 · System Design',
  title: 'Microservices Architecture',
  intro: 'Microservices decompose a monolith into independently deployable services, each owning its data and communicating via APIs or events. This enables independent scaling, technology choices, and team autonomy — but adds distributed systems complexity: network failures, eventual consistency, and operational overhead. Senior engineers know when microservices are justified.',
  tags: ['Service decomposition', 'API Gateway', 'Service mesh', 'Distributed tracing', 'Bounded context', 'Saga'],
  seniorExpectations: [
    'Identify bounded contexts and design service boundaries using Domain-Driven Design',
    'Design synchronous (REST/gRPC) vs asynchronous (event-driven) inter-service communication',
    'Implement API Gateway pattern: single entry point, auth, rate limiting, routing',
    'Handle distributed transactions with the Saga pattern (choreography vs orchestration)',
    'Know the operational requirements: distributed tracing, centralized logging, health checks',
  ],
  body: `
<h2>Monolith vs Microservices</h2>
<table class="ctable">
  <thead><tr><th>Aspect</th><th>Monolith</th><th>Microservices</th></tr></thead>
  <tbody>
    <tr><td>Deployment</td><td>One unit</td><td>Each service independently</td></tr>
    <tr><td>Scaling</td><td>Scale whole app</td><td>Scale individual services</td></tr>
    <tr><td>Data</td><td>Shared database</td><td>Each service owns its DB</td></tr>
    <tr><td>Communication</td><td>In-process function call</td><td>Network (REST, gRPC, events)</td></tr>
    <tr><td>Complexity</td><td>Low operational complexity</td><td>High: networking, tracing, coordination</td></tr>
    <tr><td>Team size</td><td>Small teams</td><td>Multiple autonomous teams (2-pizza rule)</td></tr>
  </tbody>
</table>

<div class="callout callout-warn">
  <div class="callout-title">Start with a Monolith</div>
  <p>Microservices are NOT a default architecture choice. Start with a well-structured modular monolith. Extract services only when you have a clear scaling or team autonomy need that the monolith cannot satisfy. Premature microservices create distributed monoliths — worst of both worlds.</p>
</div>

<h2>Service Communication Patterns</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Architecture choices</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Synchronous (REST/gRPC) — request/response
OrderService → POST /payments/charge → PaymentService
+ Simple mental model, immediate response
- Tight coupling: if PaymentService is down, OrderService fails

# Asynchronous (events) — fire and forget
OrderService → publish OrderPlaced → SNS/Kafka
  └── PaymentService  subscribes → processes async
  └── InventoryService subscribes → reserves stock
  └── EmailService subscribes → sends confirmation
+ Loose coupling, resilient to downstream failures
- Eventual consistency, harder to debug, no immediate response

# When to use each:
# Sync: user needs the result NOW (login, payment confirmation UI)
# Async: background processing, fan-out, resilience more important than immediacy
</code></pre>
</div>

<h2>API Gateway</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Architecture — API Gateway responsibilities</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">Client
  ↓
API Gateway (Kong, AWS API Gateway, Traefik)
  ├── Authentication (JWT verification)
  ├── Rate limiting (per user/IP)
  ├── Request routing:
  │     /api/users/*    → User Service
  │     /api/orders/*   → Order Service
  │     /api/products/* → Catalog Service
  ├── Request/Response transformation
  ├── SSL termination
  └── Observability (logging, tracing headers)
  ↓
Internal services (no public exposure)
</code></pre>
</div>

<h2>Distributed Transaction — Saga Pattern</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Choreography-based Saga</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">Happy path:
1. OrderService: creates order (PENDING) → publishes OrderCreated
2. InventoryService: reserves stock → publishes StockReserved
3. PaymentService: charges card → publishes PaymentSucceeded
4. OrderService: updates order to CONFIRMED → publishes OrderConfirmed
5. ShippingService: creates shipment → publishes ShipmentCreated

Failure (payment declined at step 3):
3a. PaymentService: charge fails → publishes PaymentFailed
2a. InventoryService: listens → releases reserved stock (compensating tx)
1a. OrderService: listens → cancels order (compensating tx)
</code></pre>
</div>

<h2>Service Health & Observability</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Health check endpoint</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// GET /health — checked by load balancer + Kubernetes
class HealthController extends Controller {
    public function check(): JsonResponse {
        $checks = [
            'database' => $this->checkDatabase(),
            'redis'    => $this->checkRedis(),
            'storage'  => $this->checkStorage(),
        ];

        $healthy = !in_array(false, $checks);
        return response()->json([
            'status' => $healthy ? 'healthy' : 'degraded',
            'checks' => $checks,
            'version' => config('app.version'),
        ], $healthy ? 200 : 503);
    }

    private function checkDatabase(): bool {
        try { DB::select('SELECT 1'); return true; }
        catch (\Exception) { return false; }
    }
}
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Microservices are a team scaling pattern, not a technical one — justify by org structure or scaling needs</li>
    <li>Each service must own its data — no shared databases between services</li>
    <li>Sync for user-facing real-time needs; async events for background processing and decoupling</li>
    <li>Saga pattern handles distributed transactions: each step is local, failures trigger compensating transactions</li>
    <li>Operational requirements: distributed tracing (X-Ray, Jaeger), centralized logs (CloudWatch, ELK), service mesh (Istio)</li>
  </ul>
</div>
`,
};
