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
  body: `
<h2>BST Invariant</h2>
<p>For every node N: <strong>all values in left subtree &lt; N.val &lt; all values in right subtree</strong>. This is global — not just parent-child.</p>

<div class="callout callout-warn">
  <div class="callout-title">Common Mistake</div>
  <p>Checking only parent vs child misses violations across subtree boundaries. Always validate with propagated min/max bounds.</p>
</div>

<h2>Node + Operations</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">class TreeNode {
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
}
</code></pre>
</div>

<h2>Validate BST (LeetCode 98)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">function isValidBST(?TreeNode $node, ?int $min = null, ?int $max = null): bool {
    if ($node === null) return true;
    if ($min !== null && $node->val <= $min) return false;
    if ($max !== null && $node->val >= $max) return false;
    return isValidBST($node->left,  $min,       $node->val)
        && isValidBST($node->right, $node->val, $max);
}
</code></pre>
</div>

<h2>In-order Traversal → sorted output</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">function inorder(?TreeNode $node, array &$res): void {
    if (!$node) return;
    inorder($node->left, $res);
    $res[] = $node->val;
    inorder($node->right, $res);
}
// A valid BST's inorder result is strictly increasing.
</code></pre>
</div>

<h2>In-order Successor</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">function inorderSuccessor(?TreeNode $root, TreeNode $p): ?TreeNode {
    $successor = null;
    while ($root) {
        if ($p->val < $root->val) { $successor = $root; $root = $root->left; }
        else                       { $root = $root->right; }
    }
    return $successor;
}
</code></pre>
</div>

<h2>Complexity</h2>
<table class="ctable">
  <thead><tr><th>Operation</th><th>Average (balanced)</th><th>Worst (sorted input)</th></tr></thead>
  <tbody>
    <tr><td>Search / Insert / Delete</td><td class="olog">O(log n)</td><td class="on">O(n)</td></tr>
    <tr><td>In-order traversal</td><td class="on">O(n)</td><td class="on">O(n)</td></tr>
  </tbody>
</table>

<div class="callout callout-info">
  <div class="callout-title">Self-balancing Trees</div>
  <p><strong>AVL trees</strong>: height ≤ 1.44 log n, strict balance — preferred for read-heavy. <strong>Red-Black trees</strong>: allow slight imbalance, faster rebalancing — used in Java TreeMap, C++ std::map, Linux kernel scheduler. PHP has no built-in balanced BST; use sorted arrays + binary search in practice.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>BST invariant is global — validate with min/max bounds propagated through recursion</li>
    <li>Delete with two children: swap with in-order successor (min of right subtree), then delete successor</li>
    <li>In-order traversal always yields sorted output — used to verify BST correctness</li>
    <li>Unbalanced BST degrades to O(n) on sorted/reverse-sorted input</li>
    <li>Real sorted maps use Red-Black or AVL — O(log n) guaranteed regardless of input order</li>
  </ul>
</div>
`,
};
