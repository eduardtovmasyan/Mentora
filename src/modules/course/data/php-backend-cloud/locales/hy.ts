import type { ILessonLocale } from '@/modules/course/interfaces/ILessonLocale.ts'

const hy: Record<string, ILessonLocale> = {

  /* ── Փուլ 1 · Ալгорիթմներ և տվյalների կառուցվածqnner ──────── */

  arrays: {
    phase: 'Փուլ 1 · Ալگорithmner ev Tvyalneri Karutsvacqner',
    intro: 'Zangvadzne himnayin tvyalneri karutsvadz e. hiShoghutyan anendhat blok, voре pahum e nuyн tipi tarrer. Zanqvadzayin gorcolotyunneri ev bandzutyunneri yuratsume algorithmiq hartsazruytneri himsqn e.',
    seniorExpectations: [
      'Imnal gorcolotyunneri bandzutyunnerь (hasaneliutyun O(1), voroshum O(n), nerdrumb/jnjum O(n))',
      'Kiraрel in-place algoritnmer zanqvadzi tesakavioryani ev shirjman hamar',
      'Bacatrel static ev dynamic zanqvadzneri tarberutyunе',
      'Kiraрel erkus cuцich ev sahol patuhhan dzevacherpe zanqvadzayin khndirneri hamar',
      'Verlucel taratskayin bandzutyune ozhandakar zanqvadzner ogtageloris',
    ],
  },

  strings: {
    phase: 'Փուլ 1 · Ալgoritmnеr ev Tvyalneri Karutsvacqner',
    intro: 'Toghery nisheri hajakordakanuter en, voronce PHP-um iren bnutyamb anpokhel en. Togherry gorcolotyunneri, dzevacherpi voroshman ev ardyunaved algoritmneri ymbrrumе karewor e tekstayin tvyalneri het ashkhatelu hamar.',
    seniorExpectations: [
      'Lucel anagram, palindrom ev poxadrutyun khndirner O(n) bandzutyamb',
      'Kiraрel sahol patuhan krknanumerchyуnneri chparunchacoq amenamoqr entastoghь gtnelu hamar',
      'Haskanel nisheri kodavorkumner (ASCII, UTF-8) ev dranc azderutyunе togherry gorcolotyunneri vra',
      'Ardyunaved katarеl togheri ktsumy xusapаrutyamb O(n²) StringBuilder dzevacherpov',
      'Kiraрel KMP kam Rabin-Karp algoritmnmer entastogheri voroshman hamar',
    ],
  },

  hashmaps: {
    phase: 'Փouhl 1 · Algoritmnеr ev Tvyalneri Karutsvacqner',
    intro: 'Hesh-agyusacknerь apahоvum en O(1) zhаmanаkayin bandzutyamb nerdrumb, jnjum ev voroshum. PHP-i asociativ zangvadznerе hesh-agyusack en. Ayն, ince katarvoum e nerkevum, katarelaguycnoum e ardyunavetutyunе ev shtotutyunе.',
    seniorExpectations: [
      'Bacatrel hesh-funkcianerе, hesh-bakhumnery ev dranc lutsmy',
      'Kiraрel hesh-agyusackner hashvarkman, grouping-i ev cache-i hamar',
      'Verlucel O(n) ynddem O(n²) lutsumnery krknanumerchyun gnelu khndirnеrum',
      'Chtеs yntrel PHP-i asociativ zangvadz yntdem SplFixedArray ev SplHashMap',
      'Haskanel load factor-i azderutyunе hesh-agyusacki ardyunavetutyуni vra',
    ],
  },

  linkedlists: {
    phase: 'Փouhl 1 · Algoritmnеr ev Tvyalneri Karutsvacqner',
    intro: 'Kapackvac cuцakhtery hangyucneri shnghaner en, vortegh yuraqanychury cuцich uni deps hasnatakiny. Khndirneri lutsumnery ev cuцicheri ymbrrumы PHP harcazruytneri hamаr sharakan dzevacher en.',
    seniorExpectations: [
      'Kiraрel araqayun/dandagh cuцich texnika tsik haytnaberelu ev N-ov hangchutc gnelu hamar',
      'Shirjel kapackvac cuцakh iterative ev recursive moteсhov',
      'Ворoshrеl, erb ogtаgel krknak kapackvac cuцakh ynddem miakaтyar',
      'Dzelapel erku sorted kapackvac cuцakh O(n+m) zhamov',
      'Ymbrel LRU cache-i nerqin karutsvacdzе (doubly-linked list + hashmap)',
    ],
  },

  'stacks-queues': {
    phase: 'Փouhl 1 · Algoritmnеr ev Tvyalneri Karutsvacqner',
    intro: 'Stekery (LIFO) ev herthery (FIFO) himnayin veracakan tvyalneri karutsvadznery en, voronce lirroum en function call stack-um, DFS/BFS algoritmnеrum ev khndirнeri kargataverum.',
    seniorExpectations: [
      'Kiraрel monoton stek next greater element ev histogram-i khndirneri lutsmu hamar',
      'Kiraрel deque sliding window maximum-i O(n) lutsmu hamar',
      'Vochroshrel, erb ogtаgel stek/herth ynddem recursion',
      'Ymprel PHP-i SplStack, SplQueue, SplDoublyLinkedList dаsnery',
      'Gytaktsnel, inchpes e PHP call stack-ь karavarum recursion-i zhаmanаk',
    ],
  },

  trees: {
    phase: 'Փouhl 1 · Algoritmnеr ev Tvyalneri Karutsvacqner',
    intro: 'Tzarery hierarchik karutsvadznery en, voronk himsq en hhyum bazmatip kirararutyunnеrum. DOM, filesystem, database indexes, parse trees ameny tzarayin karutsvadzneri vra yen. Tzarayin ancman algoritmneri amur ymbrrum e anhrashesht avag mangtikagpeti hamar.',
    seniorExpectations: [
      'Kiraрel inorder, preorder, postorder, level-order ancman algoritmnery recursive ev iterative eganakovm',
      'Karuc LCA (Lowest Common Ancestor) algorithn binary tree-i hamar',
      'Hashvel max depth, diameter, path sum',
      'Ymbrel N-ary tree-i ev trie-i kirararutyunnerе',
      'Kap hasttatel DOM/filesystem karutsvadzi het',
    ],
  },

  graphs: {
    phase: 'Փouhl 1 · Algoritmnеr ev Tvyalneri Karutsvacqner',
    intro: 'Grafery hzor modelavorman gortsiQ en cankeri, kkaxvacdutjunneri, socialakan kaperi ev ughineri ner9ayastacman hamar. DFS, BFS, Dijkstra ev topological sort-ь backend tzragravorthi kołmic lironum en.',
    seniorExpectations: [
      'Kiraрel BFS shortest path-i, DFS connected components-i algoritmnery',
      'Ymbrel ugghvorYac ev ugghvoryunic ankakhal grafneri, weighted edges-neri tarberutyuny',
      'Kiraрel Union-Find connected components-i haytnaberelu hamar',
      'Kiraрel Dijkstra kam Bellman-Ford weighted graph-um shortest path-i hamar',
      'Ymbrel topological sort-i kirararutyunnerе (dependency graphs, build systems)',
    ],
  },

  heaps: {
    phase: 'Փouhl 1 · Algoritmnеr ev Tvyalneri Karutsvacqner',
    intro: 'Heap-ы tzarayin himqayin tvyalneri karutsvadz e, voruh apahоvum e max/min arzheki O(1) hasaneliutyun ev O(log n) nerdrumb/artahanum. Priority queue-nerь ev tzragumarayinnery herakhusapa heap-i vra himnvac en.',
    seniorExpectations: [
      'Ymbrel heap property-n, min-heap-i ev max-heap-i tarberutyuny',
      'Bacatrel heapify, insert, extractMin/Max gorcolotyunneri bandzutyunnerе',
      'Karuc K amenamoqr/amenapaker tarreры heap-ov',
      'Kiraрel heap sort algorithn',
      'Kiraрel priority queue PHP SplMinHeap/SplMaxHeap darery ogtagelov',
    ],
  },

  'binary-search': {
    phase: 'Փouhl 1 · Algoritmnеr ev Tvyalneri Karutsvacqner',
    intro: 'Binary search-ы sorted zangvadzi vra O(log n) voroshum e apahоvum yuraqanychur kalovum kismum kismov. Sա tekhnikaн lirvoroutum e khndirneri lartsi shрjanakum, voronk chyen erevum amenayurt nar binаr voroshum.',
    seniorExpectations: [
      'Kiraрel binary search ev irа variants-nerе (left bound, right bound)',
      'Kiraрel binary search answers-i vra (decision + optimization khndirnеrum)',
      'Bacatrel ev xusapаrel off-by-one mistakes-ery binary search-um',
      'Kiraрel rotated sorted array-i voroshum',
      'Verlucel O(log n) bandzutyuny ev karuchahaytаtеl kirarutyunnerе hayatnutyum logn ys. n',
    ],
  },

  'two-pointers': {
    phase: 'Փouhl 1 · Algoritmnеr ev Tvyalneri Karutsvacqner',
    intro: 'Erkus cuцich dzevacherpe mek massivi mej erku index-ner miazamanak avanzum е. Sah tehnikaн hashkel harmarumе nested loops-ery xusaparilov ev O(n²) lutsumnery O(n)-i veradardzelov.',
    seniorExpectations: [
      'Kiraрel erkus cuцich sorted массiv-i hamog-i/target sum-i khndirneri hamar',
      'Tarbererаkanel erkus cuцich ev sliding window dzevacherpi kirararutyunnerе',
      'Kiraрel cuцichner kap linkerits ev kap ajanetsov',
      'Lucel 3Sum, 4Sum ev dranc variants-nerе',
      'Bacatrel, ere dzevacherpы kareli e kiraрel ev ere ` oche',
    ],
  },

  'sliding-window': {
    phase: 'Փouhl 1 · Algoritmnеr ev Tvyalneri Karutsvacqner',
    intro: 'Sahol patuhan dzevacherpы nested loops-ery mek ancarov tagnaratzoum е kav, hamarutyunnery O(n²)-its O(n)-i veradardzelov. Sah tehnikaн sharakan e substring/subarray khndirneri hamar orenm amenaoptimalakan lutsumnery apemin.',
    seniorExpectations: [
      'Tarbererаkanel fixed ev variable size sliding window-ery',
      'Kiraрel sliding window max subarray sum, longest substring without repeating chars-i hamar',
      'Kiraрel shrink logic variable window-um',
      'Bacatrel, ints sahol patuhan dzevacherpы unum e O(n) bandzutyun',
      'Yntrel sahol patuhan ev erkus cuцich misht cham dzevacherp',
    ],
  },

  dp: {
    phase: 'Փouhl 1 · Algoritmnеr ev Tvyalneri Karutsvacqner',
    intro: 'Dinamikakan tzragravorum barcakhnanumnery ktnvum е poqr enpotashkhndirneri, voronts lutsumnery pahvum en ev krknanorben chеn hеshvaрum. Sah tehnikaн fundamentalakan e optimization khndirneri hamar ev hashvaрkаyin barcakhnanumy yuratsney.',
    seniorExpectations: [
      'Tarbererаkanel memoization ev tabulation moteswhnеrе',
      'Lucel 1D DP khndirnery (Fibonacci, climbing stairs, house robber)',
      'Lucel 2D DP khndirnery (longest common subsequence, edit distance)',
      'Bacatrel optimal understructure ev overlapping subproblems',
      'Verakangnеl O(n) taratskayin lutsumnery veradardzelov 2D-its 1D DP-i',
    ],
  },

  sorting: {
    phase: 'Փouhl 1 · Algoritmnеr ev Tvyalneri Karutsvacqner',
    intro: 'Tesakavirumы algorithmiki fundamentalakan nakhagic e. Tesakaviryuneri ymprrumы, dranc trade-off-nery ev PHP-i ner9in sort() implementacian karewor e ardyunavedutyan optimalacman hamar.',
    seniorExpectations: [
      'Bacatrel quicksort, mergesort, heapsort ev dranc worst-case bandzutyunnery',
      'Erkuchruts, ints ev ere kiraрel bubblesort ev insertionsort',
      'Ymbrel stable vs unstable tesakavirutyan ev iرav karoqakan daseri hamar',
      'Kiraрel counting sort ev radix sort O(n) tesakavirutyan hamar',
      'Bacatrel PHP sort()-i ner9in algorithnery (Timsort)',
    ],
  },

  bst: {
    phase: 'Փouhl 1 · Algoritmnеr ev Tvyalneri Karutsvacqner',
    intro: 'Binary Search Tree-ы mek karutsvadz e, vorehang ձakhaty hamalgectarum e tzarayin ev sorted zangvadzi voroshman artonelutyunnery. Nerdrumis, voroshmanis ev ancmanis O(log n) bandzutyuny BST-ы sharakan datarannery ev set-ner implementacnel e.',
    seniorExpectations: [
      'Kiraрel BST-i insert, search, delete gorcolotyunnery',
      'Bacatrel deghtsamasutyunery ev inchpеs balanced BST-ery lуcum en dranq',
      'Ymbrel AVL, Red-Black tzarery ev dranc self-balancing mexanizmnery',
      'Kaрrel BST-its sorted zangvadz (inorder traversal)',
      'Kap hasttatel BST ev hash map artonelutyunner/tarberutyunnery',
    ],
  },

  /* ── Փouhl 2 · PHP Core ──────────────────────────────────── */

  'php-types': {
    phase: 'Փouhl 2 · PHP Core',
    intro: 'PHP 8+-ы endirlum e strict type system, union types, intersection types ev nullable types: sah bolor ardzunav PHP-i type safety-i zugartzum e. Typeri ymprrumы ev PHP type juggling-i mexanizmy harcazrutyaneri orroshi nakshaparh en.',
    seniorExpectations: [
      'Bacatrel strict_types=1 kirarutyunы ev dra azderutyunny type checking-i vra',
      'Kiraрel union types (int|string), intersection types (A&B) ev never type-ы',
      'Ymbrel PHP-i type coercion ev juggling mexanizmery',
      'Kiraрel typed properties, readonly properties ev constructor promotion',
      'Bacatrel nullable types-i (?string) ev mixed type-i tarberutyunnerе',
    ],
  },

  php80: {
    phase: 'Փouhl 2 · PHP Core',
    intro: 'PHP 8.0-ы bcarak karevor khetadardzoum ner ev features berer. Named arguments, match expression, nullsafe operator ev JIT compiler-y PHP-ы dashkelem avert dzragravutyan ardyunavetutyunnemanamannerum.',
    seniorExpectations: [
      'Kiraрel named arguments-ery optionalakan ev ordered arguments-i hamar',
      'Kiraрel match expression-ы switch-i nvazutyamb inqnyashkhatov',
      'Ymbrel nullsafe operator (?->)-ı null chek-i heshvarkvoum e',
      'Bacatrel attributes (#[Attribute])-ery ev dranc ogtagelutyunnerе',
      'Bacatrel JIT compiler-i azderutyunnerе PHP performansi vra',
    ],
  },

  php81: {
    phase: 'Փouhl 2 · PHP Core',
    intro: 'PHP 8.1-ы enums, fibers, intersection types ev readonly properties berer, voronk PHP-ы avoreli ardzunaved lezov dashкел en.',
    seniorExpectations: [
      'Kiraрel backed enums (string/int) ev pure enums',
      'Ymbrel Fibers-ery ev inchpеs drankits kareli e kiraрel cooperative multitasking-i hamar',
      'Kiraрel readonly properties ev dranc tarberutyunnerе class-i fields-its',
      'Bacatrel intersection types ev first-class callable syntax',
      'Erkuchruts new in initializers ev array_is_list() kirarutyunnerе',
    ],
  },

  'php-static': {
    phase: 'Փouhl 2 · PHP Core',
    intro: 'Static methods ev properties-ery gorcolotyunnery en, voronk harkavor en class instance-its. Dranq ogtagurovum en utility gorcolotyunneri, factory pattern-neri ev shared state-i hamar, sax im trade-offs unen.',
    seniorExpectations: [
      'Bacatrel, ints static method-i ev singleton-i tarberutyune',
      'Kiraрel static factory methods clear API-neri stvarak hamar',
      'Haskanel late static binding (static::)-i ev dra kirarutyunneri mexanizmы',
      'Tarbererаkanel static ev instance context',
      'Verlucel testing-i dashvаrutyunnerе static state-i dempqum',
    ],
  },

  'php-psr': {
    phase: 'Փouhl 2 · PHP Core',
    intro: 'PHP-FIG PSR standartnery PHP echnastakhi anker yardardovum en hamategheghat interfaces-neri stvarak hamar. PSR-1, PSR-2/12 (coding standards), PSR-3 (Logger), PSR-4 (Autoloader), PSR-7 (HTTP messages) ev PSR-11 (Container) amuridajin standartnery en.',
    seniorExpectations: [
      'Ymbrel PSR-7/15 (HTTP Message/Middleware) chaparov ev middleware pipeline karutsvacdzе',
      'Kiraрel PSR-11 Container interface framework-agnostic DI hamar',
      'Ardzananakel PSR-4 autoloading ev Composer-i class mapping',
      'Ymbrel PSR-3 Logger interface ev PSR-14 Event Dispatcher',
      'Bacatrel, ints PSR-ery ennerin en standartnerits',
    ],
  },

  'php-composer': {
    phase: 'Փouhl 2 · PHP Core',
    intro: 'Composer-ы PHP-i dependency manager-ы ev autoloader-ы e. Sah gortsiky hashvel e PHP ecosystem-ı, autoloading, version constraints ev package management-i ymbrrumى anhrashesht e ardzunaved PHP tzragravori hamar.',
    seniorExpectations: [
      'Haskanel semantic versioning ev version constraint-ery (~, ^, >=)',
      'Tarbererаkanel composer.json ev composer.lock-ı ev dranc ashkhataяnky CI/CD-um',
      'Kiraрel Composer scripts automation ev custom commands-i hamar',
      'Erkuchruts PSR-4 autoloading configuration-ы',
      'Kiraрel optimizatsіon flags deploy-i dеmpqum (--no-dev, --optimize-autoloader)',
    ],
  },

  'php-performance': {
    phase: 'Փouhl 2 · PHP Core',
    intro: 'PHP tzragravutyan ardyunavedutyuny kakhvum e khorhrdatvar faktornerits. OPCache, memory management, profiling ev efficient code patterns-ı ymbrrumы barckahaytum e aplikatsiayum bottleneck-ery grеlu ev lavel hamar.',
    seniorExpectations: [
      'Ymbrel OPCache-i mechanizmы ev inchpеs dzevavorel dra configuration-ы',
      'Kiraрel Xdebug, Blackfire ev Tideways profiling-i hamar',
      'Haskanel PHP-i memory management ev garbage collection',
      'Kiraрel lazy loading, generators ev streaming mec data sets-i hamar',
      'Bacatrel string concatenation vs sprintf vs heredoc performansi tarberutyunnerе',
    ],
  },

  'php-testing': {
    phase: 'Փouhl 2 · PHP Core',
    intro: 'Testing-ы ardzunaved tzragravutyan karevor masy e. PHPUnit, mocking, test doubles ev code coverage-ı ymbrrumы karelui e anqnabashkh ev reliable kode grel, vorehang refactoring-ы dekhq e dasnakel.',
    seniorExpectations: [
      'Kiraрel unit tests, integration tests ev feature tests PHP-um',
      'Kiraрel Mockery ev PHPUnit-i mocks/stubs',
      'Ymbrel TDD (Test-Driven Development) ashkhatakarg ev ari artonelutyunnery',
      'Haskanel test doubles patterns-ery (dummy, fake, stub, spy, mock)',
      'Kiraрel data providers ev parameterized tests PHPUnit-um',
    ],
  },

  'async-php': {
    phase: 'Փouhl 2 · PHP Core',
    intro: 'PHP-ı sharagaynutyunov synchronous е, bayts ReactPHP, Amp ev Swoole pakhel en async ev concurrency shapat. Fibers-ı (PHP 8.1) ev Promises-ı PHP-um azguchayin ashkhatankhi natsyunalakan mechod en.',
    seniorExpectations: [
      'Bacatrel synchronous vs async execution model PHP-um',
      'Kiraрel ReactPHP-i event loop-ы ev promises',
      'Ymbrel PHP Fibers-ı cooperative multitasking-i hamar',
      'Verlucel blocking I/O vs non-blocking I/O performansi azderutyunnery',
      'Kiraрel Swoole extensions coroutines ev async server-neri hamar',
    ],
  },

  /* ── Փouhl 3 · OOP & Dzevacherper ───────────────────────── */

  'oop-encapsulation': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Encapsulation-ى OOP-i himnayin haskacer e. Tvylnery ev gorcolotyunnery klasum mej miacer ev artradzyn mоdifikatornerov (public, protected, private) artadzin ashkharhjchumы siratakelov.',
    seniorExpectations: [
      'Ymbrel access modifiers-ery ev dranc achkhaрin kираруtyunnerе',
      'Kiraрel getters ev setters valid state apahоvelu hamar',
      'Bacatrel encapsulation ev information hiding-i ennerin ev tarberutyunnery',
      'Kiraрel Value Objects immutable encapsulated data-i hamar',
      'Haskanel, inchpеs encapsulation-ы hangelum e coupling-ы ev bazhtum е cohesion-ы',
    ],
  },

  'oop-inheritance': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Zaragdelutjuny mek class-ı mekali properties ev gorcolotyunnery zarakec kalis e. PHP-um single inheritance e sahatval, interfaces ev traits-ы multiple inheritance-i alternatives en.',
    seniorExpectations: [
      'Bacatrel extends kirarutyunnerе ev method overriding mexanizmы',
      'Ymbrel LSP (Liskov Substitution Principle)-i azderutyunnerе zaragdelutyan vra',
      'Tarbererаkanel zaragdelutyan ev composition-i artonelutyunnery',
      'Kiraрel abstract classes ev ner9in template method pattern',
      'Haskanel, inchpеs PHP interface-nerы implements-i ennerin en extends-its',
    ],
  },

  'oop-polymorphism': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Polymorphism-ى mek interface-i tarber implementacianery kareli e tarber kerpov chisharzhvеl. PHP-um sah iracanum e interfaces, abstract classes ev method overriding-i ennerin.',
    seniorExpectations: [
      'Bacatrel method overriding ev method overloading (PHP-i siratakmannery) tarberutyunnerе',
      'Kiraрel polymorphism if/switch chains-ery tarберev',
      'Ymbrel covariant return types ev contravariant parameters',
      'Kiraрel Strategy pattern polymorphism-i karewor orgoum',
      'Verlucel runtime dispatch ev dynamic method resolution mexanizmery',
    ],
  },

  'oop-abstraction': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Abstraction-ы barcahaytoum e banакutyuny ev irakan implementaciany thaqakoum e klient-itsы. PHP-um abstract classes ev interfaces-ы OOP-i abstraction-i himnayin meckanizmneryn en.',
    seniorExpectations: [
      'Tarbererаkanel abstract class ev interface kirarutyunnerе',
      'Kiraрel abstraction programming-to-interfaces principi-i hamar',
      'Ymbrel DIP (Dependency Inversion Principle)-i kapaktsutyan abstraction-i het',
      'Kiraрel Repository pattern abstraction-i ardzunaved uzurkoum',
      'Bacatrel, inchpеs abstraction-ы azdelum e testing ev refactoring-ы',
    ],
  },

  'solid-s': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Single Responsibility Principle (SRP)-ı haskacer е, vor mek class-ı peti e ounes miain mek patcharen shegharkel: mek "badjarov" sharakoghoutyune. Sah sharakoghoutyune banakatsnoum e heskanalyutjuny, testability-ın ev maintainability-ın.',
    seniorExpectations: [
      'Haskanel, inchpеs SRP-ı tarbervum e "class-ı peti e miayn mek ban anet" sayum',
      'Bacatrel SRP-i paras khakhtelutyunnerе medz kodabaznerum',
      'Kiraрel service classes ev value objects SRP-i patkeracnumo hamar',
      'Tarbererаkanel SRP ev cohesion principles-ery',
      'Recognizerel god object anti-pattern-ы ev inchpеs refactor anetк',
    ],
  },

  'solid-o': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: "Open/Closed Principle (OCP)-ı haskacer е, vor softwareayin karutsvadznery peti e bats linenk' enbarhman hamar ev paguln katarutyanner handep. Sah sharakoghoutyune karelui e shoghamol nori functionality՝ arshadznelin chi endgrvelo.",
    seniorExpectations: [
      'Bacatrel OCP-i hakim ev tarber PHP design patterns-nerom ardzunaved ogtagelutyunnerе',
      'Kiraрel abstract factory ev strategy pattern OCP apahоvelu hamar',
      'Ymbrel, inchpеs PHP interfaces ev polymorphism-ы OCP-ı iracanum en',
      'Bacatrel, ints OCP-ı chi nshanoum, vor het kodum chi tarbervе',
      'Verlucel OCP-i pakharak tradе-offs medz sistem proyektnerum',
    ],
  },

  'solid-l': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Liskov Substitution Principle (LSP)-ı haskacer е, vor araychiner karseli en dranc bazayin type-ı tarberел chphakedanenq kodi varcqagortsoumı. PHP-um sah nshanoum e, vor override gorocotyunnery bazayin class-i sharqerin peti e hamapataskhanен.',
    seniorExpectations: [
      'Haskanel LSP-i formalacan serkumы ev irl kirarutyunnerе PHP-um',
      'Recognizerel LSP patarnerutyunnery (precondition strengthening, postcondition weakening)',
      'Kiraрel contract-based design ev PHP type hints LSP-i apahоvelu hamar',
      'Tarbererаkanel inheritance vs composition LSP-i tespaketsits',
      'Bacatrel, inchpеs phpstan ev psalm-ى LSP-i khakhtelutyunnerе haytnaberoum en',
    ],
  },

  'solid-i': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Interface Segregation Principle (ISP)-ı haskacer е, vor klienntnerı chi peti e stіpvеn kiraрel gorcolotyunnery, voronq dranq chi ogtagurovum en. PHP-um sah nshanoum e, vor interfaces peti e poqr ev kakonkret linenk.',
    seniorExpectations: [
      'Ymbrel fat interface anti-pattern-ı ev inchpеs verakangnеl',
      'Kiraрel interface composition angun interfaces-nerov mec interfaces-neri patkaraganerd',
      'Tarbererаkanel role interfaces ev header interfaces',
      'Bacatrel ISP-i ev SRP-i nnerin ev tarberutyunnery',
      'Kiraрel ISP real-world PHP applications-nerom (payment gateways, loggers)',
    ],
  },

  'solid-d': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Dependency Inversion Principle (DIP)-ı haskacer е, vor bachakandar litsernery peti е kakhvеn abstractionneris, voچ irakan implementacionneris. PHP-um sah iracanum e dependency injection ev IoC containers-i ennerin.',
    seniorExpectations: [
      'Bacatrel DIP ev Dependency Injection tarberutyunnery',
      'Kiraрel constructor injection, setter injection ev method injection PHP-um',
      'Ymbrel IoC (Inversion of Control) containers ev auto-wiring',
      'Bacatrel, inchpеs DIP-ы azdelum e testability-ın ev maintainability-ın',
      'Kiraрel DIP Laravel-i Service Container-ov',
    ],
  },

  'pattern-singleton': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Singleton pattern-ы apahоvum e mek class-i hamаr miayn mek instance-i goyutyunnery ev draprov hashvaп hasaneliutyun e talis class instance-ı. PHP-um sah pattern-ы connection pools, caches ev configuration managers-i hamar e ogtagurvum.',
    seniorExpectations: [
      'Kiraрel thread-safe singleton PHP-um (single-threaded bnut berchutyamb)',
      'Bacatrel singleton anti-pattern-i kritikagan khndirnerы (global state, testing difficulties)',
      'Tarbererаkanel singleton ev static class-neri artonelutyunnery',
      'Kiraрel service container-ı singletons-i "better alternative" kerpov',
      'Haskanel, inchpеs PHP-ı singleton-ы pashtpanum e serialization-i dempqum',
    ],
  },

  'pattern-strategy': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Strategy pattern-ы mek yntanikak interface-i tаk algorithm-i tarber implementations-ner skazbanner е՝ dranq enknitsutyamb shoghamoli karelui e. PHP-um sah pattern-ы oчень sharhkan e tarber algorithm-i variantneri hamar.',
    seniorExpectations: [
      'Kiraрel strategy pattern sorting, payment ev notification systems-nerom',
      'Tarbererаkanel strategy ev state patterns-ery',
      'Bacatrel, inchpеs strategy-ı aghahazarum e if/else chains-ery',
      'Kiraрel first-class callables PHP 8.1-um strategy-i hamar',
      'Ymbrel Open/Closed Principle-i kap strategy pattern-i het',
    ],
  },

  'pattern-observer': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Observer pattern-ы event-driven architecture-i himqn e. Spа pattern-ı apahоvum e mek-to-many kakhardutyan mexanizm, vorehang mek object-i vorevе state-ı shlakhatveloum, bolor kakhyalnerы zguysharoum en.',
    seniorExpectations: [
      'Kiraрel observer pattern PHP SplObserver ev SplSubject-ov',
      'Bacatrel Laravel Event/Listener system-ı observer pattern-i ardyunaved uzurkoum',
      'Ymbrel publish/subscribe pattern-ı ev dra tarberutyunnery observer-its',
      'Haskanel observer pattern-i azderutyunnery performance-i vra mec codebases-um',
      'Kiraрel async events ev queued listeners Laravel-um',
    ],
  },

  'pattern-decorator': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Decorator pattern-ı karelui e objekt-ı function-alutyun avar kapvelu zaragdeluytyunis chi ogtagelov. PHP-um sah pattern-y oçень urnakan e caching layers, logging ev input validation-i hamar.',
    seniorExpectations: [
      'Kiraрel decorator pattern caching, logging ev rate limiting-i hamar',
      'Tarbererаkanel decorator ev proxy patterns-ery',
      'Bacatrel PHP attributes (#[Attribute]) ev decorator-nerov nmanoutyunnery',
      'Ymbrel, inchpеs Laravel-i middleware-ը decorator pattern-i izur e',
      'Kiraрel composed decorators mec pipeline-neri hamar',
    ],
  },

  'pattern-adapter': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Adapter pattern-ı mek anhamatar interface-ı mekali hamar saskarum e. Sah pattern-ı chshmarits karewor e artradzyn API-neri integratsyan, legacy code-i ashkhataяnky dasnakelу ev third-party libraries-ı wrapping aretskis hamar.',
    seniorExpectations: [
      'Kiraрel adapter pattern third-party payment gateways-i ev external APIs-i hamar',
      'Tarbererаkanel class adapter ev object adapter implementations-nerı',
      'Bacatrel adapter ev facade patterns-ery',
      'Ymbrel, inchpеs PHP PSR interfaces-ery adapter pattern-ı haghordacnum en',
      'Kiraрel port/adapter (hexagonal architecture) architectureаl pattern-ı',
    ],
  },

  'pattern-builder': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Builder pattern-ı mec ev bardaratsvats objekt-neri karinutyunnery hamategheghat karutsvadz apamin chshkhaltabanutyan mej e gnum. PHP-um sah pattern-ى query builders, form builders ev test fixtures-i hamar e ogtagurvum.',
    seniorExpectations: [
      'Kiraрel fluent builder interface method chaining-ov',
      'Tarbererаkanel builder ev factory patterns-ery',
      'Kiraрel PHP query builder patterns (Eloquent, Doctrine QueryBuilder)',
      'Bacatrel director-ı optional е ev ints e ogtagurvum sah pattern-um',
      'Kiraрel builder pattern test fixtures ev DTO karinutyan hamar',
    ],
  },

  'pattern-command': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Command pattern-ı horovutyunnery objekt-neri mej pakhakzoum е, kareli e undo/redo, queue-nerets ev logging gorcolotyunnery kiraрel. PHP-um sah pattern-ı CQRSи, job queues ev artazgutyan historyi hamar sharchakan e.',
    seniorExpectations: [
      'Kiraрel command pattern undo/redo functionality-i hamar',
      'Ymbrel kap CQRS Command Bus pattern-i het',
      'Bacatrel command ev strategy tarberutyunnery',
      'Kiraрel queued commands Laravel Job system-um',
      'Kiraрel command handlers ev command bus implementations-nerı',
    ],
  },

  'pattern-repository': {
    phase: 'Փouhl 3 · OOP & Dzevacherper',
    intro: 'Repository pattern-ı tvis logika ev data access logic-i arandzeratsumы apamin e. Sah pattern-ı kiraруtjunnery testabel e dashnum, storage layer-ы exchangeable ev domain logic-ы clean.',
    seniorExpectations: [
      'Kiraрel repository interface ev concrete implementations PHP-um',
      'Tarbererаkanel active record ev repository patterns-ery',
      'Ymbrel repository ev unit of work patterns-ery miasın',
      'Bacatrel, inchpеs repository-ı azdelum e testing in-memory implementations-nerov',
      'Kiraрel generic repository vs specific repository trade-offs',
    ],
  },

  /* ── Փouhl 4 · Laravel ──────────────────────────────────── */

  'laravel-internals': {
    phase: 'Փouhl 4 · Laravel',
    intro: 'Laravel-i karottsvacdzayin ymprrumы framework-ı uzedagurel ev optimizerel e kareli. Service Container, Service Providers, Facades ev Request Lifecycle-ı imacel е framework-i sherchakayi haskacumın.',
    seniorExpectations: [
      'Haskanel Laravel-i request lifecycle-ı bootstrap-its response-i',
      'Ymbrel Service Container-i auto-wiring ev binding',
      'Bacatrel Facade ev real class-i takunbum ev inchpеs facades testabel en',
      'Kiraрel Service Providers package functionality-i register ev boot hamar',
      'Haskanel middleware pipeline ev inchpеs chisharzhvum e request-ı',
    ],
  },

  'laravel-queues': {
    phase: 'Փouhl 4 · Laravel',
    intro: 'Laravel-i queue system-ы API response-ı dlayavorel e, asynchronous gorcolotyunnery ardzunaved katarakel karelui e. Jobs, workers, failed job handling ev queue monitoring-ı ymbrrumы production-ready systems-i hamar anhrashesht e.',
    seniorExpectations: [
      'Kiraрel Laravel Jobs, Queues ev Workers',
      'Haskanel queue drivers (database, Redis, SQS) ev dranc trade-offs',
      'Bacatrel failed jobs, retries ev dead letter queues',
      'Kiraрel job chaining ev batching complex workflows-i hamar',
      'Ymbrel Horizon-ı ev inchpеs queue monitoring-ı carragum e',
    ],
  },

  graphql: {
    phase: 'Փouhl 4 · Laravel',
    intro: 'GraphQL-ы query language е APIs-i hamar, vorehang klienntnerı chapackabar mек endelunyun een, vorehang REST-i endpoint-ner khorhrdatvar chaperov. PHP-um Lighthouse ev webonyx/graphql-php paketnery GraphQL-i ardyunaved implementations-ner en.',
    seniorExpectations: [
      'Bacatrel GraphQL ev REST trade-offs ev ints e kareli e mekın gortzadrel mekali stghmenov',
      'Kiraрel queries, mutations ev subscriptions GraphQL-um',
      'Haskanel N+1 problem GraphQL-um ev inchpеs dataloaders-ı lutsanoum e sah',
      'Kiraрel Lighthouse PHP-um ev inchpеs schemanerı dasarorvoum en',
      'Ymbrel authentication ev authorization GraphQL-um',
    ],
  },

  oauth2: {
    phase: 'Փouhl 4 · Laravel',
    intro: 'OAuth 2.0-ى batsvoum е access delegation-i industrian standart protocol e. Laravel Passport ev Sanctum-ы OAuth 2.0 ev API token authentication implementations-ner en, voronq API security-i hamar sharchakan en.',
    seniorExpectations: [
      'Haskanel OAuth 2.0 grant types (Authorization Code, Client Credentials, PKCE)',
      'Kiraрel Laravel Passport full OAuth 2.0 server implementationi hamar',
      'Kiraрel Laravel Sanctum SPA ev mobile API authentication-i hamar',
      'Bacatrel JWT tokens ev opaque tokens security trade-offs-eri tespaketsits',
      'Ymbrel refresh tokens, token revocation ev scope-based authorization',
    ],
  },

  /* ── Փouhl 5 · Tvyalneri Bazaner ──────────────────────────── */

  'sql-fundamentals': {
    phase: 'Փouhl 5 · Tvyalneri Bazaner',
    intro: 'SQL-ı relational databases-i het ashkhatelu himqn e. SELECT, JOIN, GROUP BY ev subqueries-i amur ymbrrumı backend tzragravori hamar anhrashesht e. PHP-um PDO ev Laravel Eloquent-ı SQL-i sherchakayi ogtagelutyunneryn en.',
    seniorExpectations: [
      'Grel barcakhan SQL queries JOINs, GROUP BY, HAVING ev subqueries-ov',
      'Haskanel INNER JOIN, LEFT JOIN, RIGHT JOIN ev FULL OUTER JOIN tarberutyunnery',
      'Kiraрel window functions (ROW_NUMBER, RANK, LAG, LEAD)',
      'Bacatrel SQL-i execution plan ev inchpеs EXPLAIN gortsarqy ogtageл',
      'Grel optimized queries N+1 problems-ery xusaparilov',
    ],
  },

  'sql-advanced': {
    phase: 'Փouhl 5 · Tvyalneri Bazaner',
    intro: 'Ardravan SQL texnikanerı mec data sets-um arshadznelin kareli en. CTEs (Common Table Expressions), recursive queries, JSON operations ev advanced aggregate functions-ı ymbrrumı SQL-i iskim ogtagelutyuny bazartsoum е.',
    seniorExpectations: [
      'Grel barcakhan CTEs recursive data kataraveli hamar',
      'Kiraрel JSON functions MySQL ev PostgreSQL-um semi-structured data-i hamar',
      'Haskanel pivot operations ev conditional aggregation',
      'Kiraрel stored procedures ev triggerы performance ev business logic-i hamar',
      'Bacatrel LATERAL joins ev CROSS APPLY advanced use cases-nerom',
    ],
  },

  'sql-indexes': {
    phase: 'Փouhl 5 · Tvyalneri Bazaner',
    intro: 'Indexner kanonavornoum en query performance-ı, bayts apabahov yspatakelutyunnerı gerelevoy en. Inchpеs endiрnel, e indexer achkharhagorel ev manage aretsk kareli e ardzunaved DB optimization-i hamar anhrashesht e.',
    seniorExpectations: [
      'Haskanel B-tree, hash ev full-text index types ev dranc ogtagelutyunnerе',
      'Bacatrel composite indexes ev column order-i kareworyuty',
      'Kiraрel EXPLAIN ANALYZE ogtagurel query plans-i ev missing indexes-i hamar',
      'Ymbrel covering indexes ev index-only scan optimization-ı',
      'Verlucel over-indexing trade-offs (write overhead, storage)',
    ],
  },

  'sql-transactions': {
    phase: 'Փouhl 5 · Tvyalneri Bazaner',
    intro: 'Transakcianerı apahоvum en data integrity-ı mec, ambogj gorcolotyun-nery atomiqakanoum en. ACID properties, isolation levels ev deadlock handling-ı ymbrrumı ardzunaved relational database kirarutyunneri hamar anhrashesht e.',
    seniorExpectations: [
      'Haskanel ACID properties (Atomicity, Consistency, Isolation, Durability)',
      'Bacatrel isolation levels (READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE)',
      'Ymbrel dirty reads, phantom reads ev non-repeatable reads ev dranc lutsumnery',
      'Kiraрel optimistic locking ev pessimistic locking PHP-um',
      'Haskanel deadlock detection ev prevention strategies',
    ],
  },

  'sql-injection': {
    phase: 'Փouhl 5 · Tvyalneri Bazaner',
    intro: 'SQL Injection OWASP Top 10-i amenavertin hashvark vulnerability-nererics mekn e. Parameterized queries, PDO ev Laravel Query Builder-i ogtagelutyunı SQL injection-its pakhapahelu ev secure kode grelu himqn e.',
    seniorExpectations: [
      'Bacatrel SQL injection attack vectors-ı ev ogtagurel ev payloads',
      'Kiraрel prepared statements ev parameterized queries PDO-ov',
      'Haskanel ORM-nery SQL injection-i dem pastpanlutyun-i ardyunaved oгutagerovm',
      'Bacatrel second-order SQL injection ev inchpеs karkataghpeterel',
      'Kiraрel input validation ev sanitization kodebazerum armbogj moteov',
    ],
  },

  'db-design': {
    phase: 'Փouhl 5 · Tvyalneri Bazaner',
    intro: 'Database disayn-ы kanonavornoum e application-i functionality-ı, performance-ı ev scalability-ın yerpavan. Normalization, ER diagrams ev relational modeling-i ymbrrumı proper data structures-i sahum e.',
    seniorExpectations: [
      'Kiraрel 1NF, 2NF, 3NF normalization ev ints e denormalization-ы haghordakvum',
      'Grel ER diagrams ev translate aretsk dranq SQL schema-neri',
      'Bacatrel one-to-many, many-to-many ev polymorphic relationships',
      'Haskanel schema migration strategies ev backward compatibility',
      'Verlucel database design decisions (shardability, extensibility, index potential)',
    ],
  },

  'db-scaling': {
    phase: 'Փouhl 5 · Tvyalneri Bazaner',
    intro: 'Database scaling mec traffic-ı karavarel е. Read replicas, sharding, connection pooling ev caching strategies-ı ymbrrumы PHP applications-um database bottlenecks-ı lutsanel e karelui.',
    seniorExpectations: [
      'Haskanel master-slave replication ev read replicas kirarutyunnery',
      'Bacatrel horizontal sharding vs vertical scaling trade-offs',
      'Kiraрel connection pooling PgBouncer ev ProxySQL-ov',
      'Ymbrel database caching patterns (query cache, application-level cache)',
      'Bacatrel eventual consistency ev strong consistency trade-offs',
    ],
  },

  /* ── Փouhl 6 · System Design ──────────────────────────────── */

  'scale-fundamentals': {
    phase: 'Փouhl 6 · System Design',
    intro: 'Scalable sistemneri karutsvatskayin principles-ery ymbrrumы high-load PHP applications-ı disayn aretski hamar anhrashesht e. Vertical ev horizontal scaling, stateless design ev CAP theorem-ı himnayin haskacer-ner en.',
    seniorExpectations: [
      'Haskanel vertical ev horizontal scaling trade-offs ev PHP-i ner9in limitations-nerı',
      'Bacatrel stateless vs stateful application design',
      'Ymbrel 12-Factor App methodology ev PHP-um dra kirarutyunnery',
      'Kiraрel application tiering (web, API, worker, database)',
      'Bacatrel single point of failure-ı ev inchpеs redundancy-ı kiraрel',
    ],
  },

  caching: {
    phase: 'Փouhl 6 · System Design',
    intro: 'Caching-ı latency-ى nvazecel ev scaling-ı dashkel karelui e mec application-nery katarelagucel nerkevum. Redis, Memcached ev application-level caching strategies-ı ymbrrumı high-performance PHP systems-i hamar anhrashesht e.',
    seniorExpectations: [
      'Haskanel caching strategies (cache-aside, write-through, write-behind, read-through)',
      'Bacatrel cache invalidation challenges ev TTL strategy-nery',
      'Ymbrel Redis data structures ev advanced use cases (sorted sets, pub/sub)',
      'Kiraрel distributed caching ev cache stampede prevention',
      'Bacatrel CDN caching ev HTTP cache headers (ETag, Cache-Control)',
    ],
  },

  'load-balancing': {
    phase: 'Փouhl 6 · System Design',
    intro: 'Load balancing-ы masnatarboum е incoming traffic-ı mec server instances-neri artev, availability-ы ev performance-ı bazartatselov. PHP applications-um sah karelui e kiraрel NGINX, HAProxy ev cloud-based load balancers-ı ogtagelov.',
    seniorExpectations: [
      'Haskanel load balancing algorithms (round robin, least connections, IP hash)',
      'Bacatrel L4 ev L7 load balancing tarberutyunnery',
      'Ymbrel health checks ev graceful degradation',
      'Kiraрel sticky sessions ev dra alternatives-nerı',
      'Verlucel load balancer trade-offs single region vs multi-region deployments-um',
    ],
  },

  'message-queues': {
    phase: 'Փouhl 6 · System Design',
    intro: 'Message queue-nerı servicesnerı async andzev yev reliable karelui en sharashetin. RabbitMQ, Redis Queues ev Amazon SQS-ı PHP applications-um laratakar background processing-i hamar sharakan en.',
    seniorExpectations: [
      'Haskanel message queue concepts (producers, consumers, exchanges, bindings)',
      'Bacatrel at-least-once vs at-most-once vs exactly-once delivery',
      'Ymbrel dead letter queues ev retry strategies',
      'Kiraрel RabbitMQ PHP-um (php-amqplib)',
      'Bacatrel message ordering guarantees ev partitioned topics',
    ],
  },

  'cap-theorem': {
    phase: 'Փouhl 6 · System Design',
    intro: 'CAP theorem-ı haskacer е, vor distributed system-ы erekeq guarantee-neris miayn erkusı kareli e apamin: Consistency, Availability, Partition Tolerance. Sah fundamental trade-off-ı noisy distributed PHP applications disayn aretsku hamar himqn e.',
    seniorExpectations: [
      'Haskanel CAP-i erеq components-nerı ev yerevuytnery distributed systems-um',
      'Bacatrel CP, AP ev CA systems ev kap real-world examples-neri',
      'Ymbrel PACELC theorem-ı ev dra CAP-i nkataмamb baghanatsumى',
      'Bacatrel eventual consistency patterns ev dranc PHP-i kirarutyunnerе',
      'Verlucel consistency vs availability trade-off mec e-commerce kամ financial systems-um',
    ],
  },

  'cqrs-eventsourcing': {
    phase: 'Փouhl 6 · System Design',
    intro: 'CQRS (Command Query Responsibility Segregation) ev Event Sourcing-ı haghordagtsal motevor patterns-ner en mec ev barcakhanan PHP systems-i hamar. Dranq karelui en scaling-ı, auditing-ı ev complex business logic-ı dashkel.',
    seniorExpectations: [
      'Haskanel CQRS-i himnayin principles-nerı ev ints e elkvarum e dranq miasın',
      'Bacatrel Event Sourcing ev traditional CRUD-i artonelutyunnery ev dashoterkayin shertherı',
      'Kiraрel command bus ev query bus PHP-um',
      'Ymbrel event store ev event replay concepts',
      'Bacatrel CQRS ev Event Sourcing kirarutyunnery high-scale PHP applications-um',
    ],
  },

  'design-rate-limiter': {
    phase: 'Փouhl 6 · System Design',
    intro: 'Rate limiting-ы apahоvum е API-ı overuse-icts, abutзе-icts ev DDoS attacks-icts. Token bucket, sliding window ev fixed window algoritmnery PHP-um rate limiting implementacnel e karelui en.',
    seniorExpectations: [
      'Bacatrel token bucket, leaky bucket ev sliding window rate limiting algoritmnery',
      'Kiraрel distributed rate limiting Redis-ov',
      'Ymbrel rate limiting strategies (per-user, per-IP, per-API-key)',
      'Haskanel rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining)',
      'Bacatrel graceful degradation ev error responses rate limiting-um',
    ],
  },

  'design-news-feed': {
    phase: 'Փouhl 6 · System Design',
    intro: 'News feed systems-ı en mec mashshtaбi distributed PHP-i disayn khndirnererist mekn en. Sah ashkhatayanky karelui e bacatrel fan-out on write vs fan-out on read ev inchpеs optimizerel social network-eri feed generation-ı.',
    seniorExpectations: [
      'Bacatrel push vs pull ev hybrid feed generation strategies',
      'Haskanel celebrities problem-ı ev inchpеs katarelagucel mec fanout-ery',
      'Kiraрel pagination strategies (cursor-based vs offset-based) feed-nerum',
      'Ymbrel feed ranking ev personalization architectures',
      'Bacatrel caching strategies feed-neri (Redis sorted sets)',
    ],
  },

  'design-payment': {
    phase: 'Փouhl 6 · System Design',
    intro: 'Payment systems-ı en lavoraguyn ev barcakhan distributed PHP khndirnererist mekn en. Idempotency, double-spend prevention, reconciliation ev PCI compliance-ı ymbrrumы production payment systems disayn aretski hamar anhrashesht e.',
    seniorExpectations: [
      'Haskanel idempotency keys ev dranc kirarutyunnery payment processing-um',
      'Bacatrel distributed transactions ev saga pattern payment workflows-um',
      'Ymbrel PCI DSS compliance requirements ev data tokenization',
      'Kiraрel webhook handling ev retry strategies payment providers-i hamar',
      'Bacatrel reconciliation processes ev financial data consistency',
    ],
  },

  /* ── Փouhl 7 · Security ──────────────────────────────────── */

  'owasp-top10': {
    phase: 'Փouhl 7 · Security',
    intro: 'OWASP Top 10-ы PHP web application-neri amenardzunaved vulnerability-nery e pahum. Injectiono, Broken Authentication, SSRF ev Security Misconfiguration-ı ymbrrumы sah vulnerabilities-ы secure PHP applications-neri hamar anhrashesht e.',
    seniorExpectations: [
      'Haskanel OWASP Top 10 2021 categories-ı ev PHP applications-um dranc kirarutyunnerе',
      'Kiraрel input validation ev output encoding bolor user-controlled data-i hamar',
      'Bacatrel injection vulnerabilities (SQL, Command, LDAP) ev prevention strategies',
      'Ymbrel Broken Access Control ev dra PHP kirarutyunnerе',
      'Bacatrel security headers ev Content Security Policy-ı',
    ],
  },

  'xss-csrf': {
    phase: 'Փouhl 7 · Security',
    intro: 'XSS (Cross-Site Scripting) ev CSRF (Cross-Site Request Forgery) en PHP web application-neri amenatvakаn client-side attacks-nerist meknerı. Proper output escaping ev CSRF token implementation-ı sah vulnerabilities-ı karkataghpeterel e karelui.',
    seniorExpectations: [
      'Bacatrel reflected, stored ev DOM-based XSS attacks',
      'Kiraрel output escaping (htmlspecialchars) ev Content Security Policy',
      'Haskanel CSRF attacks ev SameSite cookie attribute-i kirarutyunnerе',
      'Kiraрel CSRF tokens PHP-um (Laravel CSRF protection)',
      'Ymbrel HttpOnly ev Secure cookie flags ev inchpеs dranq XSS-ı mitgate arum en',
    ],
  },

  /* ── Փouhl 8 · AWS & Cloud ──────────────────────────────── */

  'aws-core': {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'AWS core concepts-ery en regions, availability zones, IAM, VPC ev billing modelı. Sah himqneri ymbrrumы cloud-native PHP applications disayn aretski hamar anhrashesht e.',
    seniorExpectations: [
      'Haskanel AWS global infrastructure-ı (regions, AZs, edge locations)',
      'Bacatrel IAM users, roles, policies ev best practices',
      'Ymbrel VPC networking (subnets, route tables, NACLs, Security Groups)',
      'Bacatrel AWS shared responsibility model-ı',
      'Haskanel AWS pricing models ev cost optimization strategies',
    ],
  },

  'aws-ec2-s3': {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'EC2 ev S3-ı AWS-i amentashakalatsvats servicesnerist meknerн en. EC2-ı compute hosting e taalis, S3-ı object storage e. PHP applications-um sah services-nerı masshkabayin kirarutyun unen.',
    seniorExpectations: [
      'Kiraрel EC2 instance types, auto scaling groups ev launch templates',
      'Haskanel S3 storage classes, lifecycle policies ev versioning',
      'Bacatrel EC2 pricing (on-demand, reserved, spot instances)',
      'Kiraрel S3 presigned URLs ev server-side encryption PHP-um',
      'Ymbrel EC2 user data scripts ev AMI barabanakultyunner',
    ],
  },

  'aws-lambda': {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'AWS Lambda-ı serverless computing-ı e, vorehang server management chi karevi. PHP Bref framework-ov Lambda-ı kiraрel kareli e PHP function-nery deploy aretski hamar, vorehang event-driven architectures-ı ev microservices-ı azdelum en.',
    seniorExpectations: [
      'Haskanel Lambda execution model (cold starts, warm starts, concurrency)',
      'Kiraрel PHP Bref framework Lambda PHP function-neri hamar',
      'Bacatrel Lambda pricing model (invocations, duration, memory)',
      'Ymbrel Lambda triggers (API Gateway, SQS, S3, EventBridge)',
      'Haskanel Lambda limitations ev ints e Lambda-ı chi hamarjek',
    ],
  },

  'aws-ecs': {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'Amazon ECS-ı (Elastic Container Service) fully managed container orchestration service e. Sah service-ı PHP Docker containers-ы AWS-um mashshtabavori tspanabaneli ev run aretsk kareli e.',
    seniorExpectations: [
      'Haskanel ECS architecture (clusters, services, tasks, task definitions)',
      'Bacatrel EC2 launch type ev Fargate (serverless) trade-offs',
      'Kiraрel ECS service auto scaling ev rolling deployments',
      'Ymbrel ECS networking (awsvpc mode, load balancer integration)',
      'Bacatrel ECS ev Kubernetes trade-offs ev migration considerations',
    ],
  },

  'aws-sqs-sns': {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'SQS (Simple Queue Service) ev SNS (Simple Notification Service) en AWS-i messaging services-nerı. SQS-ı work queue e, SNS-ı publish/subscribe notification service e. PHP applications-um sah services-nerы async communication-i hamar sharakan en.',
    seniorExpectations: [
      'Haskanel SQS queue types (Standard vs FIFO) ev dranc trade-offs',
      'Bacatrel SQS ev SNS tarberutyunnery ev fans-out pattern-ı (SNS -> SQS)',
      'Ymbrel message visibility timeout, DLQ ev retry behavior',
      'Kiraрel Laravel-ı SQS queue driver-ov',
      'Bacatrel SQS long polling vs short polling ev cost implications',
    ],
  },

  'aws-security': {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'AWS security-ı covers IAM, VPC security, KMS encryption, Secrets Manager ev WAF. Secure cloud architecture disayn aretsk PHP applications-ı compliance-i ev attacker-neris pathpanelu hamar anhrashesht e.',
    seniorExpectations: [
      'Kiraрel IAM roles ec2 instances ev Lambda-i hamar (instance profiles)',
      'Haskanel KMS key management ev server-side encryption',
      'Bacatrel Secrets Manager vs Parameter Store sensitive configuration-i hamar',
      'Ymbrel WAF rules ev Shield DDoS protection',
      'Bacatrel VPC security groups ev NACLs defense-in-depth hamar',
    ],
  },

  'aws-cloudwatch': {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'CloudWatch-ı AWS-i monitoring ev observability service-ı e. Metrics, logs ev alarms-ı ogtagelov PHP applications-ı monitoringerel, anomalies-ı haytnabererel ev incidents-i hamar automated alerts-ı kayuцnerel kareli e.',
    seniorExpectations: [
      'Haskanel CloudWatch Metrics, Logs ev Alarms',
      'Kiraрel CloudWatch Logs PHP application logs-i hamar',
      'Bacatrel CloudWatch Dashboards ev composite alarms',
      'Ymbrel CloudWatch Container Insights ECS/EKS monitoring-i hamar',
      'Kiraрel custom metrics ev Embedded Metric Format (EMF)',
    ],
  },

  'aws-cert-saa': {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'AWS Solutions Architect Associate (SAA-C03) sertifikaty AWS-i amenatarashkhatav sertifikatnererist mekn e. Sah kamarpastpanaky skazbanneri ev sertifikavarum en, vor andzı mec AWS solutions-ı architecting aretsk en, aylisk PHP backend tzragravortinery hamar arbahunakan e.',
    seniorExpectations: [
      'Haskanel SAA-C03 exam domains (Design Resilient Architectures, etc.)',
      'Bacatrel well-architected framework pillars ev dranc PHP kirarutyunnerе',
      'Kiraрel multi-tier application architectures AWS-um',
      'Ymbrel disaster recovery strategies (RTO/RPO) ev AWS services-neri medznumy',
      'Bacatrel exam-specific services (ElastiCache, Route53, CloudFront) ev PHP integrations',
    ],
  },

  'aws-cert-dva': {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'AWS Developer Associate (DVA-C02) sertifikaty PHP developers-i hamar nakhagahvats e, voronk cloud-native application development-ov en zabaghvum. CI/CD pipelines, serverless architectures ev AWS SDK ogtagelutyunnerı covers arum e.',
    seniorExpectations: [
      'Haskanel DVA-C02 exam domains ev PHP developer-neri hamar relevantakan services-nerı',
      'Kiraрel AWS SDK PHP-um (S3, SQS, DynamoDB, Lambda)',
      'Bacatrel CodePipeline, CodeBuild ev CodeDeploy PHP CI/CD-i hamar',
      'Ymbrel DynamoDB data modeling ev PHP kirarutyunnerе',
      'Bacatrel X-Ray tracing ev distributed tracing PHP applications-um',
    ],
  },

  docker: {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'Docker-ы containerization-ı e, vorehang applications-ı ev dranc dependencies-nerı isolated containers-um pakuцvum en. PHP applications-i Dockerizing-ı consistent environments-ı e apahоvum dev-its production-i.',
    seniorExpectations: [
      'Grel optimized Dockerfiles PHP applications-i hamar (multi-stage builds)',
      'Haskanel Docker networking, volumes ev environment variables',
      'Bacatrel Docker image layers ev layer caching optimization',
      'Kiraрel health checks ev graceful shutdown PHP containers-um',
      'Ymbrel Docker security best practices (non-root user, image scanning)',
    ],
  },

  'docker-compose': {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'Docker Compose-ı multi-container PHP development environments-ı orchate karelui e. Web server, PHP, database, cache ev queue services-nerı miasin karelui e run aretsk mek configuration file-ov.',
    seniorExpectations: [
      'Grel docker-compose.yml PHP full-stack environments-i hamar',
      'Haskanel service dependencies, health checks ev restart policies',
      'Bacatrel volumes, bind mounts ev tmpfs kirarutyunnerе',
      'Kiraрel environment-specific compose files (override files)',
      'Bacatrel docker-compose ev production orchestration tools (Kubernetes, ECS)',
    ],
  },

  terraform: {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'Terraform-ı Infrastructure as Code (IaC) gortsi e HashiCorp-ics, vorehang cloud infrastructure-ы declarative configuration files-ov kavelagucel karelui en. PHP deployment pipelines-um Terraform-ı kiraрel karelui e reproducible, version-controlled infrastructure-i hamar.',
    seniorExpectations: [
      'Haskanel Terraform HCL syntax, resources, providers ev modules',
      'Bacatrel terraform plan, apply, destroy workflow-ы',
      'Kiraрel Terraform state management (remote state, state locking)',
      'Ymbrel Terraform modules PHP infrastructure-i reusable components-i hamar',
      'Bacatrel Terraform ev CloudFormation trade-offs',
    ],
  },

  'github-actions': {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'GitHub Actions-ы CI/CD platform e, vorehang automated workflows-ı code repository-i mej directly-ı kavelagucel kareli en. PHP projects-i automated testing, Docker image building ev AWS deployment-ı dashkel karelui e.',
    seniorExpectations: [
      'Grel GitHub Actions workflows PHP testing, linting ev deployment-i hamar',
      'Haskanel triggers (push, pull_request, schedule), jobs ev steps',
      'Bacatrel secrets management ev environment protection rules',
      'Kiraрel reusable workflows ev composite actions',
      'Ymbrel matrix builds tarber PHP versions-i ev environments-i hamar',
    ],
  },

  eks: {
    phase: 'Փouhl 8 · AWS & Cloud',
    intro: 'Amazon EKS-ı (Elastic Kubernetes Service) managed Kubernetes service e AWS-um. PHP applications-ı EKS-um run aretsk karelui e enterprise-grade container orchestration-ı, auto-scaling ev service mesh capabilities-ı ogtagelucnem.',
    seniorExpectations: [
      'Haskanel EKS cluster architecture ev worker node groups',
      'Bacatrel EKS vs ECS trade-offs PHP applications-i hamar',
      'Kiraрel Kubernetes manifests (Deployments, Services, Ingress) PHP apps-i hamar',
      'Ymbrel Helm charts ev package management Kubernetes-um',
      'Bacatrel EKS networking (VPC CNI, load balancers, Ingress controllers)',
    ],
  },

}

export default hy
