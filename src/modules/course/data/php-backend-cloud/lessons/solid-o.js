export default {
  phase: 'Phase 2 · OOP & Design Patterns',
  title: 'SOLID · Open/Closed Principle',
  intro: 'The Open/Closed Principle states that software entities should be open for extension but closed for modification. Add new behaviour by adding new code — never by editing existing, tested code. The mechanism is abstraction: interfaces, abstract classes, and the Strategy/Decorator patterns are all implementations of OCP.',
  tags: ['OCP', 'Open for extension', 'Closed for modification', 'Strategy', 'Abstraction'],
  seniorExpectations: [
    'Explain OCP and why modifying existing code is risky (breaks existing tests, regressions)',
    'Identify OCP violations: if/switch blocks that grow with new types',
    'Apply OCP via Strategy pattern — replace switch with polymorphic classes',
    'Use abstract classes and interfaces to define stable extension points',
    'Know the trade-off: premature abstraction vs too-rigid code',
  ],
  body: `
<h2>The Principle</h2>
<p><em>"A class should be open for extension, closed for modification."</em> — Bertrand Meyer, 1988</p>
<p>Every time you modify existing code to add a feature, you risk introducing regressions. OCP says: design your extension points upfront so new features slot in without touching proven code.</p>

<h2>OCP Violation — Growing Switch</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Bad: adding a discount type requires editing this class</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class OrderProcessor {
    public function calculateDiscount(Order $order): float {
        return match ($order->discountType) {
            'percentage' => $order->total * 0.10,
            'fixed'      => 5.00,
            'vip'        => $order->total * 0.20,
            // Adding 'seasonal' requires editing this class
        };
    }
}
</code></pre>
</div>

<h2>OCP Applied — Strategy Pattern</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Good: new discount = new class, zero edits elsewhere</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">interface DiscountStrategy {
    public function calculate(float $total): float;
}

class PercentageDiscount implements DiscountStrategy {
    public function __construct(private float $rate) {}
    public function calculate(float $total): float { return $total * $this->rate; }
}

class FixedDiscount implements DiscountStrategy {
    public function __construct(private float $amount) {}
    public function calculate(float $total): float { return $this->amount; }
}

class VipDiscount implements DiscountStrategy {
    public function calculate(float $total): float { return $total * 0.20; }
}

// Adding SeasonalDiscount never touches OrderProcessor
class OrderProcessor {
    public function __construct(private DiscountStrategy $discount) {}

    public function calculateDiscount(float $total): float {
        return $this->discount->calculate($total);
    }
}

// Usage
$processor = new OrderProcessor(new PercentageDiscount(0.10));
$discount  = $processor->calculateDiscount(100.0); // 10.0
</code></pre>
</div>

<h2>OCP with Abstract Classes</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Template Method pattern</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">abstract class ReportGenerator {
    // Template method — fixed algorithm, extensible steps
    final public function generate(array $data): string {
        $filtered  = $this->filter($data);
        $formatted = $this->format($filtered);
        return $this->wrap($formatted);
    }

    abstract protected function filter(array $data): array;
    abstract protected function format(array $data): string;

    protected function wrap(string $content): string {
        return "<report>{$content}</report>";
    }
}

class CsvReportGenerator extends ReportGenerator {
    protected function filter(array $data): array { return array_filter($data); }
    protected function format(array $data): string { return implode(',', $data); }
}
</code></pre>
</div>

<div class="callout callout-warn">
  <div class="callout-title">Trade-off</div>
  <p>Don't abstract everything upfront — that's the "premature abstraction" trap. Introduce OCP-compliant structure at the <em>second</em> time you add a type (rule of three). The first time, a simple if is fine.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>OCP: add new behaviour by adding new code, not by modifying tested existing code</li>
    <li>The red flag: a switch/match block that grows every time a new type is added</li>
    <li>Fix with Strategy pattern: each type becomes a class implementing a common interface</li>
    <li>Template Method is another OCP pattern — fixed algorithm, variable steps in subclasses</li>
    <li>Don't over-engineer: abstract at the second variation, not the first</li>
  </ul>
</div>
`,
};
