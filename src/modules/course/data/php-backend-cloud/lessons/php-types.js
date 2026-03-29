export default {
  phase: 'Phase 3 · Modern PHP 8.x',
  title: 'PHP Type System',
  intro: 'PHP 8.x has a rich, evolving type system: scalar types, nullable, union, intersection, never, and enum types. Strict mode enforcement, readonly properties, and first-class callable syntax make PHP increasingly close to a statically-typed language while keeping its dynamic roots. Understanding the type system is essential for clean, IDE-friendly, testable PHP code.',
  tags: ['Strict types', 'Union types', 'Intersection types', 'Enums', 'Readonly', 'never', 'Fibers'],
  seniorExpectations: [
    'Enable strict_types=1 and explain what it changes for scalar type coercion',
    'Use union types (PHP 8.0) and intersection types (PHP 8.1)',
    'Declare and use backed enums; use enums in match expressions and type hints',
    'Use readonly properties and readonly classes (PHP 8.2)',
    'Understand never return type and when to use it',
  ],
  segments: [
    { type: 'h2', text: 'Strict Types' },
    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php declare(strict_types=1);

// Without strict_types: PHP coerces "42" to int 42 silently
// With strict_types: passing "42" to an int param throws TypeError

function add(int $a, int $b): int {
    return $a + $b;
}

add(1, 2);    // OK
add(1, "2");  // TypeError in strict mode, works without` },

    { type: 'h2', text: 'Union Types (PHP 8.0)' },
    { type: 'code', lang: 'php', label: 'PHP', code: `function formatId(int|string $id): string {
    return (string) $id;
}

// Nullable is shorthand for Type|null
function findUser(?int $id): ?User {  // equivalent to int|null
    return $id ? User::find($id) : null;
}` },

    { type: 'h2', text: 'Intersection Types (PHP 8.1)' },
    { type: 'code', lang: 'php', label: 'PHP', code: `interface Countable { public function count(): int; }
interface Stringable { public function __toString(): string; }

// Must implement both interfaces
function display(Countable&Stringable $collection): void {
    echo "Count: {$collection->count()}, String: {$collection}";
}` },

    { type: 'h2', text: 'Enums (PHP 8.1)' },
    { type: 'code', lang: 'php', label: 'PHP', code: `// Pure enum
enum Status {
    case Active;
    case Inactive;
    case Suspended;
}

// Backed enum (int or string backing)
enum Color: string {
    case Red   = 'red';
    case Green = 'green';
    case Blue  = 'blue';

    public function label(): string {
        return ucfirst($this->value);
    }
}

// Usage
$status = Status::Active;
$color  = Color::from('red');         // Color::Red
$color2 = Color::tryFrom('purple');   // null (no exception)

echo $color->value;   // 'red'
echo $color->label(); // 'Red'

// Enums in match
$message = match ($status) {
    Status::Active    => 'User is active',
    Status::Inactive  => 'User is inactive',
    Status::Suspended => 'Account suspended',
};

// Enums are type-safe — no more magic string constants
function activate(Status $status): void { /* ... */ }` },

    { type: 'h2', text: 'Readonly Properties & Classes (PHP 8.1 / 8.2)' },
    { type: 'code', lang: 'php', label: 'PHP', code: `// PHP 8.1: readonly property (write once, in constructor)
class User {
    public readonly string $name;

    public function __construct(string $name) {
        $this->name = $name; // OK
    }
    // $user->name = 'other'; // Error: readonly
}

// PHP 8.2: readonly class — all properties implicitly readonly
readonly class Point {
    public function __construct(
        public float $x,
        public float $y,
    ) {}
}

// Perfect for Value Objects — immutable by definition
$p = new Point(1.5, 2.5);` },

    { type: 'h2', text: 'never Return Type' },
    { type: 'code', lang: 'php', label: 'PHP', code: `// never means the function never returns (throws or exits)
function abort(int $code): never {
    http_response_code($code);
    exit;
}

function throwNotFound(): never {
    throw new NotFoundException();
}
// Useful for type-checker: callers know execution stops here` },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Always add <code>declare(strict_types=1)</code> at the top of every PHP file in a project',
      'Union types: <code>int|string</code>; Nullable shorthand: <code>?Type</code> = <code>Type|null</code>',
      'Intersection types: <code>A&B</code> — value must implement both; cannot mix union and intersection without DNF (PHP 8.2)',
      'Backed enums replace string/int constants — type-safe, IDE-friendly, have methods',
      'Readonly properties enforce immutability without a custom clone/copy pattern',
    ]},
  ],
};
