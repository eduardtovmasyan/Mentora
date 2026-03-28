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
  body: `
<h2>Runtime Polymorphism via Overriding</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">abstract class Notification {
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
}
</code></pre>
</div>

<h2>Interface Polymorphism</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">interface PaymentGateway {
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
}
</code></pre>
</div>

<h2>Late Static Binding: static:: vs self::</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class Base {
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
echo Child::describe(); // "Child"
</code></pre>
</div>

<h2>Replacing switch with Polymorphism</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Before</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Every new type requires editing this function
function renderWidget(string $type, array $data): string {
    return match ($type) {
        'chart' => renderChart($data),
        'table' => renderTable($data),
        'map'   => renderMap($data),
        default => throw new \InvalidArgumentException("Unknown widget: $type"),
    };
}
</code></pre>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — After (open for extension)</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">interface Widget {
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
}
</code></pre>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: What is covariant return type in PHP?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>PHP 7.4+ allows a child method to return a narrower type than the parent declared. If parent declares <code>: Animal</code>, child can return <code>: Dog</code>. The <code>static</code> return type (PHP 8.0) is the most powerful form — it resolves to the actual class at the call site, enabling fluent builder chains across inheritance hierarchies.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Polymorphism eliminates if/switch type-dispatch — add behaviour by adding a class (OCP)</li>
    <li>Type-hint against interfaces, not concrete classes — enables swapping implementations (DIP)</li>
    <li><code>static::</code> resolves at runtime to the actual called class; <code>self::</code> always resolves to the defining class</li>
    <li>Covariant returns (PHP 7.4+): child can narrow the return type; <code>static</code> return type (PHP 8.0) for fluent APIs</li>
    <li>Polymorphism + interfaces + dependency injection = loosely coupled, testable code</li>
  </ul>
</div>
`,
};
