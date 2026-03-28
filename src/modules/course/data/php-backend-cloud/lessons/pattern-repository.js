export default {
  phase: 'Phase 2 · OOP, SOLID & Design Patterns',
  title: 'Repository Pattern',
  intro: 'The Repository pattern creates a clean abstraction layer between your domain/business logic and the data storage mechanism. Instead of scattering query logic across controllers and services, you define a contract (interface) for data access and provide one or more concrete implementations — Eloquent for production, an in-memory array for unit tests. This separation makes your domain logic storage-agnostic, your code dramatically easier to test without hitting a real database, and your architecture genuinely swappable when requirements change.',
  tags: ['repository', 'design-patterns', 'eloquent', 'testing', 'DIP', 'interface'],
  seniorExpectations: [
    'Define a repository interface with typed find/save/delete methods and bind it in the service container',
    'Provide an Eloquent implementation and a separate in-memory implementation used exclusively in unit tests',
    'Explain the trade-offs between Repository and Active Record and know when each is appropriate',
    'Understand how the pattern satisfies the Dependency Inversion Principle at the architectural level',
    'Recognise when the pattern adds unnecessary indirection and be prepared to argue against it with concrete reasons',
  ],
  body: `
<h2>What Problem Does the Repository Pattern Solve?</h2>
<p>In a typical Laravel application it is tempting to call <code>User::where('email', $email)->first()</code> directly inside a service or controller. This couples business logic to Eloquent, to the database schema, and to a specific query strategy. Unit-testing that code requires a real (or seeded) database. The Repository pattern addresses this by giving business logic a <em>stable interface</em> it depends on, leaving the implementation detail — SQL, Eloquent, an API call — free to vary without touching domain code.</p>

<div class="callout callout-info">
  <div class="callout-title">Core Idea</div>
  <p>A repository is a collection-like object that the domain queries for entities. It hides every detail of how those entities are stored, retrieved, or deleted. Services type-hint against the interface, never the concrete class.</p>
</div>

<h2>Defining the Interface</h2>
<p>Start with a PHP interface that expresses the minimal data-access contract your domain needs. Keep it domain-oriented: return your entity/model types or <code>null</code>, never raw query builder instances or arrays of primitives. The interface belongs in the domain or application layer, not in the infrastructure layer.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\User;
use Illuminate\Support\Collection;

interface UserRepositoryInterface
{
    public function findById(int $id): ?User;

    public function findByEmail(string $email): ?User;

    /** @return Collection&lt;int, User&gt; */
    public function findAll(): Collection;

    public function save(User $user): User;

    public function delete(int $id): void;
}
</code></pre>
</div>

<h2>Eloquent Implementation</h2>
<p>The production implementation wraps Eloquent. All query logic — indexes, eager loads, order clauses, pagination — lives here. If you later switch to a raw PDO layer or a different ORM you only rewrite this class; nothing else in the application changes.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Collection;

final class EloquentUserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findAll(): Collection
    {
        return User::orderBy('created_at', 'desc')->get();
    }

    public function save(User $user): User
    {
        $user->save();
        return $user;
    }

    public function delete(int $id): void
    {
        User::destroy($id);
    }
}
</code></pre>
</div>

<h2>Binding in the Service Container</h2>
<p>Laravel's container maps the interface to the concrete class. Place this in a dedicated <code>RepositoryServiceProvider</code> so bindings remain organised and the rest of the codebase always type-hints against the interface.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php

declare(strict_types=1);

namespace App\Providers;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\EloquentUserRepository;
use Illuminate\Support\ServiceProvider;

final class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            UserRepositoryInterface::class,
            EloquentUserRepository::class,
        );
    }
}
</code></pre>
</div>

<h2>In-Memory Implementation for Tests</h2>
<p>The real payoff appears in unit tests. An in-memory implementation stores entities in a plain PHP array, runs in microseconds, requires no database connection, and lets you seed exact state without any framework overhead. Your service tests become pure logic tests.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php

declare(strict_types=1);

namespace Tests\Fakes;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Collection;

final class InMemoryUserRepository implements UserRepositoryInterface
{
    /** @var array&lt;int, User&gt; */
    private array $store = [];

    private int $nextId = 1;

    public function findById(int $id): ?User
    {
        return $this->store[$id] ?? null;
    }

    public function findByEmail(string $email): ?User
    {
        foreach ($this->store as $user) {
            if ($user->email === $email) {
                return $user;
            }
        }
        return null;
    }

    public function findAll(): Collection
    {
        return collect(array_values($this->store));
    }

    public function save(User $user): User
    {
        if ($user->id === null) {
            $user->id = $this->nextId++;
        }
        $this->store[$user->id] = $user;
        return $user;
    }

    public function delete(int $id): void
    {
        unset($this->store[$id]);
    }
}
</code></pre>
</div>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php

// Unit test — no database, no HTTP, runs in under 1 ms
use App\Services\UserService;
use Tests\Fakes\InMemoryUserRepository;
use PHPUnit\Framework\TestCase;

final class UserServiceTest extends TestCase
{
    public function test_registers_user_and_assigns_id(): void
    {
        $repo    = new InMemoryUserRepository();
        $service = new UserService($repo);

        $user = $service->register('alice@example.com', 'secret');

        $this->assertNotNull($user->id);
        $this->assertSame(
            'alice@example.com',
            $repo->findById($user->id)->email
        );
    }
}
</code></pre>
</div>

<h2>Repository vs Active Record</h2>
<p>Eloquent uses the Active Record pattern: each model knows how to save itself. Active Record is productive for CRUD-heavy applications with simple domains. The Repository pattern is a better fit when you need framework independence, rich domain models, or thorough unit-test coverage without a live database. The two are not mutually exclusive — your Eloquent repository <em>wraps</em> Active Record models, so you get testability without abandoning Eloquent entirely.</p>

<div class="callout callout-warning">
  <div class="callout-title">Trade-off Awareness</div>
  <p>Adding a repository layer to a simple CRUD app is over-engineering. The pattern pays dividends when you have complex query logic to centralise, multiple storage backends to swap, or a strict unit-test policy that forbids database calls in fast tests.</p>
</div>

<h2>When Not to Use the Repository Pattern</h2>
<p>Every pattern has a cost. Avoid the Repository pattern when the application is purely CRUD with no domain logic; the team is small and delivery speed matters more than architectural purity; Eloquent's built-in scopes and relationships already encapsulate the query variations you need; or you are certain the storage mechanism will never change. A senior engineer applies patterns deliberately, not by default, and can articulate the cost alongside the benefit.</p>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: How does the Repository pattern relate to the Dependency Inversion Principle?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>DIP states that high-level modules (services, domain logic) should depend on abstractions, not concretions. By injecting <code>UserRepositoryInterface</code> instead of <code>EloquentUserRepository</code>, the service depends on an abstraction. The concrete class (Eloquent) depends on the same abstraction by implementing it. This inversion means you can swap the storage layer — Redis, an external API, an in-memory array — without touching the service at all.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Should I create one repository per model or per aggregate root?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>In DDD terminology, repositories exist per <em>aggregate root</em>, not per table. An aggregate root is the top-level entity that owns a cluster of related objects — for example, an <code>Order</code> that contains <code>OrderLine</code> items. You define an <code>OrderRepository</code>, not a separate <code>OrderLineRepository</code>, because order lines are always accessed through their parent order. In simpler Laravel apps without strict DDD, one repository per significant model is a pragmatic starting point that you can refine later.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: What is a query object and how does it complement the repository?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>A query object encapsulates a single, complex read query as its own class — for example, <code>FindUsersWithOverdueSubscriptionsQuery</code>. Instead of adding every filter combination to the repository interface, the repository stays minimal (find by ID, save, delete) and query objects handle complex reporting scenarios. This prevents the repository from becoming a "query dump" with dozens of methods that violates the Single Responsibility Principle.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>A repository interface defines a storage contract; concrete implementations (Eloquent, in-memory) satisfy it without the caller knowing which is active.</li>
    <li>Bind the interface to its implementation in a <code>ServiceProvider</code> so the container resolves the right class on injection.</li>
    <li>An in-memory implementation lets unit tests run without a database, slashing test suite time from seconds to milliseconds.</li>
    <li>The pattern embodies the Dependency Inversion Principle — domain code depends on abstractions, not on Eloquent directly.</li>
    <li>Prefer repositories when you need testability, swappable storage, or centralised query logic; skip them for simple CRUD.</li>
    <li>Keep interfaces focused on minimal operations; delegate complex searches to dedicated query objects.</li>
    <li>Repository sits alongside Active Record — it wraps Eloquent rather than replacing it.</li>
  </ul>
</div>
`,
};
