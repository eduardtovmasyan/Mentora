export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'Two-Pointer Technique',
  intro: 'Two pointers is not a single algorithm — it is a family of patterns that eliminate a nested loop by maintaining two indices that move through the data in a coordinated way. Recognising which variant applies (opposite-end, same-direction, fast/slow) turns an O(n²) brute force into an O(n) solution with O(1) extra space.',
  tags: ['two-pointers', 'arrays', 'strings', 'fast-slow', 'sorted-arrays', 'palindrome', 'linked-list'],
  seniorExpectations: [
    'Identify which two-pointer variant applies (opposite-end vs same-direction vs fast/slow) within 60 seconds of reading a problem',
    'Implement two-sum on a sorted array, three-sum deduplication, and container-with-most-water without brute force',
    'Use fast/slow pointers to detect a cycle and find the cycle entry point in O(1) space',
    'Remove duplicates from a sorted array in-place using the write-pointer pattern',
    'Explain why the opposite-end approach is correct for two-sum on a sorted array (convergence proof)',
    'Know the prerequisite conditions: sorted input, or a specific structural property like palindrome symmetry',
  ],
  segments: [
    { type: 'h2', text: 'The Core Insight' },
    { type: 'p', html: 'A brute-force nested loop checks every pair (i, j) — that\'s O(n²) work. Two pointers exploit a <em>monotonic property</em>: when the input is sorted (or has some symmetric structure), moving one pointer in a specific direction is guaranteed to move you closer to the target. This allows you to discard large search regions with a single comparison, giving O(n) total movement.' },
    { type: 'p', html: 'There are three distinct variants. Get these straight before any interview:' },
    { type: 'ul', items: [
      '<strong>Opposite-end (left/right)</strong> — pointers start at the two ends and converge. Used for: two-sum on sorted array, palindrome check, container with most water.',
      '<strong>Same-direction (slow/fast write pointer)</strong> — both start at the left; fast pointer scans, slow pointer marks the "write head". Used for: remove duplicates, remove element, move zeros.',
      '<strong>Fast/slow (Floyd\'s cycle detection)</strong> — fast moves 2 steps, slow moves 1. Used for: cycle detection, middle of linked list, finding duplicate in array.',
    ]},

    { type: 'h2', text: 'Opposite-End: Two Sum on a Sorted Array' },
    { type: 'p', html: 'Classic problem: given a <em>sorted</em> array and a target, find the pair that sums to target. With a hash map this is O(n) time and O(n) space. With two pointers it is O(n) time and O(1) space — the space improvement is the whole point.' },
    { type: 'p', html: '<strong>Why it works:</strong> If <code>arr[left] + arr[right] > target</code>, we need a smaller value — <code>right--</code> is the only useful move (moving left up would make things even bigger). If the sum is too small, <code>left++</code>. This is the convergence argument that proves correctness.' },

    { type: 'code', lang: 'php', label: 'PHP — Two Sum (Sorted) & Three Sum', code: `&lt;?php
// Two Sum on sorted array — O(n) time, O(1) space
function twoSumSorted(array $arr, int $target): array {
    $left  = 0;
    $right = count($arr) - 1;

    while ($left < $right) {
        $sum = $arr[$left] + $arr[$right];
        if ($sum === $target)  return [$left, $right];
        if ($sum < $target)    $left++;
        else                   $right--;
    }
    return []; // no pair found
}

// Three Sum — find all unique triplets summing to 0 — O(n²) time, O(1) extra space
function threeSum(array $nums): array {
    sort($nums);
    $n      = count($nums);
    $result = [];

    for ($i = 0; $i < $n - 2; $i++) {
        // Skip duplicate values for the fixed element
        if ($i > 0 && $nums[$i] === $nums[$i - 1]) continue;
        // Prune: smallest possible triplet > 0
        if ($nums[$i] > 0) break;

        $left  = $i + 1;
        $right = $n - 1;

        while ($left < $right) {
            $sum = $nums[$i] + $nums[$left] + $nums[$right];
            if ($sum === 0) {
                $result[] = [$nums[$i], $nums[$left], $nums[$right]];
                // Skip duplicates for both inner pointers
                while ($left < $right && $nums[$left]  === $nums[$left  + 1]) $left++;
                while ($left < $right && $nums[$right] === $nums[$right - 1]) $right--;
                $left++;
                $right--;
            } elseif ($sum < 0) {
                $left++;
            } else {
                $right--;
            }
        }
    }
    return $result;
}

print_r(twoSumSorted([1, 2, 4, 7, 11, 15], 9)); // [1, 3] (indices of 2 and 7)
print_r(threeSum([-1, 0, 1, 2, -1, -4]));        // [[-1,-1,2],[-1,0,1]]` },

    { type: 'callout', style: 'tip', title: 'Deduplication in Three Sum', html: 'The two inner <code>while</code> loops that skip duplicate values are the part candidates most often forget. Without them the result contains duplicate triplets even though the algorithm is otherwise correct. Write them immediately after recording a match.' },

    { type: 'h2', text: 'Opposite-End: Container With Most Water' },
    { type: 'p', html: 'Given heights <code>h[0..n-1]</code>, find two lines that together with the x-axis forms a container with the most water. Area = <code>min(h[left], h[right]) * (right - left)</code>. The greedy insight: always move the pointer with the <em>shorter</em> height inward — moving the taller one can only decrease or keep the min, so it can never increase the area.' },

    { type: 'code', lang: 'php', label: 'PHP — Container With Most Water', code: `&lt;?php
// O(n) time, O(1) space
function maxWater(array $heights): int {
    $left  = 0;
    $right = count($heights) - 1;
    $max   = 0;

    while ($left < $right) {
        $h    = min($heights[$left], $heights[$right]);
        $area = $h * ($right - $left);
        $max  = max($max, $area);

        // Move the shorter side inward — only move that can improve
        if ($heights[$left] < $heights[$right]) {
            $left++;
        } else {
            $right--;
        }
    }
    return $max;
}

echo maxWater([1, 8, 6, 2, 5, 4, 8, 3, 7]); // 49` },

    { type: 'h2', text: 'Same-Direction: Remove Duplicates In-Place' },
    { type: 'p', html: 'The write-pointer pattern: <code>slow</code> points to the last confirmed unique element; <code>fast</code> scans forward. When <code>fast</code> finds a new unique value, write it at <code>slow + 1</code> and advance <code>slow</code>. This modifies the array in-place with O(1) space — no copy needed.' },

    { type: 'code', lang: 'php', label: 'PHP — Remove Duplicates & Move Zeros', code: `&lt;?php
// Remove duplicates from sorted array in-place — O(n) time, O(1) space
// Returns count of unique elements; first k elements of $nums are the result
function removeDuplicates(array &$nums): int {
    if (empty($nums)) return 0;
    $slow = 0; // write pointer: index of last unique element written
    for ($fast = 1; $fast < count($nums); $fast++) {
        if ($nums[$fast] !== $nums[$slow]) {
            $slow++;
            $nums[$slow] = $nums[$fast];
        }
    }
    return $slow + 1;
}

// Move all zeros to end, preserve order of non-zeros — O(n) time, O(1) space
function moveZeros(array &$nums): void {
    $write = 0; // write pointer
    foreach ($nums as $i => $val) {
        if ($val !== 0) {
            $nums[$write++] = $val;
        }
    }
    while ($write < count($nums)) {
        $nums[$write++] = 0;
    }
}

$arr = [0, 1, 2, 3, 3, 3, 4, 4, 5];
$k   = removeDuplicates($arr);
echo $k; // 5, $arr[0..4] = [1,2,3,4,5]

$z = [0, 1, 0, 3, 12];
moveZeros($z);
print_r($z); // [1, 3, 12, 0, 0]` },

    { type: 'h2', text: 'Fast/Slow Pointers: Cycle Detection (Floyd\'s Algorithm)' },
    { type: 'p', html: 'Fast moves two steps per iteration, slow moves one. If there is a cycle, fast will eventually lap slow and they meet inside the cycle. If there is no cycle, fast reaches the end. After they meet, reset one pointer to the head and advance both one step at a time — they will meet exactly at the cycle entry point. This is a mathematical result, not intuition: the two meet at a distance from the entry equal to the head-to-entry distance.' },

    { type: 'code', lang: 'php', label: 'PHP — Floyd\'s Cycle Detection', code: `&lt;?php
class ListNode {
    public function __construct(
        public int $val,
        public ?ListNode $next = null
    ) {}
}

// Phase 1: detect if cycle exists; returns meeting node or null
// Phase 2: find cycle entry — O(n) time, O(1) space
function detectCycleEntry(?ListNode $head): ?ListNode {
    $slow = $head;
    $fast = $head;

    // Phase 1: do fast and slow meet?
    while ($fast !== null && $fast->next !== null) {
        $slow = $slow->next;
        $fast = $fast->next->next;
        if ($slow === $fast) {
            // Phase 2: find entry point
            $ptr = $head;
            while ($ptr !== $slow) {
                $ptr  = $ptr->next;
                $slow = $slow->next;
            }
            return $ptr; // cycle entry
        }
    }
    return null; // no cycle
}

// Find middle of linked list — O(n) time, O(1) space
// When fast reaches end, slow is at the middle
function findMiddle(?ListNode $head): ?ListNode {
    $slow = $head;
    $fast = $head;
    while ($fast !== null && $fast->next !== null) {
        $slow = $slow->next;
        $fast = $fast->next->next;
    }
    return $slow;
}` },

    { type: 'callout', style: 'info', title: 'Why Two Steps for Fast?', html: 'If fast moved 3+ steps it could jump over slow inside the cycle and you would need to prove it still catches up. With exactly 2 steps, every iteration the gap between slow and fast changes by exactly 1 (they converge by 1 step per round inside the cycle), so they are guaranteed to meet without jumping over each other.' },

    { type: 'h2', text: 'Complexity Summary' },
    { type: 'table', headers: ['Problem', 'Variant', 'Time', 'Space', 'Key Prerequisite'], rows: [
      ['Two Sum (sorted)', 'Opposite-end', 'O(n)', 'O(1)', 'Sorted array'],
      ['Three Sum', 'Opposite-end (inner)', 'O(n²)', 'O(1)', 'Sorted array'],
      ['Palindrome check', 'Opposite-end', 'O(n)', 'O(1)', 'None'],
      ['Container with most water', 'Opposite-end (greedy)', 'O(n)', 'O(1)', 'None'],
      ['Remove duplicates in-place', 'Same-direction (write ptr)', 'O(n)', 'O(1)', 'Sorted array'],
      ['Move zeros', 'Same-direction (write ptr)', 'O(n)', 'O(1)', 'None'],
      ['Linked list cycle detect', 'Fast/slow', 'O(n)', 'O(1)', 'Linked list structure'],
      ['Middle of linked list', 'Fast/slow', 'O(n)', 'O(1)', 'Linked list structure'],
    ]},

    { type: 'qa', pairs: [
      {
        q: 'Q: Why does the opposite-end two-pointer approach work for two-sum on a sorted array? Prove it doesn\'t miss any valid pair.',
        a: 'Invariant: at every step, if a valid pair exists, it is within the range <code>[left, right]</code>. When the current sum is too large, we need to reduce it. Since the array is sorted, the only way to reduce the sum while keeping <code>left</code> fixed is to decrease <code>right</code> — every element to the right of <code>right</code> is larger or equal (and already proved to give a sum that\'s too big), so they can all be safely discarded. Symmetrically for <code>left++</code>. By induction the invariant is maintained and we never discard a valid pair. QED.',
      },
      {
        q: 'Q: How does Floyd\'s algorithm find the cycle entry point, not just detect the cycle?',
        a: 'Let F = distance from head to cycle entry, C = cycle length, and let the meeting point be distance H from the cycle entry. When they meet: slow has traveled F + H steps; fast has traveled F + H + kC steps for some integer k (fast has done k extra laps). Since fast moves 2× as fast: 2(F + H) = F + H + kC → F + H = kC → F = kC − H = (k−1)C + (C − H). This means F ≡ C − H (mod C). So if you reset one pointer to the head and advance both one step at a time, after F steps the head-pointer reaches the cycle entry, and the meeting-pointer (which was H inside the cycle) also reaches the cycle entry after C − H + (k−1)C = F steps. They meet exactly at the entry.',
      },
      {
        q: 'Q: When should you NOT use two pointers?',
        a: 'Two pointers require a monotonic or symmetric property to exploit. Do not use them when: (1) the array is unsorted and sorting it would change the problem semantics (e.g., index-based problems), (2) you need to track more than two independent variables simultaneously, (3) the problem requires examining non-contiguous pairs without a clear convergence rule. In those cases, a hash map (O(n) space, O(n) time) or a different algorithmic approach is more appropriate.',
      },
    ]},

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Three variants: opposite-end (converge), same-direction write-pointer (scan + write), fast/slow (2x speed)',
      'Prerequisite for opposite-end: sorted input or symmetric structure — never use on unsorted data without justification',
      'Two Sum (sorted): O(n) time, O(1) space — convergence proof makes it bulletproof in interviews',
      'Three Sum: sort first, fix one element, apply opposite-end on the rest; skip duplicates explicitly after each match',
      'Write-pointer pattern: <code>slow</code> is the "last confirmed valid" index; <code>fast</code> scans and writes to <code>slow+1</code> on match',
      'Floyd\'s cycle: Phase 1 detect (fast meets slow), Phase 2 find entry (reset one ptr to head, advance both 1 step)',
      'All two-pointer solutions are O(n) time and O(1) space — that combination is the signal you have the right tool',
    ]},
  ],
};
