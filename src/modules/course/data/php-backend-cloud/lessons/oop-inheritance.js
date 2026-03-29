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
  segments: [
    { type: 'h2', key: 'h_fundamental_rule' },
    { type: 'p', key: 'p_fundamental_rule' },

    { type: 'h2', key: 'h_right_use_case' },
    { type: 'p', key: 'p_right_use_case' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — Correct Inheritance: Exception Hierarchy',
      code: `<?php
// ✓ Correct use of inheritance — exception hierarchy is a textbook is-a relationship
class AppException extends \\RuntimeException {}

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
}`,
    },

    { type: 'h2', key: 'h_fragile_base_class' },
    { type: 'p', key: 'p_fragile_base_class' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — Fragile Base Class Violation',
      code: `<?php
// ✗ VIOLATION — extending for code reuse, not for an is-a relationship
class Stack extends \\SplDoublyLinkedList
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
    private \\SplStack $storage;

    public function __construct()
    {
        $this->storage = new \\SplStack();
    }

    public function push(mixed $value): void  { $this->storage->push($value); }
    public function pop(): mixed              { return $this->storage->pop(); }
    public function peek(): mixed             { return $this->storage->top(); }
    public function isEmpty(): bool           { return $this->storage->isEmpty(); }
    public function count(): int              { return $this->storage->count(); }
    // SplStack's other methods are NOT exposed — Stack controls its own API
}`,
    },

    { type: 'h2', key: 'h_composition_example' },
    { type: 'p', key: 'p_composition_example' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — Inheritance Hierarchy vs Composition Refactor',
      code: `<?php
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
        echo "Processing order #{$order['id']}\\n";
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
// This is the Decorator pattern — composition-based, not inheritance-based`,
    },

    { type: 'h2', key: 'h_method_overriding' },
    { type: 'p', key: 'p_method_overriding' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — parent:: and final',
      code: `<?php
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
    protected \\DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \\DateTimeImmutable();
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
}`,
    },

    { type: 'h2', key: 'h_final' },
    { type: 'p', key: 'p_final' },
    { type: 'callout', style: 'tip', key: 'callout_when_to_use_final' },

    { type: 'h2', key: 'h_when_correct' },
    { type: 'p', key: 'p_when_correct' },

    { type: 'h2', key: 'h_interview' },
    { type: 'qa', key: 'qa' },

    { type: 'keypoints', key: 'keypoints' },
  ],
  bodyTexts: {
    h_fundamental_rule: 'The Fundamental Rule: Prefer Composition',
    p_fundamental_rule: 'Inheritance creates a <strong>compile-time coupling</strong> between parent and child that cannot be broken at runtime. Every change to a parent class is a potential breaking change for all subclasses — this is called the <strong>fragile base class problem</strong>. Composition — holding references to collaborating objects — keeps classes loosely coupled, independently testable, and freely interchangeable. Default to composition; use inheritance only when a true "is-a" relationship exists that will not change.',

    h_right_use_case: 'Inheritance: The Right Use Case',
    p_right_use_case: 'Inheritance is correct when: (1) the subclass IS the parent type in every context, (2) the relationship is permanent and non-situational, and (3) shared behaviour belongs in the parent. Classic examples: exception hierarchies, abstract base classes enforcing a template method, Eloquent model extending a base model.',

    h_fragile_base_class: 'Inheritance Violation: The Fragile Base Class',
    p_fragile_base_class: 'When you extend a class to reuse methods without a genuine is-a relationship, any change to the parent breaks the child. This is the fragile base class problem — a silent contract violation that manifests as bugs rather than compilation errors.',

    h_composition_example: 'Composition Over Inheritance — Real Example',
    p_composition_example: 'A common real-world mistake is building a class hierarchy for what are really just behavioural variations. Composition replaces the hierarchy with collaborating objects that can be mixed and matched at runtime.',

    h_method_overriding: 'Method Overriding and parent:: Calls',
    p_method_overriding: 'When you do use inheritance, <code>parent::</code> calls chain behaviour to the base class. The risk: forgetting the call silently drops base-class logic. Mark methods <code>final</code> to prevent overriding where the base class behaviour must be preserved.',

    h_final: 'final Classes and Methods',
    p_final: '<code>final</code> on a class prevents subclassing entirely. <code>final</code> on a method prevents overriding in subclasses. Use <code>final</code> on Value Objects and on methods where the algorithm must not be changed. It is a deliberate signal: "this is not an extension point."',
    callout_when_to_use_final: {
      title: 'When to Use final',
      html: 'Mark a class <code>final</code> when it is a Value Object, a DTO, or when subclassing would violate invariants. Mark a method <code>final</code> in an abstract base class when that method is the template and must not be reordered by subclasses. Final is not about restricting creativity — it is about preserving correctness guarantees.',
    },

    h_when_correct: 'When Inheritance IS Correct',
    p_when_correct: 'Inheritance is appropriate when all three conditions hold: (1) <strong>True is-a</strong> — a <code>Dog</code> IS an <code>Animal</code>, a <code>NotFoundException</code> IS a <code>RuntimeException</code>. (2) <strong>Liskov substitution</strong> — the subclass can be used anywhere the parent is expected without surprising the caller. (3) <strong>Stable hierarchy</strong> — the parent class changes rarely; the relationship is permanent.',

    h_interview: 'Interview Questions',
    qa: {
      pairs: [
        {
          q: 'What is the fragile base class problem?',
          a: 'When a parent class changes — even in a seemingly safe way, like adding a new method — all subclasses are affected. If a subclass overrides a method and the parent\'s call sequence changes, the subclass silently breaks. This is called the fragile base class problem: the base class is "fragile" because every change potentially breaks subclasses that the author of the base class may not know about. The solution is to minimise inheritance hierarchies, mark extension points explicitly with <code>abstract</code>, seal others with <code>final</code>, and prefer composition where inheritance is used purely for code reuse.',
        },
        {
          q: 'Why should you prefer composition over inheritance?',
          a: 'Inheritance creates compile-time coupling: the child class is forever bound to the parent\'s internal implementation, not just its public interface. Composition (holding references to collaborating objects via interfaces) gives you: (1) <strong>Flexibility</strong> — swap behaviours at runtime by injecting different implementations. (2) <strong>Testability</strong> — mock collaborators independently. (3) <strong>Avoidance of hierarchy explosion</strong> — N behaviours in inheritance require 2^N subclasses; in composition you mix N objects. (4) <strong>SRP</strong> — each collaborator has one responsibility. Use inheritance only for genuine, stable is-a relationships.',
        },
        {
          q: 'When is it safe to use inheritance?',
          a: 'When three conditions hold simultaneously: (1) The subclass is truly a specialisation of the parent — a <code>NotFoundException</code> IS an exception; a <code>Stack</code> that extends <code>SplDoublyLinkedList</code> is NOT a doubly-linked list. (2) The Liskov Substitution Principle holds — anywhere the parent is expected, the child can be substituted without surprising callers. (3) The hierarchy is stable — the parent class\'s interface and behaviour will not change frequently. Exception hierarchies, abstract base classes in the Template Method pattern, and framework model base classes (e.g., Eloquent\'s <code>Model</code>) are the classic correct uses.',
        },
      ],
    },

    keypoints: {
      title: 'Key Points to Remember',
      items: [
        'Default to composition — assembling behaviour from focused collaborators via interfaces',
        'Fragile base class: any change to a parent class can silently break all subclasses',
        'Inheritance for code reuse only = tight coupling without a real is-a relationship',
        'Inheritance is correct when: true is-a relationship, Liskov holds, hierarchy is stable',
        'parent::__construct() must be called if the parent has constructor logic',
        'final on a class prevents subclassing; final on a method prevents overriding — use deliberately',
        'Composition avoids hierarchy explosion: N behaviours need N objects, not 2^N subclasses',
      ],
    },
  },
};
