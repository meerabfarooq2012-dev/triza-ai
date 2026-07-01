/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — PSYCHOLOGY & HEALTH DEEP (Batch 16)
 * ============================================================
 *
 *  Deeper subtopic entries that go one level below the broad
 *  batch-psychology.ts and batch-health.ts coverage:
 *    - Developmental, cognitive, abnormal, therapeutic, social,
 *      and neuropsychology subfields
 *    - Detailed nutrition, exercise physiology, sleep science,
 *      mental-health self-care, common diseases, and first aid
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries and include BOTH
 *  English and Roman Urdu phrasings so TRIZA can match
 *  questions from bilingual users.
 *
 *  Medical / health entries include a "consult a doctor"
 *  reminder in the closing Why It Matters paragraph.
 *
 *  NO external LLM API is used. These are facts TRIZA has
 *  "learned" and will express in its own voice via the
 *  self-expression + narration engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const PSYCHOLOGY_HEALTH_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. DEVELOPMENTAL PSYCHOLOGY — Piaget, Erikson, Attachment
  // ----------------------------------------------------------------
  {
    id: 'developmental-psychology-piaget-erikson',
    patterns: [/\b(developmental psychology|piaget|sensorimotor|preoperational|concrete operational|formal operational|erikson|erik erikson|attachment theory|bowlby|ainsworth|strange situation|child development stages|taraqqi psychology|bachpan ki taraqqi)\b/i],
    keywords: ['developmental psychology', 'piaget', 'erikson', 'attachment', 'bowlby', 'ainsworth', 'sensorimotor', 'preoperational', 'concrete operational', 'formal operational', 'strange situation', 'child development'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Developmental psychology studies how humans change — and stay the same — across the lifespan, from infancy to old age. Two frameworks dominate the field: Jean Piaget's theory of cognitive development and Erik Erikson's theory of psychosocial development, alongside John Bowlby and Mary Ainsworth's work on attachment.

### Piaget's Four Stages of Cognitive Development
Piaget argued that children are not mini-adults — they think in fundamentally different ways at different ages. His four stages are: (1) Sensorimotor stage, birth to age 2, where infants learn through senses and actions and develop object permanence, the idea that objects still exist when hidden. (2) Preoperational stage, ages 2 to 7, marked by language growth, symbolic play, egocentrism, and a lack of conservation — a 4-year-old thinks a tall thin glass holds more water than a short wide one. (3) Concrete operational stage, ages 7 to 11, where logical reasoning about concrete objects emerges, conservation is mastered, and reversibility is understood. (4) Formal operational stage, age 11 onward, where abstract and hypothetical reasoning becomes possible.

### Erikson's Eight Psychosocial Stages
Erikson framed development as a sequence of eight crises, each pitting two opposing forces against each other. Trust vs. Mistrust (infancy) — does the world feel safe? Autonomy vs. Shame and Doubt (toddler) — can I do things myself? Initiative vs. Guilt (preschool) — can I plan and lead? Industry vs. Inferiority (school age) — am I competent? Identity vs. Role Confusion (adolescence) — who am I? Intimacy vs. Isolation (young adulthood) — can I love deeply? Generativity vs. Stagnation (middle adulthood) — am I contributing to the future? Integrity vs. Despair (late adulthood) — was my life meaningful?

### Attachment Theory
Bowlby proposed that infants are born with an attachment behavioral system that keeps them close to caregivers for safety. Ainsworth's Strange Situation experiment — where a toddler is briefly separated from and reunited with a caregiver in an unfamiliar room — revealed four attachment styles: secure (the child is upset but quickly comforted), anxious-ambivalent (the child remains distressed and resists comfort), avoidant (the child ignores the caregiver), and disorganized (contradictory, fearful behavior). These early patterns often echo into adult relationships.

### Why It Matters
Developmental psychology tells us that the mind is built in layers, not delivered whole. Understanding the stages helps parents, teachers, and clinicians meet people where they actually are — not where we wish they were. It also reminds us that growth does not stop at 18: identity, intimacy, and meaning are lifelong projects.
`,
  },

  // ----------------------------------------------------------------
  // 2. COGNITIVE PSYCHOLOGY — Perception, Attention, Memory Models
  // ----------------------------------------------------------------
  {
    id: 'cognitive-psychology-perception-attention',
    patterns: [/\b(cognitive psychology|perception|sensation and perception|attention|selective attention|inattentional blindness|atkinson-shiffrin|atkinson shiffrin|sensory memory|short-term memory model|schemas|cognitive load|problem solving|gestalt|top-down processing|bottom-up processing|cognitive science)\b/i],
    keywords: ['cognitive psychology', 'perception', 'attention', 'selective attention', 'inattentional blindness', 'atkinson-shiffrin', 'sensory memory', 'schemas', 'cognitive load', 'problem solving', 'gestalt'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Cognitive psychology is the study of how the mind processes information — how we perceive, attend, remember, reason, and decide. It treats the brain as a kind of information-processing system, drawing heavily on the computer metaphor that emerged in the 1950s.

### Perception: Constructing Reality
Perception is not a passive recording of the world — it is an active construction. Sensation delivers raw signals from the eyes, ears, and skin; perception interprets them. Bottom-up processing builds perception from sensory pieces upward. Top-down processing uses prior knowledge, expectations, and context to shape what we perceive. The Gestalt psychologists showed that we naturally group stimuli into wholes: we see a triangle as a single shape, not three lines, and we perceive figure and ground in every visual scene. Optical illusions reveal the shortcuts the brain takes.

### Attention: The Spotlight of the Mind
Attention is the selective filter that chooses what reaches awareness. We cannot process everything — selective attention lets us follow one conversation at a noisy party (the cocktail party effect) while ignoring the rest. The classic dichotic listening experiments of the 1950s showed how unattended information is largely lost. Inattentional blindness demonstrates that when attention is consumed by one task, we can miss even a gorilla walking through a scene. Attention is finite, and dividing it across tasks (multitasking) reliably lowers performance on each.

### The Atkinson-Shiffrin Memory Model
Richard Atkinson and Richard Shiffrin proposed that memory flows through three stores. Sensory memory holds raw sensory input for a fraction of a second — iconic memory for vision, echoic memory for sound. Short-term memory holds a small amount of information (about seven plus or minus two items, per George Miller) for roughly 15 to 30 seconds unless rehearsed. Long-term memory is effectively unlimited in capacity and duration, and it is subdivided into explicit (declarative) memory for facts and events, and implicit (procedural) memory for skills and habits. Rehearsal, encoding depth, and emotional significance all govern what transfers from short-term to long-term storage.

### Schemas, Cognitive Load, and Problem Solving
Schemas are organized knowledge frameworks that help us interpret new information quickly — a "restaurant schema" tells us to sit, order, eat, and pay without relearning the script each time. Cognitive load theory distinguishes intrinsic load (task difficulty), extraneous load (poor presentation), and germane load (productive schema-building), and it shapes how instruction should be designed. Problem solving draws on algorithms (step-by-step procedures that guarantee a solution) and heuristics (mental shortcuts like means-end analysis and working backward).

### Why It Matters
Cognitive psychology underpins how we teach, design interfaces, diagnose learning disorders, and build artificial intelligence. Understanding that attention is limited makes us skeptical of multitasking; understanding that perception is constructed makes us humble about eyewitness testimony.
`,
  },

  // ----------------------------------------------------------------
  // 3. ABNORMAL PSYCHOLOGY — DSM-5 Categories
  // ----------------------------------------------------------------
  {
    id: 'abnormal-psychology-dsm5',
    patterns: [/\b(abnormal psychology|dsm|dsm-5|dsm 5|diagnostic and statistical manual|generalized anxiety disorder|gad|panic disorder|phobia|phobias|social anxiety|mood disorders|bipolar disorder|bipolar|major depressive disorder|schizophrenia|psychotic disorder|psychosis|hallucination|delusion|psychiatric diagnosis)\b/i],
    keywords: ['abnormal psychology', 'dsm-5', 'anxiety disorders', 'GAD', 'panic disorder', 'phobia', 'mood disorders', 'depression', 'bipolar', 'schizophrenia', 'psychosis', 'hallucination', 'delusion'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Abnormal psychology studies mental disorders — their symptoms, causes, and treatment. The standard reference is the Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition (DSM-5), published by the American Psychiatric Association. It lists over 250 disorders grouped into categories, each defined by specific symptom criteria, duration, and impairment.

### Anxiety Disorders
Anxiety disorders involve excessive fear or worry that interferes with daily life. Generalized Anxiety Disorder (GAD) is marked by persistent, hard-to-control worry about everyday matters for at least six months, often with restlessness, fatigue, muscle tension, and sleep disturbance. Panic Disorder involves recurrent panic attacks — sudden surges of intense fear with pounding heart, shortness of breath, chest pain, and a feeling of doom — followed by persistent worry about future attacks. Phobias are intense, specific fears (heights, spiders, flying) that lead to avoidance; Social Anxiety Disorder centers on fear of judgment or humiliation in social settings.

### Mood Disorders
Mood disorders, called depressive disorders and bipolar disorders in DSM-5, involve disabling disturbances of emotion. Major Depressive Disorder requires at least five symptoms (sadness, loss of interest, weight change, sleep change, fatigue, worthlessness, concentration problems, suicidal thoughts) for at least two weeks. Persistent Depressive Disorder (dysthymia) is a milder but chronic form lasting two or more years. Bipolar I Disorder involves at least one manic episode — abnormally elevated mood, racing thoughts, reduced need for sleep, risky behavior — often alternating with depression. Bipolar II involves hypomania (a milder form) plus major depression.

### Psychotic Disorders
Psychotic disorders involve a break from reality. Schizophrenia is the most studied: its positive symptoms include hallucinations (often auditory), delusions (fixed false beliefs), disorganized speech, and catatonic behavior; its negative symptoms include flat emotion, reduced speech, and social withdrawal; cognitive symptoms include poor attention and executive function. Symptoms must persist for at least six months with at least one month of active-phase symptoms. Schizoaffective disorder blends schizophrenia symptoms with a major mood episode.

### How Disorders Are Diagnosed and Understood
Diagnosis is clinical — based on structured interviews, symptom checklists, and ruling out medical causes. The current model is biopsychosocial: genetic predisposition, brain chemistry, trauma, and social stress all interact. The DSM is descriptive (it lists symptoms) rather than explanatory (it does not claim a single cause), and it is revised as evidence accumulates.

### Why It Matters
Abnormal psychology replaces fear and shame with names and pathways. A correct diagnosis opens the door to evidence-based treatment and to the realization that no one is alone in their experience. If you or someone you know is struggling, consult a qualified mental health professional or doctor for proper diagnosis and care — this overview is educational, not a substitute for clinical assessment.
`,
  },

  // ----------------------------------------------------------------
  // 4. THERAPEUTIC APPROACHES — CBT, Psychoanalysis, Humanistic, ACT, DBT
  // ----------------------------------------------------------------
  {
    id: 'therapeutic-approaches-modalities',
    patterns: [/\b(psychoanalysis|psychoanalytic|freudian therapy|psychodynamic therapy|humanistic therapy|carl rogers|client-centered therapy|person-centered|gestalt therapy|behavior therapy|behavioral therapy|exposure therapy|acceptance and commitment therapy|act therapy|dialectical behavior therapy|dbt|therapy modalities|types of therapy|therapeutic approaches|counselling approaches)\b/i],
    keywords: ['psychoanalysis', 'psychodynamic', 'humanistic', 'carl rogers', 'client-centered', 'gestalt therapy', 'behavior therapy', 'exposure therapy', 'ACT', 'DBT', 'therapy modalities'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Therapy is not one thing — it is a family of approaches, each with its own theory of how people get stuck and how they get unstuck. No single modality is best for every problem; the right match depends on the issue, the person, and the evidence.

### Cognitive Behavioral Therapy (CBT)
CBT, developed by Aaron Beck and Albert Ellis, is the most researched therapy of the modern era. Its core premise: thoughts, feelings, and behaviors are linked, and distorted thinking (catastrophizing, all-or-nothing reasoning, mind-reading) fuels emotional distress. CBT is structured, time-limited (often 12 to 20 sessions), and present-focused. Clients learn to identify automatic thoughts, test them against evidence, and replace them with balanced alternatives, while also changing behaviors through graded exposure and behavioral activation. CBT has strong evidence for anxiety disorders, depression, OCD, PTSD, and insomnia.

### Psychoanalysis and Psychodynamic Therapy
Sigmund Freud's psychoanalysis explores how unconscious conflicts rooted in early childhood shape adult life. Through free association, dream analysis, and the therapeutic relationship, the patient gains insight into repressed wishes and defenses. Classical psychoanalysis is intensive — several sessions a week for years. Modern psychodynamic therapy is briefer but keeps the focus on unconscious patterns, defense mechanisms, and the therapeutic relationship as a window into the patient's relational world.

### Humanistic Therapy
Humanistic psychology, led by Carl Rogers, emphasizes growth, free will, and the innate striving toward self-actualization. Rogers's client-centered (or person-centered) therapy offers three core conditions: empathy, unconditional positive regard, and congruence (genuineness). The therapist does not direct or interpret — they reflect and clarify so the client finds their own answers. It is especially effective for self-esteem, grief, and life-transition issues.

### Behavioral and Exposure Therapies
Behavioral therapy applies learning principles directly. Systematic desensitization pairs relaxation with gradual exposure to feared stimuli; exposure and response prevention (ERP) is the gold standard for OCD; behavioral activation treats depression by scheduling rewarding activities. These therapies are powerful for phobias, OCD, and habit disorders.

### Third-Wave Therapies: ACT and DBT
Acceptance and Commitment Therapy (ACT, pronounced "act") teaches clients to accept difficult thoughts and feelings rather than fighting them, while committing to values-based action. It uses mindfulness, cognitive defusion, and behavioral commitment. Dialectical Behavior Therapy (DBT), developed by Marsha Linehan, blends CBT with Zen mindfulness and is the leading treatment for borderline personality disorder and chronic self-harm. Its four skill modules — mindfulness, distress tolerance, emotion regulation, and interpersonal effectiveness — are taught in group and individual sessions.

### Why It Matters
Therapy works — decades of research show that most people improve, and the therapeutic alliance (the quality of the relationship with the therapist) matters as much as the technique. If you are considering therapy, consult a licensed mental health professional who can help match the modality to your specific needs.
`,
  },

  // ----------------------------------------------------------------
  // 5. SOCIAL PSYCHOLOGY DETAILED — Attribution, Dissonance, Groupthink
  // ----------------------------------------------------------------
  {
    id: 'social-psychology-attribution-dissonance',
    patterns: [/\b(attribution theory|fundamental attribution error|cognitive dissonance|groupthink|group polarization|social loafing|in-group|out-group|self-fulfilling prophecy|stanford prison|zimbardo|social identity theory|tajfel|festinger|self-perception theory|bystander intervention|diffusion of responsibility)\b/i],
    keywords: ['attribution theory', 'fundamental attribution error', 'cognitive dissonance', 'groupthink', 'group polarization', 'social loafing', 'in-group', 'out-group', 'self-fulfilling prophecy', 'stanford prison', 'social identity theory', 'festinger'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Social psychology examines how the actual, imagined, or implied presence of others shapes our thoughts, feelings, and actions. The classic studies — Asch on conformity, Milgram on obedience, and the bystander effect — are well known. This entry goes deeper into the theories that explain why we behave as we do in groups.

### Attribution Theory
Attribution theory, developed by Fritz Heider and extended by Harold Kelley and Bernard Weiner, studies how we explain behavior. We make dispositional attributions (blaming a person's character) or situational attributions (blaming circumstances). The fundamental attribution error is our tendency to overestimate disposition and underestimate situation when judging others — we cut ourselves slack for bad traffic, but we call a careless driver a jerk. The self-serving bias flips this for our own outcomes: success is skill, failure is bad luck. Cultural factors matter: individualist societies lean more dispositional, collectivist societies more situational.

### Cognitive Dissonance
Leon Festinger's 1957 theory of cognitive dissonance states that holding two conflicting beliefs, or behaving in a way that contradicts a belief, creates psychological discomfort — and we are motivated to reduce it. In Festinger's classic study, participants paid one dollar to lie about a boring task later reported liking it more than those paid twenty dollars. The one-dollar group had insufficient justification for lying, so they shifted their attitude to match their behavior. Dissonance explains why people double down on beliefs after counter-evidence, why initiation rites strengthen group loyalty, and why effortful commitments feel more valuable.

### Groupthink and Group Polarization
Irving Janis coined "groupthink" after analyzing policy fiascos like the Bay of Pigs. When a cohesive group seeks consensus under pressure, it suppresses dissent, ignores outside information, and rationalizes warnings — producing disastrously poor decisions. Symptoms include illusion of invulnerability, self-censorship, and pressure on dissenters. Group polarization is a related effect: after discussion, groups shift toward a more extreme version of their initial leaning — cautious groups become more cautious, risk-taking groups more reckless.

### Social Identity and Group Dynamics
Henri Tajfel's social identity theory argues that our sense of self comes partly from group membership. We divide the world into in-groups and out-groups, and we favor our own. Even random assignment to groups is enough to trigger in-group favoritism (the minimal group paradigm). Social loafing shows that individuals exert less effort in groups — a reason team projects can drag. The self-fulfilling prophecy, described by Robert Merton, occurs when an expectation (often a stereotype) changes behavior in a way that makes the expectation come true.

### The Stanford Prison Experiment
Philip Zimbardo's 1971 Stanford Prison Experiment randomly assigned college students to be guards or prisoners in a mock prison. The study was halted in six days because guards became abusive and prisoners broke down. It dramatized how roles and situations can override individual personality — a finding debated hotly today, but influential in shaping modern understanding of institutional power.

### Why It Matters
Social psychology explains why smart people make bad group decisions, why good people do harmful things under authority, and why self-knowledge alone does not protect us from situational forces. The practical lessons — design dissent into teams, surface attribution errors, watch for groupthink symptoms — apply from boardrooms to democracies.
`,
  },

  // ----------------------------------------------------------------
  // 6. NEUROPSYCHOLOGY — Brain Lobes, Neurotransmitters, Plasticity
  // ----------------------------------------------------------------
  {
    id: 'neuropsychology-brain-neurotransmitters',
    patterns: [/\b(neuropsychology|neurotransmitters|dopamine|serotonin|gaba|glutamate|norepinephrine|acetylcholine|split-brain|corpus callosum|brain plasticity|neuroplasticity|cortical mapping|lateralization|broca's area|wernicke's area|brain imaging|fmri|eeg|cat scan|pet scan|roger sperry|michael gazzaniga)\b/i],
    keywords: ['neuropsychology', 'neurotransmitters', 'dopamine', 'serotonin', 'GABA', 'glutamate', 'norepinephrine', 'acetylcholine', 'split-brain', 'corpus callosum', 'neuroplasticity', 'lateralization', 'broca', 'wernicke', 'fmri', 'eeg'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Neuropsychology is the study of how brain structure and function produce thought, emotion, and behavior. It bridges neuroscience and psychology, drawing evidence from brain imaging, patients with brain lesions, and split-brain research.

### The Four Cortical Lobes and Their Functions
The cerebral cortex is divided into four paired lobes. The frontal lobe handles executive functions — planning, decision-making, impulse control, and voluntary movement (the motor cortex sits at its rear). The parietal lobe processes touch, temperature, pain, and spatial awareness; it houses the somatosensory cortex. The temporal lobe processes auditory information, language comprehension (Wernicke's area, usually in the left hemisphere), and memory formation (the hippocampus lies deep within it). The occipital lobe at the back of the brain is devoted entirely to vision. Paul Broca's 1861 discovery that damage to a specific left-frontal region produced speech loss while comprehension stayed intact was the first clear evidence of cortical localization.

### Neurotransmitters: The Brain's Chemical Messengers
Neurons communicate across synapses using neurotransmitters. Dopamine is central to reward, motivation, and motor control; its dysregulation is implicated in addiction, Parkinson's disease (too little), and schizophrenia (too much in certain pathways). Serotonin regulates mood, appetite, and sleep; selective serotonin reuptake inhibitors (SSRIs) raise its availability to treat depression and anxiety. GABA (gamma-aminobutyric acid) is the brain's main inhibitory transmitter — it quiets neural activity, and drugs like benzodiazepines and alcohol enhance its effect. Glutamate is the main excitatory transmitter, vital for learning and memory through long-term potentiation. Norepinephrine drives alertness and the stress response. Acetylcholine powers muscle contraction and is a key transmitter in memory; its loss contributes to Alzheimer's disease.

### Split-Brain Research
In the 1960s, Roger Sperry and Michael Gazzaniga studied patients whose corpus callosum — the band of nerve fibers connecting the two hemispheres — had been surgically cut to treat severe epilepsy. These split-brain patients appeared normal in daily life, but clever experiments revealed that each hemisphere processed information independently. When a word was flashed to the right visual field (processed by the speaking left hemisphere), the patient could name it. When the same word was flashed to the left visual field (right hemisphere, which cannot speak), the patient denied seeing anything — yet could pick up the matching object with the left hand. The work mapped lateralization: the left hemisphere dominates language, logic, and sequential analysis; the right excels at spatial tasks, faces, and holistic patterns.

### Neuroplasticity
The brain is not hard-wired. Neuroplasticity is the capacity of neural networks to reorganize through experience and learning. Synaptic plasticity (changes in the strength of existing connections) underlies learning. Structural plasticity includes the growth of new dendrites and, in some regions like the hippocampus, new neurons (neurogenesis) throughout life. After stroke or injury, undamaged regions can sometimes take over lost functions, especially with targeted rehabilitation. London taxi drivers, who must memorize thousands of streets, show enlarged posterior hippocampi — a striking example of experience shaping the brain.

### Brain Imaging Methods
Modern neuropsychology uses many tools. Structural MRI shows anatomy; functional MRI (fMRI) tracks blood-oxygen changes to map activity. EEG records electrical signals at the scalp with millisecond timing. PET scans reveal metabolic activity. Each method trades off between spatial and temporal resolution.

### Why It Matters
Neuropsychology grounds psychology in biology, transforming mental illness from a moral failing into a treatable brain condition and recovery from injury from a fantasy into an achievable goal. For any concern about cognition, mood, or brain function, consult a qualified doctor or neurologist for proper evaluation and diagnosis.
`,
  },

  // ----------------------------------------------------------------
  // 7. NUTRITION DETAILED — Macronutrients, Micronutrients, RDAs
  // ----------------------------------------------------------------
  {
    id: 'nutrition-detailed-micronutrients',
    patterns: [/\b(micronutrients|vitamin a|vitamin b|vitamin c|vitamin d|vitamin e|vitamin k|thiamine|riboflavin|niacin|folate|b12|cobalamin|ascorbic acid|retinol|tocopherol|minerals nutrition|calcium|iron deficiency|zinc|magnesium|scurvy|rickets|beriberi|pellagra|anemia|recommended dietary allowance|rda|daily value|deficiency disease)\b/i],
    keywords: ['micronutrients', 'vitamins', 'minerals', 'vitamin A', 'B vitamins', 'vitamin C', 'vitamin D', 'vitamin E', 'vitamin K', 'calcium', 'iron', 'zinc', 'magnesium', 'scurvy', 'rickets', 'beriberi', 'pellagra', 'anemia', 'RDA', 'deficiency'],
    intent: 'factual_question',
    topic: 'health',
    response: () => `Nutrition rests on macronutrients — carbohydrates, proteins, and fats that supply energy and building blocks — and micronutrients — vitamins and minerals needed in tiny amounts but essential to nearly every biological process. This entry focuses on micronutrients, since the broad role of macronutrients is covered elsewhere.

### Macronutrients in Brief
Carbohydrates supply roughly 4 calories per gram and are the body's preferred fuel, especially for the brain. Proteins also supply 4 calories per gram and provide the amino acids used to build enzymes, muscles, antibodies, and hormones; nine amino acids are essential (must come from food). Fats supply 9 calories per gram, insulate the body, cushion organs, and carry fat-soluble vitamins; essential fatty acids (omega-3 and omega-6) must come from diet.

### Fat-Soluble Vitamins
Vitamin A (retinol, beta-carotene) supports vision, immune function, and skin health; deficiency causes night blindness and, in severe cases, total blindness. Vitamin D regulates calcium absorption and bone mineralization; deficiency causes rickets in children (soft, deformed bones) and osteomalacia in adults; the body synthesizes it from sunlight, but deficiency is common in northern latitudes and dark-skinned populations. Vitamin E (tocopherol) is a powerful antioxidant that protects cell membranes. Vitamin K is essential for blood clotting and bone metabolism; newborns receive an injection at birth because their gut bacteria have not yet produced it.

### Water-Soluble Vitamins
The B-complex vitamins drive energy metabolism and nerve function. Thiamine (B1) deficiency causes beriberi (nerve and heart damage); it was once common in populations eating polished white rice. Niacin (B3) deficiency causes pellagra, with the four Ds: dermatitis, diarrhea, dementia, and death. Folate (B9) is vital for fetal neural tube development, hence prenatal supplementation. Vitamin B12 (cobalamin), found only in animal products, is required for red blood cell formation and nerve myelination; deficiency causes megaloblastic anemia and neuropathy, and vegans must supplement. Vitamin C (ascorbic acid) is needed for collagen synthesis, immune function, and iron absorption; severe deficiency causes scurvy — bleeding gums, bruising, joint pain — historically fatal on long sea voyages until James Lind's 1747 trial of citrus.

### Major Minerals and Trace Minerals
Calcium builds bones and teeth and drives muscle contraction and nerve signaling. Phosphorus partners with calcium in bone and in ATP, the body's energy currency. Magnesium participates in over 300 enzymatic reactions. Iron is the core of hemoglobin, the oxygen-carrying protein in red blood cells; deficiency is the most common nutritional deficiency worldwide, causing iron-deficiency anemia with fatigue, pallor, and reduced immunity. Zinc supports immune function and wound healing. Iodine is needed for thyroid hormones; deficiency causes goiter and, in pregnancy, severe cognitive impairment in the child (cretinism). Selenium, copper, manganese, and chromium are needed in trace amounts.

### Recommended Dietary Allowances
RDAs are daily intake levels set by nutrition authorities to meet the needs of about 97 percent of healthy individuals. They vary by age, sex, and life stage (pregnancy, lactation). Tolerable Upper Intake Levels cap safe intake to prevent toxicity — fat-soluble vitamins and iron can accumulate to harmful levels, while excess water-soluble vitamins are usually excreted.

### Why It Matters
Micronutrient deficiencies are silent — they sap energy, lower immunity, and impair development long before they show as a named disease. A varied diet of whole foods is the safest path to sufficiency, and supplementation should be targeted, not random. For personal nutrition advice, deficiency testing, or supplement decisions, consult a doctor or registered dietitian.
`,
  },

  // ----------------------------------------------------------------
  // 8. EXERCISE PHYSIOLOGY — Aerobic vs Anaerobic, Muscle Fibers
  // ----------------------------------------------------------------
  {
    id: 'exercise-physiology-aerobic-anaerobic',
    patterns: [/\b(exercise physiology|aerobic exercise|anaerobic exercise|cardio zone|target heart rate|vo2 max|strength training|resistance training|muscle fiber types|type i fibers|type ii fibers|slow twitch|fast twitch|hypertrophy|muscle recovery|overtraining|delayed onset muscle soreness|doms|periodization|lactate threshold)\b/i],
    keywords: ['exercise physiology', 'aerobic', 'anaerobic', 'cardio zone', 'target heart rate', 'VO2 max', 'strength training', 'muscle fibers', 'slow twitch', 'fast twitch', 'hypertrophy', 'overtraining', 'DOMS', 'periodization'],
    intent: 'factual_question',
    topic: 'health',
    response: () => `Exercise physiology studies how the body responds to physical activity — how energy is produced, how muscles adapt, and how training drives fitness gains. Two energy systems anchor the field: aerobic (with oxygen) and anaerobic (without oxygen).

### Aerobic vs Anaerobic Energy Systems
The aerobic system uses oxygen to break down carbohydrates and fats for sustained energy, powering activities lasting more than about two minutes — walking, jogging, cycling, swimming. The anaerobic system produces energy without oxygen for short, intense bursts. The ATP-PCr system supplies the first 10 seconds of all-out effort (a sprint, a heavy lift). The glycolytic system fuels efforts lasting 30 seconds to 2 minutes, producing lactate as a byproduct. The threshold at which lactate accumulates faster than it can be cleared — the lactate threshold — is a key predictor of endurance performance.

### Cardio Zone and Target Heart Rate
Maximum heart rate is roughly estimated as 220 minus age, though individual variation is large. Training zones are percentages of that maximum: 50 to 70 percent is the moderate zone for general health and fat burning; 70 to 85 percent is the vigorous zone that builds cardiovascular fitness; above 85 percent is interval territory. VO2 max — the maximum volume of oxygen the body can use per minute per kilogram of body weight — is the single best laboratory measure of cardiorespiratory fitness, and high VO2 max is strongly associated with longevity.

### Strength Training and Muscle Fiber Types
Muscle fibers fall into two broad categories. Type I (slow-twitch) fibers are oxidative, fatigue-resistant, and built for endurance — marathon runners have an abundance. Type II fibers are fast-twitch and come in two flavors: Type IIa (oxidative-glycolytic, moderately fatigue-resistant) and Type IIx (purely glycolytic, powerful but quickly exhausted). Genetics sets the rough ratio; training can shift fibers within the Type II family and dramatically enlarge them through hypertrophy. Hypertrophy occurs when muscle protein synthesis exceeds breakdown, driven by mechanical tension, metabolic stress, and muscle damage, and it requires adequate protein intake and recovery.

### Recovery and Adaptation
Fitness is built during recovery, not during the workout itself. After training, muscles repair micro-tears, replenish glycogen, and rebuild stronger. Sleep is the single most powerful recovery tool — growth hormone peaks in deep sleep. Nutrition provides protein for repair and carbohydrate for glycogen. Delayed Onset Muscle Soreness (DOMS) peaks 24 to 72 hours after unfamiliar or eccentric exercise; it is normal, not a measure of progress.

### Overtraining Syndrome
When training load outpaces recovery, performance plateaus and then declines. Symptoms include persistent fatigue, mood disturbance, elevated resting heart rate, sleep disruption, frequent illness, and increased injury risk. Overtraining syndrome can take weeks or months to recover from. The antidote is periodization — cycling intensity and volume, scheduling rest days, and tracking heart rate variability to detect early warning signs.

### Why It Matters
Exercise physiology converts vague advice ("just move more") into precise, individualized training. Understanding energy systems, heart rate zones, and recovery lets anyone train smarter, not just harder — and avoid the burnout and injury that derail progress. For personalized exercise programming, especially with medical conditions, consult a doctor or certified exercise professional.
`,
  },

  // ----------------------------------------------------------------
  // 9. SLEEP SCIENCE — Cycles, Circadian Rhythm, Disorders
  // ----------------------------------------------------------------
  {
    id: 'sleep-science-cycles-circadian',
    patterns: [/\b(sleep science|sleep architecture|n1 sleep|n2 sleep|n3 sleep|rem sleep|non-rem|slow wave sleep|circadian rhythm|circadian|suprachiasmatic nucleus|melatonin|sleep disorders|insomnia|sleep apnea|obstructive sleep apnea|narcolepsy|restless legs syndrome|sleep hygiene|polysomnography|sleep latency|sleep debt)\b/i],
    keywords: ['sleep science', 'sleep architecture', 'N1', 'N2', 'N3', 'REM', 'non-REM', 'slow wave sleep', 'circadian rhythm', 'suprachiasmatic nucleus', 'melatonin', 'insomnia', 'sleep apnea', 'narcolepsy', 'restless legs', 'sleep hygiene', 'polysomnography'],
    intent: 'factual_question',
    topic: 'health',
    response: () => `Sleep is not a single state but a structured cycle of stages, each with distinct brain activity, physiology, and function. A healthy adult cycles through all stages roughly every 90 minutes, completing four to six cycles per night.

### The Sleep Cycle: N1, N2, N3, and REM
Sleep begins with N1, the lightest stage — a transition from wakefulness lasting a few minutes, where the brain produces theta waves and the body may jerk. N2 follows, a slightly deeper stage marked by sleep spindles and K-complexes on the EEG; about half the night is spent here. N3, also called slow-wave sleep or deep sleep, features delta waves and is when the body repairs tissue, releases growth hormone, and consolidates certain types of memory. N3 dominates the first half of the night. REM (Rapid Eye Movement) sleep, sometimes called paradoxical sleep because the brain is highly active while the body is paralyzed, brings vivid dreams, processes emotional memory, and supports learning. REM episodes lengthen as the night progresses, with the longest just before waking.

### The Circadian Rhythm
The circadian rhythm is the body's internal 24-hour clock, orchestrating sleep-wake cycles, hormone release, body temperature, and digestion. The master clock is the suprachiasmatic nucleus (SCN), a tiny cluster of neurons in the hypothalamus. Light striking the retina signals the SCN, which suppresses melatonin production in the pineal gland. As darkness falls, melatonin rises, signaling the body to prepare for sleep. The clock can shift by about an hour per day, which is why jet lag and shift work are so disruptive — the body resists rapid schedule changes. Chronotypes (morning larks, night owls) reflect individual differences in clock timing, partly genetic.

### Common Sleep Disorders
Insomnia — difficulty falling or staying asleep despite adequate opportunity — is the most common sleep disorder, affecting about 10 percent of adults chronically. Cognitive Behavioral Therapy for Insomnia (CBT-I) is the first-line treatment, more effective long-term than sleep medication. Obstructive Sleep Apnea (OSA) causes repeated pauses in breathing during sleep as the airway collapses, leading to fragmented sleep, loud snoring, daytime sleepiness, and elevated risk of hypertension and heart disease; diagnosis requires a sleep study (polysomnography), and treatment often involves continuous positive airway pressure (CPAP). Narcolepsy, a neurological disorder caused by loss of hypocretin-producing neurons, brings excessive daytime sleepiness, sudden sleep attacks, and often cataplexy (sudden muscle weakness triggered by emotion). Restless Legs Syndrome produces an irresistible urge to move the legs at night, disrupting sleep onset.

### Sleep Hygiene
Sleep hygiene is the set of habits that protect the sleep cycle: a consistent sleep and wake time, even on weekends; a cool, dark, quiet bedroom; avoiding caffeine in the afternoon and screens before bed (blue light suppresses melatonin); regular exercise (but not right before bed); and limiting alcohol, which fragments sleep despite making it easier to fall asleep.

### Why It Matters
Chronic sleep deprivation — sleeping less than seven hours regularly — raises the risk of obesity, diabetes, heart disease, depression, and accidents. Sleep is not optional maintenance; it is when the brain clears metabolic waste through the glymphatic system and consolidates the day's learning. If you suspect a sleep disorder, consult a doctor for proper evaluation — many are highly treatable once diagnosed.
`,
  },

  // ----------------------------------------------------------------
  // 10. MENTAL HEALTH SELF-CARE — Mindfulness, Meditation, Journaling
  // ----------------------------------------------------------------
  {
    id: 'mental-health-self-care-practices',
    patterns: [/\b(mental health self-care|self-care|mindfulness|mindfulness meditation|meditation|vipassana|focused attention meditation|journaling|expressive writing|gratitude practice|gratitude journal|social connection|social support|breathing exercises|box breathing|4-7-8 breathing|progressive muscle relaxation|stress reduction|when to seek therapy|when to see a therapist)\b/i],
    keywords: ['self-care', 'mindfulness', 'meditation', 'journaling', 'expressive writing', 'gratitude', 'social connection', 'breathing exercises', 'box breathing', 'progressive muscle relaxation', 'stress reduction'],
    intent: 'how_to',
    topic: 'health',
    response: () => `Self-care is the deliberate practice of caring for your mental and emotional well-being — not as a luxury, but as maintenance. The strongest evidence supports a handful of simple, repeatable practices that anyone can build into daily life.

### Mindfulness and Meditation
Mindfulness is the practice of paying attention to the present moment without judgment. Mindfulness-Based Stress Reduction (MBSR), developed by Jon Kabat-Zinn, has been studied in hundreds of trials and shown to reduce anxiety, depression, and chronic pain. Two main forms exist: focused-attention meditation anchors awareness on a single object such as the breath, returning gently when the mind wanders; open-monitoring meditation (vipassana) observes whatever arises in awareness without reaction. Even ten minutes a day, practiced consistently, produces measurable changes in attention and stress reactivity within weeks.

### Breathing Techniques
Conscious breathing is the fastest route to the nervous system. Box breathing (inhale 4 seconds, hold 4, exhale 4, hold 4) is used by emergency responders to steady themselves under pressure. The 4-7-8 technique (inhale 4, hold 7, exhale 8) lengthens the exhale, activating the parasympathetic nervous system and lowering heart rate. Diaphragmatic breathing — breathing deep into the belly rather than the chest — counteracts the shallow, rapid breathing of the stress response.

### Journaling and Expressive Writing
Writing about thoughts and feelings is one of the most researched self-care tools. James Pennebaker's expressive writing protocol — 20 minutes a day for four consecutive days, writing about a difficult experience without worrying about grammar or structure — has been shown to improve mood, reduce doctor visits, and even boost immune function. A gratitude journal — three specific things you are grateful for each day — shifts attention toward what is working and is linked to better sleep and lower depression symptoms in studies by Robert Emmons. A simple worry journal at bedtime can offload rumination and ease sleep onset.

### Gratitude and Social Connection
Practiced gratitude — whether through journaling, a mental review at bedtime, or a written thank-you to another person — trains the brain to notice positive experiences, countering the negativity bias that focuses on threats. Social connection is the single strongest predictor of long-term happiness and longevity, as shown in the 85-year Harvard Study of Adult Development. Quality matters more than quantity: a few deep, trusted relationships protect mental health more powerfully than many superficial ones. Regular contact — a phone call, a shared meal, a walk with a friend — should be scheduled like any other health practice.

### Progressive Muscle Relaxation
Developed by Edmund Jacobson, this technique involves tensing and then releasing each muscle group in turn from feet to head, teaching the body the difference between tension and relaxation. It is especially effective for insomnia and anxiety.

### When to Seek Professional Help
Self-care is powerful but not sufficient for everything. Seek professional support if distress lasts more than two weeks and interferes with daily life; if there are thoughts of self-harm or suicide; if substance use feels out of control; if panic attacks, intrusive memories, or compulsive behaviors dominate the day; or if relationships and work are suffering. A primary care doctor, therapist, or crisis line is the right first step — asking for help is itself a form of self-care.

### Why It Matters
Mental health, like physical health, requires daily maintenance. These practices cost nothing, carry no side effects, and compound over time. But they are not a substitute for clinical care when it is needed — for any persistent or severe concern, please consult a doctor or licensed mental health professional.
`,
  },

  // ----------------------------------------------------------------
  // 11. COMMON DISEASES — Diabetes, Hypertension, CVD, Cancer, Autoimmune
  // ----------------------------------------------------------------
  {
    id: 'common-diseases-prevention-risk',
    patterns: [/\b(common diseases|type 1 diabetes|type 2 diabetes|diabetes risk factors|hypertension risk|cardiovascular disease|coronary artery disease|stroke risk|cancer types|carcinoma|sarcoma|leukemia|lymphoma|melanoma|autoimmune disease|lupus|rheumatoid arthritis|hashimoto|multiple sclerosis|disease prevention|preventable risk factors)\b/i],
    keywords: ['common diseases', 'type 1 diabetes', 'type 2 diabetes', 'hypertension', 'cardiovascular disease', 'coronary artery disease', 'stroke', 'cancer types', 'carcinoma', 'sarcoma', 'leukemia', 'lymphoma', 'melanoma', 'autoimmune', 'lupus', 'rheumatoid arthritis', 'prevention'],
    intent: 'factual_question',
    topic: 'health',
    response: () => `The leading causes of death and disability worldwide are a relatively small group of chronic diseases. Understanding their risk factors and prevention strategies is the foundation of long-term health.

### Diabetes: Type 1 vs Type 2
Diabetes mellitus is a disorder of blood sugar regulation. Type 1 is an autoimmune disease: the immune system destroys insulin-producing beta cells in the pancreas, so the body produces no insulin. It usually appears in childhood or adolescence, requires lifelong insulin therapy, and is not preventable. Type 2 is far more common (about 90 percent of cases) and arises when cells become resistant to insulin and the pancreas cannot keep up. Risk factors include obesity (especially abdominal fat), physical inactivity, family history, age over 45, gestational diabetes history, and certain ethnicities. Type 2 can often be prevented or delayed through weight management, regular exercise, and a diet rich in whole foods and low in refined carbohydrates.

### Hypertension (High Blood Pressure)
Hypertension is persistently elevated blood pressure, typically defined as 130/80 mmHg or higher. It is called the silent killer because it produces no symptoms until it damages organs. Untreated, it strains the heart, thickens the heart muscle, damages blood vessels, and drives heart attacks, strokes, kidney failure, and vision loss. Major risk factors are excess sodium intake, obesity, alcohol, physical inactivity, chronic stress, family history, and aging. Prevention and management revolve around the DASH diet (rich in fruits, vegetables, whole grains, low-fat dairy, low sodium), regular aerobic exercise, weight loss, limiting alcohol, and stress management.

### Cardiovascular Disease
Cardiovascular disease encompasses coronary artery disease (blockages in the heart's arteries causing heart attacks), heart failure, arrhythmias, and stroke. The shared underlying process is atherosclerosis — fatty plaques building up in artery walls. Modifiable risk factors are smoking, high LDL cholesterol, high blood pressure, diabetes, obesity, physical inactivity, unhealthy diet, and excessive alcohol. The INTERHEART study identified nine modifiable factors that account for about 90 percent of heart attack risk worldwide. Prevention centers on not smoking, regular exercise, a Mediterranean-style diet, blood pressure and cholesterol control, and stress management.

### Cancer Types
Cancer is a group of over 200 diseases characterized by uncontrolled cell growth. The four main categories: carcinomas arise from epithelial tissue (skin, lung, breast, colon) and are the most common; sarcomas arise from connective tissue (bone, muscle, fat); leukemias begin in blood-forming tissue and cause abnormal white cells; lymphomas affect the lymphatic system. Melanoma is a particularly aggressive skin cancer. Risk factors include tobacco use (the single largest cause), alcohol, obesity, certain infections (HPV, hepatitis B and C), UV radiation, carcinogen exposure (asbestos, radon), and genetics (BRCA mutations, Lynch syndrome). Prevention includes not smoking, sun protection, vaccination against HPV and hepatitis B, screening (colonoscopy, mammography, Pap smear), and a diet high in plants and low in processed meats.

### Autoimmune Diseases
In autoimmune disease, the immune system attacks the body's own tissues. Examples include rheumatoid arthritis (joints), systemic lupus erythematosus (multiple organs), type 1 diabetes (pancreas), multiple sclerosis (nerve myelin), Hashimoto's thyroiditis (thyroid), and celiac disease (intestinal lining). These diseases are more common in women and often cluster in families. They are typically chronic, with periods of flare and remission, and managed with immunosuppressive medications, anti-inflammatory drugs, and lifestyle adjustments.

### Why It Matters
The striking finding across all these diseases is how much is preventable: tobacco, poor diet, physical inactivity, and excess alcohol drive the majority of premature death and disability. Small, consistent habits — not smoking, moving daily, eating whole foods, sleeping enough, getting recommended screenings — prevent more disease than any medical treatment. For diagnosis, treatment, or personal risk assessment, always consult a qualified doctor.
`,
  },

  // ----------------------------------------------------------------
  // 12. FIRST AID DETAILED — CPR, Heimlich, Bleeding, Burns, Fractures
  // ----------------------------------------------------------------
  {
    id: 'first-aid-detailed-procedures',
    patterns: [/\b(first aid procedures|cpr steps|chest compressions|rescue breaths|heimlich maneuver|abdominal thrusts|bleeding control|direct pressure|tourniquet|burn treatment|burn degrees|first degree burn|second degree burn|third degree burn|fracture care|splinting|rice method|when to call emergency|emergency number|recovery position|shock treatment|anaphylaxis|epinephrine|epi-pen|stroke signs|fast test|heart attack signs)\b/i],
    keywords: ['first aid', 'CPR', 'chest compressions', 'rescue breaths', 'Heimlich', 'abdominal thrusts', 'bleeding control', 'tourniquet', 'burn treatment', 'burn degrees', 'fracture care', 'splint', 'RICE', 'emergency', 'recovery position', 'anaphylaxis', 'epinephrine', 'FAST', 'heart attack'],
    intent: 'how_to',
    topic: 'health',
    response: () => `First aid is the immediate care given before professional help arrives. In a true emergency, the first action is always to call your local emergency number (911, 112, 999, 15, 000 depending on country). The procedures below are general guidance — every adult should take a certified hands-on first aid and CPR course.

### CPR (Cardiopulmonary Resuscitation)
CPR is given when a person is unresponsive and not breathing normally. The chain of survival is: recognize the emergency, call for help, start chest compressions, use an AED if available, and continue until help arrives. Place the heel of one hand in the center of the chest (lower half of the sternum), place the other hand on top, and push hard and fast — at least 5 cm (2 inches) deep and 100 to 120 compressions per minute. Allow the chest to fully recoil between compressions. If you are trained and willing, give 2 rescue breaths after every 30 compressions, tilting the head, lifting the chin, and watching the chest rise. If untrained or unwilling, perform hands-only CPR — continuous compressions without breaths. Use an AED as soon as it arrives; it talks you through each step.

### Choking and the Heimlich Maneuver
If a person is choking but can cough, encourage them to keep coughing. If they cannot cough, speak, or breathe, perform abdominal thrusts (the Heimlich maneuver): stand behind them, place a fist just above the navel with the other hand over it, and give quick inward and upward thrusts. Repeat until the object is expelled or the person becomes unconscious — then start CPR. For infants under one year, use five back blows between the shoulder blades followed by five chest thrusts with two fingers.

### Bleeding Control
For severe bleeding, expose the wound and apply firm direct pressure with a clean cloth or gauze; do not lift the cloth to check — add more layers on top. If blood soaks through, keep adding and pressing. If a limb wound will not stop and a tourniquet is available, place it 5 to 7 cm above the wound (not on a joint), tighten until bleeding stops, note the time applied, and tell emergency responders. Do not remove a tourniquet once placed.

### Burn Treatment
Burns are classified by depth. First-degree burns (like mild sunburn) affect only the outer skin, causing redness and pain. Second-degree burns involve blistering. Third-degree burns destroy all skin layers and may look white or charred, often with less pain because nerve endings are damaged. For first and small second-degree burns, cool the area under cool (not ice-cold) running water for 10 to 20 minutes, then cover loosely with a clean non-stick dressing. Never apply ice, butter, toothpaste, or ointments. Do not pop blisters. Seek emergency care for third-degree burns, burns covering a large area, burns to the face, hands, feet, groin, or major joints, and chemical or electrical burns.

### Fracture Care
Do not try to realign a broken bone. Keep the person still, support the injured area in the position found, and immobilize it with a splint (rigid material padded and tied above and below the fracture, not directly over it). Apply a cold pack wrapped in cloth. For sprains and strains, the RICE method helps: Rest, Ice (15-20 minutes at a time), Compression with an elastic bandage, and Elevation above heart level.

### When to Call Emergency
Call immediately for: chest pain or pressure lasting more than a few minutes; signs of stroke (the FAST test — Face drooping, Arm weakness, Speech difficulty, Time to call); severe difficulty breathing; sudden severe pain; uncontrolled bleeding; suspected poisoning or overdose; severe burns; major injuries; loss of consciousness; seizure without known history; or any sign of anaphylaxis (swollen throat, difficulty breathing, rapid swelling after an allergen — use an epinephrine auto-injector if prescribed and call emergency).

### Why It Matters
In cardiac arrest, every minute without CPR reduces survival chances by about 10 percent. Bystander action — even imperfect action — saves lives long before paramedics arrive. Take a certified first aid and CPR course every two years to keep skills current. This overview is educational and does not replace hands-on training or medical judgment; for any actual emergency, call your local emergency number and follow dispatcher instructions.
`,
  },
]
