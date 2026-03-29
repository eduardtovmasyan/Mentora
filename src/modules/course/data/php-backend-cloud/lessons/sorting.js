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
  segments: [
    { type: 'h2', key: 'h_overview' },
    { type: 'table', key: 'tbl_overview' },

    { type: 'h2', key: 'h_merge' },
    {
      type: 'code', lang: 'php', label: 'PHP',
      code: `function mergeSort(array $arr): array {
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
}`,
    },

    { type: 'h2', key: 'h_quick' },
    {
      type: 'code', lang: 'php', label: 'PHP',
      code: `function quickSort(array &$a, int $lo = 0, ?int $hi = null): void {
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
}`,
    },

    { type: 'h2', key: 'h_counting' },
    {
      type: 'code', lang: 'php', label: 'PHP',
      code: `function countingSort(array $arr, int $maxVal): array {
    $count = array_fill(0, $maxVal + 1, 0);
    foreach ($arr as $v) $count[$v]++;
    $result = [];
    foreach ($count as $v => $freq) {
        for ($i = 0; $i < $freq; $i++) $result[] = $v;
    }
    return $result;
}`,
    },

    { type: 'h2', key: 'h_builtin' },
    {
      type: 'code', lang: 'php', label: 'PHP',
      code: `// Custom comparator with spaceship operator
usort($users, fn($a, $b) => $a['age'] <=> $b['age']);

// Multi-key stable sort
array_multisort(
    array_column($users, 'age'),  SORT_ASC,
    array_column($users, 'name'), SORT_ASC,
    $users
);

// sort() modifies in-place, returns bool, reindexes keys
// asort() preserves keys, arsort() reverses
// ksort() / krsort() sort by key`,
    },

    { type: 'qa', key: 'qa' },
    { type: 'keypoints', key: 'keypoints' },
  ],
  bodyTexts: {
    h_overview: 'Comparison Sort Overview',
    tbl_overview: {
      headers: ['Algorithm', 'Average', 'Worst', 'Space', 'Stable'],
      rows: [
        ['Bubble / Insertion', { v: 'O(n²)', cls: 'on2' }, { v: 'O(n²)', cls: 'on2' }, { v: 'O(1)', cls: 'o1' }, 'Yes'],
        ['Merge Sort',         { v: 'O(n log n)', cls: 'olog' }, { v: 'O(n log n)', cls: 'olog' }, { v: 'O(n)', cls: 'on' }, 'Yes'],
        ['Quick Sort',         { v: 'O(n log n)', cls: 'olog' }, { v: 'O(n²)', cls: 'on2' }, { v: 'O(log n)', cls: 'olog' }, 'No'],
        ['Heap Sort',          { v: 'O(n log n)', cls: 'olog' }, { v: 'O(n log n)', cls: 'olog' }, { v: 'O(1)', cls: 'o1' }, 'No'],
        ['Counting Sort',      { v: 'O(n + k)', cls: 'on' }, { v: 'O(n + k)', cls: 'on' }, { v: 'O(k)', cls: 'on' }, 'Yes'],
      ],
    },
    h_merge: 'Merge Sort',
    h_quick: 'Quick Sort (in-place, median-of-three)',
    h_counting: 'Counting Sort (O(n + k))',
    h_builtin: 'PHP Built-in Sorting',
    qa: {
      pairs: [
        {
          q: 'Why is merge sort preferred for linked lists?',
          a: 'Quicksort requires random access for efficient partitioning. Linked lists only support sequential access, making pivot selection and partitioning O(n) per level. Merge sort naturally splits at the midpoint (found with slow/fast pointers) and merges in O(n) without extra structure.',
        },
      ],
    },
    keypoints: {
      title: 'Key Points to Remember',
      items: [
        'Merge sort: stable, O(n log n) guaranteed, O(n) extra space — best for linked lists and external sort',
        'Quick sort: in-place, O(n log n) average, O(n²) worst — use random or median-of-3 pivot to mitigate',
        'Heap sort: O(n log n) guaranteed, O(1) space — but poor cache performance, rarely used in practice',
        'Counting/Radix: O(n + k) — beats Ω(n log n) comparison lower bound by exploiting integer structure',
        'PHP sort() is not stable — use usort() with <code>&lt;=&gt;</code> for custom ordering',
      ],
    },
  },
};
