export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'Stacks & Queues',
  intro: 'Stacks (LIFO) and queues (FIFO) are abstract data types built on arrays or linked lists. They model function call stacks, browser history, BFS traversal, and many interview problems including the famous monotonic stack pattern.',
  tags: ['LIFO', 'FIFO', 'Monotonic stack', 'BFS', 'Valid Parentheses', 'SplQueue'],
  seniorExpectations: [
    'Implement valid parentheses using a stack',
    'Use a monotonic stack for "next greater element" problems',
    'Use a deque for sliding window maximum in O(n)',
    'Know why array_shift() is O(n) and use SplQueue instead',
    'Explain how BFS uses a queue for level-order traversal',
  ],
  body: `
<h2>Stack — LIFO (Last In, First Out)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Stack Problems</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// PHP array as stack — end = "top"
$stack = [];
$stack[] = 1;           // push  O(1)
$stack[] = 2;
$top = array_pop($stack); // pop   O(1)
$top = end($stack);        // peek  O(1) without removing

// Valid Parentheses: "()[]{}" => true  "(]" => false
function isValid(string $s): bool
{
    $stack = [];
    $pairs = [')'=>'(', ']'=>'[', '}'=>'{'];
    for ($i = 0; $i < strlen($s); $i++) {
        $c = $s[$i];
        if (in_array($c, ['(','[','{'])) {
            $stack[] = $c;
        } else {
            if (empty($stack) || end($stack) !== $pairs[$c]) return false;
            array_pop($stack);
        }
    }
    return empty($stack);
}
// Time: O(n)  Space: O(n)

// Monotonic Stack — Daily Temperatures
// [73,74,75,71,69,72,76,73] -> [1,1,4,2,1,1,0,0]
function dailyTemperatures(array $temps): array
{
    $result = array_fill(0, count($temps), 0);
    $stack  = []; // stores indices, temperatures in decreasing order
    foreach ($temps as $i => $temp) {
        while (!empty($stack) && $temps[end($stack)] < $temp) {
            $prevIdx          = array_pop($stack);
            $result[$prevIdx] = $i - $prevIdx;
        }
        $stack[] = $i;
    }
    return $result;
}
// Time: O(n) — each index pushed/popped at most once
</code></pre>
</div>

<h2>Queue — FIFO (First In, First Out)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Queue with SplQueue</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// WARNING: array_shift() is O(n) — use SplQueue for O(1) dequeue
$queue = new SplQueue();
$queue->enqueue('task1'); // O(1)
$queue->enqueue('task2');
$front = $queue->dequeue(); // O(1) - removes from front
$front = $queue->bottom();  // O(1) - peek without removing

// BFS uses a Queue — process nodes level by level
// See Trees lesson for levelOrder() implementation

// Sliding Window Maximum using deque
// [1,3,-1,-3,5,3,6,7], k=3 -> [3,3,5,5,6,7]
function maxSlidingWindow(array $nums, int $k): array
{
    $deque  = new SplDoublyLinkedList(); // stores indices
    $result = [];
    for ($i = 0; $i < count($nums); $i++) {
        // Remove indices outside window from front
        while (!$deque->isEmpty() && $deque->bottom() < $i - $k + 1) {
            $deque->shift();
        }
        // Remove smaller elements from back — they can never be the max
        while (!$deque->isEmpty() && $nums[$deque->top()] < $nums[$i]) {
            $deque->pop();
        }
        $deque->push($i);
        if ($i >= $k - 1) $result[] = $nums[$deque->bottom()];
    }
    return $result;
}
// Time: O(n)  Space: O(k)
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Stack: LIFO. Push/pop from same end. O(1) both. Use PHP array (end = top).</li>
    <li>Queue: FIFO. Use SplQueue — array_shift() is O(n)!</li>
    <li>Monotonic stack: decreasing/increasing order for "next greater/smaller element"</li>
    <li>Deque: sliding window max/min in O(n) — maintains useful candidates only</li>
    <li>BFS always uses a queue. DFS always uses a stack (or recursion).</li>
  </ul>
</div>
`,
};
