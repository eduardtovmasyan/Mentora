export default {
  phase: 'Phase 2 · OOP & Design Patterns',
  title: 'OOP · Polymorphism',
  intro: 'Polymorphism — "many forms" — means one interface, many implementations. In PHP it appears as method overriding (runtime dispatch), interface polymorphism (type-hint against abstractions), and late static binding. It is the engine behind the Open/Closed Principle, Strategy, and Command patterns.',
  tags: ['Method overriding', 'Interface polymorphism', 'Late static binding', 'Covariant returns', 'LSP'],
  seniorExpectations: [
    'Distinguish runtime (dynamic dispatch) from compile-time (overloading) polymorphism',
    'Type-hint against interfaces instead of concrete classes — program to abstractions',
    'Explain late static binding: static:: vs self:: and when each is appropriate',
    'Replace if/switch type-dispatch chains with polymorphic class hierarchies',
    'Understand covariant return types (PHP 7.4+) and the static return type (PHP 8.0)',
  ],
  segments: [
    { type: 'h2', text: 'Runtime Polymorphism via Overriding' },
    { type: 'code', lang: 'php', label: 'PHP', code: `abstract class Notification {
    abstract public function send(string $message): void;
}

class EmailNotification extends Notification {
    public function send(string $message): void {
        echo "Email: {$message}";
    }
}

class SlackNotification extends Notification {
    public function send(string $message): void {
        echo "Slack: {$message}";
    }
}

// Polymorphic dispatch — no if/switch needed
function notify(Notification $n, string $msg): void {
    $n->send($msg); // PHP resolves to the correct subclass at runtime
}` },

    { type: 'h2', text: 'Interface Polymorphism' },
    { type: 'code', lang: 'php', label: 'PHP', code: `interface PaymentGateway {
    public function charge(float $amount): string;
}

class StripeGateway implements PaymentGateway {
    public function charge(float $amount): string { return "Stripe: {$amount}"; }
}

class PayPalGateway implements PaymentGateway {
    public function charge(float $amount): string { return "PayPal: {$amount}"; }
}

// Adding a new gateway never touches this code — OCP satisfied
function processPayment(PaymentGateway $gateway, float $amount): string {
    return $gateway->charge($amount);
}` },

    { type: 'h2', text: 'Late Static Binding: static:: vs self::' },
    { type: 'code', lang: 'php', label: 'PHP', code: `class Base {
    public static function create(): static { // PHP 8.0 static return type
        return new static(); // late static binding — resolves at call site
    }

    public static function describe(): string {
        return static::class; // the actual called class, not 'Base'
        // self::class would always return 'Base'
    }
}

class Child extends Base {}

$c = Child::create();   // Child instance, not Base
echo Child::describe(); // "Child"` },

    { type: 'h2', text: 'Replacing switch with Polymorphism' },
    { type: 'code', lang: 'php', label: 'PHP — Before', code: `// Every new type requires editing this function
function renderWidget(string $type, array $data): string {
    return match ($type) {
        'chart' => renderChart($data),
        'table' => renderTable($data),
        'map'   => renderMap($data),
        default => throw new \\InvalidArgumentException("Unknown widget: $type"),
    };
}` },
    { type: 'code', lang: 'php', label: 'PHP — After (open for extension)', code: `interface Widget {
    public function render(array $data): string;
}

class ChartWidget implements Widget {
    public function render(array $data): string { /* ... */ }
}

class TableWidget implements Widget {
    public function render(array $data): string { /* ... */ }
}

function renderWidget(Widget $widget, array $data): string {
    return $widget->render($data); // never needs to change
}` },

    { type: 'qa', pairs: [
      {
        q: 'Q: What is covariant return type in PHP?',
        a: 'PHP 7.4+ allows a child method to return a narrower type than the parent declared. If parent declares <code>: Animal</code>, child can return <code>: Dog</code>. The <code>static</code> return type (PHP 8.0) is the most powerful form — it resolves to the actual class at the call site, enabling fluent builder chains across inheritance hierarchies.',
      },
    ]},

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Polymorphism eliminates if/switch type-dispatch — add behaviour by adding a class (OCP)',
      'Type-hint against interfaces, not concrete classes — enables swapping implementations (DIP)',
      '<code>static::</code> resolves at runtime to the actual called class; <code>self::</code> always resolves to the defining class',
      'Covariant returns (PHP 7.4+): child can narrow the return type; <code>static</code> return type (PHP 8.0) for fluent APIs',
      'Polymorphism + interfaces + dependency injection = loosely coupled, testable code',
    ]},
  ],
};
