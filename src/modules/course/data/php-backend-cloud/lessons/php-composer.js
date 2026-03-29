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
  segments: [
    { type: 'h2', text: 'composer.json Anatomy' },
    { type: 'code', lang: 'json', label: 'JSON — composer.json', code: `{
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
    "psr-4": { "App\\\\": "src/" }
  },
  "autoload-dev": {
    "psr-4": { "Tests\\\\": "tests/" }
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
}` },

    { type: 'h2', text: 'Version Constraints' },
    { type: 'code', lang: 'json', label: 'JSON — Constraint Examples', code: `{
  "require": {
    "vendor/pkg": "1.2.3",      // exact
    "vendor/pkg": ">=1.2 <2.0", // range
    "vendor/pkg": "~1.2",       // >= 1.2 < 2.0 (patch updates only for 1.2.x)
    "vendor/pkg": "^1.2.3",     // >= 1.2.3 < 2.0.0 (minor/patch ok, no major break)
    "vendor/pkg": "^0.3.0",     // >= 0.3.0 < 0.4.0 (0.x is special — minor is breaking)
    "vendor/pkg": "*"           // any version (avoid in production)
  }
}` },

    { type: 'callout', style: 'tip', title: '^ vs ~ explained', html: '<code>^1.2.3</code> = "compatible with 1.2.3" = <code>>=1.2.3 &lt;2.0.0</code>. Safe for semantic-versioned packages.<br>\n  <code>~1.2</code> = <code>>=1.2 &lt;2.0</code>. <code>~1.2.3</code> = <code>>=1.2.3 &lt;1.3.0</code>. More restrictive — use for packages that don\'t follow SemVer well.' },

    { type: 'h2', text: 'Key Commands' },
    { type: 'code', lang: 'bash', label: 'bash — Composer Commands', code: `composer install          # install from composer.lock (production)
composer update           # resolve and update to newest allowed versions
composer require pkg/name # add a dependency
composer remove pkg/name  # remove a dependency
composer dump-autoload    # regenerate autoloader without installing
composer dump-autoload -o # optimized (classmap for all classes) — use in production
composer show             # list installed packages
composer outdated         # show packages with newer versions available
composer validate         # validate composer.json
composer audit            # check for security vulnerabilities` },

    { type: 'h2', text: 'The Lock File' },
    { type: 'callout', style: 'warn', title: 'Always commit composer.lock', html: 'The lock file pins every dependency (including transitive) to an exact version + hash. <code>composer install</code> installs exactly what is locked — reproducible builds. <code>composer update</code> resolves new versions and updates the lock file — do this intentionally, review the diff, and commit the updated lock.' },

    { type: 'h2', text: 'Optimized Autoloader for Production' },
    { type: 'code', lang: 'bash', label: 'bash', code: `# Production deploy — generate optimized classmap
composer install --no-dev --optimize-autoloader

# Or optimize existing:
composer dump-autoload --optimize --no-dev` },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      '<code>^1.2.3</code>: allow minor/patch upgrades, no major; safest for production',
      'Commit <code>composer.lock</code> — guarantees identical installs across all environments',
      '<code>composer install</code> uses the lock file; <code>composer update</code> resolves fresh versions',
      'Use <code>--no-dev</code> and <code>--optimize-autoloader</code> in production deploys',
      'Run <code>composer audit</code> in CI to catch known security vulnerabilities in dependencies',
    ]},
  ],
};
