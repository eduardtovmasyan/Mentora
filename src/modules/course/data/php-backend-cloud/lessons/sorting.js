export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'Sorting Algorithms',
  intro: 'Every language stdlib uses a hybrid sort (Timsort in Python/Java, Introsort in C++/PHP). Senior engineers understand the trade-offs: merge sort for stability and linked lists, quicksort for cache efficiency, counting/radix sort for integer keys. Knowing when to reach for each is an interview staple.',
  tags: ['Merge sort', 'Quick sort', 'Heap sort', 'Counting sort', 'Stability', 'Timsort'],
  seniorExpectations: [
    'Implement merge sort and explain T(n) = 2T(n/2) + O(n) → O(n log n)',
    'Implement quicksort with median-of-three pivot; explain O(n²) worst case',
    'Know which sorts are stable and why stability matters for multi-key sorting',
    'Apply counting sort for bounded integer keys — O(n + k)',
    'Use PHP usort with spaceship operator for custom comparators',
  ],
  body: `
<h2>Comparison Sort Overview</h2>
<table class="ctable">
  <thead><tr><th>Algorithm</th><th>Average</th><th>Worst</th><th>Space</th><th>Stable</th></tr></thead>
  <tbody>
    <tr><td>Bubble / Insertion</td><td class="on2">O(n²)</td><td class="on2">O(n²)</td><td class="o1">O(1)</td><td>Yes</td></tr>
    <tr><td>Merge Sort</td><td class="olog">O(n log n)</td><td class="olog">O(n log n)</td><td class="on">O(n)</td><td>Yes</td></tr>
    <tr><td>Quick Sort</td><td class="olog">O(n log n)</td><td class="on2">O(n²)</td><td class="olog">O(log n)</td><td>No</td></tr>
    <tr><td>Heap Sort</td><td class="olog">O(n log n)</td><td class="olog">O(n log n)</td><td class="o1">O(1)</td><td>No</td></tr>
    <tr><td>Counting Sort</td><td class="on">O(n + k)</td><td class="on">O(n + k)</td><td class="on">O(k)</td><td>Yes</td></tr>
  </tbody>
</table>

<h2>Merge Sort</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">function mergeSort(array $arr): array {
    $n = count($arr);
    if ($n <= 1) return $arr;
    $mid   = intdiv($n, 2);
    $left  = mergeSort(array_slice($arr, 0, $mid));
    $right = mergeSort(array_slice($arr, $mid));
    return merge($left, $right);
}

function merge(array $l, array $r): array {
    $res = []; $i = $j = 0;
    while ($i < count($l) && $j < count($r)) {
        $res[] = $l[$i] <= $r[$j] ? $l[$i++] : $r[$j++];
    }
    return array_merge($res, array_slice($l, $i), array_slice($r, $j));
}
</code></pre>
</div>

<h2>Quick Sort (in-place, median-of-three)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">function quickSort(array &$a, int $lo = 0, ?int $hi = null): void {
    $hi ??= count($a) - 1;
    if ($lo >= $hi) return;
    $p = partition($a, $lo, $hi);
    quickSort($a, $lo, $p - 1);
    quickSort($a, $p + 1, $hi);
}

function partition(array &$a, int $lo, int $hi): int {
    // Median-of-three pivot selection
    $mid = $lo + intdiv($hi - $lo, 2);
    if ($a[$lo] > $a[$mid]) [$a[$lo], $a[$mid]] = [$a[$mid], $a[$lo]];
    if ($a[$lo] > $a[$hi])  [$a[$lo], $a[$hi]]  = [$a[$hi],  $a[$lo]];
    if ($a[$mid] > $a[$hi]) [$a[$mid], $a[$hi]]  = [$a[$hi],  $a[$mid]];
    // Pivot is now at $a[$mid]; place at $hi-1
    [$a[$mid], $a[$hi]] = [$a[$hi], $a[$mid]];
    $pivot = $a[$hi]; $i = $lo - 1;
    for ($j = $lo; $j < $hi; $j++) {
        if ($a[$j] <= $pivot) { $i++; [$a[$i], $a[$j]] = [$a[$j], $a[$i]]; }
    }
    [$a[$i + 1], $a[$hi]] = [$a[$hi], $a[$i + 1]];
    return $i + 1;
}
</code></pre>
</div>

<h2>Counting Sort (O(n + k))</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">function countingSort(array $arr, int $maxVal): array {
    $count = array_fill(0, $maxVal + 1, 0);
    foreach ($arr as $v) $count[$v]++;
    $result = [];
    foreach ($count as $v => $freq) {
        for ($i = 0; $i < $freq; $i++) $result[] = $v;
    }
    return $result;
}
</code></pre>
</div>

<h2>PHP Built-in Sorting</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">// Custom comparator with spaceship operator
usort($users, fn($a, $b) => $a['age'] <=> $b['age']);

// Multi-key stable sort
array_multisort(
    array_column($users, 'age'),  SORT_ASC,
    array_column($users, 'name'), SORT_ASC,
    $users
);

// sort() modifies in-place, returns bool, reindexes keys
// asort() preserves keys, arsort() reverses
// ksort() / krsort() sort by key
</code></pre>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Why is merge sort preferred for linked lists?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Quicksort requires random access for efficient partitioning. Linked lists only support sequential access, making pivot selection and partitioning O(n) per level. Merge sort naturally splits at the midpoint (found with slow/fast pointers) and merges in O(n) without extra structure.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Merge sort: stable, O(n log n) guaranteed, O(n) extra space — best for linked lists and external sort</li>
    <li>Quick sort: in-place, O(n log n) average, O(n²) worst — use random or median-of-3 pivot to mitigate</li>
    <li>Heap sort: O(n log n) guaranteed, O(1) space — but poor cache performance, rarely used in practice</li>
    <li>Counting/Radix: O(n + k) — beats Ω(n log n) comparison lower bound by exploiting integer structure</li>
    <li>PHP sort() is not stable — use usort() with <code>&lt;=&gt;</code> for custom ordering</li>
  </ul>
</div>
`,
};
