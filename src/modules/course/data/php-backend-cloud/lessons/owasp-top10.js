export default {
  phase: 'Phase 6 · Security & Performance',
  title: 'OWASP Top 10',
  intro: 'The OWASP Top 10 is the industry standard for web security risks. Every senior backend developer must know all 10, recognize them in code, and know how to prevent them. Security is not optional — it is a core responsibility.',
  tags: ['OWASP 2021', 'Broken Access Control', 'Injection', 'XSS', 'CSRF', 'JWT', 'PHP Security'],
  seniorExpectations: [
    'Name all 10 OWASP 2021 categories from memory',
    'Identify broken access control vulnerabilities in code',
    'Write SQL injection-proof code with prepared statements',
    'Configure secure session and cookie settings',
    'Implement brute-force protection and account lockout',
  ],

  // ── Structure ────────────────────────────────────────────────────────────
  // Segments define layout only. Text keys are resolved from bodyTexts below.
  // Code segments are always English — never translated.
  segments: [
    { type: 'h2', key: 'h_top10' },

    { type: 'h2', key: 'h_a01' },
    { type: 'p',  key: 'p_a01' },
    { type: 'code', lang: 'php', label: 'PHP — Access Control Fix', code: `&lt;?php
// VULNERABLE: user can see any order by changing ID in URL
public function show(int $orderId): array
{
    return $this->orderRepo->findById($orderId); // no ownership check!
}

// SECURE: always verify ownership
public function show(int $orderId): array
{
    $order = $this->orderRepo->findById($orderId);
    if ($order === null) throw new NotFoundException();
    if ($order->getUserId() !== $this->auth->id()) throw new ForbiddenException();
    return $order->toArray();
}

// BETTER: scope all queries to authenticated user
public function myOrders(): array
{
    return $this->orderRepo->findByUserId($this->auth->id()); // impossible to leak
}` },

    { type: 'h2', key: 'h_a02' },
    { type: 'code', lang: 'php', label: 'PHP — Cryptography', code: `&lt;?php
// NEVER use MD5 or SHA1 for passwords
$hash = md5($password);      // BROKEN — cracked in milliseconds
$hash = sha1($password);     // BROKEN — not for passwords

// CORRECT: bcrypt or argon2id
$hash  = password_hash($password, PASSWORD_ARGON2ID); // recommended
$valid = password_verify($password, $hash);            // timing-safe

// HTTPS: enforce in PHP
if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
    header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    exit();
}` },

    { type: 'h2', key: 'h_a03' },
    { type: 'code', lang: 'php', label: 'PHP — SQL Injection Prevention', code: `&lt;?php
// VULNERABLE: user input directly in query
$name  = $_GET['name']; // attacker sends: ' OR '1'='1
$query = "SELECT * FROM users WHERE name = '$name'"; // returns ALL users!

// SECURE: parameterized queries — ALWAYS
$stmt = $pdo->prepare('SELECT * FROM users WHERE name = ?');
$stmt->execute([$name]);

// Named parameters (cleaner for multiple params):
$stmt = $pdo->prepare('INSERT INTO users (name, email) VALUES (:name, :email)');
$stmt->execute([':name' => $name, ':email' => $email]);

// Command injection:
$file = escapeshellarg($_GET['file']); // ALWAYS escape shell arguments
exec("convert {$file} -resize 100x100 thumb.jpg");` },

    { type: 'h2', key: 'h_a07' },
    { type: 'code', lang: 'php', label: 'PHP — Secure Auth', code: `&lt;?php
class LoginController
{
    public function login(string $email, string $password): void
    {
        // Rate limiting: lock after 5 failed attempts
        $attempts = Cache::get("login:{$email}", 0);
        if ($attempts >= 5) {
            throw new TooManyAttemptsException('Try again in 15 minutes');
        }

        $user = $this->userRepo->findByEmail($email);

        if ($user === null || !password_verify($password, $user->getPasswordHash())) {
            Cache::increment("login:{$email}");
            Cache::expire("login:{$email}", 900); // 15 minutes
            // Same error for wrong email vs wrong password — prevents user enumeration
            throw new InvalidCredentialsException('Invalid email or password');
        }

        Cache::delete("login:{$email}");
        session_regenerate_id(true); // prevent session fixation
        $_SESSION['user_id'] = $user->getId();
    }
}

// Secure session config in php.ini or at app boot:
ini_set('session.cookie_httponly', 1);    // JS cannot access cookie
ini_set('session.cookie_secure', 1);      // HTTPS only
ini_set('session.cookie_samesite', 'Strict'); // CSRF protection
ini_set('session.use_strict_mode', 1);    // prevent session fixation` },

    { type: 'keypoints', key: 'keypoints' },
  ],

  // ── English source text ──────────────────────────────────────────────────
  // This is the English "locale". Russian/Armenian overrides live in ru.ts / hy.ts.
  bodyTexts: {
    h_top10: 'OWASP Top 10 — 2021 Edition',

    h_a01:  'A01: Broken Access Control (#1 — Most Critical)',
    p_a01:  'Users access resources they should not. Viewing another user\'s data, accessing admin functions, modifying records they don\'t own.',

    h_a02:  'A02: Cryptographic Failures',

    h_a03:  'A03: Injection (SQL, Command, LDAP)',

    h_a07:  'A07: Authentication Failures',

    keypoints: {
      title: 'OWASP Top 10 Quick Reference',
      items: [
        '<strong>A01 Broken Access Control:</strong> Always verify ownership. Scope queries to auth user.',
        '<strong>A02 Crypto Failures:</strong> Argon2id for passwords. HTTPS everywhere. Never MD5/SHA1.',
        '<strong>A03 Injection:</strong> Prepared statements always. escapeshellarg() for shell commands.',
        '<strong>A04 Insecure Design:</strong> Threat modeling. Defense in depth. Fail securely.',
        '<strong>A05 Security Misconfiguration:</strong> Disable PHP errors in production. Remove defaults. Patch.',
        '<strong>A06 Vulnerable Components:</strong> composer audit. Keep dependencies updated.',
        '<strong>A07 Auth Failures:</strong> Rate limit login. Regenerate session. Same error message.',
        '<strong>A08 Data Integrity Failures:</strong> Verify serialized data. Use signed tokens.',
        '<strong>A09 Security Logging:</strong> Log all auth events, access failures, validation failures.',
        '<strong>A10 SSRF:</strong> Validate/allowlist URLs in user input before server-side requests.',
      ],
    },
  },
};
