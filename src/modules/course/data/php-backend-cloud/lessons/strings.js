export default {
  phase: 'Phase 1 · Algorithms & Data Structures',
  title: 'String Manipulation Patterns',
  intro: 'Strings are the most common interview data structure — nearly every problem either uses them directly or reduces to one. Senior engineers need to recognize canonical patterns (two-pointer palindrome, sliding window for substrings, frequency maps for anagrams) and understand PHP-specific pitfalls like concatenation in loops and multibyte character handling.',
  tags: ['strings', 'two-pointers', 'sliding-window', 'anagram', 'palindrome', 'frequency-map', 'php'],
  seniorExpectations: [
    'Identify which string pattern applies (frequency map vs two-pointer vs sliding window) before writing a single line',
    'Implement palindrome check, anagram detection, and longest unique substring in O(n) time',
    'Explain why string concatenation in a loop is O(n²) and use an array-join approach instead',
    'Handle multibyte / UTF-8 strings correctly using mb_* functions in PHP',
    'Solve "find all anagrams in a string" using a fixed-size sliding window with a frequency diff counter',
    'Articulate space complexity trade-offs between a character frequency array vs a hash map',
  ],
  segments: [
    { type: 'h2', text: 'Why Strings Are Tricky in PHP' },
    { type: 'p', html: 'PHP strings are byte arrays, not Unicode-aware sequences. <code>strlen("café")</code> returns 5, not 4, because <code>é</code> is two bytes in UTF-8. Every senior PHP engineer must know when to reach for <code>mb_strlen</code>, <code>mb_substr</code>, and <code>mb_strtolower</code> instead of their single-byte equivalents. For algorithm problems where input is guaranteed ASCII, the standard functions are fine and faster.' },

    { type: 'callout', style: 'warn', title: 'mb_* vs str_* — Know When to Switch', html: 'Use <code>mb_*</code> whenever user-facing text is involved (names, addresses, search terms). Use <code>str_*</code> for ASCII-only algorithm problems or binary data. Mixing them silently corrupts data on non-ASCII input.' },

    { type: 'h2', text: 'String Building: The O(n²) Trap' },
    { type: 'p', html: 'PHP strings are immutable values. Every concatenation with <code>.</code> creates a new string and copies all bytes seen so far. Inside a loop of <em>n</em> iterations this is O(1 + 2 + … + n) = <strong>O(n²)</strong> time and memory. The fix is to collect parts into an array and call <code>implode</code> once at the end — the equivalent of Java\'s <code>StringBuilder</code>.' },
    { type: 'code', lang: 'php', label: 'PHP — String Building', code: `&lt;?php
// ✗ BAD — O(n²): each . copies the entire growing string
function buildBad(array $words): string {
    $result = '';
    foreach ($words as $w) {
        $result .= $w . ', '; // new allocation every iteration
    }
    return rtrim($result, ', ');
}

// ✓ GOOD — O(n): collect then join once
function buildGood(array $words): string {
    return implode(', ', $words); // single allocation
}

// ✓ GOOD — manual StringBuilder equivalent when logic is complex
function buildComplex(array $tokens): string {
    $parts = [];
    foreach ($tokens as $t) {
        if ($t !== '') {
            $parts[] = strtoupper($t[0]) . substr($t, 1);
        }
    }
    return implode(' ', $parts); // O(n) total
}` },

    { type: 'h2', text: 'Palindrome Check — Two Pointers' },
    { type: 'p', html: 'A string is a palindrome if it reads the same forwards and backwards. The naive approach reverses the string (O(n) extra space). The optimal approach uses two pointers meeting in the middle, requiring O(1) extra space. The "valid palindrome" variant (LeetCode 125) skips non-alphanumeric characters — handle that with a helper or <code>ctype_alnum</code>.' },
    { type: 'code', lang: 'php', label: 'PHP — Palindrome (Two Pointers)', code: `&lt;?php
// Basic palindrome — O(n) time, O(1) space
function isPalindrome(string $s): bool {
    $lo = 0;
    $hi = strlen($s) - 1;
    while ($lo < $hi) {
        if ($s[$lo] !== $s[$hi]) {
            return false;
        }
        $lo++;
        $hi--;
    }
    return true;
}

// "Valid palindrome" variant — ignore non-alphanumeric, case-insensitive
function isValidPalindrome(string $s): bool {
    $s  = strtolower($s);
    $lo = 0;
    $hi = strlen($s) - 1;
    while ($lo < $hi) {
        while ($lo < $hi && !ctype_alnum($s[$lo])) $lo++;
        while ($lo < $hi && !ctype_alnum($s[$hi])) $hi--;
        if ($s[$lo] !== $s[$hi]) return false;
        $lo++;
        $hi--;
    }
    return true;
}

var_dump(isPalindrome('racecar'));       // true
var_dump(isValidPalindrome('A man, a plan, a canal: Panama')); // true` },

    { type: 'h2', text: 'Anagram Detection — Frequency Map' },
    { type: 'p', html: 'Two strings are anagrams if they contain exactly the same characters with the same frequencies. Sort-based approach is O(n log n). The optimal approach uses a frequency array of 26 integers for lowercase ASCII — O(n) time, O(1) space (fixed 26-element array, not dependent on input size).' },
    { type: 'code', lang: 'php', label: 'PHP — Anagram Detection', code: `&lt;?php
// O(n) time, O(1) space — frequency counter approach
function isAnagram(string $a, string $b): bool {
    if (strlen($a) !== strlen($b)) return false;

    $freq = array_fill(0, 26, 0); // fixed 26-element array
    $base = ord('a');

    for ($i = 0; $i < strlen($a); $i++) {
        $freq[ord($a[$i]) - $base]++;
        $freq[ord($b[$i]) - $base]--;
    }

    foreach ($freq as $count) {
        if ($count !== 0) return false;
    }
    return true;
}

// Find all anagram start indices of pattern p in string s — O(n)
function findAnagrams(string $s, string $p): array {
    $ns   = strlen($s);
    $np   = strlen($p);
    if ($ns < $np) return [];

    $base  = ord('a');
    $pFreq = array_fill(0, 26, 0);
    $wFreq = array_fill(0, 26, 0);
    $result = [];

    for ($i = 0; $i < $np; $i++) {
        $pFreq[ord($p[$i]) - $base]++;
        $wFreq[ord($s[$i]) - $base]++;
    }

    if ($pFreq === $wFreq) $result[] = 0;

    for ($i = $np; $i < $ns; $i++) {
        $wFreq[ord($s[$i]) - $base]++;               // add right char
        $wFreq[ord($s[$i - $np]) - $base]--;          // remove left char
        if ($pFreq === $wFreq) $result[] = $i - $np + 1;
    }

    return $result;
}

var_dump(findAnagrams('cbaebabacd', 'abc')); // [0, 6]` },

    { type: 'callout', style: 'tip', title: 'Frequency Array vs Hash Map', html: 'For lowercase ASCII, a 26-element integer array beats a hash map every time: no hashing overhead, cache-friendly, and O(1) guaranteed comparison. Switch to a hash map only when the character set is Unicode or unbounded.' },

    { type: 'h2', text: 'Longest Substring Without Repeating Characters — Sliding Window' },
    { type: 'p', html: 'This is the canonical variable-size sliding window problem. Maintain a window <code>[left, right]</code> and a hash map of the last seen index of each character. When a duplicate is found inside the window, shrink the window by jumping <code>left</code> past the duplicate\'s last position.' },
    { type: 'code', lang: 'php', label: 'PHP — Longest Unique Substring', code: `&lt;?php
// O(n) time, O(min(n, charset)) space
function lengthOfLongestSubstring(string $s): int {
    $lastSeen = []; // char -> last index seen
    $maxLen   = 0;
    $left     = 0;

    for ($right = 0; $right < strlen($s); $right++) {
        $ch = $s[$right];
        // If char is in window, shrink left past its last occurrence
        if (isset($lastSeen[$ch]) && $lastSeen[$ch] >= $left) {
            $left = $lastSeen[$ch] + 1;
        }
        $lastSeen[$ch] = $right;
        $maxLen = max($maxLen, $right - $left + 1);
    }

    return $maxLen;
}

echo lengthOfLongestSubstring('abcabcbb'); // 3 ("abc")
echo lengthOfLongestSubstring('pwwkew');   // 3 ("wke")` },

    { type: 'h2', text: 'String Reversal Patterns' },
    { type: 'p', html: 'Several interview problems are variations of in-place reversal: reverse words in a string, rotate a string, or reverse only a portion. PHP\'s <code>strrev</code> returns a new string (O(n) space). For in-place-style logic, work with an array of characters split with <code>str_split</code>, reverse in-place, then <code>implode</code>.' },
    { type: 'code', lang: 'php', label: 'PHP — Reverse Words in a String', code: `&lt;?php
// "  the sky  is blue  " -> "blue is sky the"
// O(n) time, O(n) space
function reverseWords(string $s): string {
    // preg_split handles multiple spaces and trims
    $words = preg_split('/\s+/', trim($s));
    return implode(' ', array_reverse($words));
}

// Check if s2 is a rotation of s1 — classic trick: search in s1+s1
function isRotation(string $s1, string $s2): bool {
    if (strlen($s1) !== strlen($s2)) return false;
    return str_contains($s1 . $s1, $s2);
}

echo reverseWords('  the sky  is blue  '); // "blue is sky the"
var_dump(isRotation('waterbottle', 'erbottlewat')); // true` },

    { type: 'h2', text: 'Common Interview Patterns at a Glance' },
    { type: 'p', html: 'Recognizing the pattern before coding is the senior differentiator. Map the problem type to the right tool:' },
    { type: 'table', headers: ['Problem Type', 'Pattern', 'Time', 'Space'], rows: [
      ['Is palindrome?', 'Two pointers (left/right)', 'O(n)', 'O(1)'],
      ['Are anagrams?', 'Frequency array', 'O(n)', 'O(1)'],
      ['Find all anagram positions', 'Fixed sliding window + freq array', 'O(n)', 'O(1)'],
      ['Longest unique substring', 'Variable sliding window + map', 'O(n)', 'O(k)'],
      ['Reverse words', 'Split → reverse → join', 'O(n)', 'O(n)'],
      ['String rotation check', 'Concatenate + contains', 'O(n)', 'O(n)'],
      ['Build large string', 'Array collect + implode', 'O(n)', 'O(n)'],
    ]},

    { type: 'qa', pairs: [
      {
        q: 'Q: Why is string concatenation in a loop O(n²) and how do you fix it in PHP?',
        a: 'PHP strings are immutable value types. Every <code>.</code> operator allocates a brand-new string and copies all bytes of both operands into it. After <em>n</em> iterations the total bytes copied are 1 + 2 + … + n = n(n+1)/2, which is O(n²). The fix is to push each part into an array (<code>$parts[] = $piece</code>) and call <code>implode(\'\', $parts)</code> at the end — a single O(n) allocation. This is equivalent to Java\'s <code>StringBuilder</code> or Python\'s <code>\'\'.join(list)</code>.',
      },
      {
        q: 'Q: How would you find all starting indices of anagrams of pattern p in string s in O(n)?',
        a: 'Use a <strong>fixed-size sliding window</strong> of length <code>len(p)</code>. Maintain two frequency arrays of 26 integers: one for <code>p</code> (static) and one for the current window. Initialize both on the first <code>len(p)</code> characters. Then slide right: increment the frequency of the incoming character, decrement the outgoing one. After each slide, compare the two arrays in O(1) (they\'re fixed-size 26). Total time O(n), space O(1). Record the window\'s start index whenever the arrays match.',
      },
      {
        q: 'Q: When would you use mb_* functions instead of str_* in PHP?',
        a: 'Use <code>mb_*</code> whenever the string can contain non-ASCII characters — user input, internationalized text, file content in UTF-8. Specifically: <code>mb_strlen</code> instead of <code>strlen</code> (byte count vs character count), <code>mb_substr</code> instead of <code>substr</code>, and <code>mb_strtolower</code>/<code>mb_strtoupper</code> for case normalization. For pure ASCII algorithm problems or binary data processing, <code>str_*</code> is faster and correct. Always set <code>mb_internal_encoding(\'UTF-8\')</code> at bootstrap.',
      },
    ]},

    { type: 'callout', style: 'info', title: 'Interview Tip: State the Pattern First', html: 'Before writing any code, say out loud: "This looks like a sliding window problem because we need a contiguous substring satisfying a constraint." Interviewers score pattern recognition heavily — it signals you have seen enough problems to generalize.' },

    { type: 'keypoints', title: 'Key Points to Remember', items: [
      'String concatenation in a loop is O(n²) — always use array collect + <code>implode</code> for building strings',
      'Palindrome: two pointers meeting in the middle — O(n) time, O(1) space',
      'Anagram detection: 26-element frequency array (not hash map) for lowercase ASCII — O(n), O(1)',
      'Find all anagram positions: fixed sliding window + two frequency arrays — O(n), O(1)',
      'Longest unique substring: variable sliding window + last-seen index map — O(n), O(k)',
      'String rotation check: <code>str_contains(s1 . s1, s2)</code> in O(n)',
      'Always use <code>mb_*</code> for user-facing text; <code>str_*</code> is fine for ASCII algorithm problems',
    ]},
  ],
};
