export default {
  phase: 'Phase 3 · Modern PHP 8.x',
  title: 'PHP Static Analysis (PHPStan & Psalm)',
  intro: 'PHPStan and Psalm are static analysis tools that catch type errors, null dereferences, and logic bugs before runtime — without running the code. At max level they make PHP nearly as safe as TypeScript. Senior engineers run them in CI, use PHPDoc annotations to fill gaps, and understand the trade-off between strictness and noise.',
  tags: ['PHPStan', 'Psalm', 'Level 8', 'PHPDoc', 'Generics', 'Baseline', 'CI integration'],
  seniorExpectations: [
    'Configure PHPStan or Psalm, run from CLI, interpret error output',
    'Use PHPDoc @param/@return annotations to guide analysis beyond what PHP types can express',
    'Write generic-typed collections with @template annotations',
    'Generate and manage a baseline file for legacy codebases',
    'Integrate static analysis in GitHub Actions CI pipeline',
  ],
  body: `
<h2>Setup</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">composer require --dev phpstan/phpstan
composer require --dev phpstan/extension-installer  # optional extensions

# Run analysis
vendor/bin/phpstan analyse src/ --level=8

# Generate baseline to suppress existing errors on legacy code
vendor/bin/phpstan analyse src/ --level=8 --generate-baseline
</code></pre>
</div>

<h2>phpstan.neon Configuration</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — phpstan.neon</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">parameters:
    level: 8              # 0 (loose) to 9 (strictest)
    paths:
        - src
        - tests
    excludePaths:
        - src/legacy/
    checkMissingIterableValueType: true
    treatPhpDocTypesAsCertain: true
    ignoreErrors:
        - '#Call to an undefined method PDO#'  # known false positive
</code></pre>
</div>

<h2>PHPDoc Annotations</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">/**
 * @param array<string, int> $scores  key=name, value=score
 * @return list<User>                 indexed array of Users
 */
function topScorers(array $scores): array { /* ... */ }

/**
 * @template T of object
 * @param class-string<T> $class
 * @return T
 */
function make(string $class): object {
    return new $class();
}

// PHPStan understands: make(User::class) returns User

/** @var array<int, Order> $orders */
$orders = $this->orderRepo->findAll();

// Assert to narrow a type within a block
assert($user instanceof Admin);
$user->adminOnlyMethod(); // PHPStan knows $user is Admin here
</code></pre>
</div>

<h2>Generic Collections</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">/**
 * @template T
 */
class TypedCollection {
    /** @var list<T> */
    private array $items = [];

    /**
     * @param T $item
     */
    public function add(mixed $item): void {
        $this->items[] = $item;
    }

    /**
     * @return list<T>
     */
    public function all(): array {
        return $this->items;
    }
}

/** @var TypedCollection<User> $users */
$users = new TypedCollection();
$users->add(new User()); // OK
$users->add(new Order()); // PHPStan error: Order is not User
</code></pre>
</div>

<h2>CI Integration (GitHub Actions)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">YAML — .github/workflows/ci.yml</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-yaml">- name: Static Analysis
  run: vendor/bin/phpstan analyse --no-progress --error-format=github
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Baseline Strategy</div>
  <p>On legacy codebases, generate a baseline file to suppress existing errors: <code>--generate-baseline phpstan-baseline.neon</code>. Include it in <code>phpstan.neon</code> with <code>includes: [phpstan-baseline.neon]</code>. New code must pass clean; baseline errors are tracked until fixed. Baseline size should shrink over time.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Start at level 5–6, work toward level 8 — don't jump straight to 9 on existing codebases</li>
    <li>PHPDoc annotations extend the type system: <code>array&lt;K, V&gt;</code>, <code>list&lt;T&gt;</code>, <code>class-string&lt;T&gt;</code>, <code>@template</code></li>
    <li>Baseline: suppress existing errors, ensure new code is clean — gradually shrink the baseline</li>
    <li>Run in CI with <code>--error-format=github</code> for inline PR annotations</li>
    <li>Psalm is an alternative — stricter by default, better generics support, slower analysis</li>
  </ul>
</div>
`,
};
