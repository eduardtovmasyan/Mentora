export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'Heaps & Priority Queues',
  intro: 'A heap is a complete binary tree that satisfies the heap property: in a min-heap every node is less than or equal to its children; in a max-heap every node is greater than or equal to its children. This property means the global minimum (or maximum) is always at the root, accessible in O(1), while insertion and removal cost only O(log n). PHP ships with SplMinHeap and SplMaxHeap in its Standard PHP Library. Heaps are the data structure behind priority queues, efficient sorting, and a large family of "top-K" interview problems that would otherwise require O(n log n) sorting of the entire dataset.',
  tags: ['heaps', 'priority-queue', 'spl', 'top-k', 'algorithms', 'php'],
  seniorExpectations: [
    'Implement and reason about min-heap and max-heap operations from first principles',
    'Use PHP SplMinHeap and SplMaxHeap idiomatically, including custom comparison via SplPriorityQueue',
    'Solve top-K problems in O(n log K) time rather than O(n log n)',
    'Implement merge-K-sorted-lists and median-of-data-stream using heaps',
    'Articulate when a heap outperforms a sorted array and when it does not',
    'State all heap operation complexities and explain why build-heap is O(n) not O(n log n)',
  ],
  segments: [
    { type: 'h2', text: 'Heap Fundamentals: Structure & Property' },
    { type: 'p', html: 'A binary heap is stored as a flat array — no pointers needed. For a node at index <code>i</code> (1-indexed): left child is at <code>2i</code>, right child at <code>2i+1</code>, parent at <code>⌊i/2⌋</code>. This layout guarantees cache-friendly access and O(1) parent/child navigation. The heap property is maintained by two operations:' },
    { type: 'ul', items: [
      '<strong>Heapify-up (sift-up)</strong> — after insertion at the last position, swap with parent until the property holds.',
      '<strong>Heapify-down (sift-down)</strong> — after replacing the root with the last element (during extract), swap with the smaller child until the property holds.',
    ]},

    { type: 'table', headers: ['Operation', 'Time', 'Space'], rows: [
      ['Insert',                    { v: 'O(log n)', cls: 'on' }, { v: 'O(1)', cls: 'o1' }],
      ['Extract min/max',           { v: 'O(log n)', cls: 'on' }, { v: 'O(1)', cls: 'o1' }],
      ['Peek min/max',              { v: 'O(1)',     cls: 'o1' }, { v: 'O(1)', cls: 'o1' }],
      ['Build heap from array',     { v: 'O(n)',     cls: 'on' }, { v: 'O(1)', cls: 'o1' }],
      ['Heap sort',                 { v: 'O(n log n)', cls: 'on' }, { v: 'O(1)', cls: 'o1' }],
      ['Decrease key (with index)', { v: 'O(log n)', cls: 'on' }, { v: 'O(1)', cls: 'o1' }],
    ]},

    { type: 'p', html: 'Build-heap from an unsorted array is O(n) — not O(n log n) — because most nodes are near the bottom of the tree where sift-down work is minimal. The mathematical proof uses the summation of heights across levels of the tree.' },

    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php
// Min-heap implemented manually on a 1-indexed array
class MinHeap
{
    private array $data = [null]; // index 0 unused for clean parent/child math
    private int   $size = 0;

    public function insert(int $val): void
    {
        $this->data[++$this->size] = $val;
        $this->siftUp($this->size);
    }

    public function extractMin(): int
    {
        if ($this->size === 0) throw new UnderflowException('Heap is empty');
        $min = $this->data[1];
        $this->data[1] = $this->data[$this->size--];
        unset($this->data[$this->size + 1]);
        if ($this->size > 0) $this->siftDown(1);
        return $min;
    }

    public function peekMin(): int
    {
        if ($this->size === 0) throw new UnderflowException('Heap is empty');
        return $this->data[1];
    }

    public function size(): int { return $this->size; }

    private function siftUp(int $i): void
    {
        while ($i > 1 && $this->data[$i] < $this->data[$i >> 1]) {
            [$this->data[$i], $this->data[$i >> 1]] = [$this->data[$i >> 1], $this->data[$i]];
            $i >>= 1;
        }
    }

    private function siftDown(int $i): void
    {
        while (($left = $i * 2) <= $this->size) {
            $smallest = ($left + 1 <= $this->size && $this->data[$left + 1] < $this->data[$left])
                ? $left + 1
                : $left;
            if ($this->data[$i] <= $this->data[$smallest]) break;
            [$this->data[$i], $this->data[$smallest]] = [$this->data[$smallest], $this->data[$i]];
            $i = $smallest;
        }
    }
}` },

    { type: 'h2', text: 'PHP SplMinHeap & SplMaxHeap' },
    { type: 'p', html: 'PHP\'s SPL provides <code>SplMinHeap</code> and <code>SplMaxHeap</code> as heap implementations with a standard interface. For custom priority (e.g., objects ordered by a field), extend <code>SplPriorityQueue</code> or <code>SplMinHeap</code> and override <code>compare()</code>. A common gotcha: <code>SplPriorityQueue</code> is a max-priority-queue by default and pops the highest priority first. To simulate a min-priority-queue, negate the priority value.' },

    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php
// SplMinHeap basic usage
$heap = new SplMinHeap();
foreach ([5, 1, 3, 2, 4] as $n) {
    $heap->insert($n);
}
while (!$heap->isEmpty()) {
    echo $heap->extract() . ' '; // 1 2 3 4 5
}

// Custom min-heap ordered by object field
class TaskHeap extends SplMinHeap
{
    protected function compare(mixed $a, mixed $b): int
    {
        // SplMinHeap::compare must return >0 if $a > $b (inverted from usort)
        return $b['priority'] <=> $a['priority'];
    }
}

$tasks = new TaskHeap();
$tasks->insert(['name' => 'Low priority task',  'priority' => 10]);
$tasks->insert(['name' => 'High priority task', 'priority' => 1]);
$tasks->insert(['name' => 'Medium task',        'priority' => 5]);

while (!$tasks->isEmpty()) {
    $t = $tasks->extract();
    echo $t['name'] . PHP_EOL; // High → Medium → Low
}

// SplPriorityQueue — max-priority by default
$pq = new SplPriorityQueue();
$pq->insert('job-A', 3);
$pq->insert('job-B', 10);
$pq->insert('job-C', 1);
echo $pq->extract(); // job-B (priority 10)` },

    { type: 'h2', text: 'Top-K Problems' },
    { type: 'p', html: 'Finding the K largest (or smallest) elements in an array of n elements can be done by sorting in O(n log n), but a heap achieves O(n log K) — a significant win when K ≪ n. The technique: maintain a min-heap of size K while streaming elements. If the new element is larger than the heap\'s minimum, pop the minimum and push the new element. After processing all n elements, the heap contains the K largest.' },

    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php
// Top-K largest elements — O(n log K) using a min-heap of size K
function topKLargest(array $nums, int $k): array
{
    $heap = new SplMinHeap();

    foreach ($nums as $n) {
        $heap->insert($n);
        if ($heap->count() > $k) {
            $heap->extract(); // evict the current smallest
        }
    }

    $result = [];
    while (!$heap->isEmpty()) {
        $result[] = $heap->extract();
    }
    return array_reverse($result); // largest first
}

// Top-K frequent elements — requires frequency count first
function topKFrequent(array $nums, int $k): array
{
    $freq = array_count_values($nums); // O(n)

    // Min-heap keyed by frequency; evict least-frequent when size > k
    $heap = new SplPriorityQueue();
    $heap->setExtractFlags(SplPriorityQueue::EXTR_BOTH);

    foreach ($freq as $num => $count) {
        $heap->insert($num, $count);
        // SplPriorityQueue is a max-heap; to keep K most frequent,
        // we use a workaround: rebuild or use a custom structure.
    }

    $result = [];
    for ($i = 0; $i < $k && !$heap->isEmpty(); $i++) {
        $result[] = $heap->extract()['data'];
    }
    return $result;
}

$nums = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
print_r(topKLargest($nums, 3));    // [5, 6, 9]
print_r(topKFrequent($nums, 2));   // [5, 3] or [5, 1]` },

    { type: 'h2', text: 'Merge K Sorted Lists' },
    { type: 'p', html: 'Merging K sorted arrays (or linked lists) naively by concatenation and re-sorting costs O(N log N) where N is the total number of elements. Using a min-heap, the optimal solution costs O(N log K): push the first element of each list into a min-heap, repeatedly extract the minimum, and push the next element from that list. The heap never grows beyond K elements, so each operation costs O(log K).' },

    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php
// Merge K sorted arrays — O(N log K)
function mergeKSorted(array $lists): array
{
    // Heap entry: [value, list_index, element_index]
    $heap = new SplMinHeap();

    foreach ($lists as $i => $list) {
        if (!empty($list)) {
            $heap->insert([$list[0], $i, 0]);
        }
    }

    $result = [];
    while (!$heap->isEmpty()) {
        [$val, $listIdx, $elemIdx] = $heap->extract();
        $result[] = $val;

        $nextIdx = $elemIdx + 1;
        if (isset($lists[$listIdx][$nextIdx])) {
            $heap->insert([$lists[$listIdx][$nextIdx], $listIdx, $nextIdx]);
        }
    }

    return $result;
}

$lists = [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9],
];
print_r(mergeKSorted($lists)); // [1, 2, 3, 4, 5, 6, 7, 8, 9]` },

    { type: 'h2', text: 'Median of a Data Stream' },
    { type: 'p', html: 'Finding the median of a static sorted array is O(1) after O(n log n) sorting. For a dynamic stream where elements arrive one by one, the heap-based solution maintains two heaps: a max-heap for the lower half and a min-heap for the upper half, keeping them balanced within one element of each other. The median is always at the tops of these heaps. Each insertion costs O(log n); each median query costs O(1).' },

    { type: 'code', lang: 'php', label: 'PHP', code: `&lt;?php
// Median of data stream using two heaps
class MedianFinder
{
    private SplMaxHeap $lowerHalf; // max-heap: smaller elements
    private SplMinHeap $upperHalf; // min-heap: larger elements

    public function __construct()
    {
        $this->lowerHalf = new SplMaxHeap();
        $this->upperHalf = new SplMinHeap();
    }

    public function addNum(int $num): void
    {
        // Always insert into lower half first
        $this->lowerHalf->insert($num);

        // Balance: move max of lower to upper if out of order
        if (
            !$this->upperHalf->isEmpty() &&
            $this->lowerHalf->top() > $this->upperHalf->top()
        ) {
            $this->upperHalf->insert($this->lowerHalf->extract());
        }

        // Rebalance sizes: lower may have at most 1 more element than upper
        if ($this->lowerHalf->count() > $this->upperHalf->count() + 1) {
            $this->upperHalf->insert($this->lowerHalf->extract());
        } elseif ($this->upperHalf->count() > $this->lowerHalf->count()) {
            $this->lowerHalf->insert($this->upperHalf->extract());
        }
    }

    public function findMedian(): float
    {
        if ($this->lowerHalf->count() > $this->upperHalf->count()) {
            return (float) $this->lowerHalf->top();
        }
        return ($this->lowerHalf->top() + $this->upperHalf->top()) / 2.0;
    }
}

$mf = new MedianFinder();
$mf->addNum(1); echo $mf->findMedian(); // 1.0
$mf->addNum(2); echo $mf->findMedian(); // 1.5
$mf->addNum(3); echo $mf->findMedian(); // 2.0` },

    { type: 'h2', text: 'Heap vs Sorted Array: When to Choose Which' },
    { type: 'p', html: 'Both structures maintain ordered data, but their performance profiles differ significantly. Choose based on your access pattern:' },
    { type: 'table', headers: ['Operation', 'Heap', 'Sorted Array'], rows: [
      ['Insert element',         { v: 'O(log n)',   cls: 'on' }, { v: 'O(n) — shift elements',    cls: 'on' }],
      ['Delete min/max',         { v: 'O(log n)',   cls: 'on' }, { v: 'O(1) pop from end/front',  cls: 'o1' }],
      ['Access kth element',     { v: 'O(k log n)', cls: 'on' }, { v: 'O(1) by index',            cls: 'o1' }],
      ['Search arbitrary value', { v: 'O(n)',        cls: 'on' }, { v: 'O(log n) binary search',  cls: 'on' }],
      ['Build from unsorted',    { v: 'O(n)',        cls: 'on' }, { v: 'O(n log n)',               cls: 'on' }],
    ]},
    { type: 'p', html: 'Use a heap when you repeatedly need only the minimum or maximum and insertions are frequent (priority queues, event simulation, Dijkstra\'s algorithm). Use a sorted array (or balanced BST) when you need arbitrary element access, range queries, or binary search.' },

    { type: 'qa', pairs: [
      {
        q: 'Q: Why is the top-K problem O(n log K) with a heap and not O(n log n)?',
        a: 'Each of the n elements is inserted into and potentially extracted from a heap of maximum size K. Both insert and extract on a heap of size K cost O(log K). Since we do at most one insert and one extract per element, the total cost is O(n · log K). When K ≪ n (e.g., finding the top 10 results from 10 million records), log K is essentially a small constant, making the algorithm nearly linear. Sorting the entire array would cost O(n log n) regardless of K.',
      },
      {
        q: 'Q: Why does PHP\'s SplPriorityQueue::compare() have inverted semantics compared to usort()?',
        a: 'SplMinHeap and SplMaxHeap use compare($a, $b) with the convention that returning a positive value means $a should come <em>after</em> $b in extraction order — the opposite of PHP\'s spaceship operator and usort. This is because the SPL heap is internally a max-heap at the C level, and the compare function controls which element is treated as "larger" (i.e., extracted first). To build a min-heap with SplMinHeap, its compare returns positive when $a > $b so that smaller values appear at the top. When writing custom comparators, always test with a small example because getting the sign wrong silently produces a max-heap instead of a min-heap or vice versa.',
      },
      {
        q: 'Q: How does Dijkstra\'s algorithm use a heap, and what is its time complexity?',
        a: 'Dijkstra\'s shortest-path algorithm maintains a min-heap (priority queue) of (distance, vertex) pairs. It repeatedly extracts the vertex with the smallest known distance, then relaxes (updates) the distances to its neighbours. If a shorter path is found, the neighbour is re-inserted into the heap. With a binary heap and an adjacency list, the complexity is O((V + E) log V): each vertex is extracted once (V extractions at O(log V) each) and each edge causes at most one heap insertion (E insertions at O(log V) each). With a Fibonacci heap, the decrease-key operation is O(1) amortised, giving O(E + V log V) total — theoretically better for dense graphs but rarely used in practice due to implementation complexity.',
      },
    ]},

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Min-heap: root is always the minimum. Max-heap: root is always the maximum. Both support O(log n) insert and extract.',
      'PHP provides SplMinHeap, SplMaxHeap, and SplPriorityQueue. Custom ordering requires overriding compare() with inverted semantics.',
      'Top-K largest: maintain a min-heap of size K — O(n log K), not O(n log n).',
      'Merge K sorted lists: use a min-heap of size K — O(N log K) where N is total elements.',
      'Median of stream: two-heap solution (max-heap lower half + min-heap upper half) gives O(log n) insert and O(1) median.',
      'Build-heap from an unsorted array is O(n) — not O(n log n) — due to the mathematical summation of sift-down work.',
      'Choose heap over sorted array when insertions and min/max extractions are the primary operations; sorted arrays win for arbitrary index access and binary search.',
    ]},
  ],
};
