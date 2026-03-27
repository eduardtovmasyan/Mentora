export default {
  phase: 'Phase 4 · Databases & APIs',
  title: 'SQL Fundamentals',
  intro: 'SQL is the language of relational databases. Every backend developer needs fluency — not just SELECT, but JOINs, GROUP BY, subqueries, and understanding query execution order. This lesson takes you from the basics to complex queries.',
  tags: ['SELECT', 'JOIN', 'GROUP BY', 'HAVING', 'Subqueries', 'CTEs', 'Execution order'],
  seniorExpectations: [
    'Know the SQL execution order (FROM before WHERE before SELECT)',
    'Write all JOIN types and explain when to use each',
    'Use window functions for ranking and running totals',
    'Write CTEs to make complex queries readable',
    'Know the difference between WHERE and HAVING',
    'Write recursive CTEs for hierarchical data',
  ],
  body: `
<h2>SQL Execution Order</h2>
<p>SQL is written in one order but executed in a different order. Understanding this is critical — it explains why you cannot use SELECT aliases in WHERE, and why HAVING exists:</p>
<ol>
  <li><strong>FROM & JOIN</strong> — which tables?</li>
  <li><strong>WHERE</strong> — filter rows (before aggregation, uses indexes)</li>
  <li><strong>GROUP BY</strong> — group rows into buckets</li>
  <li><strong>HAVING</strong> — filter groups (after aggregation)</li>
  <li><strong>SELECT</strong> — which columns to return</li>
  <li><strong>DISTINCT</strong> — remove duplicates</li>
  <li><strong>ORDER BY</strong> — sort results</li>
  <li><strong>LIMIT / OFFSET</strong> — pagination</li>
</ol>

<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — Core Queries</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- Full example: top 5 customers by 2024 revenue
SELECT
    c.id,
    c.name,
    COUNT(o.id)       AS total_orders,
    SUM(o.total)      AS revenue,
    AVG(o.total)      AS avg_order
FROM customers c
INNER JOIN orders o ON o.customer_id = c.id
WHERE o.created_at BETWEEN '2024-01-01' AND '2024-12-31'
  AND o.status = 'completed'
GROUP BY c.id, c.name
HAVING revenue > 1000          -- filter AFTER aggregation
ORDER BY revenue DESC
LIMIT 5;

-- COUNT traps:
SELECT
    COUNT(*)           AS all_rows,        -- counts NULLs
    COUNT(phone)       AS has_phone,       -- ignores NULLs!
    COUNT(DISTINCT city) AS unique_cities  -- distinct non-null values
FROM customers;
</code></pre>
</div>

<h2>All JOIN Types</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — JOINs</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- INNER JOIN: only rows matching in BOTH tables
SELECT u.name, d.name AS dept
FROM users u
INNER JOIN departments d ON u.department_id = d.id;

-- LEFT JOIN: ALL rows from left + matched from right (NULL if no match)
SELECT u.name, d.name AS dept  -- users with no dept get NULL for dept
FROM users u
LEFT JOIN departments d ON u.department_id = d.id;

-- Anti-join: find users with NO department
SELECT u.name FROM users u
LEFT JOIN departments d ON u.department_id = d.id
WHERE d.id IS NULL;

-- Self-join: employees and their managers (same table)
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
</code></pre>
</div>

<h2>CTEs & Window Functions</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">SQL — CTEs & Windows</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-sql">-- CTE: named temporary result set — makes complex queries readable
WITH monthly_revenue AS (
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
           SUM(total) AS revenue
    FROM orders
    WHERE status = 'completed'
    GROUP BY month
),
ranked AS (
    SELECT *, RANK() OVER (ORDER BY revenue DESC) AS rnk
    FROM monthly_revenue
)
SELECT month, revenue, rnk
FROM ranked WHERE rnk <= 3;

-- Window functions: aggregate WITHOUT collapsing rows
SELECT
    name,
    department,
    salary,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg,
    RANK()      OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,
    LAG(salary) OVER (ORDER BY hire_date)      AS prev_salary
FROM employees;

-- Recursive CTE: traverse category tree
WITH RECURSIVE tree AS (
    SELECT id, name, parent_id, 0 AS depth
    FROM categories WHERE parent_id IS NULL  -- anchor
    UNION ALL
    SELECT c.id, c.name, c.parent_id, t.depth + 1
    FROM categories c JOIN tree t ON c.parent_id = t.id
)
SELECT REPEAT('  ', depth) || name AS hierarchy FROM tree;
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Execution order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT</li>
    <li>WHERE filters rows before grouping (uses indexes). HAVING filters groups after aggregation.</li>
    <li>COUNT(*) counts all rows including NULLs. COUNT(column) ignores NULLs — common trap!</li>
    <li>INNER JOIN = only matches. LEFT JOIN = all left rows, NULL for unmatched right.</li>
    <li>Anti-join pattern: LEFT JOIN + WHERE right.id IS NULL — find rows with no match</li>
    <li>CTEs (WITH clause): name intermediate results for readable complex queries</li>
    <li>Window functions: RANK, ROW_NUMBER, LAG, LEAD, SUM OVER — aggregate without collapsing</li>
  </ul>
</div>
`,
};
