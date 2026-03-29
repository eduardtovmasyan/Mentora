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
  segments: [
    { type: 'h2', text: 'Creating and Dispatching a Job' },
    { type: 'code', lang: 'bash', label: 'bash', code: `php artisan make:job SendWelcomeEmail
php artisan make:job ProcessPayment` },
    { type: 'code', lang: 'php', label: 'PHP — Job class', code: `class SendWelcomeEmail implements ShouldQueue {
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;           // retry up to 3 times
    public int $backoff = 60;        // wait 60s between retries
    public int $timeout = 30;        // kill after 30s

    public function __construct(public readonly User $user) {}

    public function handle(MailerInterface $mailer): void {
        $mailer->to($this->user->email)->send(new WelcomeMail($this->user));
    }

    public function failed(\\Throwable $e): void {
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
SendWelcomeEmail::dispatch($user)->delay(now()->addMinutes(5)); // delayed` },

    { type: 'h2', text: 'Job Chaining' },
    { type: 'code', lang: 'php', label: 'PHP — Sequential jobs', code: `// Jobs run in sequence — second starts only after first succeeds
Bus::chain([
    new ProcessPayment($order),
    new SendOrderConfirmation($order),
    new UpdateInventory($order),
])->dispatch();` },

    { type: 'h2', text: 'Job Batching' },
    { type: 'code', lang: 'php', label: 'PHP — Parallel jobs with callbacks', code: `$batch = Bus::batch([
    new ImportUsersChunk($chunk1),
    new ImportUsersChunk($chunk2),
    new ImportUsersChunk($chunk3),
])
->then(fn(Batch $b) => Log::info("All {$b->totalJobs} chunks imported"))
->catch(fn(Batch $b, \\Throwable $e) => Log::error('Import failed', ['error' => $e->getMessage()]))
->finally(fn(Batch $b) => Cache::forget('import_lock'))
->dispatch();

echo $batch->id; // UUID to track batch progress` },

    { type: 'h2', text: 'Rate Limiting Jobs' },
    { type: 'code', lang: 'php', label: 'PHP', code: `class SendSmsNotification implements ShouldQueue {
    public function middleware(): array {
        // Max 5 SMS per second (Twilio limit)
        return [new RateLimited('sms-notifications')];
    }
}

// In AppServiceProvider
RateLimiter::for('sms-notifications', fn($job) =>
    Limit::perSecond(5)
);` },

    { type: 'h2', text: 'Running Workers' },
    { type: 'code', lang: 'bash', label: 'bash — Development + Production', code: `# Development
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
php artisan horizon` },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Jobs implement ShouldQueue — Laravel serializes them and pushes to the configured driver',
      'Set <code>$tries</code>, <code>$backoff</code>, and <code>$timeout</code> on every job; implement <code>failed()</code> for alerting',
      'Chains: sequential jobs, each waits for the previous; Batches: parallel jobs with progress tracking',
      'Rate limiting middleware: throttle jobs to respect external API limits',
      'Production: Supervisor for process management, Laravel Horizon for Redis queues with metrics',
    ]},
  ],
};
