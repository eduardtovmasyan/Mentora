export default {
  phase: 'Phase 2 · OOP & Design Patterns',
  title: 'Pattern · Factory Method',
  intro: 'The Factory Method pattern defines an interface for creating an object, but lets subclasses decide which class to instantiate. It decouples object creation from usage, enabling extension without modification. The Abstract Factory extends this to families of related objects. Together they are the most commonly used creational patterns in PHP.',
  tags: ['Creational', 'Factory Method', 'Abstract Factory', 'Static factory', 'Product interface'],
  seniorExpectations: [
    'Implement Factory Method: creator with abstract factory method, concrete creators',
    'Distinguish Factory Method (inheritance) from Abstract Factory (composition)',
    'Use static factory methods (named constructors) for expressive object creation',
    'Apply Factory in Laravel: service providers, model factories, channel factories',
    'Know when a factory is unnecessary — direct instantiation is often fine',
  ],
  body: `
<h2>Factory Method Pattern</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Notification factory</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Product interface
interface Notification {
    public function send(string $to, string $message): void;
}

// Concrete products
class EmailNotification implements Notification {
    public function send(string $to, string $message): void {
        mail($to, 'Notification', $message);
    }
}

class SmsNotification implements Notification {
    public function send(string $to, string $message): void {
        // call Twilio API
    }
}

class SlackNotification implements Notification {
    public function send(string $to, string $message): void {
        // call Slack API
    }
}

// Creator (factory method pattern)
abstract class NotificationSender {
    abstract protected function createNotification(): Notification;

    // Template method — uses the factory method
    public function notify(string $to, string $message): void {
        $notification = $this->createNotification();
        $notification->send($to, $message);
    }
}

class EmailSender extends NotificationSender {
    protected function createNotification(): Notification {
        return new EmailNotification();
    }
}

class SmsSender extends NotificationSender {
    protected function createNotification(): Notification {
        return new SmsNotification();
    }
}
</code></pre>
</div>

<h2>Simple Factory (Registry Pattern)</h2>
<p>Most "factories" in practice are simple static registry factories — not the formal GoF pattern, but more pragmatic:</p>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Static factory / registry</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class NotificationFactory {
    public static function create(string $channel): Notification {
        return match ($channel) {
            'email' => new EmailNotification(),
            'sms'   => new SmsNotification(),
            'slack' => new SlackNotification(),
            default => throw new \InvalidArgumentException("Unknown channel: {$channel}"),
        };
    }
}

// Usage
$notification = NotificationFactory::create($user->preferred_channel);
$notification->send($user->email, 'Your order shipped');
</code></pre>
</div>

<h2>Named Constructors (Static Factory Methods)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Expressive object creation</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class Money {
    private function __construct(
        private readonly int    $amount,   // in cents
        private readonly string $currency,
    ) {}

    // Named constructors are more expressive than new Money(...)
    public static function usd(int $cents): self {
        return new self($cents, 'USD');
    }

    public static function eur(int $cents): self {
        return new self($cents, 'EUR');
    }

    public static function fromFloat(float $amount, string $currency): self {
        return new self((int) round($amount * 100), $currency);
    }

    public function add(self $other): self {
        if ($this->currency !== $other->currency) {
            throw new \DomainException("Cannot add different currencies");
        }
        return new self($this->amount + $other->amount, $this->currency);
    }
}

// Clear intent vs new Money(999, 'USD')
$price = Money::usd(999);         // $9.99
$tax   = Money::fromFloat(0.80, 'USD');
$total = $price->add($tax);
</code></pre>
</div>

<h2>Abstract Factory — Families of Objects</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — UI component factory</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">interface Button { public function render(): string; }
interface Input  { public function render(): string; }

// Abstract Factory: creates a consistent family
interface UIFactory {
    public function createButton(string $label): Button;
    public function createInput(string $name): Input;
}

class BootstrapFactory implements UIFactory {
    public function createButton(string $label): Button {
        return new BootstrapButton($label); // renders with Bootstrap classes
    }
    public function createInput(string $name): Input {
        return new BootstrapInput($name);
    }
}

class TailwindFactory implements UIFactory {
    public function createButton(string $label): Button {
        return new TailwindButton($label);
    }
    public function createInput(string $name): Input {
        return new TailwindInput($name);
    }
}

// Swap entire UI framework by swapping the factory
function buildForm(UIFactory $ui): string {
    return $ui->createInput('email')->render()
         . $ui->createButton('Submit')->render();
}
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Factory Method: subclasses decide which concrete class to instantiate — extends via inheritance</li>
    <li>Abstract Factory: interface for creating families of related objects — varies via composition</li>
    <li>Static factory (named constructor): most practical pattern — expressive, testable, no subclassing</li>
    <li>Laravel uses factories everywhere: model factories (testing), channel factories (notifications), driver factories (cache/queue/storage)</li>
    <li>Don't over-engineer: if you only ever create one type, a factory adds complexity for no gain</li>
  </ul>
</div>
`,
};
