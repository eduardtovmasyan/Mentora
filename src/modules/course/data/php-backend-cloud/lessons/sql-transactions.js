export default {
  phase: 'Phase 4 · Databases & APIs',
  title: 'SQL Transactions & ACID',
  intro: 'Transactions group multiple SQL operations into an atomic unit. ACID properties guarantee correctness under concurrent access. Senior engineers understand isolation levels, choose between optimistic and pessimistic locking, and know how to avoid deadlocks.',
  tags: ['ACID', 'Isolation levels', 'SELECT FOR UPDATE', 'Optimistic locking', 'Deadlocks', 'MVCC'],
  seniorExpectations: [
    'Explain all four ACID properties with concrete examples',
    'Describe the four isolation levels and what anomalies each prevents',
    'Implement pessimistic locking (SELECT FOR UPDATE) and optimistic locking (version column)',
    'Explain MVCC and why reads do not block writes in PostgreSQL',
    'Identify and prevent deadlocks by consistent lock ordering',
  ],
  body: `
<h2>ACID Properties</h2>
<table class="ctable">
  <thead><tr><th>Property</th><th>Meaning</th><th>Example</th></tr></thead>
  <tbody>
    <tr><td>Atomicity</td><td>All or nothing</td><td>Bank transfer: debit + credit both commit or both rollback</td></tr>
    <tr><td>Consistency</td><td>Valid state to valid state</td><td>Account balance constraint: can't go negative</td></tr>
    <tr><td>Isolation</td><td>Concurrent transactions don't see partial state</td><td>Two users booking last seat — only one succeeds</td></tr>
    <tr><td>Durability</td><td>Committed data survives crashes</td><td>Payment committed before server crash is not lost</td></tr>
  </tbody>
</table>

<h2>Isolation Levels & Anomalies</h2>
<table class="ctable">
  <thead><tr><th>Level</th><th>Dirty Read</th><th>Non-repeatable Read</th><th>Phantom Read</th></tr></thead>
  <tbody>
    <tr><td>READ UNCOMMITTED</td><td>Possible</td><td>Possible</td><td>Possible</td></tr>
    <tr><td>READ COMMITTED</td><td>No</td><td>Possible</td><td>Possible</td></tr>
    <tr><td>REPEATABLE READ</td><td>No</td><td>No</td><td>Possible (MySQL: No)</td></tr>
    <tr><td>SERIALIZABLE</td><td>No</td><td>No</td><td>No</td></tr>
  </tbody>
</table>

<h2>Pessimistic Locking</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">BEGIN;
SELECT balance FROM accounts WHERE id = 42 FOR UPDATE;
-- Other transactions waiting for id=42 will block until COMMIT/ROLLBACK
UPDATE accounts SET balance = balance - 100 WHERE id = 42;
UPDATE accounts SET balance = balance + 100 WHERE id = 99;
COMMIT;
</code></pre>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">DB::transaction(function() use ($fromId, $toId, $amount) {
    // Always lock in consistent order (smaller ID first) to prevent deadlocks
    [$first, $second] = $fromId < $toId
        ? [$fromId, $toId]
        : [$toId, $fromId];

    Account::whereIn('id', [$first, $second])
        ->orderBy('id')
        ->lockForUpdate()
        ->get()
        ->keyBy('id');

    $from = Account::find($fromId);
    if ($from->balance < $amount) throw new InsufficientFundsException();
    $from->decrement('balance', $amount);
    Account::find($toId)->increment('balance', $amount);
});
</code></pre>
</div>

<h2>Optimistic Locking</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Schema: add version column
ALTER TABLE products ADD COLUMN version INT DEFAULT 0;

-- Read
SELECT id, name, stock, version FROM products WHERE id = 42;
-- Returns: id=42, stock=10, version=5

-- Conditional update — fails if someone else updated meanwhile
UPDATE products
SET stock = 9, version = version + 1
WHERE id = 42 AND version = 5;
-- affected_rows = 0 means conflict → retry or return error
</code></pre>
</div>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Laravel with optimistic lock</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Eloquent doesn't have built-in optimistic locking — implement manually:
$product = Product::find(42);
$updated = Product::where('id', 42)
    ->where('version', $product->version)
    ->update(['stock' => $product->stock - 1, 'version' => $product->version + 1]);

if (!$updated) {
    throw new OptimisticLockException('Concurrent update detected, please retry');
}
</code></pre>
</div>

<div class="callout callout-info">
  <div class="callout-title">MVCC in PostgreSQL</div>
  <p>PostgreSQL uses Multi-Version Concurrency Control: every write creates a new row version. Readers see a consistent snapshot and never block writers. Writers never block readers. Only write-write conflicts cause blocking. This is why PostgreSQL default isolation (READ COMMITTED) is usually sufficient for most applications.</p>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: How do you prevent deadlocks?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <ul>
      <li><strong>Consistent lock ordering:</strong> always lock resources in the same order (e.g., by primary key ascending)</li>
      <li><strong>Short transactions:</strong> acquire locks, do work, release — minimize time holding locks</li>
      <li><strong>Lock timeouts:</strong> SET lock_timeout = '5s' to fail fast instead of waiting forever</li>
      <li><strong>Optimistic locking:</strong> avoids locks entirely — handles conflicts at commit time</li>
    </ul>
  </div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Default PostgreSQL isolation is READ COMMITTED; MySQL InnoDB default is REPEATABLE READ</li>
    <li>Pessimistic: lock row with FOR UPDATE — blocks other writers; use for high-contention resources</li>
    <li>Optimistic: version column + conditional update — no locks; better throughput for low-contention</li>
    <li>Prevent deadlocks: always acquire locks in the same order across transactions</li>
    <li>MVCC: readers never block writers and writers never block readers (PostgreSQL, InnoDB)</li>
  </ul>
</div>
`,
};
