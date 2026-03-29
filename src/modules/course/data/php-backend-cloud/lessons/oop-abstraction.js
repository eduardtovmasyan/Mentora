export default {
  phase: 'Phase 2 · OOP, SOLID & Design Patterns',
  title: 'Abstraction',
  intro: 'Abstraction is the art of hiding complexity behind a well-defined interface. PHP gives you two tools: abstract classes (partial implementations with enforced contracts) and interfaces (pure contracts with zero implementation). Choosing the right one — or combining both — separates junior code from senior architecture.',
  tags: ['abstract class', 'interface', 'template method', 'contracts', 'PHP 8'],
  seniorExpectations: [
    'Explain the difference between an abstract class and an interface without hesitation',
    'Know when to use each and justify the decision',
    'Implement the Template Method pattern using an abstract class',
    'Combine interfaces with abstract classes to build layered abstractions',
    'Identify when a fat abstract class should be split into an interface + concrete class',
  ],
  segments: [
    { type: 'h2', key: 'h_what_abstraction' },
    { type: 'p', key: 'p_what_abstraction' },

    { type: 'h2', key: 'h_abstract_classes' },
    { type: 'p', key: 'p_abstract_classes' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — Abstract Class (Template Method)',
      code: `<?php
abstract class ReportExporter
{
    // Concrete: controls the algorithm — same for all exporters
    final public function export(array $data): string
    {
        $validated = $this->validate($data);
        $formatted = $this->format($validated);   // ← varies per subclass
        $this->logExport(count($validated));
        return $formatted;
    }

    // Abstract: each subclass MUST implement its own serialisation
    abstract protected function format(array $data): string;

    private function validate(array $data): array
    {
        if (empty($data)) {
            throw new \\InvalidArgumentException('No data to export');
        }
        return array_values(array_filter($data));
    }

    private function logExport(int $count): void
    {
        error_log("Exported {$count} records at " . date('c'));
    }
}

class CsvExporter extends ReportExporter
{
    protected function format(array $data): string
    {
        $header = implode(',', array_keys(reset($data)));
        $rows   = array_map(
            fn($row) => implode(',', array_map('strval', $row)),
            $data
        );
        return $header . "\\n" . implode("\\n", $rows);
    }
}

class JsonExporter extends ReportExporter
{
    protected function format(array $data): string
    {
        return json_encode($data, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
    }
}

$data = [
    ['name' => 'Alice', 'score' => 98],
    ['name' => 'Bob',   'score' => 87],
];

echo (new CsvExporter())->export($data);
// name,score
// Alice,98
// Bob,87

echo (new JsonExporter())->export($data);
// [{"name":"Alice","score":98},...]`,
    },
    { type: 'callout', style: 'tip', key: 'callout_template_method' },

    { type: 'h2', key: 'h_interfaces' },
    { type: 'p', key: 'p_interfaces' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — Interfaces and Multiple Implementation',
      code: `<?php
interface Notifiable
{
    public function send(string $message, string $recipient): bool;
    public function supports(string $channel): bool;
}

interface Loggable
{
    public function log(string $level, string $message, array $context = []): void;
}

// A class can implement multiple interfaces — impossible with single abstract class inheritance
class SlackNotifier implements Notifiable, Loggable
{
    private array $logs = [];

    public function send(string $message, string $recipient): bool
    {
        // ... HTTP call to Slack API ...
        $this->log('info', "Sent to {$recipient}");
        return true;
    }

    public function supports(string $channel): bool
    {
        return $channel === 'slack';
    }

    public function log(string $level, string $message, array $context = []): void
    {
        $this->logs[] = compact('level', 'message', 'context');
    }
}

// Type-hint against the interface — NOT the concrete class
function notify(Notifiable $notifier, string $msg, string $to): void
{
    if (!$notifier->send($msg, $to)) {
        throw new \\RuntimeException("Notification failed");
    }
}

notify(new SlackNotifier(), 'Deploy complete', '#engineering');
// Works with any Notifiable — EmailNotifier, SmsNotifier, etc.`,
    },

    { type: 'h2', key: 'h_combining' },
    { type: 'p', key: 'p_combining' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — Interface + Abstract Class Combined',
      code: `<?php
// 1. Public contract — callers depend ONLY on this
interface PaymentGateway
{
    public function charge(int $amountCents, string $currency, string $token): string;
    public function refund(string $chargeId): bool;
}

// 2. Partial implementation — shared retry logic, currency validation
abstract class AbstractPaymentGateway implements PaymentGateway
{
    protected function validateCurrency(string $currency): void
    {
        if (!in_array($currency, ['USD', 'EUR', 'GBP'], true)) {
            throw new \\InvalidArgumentException("Unsupported currency: {$currency}");
        }
    }

    protected function withRetry(callable $operation, int $maxAttempts = 3): mixed
    {
        $attempt = 0;
        while (true) {
            try {
                return $operation();
            } catch (\\RuntimeException $e) {
                if (++$attempt >= $maxAttempts) throw $e;
                usleep(200_000 * $attempt); // exponential back-off
            }
        }
    }
}

// 3. Concrete class — only gateway-specific logic
class StripeGateway extends AbstractPaymentGateway
{
    public function __construct(private readonly string $apiKey) {}

    public function charge(int $amountCents, string $currency, string $token): string
    {
        $this->validateCurrency($currency);
        return $this->withRetry(fn() => $this->stripeCharge($amountCents, $currency, $token));
    }

    public function refund(string $chargeId): bool
    {
        return $this->withRetry(fn() => $this->stripeRefund($chargeId));
    }

    private function stripeCharge(int $cents, string $currency, string $token): string
    {
        // HTTP call to api.stripe.com
        return 'ch_' . bin2hex(random_bytes(8));
    }

    private function stripeRefund(string $chargeId): bool
    {
        // HTTP call to api.stripe.com
        return true;
    }
}

// Caller depends on PaymentGateway interface — zero coupling to Stripe
function processPayment(PaymentGateway $gateway, int $cents, string $currency): string
{
    return $gateway->charge($cents, $currency, 'tok_test');
}`,
    },

    { type: 'h2', key: 'h_violation' },
    { type: 'p', key: 'p_violation' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — Violation vs Correct',
      code: `<?php
// ✗ VIOLATION — no interface, no abstraction; callers hardcoded to EmailService
class EmailService
{
    public function send(string $to, string $body): void
    {
        mail($to, 'Message', $body);
    }
}

class WelcomeMailer extends EmailService
{
    public function sendWelcome(string $to): void
    {
        $this->send($to, 'Welcome to our platform!');
        // Cannot swap to SES, cannot mock in unit tests
    }
}

// ✓ CORRECT — interface defines contract; concrete class injected
interface Mailer
{
    public function send(string $to, string $subject, string $body): void;
}

class SmtpMailer implements Mailer
{
    public function send(string $to, string $subject, string $body): void
    {
        // SMTP via PHPMailer / Symfony Mailer
    }
}

class WelcomeService
{
    public function __construct(private readonly Mailer $mailer) {}

    public function welcome(string $to): void
    {
        $this->mailer->send($to, 'Welcome', 'Welcome to our platform!');
        // In tests: inject NullMailer — no real emails, no network
    }
}`,
    },

    { type: 'h2', key: 'h_decision_tree' },
    { type: 'p', key: 'p_decision_tree' },
    { type: 'ul', key: 'ul_decision_tree' },
    { type: 'callout', style: 'tip', key: 'callout_senior_rule' },

    { type: 'h2', key: 'h_interview' },
    { type: 'qa', key: 'qa' },

    { type: 'keypoints', key: 'keypoints' },
  ],
  bodyTexts: {
    h_what_abstraction: 'What Abstraction Really Means',
    p_what_abstraction: 'Abstraction is not just about the <code>abstract</code> keyword — it is the design act of exposing <em>what</em> something does while hiding <em>how</em> it does it. A <code>PaymentGateway</code> interface says "you can charge a card" without revealing HTTP clients, API tokens, or retry logic. Callers write to the abstraction; implementations can be swapped, mocked, or replaced entirely. The two primary PHP mechanisms are <strong>abstract classes</strong> and <strong>interfaces</strong>.',

    h_abstract_classes: 'Abstract Classes — Partial Blueprints',
    p_abstract_classes: 'An abstract class can have both concrete methods (shared behaviour) and abstract methods (enforced contracts that subclasses must implement). It cannot be instantiated directly. Use it when you have real shared logic that every subclass needs, alongside a contract that varies per subclass — this is the Template Method pattern.',

    callout_template_method: {
      title: 'Template Method Pattern',
      html: 'The <code>export()</code> method is the Template Method — it defines the algorithm skeleton (validate → format → log) in the base class. The sequence is enforced and cannot be changed by subclasses (note <code>final</code>). Only the <code>format</code> step varies. This is the canonical use case for an abstract class.',
    },

    h_interfaces: 'Interfaces — Pure Contracts',
    p_interfaces: 'An interface declares what methods a class must have with no implementation at all. PHP supports <strong>multiple interface implementation</strong> on a single class, which is impossible with abstract classes. Use interfaces when defining a capability that unrelated classes may share.',

    h_combining: 'Combining Interface + Abstract Class',
    p_combining: 'The best pattern for production code: define an <strong>interface</strong> for the public contract (what callers depend on) and an <strong>abstract class</strong> as an optional partial implementation (shared helpers). Callers type-hint against the interface; concrete classes extend the abstract class.',

    h_violation: 'Violation: Concrete Class Used as a Base',
    p_violation: 'A common anti-pattern is using a concrete, instantiable class as a base class with no abstract methods and no interface. This is not abstraction — it is inheritance for code reuse, which creates hidden coupling and makes testing difficult.',

    h_decision_tree: 'Decision Tree: Interface vs Abstract Class',
    p_decision_tree: 'The choice is a design decision, not a preference:',
    ul_decision_tree: [
      '<strong>Use an interface</strong> when defining a <em>capability</em> shared by unrelated classes, or when you need multiple implementation on one class.',
      '<strong>Use an abstract class</strong> when you have real shared implementation (Template Method, protected helpers, shared constructor logic) that every subclass inherits.',
      '<strong>Combine both</strong>: interface for the public contract, abstract class as an optional convenience base, concrete classes extending the abstract class.',
      '<strong>Never</strong> type-hint against a concrete class when an interface is available.',
    ],

    callout_senior_rule: {
      title: 'Senior Rule',
      html: 'If your method signature reads <code>StripeGateway $gw</code>, you have failed to abstract. It must read <code>PaymentGateway $gw</code>. Callers should need zero knowledge of the implementation behind a contract.',
    },

    h_interview: 'Interview Questions',

    qa: {
      pairs: [
        {
          q: 'What is the key difference between an abstract class and an interface in PHP?',
          a: 'An <strong>interface</strong> is a pure contract — no state, no implementation. A class can implement multiple interfaces. An <strong>abstract class</strong> can have concrete methods, protected state, and constructor logic, but a class can only extend one. Use interfaces when defining a shared capability across unrelated classes. Use abstract classes when real shared implementation exists. Production code often combines both: an interface for callers, an abstract class providing a partial implementation, concrete classes filling in the specifics.',
        },
        {
          q: 'What is the Template Method pattern and when should you use it?',
          a: 'Template Method defines the skeleton of an algorithm in an abstract base class. Invariant steps are implemented concretely; variant steps are declared abstract and implemented by subclasses. Use it when multiple classes share the same algorithm structure but differ in specific steps — report exporters, data importers, order processors. Mark the template method <code>final</code> so subclasses cannot reorder the algorithm. Avoid it when the number of abstract steps grows large — that signals the class is trying to do too much and should be split.',
        },
        {
          q: 'Can an abstract class implement an interface?',
          a: 'Yes — and this is the recommended pattern. An abstract class can <code>implement</code> an interface without providing implementations for all interface methods; it can leave some as <code>abstract</code> for concrete subclasses to fulfill. This allows you to share partial implementation (via the abstract class) while still programming to the interface (callers depend on the interface). The concrete class then extends the abstract class and PHP enforces that all interface methods are finally implemented.',
        },
      ],
    },

    keypoints: {
      title: 'Key Points to Remember',
      items: [
        'Interface = pure contract, no implementation, multiple can be implemented per class',
        'Abstract class = partial implementation + enforced contract, only one per class hierarchy',
        'Always type-hint against interfaces or abstract types — never concrete classes',
        'Template Method: algorithm skeleton in abstract class, variant steps declared abstract, mark the template <code>final</code>',
        'Best pattern: interface for the public contract, abstract class for shared implementation, concrete class for specifics',
        'Abstraction goal: callers need zero knowledge of implementation details behind the contract',
        'A concrete base class with no abstract methods is not abstraction — it is inheritance for code reuse',
      ],
    },
  },
};
