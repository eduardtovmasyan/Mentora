export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'Dynamic Programming',
  intro: 'Dynamic programming is an algorithmic technique for solving optimization and counting problems by breaking them into overlapping subproblems and caching results to avoid redundant computation. Unlike divide-and-conquer, DP subproblems overlap — solving the same smaller instance multiple times — and the problem must exhibit optimal substructure, meaning the global optimum can be constructed from optimal solutions to subproblems. Mastering DP is essential for senior engineers because it underlies caching strategies, shortest-path routing, sequence alignment, and financial modeling, and it appears in virtually every technical interview loop at FAANG-tier companies.',
  tags: ['dynamic-programming', 'memoization', 'tabulation', 'algorithms', 'php'],
  seniorExpectations: [
    'Identify overlapping subproblems and optimal substructure before writing a single line of code',
    'Derive the recurrence relation formally, then choose top-down vs bottom-up based on call-stack depth and sparsity of the state space',
    'Optimise space complexity when the recurrence only looks back a fixed number of states',
    'Recognise disguised DP problems (e.g., "minimum cost", "number of ways", "longest …") in interviews within seconds',
    'Analyse time and space complexity in terms of the number of unique states and work per state',
  ],
  body: `
<h2>The Two Pillars: Overlapping Subproblems &amp; Optimal Substructure</h2>
<p>A problem is a candidate for DP when two properties hold simultaneously:</p>
<ul>
  <li><strong>Overlapping subproblems</strong> — the recursive solution recomputes the same sub-instance many times. Fibonacci(5) calls Fibonacci(3) twice without caching.</li>
  <li><strong>Optimal substructure</strong> — an optimal solution to the whole problem contains optimal solutions to its subproblems. Shortest paths in a graph exhibit this; the longest path does not (in general).</li>
</ul>
<p>When both hold, caching intermediate results reduces exponential naive recursion to polynomial time. When only the second holds (no overlapping subproblems), plain recursion or greedy may suffice. When only the first holds (no optimal substructure), DP gives correct subproblem answers but composing them does not yield the global optimum.</p>

<div class="callout callout-tip">
  <div class="callout-title">Interview Tip</div>
  <p>Before coding, write the recurrence relation on the whiteboard. Interviewers evaluate whether you can formalise the problem mathematically. "dp[i] = min(dp[i-1], dp[i-2]) + cost[i]" communicates more than five minutes of code.</p>
</div>

<h2>Memoization (Top-Down)</h2>
<p>Top-down DP starts from the original problem, recurses into subproblems, and caches each result in a hash map or array. It is the natural translation of a recursive solution and only computes states that are actually reachable — beneficial when the state space is sparse.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Fibonacci — top-down with memoization
function fib(int $n, array &$memo = []): int
{
    if ($n <= 1) return $n;
    if (isset($memo[$n])) return $memo[$n];

    $memo[$n] = fib($n - 1, $memo) + fib($n - 2, $memo);
    return $memo[$n];
}

// Coin Change — minimum coins to make amount (top-down)
function coinChange(array $coins, int $amount, array &$memo = []): int
{
    if ($amount === 0) return 0;
    if ($amount < 0)  return PHP_INT_MAX;
    if (isset($memo[$amount])) return $memo[$amount];

    $best = PHP_INT_MAX;
    foreach ($coins as $coin) {
        $sub = coinChange($coins, $amount - $coin, $memo);
        if ($sub !== PHP_INT_MAX) {
            $best = min($best, $sub + 1);
        }
    }

    $memo[$amount] = $best;
    return $best;
}

echo fib(10);                        // 55
echo coinChange([1, 5, 6, 9], 11);   // 2  (two 6-coins? no: 6+5=11)
</code></pre>
</div>

<p>The call stack depth for top-down is O(n) in the worst case. For very large n (e.g., n = 10<sup>6</sup>), PHP's default stack limit triggers a fatal error. In those cases, switch to tabulation or increase <code>memory_limit</code> and use an iterative approach.</p>

<h2>Tabulation (Bottom-Up)</h2>
<p>Bottom-up DP fills a table starting from the base cases and iterates toward the answer. It avoids recursion overhead and is usually faster in practice due to better cache locality and no function-call overhead. The tradeoff is that you must compute all states up to n, even those that are unreachable in sparse problems.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Fibonacci — bottom-up, O(1) space optimisation
function fibBottomUp(int $n): int
{
    if ($n <= 1) return $n;
    [$prev2, $prev1] = [0, 1];
    for ($i = 2; $i <= $n; $i++) {
        [$prev2, $prev1] = [$prev1, $prev2 + $prev1];
    }
    return $prev1;
}

// Climbing Stairs — how many ways to reach step n (1 or 2 steps at a time)
function climbStairs(int $n): int
{
    if ($n <= 2) return $n;
    [$a, $b] = [1, 2];
    for ($i = 3; $i <= $n; $i++) {
        [$a, $b] = [$b, $a + $b];
    }
    return $b;
}

// Coin Change — bottom-up
function coinChangeDP(array $coins, int $amount): int
{
    $dp = array_fill(0, $amount + 1, PHP_INT_MAX);
    $dp[0] = 0;

    for ($i = 1; $i <= $amount; $i++) {
        foreach ($coins as $coin) {
            if ($coin <= $i && $dp[$i - $coin] !== PHP_INT_MAX) {
                $dp[$i] = min($dp[$i], $dp[$i - $coin] + 1);
            }
        }
    }

    return $dp[$amount] === PHP_INT_MAX ? -1 : $dp[$amount];
}

echo fibBottomUp(10);              // 55
echo climbStairs(5);               // 8
echo coinChangeDP([1, 5, 6, 9], 11); // 2
</code></pre>
</div>

<h2>1D DP: Recognising the Pattern</h2>
<p>A large family of DP problems reduces to a 1D array where <code>dp[i]</code> depends on a fixed look-back window. The key signals in an interview problem statement:</p>
<ul>
  <li>"Minimum cost / maximum profit to reach position i" → likely dp[i] = f(dp[i-1], dp[i-2], …)</li>
  <li>"Number of ways to …" → dp[i] = dp[i-1] + dp[i-2] + … (counting variant)</li>
  <li>"Can you reach the end?" → dp[i] = any(dp[j]) for j reachable from i</li>
</ul>
<p>Coin Change is deceptively simple: <code>dp[i] = 1 + min(dp[i - coin] for each coin)</code>. The critical insight is that the outer loop is over amounts and the inner loop is over coins — reversing them changes the semantics entirely (unbounded vs 0/1 knapsack).</p>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: When should you choose top-down memoization over bottom-up tabulation?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Choose top-down when: (1) the state space is large but sparse — you only compute reachable states; (2) the recurrence is complex and translating it directly from recursion is clearer; (3) you need the result for a single input and many states are irrelevant. Choose bottom-up when: (1) all states must be computed anyway; (2) recursion depth would overflow the stack; (3) you need maximum runtime performance and want to exploit CPU cache locality by iterating sequentially over an array.</p></div>
</div>

<h2>2D DP: Longest Common Subsequence</h2>
<p>2D DP problems operate on two sequences (strings, arrays) or a grid. The state is typically <code>dp[i][j]</code> representing the answer for the first i characters of one input and the first j of another. LCS is the canonical example and underpins diff tools, DNA alignment, and plagiarism detection.</p>
<p>Recurrence: if <code>s1[i] == s2[j]</code> then <code>dp[i][j] = dp[i-1][j-1] + 1</code>, else <code>dp[i][j] = max(dp[i-1][j], dp[i][j-1])</code>.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Longest Common Subsequence — O(m*n) time and space
function lcs(string $s1, string $s2): int
{
    $m = strlen($s1);
    $n = strlen($s2);
    // dp[i][j] = LCS length of s1[0..i-1] and s2[0..j-1]
    $dp = array_fill(0, $m + 1, array_fill(0, $n + 1, 0));

    for ($i = 1; $i <= $m; $i++) {
        for ($j = 1; $j <= $n; $j++) {
            if ($s1[$i - 1] === $s2[$j - 1]) {
                $dp[$i][$j] = $dp[$i - 1][$j - 1] + 1;
            } else {
                $dp[$i][$j] = max($dp[$i - 1][$j], $dp[$i][$j - 1]);
            }
        }
    }

    return $dp[$m][$n];
}

echo lcs('ABCBDAB', 'BDCABA'); // 4  (BCBA or BDAB)

// Space-optimised to O(n) — only need the previous row
function lcsOptimised(string $s1, string $s2): int
{
    $m = strlen($s1);
    $n = strlen($s2);
    $prev = array_fill(0, $n + 1, 0);

    for ($i = 1; $i <= $m; $i++) {
        $curr = array_fill(0, $n + 1, 0);
        for ($j = 1; $j <= $n; $j++) {
            $curr[$j] = $s1[$i - 1] === $s2[$j - 1]
                ? $prev[$j - 1] + 1
                : max($prev[$j], $curr[$j - 1]);
        }
        $prev = $curr;
    }

    return $prev[$n];
}
</code></pre>
</div>

<h2>Complexity Overview</h2>
<table class="ctable">
  <thead><tr><th>Problem</th><th>States</th><th>Time</th><th>Space (naive)</th><th>Space (optimised)</th></tr></thead>
  <tbody>
    <tr><td>Fibonacci</td><td>n</td><td class="on">O(n)</td><td class="on">O(n)</td><td class="o1">O(1)</td></tr>
    <tr><td>Climbing Stairs</td><td>n</td><td class="on">O(n)</td><td class="on">O(n)</td><td class="o1">O(1)</td></tr>
    <tr><td>Coin Change</td><td>amount × |coins|</td><td class="on">O(A·C)</td><td class="on">O(A)</td><td class="on">O(A)</td></tr>
    <tr><td>LCS</td><td>m × n</td><td class="on">O(mn)</td><td class="on">O(mn)</td><td class="on">O(n)</td></tr>
    <tr><td>0/1 Knapsack</td><td>n × W</td><td class="on">O(nW)</td><td class="on">O(nW)</td><td class="on">O(W)</td></tr>
  </tbody>
</table>

<h2>Recognising DP Problems in Interviews</h2>
<p>The fastest signal is the phrase "minimum / maximum number of …", "how many ways to …", or "is it possible to …". Combine that with a constraint structure where choices at each step are limited (e.g., "you can take 1 or 2 steps"), and you almost certainly need DP. The decision tree for choosing the algorithm:</p>
<ol>
  <li>Can I make a greedy choice that is provably optimal? (Greedy first — simpler)</li>
  <li>Does the problem have overlapping subproblems? (DP)</li>
  <li>Is the state space too large? (Consider approximation or pruning)</li>
</ol>
<p>Common DP patterns to memorise: linear (Fibonacci family), interval (matrix chain multiplication, burst balloons), tree DP (house robber III), bitmask DP (travelling salesman for small n), and digit DP (count numbers with property in range).</p>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: What is the difference between 0/1 knapsack and unbounded knapsack, and how does the loop order change?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>In 0/1 knapsack each item can be used at most once; in unbounded knapsack each item can be used unlimited times. For 0/1 knapsack with a 1D array, iterate the capacity loop <em>backwards</em> (from W down to weight[i]) so that each item is only considered once per outer iteration. For unbounded knapsack, iterate the capacity loop <em>forwards</em> so that a previously placed item can be used again in the same outer iteration. Getting this loop direction wrong is the single most common knapsack bug in interviews.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: How do you reconstruct the actual solution (not just the optimal value) from a DP table?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>During the fill phase, store a "parent" or "choice" array alongside the DP values: at each state, record which decision led to the optimal value. After the table is complete, trace back from the final state following parent pointers to reconstruct the path. For LCS, walk from dp[m][n] back to dp[0][0]: when characters matched, move diagonally (that character is in the LCS); otherwise move in the direction of the larger adjacent cell. This reconstruction costs O(m+n) for LCS and O(n) for linear problems.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>DP requires both overlapping subproblems AND optimal substructure; missing either means DP is the wrong tool.</li>
    <li>Always derive the recurrence relation before writing code — it is the contract your implementation must satisfy.</li>
    <li>Top-down (memoization) is easier to write; bottom-up (tabulation) is faster and avoids stack overflow for large inputs.</li>
    <li>Space optimisation is possible whenever the recurrence only looks at a fixed-size window of previous states — reduce from O(n²) to O(n) or O(1).</li>
    <li>Coin Change (unbounded) loops capacity forwards; 0/1 Knapsack loops capacity backwards — getting this wrong silently produces incorrect results.</li>
    <li>LCS is the foundation of diff algorithms, DNA alignment, and edit distance — understand it deeply.</li>
    <li>Interview signal words: "minimum cost", "maximum profit", "number of ways", "longest/shortest sequence" — all point to DP.</li>
  </ul>
</div>
`,
};
