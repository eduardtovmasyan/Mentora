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
  segments: [
    { type: 'h2', key: 'h_telescoping' },
    { type: 'p', key: 'p_telescoping_intro' },
    {
      type: 'code',
      lang: 'php',
      label: 'Anti-pattern: telescoping constructor',
      code: `<?php

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
    '<p>See attached.</p>',
    [],        // cc
    [],        // bcc
    ['/tmp/invoice.pdf'],
    '',        // reply-to — easy to forget entirely
    3,         // priority — magic number
    true
);`,
    },
    { type: 'p', key: 'p_telescoping_conclusion' },
    { type: 'callout', style: 'tip', key: 'callout_named_args' },
    { type: 'h2', key: 'h_fluent_builder' },
    { type: 'p', key: 'p_fluent_builder_intro' },
    {
      type: 'code',
      lang: 'php',
      label: 'Fluent EmailBuilder with method chaining',
      code: `<?php

namespace App\\Mail;

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
    ->body('<p>Please find your invoice attached.</p>')
    ->attach('/storage/invoices/1042.pdf')
    ->highPriority()
    ->replyTo('accounts@company.com')
    ->build();`,
    },
    { type: 'h2', key: 'h_director' },
    { type: 'p', key: 'p_director_intro' },
    {
      type: 'code',
      lang: 'php',
      label: 'Director encapsulating reusable construction recipes',
      code: `<?php

namespace App\\Mail;

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
            ->body("<p>Your invoice #{$invoiceId} is ready. Please see attached.</p>")
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
            ->body("<p>Hi {$firstName}, we're thrilled to have you on board.</p>")
            ->build();
    }
}

// Usage:
$director = new EmailDirector(new EmailBuilder());
$email    = $director->buildInvoiceEmail('client@example.com', 1042);`,
    },
    { type: 'h2', key: 'h_immutable' },
    { type: 'p', key: 'p_immutable_intro' },
    {
      type: 'code',
      lang: 'php',
      label: 'Immutable RequestBuilder — each setter returns a new instance',
      code: `<?php

namespace App\\Http;

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
            throw new \\InvalidArgumentException('URL is required.');
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
// $base is untouched — safe to reuse`,
    },
    { type: 'h2', key: 'h_laravel_query' },
    { type: 'p', key: 'p_laravel_query_intro' },
    {
      type: 'code',
      lang: 'php',
      label: "Laravel's QueryBuilder in action",
      code: `<?php

use Illuminate\\Support\\Facades\\DB;

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
    ->get(); // <-- the "build()" step: compiles SQL and executes

// The same builder can produce different SQL depending on runtime conditions:
$query = DB::table('orders')->where('user_id', auth()->id());

if ($request->has('status')) {
    $query->where('status', $request->status);
}

if ($request->boolean('urgent')) {
    $query->where('priority', 1)->orderBy('created_at', 'asc');
}

$orders = $query->paginate(20);`,
    },
    { type: 'h2', key: 'h_testing' },
    { type: 'p', key: 'p_testing_intro' },
    {
      type: 'code',
      lang: 'php',
      label: 'Laravel factories and a custom OrderTestBuilder',
      code: `<?php

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
$order = OrderTestBuilder::make()->withTotal(5000)->paid()->create();`,
    },
    { type: 'qa', key: 'qa' },
    { type: 'keypoints', key: 'keypoints' },
  ],
  bodyTexts: {
    h_telescoping: 'The Problem: Telescoping Constructors',
    p_telescoping_intro: 'Consider an <code>Email</code> object that needs a sender, recipient, subject, body, CC list, BCC list, attachments, reply-to address, priority, and HTML flag. A traditional constructor forces callers to supply all arguments at once — in the right order — producing unreadable call sites and making optional parameters painful:',
    p_telescoping_conclusion: 'This is called the <strong>telescoping constructor anti-pattern</strong>. Adding one new optional parameter means updating every call site. The Builder pattern eliminates this entirely.',
    callout_named_args: {
      title: 'Builder vs Named Arguments',
      html: 'PHP 8.0 named arguments help at the call site but do not solve validation, multi-step construction, or producing different product representations from the same process. Builder remains valuable for complex objects that require validation logic during assembly.',
    },
    h_fluent_builder: 'Fluent Builder with Method Chaining',
    p_fluent_builder_intro: 'Each setter method returns <code>$this</code>, enabling a fluent API. A final <code>build()</code> method validates state and returns the immutable product object.',
    h_director: 'The Director Class',
    p_director_intro: 'A <strong>Director</strong> encapsulates common construction recipes, so the same steps are not duplicated across call sites. It depends on a builder interface, not a concrete builder, so the same director can produce different representations.',
    h_immutable: 'Immutable Builder',
    p_immutable_intro: 'Mutable builders have a subtle bug: if you store the builder and call <code>build()</code> twice after changing a property between calls, both products are affected because they share the same underlying state. An immutable builder returns a <em>new</em> instance on every setter call, making it safe to fork and reuse.',
    h_laravel_query: "Real-World: Laravel's Query Builder",
    p_laravel_query_intro: "Laravel's Eloquent and DB Query Builder are canonical examples of the Builder pattern used in production at massive scale. Every chained method (<code>where</code>, <code>orderBy</code>, <code>limit</code>) returns the same builder instance and accumulates state. <code>get()</code> or <code>first()</code> acts as the <code>build()</code> step that compiles and executes the query.",
    h_testing: 'Testing with Builders',
    p_testing_intro: "Builders make test data setup dramatically cleaner. Laravel's model factories are an implementation of the Builder pattern — each <code>state()</code> or <code>has()</code> call returns a configured factory ready to <code>create()</code> or <code>make()</code> the product.",
    qa: {
      pairs: [
        {
          q: 'When is a Director class worth adding, and when is it overkill?',
          a: 'A Director is worth adding when the same multi-step construction recipe is repeated in more than one place. It extracts the recipe into a single named method, preventing drift. If a builder is only used in one place with a unique configuration each time, a Director adds indirection without benefit — just use the builder directly. A common middle ground in Laravel is a static factory method on the builder itself, e.g. <code>EmailBuilder::forInvoice($invoiceId)</code>.',
        },
        {
          q: 'What is the difference between Builder and Factory patterns?',
          a: 'Factory (including Abstract Factory) focuses on <em>which class to instantiate</em> — it encapsulates object creation decisions and returns a product. Builder focuses on <em>how to construct one complex object step by step</em> — it accumulates configuration and produces the final product only when <code>build()</code> is called. Builders are appropriate when construction requires many optional steps or multi-step validation; factories are appropriate when you need to choose between product variants based on runtime conditions.',
        },
        {
          q: 'What is the risk of a mutable builder and how do you mitigate it?',
          a: 'If you store a mutable builder and call further setters after retrieving one product, subsequent builds reflect the mutated state. This is especially dangerous when a base builder is shared across requests in a long-running process (Swoole, RoadRunner). The fix is either an immutable builder (each setter returns a new instance via <code>clone</code> or a private constructor) or cloning the builder before each use: <code>$specificBuilder = clone $baseBuilder;</code>.',
        },
      ],
    },
    keypoints: {
      title: 'Key Points to Remember',
      items: [
        'Builder solves the <strong>telescoping constructor anti-pattern</strong> — constructors with many optional parameters that are hard to read and maintain.',
        'Each setter method returns <code>$this</code> (or a new instance for immutable builders), enabling a <strong>fluent, self-documenting API</strong>.',
        'The <code>build()</code> method is the right place to centralise <strong>validation logic</strong> before the product is created.',
        'A <strong>Director</strong> encapsulates reusable construction recipes; skip it if there is only one call site.',
        '<strong>Immutable builders</strong> are safer in shared, long-running environments — each setter returns a new instance, leaving the original untouched.',
        "Laravel's <strong>QueryBuilder, MailMessage, PendingRequest</strong> (HTTP client), and model factories are all Builder pattern implementations.",
        'Distinguish Builder (step-by-step construction of one complex object) from Factory (choosing which class to instantiate).',
      ],
    },
  },
};
