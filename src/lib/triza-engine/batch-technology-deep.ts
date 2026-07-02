/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — TECHNOLOGY DEEP (Batch 7-e)
 * ============================================================
 *
 *  Deeper subtopic entries for technology. These go one level
 *  below the foundational batch-technology.ts entries: CPU
 *  architecture, memory hierarchy, kernels, OSI/TCP-IP, HTTP
 *  and REST, SQL/NoSQL, cloud services, ML algorithms, deep
 *  learning internals, cryptography, blockchain mechanics,
 *  embedded/IoT systems, and renewable energy technology.
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries with specific
 *  subtopic tokens so TRIZA can match deeper questions
 *  without colliding with the broad batch-technology.ts
 *  triggers.
 *
 *  NO external LLM API is used. These are facts TRIZA has
 *  "learned" and will express in its own voice via the
 *  self-expression + narration engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const TECHNOLOGY_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. CPU ARCHITECTURE (VON NEUMANN, PIPELINING, CACHE)
  // ----------------------------------------------------------------
  {
    id: 'tech-deep-computer-architecture-cpu',
    patterns: [/\b(von neumann|instruction cycle|fetch decode execute|alu|control unit|cache hierarchy|l1 cache|l2 cache|l3 cache|pipelining|risc|cisc|clock speed|branch prediction|superscalar|multicore processor)\b/i],
    keywords: ['von neumann', 'instruction cycle', 'fetch decode execute', 'alu', 'control unit', 'cache hierarchy', 'l1 cache', 'l2 cache', 'l3 cache', 'pipelining', 'risc', 'cisc', 'clock speed', 'multicore'],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `A modern CPU is the silicon brain of a computer, executing billions of tiny instructions per second. It follows the von Neumann architecture, proposed by John von Neumann in 1945, where program instructions and data share the same memory and the processor fetches, decodes, and executes one instruction at a time in a continuous cycle.

### The Instruction Cycle
Every CPU repeats three core steps. Fetch retrieves the next instruction from memory at the address held by the program counter. Decode translates the binary instruction into electrical control signals that tell the processor what operation to perform. Execute then carries out the operation, perhaps adding two registers, reading from memory, or jumping to a new address. Modern processors pipeline this cycle, so while one instruction is being executed, the next is being decoded and the one after is being fetched — overlapping stages like an assembly line.

### Inside the CPU
The arithmetic logic unit (ALU) performs integer arithmetic and bitwise logic. The control unit orchestrates the instruction cycle and routes data between registers, the ALU, and memory. Registers are tiny ultra-fast storage slots inside the CPU — the program counter, instruction register, and general-purpose registers like the accumulator. Floating-point math is handled by a separate floating-point unit, and modern chips also include vector units for parallel multimedia and AI workloads.

### Cache Hierarchy
Because main memory is far slower than the CPU, every modern processor ships with a hierarchy of caches built from static RAM. L1 cache is smallest (32 to 64 KB per core) but answers in about one nanosecond. L2 cache is larger (256 KB to 2 MB) with a few nanoseconds latency. L3 cache is shared across cores (8 to 64 MB) and takes a dozen or so nanoseconds. When the CPU needs data, it checks L1, then L2, then L3, then main RAM — a cache hit avoids the slow trip to RAM, and good locality keeps hits high.

### RISC vs CISC and Multicore
Two design philosophies shaped CPU history. CISC (complex instruction set computer) chips like x86 offer rich instructions that do a lot per cycle, reducing code size when memory was scarce. RISC (reduced instruction set computer) chips like ARM use simpler instructions that pipeline and parallelize cleanly, which is why ARM dominates phones and laptops. As clock speeds hit power walls around 4 GHz, vendors stopped pushing frequency and added more cores instead — a quad-core processor runs four instruction streams in parallel, requiring software threads to use them well.

### Why It Matters
Understanding CPU architecture explains why software is slow or fast, why ARM laptops now rival x86, why caches dominate real-world performance, and why parallel programming is hard. Every database, game, browser, and AI model ultimately runs as fetch-decode-execute cycles on silicon, and the architecture choices made by Intel, AMD, Apple, and ARM shape what computers can do for the next decade.`,
  },

  // ----------------------------------------------------------------
  // 2. MEMORY AND STORAGE HIERARCHY
  // ----------------------------------------------------------------
  {
    id: 'tech-deep-memory-storage-hierarchy',
    patterns: [/\b(memory hierarchy|dram|sram|rom|nvme|ssd vs hdd|virtual memory|paging|page fault|swap space|storage class|register file|memory latency|ddr4|ddr5)\b/i],
    keywords: ['memory hierarchy', 'dram', 'sram', 'rom', 'nvme', 'ssd vs hdd', 'virtual memory', 'paging', 'page fault', 'swap space', 'storage class', 'register file'],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `Computers store data on a spectrum from very fast and tiny to very slow and huge. This memory hierarchy exists because there is a fundamental tradeoff: speed costs money and money buys capacity. A designer's job is to place the right data on the right level so the CPU rarely waits.

### Registers and Cache
At the top sit CPU registers — a handful of 64-bit slots that respond in a single clock cycle. Below them is cache built from SRAM, organised in L1, L2, and L3 layers. SRAM is fast but bulky: each bit needs six transistors. Cache is small precisely because SRAM is expensive and power-hungry, but its speed justifies the cost for hot data.

### Main Memory (DRAM)
Main memory uses dynamic RAM, where each bit is a single transistor plus a tiny capacitor. DRAM is denser and cheaper than SRAM, so laptops ship with 8 to 64 GB of it, but the capacitors leak and must be refreshed thousands of times per second. DDR4 and DDR5 are the current generations, with DDR5 doubling bandwidth and improving power efficiency. Latency is roughly 50 to 100 nanoseconds, hundreds of times slower than L1 cache.

### Persistent Storage
Persistent storage keeps data without power. Hard disk drives (HDDs) use spinning magnetic platters and mechanical read heads, offering terabytes cheaply but with milliseconds of latency. Solid-state drives (SSDs) store bits in NAND flash memory and answer in tens of microseconds, with no moving parts. NVMe SSDs connect directly over the PCIe bus and reach gigabytes per second, erasing much of the gap between RAM and disk. ROM (read-only memory) holds firmware like the BIOS or UEFI that boots the machine before any disk is loaded.

### Virtual Memory and Paging
Operating systems give each program the illusion of a private, contiguous address space using virtual memory. The CPU's memory management unit translates virtual addresses to physical ones through page tables, typically in 4 KB pages. When a program accesses a page not currently in RAM, the hardware raises a page fault and the OS fetches it from disk, possibly writing a victim page to swap space first. Paging lets a laptop run more programs than RAM would otherwise allow and isolates processes from one another.

### Access Speed vs Cost Tradeoff
Moving down the hierarchy, latency rises by orders of magnitude while cost per gigabyte falls by orders of magnitude. Registers respond in nanoseconds, caches in a few nanoseconds, DRAM in tens of nanoseconds, SSDs in microseconds, and HDDs in milliseconds — a span of about one million. Smart software exploits this by keeping working sets small, prefetching data, and batching disk writes.

### Why It Matters
The memory hierarchy is the single biggest source of real-world performance. Two algorithms with the same big-O complexity can differ a thousandfold in speed depending on how they touch memory. Understanding caches, paging, and SSD latency explains why databases use B-trees, why games pre-load assets, and why AI training is so often memory-bandwidth bound.`,
  },

  // ----------------------------------------------------------------
  // 3. OPERATING SYSTEMS AND KERNELS
  // ----------------------------------------------------------------
  {
    id: 'tech-deep-operating-systems-kernels',
    patterns: [/\b(kernel|monolithic kernel|microkernel|process scheduling|context switch|file system|ext4|ntfs|apfs|system call|user mode|kernel mode|posix|linux kernel|windows nt|scheduler)\b/i],
    keywords: ['kernel', 'monolithic kernel', 'microkernel', 'process scheduling', 'context switch', 'file system', 'ext4', 'ntfs', 'apfs', 'system call', 'user mode', 'kernel mode', 'posix', 'linux kernel'],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `An operating system is the layer of software between hardware and applications. It manages the CPU, memory, disks, network, and devices, and it provides a stable interface so the same program runs on countless hardware configurations. At the heart of every OS sits the kernel, the privileged core that runs with full hardware access.

### User Mode and Kernel Mode
Modern CPUs support at least two privilege levels. User applications run in user mode, where they cannot touch hardware directly or access another process's memory. The kernel runs in kernel mode, with full access. When an application needs to read a file or send a packet, it makes a system call, which is a controlled trap into the kernel. The kernel validates the request, performs the privileged operation, and returns the result. This boundary protects the system from buggy or malicious programs.

### Monolithic vs Microkernel
Two architectural philosophies divide kernel design. A monolithic kernel — like the Linux kernel — bundles the scheduler, memory manager, file systems, network stack, and device drivers into one large privileged program running in kernel mode. Performance is excellent because everything communicates through direct function calls. A microkernel keeps only the essentials (scheduling, IPC, basic memory) in kernel mode and runs file systems, drivers, and networking as separate user-space processes. Microkernels are cleaner and more robust — a crashed driver does not crash the system — but the extra message passing adds overhead.

### Process Scheduling
The scheduler decides which process runs on which core and for how long. Each process gets a time slice of a few milliseconds; when the slice ends, a timer interrupt triggers a context switch that saves the current registers and loads the next process. Linux uses the Completely Fair Scheduler, a variant of fair-share scheduling, while Windows and macOS have their own schedulers. Good scheduling balances responsiveness for interactive apps, throughput for batch jobs, and fairness across users.

### Memory Management and File Systems
The kernel's memory manager hands each process a virtual address space, maps pages to physical RAM, and swaps cold pages to disk when memory fills up. The file system layer organises persistent storage into files and directories. Linux defaults to ext4, a robust journaling file system. Windows uses NTFS, which supports ACLs, compression, and encryption. macOS ships APFS, designed for SSDs with snapshots and cloning. All three use journals to record metadata changes before committing them, so a crash never leaves the file system corrupted.

### Popular Operating Systems and POSIX
Linux dominates servers, Android phones, and most of the cloud. Windows NT powers desktops and enterprise laptops. macOS and iOS share a Darwin kernel lineage. The POSIX standard defines a common Unix-like API, so code written for Linux often compiles on macOS and BSD with minor changes, while Windows offers a POSIX layer for compatibility.

### Why It Matters
The OS is the unseen referee that makes multitasking, security, and hardware abstraction possible. Every app developer depends on its guarantees, every systems programmer wrestles with its abstractions, and every security vulnerability in the kernel affects billions of devices. Learning how kernels work is the doorway to writing faster software, debugging hard problems, and understanding the platforms that run the modern world.`,
  },

  // ----------------------------------------------------------------
  // 4. NETWORKING: OSI AND TCP/IP
  // ----------------------------------------------------------------
  {
    id: 'tech-deep-networking-osi-tcpip',
    patterns: [/\b(osi model|osi layer|tcp.ip model|subnetting|nat|firewall|cdn|latency vs bandwidth|routing table|switching|packet switching|mac address|arp|bgp|tcp handshake|udp protocol)\b/i],
    keywords: ['osi model', 'osi layer', 'tcp/ip model', 'subnetting', 'nat', 'firewall', 'cdn', 'latency vs bandwidth', 'routing table', 'switching', 'mac address', 'arp', 'bgp', 'tcp handshake', 'udp protocol'],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `Computer networks are built in layers, each one solving a specific problem and handing results to the next. Two layering models dominate the field: the seven-layer OSI reference model used in textbooks and certification exams, and the four-layer TCP/IP model that actually runs the Internet. Both describe the same idea — split a hard problem into manageable pieces.

### The OSI Seven Layers
From bottom to top, the physical layer transmits raw bits over copper, fiber, or radio. The data link layer frames those bits and uses MAC addresses to deliver them between adjacent nodes (Ethernet, Wi-Fi). The network layer routes packets across many hops using IP addresses. The transport layer provides end-to-end reliability with TCP or fast best-effort delivery with UDP. The session layer manages dialogues between hosts. The presentation layer handles encoding, compression, and encryption (TLS lives here). The application layer exposes services like HTTP, DNS, and SMTP to user programs.

### The TCP/IP Four Layers
TCP/IP collapses the upper three OSI layers into one application layer and folds presentation and session concerns into the apps themselves. Its four layers are link, internet, transport, and application. The internet layer is where IP lives, with IPv4 still carrying most traffic and IPv6 slowly expanding to handle the address exhaustion problem. Each layer adds its own header to the data, and the receiver strips headers back off in reverse order.

### Addressing, ARP, and Routing
Every network interface has a hardware MAC address burned in at the factory, while IP addresses are assigned by network administrators. ARP bridges the two by mapping an IP to a MAC on a local segment. Routers use routing tables built statically or learned dynamically through BGP and OSPF to choose the next hop for each packet. Subnetting splits a network block into smaller blocks using a subnet mask, letting organisations carve address space into departments. NAT (network address translation) lets many private addresses share one public IP, which is why every home router speaks NAT.

### Switching, Firewalls, and CDNs
Switches forward frames within a local network by MAC address, while routers forward packets between networks by IP address. Firewalls filter traffic by IP, port, and protocol rules — stateful firewalls track connection state and modern next-generation firewalls inspect application-layer content. Content delivery networks (CDNs) like Cloudflare and Akamai cache copies of web content at edge locations worldwide, cutting latency for end users and absorbing traffic spikes.

### Latency vs Bandwidth
Bandwidth is how many bits per second a link can carry, while latency is how long the first bit takes to arrive. A fibre link has enormous bandwidth but still obeys the speed of light, so transcontinental round trips cost 50 to 200 milliseconds. Real-world performance depends on both: high bandwidth with high latency makes large transfers feel slow, and low bandwidth with low latency makes video calls stutter.

### Why It Matters
Networking is the substrate of every digital service. Knowing how packets route, how TCP establishes connections with its three-way handshake, how NAT and firewalls shape traffic, and how CDNs cut latency explains why a website is fast or slow, why a video call lags, and why a corporate VPN blocks certain apps. These layers are also the foundation of every cybersecurity defence and every cloud architecture.`,
  },

  // ----------------------------------------------------------------
  // 5. HTTP, HTTPS, AND REST APIs
  // ----------------------------------------------------------------
  {
    id: 'tech-deep-http-https-rest-apis',
    patterns: [/\b(http method|https|tls handshake|rest api|restful|jwt|oauth|graphql|http status code|http header|get post put delete|idempotent|bearer token|api endpoint|cors)\b/i],
    keywords: ['http method', 'https', 'tls handshake', 'rest api', 'restful', 'jwt', 'oauth', 'graphql', 'http status code', 'http header', 'get post put delete', 'idempotent', 'bearer token', 'api endpoint', 'cors'],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `The Hypertext Transfer Protocol (HTTP) is the language of the web. Every browser navigation, every mobile app data fetch, and every API call between services speaks HTTP. Version 1.1 has carried most traffic for two decades, while HTTP/2 and HTTP/3 add multiplexing and QUIC transport for better performance.

### HTTP Methods and Semantics
HTTP defines several request methods, each with a clear meaning. GET retrieves a resource without changing server state and is therefore safe and idempotent. POST creates a new resource, with the server assigning the URL. PUT replaces a resource at a known URL and is idempotent — calling it twice leaves the same state. DELETE removes a resource and is also idempotent. PATCH partially updates a resource. HEAD fetches only headers, and OPTIONS describes what methods a server supports, which is how CORS preflight checks work.

### Status Codes and Headers
Every response carries a three-digit status code. Codes in the 200s mean success, with 200 OK and 201 Created being most common. The 300s handle redirection, with 301 permanent and 302 temporary. The 400s signal client errors — 400 bad request, 401 unauthenticated, 403 forbidden, 404 not found, 429 too many requests. The 500s are server errors, with 500 internal error and 503 service unavailable being the most seen. Headers carry metadata like content type, cache policy, cookies, and authentication tokens, and they shape caching, compression, and content negotiation.

### HTTPS and the TLS Handshake
HTTPS is HTTP layered over Transport Layer Security (TLS). The handshake begins with the client hello, listing supported cipher suites. The server responds with its certificate, signed by a certificate authority, and chooses a cipher. The two sides derive a shared session key using either RSA or ephemeral Diffie-Hellman, then encrypt all subsequent traffic with symmetric ciphers like AES. TLS 1.3 collapses the handshake to one round trip and removes older weak ciphers, making modern HTTPS both faster and more secure.

### REST Principles
Representational State Transfer (REST) is a style for designing web APIs over HTTP. A REST API exposes resources as URLs, uses standard HTTP methods to act on them, returns JSON representations, and is stateless — every request carries everything the server needs. A well-designed REST API for an online store might list products at GET /products, create an order with POST /orders, and update it with PUT /orders/42. Pagination, filtering, and versioning are handled through query strings and URL paths.

### Authentication: JWT and OAuth
Stateless APIs cannot keep server-side sessions, so they authenticate with tokens. A JSON Web Token (JWT) is a signed, base64-encoded payload that the client sends as a bearer header. The server verifies the signature and trusts the claims without storing any session state. OAuth 2.0 lets a user grant a third-party app limited access to their data on another service without sharing their password, returning short-lived access tokens and longer-lived refresh tokens.

### GraphQL vs REST
GraphQL, introduced by Facebook, offers an alternative where the client sends a single query describing exactly which fields it wants, and the server returns a shaped JSON response. GraphQL avoids over-fetching and under-fetching and aggregates multiple resources in one round trip, while REST keeps each resource at a predictable URL with simpler caching.

### Why It Matters
HTTP and REST are the lingua franca of modern software. Mobile apps, single-page web apps, microservices, and third-party integrations all communicate over HTTPS with JSON payloads. Knowing methods, status codes, TLS, JWT, and OAuth is the price of entry for any web developer, and the choice between REST and GraphQL shapes how an entire platform evolves.`,
  },

  // ----------------------------------------------------------------
  // 6. DATABASES: SQL AND NOSQL
  // ----------------------------------------------------------------
  {
    id: 'tech-deep-databases-sql-nosql',
    patterns: [/\b(sql database|nosql|postgresql|mysql|couchdb|ravendb|redis|cassandra|neo4j|cap theorem|acid transaction|normal form|database index|inner join|graph database|key value store|document database|sharding)\b/i],
    keywords: ['sql database', 'nosql', 'postgresql', 'mysql', 'couchdb', 'ravendb', 'redis', 'cassandra', 'neo4j', 'cap theorem', 'acid transaction', 'normal form', 'database index', 'inner join', 'graph database', 'key value store', 'document database', 'sharding'],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `Databases store structured information so applications can query and update it reliably. The choice between SQL and NoSQL is not a bitter feud but an engineering decision based on the shape of the data, the consistency requirements, and the scale of the workload.

### Relational Databases and SQL
A relational database organises data into tables of rows and columns, with relationships expressed through foreign keys. SQL is the standardised language for querying and modifying these tables. PostgreSQL and MySQL are the dominant open-source relational engines, with PostgreSQL known for advanced features like JSON columns and full-text search, while MySQL favours speed and simplicity. Microsoft SQL Server and Oracle lead the enterprise market.

### ACID and Normal Forms
Relational databases traditionally guarantee ACID transactions: atomicity (all-or-nothing), consistency (constraints always hold), isolation (concurrent transactions appear serial), and durability (committed writes survive crashes). Designers normalise schemas into first, second, and third normal form to eliminate redundancy and update anomalies. Third normal form is the usual target — every non-key column depends only on the primary key.

### Indexes and Joins
Without an index, the database must scan every row in a table to find matches. An index is a B-tree (or hash) structure that lets the engine jump to matching rows in logarithmic time, at the cost of slower writes and extra storage. Composite indexes cover multiple columns and ordering. Joins combine rows from two tables on a common key — inner joins keep only matching rows, outer joins preserve unmatched rows, and self-joins relate a table to itself.

### NoSQL Families
NoSQL databases reject the one-size-fits-all relational model and specialise. Document databases like CouchDB and RavenDB store flexible JSON-like documents, ideal when records vary in shape. Key-value stores like Redis keep everything in memory for sub-millisecond reads and are perfect for caching and session storage. Wide-column stores like Cassandra spread trillions of rows across many nodes with linear scalability. Graph databases like Neo4j store nodes and edges and traverse relationships in milliseconds, which is why they power recommendation engines and fraud detection.

### The CAP Theorem
Distributed databases face a fundamental tradeoff described by the CAP theorem: consistency, availability, and partition tolerance — pick two. Because network partitions are unavoidable, real systems choose between CP (consistent under partition, like HBase) and AP (available under partition, like Cassandra). SQL databases traditionally favour strong consistency on a single node, while many NoSQL systems favour availability and eventual consistency.

### Transactions and Sharding
When a workload outgrows one machine, designers shard the data — splitting rows across nodes by a shard key, such as user ID. Sharding adds complexity because cross-shard transactions become expensive. NewSQL systems like CockroachDB and Google Spanner try to deliver SQL semantics with horizontal scalability by using distributed consensus protocols such as Raft or Paxos.

### Why It Matters
Almost every application is a thin layer over a database. Picking the right model — relational for transactions and complex joins, document for flexible schemas, key-value for speed, graph for relationships — determines whether the system scales or breaks. Indexing strategy, normalisation, and sharding choices made early in a project are expensive to reverse later, which is why database design sits at the centre of software architecture.`,
  },

  // ----------------------------------------------------------------
  // 7. CLOUD COMPUTING: AWS, AZURE, GCP
  // ----------------------------------------------------------------
  {
    id: 'tech-deep-cloud-computing-aws-azure',
    patterns: [/\b(ec2|s3|aws lambda|azure blob|kubernetes|docker container|serverless|auto scaling|availability zone|elastic load balancer|iaas|paas|saas|fargate|cloudfront|infrastructure as code)\b/i],
    keywords: ['ec2', 's3', 'aws lambda', 'azure blob', 'kubernetes', 'docker container', 'serverless', 'auto scaling', 'availability zone', 'elastic load balancer', 'iaas', 'paas', 'saas', 'fargate', 'cloudfront', 'infrastructure as code'],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `Cloud computing lets organisations rent computing power, storage, and services on demand from providers like Amazon Web Services, Microsoft Azure, and Google Cloud Platform, paying by the minute or by the gigabyte instead of buying hardware. This shift from capital expense to operating expense has reshaped how software is built and deployed.

### Service Models: IaaS, PaaS, SaaS
The three classic service models describe how much the provider manages. Infrastructure as a Service (IaaS) rents virtual machines, networks, and storage, with the customer managing the OS and applications — AWS EC2 and Azure Virtual Machines are examples. Platform as a Service (PaaS) adds a managed runtime so developers deploy code without patching servers, as with Google App Engine. Software as a Service (SaaS) delivers a finished application over the web, like Gmail or Salesforce.

### Core AWS, Azure, and GCP Services
Every cloud offers a similar core catalogue. Compute services include AWS EC2, Azure VMs, and Google Compute Engine for long-running servers, and AWS Lambda, Azure Functions, and Google Cloud Functions for serverless code that runs only on events. Object storage is served by Amazon S3, Azure Blob Storage, and Google Cloud Storage — durable, cheap, and accessible over HTTP. CDN edges like CloudFront, Azure CDN, and Cloud CDN cache content close to users worldwide.

### Virtualization vs Containers
Traditional cloud compute uses virtual machines, each running a full guest OS on top of a hypervisor. Containers offer a lighter alternative: they share the host kernel and isolate only the application and its libraries. Docker packaged containers into a standard image format, making them portable across laptops and cloud servers. Containers start in seconds instead of minutes and consume far less memory, which is why they dominate modern deployments.

### Kubernetes Orchestration
Running one container is easy; running thousands across many machines is not. Kubernetes, originally built at Google, schedules containers onto nodes, restarts failed ones, scales them on demand, and routes traffic through services and ingresses. A Kubernetes cluster has a control plane managing worker nodes, with deployments, replica sets, and pods as the abstractions developers use. Managed Kubernetes like EKS, AKS, and GKE removes the operational burden of running the control plane.

### Serverless and Auto Scaling
Serverless platforms like AWS Lambda run code in response to events — an HTTP request, a file upload, a database change — and charge only for execution time. No server is ever visible to the developer, and scaling from zero to thousands of concurrent requests is automatic. For long-running services, auto-scaling groups add or remove instances based on CPU, queue depth, or custom metrics, while an elastic load balancer spreads traffic across healthy instances.

### Cost Models and Tradeoffs
Cloud pricing includes on-demand (pay as you go), reserved instances (commit for a discount), and spot capacity (use spare capacity cheaply but accept preemption). Cost discipline matters: a misconfigured auto-scaling group can spend a year's budget overnight. Tools like AWS Cost Explorer and third-party FinOps platforms help teams track and forecast spend.

### Why It Matters
The cloud has become the default deployment target for startups and enterprises alike, enabling experiments to scale to millions of users without buying a single server. Understanding IaaS, PaaS, containers, Kubernetes, and serverless lets engineers pick the right abstraction for each workload, balance latency and cost, and design systems that survive regional outages. The cloud also concentrates enormous power in a few providers, making architecture choices a strategic concern for any software-driven business.`,
  },

  // ----------------------------------------------------------------
  // 8. MACHINE LEARNING ALGORITHMS
  // ----------------------------------------------------------------
  {
    id: 'tech-deep-machine-learning-algorithms',
    patterns: [/\b(linear regression|logistic regression|decision tree|random forest|k-means|gradient descent|overfitting|train test split|support vector machine|naive bayes|pca|silhouette score|hyperparameter|cross validation)\b/i],
    keywords: ['linear regression', 'logistic regression', 'decision tree', 'random forest', 'k-means', 'gradient descent', 'overfitting', 'train test split', 'support vector machine', 'naive bayes', 'pca', 'hyperparameter', 'cross validation'],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `Machine learning builds systems that improve their behaviour from data rather than from explicit programming. The discipline splits by the kind of feedback the algorithm receives: supervised learning trains on labelled examples, unsupervised learning finds structure in unlabelled data, and reinforcement learning agents learn from rewards earned through action.

### Supervised Learning: Regression and Classification
When the target is a continuous number — predicting house prices from square footage and location — the task is regression. Linear regression fits a straight line (or hyperplane) through the data by minimising the sum of squared errors between predictions and true values. When the target is a category — classifying emails as spam or not spam — the task is classification. Logistic regression squashes a linear combination of features through the sigmoid function to produce a probability, then thresholds it.

### Decision Trees and Ensemble Methods
A decision tree asks a series of yes-or-no questions about features and routes the example down a branch to a leaf prediction. Trees are interpretable but tend to overfit, so ensembles combine many trees. Random forests train hundreds of trees on bootstrap samples and average their predictions, reducing variance. Gradient boosting machines like XGBoost and LightGBM build trees sequentially, each correcting the errors of the previous, and dominate tabular-data competitions.

### Other Classical Algorithms
Support vector machines find the widest margin between classes and can map to high-dimensional feature spaces with kernel tricks. Naive Bayes uses Bayes' theorem with a strong independence assumption and works surprisingly well for text classification. K-nearest neighbours simply labels a point by the majority vote of its closest training examples.

### Unsupervised Learning and PCA
Without labels, algorithms search for structure. K-means clustering partitions data into k groups by iteratively assigning points to the nearest centroid and recomputing centroids. Hierarchical clustering builds a tree of nested clusters. Principal component analysis (PCA) projects high-dimensional data onto a smaller set of orthogonal axes that capture the most variance, useful for visualisation, compression, and feature engineering.

### Gradient Descent and Training
Most modern models are trained by gradient descent. The loss function measures how wrong the model is, and its gradient points in the direction of steepest increase. Update the parameters in the opposite direction, scaled by a learning rate, and the loss shrinks. Stochastic gradient descent uses small batches for speed, and optimisers like Adam adapt the step size per parameter.

### Overfitting and Validation
A model that memorises the training data often fails on new examples — this is overfitting. The standard defence is to split data into training, validation, and test sets. The training set fits parameters, the validation set tunes hyperparameters, and the test set provides an unbiased final estimate. Cross-validation rotates which fold is held out to use data more efficiently. Regularisation techniques like L1 and L2 penalties, dropout, and early stopping further curb overfitting.

### Why It Matters
Classical machine learning still powers credit scoring, fraud detection, recommendation systems, demand forecasting, and countless analytics pipelines where data is tabular and interpretability matters. Mastering regression, trees, ensembles, clustering, and proper validation is the foundation for any data scientist, and the same training-validation-regularisation discipline underpins the deep learning revolution that followed.`,
  },

  // ----------------------------------------------------------------
  // 9. DEEP LEARNING AND NEURAL NETWORKS
  // ----------------------------------------------------------------
  {
    id: 'tech-deep-deep-learning-neural-networks',
    patterns: [/\b(perceptron|activation function|relu|sigmoid|backpropagation|convolutional layer|pooling layer|recurrent neural network|lstm|attention mechanism|transformer architecture|generative adversarial|gan|batch normalization)\b/i],
    keywords: ['perceptron', 'activation function', 'relu', 'sigmoid', 'backpropagation', 'convolutional layer', 'pooling layer', 'recurrent neural network', 'lstm', 'attention mechanism', 'transformer architecture', 'generative adversarial', 'gan', 'batch normalization'],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `Deep learning is the branch of machine learning that uses neural networks with many layers. Inspired loosely by biological neurons but engineered for mathematics, deep networks have driven the last decade of AI breakthroughs in vision, speech, and language.

### The Perceptron and Activation Functions
The simplest neural unit is the perceptron: it computes a weighted sum of its inputs plus a bias, then applies an activation function. Early perceptrons used a step function, but modern networks use smooth nonlinear functions. The sigmoid squashes output into zero-to-one, useful for probabilities. The tanh maps to minus-one-to-one. The rectified linear unit (ReLU), defined as max of zero and the input, is the default for hidden layers because it is cheap to compute and avoids the vanishing-gradient problem that crippled early deep networks.

### Multilayer Networks and Backpropagation
Stacking perceptrons into layers — input, hidden, output — creates a multilayer perceptron. Training it requires backpropagation, the algorithm at the heart of deep learning since 1986. Backpropagation uses the chain rule of calculus to compute how much each weight contributed to the error, then gradient descent nudges the weights to reduce that error. Repeated over millions of examples, this loop teaches the network to map inputs to outputs.

### Convolutional Networks for Vision
Convolutional neural networks (CNNs) revolutionised image recognition. A convolutional layer slides small learnable filters across the image, producing feature maps that detect edges, textures, and shapes. Pooling layers downsample to reduce computation and add translation invariance. Stacking many convolutional layers yields hierarchical features — early layers see edges, middle layers see parts, late layers see objects. Architectures like ResNet, with skip connections that let gradients flow through hundreds of layers, set the standard for image classification.

### Recurrent Networks and LSTM for Sequences
For sequences — text, speech, time series — recurrent neural networks (RNNs) process one element at a time and carry a hidden state forward. Vanilla RNNs struggle to remember long-range dependencies because gradients vanish or explode over many steps. The long short-term memory (LSTM) cell solves this with input, output, and forget gates that regulate what enters and leaves the memory, allowing the network to learn dependencies hundreds of steps apart.

### Attention and Transformers
The transformer architecture, introduced in 2017, replaced recurrence with the attention mechanism. Self-attention lets every position in a sequence attend to every other position, weighted by learned affinities. Stacked attention layers, combined with position encodings and feed-forward sublayers, form a transformer block. Transformers parallelise far better than RNNs and scale gracefully to billions of parameters, powering large language models like GPT and BERT and reshaping natural language processing.

### Generative Adversarial Networks and Training Tricks
Generative adversarial networks (GANs) pit two networks against each other: a generator that fabricates samples and a discriminator that tries to tell real from fake. Through this game, the generator learns to produce remarkably realistic images, audio, and video. Training deep networks reliably requires tricks like batch normalisation (which stabilises activation distributions), dropout (which randomly zeros units to prevent co-adaptation), and learning-rate schedules.

### Why It Matters
Deep learning turned raw data and computation into capabilities that classical algorithms could not reach — recognising faces, translating languages, generating art, and writing code. Understanding perceptrons, backpropagation, CNNs, RNNs, attention, and GANs explains both the triumphs and the limitations of modern AI, and it sets the stage for the next generation of architectures that will build on these foundations.`,
  },

  // ----------------------------------------------------------------
  // 10. CYBERSECURITY AND CRYPTOGRAPHY
  // ----------------------------------------------------------------
  {
    id: 'tech-deep-cybersecurity-cryptography',
    patterns: [/\b(aes encryption|rsa encryption|sha-256|hashing algorithm|digital signature|public key infrastructure|pki|sql injection|xss|csrf|zero trust|defense in depth|man in the middle|public key cryptography|symmetric encryption)\b/i],
    keywords: ['aes encryption', 'rsa encryption', 'sha-256', 'hashing algorithm', 'digital signature', 'public key infrastructure', 'pki', 'sql injection', 'xss', 'csrf', 'zero trust', 'defense in depth', 'man in the middle', 'public key cryptography', 'symmetric encryption'],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `Cybersecurity protects information and systems from unauthorised access, modification, and denial of service. Cryptography provides the mathematical primitives — encryption, hashing, signatures — that make that protection possible. Together they form a layered defence built on the assumption that any single control will eventually fail.

### Symmetric vs Asymmetric Encryption
Symmetric encryption uses the same key for encryption and decryption. The Advanced Encryption Standard (AES) is the dominant symmetric cipher, with 128, 192, or 256-bit key sizes. AES is fast, hardware-accelerated on modern CPUs, and used to encrypt disks, databases, and network traffic. The challenge is key distribution: both parties must share the secret key without anyone else learning it.

Asymmetric encryption, or public-key cryptography, solves that problem with a key pair. The public key is shared openly, the private key is kept secret. RSA is the classic algorithm: encrypt with the public key and only the private key can decrypt. The mathematics rely on the difficulty of factoring large composite numbers. Asymmetric operations are slower than symmetric, so in practice systems use asymmetric encryption to exchange a symmetric session key and then use AES for bulk data.

### Hashing and Digital Signatures
A cryptographic hash maps data of any size to a fixed-size digest that is infeasible to invert or collide. SHA-256, from the SHA-2 family, produces 256-bit digests and underpins blockchains, file integrity checks, and password storage (with salt and a slow KDF like bcrypt or Argon2). A digital signature combines hashing with asymmetric encryption: the signer hashes the message and encrypts the digest with their private key; anyone can verify with the public key. Signatures prove authenticity and integrity without sharing any secret.

### Public Key Infrastructure and TLS
Public key infrastructure (PKI) binds public keys to identities through certificates signed by certificate authorities. The TLS protocol uses PKI to authenticate servers during the handshake: the server presents a certificate, the client verifies the chain up to a trusted root, and the two sides derive session keys. Modern TLS 1.3 with ephemeral Diffie-Hellman also provides forward secrecy — past traffic stays safe even if the long-term key is later compromised.

### Common Attacks
Web applications face a familiar rogues' gallery. SQL injection tricks a database into running attacker-supplied SQL by concatenating user input into queries — parameterised statements prevent it. Cross-site scripting (XSS) injects malicious JavaScript into a page viewed by other users; output encoding and content security policies mitigate it. Cross-site request forgery (CSRF) forces a logged-in user's browser to make unwanted requests; anti-CSRF tokens and SameSite cookies stop it. Phishing emails trick users into revealing credentials, and man-in-the-middle attacks intercept traffic on unsecured networks.

### Defense in Depth and Zero Trust
Defense in depth layers multiple controls — firewalls, intrusion detection, encryption, least-privilege access, logging, backups — so that breaching one layer does not compromise the whole system. The zero-trust model goes further by assuming the network is already hostile: every request is authenticated and authorised, segmentation is strict, and trust is never implied by network location.

### Why It Matters
Almost every aspect of modern life — banking, healthcare, elections, infrastructure — depends on systems reachable through networks. Cryptography makes confidentiality, integrity, and authenticity mathematically possible, and security engineering makes them practically robust. Understanding AES, RSA, hashing, signatures, common attacks, and zero trust is essential for any developer shipping software that handles sensitive data, and for any citizen trying to make sense of the breaches that fill the news.`,
  },

  // ----------------------------------------------------------------
  // 11. BLOCKCHAIN AND CRYPTOCURRENCY MECHANICS
  // ----------------------------------------------------------------
  {
    id: 'tech-deep-blockchain-cryptocurrency',
    patterns: [/\b(proof of work|proof of stake|mining bitcoin|smart contract|merkle tree|crypto wallet|consensus mechanism|ethereum virtual machine|gas fee|fork blockchain|double spend|51 percent attack|decentralized finance|defi)\b/i],
    keywords: ['proof of work', 'proof of stake', 'mining bitcoin', 'smart contract', 'merkle tree', 'crypto wallet', 'consensus mechanism', 'ethereum virtual machine', 'gas fee', 'fork blockchain', 'double spend', '51 percent attack', 'decentralized finance', 'defi'],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `A blockchain is a distributed ledger that records transactions in blocks, chains each block to its predecessor with cryptographic hashes, and uses a consensus mechanism so that thousands of independent nodes agree on the same history. The result is a tamper-evident record that no single party controls, which is why blockchains underpin cryptocurrencies and a growing range of other applications.

### Blocks, Chains, and Merkle Trees
Each block contains a header and a list of transactions. The header stores a timestamp, a nonce, the hash of the previous block, and the root of a Merkle tree summarising the block's transactions. A Merkle tree hashes pairs of transactions recursively until a single root hash remains, so verifying any one transaction requires only a logarithmic-size proof of membership. Because each block's header includes the previous block's hash, changing an old transaction alters its hash, which alters every subsequent block — making the chain tamper-evident.

### Proof of Work and Mining
Bitcoin, launched in 2009 by the pseudonymous Satoshi Nakamoto, secures its chain with proof of work. Miners compete to find a nonce that makes the block's hash fall below a difficulty target, which requires quadrillions of guesses per block. The first miner to find a valid nonce earns newly minted bitcoin and transaction fees. The work is intentionally expensive: an attacker would need to redo it for every block they want to rewrite, which becomes infeasible once they lack the majority of the network's hash rate. The famous 51 percent attack is the theoretical scenario where one miner controls more than half the hash power and can reverse recent transactions.

### Proof of Stake
Proof of stake replaces energy-intensive mining with economic stake. Validators lock up cryptocurrency as a bond and are chosen to propose or attest blocks in proportion to their stake. If they sign conflicting blocks, the network slashes their deposit. Ethereum completed its transition from proof of work to proof of stake in 2022, cutting its energy use by roughly 99.95 percent. Proof of stake trades some decentralisation for efficiency and enables faster finality.

### Wallets, Keys, and Double Spending
A cryptocurrency wallet is really a key manager. It stores a private key (or seed phrase) from which public addresses are derived. To spend coins, the owner signs a transaction with the private key; the network verifies the signature against the public key. The double-spend problem — spending the same coin twice — is solved by the consensus mechanism, which orders transactions and rejects conflicting attempts.

### Ethereum and Smart Contracts
Ethereum extended Bitcoin's design with a Turing-complete virtual machine. Smart contracts are programs stored on the blockchain that execute when transactions call them. The Ethereum Virtual Machine (EVM) runs the same bytecode on every node, so contract state is replicated across the network. Calling a contract costs gas, a fee denominated in tiny fractions of ether that prevents infinite loops and compensates validators. Smart contracts power decentralised finance (DeFi) lending, automated market makers, NFTs, and decentralised autonomous organisations.

### Beyond Currency
Blockchains also track supply chains, certify academic credentials, host domain-name systems, and settle tokenised assets. Public chains like Bitcoin and Ethereum are permissionless, while enterprise chains like Hyperledger Fabric are permissioned and tuned for consortium use.

### Why It Matters
Blockchains solve the trust problem between parties who share no central authority. Understanding Merkle trees, proof of work, proof of stake, wallets, and smart contracts explains both the genuine innovations — programmable money, verifiable scarcity, censorship resistance — and the real challenges of throughput, energy, governance, and regulation that will shape whether the technology fulfils its promise.`,
  },

  // ----------------------------------------------------------------
  // 12. IOT AND EMBEDDED SYSTEMS
  // ----------------------------------------------------------------
  {
    id: 'tech-deep-iot-embedded-systems',
    patterns: [/\b(microcontroller|arduino|esp32|sensor|actuator|rtos|mqtt|coap|edge computing|industrial iot|firmware|gpio|adc|pwm|i2c|spi bus)\b/i],
    keywords: ['microcontroller', 'arduino', 'esp32', 'sensor', 'actuator', 'rtos', 'mqtt', 'coap', 'edge computing', 'industrial iot', 'firmware', 'gpio', 'adc', 'pwm', 'i2c', 'spi bus'],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `Embedded systems are small computers built into larger devices, designed to do a few tasks reliably and cheaply. The Internet of Things (IoT) extends embedded systems with networking so they can stream data to the cloud and be controlled remotely. Together they power smart homes, factories, cars, wearables, and city infrastructure.

### Microcontrollers and Boards
At the heart of most embedded systems is a microcontroller unit (MCU) — a single chip containing a CPU, flash memory for code, RAM, and a set of peripherals. The Arduino family, based on 8-bit AVR and 32-bit ARM cores, made microcontrollers accessible to hobbyists and students with a simple IDE and a vast library ecosystem. The ESP32, with built-in Wi-Fi and Bluetooth and a 32-bit dual-core processor, became the default for connected projects because it costs only a few dollars. Industrial-grade chips from STMicro, NXP, and Microchip scale up to automotive and medical applications.

### Sensors and Actuators
Sensors convert physical phenomena into electrical signals. Common types include temperature sensors (thermistors, digital chips like the DS18B20), accelerometers and gyroscopes (MPU-6050), humidity sensors, GPS modules, and cameras. Actuators move things — DC motors, stepper motors, servo motors, solenoids, relays, and LEDs. Microcontrollers talk to these peripherals over buses like GPIO pins (digital on/off), ADC (analog-to-digital conversion), PWM (pulse-width modulation for motor speed and LED dimming), I2C, and SPI.

### Firmware and Real-Time Operating Systems
Embedded software, called firmware, runs directly on the metal without a traditional OS. Simple projects use a bare-metal super-loop, but more complex ones need a real-time operating system (RTOS) like FreeRTOS or Zephyr. An RTOS schedules tasks with deterministic timing, supports priorities and preemption, and provides queues, semaphores, and mutexes for inter-task communication. Determinism matters because a delayed reading from a sensor can mean a missed motor control deadline.

### IoT Protocols: MQTT and CoAP
Connected devices need lightweight protocols suited to constrained links. MQTT is a publish-subscribe messaging protocol where sensors publish to topics and subscribers receive matching messages through a broker. Its small header and quality-of-service levels make it ideal for unreliable networks. CoAP (Constrained Application Protocol) brings REST-like semantics to tiny devices over UDP. Above the wire, devices identify themselves and encrypt traffic with TLS or the lighter DTLS.

### Edge Computing and Industrial IoT
Sending every sensor reading to the cloud is expensive and slow. Edge computing moves processing closer to the source — on the device or a nearby gateway — to filter, aggregate, and analyse data locally. Only meaningful events travel upstream, saving bandwidth and enabling sub-second response. Industrial IoT takes this further, instrumenting factories with vibration sensors on motors, vision systems on production lines, and predictive-maintenance models that flag failing bearings before they break.

### Smart Home and Security Challenges
Consumer IoT powers smart thermostats, lights, locks, and cameras, often through ecosystems like Matter, Zigbee, and Z-Wave. Convenience is real, but so are risks. Many devices ship with default passwords, unpatched firmware, and cloud dependencies that turn them into botnets when compromised — the 2016 Mirai botnet recruited hundreds of thousands of insecure cameras to launch record-breaking DDoS attacks. Securing IoT requires signed firmware updates, unique credentials, encrypted protocols, and lifecycle patching.

### Why It Matters
Embedded systems and IoT are where software meets the physical world. They monitor heartbeats, control factory robots, optimise energy use, and feed agricultural decisions. Understanding microcontrollers, sensors, RTOS, MQTT, and edge computing opens the door to building devices rather than just apps, and recognising the security challenges is essential because every connected device is also a potential attack surface on the networks it joins.`,
  },

  // ----------------------------------------------------------------
  // 13. RENEWABLE ENERGY TECHNOLOGY
  // ----------------------------------------------------------------
  {
    id: 'tech-deep-renewable-energy-technology',
    patterns: [/\b(solar cell|photovoltaic|wind turbine|onshore wind|offshore wind|hydroelectric|geothermal energy|biomass energy|lithium ion battery|grid integration|energy transition|renewable energy|concentrated solar|inverter)\b/i],
    keywords: ['solar cell', 'photovoltaic', 'wind turbine', 'onshore wind', 'offshore wind', 'hydroelectric', 'geothermal energy', 'biomass energy', 'lithium ion battery', 'grid integration', 'energy transition', 'renewable energy', 'concentrated solar', 'inverter'],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `Renewable energy comes from sources that replenish on a human timescale — sunlight, wind, flowing water, geothermal heat, and biomass. Unlike fossil fuels, renewables emit little to no carbon dioxide during operation, which is why they sit at the centre of efforts to decarbonise the global energy system. The technology is no longer experimental; in many markets, solar and wind are the cheapest sources of new electricity.

### Solar: Photovoltaic and Concentrated
Photovoltaic (PV) cells convert sunlight directly into electricity through the photoelectric effect. A silicon cell has a p-n junction; when a photon knocks an electron loose, the junction's electric field drives it through an external circuit. Crystalline silicon dominates the market with module efficiencies around 20 percent, while thin-film and emerging perovskite tandem cells push lab efficiencies above 30 percent. Concentrated solar power uses mirrors to focus sunlight onto a receiver that heats a fluid, drives a turbine, and stores heat in molten salt for night-time generation.

### Wind: Onshore and Offshore Turbines
Wind turbines extract kinetic energy from moving air. A rotor with two or three blades spins a generator through a gearbox or direct drive. Onshore turbines are cheaper and easier to maintain, with capacities of 2 to 5 megawatts. Offshore turbines benefit from stronger, steadier winds and fewer land-use conflicts, and modern designs like GE's Haliade-X exceed 14 megawatts per unit. Capacity factors of 40 to 50 percent make wind one of the most productive renewables.

### Hydro, Geothermal, and Biomass
Hydroelectric power harnesses falling water through turbines and remains the largest renewable source worldwide. Large dams like Itaipu and the Three Gorges generate enormous steady output, while run-of-river plants minimise environmental disruption. Geothermal energy taps heat from Earth's interior, either for direct use or to spin turbines in regions with volcanic activity like Iceland and California. Biomass burns or gasifies organic matter — wood, agricultural residues, biogas from digesters — and is dispatchable, though sustainable sourcing is essential.

### Battery Storage
Renewables are intermittent — the sun sets, the wind calms — so storage is critical. Lithium-ion batteries dominate thanks to high energy density, falling costs, and rapid response. Grid-scale battery farms discharge in milliseconds to stabilise frequency and shift solar output into evening peaks. Flow batteries and pumped hydro provide longer-duration storage, and green hydrogen produced by electrolysis is being explored for seasonal storage and heavy industry.

### Grid Integration and Inverters
Integrating renewables into an alternating-current grid designed for steady thermal plants requires new tools. Inverters convert the direct current from solar panels and batteries to grid-synchronised AC. Smart inverters also provide voltage support and reactive power. Grid operators use forecasting, demand response, and interconnection to balance variable supply, while flexible transmission lines and energy markets route power across regions.

### The Energy Transition
The energy transition is the multi-decade shift from fossil-based to low-carbon energy. It involves electrifying transport and heating, scaling renewables and storage, modernising grids, and managing the retirement of coal and gas plants. Progress is uneven — solar deployment is booming, but grid bottlenecks, supply-chain constraints for critical minerals, and policy uncertainty slow the pace.

### Why It Matters
Renewable energy technology is the most consequential engineering story of the century. Whether solar panels, wind turbines, batteries, and grid software scale fast enough will shape the climate, the economy, and geopolitics for generations. Understanding how each technology works, where it excels, and what limits it helps cut through hype and informs the choices — technical, political, and personal — that determine how the transition unfolds.`,
  },
]
