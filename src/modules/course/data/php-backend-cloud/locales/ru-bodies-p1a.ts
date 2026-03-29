import type { ILessonLocale } from '@/modules/course/interfaces/ILessonLocale.ts'

const ruBodiesP1a: Record<string, ILessonLocale> = {
  arrays: {
    body: `
<h2>Что такое массив (array)?</h2>
<p>Традиционный массив хранит элементы в <strong>непрерывной области памяти</strong>. Процессор мгновенно вычисляет адрес любого элемента: <code>base + (index × size)</code>. Именно поэтому доступ выполняется за O(1).</p>
<p>PHP-массивы на самом деле являются <strong>упорядоченными хеш-таблицами</strong> — они поддерживают строковые ключи, смешанные типы и сохраняют порядок вставки. Более гибкие, но «тяжелее» на каждый элемент по сравнению с сырым C-массивом. Для собеседований важно знать обе модели.</p>

<h2>Сложность по времени и памяти</h2>
<table class="ctable">
  <thead><tr><th>Операция</th><th>В среднем</th><th>В худшем случае</th><th>Примечания</th></tr></thead>
  <tbody>
    <tr><td>Доступ по индексу</td><td class="o1">O(1)</td><td class="o1">O(1)</td><td>Прямое вычисление адреса</td></tr>
    <tr><td>Поиск (несортированный)</td><td class="on">O(n)</td><td class="on">O(n)</td><td>Необходим перебор всех элементов</td></tr>
    <tr><td>Поиск (сортированный)</td><td class="olog">O(log n)</td><td class="olog">O(log n)</td><td>Бинарный поиск (Binary search)</td></tr>
    <tr><td>Вставка в конец</td><td class="o1">O(1)*</td><td class="on">O(n)</td><td>*Амортизированная; O(n) при расширении</td></tr>
    <tr><td>Вставка в начало / середину</td><td class="on">O(n)</td><td class="on">O(n)</td><td>Все элементы должны сдвинуться</td></tr>
    <tr><td>Удаление из конца</td><td class="o1">O(1)</td><td class="o1">O(1)</td><td>Просто уменьшить размер</td></tr>
    <tr><td>Удаление из начала / середины</td><td class="on">O(n)</td><td class="on">O(n)</td><td>Все элементы должны сдвинуться</td></tr>
    <tr><td>Память</td><td class="on" colspan="2">O(n)</td><td>n = количество элементов</td></tr>
  </tbody>
</table>

<h2>Операции с PHP-массивами — полный справочник</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// ── СОЗДАНИЕ ─────────────────────────────────────────────────
$arr    = [1, 2, 3, 4, 5];
$assoc  = ['name' => 'Ali', 'age' => 30];
$matrix = [[1,2,3],[4,5,6],[7,8,9]];

// ── ДОБАВЛЕНИЕ ───────────────────────────────────────────────
$arr[] = 6;                   // добавить в конец — O(1) амортизированная
array_push($arr, 7, 8);       // добавить несколько элементов
array_unshift($arr, 0);       // добавить в начало — O(n), сдвигает ВСЕ элементы!

// ── УДАЛЕНИЕ ─────────────────────────────────────────────────
array_pop($arr);              // удалить последний  — O(1)
array_shift($arr);            // удалить первый — O(n), сдвигает ВСЕ элементы!
unset($arr[2]);               // удалить по ключу — оставляет «дыру» в ключах
$arr = array_values($arr);    // переиндексировать после unset

// ── ПОИСК ────────────────────────────────────────────────────
in_array(3, $arr);            // O(n) — линейный перебор
array_search(3, $arr);        // O(n) — возвращает ключ или false
isset($arr[2]);               // O(1) — проверить существование индекса

// ── СОРТИРОВКА ───────────────────────────────────────────────
sort($arr);                   // по значению, переиндексировать       O(n log n)
rsort($arr);                  // обратная по значению                 O(n log n)
asort($arr);                  // по значению, сохранить ключи         O(n log n)
ksort($arr);                  // по ключу                             O(n log n)
usort($arr, fn($a, $b) => $a - $b); // пользовательский компаратор

// ── ФУНКЦИОНАЛЬНЫЕ ───────────────────────────────────────────
$evens   = array_filter($arr, fn($n) => $n % 2 === 0);  // O(n)
$doubled = array_map(fn($n) => $n * 2, $arr);            // O(n)
$sum     = array_reduce($arr, fn($c, $i) => $c + $i, 0); // O(n)

// ── УТИЛИТЫ ──────────────────────────────────────────────────
count($arr);                      // O(1) — хранится внутри PHP
array_unique($arr);               // O(n log n)
array_reverse($arr);              // O(n)
array_flip($arr);                 // поменять ключи и значения местами  O(n)
array_chunk($arr, 3);             // разбить на части по 3 элемента
range(1, 10);                     // [1,2,3,...,10]
</code></pre>
</div>

<div class="callout callout-warn">
<div class="callout-title">Ловушка на собеседовании</div>
<p><code>array_shift()</code> и <code>array_unshift()</code> выполняются за O(n) — они переиндексируют все числовые ключи. Для извлечения из обоих концов за O(1) используйте <code>SplDoublyLinkedList</code> или <code>SplQueue</code>.</p>
</div>

<h2>Паттерн 1 — Two Pointers (два указателя)</h2>
<p>Используются два индекса — зачастую с разных концов — чтобы решить за <strong>O(n)</strong> то, что «в лоб» требует O(n²). Работает потому, что на <em>отсортированном</em> массиве всегда известно, в какую сторону двигать каждый указатель.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Two Pointers</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Two Sum II — sorted array, return 1-indexed pair
// [2,7,11,15], target=9 → [1,2]
function twoSum(array $numbers, int $target): array
{
    $left = 0; $right = count($numbers) - 1;
    while ($left < $right) {
        $sum = $numbers[$left] + $numbers[$right];
        if ($sum === $target)     return [$left + 1, $right + 1];
        elseif ($sum < $target)   $left++;
        else                      $right--;
    }
    return [];
}
// Time: O(n)  |  Space: O(1)

// Remove Duplicates from Sorted Array — in-place
// [0,0,1,1,2,3,3] → returns 4, array=[0,1,2,3,...]
function removeDuplicates(array &$nums): int
{
    $slow = 0;
    for ($fast = 1; $fast < count($nums); $fast++) {
        if ($nums[$fast] !== $nums[$slow]) {
            $nums[++$slow] = $nums[$fast];
        }
    }
    return $slow + 1;
}
// Time: O(n)  |  Space: O(1)
</code></pre>
</div>

<h2>Паттерн 2 — Sliding Window (скользящее окно)</h2>
<p>Поддерживается непрерывный подмассив с помощью левого и правого указателей. Расширяйте окно вправо; сужайте влево при нарушении условия. O(n²) → O(n).</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Sliding Window</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Max sum subarray of fixed size k
// [2,1,5,1,3,2], k=3 → 9 (subarray [5,1,3])
function maxSumSubarray(array $nums, int $k): int
{
    $windowSum = array_sum(array_slice($nums, 0, $k));
    $maxSum    = $windowSum;
    for ($i = $k; $i < count($nums); $i++) {
        $windowSum += $nums[$i] - $nums[$i - $k];
        $maxSum     = max($maxSum, $windowSum);
    }
    return $maxSum;
}
// Time: O(n)  |  Space: O(1)

// Longest substring without repeating characters
// "abcabcbb" → 3 ("abc")
function lengthOfLongestSubstring(string $s): int
{
    $seen = []; $maxLen = 0; $left = 0;
    for ($r = 0; $r < strlen($s); $r++) {
        $c = $s[$r];
        if (isset($seen[$c]) && $seen[$c] >= $left) {
            $left = $seen[$c] + 1;
        }
        $seen[$c] = $r;
        $maxLen   = max($maxLen, $r - $left + 1);
    }
    return $maxLen;
}
// Time: O(n)  |  Space: O(1) — alphabet-bounded
</code></pre>
</div>

<h2>Паттерн 3 — Prefix Sum (префиксные суммы)</h2>
<p>Заранее вычисляются накопленные суммы. Построение — O(n) один раз, ответ на каждый запрос диапазона — O(1).</p>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Prefix Sum</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// prefix[i] = sum of nums[0..i-1]
// Sum of nums[left..right] = prefix[right+1] - prefix[left]
function buildPrefix(array $nums): array
{
    $p = [0];
    foreach ($nums as $n) $p[] = end($p) + $n;
    return $p;
}

$nums   = [1, 3, 5, 7, 9];
$prefix = buildPrefix($nums); // [0, 1, 4, 9, 16, 25]
$sum    = $prefix[4] - $prefix[1]; // 9+16 − 1 = 15  (nums[1..3] = 3+5+7)
</code></pre>
</div>

<h2>Вопросы с собеседований</h2>
<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)"><span class="qa-q-text">Q: В чём разница между array_merge() и оператором +?</span><span class="qa-arrow">▼</span></div>
  <div class="qa-a"><p><code>array_merge()</code> перенумеровывает числовые ключи с нуля и добавляет второй массив. Для строковых ключей второй массив перезаписывает первый. Оператор <code>+</code> оставляет первое значение для любого дублирующегося ключа (числового или строкового) и добавляет только отсутствующие ключи из правого операнда. Пример: <code>[0=>'a'] + [0=>'b']</code> → <code>[0=>'a']</code>, но <code>array_merge([0=>'a'], [0=>'b'])</code> → <code>[0=>'a', 1=>'b']</code>.</p></div>
</div>
<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)"><span class="qa-q-text">Q: Почему вставка в начало выполняется за O(n)?</span><span class="qa-arrow">▼</span></div>
  <div class="qa-a"><p>Каждый существующий элемент должен сдвинуться на одну позицию вправо, чтобы освободить место. В хеш-таблице PHP каждый числовой ключ должен быть переиндексирован. Это n операций записи для n элементов. Если вам часто нужна вставка в начало за O(1), используйте <code>SplDoublyLinkedList</code>, у которого есть выделенные указатели на голову и хвост.</p></div>
</div>
<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)"><span class="qa-q-text">Q: Когда sliding window НЕ работает?</span><span class="qa-arrow">▼</span></div>
  <div class="qa-a"><p>Sliding window требует, чтобы условие было <em>монотонным</em> — добавление элемента либо всегда делает окно допустимым, либо всегда нарушает условие. Паттерн перестаёт работать, когда элементы одновременно могут и помогать, и нарушать условие (например, подмассивы с положительными и отрицательными числами, где сумма может расти и убывать). В таких случаях используйте префиксные суммы с хеш-картой или динамическое программирование.</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Доступ по индексу за O(1) — главное преимущество массива, используйте его</li>
    <li>Вставка / удаление в начале — O(n), частая ловушка на собеседованиях</li>
    <li>PHP-массивы — это упорядоченные хеш-таблицы, а не непрерывная память</li>
    <li><code>array_shift()</code> выполняется за O(n). Используйте <code>SplQueue</code> для быстрого извлечения из очереди</li>
    <li>Two Pointers: отсортированный массив, поиск пар — переводит O(n²) → O(n)</li>
    <li>Sliding Window: непрерывный подмассив с условием — переводит O(n²) → O(n)</li>
    <li>Prefix Sum: построить O(n) один раз, отвечать на запросы диапазонов за O(1) каждый</li>
    <li>Всегда уточняйте: массив отсортирован? Допускаются ли дубликаты? Можно ли изменять массив на месте?</li>
  </ul>
</div>
`,
  },
  strings: {
    body: `
<h2>Почему строки (strings) в PHP — особый случай</h2>
<p>PHP-строки — это массивы байт, а не Unicode-последовательности. <code>strlen("café")</code> вернёт 5, а не 4, потому что <code>é</code> занимает два байта в UTF-8. Каждый опытный PHP-разработчик должен знать, когда нужно использовать <code>mb_strlen</code>, <code>mb_substr</code> и <code>mb_strtolower</code> вместо их однобайтных аналогов. Для алгоритмических задач, где входные данные гарантированно ASCII, стандартные функции быстрее и достаточны.</p>

<div class="callout callout-warn">
  <div class="callout-title">mb_* против str_* — знайте, когда переключаться</div>
  <p>Используйте <code>mb_*</code> везде, где задействован текст, отображаемый пользователю (имена, адреса, поисковые запросы). Используйте <code>str_*</code> для ASCII-задач или бинарных данных. Смешивание этих функций молча портит данные при non-ASCII вводе.</p>
</div>

<h2>Построение строк: ловушка O(n²)</h2>
<p>PHP-строки — неизменяемые значения. Каждая конкатенация через <code>.</code> создаёт новую строку и копирует все уже накопленные байты. В цикле из <em>n</em> итераций это O(1 + 2 + … + n) = <strong>O(n²)</strong> по времени и памяти. Решение: собирать части в массив и вызвать <code>implode</code> один раз в конце — аналог <code>StringBuilder</code> в Java.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — String Building</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// ✗ ПЛОХО — O(n²): каждый . копирует всю растущую строку
function buildBad(array $words): string {
    $result = '';
    foreach ($words as $w) {
        $result .= $w . ', '; // новая аллокация на каждой итерации
    }
    return rtrim($result, ', ');
}

// ✓ ХОРОШО — O(n): собрать, потом объединить за один раз
function buildGood(array $words): string {
    return implode(', ', $words); // одна аллокация
}

// ✓ ХОРОШО — ручной аналог StringBuilder при сложной логике
function buildComplex(array $tokens): string {
    $parts = [];
    foreach ($tokens as $t) {
        if ($t !== '') {
            $parts[] = strtoupper($t[0]) . substr($t, 1);
        }
    }
    return implode(' ', $parts); // O(n) суммарно
}
</code></pre>
</div>

<h2>Проверка палиндрома (palindrome) — Two Pointers</h2>
<p>Строка является палиндромом, если читается одинаково в обоих направлениях. Наивный подход разворачивает строку (O(n) дополнительной памяти). Оптимальный использует два указателя, сходящихся к центру, требуя O(1) дополнительной памяти. Вариант «valid palindrome» (LeetCode 125) пропускает неалфавитно-цифровые символы — используйте вспомогательную функцию или <code>ctype_alnum</code>.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Palindrome (Two Pointers)</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
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
var_dump(isValidPalindrome('A man, a plan, a canal: Panama')); // true
</code></pre>
</div>

<h2>Определение анаграмм (anagram) — частотная карта (Frequency Map)</h2>
<p>Две строки являются анаграммами, если содержат ровно одинаковые символы с одинаковыми частотами. Подход с сортировкой даёт O(n log n). Оптимальный подход использует частотный массив из 26 целых чисел для строчного ASCII — O(n) по времени, O(1) по памяти (фиксированный массив из 26 элементов, не зависит от размера входа).</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Anagram Detection</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
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

var_dump(findAnagrams('cbaebabacd', 'abc')); // [0, 6]
</code></pre>
</div>

<div class="callout callout-tip">
  <div class="callout-title">Частотный массив против хеш-карты</div>
  <p>Для строчного ASCII массив из 26 целых чисел всегда выигрывает у хеш-карты: нет накладных расходов на хеширование, дружелюбен к кешу процессора и сравнение гарантированно выполняется за O(1). Переходите на хеш-карту только когда набор символов Unicode или неограничен.</p>
</div>

<h2>Самая длинная подстрока без повторяющихся символов — Sliding Window</h2>
<p>Это каноническая задача скользящего окна переменного размера. Поддерживайте окно <code>[left, right]</code> и хеш-карту с последним встреченным индексом каждого символа. При обнаружении дубликата внутри окна сжимайте его, перемещая <code>left</code> за последнюю позицию дубликата.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Longest Unique Substring</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
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
echo lengthOfLongestSubstring('pwwkew');   // 3 ("wke")
</code></pre>
</div>

<h2>Паттерны разворота строки</h2>
<p>Многие задачи на собеседованиях — вариации разворота на месте: развернуть слова в строке, повернуть строку или развернуть только её часть. PHP-функция <code>strrev</code> возвращает новую строку (O(n) памяти). Для логики «на месте» работайте с массивом символов через <code>str_split</code>, разворачивайте в нём, затем <code>implode</code>.</p>

<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Reverse Words in a String</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
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
var_dump(isRotation('waterbottle', 'erbottlewat')); // true
</code></pre>
</div>

<h2>Распространённые паттерны для собеседований — краткий обзор</h2>
<p>Распознать паттерн до написания кода — это то, что отличает опытного специалиста. Сопоставьте тип задачи с нужным инструментом:</p>

<table class="content-table">
  <thead><tr><th>Тип задачи</th><th>Паттерн</th><th>Время</th><th>Память</th></tr></thead>
  <tbody>
    <tr><td>Является ли палиндромом?</td><td>Two pointers (left/right)</td><td>O(n)</td><td>O(1)</td></tr>
    <tr><td>Являются ли анаграммами?</td><td>Frequency array</td><td>O(n)</td><td>O(1)</td></tr>
    <tr><td>Найти все позиции анаграмм</td><td>Фиксированное sliding window + freq array</td><td>O(n)</td><td>O(1)</td></tr>
    <tr><td>Длиннейшая уникальная подстрока</td><td>Переменное sliding window + map</td><td>O(n)</td><td>O(k)</td></tr>
    <tr><td>Развернуть слова</td><td>Split → reverse → join</td><td>O(n)</td><td>O(n)</td></tr>
    <tr><td>Проверка ротации строки</td><td>Concatenate + contains</td><td>O(n)</td><td>O(n)</td></tr>
    <tr><td>Построить большую строку</td><td>Array collect + implode</td><td>O(n)</td><td>O(n)</td></tr>
  </tbody>
</table>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Почему конкатенация строк в цикле даёт O(n²) и как это исправить в PHP?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <p>PHP-строки — неизменяемые типы-значения. Каждый оператор <code>.</code> выделяет совершенно новую строку и копирует в неё все байты обоих операндов. После <em>n</em> итераций общее число скопированных байт равно 1 + 2 + … + n = n(n+1)/2, что составляет O(n²). Решение: добавлять каждую часть в массив (<code>$parts[] = $piece</code>) и вызвать <code>implode('', $parts)</code> в конце — одна аллокация O(n). Это аналог <code>StringBuilder</code> в Java или <code>''.join(list)</code> в Python.</p>
  </div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Как найти все начальные индексы анаграмм шаблона p в строке s за O(n)?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <p>Используйте <strong>скользящее окно фиксированного размера</strong> длиной <code>len(p)</code>. Поддерживайте два частотных массива из 26 целых: один для <code>p</code> (статический) и один для текущего окна. Инициализируйте оба на первых <code>len(p)</code> символах. Затем сдвигайте вправо: увеличивайте частоту входящего символа, уменьшайте выходящего. После каждого сдвига сравнивайте два массива за O(1) (они фиксированного размера 26). Суммарное время O(n), память O(1). Записывайте начальный индекс окна каждый раз, когда массивы совпадают.</p>
  </div>
</div>

<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)">
    <span class="qa-q-text">Q: Когда использовать mb_* функции вместо str_* в PHP?</span>
    <span class="qa-arrow">▼</span>
  </div>
  <div class="qa-a">
    <p>Используйте <code>mb_*</code> всякий раз, когда строка может содержать не-ASCII символы — пользовательский ввод, интернационализированный текст, содержимое файлов в UTF-8. Конкретно: <code>mb_strlen</code> вместо <code>strlen</code> (количество байт vs количество символов), <code>mb_substr</code> вместо <code>substr</code>, и <code>mb_strtolower</code>/<code>mb_strtoupper</code> для нормализации регистра. Для чисто ASCII алгоритмических задач или обработки бинарных данных <code>str_*</code> быстрее и корректен. Всегда задавайте <code>mb_internal_encoding('UTF-8')</code> при инициализации приложения.</p>
  </div>
</div>

<div class="callout callout-info">
  <div class="callout-title">Совет для собеседования: сначала назовите паттерн</div>
  <p>Прежде чем писать код, скажите вслух: «Это похоже на задачу sliding window, потому что нам нужна непрерывная подстрока, удовлетворяющая условию». Интервьюеры высоко оценивают распознавание паттернов — это говорит о том, что вы видели достаточно задач, чтобы обобщать.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Конкатенация строк в цикле — O(n²). Всегда собирайте в массив и используйте <code>implode</code></li>
    <li>Palindrome: два указателя, сходящихся к центру — O(n) по времени, O(1) по памяти</li>
    <li>Определение анаграмм: частотный массив из 26 элементов (не хеш-карта) для строчного ASCII — O(n), O(1)</li>
    <li>Поиск всех позиций анаграмм: фиксированное sliding window + два частотных массива — O(n), O(1)</li>
    <li>Длиннейшая уникальная подстрока: переменное sliding window + карта последнего вхождения — O(n), O(k)</li>
    <li>Проверка ротации строки: <code>str_contains(s1 . s1, s2)</code> за O(n)</li>
    <li>Всегда используйте <code>mb_*</code> для текста, отображаемого пользователю; <code>str_*</code> допустимы для ASCII алгоритмических задач</li>
  </ul>
</div>
`,
  },
  hashmaps: {
    body: `
<h2>Как работают hash map-ы</h2>
<p>Hash map пропускает ключ через <strong>хеш-функцию</strong>, получая индекс корзины (bucket), и сохраняет пару ключ-значение в этой корзине. При поиске ключ снова хешируется — и происходит прямой переход к нужной корзине за O(1).</p>
<p><strong>Разрешение коллизий:</strong> Два ключа могут попасть в одну корзину. PHP использует <strong>chaining</strong> — каждая корзина хранит связный список пар. Python dict использует <strong>open addressing</strong> — при коллизии ищется следующий свободный слот. В худшем случае (все ключи в одной корзине) поиск занимает O(n) — всегда говорите «O(1) <em>в среднем</em>» на собеседованиях.</p>

<h2>Паттерны PHP hash map</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Core Patterns</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// ── ПОДСЧЁТ ЧАСТОТ ───────────────────────────────────────────
$freq = [];
$str  = "aababc";
for ($i = 0; $i < strlen($str); $i++) {
    $freq[$str[$i]] = ($freq[$str[$i]] ?? 0) + 1;
}
// ['a'=>3, 'b'=>2, 'c'=>1]

// Встроенная функция для массивов:
$freq = array_count_values(['a','b','a','c','b','a']);

// ── TWO SUM ──────────────────────────────────────────────────
// [2,7,11,15], target=9 → [0,1]
// КЛЮЧЕВАЯ ИДЕЯ: для каждого числа проверяем, есть ли его дополнение уже в карте
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

// ── ГРУППИРОВКА ──────────────────────────────────────────────
// Сгруппировать анаграммы: ["eat","tea","tan","ate","nat","bat"]
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

// ── ОБНАРУЖЕНИЕ ДУБЛИКАТОВ ───────────────────────────────────
function containsDuplicate(array $nums): bool
{
    $seen = [];
    foreach ($nums as $n) {
        if (isset($seen[$n])) return true;
        $seen[$n] = true;
    }
    return false;
}
</code></pre>
</div>

<h2>Hash Set — проверка принадлежности за O(1)</h2>
<p>Эмулируйте hash set с помощью <code>['value' => true]</code>. Всегда используйте <code>isset($set[$val])</code> — никогда <code>in_array()</code>, которая работает за O(n).</p>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Hash Set</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
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
// Time: O(n) — each number touched at most twice
</code></pre>
</div>

<div class="callout callout-danger">
<div class="callout-title">Критично: isset() против in_array()</div>
<p><code>isset($arr[$key])</code> выполняется за O(1) — использует хеш. <code>in_array($val, $arr)</code> выполняется за O(n) — перебирает каждый элемент. Многие разработчики проваливают собеседования, используя <code>in_array</code> внутри цикла, превращая O(n)-решение в O(n²). Храните значения как ключи и используйте <code>isset</code>.</p>
</div>

<h2>Вопросы с собеседований</h2>
<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)"><span class="qa-q-text">Q: Почему поиск в hash map — O(1) в среднем, но O(n) в худшем случае?</span><span class="qa-arrow">▼</span></div>
  <div class="qa-a"><p>В среднем хеш-функция равномерно распределяет ключи по корзинам, поэтому каждая корзина содержит ~1 элемент и поиск стоит O(1). В худшем случае все ключи попадают в одну корзину. Тогда поиск обходит связный список из n элементов — O(n). Современные среды выполнения защищаются от этого случайными хеш-сидами при запуске процесса. PHP делает это — специально подобранные «враждебные» входные данные не деградируют производительность после перезапуска.</p></div>
</div>
<div class="qa-block">
  <div class="qa-q" onclick="toggleQA(this)"><span class="qa-q-text">Q: Когда предпочесть отсортированный массив вместо hash map?</span><span class="qa-arrow">▼</span></div>
  <div class="qa-a"><p>Когда нужна итерация в порядке сортировки, запросы по диапазону, поиск предшественника/преемника или k-го наименьшего элемента. Hash map даёт O(1) поиск по точному ключу, но не имеет понятия о порядке. Отсортированная структура даёт O(log n) поиск, но позволяет сканировать диапазоны, обходить элементы в порядке сортировки и отвечать на вопрос «какое следующее значение больше X?». Hash map-ы также требуют больше памяти на запись (ключ + значение + метаданные против просто значения).</p></div>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Hash map = O(1) в среднем для поиска, вставки, удаления — используйте когда нужно «запомнить»</li>
    <li><code>isset($arr[$key])</code> — O(1). <code>in_array($val, $arr)</code> — O(n). Всегда используйте isset для проверки принадлежности</li>
    <li>Паттерн Two Sum: для каждого элемента проверьте, есть ли его дополнение уже в карте</li>
    <li>Частотная карта: основа задач на анаграммы, элемент большинства, первый неповторяющийся элемент</li>
    <li>Hash set (значение как ключ, true как значение): дедупликация, последовательные цепочки</li>
    <li>PHP использует chaining; хеш-сиды случайны для каждого процесса, что защищает от атак</li>
    <li>Всегда говорите «O(1) в среднем» — в худшем случае O(n)</li>
  </ul>
</div>
`,
  },
  linkedlists: {
    body: `
<h2>Реализация узла (Node)</h2>
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

<h2>Быстрый и медленный указатели (Fast & Slow Pointers)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Fast/Slow Patterns</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Обнаружение цикла - O(1) памяти
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

// Поиск середины - когда fast доходит до конца, slow находится в середине
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

<h2>Разворот и слияние (Reversal & Merge)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Reversal & Merge</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Разворот всего списка - 1->2->3->4->5 становится 5->4->3->2->1
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

// Слияние двух отсортированных списков с помощью трюка dummy node
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
  <div class="callout-title">Трюк с фиктивным узлом (Dummy Node)</div>
  <p>Создайте <code>$dummy = new ListNode(0)</code> в начале любой задачи на построение списка. Работайте с <code>$dummy->next</code> как с настоящей головой. Возвращайте <code>$dummy->next</code> в конце. Это устраняет особый случай обновления головного узла.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>O(1) вставка/удаление при наличии указателя. O(n) доступ по индексу.</li>
    <li>Быстрый/медленный указатель: обнаружение цикла за O(1) памяти, поиск середины, k-го с конца</li>
    <li>Разворот: три указателя (prev, curr, next) — сначала нарисуйте на бумаге</li>
    <li>Dummy node: устраняет граничные случаи с головой в задачах на построение списков</li>
    <li>PHP SplDoublyLinkedList: O(1) push/pop с обоих концов</li>
  </ul>
</div>
`,
  },
  'stacks-queues': {
    body: `
<h2>Stack — LIFO (Last In, First Out — последним пришёл, первым ушёл)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Stack Problems</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// PHP-массив как stack — конец массива = «вершина»
$stack = [];
$stack[] = 1;           // push  O(1)
$stack[] = 2;
$top = array_pop($stack); // pop   O(1)
$top = end($stack);        // peek  O(1) без удаления

// Корректные скобки: "()[]{}" => true  "(]" => false
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

// Монотонный stack — Daily Temperatures (температуры по дням)
// [73,74,75,71,69,72,76,73] -> [1,1,4,2,1,1,0,0]
function dailyTemperatures(array $temps): array
{
    $result = array_fill(0, count($temps), 0);
    $stack  = []; // хранит индексы, температуры в убывающем порядке
    foreach ($temps as $i => $temp) {
        while (!empty($stack) && $temps[end($stack)] < $temp) {
            $prevIdx          = array_pop($stack);
            $result[$prevIdx] = $i - $prevIdx;
        }
        $stack[] = $i;
    }
    return $result;
}
// Time: O(n) — каждый индекс добавляется и удаляется не более одного раза
</code></pre>
</div>

<h2>Queue — FIFO (First In, First Out — первым пришёл, первым ушёл)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Queue with SplQueue</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// ВНИМАНИЕ: array_shift() выполняется за O(n) — используйте SplQueue для O(1) dequeue
$queue = new SplQueue();
$queue->enqueue('task1'); // O(1)
$queue->enqueue('task2');
$front = $queue->dequeue(); // O(1) - удаляет с начала
$front = $queue->bottom();  // O(1) - peek без удаления

// BFS использует Queue — обрабатывает узлы уровень за уровнем
// Реализацию levelOrder() смотрите в уроке по деревьям

// Максимум скользящего окна с помощью deque
// [1,3,-1,-3,5,3,6,7], k=3 -> [3,3,5,5,6,7]
function maxSlidingWindow(array $nums, int $k): array
{
    $deque  = new SplDoublyLinkedList(); // хранит индексы
    $result = [];
    for ($i = 0; $i < count($nums); $i++) {
        // Удаляем индексы вне окна с начала
        while (!$deque->isEmpty() && $deque->bottom() < $i - $k + 1) {
            $deque->shift();
        }
        // Удаляем меньшие элементы с конца — они никогда не станут максимумом
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
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Stack: LIFO. Push/pop с одного конца. O(1) для обоих. Используйте PHP-массив (конец = вершина).</li>
    <li>Queue: FIFO. Используйте SplQueue — array_shift() выполняется за O(n)!</li>
    <li>Монотонный stack: убывающий/возрастающий порядок для задач «следующий больший/меньший элемент»</li>
    <li>Deque: максимум/минимум скользящего окна за O(n) — хранит только полезных кандидатов</li>
    <li>BFS всегда использует queue. DFS всегда использует stack (или рекурсию).</li>
  </ul>
</div>
`,
  },
  trees: {
    body: `
<h2>Терминология деревьев (Trees)</h2>
<ul>
  <li><strong>Root (корень):</strong> Верхний узел, не имеет родителя</li>
  <li><strong>Leaf (лист):</strong> Узел без дочерних элементов</li>
  <li><strong>Height (высота):</strong> Длиннейший путь от узла до листа</li>
  <li><strong>Balanced (сбалансированное):</strong> |height(left) - height(right)| &lt;= 1 для каждого узла</li>
  <li><strong>Complete (полное):</strong> Все уровни заполнены, кроме, возможно, последнего (заполняется слева направо)</li>
</ul>

<h2>Все виды обходов (Traversals)</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Tree Traversals</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
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

// Pre-order: Root → Left → Right  [1,2,4,5,3]  Применение: копирование/сериализация дерева
function preorder(?TreeNode $root): array
{
    if ($root === null) return [];
    return array_merge([$root->val], preorder($root->left), preorder($root->right));
}

// In-order: Left → Root → Right   [4,2,5,1,3]  Применение: отсортированный порядок в BST!
function inorder(?TreeNode $root): array
{
    if ($root === null) return [];
    return array_merge(inorder($root->left), [$root->val], inorder($root->right));
}

// Post-order: Left → Right → Root  [4,5,2,3,1]  Применение: удаление дерева, размеры директорий
function postorder(?TreeNode $root): array
{
    if ($root === null) return [];
    return array_merge(postorder($root->left), postorder($root->right), [$root->val]);
}

// BFS Level-order: уровень за уровнем  [[1],[2,3],[4,5]]
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

// Итеративный in-order (избегает переполнения стека вызовов на больших деревьях)
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
}
</code></pre>
</div>

<h2>Классические задачи на деревья</h2>
<div class="code-block">
<div class="code-header"><span class="code-lang">PHP — Classic Tree Problems</span><button class="code-copy" onclick="copyCode(this)">Copy</button></div>
<pre><code class="language-php">&lt;?php
// Максимальная глубина
function maxDepth(?TreeNode $root): int
{
    if ($root === null) return 0;
    return 1 + max(maxDepth($root->left), maxDepth($root->right));
}

// Сбалансировано ли дерево? Возвращает высоту или -1 если несбалансировано
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

// Диаметр = длиннейший путь между любыми двумя узлами (может не проходить через корень)
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

// Наименьший общий предок в бинарном дереве (не BST)
function lowestCommonAncestor(?TreeNode $root, TreeNode $p, TreeNode $q): ?TreeNode
{
    if ($root === null || $root === $p || $root === $q) return $root;
    $left  = lowestCommonAncestor($root->left, $p, $q);
    $right = lowestCommonAncestor($root->right, $p, $q);
    if ($left !== null && $right !== null) return $root; // p и q в разных поддеревьях
    return $left ?? $right;
}
</code></pre>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>In-order обход BST даёт отсортированный порядок — критически важное свойство</li>
    <li>DFS использует рекурсию (или явный stack). BFS использует queue.</li>
    <li>Базовый случай для рекурсии по дереву: null-узел возвращает 0/null/[]</li>
    <li>Высота/глубина: возвращайте значения ВВЕРХ по рекурсии (мышление в стиле post-order)</li>
    <li>Задачи на пути (диаметр): используйте глобальную переменную, обновляемую внутри рекурсии</li>
    <li>Сбалансированное дерево: высота O(log n). Вырожденное дерево: высота O(n).</li>
  </ul>
</div>
`,
  },
  bst: {
    body: `
<h2>Инвариант BST</h2>
<p>Для каждого узла N: <strong>все значения в левом поддереве &lt; N.val &lt; все значения в правом поддереве</strong>. Это глобальное правило — не только между родителем и дочерним узлом.</p>

<div class="callout callout-warn">
  <div class="callout-title">Распространённая ошибка</div>
  <p>Проверка только родителя и дочернего узла пропускает нарушения на границах поддеревьев. Всегда валидируйте с распространёнными минимальными/максимальными границами.</p>
</div>

<h2>Узел и операции</h2>
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
        // Два дочерних узла: заменить in-order преемником (минимум правого поддерева)
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

<h2>Валидация BST (LeetCode 98)</h2>
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

<h2>In-order обход → отсортированный вывод</h2>
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

<h2>In-order преемник (In-order Successor)</h2>
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

<h2>Сложность</h2>
<table class="ctable">
  <thead><tr><th>Операция</th><th>В среднем (сбалансированное)</th><th>В худшем случае (отсортированный ввод)</th></tr></thead>
  <tbody>
    <tr><td>Поиск / Вставка / Удаление</td><td class="olog">O(log n)</td><td class="on">O(n)</td></tr>
    <tr><td>In-order обход</td><td class="on">O(n)</td><td class="on">O(n)</td></tr>
  </tbody>
</table>

<div class="callout callout-info">
  <div class="callout-title">Самобалансирующиеся деревья</div>
  <p><strong>AVL trees</strong>: высота ≤ 1.44 log n, строгая балансировка — предпочтительны при преобладании операций чтения. <strong>Red-Black trees</strong>: допускают небольшой дисбаланс, быстрее перебалансировка — используются в Java TreeMap, C++ std::map, планировщике ядра Linux. В PHP нет встроенного сбалансированного BST; на практике используйте отсортированные массивы + бинарный поиск.</p>
</div>

<div class="keypoints">
  <div class="keypoints-title">Ключевые моменты для запоминания</div>
  <ul>
    <li>Инвариант BST — глобальный: валидируйте с min/max границами, распространяемыми через рекурсию</li>
    <li>Удаление с двумя дочерними узлами: заменить in-order преемником (минимум правого поддерева), затем удалить преемника</li>
    <li>In-order обход всегда даёт отсортированный вывод — используется для проверки корректности BST</li>
    <li>Несбалансированный BST деградирует до O(n) на отсортированном/обратно-отсортированном вводе</li>
    <li>Настоящие отсортированные словари используют Red-Black или AVL — гарантированно O(log n) вне зависимости от порядка ввода</li>
  </ul>
</div>
`,
  },
}

export default ruBodiesP1a
