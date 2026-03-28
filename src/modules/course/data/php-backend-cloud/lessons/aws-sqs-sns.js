export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'AWS SQS & SNS',
  intro: 'SQS (Simple Queue Service) is a fully managed message queue. SNS (Simple Notification Service) is a pub/sub messaging service. Together they enable decoupled, scalable architectures: SNS fans out events to multiple SQS queues, each consumed by independent services. Senior engineers configure FIFO queues, DLQs, and visibility timeouts correctly.',
  tags: ['SQS', 'SNS', 'FIFO', 'DLQ', 'Visibility timeout', 'Fan-out', 'Message deduplication'],
  seniorExpectations: [
    'Configure standard vs FIFO SQS queues and know when to use each',
    'Set correct visibility timeout (> your longest job execution time)',
    'Implement SNS fan-out with multiple SQS subscriber queues',
    'Configure Dead Letter Queues for failed message handling',
    'Integrate SQS as a Laravel queue driver with proper retry and timeout settings',
  ],
  body: `
<h2>SQS Queue Types</h2>
<table class="ctable">
  <thead><tr><th>Feature</th><th>Standard Queue</th><th>FIFO Queue</th></tr></thead>
  <tbody>
    <tr><td>Ordering</td><td>Best-effort (not guaranteed)</td><td>Strictly ordered within group</td></tr>
    <tr><td>Delivery</td><td>At-least-once (duplicates possible)</td><td>Exactly-once processing</td></tr>
    <tr><td>Throughput</td><td>Unlimited (nearly)</td><td>3000 msg/s with batching</td></tr>
    <tr><td>Use case</td><td>Email, background jobs, notifications</td><td>Financial transactions, order processing</td></tr>
  </tbody>
</table>

<h2>Terraform: SQS + SNS Fan-out</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_sns_topic" "order_placed" {
  name = "order-placed"
}

resource "aws_sqs_queue" "email_queue" {
  name                       = "order-emails"
  visibility_timeout_seconds = 300  # Must be >= your job timeout
  message_retention_seconds  = 86400 # 1 day

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.email_dlq.arn
    maxReceiveCount     = 3  # Retry 3 times before sending to DLQ
  })
}

resource "aws_sqs_queue" "email_dlq" {
  name                      = "order-emails-dlq"
  message_retention_seconds = 1209600 # 14 days — time to investigate
}

resource "aws_sqs_queue" "inventory_queue" {
  name                       = "order-inventory"
  visibility_timeout_seconds = 120
}

# Subscribe both queues to the SNS topic
resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.order_placed.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.email_queue.arn
}

resource "aws_sns_topic_subscription" "inventory" {
  topic_arn = aws_sns_topic.order_placed.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.inventory_queue.arn
}
</code></pre>
</div>

<h2>Visibility Timeout Explained</h2>
<div class="callout callout-warn">
  <div class="callout-title">Critical: set visibility timeout correctly</div>
  <p>When a consumer reads a message, SQS hides it (visibility timeout). If not deleted within the timeout, SQS makes it visible again for retry. If your job takes 60s but timeout is 30s, SQS re-delivers to another worker → <strong>duplicate processing</strong>. Set timeout to at least 2× your maximum job execution time.</p>
</div>

<h2>Laravel + SQS</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — .env + job</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// .env
QUEUE_CONNECTION=sqs
AWS_DEFAULT_REGION=eu-west-1
SQS_PREFIX=https://sqs.eu-west-1.amazonaws.com/123456789012
SQS_QUEUE=my-default-queue

// Dispatch to specific queue
ProcessOrder::dispatch($order)->onQueue('orders');

// Run worker
// php artisan queue:work sqs --queue=orders --timeout=120

// ECS worker task: process SQS messages in a separate ECS service
// Scale worker tasks based on SQS queue depth (ApproximateNumberOfMessages)
</code></pre>
</div>

<h2>SQS Scaling with ECS</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL — Auto scale workers based on queue depth</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_appautoscaling_policy" "sqs_depth" {
  name        = "sqs-depth-scaling"
  policy_type = "TargetTrackingScaling"
  # ...
  target_tracking_scaling_policy_configuration {
    customized_metric_specification {
      metric_name = "ApproximateNumberOfMessages"
      namespace   = "AWS/SQS"
      statistic   = "Average"
      dimensions  = [{ name = "QueueName", value = "my-worker-queue" }]
    }
    target_value = 10  # scale to keep ~10 messages per worker
  }
}
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Standard SQS: at-least-once → make consumers idempotent; FIFO: exactly-once + ordered</li>
    <li>Visibility timeout must be > job max execution time — otherwise duplicate processing occurs</li>
    <li>SNS fan-out: one publish → multiple SQS queues → independent consumers at their own pace</li>
    <li>DLQ: messages that fail maxReceiveCount times go here — monitor DLQ depth for alerts</li>
    <li>Scale ECS workers based on SQS ApproximateNumberOfMessages metric</li>
  </ul>
</div>
`,
};
