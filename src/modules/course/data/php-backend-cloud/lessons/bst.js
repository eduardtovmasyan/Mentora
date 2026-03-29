export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'Binary Search Trees',
  intro: 'A BST maintains the invariant that every left descendant is smaller and every right descendant is larger than the current node, giving O(log n) average-case search/insert/delete. Without balancing, sorted input degrades to O(n). Balanced variants (AVL, Red-Black) power sorted maps and sets in every standard library.',
  tags: ['BST invariant', 'In-order traversal', 'AVL', 'Validate BST', 'Successor/Predecessor'],
  seniorExpectations: [
    'Implement insert, search, and delete (including the two-child case)',
    'Validate that a tree is a valid BST using min/max bounds (not just parent-child)',
    'Find in-order successor and predecessor in O(h) without extra space',
    'Explain why sorted insertion creates a degenerate O(n) tree',
    'Know when AVL vs Red-Black trees are preferred',
  ],
  segments: [
    { type: 'h2', text: 'BST Invariant' },
    { type: 'p', html: 'For every node N: <strong>all values in left subtree &lt; N.val &lt; all values in right subtree</strong>. This is global — not just parent-child.' },

    { type: 'callout', style: 'warn', title: 'Common Mistake', html: 'Checking only parent vs child misses violations across subtree boundaries. Always validate with propagated min/max bounds.' },

    { type: 'h2', text: 'Node + Operations' },
    { type: 'code', lang: 'php', label: 'PHP', code: `class TreeNode {
    public function __construct(
        public int $val,
        public ?TreeNode $left = null,
        public ?TreeNode $right = null,
    ) {}
}

function search(?TreeNode $node, int $target): ?TreeNode {
    if ($node === null || $node->val === $target) return $node;
    return $target < $node->val
        ? search($node->left,  $target)
        : search($node->right, $target);
}

function insert(?TreeNode $node, int $val): TreeNode {
    if ($node === null) return new TreeNode($val);
    if ($val < $node->val) $node->left  = insert($node->left,  $val);
    if ($val > $node->val) $node->right = insert($node->right, $val);
    return $node;
}

function delete(?TreeNode $node, int $val): ?TreeNode {
    if ($node === null) return null;
    if ($val < $node->val) { $node->left  = delete($node->left,  $val); }
    elseif ($val > $node->val) { $node->right = delete($node->right, $val); }
    else {
        if ($node->left === null)  return $node->right;
        if ($node->right === null) return $node->left;
        // Two children: replace with in-order successor (min of right)
        $succ      = minNode($node->right);
        $node->val = $succ->val;
        $node->right = delete($node->right, $succ->val);
    }
    return $node;
}

function minNode(TreeNode $node): TreeNode {
    while ($node->left) $node = $node->left;
    return $node;
}` },

    { type: 'h2', text: 'Validate BST (LeetCode 98)' },
    { type: 'code', lang: 'php', label: 'PHP', code: `function isValidBST(?TreeNode $node, ?int $min = null, ?int $max = null): bool {
    if ($node === null) return true;
    if ($min !== null && $node->val <= $min) return false;
    if ($max !== null && $node->val >= $max) return false;
    return isValidBST($node->left,  $min,       $node->val)
        && isValidBST($node->right, $node->val, $max);
}` },

    { type: 'h2', text: 'In-order Traversal → sorted output' },
    { type: 'code', lang: 'php', label: 'PHP', code: `function inorder(?TreeNode $node, array &$res): void {
    if (!$node) return;
    inorder($node->left, $res);
    $res[] = $node->val;
    inorder($node->right, $res);
}
// A valid BST's inorder result is strictly increasing.` },

    { type: 'h2', text: 'In-order Successor' },
    { type: 'code', lang: 'php', label: 'PHP', code: `function inorderSuccessor(?TreeNode $root, TreeNode $p): ?TreeNode {
    $successor = null;
    while ($root) {
        if ($p->val < $root->val) { $successor = $root; $root = $root->left; }
        else                       { $root = $root->right; }
    }
    return $successor;
}` },

    { type: 'h2', text: 'Complexity' },
    { type: 'table', headers: ['Operation', 'Average (balanced)', 'Worst (sorted input)'], rows: [
      ['Search / Insert / Delete', { v: 'O(log n)', cls: 'olog' }, { v: 'O(n)', cls: 'on' }],
      ['In-order traversal',       { v: 'O(n)',     cls: 'on'   }, { v: 'O(n)', cls: 'on' }],
    ]},

    { type: 'callout', style: 'info', title: 'Self-balancing Trees', html: '<strong>AVL trees</strong>: height ≤ 1.44 log n, strict balance — preferred for read-heavy. <strong>Red-Black trees</strong>: allow slight imbalance, faster rebalancing — used in Java TreeMap, C++ std::map, Linux kernel scheduler. PHP has no built-in balanced BST; use sorted arrays + binary search in practice.' },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'BST invariant is global — validate with min/max bounds propagated through recursion',
      'Delete with two children: swap with in-order successor (min of right subtree), then delete successor',
      'In-order traversal always yields sorted output — used to verify BST correctness',
      'Unbalanced BST degrades to O(n) on sorted/reverse-sorted input',
      'Real sorted maps use Red-Black or AVL — O(log n) guaranteed regardless of input order',
    ]},
  ],
};
