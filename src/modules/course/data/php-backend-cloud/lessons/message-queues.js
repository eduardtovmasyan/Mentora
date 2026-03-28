export default {
  phase: 'Phase 5 · System Design',
  title: 'Message Queues',
  intro: 'Message queues decouple producers from consumers: the producer sends a message and immediately continues; consumers process asynchronously. This enables async workflows, rate limiting consumption, fan-out, and event-driven architectures. Redis, RabbitMQ, AWS SQS, and Kafka serve different use cases.',
  tags: ['Producer/Consumer', 'FIFO', 'Fan-out', 'Dead letter queue', 'SQS', 'RabbitMQ', 'Kafka'],
  seniorExpectations: [
    'Explain the differences between queues (SQS, RabbitMQ) and streaming (Kafka)',
    'Implement at-least-once delivery and idempotent consumers',
    'Design a fan-out pattern with SNS + SQS (pub/sub)',
    'Configure dead letter queues for failed message handling',
    'Choose between Redis, SQS, RabbitMQ, and Kafka for a given use case',
  ],
  body: `
<h2>Queue vs Stream</h2>
<table class="ctable">
  <thead><tr><th>Aspect</th><th>Queue (SQS, RabbitMQ)</th><th>Stream (Kafka, Kinesis)</th></tr></thead>
  <tbody>
    <tr><td>Message retention</td><td>Deleted after consumed</td><td>Retained for days/weeks</td></tr>
    <tr><td>Consumers</td><td>Competing (each message to one)</td><td>Consumer groups, each gets all messages</td></tr>
    <tr><td>Replay</td><td>No</td><td>Yes — rewind to any offset</td></tr>
    <tr><td>Throughput</td><td>Thousands/sec</td><td>Millions/sec</td></tr>
    <tr><td>Use case</td><td>Task distribution, email/SMS sending</td><td>Event sourcing, analytics, audit logs</td></tr>
  </tbody>
</table>

<h2>AWS SQS Pattern</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — SQS with Laravel</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// config/queue.php
'sqs' => [
    'driver' => 'sqs',
    'key'    => env('AWS_ACCESS_KEY_ID'),
    'secret' => env('AWS_SECRET_ACCESS_KEY'),
    'prefix' => env('SQS_PREFIX', 'https://sqs.us-east-1.amazonaws.com/your-account-id'),
    'queue'  => env('SQS_QUEUE', 'default'),
    'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
],

// Dispatch to SQS
ProcessOrder::dispatch($order)->onConnection('sqs');

// Worker reads from SQS (automatically deletes after successful processing)
// php artisan queue:work sqs
</code></pre>
</div>

<h2>Fan-out: SNS → SQS</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Architecture — Order placed event</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">Order Service
    └── Publishes to SNS topic: "order-placed"
            ├── SQS: email-queue      → Email Service (sends confirmation)
            ├── SQS: inventory-queue  → Inventory Service (reserves stock)
            └── SQS: analytics-queue  → Analytics Service (updates stats)

# SNS delivers to all subscribers in parallel
# Each SQS queue is independent — one failure doesn't affect others
# Each service processes at its own pace
</code></pre>
</div>

<h2>Dead Letter Queue (DLQ)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel DLQ handling</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class ProcessPayment implements ShouldQueue {
    public int $tries = 3;
    public int $backoff = 60; // 60s between retries

    public function handle(): void { /* ... */ }

    public function failed(Throwable $e): void {
        // Message has been retried $tries times and sent to failed jobs table
        // Or to SQS DLQ if configured on the queue
        Log::critical('Payment processing permanently failed', [
            'job'   => $this->job->getJobId(),
            'error' => $e->getMessage(),
        ]);
        // Alert PagerDuty, create support ticket, etc.
    }
}

// View failed jobs
php artisan queue:failed
// Retry all failed
php artisan queue:retry all
</code></pre>
</div>

<h2>Idempotent Consumers</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Idempotency key pattern</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class ProcessPayment implements ShouldQueue {
    public function __construct(
        private string $orderId,
        private string $idempotencyKey, // e.g., UUID per payment attempt
    ) {}

    public function handle(): void {
        // Prevent duplicate processing (at-least-once delivery means duplicates happen)
        if (Cache::has("payment_processed:{$this->idempotencyKey}")) {
            return; // already processed, skip
        }

        $this->processPayment();

        Cache::put("payment_processed:{$this->idempotencyKey}", true, now()->addDays(7));
    }
}
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Queues (SQS, RabbitMQ): task distribution, at-most/at-least-once, messages deleted after processing</li>
    <li>Streams (Kafka, Kinesis): event log, replayable, consumer groups, high throughput — for analytics and event sourcing</li>
    <li>SNS + SQS fan-out: one event → many independent consumers, each at their own pace</li>
    <li>At-least-once delivery guarantees duplicates — always design consumers to be idempotent</li>
    <li>DLQ: messages that fail after max retries go here — never silently drop failed messages</li>
  </ul>
</div>
`,
};
