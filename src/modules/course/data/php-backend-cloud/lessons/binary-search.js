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
  segments: [
    { type: 'h2', text: 'Core Idea' },
    { type: 'p', html: 'Maintain two pointers <code>lo</code> and <code>hi</code>. Pick the midpoint and eliminate half the search space based on a comparison. Requires sorted data or a monotone predicate.' },

    { type: 'callout', style: 'tip', title: 'Key Insight', html: 'Binary search works on any <strong>monotone predicate</strong> — not just arrays. If the condition flips from false→true exactly once, you can binary search for the boundary.' },

    { type: 'h2', text: 'Template 1 — Exact Match (closed interval [lo, hi])' },
    { type: 'code', lang: 'php', label: 'PHP', code: `function binarySearch(array $nums, int $target): int {
    $lo = 0;
    $hi = count($nums) - 1;

    while ($lo <= $hi) {
        $mid = $lo + intdiv($hi - $lo, 2); // avoids overflow

        if ($nums[$mid] === $target) return $mid;
        if ($nums[$mid] < $target)   $lo = $mid + 1;
        else                          $hi = $mid - 1;
    }
    return -1;
}` },

    { type: 'h2', text: 'Template 2 — First True (left boundary / lower_bound)' },
    { type: 'code', lang: 'php', label: 'PHP', code: `// First index where nums[i] >= target
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
}` },

    { type: 'h2', text: 'Binary Search on the Answer' },
    { type: 'code', lang: 'php', label: 'PHP — Min eating speed (LeetCode 875)', code: `function minEatingSpeed(array $piles, int $h): int {
    $lo = 1;
    $hi = max($piles);

    while ($lo < $hi) {
        $mid   = $lo + intdiv($hi - $lo, 2);
        $hours = array_sum(array_map(fn($p) => (int)ceil($p / $mid), $piles));

        if ($hours <= $h) $hi = $mid;
        else              $lo = $mid + 1;
    }
    return $lo;
}` },

    { type: 'h2', text: 'Rotated Sorted Array' },
    { type: 'code', lang: 'php', label: 'PHP — LeetCode 33', code: `function searchRotated(array $nums, int $target): int {
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
}` },

    { type: 'h2', text: 'Complexity' },
    { type: 'table', headers: ['Operation', 'Time', 'Space'], rows: [
      ['Exact / first / last occurrence', { v: 'O(log n)', cls: 'olog' }, { v: 'O(1)', cls: 'o1' }],
      ['Search on answer (range R, check O(f))', { v: 'O(log R · f(n))', cls: 'olog' }, { v: 'O(1)', cls: 'o1' }],
    ]},

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Use <code>mid = lo + (hi - lo) / 2</code> to avoid integer overflow',
      'Closed [lo, hi]: <code>lo &lt;= hi</code>, shrink by <code>mid ± 1</code>',
      'Half-open [lo, hi): <code>lo &lt; hi</code>, set <code>hi = mid</code> when condition holds',
      'Off-by-one is the #1 mistake — pick one template and be consistent',
      '"Binary search on the answer" — define a monotone predicate, search the value space not indices',
    ]},
  ],
};
