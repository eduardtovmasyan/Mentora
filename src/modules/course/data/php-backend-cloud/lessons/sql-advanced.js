export default {
  phase: 'Phase 4 · Databases & APIs',
  title: 'SQL Advanced',
  intro: 'Beyond CRUD: window functions, CTEs, lateral joins, and query optimization. Senior engineers write complex analytical queries, understand execution plans, and know when to rewrite a subquery as a join.',
  tags: ['Window functions', 'CTEs', 'EXPLAIN', 'Running total', 'RANK', 'Recursive CTE'],
  seniorExpectations: [
    'Use window functions: ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG, SUM OVER',
    'Write recursive CTEs for hierarchical data (org charts, category trees)',
    'Read and interpret EXPLAIN / EXPLAIN ANALYZE output',
    'Solve top-N-per-group problems with window functions',
    'Rewrite correlated subqueries as JOINs for performance',
  ],
  body: `
<h2>Window Functions</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Running total of sales per salesperson
SELECT salesperson_id, sale_date, amount,
    SUM(amount) OVER (
        PARTITION BY salesperson_id
        ORDER BY sale_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_total
FROM sales;

-- Rank users by score within each country
SELECT user_id, country, score,
    RANK()       OVER (PARTITION BY country ORDER BY score DESC) AS rank,
    DENSE_RANK() OVER (PARTITION BY country ORDER BY score DESC) AS dense_rank,
    ROW_NUMBER() OVER (PARTITION BY country ORDER BY score DESC) AS row_num
FROM users;

-- Lead/Lag: compare with previous/next row
SELECT order_date, total,
    LAG(total)  OVER (ORDER BY order_date) AS prev_total,
    LEAD(total) OVER (ORDER BY order_date) AS next_total,
    total - LAG(total) OVER (ORDER BY order_date) AS delta
FROM orders;
</code></pre>
</div>

<h2>Top-N Per Group</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">WITH ranked AS (
    SELECT category_id, product_id, revenue,
        ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY revenue DESC) AS rn
    FROM products
)
SELECT * FROM ranked WHERE rn <= 3;
</code></pre>
</div>

<h2>Recursive CTEs</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — Org chart traversal</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">WITH RECURSIVE org_tree AS (
    SELECT id, name, manager_id, 0 AS depth
    FROM employees WHERE manager_id IS NULL  -- anchor
    UNION ALL
    SELECT e.id, e.name, e.manager_id, ot.depth + 1
    FROM employees e
    JOIN org_tree ot ON e.manager_id = ot.id  -- recursive
)
SELECT depth, name FROM org_tree ORDER BY depth;
</code></pre>
</div>

<h2>EXPLAIN ANALYZE</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name;

-- Seq Scan on large table → add index
-- Nested Loop with many rows → consider Hash Join
-- High actual vs estimated rows → run ANALYZE to refresh stats
</code></pre>
</div>

<h2>Correlated Subquery → JOIN</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Slow: correlated subquery executes once per user row
SELECT id, name, (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS cnt
FROM users u;

-- Fast: single aggregating JOIN
SELECT u.id, u.name, COALESCE(o.cnt, 0) AS cnt
FROM users u
LEFT JOIN (SELECT user_id, COUNT(*) AS cnt FROM orders GROUP BY user_id) o
    ON o.user_id = u.id;
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>PARTITION BY divides rows into groups for window calculations; ORDER BY sets the frame order</li>
    <li>RANK() has gaps (1,1,3); DENSE_RANK() doesn't (1,1,2); ROW_NUMBER() is always unique</li>
    <li>Recursive CTE: anchor query + UNION ALL + recursive member joining back to the CTE</li>
    <li>EXPLAIN ANALYZE: find Seq Scan on big tables, stale statistics, nested loop performance</li>
    <li>Correlated subquery = N executions; derived table JOIN = 1 scan — always prefer the JOIN</li>
  </ul>
</div>
`,
};
