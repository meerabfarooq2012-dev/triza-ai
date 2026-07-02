/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — BIOLOGY & LIFE SCIENCES (Batch 3a)
 * ============================================================
 *
 *  25 detailed knowledge entries covering cell biology, human
 *  body systems, genetics, ecology, and the foundations of life.
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries and include BOTH
 *  English and Roman Urdu phrasings so TRIZA can match
 *  questions from bilingual users.
 *
 *  NO external LLM API is used. These are facts TRIZA has
 *  "learned" and will express in its own voice via the
 *  self-expression engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const BIOLOGY_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. CELL STRUCTURE
  // ----------------------------------------------------------------
  {
    id: 'cell-structure-basics',
    patterns: [/\b(cell|cells|animal cell|plant cell|organelle|organelles|sel kya hai|cell kya hai|cell ka structure|janwar ki cell|poday ki cell|cell ki banawat)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Cell Structure Basics

Cells are the basic building blocks of all living things — every animal, plant, fungus, and bacterium is made of one or more cells. The cell is the smallest unit that can be called genuinely alive.

### Animal Cells vs Plant Cells
Both animal and plant cells are **eukaryotic**, meaning they have a true nucleus and membrane-bound organelles. However, plant cells have three extra structures that animal cells lack.

### Key Organelles
- **Nucleus** — stores DNA, controls cell activities
- **Mitochondria** — powerhouse of the cell, produces ATP energy
- **Endoplasmic Reticulum (ER)** — rough ER makes proteins, smooth ER makes lipids
- **Golgi Apparatus** — packages and ships proteins
- **Ribosomes** — tiny factories that build proteins
- **Lysosomes** — recycle waste and digest old parts
- **Cell Membrane** — controls what enters and leaves

### Plant-Only Structures
- **Cell Wall** — rigid cellulose layer for support
- **Chloroplasts** — site of photosynthesis
- **Large Central Vacuole** — stores water and maintains turgor pressure

### Key Facts
| Feature | Animal Cell | Plant Cell |
|---------|-------------|------------|
| Cell Wall | No | Yes (cellulose) |
| Chloroplasts | No | Yes |
| Vacuole | Small | Large central |
| Shape | Irregular | Fixed/rectangular |

### Prokaryotes vs Eukaryotes
Cells also divide into two broad categories:
- **Prokaryotic cells** — bacteria and archaea; no nucleus, no membrane-bound organelles, much smaller
- **Eukaryotic cells** — plants, animals, fungi, protists; have a true nucleus and organelles

Eukaryotic cells are typically 10-100 times larger than prokaryotic ones and can specialize into hundreds of cell types within one organism.

**Why it matters:**
Understanding cell structure is the foundation of all biology. Every disease, every medicine, every crop improvement ultimately comes down to understanding what happens inside cells. Cancer, infections, and even aging all begin at the cellular level.`,
  },

  // ----------------------------------------------------------------
  // 2. DNA AND GENES
  // ----------------------------------------------------------------
  {
    id: 'dna-and-genes',
    patterns: [/\b(dna|gene|genes|genome|chromosome|chromosomes|dna kya hai|dna kya hota hai|genes kya hain|double helix|genetic code)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## DNA and Genes

DNA (Deoxyribonucleic Acid) is the molecule that carries the genetic instructions for life. It is found in nearly every living cell and is what makes you uniquely you.

### The Double Helix
DNA looks like a twisted ladder — a structure called a **double helix**, discovered by James Watson and Francis Crick in 1953 using Rosalind Franklin's X-ray data. The sides of the ladder are made of sugar (deoxyribose) and phosphate, while the rungs are made of paired nitrogen bases.

### The Four Bases
DNA uses just four chemical letters to spell every gene:
- **A** — Adenine
- **T** — Thymine
- **C** — Cytosine
- **G** — Guanine

A always pairs with T, and C always pairs with G. This is called **complementary base pairing**.

### What is a Gene?
A gene is a specific section of DNA that codes for a protein. Humans have about 20,000 genes spread across 23 pairs of chromosomes. The complete set of your DNA is called your **genome**.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Shape | Double helix |
| Bases | A, T, C, G |
| Pairs | A-T and C-G |
| Human chromosomes | 46 (23 pairs) |
| Human genes | ~20,000 |

**Why it matters:**
DNA explains inheritance, disease risk, ancestry, and is the basis for genetic engineering, forensic science, and personalized medicine. Your DNA contains about 3 billion base pairs — written out, it would fill 200 phone books.`,
  },

  // ----------------------------------------------------------------
  // 3. PHOTOSYNTHESIS
  // ----------------------------------------------------------------
  {
    id: 'photosynthesis-explained',
    patterns: [/\b(photosynthesis|photosynthesis kya hai|poday khana kaise banate hain|poday khana kaise banate|poday khana kaise banate hain chlorophyll|chlorophyll|poday roshni se khana)\b/i],
    intent: 'how_to',
    topic: 'biology',
    response: () => `## Photosynthesis Explained

Photosynthesis is the process by which plants, algae, and some bacteria convert sunlight, water, and carbon dioxide into glucose and oxygen. It is the foundation of nearly every food chain on Earth.

### The Word Equation
Carbon dioxide + Water + Sunlight → Glucose + Oxygen

### The Chemical Equation
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

### Two Main Stages
- **Light-Dependent Reactions** — occur in the thylakoid membranes of chloroplasts. Chlorophyll absorbs sunlight and splits water molecules, releasing oxygen and producing ATP and NADPH.
- **Light-Independent Reactions (Calvin Cycle)** — occur in the stroma. ATP and NADPH are used to fix carbon dioxide into glucose.

### Where It Happens
Photosynthesis takes place inside **chloroplasts**, specialized organelles containing the green pigment **chlorophyll**. Chlorophyll absorbs red and blue light but reflects green — that is why plants look green. A single leaf cell may contain 40-50 chloroplasts, and a full-grown tree can have hundreds of billions of them working together.

### Variations Across Plants
- **C3 plants** — most common (wheat, rice, soybeans)
- **C4 plants** — more efficient in hot sunlight (corn, sugarcane)
- **CAM plants** — open stomata at night to save water (cacti, pineapple)

### Key Facts
| Aspect | Detail |
|--------|--------|
| Location | Chloroplasts |
| Pigment | Chlorophyll |
| Inputs | CO₂, water, sunlight |
| Outputs | Glucose, oxygen |
| Importance | Food source + oxygen for Earth |

**Why it matters:**
Without photosynthesis, life as we know it would not exist. Plants produce the oxygen we breathe and form the base of nearly every food chain. They also absorb CO₂, helping regulate Earth's climate.`,
  },

  // ----------------------------------------------------------------
  // 4. EVOLUTION AND NATURAL SELECTION
  // ----------------------------------------------------------------
  {
    id: 'evolution-natural-selection',
    patterns: [/\b(evolution|natural selection|darwin|darwin ka theory|evolution kya hai|nashunul selection|theory of evolution|survival of the fittest)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Evolution and Natural Selection

Evolution is the process by which living organisms change over generations through gradual changes in their inherited traits. It explains how all life on Earth is connected and how species adapt to their environments.

### Darwin's Theory
Charles Darwin published *On the Origin of Species* in 1859. His theory of **natural selection** had four key ideas:
1. **Variation** — individuals in a population have different traits
2. **Inheritance** — traits are passed from parents to offspring
3. **Overproduction** — more offspring are born than can survive
4. **Differential Survival** — individuals with beneficial traits survive and reproduce more

### How It Works
Organisms better suited to their environment leave more offspring. Over thousands of generations, small advantages add up. The classic example is the peppered moth — light-colored moths were common before the Industrial Revolution, but dark-colored moths became dominant on soot-covered trees.

### Evidence for Evolution
- Fossil record showing gradual change
- DNA similarities between species
- Anatomical homologies (similar bone structures)
- Direct observation (antibiotic-resistant bacteria)

### Key Facts
| Aspect | Detail |
|--------|--------|
| Proposed by | Charles Darwin (1859) |
| Mechanism | Natural selection |
| Timescale | Thousands to millions of years |
| Unit | Population, not individual |

**Why it matters:**
Evolution unifies all of biology. It explains antibiotic resistance, crop breeding, human ancestry, and why species look the way they do. As Theodosius Dobzhansky famously said, nothing in biology makes sense except in the light of evolution.`,
  },

  // ----------------------------------------------------------------
  // 5. HUMAN DIGESTIVE SYSTEM
  // ----------------------------------------------------------------
  {
    id: 'digestive-system',
    patterns: [/\b(digestive system|hazma nizam|stomach|intestine|intestines|hazma|hazma kaise hota hai|digestion|hazma system)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Human Digestive System

The digestive system breaks down food into nutrients the body can absorb and use. It runs from the mouth to the anus and is supported by accessory organs like the liver, pancreas, and gallbladder.

### The Journey of Food
- **Mouth** — chewing mechanically breaks food; salivary amylase begins starch digestion
- **Esophagus** — pushes food down via peristalsis (wave-like muscle contractions)
- **Stomach** — mixes food with gastric acid and pepsin to digest proteins; produces chyme
- **Small Intestine** — most digestion and absorption happens here; villi increase surface area
- **Large Intestine** — absorbs water and electrolytes; houses gut bacteria
- **Rectum/Anus** — stores and expels waste

### Digestive Enzymes
- **Amylase** — breaks down starch into sugars
- **Pepsin** — breaks down proteins in the stomach
- **Trypsin** — continues protein digestion in the small intestine
- **Lipase** — breaks down fats into fatty acids
- **Lactase** — breaks down lactose in milk

### Accessory Organs
- **Liver** — produces bile to emulsify fats
- **Gallbladder** — stores and releases bile
- **Pancreas** — produces digestive enzymes and insulin

### The Gut Microbiome
Your large intestine houses about 38 trillion bacteria — more microbes than you have human cells. This **gut microbiome** helps ferment fiber, makes vitamins (K and some B vitamins), trains the immune system, and even influences mood through the gut-brain axis. Eating diverse plant foods keeps this microbiome healthy.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Total length | About 9 meters |
| Small intestine length | ~6 meters |
| Digestion time | 24-72 hours |
| Stomach acid pH | 1.5-3.5 |

**Why it matters:**
Every cell in your body depends on nutrients absorbed by the digestive system. Poor digestion affects energy, immunity, mood, and growth.`,
  },

  // ----------------------------------------------------------------
  // 6. HUMAN CIRCULATORY SYSTEM
  // ----------------------------------------------------------------
  {
    id: 'circulatory-system',
    patterns: [/\b(circulatory system|dil aur khoon|blood circulation|heart|khoon ka nizam|circulation kya hai|cardiovascular|blood vessels)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Human Circulatory System

The circulatory system is the body's transport network, delivering oxygen and nutrients to every cell while removing carbon dioxide and waste. It consists of the heart, blood, and blood vessels.

### The Heart
The human heart is a four-chambered muscular pump:
- **Right Atrium** — receives deoxygenated blood from the body
- **Right Ventricle** — pumps blood to the lungs
- **Left Atrium** — receives oxygenated blood from the lungs
- **Left Ventricle** — pumps blood to the entire body (thickest wall)

The heart beats about 100,000 times per day, pumping roughly 7,500 liters of blood daily.

### Blood Vessels
- **Arteries** — carry blood away from the heart (thick muscular walls)
- **Veins** — carry blood back to the heart (have valves to prevent backflow)
- **Capillaries** — tiny vessels where gas and nutrient exchange happens

### Blood Components
- **Red Blood Cells** — carry oxygen via hemoglobin
- **White Blood Cells** — fight infection
- **Platelets** — clot blood to stop bleeding
- **Plasma** — liquid part that carries nutrients, hormones, and waste

### Two Circulations
- **Pulmonary Circulation** — heart to lungs to heart
- **Systemic Circulation** — heart to body to heart

### Key Facts
| Aspect | Detail |
|--------|--------|
| Heart rate (resting) | 60-100 beats/min |
| Blood volume | ~5 liters in adults |
| Blood types | A, B, AB, O (+/- Rh) |
| Blood vessels total | ~100,000 km |

**Why it matters:**
Cardiovascular disease is the world's leading cause of death. Understanding this system helps prevent heart attacks, strokes, and hypertension.`,
  },

  // ----------------------------------------------------------------
  // 7. HUMAN RESPIRATORY SYSTEM
  // ----------------------------------------------------------------
  {
    id: 'respiratory-system',
    patterns: [/\b(respiratory system|sans lene ka nizam|lungs|phephde|sans lena|respiration|breathing|sans|sans nal)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Human Respiratory System

The respiratory system is responsible for breathing — taking in oxygen and removing carbon dioxide. Every cell in your body needs oxygen to produce energy.

### Path of Air
1. **Nose/Mouth** — air is filtered, warmed, and moistened
2. **Pharynx** — throat, shared with digestive system
3. **Larynx** — voice box, contains vocal cords
4. **Trachea** — windpipe, kept open by cartilage rings
5. **Bronchi** — two branches entering the lungs
6. **Bronchioles** — smaller branches inside the lungs
7. **Alveoli** — tiny air sacs where gas exchange happens

### Gas Exchange
The lungs contain about 300-500 million **alveoli**. Their walls are only one cell thick and surrounded by capillaries. Oxygen diffuses into the blood while carbon dioxide diffuses out.

### How Breathing Works
- **Inhalation** — diaphragm contracts and flattens, chest cavity expands, air rushes in
- **Exhalation** — diaphragm relaxes and rises, chest cavity shrinks, air is pushed out

The **diaphragm** is the main breathing muscle, located just below the lungs. Intercostal muscles between the ribs also assist, especially during exercise or deep breathing. Breathing is mostly automatic, controlled by the brainstem, but you can also override it voluntarily to hold your breath or sigh.

### Oxygen Transport
Once oxygen enters the blood at the alveoli, it binds to **hemoglobin** inside red blood cells. Hemoglobin can carry four oxygen molecules at once, releasing them to tissues that need energy. Carbon dioxide travels back as bicarbonate in plasma and is exhaled.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Lungs | Two (right has 3 lobes, left has 2) |
| Alveoli | 300-500 million |
| Breaths per day | ~20,000 |
| Oxygen in air | 21% |
| Breathing rate (rest) | 12-20 per min |

**Why it matters:**
You can survive weeks without food and days without water, but only minutes without oxygen. Respiratory diseases like asthma, COPD, and pneumonia are major causes of death worldwide.`,
  },

  // ----------------------------------------------------------------
  // 8. HUMAN NERVOUS SYSTEM
  // ----------------------------------------------------------------
  {
    id: 'nervous-system',
    patterns: [/\b(nervous system|dimagh aur asaab|brain|spinal cord|nervous system kya hai|dimagh kaise kaam karta|neurons|neurology|asaab)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Human Nervous System

The nervous system is the body's control and communication network. It senses the environment, processes information, and coordinates responses — all at lightning speed.

### Two Main Parts
- **Central Nervous System (CNS)** — brain and spinal cord
- **Peripheral Nervous System (PNS)** — all nerves outside the CNS

### The Brain
- **Cerebrum** — largest part, handles thinking, memory, language, voluntary movement
- **Cerebellum** — coordinates balance, posture, and fine movement
- **Brainstem** — controls automatic functions like breathing and heartbeat
- **Hippocampus** — forms new memories
- **Amygdala** — processes emotions, especially fear

### The Neuron
The nervous system is built from **neurons** — specialized cells that transmit electrical signals. A typical neuron has:
- **Dendrites** — receive signals
- **Cell Body** — contains nucleus
- **Axon** — carries signals away, can be up to 1 meter long
- **Myelin Sheath** — insulates the axon and speeds signals

Signals cross gaps called **synapses** using chemical messengers called neurotransmitters (like dopamine, serotonin, acetylcholine).

### The Spinal Cord
The spinal cord runs from the brainstem down the spine. It transmits signals between brain and body and controls **reflexes** — fast automatic responses that bypass the brain.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Neurons in brain | ~86 billion |
| Signal speed | Up to 120 m/s |
| Brain weight | ~1.4 kg |
| Synapses per neuron | 1,000-10,000 |

**Why it matters:**
Understanding the nervous system helps treat strokes, epilepsy, Alzheimer's, depression, and paralysis. It is also the foundation of neuroscience and AI research.`,
  },

  // ----------------------------------------------------------------
  // 9. HUMAN SKELETAL SYSTEM
  // ----------------------------------------------------------------
  {
    id: 'skeletal-system',
    patterns: [/\b(skeletal system|haddiyan|skeleton|bones|haddiyan kya hai|joints|skeleton kya hai|haddi|bone structure)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Human Skeletal System

The skeletal system forms the internal framework of the human body. It consists of 206 bones in adults, along with cartilage, ligaments, and joints.

### Major Functions
- **Support** — gives the body its shape
- **Protection** — skull protects brain, rib cage protects heart and lungs
- **Movement** — bones act as levers that muscles pull on
- **Blood Cell Production** — bone marrow makes red and white blood cells
- **Mineral Storage** — stores calcium and phosphorus

### Divisions of the Skeleton
- **Axial Skeleton** (80 bones) — skull, vertebral column, rib cage
- **Appendicular Skeleton** (126 bones) — arms, legs, shoulders, pelvis

### Key Bones
- **Skull** — 22 bones protecting the brain
- **Spine** — 33 vertebrae protecting the spinal cord
- **Femur** — longest and strongest bone in the body
- **Stapes** — smallest bone, located in the middle ear

### Types of Joints
- **Ball and Socket** — shoulder, hip (most movement)
- **Hinge** — elbow, knee (one direction)
- **Pivot** — neck (rotation)
- **Gliding** — wrists, ankles (sliding)
- **Fixed** — skull sutures (no movement)

### Bone Structure
Bone is living tissue with blood vessels and nerves. The hard outer layer is called **compact bone**, while the inner spongy layer is **cancellous bone**. **Bone marrow** inside long bones produces blood cells.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Adult bones | 206 |
| Baby bones | ~270 (many fuse) |
| Smallest bone | Stapes (ear) |
| Longest bone | Femur (thigh) |

**Why it matters:**
Bone health affects mobility, immunity, and quality of life. Osteoporosis, fractures, and arthritis are major health issues, especially as we age.`,
  },

  // ----------------------------------------------------------------
  // 10. HUMAN MUSCULAR SYSTEM
  // ----------------------------------------------------------------
  {
    id: 'muscular-system',
    patterns: [/\b(muscular system|pathay|muscles|muscle|muscular system kya hai|muscles kaise kaam karte|muscle types|patha|pathon)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Human Muscular System

The muscular system allows the body to move, maintain posture, circulate blood, and digest food. There are over 600 muscles in the human body, making up about 40% of total body weight.

### Three Types of Muscle

#### 1. Skeletal Muscle
Attached to bones by tendons, these muscles are **voluntary** — you control them consciously. They appear striped (striated) under a microscope. Examples include biceps, quadriceps, and hamstrings.

#### 2. Smooth Muscle
Found in the walls of hollow organs like the stomach, intestines, blood vessels, and bladder. These are **involuntary** — they work automatically without conscious control. They move food through the digestive tract and regulate blood pressure.

#### 3. Cardiac Muscle
Found only in the heart. It is involuntary but striated like skeletal muscle. Cardiac muscle cells are connected by special junctions called **intercalated discs** that let them beat in sync.

### How Muscles Work
Muscles work by **contraction** — they can only pull, never push. They work in opposing pairs:
- **Agonist** — the contracting muscle
- **Antagonist** — the relaxing muscle

For example, the biceps contracts to bend the elbow while the triceps relaxes; the triceps contracts to straighten the arm.

### Sliding Filament Theory
Inside muscle fibers are proteins called **actin** (thin) and **myosin** (thick). When signaled by nerves, myosin heads grab actin and pull, sliding filaments past each other. This shortens the muscle fiber.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Total muscles | 600+ |
| Body weight | ~40% muscle |
| Strongest muscle | Masseter (jaw) |
| Fastest muscle | Orbicularis oculi (blink) |
| Hardest working | Heart (cardiac) |

**Why it matters:**
Muscle health supports movement, metabolism, posture, and independence. Regular exercise preserves muscle mass, which declines with age.`,
  },

  // ----------------------------------------------------------------
  // 11. IMMUNE SYSTEM
  // ----------------------------------------------------------------
  {
    id: 'immune-system',
    patterns: [/\b(immune system|immunity|immunity kya hai|bimari se ladna|immune|quwwat e mudafiat|antibodies|vaccines|immunization)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Immune System

The immune system is the body's defense network against infections, toxins, and abnormal cells like cancer. It can distinguish self from non-self and remembers past invaders.

### Three Lines of Defense

#### First Line — Physical Barriers
- **Skin** — blocks most pathogens
- **Mucus** — traps microbes in nose and lungs
- **Stomach acid** — kills bacteria in food
- **Tears and saliva** — contain lysozyme that breaks down bacterial walls

#### Second Line — Innate Immunity
Fast, non-specific response that activates within hours:
- **Phagocytes** (macrophages, neutrophils) — engulf and digest invaders
- **Natural killer cells** — destroy virus-infected and cancer cells
- **Inflammation** — increases blood flow, brings immune cells, causes swelling and fever

#### Third Line — Adaptive Immunity
Slow but specific. Takes days to develop but creates long-lasting memory:
- **B cells** — produce antibodies that tag pathogens for destruction
- **T cells** — helper T cells coordinate, killer T cells destroy infected cells
- **Memory cells** — remain after infection, enabling faster response next time

### How Vaccines Work
Vaccines introduce a harmless piece of a pathogen (or weakened version). This trains the immune system to make memory cells. If the real pathogen ever enters, the body responds quickly — often before symptoms appear.

### Key Facts
| Aspect | Detail |
|--------|--------|
| White blood cells | 4,000-11,000 per microliter |
| Antibodies | ~10 billion different kinds |
| Spleen | Filters blood, stores immune cells |
| Thymus | Where T cells mature |

**Why it matters:**
Vaccines have saved more lives than any medical advance except clean water. Autoimmune diseases, allergies, and immunodeficiency affect millions worldwide.`,
  },

  // ----------------------------------------------------------------
  // 12. REPRODUCTION
  // ----------------------------------------------------------------
  {
    id: 'reproduction-basics',
    patterns: [/\b(reproduction|nasal|insan ka nasal|reproduction kaise hota hai|reproduction kya hai|fertilization|reproductive system|nasl)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Reproduction Basics

Reproduction is the biological process by which living things produce offspring, ensuring the continuation of their species. In humans, it involves the joining of male and female gametes.

### Two Types of Reproduction
- **Asexual** — one parent produces genetically identical offspring (bacteria, some plants)
- **Sexual** — two parents produce genetically unique offspring (humans, most animals)

### Human Reproductive Systems

#### Male System
- **Testes** — produce sperm and testosterone
- **Epididymis** — stores and matures sperm
- **Vas deferens** — transports sperm
- **Prostate and Seminal Vesicles** — produce fluid for semen

#### Female System
- **Ovaries** — produce eggs and estrogen/progesterone
- **Fallopian Tubes** — site of fertilization
- **Uterus** — where a fertilized egg implants and grows
- **Cervix** — opening of the uterus
- **Vagina** — birth canal

### The Menstrual Cycle
A roughly 28-day cycle controlled by hormones:
- **Follicular Phase** — egg matures in ovary
- **Ovulation** — egg released (around day 14)
- **Luteal Phase** — uterus thickens lining for possible pregnancy
- **Menstruation** — if no fertilization, lining sheds

### Fertilization and Pregnancy
A sperm fertilizes an egg in the fallopian tube, forming a **zygote**. The zygote divides and becomes a **blastocyst**, then implants in the uterus. Pregnancy lasts about 40 weeks, divided into three trimesters.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Sperm count per ejaculation | 200-500 million |
| Egg released per cycle | Usually 1 |
| Pregnancy length | ~40 weeks |
| Chromosomes from each parent | 23 |

**Why it matters:**
Understanding reproduction is essential for family planning, treating infertility, prenatal health, and preventing sexually transmitted infections.`,
  },

  // ----------------------------------------------------------------
  // 13. GENETICS AND HEREDITY
  // ----------------------------------------------------------------
  {
    id: 'genetics-heredity',
    patterns: [/\b(genetics|heredity|mendel|dominant|recessive|genetics kya hai|heredity kya hai|punnett square|inherited traits)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Genetics and Heredity

Genetics is the study of how traits pass from parents to offspring. Heredity explains why children look like their parents and why certain diseases run in families.

### Gregor Mendel — The Father of Genetics
In the 1860s, an Austrian monk named Gregor Mendel experimented with pea plants. By crossing plants with different traits (tall vs short, green vs yellow peas), he discovered the basic laws of inheritance.

### Mendel's Laws
- **Law of Segregation** — each parent passes one allele for each trait
- **Law of Independent Assortment** — genes for different traits are inherited independently

### Dominant and Recessive Traits
Every gene has variants called **alleles**. Some alleles are dominant (shown with a capital letter) and others are recessive (lowercase):
- **AA** — homozygous dominant (shows dominant trait)
- **Aa** — heterozygous (shows dominant trait, carries recessive)
- **aa** — homozygous recessive (shows recessive trait)

### Examples in Humans
- **Tongue rolling** — dominant trait
- **Attached earlobes** — recessive trait
- **Eye color** — multiple genes; brown generally dominant over blue
- **Blood type** — codominant (A and B are both dominant, O is recessive)

### Punnett Squares
A Punnett square predicts the probability of offspring traits. Two heterozygous parents (Aa crossed with Aa) have:
- 25% chance AA
- 50% chance Aa
- 25% chance aa

### Key Facts
| Aspect | Detail |
|--------|--------|
| Father of genetics | Gregor Mendel |
| Human chromosomes | 46 (23 pairs) |
| Human genes | ~20,000 |
| Genomes sequenced | Millions worldwide |

**Why it matters:**
Genetics explains inherited diseases (sickle cell, cystic fibrosis, hemophilia), enables genetic counseling, and underlies modern biotechnology, agriculture, and personalized medicine.`,
  },

  // ----------------------------------------------------------------
  // 14. BACTERIA AND VIRUSES
  // ----------------------------------------------------------------
  {
    id: 'bacteria-vs-viruses',
    patterns: [/\b(bacteria|virus|viruses|germs|bacteria aur virus mein farq|bacteria kya hai|virus kya hai|pathogen|infection)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Bacteria vs Viruses

Bacteria and viruses are both microscopic agents that can cause disease, but they are fundamentally different in structure, behavior, and treatment.

### Bacteria
Bacteria are **living single-celled organisms** found everywhere — soil, water, on your skin, in your gut. Most bacteria are harmless or beneficial; fewer than 1% cause disease.

- **Size** — 1-10 micrometers (much larger than viruses)
- **Structure** — single cell with cell wall, no nucleus (prokaryote)
- **Reproduction** — binary fission (split in two)
- **Examples** — E. coli, Streptococcus, Salmonella, Mycobacterium tuberculosis
- **Treatment** — antibiotics

### Viruses
Viruses are **non-living infectious particles**. They cannot reproduce or eat on their own — they must invade a host cell and hijack its machinery.

- **Size** — 20-300 nanometers (100x smaller than bacteria)
- **Structure** — genetic material (DNA or RNA) wrapped in a protein coat
- **Reproduction** — only inside a host cell
- **Examples** — influenza, HIV, COVID-19, measles, common cold
- **Treatment** — antivirals and vaccines; antibiotics do NOT work

### Key Differences
| Feature | Bacteria | Virus |
|---------|----------|-------|
| Living? | Yes | No |
| Size | Larger | Tiny |
| Reproduction | Independent | Needs host |
| Nucleus | No (prokaryote) | None |
| Antibiotics? | Effective | Useless |

### Good Bacteria
Your gut contains trillions of beneficial bacteria that:
- Help digest food
- Produce vitamins (K, B12)
- Train the immune system
- Protect against harmful microbes

### Key Facts
| Aspect | Detail |
|--------|--------|
| Bacterial species on Earth | Estimated 1 trillion |
| Bacteria in human gut | ~38 trillion |
| Viruses on Earth | ~10^31 |
| First antibiotic | Penicillin (1928) |

**Why it matters:**
Misusing antibiotics for viral infections causes antibiotic resistance — one of the biggest health threats of the 21st century.`,
  },

  // ----------------------------------------------------------------
  // 15. FUNGI KINGDOM
  // ----------------------------------------------------------------
  {
    id: 'fungi-kingdom',
    patterns: [/\b(fungi|fungus|mashroom|mushroom|khaadar|yeast|mold|fungi kya hain|fungi kingdom|mould)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Fungi Kingdom

Fungi are a kingdom of living organisms that include mushrooms, yeasts, molds, and mildews. They are neither plants nor animals, but form their own distinct group with unique features.

### What Makes a Fungus?
- **No chlorophyll** — cannot photosynthesize; must absorb nutrients from other sources
- **Cell walls made of chitin** — same material as insect exoskeletons
- **Eukaryotic** — cells have a true nucleus
- **Heterotrophic** — get food by decomposing organic matter or living as parasites

### How Fungi Get Food
Fungi release **enzymes** into their surroundings that break down dead material, then absorb the nutrients. This makes them Earth's great recyclers — without fungi, forests would be buried under dead leaves and logs.

### Major Types of Fungi

#### Mushrooms
The visible part is only the fruiting body. The main fungus lives underground as a network of threads called **mycelium**. Some mushrooms are edible (button, shiitake), while others like the death cap are deadly poisonous.

#### Yeasts
Single-celled fungi used for thousands of years:
- **Baking** — yeast produces CO₂ that makes bread rise
- **Brewing** — yeast ferments sugars into alcohol
- **Scientific research** — model organism for studying cells

#### Molds
Multi-cellular fungi that grow as fuzzy colonies:
- **Penicillium** — produces the antibiotic penicillin
- **Aspergillus** — used to make soy sauce
- **Rhizopus** — black bread mold

### Key Facts
| Aspect | Detail |
|--------|--------|
| Known species | ~148,000 |
| Estimated total | Up to 3.8 million |
| Largest organism | Honey fungus (Oregon, 9.6 km²) |
| Cell wall | Chitin |

**Why it matters:**
Fungi give us antibiotics, bread, beer, cheese, and decompose dead matter. But they also cause diseases in crops (rice blast), humans (athlete's foot), and can destroy buildings.`,
  },

  // ----------------------------------------------------------------
  // 16. PLANT CLASSIFICATION
  // ----------------------------------------------------------------
  {
    id: 'plant-classification',
    patterns: [/\b(plant classification|poday ki iqsaam|vascular|non vascular|angiosperm|gymnosperm|poday ki qismein|bryophyte|ferns)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Plant Classification

Plants are a diverse kingdom with over 400,000 known species. Botanists classify them based on how they transport water, reproduce, and produce seeds.

### Major Plant Groups

#### 1. Non-Vascular Plants (Bryophytes)
The simplest plants, without true roots, stems, or leaves. They absorb water directly through their surface.
- **Examples** — mosses, liverworts, hornworts
- **Size** — small, low-growing
- **Habitat** — damp, shady places
- **Reproduction** — spores

#### 2. Vascular Seedless Plants
Have true vascular tissue (xylem and phloem) but reproduce with spores, not seeds.
- **Examples** — ferns, horsetails, club mosses
- **Features** — taller than bryophytes, true roots
- **Habitat** — moist environments

#### 3. Gymnosperms (Cone-Bearing Plants)
Vascular plants that produce seeds but no flowers. Seeds are naked (not enclosed in fruit).
- **Examples** — pine, fir, spruce, ginkgo, cycads
- **Features** — needle-like leaves, cones
- **Adaptation** — well-suited to cold and dry climates

#### 4. Angiosperms (Flowering Plants)
The most diverse and successful group — over 300,000 species. Produce flowers and seeds enclosed in fruit.
- **Monocots** — one seed leaf, parallel veins (grasses, lilies, orchids, palms)
- **Dicots** — two seed leaves, branching veins (roses, beans, oaks, sunflowers)

### Vascular Tissue
- **Xylem** — carries water and minerals up from roots
- **Phloem** — carries sugars down from leaves

### Key Facts
| Group | Seed | Flower | Vascular |
|-------|------|--------|----------|
| Bryophytes | No | No | No |
| Ferns | No | No | Yes |
| Gymnosperms | Yes | No | Yes |
| Angiosperms | Yes | Yes | Yes |

**Why it matters:**
Plants produce oxygen, food, medicine, wood, and fiber. Understanding their classification helps agriculture, conservation, and medicine development.`,
  },

  // ----------------------------------------------------------------
  // 17. ANIMAL CLASSIFICATION
  // ----------------------------------------------------------------
  {
    id: 'animal-classification',
    patterns: [/\b(animal classification|janwar ki iqsaam|vertebrate|invertebrate|janwar ki qismein|animal kingdom|phylum|taxonomic)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Animal Classification

The animal kingdom has over 1.5 million described species. Scientists classify animals based on whether they have a backbone, body structure, and how they develop.

### Two Main Groups

#### Invertebrates (No Backbone)
About 97% of all animal species. They lack a vertebral column but show incredible diversity.
- **Arthropods** — insects, spiders, crabs (most diverse group)
- **Mollusks** — snails, octopus, clams
- **Annelids** — earthworms, leeches
- **Cnidarians** — jellyfish, corals, sea anemones
- **Echinoderms** — starfish, sea urchins
- **Sponges** — simplest animals, filter feeders

#### Vertebrates (With Backbone)
About 3% of species but include the largest and most complex animals.
- **Fish** — gills, scales, cold-blooded (salmon, sharks)
- **Amphibians** — live on land and water, lay eggs in water (frogs, salamanders)
- **Reptiles** — scaly skin, cold-blooded, lay eggs on land (snakes, lizards, turtles)
- **Birds** — feathers, warm-blooded, lay eggs (eagles, penguins, sparrows)
- **Mammals** — hair, warm-blooded, produce milk (humans, whales, dogs)

### Key Characteristics Used for Classification
- **Body symmetry** — radial (jellyfish) vs bilateral (most animals)
- **Body cavity** — coelom vs no coelom
- **Development** — protostome vs deuterostome
- **Reproduction** — sexual vs asexual
- **Temperature regulation** — warm-blooded vs cold-blooded

### Key Facts
| Aspect | Detail |
|--------|--------|
| Total described animals | ~1.5 million |
| Invertebrate share | ~97% |
| Vertebrate species | ~70,000 |
| Mammal species | ~6,400 |
| Largest animal | Blue whale |
| Smallest animal | Rotifer |

**Why it matters:**
Animal classification helps biologists understand evolution, ecology, and conservation. It also informs medicine — many drugs are tested on specific animal models due to shared biology.`,
  },

  // ----------------------------------------------------------------
  // 18. ECOSYSTEMS AND FOOD CHAINS
  // ----------------------------------------------------------------
  {
    id: 'ecosystems-food-chains',
    patterns: [/\b(ecosystem|food chain|food web|khane ki zanjeer|ecosystem kya hai|trophic level|producer consumer|biome)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Ecosystems and Food Chains

An ecosystem is a community of living organisms interacting with each other and their physical environment. Every ecosystem follows the same basic patterns of energy flow.

### Ecosystem Components
- **Biotic factors** — living parts (plants, animals, microbes)
- **Abiotic factors** — non-living parts (sunlight, water, soil, temperature, air)

### Energy Flow and Trophic Levels
Energy enters ecosystems from the sun and flows through feeding relationships:
- **Producers (autotrophs)** — plants, algae, some bacteria; make food via photosynthesis
- **Primary Consumers (herbivores)** — eat plants (deer, grasshoppers, rabbits)
- **Secondary Consumers (carnivores)** — eat herbivores (frogs, snakes, foxes)
- **Tertiary Consumers (apex predators)** — top of the chain (lions, eagles, sharks)
- **Decomposers** — fungi and bacteria that break down dead matter, returning nutrients to soil

### Food Chain vs Food Web
A **food chain** shows a single path of energy flow:
Grass → Grasshopper → Frog → Snake → Hawk

A **food web** shows many interconnected chains, reflecting the reality that most animals eat more than one type of food.

### Energy Pyramid
Only about **10% of energy** passes from one trophic level to the next. The rest is lost as heat. This is why top predators are rare and need large territories.

### Types of Ecosystems
- **Terrestrial** — forests, grasslands, deserts, tundra
- **Aquatic** — oceans, coral reefs, rivers, lakes, wetlands
- **Artificial** — farms, cities, gardens

### Key Facts
| Aspect | Detail |
|--------|--------|
| Energy transfer | ~10% per level |
| Largest ecosystem | Ocean (71% of Earth) |
| Most productive | Tropical rainforests, coral reefs |
| Most biodiverse | Amazon rainforest |

**Why it matters:**
Healthy ecosystems provide clean air, water, food, and climate stability. Human disruption — deforestation, pollution, climate change — threatens the services we depend on for survival.`,
  },

  // ----------------------------------------------------------------
  // 19. CELL DIVISION
  // ----------------------------------------------------------------
  {
    id: 'cell-division',
    patterns: [/\b(cell division|mitosis|meiosis|cell division kya hai|mitosis aur meiosis|cytokinesis|cell cycle|chromatid)\b/i],
    intent: 'how_to',
    topic: 'biology',
    response: () => `## Cell Division: Mitosis vs Meiosis

Cell division is how cells reproduce. There are two main types — mitosis and meiosis — each with a very different purpose and outcome.

### Mitosis — Growth and Repair
Mitosis produces two genetically identical daughter cells from one parent cell. It happens in **somatic (body) cells** and is how we grow and heal.

### Stages of Mitosis
1. **Prophase** — chromosomes condense, nuclear membrane dissolves
2. **Metaphase** — chromosomes line up at the center
3. **Anaphase** — sister chromatids pull apart to opposite sides
4. **Telophase** — new nuclear membranes form
5. **Cytokinesis** — cell splits into two

### Meiosis — Making Gametes
Meiosis produces sperm and egg cells (gametes). It involves **two divisions** (Meiosis I and Meiosis II) and results in **four genetically unique daughter cells**, each with half the chromosome count.

### Why Meiosis Matters
- Reduces chromosome number from 46 to 23 (so fertilization restores 46)
- Creates genetic diversity through **crossing over** and **independent assortment**
- Without meiosis, chromosome count would double every generation

### Key Differences
| Feature | Mitosis | Meiosis |
|---------|---------|---------|
| Purpose | Growth, repair | Reproduction |
| Cell type | Body cells | Sex cells |
| Divisions | 1 | 2 |
| Daughter cells | 2 | 4 |
| Chromosome count | Same (46) | Half (23) |
| Genetic variation | Identical | Unique |

### The Cell Cycle
Between divisions, cells go through:
- **Interphase** — cell grows and copies DNA (G1, S, G2)
- **M Phase** — mitosis and cytokinesis
- **Checkpoint controls** — ensure DNA is intact before dividing

### Key Facts
| Aspect | Detail |
|--------|--------|
| Mitosis duration | ~1-2 hours |
| Cell cycle (typical) | ~24 hours |
| Chromosome pairs (human) | 23 |
| Cross-over events | 1-3 per chromosome pair |

**Why it matters:**
Errors in cell division cause cancer (uncontrolled mitosis) and genetic disorders like Down syndrome (extra chromosome 21 from meiosis errors).`,
  },

  // ----------------------------------------------------------------
  // 20. PROTEIN SYNTHESIS
  // ----------------------------------------------------------------
  {
    id: 'protein-synthesis',
    patterns: [/\b(protein synthesis|protein kaise banta hai|transcription|translation|dna to rna|central dogma|messenger rna|mrna|ribosome|codon)\b/i],
    intent: 'how_to',
    topic: 'biology',
    response: () => `## Protein Synthesis

Protein synthesis is the process by which cells build proteins from the instructions in DNA. It is one of the most fundamental processes in all of biology.

### The Central Dogma
DNA → RNA → Protein

This flow of genetic information, called the **central dogma**, was described by Francis Crick in 1958.

### Step 1: Transcription (DNA to RNA)
Happens inside the nucleus:
- An enzyme called **RNA polymerase** unzips the DNA at the target gene
- It reads one DNA strand and builds a matching **messenger RNA (mRNA)** copy
- In RNA, the base **thymine (T)** is replaced by **uracil (U)**
- The mRNA then leaves the nucleus through a pore

Before leaving, mRNA is processed — introns (non-coding regions) are cut out and exons (coding regions) are spliced together.

### Step 2: Translation (RNA to Protein)
Happens at the **ribosomes** in the cytoplasm:
- mRNA attaches to a ribosome
- **Transfer RNA (tRNA)** molecules each carry a specific amino acid
- tRNA has a three-base **anticodon** that matches the mRNA **codon**
- The ribosome reads mRNA three bases at a time
- Amino acids are joined together with peptide bonds

### The Genetic Code
Every three mRNA bases (a **codon**) code for one amino acid:
- **AUG** — start codon (methionine)
- **UAA, UAG, UGA** — stop codons
- 64 possible codons, 20 amino acids — so most amino acids have multiple codons

### Key Molecules
| Molecule | Role |
|----------|------|
| DNA | Original instructions |
| mRNA | Carries message out of nucleus |
| tRNA | Delivers amino acids |
| rRNA | Forms ribosome structure |
| Ribosome | Where translation happens |

**Why it matters:**
Every enzyme, hormone, muscle fiber, and antibody in your body is a protein. Understanding protein synthesis enables biotechnology, vaccine development, and treatments for genetic diseases.`,
  },

  // ----------------------------------------------------------------
  // 21. HUMAN EYE AND VISION
  // ----------------------------------------------------------------
  {
    id: 'human-eye-vision',
    patterns: [/\b(human eye|aankh|eye vision|vision|aankh kaise kaam karti|retina|cornea|pupil|ophthalmology)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Human Eye and Vision

The human eye is a remarkable biological camera that converts light into electrical signals the brain can interpret. It works so smoothly that we rarely think about the incredible biology happening every moment we see.

### Parts of the Eye
- **Cornea** — clear front layer that bends (refracts) light
- **Iris** — colored part; controls how much light enters
- **Pupil** — black opening that expands or shrinks
- **Lens** — focuses light onto the retina
- **Retina** — light-sensitive layer at the back; contains photoreceptors
- **Optic Nerve** — carries signals to the brain
- **Sclera** — white outer protective layer
- **Vitreous Humor** — gel filling the eyeball

### How Vision Works
1. Light enters through the cornea, which bends it
2. The iris adjusts the pupil size for brightness
3. The lens fine-tunes focus (accommodation)
4. Light hits the retina, where photoreceptors convert it to electrical signals
5. The optic nerve sends signals to the visual cortex in the brain
6. The brain flips the upside-down image and processes it

### Two Types of Photoreceptors
- **Rods** — about 120 million per eye; detect light/dark; work in dim light; give black-and-white vision
- **Cones** — about 6 million per eye; need bright light; detect color (three types: red, green, blue)

### Common Vision Problems
- **Myopia (nearsightedness)** — image focuses in front of retina
- **Hyperopia (farsightedness)** — image focuses behind retina
- **Astigmatism** — irregular cornea causes blurry vision
- **Color blindness** — usually missing or faulty cones (often red-green)

### Key Facts
| Aspect | Detail |
|--------|--------|
| Photoreceptors | ~126 million per eye |
| Blink rate | 15-20 per minute |
| Image processing | Brain flips it (retina image is upside-down) |
| Colors humans see | ~1 million |

**Why it matters:**
Vision is our dominant sense — about 80% of what we learn comes through sight. Eye health is closely linked to overall health (diabetes, hypertension affect eyes).`,
  },

  // ----------------------------------------------------------------
  // 22. HUMAN EAR AND HEARING
  // ----------------------------------------------------------------
  {
    id: 'human-ear-hearing',
    patterns: [/\b(human ear|kaan|hearing|kaan kaise kaam karta|sunnna|ear biology|cochlea|eardrum|auditory)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Human Ear and Hearing

The human ear does more than hear — it also controls balance. It converts sound waves into electrical signals the brain interprets as sound.

### Three Parts of the Ear

#### Outer Ear
- **Pinna (auricle)** — visible fleshy part; collects sound waves
- **Ear canal** — carries sound to the eardrum
- **Earwax (cerumen)** — traps dust and repels insects

#### Middle Ear
- **Eardrum (tympanic membrane)** — vibrates when sound hits it
- **Ossicles** — three tiny bones (the smallest in the body):
  - **Malleus** (hammer)
  - **Incus** (anvil)
  - **Stapes** (stirrup)
- **Eustachian tube** — equalizes pressure between ear and throat

#### Inner Ear
- **Cochlea** — snail-shaped organ with hair cells that convert vibration to electrical signals
- **Semicircular canals** — three fluid-filled loops that detect head movement and balance
- **Auditory nerve** — sends signals to the brain

### How Hearing Works
1. Sound waves are collected by the pinna
2. Waves travel through the ear canal and vibrate the eardrum
3. The ossicles amplify the vibrations
4. The stapes pushes against the cochlea's oval window
5. Fluid in the cochlea moves, bending tiny **hair cells**
6. Hair cells convert motion to electrical signals
7. The auditory nerve carries signals to the brain's auditory cortex

### How Balance Works
The three semicircular canals are filled with fluid and lined with hair cells. When your head moves, the fluid lags behind, bending the hairs. This tells your brain which way you are moving — essential for standing, walking, and not falling.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Smallest bone | Stapes (3 mm) |
| Audible frequencies | 20-20,000 Hz |
| Hair cells | ~16,000 per ear |
| Sound speed in air | ~343 m/s |

**Why it matters:**
Hearing loss affects 466 million people worldwide. Understanding the ear helps treat deafness with cochlear implants, prevent noise damage, and address vertigo and balance disorders.`,
  },

  // ----------------------------------------------------------------
  // 23. SLEEP BIOLOGY
  // ----------------------------------------------------------------
  {
    id: 'sleep-biology',
    patterns: [/\b(sleep biology|neend kyun aati hai|rem sleep|sleep cycles|neend ka biology|circadian rhythm|neend|deep sleep|insomnia)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Sleep Biology

Sleep is not just resting — it is an active biological process essential for survival. The brain is remarkably busy during sleep, consolidating memories, repairing cells, and regulating hormones.

### Why We Sleep
- **Memory consolidation** — brain moves short-term memories to long-term storage
- **Cell repair** — tissues grow and repair, muscles relax
- **Immune function** — immune system produces cytokines during sleep
- **Hormone regulation** — growth hormone, cortisol, melatonin released
- **Brain cleaning** — the glymphatic system flushes out toxins built up during the day

### The Sleep Cycle (~90 minutes)
Sleep happens in cycles, repeating 4-6 times per night:

#### Non-REM Sleep
- **Stage N1** — light sleep, easy to wake (5-10% of sleep)
- **Stage N2** — body temperature drops, heart rate slows (45-55%)
- **Stage N3 (Deep Sleep)** — hardest to wake; body repairs tissues, builds bone; occurs mostly early in the night (15-25%)

#### REM Sleep
**Rapid Eye Movement** sleep is when most dreaming happens. The brain is nearly as active as when awake, but voluntary muscles are paralyzed (so we don't act out dreams). REM increases toward morning.

### Circadian Rhythm
The body's internal 24-hour clock is controlled by the **suprachiasmatic nucleus** in the brain. It responds to light:
- **Morning light** — suppresses melatonin, makes you alert
- **Darkness** — melatonin rises, prepares body for sleep

### Key Facts
| Aspect | Detail |
|--------|--------|
| Adult sleep need | 7-9 hours |
| Sleep cycle length | ~90 minutes |
| Cycles per night | 4-6 |
| REM percentage | 20-25% |
| World record (no sleep) | 11 days |

**Why it matters:**
Chronic sleep deprivation raises risk of heart disease, diabetes, depression, obesity, and Alzheimer's. Sleep affects everything from mood to immune function to weight management.`,
  },

  // ----------------------------------------------------------------
  // 24. NUTRITION BASICS
  // ----------------------------------------------------------------
  {
    id: 'nutrition-basics',
    patterns: [/\b(nutrition|macronutrients|micronutrients|nutrition kya hai|khana aur nutrition|diet basics|carbohydrates|proteins|fats|vitamins|minerals)\b/i],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `## Nutrition Basics

Nutrition is the science of how food nourishes the body. The human body needs dozens of different nutrients to function, repair itself, and stay healthy.

### Macronutrients (needed in large amounts)

#### Carbohydrates
- **Main energy source** — 4 calories per gram
- **Simple** — sugars (fruit, honey, table sugar); quick energy
- **Complex** — starches (rice, bread, oats); sustained energy
- **Fiber** — plant material the body can't digest; aids digestion and gut health

#### Proteins
- **Building blocks** of muscles, enzymes, hormones, and immune cells
- **4 calories per gram**
- Made of 20 amino acids; 9 are essential (must come from food)
- Sources — meat, fish, eggs, beans, nuts, dairy

#### Fats (Lipids)
- **9 calories per gram** (most energy-dense)
- **Saturated** — animal fats, butter; solid at room temperature
- **Unsaturated** — olive oil, nuts, fish; liquid; better for heart
- **Trans fats** — processed; harmful, avoid
- Fats build cell membranes, hormones, and insulate the body

#### Water
- About 60% of body weight
- Needed for digestion, temperature regulation, and waste removal

### Micronutrients (needed in small amounts)
- **Vitamins** — A, B-complex, C, D, E, K
- **Minerals** — calcium (bones), iron (blood), zinc (immunity), magnesium, potassium

### Daily Caloric Needs
| Person | Calories/day |
|--------|--------------|
| Adult woman | ~2,000 |
| Adult man | ~2,500 |
| Active teen | 2,400-3,200 |

**Why it matters:**
Poor nutrition causes obesity, diabetes, heart disease, and malnutrition. A balanced diet with variety is the single most powerful tool for long-term health.`,
  },

  // ----------------------------------------------------------------
  // 25. ENZYMES
  // ----------------------------------------------------------------
  {
    id: 'enzymes-explained',
    patterns: [/\b(enzymes|enzyme|enzyme kya hai|enzymes kya hain|enzyme kaise kaam karte|catalyst|biological catalyst|active site)\b/i],
    intent: 'how_to',
    topic: 'biology',
    response: () => `## Enzymes Explained

Enzymes are biological catalysts — proteins that speed up chemical reactions in living things without being used up. Without enzymes, most reactions in your body would be far too slow to sustain life.

### What Enzymes Do
Every moment, billions of chemical reactions happen in your cells — digesting food, building DNA, releasing energy, repairing damage. Enzymes make these reactions happen **millions of times faster** than they would on their own.

### How Enzymes Work
Enzymes work using the **lock-and-key model**:
- Each enzyme has an **active site** — a specific shape that fits one particular molecule (the **substrate**)
- The substrate binds to the active site, forming an enzyme-substrate complex
- The reaction occurs, products are released
- The enzyme is unchanged and can be reused

Some enzymes use the newer **induced-fit model** — the active site slightly changes shape to fit the substrate, like a glove on a hand.

### Factors Affecting Enzyme Activity
- **Temperature** — each enzyme has an optimum (around 37°C in humans); too hot denatures it
- **pH** — each enzyme works best at a specific pH (pepsin in stomach pH 2, trypsin in intestine pH 8)
- **Substrate concentration** — more substrate means faster reaction, up to a maximum
- **Enzyme concentration** — more enzyme = faster reaction

### Important Enzymes in the Body
- **Amylase** — breaks down starch (in saliva)
- **Pepsin** — breaks down protein (in stomach)
- **Trypsin** — continues protein digestion (in intestine)
- **Lipase** — breaks down fats
- **DNA polymerase** — copies DNA during cell division
- **ATP synthase** — produces ATP energy in mitochondria
- **Lactase** — breaks down milk sugar (lactose)

### Key Facts
| Aspect | Detail |
|--------|--------|
| Type | Protein (mostly) |
| Reused? | Yes, many times |
| Body temperature optimum | ~37°C |
| Reaction speedup | Up to 10^17 times |

**Why it matters:**
Enzymes are used in medicine (digestive aids, blood tests), industry (laundry detergents, cheese, biofuel), and biotechnology (PCR, genetic engineering). Life without enzymes is impossible.`,
  },
]
