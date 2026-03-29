export default {
  phase: 'Phase 6 · Security',
  title: 'OAuth 2.0 & JWT',
  intro: 'OAuth 2.0 is an authorization framework that lets users grant third-party applications limited access to their accounts without sharing passwords. JWT (JSON Web Tokens) are self-contained tokens used for authentication and API authorization. Together they power SSO, social login, and API security in modern applications.',
  tags: ['OAuth 2.0', 'Authorization code flow', 'PKCE', 'JWT', 'Refresh tokens', 'OpenID Connect'],
  seniorExpectations: [
    'Explain the Authorization Code flow with PKCE (for public clients)',
    'Implement JWT generation, signing, and verification in PHP',
    'Design refresh token rotation with revocation support',
    'Distinguish authentication (who are you) from authorization (what can you do)',
    'Implement Laravel Sanctum for SPA authentication and Passport for OAuth server',
  ],
  segments: [
    { type: 'h2', text: 'OAuth 2.0 Flows' },
    { type: 'table', headers: ['Flow', 'Use case', 'Client type'], rows: [
      ['Authorization Code + PKCE', 'Web apps, SPAs, mobile', 'Public or confidential'],
      ['Client Credentials', 'Machine-to-machine (M2M)', 'Confidential (server)'],
      ['Device Code', 'TV, CLI, IoT', 'Public'],
      ['Implicit (deprecated)', 'Old SPAs', 'Avoid — use Auth Code + PKCE'],
    ]},

    { type: 'h2', text: 'Authorization Code Flow with PKCE' },
    { type: 'code', lang: 'php', label: 'PHP — PKCE generation', code: `// Step 1: Generate code verifier and challenge
$codeVerifier  = bin2hex(random_bytes(32)); // 64-char random string
$codeChallenge = rtrim(strtr(base64_encode(hash('sha256', $codeVerifier, true)), '+/', '-_'), '=');

// Store code verifier in session
Session::put('pkce_verifier', $codeVerifier);

// Step 2: Redirect to auth server
$authUrl = 'https://auth.example.com/authorize?' . http_build_query([
    'response_type'         => 'code',
    'client_id'             => config('oauth.client_id'),
    'redirect_uri'          => route('oauth.callback'),
    'scope'                 => 'openid profile email',
    'state'                 => csrf_token(), // CSRF protection
    'code_challenge'        => $codeChallenge,
    'code_challenge_method' => 'S256',
]);
return redirect($authUrl);

// Step 3: Exchange code for tokens (callback)
function handleCallback(Request $request): void {
    // Verify state (CSRF)
    if ($request->state !== session('_token')) abort(403);

    $response = Http::post('https://auth.example.com/token', [
        'grant_type'    => 'authorization_code',
        'code'          => $request->code,
        'redirect_uri'  => route('oauth.callback'),
        'client_id'     => config('oauth.client_id'),
        'code_verifier' => session('pkce_verifier'), // proves possession
    ]);
    $tokens = $response->json();
    // Store access_token, refresh_token securely
}` },

    { type: 'h2', text: 'JWT Structure & Verification' },
    { type: 'code', lang: 'php', label: 'PHP — JWT manual implementation', code: `function jwtSign(array $payload, string $secret): string {
    $header  = base64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64url_encode(json_encode($payload));
    $sig     = base64url_encode(hash_hmac('sha256', "{$header}.{$payload}", $secret, true));
    return "{$header}.{$payload}.{$sig}";
}

function jwtVerify(string $token, string $secret): array {
    [$header, $payload, $sig] = explode('.', $token);
    $expected = base64url_encode(hash_hmac('sha256', "{$header}.{$payload}", $secret, true));

    if (!hash_equals($expected, $sig)) throw new \\RuntimeException('Invalid JWT signature');

    $claims = json_decode(base64url_decode($payload), true);
    if ($claims['exp'] < time()) throw new \\RuntimeException('JWT expired');

    return $claims;
}

// In production use firebase/php-jwt or lcobucci/jwt library
// Issue token
$token = jwtSign([
    'sub'   => $user->id,
    'email' => $user->email,
    'roles' => ['user'],
    'iat'   => time(),
    'exp'   => time() + 3600, // 1 hour
], config('app.jwt_secret'));` },

    { type: 'h2', text: 'Refresh Token Rotation' },
    { type: 'code', lang: 'php', label: 'PHP — Secure refresh token handling', code: `class TokenService {
    public function refresh(string $refreshToken): array {
        $stored = RefreshToken::where('token', hash('sha256', $refreshToken))
            ->where('expires_at', '>', now())
            ->where('revoked', false)
            ->firstOrFail();

        // Rotation: revoke old token, issue new pair
        $stored->update(['revoked' => true]);

        $newRefresh = bin2hex(random_bytes(32));
        RefreshToken::create([
            'user_id'    => $stored->user_id,
            'token'      => hash('sha256', $newRefresh),
            'expires_at' => now()->addDays(30),
        ]);

        return [
            'access_token'  => $this->issueAccessToken($stored->user_id),
            'refresh_token' => $newRefresh, // send plain token to client
        ];
    }
}` },

    { type: 'callout', style: 'tip', title: 'Laravel Sanctum vs Passport', html: '<strong>Sanctum</strong>: simple token auth for SPAs and mobile apps. No full OAuth server. Use for first-party clients. <strong>Passport</strong>: full OAuth 2.0 server implementation. Use when you need to authorize third-party applications (like GitHub OAuth apps). Both use Laravel\'s guard system.' },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Always use Authorization Code + PKCE for public clients (SPAs, mobile) — never implicit flow',
      'JWT: verify signature AND expiry; use RS256 (asymmetric) for multi-service environments',
      'Refresh tokens: store hashed, rotate on use, revoke on suspicious reuse detection',
      'Never store JWTs in localStorage (XSS risk) — use httpOnly secure cookies for web apps',
      'OpenID Connect = OAuth 2.0 + identity layer (id_token with user claims)',
    ]},
  ],
};
