export default {
  phase: 'Phase 3 · Modern PHP 8.x',
  title: 'Laravel Queues & Jobs',
  intro: 'Laravel queues move time-consuming tasks (emails, notifications, image processing, API calls) out of the HTTP request cycle into background workers. Jobs are serialized and pushed to a queue driver (Redis, SQS, database). Workers pick them up and execute them asynchronously. This is the practical async solution for most Laravel applications.',
  tags: ['Jobs', 'Workers', 'Redis', 'SQS', 'Batches', 'Chains', 'Failed jobs', 'Rate limiting'],
  seniorExpectations: [
    'Create a job, push it to a queue, and run a worker',
    'Implement job chaining and batching for complex workflows',
    'Handle failed jobs: retry logic, failed_jobs table, Horizon dead-letter',
    'Rate-limit jobs using Laravel\'s built-in throttle middleware',
    'Deploy queue workers with Supervisor; monitor with Laravel Horizon',
  ],
  body: `
<h2>Creating and Dispatching a Job</h2>
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

<h2>Job Chaining</h2>
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

<h2>Job Batching</h2>
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

<h2>Rate Limiting Jobs</h2>
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

<h2>Running Workers</h2>
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
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Jobs implement ShouldQueue — Laravel serializes them and pushes to the configured driver</li>
    <li>Set <code>$tries</code>, <code>$backoff</code>, and <code>$timeout</code> on every job; implement <code>failed()</code> for alerting</li>
    <li>Chains: sequential jobs, each waits for the previous; Batches: parallel jobs with progress tracking</li>
    <li>Rate limiting middleware: throttle jobs to respect external API limits</li>
    <li>Production: Supervisor for process management, Laravel Horizon for Redis queues with metrics</li>
  </ul>
</div>
`,
};
