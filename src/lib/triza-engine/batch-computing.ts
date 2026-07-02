/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — COMPUTER SCIENCE & PROGRAMMING
 * ============================================================
 *
 *  Foundational computing: programming, algorithms, data
 *  structures, control flow, object-oriented programming,
 *  binary, the internet, databases, operating systems,
 *  artificial intelligence, and security.
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

export const COMPUTING_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. PROGRAMMING BASICS
  // ----------------------------------------------------------------
  {
    id: 'computing-programming-basics',
    patterns: [/\b(programming|programmer|programming language|source code|coding|coder|compile|compiler|compiled|interpret|interpreter|interpreted|machine code|executable|code kya hai|programming kya hai)\b/i],
    keywords: ['programming', 'source code', 'compile', 'compiler', 'interpret', 'interpreter', 'machine code', 'coding', 'language'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Programming is the craft of writing precise instructions for a computer to carry out. A computer on its own can do nothing — it needs a human to spell out, step by step, exactly what it should do. The set of instructions we write is called a program, and the act of writing it is called programming, or coding.

### Source Code
Programmers write instructions in a programming language such as Python, JavaScript, C++, Java, or Rust. The text they produce is called source code — plain text files containing statements, expressions, and declarations that follow the strict rules (called syntax) of the chosen language. Source code is written to be readable by humans first, machines second. Good code uses meaningful names, clear structure, and comments that explain intent.

### Machine Code
Underneath, the computer's processor understands only one thing: machine code — sequences of binary instructions, ones and zeros, that directly control the hardware. Every program, no matter how elegant the source, must become machine code before it can run. There is a wide gap between human-readable source code and machine-executable instructions, and that gap is bridged by translation tools.

### Compilation vs Interpretation
There are two main translation strategies. A compiler reads the entire source file and translates it into machine code ahead of time, producing an executable file that runs quickly. C, C++, and Rust follow this model — performance is high, and many errors are caught before the program ever runs. An interpreter reads and executes source code line by line at runtime, with no separate build step. Python and JavaScript work this way — they tend to be slower but are more flexible and easier to test interactively. Many modern languages use a hybrid: the source is compiled to an intermediate bytecode, which is then interpreted or just-in-time compiled into machine code during execution. Java, C#, and the V8 JavaScript engine all use this hybrid approach.

### Why It Matters
Programming is the literacy of the twenty-first century. Every app, website, game, car, aircraft, medical device, and financial system runs on code written by humans. Learning to program is not really about memorizing the syntax of one language — it is about learning to break problems into small, precise, unambiguous steps. That skill, often called computational thinking, transfers to every field. Whether you ever write a line of code or not, the world you live in is shaped by it, and understanding the basics gives you a clearer view of how that world actually works.`,
  },

  // ----------------------------------------------------------------
  // 2. ALGORITHMS AND COMPLEXITY
  // ----------------------------------------------------------------
  {
    id: 'computing-algorithms',
    patterns: [/\b(algorithm|algorithms|big o|big-o|time complexity|space complexity|sorting algorithm|searching algorithm|binary search|bubble sort|merge sort|quick sort|efficiency|computational complexity|algorithm kya hai)\b/i],
    keywords: ['algorithm', 'big o', 'complexity', 'sorting', 'searching', 'binary search', 'efficiency', 'merge sort'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `An algorithm is a step-by-step procedure for solving a problem. It is the recipe behind every program: given some input, follow these exact steps, and produce the desired output. The word itself comes from the name of the ninth-century Persian scholar Al-Khwarizmi, whose work on systematic calculation gave us both the term "algorithm" and the word "algebra."

### What Makes an Algorithm
A good algorithm has three properties. It is correct — it produces the right answer for every valid input. It is finite — it always terminates after a bounded number of steps. And it is unambiguous — each step is precisely defined, with no room for interpretation. The same algorithm can be implemented in any programming language; the algorithm itself is the abstract idea, the code is one expression of it.

### Measuring Efficiency: Big O Notation
For the same problem, there are often many possible algorithms, and some are dramatically faster than others. Computer scientists measure efficiency using Big O notation, which describes how the running time (or memory use) grows as the input size grows. An algorithm that takes time proportional to the input size is called O(n) — doubling the input doubles the work. One that takes time proportional to the square of the input is O(n squared) — doubling the input multiplies the work by four. Binary search, which halves the search space at each step, is O(log n), meaning it can find an item in a sorted list of a million entries in only about twenty steps.

### Sorting and Searching
Two algorithm families appear again and again. Sorting algorithms arrange items in order — bubble sort is simple but slow (O(n squared)), while merge sort and quick sort use divide-and-conquer to reach O(n log n), which is near the theoretical best possible. Searching algorithms locate an item in a collection. Linear search checks each element one by one (O(n)). Binary search works on sorted data and repeatedly halves the possibilities (O(log n)), which is why sorting first can make future lookups vastly faster.

### Why Efficiency Matters
Naive algorithms can be millions of times slower than good ones. A program that takes a second with a good algorithm might take a year with a bad one. When a search engine processes billions of queries, when a navigation app computes routes in real time, when a genome analysis compares billions of base pairs, the choice of algorithm is the difference between a working product and one that never finishes. Efficiency is not a luxury — it is the boundary between what computers can and cannot do.`,
  },

  // ----------------------------------------------------------------
  // 3. DATA STRUCTURES
  // ----------------------------------------------------------------
  {
    id: 'computing-data-structures',
    patterns: [/\b(data structure|data structures|array|arrays|linked list|stack|queue|hash table|hash map|dictionary|tree|trees|binary tree|graph|graphs|heap)\b/i],
    keywords: ['data structure', 'array', 'linked list', 'stack', 'queue', 'hash table', 'tree', 'graph', 'heap'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `A data structure is a specific way of organizing and storing data so that it can be used efficiently. Choosing the right data structure is often more important than choosing the right algorithm, because the structure determines which operations are fast and which are slow. A famous book on the subject is titled "Algorithms + Data Structures = Programs" — the two together are what programming really is.

### Arrays and Lists
An array stores elements in a contiguous block of memory, each accessible by its index. Looking up an element by position is instant, but inserting or deleting in the middle requires shifting everything that follows, which is slow. A linked list stores each element as a separate node with a pointer to the next. Insertion and deletion are fast if you already have the right node, but you cannot jump to an arbitrary position — you have to walk the list from the start.

### Stacks and Queues
Stacks and queues are restricted lists with specific access rules. A stack follows last-in-first-out (LIFO) order — the last item added is the first removed, like a stack of plates. Stacks power function calls, undo systems, and expression evaluation. A queue follows first-in-first-out (FIFO) order — the first item added is the first removed, like a line at a counter. Queues power task scheduling, print spoolers, and message handling.

### Hash Tables
A hash table (also called a hash map or dictionary) stores key-value pairs and uses a hash function to compute where each key belongs. When the hash function is good, lookups, insertions, and deletions all take constant time on average — O(1). Hash tables are the workhorse behind caches, databases, symbol tables in compilers, and almost every modern application that needs fast lookups.

### Trees and Graphs
A tree is a hierarchical structure with a root node and branches, used for file systems, parse trees, and decision-making. A binary search tree keeps its left children smaller and right children larger than the parent, enabling fast search, insertion, and deletion. A graph is a more general structure of nodes connected by edges, modeling networks, maps, social connections, and the web itself. Trees are a special case of graphs with no cycles.

### Choosing the Right Structure
There is no universally best data structure. Arrays win for indexed access. Hash tables win for fast lookups by key. Trees win for ordered data and range queries. Graphs win for relationship modeling. The skilled programmer knows the trade-offs and chooses accordingly, because the right choice can make a program a thousand times faster.`,
  },

  // ----------------------------------------------------------------
  // 4. VARIABLES AND DATA TYPES
  // ----------------------------------------------------------------
  {
    id: 'computing-variables-types',
    patterns: [/\b(variable|variables|data type|data types|int|integer|float|double|string|boolean|bool|static typing|dynamic typing|type system|type checking|strong typing|weak typing)\b/i],
    keywords: ['variable', 'data type', 'integer', 'float', 'string', 'boolean', 'static typing', 'dynamic typing', 'type system'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `A variable is a named container for a value in a program. It lets the programmer store a piece of data, give it a meaningful name, and refer to it later. Behind the scenes, a variable is a label for a location in the computer's memory — when you read or write the variable, you are reading or writing that memory location.

### Data Types
Every value in a program has a type, which tells the computer what kind of data it is and what operations make sense on it. The primitive types appear in almost every language. Integers (int) are whole numbers like 7, -3, or 0. Floating-point numbers (float or double) are numbers with fractional parts like 3.14 or -0.001 — they are stored in a format that can represent very large and very small values, with limited precision. Strings are sequences of characters, like "hello" — they hold text. Booleans (bool) are the simplest type, with only two possible values: true or false. Booleans are the type behind every condition and every decision a program makes.

### Composite Types
Most languages also offer composite types built from primitives. Arrays and lists hold ordered collections of values. Records, structs, or objects group related fields together — a "person" might have a name (string), age (integer), and height (float). These composite types let programmers model real-world entities directly in code.

### Static vs Dynamic Typing
Languages differ in when they check types. In a statically typed language like C, Java, or Rust, every variable's type is declared and checked at compile time. The compiler catches type errors before the program runs, and the resulting code tends to be faster because the compiler knows exactly how much memory each value needs. In a dynamically typed language like Python, JavaScript, or Ruby, types are checked at runtime — a variable can hold an integer now and a string later. This makes code more flexible and faster to write, but type errors surface only when the offending code actually runs.

### Strong vs Weak Typing
Separately from static and dynamic, languages can be strongly or weakly typed. Strongly typed languages (Python, Java) do not silently convert between unrelated types — adding a number to a string is an error. Weakly typed languages (JavaScript, C) often perform implicit conversions, which can produce surprising results like "1" + 1 equaling "11" in JavaScript. Each approach has defenders; the choice is about safety versus convenience.

### Why It Matters
Types are not bureaucracy — they are a contract. They tell the compiler (and the reader) what a value means and what can be done with it. Modern type systems catch enormous numbers of bugs before code ever runs, and they let large teams collaborate safely on big codebases. A good type system feels like a helpful assistant, quietly preventing mistakes.`,
  },

  // ----------------------------------------------------------------
  // 5. CONTROL FLOW AND FUNCTIONS
  // ----------------------------------------------------------------
  {
    id: 'computing-functions-control-flow',
    patterns: [/\b(control flow|if else|if statement|loop|for loop|while loop|function|functions|method|parameter|parameters|argument|arguments|return value|recursion|recursive|branch|branching)\b/i],
    keywords: ['control flow', 'if else', 'loop', 'for loop', 'while loop', 'function', 'parameter', 'argument', 'return value', 'recursion'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `By default, a program runs its statements one after another, top to bottom. Real programs almost never stay linear for long — they make decisions, repeat work, and bundle logic into reusable pieces. These three capabilities — branching, looping, and functions — are collectively called control flow, and they are what turn a flat sequence of instructions into a real program.

### Branching with if / else
An if statement lets a program choose what to do based on a condition. If the condition evaluates to true, one block runs; otherwise an else block runs, or the program skips ahead. Chains of "else if" handle multiple cases. Some languages also offer switch or match statements, which dispatch cleanly among many possible values of a single expression. Branching is how programs respond to user input, handle errors, and adapt their behavior to circumstances.

### Loops: for and while
Loops let a program repeat work without writing the same code many times. A for loop iterates over a known range or collection — counting from 1 to 10, or processing each item in a list. A while loop repeats as long as a condition stays true, used when the number of iterations is not known in advance — reading input until the user quits, or polling a sensor until a stable reading appears. Loops must always have a way to end; a loop whose condition never becomes false runs forever, which is a common bug called an infinite loop.

### Functions
A function is a named, reusable block of code that performs a specific task. Functions take inputs (called parameters or arguments), do some work, and often return an output. They are the most important tool for managing complexity: instead of writing one giant block of code, you break the work into small, named functions that each do one thing well. Good function names act as documentation, and functions can be tested, reused, and replaced independently. Parameters let the same function operate on different data; return values let it pass results back to the caller.

### Recursion
Recursion is a special form of repetition in which a function calls itself. A recursive function solves a problem by solving a smaller version of the same problem, until it reaches a base case that it can solve directly. Recursion is natural for problems that have a self-similar structure: traversing a tree, computing factorials, or sorting with merge sort. Every recursive function can also be written as a loop, but recursion often produces cleaner, more readable code for the right problems.

### Why It Matters
Control flow and functions are the basic grammar of programming. Without them, code could only do one thing, once, in one fixed way. With them, programs become responsive, repeatable, and modular — able to model real behavior, break problems into pieces, and grow to millions of lines without collapsing into chaos.`,
  },

  // ----------------------------------------------------------------
  // 6. OBJECT-ORIENTED PROGRAMMING
  // ----------------------------------------------------------------
  {
    id: 'computing-oop',
    patterns: [/\b(object oriented|oop|object|objects|class|classes|inheritance|encapsulation|polymorphism|abstraction|method|instance|constructor|subclass|superclass)\b/i],
    keywords: ['object oriented', 'oop', 'object', 'class', 'inheritance', 'encapsulation', 'polymorphism', 'abstraction'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Object-oriented programming, usually abbreviated OOP, is a way of organizing code around objects rather than actions. Instead of writing a program as a sequence of operations on data, an OOP program is built from objects that bundle together related data and the operations that work on that data. Languages like Java, C++, C#, and Python place OOP at their center, and the ideas have shaped how programmers think about design for decades.

### Classes and Objects
A class is a blueprint — it defines what fields (data) and methods (functions) a kind of object will have. An object is a specific instance created from that blueprint. For example, a Car class might define fields like color, speed, and fuel level, and methods like accelerate and brake. From that single class, you can create many Car objects, each with its own color and speed but sharing the same behavior. The class captures the general idea; the objects are the concrete instances.

### Encapsulation
Encapsulation means bundling data and behavior together and controlling access to the data. An object's internal fields are often marked private, so code outside the object cannot change them directly. Instead, the object exposes public methods that act as a controlled interface — you can ask a Car to accelerate, but you cannot secretly set its speed field to a million. Encapsulation protects invariants (rules that must always hold, like "speed is never negative") and lets the internal implementation change without breaking the rest of the program.

### Inheritance
Inheritance lets a new class adopt the fields and methods of an existing class, then extend or modify them. A SportsCar class can inherit from Car, gaining all of Car's fields and methods automatically, then add new fields (turbo level) or override existing methods (a faster accelerate). Inheritance models the "is-a" relationship — a SportsCar is a Car — and it supports code reuse, because shared behavior is written once in the parent class.

### Polymorphism
Polymorphism means "many forms" — the same operation can behave differently depending on the type of object it is applied to. If Car and Bicycle both have an accelerate method, code can call accelerate on either without knowing which kind of vehicle it has, and the right version runs automatically. Polymorphism lets programmers write code that works with whole families of related types, adding new types later without changing the existing code.

### Abstraction
Abstraction means exposing only what matters and hiding the rest. A well-designed class shows its users a clean interface and hides its internal complexity behind it. You can drive a car without knowing how its engine works — and in the same way, you can use a well-designed object without knowing its internals.

### Why It Matters
OOP became dominant because it models the real world in a way humans find natural: things have properties and behaviors, and things come in families. Large software systems with millions of lines of code would be nearly impossible to manage without the organizing ideas of classes, encapsulation, and polymorphism. OOP is not the only way to program — functional and procedural styles have their own strengths — but it remains one of the most influential ideas in software engineering.`,
  },

  // ----------------------------------------------------------------
  // 7. BINARY, BITS, AND BYTES
  // ----------------------------------------------------------------
  {
    id: 'computing-binary-bits',
    patterns: [/\b(binary|bit|bits|byte|bytes|hexadecimal|hex|binary number|base 2|base 2|ascii|unicode|encoding|machine representation|0s and 1s|two state)\b/i],
    keywords: ['binary', 'bit', 'byte', 'hexadecimal', 'hex', 'ascii', 'unicode', 'encoding', 'base 2'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `At the lowest level, every computer is a vast collection of switches. Each switch can be on or off — two states, nothing more. From this simple foundation, every number, letter, image, song, and program is built. The two-state system is called binary, and it is the alphabet of all digital computing.

### Bits and Bytes
A single binary digit — one on/off value — is called a bit. A bit can hold either 0 or 1. Group eight bits together and you get a byte, which can represent 256 distinct values (from 00000000 to 11111111). Bytes are the basic unit of memory and storage: a kilobyte is about a thousand bytes, a megabyte about a million, a gigabyte about a billion, and a terabyte about a trillion. When you buy a phone with 256 gigabytes of storage, you are buying roughly 256 billion bytes — about two trillion individual bits.

### Why Binary
Computers use binary because electronic switches are easiest to build reliably with two states. A transistor can be off (0) or on (1), and the gap between these states is wide enough to tolerate noise and manufacturing variation. Designs with more than two states were tried in early computing, but they were far more error-prone. Binary won because it is robust: a voltage is either clearly above a threshold or clearly below it, with little ambiguity.

### Representing Numbers
In decimal (base 10), each position represents a power of 10 — the number 327 means three hundreds, plus two tens, plus seven ones. In binary (base 2), each position represents a power of 2 — the number 1011 means one eight, plus zero fours, plus one two, plus one one, which equals eleven. Any integer can be written in binary, and the same idea extends to fractions and negative numbers using a few extra conventions.

### Hexadecimal
Hexadecimal (hex) is base 16, using the digits 0-9 and the letters A-F. One hex digit corresponds exactly to four bits, so a byte is just two hex digits. Hex is a compact, human-friendly way to write binary: the byte 11111111 is FF in hex, and the color white on a web page is written as #FFFFFF. Programmers use hex constantly for memory addresses, color codes, and machine-code dumps.

### Text, Images, and Sound
Binary represents everything through agreed encoding schemes. Text uses ASCII or Unicode, where each character maps to a number — the letter A is 65, the digit 0 is 48, and Unicode extends this to cover essentially every writing system in the world. Images are grids of pixels, each pixel storing its color as binary numbers for red, green, and blue. Sound is a sequence of amplitude samples, each stored as a binary number. Video and games combine all of these, layered on top of compression algorithms that pack the bits more tightly.

### Why It Matters
Understanding binary is the doorway to understanding what a computer really is. It is not a clever machine that understands English or pictures — it is a trillion tiny switches, and every meaning we assign to its output is an agreement among humans about how to interpret patterns of ones and zeros. That insight demystifies computing and makes the rest of the field approachable.`,
  },

  // ----------------------------------------------------------------
  // 8. THE INTERNET AND THE WEB
  // ----------------------------------------------------------------
  {
    id: 'computing-internet-web',
    patterns: [/\b(internet|web|world wide web|http|https|tcp\/?ip|dns|domain name|browser|browsers|server|servers|client|url|web page|website|how the internet works|how websites load)\b/i],
    keywords: ['internet', 'web', 'http', 'https', 'tcp/ip', 'dns', 'domain', 'browser', 'server', 'client', 'url'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `The Internet is a global network of networks — millions of computers and cables and wireless links, all cooperating to move data from one place to another. The World Wide Web is the most familiar service that runs on top of it, but the two are not the same thing: the Internet is the infrastructure, and the Web is one collection of applications built on that infrastructure.

### The Layered Stack
Internet communication is organized in layers. At the bottom is the physical layer — the actual wires, fiber-optic cables, and radio links that carry signals. Above that, the Internet Protocol (IP) gives every device a numeric address and routes packets of data hop by hop toward their destination. The Transmission Control Protocol (TCP) sits on top of IP and provides reliable, ordered delivery — if a packet is lost or arrives out of order, TCP notices and fixes it. On top of TCP sit application protocols like HTTP (for the web), SMTP (for email), and FTP (for file transfer). This layered design is why the Internet has been able to grow and change for fifty years without breaking.

### DNS — The Address Book
Humans remember names like example.com, but computers need numeric IP addresses like 93.184.216.34. The Domain Name System (DNS) is a global, distributed lookup service that translates human-friendly names into IP addresses. When you type a URL, your computer first asks a DNS server for the address. That lookup happens in milliseconds, and without it the web as we know it could not work.

### HTTP and URLs
The HyperText Transfer Protocol (HTTP) is the language web browsers and web servers use to talk to each other. A URL (Uniform Resource Locator) identifies a specific resource — for example, https://example.com/page.html. The browser opens a TCP connection to the server, sends an HTTP request specifying which resource it wants, and the server responds with the content plus a status code (200 for success, 404 for not found, and so on). HTTPS is the encrypted version of HTTP, which we will return to in the security section.

### Browsers and Servers
A web browser is a client — software on your device that sends requests and renders the responses. A web server is a program running on a remote machine that listens for requests and sends back web pages, images, and data. When you open a page, your browser sends a request for the HTML document, then sends more requests for the images, stylesheets, and scripts that the HTML references. The browser parses each piece, builds the page on screen, and runs any JavaScript that came with it.

### Why It Matters
Almost every modern activity — communication, banking, education, entertainment, government — depends on the Internet. Understanding the basics of TCP/IP, DNS, and HTTP turns the network from a mysterious cloud into a comprehensible system of cooperating protocols. Once the model is clear, debugging connectivity problems, building websites, and reasoning about security all become far more approachable.`,
  },

  // ----------------------------------------------------------------
  // 9. DATABASES
  // ----------------------------------------------------------------
  {
    id: 'computing-databases',
    patterns: [/\b(database|databases|sql|relational database|nosql|table|tables|query|queries|index|indexes|acid|transaction|transactions|dbms|schema|primary key|foreign key)\b/i],
    keywords: ['database', 'sql', 'relational', 'nosql', 'table', 'query', 'index', 'acid', 'transaction', 'schema'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `A database is an organized collection of data, stored so that it can be queried, updated, and managed efficiently. Almost every application you use — your bank, your social network, your email, your phone's contacts — is backed by a database. The software that manages a database is called a Database Management System (DBMS), and choosing the right kind of DBMS is one of the most consequential design decisions an application can make.

### Relational Databases and SQL
The dominant family of databases for fifty years has been relational databases, which store data in tables. A table is like a spreadsheet: rows are records, columns are fields, and every row has the same shape. The "relational" part comes from links between tables — a Customers table and an Orders table are connected by a customer ID field that appears in both. SQL (Structured Query Language) is the standard language for working with relational databases. A query like "SELECT name, total FROM Orders WHERE total > 100" finds matching rows in plain, declarative English-like syntax. PostgreSQL, MySQL, SQLite, Oracle, and SQL Server are all relational databases.

### Indexes
Without help, finding rows that match a condition requires scanning the entire table, which is slow for large datasets. An index is an auxiliary data structure (usually a tree) that lets the database jump directly to the matching rows, the way a book's index lets you jump to a topic without reading every page. Indexes make reads dramatically faster, but they take extra space and slow down writes slightly, because every index must also be updated. Good index design is one of the most practical skills in database engineering.

### ACID Transactions
When multiple operations must succeed or fail together, databases use transactions. A classic example is transferring money between accounts: the withdrawal and the deposit must both happen, or neither — never just one. The ACID properties describe what a reliable transaction guarantees: Atomicity (all or nothing), Consistency (the database moves from one valid state to another), Isolation (concurrent transactions do not interfere), and Durability (once committed, the change survives crashes). Relational databases are famous for strong ACID guarantees.

### NoSQL Databases
NoSQL is a broad label for databases that relax some of the relational rules to gain flexibility or scale. Document databases like MongoDB store flexible JSON-like records instead of rigid tables. Key-value stores like Redis are ultra-fast and simple. Column-family stores like Cassandra handle massive write throughput across many servers. Graph databases like Neo4j specialize in connected data, such as social networks. NoSQL databases often trade strict consistency for higher availability and scale, a trade-off formalized in the CAP theorem.

### Why It Matters
Data is the long-lived asset of most applications — code can be rewritten, but data must be preserved. A well-designed database protects that data from corruption, allows fast queries as the dataset grows, and scales to handle more users. The choice between relational and NoSQL, the design of schemas and indexes, and the discipline of transactions are the difference between an application that runs smoothly at scale and one that collapses under its own data.`,
  },

  // ----------------------------------------------------------------
  // 10. OPERATING SYSTEMS
  // ----------------------------------------------------------------
  {
    id: 'computing-operating-systems',
    patterns: [/\b(operating system|os|kernel|process|processes|memory management|file system|filesystem|linux|windows|macos|android|ios|scheduler|device driver|virtual memory)\b/i],
    keywords: ['operating system', 'os', 'kernel', 'process', 'memory management', 'file system', 'linux', 'windows', 'macos', 'android'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `An operating system (OS) is the foundational software that manages a computer's hardware and provides the services that all other programs rely on. Every general-purpose computer — laptop, phone, server, even most cars — runs an operating system. Windows, macOS, Linux, Android, and iOS are all operating systems, and despite their differences they all solve the same fundamental problems.

### The Kernel
At the heart of every operating system is the kernel, the privileged core that has direct access to the hardware. The kernel decides which program runs on the CPU at each moment, mediates access to memory and devices, and enforces security boundaries so one program cannot crash another. Everything else — the user interface, the file manager, the web browser — runs as a less-privileged process on top of the kernel, requesting services through system calls.

### Process Management
A modern computer runs hundreds of processes seemingly at once: your browser, your music player, your email client, dozens of background services. On a typical machine with only a few CPU cores, the kernel achieves this illusion through scheduling — rapidly switching the CPU between processes, many times per second. Each process gets a time slice, then is paused while another runs, and the state of each is saved and restored so it does not notice the interruption. The scheduler's job is to keep the system responsive and fair while making good use of every CPU cycle.

### Memory Management
Each process needs memory, and each must believe it has the machine's memory to itself. The OS provides this illusion through virtual memory: every process gets its own private address space, and the OS (with help from the CPU's memory management unit) translates these virtual addresses to physical ones. If physical memory fills up, the OS can move inactive pages to disk (a process called swapping), letting programs use more memory than the machine physically has — at the cost of speed when those pages are needed again.

### File Systems
Without a file system, a disk would be a sea of unstructured bytes. The file system organizes storage into named files arranged in directories, tracks which blocks on disk belong to which file, and records metadata like creation time and permissions. Common file systems include NTFS on Windows, APFS on macOS, and ext4 on Linux. The OS presents all of them through a uniform interface — open, read, write, close — so applications do not need to know which file system is underneath.

### Device Drivers and User Interfaces
Hardware comes in endless variety — keyboards, displays, printers, network cards — and the OS abstracts this variety through device drivers, small modules that know how to talk to a specific piece of hardware. On top of all this, the OS provides a user interface: a graphical desktop with windows and icons (Windows, macOS, GNOME on Linux) or a command-line shell where the user types commands. The interface is what users see, but it is the thinnest layer on top of the deep machinery below.

### Why It Matters
The operating system is the stage on which all software performs. Understanding what an OS does — scheduling, memory, file systems, security — explains why apps behave the way they do, why some crashes take down the whole machine, and why a phone with the same hardware can feel completely different depending on whether it runs Android or iOS. The OS is the part of the computer that turns hardware into a usable machine.`,
  },

  // ----------------------------------------------------------------
  // 11. ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING
  // ----------------------------------------------------------------
  {
    id: 'computing-ai-ml-basics',
    patterns: [/\b(artificial intelligence|ai|machine learning|ml|neural network|neural networks|deep learning|model training|training data|supervised learning|unsupervised learning|reinforcement learning|inference|model|algorithm training)\b/i],
    keywords: ['artificial intelligence', 'ai', 'machine learning', 'neural network', 'deep learning', 'training', 'supervised', 'unsupervised', 'reinforcement', 'inference'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Artificial intelligence (AI) is the field of building systems that perform tasks normally requiring human intelligence — recognizing images, understanding language, making decisions, learning from experience. Within AI, machine learning (ML) is the dominant modern approach: instead of programming explicit rules, we feed a system many examples and let it learn the patterns itself. The explosion of AI in the last decade is mostly the story of machine learning, especially one technique called deep learning.

### Traditional AI vs Machine Learning
In traditional programming, a human writes explicit rules: if the email contains these words, mark it as spam. This works for simple problems but breaks down when the patterns are too subtle or too numerous to write down by hand. Machine learning flips the recipe: instead of writing the rules, we collect a large set of labeled examples (spam and not-spam emails) and let an algorithm discover the rules. The output of this training process is called a model — a statistical pattern that can classify new, unseen examples.

### Supervised, Unsupervised, and Reinforcement Learning
Machine learning comes in several flavors. In supervised learning, the training data includes the correct answer for each example — a labeled dataset of photos with the animal in each one identified. The model learns to map inputs to outputs. In unsupervised learning, the data has no labels, and the algorithm finds structure on its own — clustering similar customers together, for instance, or detecting anomalies. In reinforcement learning, an agent learns by trial and error in an environment, receiving rewards or penalties for its actions. Reinforcement learning is how systems learn to play games like chess and Go at superhuman levels.

### Neural Networks and Deep Learning
A neural network is a particular kind of model loosely inspired by the neurons in biological brains. It consists of layers of simple computing units (called neurons), each connected to the next layer. Input goes in at one end, is transformed through successive layers, and a result comes out at the other. "Deep" learning simply means networks with many layers, which can learn hierarchical features — early layers detect edges, later layers detect shapes, and final layers detect objects like faces or cars. Deep learning has produced dramatic breakthroughs in vision, speech, and language over the past fifteen years, powered by large datasets, fast GPUs, and improved training algorithms.

### Training and Inference
Using a model has two phases. Training is the expensive, iterative process of adjusting the model's parameters so its predictions match the training data as closely as possible. Training can take days, weeks, or months on huge datasets. Inference is the cheap, fast process of using the trained model to make predictions on new data — answering a question, recognizing a face, translating a sentence. Most AI applications do training rarely (or never, if they use a pre-trained model) and do inference constantly.

### Why It Matters
Machine learning has quietly become part of everyday life — search rankings, recommendation systems, voice assistants, fraud detection, medical image analysis, autonomous vehicles. Understanding the basics — that these systems learn patterns from data rather than following hand-written rules — explains both their remarkable capabilities and their failures, including the way they can absorb and amplify biases present in their training data. The technology is powerful, and using it responsibly requires understanding how it works.`,
  },

  // ----------------------------------------------------------------
  // 12. SECURITY AND CRYPTOGRAPHY
  // ----------------------------------------------------------------
  {
    id: 'computing-security-cryptography',
    patterns: [/\b(security|cybersecurity|cryptography|encryption|encrypt|decrypt|decryption|symmetric|asymmetric|public key|private key|hash|hashing|password|passwords|https|ssl|tls|certificate|digital signature|cipher)\b/i],
    keywords: ['security', 'cryptography', 'encryption', 'symmetric', 'asymmetric', 'public key', 'hash', 'password', 'https', 'tls', 'digital signature'],
    intent: 'factual_question',
    topic: 'computing',
    response: () => `Computer security is the practice of protecting systems and data from unauthorized access, tampering, and damage. Cryptography — the science of writing and breaking secret codes — is its most powerful tool. Together, security and cryptography make modern digital life possible: without them, online banking, private messaging, and secure email would not exist, because every transmission would be readable by anyone who intercepted it.

### Encryption: Symmetric and Asymmetric
Encryption is the process of scrambling data so that only someone with the right key can read it. There are two main kinds. In symmetric encryption, the same key is used to encrypt and decrypt — fast and simple, but the sender and receiver must somehow share the key in advance, which is itself a hard problem. AES (Advanced Encryption Standard) is the most widely used symmetric cipher today. In asymmetric encryption, also called public-key encryption, each party has a pair of keys: a public key that anyone can know and a private key that is kept secret. Data encrypted with the public key can only be decrypted with the matching private key. This eliminates the key-sharing problem — you can publish your public key freely, and anyone can send you a secret message that only you can read. RSA and elliptic-curve cryptography are the most common asymmetric systems.

### Hashing
A hash function takes any input and produces a fixed-size output, called a hash or digest, that acts as a fingerprint of the input. A good hash function is one-way: it is easy to compute the hash from the input, but infeasible to recover the input from the hash. It is also collision-resistant: it is infeasible to find two different inputs that produce the same hash. SHA-256 is a widely used hash function. Hashing is how password systems work: instead of storing your password directly, a system stores its hash. When you log in, the system hashes the password you type and compares it to the stored hash. Even if an attacker steals the hash file, they cannot easily recover the passwords.

### Passwords and Salting
Weak passwords are the most common security failure. Attackers who steal a password file can run a dictionary attack, hashing common words and comparing the results. The defense is salting: before hashing, the system adds a unique random value (the salt) to each password. Two users with the same password then have different hashes, and precomputed tables of common password hashes become useless. Modern systems also use slow, deliberately expensive hash functions like bcrypt to make brute-force attacks take impractically long.

### HTTPS and TLS
When you visit a website with https://, the connection is protected by Transport Layer Security (TLS). TLS combines all the cryptographic ideas above. It uses asymmetric encryption to negotiate a shared secret at the start of the session, then switches to faster symmetric encryption for the bulk of the data. It uses certificates — digitally signed documents that link a public key to a domain name — so your browser can verify it is talking to the real site and not an impostor. It uses hashing to detect any tampering with the data in transit. The padlock icon in your browser is the visible sign that all of this is working.

### Why It Matters
Every secure thing we do online — banking, shopping, private messaging, logging in, signing documents — depends on cryptography working correctly. The same techniques that protect legitimate users also protect attackers, which is why security is an ongoing arms race rather than a solved problem. Understanding the basics — keys, hashes, certificates, HTTPS — turns the abstract idea of "security" into a concrete set of mechanisms, and helps ordinary users make safer choices about passwords, links, and the data they share.`,
  },
]
