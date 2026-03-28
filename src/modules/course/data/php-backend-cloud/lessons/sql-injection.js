export default {
  phase: 'Phase 6 · Security',
  title: 'SQL Injection',
  intro: 'SQL Injection is the #1 web vulnerability: an attacker injects malicious SQL into user input that is concatenated into a query. It can dump entire databases, bypass authentication, and delete data. Prevention is simple: always use parameterized queries. Senior engineers also understand second-order injection, ORM injection risks, and blind SQLi.',
  tags: ['Parameterized queries', 'PDO', 'Blind SQLi', 'Second-order', 'ORM risks', 'OWASP #1'],
  seniorExpectations: [
    'Explain why string concatenation enables SQL injection',
    'Use PDO prepared statements and Eloquent parameter binding',
    'Identify second-order SQL injection (stored then executed)',
    'Recognize blind SQL injection techniques (boolean-based, time-based)',
    'Configure database accounts with least privilege to limit injection blast radius',
  ],
  body: `
<h2>The Vulnerability</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Vulnerable code</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// NEVER do this — user input directly in query string
$username = $_POST['username']; // attacker input: admin'--
$query = "SELECT * FROM users WHERE username = '$username'";
// Resulting query: SELECT * FROM users WHERE username = 'admin'--'
// The -- comments out the rest — bypasses password check

// Attacker could also use: ' OR '1'='1
// Making query: SELECT * FROM users WHERE username = '' OR '1'='1'
// Returns ALL users
</code></pre>
</div>

<h2>Fix: Parameterized Queries (PDO)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Safe PDO</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// PDO prepared statement — parameter is NEVER part of SQL string
$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? AND password_hash = ?');
$stmt->execute([$username, hash('sha256', $password)]);
$user = $stmt->fetch();

// Named parameters
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute([':email' => $email]);

// PDO with ATTR_EMULATE_PREPARES = false is critical on MySQL
// (true mode just does string escaping, not real parameterization)
$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_EMULATE_PREPARES   => false, // MUST be false for real parameterization
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);
</code></pre>
</div>

<h2>Laravel / Eloquent</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Safe and unsafe Eloquent</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// SAFE: Eloquent automatically parameterizes values
User::where('email', $email)->first();
DB::table('users')->where('status', $status)->get();

// SAFE: explicit binding
DB::select('SELECT * FROM users WHERE email = ?', [$email]);
DB::select('SELECT * FROM users WHERE email = :email', ['email' => $email]);

// DANGEROUS: raw expressions with user input
User::whereRaw("name = '{$name}'")->get();     // VULNERABLE
DB::statement("DROP TABLE {$tableName}");      // VULNERABLE

// SAFE: whereRaw with bindings
User::whereRaw('name = ?', [$name])->get();    // OK
User::whereRaw('created_at > :date', ['date' => $date])->get(); // OK

// Identifiers (column names, table names) CANNOT be parameterized
// Always whitelist them:
$allowedColumns = ['name', 'email', 'created_at'];
$column = in_array($request->sort, $allowedColumns) ? $request->sort : 'name';
User::orderBy($column)->get();
</code></pre>
</div>

<h2>Second-Order SQL Injection</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">Scenario</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Step 1: Register with username: admin'--
# Input is safely stored in DB: INSERT uses parameterized query

# Step 2: Change password — application retrieves username from DB, uses it unsafely:
$username = $user->username; // retrieved from DB: "admin'--"
$sql = "UPDATE users SET password = '$newHash' WHERE username = '$username'";
# Resulting: UPDATE users SET password = '...' WHERE username = 'admin'--'
# Actually updates admin's password, not the attacker's!
</code></pre>
</div>

<h2>Least Privilege</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — DB user permissions</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Application DB user: only needs SELECT, INSERT, UPDATE, DELETE
CREATE USER app_user WITH PASSWORD 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- Never GRANT DROP, CREATE, TRUNCATE, or superuser privileges

-- Separate read-only replica user
CREATE USER readonly_user WITH PASSWORD 'password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Never concatenate user input into SQL — always use parameterized queries / prepared statements</li>
    <li>PDO: set ATTR_EMULATE_PREPARES=false for real parameterization on MySQL</li>
    <li>Eloquent is safe for values — but whereRaw() with string interpolation is vulnerable</li>
    <li>Column/table names cannot be parameterized — whitelist them explicitly</li>
    <li>Second-order SQLi: data stored safely but later used unsafely — treat DB values as untrusted too</li>
    <li>Least privilege: app DB user should not have DROP, CREATE, or superuser permissions</li>
  </ul>
</div>
`,
};
