export default {
  phase: 'Phase 2 · OOP & Design Patterns',
  title: 'SOLID · Liskov Substitution Principle',
  intro: 'LSP states that objects of a subtype must be substitutable for objects of the supertype without altering program correctness. A subclass that breaks preconditions, strengthens postconditions, or throws unexpected exceptions violates LSP — and breaks every piece of code that depends on the base type contract.',
  tags: ['LSP', 'Substitutability', 'Contract', 'Preconditions', 'Postconditions', 'Covariance'],
  seniorExpectations: [
    'Identify LSP violations: subclass throws exceptions the parent does not, or narrows accepted input',
    'Explain the classic Rectangle/Square violation and why inheritance was the wrong tool',
    'Distinguish covariant returns (allowed) from contravariant parameters (required for LSP)',
    'Apply the "is substitutable for" test instead of the naive "is a" test',
    'Fix LSP violations by redesigning the hierarchy or extracting an interface',
  ],
  segments: [
    { type: 'h2', text: 'The Principle' },
    { type: 'p', html: '<em>"If S is a subtype of T, then objects of type T may be replaced with objects of type S without altering correctness."</em> — Barbara Liskov, 1987' },
    { type: 'p', html: 'Test: can you swap any subclass into code written for the parent, with no surprises?' },

    { type: 'h2', text: 'Classic Violation: Rectangle / Square' },
    { type: 'code', lang: 'php', label: 'PHP — Violation', code: `class Rectangle {
    protected int $width;
    protected int $height;

    public function setWidth(int $w): void  { $this->width  = $w; }
    public function setHeight(int $h): void { $this->height = $h; }
    public function area(): int { return $this->width * $this->height; }
}

class Square extends Rectangle {
    // Square overrides both setters to keep width === height
    public function setWidth(int $w): void  { $this->width = $this->height = $w; }
    public function setHeight(int $h): void { $this->width = $this->height = $h; }
}

// Client code written for Rectangle
function testRectangle(Rectangle $r): void {
    $r->setWidth(5);
    $r->setHeight(4);
    assert($r->area() === 20); // FAILS for Square — area is 16, not 20
}` },

    { type: 'h2', text: 'Fix: Separate Interfaces' },
    { type: 'code', lang: 'php', label: 'PHP — LSP-compliant', code: `interface Shape {
    public function area(): int;
}

class Rectangle implements Shape {
    public function __construct(private int $width, private int $height) {}
    public function area(): int { return $this->width * $this->height; }
}

class Square implements Shape {
    public function __construct(private int $side) {}
    public function area(): int { return $this->side ** 2; }
}

// Both substitutable for Shape — no surprises
function printArea(Shape $s): void {
    echo $s->area();
}` },

    { type: 'h2', text: 'Precondition / Postcondition Rules' },
    { type: 'code', lang: 'php', label: 'PHP — Violation: subclass narrows accepted input', code: `class FileLogger {
    public function log(string $message): void { /* writes to file */ }
}

class StrictFileLogger extends FileLogger {
    public function log(string $message): void {
        if (strlen($message) > 100) {
            throw new \InvalidArgumentException('Message too long'); // NEW precondition — LSP violation
        }
        parent::log($message);
    }
}` },

    { type: 'callout', style: 'info', title: 'Covariance and Contravariance', html: '<strong>Return types</strong> can be covariant (narrowed in subclasses) — if parent returns <code>Animal</code>, child may return <code>Dog</code>. <strong>Parameter types</strong> should be contravariant (same or wider) — if parent accepts <code>Dog</code>, child should accept <code>Animal</code>. PHP 8.0+ enforces covariant returns and contravariant parameters.' },

    { type: 'qa', pairs: [
      {
        q: 'Q: How does LSP relate to the "is-a" relationship?',
        a: 'A Square mathematically "is a" Rectangle, but behaviourally it is not substitutable — which violates LSP. Use the <em>"is substitutable for"</em> test instead of "is a". Inheritance should model behavioural compatibility, not just conceptual classification.',
      },
    ]},

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'LSP: subclass must honour the parent\'s contract — no extra preconditions, no broken postconditions',
      'Square extends Rectangle is the textbook violation — Square can\'t honour setWidth/setHeight independently',
      'Fix violations by flattening the hierarchy and using shared interfaces instead of inheritance',
      'Subclass may not throw exceptions the parent doesn\'t declare',
      'Test: replace every parent usage with a subclass — should all existing tests still pass?',
    ]},
  ],
};
