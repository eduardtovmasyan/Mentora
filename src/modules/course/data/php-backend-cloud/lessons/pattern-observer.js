export default {
  phase: 'Phase 2 · OOP & Design Patterns',
  title: 'Pattern · Observer',
  intro: 'The Observer pattern defines a one-to-many dependency: when an object (Subject) changes state, all registered Observers are notified automatically. It decouples publishers from subscribers. In PHP it powers Laravel events/listeners, Symfony event dispatcher, and reactive streams.',
  tags: ['Behavioral', 'Event', 'Subscriber', 'Listener', 'Loose coupling', 'Laravel Events'],
  seniorExpectations: [
    'Implement Observer with Subject and Observer interfaces (PSR-14 style)',
    'Distinguish synchronous observers from async listeners (queued jobs)',
    'Implement in Laravel: event classes, listener classes, EventServiceProvider',
    'Explain push vs pull notification models',
    'Know the downsides: debugging complexity, circular event chains',
  ],
  body: `
<h2>Core Implementation</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Classic Observer</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">interface Observer {
    public function update(string $event, mixed $data): void;
}

interface Subject {
    public function subscribe(string $event, Observer $observer): void;
    public function unsubscribe(string $event, Observer $observer): void;
    public function notify(string $event, mixed $data): void;
}

class EventEmitter implements Subject {
    private array $listeners = []; // event => Observer[]

    public function subscribe(string $event, Observer $observer): void {
        $this->listeners[$event][] = $observer;
    }

    public function unsubscribe(string $event, Observer $observer): void {
        $this->listeners[$event] = array_filter(
            $this->listeners[$event] ?? [],
            fn($o) => $o !== $observer
        );
    }

    public function notify(string $event, mixed $data): void {
        foreach ($this->listeners[$event] ?? [] as $observer) {
            $observer->update($event, $data);
        }
    }
}

// Observers
class EmailNotifier implements Observer {
    public function update(string $event, mixed $data): void {
        echo "Email sent for {$event}: " . json_encode($data);
    }
}

class AuditLogger implements Observer {
    public function update(string $event, mixed $data): void {
        echo "Audit log: {$event}";
    }
}

// Usage
$emitter = new EventEmitter();
$emitter->subscribe('user.registered', new EmailNotifier());
$emitter->subscribe('user.registered', new AuditLogger());
$emitter->notify('user.registered', ['email' => 'alice@example.com']);
</code></pre>
</div>

<h2>Laravel Events & Listeners</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel Event</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// app/Events/UserRegistered.php
class UserRegistered {
    public function __construct(public readonly User $user) {}
}

// app/Listeners/SendWelcomeEmail.php
class SendWelcomeEmail {
    public function handle(UserRegistered $event): void {
        Mail::to($event->user->email)->send(new WelcomeMail($event->user));
    }
}

// app/Listeners/CreateUserProfile.php (queued)
class CreateUserProfile implements ShouldQueue {
    public function handle(UserRegistered $event): void {
        Profile::create(['user_id' => $event->user->id]);
    }
}

// EventServiceProvider.php
protected $listen = [
    UserRegistered::class => [
        SendWelcomeEmail::class,
        CreateUserProfile::class, // runs async in queue worker
    ],
];

// Dispatching
event(new UserRegistered($user));
// or
UserRegistered::dispatch($user);
</code></pre>
</div>

<h2>Push vs Pull Models</h2>
<div class="callout callout-info">
  <div class="callout-title">Push vs Pull</div>
  <p><strong>Push</strong> (above): Subject sends event data directly to observers. Observers receive exactly what Subject decides to push. Simple but couples the data shape to the Subject.<br>
  <strong>Pull</strong>: Subject notifies with minimal data; observers query the subject for details. More flexible — observers can ask for only what they need — but requires observers to hold a reference to the subject.</p>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: What are the downsides of Observer?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <ul>
      <li><strong>Debugging difficulty</strong>: following an event chain across multiple listeners is hard</li>
      <li><strong>Unexpected ordering</strong>: listener execution order may not be obvious</li>
      <li><strong>Circular events</strong>: listener A fires event B which fires event A — infinite loop</li>
      <li><strong>Memory leaks</strong>: forgotten subscriptions keep observer objects alive</li>
    </ul>
  </div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Observer: Subject notifies all registered observers when its state changes — one-to-many</li>
    <li>Decouples publisher from subscriber — publisher doesn't know who is listening</li>
    <li>Laravel: event classes carry data, listener classes handle it, EventServiceProvider maps them</li>
    <li>Implement ShouldQueue on a listener to process it asynchronously in a queue worker</li>
    <li>Watch for circular event chains and memory leaks from uncleaned subscriptions</li>
  </ul>
</div>
`,
};
