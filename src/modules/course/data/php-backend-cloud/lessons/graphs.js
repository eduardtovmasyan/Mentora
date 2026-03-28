export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'Graphs: BFS, DFS & Essential Algorithms',
  intro: 'Graphs are the most expressive data structure in computer science — every network, dependency tree, route-planning system, and social graph is a graph problem at its core. Unlike trees, graphs can have cycles, disconnected components, and directed or weighted edges. Senior engineers must be fluent in both representation choices (adjacency list vs matrix), traversal strategies (BFS vs DFS), and higher-level algorithms built on top of them: cycle detection, topological ordering, and connected component analysis. This lesson builds that fluency with idiomatic PHP implementations and rigorous complexity analysis.',
  tags: ['graphs', 'bfs', 'dfs', 'topological-sort', 'cycle-detection', 'algorithms', 'php'],
  seniorExpectations: [
    'Choose between adjacency list and adjacency matrix based on graph density and the operations required',
    'Implement BFS and DFS iteratively and recursively, and articulate when each is preferable',
    'Detect cycles in both directed and undirected graphs with correct coloring or visited-set logic',
    'Produce a valid topological ordering using Kahn\'s algorithm (BFS-based) or DFS post-order',
    'Identify connected components and reason about graph connectivity at scale (union-find vs BFS)',
    'State time and space complexity for all graph algorithms in terms of V (vertices) and E (edges)',
  ],
  body: `
<h2>Representation: Adjacency List vs Adjacency Matrix</h2>
<p>The choice of representation determines the complexity of every operation that follows. An <strong>adjacency matrix</strong> is a V×V boolean (or weight) matrix where <code>matrix[u][v] = 1</code> means an edge exists. An <strong>adjacency list</strong> maps each vertex to the list of its neighbours.</p>

<table class="ctable">
  <thead><tr><th>Operation</th><th>Adjacency Matrix</th><th>Adjacency List</th></tr></thead>
  <tbody>
    <tr><td>Space</td><td class="on">O(V²)</td><td class="on">O(V + E)</td></tr>
    <tr><td>Edge lookup (u→v)</td><td class="o1">O(1)</td><td class="on">O(degree(u))</td></tr>
    <tr><td>All neighbours of u</td><td class="on">O(V)</td><td class="on">O(degree(u))</td></tr>
    <tr><td>Add edge</td><td class="o1">O(1)</td><td class="o1">O(1) amortised</td></tr>
    <tr><td>Best for</td><td>Dense graphs, quick edge checks</td><td>Sparse graphs (most real-world)</td></tr>
  </tbody>
</table>

<p>Real-world graphs (social networks, dependency graphs, road maps) are almost always sparse: E ≪ V². Use adjacency lists by default and reach for a matrix only when you need O(1) edge existence checks and can afford O(V²) memory.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Building an adjacency list for a directed graph
class Graph
{
    private array $adj = [];

    public function addVertex(int|string $v): void
    {
        if (!isset($this->adj[$v])) {
            $this->adj[$v] = [];
        }
    }

    public function addEdge(int|string $from, int|string $to): void
    {
        $this->addVertex($from);
        $this->addVertex($to);
        $this->adj[$from][] = $to;
        // For undirected: also $this->adj[$to][] = $from;
    }

    public function neighbours(int|string $v): array
    {
        return $this->adj[$v] ?? [];
    }

    public function vertices(): array
    {
        return array_keys($this->adj);
    }
}

$g = new Graph();
$g->addEdge('A', 'B');
$g->addEdge('A', 'C');
$g->addEdge('B', 'D');
$g->addEdge('C', 'D');
</code></pre>
</div>

<h2>BFS: Breadth-First Search</h2>
<p>BFS explores vertices level by level using a queue (FIFO). It guarantees the shortest path in an <strong>unweighted</strong> graph because it visits all vertices at distance k before any at distance k+1. Use BFS for: shortest path in unweighted graphs, level-order traversal, finding all nodes within k hops, and problems where you need the minimum number of steps.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// BFS — returns distances from source; -1 if unreachable
function bfs(Graph $g, int|string $source): array
{
    $dist    = [];
    $visited = [];
    $queue   = new SplQueue();

    $visited[$source] = true;
    $dist[$source]    = 0;
    $queue->enqueue($source);

    while (!$queue->isEmpty()) {
        $u = $queue->dequeue();

        foreach ($g->neighbours($u) as $v) {
            if (!isset($visited[$v])) {
                $visited[$v] = true;
                $dist[$v]    = $dist[$u] + 1;
                $queue->enqueue($v);
            }
        }
    }

    return $dist; // vertices not in $dist are unreachable
}

// BFS shortest path reconstruction
function bfsPath(Graph $g, int|string $src, int|string $dst): array
{
    $parent  = [$src => null];
    $queue   = new SplQueue();
    $queue->enqueue($src);

    while (!$queue->isEmpty()) {
        $u = $queue->dequeue();
        if ($u === $dst) break;

        foreach ($g->neighbours($u) as $v) {
            if (!array_key_exists($v, $parent)) {
                $parent[$v] = $u;
                $queue->enqueue($v);
            }
        }
    }

    if (!array_key_exists($dst, $parent)) return []; // no path

    $path = [];
    for ($v = $dst; $v !== null; $v = $parent[$v]) {
        array_unshift($path, $v);
    }
    return $path;
}
</code></pre>
</div>

<h2>DFS: Depth-First Search</h2>
<p>DFS explores as deep as possible before backtracking, using a stack (or recursion). It does not guarantee shortest paths but is preferable for: cycle detection, topological sort, finding strongly connected components, maze solving, and any problem where you need to explore all paths. Both iterative (explicit stack) and recursive DFS are valid; prefer iterative for production code to avoid stack overflow on deep graphs.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// DFS — iterative with explicit stack
function dfsIterative(Graph $g, int|string $source): array
{
    $visited = [];
    $order   = [];
    $stack   = new SplStack();
    $stack->push($source);

    while (!$stack->isEmpty()) {
        $u = $stack->pop();
        if (isset($visited[$u])) continue;

        $visited[$u] = true;
        $order[]     = $u;

        // Push neighbours in reverse to maintain left-to-right order
        foreach (array_reverse($g->neighbours($u)) as $v) {
            if (!isset($visited[$v])) {
                $stack->push($v);
            }
        }
    }

    return $order;
}

// DFS — recursive (cleaner for cycle detection and topo sort)
function dfsRecursive(
    Graph $g,
    int|string $u,
    array &$visited,
    array &$order
): void {
    $visited[$u] = true;
    $order[]     = $u;

    foreach ($g->neighbours($u) as $v) {
        if (!isset($visited[$v])) {
            dfsRecursive($g, $v, $visited, $order);
        }
    }
}
</code></pre>
</div>

<h2>Cycle Detection</h2>
<p>Cycle detection differs between directed and undirected graphs.</p>
<p><strong>Undirected graph:</strong> during DFS, if you visit a neighbour that is already visited and is not the parent of the current node, a cycle exists.</p>
<p><strong>Directed graph:</strong> use three-color marking — WHITE (unvisited), GRAY (in current DFS path / recursion stack), BLACK (fully processed). If you reach a GRAY node, you have found a back edge, which means a cycle exists.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Cycle detection in a DIRECTED graph using 3-color DFS
const WHITE = 0;
const GRAY  = 1;
const BLACK = 2;

function hasCycleDirected(Graph $g): bool
{
    $color = [];
    foreach ($g->vertices() as $v) {
        $color[$v] = WHITE;
    }

    foreach ($g->vertices() as $v) {
        if ($color[$v] === WHITE) {
            if (dfsCycleCheck($g, $v, $color)) {
                return true;
            }
        }
    }
    return false;
}

function dfsCycleCheck(Graph $g, int|string $u, array &$color): bool
{
    $color[$u] = GRAY; // mark as in-progress

    foreach ($g->neighbours($u) as $v) {
        if ($color[$v] === GRAY) return true;  // back edge = cycle
        if ($color[$v] === WHITE && dfsCycleCheck($g, $v, $color)) {
            return true;
        }
    }

    $color[$u] = BLACK; // fully processed
    return false;
}
</code></pre>
</div>

<h2>Topological Sort</h2>
<p>Topological sort produces a linear ordering of vertices in a DAG (directed acyclic graph) such that for every edge u→v, u appears before v. It is only defined for DAGs — the presence of a cycle makes topological ordering impossible. Applications: build systems (make, Gradle), task scheduling, dependency resolution (Composer, npm), and course prerequisite ordering.</p>
<p>Two approaches: (1) <strong>Kahn's algorithm (BFS-based)</strong> — start with all vertices of in-degree 0, peel them off, and reduce neighbours' in-degrees. If the final ordering contains fewer than V vertices, a cycle exists. (2) <strong>DFS post-order</strong> — push each vertex onto a stack after all its descendants are processed; reverse the stack for the result.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Kahn's Algorithm — BFS topological sort
function topologicalSort(Graph $g): array
{
    $inDegree = [];
    foreach ($g->vertices() as $v) {
        $inDegree[$v] = 0;
    }
    foreach ($g->vertices() as $u) {
        foreach ($g->neighbours($u) as $v) {
            $inDegree[$v]++;
        }
    }

    $queue = new SplQueue();
    foreach ($inDegree as $v => $deg) {
        if ($deg === 0) $queue->enqueue($v);
    }

    $order = [];
    while (!$queue->isEmpty()) {
        $u = $queue->dequeue();
        $order[] = $u;

        foreach ($g->neighbours($u) as $v) {
            $inDegree[$v]--;
            if ($inDegree[$v] === 0) {
                $queue->enqueue($v);
            }
        }
    }

    // If order doesn't contain all vertices, the graph has a cycle
    if (count($order) !== count($g->vertices())) {
        throw new RuntimeException('Graph contains a cycle — topological sort impossible.');
    }

    return $order;
}
</code></pre>
</div>

<h2>Connected Components</h2>
<p>In an undirected graph, a connected component is a maximal set of vertices all reachable from each other. Finding all components is a straightforward extension of BFS/DFS: iterate over all vertices; whenever you find an unvisited vertex, start a BFS/DFS from it — everything reachable belongs to the same component. Time complexity is O(V+E) regardless of the number of components.</p>
<p>For dynamic connectivity (edges added or removed at runtime), Union-Find (disjoint set union) is superior — it supports union and find in near-O(1) amortised time with path compression and union by rank.</p>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: When should you use BFS vs DFS, and does it matter for correctness?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>For correctness, both BFS and DFS visit all reachable vertices so either works for reachability, connected components, and cycle detection. The choice matters for the result's properties: BFS gives the shortest path (fewest edges) in an unweighted graph; DFS gives post-order which is needed for topological sort and Tarjan's SCC algorithm. In practice: shortest path or level-by-level → BFS; exhaustive path exploration, topo sort, SCC → DFS. Also consider stack overflow: DFS on a path graph of 10⁶ nodes will overflow PHP's call stack recursively; prefer iterative DFS or BFS in those cases.</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Why does cycle detection in a directed graph require three colors rather than two?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Two colors (visited / unvisited) are sufficient for undirected graphs because any edge to an already-visited non-parent node signals a cycle. In a directed graph, an edge to an already-finished (BLACK) node is a cross edge or forward edge — not a cycle. Only an edge to a GRAY node (currently on the DFS recursion stack) is a back edge, which indicates a cycle. Without the GRAY state you cannot distinguish "I visited this node in a previous DFS path" (cross edge, no cycle) from "I am currently exploring through this node" (back edge, cycle).</p></div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: What is the time and space complexity of BFS and DFS on a graph represented as an adjacency list?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a"><p>Both BFS and DFS run in O(V + E) time: each vertex is enqueued/pushed once (O(V)) and each edge is examined once when iterating over neighbours (O(E)). Space complexity is O(V) for the visited set plus the auxiliary structure — O(V) for the BFS queue in the worst case (a wide graph) and O(V) for the DFS stack (a deep path). For an adjacency matrix representation, both become O(V²) time because iterating over all neighbours of a vertex costs O(V) regardless of actual degree.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Key Points to Remember</div>
  <ul>
    <li>Adjacency list is O(V+E) space and the correct default; adjacency matrix is O(V²) and only justified for dense graphs or O(1) edge lookups.</li>
    <li>BFS guarantees shortest path (by edge count) in unweighted graphs; DFS does not.</li>
    <li>DFS post-order is the foundation of topological sort and Tarjan's strongly connected components algorithm.</li>
    <li>Directed cycle detection requires three-color DFS (WHITE/GRAY/BLACK); two-color is enough for undirected graphs.</li>
    <li>Kahn's algorithm detects cycles as a side effect: if the topological order is shorter than V vertices, a cycle exists.</li>
    <li>Topological sort is only defined on DAGs; any cycle makes it impossible.</li>
    <li>Both BFS and DFS are O(V+E) time and O(V) space on an adjacency list.</li>
    <li>For dynamic connectivity (edges inserted/deleted), Union-Find is more efficient than repeated BFS/DFS.</li>
  </ul>
</div>
`,
};
