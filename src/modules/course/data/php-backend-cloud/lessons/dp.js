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
  segments: [
    { type: 'h2', key: 'h_two_pillars' },
    { type: 'p', key: 'p_two_pillars_intro' },
    { type: 'ul', key: 'ul_two_pillars' },
    { type: 'p', key: 'p_two_pillars_when' },
    { type: 'callout', style: 'tip', key: 'callout_interview_tip' },

    { type: 'h2', key: 'h_memoization' },
    { type: 'p', key: 'p_memoization_intro' },
    {
      type: 'code',
      lang: 'php',
      label: 'Memoization (Top-Down)',
      code: `<?php
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
echo coinChange([1, 5, 6, 9], 11);   // 2  (two 6-coins? no: 6+5=11)`,
    },
    { type: 'p', key: 'p_memoization_stack' },

    { type: 'h2', key: 'h_tabulation' },
    { type: 'p', key: 'p_tabulation_intro' },
    {
      type: 'code',
      lang: 'php',
      label: 'Tabulation (Bottom-Up)',
      code: `<?php
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
echo coinChangeDP([1, 5, 6, 9], 11); // 2`,
    },

    { type: 'h2', key: 'h_1d_dp' },
    { type: 'p', key: 'p_1d_dp_intro' },
    { type: 'ul', key: 'ul_1d_dp_signals' },
    { type: 'p', key: 'p_1d_dp_coin' },
    { type: 'qa', key: 'qa' },

    { type: 'h2', key: 'h_2d_dp' },
    { type: 'p', key: 'p_2d_dp_intro' },
    { type: 'p', key: 'p_2d_dp_recurrence' },
    {
      type: 'code',
      lang: 'php',
      label: 'Longest Common Subsequence',
      code: `<?php
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
}`,
    },

    { type: 'h2', key: 'h_complexity' },
    { type: 'table', key: 'tbl_complexity' },

    { type: 'h2', key: 'h_recognising' },
    { type: 'p', key: 'p_recognising_signals' },
    { type: 'ul', key: 'ul_recognising_decision' },
    { type: 'p', key: 'p_recognising_patterns' },

    { type: 'keypoints', key: 'keypoints' },
  ],
  bodyTexts: {
    h_two_pillars: 'The Two Pillars: Overlapping Subproblems & Optimal Substructure',
    p_two_pillars_intro: 'A problem is a candidate for DP when two properties hold simultaneously:',
    ul_two_pillars: [
      '<strong>Overlapping subproblems</strong> — the recursive solution recomputes the same sub-instance many times. Fibonacci(5) calls Fibonacci(3) twice without caching.',
      '<strong>Optimal substructure</strong> — an optimal solution to the whole problem contains optimal solutions to its subproblems. Shortest paths in a graph exhibit this; the longest path does not (in general).',
    ],
    p_two_pillars_when: 'When both hold, caching intermediate results reduces exponential naive recursion to polynomial time. When only the second holds (no overlapping subproblems), plain recursion or greedy may suffice. When only the first holds (no optimal substructure), DP gives correct subproblem answers but composing them does not yield the global optimum.',
    callout_interview_tip: {
      title: 'Interview Tip',
      html: 'Before coding, write the recurrence relation on the whiteboard. Interviewers evaluate whether you can formalise the problem mathematically. "dp[i] = min(dp[i-1], dp[i-2]) + cost[i]" communicates more than five minutes of code.',
    },

    h_memoization: 'Memoization (Top-Down)',
    p_memoization_intro: 'Top-down DP starts from the original problem, recurses into subproblems, and caches each result in a hash map or array. It is the natural translation of a recursive solution and only computes states that are actually reachable — beneficial when the state space is sparse.',
    p_memoization_stack: 'The call stack depth for top-down is O(n) in the worst case. For very large n (e.g., n = 10⁶), PHP\'s default stack limit triggers a fatal error. In those cases, switch to tabulation or increase <code>memory_limit</code> and use an iterative approach.',

    h_tabulation: 'Tabulation (Bottom-Up)',
    p_tabulation_intro: 'Bottom-up DP fills a table starting from the base cases and iterates toward the answer. It avoids recursion overhead and is usually faster in practice due to better cache locality and no function-call overhead. The tradeoff is that you must compute all states up to n, even those that are unreachable in sparse problems.',

    h_1d_dp: '1D DP: Recognising the Pattern',
    p_1d_dp_intro: 'A large family of DP problems reduces to a 1D array where <code>dp[i]</code> depends on a fixed look-back window. The key signals in an interview problem statement:',
    ul_1d_dp_signals: [
      '"Minimum cost / maximum profit to reach position i" → likely dp[i] = f(dp[i-1], dp[i-2], …)',
      '"Number of ways to …" → dp[i] = dp[i-1] + dp[i-2] + … (counting variant)',
      '"Can you reach the end?" → dp[i] = any(dp[j]) for j reachable from i',
    ],
    p_1d_dp_coin: 'Coin Change is deceptively simple: <code>dp[i] = 1 + min(dp[i - coin] for each coin)</code>. The critical insight is that the outer loop is over amounts and the inner loop is over coins — reversing them changes the semantics entirely (unbounded vs 0/1 knapsack).',

    h_2d_dp: '2D DP: Longest Common Subsequence',
    p_2d_dp_intro: '2D DP problems operate on two sequences (strings, arrays) or a grid. The state is typically <code>dp[i][j]</code> representing the answer for the first i characters of one input and the first j of another. LCS is the canonical example and underpins diff tools, DNA alignment, and plagiarism detection.',
    p_2d_dp_recurrence: 'Recurrence: if <code>s1[i] == s2[j]</code> then <code>dp[i][j] = dp[i-1][j-1] + 1</code>, else <code>dp[i][j] = max(dp[i-1][j], dp[i][j-1])</code>.',

    h_complexity: 'Complexity Overview',
    tbl_complexity: {
      headers: ['Problem', 'States', 'Time', 'Space (naive)', 'Space (optimised)'],
      rows: [
        ['Fibonacci', 'n', { v: 'O(n)', cls: 'on' }, { v: 'O(n)', cls: 'on' }, { v: 'O(1)', cls: 'o1' }],
        ['Climbing Stairs', 'n', { v: 'O(n)', cls: 'on' }, { v: 'O(n)', cls: 'on' }, { v: 'O(1)', cls: 'o1' }],
        ['Coin Change', 'amount × |coins|', { v: 'O(A·C)', cls: 'on' }, { v: 'O(A)', cls: 'on' }, { v: 'O(A)', cls: 'on' }],
        ['LCS', 'm × n', { v: 'O(mn)', cls: 'on' }, { v: 'O(mn)', cls: 'on' }, { v: 'O(n)', cls: 'on' }],
        ['0/1 Knapsack', 'n × W', { v: 'O(nW)', cls: 'on' }, { v: 'O(nW)', cls: 'on' }, { v: 'O(W)', cls: 'on' }],
      ],
    },

    h_recognising: 'Recognising DP Problems in Interviews',
    p_recognising_signals: 'The fastest signal is the phrase "minimum / maximum number of …", "how many ways to …", or "is it possible to …". Combine that with a constraint structure where choices at each step are limited (e.g., "you can take 1 or 2 steps"), and you almost certainly need DP. The decision tree for choosing the algorithm:',
    ul_recognising_decision: [
      'Can I make a greedy choice that is provably optimal? (Greedy first — simpler)',
      'Does the problem have overlapping subproblems? (DP)',
      'Is the state space too large? (Consider approximation or pruning)',
    ],
    p_recognising_patterns: 'Common DP patterns to memorise: linear (Fibonacci family), interval (matrix chain multiplication, burst balloons), tree DP (house robber III), bitmask DP (travelling salesman for small n), and digit DP (count numbers with property in range).',

    qa: {
      pairs: [
        {
          q: 'When should you choose top-down memoization over bottom-up tabulation?',
          a: 'Choose top-down when: (1) the state space is large but sparse — you only compute reachable states; (2) the recurrence is complex and translating it directly from recursion is clearer; (3) you need the result for a single input and many states are irrelevant. Choose bottom-up when: (1) all states must be computed anyway; (2) recursion depth would overflow the stack; (3) you need maximum runtime performance and want to exploit CPU cache locality by iterating sequentially over an array.',
        },
        {
          q: 'What is the difference between 0/1 knapsack and unbounded knapsack, and how does the loop order change?',
          a: 'In 0/1 knapsack each item can be used at most once; in unbounded knapsack each item can be used unlimited times. For 0/1 knapsack with a 1D array, iterate the capacity loop <em>backwards</em> (from W down to weight[i]) so that each item is only considered once per outer iteration. For unbounded knapsack, iterate the capacity loop <em>forwards</em> so that a previously placed item can be used again in the same outer iteration. Getting this loop direction wrong is the single most common knapsack bug in interviews.',
        },
        {
          q: 'How do you reconstruct the actual solution (not just the optimal value) from a DP table?',
          a: 'During the fill phase, store a "parent" or "choice" array alongside the DP values: at each state, record which decision led to the optimal value. After the table is complete, trace back from the final state following parent pointers to reconstruct the path. For LCS, walk from dp[m][n] back to dp[0][0]: when characters matched, move diagonally (that character is in the LCS); otherwise move in the direction of the larger adjacent cell. This reconstruction costs O(m+n) for LCS and O(n) for linear problems.',
        },
      ],
    },

    keypoints: {
      title: 'Key Points to Remember',
      items: [
        'DP requires both overlapping subproblems AND optimal substructure; missing either means DP is the wrong tool.',
        'Always derive the recurrence relation before writing code — it is the contract your implementation must satisfy.',
        'Top-down (memoization) is easier to write; bottom-up (tabulation) is faster and avoids stack overflow for large inputs.',
        'Space optimisation is possible whenever the recurrence only looks at a fixed-size window of previous states — reduce from O(n²) to O(n) or O(1).',
        'Coin Change (unbounded) loops capacity forwards; 0/1 Knapsack loops capacity backwards — getting this wrong silently produces incorrect results.',
        'LCS is the foundation of diff algorithms, DNA alignment, and edit distance — understand it deeply.',
        'Interview signal words: "minimum cost", "maximum profit", "number of ways", "longest/shortest sequence" — all point to DP.',
      ],
    },
  },
};
