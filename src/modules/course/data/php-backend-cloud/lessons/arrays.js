export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'Arrays',
  intro: 'An array stores elements in contiguous memory, giving O(1) random access by index. In PHP arrays are ordered hash tables — flexible but with more overhead. Arrays are the foundation of almost every interview problem.',
  tags: ['O(1) access', 'Two Pointers', 'Sliding Window', 'Prefix Sum', 'Critical'],
  seniorExpectations: [
    'State time/space complexity for every operation instantly',
    'Recognize Two Pointer pattern in under 30 seconds',
    'Recognize Sliding Window pattern in under 30 seconds',
    'Know PHP-specific array internals (ordered hash map, not raw memory)',
    'Convert O(n²) brute-force to O(n) using the right pattern',
  ],
  body: `
<h2>What Is an Array?</h2>
<p>A traditional array stores elements in <strong>contiguous memory</strong>. The CPU can compute any element's address instantly: <code>base + (index × size)</code>. That's why access is O(1).</p>
<p>PHP arrays are actually <strong>ordered hash tables</strong> — they support string keys, mixed types, and maintain insertion order. More flexible, but heavier per element than a raw C array. Know both models for interviews.</p>

<h2>Time & Space Complexity</h2>
<table class="ctable">
  <thead><tr><th>Operation</th><th>Average</th><th>Worst</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td>Access by index</td><td class="o1">O(1)</td><td class="o1">O(1)</td><td>Direct address calculation</td></tr>
    <tr><td>Search (unsorted)</td><td class="on">O(n)</td><td class="on">O(n)</td><td>Must scan every element</td></tr>
    <tr><td>Search (sorted)</td><td class="olog">O(log n)</td><td class="olog">O(log n)</td><td>Binary search</td></tr>
    <tr><td>Insert at end</td><td class="o1">O(1)*</td><td class="on">O(n)</td><td>*Amortized; O(n) on resize</td></tr>
    <tr><td>Insert at front/middle</td><td class="on">O(n)</td><td class="on">O(n)</td><td>All elements must shift</td></tr>
    <tr><td>Delete at end</td><td class="o1">O(1)</td><td class="o1">O(1)</td><td>Just reduce size</td></tr>
    <tr><td>Delete at front/middle</td><td class="on">O(n)</td><td class="on">O(n)</td><td>All elements must shift</td></tr>
    <tr><td>Space</td><td class="on" colspan="2">O(n)</td><td>n = number of elements</td></tr>
  </tbody>
</table>

<h2>PHP Array Operations — Complete Reference</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// ── CREATING ─────────────────────────────────────────────────
$arr    = [1, 2, 3, 4, 5];
$assoc  = ['name' => 'Ali', 'age' => 30];
$matrix = [[1,2,3],[4,5,6],[7,8,9]];

// ── ADDING ───────────────────────────────────────────────────
$arr[] = 6;                   // append — O(1) amortized
array_push($arr, 7, 8);       // append multiple
array_unshift($arr, 0);       // prepend — O(n) shifts ALL elements!

// ── REMOVING ─────────────────────────────────────────────────
array_pop($arr);              // remove last  — O(1)
array_shift($arr);            // remove first — O(n) shifts ALL elements!
unset($arr[2]);               // remove by key — leaves a gap in keys
$arr = array_values($arr);    // re-index after unset

// ── SEARCHING ────────────────────────────────────────────────
in_array(3, $arr);            // O(n) — linear scan
array_search(3, $arr);        // O(n) — returns key or false
isset($arr[2]);               // O(1) — index exists?

// ── SORTING ──────────────────────────────────────────────────
sort($arr);                   // by value, re-index       O(n log n)
rsort($arr);                  // reverse by value         O(n log n)
asort($arr);                  // by value, keep keys      O(n log n)
ksort($arr);                  // by key                   O(n log n)
usort($arr, fn($a, $b) => $a - $b); // custom comparator

// ── FUNCTIONAL ───────────────────────────────────────────────
$evens   = array_filter($arr, fn($n) => $n % 2 === 0);  // O(n)
$doubled = array_map(fn($n) => $n * 2, $arr);            // O(n)
$sum     = array_reduce($arr, fn($c, $i) => $c + $i, 0); // O(n)

// ── UTILITIES ────────────────────────────────────────────────
count($arr);                      // O(1) — stored internally by PHP
array_unique($arr);               // O(n log n)
array_reverse($arr);              // O(n)
array_flip($arr);                 // swap keys & values  O(n)
array_chunk($arr, 3);             // split into chunks of 3
range(1, 10);                     // [1,2,3,...,10]
</code></pre>
</div>

<div class="callout callout-warn">
<div class="callout-title">Interview Trap</div>
<p><code>array_shift()</code> and <code>array_unshift()</code> are O(n) — they re-index all numeric keys. For O(1) dequeue from both ends use <code>SplDoublyLinkedList</code> or <code>SplQueue</code>.</p>
</div>

<h2>Pattern 1 — Two Pointers</h2>
<p>Use two indexes — often one from each end — to solve in <strong>O(n)</strong> what brute force does in O(n²). Works because on a <em>sorted</em> array you know exactly which direction to move each pointer.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Two Pointers</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Two Sum II — sorted array, return 1-indexed pair
// [2,7,11,15], target=9 → [1,2]
function twoSum(array $numbers, int $target): array
{
    $left = 0; $right = count($numbers) - 1;
    while ($left < $right) {
        $sum = $numbers[$left] + $numbers[$right];
        if ($sum === $target)     return [$left + 1, $right + 1];
        elseif ($sum < $target)   $left++;
        else                      $right--;
    }
    return [];
}
// Time: O(n)  |  Space: O(1)

// Remove Duplicates from Sorted Array — in-place
// [0,0,1,1,2,3,3] → returns 4, array=[0,1,2,3,...]
function removeDuplicates(array &$nums): int
{
    $slow = 0;
    for ($fast = 1; $fast < count($nums); $fast++) {
        if ($nums[$fast] !== $nums[$slow]) {
            $nums[++$slow] = $nums[$fast];
        }
    }
    return $slow + 1;
}
// Time: O(n)  |  Space: O(1)
</code></pre>
</div>

<h2>Pattern 2 — Sliding Window</h2>
<p>Maintain a contiguous subarray via left+right pointers. Expand right to grow; shrink left when constraint violated. O(n²) → O(n).</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Sliding Window</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Max sum subarray of fixed size k
// [2,1,5,1,3,2], k=3 → 9 (subarray [5,1,3])
function maxSumSubarray(array $nums, int $k): int
{
    $windowSum = array_sum(array_slice($nums, 0, $k));
    $maxSum    = $windowSum;
    for ($i = $k; $i < count($nums); $i++) {
        $windowSum += $nums[$i] - $nums[$i - $k];
        $maxSum     = max($maxSum, $windowSum);
    }
    return $maxSum;
}
// Time: O(n)  |  Space: O(1)

// Longest substring without repeating characters
// "abcabcbb" → 3 ("abc")
function lengthOfLongestSubstring(string $s): int
{
    $seen = []; $maxLen = 0; $left = 0;
    for ($r = 0; $r < strlen($s); $r++) {
        $c = $s[$r];
        if (isset($seen[$c]) && $seen[$c] >= $left) {
            $left = $seen[$c] + 1;
        }
        $seen[$c] = $r;
        $maxLen   = max($maxLen, $r - $left + 1);
    }
    return $maxLen;
}
// Time: O(n)  |  Space: O(1) — alphabet-bounded
</code></pre>
</div>

<h2>Pattern 3 — Prefix Sum</h2>
<p>Precompute cumulative sums. Build once O(n), answer each range query in O(1).</p>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Prefix Sum</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// prefix[i] = sum of nums[0..i-1]
// Sum of nums[left..right] = prefix[right+1] - prefix[left]
function buildPrefix(array $nums): array
{
    $p = [0];
    foreach ($nums as $n) $p[] = end($p) + $n;
    return $p;
}

$nums   = [1, 3, 5, 7, 9];
$prefix = buildPrefix($nums); // [0, 1, 4, 9, 16, 25]
$sum    = $prefix[4] - $prefix[1]; // 9+16 − 1 = 15  (nums[1..3] = 3+5+7)
</code></pre>
</div>

<h2>Interview Questions</h2>
<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)"><span class="qa-q-text">Q: What is the difference between array_merge() and the + operator?</span><span class="qa-arrow">▼</span></div>
  <div class="qa-a"><p><code>array_merge()</code> renumbers numeric keys from 0 and appends the second array. For string keys the second array overwrites the first. The <code>+</code> operator keeps the first value for any duplicate key (numeric or string) and only adds missing keys from the right operand. Example: <code>[0=>'a'] + [0=>'b']</code> → <code>[0=>'a']</code>, but <code>array_merge([0=>'a'], [0=>'b'])</code> → <code>[0=>'a', 1=>'b']</code>.</p></div>
</div>
<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)"><span class="qa-q-text">Q: Why is inserting at the beginning O(n)?</span><span class="qa-arrow">▼</span></div>
  <div class="qa-a"><p>Every existing element must shift one position right to make room. In PHP's hash table, every numeric key must be re-indexed. That's n writes for n elements. If you frequently need O(1) insertion at the front, use <code>SplDoublyLinkedList</code> which has dedicated head/tail pointers.</p></div>
</div>
<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)"><span class="qa-q-text">Q: When does a sliding window NOT work?</span><span class="qa-arrow">▼</span></div>
  <div class="qa-a"><p>Sliding window requires that the constraint is <em>monotonic</em> — adding an element either always makes the window valid or always makes it invalid. It breaks down when elements can both help and hurt the constraint simultaneously (e.g., subarrays with both positive and negative numbers where the sum can go up or down). For those cases use prefix sums with a hash map, or dynamic programming.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>O(1) access by index is the array superpower — exploit it</li>
    <li>Insert/delete at front is O(n) — common interview trap</li>
    <li>PHP arrays are ordered hash maps — not raw contiguous memory</li>
    <li><code>array_shift()</code> is O(n). Use <code>SplQueue</code> for fast dequeue</li>
    <li>Two Pointers: sorted array, finding pairs — converts O(n²) → O(n)</li>
    <li>Sliding Window: contiguous subarray with condition — converts O(n²) → O(n)</li>
    <li>Prefix Sum: build O(n) once, answer range queries in O(1) each</li>
    <li>Always clarify: sorted? duplicates allowed? in-place modification OK?</li>
  </ul>
</div>
`,
};
