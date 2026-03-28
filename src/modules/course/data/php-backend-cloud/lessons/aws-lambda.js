export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'AWS Lambda',
  intro: 'Lambda runs code without managing servers — you pay only for execution time (per millisecond). It scales automatically from zero to thousands of concurrent executions. Senior engineers use Lambda for event-driven processing, API backends via API Gateway, scheduled jobs, and S3/SQS/DynamoDB stream processing.',
  tags: ['Serverless', 'Event-driven', 'Cold start', 'API Gateway', 'Layers', 'Bref PHP'],
  seniorExpectations: [
    'Deploy a PHP Lambda function using Bref',
    'Trigger Lambda from SQS, S3 events, and scheduled events (EventBridge)',
    'Understand cold starts and how to mitigate them (provisioned concurrency)',
    'Configure Lambda timeout, memory, and concurrency limits',
    'Use Lambda Layers for shared dependencies (PHP runtime)',
  ],
  body: `
<h2>Lambda Execution Model</h2>
<table class="ctable">
  <thead><tr><th>Property</th><th>Value / Notes</th></tr></thead>
  <tbody>
    <tr><td>Max timeout</td><td>15 minutes</td></tr>
    <tr><td>Memory</td><td>128MB – 10GB; CPU scales linearly with memory</td></tr>
    <tr><td>Cold start</td><td>~100ms–1s for first invocation; mitigate with provisioned concurrency</td></tr>
    <tr><td>Concurrency</td><td>Up to 1000 concurrent executions by default (can increase)</td></tr>
    <tr><td>Ephemeral storage</td><td>/tmp up to 10GB</td></tr>
    <tr><td>Pricing</td><td>$0.20/million requests + $0.0000166667/GB-second</td></tr>
  </tbody>
</table>

<h2>PHP on Lambda with Bref</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">composer require bref/bref
vendor/bin/bref init
</code></pre>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — serverless.yml (Serverless Framework)</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">service: my-php-app
provider:
  name: aws
  region: eu-west-1
  runtime: provided.al2

plugins:
  - ./vendor/bref/bref

functions:
  # HTTP function — API Gateway triggers
  api:
    handler: public/index.php
    layers:
      - arn:aws:lambda:eu-west-1:534081306603:layer:php-82-fpm:63
    events:
      - httpApi:
          path: /{proxy+}
          method: any

  # Worker function — SQS triggers
  worker:
    handler: worker.php
    layers:
      - arn:aws:lambda:eu-west-1:534081306603:layer:php-82:63
    events:
      - sqs:
          arn: !GetAtt MyQueue.Arn
          batchSize: 10

  # Cron job — EventBridge triggers
  cron:
    handler: cron.php
    layers:
      - arn:aws:lambda:eu-west-1:534081306603:layer:php-82:63
    events:
      - schedule: rate(1 hour)
</code></pre>
</div>

<h2>Lambda Handler</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — worker.php</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">require __DIR__ . '/vendor/autoload.php';

use Bref\Context\Context;

return function (array $event, Context $context): void {
    // SQS event: $event['Records'] contains array of messages
    foreach ($event['Records'] as $record) {
        $body = json_decode($record['body'], true);
        processJob($body);
        // Bref automatically deletes successfully processed messages from SQS
    }
};
</code></pre>
</div>

<h2>Provisioned Concurrency (cold start mitigation)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">functions:
  api:
    handler: public/index.php
    provisionedConcurrency: 5  # Keep 5 warm instances; eliminates cold starts
    # Cost: you pay for these 5 instances 24/7
    # Only for latency-sensitive endpoints (< 100ms response requirement)
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">When to use Lambda vs ECS</div>
  <p><strong>Lambda</strong>: event-driven, variable load, short-lived tasks (&lt;15min), scale to zero important (dev/staging cost). <strong>ECS Fargate</strong>: long-running HTTP servers, WebSocket connections, &gt;15min processing, consistent load. Lambda PHP cold starts are ~300ms with Bref — acceptable for most API calls but avoid for sub-100ms latency requirements without provisioned concurrency.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Lambda: pay per invocation + duration — ideal for event-driven and variable workloads</li>
    <li>Bref: PHP Lambda runtime — supports HTTP (FPM mode) and CLI (event handler) functions</li>
    <li>Cold start: first invocation initializes container — ~300ms for PHP; use provisioned concurrency for latency-sensitive APIs</li>
    <li>Memory = CPU: increasing from 512MB to 1024MB halves execution time — often cheaper despite higher per-ms cost</li>
    <li>Lambda Layers: share PHP runtime, vendor dependencies across multiple functions</li>
  </ul>
</div>
`,
};
