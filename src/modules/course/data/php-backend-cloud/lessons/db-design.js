export default {
  phase: 'Phase 4 · Databases & APIs',
  title: 'Database Design',
  intro: 'Good database design starts with normalization (eliminate redundancy), chooses the right relationships (1:1, 1:N, M:N), and balances normalization against read performance. Senior engineers model domains accurately, use surrogate vs natural keys deliberately, and understand when to denormalize for performance.',
  tags: ['Normalization', '1NF 2NF 3NF', 'Foreign keys', 'Surrogate keys', 'Denormalization', 'ERD'],
  seniorExpectations: [
    'Apply 1NF, 2NF, 3NF normalization to a schema',
    'Design M:N relationships with a junction table and proper indexes',
    'Choose between surrogate (UUID/auto-increment) and natural keys with justification',
    'Know when to denormalize: summary tables, materialized views, caching columns',
    'Design soft delete with deleted_at and explain its query implications',
  ],
  body: `
<h2>Normal Forms</h2>
<table class="ctable">
  <thead><tr><th>Form</th><th>Rule</th><th>Violation Example</th></tr></thead>
  <tbody>
    <tr><td>1NF</td><td>Atomic values, no repeating groups</td><td>tags column storing "php,mysql,redis"</td></tr>
    <tr><td>2NF</td><td>No partial dependency on composite key</td><td>order_items(order_id, product_id, product_name) — product_name depends only on product_id</td></tr>
    <tr><td>3NF</td><td>No transitive dependency</td><td>users(id, zip_code, city) — city depends on zip_code, not id</td></tr>
    <tr><td>BCNF</td><td>Every determinant is a candidate key</td><td>Rare in practice — 3NF usually sufficient</td></tr>
  </tbody>
</table>

<h2>Relationships</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — M:N with junction table</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">CREATE TABLE users (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE roles (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Junction table for M:N relationship
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT    NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)  -- composite PK prevents duplicates
);

-- Index for reverse lookup (find all users with a role)
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
</code></pre>
</div>

<h2>UUID vs Auto-increment</h2>
<table class="ctable">
  <thead><tr><th>Aspect</th><th>Auto-increment (BIGSERIAL)</th><th>UUID v4</th><th>UUID v7 (ordered)</th></tr></thead>
  <tbody>
    <tr><td>Index performance</td><td class="o1">Sequential — excellent</td><td class="on">Random — index fragmentation</td><td class="olog">Sequential — good</td></tr>
    <tr><td>Global uniqueness</td><td>No (DB-scoped)</td><td>Yes</td><td>Yes</td></tr>
    <tr><td>Security (enumerable)</td><td>Predictable</td><td>Non-guessable</td><td>Non-guessable</td></tr>
    <tr><td>Storage</td><td>8 bytes</td><td>16 bytes</td><td>16 bytes</td></tr>
  </tbody>
</table>

<h2>Soft Delete Pattern</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;

-- "Delete" a user
UPDATE users SET deleted_at = NOW() WHERE id = 42;

-- Every query MUST filter deleted rows — easy to forget
SELECT * FROM users WHERE deleted_at IS NULL;

-- Partial index makes this efficient
CREATE INDEX idx_users_active ON users(email) WHERE deleted_at IS NULL;
</code></pre>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel SoftDeletes</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Model {
    use SoftDeletes; // adds deleted_at, filters automatically in all queries

    // $user->delete()        → sets deleted_at
    // User::withTrashed()    → includes soft-deleted
    // User::onlyTrashed()    → only soft-deleted
    // $user->restore()       → clears deleted_at
    // $user->forceDelete()   → permanent delete
}
</code></pre>
</div>

<h2>Denormalization Patterns</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — Cached computed column</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Instead of COUNT(comments) on every page load, cache it
ALTER TABLE posts ADD COLUMN comment_count INT DEFAULT 0;

-- Update via trigger or application logic when comment is added/deleted
CREATE OR REPLACE FUNCTION update_comment_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>3NF is the target for OLTP schemas; denormalize only for measured performance problems</li>
    <li>M:N junction tables need a composite PK and indexes on both foreign key columns</li>
    <li>Use UUID v7 (time-ordered) for distributed systems — avoids index fragmentation of random UUID v4</li>
    <li>Soft delete: every query needs WHERE deleted_at IS NULL — use partial index and ORM traits</li>
    <li>Denormalization techniques: cached count columns, summary tables, materialized views, JSON blobs</li>
  </ul>
</div>
`,
};
