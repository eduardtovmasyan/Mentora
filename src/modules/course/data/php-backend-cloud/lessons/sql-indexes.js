export default {
  phase: 'Phase 4 · Databases & APIs',
  title: 'Indexes & Query Optimization',
  intro: 'A missing index on a 10M row table turns a 1ms query into a 30-second full scan. Understanding B-tree indexes, the leftmost prefix rule, covering indexes, and how to read EXPLAIN output is what separates senior developers from everyone else.',
  tags: ['B-tree', 'Composite index', 'Covering index', 'EXPLAIN', 'Leftmost prefix', 'Query optimization'],
  seniorExpectations: [
    'Explain B-tree structure and why lookup is O(log n)',
    'Design composite indexes with the correct column order',
    'Create a covering index that avoids table row lookups',
    'Read EXPLAIN and explain type, key, rows, Extra',
    'Identify the "function on indexed column" anti-pattern',
    'Know when NOT to add an index',
  ],
  body: `
<h2>How B-Tree Indexes Work</h2>
<p>A B-tree index is a <strong>separate sorted data structure</strong> with pointers back to table rows. Like a book's index — instead of reading every page to find "authentication", jump directly to the page number. B-tree lookup is <strong>O(log n)</strong>. For 1M rows: ~20 comparisons vs 1,000,000 without an index.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — Creating Indexes</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Single column
CREATE INDEX idx_users_email ON users (email);
CREATE UNIQUE INDEX idx_users_email ON users (email);

-- ALWAYS index foreign keys — MySQL won't do it automatically
CREATE INDEX idx_orders_customer ON orders (customer_id);

-- Composite index — column ORDER matters (leftmost prefix rule)
CREATE INDEX idx_orders_lookup ON orders (customer_id, status, created_at);

-- ✓ Uses the index:
SELECT * FROM orders WHERE customer_id = 5;
SELECT * FROM orders WHERE customer_id = 5 AND status = 'paid';
SELECT * FROM orders WHERE customer_id = 5 AND status = 'paid' AND created_at > '2024-01-01';

-- ✗ Does NOT use the index (skips leftmost columns):
SELECT * FROM orders WHERE status = 'paid';
SELECT * FROM orders WHERE created_at > '2024-01-01';

-- Covering index: all columns the query needs are IN the index
-- MySQL never touches the actual table row → fastest possible
CREATE INDEX idx_orders_covering ON orders (customer_id, status, total);
EXPLAIN SELECT SUM(total) FROM orders WHERE customer_id = 5 AND status = 'completed';
-- Extra: "Using index" ← never hit the table
</code></pre>
</div>

<h2>Reading EXPLAIN</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — EXPLAIN Output</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">EXPLAIN SELECT * FROM users WHERE email = 'ali@example.com';

-- type column (BEST → WORST):
-- const    → primary key / unique index — single row — fastest
-- eq_ref   → unique index join
-- ref      → non-unique index — multiple rows
-- range    → index range scan (BETWEEN, >, <, IN)
-- index    → full index scan — slow but better than ALL
-- ALL      → full TABLE scan — YOUR ENEMY — fix this!

-- key column:
-- NULL     = no index used = bad
-- idx_name = which index MySQL chose

-- rows column: estimated rows examined — lower is better

-- Extra column:
-- "Using index"      → covering index — fastest
-- "Using where"      → filter after index lookup
-- "Using filesort"   → no index for ORDER BY — slow!
-- "Using temporary"  → temp table — very slow!

-- BAD: wrapping indexed column in a function kills the index
EXPLAIN SELECT * FROM users WHERE YEAR(created_at) = 2024;
-- type: ALL — can't use index on created_at!

-- GOOD: let MySQL use a range on the raw column
EXPLAIN SELECT * FROM users
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31 23:59:59';
-- type: range
</code></pre>
</div>

<h2>Golden Rules</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — Indexing Rules</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- RULE 1: Never wrap indexed columns in functions
-- ✗ BAD:
WHERE LOWER(email) = 'ali@example.com'   -- index on email is useless
WHERE DATE(created_at) = '2024-01-15'    -- index on created_at is useless

-- ✓ GOOD: wrap the constant, not the column
WHERE email = LOWER('Ali@Example.com')
WHERE created_at >= '2024-01-15' AND created_at < '2024-01-16'

-- RULE 2: Composite index — equality columns first, range last
-- Good for: WHERE status='paid' AND created_at > X
CREATE INDEX good ON orders (status, created_at);
-- Bad for same query:
CREATE INDEX bad  ON orders (created_at, status); -- range on created_at blocks status use

-- RULE 3: When NOT to add an index
-- - Small tables (< 1000 rows) — full scan is negligible
-- - Columns rarely in WHERE/JOIN/ORDER BY
-- - Very low cardinality (boolean, gender) — optimizer may skip it anyway
-- - Write-heavy tables — every INSERT/UPDATE/DELETE must update all indexes

-- RULE 4: Avoid OFFSET for pagination — use keyset instead
-- ✗ BAD: reads 100000 rows then discards them
SELECT * FROM orders ORDER BY id LIMIT 10 OFFSET 100000;

-- ✓ GOOD: keyset pagination — always O(log n)
SELECT * FROM orders WHERE id > :last_seen_id ORDER BY id LIMIT 10;
</code></pre>
</div>

<h2>Interview Questions</h2>
<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)"><span class="qa-q-text">Q: A query is slow. Walk me through your debugging process.</span><span class="qa-arrow">▼</span></div>
  <div class="qa-a"><p>Step 1: run EXPLAIN. Look at type (ALL = bad), key (NULL = no index), rows (high = scanning many). Step 2: check if WHERE/JOIN columns are indexed. Step 3: check for functions on indexed columns. Step 4: check composite index column order matches your query's equality/range split. Step 5: check Extra for "Using filesort" or "Using temporary". Step 6: add or adjust indexes, re-run EXPLAIN to verify improvement. If the query is still slow after indexing, look at query structure — maybe a correlated subquery can be rewritten as a JOIN.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>B-tree: sorted, O(log n) lookup. Without index = O(n) full scan</li>
    <li>Composite index leftmost prefix: (a,b,c) helps (a), (a,b), (a,b,c) — not (b) alone</li>
    <li>Covering index: all needed columns in index → never reads table row. "Using index" in EXPLAIN.</li>
    <li>NEVER wrap indexed columns in functions — use the raw column in WHERE</li>
    <li>EXPLAIN type=ALL is your enemy. key=NULL means no index used.</li>
    <li>Always index FK columns in MySQL — not automatic like PostgreSQL</li>
    <li>Equality columns first, range columns last in composite indexes</li>
  </ul>
</div>
`,
};

// ── DOCKER ────────────────────────────────────────────────────────────
