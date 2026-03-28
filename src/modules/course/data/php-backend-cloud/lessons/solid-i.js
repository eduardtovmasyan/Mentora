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
  body: `
<h2>The Problem: Fat Interface</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — ISP Violation</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// One interface for everything — clients get methods they don't need
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
}
</code></pre>
</div>

<h2>The Fix: Role Interfaces</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — ISP Compliant</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">interface UserReader {
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
}
</code></pre>
</div>

<h2>ISP in Laravel</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Separate read/write contracts</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Commands only need the writer
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
// This naturally leads into CQRS
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">ISP vs SRP</div>
  <p><strong>SRP</strong> is about a class having one reason to change. <strong>ISP</strong> is about clients not depending on methods they don't use. They solve different problems but reinforce each other — a SRP-compliant class usually naturally produces ISP-compliant interfaces.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Fat interface red flag: classes implement methods with <code>throw new BadMethodCallException</code></li>
    <li>Split by client role — read clients get a reader interface, write clients a writer interface</li>
    <li>ISP and DIP reinforce each other: narrow interfaces make it easier to inject only what a class needs</li>
    <li>PHP traits can share implementation across unrelated interface implementations without inheritance</li>
    <li>This pattern naturally leads into CQRS: commands use write interfaces, queries use read interfaces</li>
  </ul>
</div>
`,
};
