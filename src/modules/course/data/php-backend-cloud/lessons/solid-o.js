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
  segments: [
    { type: 'h2', text: 'The Principle' },
    { type: 'p', html: '<em>"A class should be open for extension, closed for modification."</em> — Bertrand Meyer, 1988' },
    { type: 'p', html: 'Every time you modify existing code to add a feature, you risk introducing regressions. OCP says: design your extension points upfront so new features slot in without touching proven code.' },

    { type: 'h2', text: 'OCP Violation — Growing Switch' },
    { type: 'code', lang: 'php', label: 'PHP — Bad: adding a discount type requires editing this class', code: `class OrderProcessor {
    public function calculateDiscount(Order $order): float {
        return match ($order->discountType) {
            'percentage' => $order->total * 0.10,
            'fixed'      => 5.00,
            'vip'        => $order->total * 0.20,
            // Adding 'seasonal' requires editing this class
        };
    }
}` },

    { type: 'h2', text: 'OCP Applied — Strategy Pattern' },
    { type: 'code', lang: 'php', label: 'PHP — Good: new discount = new class, zero edits elsewhere', code: `interface DiscountStrategy {
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
$discount  = $processor->calculateDiscount(100.0); // 10.0` },

    { type: 'h2', text: 'OCP with Abstract Classes' },
    { type: 'code', lang: 'php', label: 'PHP — Template Method pattern', code: `abstract class ReportGenerator {
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
}` },

    { type: 'callout', style: 'warn', title: 'Trade-off', html: 'Don\'t abstract everything upfront — that\'s the "premature abstraction" trap. Introduce OCP-compliant structure at the <em>second</em> time you add a type (rule of three). The first time, a simple if is fine.' },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'OCP: add new behaviour by adding new code, not by modifying tested existing code',
      'The red flag: a switch/match block that grows every time a new type is added',
      'Fix with Strategy pattern: each type becomes a class implementing a common interface',
      'Template Method is another OCP pattern — fixed algorithm, variable steps in subclasses',
      'Don\'t over-engineer: abstract at the second variation, not the first',
    ]},
  ],
};
