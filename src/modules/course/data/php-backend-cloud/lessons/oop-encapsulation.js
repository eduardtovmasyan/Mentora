export default {
  phase: 'Phase 2 · OOP, SOLID & Design Patterns',
  title: 'Encapsulation',
  intro: 'Encapsulation bundles data and the methods that operate on it into a single unit, hiding internal state from the outside. It is the first pillar of OOP and the one that makes validation, immutability, and testability possible.',
  tags: ['private / protected / public', 'readonly', 'Value Objects', 'Data hiding', 'PHP 8.1'],
  seniorExpectations: [
    'Explain all 3 access modifiers and default to private',
    'Know why public properties are dangerous',
    'Use readonly for immutable DTOs and value objects',
    'Design a fully encapsulated Value Object (Money, Email)',
    'Explain the difference between a getter and a query method',
  ],
  body: `
<h2>What Is Encapsulation?</h2>
<p>Encapsulation means hiding internal state and requiring all interaction to go through a defined public interface. You expose <em>what</em> an object can do, but hide <em>how</em> it stores and processes data. This gives you two critical benefits:</p>
<ul>
  <li><strong>Control:</strong> All writes are validated. Invalid state becomes impossible.</li>
  <li><strong>Freedom to refactor:</strong> Change the internals without breaking callers.</li>
</ul>

<h2>Access Modifiers</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Access Modifiers</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
class BankAccount
{
    public  string $owner;      // accessible from anywhere
    protected float $balance;   // this class + subclasses
    private string $pin;        // ONLY this class
    private array  $log = [];

    public function __construct(string $owner, float $balance, string $pin)
    {
        $this->owner   = $owner;
        $this->balance = $balance;
        $this->pin     = password_hash($pin, PASSWORD_BCRYPT);
    }

    public function getBalance(): float { return $this->balance; }

    public function deposit(float $amount): void
    {
        if ($amount <= 0) throw new \InvalidArgumentException('Deposit must be positive');
        $this->balance += $amount;
        $this->record('deposit', $amount);
    }

    public function withdraw(float $amount, string $pin): void
    {
        if (!password_verify($pin, $this->pin)) throw new \RuntimeException('Bad PIN');
        if ($amount > $this->balance)           throw new \RuntimeException('Insufficient funds');
        $this->balance -= $amount;
        $this->record('withdrawal', $amount);
    }

    private function record(string $type, float $amount): void
    {
        $this->log[] = compact('type', 'amount') + ['at' => date('c')];
    }
}

$acc = new BankAccount('Ali', 1000.0, '1234');
echo $acc->getBalance();      // ✓ 1000
$acc->deposit(500);           // ✓ validated
// $acc->balance = 999999;    // ✗ Cannot access protected property
// $acc->pin = 'hacked';      // ✗ Cannot access private property
</code></pre>
</div>

<h2>Why Public Properties Are Dangerous</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Public vs Encapsulated</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// ✗ No control — anyone can set invalid state
class BadUser { public int $age; }
$u = new BadUser();
$u->age = -999; // PHP is fine with this. Business logic is not.

// ✓ Private with validation
class GoodUser
{
    private int $age;
    public function setAge(int $age): void
    {
        if ($age < 0 || $age > 150) throw new \InvalidArgumentException("Invalid age: {$age}");
        $this->age = $age;
    }
    public function getAge(): int { return $this->age; }
}

// ✓ PHP 8.1 readonly — set once in constructor, immutable forever
class ImmutableUser
{
    public function __construct(
        public readonly int    $id,
        public readonly string $email,
        public readonly string $name,
    ) {}
}
$user = new ImmutableUser(1, 'ali@example.com', 'Ali');
// $user->id = 2; // ✗ Fatal: Cannot modify readonly property
</code></pre>
</div>

<h2>Value Object — Perfect Encapsulation</h2>
<p>A Value Object is immutable, validated at creation, and equal by value (not identity). Use for domain concepts: Money, Email, PhoneNumber, Coordinates.</p>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Money Value Object</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
final class Money
{
    private function __construct(
        private readonly int    $cents,   // never float — float arithmetic is imprecise
        private readonly string $currency,
    ) {}

    public static function of(int $cents, string $currency): self
    {
        if ($cents < 0) throw new \InvalidArgumentException('Money cannot be negative');
        if (!in_array($currency, ['USD','EUR','AMD','GBP'], true)) {
            throw new \InvalidArgumentException("Unknown currency: {$currency}");
        }
        return new self($cents, $currency);
    }

    // Operations return NEW instances — self is never mutated
    public function add(self $other): self
    {
        $this->assertSameCurrency($other);
        return new self($this->cents + $other->cents, $this->currency);
    }

    public function multiply(float $factor): self
    {
        return new self((int) round($this->cents * $factor), $this->currency);
    }

    public function equals(self $other): bool
    {
        return $this->cents === $other->cents && $this->currency === $other->currency;
    }

    public function format(): string { return number_format($this->cents / 100, 2) . ' ' . $this->currency; }

    private function assertSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new \RuntimeException("Currency mismatch");
        }
    }
}

$price = Money::of(1999, 'USD');  // $19.99
$tax   = Money::of(160,  'USD');  // $1.60
$total = $price->add($tax);        // new Money — $price unchanged
echo $total->format();             // 21.59 USD
</code></pre>
</div>

<h2>Interview Questions</h2>
<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)"><span class="qa-q-text">Q: What is the difference between private and protected?</span><span class="qa-arrow">▼</span></div>
  <div class="qa-a"><p><code>private</code>: accessible only in the declaring class. Not in child classes. <code>protected</code>: accessible in the declaring class AND all subclasses. Default to <code>private</code> — only widen to <code>protected</code> when a subclass genuinely needs access. Exposing too much to subclasses creates hidden coupling that makes refactoring painful.</p></div>
</div>
<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)"><span class="qa-q-text">Q: Why store money as integer cents, never float?</span><span class="qa-arrow">▼</span></div>
  <div class="qa-a"><p>Floating-point numbers cannot represent most decimal fractions exactly in binary. <code>0.1 + 0.2</code> gives <code>0.30000000000000004</code>. For financial calculations, even tiny rounding errors compound into real discrepancies. Store as integer cents (1999 = $19.99). All arithmetic is exact integer arithmetic. Divide by 100 only at the display layer.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>private: this class only. protected: this class + subclasses. public: anywhere</li>
    <li>Default to private — only widen when there is a concrete reason</li>
    <li>PHP 8.1 readonly: set once in constructor, immutable forever after</li>
    <li>Constructor promotion: add visibility modifier to constructor param → auto-creates property</li>
    <li>Value Objects: immutable, validated at creation, equality by value not identity</li>
    <li>Store money as integer cents. Divide by 100 only at display time.</li>
  </ul>
</div>
`,
};
