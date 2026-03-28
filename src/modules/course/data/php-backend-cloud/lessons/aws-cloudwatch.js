export default {
  phase: 'Phase 7 · AWS Cloud Engineering',
  title: 'AWS CloudWatch',
  intro: 'CloudWatch is AWS\'s observability service: metrics, logs, alarms, and dashboards. Every AWS service publishes metrics to CloudWatch. Senior engineers set up log groups for ECS tasks, create alarms for error rates and latency, build dashboards, and use CloudWatch Insights for log querying.',
  tags: ['Metrics', 'Logs', 'Alarms', 'Log Insights', 'Dashboards', 'EMF', 'Container Insights'],
  seniorExpectations: [
    'Configure log groups for ECS, Lambda, and application logs',
    'Create CloudWatch Alarms for SLOs: error rate > 1%, p99 latency > 500ms',
    'Query logs with CloudWatch Logs Insights for debugging and analysis',
    'Emit custom metrics using Embedded Metric Format (EMF) from PHP',
    'Set up composite alarms and anomaly detection',
  ],
  body: `
<h2>Log Groups and Retention</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL — Terraform CloudWatch log group</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/my-app"
  retention_in_days = 30  # don\'t keep logs forever — costs add up
  kms_key_id        = aws_kms_key.logs.arn  # encrypt at rest
}

resource "aws_cloudwatch_log_group" "nginx" {
  name              = "/ecs/my-app/nginx"
  retention_in_days = 7
}
</code></pre>
</div>

<h2>CloudWatch Alarms</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">HCL — Error rate and latency alarms</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">resource "aws_cloudwatch_metric_alarm" "error_rate" {
  alarm_name          = "my-app-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5XXError"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10  # more than 10 errors per minute
  alarm_description   = "High 5xx error rate on ALB"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
  }
}

resource "aws_cloudwatch_metric_alarm" "p99_latency" {
  alarm_name          = "my-app-high-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  extended_statistic  = "p99"
  threshold           = 0.5  # 500ms
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
</code></pre>
</div>

<h2>CloudWatch Logs Insights Queries</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">CloudWatch Insights — Common queries</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Find all errors in last hour
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100

# Top 10 slowest API endpoints
fields @timestamp, request_path, duration_ms
| filter duration_ms > 0
| stats avg(duration_ms) as avg_ms, max(duration_ms) as max_ms, count() as hits
    by request_path
| sort avg_ms desc
| limit 10

# 5xx errors grouped by status code
fields @timestamp, status_code
| filter status_code >= 500
| stats count() as error_count by status_code, bin(5m) as time_bucket
| sort time_bucket desc
</code></pre>
</div>

<h2>Custom Metrics from PHP (EMF)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Embedded Metric Format</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Emit custom metric by writing structured JSON to stdout (CloudWatch Agent parses it)
function emitMetric(string $name, float $value, string $unit = 'Count'): void {
    $emf = [
        '_aws' => [
            'Timestamp'  => (int)(microtime(true) * 1000),
            'CloudWatchMetrics' => [[
                'Namespace'  => 'MyApp',
                'Dimensions' => [['Service', 'Environment']],
                'Metrics'    => [['Name' => $name, 'Unit' => $unit]],
            ]],
        ],
        'Service'     => 'order-service',
        'Environment' => config('app.env'),
        $name         => $value,
    ];
    error_log(json_encode($emf)); // writes to CloudWatch Logs → auto extracted as metric
}

emitMetric('OrdersCreated', 1);
emitMetric('PaymentDuration', $durationMs, 'Milliseconds');
emitMetric('CartAbandoned',   1);
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Set log retention — unmanaged log groups accumulate and cost money</li>
    <li>Create alarms for the 4 golden signals: latency, traffic, errors, saturation</li>
    <li>CloudWatch Logs Insights: structured JSON logs enable powerful aggregation queries</li>
    <li>EMF: write JSON with _aws.CloudWatchMetrics to stdout — CloudWatch auto-extracts as metrics</li>
    <li>Container Insights: enable per-cluster for ECS CPU, memory, network metrics at task level</li>
  </ul>
</div>
`,
};
