export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'Trees & Binary Trees',
  intro: 'Trees are hierarchical data structures that appear in almost every technical interview. Master DFS (pre/in/post-order) and BFS (level-order) traversals, and you can solve 80% of tree problems by combining them with recursion.',
  tags: ['DFS', 'BFS', 'Pre/In/Post order', 'Level order', 'Height', 'Recursion'],
  seniorExpectations: [
    'Implement all 4 traversals recursively and iteratively',
    'Know which traversal to use for which problem',
    'Calculate tree height, diameter, balance in one pass',
    'Find Lowest Common Ancestor efficiently',
    'Explain why iterative DFS avoids stack overflow',
  ],
  segments: [
    { type: 'h2', text: 'Tree Terminology' },
    { type: 'ul', items: [
      '<strong>Root:</strong> Top node, no parent',
      '<strong>Leaf:</strong> Node with no children',
      '<strong>Height:</strong> Longest path from node to a leaf',
      '<strong>Balanced:</strong> |height(left) - height(right)| &lt;= 1 for every node',
      '<strong>Complete:</strong> All levels filled except possibly the last (filled left to right)',
    ]},

    { type: 'h2', text: 'All Traversals' },
    { type: 'code', lang: 'php', label: 'PHP — Tree Traversals', code: `&lt;?php
class TreeNode
{
    public function __construct(
        public int $val            = 0,
        public ?TreeNode $left     = null,
        public ?TreeNode $right    = null,
    ) {}
}

//       1
//      / \
//     2   3
//    / \
//   4   5

// Pre-order: Root → Left → Right  [1,2,4,5,3]  Use: copy/serialize tree
function preorder(?TreeNode $root): array
{
    if ($root === null) return [];
    return array_merge([$root->val], preorder($root->left), preorder($root->right));
}

// In-order: Left → Root → Right   [4,2,5,1,3]  Use: sorted order in BST!
function inorder(?TreeNode $root): array
{
    if ($root === null) return [];
    return array_merge(inorder($root->left), [$root->val], inorder($root->right));
}

// Post-order: Left → Right → Root  [4,5,2,3,1]  Use: delete tree, dir sizes
function postorder(?TreeNode $root): array
{
    if ($root === null) return [];
    return array_merge(postorder($root->left), postorder($root->right), [$root->val]);
}

// BFS Level-order: level by level  [[1],[2,3],[4,5]]
function levelOrder(?TreeNode $root): array
{
    if ($root === null) return [];
    $result = []; $queue = [$root];
    while (!empty($queue)) {
        $level = []; $size = count($queue);
        for ($i = 0; $i < $size; $i++) {
            $node = array_shift($queue);
            $level[] = $node->val;
            if ($node->left)  $queue[] = $node->left;
            if ($node->right) $queue[] = $node->right;
        }
        $result[] = $level;
    }
    return $result;
}

// Iterative in-order (avoids recursion stack overflow on huge trees)
function inorderIterative(?TreeNode $root): array
{
    $result = []; $stack = []; $curr = $root;
    while ($curr !== null || !empty($stack)) {
        while ($curr !== null) { $stack[] = $curr; $curr = $curr->left; }
        $curr = array_pop($stack);
        $result[] = $curr->val;
        $curr = $curr->right;
    }
    return $result;
}` },

    { type: 'h2', text: 'Common Tree Problems' },
    { type: 'code', lang: 'php', label: 'PHP — Classic Tree Problems', code: `&lt;?php
// Max depth
function maxDepth(?TreeNode $root): int
{
    if ($root === null) return 0;
    return 1 + max(maxDepth($root->left), maxDepth($root->right));
}

// Is balanced? Returns height or -1 if unbalanced
function isBalanced(?TreeNode $root): bool
{
    $check = function(?TreeNode $node) use (&$check): int {
        if ($node === null) return 0;
        $l = $check($node->left);
        $r = $check($node->right);
        if ($l === -1 || $r === -1 || abs($l - $r) > 1) return -1;
        return 1 + max($l, $r);
    };
    return $check($root) !== -1;
}

// Diameter = longest path between any two nodes (may not go through root)
function diameterOfBinaryTree(?TreeNode $root): int
{
    $diameter = 0;
    $height = function(?TreeNode $node) use (&$height, &$diameter): int {
        if ($node === null) return 0;
        $l = $height($node->left);
        $r = $height($node->right);
        $diameter = max($diameter, $l + $r); // path through this node
        return 1 + max($l, $r);
    };
    $height($root);
    return $diameter;
}

// Lowest Common Ancestor in binary tree (not BST)
function lowestCommonAncestor(?TreeNode $root, TreeNode $p, TreeNode $q): ?TreeNode
{
    if ($root === null || $root === $p || $root === $q) return $root;
    $left  = lowestCommonAncestor($root->left, $p, $q);
    $right = lowestCommonAncestor($root->right, $p, $q);
    if ($left !== null && $right !== null) return $root; // p and q in different subtrees
    return $left ?? $right;
}` },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'In-order of BST gives sorted order — critical property',
      'DFS uses recursion (or explicit stack). BFS uses a queue.',
      'Base case for tree recursion: null node returns 0/null/[]',
      'Height/depth: return values UP the recursion (post-order thinking)',
      'Path problems (diameter): use a global variable updated inside recursion',
      'Balanced tree: O(log n) height. Skewed tree: O(n) height.',
    ]},
  ],
};
