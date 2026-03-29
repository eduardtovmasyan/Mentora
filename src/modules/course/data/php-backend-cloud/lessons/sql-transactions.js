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
  segments: [
    { type: 'h2', text: 'ACID Properties' },
    { type: 'table', headers: ['Property', 'Meaning', 'Example'], rows: [
      ['Atomicity',    'All or nothing',                                  'Bank transfer: debit + credit both commit or both rollback'],
      ['Consistency',  'Valid state to valid state',                      'Account balance constraint: can\'t go negative'],
      ['Isolation',    'Concurrent transactions don\'t see partial state', 'Two users booking last seat — only one succeeds'],
      ['Durability',   'Committed data survives crashes',                  'Payment committed before server crash is not lost'],
    ]},

    { type: 'h2', text: 'Isolation Levels & Anomalies' },
    { type: 'table', headers: ['Level', 'Dirty Read', 'Non-repeatable Read', 'Phantom Read'], rows: [
      ['READ UNCOMMITTED', 'Possible', 'Possible',                  'Possible'],
      ['READ COMMITTED',   'No',       'Possible',                  'Possible'],
      ['REPEATABLE READ',  'No',       'No',                        'Possible (MySQL: No)'],
      ['SERIALIZABLE',     'No',       'No',                        'No'],
    ]},

    { type: 'h2', text: 'Pessimistic Locking' },
    { type: 'code', lang: 'sql', label: 'SQL', code: `BEGIN;
SELECT balance FROM accounts WHERE id = 42 FOR UPDATE;
-- Other transactions waiting for id=42 will block until COMMIT/ROLLBACK
UPDATE accounts SET balance = balance - 100 WHERE id = 42;
UPDATE accounts SET balance = balance + 100 WHERE id = 99;
COMMIT;` },
    { type: 'code', lang: 'php', label: 'PHP — Laravel', code: `DB::transaction(function() use ($fromId, $toId, $amount) {
    // Always lock in consistent order (smaller ID first) to prevent deadlocks
    [$first, $second] = $fromId &lt; $toId
        ? [$fromId, $toId]
        : [$toId, $fromId];

    Account::whereIn('id', [$first, $second])
        ->orderBy('id')
        ->lockForUpdate()
        ->get()
        ->keyBy('id');

    $from = Account::find($fromId);
    if ($from->balance &lt; $amount) throw new InsufficientFundsException();
    $from->decrement('balance', $amount);
    Account::find($toId)->increment('balance', $amount);
});` },

    { type: 'h2', text: 'Optimistic Locking' },
    { type: 'code', lang: 'sql', label: 'SQL', code: `-- Schema: add version column
ALTER TABLE products ADD COLUMN version INT DEFAULT 0;

-- Read
SELECT id, name, stock, version FROM products WHERE id = 42;
-- Returns: id=42, stock=10, version=5

-- Conditional update — fails if someone else updated meanwhile
UPDATE products
SET stock = 9, version = version + 1
WHERE id = 42 AND version = 5;
-- affected_rows = 0 means conflict → retry or return error` },
    { type: 'code', lang: 'php', label: 'PHP — Laravel with optimistic lock', code: `// Eloquent doesn't have built-in optimistic locking — implement manually:
$product = Product::find(42);
$updated = Product::where('id', 42)
    ->where('version', $product->version)
    ->update(['stock' => $product->stock - 1, 'version' => $product->version + 1]);

if (!$updated) {
    throw new OptimisticLockException('Concurrent update detected, please retry');
}` },

    { type: 'callout', style: 'info', title: 'MVCC in PostgreSQL', html: 'PostgreSQL uses Multi-Version Concurrency Control: every write creates a new row version. Readers see a consistent snapshot and never block writers. Writers never block readers. Only write-write conflicts cause blocking. This is why PostgreSQL default isolation (READ COMMITTED) is usually sufficient for most applications.' },

    { type: 'qa', pairs: [
      {
        q: 'Q: How do you prevent deadlocks?',
        a: '<ul><li><strong>Consistent lock ordering:</strong> always lock resources in the same order (e.g., by primary key ascending)</li><li><strong>Short transactions:</strong> acquire locks, do work, release — minimize time holding locks</li><li><strong>Lock timeouts:</strong> SET lock_timeout = \'5s\' to fail fast instead of waiting forever</li><li><strong>Optimistic locking:</strong> avoids locks entirely — handles conflicts at commit time</li></ul>',
      },
    ]},

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Default PostgreSQL isolation is READ COMMITTED; MySQL InnoDB default is REPEATABLE READ',
      'Pessimistic: lock row with FOR UPDATE — blocks other writers; use for high-contention resources',
      'Optimistic: version column + conditional update — no locks; better throughput for low-contention',
      'Prevent deadlocks: always acquire locks in the same order across transactions',
      'MVCC: readers never block writers and writers never block readers (PostgreSQL, InnoDB)',
    ]},
  ],
};
