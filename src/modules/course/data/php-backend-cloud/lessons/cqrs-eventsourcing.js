export default {
  phase: 'Phase 5 · System Design',
  title: 'CQRS & Event Sourcing',
  intro: 'CQRS (Command Query Responsibility Segregation) separates write operations (Commands) from read operations (Queries) — different models, different data stores. Event Sourcing stores every state change as an immutable event log rather than current state. Together they enable audit trails, temporal queries, and scalable read/write separation.',
  tags: ['CQRS', 'Command', 'Query', 'Event sourcing', 'Event store', 'Projections', 'Aggregate'],
  seniorExpectations: [
    'Implement a Command/Query bus in PHP',
    'Design an Event Store (append-only event log)',
    'Build a Projection that rebuilds read model from events',
    'Explain eventual consistency in CQRS: command writes, projection catches up',
    'Know when NOT to use CQRS/ES: simple CRUD apps don\'t benefit',
  ],
  body: `
<h2>CQRS: Separate Read and Write Models</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Command/Query separation</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Commands — intent to change state, no return value
final class CreateOrderCommand {
    public function __construct(
        public readonly string $userId,
        public readonly array  $items,
        public readonly string $shippingAddress,
    ) {}
}

// Queries — read-only, returns data
final class GetUserOrdersQuery {
    public function __construct(
        public readonly string $userId,
        public readonly int    $page = 1,
    ) {}
}

// Command Handler — writes to normalized DB
class CreateOrderHandler {
    public function __construct(private OrderRepository $orders) {}

    public function handle(CreateOrderCommand $cmd): void {
        $order = Order::create(
            userId:          $cmd->userId,
            items:           $cmd->items,
            shippingAddress: $cmd->shippingAddress,
        );
        $this->orders->save($order);
        // Emit OrderCreatedEvent to update read model
    }
}

// Query Handler — reads from denormalized read model (could be a different DB)
class GetUserOrdersHandler {
    public function __construct(private OrderReadModel $readModel) {}

    public function handle(GetUserOrdersQuery $query): array {
        return $this->readModel->findByUserId($query->userId, $query->page);
    }
}
</code></pre>
</div>

<h2>Command Bus</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class CommandBus {
    private array $handlers = [];

    public function register(string $commandClass, callable $handler): void {
        $this->handlers[$commandClass] = $handler;
    }

    public function dispatch(object $command): void {
        $class = get_class($command);
        if (!isset($this->handlers[$class])) {
            throw new \RuntimeException("No handler for {$class}");
        }
        ($this->handlers[$class])($command);
    }
}
</code></pre>
</div>

<h2>Event Sourcing</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Append-only event store</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Event store table — NEVER update or delete rows
CREATE TABLE event_store (
    id          BIGSERIAL PRIMARY KEY,
    stream_id   UUID NOT NULL,        -- e.g., order ID
    event_type  VARCHAR(100) NOT NULL, -- 'OrderCreated', 'OrderShipped'
    payload     JSONB NOT NULL,
    version     INT NOT NULL,          -- optimistic concurrency per stream
    occurred_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (stream_id, version)
);
</code></pre>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Aggregate rebuilding state from events</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class Order {
    private OrderStatus $status;
    private array $items = [];
    private array $pendingEvents = [];

    // Rebuild from event history
    public static function rebuild(array $events): self {
        $order = new self();
        foreach ($events as $event) {
            $order->apply($event);
        }
        return $order;
    }

    private function apply(DomainEvent $event): void {
        match (get_class($event)) {
            OrderCreatedEvent::class  => $this->applyOrderCreated($event),
            OrderShippedEvent::class  => $this->applyOrderShipped($event),
            OrderCancelledEvent::class => $this->applyOrderCancelled($event),
        };
    }

    public function ship(string $trackingNumber): void {
        if ($this->status !== OrderStatus::Paid) {
            throw new DomainException('Cannot ship unpaid order');
        }
        $this->recordEvent(new OrderShippedEvent($trackingNumber));
    }

    private function applyOrderShipped(OrderShippedEvent $e): void {
        $this->status = OrderStatus::Shipped;
    }

    private function recordEvent(DomainEvent $e): void {
        $this->apply($e);
        $this->pendingEvents[] = $e; // save these to event store
    }
}
</code></pre>
</div>

<div class="callout callout-warn">
  <div class="callout-title">When NOT to use CQRS/ES</div>
  <p>CQRS and Event Sourcing add significant complexity — multiple models, projections, eventual consistency. Use them when: you need a full audit trail, temporal queries ("what was the state at time T?"), or very different read/write scaling requirements. Simple CRUD admin panels don\'t benefit and will suffer from the overhead.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>CQRS: Commands change state (void return), Queries read state (return data) — never mix</li>
    <li>Read model is a denormalized projection optimized for queries — eventually consistent with write model</li>
    <li>Event Sourcing: store events, not current state — current state = replay all events</li>
    <li>Event store is append-only — events are immutable facts about what happened</li>
    <li>Use CQRS/ES for complex domains with audit requirements; avoid for simple CRUD</li>
  </ul>
</div>
`,
};
