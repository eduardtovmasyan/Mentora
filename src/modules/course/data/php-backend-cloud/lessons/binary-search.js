export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'Binary Search',
  intro: 'Binary search finds an element in a sorted array in O(log n) time by repeatedly halving the search space. It covers exact match, first/last occurrence variants, and "binary search on the answer" — searching a value space defined by a monotone predicate.',
  tags: ['O(log n)', 'Sorted array', 'Lower bound', 'Upper bound', 'Search on answer'],
  seniorExpectations: [
    'Implement binary search without off-by-one errors using both closed and half-open templates',
    'Solve first/last occurrence variants (lower_bound / upper_bound)',
    'Apply binary search on the answer — define a monotone predicate, search the value space',
    'Handle rotated sorted array and find peak element variants',
    'Explain why mid = lo + (hi - lo) / 2 prevents overflow',
  ],
  body: `
<h2>Core Idea</h2>
<p>Maintain two pointers <code>lo</code> and <code>hi</code>. Pick the midpoint and eliminate half the search space based on a comparison. Requires sorted data or a monotone predicate.</p>

<div class="callout callout-tip">
  <div class="callout-title">Key Insight</div>
  <p>Binary search works on any <strong>monotone predicate</strong> — not just arrays. If the condition flips from false→true exactly once, you can binary search for the boundary.</p>
</div>

<h2>Template 1 — Exact Match (closed interval [lo, hi])</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">function binarySearch(array $nums, int $target): int {
    $lo = 0;
    $hi = count($nums) - 1;

    while ($lo <= $hi) {
        $mid = $lo + intdiv($hi - $lo, 2); // avoids overflow

        if ($nums[$mid] === $target) return $mid;
        if ($nums[$mid] < $target)   $lo = $mid + 1;
        else                          $hi = $mid - 1;
    }
    return -1;
}
</code></pre>
</div>

<h2>Template 2 — First True (left boundary / lower_bound)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// First index where nums[i] >= target
function lowerBound(array $nums, int $target): int {
    $lo = 0;
    $hi = count($nums); // half-open right boundary

    while ($lo < $hi) {
        $mid = $lo + intdiv($hi - $lo, 2);
        if ($nums[$mid] < $target) $lo = $mid + 1;
        else                        $hi = $mid;
    }
    return $lo;
}

function firstOccurrence(array $nums, int $target): int {
    $i = lowerBound($nums, $target);
    return ($i < count($nums) && $nums[$i] === $target) ? $i : -1;
}

function lastOccurrence(array $nums, int $target): int {
    $i = lowerBound($nums, $target + 1) - 1;
    return ($i >= 0 && $nums[$i] === $target) ? $i : -1;
}
</code></pre>
</div>

<h2>Binary Search on the Answer</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Min eating speed (LeetCode 875)</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">function minEatingSpeed(array $piles, int $h): int {
    $lo = 1;
    $hi = max($piles);

    while ($lo < $hi) {
        $mid   = $lo + intdiv($hi - $lo, 2);
        $hours = array_sum(array_map(fn($p) => (int)ceil($p / $mid), $piles));

        if ($hours <= $h) $hi = $mid;
        else              $lo = $mid + 1;
    }
    return $lo;
}
</code></pre>
</div>

<h2>Rotated Sorted Array</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — LeetCode 33</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">function searchRotated(array $nums, int $target): int {
    $lo = 0; $hi = count($nums) - 1;
    while ($lo <= $hi) {
        $mid = $lo + intdiv($hi - $lo, 2);
        if ($nums[$mid] === $target) return $mid;

        if ($nums[$lo] <= $nums[$mid]) {
            if ($nums[$lo] <= $target && $target < $nums[$mid]) $hi = $mid - 1;
            else                                                 $lo = $mid + 1;
        } else {
            if ($nums[$mid] < $target && $target <= $nums[$hi]) $lo = $mid + 1;
            else                                                 $hi = $mid - 1;
        }
    }
    return -1;
}
</code></pre>
</div>

<h2>Complexity</h2>
<table class="ctable">
  <thead><tr><th>Operation</th><th>Time</th><th>Space</th></tr></thead>
  <tbody>
    <tr><td>Exact / first / last occurrence</td><td class="olog">O(log n)</td><td class="o1">O(1)</td></tr>
    <tr><td>Search on answer (range R, check O(f))</td><td class="olog">O(log R · f(n))</td><td class="o1">O(1)</td></tr>
  </tbody>
</table>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Use <code>mid = lo + (hi - lo) / 2</code> to avoid integer overflow</li>
    <li>Closed [lo, hi]: <code>lo &lt;= hi</code>, shrink by <code>mid ± 1</code></li>
    <li>Half-open [lo, hi): <code>lo &lt; hi</code>, set <code>hi = mid</code> when condition holds</li>
    <li>Off-by-one is the #1 mistake — pick one template and be consistent</li>
    <li>"Binary search on the answer" — define a monotone predicate, search the value space not indices</li>
  </ul>
</div>
`,
};
