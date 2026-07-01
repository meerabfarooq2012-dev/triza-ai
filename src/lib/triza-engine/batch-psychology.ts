/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — PSYCHOLOGY & MIND (Batch 15)
 * ============================================================
 *
 *  The science of mind and behavior: history, memory, learning,
 *  cognitive biases, emotions, intelligence, personality,
 *  motivation, mental health, and social influence.
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

export const PSYCHOLOGY_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. WHAT PSYCHOLOGY IS — DEFINITION, HISTORY, AND BRANCHES
  // ----------------------------------------------------------------
  {
    id: 'psychology-what-is',
    patterns: [/\b(psychology|psychologist|psychologists|what is psychology|psychology kya hai|nafsiyat|ilm e nafs|study of mind|study of behavior)\b/i],
    keywords: ['psychology', 'psychologist', 'mind', 'behavior', 'mental', 'wundt', 'james', 'clinical', 'cognitive', 'social', 'developmental'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Psychology is the scientific study of the mind and behavior. The word comes from Greek — "psyche" meaning soul or breath, and "logos" meaning study. Today it is one of the largest scientific fields, touching nearly every part of human life, from mental health to education to design.

### A Short History
Psychology began as a branch of philosophy. Ancient Greek thinkers like Aristotle and Plato asked deep questions about the mind, memory, and dreams, but they answered them with reasoning rather than experiment. Modern psychology was born in 1879, when Wilhelm Wundt opened the first psychology laboratory in Leipzig, Germany. Wundt and his students used introspection — asking trained observers to report their own mental experiences — to study sensation, perception, and reaction time. Soon after, William James in the United States published "The Principles of Psychology" in 1890 and founded the American tradition of functionalism, which focused on what the mind is for rather than just what it is.

### The Major Branches
Psychology today has many specialized branches. Clinical psychology focuses on diagnosing and treating mental disorders — depression, anxiety, trauma, addiction — through therapy and assessment. Cognitive psychology studies the inner workings of the mind: attention, memory, language, problem-solving, and decision-making. Social psychology examines how people influence each other — conformity, persuasion, prejudice, attraction. Developmental psychology tracks how humans change across the lifespan, from infant attachment to adolescent identity to aging. Other major branches include educational, organizational, forensic, health, and sports psychology.

### Methods of Study
Psychologists use several methods. Experiments manipulate one variable to see its effect on another — the gold standard for establishing cause and effect. Surveys gather data from large samples. Case studies examine individuals in depth, often people with unusual conditions. Observational studies record behavior in natural settings. Modern psychology also relies heavily on brain imaging techniques like fMRI and EEG, statistical analysis, and computer modeling.

### Why It Matters
Psychology touches nearly every part of modern life. Therapies developed by psychologists help millions of people manage mental illness. Educational psychology shapes how schools teach children. Organizational psychology improves workplaces. Forensic psychology informs the justice system. Behind each of these applications is a deeper question — how does the brain produce the mind, and why do we think, feel, and act the way we do? Psychology is humanity's systematic, evidence-based attempt to answer.`,
  },

  // ----------------------------------------------------------------
  // 2. MEMORY — HOW WE STORE AND RECALL EXPERIENCE
  // ----------------------------------------------------------------
  {
    id: 'psychology-memory',
    patterns: [/\b(memory|memories|short-term memory|long-term memory|working memory|recall|forgetting|encoding|storage|retrieval|yaadasht|memory kaise kaam karta hai)\b/i],
    keywords: ['memory', 'short-term', 'long-term', 'working memory', 'recall', 'forgetting', 'encoding', 'storage', 'retrieval'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Memory is not a single thing — it is a collection of systems that take in experience, hold it, and give it back when we need it. Without memory we could not learn, recognize, plan, or even maintain a sense of who we are.

### The Three Stages
Every memory passes through three stages. Encoding is the first step — the brain transforms sensory input into a form it can store, paying attention to features that matter. Storage holds the encoded information over time, in networks spread across the brain. Retrieval is the act of pulling stored information back into conscious awareness when we need it. A failure at any of these three stages produces a memory failure. Most of what we forget was never properly encoded in the first place — we simply were not paying enough attention.

### Short-Term, Working, and Long-Term Memory
Psychologists distinguish several memory stores. Short-term memory holds a small amount of information — about seven items, give or take two — for roughly 15 to 30 seconds unless we actively rehearse it. Working memory, a related concept proposed by Alan Baddeley, is the mental workspace where we manipulate information — doing mental arithmetic, following a sentence to its end, holding a phone number in mind. Long-term memory is the vast store that can hold information for a lifetime, with effectively unlimited capacity.

Long-term memory itself splits into declarative memory (facts and events we can describe, also called explicit memory) and non-declarative memory (skills and habits we perform without conscious thought, also called implicit memory). Knowing that Paris is the capital of France is declarative. Knowing how to ride a bicycle is non-declarative.

### Why We Forget
Forgetting has several causes. Decay happens when memory traces fade from disuse. Interference occurs when new memories disrupt old ones, or old memories distort new ones — a common problem when studying similar subjects. Retrieval failure is the "tip of the tongue" feeling, where the memory exists but cannot be reached. The psychologist Hermann Ebbinghaus discovered the forgetting curve: most forgetting happens in the first hours after learning, then levels off. Spaced repetition — reviewing material at increasing intervals — fights this curve and is one of the most effective study techniques known.

### Why It Matters
Memory is the thread that holds identity together. Disorders of memory, from amnesia to Alzheimer's disease, show how devastating it is to lose access to one's own past. Understanding memory also improves education, eyewitness testimony, and the design of systems that help people remember what matters.`,
  },

  // ----------------------------------------------------------------
  // 3. LEARNING — CLASSICAL, OPERANT, AND OBSERVATIONAL
  // ----------------------------------------------------------------
  {
    id: 'psychology-learning',
    patterns: [/\b(learning|classical conditioning|operant conditioning|pavlov|skinner|behaviorism|reinforcement|punishment|observational learning|bandura|sikka|seekhna)\b/i],
    keywords: ['learning', 'classical conditioning', 'operant conditioning', 'pavlov', 'skinner', 'behaviorism', 'reinforcement', 'punishment', 'observational learning', 'bandura'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Learning, in psychology, means a relatively permanent change in behavior resulting from experience. Three classic frameworks explain most of how humans and animals learn: classical conditioning, operant conditioning, and observational learning.

### Classical Conditioning
Classical conditioning was discovered by Ivan Pavlov, a Russian physiologist, in the 1890s. Pavlov was studying digestion in dogs when he noticed that the dogs began to salivate not just at the sight of food, but at the sound of the lab assistant who normally fed them. He ran a famous experiment: ring a bell just before giving food. After several pairings, the dogs salivated at the bell alone. The food is the unconditioned stimulus that naturally causes salivation. The bell, originally neutral, becomes a conditioned stimulus that triggers the same response through association. Classical conditioning explains phobias, advertising, and emotional responses to songs, smells, and places that have been paired with strong experiences.

### Operant Conditioning
Operant conditioning was developed by the American psychologist B. F. Skinner in the 1930s. Skinner argued that behavior is shaped by its consequences. Reinforcement increases the likelihood of a behavior — positive reinforcement adds something pleasant (a reward), while negative reinforcement removes something unpleasant. Punishment decreases the likelihood of a behavior. Skinner's famous "Skinner Box" let him shape complex animal behaviors by carefully scheduling reinforcement. The key insight is that consequences, not just associations, drive much of learned behavior. Slot machines, classroom point systems, workplace bonuses, and even social media likes are all operant conditioning systems in disguise.

### Observational Learning
Observational learning, studied most famously by Albert Bandura in the 1960s, shows that we learn by watching others. Bandura's Bobo doll experiment had children watch an adult act aggressively toward an inflatable doll. When given the chance, the children imitated the aggressive behavior — including specific moves and words. This demonstrated that learning does not require direct reinforcement; we can learn simply by observing and imitating. Observational learning explains how children acquire language, social norms, and skills, and it raises important questions about the influence of media and role models.

### Why It Matters
These three frameworks together explain an enormous range of human behavior — from why a song makes us cry to why a child copies a parent's swear words to why bonus structures change how adults work. They also underlie effective therapies for phobias, addiction, and habit change, and they shape how schools, workplaces, and products are designed to encourage or discourage behaviors.`,
  },

  // ----------------------------------------------------------------
  // 4. COGNITIVE BIASES — THE MIND'S SHORTCUTS AND BLIND SPOTS
  // ----------------------------------------------------------------
  {
    id: 'psychology-cognitive-biases',
    patterns: [/\b(cognitive bias|cognitive biases|confirmation bias|anchoring|availability heuristic|dunning-kruger|heuristics|thinking bias|bias|bias kya hai)\b/i],
    keywords: ['cognitive bias', 'confirmation bias', 'anchoring', 'availability heuristic', 'dunning-kruger', 'heuristics', 'bias'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Cognitive biases are systematic patterns of deviation from rational judgment. They are not random mistakes — they are predictable shortcuts the brain uses to make decisions quickly. Most of the time these shortcuts serve us well, but in certain situations they lead us reliably astray.

### Why Biases Exist
The brain processes enormous amounts of information with limited time and energy. To cope, it uses heuristics — mental shortcuts that produce good-enough answers fast. A heuristic is like a rule of thumb: it usually works, but it can fail in predictable ways. When a heuristic fails, we call the resulting error a cognitive bias. The psychologists Amos Tversky and Daniel Kahneman, working in the 1970s, founded the systematic study of these biases and showed that even experts make them.

### Four Important Biases
Confirmation bias is the tendency to search for, interpret, and remember information that confirms what we already believe, while ignoring or discounting evidence against it. We trust news that agrees with us, dismiss news that does not, and remember our wins more than our losses. It is one of the strongest and most dangerous biases because it entrenches beliefs against correction.

Anchoring is the tendency to rely too heavily on the first piece of information we receive — the "anchor" — when making decisions. A shirt marked down from 200 to 80 feels like a bargain, even if 80 is still more than it is worth, because the 200 anchor skews our sense of value. Negotiations, salaries, and price perceptions all bend toward the anchor.

The availability heuristic judges how common or likely something is by how easily examples come to mind. Shark attacks and plane crashes feel common because they dominate the news, even though they are statistically rare. Quiet dangers like heart disease and car accidents kill far more people but receive less attention, so they feel less threatening.

The Dunning-Kruger effect describes how people with low ability at a task tend to overestimate their ability, while experts often underestimate theirs. The skills needed to do something well are partly the same skills needed to evaluate how well one is doing — so beginners cannot see their own gaps. This explains why confident amateurs often argue with cautious experts.

### Why It Matters
Biases shape elections, investments, medical decisions, hiring, and justice. Recognizing them does not make them disappear, but it lets us slow down, check our reasoning, and design systems — checklists, second opinions, blind reviews — that compensate for them. Kahneman won the Nobel Prize in Economics in 2002 for this work, and its lessons have reshaped economics, medicine, and public policy.`,
  },

  // ----------------------------------------------------------------
  // 5. EMOTIONS — WHAT THEY ARE AND WHY WE HAVE THEM
  // ----------------------------------------------------------------
  {
    id: 'psychology-emotions',
    patterns: [/\b(emotion|emotions|emotional|feelings|basic emotions|ekman|emotional regulation|jazbaat|jazba|feeling|feelings kya hain)\b/i],
    keywords: ['emotion', 'emotions', 'feelings', 'basic emotions', 'ekman', 'emotional regulation', 'mood'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Emotions are short-lived, intense responses to events that matter to us. They combine bodily changes (a racing heart, a flushed face), subjective feelings (the experience of fear or joy), expressive behavior (a smile, a frown), and action tendencies (the urge to flee, fight, or hug). They are not the opposite of reason — they are a fast, ancient kind of intelligence.

### What Emotions Are Made Of
An emotion typically has several components. There is an appraisal — the brain quickly evaluates whether something is good, bad, novel, or threatening. There is a physiological response — heart rate, breathing, sweating, muscle tension shift to prepare the body for action. There is a subjective feeling — the conscious experience of being afraid, angry, or happy. And there is an expression — facial and vocal signals that communicate our state to others. The psychologist Paul Ekman and others have shown that some facial expressions appear to be recognized across cultures, suggesting a biological foundation.

### The Basic Emotions
Ekman proposed six basic emotions that appear universally and have distinctive facial expressions: happiness, sadness, fear, anger, surprise, and disgust. Later researchers expanded the list to include emotions like contempt, pride, and embarrassment. Complex emotions like guilt, shame, jealousy, and gratitude appear to involve more learning and culture, and they show more variation across societies. The basic emotions are thought to be hardwired because they solve fundamental survival problems — fear protects from danger, disgust protects from contamination, anger defends boundaries and resources.

### Why We Have Emotions
Emotions evolved because they helped our ancestors survive and reproduce. Fear makes us flee threats. Anger helps defend against unfairness and harm. Disgust keeps us away from poisons and disease. Sadness signals loss and pulls social support. Joy reinforces behaviors that helped us thrive. Emotions are also social signals — a frightened face warns others, an angry face deters rivals, a smiling face invites cooperation. Without emotions, decision-making would collapse; patients with damage to emotional brain regions can know all the facts and still make disastrous choices.

### Emotional Regulation
Emotional regulation is the ability to influence which emotions we have, when we have them, and how we experience and express them. Strategies include reappraisal (reframing a situation to change how it feels), suppression (hiding the expression), distraction, and mindfulness. Reappraisal tends to be healthier than suppression, which can increase stress and strain relationships. Good emotional regulation is linked to better mental health, stronger relationships, and higher resilience. It is a skill that can be practiced — a core insight behind many forms of therapy.

### Why It Matters
Understanding emotions changes how we live. It helps us read other people, manage our own reactions, and build healthier relationships. It also underlies fields from mental health to product design to leadership — because at the heart of nearly every human decision is a feeling.`,
  },

  // ----------------------------------------------------------------
  // 6. INTELLIGENCE — IQ, MULTIPLE INTELLIGENCES, AND THE NATURE-NURTURE DEBATE
  // ----------------------------------------------------------------
  {
    id: 'psychology-intelligence',
    patterns: [/\b(intelligence|iq|intelligence quotient|multiple intelligences|gardner|fluid intelligence|crystallized intelligence|nature vs nurture|zehan|samajh|aql)\b/i],
    keywords: ['intelligence', 'iq', 'multiple intelligences', 'gardner', 'fluid intelligence', 'crystallized intelligence', 'nature', 'nurture', 'g factor'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Intelligence is the general ability to learn, reason, solve problems, and adapt to new situations. It is one of the most studied and most debated concepts in psychology, because it touches identity, education, and fairness all at once.

### IQ and the General Factor
The intelligence quotient, or IQ, is a score derived from standardized tests that measure reasoning, vocabulary, memory, and problem-solving. The idea dates to the early 1900s, when Alfred Binet in France developed the first intelligence test to identify children who needed extra help in school. Modern IQ tests are much more sophisticated, but the core idea is the same: a single score that summarizes cognitive ability.

A key finding is that scores on different mental tests tend to correlate — people who do well on vocabulary tend to do well on math, on spatial reasoning, and so on. This suggests a general intelligence factor, called "g," that underlies all cognitive performance. IQ scores predict many real-world outcomes, including school performance, job performance in complex roles, and even health and longevity, though the predictions are statistical averages and say little about any individual.

### Fluid and Crystallized Intelligence
Psychologist Raymond Cattell split intelligence into two types. Fluid intelligence is the ability to reason and solve novel problems, independent of past knowledge — it peaks in early adulthood and slowly declines. Crystallized intelligence is the accumulated knowledge and skills gained through experience — it tends to grow throughout life and stays strong well into old age. This explains why young adults often think fastest while older adults often know most.

### Multiple Intelligences
Howard Gardner, in 1983, proposed the theory of multiple intelligences. He argued that the traditional IQ view is too narrow, and that humans have several relatively independent intelligences: linguistic, logical-mathematical, spatial, musical, bodily-kinesthetic, interpersonal, intrapersonal, and naturalistic. The theory has been very influential in education, encouraging teachers to recognize different kinds of strengths. However, many cognitive psychologists argue that the evidence for truly separate intelligences is weak, and that the data still support a strong general factor.

### Nature and Nurture
No question in psychology is more heated than how much of intelligence is inherited and how much is shaped by environment. Twin and adoption studies consistently find that genetics accounts for a substantial share of the differences in IQ between individuals — roughly 50 percent in adults, with the rest shaped by family, schooling, nutrition, health, and culture. Crucially, this is a population statistic: it tells us nothing about any one person's potential. It also depends on environment — in deprived settings, environmental differences dominate, while in enriched settings, genetic differences show through more.

### Why It Matters
How we measure and think about intelligence shapes schools, hiring, and social policy. Misused, IQ has justified cruel discrimination. Used carefully, it helps identify children who need support, adults who fit certain roles, and interventions that lift performance. The honest view is that intelligence is real, measurable to a degree, partly heritable, and always shaped by the world around us.`,
  },

  // ----------------------------------------------------------------
  // 7. PERSONALITY — THE BIG FIVE AND HOW TRAITS FORM
  // ----------------------------------------------------------------
  {
    id: 'psychology-personality',
    patterns: [/\b(personality|personality traits|big five|ocean|extraversion|introversion|neuroticism|personality test|shakhsiyat|kirdar)\b/i],
    keywords: ['personality', 'big five', 'ocean', 'extraversion', 'introversion', 'neuroticism', 'conscientiousness', 'agreeableness', 'openness', 'traits'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Personality is the consistent pattern of thoughts, feelings, and behaviors that distinguishes one person from another. Your personality is why you react to a party, a deadline, or a stranger in a way that is recognizably yours, even across very different situations.

### Traits Versus States
Psychologists distinguish traits from states. A trait is a lasting disposition — being generally outgoing, generally anxious, generally curious. A state is a temporary condition — feeling outgoing at this particular party, anxious before this particular exam. Traits are the slow weather of a personality; states are the daily weather. Research consistently finds that traits are quite stable across adulthood, though they do change slowly with age — most people become more agreeable, more conscientious, and less neurotic as they mature.

### The Big Five
After decades of research, the field has largely converged on the Big Five model, often remembered by the acronym OCEAN. Openness to Experience reflects curiosity, imagination, and willingness to try new things. Conscientiousness reflects organization, discipline, and reliability. Extraversion reflects sociability, energy, and positive emotion — extraverts draw energy from other people, while introverts recharge in solitude. Agreeableness reflects warmth, compassion, and cooperation. Neuroticism reflects the tendency to experience negative emotions like anxiety, sadness, and irritability.

The Big Five is not a personality type system — you do not get a single label. Instead, everyone falls somewhere on each of five continuous dimensions, and the combination is what makes each personality unique. The model has been validated in many cultures and predicts real outcomes: conscientiousness predicts job performance and academic success, neuroticism predicts vulnerability to anxiety and depression, agreeableness predicts relationship quality.

### How Personality Develops
Both nature and nurture shape personality. Twin studies suggest that roughly 40 to 50 percent of the variation in personality traits is heritable. The rest comes from environment — family, peers, culture, life experiences, and chance. Brain structures and neurotransmitter systems matter too; for example, differences in dopamine and serotonin systems are linked to extraversion and neuroticism.

Personality is most flexible in childhood and adolescence, when the brain is most plastic, and tends to stabilize in the late twenties. It is not fixed, though — major life events, therapy, deliberate practice, and aging can all shift traits over time.

### Why It Matters
Understanding personality helps with self-knowledge, relationships, career choice, and team building. It also underlies much of mental health: many disorders can be understood as extreme versions of normal traits. The Big Five gives us a shared, evidence-based vocabulary for talking about the differences between us — not to put people in boxes, but to help each person find the environments and roles where they can thrive.`,
  },

  // ----------------------------------------------------------------
  // 8. MOTIVATION — WHY WE ACT, AND WHY WE PROCRASTINATE
  // ----------------------------------------------------------------
  {
    id: 'psychology-motivation',
    patterns: [/\b(motivation|intrinsic motivation|extrinsic motivation|maslow|hierarchy of needs|dopamine|procrastination|drive|motive|rajanish|uthaav)\b/i],
    keywords: ['motivation', 'intrinsic', 'extrinsic', 'maslow', 'hierarchy of needs', 'dopamine', 'procrastination', 'drive', 'reward'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Motivation is the force that initiates, directs, and sustains behavior. It is what gets us out of bed, drives us toward goals, and — when it fails — leaves us stuck on the couch. Understanding motivation means understanding why we do what we do, and why we sometimes do not.

### Intrinsic Versus Extrinsic Motivation
Psychologists distinguish two main sources of motivation. Intrinsic motivation comes from within — we do something because it is interesting, enjoyable, or personally meaningful. A child who plays piano for hours just because they love it is intrinsically motivated. Extrinsic motivation comes from outside — we do something to earn a reward, avoid a punishment, or gain approval. A child who practices only because their parents pay them per session is extrinsically motivated.

Both can drive action, but they work differently. Research by psychologists Edward Deci and Richard Ryan shows that intrinsic motivation produces more persistence, more creativity, and deeper learning. Extrinsic rewards can help in the short term, but they can also undermine intrinsic motivation — a phenomenon called the overjustification effect, where paying people for something they already enjoy can make them enjoy it less.

### Maslow's Hierarchy of Needs
Abraham Maslow, in 1943, proposed that human motivations are arranged in a hierarchy. At the base are physiological needs — food, water, sleep, warmth. Above them are safety needs — security, stability, freedom from fear. Then come belonging and love needs — relationships, intimacy, community. Above them are esteem needs — respect, recognition, achievement. At the top is self-actualization — the drive to become the fullest version of oneself, to pursue growth, creativity, and meaning. Maslow's idea was that we tend to address lower needs before higher ones, though the hierarchy is not rigid — people sometimes pursue meaning even when basic needs are unmet.

### Dopamine and the Reward System
At the brain level, motivation runs on dopamine. Dopamine is a neurotransmitter central to the brain's reward system — it is released when we anticipate a reward, not just when we receive one. This anticipation drives us to act. Damage to dopamine pathways destroys motivation even when the animal still enjoys rewards when given them directly. Addiction, in part, hijacks this system, training dopamine circuits to demand a particular source.

### Why We Procrastinate
Procrastination is often misunderstood as laziness. In fact, research suggests it is a problem of emotion regulation — we avoid tasks that make us feel anxious, bored, or incompetent, even when we know we will suffer later. The brain treats the future self as a stranger, so the discomfort of doing the task now feels more real than the relief of having it done. Strategies that work include making the next step tiny, removing distractions, committing publicly, and connecting the task to a value you care about.

### Why It Matters
Motivation sits at the center of nearly every human challenge — education, work, health, addiction, and personal growth. By understanding what drives us, we can design better habits, better organizations, and better lives.`,
  },

  // ----------------------------------------------------------------
  // 9. MENTAL HEALTH — ANXIETY, DEPRESSION, STRESS, AND THERAPY
  // ----------------------------------------------------------------
  {
    id: 'psychology-mental-health',
    patterns: [/\b(mental health|anxiety|depression|stress|therapy|cbt|cognitive behavioral therapy|talk therapy|counseling|depressed|anxious|saikoloji|tension)\b/i],
    keywords: ['mental health', 'anxiety', 'depression', 'stress', 'therapy', 'cbt', 'cognitive behavioral therapy', 'talk therapy', 'counseling', 'psychologist'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Mental health is the foundation of how we think, feel, and cope. Just as physical health is more than the absence of disease, mental health is more than the absence of mental illness — it is the capacity to handle stress, build relationships, work productively, and recover from setbacks.

### Anxiety
Anxiety is a feeling of worry, unease, or fear about something uncertain. In small doses it is normal and even helpful — it sharpens attention before a test or a performance. But when anxiety becomes excessive, persistent, and out of proportion to the actual threat, it crosses into a disorder. Common anxiety disorders include generalized anxiety disorder (chronic worry across many areas), social anxiety (intense fear of judgment), panic disorder (sudden waves of intense fear with physical symptoms), and phobias (intense fear of specific objects or situations). Anxiety disorders are among the most common mental health conditions, affecting roughly one in seven people worldwide.

### Depression
Depression is more than sadness. It is a persistent low mood accompanied by loss of interest in activities, fatigue, changes in sleep and appetite, difficulty concentrating, feelings of worthlessness, and sometimes thoughts of death. A major depressive episode lasts at least two weeks and interferes with daily life. Depression is not a sign of weakness or a choice — it is influenced by genetics, brain chemistry, life events, and chronic stress. It is also one of the leading causes of disability in the world.

### Stress
Stress is the body's response to demands or threats. Short-term stress can be useful — it focuses attention and prepares the body for action. But chronic stress, especially when we feel we have no control, wears down both body and mind. Long-term stress is linked to heart disease, weakened immunity, sleep problems, anxiety, and depression. The psychologist Hans Selye described the general adaptation syndrome, in which the body goes through alarm, resistance, and exhaustion stages when stress continues unchecked.

### Therapy Types
Several forms of therapy are well-supported by evidence. Cognitive Behavioral Therapy, or CBT, is one of the most researched and effective. It works by identifying and challenging distorted thoughts and gradually changing the behaviors they drive. CBT is effective for anxiety, depression, panic, obsessive-compulsive disorder, and many other conditions. Talk therapy, or psychodynamic therapy, explores how past experiences and unconscious patterns shape current feelings and relationships. Other evidence-based approaches include interpersonal therapy, acceptance and commitment therapy, and dialectical behavior therapy. For some conditions, medication — such as antidepressants — combined with therapy works better than either alone.

### When to Seek Help
A useful guideline is to seek help when symptoms persist for more than a couple of weeks, interfere with daily life, or cause significant distress. Thoughts of self-harm are always a reason to seek immediate help. Mental health is health. Reaching out to a doctor, counselor, or helpline is a sign of strength, not weakness, and effective treatments exist for most conditions.

### Why It Matters
Mental health shapes every other part of life — relationships, work, physical health, and happiness. Understanding it removes stigma, encourages early help, and reminds us that the mind, like the body, sometimes needs care.`,
  },

  // ----------------------------------------------------------------
  // 10. SOCIAL INFLUENCE — CONFORMITY, OBEDIENCE, BYSTANDERS, AND PERSUASION
  // ----------------------------------------------------------------
  {
    id: 'psychology-social-influence',
    patterns: [/\b(social influence|conformity|asch|obedience|milgram|bystander effect|persuasion|peer pressure|social pressure|jamati dabao)\b/i],
    keywords: ['social influence', 'conformity', 'asch', 'obedience', 'milgram', 'bystander effect', 'persuasion', 'peer pressure', 'compliance'],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `Social influence is the way our thoughts, feelings, and behaviors are shaped by the real or imagined presence of other people. We like to believe we are independent thinkers, but decades of research show that the crowd, the authority, and the situation can pull us further than we expect.

### Conformity — The Asch Experiments
Conformity is the tendency to align our attitudes and behaviors with those of a group. In the 1950s, Solomon Asch ran a now-classic experiment. Participants sat in a room with several confederates — actors working with the experimenter. The group was shown a line and asked which of three comparison lines matched it. The answer was obvious, but the confederates deliberately gave the same wrong answer on certain trials. About three-quarters of real participants conformed at least once, giving an answer they could see was wrong, simply because everyone else did. Asch showed that even without pressure or reward, the mere presence of a unanimous group powerfully shapes what we say we see.

### Obedience — The Milgram Experiments
Obedience is compliance with the orders of an authority figure. In 1961, Stanley Milgram designed one of the most controversial experiments in psychology's history. Participants were told to deliver increasingly powerful electric shocks to another person (actually an actor, receiving no shocks) whenever that person answered a memory question wrong. An authority figure in a lab coat told them to continue despite the screams. To Milgram's shock, about 65 percent of participants delivered what they believed were the maximum 450-volt shocks. The experiment revealed how easily ordinary people can be led to do harmful things under authority pressure. It also raised lasting ethical questions about research itself.

### The Bystander Effect
The bystander effect describes how people are less likely to help a person in need when others are present. The classic case was the murder of Kitty Genovese in 1964 — newspaper reports claimed dozens of neighbors heard her cries but did nothing. Later research, by Bibb Latane and John Darley, found the key factor is diffusion of responsibility: when many people are present, each individual feels less personally responsible. The effect has been replicated many times. The practical lesson is to single out one person and give a specific instruction — "You, in the red jacket, call an ambulance" — which breaks the diffusion and dramatically increases the chance of help.

### Persuasion
Persuasion is the deliberate attempt to change someone's attitudes or behavior. The psychologist Robert Cialdini identified six classic principles: reciprocity (we return favors), commitment and consistency (we honor what we have agreed to), social proof (we look to what others do), authority (we trust experts and figures of authority), liking (we say yes to people we like), and scarcity (we value what is rare). Advertising, sales, fundraising, and political campaigns lean heavily on these levers — sometimes ethically, sometimes not.

### Why It Matters
Social influence is neither good nor bad by itself. It lets societies share norms, coordinate action, and pass on culture. But it also produces prejudice, mob violence, and silence in the face of wrongdoing. Recognizing the forces that shape us is the first step toward thinking for ourselves — and toward designing organizations, schools, and communities that bring out the best in human nature.`,
  },
]
