export default {
  phase: 'Phase 2 · OOP, SOLID & Design Patterns',
  title: 'S — Single Responsibility Principle',
  intro: 'A class should have only one reason to change. SRP is the most commonly violated SOLID principle and the most important. When a class has multiple responsibilities, any change to one responsibility can break the others.',
  tags: ['SRP', 'One reason to change', 'God class', 'Service classes', 'Testability'],
  seniorExpectations: [
    'Spot god classes in a real codebase immediately',
    'Refactor a god class into focused services',
    'Explain how SRP enables unit testing',
    'Know when NOT to split (avoid over-engineering)',
    'Describe SRP using stakeholders, not just "classes"',
  ],
  body: `
<h2>The Principle</h2>
<p>Robert Martin's definition: <em>"A class should have only one reason to change."</em> A "reason to change" maps to a stakeholder. If the marketing team, DBA, and security team can all force you to edit the same class — it has three reasons to change. Split it.</p>
<p>Quick heuristic: if describing what a class does requires the word <strong>"and"</strong>, it probably violates SRP.</p>

<h2>Violation: The God Class</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — SRP Violation</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// ✗ BAD: 5 different teams can force you to edit this one file
class UserManager
{
    public function createUser(string $name, string $email, string $password): int
    {
        // 1. Validation — changes when business rules change
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email');
        }
        // 2. Hashing — changes when security team upgrades algorithm
        $hash = password_hash($password, PASSWORD_ARGON2ID);
        // 3. Database — changes when DBA alters schema
        $pdo  = new \PDO('mysql:host=localhost;dbname=app', 'root', '');
        $stmt = $pdo->prepare('INSERT INTO users (name,email,password) VALUES (?,?,?)');
        $stmt->execute([$name, $email, $hash]);
        $id   = (int) $pdo->lastInsertId();
        // 4. Email — changes when marketing redesigns template
        mail($email, 'Welcome!', "Hi {$name}!");
        // 5. Logging — changes when ops changes log format
        file_put_contents('/var/log/app.log', "User {$id} created\n", FILE_APPEND);
        return $id;
    }
}
</code></pre>
</div>

<h2>Applied SRP</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — SRP Applied</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
final class UserValidator
{
    public function validate(string $email, string $password): void
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email');
        }
        if (strlen($password) < 8) {
            throw new \InvalidArgumentException('Password too short');
        }
    }
}

final class PasswordHasher
{
    public function hash(string $password): string { return password_hash($password, PASSWORD_ARGON2ID); }
    public function verify(string $plain, string $hash): bool { return password_verify($plain, $hash); }
}

final class UserRepository
{
    public function __construct(private readonly \PDO $pdo) {}
    public function save(string $name, string $email, string $hash): int
    {
        $s = $this->pdo->prepare('INSERT INTO users (name,email,password) VALUES (?,?,?)');
        $s->execute([$name, $email, $hash]);
        return (int) $this->pdo->lastInsertId();
    }
}

final class WelcomeMailer
{
    public function send(string $to, string $name): void { mail($to, 'Welcome!', "Hi {$name}!"); }
}

// Orchestrator — one job: coordinate the registration workflow
final class UserRegistrationService
{
    public function __construct(
        private readonly UserValidator  $validator,
        private readonly PasswordHasher $hasher,
        private readonly UserRepository $repo,
        private readonly WelcomeMailer  $mailer,
    ) {}

    public function register(string $name, string $email, string $password): int
    {
        $this->validator->validate($email, $password);
        $hash = $this->hasher->hash($password);
        $id   = $this->repo->save($name, $email, $hash);
        $this->mailer->send($email, $name);
        return $id;
    }
}
// Now: switch from mail() to Mailgun? Only WelcomeMailer changes.
// Switch from MySQL to Postgres? Only UserRepository changes.
// Change validation rules? Only UserValidator changes.
</code></pre>
</div>

<div class="callout callout-warn">
  <div class="callout-title">Don't Over-Split</div>
  <p>SRP doesn't mean "one method per class". A User model with name + email + phone is fine — they all change for the same reason (user data changes). Only split when two <em>different stakeholders</em> can force changes to the same class.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>SRP: one class = one reason to change = serves one stakeholder</li>
    <li>Red flag: class name has "Manager", "Handler", "Helper" — or needs "and" in description</li>
    <li>Split into: Validator, Repository, Service, Mailer, Hasher, Formatter</li>
    <li>Orchestration services are fine — their one job is to coordinate other classes</li>
    <li>SRP is the prerequisite for testability — small focused classes are trivial to mock</li>
  </ul>
</div>
`,
};

// ── SOLID-D ───────────────────────────────────────────────────────────
