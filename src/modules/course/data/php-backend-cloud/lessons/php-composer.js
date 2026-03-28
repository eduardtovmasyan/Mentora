export default {
  phase: 'Phase 3 · Modern PHP 8.x',
  title: 'Composer & Package Management',
  intro: 'Composer is PHP\'s dependency manager. It resolves semantic versioning constraints, installs packages, generates the PSR-4 autoloader, and manages scripts. Understanding how it works — lock files, version constraints, autoloading, and platform requirements — is essential for production PHP engineering.',
  tags: ['composer.json', 'composer.lock', 'Semantic versioning', 'Autoloading', 'Scripts', 'Packagist'],
  seniorExpectations: [
    'Explain semantic versioning: ^, ~, >=, and exact version constraints',
    'Understand composer.lock — why it exists and why it must be committed',
    'Configure PSR-4, PSR-0, classmap, and files autoloading',
    'Use composer scripts for build automation',
    'Distinguish require vs require-dev; configure platform requirements',
  ],
  body: `
<h2>composer.json Anatomy</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">JSON — composer.json</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-json">{
  "name": "mycompany/my-app",
  "description": "My PHP application",
  "type": "project",
  "require": {
    "php": ">=8.2",
    "laravel/framework": "^11.0",
    "monolog/monolog": "^3.0"
  },
  "require-dev": {
    "phpunit/phpunit": "^11.0",
    "pestphp/pest": "^2.0",
    "fakerphp/faker": "^1.23"
  },
  "autoload": {
    "psr-4": { "App\\": "src/" }
  },
  "autoload-dev": {
    "psr-4": { "Tests\\": "tests/" }
  },
  "scripts": {
    "test": "vendor/bin/phpunit",
    "test:coverage": "vendor/bin/phpunit --coverage-html coverage/",
    "lint": "vendor/bin/phpcs src/ --standard=PSR12",
    "post-install-cmd": ["@php artisan key:generate"]
  },
  "config": {
    "optimize-autoloader": true,
    "preferred-install": "dist"
  }
}
</code></pre>
</div>

<h2>Version Constraints</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">JSON — Constraint Examples</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-json">{
  "require": {
    "vendor/pkg": "1.2.3",      // exact
    "vendor/pkg": ">=1.2 <2.0", // range
    "vendor/pkg": "~1.2",       // >= 1.2 < 2.0 (patch updates only for 1.2.x)
    "vendor/pkg": "^1.2.3",     // >= 1.2.3 < 2.0.0 (minor/patch ok, no major break)
    "vendor/pkg": "^0.3.0",     // >= 0.3.0 < 0.4.0 (0.x is special — minor is breaking)
    "vendor/pkg": "*"           // any version (avoid in production)
  }
}
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">^ vs ~ explained</div>
  <p><code>^1.2.3</code> = "compatible with 1.2.3" = <code>>=1.2.3 &lt;2.0.0</code>. Safe for semantic-versioned packages.<br>
  <code>~1.2</code> = <code>>=1.2 &lt;2.0</code>. <code>~1.2.3</code> = <code>>=1.2.3 &lt;1.3.0</code>. More restrictive — use for packages that don't follow SemVer well.</p>
</div>

<h2>Key Commands</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash — Composer Commands</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">composer install          # install from composer.lock (production)
composer update           # resolve and update to newest allowed versions
composer require pkg/name # add a dependency
composer remove pkg/name  # remove a dependency
composer dump-autoload    # regenerate autoloader without installing
composer dump-autoload -o # optimized (classmap for all classes) — use in production
composer show             # list installed packages
composer outdated         # show packages with newer versions available
composer validate         # validate composer.json
composer audit            # check for security vulnerabilities
</code></pre>
</div>

<h2>The Lock File</h2>
<div class="callout callout-warn">
  <div class="callout-title">Always commit composer.lock</div>
  <p>The lock file pins every dependency (including transitive) to an exact version + hash. <code>composer install</code> installs exactly what is locked — reproducible builds. <code>composer update</code> resolves new versions and updates the lock file — do this intentionally, review the diff, and commit the updated lock.</p>
</div>

<h2>Optimized Autoloader for Production</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">bash</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Production deploy — generate optimized classmap
composer install --no-dev --optimize-autoloader

# Or optimize existing:
composer dump-autoload --optimize --no-dev
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li><code>^1.2.3</code>: allow minor/patch upgrades, no major; safest for production</li>
    <li>Commit <code>composer.lock</code> — guarantees identical installs across all environments</li>
    <li><code>composer install</code> uses the lock file; <code>composer update</code> resolves fresh versions</li>
    <li>Use <code>--no-dev</code> and <code>--optimize-autoloader</code> in production deploys</li>
    <li>Run <code>composer audit</code> in CI to catch known security vulnerabilities in dependencies</li>
  </ul>
</div>
`,
};
