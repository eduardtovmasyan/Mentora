export default {
  phase: 'Phase 6 · Security & Performance',
  title: 'JWT & Authentication',
  intro: 'JWT (JSON Web Tokens) are self-contained tokens for stateless authentication. After login, the server issues a signed JWT; subsequent requests present it in the Authorization header. Senior engineers understand JWT structure, signature algorithms (HS256 vs RS256), token storage security, refresh token rotation, and Laravel Sanctum vs Passport.',
  tags: ['JWT', 'HS256', 'RS256', 'Bearer token', 'Refresh tokens', 'Sanctum', 'Stateless auth'],
  seniorExpectations: [
    'Explain JWT structure: header.payload.signature and what each part contains',
    'Implement JWT issuance and verification in PHP; validate exp, iat, aud claims',
    'Choose HS256 (shared secret) vs RS256 (asymmetric keypair) and know when each is appropriate',
    'Implement refresh token rotation with revocation support',
    'Configure Laravel Sanctum for SPA auth and explain the CSRF double-submit cookie pattern',
  ],
  body: `
<h2>JWT Structure</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">JWT anatomy</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9    # Header (base64url)
.eyJzdWIiOiIxMjMiLCJlbWFpbCI6ImFsaWNlQHRlc3QuY29tIiwiZXhwIjoxNzA5MDAwMDAwfQ==  # Payload
.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  # Signature

# Decoded header:  { "alg": "HS256", "typ": "JWT" }
# Decoded payload: { "sub": "123", "email": "alice@test.com", "exp": 1709000000 }
# Signature: HMAC-SHA256(base64url(header) + "." + base64url(payload), secret)
</code></pre>
</div>

<h2>Issue & Verify JWT in PHP</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — using firebase/php-jwt</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService {
    private string $secret;
    private int    $accessTtl  = 3600;     // 1 hour
    private int    $refreshTtl = 2592000;  // 30 days

    public function __construct() {
        $this->secret = config('app.jwt_secret');
    }

    public function issueAccessToken(User $user): string {
        return JWT::encode([
            'sub'   => $user->id,
            'email' => $user->email,
            'roles' => $user->roles->pluck('name'),
            'iat'   => time(),
            'exp'   => time() + $this->accessTtl,
        ], $this->secret, 'HS256');
    }

    public function verify(string $token): object {
        // Throws ExpiredException, SignatureInvalidException, etc.
        return JWT::decode($token, new Key($this->secret, 'HS256'));
    }
}

// Auth Middleware
class JwtMiddleware {
    public function handle(Request $request, Closure $next): Response {
        $token = $request->bearerToken(); // reads Authorization: Bearer <token>
        if (!$token) return response()->json(['message' => 'Unauthenticated'], 401);

        try {
            $claims = app(JwtService::class)->verify($token);
            $request->merge(['auth_user_id' => $claims->sub]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        return $next($request);
    }
}
</code></pre>
</div>

<h2>HS256 vs RS256</h2>
<table class="ctable">
  <thead><tr><th>Algorithm</th><th>Key type</th><th>Verification</th><th>Use when</th></tr></thead>
  <tbody>
    <tr><td>HS256</td><td>Shared secret</td><td>Same secret needed</td><td>Single service — secret stays on one server</td></tr>
    <tr><td>RS256</td><td>RSA private+public</td><td>Public key only</td><td>Multiple services — each verifies with public key without knowing the private key</td></tr>
    <tr><td>ES256</td><td>ECDSA keypair</td><td>Public key only</td><td>Same as RS256 but smaller tokens, faster</td></tr>
  </tbody>
</table>

<h2>Refresh Token Rotation</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class AuthController extends Controller {
    public function login(LoginRequest $request): JsonResponse {
        $user = User::where('email', $request->email)->firstOrFail();
        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return response()->json($this->issueTokenPair($user));
    }

    public function refresh(Request $request): JsonResponse {
        $token   = $request->input('refresh_token');
        $stored  = RefreshToken::where('token', hash('sha256', $token))
            ->where('expires_at', '>', now())
            ->where('revoked', false)
            ->firstOrFail();

        // Rotation: revoke old, issue new pair
        $stored->update(['revoked' => true]);
        $user = User::find($stored->user_id);

        return response()->json($this->issueTokenPair($user));
    }

    private function issueTokenPair(User $user): array {
        $refreshToken = bin2hex(random_bytes(32));
        RefreshToken::create([
            'user_id'    => $user->id,
            'token'      => hash('sha256', $refreshToken),
            'expires_at' => now()->addDays(30),
        ]);

        return [
            'access_token'  => app(JwtService::class)->issueAccessToken($user),
            'refresh_token' => $refreshToken,
            'expires_in'    => 3600,
        ];
    }
}
</code></pre>
</div>

<h2>Token Storage Security</h2>
<div class="callout callout-warn">
  <div class="callout-title">localStorage is vulnerable to XSS</div>
  <p>Storing JWTs in <code>localStorage</code> means any XSS attack can steal them. Use <strong>httpOnly secure cookies</strong> for web apps — JavaScript cannot read httpOnly cookies, blocking XSS token theft. For SPAs, use Laravel Sanctum with cookie-based session auth instead of JWTs. Reserve JWTs for mobile apps and server-to-server APIs.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>JWT: header.payload.signature — all base64url encoded; payload is readable but signature is verified</li>
    <li>Always validate: exp (expiry), iat (issued at), and aud (audience) claims</li>
    <li>HS256: one shared secret; RS256: private key signs, public key verifies — use RS256 for multi-service</li>
    <li>Short-lived access tokens (1h) + long-lived refresh tokens (30d) with rotation on use</li>
    <li>Never store JWTs in localStorage — use httpOnly cookies or Laravel Sanctum for SPAs</li>
  </ul>
</div>
`,
};
