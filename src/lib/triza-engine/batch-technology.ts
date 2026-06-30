/**
 * ============================================================
 *  TRIZA ENGINE — Knowledge Batch: Technology & Computing
 * ============================================================
 *
 *  15 hand-written entries covering the Internet, blockchain,
 *  AI/ML, cybersecurity, cloud, 5G, IoT, quantum computing,
 *  AR/VR, programming languages, and computer fundamentals.
 *  Each entry includes English + Roman Urdu trigger patterns so
 *  TRIZA can respond to multilingual user queries natively.
 *
 *  All responses: 250-400 words, markdown formatted, factually
 *  accurate. No external LLM — pure TypeScript knowledge base.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const TECHNOLOGY_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------
  // 1. HOW THE INTERNET WORKS
  // ----------------------------------------------------------
  {
    id: 'how-internet-works',
    patterns: [/\b(internet|tcp\/?ip|dns|packet switching|how internet works|internet kaise kaam karta|internet kya hai|net kaise chalta)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## How the Internet Works — A Global Packet Network

The Internet is not a single thing — it is a decentralized global network of millions of computers, servers, and cables that talk to each other using a shared language called **TCP/IP** (Transmission Control Protocol / Internet Protocol). When you open a webpage, your device does not open a direct pipe to that server; instead, it chops the request into tiny parcels called **packets** and routes them across many intermediate machines.

### The Role of Packets
Each packet carries a piece of data plus source and destination addresses. Packets from the same file may travel different routes and arrive out of order — TCP reassembles them correctly at the destination. This **packet switching** design is why the Internet survives cable cuts: traffic simply finds another path.

### DNS — The Phonebook
Humans remember names like 'google.com', but computers need IP addresses like 142.250.190.46. **DNS (Domain Name System)** translates human-friendly domain names into numeric IP addresses through a hierarchy of servers: root, top-level (.com, .org), and authoritative name servers.

### The Layered Model
| Layer | Role | Example Protocol |
|-------|------|------------------|
| Application | What users see | HTTP, HTTPS, SMTP |
| Transport | Reliable delivery | TCP, UDP |
| Internet | Routing | IP |
| Link | Physical cables/Wi-Fi | Ethernet, Wi-Fi |

### Key Infrastructure
- **Undersea cables** carry 99% of intercontinental data
- **Routers** direct packets hop by hop
- **ISPs** connect end users to the backbone
- **Data centers** host the servers running websites and apps

**Why it matters:** The Internet was designed in the 1970s by Vint Cerf and Bob Kahn to be resilient, open, and decentralized. Understanding TCP/IP and DNS demystifies everyday actions — every email, video call, and message is just packets finding their way across a cooperative global mesh.`,
  },

  // ----------------------------------------------------------
  // 2. BLOCKCHAIN TECHNOLOGY
  // ----------------------------------------------------------
  {
    id: 'blockchain-technology',
    patterns: [/\b(blockchain|block chain|distributed ledger|blockchain kya hai|blockchain kaise kaam karta|ledger technology)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## Blockchain — A Trust Machine Built on Math

A **blockchain** is a digital ledger that records transactions in blocks, then chains those blocks together using cryptography so that no one can secretly alter past records. Instead of trusting a single bank or government, thousands of computers (nodes) hold identical copies and agree on every new entry through a process called **consensus**.

### How a Block Is Built
1. New transactions are broadcast to the network
2. Nodes group pending transactions into a candidate **block**
3. A cryptographic **hash** (a unique fingerprint) is computed for the block
4. Each block includes the hash of the previous block — hence the 'chain'
5. If anyone tampers with an old block, its hash changes, breaking every later block

### Consensus Mechanisms
| Mechanism | Idea | Used By |
|-----------|------|---------|
| Proof of Work (PoW) | Solve hard math puzzles | Bitcoin |
| Proof of Stake (PoS) | Lock up coins to validate | Ethereum (post-2022) |
| Practical Byzantine Fault Tolerance | Voting among trusted nodes | Hyperledger |

### Key Properties
- **Immutable** — once written, history cannot be changed without enormous cost
- **Decentralized** — no single point of failure or control
- **Transparent** — anyone can audit the public ledger
- **Permissionless** (public chains) — anyone can join

### Beyond Crypto
Blockchains power **smart contracts** (self-executing code on Ethereum), **NFTs** proving digital ownership, **supply-chain tracking** (Walmart traces mangoes in seconds), and **decentralized finance (DeFi)** lending platforms.

**Why it matters:** Blockchain solves the 'trust problem' between strangers who do not share a common authority. By making records tamper-evident and verifiable by anyone, it offers a new foundation for money, contracts, and identity in the digital age — though challenges of speed, energy use, and regulation remain active frontiers.`,
  },

  // ----------------------------------------------------------
  // 3. CRYPTOCURRENCY
  // ----------------------------------------------------------
  {
    id: 'cryptocurrency-basics',
    patterns: [/\b(cryptocurrency|crypto|bitcoin|ethereum|btc|eth|cryptocurrency kya hai|bitcoin kya hai|digital currency)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## Cryptocurrency — Digital Money Without a Bank

A **cryptocurrency** is a digital asset secured by cryptography, running on a blockchain, with no central issuer like a government or bank. The pioneer, **Bitcoin**, was launched in 2009 by the pseudonymous Satoshi Nakamoto in response to the 2008 financial crisis — a money system that no single authority could print or freeze.

### Bitcoin — Digital Gold
- Fixed supply cap of **21 million coins**
- New bitcoins are created by **mining** — computers racing to solve Proof of Work puzzles
- Halving event every 4 years cuts the mining reward in half
- Average block time: ~10 minutes

### Ethereum — Programmable Money
Launched in 2015 by Vitalik Buterin, Ethereum goes beyond currency. Its **Ether (ETH)** token fuels a virtual machine that runs **smart contracts** — code that executes automatically when conditions are met. In 2022 Ethereum switched from energy-hungry Proof of Work to **Proof of Stake**, cutting its energy use by ~99.95%.

### Major Coins Compared
| Coin | Purpose | Supply |
|------|---------|--------|
| Bitcoin (BTC) | Store of value | Capped at 21M |
| Ethereum (ETH) | Smart contract platform | Uncapped, low inflation |
| Solana (SOL) | High-speed dApps | Inflationary |
| Tether (USDT) | Stablecoin pegged to USD | Pegged 1:1 |

### How Transactions Work
When you send crypto, you sign the transaction with your **private key** (a secret number). The network verifies the signature against your **public address**, then miners or validators bundle it into a block. Once confirmed, the transfer is irreversible.

**Why it matters:** Cryptocurrency challenges the monopoly of central banks over money. It enables borderless payments, financial access for the unbanked, and programmable value transfer — though volatility, scams, and regulatory uncertainty remain real risks anyone entering this space must understand.`,
  },

  // ----------------------------------------------------------
  // 4. MACHINE LEARNING
  // ----------------------------------------------------------
  {
    id: 'machine-learning-basics',
    patterns: [/\b(machine learning|ml algorithms|supervised learning|unsupervised learning|reinforcement learning|machine learning kya hai|ml kya hota hai)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## Machine Learning — Teaching Computers From Data

**Machine Learning (ML)** is the branch of AI where systems improve at a task by analyzing examples rather than following hand-coded rules. Instead of telling a computer 'a cat has pointy ears', you show it 10,000 labeled cat photos and let it discover the patterns itself.

### Three Main Categories

**Supervised Learning** — The most common type. The model learns from labeled examples (input → known output). Once trained, it predicts outputs for new inputs.
- Spam detection (email → spam/not-spam)
- House price prediction (features → price)
- Medical diagnosis (symptoms → disease)

**Unsupervised Learning** — Data has no labels; the model finds hidden structure.
- Customer segmentation (group similar shoppers)
- Anomaly detection (flag fraud)
- Topic clustering in documents

**Reinforcement Learning** — An agent learns by trial and error, earning rewards or penalties. AlphaGo mastering Go and robots learning to walk both use this approach.

### Common Algorithms
| Algorithm | Best For |
|-----------|----------|
| Linear Regression | Predicting numbers |
| Decision Trees | interpretable rules |
| Random Forest | Robust classification |
| k-Means | Clustering |
| Neural Networks | Complex patterns |

### The Training Loop
1. Collect and clean data
2. Choose a model and features
3. Train by minimizing a loss function
4. Validate on unseen data to prevent **overfitting**
5. Deploy and monitor for **drift**

**Why it matters:** Machine learning quietly powers your daily life — Netflix recommendations, Google Translate, credit scoring, spam filters, and self-driving cars. Understanding ML demystifies why these systems sometimes surprise us, fail on edge cases, or inherit bias from their training data. As ML spreads, knowing its limits becomes a literacy skill as fundamental as reading.`,
  },

  // ----------------------------------------------------------
  // 5. DEEP LEARNING
  // ----------------------------------------------------------
  {
    id: 'deep-learning-basics',
    patterns: [/\b(deep learning|neural network|artificial neural network|ann|cnn|rnn|transformer|deep learning kya hai|neural network kya hota)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## Deep Learning — Many-Layered Neural Networks

**Deep Learning** is a subfield of machine learning that uses **artificial neural networks** with many layers (hence 'deep') to learn complex patterns directly from raw data — pixels, audio samples, or text characters — without manual feature engineering.

### How a Neural Network Works
Inspired loosely by the brain, a neural network is made of artificial **neurons** (also called units) organized in layers:
- **Input layer** receives raw data
- **Hidden layers** transform it through weighted connections
- **Output layer** produces the prediction

Each connection has a **weight** that the network adjusts during training via **backpropagation** — a calculus-based method that nudges weights to reduce error. Deep models may have hundreds of layers and billions of weights.

### Specialized Architectures
| Architecture | Strength | Example Use |
|--------------|----------|-------------|
| CNN | Spatial patterns | Image recognition |
| RNN / LSTM | Sequences | Speech, language |
| Transformer | Attention over context | GPT, ChatGPT |
| GAN | Generate new data | Deepfakes, art |
| Diffusion | Stepwise denoising | Stable Diffusion, DALL·E |

### Why Deep Learning Exploded
Three forces converged after 2012:
1. **Big data** — the web provided massive labeled datasets
2. **GPUs** — parallel chips made training feasible
3. **Better algorithms** — ReLU activations, batch normalization, Adam optimizer

### Breakthroughs
- **AlexNet (2012)** crushed ImageNet, igniting the deep learning era
- **AlphaGo (2016)** defeated the world Go champion
- **GPT and friends (2018–present)** transformed natural language generation

**Why it matters:** Deep learning drives the AI revolution — face recognition, voice assistants, protein folding (AlphaFold), and large language models all rely on it. Yet these systems are data-hungry, opaque ('black boxes'), and energy-intensive. As deep learning embeds itself in medicine, justice, and defense, society must weigh its power against the need for transparency and accountability.`,
  },

  // ----------------------------------------------------------
  // 6. NATURAL LANGUAGE PROCESSING
  // ----------------------------------------------------------
  {
    id: 'natural-language-processing',
    patterns: [/\b(natural language processing|nlp|text analysis|ai text|language model|nlp kya hai|ai text kaise samajhta|zaban samajhne wala ai)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## Natural Language Processing — Teaching AI to Understand Language

**Natural Language Processing (NLP)** is the AI field that lets computers read, interpret, and generate human language — the messy, ambiguous, rule-bending text we speak and write every day. It is the technology behind Google Translate, Siri, grammar checkers, and large language models like GPT.

### Core Tasks
- **Tokenization** — splitting text into words or subwords
- **Part-of-speech tagging** — noun, verb, adjective
- **Named entity recognition** — finding people, places, organizations
- **Sentiment analysis** — is this review positive or negative?
- **Machine translation** — converting Urdu to English
- **Question answering** — given a passage, answer a query
- **Text generation** — produce fluent new text

### From Rules to Vectors
Early NLP (1960s–1990s) relied on hand-written grammar rules — brittle and slow. The breakthrough came with **word embeddings** like Word2Vec (2013), which represent each word as a vector of numbers so that 'king - man + woman ≈ queen'. Suddenly computers could capture meaning mathematically.

### The Transformer Revolution
In 2017 Google published 'Attention Is All You Need', introducing the **Transformer** architecture. Transformers process whole sentences at once and learn which words matter in context. This enabled:
- **BERT** (2018) — better search
- **GPT family** (2018–present) — fluent text generation
- **ChatGPT** (2022) — conversational AI goes mainstream

### NLP Pipeline Today
| Stage | What happens |
|-------|--------------|
| Preprocessing | Clean and tokenize text |
| Embedding | Convert tokens to vectors |
| Model | Neural network predicts outputs |
| Decoding | Generate or label final text |

**Why it matters:** Language is humanity's primary tool — and now a programming interface. NLP lets people search, learn, and create in their native tongue, breaking barriers of literacy and language. But it also powers misinformation, deepfakes, and surveillance. Understanding NLP helps us use it wisely and question what AI-generated text really means.`,
  },

  // ----------------------------------------------------------
  // 7. COMPUTER VISION
  // ----------------------------------------------------------
  {
    id: 'computer-vision',
    patterns: [/\b(computer vision|image recognition|object detection|facial recognition|vision ai|computer vision kya hai|image ai|tasveer pehchanne wala ai)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## Computer Vision — Giving Machines Eyes

**Computer Vision (CV)** is the AI field that enables computers to interpret visual information from images and videos — recognizing faces, detecting objects, reading signs, and even driving cars. While human vision evolved over millions of years, teaching machines to 'see' has been one of computing's hardest and most rewarding challenges.

### Key Tasks
- **Image classification** — 'is this a cat or a dog?'
- **Object detection** — locate and label multiple objects in one image
- **Semantic segmentation** — label every pixel
- **Face recognition** — identify a specific person
- **Optical character recognition (OCR)** — extract text from images
- **Pose estimation** — track body joints in motion

### How It Works
Modern CV relies on **convolutional neural networks (CNNs)**. A CNN slides small filters across an image to detect edges in early layers, shapes in middle layers, and complex objects (faces, cars) in deeper layers. Each layer builds on the previous, mimicking how the visual cortex processes information.

### Real-World Applications
| Domain | Use Case |
|--------|----------|
| Healthcare | Detecting tumors in X-rays and MRIs |
| Retail | Amazon Go cashier-less stores |
| Automotive | Tesla Autopilot, Waymo robotaxis |
| Security | Face unlock, surveillance |
| Agriculture | Crop disease detection from drone photos |
| Manufacturing | Defect detection on assembly lines |

### Famous Milestones
- **2012** — AlexNet wins ImageNet by a huge margin, igniting deep CV
- **2015** — ResNet surpasses human accuracy on ImageNet
- **2017** — Apple Face ID ships on iPhone X
- **2020+** — Vision Transformers challenge CNN dominance

### Challenges
- **Bias** — facial recognition fails more on darker skin tones
- **Adversarial attacks** — invisible pixel tweaks fool models
- **Privacy** — mass surveillance concerns

**Why it matters:** Computer vision is reshaping medicine, transport, security, and accessibility. A visually impaired person can now hear the world described aloud; a farmer can detect crop disease from a phone. But as cameras become AI-powered everywhere, the same technology raises urgent questions about consent, accuracy, and who gets to watch whom.`,
  },

  // ----------------------------------------------------------
  // 8. CYBERSECURITY BASICS
  // ----------------------------------------------------------
  {
    id: 'cybersecurity-basics',
    patterns: [/\b(cybersecurity|cyber security|hacking|malware|phishing|password security|cybersecurity kya hai|cyber suraksha|hacker kya karta)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## Cybersecurity — Defending the Digital Frontier

**Cybersecurity** is the practice of protecting computers, networks, and data from unauthorized access, damage, or theft. As our lives, money, and identities move online, the stakes of poor security have grown from mere inconvenience to national crisis.

### Common Threats
| Threat | How It Works |
|--------|--------------|
| **Phishing** | Fake emails trick you into revealing passwords |
| **Malware** | Viruses, spyware, ransomware installed on your device |
| **Ransomware** | Encrypts your files and demands payment |
| **Man-in-the-middle** | Attacker intercepts traffic on public Wi-Fi |
| **Brute force** | Automated password guessing |
| **SQL injection** | Malicious code inserted into web forms |
| **DDoS** | Floods a site with traffic until it crashes |

### The CIA Triad
Security pros think in three goals:
- **Confidentiality** — only authorized people see data
- **Integrity** — data cannot be altered without detection
- **Availability** — systems stay accessible when needed

### Defensive Habits That Actually Work
1. **Use a password manager** — unique long passwords per site
2. **Turn on 2FA** — a second factor blocks 99% of automated attacks
3. **Update software promptly** — patches close known holes
4. **Be skeptical of links** — hover before clicking, verify senders
5. **Back up offline** — your defense against ransomware
6. **Use HTTPS** — look for the lock icon, avoid plain HTTP

### Why Passwords Fail
Most people reuse the same password across sites. When one breaches, attackers test it everywhere — called **credential stuffing**. A 12-character random password with 2FA defeats nearly all such attacks.

### Career Landscape
Roles include **security analyst**, **penetration tester** (ethical hacker), **SOC analyst**, and **CISO**. Certifications like Security+, CEH, and CISSP are common.

**Why it matters:** Cybercrime is projected to cost the world over $10 trillion annually by 2025 — larger than most national economies. Whether you are an individual protecting family photos or a corporation guarding customer data, basic cybersecurity hygiene is now as essential as locking your front door at night.`,
  },

  // ----------------------------------------------------------
  // 9. CLOUD COMPUTING
  // ----------------------------------------------------------
  {
    id: 'cloud-computing',
    patterns: [/\b(cloud computing|iaas|paas|saas|aws|azure|google cloud|cloud kya hai|cloud computing kya hota|badal computing)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## Cloud Computing — Renting Computers Instead of Buying Them

**Cloud computing** means delivering computing services — servers, storage, databases, software, analytics — over the Internet on a pay-as-you-go basis. Instead of buying and maintaining physical servers, organizations rent what they need from a cloud provider, scaling up or down in seconds.

### The Three Service Models
| Model | What You Get | Example |
|-------|--------------|---------|
| **IaaS** (Infrastructure as a Service) | Virtual servers and storage | AWS EC2, Azure VM |
| **PaaS** (Platform as a Service) | Managed runtime to deploy apps | Heroku, Google App Engine |
| **SaaS** (Software as a Service) | Ready-to-use software via browser | Gmail, Salesforce, Zoom |

### Deployment Options
- **Public cloud** — shared infrastructure (AWS, Azure, GCP)
- **Private cloud** — dedicated to one organization
- **Hybrid cloud** — mix of both, balancing cost and control
- **Multi-cloud** — using several providers to avoid lock-in

### Major Providers
- **Amazon Web Services (AWS)** — launched 2006, market leader, 200+ services
- **Microsoft Azure** — strong in enterprise and Windows shops
- **Google Cloud Platform (GCP)** — excels in data and AI
- **Alibaba Cloud** — dominant in China
- **Oracle, IBM, DigitalOcean** — niche players

### Key Benefits
- **No upfront hardware cost** — pay only for what you use
- **Elasticity** — handle traffic spikes automatically
- **Global reach** — deploy in dozens of regions
- **Managed services** — provider handles patches and backups

### Trade-offs
- Ongoing operating cost can exceed ownership over years
- Vendor lock-in makes switching hard
- Data sovereignty and compliance complexity
- Dependency on internet connectivity

**Why it matters:** Cloud computing underpins the modern digital economy — Netflix, Uber, Airbnb, and most apps on your phone run on it. It has democratized access to enterprise-grade infrastructure so that a student with a laptop can launch a global service for a few dollars. Understanding the cloud is now essential literacy for any career in technology or business.`,
  },

  // ----------------------------------------------------------
  // 10. 5G TECHNOLOGY
  // ----------------------------------------------------------
  {
    id: '5g-technology',
    patterns: [/\b(5g|5g technology|5g network|fifth generation wireless|5g kya hai|5g internet|5g speed)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## 5G — The Fifth Generation of Wireless

**5G** is the fifth generation of cellular mobile technology, succeeding 4G LTE. Deployed globally from 2019 onward, it delivers dramatically faster speeds, near-instant response, and the ability to connect millions of devices per square kilometer — unlocking applications that 4G simply could not support.

### Three Key Performance Leaps
| Metric | 4G | 5G |
|--------|-----|-----|
| Peak download speed | 1 Gbps | up to 20 Gbps |
| Latency | ~50 ms | as low as 1 ms |
| Connected devices | 100k per km² | 1 million per km² |

### Three Frequency Bands
- **Low-band (sub-1 GHz)** — wide coverage, modest speed boost
- **Mid-band (1–6 GHz)** — the sweet spot for speed and coverage
- **High-band / mmWave (24–100 GHz)** — huge speed, short range, blocked by walls

### How 5G Achieves Its Speeds
- **Massive MIMO** — antennas with dozens of elements serving many users at once
- **Beamforming** — focusing the signal directly at each device
- **Network slicing** — carving virtual networks for different use cases (e.g., a low-latency slice for surgery, a high-bandwidth slice for streaming)
- **New radio (NR) air interface** — more efficient encoding

### Real-World Use Cases
- **Remote surgery** — surgeons operating across continents
- **Autonomous vehicles** — cars sharing data in real time
- **Smart factories** — thousands of sensors coordinating
- **AR/VR** — untethered high-resolution experiences
- **Fixed wireless access** — home broadband via 5G instead of fiber

### Controversies
Health concerns about 5G radiation have been studied extensively; the WHO and FDA have found no evidence of harm at regulated exposure levels. Rollout has also been entangled in geopolitical fights over which vendors (notably Huawei) can build national networks.

**Why it matters:** 5G is the connective tissue for the next decade of innovation — self-driving cars, smart cities, remote medicine, and the Internet of Things all depend on its speed and low latency. Like electricity a century ago, fast wireless is becoming invisible infrastructure that every other industry builds upon.`,
  },

  // ----------------------------------------------------------
  // 11. INTERNET OF THINGS
  // ----------------------------------------------------------
  {
    id: 'internet-of-things',
    patterns: [/\b(internet of things|iot|smart devices|smart home|iot kya hai|cheezon ka internet|smart gharr)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## Internet of Things — When Everyday Objects Go Online

The **Internet of Things (IoT)** is the network of physical devices — from light bulbs and watches to factory machines and tractors — embedded with sensors, software, and connectivity so they can collect and exchange data without human typing. If the traditional Internet connected computers, IoT connects *things*.

### How an IoT System Works
1. **Sensors** measure temperature, motion, GPS, heart rate, soil moisture, etc.
2. **Connectivity** (Wi-Fi, Bluetooth, cellular, LoRa, Zigbee) sends the data
3. **Edge or cloud processing** analyzes the stream
4. **Actions** are triggered — turn on irrigation, alert a doctor, adjust thermostat
5. **User interface** — an app or dashboard for humans to view and control

### Common Categories
| Domain | Examples |
|--------|----------|
| Smart home | Nest thermostat, smart lights, Ring doorbell |
| Wearables | Apple Watch, Fitbit, glucose monitors |
| Smart cities | Traffic sensors, smart streetlights, waste bins |
| Industrial IoT | Predictive maintenance, factory automation |
| Agriculture | Soil sensors, drone crop monitoring |
| Healthcare | Remote patient monitoring, smart inhalers |

### Benefits
- **Automation** — routines run without manual input
- **Efficiency** — energy, water, and materials saved
- **Insight** — data reveals patterns invisible to humans
- **Safety** — early warnings for equipment failure or health events

### Real Challenges
- **Security** — millions of poorly secured devices become botnets (the 2016 Mirai attack took down major websites via hacked cameras)
- **Privacy** — always-on microphones and cameras in homes
- **Interoperability** — competing standards (Matter, Zigbee, Z-Wave) fragment the market
- **E-waste** — short device lifespans pile up in landfills

### Scale
By 2025 there are estimated to be **over 30 billion connected IoT devices** worldwide, generating zettabytes of data per year.

**Why it matters:** IoT turns the physical world into a programmable platform. Farms water themselves, factories predict breakdowns, and grandparents live safer at home. But it also multiplies the surface area for hacking and surveillance. Designing IoT that is secure, private, and sustainable will shape how trustworthy our connected future turns out to be.`,
  },

  // ----------------------------------------------------------
  // 12. QUANTUM COMPUTING
  // ----------------------------------------------------------
  {
    id: 'quantum-computing',
    patterns: [/\b(quantum computing|qubit|quantum computer|superposition|quantum supremacy|quantum kya hai|quantum computer kaise kaam karta)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## Quantum Computing — Computing With the Rules of Physics

A **quantum computer** harnesses the strange laws of quantum mechanics — superposition, entanglement, and interference — to solve certain problems exponentially faster than classical computers. Instead of bits that are strictly 0 or 1, it uses **qubits** that can exist in a blend of both states at once.

### Core Concepts
- **Superposition** — a qubit can be in state |0>, |1>, or any combination until measured
- **Entanglement** — two qubits can share a linked fate; measuring one instantly reveals the other, even at a distance
- **Interference** — cleverly arranged quantum circuits amplify right answers and cancel wrong ones
- **Measurement** — observing a qubit collapses it to a definite 0 or 1

### Why It Is Powerful
With n qubits, a quantum computer can represent 2^n states simultaneously. This does not mean it tries every answer at once, but carefully designed algorithms exploit interference to surface the correct one. A few landmark algorithms:

| Algorithm | Speedup |
|-----------|---------|
| Shor's | Factors integers exponentially faster — breaks RSA |
| Grover's | Quadratic speedup for unsorted search |
| Quantum simulation | Models molecules for drug discovery |

### Where We Stand
- **2019** — Google claimed 'quantum supremacy' with the 53-qubit Sycamore chip
- **2023+** — IBM, Google, IonQ, Quantinuum race past 1,000 qubits
- **Error correction** remains the central obstacle — qubits are noisy

### Promising Applications
- **Cryptography** — both breaking current codes and enabling unbreakable quantum key distribution
- **Drug & material discovery** — simulating molecules classical computers cannot
- **Optimization** — logistics, finance, supply chains
- **AI** — quantum machine learning (early stage)

**Why it matters:** Quantum computing could redraw the map of cybersecurity, chemistry, and optimization within a decade. Most experts believe practical, large-scale quantum computers are still years away — but nations and companies are investing billions now to lead the race. Understanding the basics prepares us for a future where some problems thought impossible may suddenly become routine.`,
  },

  // ----------------------------------------------------------
  // 13. AR / VR
  // ----------------------------------------------------------
  {
    id: 'ar-vr-technology',
    patterns: [/\b(augmented reality|virtual reality|\bar\b|\bvr\b|mixed reality|xr|metaverse|ar kya hai|vr kya hai|masnoi tabaqi)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## Augmented & Virtual Reality — Blurring Physical and Digital

**Virtual Reality (VR)** and **Augmented Reality (AR)** are immersive technologies that change how we perceive the world — one replaces it entirely, the other overlays digital content onto it. Together with **Mixed Reality (MR)** they form the **XR (Extended Reality)** family.

### The Differences
| Tech | What It Does | Example Device |
|------|--------------|----------------|
| **VR** | Replaces your surroundings with a fully digital world | Meta Quest, PlayStation VR |
| **AR** | Overlays digital objects on the real world | Pokémon GO, Apple Vision Pro |
| **MR** | Digital objects interact with real ones in real time | Microsoft HoloLens |

### How VR Works
A VR headset contains two small screens (one per eye), motion sensors, and lenses that create a stereoscopic 3D view. Head-tracking updates the image as you move, tricking your brain into feeling present in the virtual scene — a sensation called **immersion**. Modern headsets add hand controllers and eye tracking.

### How AR Works
AR uses cameras and sensors to map the environment, then projects or displays digital content anchored to real surfaces. Your phone's AR features (measuring app, filters) use **SLAM (Simultaneous Localization and Mapping)** to track position. Smart glasses like Apple Vision Pro and Meta Ray-Bans push AR toward everyday wear.

### Applications Today
- **Gaming** — Beat Saber, Half-Life: Alyx, Pokémon GO
- **Healthcare** — surgical training, exposure therapy for PTSD
- **Education** — virtual field trips, anatomy visualization
- **Industry** — remote assistance for repair technicians
- **Retail** — try-on glasses, see furniture in your room (IKEA Place)
- **Real estate** — virtual property tours

### Challenges
- **Hardware comfort** — weight, heat, motion sickness
- **Battery life** — power-hungry displays
- **Content** — killer apps beyond gaming are still emerging
- **Privacy** — AR glasses record everyone around you

**Why it matters:** XR is widely seen as the next computing platform after the smartphone — the interface through which we will work, learn, and socialize in 3D. Apple, Meta, Google, and Microsoft are betting billions on it. Whether the 'metaverse' materializes as envisioned or fragments into niche tools, immersive computing is reshaping how humans interact with digital information.`,
  },

  // ----------------------------------------------------------
  // 14. PROGRAMMING LANGUAGES
  // ----------------------------------------------------------
  {
    id: 'programming-languages',
    patterns: [/\b(programming language|coding|code|python|javascript|java|c\+\+|rust|golang|typescript|programming kya hai|coding kya hota|programming bhasha)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## Programming Languages — How Humans Talk to Machines

A **programming language** is a formal set of instructions that humans can write and computers can execute. Since CPUs only understand 1s and 0s (machine code), languages act as a bridge — letting us express logic in readable text that compilers or interpreters translate into executable code.

### Major Paradigms
- **Imperative** — step-by-step commands (C, Pascal)
- **Object-oriented** — model the world as objects (Java, C#)
- **Functional** — pure functions, no side effects (Haskell, Elixir)
- **Declarative** — describe what you want, not how (SQL, Prolog)
- **Multi-paradigm** — combines several (Python, JavaScript, Rust)

### Popular Languages and Their Strengths
| Language | Created | Best For |
|----------|---------|----------|
| **C** | 1972 | Operating systems, embedded |
| **C++** | 1985 | Games, high-performance software |
| **Java** | 1995 | Enterprise apps, Android |
| **Python** | 1991 | AI/ML, scripting, data science |
| **JavaScript** | 1995 | Web front-end and back-end (Node.js) |
| **TypeScript** | 2012 | Safer JavaScript with types |
| **Go** | 2009 | Cloud services, concurrency |
| **Rust** | 2010 | Memory-safe systems programming |
| **Swift** | 2014 | iOS and macOS apps |
| **Kotlin** | 2011 | Modern Android development |

### Compiled vs Interpreted
- **Compiled** (C, Rust, Go) — translated once to machine code; runs fast
- **Interpreted** (Python, JavaScript) — executed line by line; easier to test
- **JIT-compiled** (Java, C#) — compiled at runtime to balance speed and portability

### How to Choose
- Want to build websites? **JavaScript + TypeScript**
- Interested in AI/ML or data? **Python**
- Building mobile apps? **Swift (iOS)** or **Kotlin (Android)**
- Systems or performance-critical code? **C++, Rust**
- Enterprise backend? **Java, C#, Go**

**Why it matters:** Programming languages shape what we can build and how we think about problems. The language you choose influences speed, safety, team productivity, and even hiring. Today, anyone can learn to code for free online — and the ability to instruct machines is becoming a foundational 21st-century skill, as vital as reading once was.`,
  },

  // ----------------------------------------------------------
  // 15. HOW COMPUTERS WORK
  // ----------------------------------------------------------
  {
    id: 'how-computers-work',
    patterns: [/\b(how computers work|computer architecture|cpu|ram|storage|binary|computer kaise kaam karta|computer kya hai|cpu kya hota|computer parts)\b/i],
    intent: 'factual_question',
    topic: 'technology',
    response: () => `## How Computers Work — From Switches to Software

At its heart, a computer is a machine that **stores, processes, and outputs data** following instructions called programs. Despite decades of evolution, every computer from a smartwatch to a supercomputer still rests on the same architecture proposed by John von Neumann in 1945.

### The Core Components
| Part | Role |
|------|------|
| **CPU** (Central Processing Unit) | The 'brain' — executes instructions |
| **RAM** (Random Access Memory) | Fast, temporary workspace |
| **Storage** (SSD/HDD) | Permanent file storage |
| **Motherboard** | Connects all components |
| **GPU** | Handles graphics and parallel math |
| **Input/Output** | Keyboard, screen, network |

### The CPU's Job
The CPU runs a simple loop billions of times per second:
1. **Fetch** the next instruction from memory
2. **Decode** what it means
3. **Execute** it (do math, move data, branch)
4. **Write back** the result

Modern CPUs have multiple **cores** (independent processing units) and **cache** memory tiers (L1, L2, L3) to feed data faster.

### Why Binary?
Computers use **binary** — just 0s and 1s — because electronic switches are easiest to build reliably: a transistor is either ON (1) or OFF (0). Everything — text, images, music, video — is encoded as sequences of these bits. Eight bits make a **byte**, which can represent 256 distinct values.

### The Software Stack
- **Hardware** — physical chips and circuits
- **Firmware/BIOS** — lowest-level startup code
- **Operating system** — Windows, macOS, Linux; manages resources
- **Applications** — browsers, games, editors
- **User data** — your files

### Memory Hierarchy
Fast memory is small and expensive; large storage is slow. Computers layer them: registers (fastest) → cache → RAM → SSD → HDD → cloud (slowest). The art of computing is keeping the CPU fed from this hierarchy without stalling.

**Why it matters:** Understanding the CPU–memory–storage model turns a computer from a magical black box into a logical machine you can reason about. It explains why adding RAM speeds up multitasking, why an SSD feels faster than an old hard drive, and why software bloat matters. In an age where computers mediate nearly everything, this mental model is a form of digital literacy everyone can benefit from.`,
  },
]
