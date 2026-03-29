export default {
  phase: 'Phase 2 · OOP & Design Patterns',
  title: 'SOLID · Interface Segregation Principle',
  intro: 'ISP states that no client should be forced to depend on methods it does not use. Fat interfaces force classes to implement irrelevant methods with empty or exception-throwing stubs. The fix is to split them into focused, cohesive interfaces — each serving one group of clients.',
  tags: ['ISP', 'Fat interface', 'Role interfaces', 'Cohesion', 'Segregation'],
  seniorExpectations: [
    'Identify fat interface violations: classes with throw new \Exception("Not implemented")',
    'Split a fat interface into role-based focused interfaces',
    'Explain the difference between ISP and SRP — ISP is about clients, SRP is about reasons to change',
    'Apply ISP in the context of repositories: ReadRepository vs WriteRepository',
    'Understand how ISP enables the Dependency Inversion Principle',
  ],
  segments: [
    { type: 'h2', text: 'The Problem: Fat Interface' },
    { type: 'code', lang: 'php', label: 'PHP — ISP Violation', code: `// One interface for everything — clients get methods they don't need
interface UserRepository {
    public function find(int $id): ?User;
    public function findAll(): array;
    public function save(User $user): void;
    public function delete(int $id): void;
    public function generateReport(): string;  // analytics concern in a CRUD interface
    public function sendWelcomeEmail(User $u): void; // notification concern
}

// Read-only API client is forced to implement write methods
class ApiUserRepository implements UserRepository {
    public function save(User $user): void {
        throw new \BadMethodCallException('Not supported'); // forced stub
    }
    public function delete(int $id): void {
        throw new \BadMethodCallException('Not supported');
    }
    // ...
}` },

    { type: 'h2', text: 'The Fix: Role Interfaces' },
    { type: 'code', lang: 'php', label: 'PHP — ISP Compliant', code: `interface UserReader {
    public function find(int $id): ?User;
    public function findAll(): array;
}

interface UserWriter {
    public function save(User $user): void;
    public function delete(int $id): void;
}

interface UserRepository extends UserReader, UserWriter {} // full interface when needed

// Read-only client only implements what it uses
class ApiUserRepository implements UserReader {
    public function find(int $id): ?User { /* ... */ }
    public function findAll(): array { /* ... */ }
    // No stubs, no surprises
}

// Full repository for write-capable storage
class DatabaseUserRepository implements UserRepository {
    public function find(int $id): ?User    { /* ... */ }
    public function findAll(): array        { /* ... */ }
    public function save(User $user): void  { /* ... */ }
    public function delete(int $id): void   { /* ... */ }
}

// Service that only needs to read
class UserSearchService {
    public function __construct(private UserReader $repo) {} // narrow dependency
}` },

    { type: 'h2', text: 'ISP in Laravel' },
    { type: 'code', lang: 'php', label: 'PHP — Separate read/write contracts', code: `// Commands only need the writer
class CreateUserHandler {
    public function __construct(private UserWriter $users) {}

    public function handle(CreateUserCommand $cmd): void {
        $this->users->save(User::fromCommand($cmd));
    }
}

// Queries only need the reader
class GetUsersQueryHandler {
    public function __construct(private UserReader $users) {}

    public function handle(): array {
        return $this->users->findAll();
    }
}
// This naturally leads into CQRS` },

    { type: 'callout', style: 'tip', title: 'ISP vs SRP', html: '<strong>SRP</strong> is about a class having one reason to change. <strong>ISP</strong> is about clients not depending on methods they don\'t use. They solve different problems but reinforce each other — a SRP-compliant class usually naturally produces ISP-compliant interfaces.' },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Fat interface red flag: classes implement methods with <code>throw new BadMethodCallException</code>',
      'Split by client role — read clients get a reader interface, write clients a writer interface',
      'ISP and DIP reinforce each other: narrow interfaces make it easier to inject only what a class needs',
      'PHP traits can share implementation across unrelated interface implementations without inheritance',
      'This pattern naturally leads into CQRS: commands use write interfaces, queries use read interfaces',
    ]},
  ],
};
