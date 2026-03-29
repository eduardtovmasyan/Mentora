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
  segments: [
    { type: 'h2', text: 'Node Implementation' },
    { type: 'code', lang: 'php', label: 'PHP — ListNode', code: `&lt;?php
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
}` },

    { type: 'h2', text: 'Fast & Slow Pointers' },
    { type: 'code', lang: 'php', label: 'PHP — Fast/Slow Patterns', code: `&lt;?php
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
}` },

    { type: 'h2', text: 'Reversal & Merge' },
    { type: 'code', lang: 'php', label: 'PHP — Reversal & Merge', code: `&lt;?php
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
// Time: O(m+n)  Space: O(1)` },

    { type: 'callout', style: 'tip', title: 'The Dummy Node Trick', html: 'Create a <code>$dummy = new ListNode(0)</code> at the start of any list-building problem. Work with <code>$dummy->next</code> as the real head. Return <code>$dummy->next</code> at the end. This eliminates the special case of updating the head node.' },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'O(1) insert/delete given a pointer. O(n) access by index.',
      'Fast/slow pointers: detect cycle O(1) space, find middle, kth from end',
      'Reversal: three pointers (prev, curr, next) - draw on paper first',
      'Dummy node: eliminates head edge cases in list construction problems',
      'PHP SplDoublyLinkedList: O(1) push/pop from both ends',
    ]},
  ],
};
