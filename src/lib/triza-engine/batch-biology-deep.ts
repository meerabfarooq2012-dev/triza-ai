/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — BIOLOGY DEEP DIVE (Batch 3b)
 * ============================================================
 *
 *  15 DETAILED entries covering DEEPER biology subtopics that
 *  build on the foundations in batch-biology.ts — DNA forms,
 *  RNA types, replication, mutations, chromosomes, genetic
 *  engineering, respiration, meiosis & mitosis phases, the
 *  endocrine system, blood typing, the brain, stem cells,
 *  adaptive immunity, and ecological organization.
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries and include BOTH
 *  English and Roman Urdu phrasings so TRIZA can match
 *  questions from bilingual users.
 *
 *  NO external LLM API is used. These are facts TRIZA has
 *  "learned" and will express in its own voice via the
 *  self-expression + narration engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const BIOLOGY_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. DNA TYPES AND STRUCTURAL FORMS (A-DNA, B-DNA, Z-DNA)
  // ----------------------------------------------------------------
  {
    id: 'dna-types-structure',
    patterns: [/\b(a-dna|b-dna|z-dna|dna form|dna forms|dna conformation|dna structure types|major groove|minor groove|dna ki shakal)\b/i],
    keywords: ['a-dna', 'b-dna', 'z-dna', 'dna form', 'dna conformation', 'major groove', 'minor groove', 'helix'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `DNA usually comes to mind as a single shape — the elegant twisted ladder James Watson and Francis Crick described in 1953. In reality, the same DNA molecule can adopt several different structural forms depending on conditions, sequence, and environment. The three main forms are called A-DNA, B-DNA, and Z-DNA, and each one tells us something different about how the molecule of inheritance behaves.

### B-DNA — The Standard Form
B-DNA is the form Watson and Crick modeled, and it is the dominant shape inside living cells under normal physiological conditions. It is a right-handed helix, meaning the strands twist clockwise as you look down the axis. The helix makes a full turn every 10.5 base pairs, with the bases stacked 0.34 nanometers apart and a diameter of about 2 nanometers. B-DNA has clearly distinct major and minor grooves, and these grooves are where proteins like transcription factors bind to read the genetic message.

### A-DNA — The Dehydrated Form
A-DNA is also a right-handed helix, but it is shorter, wider, and more compact than B-DNA. The base pairs are tilted about 20 degrees from perpendicular, and the helix completes a turn every 11 base pairs. A-DNA appears when DNA is dehydrated or in low-humidity environments, and it is also the form adopted by double-stranded RNA and RNA-DNA hybrids. Because RNA has an extra hydroxyl group on its sugar, the double helix cannot adopt the B form and instead settles into the A conformation.

### Z-DNA — The Left-Handed Mirror
Z-DNA is the most unusual of the three. It is a left-handed helix, twisting counterclockwise instead of clockwise, and it has a zigzag backbone — which is where the name "Z" comes from. Z-DNA forms in regions of DNA with alternating purine and pyrimidine bases, particularly alternating cytosine and guanine sequences. The structure is thinner, with 12 base pairs per turn, and it is believed to play a role in regulating gene expression and in protecting the genome during certain cellular stresses.

### Conditions and Biological Significance
DNA is not a rigid statue — it is a dynamic molecule that can flip between forms. B-DNA is the default inside cells. A-DNA forms when water is scarce or in RNA hybrids. Z-DNA flickers into existence in specific sequences, often near gene promoters, where it may help switch genes on or off. Some viruses and bacteria also exploit these structural transitions. Researchers have found that certain proteins specifically recognize Z-DNA, suggesting the shape itself carries information beyond the sequence.

### Why It Matters
Understanding DNA's structural diversity helps us understand how the same molecule can do so many different jobs. The grooves of B-DNA tell proteins where to bind. The compact A-form protects genetic material under harsh conditions. The unusual Z-form may act as a switch. Cancer research, antiviral drug design, and genetic engineering all rely on knowing not just what DNA says, but how it is shaped when it says it.`,
  },

  // ----------------------------------------------------------------
  // 2. RNA TYPES (mRNA, tRNA, rRNA, miRNA, snRNA)
  // ----------------------------------------------------------------
  {
    id: 'rna-types-detailed',
    patterns: [/\b(trna|rrna|mirna|snrna|transfer rna|ribosomal rna|microrna|small nuclear rna|types of rna|rna types|rna ki iqsaam)\b/i],
    keywords: ['trna', 'rrna', 'mirna', 'snrna', 'transfer rna', 'ribosomal rna', 'microrna', 'small nuclear rna', 'rna types'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `RNA is often described as DNA's helper, but that understates its importance. DNA mostly sits safely in the nucleus storing information; RNA does almost everything else — carrying instructions, building proteins, regulating genes, and even catalyzing chemical reactions. Cells contain several distinct kinds of RNA, each shaped for a specific job.

### Messenger RNA (mRNA)
Messenger RNA is the courier that carries genetic instructions from DNA in the nucleus to the ribosomes in the cytoplasm. It is single-stranded and is built during transcription, when an enzyme reads a gene and synthesizes a complementary RNA copy. In eukaryotes, mRNA is processed — introns are spliced out, a 5-prime cap is added, and a poly-A tail is attached — before it leaves the nucleus. The mRNA sequence is read in three-letter codons that specify amino acids. COVID-19 mRNA vaccines work by delivering a synthetic mRNA that instructs cells to make a viral spike protein, training the immune system.

### Transfer RNA (tRNA)
Transfer RNA is the adapter molecule that translates the codon language of mRNA into the amino acid language of proteins. Each tRNA folds into a characteristic cloverleaf shape, with an anticodon on one end that matches a specific mRNA codon and an attached amino acid on the other end. There are about 20 different tRNAs in most cells, one for each amino acid. As the ribosome moves along mRNA, tRNAs deliver their amino acids one by one, building the growing protein chain.

### Ribosomal RNA (rRNA)
Ribosomal RNA is the structural and catalytic core of the ribosome, the cell's protein-making machine. Ribosomes are about 60 percent rRNA and 40 percent protein, and it is the rRNA — not the protein — that actually catalyzes the formation of peptide bonds between amino acids. This made rRNA one of the first known catalytic RNAs, supporting the idea that early life may have relied on RNA alone, before proteins and DNA evolved.

### MicroRNA (miRNA)
MicroRNAs are tiny — about 22 nucleotides long — but enormously influential. They do not code for proteins. Instead, they bind to messenger RNAs and either block their translation or mark them for destruction. A single miRNA can regulate hundreds of different mRNAs, fine-tuning gene expression across entire networks. More than one thousand miRNAs have been identified in humans, and they play critical roles in development, cell division, and diseases including cancer.

### Small Nuclear RNA (snRNA)
Small nuclear RNAs work inside the nucleus as part of the spliceosome, the molecular machine that removes introns from pre-mRNA. They pair with proteins to form small nuclear ribonucleoproteins, often called snurps, which recognize splice sites and assemble the spliceosome. Without snRNA, eukaryotic genes could not produce mature mRNA, and protein synthesis would stall.

### Why It Matters
The discovery that RNA comes in so many functional forms reshaped molecular biology. We now know that much of the genome once called "junk DNA" actually encodes regulatory RNAs like miRNA. RNA-based therapies — mRNA vaccines, RNA interference drugs, and antisense oligonucleotides — are now treating diseases that were previously untouchable. RNA is not just DNA's messenger; it is the working molecule of the cell.`,
  },

  // ----------------------------------------------------------------
  // 3. DNA REPLICATION (semiconservative, Okazaki, enzymes)
  // ----------------------------------------------------------------
  {
    id: 'dna-replication-process',
    patterns: [/\b(dna replication|okazaki|leading strand|lagging strand|helicase|primase|dna polymerase|dna ligase|semiconservative|replication fork|dna nakal kaise)\b/i],
    keywords: ['dna replication', 'okazaki', 'leading strand', 'lagging strand', 'helicase', 'primase', 'dna polymerase', 'dna ligase', 'semiconservative', 'replication fork'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `Every time a cell divides, it must copy its entire genome — about 3 billion base pairs in humans — with near-perfect accuracy. This feat is carried out by DNA replication, a tightly orchestrated process that involves dozens of enzymes working together at breathtaking speed. The result is two identical DNA molecules, each containing one original strand and one newly made strand.

### The Semiconservative Model
DNA replication is called semiconservative because each new DNA molecule conserves one of the original strands. The double helix unwinds, and each parent strand serves as a template for assembling a new complementary strand. Matthew Meselson and Franklin Stahl proved this in 1958 using DNA labeled with heavy and light nitrogen isotopes, in what has been called the most beautiful experiment in biology.

### Initiation and the Replication Fork
Replication begins at specific sites called origins of replication, where initiator proteins bind and pry the two strands apart. An enzyme called helicase then unwinds the helix by breaking the hydrogen bonds between base pairs, creating a Y-shaped structure called the replication fork. Single-strand binding proteins coat the exposed strands to prevent them from snapping back together, and an enzyme called topoisomerase relieves the twisting tension ahead of the fork by cutting and rejoining the DNA.

### Leading and Lagging Strands
DNA polymerase, the master builder, can only add new nucleotides in one direction — the 5-prime to 3-prime direction. Because the two parent strands run antiparallel, one new strand is built continuously toward the fork. This is the leading strand. The other strand, called the lagging strand, is built in short discontinuous segments because polymerase has to wait for the fork to open up before it can work in the correct direction.

### Okazaki Fragments and Primase
The short segments on the lagging strand are called Okazaki fragments, named after Reiji Okazaki who discovered them in 1968. DNA polymerase cannot start a new strand from scratch — it can only extend an existing chain. So an enzyme called primase lays down a short RNA primer first, which polymerase then extends. Each Okazaki fragment begins with its own RNA primer.

### Finishing the Job
Once the fragments are built, another DNA polymerase removes the RNA primers and replaces them with DNA. Finally, an enzyme called DNA ligase seals the remaining nicks, joining the fragments into one continuous strand. Proofreading enzymes check the work as it goes, catching and correcting errors. The result is a copying error rate of roughly one in a billion base pairs.

### Why It Matters
DNA replication is the molecular basis of heredity, growth, and healing. Every cell that has ever divided — in your body, in plants, in bacteria — has relied on this exact machinery. Understanding replication has also given us powerful tools: PCR, the technique that amplifies DNA for everything from forensic analysis to COVID testing, is essentially replication in a tube. Cancer drugs, antibiotics, and antiviral therapies often target replication enzymes specifically, attacking diseased cells where they divide.`,
  },

  // ----------------------------------------------------------------
  // 4. GENETIC MUTATIONS (point, frameshift, causes, effects)
  // ----------------------------------------------------------------
  {
    id: 'genetic-mutations-types',
    patterns: [/\b(point mutation|missense|nonsense|silent mutation|frameshift|mutation|mutations|mutagen|insertion mutation|deletion mutation|mutation kya hai)\b/i],
    keywords: ['mutation', 'point mutation', 'missense', 'nonsense', 'silent', 'frameshift', 'insertion', 'deletion', 'mutagen'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `A mutation is any change in the DNA sequence of an organism. Mutations are the raw material of evolution — without them, life would never change — but they are also the source of many inherited diseases and cancers. Understanding the different types of mutations helps us predict their effects and design treatments.

### Point Mutations
A point mutation changes a single nucleotide base. These come in three flavors, depending on the effect they have on the resulting protein. A silent mutation changes a base but produces the same amino acid, because the genetic code is redundant — multiple codons specify the same amino acid. A missense mutation changes a codon so that it specifies a different amino acid, which may or may not affect the protein's function. Sickle cell anemia is caused by a single missense mutation that swaps glutamic acid for valine in hemoglobin. A nonsense mutation changes a codon into a stop signal, prematurely ending the protein and usually destroying its function.

### Frameshift Mutations
A frameshift mutation is more disruptive than most point mutations. It happens when a single base is inserted into or deleted from the DNA sequence. Because the ribosome reads mRNA in three-letter codons, adding or removing one base shifts the entire reading frame from that point onward. Every codon downstream is changed, producing a completely different amino acid sequence and usually encountering a premature stop codon. Frameshift mutations almost always cripple the protein.

### Larger Scale Mutations
Beyond single bases, larger changes can occur. Insertions and deletions of many bases at once can disrupt genes. Duplications can create extra copies of a gene, sometimes leading to overproduction of a protein. Inversions flip a segment of DNA backward, and translocations move a segment to a different chromosome entirely. Some of these large mutations cause no obvious harm, while others — like the translocation between chromosomes 9 and 22 that creates the Philadelphia chromosome — drive cancers.

### Causes of Mutations
Mutations arise from two main sources. Spontaneous mutations occur during normal cellular processes, especially during DNA replication when polymerase occasionally makes an error. Induced mutations are caused by external agents called mutagens. Ultraviolet light, X-rays, tobacco smoke, certain chemicals, and some viruses all damage DNA. Cells have repair systems that fix most damage, but some errors slip through.

### Effects on the Organism
Mutations can be harmful, neutral, or beneficial. Most are neutral because they occur in non-coding regions or do not change protein function. Harmful mutations cause genetic diseases like cystic fibrosis and Huntington's disease, and they accumulate in cancer cells. Beneficial mutations are rare but drive evolution — they are the variations that natural selection acts upon.

### Why It Matters
Mutation is the engine of genetic diversity and the source of much human disease. Modern medicine increasingly works at the mutation level: genetic tests detect disease-causing variants, targeted cancer drugs attack cells with specific mutations, and gene-editing tools like CRISPR aim to correct mutations directly. By understanding how mutations arise and what they do, we gain the power to read, predict, and someday rewrite the genetic instructions of life.`,
  },

  // ----------------------------------------------------------------
  // 5. CHROMOSOME TYPES AND KARYOTYPING
  // ----------------------------------------------------------------
  {
    id: 'chromosome-types-karyotype',
    patterns: [/\b(autosome|autosomes|sex chromosome|karyotype|karyotyping|aneuploidy|down syndrome|turner syndrome|klinefelter|homologous|trisomy)\b/i],
    keywords: ['autosome', 'sex chromosome', 'karyotype', 'aneuploidy', 'down syndrome', 'turner syndrome', 'klinefelter', 'trisomy', 'homologous'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `Inside nearly every human cell, about 6 feet of DNA is packed into 46 chromosomes — 23 pairs — that fit inside a nucleus only a few microns wide. These chromosomes carry all our genetic information, and their structure and number tell a story about health, development, and inheritance.

### Autosomes and Sex Chromosomes
Of the 23 pairs, 22 are called autosomes and are numbered 1 through 22, roughly in order of size. Autosomes carry the genes that run the body's general operations — everything from eye color to enzymes. The 23rd pair is the sex chromosomes, which determine biological sex. Females typically have two X chromosomes (XX), while males typically have one X and one Y chromosome (XY). The Y chromosome is much smaller than the X and carries relatively few genes, but it includes the SRY gene that triggers male development.

### Homologous Pairs
The two chromosomes in each autosomal pair are called homologous chromosomes. They have the same genes in the same order, but they may carry different versions of those genes — called alleles. You inherited one chromosome of each pair from your mother and one from your father. This is why you have two copies of every gene, and why you might inherit a gene for blue eyes from one parent and a gene for brown eyes from the other.

### Karyotyping
A karyotype is a photographed, organized display of a person's chromosomes. To create one, scientists collect dividing cells, stain the chromosomes, photograph them under a microscope, and arrange the images into matched pairs. The stain produces characteristic banding patterns that help identify each chromosome and spot structural abnormalities. Karyotyping is used in prenatal testing, cancer diagnosis, and investigation of developmental disorders.

### Aneuploidy — Wrong Chromosome Numbers
Aneuploidy is a condition in which a person has an abnormal number of chromosomes — usually one too many or one too few. The most well-known example is Down syndrome, or trisomy 21, in which a person has three copies of chromosome 21 instead of two. People with Down syndrome typically have intellectual disability of varying degree, characteristic facial features, and a higher risk of certain heart conditions. Turner syndrome affects females who have only one X chromosome instead of two — they are usually shorter, may not go through puberty without treatment, and are often infertile. Klinefelter syndrome affects males who have an extra X chromosome (XXY) — they may have lower testosterone, less body hair, and reduced fertility.

### Causes of Aneuploidy
Most aneuploidy results from nondisjunction, a failure of chromosomes to separate properly during meiosis. This produces eggs or sperm with an extra or missing chromosome. The risk of nondisjunction rises with the mother's age, which is why Down syndrome is more common in babies born to older mothers.

### Why It Matters
Chromosome number and structure are critical to normal development. Even a single extra chromosome can disrupt thousands of genes. Karyotyping allows doctors to diagnose genetic conditions before birth, guide reproductive decisions, and detect certain cancers. As gene therapy and chromosome-level genetic engineering advance, our understanding of chromosome biology moves from diagnosis toward potential treatment.`,
  },

  // ----------------------------------------------------------------
  // 6. GENETIC ENGINEERING (CRISPR-Cas9, recombinant DNA, GMO, gene therapy)
  // ----------------------------------------------------------------
  {
    id: 'genetic-engineering-crispr',
    patterns: [/\b(crispr|cas9|recombinant dna|gene cloning|gmo|gmos|gene therapy|genetic engineering|gene editing|gene drive|genetically modified)\b/i],
    keywords: ['crispr', 'cas9', 'recombinant dna', 'gene cloning', 'gmo', 'gene therapy', 'genetic engineering', 'gene editing'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `Genetic engineering is the deliberate modification of an organism's DNA. For most of history, humans shaped genes slowly through selective breeding; in the last 50 years, we have learned to edit DNA directly, with growing precision and growing power to treat disease, improve crops, and even rewrite species.

### Recombinant DNA Technology
The first wave of genetic engineering began in the 1970s with recombinant DNA. Scientists use restriction enzymes that cut DNA at specific sequences, then join pieces from different organisms using an enzyme called ligase. The classic application is inserting the human insulin gene into bacteria, which then produce human insulin for diabetes treatment. Before this, insulin was extracted from cows and pigs. Recombinant DNA gave us a pure, unlimited supply.

### Gene Cloning
Gene cloning is the process of making many identical copies of a gene. A target gene is inserted into a plasmid — a small circular DNA molecule from bacteria — which is then taken up by bacteria. As the bacteria divide, they copy the plasmid and the gene along with it. Cloning allows researchers to produce enough DNA for sequencing, study gene function, and manufacture proteins like growth hormone, clotting factors, and vaccines.

### Genetically Modified Organisms (GMOs)
GMOs are organisms whose genomes have been altered using genetic engineering. The most widely grown GMO crops include insect-resistant corn and herbicide-tolerant soybeans. Golden Rice, engineered to produce beta-carotene to fight vitamin A deficiency, is a celebrated example of nutrition-focused genetic engineering. The debate over GMOs is complex: supporters emphasize higher yields, lower pesticide use, and climate resilience, while critics raise concerns about ecological effects, corporate control of seeds, and labeling.

### CRISPR-Cas9
CRISPR-Cas9, developed as a gene-editing tool around 2012, transformed genetic engineering. CRISPR is a natural defense system that bacteria use to remember and destroy viruses. Scientists adapted it into a programmable editor: a guide RNA directs the Cas9 enzyme to a specific DNA sequence, where Cas9 cuts the DNA. The cell's repair machinery then heals the cut, sometimes with a new sequence provided by researchers. CRISPR is faster, cheaper, and more precise than older methods, and it has been used in laboratories to correct mutations that cause sickle cell disease, muscular dystrophy, and certain forms of blindness.

### Gene Therapy
Gene therapy aims to treat disease by fixing or replacing genes inside a patient's cells. In 2023, the FDA approved the first CRISPR-based therapy for sickle cell disease, in which a patient's own blood stem cells are edited to produce healthy hemoglobin and returned to the body. Other gene therapies deliver working copies of genes using harmless viruses as carriers. Gene therapy holds promise for inherited disorders that have had no cure, though challenges around safety, cost, and long-term effects remain.

### Why It Matters
Genetic engineering is changing medicine, agriculture, and industry at a fundamental level. Children with once-fatal genetic diseases are now being treated. Crops can survive droughts and resist pests. The next challenges are ethical — how to use these tools responsibly, who has access to them, and where to draw the line between healing and enhancement. The power to rewrite DNA is one of the defining technologies of this century.`,
  },

  // ----------------------------------------------------------------
  // 7. CELLULAR RESPIRATION (glycolysis, Krebs, ETC)
  // ----------------------------------------------------------------
  {
    id: 'cellular-respiration-steps',
    patterns: [/\b(cellular respiration|glycolysis|krebs cycle|citric acid cycle|electron transport chain|atp production|oxidative phosphorylation|aerobic respiration|anaerobic respiration|respiration kaise)\b/i],
    keywords: ['cellular respiration', 'glycolysis', 'krebs cycle', 'citric acid cycle', 'electron transport chain', 'atp', 'aerobic', 'anaerobic'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `Every breath you take feeds an intricate molecular machine inside your cells that converts food into the energy currency called ATP. This process, cellular respiration, powers nearly everything your body does — from thinking to running to keeping your heart beating. It happens continuously in every cell of every animal, plant, and fungus.

### The Big Picture
Cellular respiration breaks down glucose and other fuel molecules to produce ATP. The overall equation is one molecule of glucose plus six molecules of oxygen produces six molecules of carbon dioxide, six molecules of water, and roughly 36 to 38 molecules of ATP. The process unfolds in three main stages — glycolysis, the Krebs cycle, and the electron transport chain — each located in a different part of the cell.

### Glycolysis
Glycolysis is the oldest part of the pathway, occurring in the cytoplasm without oxygen. The word means "sugar splitting," and that is exactly what happens. One molecule of glucose, a six-carbon sugar, is broken into two molecules of pyruvate, each with three carbons. The process consumes two ATP to get started and produces four ATP, for a net gain of two. It also produces two molecules of NADH, which carry high-energy electrons to later stages. Glycolysis does not require oxygen, which is why it can fuel short bursts of intense activity even when oxygen is scarce.

### The Krebs Cycle
If oxygen is present, pyruvate enters the mitochondria, where it is converted into acetyl-CoA and fed into the Krebs cycle, also called the citric acid cycle. This cycle of reactions takes place in the mitochondrial matrix and produces carbon dioxide as waste. Each turn of the cycle releases stored energy as ATP, NADH, and FADH2. Because each glucose molecule yields two pyruvate, the cycle turns twice per glucose, producing a small amount of ATP directly and a much larger pool of electron carriers.

### The Electron Transport Chain
The electron transport chain is where most ATP is made. NADH and FADH2 deliver their electrons to a series of protein complexes embedded in the inner mitochondrial membrane. As electrons pass from one complex to the next, they release energy that pumps hydrogen ions across the membrane, building a gradient. The flow of hydrogen ions back through an enzyme called ATP synthase drives the production of about 32 to 34 ATP per glucose. Oxygen is the final electron acceptor, combining with hydrogen to form water. Without oxygen, the chain stalls and ATP production collapses.

### Aerobic vs Anaerobic Respiration
Aerobic respiration uses oxygen and produces about 36 to 38 ATP per glucose. When oxygen is not available, cells fall back on anaerobic pathways. In human muscles under heavy exertion, pyruvate is converted into lactic acid, allowing glycolysis to continue but yielding only 2 ATP per glucose. Yeast and some bacteria perform fermentation, converting pyruvate into ethanol and carbon dioxide — the basis of brewing and baking.

### Why It Matters
Cellular respiration is the cellular counterpart of photosynthesis — together they cycle carbon and energy through the living world. Without respiration, the food we eat would be useless; with it, a single glucose molecule releases enough energy to power muscle contraction, nerve signals, and the synthesis of every molecule your body makes. Diseases that impair respiration, like mitochondrial disorders, are devastating precisely because no cell can survive long without its energy supply.`,
  },

  // ----------------------------------------------------------------
  // 8. MEIOSIS DETAILED (crossing over, independent assortment)
  // ----------------------------------------------------------------
  {
    id: 'meiosis-detailed-phases',
    patterns: [/\b(meiosis i|meiosis ii|prophase i|metaphase i|anaphase i|telophase i|crossing over|independent assortment|synapsis|chiasmata|bivalent|tetrad)\b/i],
    keywords: ['meiosis', 'crossing over', 'independent assortment', 'synapsis', 'chiasmata', 'bivalent', 'tetrad', 'prophase i'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `Meiosis is the special cell division that produces sperm and egg cells. Unlike ordinary cell division, which makes identical copies, meiosis shuffles genetic information and cuts the chromosome number in half. This is the foundation of sexual reproduction, the source of genetic variation between generations, and the reason no two of your children will ever be genetically identical.

### Why Meiosis Exists
Body cells are diploid, meaning they have two sets of chromosomes — one from each parent. If sperm and egg were also diploid, fertilization would double the chromosome count every generation. Meiosis solves this by producing haploid gametes with only one set of chromosomes, so that when sperm meets egg, the diploid number is restored. A human sperm has 23 chromosomes, a human egg has 23, and the resulting embryo has 46.

### Meiosis I — The Reduction Division
Meiosis has two rounds, and the first is the unusual one. Prophase I is the longest and most important phase. Homologous chromosomes — the maternal and paternal versions of the same chromosome — pair up in a process called synapsis. The paired structure is called a bivalent, or tetrad because it contains four chromatids. Chromosomes physically exchange pieces of DNA at contact points called chiasmata. This crossing over mixes maternal and paternal genes, creating chromosomes that have never existed before. Metaphase I follows, with paired homologous chromosomes lining up at the cell's equator. Anaphase I separates whole chromosomes, pulling one of each pair to opposite poles. Telophase I and cytokinesis produce two cells, each with half the chromosome number, though each chromosome still has two sister chromatids.

### Meiosis II — Like Mitosis
Meiosis II looks much like ordinary mitosis, but it happens in the two cells produced by meiosis I. Prophase II condenses the chromosomes again. Metaphase II lines them up at the equator. Anaphase II pulls the sister chromatids apart to opposite poles. Telophase II and cytokinesis divide each cell again, producing four haploid cells in total. Each of these cells has one copy of each chromosome and will mature into a gamete.

### Independent Assortment
Crossing over is not the only source of variation. During metaphase I, the way each homologous pair lines up — maternal chromosome on top or paternal chromosome on top — is random and independent of every other pair. This is called independent assortment. With 23 chromosome pairs in humans, the number of possible arrangements is 2 to the 23rd power — over 8 million combinations — even before crossing over is considered.

### Why It Matters
Meiosis is the engine of genetic diversity. Every egg and every sperm carries a unique combination of parental genes, thanks to crossing over and independent assortment. This diversity is what natural selection acts on, allowing populations to adapt to changing environments. Errors in meiosis also cause most chromosomal disorders, including Down syndrome, because chromosomes sometimes fail to separate properly. Understanding meiosis explains both the remarkable variety of life and the genetic risks that come with reproduction.`,
  },

  // ----------------------------------------------------------------
  // 9. MITOSIS DETAILED (phases, spindle, cytokinesis)
  // ----------------------------------------------------------------
  {
    id: 'mitosis-detailed-phases',
    patterns: [/\b(prophase|metaphase|anaphase|telophase|cytokinesis|mitotic spindle|sister chromatids|mitosis phases|phases of mitosis|mitosis kaise)\b/i],
    keywords: ['mitosis', 'prophase', 'metaphase', 'anaphase', 'telophase', 'cytokinesis', 'sister chromatids', 'mitotic spindle'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `Mitosis is the everyday kind of cell division that grows you from a single fertilized egg into a body of trillions of cells, and that constantly repairs and replaces them throughout your life. Each mitotic division produces two genetically identical daughter cells, each with a full copy of the genome. The process is tightly choreographed into distinct phases.

### Why Mitosis Exists
Mitosis serves three main purposes. Growth — a human embryo grows from one cell to trillions by mitosis. Repair — when you cut your skin, mitosis generates the new cells that close the wound. Replacement — many tissues, like the lining of your gut and the cells of your blood, must be continuously renewed. Single-celled organisms like amoebas also use a form of mitosis to reproduce asexually.

### Prophase — Preparing the Stage
Prophase is the longest phase of mitosis. Chromatin, the loose thread of DNA and protein, condenses into visible chromosomes. Because the DNA was copied earlier, each chromosome now consists of two sister chromatids joined at a centromere. Outside the nucleus, structures called centrosomes begin moving to opposite poles of the cell and sprout a network of protein fibers called the mitotic spindle. The nuclear envelope breaks down, releasing the chromosomes into the cytoplasm.

### Metaphase — Lining Up
Metaphase is short and precise. Spindle fibers attach to the centromeres of the chromosomes and pull them into a single line across the center of the cell, called the metaphase plate. A checkpoint operates here: the cell will not proceed until every chromosome is properly attached to spindle fibers from both poles. This checkpoint is one of the cell's main defenses against distributing chromosomes unequally.

### Anaphase — Pulling Apart
Anaphase begins when the centromeres split and the sister chromatids separate, becoming individual chromosomes. Spindle fibers shorten, dragging one set of chromosomes toward each pole. The cell elongates as the poles move apart. By the end of anaphase, each pole has a complete and identical set of chromosomes.

### Telophase and Cytokinesis — Two Cells
Telophase is essentially prophase in reverse. The chromosomes reach the poles and begin to decondense back into chromatin. A new nuclear envelope forms around each set, and the spindle breaks down. Cytokinesis, the physical division of the cytoplasm, usually begins during telophase. In animal cells, a ring of protein called actin pinches the cell membrane inward until the cell splits in two. In plant cells, a structure called the cell plate forms in the middle and grows outward until it fuses with the cell wall.

### Why It Matters
Mitosis is one of the most fundamental processes in biology. Without it, embryos could not develop, wounds could not heal, and short-lived cells could not be replaced. Cancer is essentially mitosis out of control — cells that ignore the checkpoints and divide when they should not. Many cancer drugs work by disrupting specific phases of mitosis, blocking spindle formation or preventing chromosome separation. By studying mitosis, we understand both the engine of life and one of the deepest roots of disease.`,
  },

  // ----------------------------------------------------------------
  // 10. HORMONES AND THE ENDOCRINE SYSTEM
  // ----------------------------------------------------------------
  {
    id: 'hormones-endocrine-system',
    patterns: [/\b(hormone|hormones|endocrine|pituitary|thyroid|adrenal|insulin|glucagon|growth hormone|cortisol|feedback loop|endocrine system|hormone kya hai)\b/i],
    keywords: ['hormone', 'endocrine', 'pituitary', 'thyroid', 'adrenal', 'insulin', 'glucagon', 'growth hormone', 'cortisol'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `Hormones are the body's long-distance messengers. While nerves send rapid electrical signals along fixed wires, hormones travel through the bloodstream to reach almost every cell, delivering slower but longer-lasting instructions. Together, the glands that produce hormones make up the endocrine system, which regulates growth, metabolism, reproduction, mood, and response to stress.

### How Hormones Work
A hormone is a chemical signal released by a gland into the blood. Only cells with the right receptor — typically on the cell surface or inside the cell — respond to a given hormone, the way a lock opens only to the right key. When a hormone binds its receptor, it triggers a cascade of changes inside the target cell, turning genes on or off, altering metabolism, or changing the cell's behavior. A single hormone can have very different effects in different tissues depending on which receptors they express.

### The Major Endocrine Glands
The pituitary gland, a pea-sized organ at the base of the brain, is often called the master gland because its hormones control other glands. It releases growth hormone, which drives body growth; thyroid-stimulating hormone, which controls the thyroid; and hormones that regulate the ovaries and testes. The thyroid gland in the neck sets the body's metabolic pace; too much thyroid hormone causes weight loss and rapid heartbeat, too little causes fatigue and weight gain. The adrenal glands, sitting atop the kidneys, produce cortisol — the body's main stress hormone — and adrenaline, which fuels the fight-or-flight response. The pancreas secretes insulin and glucagon, which together control blood sugar.

### Insulin and Glucagon
When you eat, blood sugar rises, and the pancreas releases insulin. Insulin signals cells to take up glucose and store it, bringing blood sugar back to normal. When blood sugar drops between meals, the pancreas releases glucagon, which tells the liver to release stored glucose back into the blood. Diabetes results when this system breaks down — in type 1 diabetes the pancreas cannot make insulin, and in type 2 diabetes cells stop responding to it.

### Feedback Loops
Hormone levels are controlled by feedback loops that work like a thermostat. When hormone levels rise high enough to do their job, the body detects the change and signals the gland to slow or stop production. This is called negative feedback. The system that controls thyroid hormone is a classic example: the hypothalamus releases TRH, the pituitary releases TSH, the thyroid releases thyroid hormone, and rising thyroid hormone feeds back to suppress both TRH and TSH. Positive feedback loops, rarer but powerful, amplify a response — like the oxytocin surge that drives childbirth contractions.

### Why It Matters
Endocrinology explains how the body maintains balance across time. Many common diseases — diabetes, thyroid disorders, growth problems, infertility — are hormonal. Hormone therapies treat these conditions and also drive innovations in birth control, gender-affirming care, and menopause management. Even everyday states like hunger, stress, love, and sleep are shaped by hormones. To understand the endocrine system is to understand the chemistry of being human.`,
  },

  // ----------------------------------------------------------------
  // 11. BLOOD TYPES (ABO and Rh)
  // ----------------------------------------------------------------
  {
    id: 'blood-types-abo-rh',
    patterns: [/\b(blood type|blood types|blood group|abo|rh factor|rh positive|rh negative|universal donor|universal recipient|blood group system|khoon ki group)\b/i],
    keywords: ['blood type', 'blood group', 'abo', 'rh factor', 'rh positive', 'rh negative', 'universal donor', 'universal recipient'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `Blood looks the same to the naked eye, but under a microscope it is highly individual. The surface of every red blood cell is studded with marker molecules called antigens, and your immune system is trained to recognize your own set. Mixing incompatible blood can trigger a deadly immune reaction, which is why blood typing has been one of the most important medical discoveries of the past century.

### The ABO System
The ABO blood group system sorts blood into four types — A, B, AB, and O — based on which antigens are present on the red blood cell surface. Type A has A antigens, type B has B antigens, type AB has both, and type O has neither. Your immune system produces antibodies against any antigen you do not have. So a person with type A blood has anti-B antibodies, a person with type B has anti-A, a person with type O has both, and a person with type AB has neither. These antibodies are present from infancy, probably due to early exposure to similar molecules on bacteria and food.

### Inheritance of ABO Type
Blood type is inherited from your parents. The ABO gene has three main versions, called alleles: A, B, and O. A and B are codominant, meaning that if you inherit both, you express both and have type AB blood. O is recessive, so to have type O blood you must inherit two O alleles. A parent with type A and a parent with type B can have a child of any blood type, depending on their hidden alleles.

### The Rh Factor
A second, equally important antigen is the Rh factor, named after the rhesus monkey in which it was first discovered. If your red blood cells have the Rh antigen, you are Rh positive; if they do not, you are Rh negative. Rh positivity is dominant, so an Rh-negative person has inherited two recessive alleles. The Rh factor matters most during pregnancy: if an Rh-negative mother carries an Rh-positive baby, her immune system may produce anti-Rh antibodies that can attack subsequent Rh-positive pregnancies. A simple injection given during and after pregnancy prevents this sensitization.

### Universal Donors and Recipients
In emergencies when there is no time for typing, certain blood types are used as universal stand-ins. Type O negative red blood cells have neither A, B, nor Rh antigens, so they can be transfused into almost any patient without triggering an immune reaction. People with O negative blood are called universal donors. Type AB positive plasma, on the other hand, contains no anti-A or anti-B antibodies, so AB positive individuals are called universal plasma recipients and can receive red blood cells of any type.

### Why It Matters
Safe blood transfusion is one of the foundations of modern medicine — surgery, trauma care, cancer treatment, and childbirth all depend on it. The ABO and Rh systems also matter in paternity testing, organ donation matching, and forensic science. Blood typing stands as a powerful reminder that small genetic differences can have life-or-death consequences, and that knowing your own blood type is a small piece of knowledge with outsized value.`,
  },

  // ----------------------------------------------------------------
  // 12. HUMAN BRAIN STRUCTURE
  // ----------------------------------------------------------------
  {
    id: 'human-brain-structure',
    patterns: [/\b(cerebrum|cerebellum|brainstem|brain stem|frontal lobe|parietal lobe|temporal lobe|occipital lobe|synapse|synapses|brain structure|human brain|dimagh)\b/i],
    keywords: ['cerebrum', 'cerebellum', 'brainstem', 'frontal lobe', 'parietal lobe', 'temporal lobe', 'occipital lobe', 'synapse', 'human brain'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `The human brain is the most complex object we know. Weighing about 1.4 kilograms and containing roughly 86 billion neurons, it generates thought, memory, emotion, movement, and consciousness itself. Despite this complexity, the brain has a clear anatomical structure, with each region specialized for particular tasks.

### The Three Major Regions
The brain is organized into three large parts: the cerebrum, the cerebellum, and the brainstem. The cerebrum is the largest part, filling most of the skull, and is responsible for higher functions like thinking, language, perception, and voluntary movement. The cerebellum sits beneath the cerebrum at the back of the head and coordinates movement, balance, and posture. The brainstem connects the brain to the spinal cord and controls basic life-sustaining functions like breathing, heart rate, and blood pressure.

### The Four Lobes of the Cerebrum
The cerebrum is divided into two hemispheres, and each hemisphere is further divided into four lobes. The frontal lobe, behind the forehead, handles reasoning, planning, decision-making, and voluntary movement; it also houses Broca's area, essential for speech production. The parietal lobe, at the top of the head, processes sensory information like touch, temperature, and pain, and helps us understand spatial relationships. The temporal lobe, on the sides near the ears, processes sound and language comprehension, and contains the hippocampus, crucial for memory. The occipital lobe, at the back of the brain, is devoted entirely to vision.

### Neurons and Synapses
The brain's basic working unit is the neuron, a specialized cell that communicates using electrical and chemical signals. A neuron has three main parts: dendrites that receive signals, a cell body that integrates them, and an axon that passes them on. Neurons connect at junctions called synapses, where electrical signals in one neuron trigger the release of chemical messengers called neurotransmitters. These cross the synaptic gap and bind to receptors on the next neuron, continuing the signal. The human brain has an estimated 100 trillion synapses, and the patterns of connection among them encode everything we know and are.

### The Cerebral Cortex
The outer layer of the cerebrum is the cerebral cortex, a wrinkled sheet of tissue about 2 to 4 millimeters thick. Its wrinkles dramatically increase surface area, fitting more cortex into the skull. The cortex is where conscious thought, language, and complex perception happen. Areas of the cortex can be mapped to specific functions — the motor cortex, the somatosensory cortex, the visual cortex, the auditory cortex, and the association areas that integrate information.

### Why It Matters
Understanding brain structure is the foundation of neuroscience, neurology, and psychiatry. Strokes, tumors, and injuries that affect specific brain regions produce specific deficits, which is how early neuroscientists mapped the brain by studying patients. Today, brain imaging lets us watch regions activate during thought and emotion, giving us a window into the mind. As we learn more, treatments for Alzheimer's disease, depression, stroke, and Parkinson's disease all become more precise, and the ancient puzzle of how matter gives rise to mind comes slowly into focus.`,
  },

  // ----------------------------------------------------------------
  // 13. STEM CELLS
  // ----------------------------------------------------------------
  {
    id: 'stem-cells-types',
    patterns: [/\b(stem cell|stem cells|embryonic stem|adult stem|pluripotent|totipotent|multipotent|differentiation|induced pluripotent|ipsc|regenerative medicine)\b/i],
    keywords: ['stem cell', 'embryonic stem cell', 'adult stem cell', 'pluripotent', 'totipotent', 'multipotent', 'differentiation', 'induced pluripotent'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `Most cells in your body are specialists — a muscle cell contracts, a nerve cell conducts signals, a red blood cell carries oxygen. Stem cells are different. They are the body's raw materials, cells that have not yet chosen a specialty and can both make copies of themselves and turn into other cell types. This dual ability makes them central to growth, healing, and the future of medicine.

### What Makes a Stem Cell
A stem cell is defined by two properties: self-renewal, the ability to divide and produce more stem cells, and differentiation, the ability to develop into specialized cell types. Stem cells sit at the top of a hierarchy: they divide to produce one stem cell and one daughter cell that commits to a particular fate, going through progressive stages of specialization until it becomes a fully differentiated cell.

### Totipotent, Pluripotent, and Multipotent
Stem cells are classified by how many cell types they can become. A totipotent stem cell can form an entire organism, including the placenta. The only totipotent cells in human development are the fertilized egg and the first few cells it divides into. Pluripotent stem cells can form any cell type in the body but not the placenta. Embryonic stem cells, derived from the inner cell mass of a blastocyst about five days after fertilization, are pluripotent. Multipotent stem cells can form several related cell types — for example, blood stem cells can form all the cells of the blood but not nerve or muscle cells.

### Embryonic vs Adult Stem Cells
Embryonic stem cells come from early embryos and are prized for their flexibility — they can become any cell in the body. Adult stem cells are found in many tissues throughout life, including bone marrow, skin, gut lining, and brain. They are less flexible but still vital, replenishing cells that wear out or are damaged. Bone marrow transplants, used for decades to treat leukemia and other blood disorders, rely on adult blood stem cells. The use of embryonic stem cells raises ethical questions because obtaining them typically involves destroying an embryo, which has led to intense debate and careful regulation.

### Induced Pluripotent Stem Cells (iPSCs)
In 2006, the scientist Shinya Yamanaka made a breakthrough: he showed that ordinary adult cells, like skin cells, could be reprogrammed back into pluripotent stem cells by activating just four genes. These induced pluripotent stem cells behave like embryonic stem cells but are made from a patient's own tissue, avoiding both the ethical concerns and the risk of immune rejection. iPSCs have transformed research and opened the door to personalized cell therapies.

### Medical Applications
Stem cell research promises to regenerate damaged tissues that the body cannot repair on its own. Clinical trials are testing stem cell therapies for spinal cord injury, heart failure, diabetes, Parkinson's disease, and blindness. Stem cells are also used to grow miniature organs called organoids in the lab, which let researchers study development and disease in ways that were never possible before.

### Why It Matters
Stem cells sit at the intersection of development, healing, and regenerative medicine. They have already saved lives through bone marrow transplants, and they may eventually let us grow replacement tissues, model diseases in a dish, and test drugs without putting patients at risk. Few areas of biology hold as much promise for transforming medicine in this century.`,
  },

  // ----------------------------------------------------------------
  // 14. IMMUNE SYSTEM DETAILED (innate, adaptive, B/T cells, vaccination)
  // ----------------------------------------------------------------
  {
    id: 'immune-system-detailed',
    patterns: [/\b(b cell|b cells|t cell|t cells|helper t|cytotoxic t|antibody|antibodies|vaccination|memory cell|innate immunity|adaptive immunity|antigen|macrophage|phagocyte)\b/i],
    keywords: ['b cell', 't cell', 'antibody', 'antibodies', 'vaccination', 'memory cell', 'innate immunity', 'adaptive immunity', 'antigen', 'macrophage'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `Your immune system is a sophisticated defense network that protects you against viruses, bacteria, fungi, parasites, and even your own cells when they turn cancerous. It works around the clock, usually without your awareness, and it learns from experience. The immune response is built from two cooperating systems — one fast and general, the other slow but exquisitely precise.

### Innate Immunity — The First Line
Innate immunity is the body's immediate, generic defense. It includes physical barriers like skin and mucous membranes, chemical defenses like stomach acid and antimicrobial proteins, and a set of white blood cells that attack anything they do not recognize. Macrophages and neutrophils are phagocytes — they engulf and digest invaders. Natural killer cells destroy virus-infected cells and tumor cells. The innate response is fast, acting within hours, but it does not improve with repeated exposure. It recognizes patterns common to many pathogens, not specific identities.

### Adaptive Immunity — The Second Line
Adaptive immunity kicks in when the innate system cannot clear an infection on its own. It is slower — taking days to ramp up — but it is far more powerful and far more specific. Adaptive immunity has memory: once it has fought a particular pathogen, it remembers that pathogen for years or decades, allowing a faster and stronger response on the next encounter.

### B Cells and Antibodies
B cells are lymphocytes that mature in the bone marrow. When a B cell encounters its matching antigen, it begins to divide and produce antibodies — Y-shaped proteins that bind to the antigen and mark the pathogen for destruction. Antibodies can neutralize toxins, prevent viruses from entering cells, and tag invaders for phagocytes to devour. Some B cells become memory B cells, which persist for years and stand ready to launch a rapid antibody response if the same pathogen returns.

### T Cells — Helpers and Killers
T cells mature in the thymus and come in two main varieties. Helper T cells coordinate the immune response by releasing chemical signals that activate B cells and other T cells. They are sometimes called the generals of the immune system. Cytotoxic T cells are the executioners: they recognize cells that have been infected by viruses or turned cancerous and release chemicals that trigger those cells to self-destruct. Both B cells and T cells depend on helper T cells for full activation, which is why HIV, which destroys helper T cells, is so devastating.

### Vaccination
Vaccination works by exploiting immune memory. A vaccine introduces a harmless version of a pathogen — a killed virus, a piece of a protein, or a genetic instruction — that trains the immune system without causing disease. When the real pathogen arrives later, memory B and T cells respond so quickly that the invader is cleared before symptoms appear. Vaccines have eliminated smallpox, contained polio, and saved hundreds of millions of lives.

### Why It Matters
Immunology underlies vaccination, organ transplantation, allergy treatment, autoimmune disease management, and cancer immunotherapy. New drugs called checkpoint inhibitors, which release the brakes on T cells, have transformed cancer treatment by letting the immune system attack tumors. Understanding the immune system is also essential for understanding emerging infectious diseases and designing the next generation of vaccines and therapies.`,
  },

  // ----------------------------------------------------------------
  // 15. ECOLOGY LEVELS OF ORGANIZATION AND SYMBIOSIS
  // ----------------------------------------------------------------
  {
    id: 'ecology-levels-organization',
    patterns: [/\b(ecological organization|ecological hierarchy|population ecology|community ecology|biosphere|mutualism|commensalism|parasitism|symbiosis|symbiotic|trophic relationship)\b/i],
    keywords: ['ecological organization', 'population', 'community', 'biosphere', 'mutualism', 'commensalism', 'parasitism', 'symbiosis', 'biome'],
    intent: 'factual_question',
    topic: 'biology',
    response: () => `Ecology studies how living things interact with each other and with their environment. To make sense of this complexity, biologists organize life into a hierarchy of levels, each building on the one below. At the same time, individual species form intricate relationships within these levels — competing, cooperating, and depending on one another in ways that shape every ecosystem on Earth.

### The Levels of Ecological Organization
The hierarchy begins with the individual organism — a single living being. A group of individuals of the same species living in the same area is a population. Populations of different species sharing the same area form a community. The community together with its physical environment — soil, water, air, climate — is an ecosystem. A large region characterized by its climate and dominant vegetation, like a desert, rainforest, or tundra, is a biome. The highest level, encompassing all life on Earth and the parts of the planet that support it, is the biosphere.

### From Organism to Population
An organism interacts constantly with its environment — finding food, avoiding predators, reproducing. A population is more than just a collection of individuals; it has properties that no single organism has, like population density, birth rate, death rate, and age structure. A population can grow exponentially when conditions are good, but it is eventually limited by resources, predators, and disease, leading to the carrying capacity of its environment.

### From Population to Community
A biological community is the network of populations that share a habitat. Communities are characterized by their species richness — the number of species present — and by their relative abundance. A tropical rainforest may contain hundreds of tree species in a single hectare, while a boreal forest may have only a handful. The most influential species in a community, often called keystone species, can have an outsized effect relative to their numbers. The loss of a keystone species, like sea otters in kelp forests, can cause the entire community to collapse.

### Ecosystems and the Flow of Energy
An ecosystem includes the community plus the non-living environment. Energy flows through ecosystems in one direction — from the sun, to producers like plants, to consumers like herbivores and carnivores, to decomposers like fungi and bacteria. At each step, much of the energy is lost as heat, which is why food chains rarely extend beyond four or five levels. Nutrients, by contrast, cycle through ecosystems — carbon, nitrogen, phosphorus, and water pass between living and non-living parts and are reused.

### Symbiotic Relationships
Within communities, species interact in three classic patterns of symbiosis. Mutualism benefits both partners — bees get nectar from flowers, and flowers get pollinated. Commensalism benefits one partner while the other is unaffected — barnacles on whales get a free ride. Parasitism benefits one partner at the expense of the other — ticks feed on the blood of mammals. These relationships can be so tight that neither species can survive without the other.

### Why It Matters
Ecology explains why nature works the way it does and why human disruption can be so damaging. Deforestation, climate change, overfishing, and pollution all act at the level of ecosystems and communities, not individual organisms. Conservation biology uses ecological principles to design protected areas, restore damaged habitats, and predict how species will respond to environmental change. A planet that supports human life depends on healthy functioning of every level, from organism to biosphere.`,
  },
]
