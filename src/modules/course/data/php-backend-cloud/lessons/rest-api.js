export default {
  phase: 'Phase 4 · Databases & APIs',
  title: 'REST API Design',
  intro: 'REST (Representational State Transfer) is an architectural style for HTTP APIs. Senior engineers design RESTful APIs that are consistent, versioned, secure, and documented. This means correct HTTP verbs and status codes, resource-oriented URLs, pagination, filtering, rate limiting, and OpenAPI specs.',
  tags: ['HTTP verbs', 'Status codes', 'Versioning', 'Pagination', 'HATEOAS', 'OpenAPI', 'Rate limiting'],
  seniorExpectations: [
    'Design resource-oriented URLs using nouns, not verbs',
    'Use correct HTTP methods (GET/POST/PUT/PATCH/DELETE) and status codes',
    'Implement cursor-based and offset-based pagination with Link headers',
    'Version APIs via URL prefix (/v1/) or Accept header',
    'Document APIs with OpenAPI 3.0 / Swagger and enforce request validation',
  ],
  body: `
<h2>Resource-Oriented URL Design</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">REST URL conventions</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-bash"># Good: nouns, hierarchical, plural
GET    /api/v1/users              # list users
POST   /api/v1/users              # create user
GET    /api/v1/users/42           # get user 42
PUT    /api/v1/users/42           # replace user 42
PATCH  /api/v1/users/42           # partial update user 42
DELETE /api/v1/users/42           # delete user 42

GET    /api/v1/users/42/orders    # user's orders (nested resource)
POST   /api/v1/orders/5/cancel    # action as sub-resource (not a verb URL)

# Bad: verbs in URLs
POST /api/getUser                 # bad
POST /api/createUser              # bad
GET  /api/deleteUser?id=42        # bad — GET must be safe/idempotent
</code></pre>
</div>

<h2>HTTP Status Codes</h2>
<table class="ctable">
  <thead><tr><th>Code</th><th>Meaning</th><th>When to use</th></tr></thead>
  <tbody>
    <tr><td>200 OK</td><td>Success with body</td><td>GET, PATCH, PUT responses</td></tr>
    <tr><td>201 Created</td><td>Resource created</td><td>POST that creates; include Location header</td></tr>
    <tr><td>204 No Content</td><td>Success, no body</td><td>DELETE, PATCH with no response body</td></tr>
    <tr><td>400 Bad Request</td><td>Client error</td><td>Validation failures — return error details</td></tr>
    <tr><td>401 Unauthorized</td><td>Not authenticated</td><td>Missing/invalid token</td></tr>
    <tr><td>403 Forbidden</td><td>Authenticated, not authorized</td><td>User lacks permission for this resource</td></tr>
    <tr><td>404 Not Found</td><td>Resource missing</td><td>ID doesn't exist</td></tr>
    <tr><td>409 Conflict</td><td>State conflict</td><td>Duplicate email, optimistic lock failure</td></tr>
    <tr><td>422 Unprocessable</td><td>Semantic error</td><td>Passes syntax but fails business rules</td></tr>
    <tr><td>429 Too Many</td><td>Rate limited</td><td>Include Retry-After header</td></tr>
    <tr><td>500 Server Error</td><td>Unexpected error</td><td>Unhandled exceptions — log, don't expose details</td></tr>
  </tbody>
</table>

<h2>Laravel API Resource Pattern</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// API Resource — controls shape of JSON response
class UserResource extends JsonResource {
    public function toArray(Request $request): array {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'created_at' => $this->created_at->toIso8601String(),
            'orders'     => OrderResource::collection($this->whenLoaded('orders')),
            // whenLoaded: include relationship only if eager-loaded (avoids N+1)
        ];
    }
}

// Controller
class UserController extends Controller {
    public function index(Request $request): AnonymousResourceCollection {
        $users = User::query()
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->sort, fn($q, $s) => $q->orderBy($s))
            ->paginate(20);

        return UserResource::collection($users);
        // Auto-wraps in { data: [...], links: {...}, meta: {...} }
    }

    public function store(StoreUserRequest $request): UserResource {
        $user = User::create($request->validated());
        return (new UserResource($user))->response()->setStatusCode(201);
    }
}
</code></pre>
</div>

<h2>Consistent Error Response Format</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Structured error responses</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// app/Exceptions/Handler.php — standardize all error responses
public function render($request, Throwable $e): Response {
    if ($request->expectsJson()) {
        if ($e instanceof ValidationException) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        }

        if ($e instanceof ModelNotFoundException) {
            return response()->json(['message' => 'Resource not found'], 404);
        }
    }
    return parent::render($request, $e);
}

// All errors follow: { "message": "...", "errors": { "field": ["..."] } }
</code></pre>
</div>

<h2>Pagination</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">JSON — Pagination response</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-json">{
  "data": [...],
  "meta": {
    "current_page": 2,
    "per_page": 20,
    "total": 158,
    "last_page": 8
  },
  "links": {
    "first": "/api/v1/users?page=1",
    "prev":  "/api/v1/users?page=1",
    "next":  "/api/v1/users?page=3",
    "last":  "/api/v1/users?page=8"
  }
}
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Cursor vs Offset Pagination</div>
  <p><strong>Offset</strong> (<code>?page=2</code>): simple but slow on large tables (OFFSET 10000 scans 10000 rows). Also drifts when records are inserted/deleted. <strong>Cursor</strong> (<code>?cursor=eyJpZCI6MTAwfQ</code>): uses WHERE id &gt; last_seen_id — O(log n) with index, stable. Use cursor for feeds and high-traffic APIs.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>URLs are nouns (resources), HTTP methods are verbs — never PUT /cancelOrder</li>
    <li>201 + Location header on creation; 204 on delete; 200 + body on update</li>
    <li>Return validation errors as structured JSON with field-level messages (422)</li>
    <li>Version from day one: /api/v1/ — changing is painful; removing is painful; versioning is free</li>
    <li>Cursor pagination for lists > 1000 rows — offset degrades linearly with page number</li>
  </ul>
</div>
`,
};
