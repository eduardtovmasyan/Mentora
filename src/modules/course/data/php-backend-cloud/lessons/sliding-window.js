export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'Sliding Window Technique',
  intro: 'Sliding window converts O(n²) subarray/substring problems into O(n) by reusing computation from the previous window instead of restarting from scratch. The key decision is whether the window size is fixed (use a simple dequeue-style shift) or variable (use a shrink condition). Mastering this decision is what separates a senior from a mid-level engineer in algorithm interviews.',
  tags: ['sliding-window', 'arrays', 'strings', 'subarray', 'substring', 'frequency-map', 'algorithms'],
  seniorExpectations: [
    'Distinguish fixed-size from variable-size sliding window within 30 seconds of reading a problem',
    'Implement maximum sum subarray of size k (fixed) and longest substring with at most k distinct chars (variable) from memory',
    'Derive the shrink condition for variable windows: know exactly when to move the left pointer and by how much',
    'Recognise when a sliding window cannot be applied — e.g. when negative numbers break the monotonic sum property',
    'Combine sliding window with a frequency map or deque for problems like "find all anagrams" or "sliding window maximum"',
    'State time and space complexity for any sliding window solution and justify the O(n) claim despite the nested-looking loop',
  ],
  body: `
<h2>The Core Idea</h2>
<p>A <em>window</em> is a contiguous subarray or substring defined by two indices <code>[left, right]</code>. Instead of computing the answer for every possible window from scratch (O(n²) or O(nk)), we <strong>slide</strong> the window: when the right boundary advances, we add the new element's contribution; when the left boundary advances, we remove the departing element's contribution. Each element enters and leaves the window at most once — giving O(n) total work.</p>
<p>The mental model: think of the window as a conveyor belt. Elements flow in from the right, elements fall off the left. Your job is to maintain a running statistic (sum, max, frequency count) as the belt moves.</p>

<div class="callout callout-info">
  <div class="callout-title">When Sliding Window Applies</div>
  <p>The problem asks about a <strong>contiguous</strong> subarray or substring, and the window statistic has a <strong>monotonic</strong> relationship with window size (larger window = larger sum for non-negative numbers) or a clear shrink condition. If elements can be negative, the sum is not monotonic — Kadane's algorithm or prefix sums may be needed instead.</p>
</div>

<h2>Fixed-Size Window: Maximum Sum Subarray of Size k</h2>
<p>The simplest variant. Compute the sum of the first k elements (initial window). Then shift: subtract the element falling off the left, add the element entering from the right. Track the running maximum. O(n) time, O(1) space.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Fixed Window: Max Sum Subarray</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Maximum sum of any contiguous subarray of exactly size k
// O(n) time, O(1) space
function maxSumSubarray(array $nums, int $k): int {
    $n = count($nums);
    if ($n < $k) throw new \InvalidArgumentException('Array smaller than window');

    // Build initial window
    $windowSum = array_sum(array_slice($nums, 0, $k));
    $maxSum    = $windowSum;

    // Slide the window: remove leftmost, add rightmost
    for ($right = $k; $right < $n; $right++) {
        $windowSum += $nums[$right] - $nums[$right - $k];
        $maxSum     = max($maxSum, $windowSum);
    }
    return $maxSum;
}

// Fixed window — find all anagram positions of $p in $s
// O(n) time, O(1) space (26-element freq arrays are constant size)
function findAnagrams(string $s, string $p): array {
    $ns   = strlen($s);
    $np   = strlen($p);
    if ($ns < $np) return [];

    $base  = ord('a');
    $pFreq = array_fill(0, 26, 0);
    $wFreq = array_fill(0, 26, 0);
    $result = [];

    for ($i = 0; $i < $np; $i++) {
        $pFreq[ord($p[$i]) - $base]++;
        $wFreq[ord($s[$i]) - $base]++;
    }
    if ($pFreq === $wFreq) $result[] = 0;

    for ($r = $np; $r < $ns; $r++) {
        $wFreq[ord($s[$r]) - $base]++;            // enter right
        $wFreq[ord($s[$r - $np]) - $base]--;      // leave left
        if ($pFreq === $wFreq) $result[] = $r - $np + 1;
    }
    return $result;
}

echo maxSumSubarray([2, 1, 5, 1, 3, 2], 3); // 9 (subarray [5,1,3])
print_r(findAnagrams('cbaebabacd', 'abc'));  // [0, 6]
</code></pre>
</div>

<h2>Variable-Size Window: Longest Substring Without Repeating Chars</h2>
<p>Here the window size is not fixed — we grow it as long as the invariant holds (all unique characters) and shrink it when the invariant breaks (a duplicate enters). The shrink condition is precise: jump <code>left</code> to <code>lastSeen[char] + 1</code> to immediately exclude the duplicate, rather than incrementing one step at a time.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Variable Window: Longest Unique Substring</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Longest substring without repeating characters — O(n) time, O(k) space
// k = size of character set (at most 128 for ASCII)
function lengthOfLongestSubstring(string $s): int {
    $lastSeen = []; // char -> last index seen inside current window
    $maxLen   = 0;
    $left     = 0;

    for ($right = 0; $right < strlen($s); $right++) {
        $ch = $s[$right];
        // If the char is inside the current window, shrink left past it
        if (isset($lastSeen[$ch]) && $lastSeen[$ch] >= $left) {
            $left = $lastSeen[$ch] + 1; // jump, don't creep
        }
        $lastSeen[$ch] = $right;
        $maxLen = max($maxLen, $right - $left + 1);
    }
    return $maxLen;
}

// Longest substring with at most k distinct characters — O(n) time, O(k) space
function longestSubstringKDistinct(string $s, int $k): int {
    $freq   = []; // char -> count in window
    $maxLen = 0;
    $left   = 0;

    for ($right = 0; $right < strlen($s); $right++) {
        $ch = $s[$right];
        $freq[$ch] = ($freq[$ch] ?? 0) + 1;

        // Shrink until we have at most k distinct chars
        while (count($freq) > $k) {
            $leftCh = $s[$left];
            $freq[$leftCh]--;
            if ($freq[$leftCh] === 0) unset($freq[$leftCh]);
            $left++;
        }
        $maxLen = max($maxLen, $right - $left + 1);
    }
    return $maxLen;
}

echo lengthOfLongestSubstring('abcabcbb');        // 3
echo longestSubstringKDistinct('eceba', 2);       // 3 ("ece")
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Jump vs Creep for the Left Pointer</div>
  <p>In the unique-substring problem, when a duplicate is found you can jump <code>left</code> directly to <code>lastSeen[char] + 1</code> rather than incrementing one step at a time. This is still O(n) total but avoids redundant iterations. In the "at most k distinct" variant you must creep (increment one step) because the shrink condition involves a count that decreases gradually.</p>
</div>

<h2>Variable-Size Window: Minimum Window Substring</h2>
<p>One of the hardest sliding window problems: find the minimum length substring of <code>s</code> that contains all characters of <code>t</code>. Strategy: expand right until the window is valid (contains all of t's chars); then shrink left as far as possible while keeping it valid; record the minimum. Use a "have vs need" counter to check validity in O(1).</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Minimum Window Substring</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Find shortest substring of $s containing all chars of $t — O(n + m) time
function minWindow(string $s, string $t): string {
    if ($t === '' || strlen($s) < strlen($t)) return '';

    // Build frequency requirement from t
    $need = [];
    for ($i = 0; $i < strlen($t); $i++) {
        $need[$t[$i]] = ($need[$t[$i]] ?? 0) + 1;
    }

    $have     = 0;              // chars in window meeting their required count
    $required = count($need);   // distinct chars needed
    $window   = [];             // char -> count in current window
    $best     = '';
    $left     = 0;

    for ($right = 0; $right < strlen($s); $right++) {
        $ch = $s[$right];
        $window[$ch] = ($window[$ch] ?? 0) + 1;

        // Did this char's count just meet the requirement?
        if (isset($need[$ch]) && $window[$ch] === $need[$ch]) {
            $have++;
        }

        // Shrink from left while window is valid
        while ($have === $required) {
            $len = $right - $left + 1;
            if ($best === '' || $len < strlen($best)) {
                $best = substr($s, $left, $len);
            }

            $leftCh = $s[$left];
            $window[$leftCh]--;
            if (isset($need[$leftCh]) && $window[$leftCh] < $need[$leftCh]) {
                $have--;
            }
            $left++;
        }
    }
    return $best;
}

echo minWindow('ADOBECODEBANC', 'ABC'); // "BANC"
echo minWindow('a', 'a');              // "a"
echo minWindow('a', 'aa');             // ""
</code></pre>
</div>

<h2>Sliding Window Maximum — Monotonic Deque</h2>
<p>Find the maximum in every window of size k. Naive: O(nk). Optimal: O(n) using a <em>monotonic decreasing deque</em> that stores indices. The deque's front always holds the index of the current window's maximum. Elements are evicted from the back when they are smaller than the incoming element (they can never be a future maximum), and from the front when they fall outside the window.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Sliding Window Maximum (Monotonic Deque)</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// O(n) time, O(k) space
function maxSlidingWindow(array $nums, int $k): array {
    $deque  = []; // stores indices; front = index of max in current window
    $result = [];
    $n      = count($nums);

    for ($right = 0; $right < $n; $right++) {
        // Remove indices outside the current window from the front
        while (!empty($deque) && $deque[0] < $right - $k + 1) {
            array_shift($deque);
        }

        // Maintain decreasing order: remove indices from the back
        // whose values are <= current (they can never be a window max)
        while (!empty($deque) && $nums[end($deque)] <= $nums[$right]) {
            array_pop($deque);
        }

        $deque[] = $right;

        // Start recording once the first full window is formed
        if ($right >= $k - 1) {
            $result[] = $nums[$deque[0]]; // front of deque = window max
        }
    }
    return $result;
}

print_r(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3));
// [3, 3, 5, 5, 6, 7]
</code></pre>
</div>

<div class="callout callout-warn">
  <div class="callout-title">When Sliding Window Breaks Down</div>
  <p>Sliding window requires that the window statistic behaves monotonically relative to window size. With negative numbers, a larger sum subarray doesn't guarantee a larger window — the sum can shrink. For "maximum subarray sum" with negative numbers, use Kadane's algorithm. For "subarray sum equals k" with negatives, use prefix sums + a hash map.</p>
</div>

<h2>Complexity Analysis — The O(n) Argument</h2>
<p>The nested loop in variable-size sliding window looks O(n²) but is actually O(n). The key insight: the inner <code>while</code> (shrink) loop moves <code>left</code> forward. <code>left</code> starts at 0 and can advance at most n times across the entire outer loop. So the total number of inner iterations across all outer iterations is at most n. Total work: O(n) outer + O(n) inner = O(2n) = O(n).</p>

<table class="content-table">
  <thead><tr><th>Problem</th><th>Window Type</th><th>Data Structure</th><th>Time</th><th>Space</th></tr></thead>
  <tbody>
    <tr><td>Max sum subarray of size k</td><td>Fixed</td><td>Running sum</td><td>O(n)</td><td>O(1)</td></tr>
    <tr><td>Find all anagram positions</td><td>Fixed</td><td>Freq array (26 ints)</td><td>O(n)</td><td>O(1)</td></tr>
    <tr><td>Longest unique substring</td><td>Variable</td><td>Hash map (last index)</td><td>O(n)</td><td>O(k)</td></tr>
    <tr><td>Longest with at most k distinct</td><td>Variable</td><td>Hash map (count)</td><td>O(n)</td><td>O(k)</td></tr>
    <tr><td>Minimum window substring</td><td>Variable</td><td>Two freq maps + counter</td><td>O(n+m)</td><td>O(m)</td></tr>
    <tr><td>Sliding window maximum</td><td>Fixed</td><td>Monotonic deque</td><td>O(n)</td><td>O(k)</td></tr>
  </tbody>
</table>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: How do you decide between a fixed-size and variable-size sliding window?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <p>Look at what the problem gives you and what it asks for. <strong>Fixed-size</strong>: the window length k is given explicitly and never changes (e.g., "max sum of k elements", "find anagram positions of p in s" — window size = len(p)). <strong>Variable-size</strong>: you are asked to find the longest or shortest window satisfying some constraint, and the window must grow and shrink based on whether the constraint is met (e.g., "longest substring without repeating chars", "minimum window containing all chars"). In variable-size problems, you always have a shrink condition — write it out before coding.</p>
  </div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Walk me through the "have vs need" pattern used in Minimum Window Substring. Why is it O(1) to check window validity?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <p>We precompute <code>required</code> = number of distinct characters in t that must be satisfied. We maintain <code>have</code> = number of those characters whose count in the current window meets or exceeds the requirement. When <code>have === required</code>, the window is valid. Incrementing/decrementing <code>have</code> happens at most once per character per pointer move: only when a character's window count crosses its requirement threshold (from below to exactly equal, or from equal to below). This means each pointer advances O(n) times total and the validity check itself is a single integer comparison — O(1). Without this trick, naively comparing two full frequency maps would be O(m) per step.</p>
  </div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Explain why the sliding window nested loop is O(n) and not O(n²).</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <p>Use the amortised argument. The outer loop runs exactly n times (right = 0..n-1). The inner (shrink) loop advances the <code>left</code> pointer. <code>left</code> is a monotonically increasing index that starts at 0 and can reach at most n. Therefore, across the entire execution, the inner loop body can execute at most n times in total — regardless of how many outer iterations there are. Total operations: n (outer) + n (inner total) = 2n = O(n). This is the same argument as for the amortised cost of a stack-based approach.</p>
  </div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Fixed-size window: window length k is given; shift by subtracting left element and adding right element each step</li>
    <li>Variable-size window: grow right unconditionally; shrink left when the invariant breaks; track the best answer after each valid state</li>
    <li>The nested loop is O(n) not O(n²): left pointer moves at most n times total across the entire execution</li>
    <li>Sliding window requires monotonicity: works for non-negative sums, character counts; breaks for negative-number sum problems</li>
    <li>"Have vs need" counter avoids O(m) frequency map comparison — reduces validity check to a single integer comparison</li>
    <li>Sliding window maximum needs a monotonic deque — a simple running max won't work because the maximum can leave the window</li>
    <li>For all anagram problems: fixed window of size len(p) + two 26-element frequency arrays — O(n) time, O(1) space</li>
  </ul>
</div>
`,
};
