export default {
  phase: 'Phase 2 · OOP, SOLID & Design Patterns',
  title: 'Inheritance & Composition',
  intro: 'Inheritance is the most misused feature in object-oriented programming. Senior engineers default to composition — assembling behaviour from small, focused collaborators — and reserve inheritance for the rare cases where a genuine "is-a" relationship exists. Understanding the fragile base class problem and knowing how to refactor away from deep hierarchies is a defining skill at the senior level.',
  tags: ['inheritance', 'composition', 'final', 'parent::', 'fragile base class', 'PHP 8'],
  seniorExpectations: [
    'Articulate why "prefer composition over inheritance" is the default rule',
    'Identify the fragile base class problem and explain its consequences',
    'Know when inheritance IS the right choice and why',
    'Use final classes and final methods deliberately to protect invariants',
    'Refactor a deep inheritance hierarchy into composition without breaking callers',
  ],
  body: `
<h2>The Fundamental Rule: Prefer Composition</h2>
<p>Inheritance creates a <strong>compile-time coupling</strong> between parent and child that cannot be broken at runtime. Every change to a parent class is a potential breaking change for all subclasses — this is called the <strong>fragile base class problem</strong>. Composition — holding references to collaborating objects — keeps classes loosely coupled, independently testable, and freely interchangeable. Default to composition; use inheritance only when a true "is-a" relationship exists that will not change.</p>

<h2>Inheritance: The Right Use Case</h2>
<p>Inheritance is correct when: (1) the subclass IS the parent type in every context, (2) the relationship is permanent and non-situational, and (3) shared behaviour belongs in the parent. Classic examples: exception hierarchies, abstract base classes enforcing a template method, Eloquent model extending a base model.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Correct Inheritance: Exception Hierarchy</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// ✓ Correct use of inheritance — exception hierarchy is a textbook is-a relationship
class AppException extends \RuntimeException {}

class ValidationException extends AppException
{
    private array $errors;

    public function __construct(array $errors, string $message = '')
    {
        parent::__construct($message ?: implode(', ', $errors));
        $this->errors = $errors;
    }

    public function getErrors(): array { return $this->errors; }
}

class NotFoundException extends AppException
{
    public function __construct(string $resource, int|string $id)
    {
        parent::__construct("{$resource} with ID {$id} not found");
    }
}

// Caller can catch at any level of the hierarchy
try {
    throw new NotFoundException('User', 42);
} catch (AppException $e) {
    // catches ValidationException and NotFoundException both
    echo $e->getMessage(); // "User with ID 42 not found"
}
</code></pre>
</div>

<h2>Inheritance Violation: The Fragile Base Class</h2>
<p>When you extend a class to reuse methods without a genuine is-a relationship, any change to the parent breaks the child. This is the fragile base class problem — a silent contract violation that manifests as bugs rather than compilation errors.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Fragile Base Class Violation</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// ✗ VIOLATION — extending for code reuse, not for an is-a relationship
class Stack extends \SplDoublyLinkedList
{
    // Reuses SplDoublyLinkedList methods, but a Stack is NOT a DoublyLinkedList
    // Problem: the parent exposes shift(), unshift(), offsetGet() etc.
    // which break Stack semantics (LIFO). Any caller can corrupt the stack.

    public function push(mixed $value): void
    {
        $this->push($value); // now accidentally recursive — infinite loop!
    }
}

// ✗ Another common violation — extending User to get helper methods
class AdminUser extends User
{
    // AdminUser IS a User semantically, but what if the parent adds
    // a new method sendPasswordReset() that fires an email?
    // AdminUser inherits it automatically — possibly unintended side effects.
}

// ✓ FIX — compose the list, only expose what Stack should expose
class Stack
{
    private \SplStack $storage;

    public function __construct()
    {
        $this->storage = new \SplStack();
    }

    public function push(mixed $value): void  { $this->storage->push($value); }
    public function pop(): mixed              { return $this->storage->pop(); }
    public function peek(): mixed             { return $this->storage->top(); }
    public function isEmpty(): bool           { return $this->storage->isEmpty(); }
    public function count(): int              { return $this->storage->count(); }
    // SplStack's other methods are NOT exposed — Stack controls its own API
}
</code></pre>
</div>

<h2>Composition Over Inheritance — Real Example</h2>
<p>A common real-world mistake is building a class hierarchy for what are really just behavioural variations. Composition replaces the hierarchy with collaborating objects that can be mixed and matched at runtime.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Inheritance Hierarchy vs Composition Refactor</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// ✗ INHERITANCE HIERARCHY — explodes combinatorially
// LoggedOrder, CachedOrder, LoggedCachedOrder, AuditedOrder ...
class Order { public function process(): void { /* ... */ } }
class LoggedOrder extends Order {
    public function process(): void {
        error_log('Processing order');
        parent::process();
    }
}
class CachedLoggedOrder extends LoggedOrder { /* ... */ }
// Every new behaviour requires a new subclass — the hierarchy is fragile

// ✓ COMPOSITION — behaviours are small objects, mixed at runtime
interface OrderProcessor
{
    public function process(array $order): void;
}

class BaseOrderProcessor implements OrderProcessor
{
    public function process(array $order): void
    {
        // Core processing logic — charge, reserve stock, etc.
        echo "Processing order #{$order['id']}\n";
    }
}

class LoggingOrderProcessor implements OrderProcessor
{
    public function __construct(private readonly OrderProcessor $inner) {}

    public function process(array $order): void
    {
        error_log("START order #{$order['id']} at " . date('c'));
        $this->inner->process($order);
        error_log("END order #{$order['id']}");
    }
}

class MetricsOrderProcessor implements OrderProcessor
{
    public function __construct(private readonly OrderProcessor $inner) {}

    public function process(array $order): void
    {
        $start = microtime(true);
        $this->inner->process($order);
        $elapsed = microtime(true) - $start;
        // push $elapsed to metrics system
    }
}

// Compose at runtime — any combination, any order
$processor = new MetricsOrderProcessor(
    new LoggingOrderProcessor(
        new BaseOrderProcessor()
    )
);

$processor->process(['id' => 1001, 'total' => 9999]);
// This is the Decorator pattern — composition-based, not inheritance-based
</code></pre>
</div>

<h2>Method Overriding and parent:: Calls</h2>
<p>When you do use inheritance, <code>parent::</code> calls chain behaviour to the base class. The risk: forgetting the call silently drops base-class logic. Mark methods <code>final</code> to prevent overriding where the base class behaviour must be preserved.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — parent:: and final</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
abstract class BaseRepository
{
    private array $queryLog = [];

    // final: subclasses cannot override the logging behaviour
    final protected function query(string $sql, array $bindings = []): array
    {
        $this->queryLog[] = compact('sql', 'bindings');
        // execute via PDO ...
        return [];
    }

    public function getQueryLog(): array { return $this->queryLog; }
}

class UserRepository extends BaseRepository
{
    public function findByEmail(string $email): ?array
    {
        $rows = $this->query(
            'SELECT * FROM users WHERE email = ? LIMIT 1',
            [$email]
        );
        return $rows[0] ?? null;
    }
}

// parent:: in constructor — always call parent when the parent has __construct logic
class TimestampedModel
{
    protected \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }
}

class Post extends TimestampedModel
{
    public function __construct(
        private readonly string $title,
        private readonly string $body,
    ) {
        parent::__construct(); // MUST call — otherwise $createdAt is uninitialised
    }
}
</code></pre>
</div>

<h2>final Classes and Methods</h2>
<p><code>final</code> on a class prevents subclassing entirely. <code>final</code> on a method prevents overriding in subclasses. Use <code>final</code> on Value Objects and on methods where the algorithm must not be changed. It is a deliberate signal: "this is not an extension point."</p>

<div class="callout callout-tip">
  <div class="callout-title">When to Use final</div>
  <p>Mark a class <code>final</code> when it is a Value Object, a DTO, or when subclassing would violate invariants. Mark a method <code>final</code> in an abstract base class when that method is the template and must not be reordered by subclasses. Final is not about restricting creativity — it is about preserving correctness guarantees.</p>
</div>

<h2>When Inheritance IS Correct</h2>
<p>Inheritance is appropriate when all three conditions hold: (1) <strong>True is-a</strong> — a <code>Dog</code> IS an <code>Animal</code>, a <code>NotFoundException</code> IS a <code>RuntimeException</code>. (2) <strong>Liskov substitution</strong> — the subclass can be used anywhere the parent is expected without surprising the caller. (3) <strong>Stable hierarchy</strong> — the parent class changes rarely; the relationship is permanent.</p>

<h2>Interview Questions</h2>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: What is the fragile base class problem?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>When a parent class changes — even in a seemingly safe way, like adding a new method — all subclasses are affected. If a subclass overrides a method and the parent's call sequence changes, the subclass silently breaks. This is called the fragile base class problem: the base class is "fragile" because every change potentially breaks subclasses that the author of the base class may not know about. The solution is to minimise inheritance hierarchies, mark extension points explicitly with <code>abstract</code>, seal others with <code>final</code>, and prefer composition where inheritance is used purely for code reuse.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Why should you prefer composition over inheritance?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Inheritance creates compile-time coupling: the child class is forever bound to the parent's internal implementation, not just its public interface. Composition (holding references to collaborating objects via interfaces) gives you: (1) <strong>Flexibility</strong> — swap behaviours at runtime by injecting different implementations. (2) <strong>Testability</strong> — mock collaborators independently. (3) <strong>Avoidance of hierarchy explosion</strong> — N behaviours in inheritance require 2^N subclasses; in composition you mix N objects. (4) <strong>SRP</strong> — each collaborator has one responsibility. Use inheritance only for genuine, stable is-a relationships.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: When is it safe to use inheritance?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>When three conditions hold simultaneously: (1) The subclass is truly a specialisation of the parent — a <code>NotFoundException</code> IS an exception; a <code>Stack</code> that extends <code>SplDoublyLinkedList</code> is NOT a doubly-linked list. (2) The Liskov Substitution Principle holds — anywhere the parent is expected, the child can be substituted without surprising callers. (3) The hierarchy is stable — the parent class's interface and behaviour will not change frequently. Exception hierarchies, abstract base classes in the Template Method pattern, and framework model base classes (e.g., Eloquent's <code>Model</code>) are the classic correct uses.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Default to composition — assembling behaviour from focused collaborators via interfaces</li>
    <li>Fragile base class: any change to a parent class can silently break all subclasses</li>
    <li>Inheritance for code reuse only = tight coupling without a real is-a relationship</li>
    <li>Inheritance is correct when: true is-a relationship, Liskov holds, hierarchy is stable</li>
    <li><code>parent::__construct()</code> must be called if the parent has constructor logic</li>
    <li><code>final</code> on a class prevents subclassing; <code>final</code> on a method prevents overriding — use deliberately</li>
    <li>Composition avoids hierarchy explosion: N behaviours need N objects, not 2^N subclasses</li>
  </ul>
</div>
`,
};
