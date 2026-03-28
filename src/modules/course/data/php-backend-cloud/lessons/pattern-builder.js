export default {
  phase: 'Phase 2 · OOP, SOLID & Design Patterns',
  title: 'Pattern: Builder',
  intro: 'The Builder pattern separates the construction of a complex object from its representation, allowing the same construction process to produce different results. Instead of a constructor with 10 parameters — where you must remember what the 7th argument means — you call a fluent chain of descriptively named methods. The result is readable, self-documenting construction code that is easy to extend, validate, and test. PHP back-end code uses Builders constantly: Eloquent\'s QueryBuilder, Laravel\'s mail message builder, HTTP client request builders, and test data factories all follow this pattern.',
  tags: ['builder', 'creational', 'design-patterns', 'php', 'fluent-interface', 'method-chaining'],
  seniorExpectations: [
    'Explain the telescoping constructor anti-pattern and why Builder solves it',
    'Implement a fluent Builder with method chaining and a build() method that validates and returns the product',
    'Describe the role of the Director class and when it adds value versus when it is unnecessary overhead',
    'Contrast mutable and immutable builders, and explain the trade-offs',
    'Identify Builder usage throughout the Laravel framework (QueryBuilder, MailMessage, PendingRequest)',
  ],
  body: `
<h2>The Problem: Telescoping Constructors</h2>
<p>Consider an <code>Email</code> object that needs a sender, recipient, subject, body, CC list, BCC list, attachments, reply-to address, priority, and HTML flag. A traditional constructor forces callers to supply all arguments at once — in the right order — producing unreadable call sites and making optional parameters painful:</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php

// Anti-pattern: telescoping constructor
class Email
{
    public function __construct(
        string $from,
        string $to,
        string $subject,
        string $body,
        array  $cc       = [],
        array  $bcc      = [],
        array  $attachments = [],
        string $replyTo  = '',
        int    $priority = 3,
        bool   $isHtml   = true
    ) { /* ... */ }
}

// At the call site — what does "3" mean? What is that empty string?
$email = new Email(
    'sender@example.com',
    'user@example.com',
    'Your invoice',
    '&lt;p&gt;See attached.&lt;/p&gt;',
    [],        // cc
    [],        // bcc
    ['/tmp/invoice.pdf'],
    '',        // reply-to — easy to forget entirely
    3,         // priority — magic number
    true
);
</code></pre>
</div>

<p>This is called the <strong>telescoping constructor anti-pattern</strong>. Adding one new optional parameter means updating every call site. The Builder pattern eliminates this entirely.</p>

<div class="callout callout-tip">
  <div class="callout-title">Builder vs Named Arguments</div>
  <p>PHP 8.0 named arguments help at the call site but do not solve validation, multi-step construction, or producing different product representations from the same process. Builder remains valuable for complex objects that require validation logic during assembly.</p>
</div>

<h2>Fluent Builder with Method Chaining</h2>
<p>Each setter method returns <code>$this</code>, enabling a fluent API. A final <code>build()</code> method validates state and returns the immutable product object.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php

namespace App\Mail;

use InvalidArgumentException;

class EmailBuilder
{
    private string $from    = '';
    private string $to      = '';
    private string $subject = '';
    private string $body    = '';
    private array  $cc      = [];
    private array  $bcc     = [];
    private array  $attachments = [];
    private string $replyTo = '';
    private int    $priority = 3; // 1 = highest, 5 = lowest
    private bool   $isHtml  = true;

    public function from(string $address): static
    {
        $this->from = $address;
        return $this;
    }

    public function to(string $address): static
    {
        $this->to = $address;
        return $this;
    }

    public function subject(string $subject): static
    {
        $this->subject = $subject;
        return $this;
    }

    public function body(string $body): static
    {
        $this->body = $body;
        return $this;
    }

    public function cc(string ...$addresses): static
    {
        $this->cc = array_merge($this->cc, $addresses);
        return $this;
    }

    public function bcc(string ...$addresses): static
    {
        $this->bcc = array_merge($this->bcc, $addresses);
        return $this;
    }

    public function attach(string $filePath): static
    {
        $this->attachments[] = $filePath;
        return $this;
    }

    public function replyTo(string $address): static
    {
        $this->replyTo = $address;
        return $this;
    }

    public function highPriority(): static
    {
        $this->priority = 1;
        return $this;
    }

    public function plainText(): static
    {
        $this->isHtml = false;
        return $this;
    }

    public function build(): Email
    {
        // Centralise all validation here — never scattered at call sites
        if (empty($this->from)) {
            throw new InvalidArgumentException('Email must have a sender.');
        }
        if (empty($this->to)) {
            throw new InvalidArgumentException('Email must have a recipient.');
        }
        if (empty($this->subject)) {
            throw new InvalidArgumentException('Email must have a subject.');
        }

        return new Email(
            from:        $this->from,
            to:          $this->to,
            subject:     $this->subject,
            body:        $this->body,
            cc:          $this->cc,
            bcc:         $this->bcc,
            attachments: $this->attachments,
            replyTo:     $this->replyTo,
            priority:    $this->priority,
            isHtml:      $this->isHtml,
        );
    }
}

// Usage — self-documenting, easy to read and modify:
$email = (new EmailBuilder())
    ->from('billing@company.com')
    ->to('client@example.com')
    ->subject('Your invoice #1042')
    ->body('&lt;p&gt;Please find your invoice attached.&lt;/p&gt;')
    ->attach('/storage/invoices/1042.pdf')
    ->highPriority()
    ->replyTo('accounts@company.com')
    ->build();
</code></pre>
</div>

<h2>The Director Class</h2>
<p>A <strong>Director</strong> encapsulates common construction recipes, so the same steps are not duplicated across call sites. It depends on a builder interface, not a concrete builder, so the same director can produce different representations.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php

namespace App\Mail;

class EmailDirector
{
    public function __construct(private readonly EmailBuilder $builder) {}

    /** Pre-configured invoice notification email. */
    public function buildInvoiceEmail(string $to, int $invoiceId): Email
    {
        return $this->builder
            ->from('billing@company.com')
            ->to($to)
            ->replyTo('accounts@company.com')
            ->subject("Your invoice #{$invoiceId}")
            ->body("&lt;p&gt;Your invoice #{$invoiceId} is ready. Please see attached.&lt;/p&gt;")
            ->attach("/storage/invoices/{$invoiceId}.pdf")
            ->highPriority()
            ->build();
    }

    /** Pre-configured welcome email for new users. */
    public function buildWelcomeEmail(string $to, string $firstName): Email
    {
        return $this->builder
            ->from('hello@company.com')
            ->to($to)
            ->subject("Welcome to Acme, {$firstName}!")
            ->body("&lt;p&gt;Hi {$firstName}, we're thrilled to have you on board.&lt;/p&gt;")
            ->build();
    }
}

// Usage:
$director = new EmailDirector(new EmailBuilder());
$email    = $director->buildInvoiceEmail('client@example.com', 1042);
</code></pre>
</div>

<h2>Immutable Builder</h2>
<p>Mutable builders have a subtle bug: if you store the builder and call <code>build()</code> twice after changing a property between calls, both products are affected because they share the same underlying state. An immutable builder returns a <em>new</em> instance on every setter call, making it safe to fork and reuse.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php

namespace App\Http;

final class RequestBuilder
{
    private function __construct(
        private readonly string $method  = 'GET',
        private readonly string $url     = '',
        private readonly array  $headers = [],
        private readonly array  $body    = [],
        private readonly int    $timeout = 30,
    ) {}

    public static function make(): self
    {
        return new self();
    }

    public function method(string $method): self
    {
        // Returns a NEW instance — original is unchanged
        return new self($method, $this->url, $this->headers, $this->body, $this->timeout);
    }

    public function url(string $url): self
    {
        return new self($this->method, $url, $this->headers, $this->body, $this->timeout);
    }

    public function header(string $name, string $value): self
    {
        $headers = array_merge($this->headers, [$name => $value]);
        return new self($this->method, $this->url, $headers, $this->body, $this->timeout);
    }

    public function bodyJson(array $data): self
    {
        return new self($this->method, $this->url, $this->headers, $data, $this->timeout);
    }

    public function timeout(int $seconds): self
    {
        return new self($this->method, $this->url, $this->headers, $this->body, $seconds);
    }

    public function build(): HttpRequest
    {
        if (empty($this->url)) {
            throw new \InvalidArgumentException('URL is required.');
        }
        return new HttpRequest($this->method, $this->url, $this->headers, $this->body, $this->timeout);
    }
}

// Fork the same base builder for two different requests:
$base = RequestBuilder::make()
    ->header('Authorization', 'Bearer ' . $token)
    ->header('Accept', 'application/json')
    ->timeout(10);

$getUser    = $base->method('GET')->url('/users/42')->build();
$updateUser = $base->method('PUT')->url('/users/42')->bodyJson(['name' => 'Alice'])->build();
// $base is untouched — safe to reuse
</code></pre>
</div>

<h2>Real-World: Laravel's Query Builder</h2>
<p>Laravel's Eloquent and DB Query Builder are canonical examples of the Builder pattern used in production at massive scale. Every chained method (<code>where</code>, <code>orderBy</code>, <code>limit</code>) returns the same builder instance and accumulates state. <code>get()</code> or <code>first()</code> acts as the <code>build()</code> step that compiles and executes the query.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php

use Illuminate\Support\Facades\DB;

// Laravel's QueryBuilder — you never call "new Query(...)" with 8 args.
// Each method accumulates state and returns $this.
$users = DB::table('users')
    ->select('id', 'name', 'email')
    ->where('active', true)
    ->where('role', 'customer')
    ->whereNotNull('email_verified_at')
    ->orderBy('created_at', 'desc')
    ->limit(50)
    ->offset(100)
    ->get(); // &lt;-- the "build()" step: compiles SQL and executes

// The same builder can produce different SQL depending on runtime conditions:
$query = DB::table('orders')->where('user_id', auth()->id());

if ($request->has('status')) {
    $query->where('status', $request->status);
}

if ($request->boolean('urgent')) {
    $query->where('priority', 1)->orderBy('created_at', 'asc');
}

$orders = $query->paginate(20);
</code></pre>
</div>

<h2>Testing with Builders</h2>
<p>Builders make test data setup dramatically cleaner. Laravel's model factories are an implementation of the Builder pattern — each <code>state()</code> or <code>has()</code> call returns a configured factory ready to <code>create()</code> or <code>make()</code> the product.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php

// Laravel factory as a Builder:
$adminUser = User::factory()
    ->admin()
    ->emailVerified()
    ->has(Order::factory()->count(3)->paid())
    ->create();

// Custom test builder for complex domain objects:
class OrderTestBuilder
{
    private int    $total    = 1000;
    private string $status   = 'pending';
    private ?User  $customer = null;

    public static function make(): self { return new self(); }

    public function withTotal(int $cents): self
    {
        $this->total = $cents;
        return $this;
    }

    public function paid(): self
    {
        $this->status = 'paid';
        return $this;
    }

    public function forCustomer(User $user): self
    {
        $this->customer = $user;
        return $this;
    }

    public function create(): Order
    {
        return Order::factory()->create([
            'total'       => $this->total,
            'status'      => $this->status,
            'customer_id' => ($this->customer ?? User::factory()->create())->id,
        ]);
    }
}

// In a test:
$order = OrderTestBuilder::make()->withTotal(5000)->paid()->create();
</code></pre>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: When is a Director class worth adding, and when is it overkill?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>A Director is worth adding when the same multi-step construction recipe is repeated in more than one place. It extracts the recipe into a single named method, preventing drift. If a builder is only used in one place with a unique configuration each time, a Director adds indirection without benefit — just use the builder directly. A common middle ground in Laravel is a static factory method on the builder itself, e.g. <code>EmailBuilder::forInvoice($invoiceId)</code>.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: What is the difference between Builder and Factory patterns?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Factory (including Abstract Factory) focuses on <em>which class to instantiate</em> — it encapsulates object creation decisions and returns a product. Builder focuses on <em>how to construct one complex object step by step</em> — it accumulates configuration and produces the final product only when <code>build()</code> is called. Builders are appropriate when construction requires many optional steps or multi-step validation; factories are appropriate when you need to choose between product variants based on runtime conditions.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: What is the risk of a mutable builder and how do you mitigate it?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>If you store a mutable builder and call further setters after retrieving one product, subsequent builds reflect the mutated state. This is especially dangerous when a base builder is shared across requests in a long-running process (Swoole, RoadRunner). The fix is either an immutable builder (each setter returns a new instance via <code>clone</code> or a private constructor) or cloning the builder before each use: <code>$specificBuilder = clone $baseBuilder;</code>.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Builder solves the <strong>telescoping constructor anti-pattern</strong> — constructors with many optional parameters that are hard to read and maintain.</li>
    <li>Each setter method returns <code>$this</code> (or a new instance for immutable builders), enabling a <strong>fluent, self-documenting API</strong>.</li>
    <li>The <code>build()</code> method is the right place to centralise <strong>validation logic</strong> before the product is created.</li>
    <li>A <strong>Director</strong> encapsulates reusable construction recipes; skip it if there is only one call site.</li>
    <li><strong>Immutable builders</strong> are safer in shared, long-running environments — each setter returns a new instance, leaving the original untouched.</li>
    <li>Laravel's <strong>QueryBuilder, MailMessage, PendingRequest</strong> (HTTP client), and model factories are all Builder pattern implementations.</li>
    <li>Distinguish Builder (step-by-step construction of one complex object) from Factory (choosing which class to instantiate).</li>
  </ul>
</div>
`,
};
