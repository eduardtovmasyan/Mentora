export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'Linked Lists',
  intro: 'Linked lists store elements in nodes scattered in memory, each pointing to the next. O(1) insert/delete anywhere (given a pointer), but O(n) access by index. Most interview problems use fast/slow pointers or the dummy-node trick.',
  tags: ['Fast/Slow pointers', "Floyd's algorithm", 'Reversal', 'Dummy node', 'O(1) insert'],
  seniorExpectations: [
    'Detect a cycle in O(1) space using fast/slow pointers',
    'Reverse a linked list iteratively in-place',
    'Use a dummy node to eliminate head edge cases',
    'Find the middle node with fast/slow pointer',
    'Merge two sorted lists in O(m+n)',
  ],
  body: `
<h2>Node Implementation</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — ListNode</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
class ListNode
{
    public function __construct(
        public int $val        = 0,
        public ?ListNode $next = null,
    ) {}
}

function arrayToList(array $vals): ?ListNode
{
    $dummy = new ListNode();
    $curr  = $dummy;
    foreach ($vals as $v) { $curr->next = new ListNode($v); $curr = $curr->next; }
    return $dummy->next;
}
</code></pre>
</div>

<h2>Fast & Slow Pointers</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Fast/Slow Patterns</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Detect cycle - O(1) space
function hasCycle(?ListNode $head): bool
{
    $slow = $fast = $head;
    while ($fast !== null && $fast->next !== null) {
        $slow = $slow->next;
        $fast = $fast->next->next;
        if ($slow === $fast) return true;
    }
    return false;
}

// Find middle - when fast ends, slow is at middle
function middleNode(?ListNode $head): ?ListNode
{
    $slow = $fast = $head;
    while ($fast !== null && $fast->next !== null) {
        $slow = $slow->next;
        $fast = $fast->next->next;
    }
    return $slow;
}
</code></pre>
</div>

<h2>Reversal & Merge</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Reversal & Merge</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Reverse entire list - 1->2->3->4->5 becomes 5->4->3->2->1
function reverseList(?ListNode $head): ?ListNode
{
    $prev = null; $curr = $head;
    while ($curr !== null) {
        $next       = $curr->next;
        $curr->next = $prev;
        $prev       = $curr;
        $curr       = $next;
    }
    return $prev;
}
// Time: O(n)  Space: O(1)

// Merge two sorted lists using dummy node trick
function mergeTwoLists(?ListNode $l1, ?ListNode $l2): ?ListNode
{
    $dummy = new ListNode(0); // sentinel - eliminates head edge case
    $curr  = $dummy;
    while ($l1 !== null && $l2 !== null) {
        if ($l1->val <= $l2->val) { $curr->next = $l1; $l1 = $l1->next; }
        else                       { $curr->next = $l2; $l2 = $l2->next; }
        $curr = $curr->next;
    }
    $curr->next = $l1 ?? $l2;
    return $dummy->next;
}
// Time: O(m+n)  Space: O(1)
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">The Dummy Node Trick</div>
  <p>Create a <code>$dummy = new ListNode(0)</code> at the start of any list-building problem. Work with <code>$dummy->next</code> as the real head. Return <code>$dummy->next</code> at the end. This eliminates the special case of updating the head node.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>O(1) insert/delete given a pointer. O(n) access by index.</li>
    <li>Fast/slow pointers: detect cycle O(1) space, find middle, kth from end</li>
    <li>Reversal: three pointers (prev, curr, next) - draw on paper first</li>
    <li>Dummy node: eliminates head edge cases in list construction problems</li>
    <li>PHP SplDoublyLinkedList: O(1) push/pop from both ends</li>
  </ul>
</div>
`,
};
