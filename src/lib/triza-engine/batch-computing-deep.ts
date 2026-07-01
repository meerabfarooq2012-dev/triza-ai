/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — COMPUTER SCIENCE (DEEP DIVE)
 * ============================================================
 *
 *  Deeper subtopic entries that go beyond the introductory
 *  coverage in batch-computing.ts. Each entry drills into a
 *  single subfield — individual algorithms, design patterns,
 *  networking protocols, database internals, cloud platforms,
 *  attack taxonomies, and machine-learning pipelines — so
 *  TRIZA can answer follow-up questions with concrete detail.
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries and include both
 *  technical terms and natural-language phrasings so TRIZA
 *  can match questions from curious learners.
 *
 *  NO external LLM API is used. These are facts TRIZA has
 *  "learned" and will express in its own voice via the
 *  self-expression + narration engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const COMPUTING_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. SORTING ALGORITHMS IN DEPTH
  // ----------------------------------------------------------------
  {
    id: 'computing-deep-sorting-algorithms',
    patterns: [/\b(bubble sort|selection sort|insertion sort|merge sort|quick sort|quicksort|heap sort|counting sort|radix sort|stable sort|in-place sort|partition|pivot element|sorting algorithms compared|sorting kya hai)\b/i],
    keywords: ['bubble sort', 'selection sort', 'insertion sort', 'merge sort', 'quick sort', 'heap sort', 'stable sort', 'pivot', 'partition', 'in-place'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Sorting algorithms arrange elements in a defined order, and the choice between them depends on dataset size, whether the data is already partially ordered, and whether stability must be preserved. Each algorithm has a distinct mechanical idea behind it, and understanding those ideas is more valuable than memorizing code.

### Simple O(n squared) Sorts
Bubble sort repeatedly steps through the list, swapping adjacent items that are out of order, until a full pass makes no swaps. It is intuitive but slow — quadratic time in the average and worst case — and is mostly used for teaching. Selection sort finds the smallest remaining element and moves it to the front, repeating until sorted. It always does about n squared over two comparisons regardless of input order. Insertion sort picks each element and inserts it into its correct position among the already-sorted prefix. Although still quadratic in the worst case, insertion sort is excellent on small or nearly-sorted data, and many library sorts switch to it once subarrays shrink below a threshold of around ten elements.

### Divide-and-Conquer O(n log n) Sorts
Merge sort splits the array in half, recursively sorts each half, and then merges the two sorted halves. Its running time is O(n log n) in every case — best, average, and worst — and it is stable, meaning equal elements keep their original relative order. The cost is extra memory for the merge step. Quick sort chooses a pivot, partitions the array so that smaller elements are on the left and larger on the right, then recursively sorts each side. Quick sort is typically faster in practice than merge sort because of better cache behavior and in-place operation, but its worst case is O(n squared) when the pivot choice is poor. Modern implementations use median-of-three pivoting or randomization to make the worst case extremely unlikely.

### Specialized Linear-Time Sorts
When the data has special structure, we can beat the n log n lower bound that applies to comparison-based sorting. Counting sort works when the keys are small integers in a known range — it counts occurrences of each value, then produces the sorted output in O(n + k) time. Radix sort processes numbers digit by digit, using counting sort as a stable subroutine for each digit position. Both are linear when their assumptions hold, but they are not general-purpose.

### Stability and When to Use Each
A stable sort preserves the original order of equal-keyed elements, which matters when sorting records by a secondary key after a primary sort. Merge sort and insertion sort are stable; quick sort and heap sort are typically not. For general-purpose work, the practical choice is usually Timsort (a hybrid of merge sort and insertion sort, used in Python and Java) or introsort (a hybrid of quick sort and heap sort, used in C++).

### Why It Matters
Sorting is the foundation of searching, deduplication, ranking, and most data-analysis pipelines. A modern database, search engine, or spreadsheet relies on carefully chosen sort algorithms tuned for the data it handles. Knowing which sort fits which situation — and why — is one of the most practically useful skills in computer science.`,
  },

  // ----------------------------------------------------------------
  // 2. SEARCHING ALGORITHMS IN DEPTH
  // ----------------------------------------------------------------
  {
    id: 'computing-deep-searching-algorithms',
    patterns: [/\b(linear search|sequential search|binary search|hash table lookup|hash map|bfs|breadth first search|dfs|depth first search|graph traversal|shortest path|dijkstra|a-star|search algorithm comparison|searching kya hai)\b/i],
    keywords: ['linear search', 'binary search', 'hash table', 'hash map', 'bfs', 'dfs', 'breadth first', 'depth first', 'graph traversal', 'shortest path', 'dijkstra'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Searching is the problem of locating an item, a value, or a path within a data structure. The right searching strategy depends entirely on how the data is organized — sorted arrays, hash tables, and graphs each call for fundamentally different approaches, with very different complexity trade-offs.

### Linear and Binary Search
Linear search walks through a collection one element at a time, comparing each to the target. It works on any data — sorted or unsorted, array or list — and runs in O(n) time. For small datasets or one-off lookups it is perfectly adequate. Binary search requires a sorted array and works by comparing the target to the middle element, then discarding the half that cannot contain the target. Each step halves the search space, so the running time is O(log n). Searching a sorted array of one million items takes at most about twenty comparisons, compared to one million in the worst case for linear search. Binary search can also be adapted to find insertion points, square roots, and optimization boundaries.

### Hash Tables: O(1) Average Lookup
A hash table (also called a hash map) stores key-value pairs and uses a hash function to compute an index where each key should live. A good hash function distributes keys uniformly across the underlying array. In the average case, insert, lookup, and delete are all O(1) — constant time regardless of how many items are stored. The worst case is O(n), when many keys collide into the same bucket, but a well-designed hash table makes this rare. Collisions are handled by chaining (each bucket holds a small linked list) or open addressing (probe for the next free slot). Hash tables are the workhorse behind dictionaries, caches, sets, and database indexes.

### Graph Traversal: BFS and DFS
When data is organized as a graph — nodes connected by edges — searching means visiting nodes in some order. Breadth-first search (BFS) starts at a source node and explores all neighbors first, then their neighbors, level by level, using a queue. BFS finds the shortest path in an unweighted graph and is the basis for many routing algorithms. Depth-first search (DFS) dives as deep as possible along one branch before backtracking, using a stack or recursion. DFS is simpler to implement, uses less memory on wide graphs, and is the natural choice for cycle detection, topological sorting, and exploring mazes. Both run in O(V + E) time — vertices plus edges — which is optimal for graph traversal.

### Weighted Shortest Paths
When edges have weights (distances, costs, times), BFS no longer finds the shortest path. Dijkstra's algorithm generalizes BFS to weighted graphs by always expanding the closest unvisited node, using a priority queue. It finds shortest paths from a source to all other nodes in O((V + E) log V) time. For graphs with negative edge weights, the Bellman-Ford algorithm is used instead. The A-star algorithm adds a heuristic estimate of the remaining distance, focusing the search toward the goal — this is the algorithm behind GPS navigation and game pathfinding.

### Why It Matters
Almost every program searches something — a database row, a cache entry, a file, a route. Choosing the right data structure and search algorithm is often the difference between a responsive application and a sluggish one. Knowing when O(1) hash lookup, O(log n) binary search, or O(V + E) graph traversal applies is a core skill in software engineering.`,
  },

  // ----------------------------------------------------------------
  // 3. BIG O NOTATION IN DEPTH
  // ----------------------------------------------------------------
  {
    id: 'computing-deep-big-o-notation',
    patterns: [/\b(big o notation|asymptotic complexity|o of n|o of log n|o of n squared|o of n log n|exponential time|constant time|linear time|logarithmic time|time complexity analysis|space complexity|amortized|best case worst case average case)\b/i],
    keywords: ['big o', 'asymptotic', 'complexity', 'constant time', 'logarithmic', 'linear', 'quadratic', 'exponential', 'amortized', 'space complexity'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Big O notation is the language computer scientists use to describe how an algorithm's resource use grows as the input grows. It abstracts away constant factors and hardware details, letting us compare algorithms in a machine-independent way. Mastering Big O is the first real step from "writing code that works" to "writing code that scales."

### What Big O Actually Measures
Big O describes an upper bound on growth rate. An O(n) algorithm takes time proportional to the input size — doubling the input roughly doubles the work. The notation suppresses constants: an algorithm that takes exactly 3n steps and one that takes 50n steps are both O(n), because as n grows, the constant multiplier matters less and less. Big O also focuses on the dominant term: an algorithm taking n squared plus n plus 100 steps is O(n squared), because the quadratic term dominates as n becomes large.

### The Common Complexity Classes
From fastest to slowest, the most common classes are: O(1) — constant time, independent of input size (hash table lookup, array index access). O(log n) — logarithmic time; doubling the input adds a fixed amount of work (binary search). O(n) — linear time; work grows in proportion to input (single loop). O(n log n) — linearithmic time; the practical lower bound for comparison sorting (merge sort, quick sort average case, fast Fourier transform). O(n squared) — quadratic time; doubling input multiplies work by four (nested loops, simple sorts). O(2 to the n) — exponential time; each added input doubles the work (brute-force subset search). O(n factorial) — factorial time; astronomically slow even for tiny inputs (brute-force traveling salesman).

### Best, Worst, and Average Case
The same algorithm can have different complexities depending on the input. Quick sort's worst case is O(n squared) — when the pivot is consistently the smallest or largest element — but its average case is O(n log n), and that is what we usually mean. Linear search's best case is O(1) (the target is first), worst case O(n) (the target is last or absent). When analyzing an algorithm, we typically report the worst case, because it gives a guaranteed upper bound, but average case is often more representative of real performance.

### Space Complexity
The same notation describes memory use. A sorting algorithm that sorts in place uses O(1) extra space; merge sort uses O(n) extra space for the merge step. Recursive algorithms consume O(depth) stack space, which is why deep recursion can overflow the stack. Space and time are often trade-offs — caching results (more space) to avoid recomputation (less time) is the central idea behind memoization and dynamic programming.

### Amortized Analysis
Some operations have variable cost. A dynamic array's append is O(1) most of the time, but when the underlying array is full, it must be resized — an O(n) operation. Amortized analysis spreads the rare expensive resize across many cheap appends, giving an amortized O(1) cost per append. This is why amortized complexity is the right way to reason about dynamic arrays, hash table resizing, and similar structures.

### Why It Matters
Big O is the single most useful mental model in computer science. It tells you, before you write a line of code, whether your approach will scale to a million users or grind to a halt at a thousand. The difference between O(n squared) and O(n log n) is the difference between a sort that takes hours and one that takes seconds on the same data.`,
  },

  // ----------------------------------------------------------------
  // 4. RECURSION IN DEPTH
  // ----------------------------------------------------------------
  {
    id: 'computing-deep-recursion',
    patterns: [/\b(recursion|recursive function|base case|recursive case|call stack|tail recursion|stack overflow|factorial recursion|fibonacci recursion|tree traversal recursion|recursive descent|mutual recursion|recursion kya hai)\b/i],
    keywords: ['recursion', 'recursive', 'base case', 'call stack', 'tail recursion', 'stack overflow', 'factorial', 'fibonacci', 'tree traversal', 'mutual recursion'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Recursion is the technique of solving a problem by having a function call itself on a smaller version of the same problem. It is one of the most elegant tools in programming — many problems that are awkward to write iteratively become natural to write recursively, especially those involving trees, nested structures, and divide-and-conquer strategies.

### The Anatomy of a Recursive Function
Every recursive function has two essential parts. The base case is the simplest possible input, handled directly without further recursion — it is what stops the recursion from continuing forever. The recursive case breaks the problem into smaller subproblems, calls itself on each, and combines the results. Without a correct base case, the function calls itself indefinitely and the program crashes. A classic example is factorial: the base case is that factorial of zero equals one, and the recursive case is that factorial of n equals n times factorial of n minus one.

### The Call Stack
When a function calls itself, each invocation gets its own frame on the call stack — its own copy of parameters and local variables. The stack grows with each recursive call and shrinks as calls return. For factorial of five, the stack at its deepest holds five pending frames, each waiting for the next to finish. The call stack is what makes recursion work, but it is also its weakness: too many nested calls overflow the stack and crash the program. Most languages limit the stack to a few thousand frames, so deep recursion on a large input can fail even when the algorithm is logically correct.

### Tail Recursion
A recursive call is tail-recursive when it is the very last operation the function performs — nothing happens after it returns. Tail-recursive functions can be optimized by compilers into an equivalent loop, reusing the same stack frame instead of adding a new one. This is called tail-call optimization, and it eliminates the stack-overflow risk for tail-recursive functions. Languages like Scheme, Haskell, and Erlang guarantee this optimization; C, C++, and Rust support it in some cases; JavaScript formally requires it but most engines do not implement it; Python does not support it at all. Converting a naive recursive factorial into tail-recursive form, with an accumulator parameter, is a common exercise.

### Classic Recursive Patterns
Several patterns appear again and again. Linear recursion makes a single recursive call per level (factorial, list length). Tree recursion makes multiple calls per level (the naive Fibonacci, which calls itself twice per level and has exponential time). Divide-and-conquer recursion splits the input in half (merge sort, binary search). Backtracking recursion explores choices and undoes them when they lead to a dead end (solving mazes, generating permutations, the N-queens puzzle). Tree and graph traversals — pre-order, in-order, post-order, depth-first search — are most naturally expressed recursively.

### When Recursion Beats Iteration
Recursion shines when the problem itself is recursive in nature. Tree traversals, parsing nested expressions (JSON, mathematical formulas), and divide-and-conquer algorithms are far clearer in recursive form than their iterative equivalents. The iterative version of these usually requires an explicit stack, which is exactly what the call stack provides automatically. For simple linear processes, iteration is usually simpler and faster.

### Why It Matters
Recursion is a way of thinking, not just a coding technique. It teaches you to break problems into smaller versions of themselves and to trust that the smaller version will be solved correctly — a mental habit that pays off across computer science, from algorithm design to functional programming to mathematical induction. Mastering recursion is a rite of passage that separates programmers who can write working code from those who can solve hard problems.`,
  },

  // ----------------------------------------------------------------
  // 5. SOFTWARE DESIGN PATTERNS
  // ----------------------------------------------------------------
  {
    id: 'computing-deep-design-patterns',
    patterns: [/\b(design pattern|design patterns|singleton|factory pattern|abstract factory|observer pattern|strategy pattern|decorator pattern|adapter pattern|command pattern|mvc|model view controller|architectural pattern|gang of four|software pattern)\b/i],
    keywords: ['design pattern', 'singleton', 'factory', 'observer', 'strategy', 'decorator', 'adapter', 'command', 'mvc', 'gang of four'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Design patterns are reusable solutions to common problems in software design. They are not finished code, but templates — proven structures that experienced developers recognize and apply. The classic catalog, the "Gang of Four" book from 1994, organized twenty-three patterns into three families: creational, structural, and behavioral.

### Creational Patterns
Creational patterns abstract the process of object creation, so a system does not become tightly coupled to specific concrete classes. The Singleton pattern ensures a class has exactly one instance and provides a global access point to it — useful for things like a configuration manager or a logging service, though it must be used carefully because it can make testing harder. The Factory Method pattern defines an interface for creating objects but lets subclasses decide which class to instantiate. The Abstract Factory pattern extends this to families of related objects — for example, a UI toolkit that produces matching buttons, scrollbars, and menus for either a light or dark theme.

### Structural Patterns
Structural patterns describe how classes and objects are composed into larger structures. The Adapter pattern wraps an existing class with a new interface so it can work with code that expected a different one — the software equivalent of a travel plug adapter. The Decorator pattern attaches additional responsibilities to an object dynamically, without modifying its class. A coffee-ordering system might start with a basic Coffee object, decorate it with Milk, then with Sugar, each adding to the cost — a flexible alternative to a deep class hierarchy of coffee variants.

### Behavioral Patterns
Behavioral patterns deal with communication between objects and the assignment of responsibilities. The Observer pattern defines a one-to-many dependency: when one object (the subject) changes state, all its observers are notified automatically. This is the foundation of event systems, reactive programming, and the Model-View-Controller architecture — user-interface frameworks from Swing to React are built on observer-like mechanisms. The Strategy pattern defines a family of interchangeable algorithms and lets the client choose one at runtime. A payment system might have strategies for credit card, PayPal, and crypto, each implementing the same interface. The Command pattern encapsulates a request as an object, enabling undo, queuing, and logging.

### Architectural Patterns
Beyond object-level patterns, larger architectural patterns shape entire applications. Model-View-Controller (MVC) separates an application into three layers: the Model holds the data and business logic, the View renders the data to the user, and the Controller handles user input and updates the model. This separation lets each part evolve independently and makes the system testable. Modern variants include Model-View-ViewModel (MVVM) and the Flux/Redux unidirectional data flow used in many React applications.

### When to Use Patterns — and When Not To
Patterns are tools, not goals. Applying a pattern that the problem does not actually need adds complexity without benefit — the so-called "pattern addiction" of junior developers. The right approach is to recognize the problem first, then reach for a pattern only if the problem genuinely matches. A good rule of thumb: if you find yourself solving a problem for the third time in similar ways, look for a pattern that captures the structure.

### Why It Matters
Design patterns form a shared vocabulary among developers. Saying "this should be a Factory" or "let's use the Observer pattern here" communicates a complete structural idea in a few words. They also encode decades of hard-won experience about what works and what does not, sparing each new project from rediscovering the same lessons. Knowing the common patterns is one of the clearest markers of a mature software engineer.`,
  },

  // ----------------------------------------------------------------
  // 6. VERSION CONTROL WITH GIT
  // ----------------------------------------------------------------
  {
    id: 'computing-deep-version-control-git',
    patterns: [/\b(version control|git|github|gitlab|commit|commits|branch|branches|merge|rebase|pull request|pr|merge request|fork|clone|push|pull|stash|git workflow|source control|vcs)\b/i],
    keywords: ['git', 'github', 'gitlab', 'commit', 'branch', 'merge', 'rebase', 'pull request', 'fork', 'clone', 'version control'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Version control is the system that records changes to a set of files over time, so that you can recall specific versions later, collaborate with other developers without overwriting each other's work, and recover from mistakes. Git, created by Linus Torvalds in 2005, is the dominant version-control system in modern software development, and GitHub, GitLab, and Bitbucket are popular platforms that host Git repositories online.

### Commits and the Repository
A Git repository is a directed acyclic graph of commits. Each commit is a snapshot of the entire project at a moment, along with metadata — author, timestamp, and a pointer to the parent commit. Commits are identified by a cryptographic hash of their contents. Most commits have one parent (a linear history), but merge commits have two, recording the point where two lines of development came back together. Unlike older systems that stored deltas between versions, Git stores full snapshots, with deduplication and compression making this efficient.

### Branches
A branch in Git is just a movable pointer to a commit. Creating a branch is cheap and fast — no copying of files, just writing a new pointer. This encourages a workflow where each new feature, bugfix, or experiment gets its own branch, leaving the main branch stable. The default branch is usually called main (formerly master). When work on a feature branch is complete, it is merged back into main. The freedom to branch cheaply is one of Git's biggest advantages over its predecessors.

### Merge versus Rebase
When branches diverge, there are two ways to bring them back together. A merge creates a new commit that has both branch tips as parents, preserving the exact history of both lines of development. A rebase takes the commits from one branch and replays them on top of the other, producing a linear history with no merge commit. Merge preserves truth; rebase produces clarity. Most teams use rebase for short-lived feature branches to keep history readable, and merge for long-lived branches where the history of integration matters. The cardinal rule is never to rebase commits that have been pushed and shared with others, because rewriting their history causes conflicts for collaborators.

### Pull Requests and Code Review
A pull request (called a merge request on GitLab) is a proposal to merge a branch into another, usually into main. The pull request is more than a technical operation — it is the social mechanism of code review. Other team members read the diff, comment on it, suggest changes, and approve or request modifications before the merge happens. Pull requests are where knowledge is shared, bugs are caught early, and coding standards are enforced. On open-source projects, the pull request is how external contributors contribute — they fork the repository, push to their own copy, and open a pull request back to the original.

### Common Daily Workflow
A typical workflow is: pull the latest main, create a feature branch, make commits as you work, push the branch to the remote, open a pull request, address review feedback, and merge once approved. Stashing temporarily shelves uncommitted changes so you can switch contexts. Tags mark specific commits as releases. Git's commands can be obscure at first, but the underlying model — a graph of snapshots — is simple, and once you internalize it, the commands make sense.

### Why It Matters
Version control is the safety net of software development. Without it, every change is a gamble — a mistake might be unrecoverable, two developers might overwrite each other's work, and there is no record of why a change was made. With it, you can experiment freely, collaborate with thousands of strangers, and trace any line of code back to the decision that produced it. Git is one of those tools that, once learned, you cannot imagine working without.`,
  },

  // ----------------------------------------------------------------
  // 7. NETWORKING PROTOCOLS AND THE OSI MODEL
  // ----------------------------------------------------------------
  {
    id: 'computing-deep-networking-protocols',
    patterns: [/\b(tcp ip|tcp|ip address|http|https|dns|domain name system|ftp|websocket|websockets|osi model|osi layers|packet|packets|routing|udp|tls|transport layer|application layer|network protocol|protocols kya hai)\b/i],
    keywords: ['tcp', 'ip', 'http', 'https', 'dns', 'ftp', 'websocket', 'osi model', 'packet', 'udp', 'routing', 'protocol'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Networking protocols are the agreed-upon rules that allow computers to communicate. The internet is not a single protocol but a stack of them, each handling a different concern. The OSI seven-layer model is the conceptual map of that stack, and understanding it turns the apparent magic of "I typed a URL and a page appeared" into a sequence of concrete, traceable steps.

### The OSI Seven Layers
The OSI model divides networking into seven layers, each serving the one above it. Layer 1, the Physical layer, is the actual wire or radio signal — voltages, light pulses, Wi-Fi radio waves. Layer 2, the Data Link layer, handles direct communication between devices on the same local network (Ethernet, MAC addresses). Layer 3, the Network layer, moves packets across multiple networks using IP addresses — this is where routing happens. Layer 4, the Transport layer, provides end-to-end reliability (TCP) or speed (UDP). Layer 5, the Session layer, manages ongoing conversations. Layer 6, the Presentation layer, handles encoding, encryption, and compression. Layer 7, the Application layer, is what user-facing programs interact with directly.

### TCP/IP — The Internet's Foundation
The real internet collapses the seven layers into four, but the most important pair is TCP and IP. IP (Internet Protocol) is responsible for addressing and routing. Every device has an IP address, and IP packets carry data from source to destination across many intermediate routers, each forwarding the packet one hop closer. IP is unreliable by design — packets can be lost, duplicated, or arrive out of order. TCP (Transmission Control Protocol) sits on top of IP and adds reliability. It establishes a connection with a three-way handshake, numbers every byte, acknowledges received data, retransmits lost packets, and controls the sending rate to avoid overwhelming the network. UDP (User Datagram Protocol) is the lighter alternative — it sends packets with no guarantees, which is ideal for voice, video, and gaming where speed matters more than perfect reliability.

### DNS — The Internet's Phonebook
Humans remember names like example.com, but computers need IP addresses. The Domain Name System (DNS) translates names to addresses through a hierarchical, distributed database. When you type a URL, your computer queries a DNS resolver, which may in turn query root name servers, top-level domain servers, and authoritative servers for the specific domain. The result is cached at every level to speed up future lookups. DNS is one of the oldest and most critical protocols on the internet — when it breaks, nothing else works.

### HTTP and HTTPS
The Hypertext Transfer Protocol (HTTP) is the Application-layer protocol of the web. A client (usually a browser) sends a request — a method like GET or POST, a URL, headers, and an optional body — and the server responds with a status code, headers, and a body. HTTPS is HTTP wrapped in TLS encryption, which protects the contents from eavesdroppers and authenticates the server through certificates. HTTP/2 and HTTP/3 added multiplexing, header compression, and a switch from TCP to UDP-based QUIC, dramatically improving performance.

### FTP, WebSocket, and Beyond
FTP (File Transfer Protocol) is an older protocol for transferring files between hosts, largely superseded by HTTPS and cloud storage but still used in specific niches. WebSocket is a protocol that upgrades an HTTP connection into a persistent, bidirectional channel, allowing servers to push data to clients in real time — the foundation of chat apps, live notifications, and collaborative editing. Each protocol fills a specific niche in the application layer.

### Why It Matters
Every website, app, and online service depends on this layered stack of protocols working correctly. When you understand the layers — physical, IP routing, TCP reliability, DNS resolution, HTTP request-response — you can diagnose network problems, design better applications, and reason about security at the right level. The internet is one of the most complex machines humanity has built, and the protocol stack is its operating manual.`,
  },

  // ----------------------------------------------------------------
  // 8. DATABASE TYPES AND INTERNALS
  // ----------------------------------------------------------------
  {
    id: 'computing-deep-database-types',
    patterns: [/\b(relational database|nosql|document database|key-value store|graph database|column family|column store|mongodb|redis|cassandra|neo4j|normalization|normalized|denormalized|database index|b-tree|acid properties|cap theorem|database internals)\b/i],
    keywords: ['relational', 'nosql', 'document', 'key-value', 'graph', 'column family', 'mongodb', 'redis', 'cassandra', 'neo4j', 'normalization', 'b-tree', 'cap theorem'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Databases come in many shapes, and the choice between them is one of the most consequential architectural decisions an application can make. The right database depends on the shape of the data, the required consistency, the expected scale, and the kinds of queries the application must answer. The broad split is between relational (SQL) databases and the many flavors of NoSQL.

### Relational Databases and Normalization
Relational databases store data in tables — rows are records, columns are fields, and tables are linked by keys. Their strength is a rigorous data model enforced by a schema. Normalization is the process of organizing tables to reduce redundancy and improve integrity. First normal form eliminates repeating groups. Second normal form removes partial dependencies on a composite key. Third normal form removes transitive dependencies — every non-key column depends only on the primary key. A fully normalized schema is clean and avoids update anomalies, but it can require many joins to reassemble the data, which is why read-heavy applications sometimes denormalize for performance.

### The ACID Properties
Relational databases are famous for strong transactional guarantees, summarized as ACID. Atomicity — a transaction's changes all happen or none happen. Consistency — the database moves from one valid state to another, respecting all constraints. Isolation — concurrent transactions appear to execute serially, without interfering. Durability — once committed, changes survive crashes. These guarantees are why relational databases remain the default for financial systems and any application where correctness is non-negotiable. PostgreSQL, MySQL, Oracle, and SQL Server all implement ACID transactions, though their isolation-level implementations differ in subtle ways.

### Document Databases
Document databases, like MongoDB and Couchbase, store flexible JSON-like documents rather than rigid rows. Each document can have a different shape, which is ideal when the data model is evolving or when records naturally contain nested structures (an order with its line items, a blog post with its comments). Document databases often trade full ACID transactions across documents for higher write throughput and easier sharding. They shine for content management, catalogs, and user-profile systems where the data is mostly read and written as a whole document.

### Key-Value, Column-Family, and Graph Databases
Key-value stores like Redis and Memcached are the simplest — given a key, return a value, in microseconds. They are used for caching, session storage, and real-time leaderboards. Column-family stores like Cassandra and HBase organize data by column rather than row, optimized for massive write throughput and queries that aggregate over many rows but few columns — the model behind time-series data, logging, and large-scale analytics. Graph databases like Neo4j treat relationships as first-class citizens, storing edges alongside nodes. They excel at queries that traverse connections — friend-of-friend, fraud rings, recommendation paths — that would require expensive multi-hop joins in a relational database.

### Indexes and B-Trees
Indexes are the most important performance feature of any database. Without an index, finding matching rows requires a full table scan — O(n) in the number of rows. With an index, the database can locate matching rows in O(log n) time. The most common index structure is the B-tree (and its variant B+ tree), a balanced tree where each node holds a range of keys and pointers to child nodes or data pages. B-trees stay balanced under insertions and deletions, keeping lookups, inserts, and deletes all logarithmic. Hash indexes provide O(1) equality lookups but cannot support range queries. Modern databases also use LSM-trees (log-structured merge trees) for high-write workloads.

### The CAP Theorem
Distributed databases face a fundamental trade-off described by the CAP theorem: in the presence of a network partition, the system must choose between Consistency (every read sees the latest write) and Availability (every request gets a response). Relational databases typically favor consistency; many NoSQL systems favor availability. Understanding this trade-off is essential when choosing a database for a globally distributed application.

### Why It Matters
Data outlives code. The database you choose will shape your application for years — what queries are easy, what scale is possible, what consistency you can promise your users. Knowing the families of databases, the trade-offs they make, and the internal structures (B-trees, LSM-trees, indexes) that power them is the foundation of backend engineering.`,
  },

  // ----------------------------------------------------------------
  // 9. WEB DEVELOPMENT — FRONTEND, BACKEND, FULL-STACK
  // ----------------------------------------------------------------
  {
    id: 'computing-deep-web-development',
    patterns: [/\b(web development|frontend|front-end|backend|back-end|full stack|full-stack|html|css|javascript|react|vue|angular|nextjs|next.js|node.js|nodejs|rest api|graphql|api design|web framework|frontend framework)\b/i],
    keywords: ['web development', 'frontend', 'backend', 'full stack', 'html', 'css', 'javascript', 'react', 'vue', 'angular', 'node.js', 'rest api', 'graphql'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Web development is the practice of building applications that run in a browser and communicate with servers over the internet. It is split into frontend — everything that runs in the user's browser — and backend — everything that runs on servers. A developer who works on both sides is called a full-stack developer, and the modern web stack has grown large enough that fluency on both sides is itself a serious discipline.

### The Frontend Foundation: HTML, CSS, JavaScript
Every web page rests on three technologies. HTML (HyperText Markup Language) provides the structure — headings, paragraphs, images, links, form fields. CSS (Cascading Style Sheets) provides the presentation — colors, fonts, layout, responsive breakpoints. JavaScript provides the behavior — responding to clicks, fetching data, updating the page without a reload. These three are universal: every browser speaks them, and every web framework ultimately produces them. A solid grasp of the raw trio makes every higher-level tool easier to learn.

### Frontend Frameworks
Building a complex interface in raw JavaScript quickly becomes unwieldy. Frontend frameworks bring structure: a component model that splits the UI into reusable pieces, reactive data binding that updates the DOM automatically when state changes, and a routing system for single-page applications. React, created by Facebook, popularized the component model and the virtual DOM, and remains the most widely used framework. Vue offers a gentler learning curve with similar ideas. Angular, from Google, is a more opinionated, full-featured framework often chosen for large enterprise applications. Next.js extends React with server-side rendering, routing, and code splitting, blurring the line between frontend and backend.

### The Backend
The backend is the part of the application the user never sees directly. It receives HTTP requests, applies business logic, reads and writes to a database, and returns responses — usually JSON for modern web APIs. The backend also handles authentication, authorization, validation, background jobs, and integrations with external services. Common backend stacks include Node.js (JavaScript on the server), Python with Django or Flask, Ruby on Rails, Java with Spring, and Go. Each makes different trade-offs between performance, developer productivity, and ecosystem maturity.

### REST and GraphQL APIs
An API (Application Programming Interface) is the contract between frontend and backend. REST (Representational State Transfer) is the dominant style: resources are identified by URLs (like /users/42), and HTTP methods (GET, POST, PUT, DELETE) map to operations on those resources. REST is simple, cacheable, and ubiquitous. GraphQL, introduced by Facebook in 2015, takes a different approach: the client sends a single query describing exactly the fields it needs, and the server returns precisely that shape. GraphQL reduces over-fetching and under-fetching and is especially useful for mobile clients and complex nested data, at the cost of a more complex server implementation.

### Full-Stack Development
A full-stack developer understands the entire flow of a web request — from a button click in the browser, through the JavaScript event handler, the API call, the backend route, the database query, and back. Frameworks like Next.js, Remix, and SvelteKit increasingly unify the two sides, letting developers write server and client code in the same project with shared types. The result is faster development, fewer integration bugs, and a smoother experience for users.

### Why It Matters
The web is the most widely deployed application platform ever built. Every device with a browser — phones, laptops, tablets, TVs — can run web applications, with no installation required. Whether you are building a personal blog, a startup product, or an internal tool for a Fortune 500 company, web development is likely part of the stack. Understanding the division between frontend and backend, and the technologies that power each, is the entry point to a huge fraction of modern software work.`,
  },

  // ----------------------------------------------------------------
  // 10. CLOUD COMPUTING
  // ----------------------------------------------------------------
  {
    id: 'computing-deep-cloud-computing',
    patterns: [/\b(cloud computing|iaas|paas|saas|aws|amazon web services|azure|google cloud|gcp|virtualization|hypervisor|docker|container|containers|kubernetes|serverless|lambda|cloud provider|elastic computing)\b/i],
    keywords: ['cloud computing', 'iaas', 'paas', 'saas', 'aws', 'azure', 'gcp', 'virtualization', 'docker', 'container', 'kubernetes', 'serverless'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Cloud computing is the delivery of computing power, storage, and services over the internet, on demand, from a shared pool of resources managed by a provider. Instead of buying and maintaining physical servers, an organization rents capacity by the minute, scaling up during peak demand and down during quiet periods. The cloud has reshaped how software is built, deployed, and paid for.

### The Service Models: IaaS, PaaS, SaaS
Cloud services fall into three layers. IaaS (Infrastructure as a Service) provides raw virtual machines, storage, and networking — you rent a server and install whatever you want on it. AWS EC2, Azure Virtual Machines, and Google Compute Engine are examples. PaaS (Platform as a Service) provides a managed runtime — you deploy your code, and the provider handles the operating system, scaling, and patching. Examples include Heroku, Google App Engine, and AWS Elastic Beanstalk. SaaS (Software as a Service) provides a finished application over the internet — Gmail, Salesforce, Slack, Notion. Most users interact with SaaS; most developers work with IaaS or PaaS.

### Virtualization
The foundation of the cloud is virtualization — the technology that lets one physical server run many isolated virtual machines (VMs), each believing it has its own hardware. A hypervisor (like VMware ESXi, KVM, or Xen) sits between the hardware and the VMs, allocating CPU, memory, and disk to each. Virtualization is what makes the cloud economic: a provider can pack hundreds of customers onto a single physical machine, charge each only for what they use, and move workloads around as demand shifts.

### Containers and Docker
Containers are a lighter alternative to VMs. Instead of virtualizing the entire hardware stack, a container virtualizes only the operating system layer — multiple containers share one OS kernel but remain isolated from each other in terms of filesystem, processes, and network. Docker, released in 2013, made containers easy to build and use. A Docker image bundles an application with all its dependencies, so it runs identically on a developer's laptop, a test server, and production. Containers start in milliseconds, use far less memory than VMs, and eliminated the "it works on my machine" problem that plagued software deployment for decades.

### Kubernetes
When an application grows to dozens or hundreds of containers, managing them by hand becomes impossible. Kubernetes, originally developed at Google and open-sourced in 2014, is a container orchestration system. It schedules containers across a cluster of machines, restarts them when they fail, scales them up or down based on load, and rolls out new versions without downtime. Kubernetes has become the standard for running containerized applications at scale, though its complexity is significant — many teams adopt managed Kubernetes services like Amazon EKS, Google GKE, or Azure AKS rather than running it themselves.

### Serverless Computing
Serverless takes the abstraction one step further: the developer writes functions and the cloud provider handles everything else — servers, scaling, even billing, which is by execution time rather than reserved capacity. AWS Lambda, Google Cloud Functions, and Azure Functions are the main platforms. Serverless is ideal for short-lived, event-driven workloads — image processing after an upload, webhook handlers, scheduled tasks. It is not suited to long-running or latency-sensitive applications, but for the right workload it eliminates operational overhead almost entirely.

### The Major Providers
Three providers dominate the cloud market. AWS (Amazon Web Services) is the oldest and largest, with the widest range of services. Microsoft Azure is the strong second, with deep enterprise integration and a powerful hybrid-cloud story. Google Cloud Platform (GCP) is smaller in market share but leads in data analytics, machine learning, and Kubernetes (which it pioneered). The choice between them often comes down to existing relationships, specific service needs, and geographic availability.

### Why It Matters
The cloud has democratized access to computing. A startup can launch a global application without buying a single server. A researcher can rent a thousand GPUs for an hour to train a model. An enterprise can shut down its data centers and focus on its product. Understanding the cloud — its service models, its virtualization foundation, the roles of containers and orchestration and serverless — is now a baseline skill for any software professional.`,
  },

  // ----------------------------------------------------------------
  // 11. CYBERSECURITY — ATTACKS AND DEFENSES
  // ----------------------------------------------------------------
  {
    id: 'computing-deep-cybersecurity-attacks',
    patterns: [/\b(malware|virus|worm|trojan|ransomware|spyware|adware|phishing|spear phishing|ddos|denial of service|sql injection|xss|cross site scripting|csrf|firewall|two factor|2fa|mfa|zero trust|security operations|incident response)\b/i],
    keywords: ['malware', 'virus', 'worm', 'trojan', 'ransomware', 'phishing', 'ddos', 'sql injection', 'xss', 'firewall', '2fa', 'zero trust', 'incident response'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Cybersecurity is the practice of defending computers, networks, and data from attackers who seek to steal, alter, or deny access to them. The threat landscape is broad, and effective defense requires understanding both the categories of attack and the layers of defense that counter them. Cryptography, covered separately, is one layer; this entry covers the broader operational and architectural picture.

### Malware Categories
Malware is malicious software, and it comes in several distinct forms. A virus attaches itself to a legitimate program and spreads when that program runs, requiring user action to propagate. A worm spreads on its own, exploiting network vulnerabilities to move from machine to machine without any user involvement. A trojan masquerades as a legitimate application — a game, a utility, a pirated movie — and, once installed, opens a backdoor for the attacker. Ransomware encrypts the victim's files and demands payment, usually in cryptocurrency, for the decryption key; it has become one of the most damaging categories of cybercrime, capable of shutting down hospitals, pipelines, and entire companies. Spyware silently collects information — keystrokes, screen captures, browsing history — and sends it to the attacker. Adware forces unwanted advertisements, often to generate revenue for the attacker.

### Social Engineering and Phishing
The weakest link in most security systems is the human user. Phishing is the practice of sending fraudulent emails or messages that appear to come from a trusted source — a bank, an employer, a colleague — in order to trick the recipient into revealing credentials or clicking a malicious link. Spear phishing is a targeted variant, customized for a specific individual using information gathered from social media or other sources. These attacks bypass technical defenses entirely by exploiting trust and urgency. Multi-factor authentication (MFA) is the strongest single defense: even if an attacker steals a password, they still need the second factor — a code from a phone, a hardware key, a biometric — to log in.

### Network and Application Attacks
A denial-of-service (DoS) attack floods a target with so many requests that it cannot serve legitimate users. A distributed denial-of-service (DDoS) attack does the same using thousands of compromised machines (a botnet), making the source harder to block. SQL injection exploits applications that build database queries by string concatenation; an attacker inserts SQL fragments into an input field, potentially reading or modifying the entire database. Cross-site scripting (XSS) injects malicious JavaScript into a web page viewed by other users, allowing the attacker to steal session tokens or impersonate the victim. Cross-site request forgery (CSRF) tricks an authenticated user's browser into making an unwanted request to a site where they are logged in. Each of these has well-known defenses — parameterized queries for SQL injection, output encoding for XSS, anti-CSRF tokens — but they remain common because developers keep making the same mistakes.

### Defensive Layers
Defense in depth is the guiding principle: no single control is sufficient, so layers are stacked. A firewall filters traffic at the network boundary, blocking unauthorized connections. An intrusion detection system watches for suspicious patterns. Endpoint protection (modern antivirus) detects malware behavior on individual machines. Encryption protects data at rest and in transit, so that a stolen laptop or intercepted packet reveals nothing useful. Regular patching closes known vulnerabilities before attackers can exploit them. The principle of least privilege limits every user and program to only the access they genuinely need, so that a compromise of one component does not cascade into the whole system.

### Zero Trust and Modern Architecture
The traditional security model was a castle: a strong perimeter, with trust assumed inside. The zero-trust model, increasingly adopted by modern organizations, assumes the network is already compromised and verifies every request as if it came from an untrusted network. Every access decision is made dynamically based on identity, device posture, and context. Zero trust pairs naturally with cloud and remote-work environments, where the perimeter has dissolved.

### Why It Matters
Cyberattacks are now a constant, professionalized, and often state-sponsored reality. Every organization that handles data — and that means almost every organization — is a target. The financial, reputational, and operational costs of a breach can be devastating. Understanding the categories of attack and the layers of defense is no longer a specialty; it is a baseline literacy for anyone who builds, manages, or simply uses networked computers.`,
  },

  // ----------------------------------------------------------------
  // 12. MACHINE LEARNING PIPELINE IN DEPTH
  // ----------------------------------------------------------------
  {
    id: 'computing-deep-machine-learning-pipeline',
    patterns: [/\b(supervised learning|unsupervised learning|reinforcement learning|regression|classification|clustering|k-means|pca|principal component analysis|neural network|deep learning|cnn|convolutional neural network|rnn|transformer|overfitting|underfitting|training set|test set|validation|gradient descent|loss function|hyperparameter)\b/i],
    keywords: ['supervised', 'unsupervised', 'reinforcement', 'regression', 'classification', 'clustering', 'k-means', 'pca', 'neural network', 'cnn', 'rnn', 'transformer', 'overfitting', 'gradient descent'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `A machine-learning system is built through a pipeline that begins with data, ends with a deployed model, and is judged by how well that model generalizes to inputs it has never seen. Understanding the pipeline — and the choices and pitfalls at each stage — is what separates a working ML system from a demo that impresses on the training set and fails in production.

### Supervised Learning: Regression and Classification
Supervised learning is the most common ML paradigm. The training data consists of input-output pairs, and the model learns to map inputs to outputs. When the output is a continuous number — predicting house prices, temperatures, or stock values — the task is regression, and linear regression is the simplest example. When the output is a category — predicting whether an email is spam or not, whether an image shows a cat or a dog — the task is classification, and logistic regression, decision trees, random forests, and support vector machines are common tools. The quality of a supervised model depends almost entirely on the quality and quantity of labeled training data; collecting that data is often the hardest part of the project.

### Unsupervised Learning: Clustering and Dimensionality Reduction
Unsupervised learning works with unlabeled data and asks the algorithm to find structure on its own. Clustering groups similar items — k-means partitions data into k clusters by iteratively assigning points to the nearest cluster center. It is used for customer segmentation, anomaly detection, and as a preprocessing step. Dimensionality reduction compresses high-dimensional data into fewer dimensions while preserving its essential structure. Principal Component Analysis (PCA) finds the directions of greatest variance and projects data onto them, which is invaluable for visualization, noise reduction, and speeding up downstream algorithms. Autoencoders, a neural-network-based technique, learn nonlinear dimensionality reductions.

### Reinforcement Learning
Reinforcement learning (RL) is the third major paradigm. An agent interacts with an environment, takes actions, and receives rewards or penalties. Over time, it learns a policy — a mapping from states to actions — that maximizes long-term cumulative reward. RL is how systems learned to play chess, Go, and video games at superhuman levels, and it underlies recent advances in robotics and autonomous control. RL is powerful but data-hungry and unstable; it tends to work best in simulated environments where unlimited training episodes are possible.

### Neural Networks and Deep Learning
A neural network is a model built from layers of simple computing units called neurons, each applying a weighted sum followed by a nonlinear activation function. Training adjusts the weights via gradient descent, using the backpropagation algorithm to compute gradients efficiently through all layers. Deep learning means networks with many layers, capable of learning hierarchical features automatically. Convolutional neural networks (CNNs) are specialized for images — early layers detect edges, later layers detect textures, and final layers detect objects. Recurrent neural networks (RNNs) and their modern successor the Transformer process sequences, and Transformers in particular have driven the recent revolution in natural-language processing, powering large language models like GPT and BERT.

### Training, Validation, and Test Sets
A common mistake is to evaluate a model on the same data it was trained on — this measures memorization, not learning. The standard practice is to split the data into three sets: a training set the model learns from, a validation set used to tune hyperparameters (learning rate, number of layers, regularization strength), and a test set used only once, at the end, to estimate real-world performance. When data is limited, k-fold cross-validation rotates which fold is the validation set to make better use of every example.

### Overfitting and Underfitting
Overfitting is the central pathology of machine learning: the model learns the training data so well, including its noise, that it fails to generalize. An overfit model has low training error but high test error. Underfitting is the opposite — the model is too simple to capture the underlying pattern, and both training and test error are high. The cures for overfitting include more data, simpler models, regularization (penalizing large weights), dropout in neural networks, and early stopping. The cures for underfitting include more complex models, better features, and longer training. The art of ML is finding the sweet spot between the two.

### Why It Matters
Machine learning has moved from research labs into nearly every industry — medical diagnosis, fraud detection, autonomous vehicles, language translation, recommendation systems, content moderation. Knowing the pipeline, the families of algorithms, and the failure modes like overfitting lets you reason about where ML can help and where it cannot, and it makes you a more informed consumer of the AI systems that increasingly shape daily life.`,
  },
]
