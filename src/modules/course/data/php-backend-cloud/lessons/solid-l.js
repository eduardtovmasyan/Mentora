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
  body: `
<h2>The Principle</h2>
<p><em>"If S is a subtype of T, then objects of type T may be replaced with objects of type S without altering correctness."</em> — Barbara Liskov, 1987</p>
<p>Test: can you swap any subclass into code written for the parent, with no surprises?</p>

<h2>Classic Violation: Rectangle / Square</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Violation</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class Rectangle {
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
}
</code></pre>
</div>

<h2>Fix: Separate Interfaces</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — LSP-compliant</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">interface Shape {
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
}
</code></pre>
</div>

<h2>Precondition / Postcondition Rules</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Violation: subclass narrows accepted input</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class FileLogger {
    public function log(string $message): void { /* writes to file */ }
}

class StrictFileLogger extends FileLogger {
    public function log(string $message): void {
        if (strlen($message) > 100) {
            throw new \InvalidArgumentException('Message too long'); // NEW precondition — LSP violation
        }
        parent::log($message);
    }
}
</code></pre>
</div>

<div class="callout callout-info">
  <div class="callout-title">Covariance and Contravariance</div>
  <p><strong>Return types</strong> can be covariant (narrowed in subclasses) — if parent returns <code>Animal</code>, child may return <code>Dog</code>. <strong>Parameter types</strong> should be contravariant (same or wider) — if parent accepts <code>Dog</code>, child should accept <code>Animal</code>. PHP 8.0+ enforces covariant returns and contravariant parameters.</p>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: How does LSP relate to the "is-a" relationship?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>A Square mathematically "is a" Rectangle, but behaviourally it is not substitutable — which violates LSP. Use the <em>"is substitutable for"</em> test instead of "is a". Inheritance should model behavioural compatibility, not just conceptual classification.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>LSP: subclass must honour the parent's contract — no extra preconditions, no broken postconditions</li>
    <li>Square extends Rectangle is the textbook violation — Square can't honour setWidth/setHeight independently</li>
    <li>Fix violations by flattening the hierarchy and using shared interfaces instead of inheritance</li>
    <li>Subclass may not throw exceptions the parent doesn't declare</li>
    <li>Test: replace every parent usage with a subclass — should all existing tests still pass?</li>
  </ul>
</div>
`,
};
