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
  segments: [
    { type: 'h2', text: 'What Is Encapsulation?' },
    { type: 'p', html: 'Encapsulation means hiding internal state and requiring all interaction to go through a defined public interface. You expose <em>what</em> an object can do, but hide <em>how</em> it stores and processes data. This gives you two critical benefits:' },
    { type: 'ul', items: [
      '<strong>Control:</strong> All writes are validated. Invalid state becomes impossible.',
      '<strong>Freedom to refactor:</strong> Change the internals without breaking callers.',
    ]},

    { type: 'h2', text: 'Access Modifiers' },
    { type: 'code', lang: 'php', label: 'PHP — Access Modifiers', code: `&lt;?php
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
        if ($amount <= 0) throw new \\InvalidArgumentException('Deposit must be positive');
        $this->balance += $amount;
        $this->record('deposit', $amount);
    }

    public function withdraw(float $amount, string $pin): void
    {
        if (!password_verify($pin, $this->pin)) throw new \\RuntimeException('Bad PIN');
        if ($amount > $this->balance)           throw new \\RuntimeException('Insufficient funds');
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
// $acc->pin = 'hacked';      // ✗ Cannot access private property` },

    { type: 'h2', text: 'Why Public Properties Are Dangerous' },
    { type: 'code', lang: 'php', label: 'PHP — Public vs Encapsulated', code: `&lt;?php
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
        if ($age < 0 || $age > 150) throw new \\InvalidArgumentException("Invalid age: {$age}");
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
// $user->id = 2; // ✗ Fatal: Cannot modify readonly property` },

    { type: 'h2', text: 'Value Object — Perfect Encapsulation' },
    { type: 'p', html: 'A Value Object is immutable, validated at creation, and equal by value (not identity). Use for domain concepts: Money, Email, PhoneNumber, Coordinates.' },
    { type: 'code', lang: 'php', label: 'PHP — Money Value Object', code: `&lt;?php
final class Money
{
    private function __construct(
        private readonly int    $cents,   // never float — float arithmetic is imprecise
        private readonly string $currency,
    ) {}

    public static function of(int $cents, string $currency): self
    {
        if ($cents < 0) throw new \\InvalidArgumentException('Money cannot be negative');
        if (!in_array($currency, ['USD','EUR','AMD','GBP'], true)) {
            throw new \\InvalidArgumentException("Unknown currency: {$currency}");
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
        return $this->cents === $other->cents &amp;&amp; $this->currency === $other->currency;
    }

    public function format(): string { return number_format($this->cents / 100, 2) . ' ' . $this->currency; }

    private function assertSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new \\RuntimeException("Currency mismatch");
        }
    }
}

$price = Money::of(1999, 'USD');  // $19.99
$tax   = Money::of(160,  'USD');  // $1.60
$total = $price->add($tax);        // new Money — $price unchanged
echo $total->format();             // 21.59 USD` },

    { type: 'h2', text: 'Interview Questions' },
    { type: 'qa', pairs: [
      {
        q: 'Q: What is the difference between private and protected?',
        a: '<code>private</code>: accessible only in the declaring class. Not in child classes. <code>protected</code>: accessible in the declaring class AND all subclasses. Default to <code>private</code> — only widen to <code>protected</code> when a subclass genuinely needs access. Exposing too much to subclasses creates hidden coupling that makes refactoring painful.',
      },
      {
        q: 'Q: Why store money as integer cents, never float?',
        a: 'Floating-point numbers cannot represent most decimal fractions exactly in binary. <code>0.1 + 0.2</code> gives <code>0.30000000000000004</code>. For financial calculations, even tiny rounding errors compound into real discrepancies. Store as integer cents (1999 = $19.99). All arithmetic is exact integer arithmetic. Divide by 100 only at the display layer.',
      },
    ]},

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'private: this class only. protected: this class + subclasses. public: anywhere',
      'Default to private — only widen when there is a concrete reason',
      'PHP 8.1 readonly: set once in constructor, immutable forever after',
      'Constructor promotion: add visibility modifier to constructor param → auto-creates property',
      'Value Objects: immutable, validated at creation, equality by value not identity',
      'Store money as integer cents. Divide by 100 only at display time.',
    ]},
  ],
};
