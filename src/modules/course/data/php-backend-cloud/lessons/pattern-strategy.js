export default {
  phase: 'Phase 2 · OOP & Design Patterns',
  title: 'Pattern · Strategy',
  intro: 'The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. The client selects a strategy at runtime without knowing the implementation details. It is the primary tool for eliminating switch statements and satisfying the Open/Closed Principle.',
  tags: ['Behavioral', 'Algorithm family', 'Runtime selection', 'OCP', 'Interchangeable'],
  seniorExpectations: [
    'Implement Strategy with a common interface and multiple concrete implementations',
    'Inject the strategy via constructor (not selected inside the class)',
    'Distinguish Strategy from Template Method — Strategy uses composition, Template uses inheritance',
    'Apply Strategy for payment processors, sorting algorithms, pricing rules',
    'Combine with a factory/registry to select strategies by string key',
  ],
  body: `
<h2>Classic Strategy Implementation</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Shipping Cost Calculator</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">interface ShippingStrategy {
    public function calculate(float $weight, string $destination): float;
}

class StandardShipping implements ShippingStrategy {
    public function calculate(float $weight, string $destination): float {
        return $weight * 2.5;
    }
}

class ExpressShipping implements ShippingStrategy {
    public function calculate(float $weight, string $destination): float {
        return $weight * 5.0 + 10.0;
    }
}

class FreeShipping implements ShippingStrategy {
    public function calculate(float $weight, string $destination): float {
        return 0.0;
    }
}

class ShoppingCart {
    public function __construct(private ShippingStrategy $shipping) {}

    public function total(array $items): float {
        $subtotal = array_sum(array_column($items, 'price'));
        $weight   = array_sum(array_column($items, 'weight'));
        return $subtotal + $this->shipping->calculate($weight, 'US');
    }
}

// Runtime selection
$cart = new ShoppingCart(new ExpressShipping());
echo $cart->total($items); // uses express shipping

// Swap strategy without changing ShoppingCart
$cart = new ShoppingCart(new FreeShipping());
</code></pre>
</div>

<h2>Strategy Registry (Factory + Strategy)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Select by string key</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class ShippingStrategyRegistry {
    private array $strategies = [];

    public function register(string $key, ShippingStrategy $strategy): void {
        $this->strategies[$key] = $strategy;
    }

    public function get(string $key): ShippingStrategy {
        return $this->strategies[$key]
            ?? throw new \InvalidArgumentException("Unknown strategy: {$key}");
    }
}

$registry = new ShippingStrategyRegistry();
$registry->register('standard', new StandardShipping());
$registry->register('express',  new ExpressShipping());
$registry->register('free',     new FreeShipping());

$method = $request->get('shipping'); // from form: 'express'
$cart   = new ShoppingCart($registry->get($method));
</code></pre>
</div>

<h2>Strategy vs Template Method</h2>
<table class="ctable">
  <thead><tr><th>Aspect</th><th>Strategy</th><th>Template Method</th></tr></thead>
  <tbody>
    <tr><td>Mechanism</td><td>Composition (inject object)</td><td>Inheritance (extend class)</td></tr>
    <tr><td>Swap at runtime</td><td>Yes</td><td>No (class fixed at compile)</td></tr>
    <tr><td>Relationship</td><td>Has-a</td><td>Is-a</td></tr>
    <tr><td>OCP compliance</td><td>Strong</td><td>Moderate</td></tr>
  </tbody>
</table>

<div class="callout callout-tip">
  <div class="callout-title">Laravel Usage</div>
  <p>Laravel's mail drivers (SMTP, Mailgun, SES), queue drivers, and filesystem disks are all Strategy pattern. The <code>config/mail.php</code> key selects which strategy the container injects — your code always types against the <code>Mailer</code> contract.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Strategy: extract each variant into a class implementing a common interface, inject via constructor</li>
    <li>The context class (ShoppingCart) never knows which strategy it holds — just calls the interface</li>
    <li>Use a registry or factory to map string keys to strategies for runtime selection</li>
    <li>Strategy uses composition; Template Method uses inheritance — prefer composition for flexibility</li>
    <li>Real-world: payment gateways, shipping calculators, authentication methods, export formats</li>
  </ul>
</div>
`,
};
