export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'Hash Maps & Hash Sets',
  intro: 'Hash maps give O(1) average lookup, insert, and delete. They are the most useful data structure for solving interview problems. Any time you need to remember what you have seen, count occurrences, or find a complement — reach for a hash map first.',
  tags: ['O(1) average', 'Chaining vs open addressing', 'Frequency counting', 'Two Sum', 'isset vs in_array'],
  seniorExpectations: [
    'Explain how a hash function maps a key to a bucket',
    'Explain collision resolution: chaining (PHP) vs open addressing (Python)',
    'Know why worst case is O(n), not O(1)',
    'Recognize the Two Sum pattern instantly',
    'Always use isset() not in_array() for O(1) membership testing',
  ],
  segments: [
    { type: 'h2', text: 'How Hash Maps Work' },
    { type: 'p', html: 'A hash map runs the key through a <strong>hash function</strong> to get a bucket index, then stores the key-value pair in that bucket. Lookup just hashes the key again and jumps straight to the bucket — O(1).' },
    { type: 'p', html: '<strong>Collision resolution:</strong> Two keys can hash to the same bucket. PHP uses <strong>chaining</strong> — each bucket holds a linked list of pairs. Python dicts use <strong>open addressing</strong> — on collision, probe for the next empty slot. Worst case (all keys in one bucket) is O(n) lookup — always say "O(1) <em>average</em>" in interviews.' },

    { type: 'h2', text: 'PHP Hash Map Patterns' },
    { type: 'code', lang: 'php', label: 'PHP — Core Patterns', code: `&lt;?php
// ── FREQUENCY COUNTING ───────────────────────────────────────
$freq = [];
$str  = "aababc";
for ($i = 0; $i < strlen($str); $i++) {
    $freq[$str[$i]] = ($freq[$str[$i]] ?? 0) + 1;
}
// ['a'=>3, 'b'=>2, 'c'=>1]

// Built-in for arrays:
$freq = array_count_values(['a','b','a','c','b','a']);

// ── TWO SUM ──────────────────────────────────────────────────
// [2,7,11,15], target=9 → [0,1]
// KEY INSIGHT: for each number, check if complement is already in the map
function twoSum(array $nums, int $target): array
{
    $seen = []; // value → index
    foreach ($nums as $i => $num) {
        $complement = $target - $num;
        if (isset($seen[$complement])) {   // O(1) lookup
            return [$seen[$complement], $i];
        }
        $seen[$num] = $i;
    }
    return [];
}
// Time: O(n)  |  Space: O(n)

// ── GROUPING ─────────────────────────────────────────────────
// Group anagrams together: ["eat","tea","tan","ate","nat","bat"]
// → [["eat","tea","ate"],["tan","nat"],["bat"]]
function groupAnagrams(array $strs): array
{
    $groups = [];
    foreach ($strs as $str) {
        $chars = str_split($str);
        sort($chars);
        $key = implode('', $chars);   // sorted letters = fingerprint
        $groups[$key][] = $str;
    }
    return array_values($groups);
}

// ── DUPLICATE DETECTION ──────────────────────────────────────
function containsDuplicate(array $nums): bool
{
    $seen = [];
    foreach ($nums as $n) {
        if (isset($seen[$n])) return true;
        $seen[$n] = true;
    }
    return false;
}` },

    { type: 'h2', text: 'Hash Set — O(1) Membership Testing' },
    { type: 'p', html: 'Simulate a hash set with <code>[\'value\' => true]</code>. Always use <code>isset($set[$val])</code> — never <code>in_array()</code> which is O(n).' },
    { type: 'code', lang: 'php', label: 'PHP — Hash Set', code: `&lt;?php
// Longest consecutive sequence: [100,4,200,1,3,2] → 4 (1,2,3,4)
function longestConsecutive(array $nums): int
{
    $set     = array_flip($nums); // O(n) build
    $longest = 0;

    foreach ($set as $num => $_) {
        if (!isset($set[$num - 1])) {        // start of a sequence?
            $len = 1;
            while (isset($set[$num + $len])) $len++;
            $longest = max($longest, $len);
        }
    }
    return $longest;
}
// Time: O(n) — each number touched at most twice` },

    { type: 'callout', style: 'danger', title: 'Critical: isset() vs in_array()', html: '<code>isset($arr[$key])</code> is O(1) — it uses the hash. <code>in_array($val, $arr)</code> is O(n) — it scans every element. Many developers fail interviews by using <code>in_array</code> inside a loop, turning an O(n) solution into O(n²). Store values as keys and use <code>isset</code>.' },

    { type: 'h2', text: 'Interview Questions' },
    { type: 'qa', pairs: [
      {
        q: 'Q: Why is hash map lookup O(1) average but O(n) worst case?',
        a: 'On average the hash function spreads keys uniformly, so each bucket holds ~1 item and lookup costs O(1). Worst case: all keys hash to the same bucket. Lookup now walks a linked list of n items — O(n). Modern runtimes defend against this with randomized hash seeds per process start. PHP does this — so deliberately crafted adversarial inputs won\'t degrade performance across restarts.',
      },
      {
        q: 'Q: When would you use a sorted array instead of a hash map?',
        a: 'When you need ordered iteration, range queries, predecessor/successor lookups, or the k-th smallest element. A hash map gives O(1) exact-key lookup but has no concept of order. A sorted structure gives O(log n) lookup but lets you scan ranges, walk in sorted order, and answer "what is the next value greater than X?" Hash maps also use more memory per entry (key + value + metadata vs just value).',
      },
    ]},

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'Hash map = O(1) average for lookup, insert, delete — use when you need to "remember"',
      '<code>isset($arr[$key])</code> is O(1). <code>in_array($val, $arr)</code> is O(n). Always use isset for membership',
      'Two Sum pattern: for each element check if its complement is already in the map',
      'Frequency map: foundation of anagram, majority element, first non-repeating problems',
      'Hash set (value as key, true as value): deduplication, consecutive sequence',
      'PHP uses chaining; hash seeds are randomized per-process to prevent attacks',
      'Always say "O(1) average" — worst case is O(n)',
    ]},
  ],
};
