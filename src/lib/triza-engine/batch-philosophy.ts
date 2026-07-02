/**
 * ============================================================
 *  TRIZA ENGINE — Knowledge Batch: Philosophy & Psychology
 * ============================================================
 *
 *  15 hand-written entries covering moral philosophy, logic,
 *  metaphysics, epistemology, existentialism, stoicism,
 *  utilitarianism, Buddhist and Islamic thought, Chinese
 *  philosophy, and core psychology topics (biases, memory,
 *  intelligence, consciousness, happiness).
 *
 *  Each entry includes English + Roman Urdu trigger patterns
 *  so TRIZA can respond to multilingual user queries natively.
 *
 *  All responses: 250-400 words, markdown formatted, factually
 *  accurate. No external LLM — pure TypeScript knowledge base.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const PHILOSOPHY_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------
  // 1. ETHICS
  // ----------------------------------------------------------
  {
    id: 'ethics-moral-philosophy',
    patterns: [/\b(ethics|akhlaq|akhlaqiyat|moral philosophy|morality|moral dilemma|falsafa e akhlaq|naiki|buraai|akhlaqiyat)\b/i],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `## Ethics — The Study of Moral Philosophy

### What Is Ethics?
Ethics (or moral philosophy) is the systematic study of what is right and wrong, good and bad, just and unjust. It asks how humans ought to live, what actions are permissible, and what kind of people we should become. In Roman Urdu it is often called *akhlaqiyat* or *falsafa-e-akhlaq*.

### The Three Main Branches
- **Meta-ethics** — asks where moral values come from. Are they objective truths, social constructs, or emotional responses?
- **Normative ethics** — builds frameworks for choosing right action. The three giants are virtue ethics (Aristotle), deontology (Kant), and consequentialism (Mill)
- **Applied ethics** — tackles real cases: medical ethics, business ethics, environmental ethics, AI ethics

### Major Ethical Frameworks
| Framework | Key Thinker | Core Idea |
|-----------|-------------|-----------|
| Virtue Ethics | Aristotle | Be a good person, not just do good acts |
| Deontology | Immanuel Kant | Follow universal duties regardless of outcome |
| Utilitarianism | Bentham & Mill | Maximize happiness for the most people |
| Care Ethics | Carol Gilligan | Morality grows from relationships |
| Divine Command | Various | Good = what God commands |

### Famous Dilemmas
- **The Trolley Problem** — divert a train to kill one instead of five?
- **Euthyphro Dilemma** — is something good because God commands it, or does God command it because it is good?
- **Heinz Dilemma** — steal medicine to save a dying spouse?

**Why it matters:** Ethics shapes every choice — from how we raise children to how governments draft laws. Without a moral compass, technical progress becomes dangerous; with it, progress becomes humane.`,
  },

  // ----------------------------------------------------------
  // 2. LOGIC
  // ----------------------------------------------------------
  {
    id: 'logic-valid-reasoning',
    patterns: [/\b(logic|mantiq|deductive reasoning|inductive reasoning|fallacy|logical fallacies|mantiq ka ilm|syllogism|propositional logic)\b/i],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `## Logic — The Science of Valid Reasoning

### What Is Logic?
Logic studies how conclusions follow from premises. It is the backbone of mathematics, computer science, philosophy, and law. In classical Islamic and South Asian thought it is called *mantiq*, and was a required discipline before studying theology.

### Main Types of Reasoning
- **Deductive** — general to particular. All humans are mortal, Socrates is human, therefore Socrates is mortal. Conclusion is guaranteed if premises are true.
- **Inductive** — particular to general. The sun rose every day in recorded history, so the sun will rise tomorrow. Conclusion is probable, not certain.
- **Abductive** — inference to the best explanation. The grass is wet, so probably it rained. Used in science and diagnosis.

### Common Logical Fallacies
| Fallacy | Example |
|---------|---------|
| Ad Hominem | Attack the speaker, not the argument |
| Straw Man | Misrepresent the opponent's view |
| False Dilemma | 'Either with us or against us' |
| Slippery Slope | A will lead to Z with no evidence |
| Appeal to Authority | 'X is famous so X must be right' |
| Post Hoc | B followed A, so A caused B |
| Circular Reasoning | The book is true because it says so |

### Propositional and Predicate Logic
Modern logic uses symbols: **∧** (and), **∨** (or), **¬** (not), **→** (implies), **∀** (for all), **∃** (there exists). This formal language lets computers reason and underlies every programming language.

### A Brief History
Aristotle invented formal logic with the syllogism. The Stoics added propositional reasoning. In the Islamic world, Al-Farabi and Ibn Sina refined *mantiq*. In the 19th century Frege launched modern symbolic logic, later expanded by Russell, Whitehead, and Gödel.

**Why it matters:** Logic is the immune system of the mind. It protects us from manipulation, propaganda, and self-deception — and it powers the algorithms running the modern world.`,
  },

  // ----------------------------------------------------------
  // 3. METAPHYSICS
  // ----------------------------------------------------------
  {
    id: 'metaphysics-reality-existence',
    patterns: [/\b(metaphysics|metafiziks|reality philosophy|haqiqat|existence philosophy|wajood|being philosophy|ilm ul wajood|determinism|free will)\b/i],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `## Metaphysics — The Study of Reality Itself

### What Is Metaphysics?
Metaphysics is the branch of philosophy that asks what really exists and what reality is made of. The name comes from Aristotle's works catalogued *after* his Physics — *ta meta ta physika*, 'the books after the physics'. In Urdu thought it overlaps with *ilm-ul-wajood*, the study of being.

### Central Questions
- What is ultimately real — matter, mind, or both?
- Does God exist?
- Are numbers, souls, and properties real things?
- Is the universe deterministic or open?
- What are space and time?

### Major Positions
| Question | Positions |
|----------|-----------|
| What exists? | **Monism** (one substance), **Dualism** (mind + matter), **Pluralism** (many substances) |
| Free will? | **Determinism**, **Libertarianism**, **Compatibilism** |
| Universals? | **Realism** (they exist), **Nominalism** (just names) |
| Time? | **Presentism** (only now exists), **Eternalism** (past, present, future all real) |

### Key Thinkers
- **Aristotle** — distinguished substance from accidents, potentiality from actuality
- **Descartes** — 'I think therefore I am'; mind and body are distinct substances
- **Spinoza** — God and Nature are one substance
- **Leibniz** — universe made of monads; 'we live in the best of all possible worlds'
- **Ibn Sina (Avicenna)** — argued for the Necessary Existent, a bridge to theology

### Modern Metaphysics
Today metaphysics overlaps with physics. Quantum mechanics raises old questions: is the observer necessary? Are particles real between measurements? Is information more fundamental than matter?

**Why it matters:** Every worldview — religious, scientific, atheistic — rests on metaphysical assumptions. Examining them prevents us from mistaking our model of reality for reality itself.`,
  },

  // ----------------------------------------------------------
  // 4. EPISTEMOLOGY
  // ----------------------------------------------------------
  {
    id: 'epistemology-theory-of-knowledge',
    patterns: [/\b(epistemology|theory of knowledge|ilm ki nazar|nazar e ilm|justified true belief|how do we know|empiricism|rationalism|skepticism)\b/i],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `## Epistemology — The Theory of Knowledge

### What Is Epistemology?
Epistemology asks: what is knowledge? How do we get it? How sure can we be? The word comes from Greek *episteme* (knowledge) and *logos* (study). In Islamic philosophy it is called *ilm-ul-ilm* or *nazar-e-ilm*, the science of knowing.

### The Classical Definition
For over 2,000 years knowledge was defined as **justified true belief (JTB)** — you know X if:
1. You believe X
2. X is true
3. You have good reasons for believing X

In 1963 Edmund Gettier published a three-page paper showing JTB is not enough — cases exist where all three conditions hold yet we would not call it knowledge. The 'Gettier problem' launched decades of new theories.

### Sources of Knowledge
- **Perception** — sight, hearing, touch
- **Reason** — logic and mathematics
- **Testimony** — what others tell us
- **Intuition** — direct intellectual insight
- **Revelation** — central to religious epistemology

### Major Schools
| School | Core Claim |
|--------|------------|
| **Rationalism** (Descartes, Spinoza) | Reason is the chief source |
| **Empiricism** (Locke, Hume) | All knowledge begins in experience |
| **Skepticism** (Pyrrho, Hume) | Certainty is beyond reach |
| **Pragmatism** (Peirce, Dewey) | True = what works in practice |
| **Constructivism** (Kant, Piaget) | The mind shapes what we know |

### Important Distinctions
- **A priori vs a posteriori** — known before experience vs known through it
- **Analytic vs synthetic** — true by meaning vs true by fact
- **Belief, truth, certainty** — a ladder of strength

**Why it matters:** In an age of misinformation, deepfakes, and AI-generated content, knowing *how* we know is no longer academic luxury — it is daily survival. Epistemology trains the mind to ask 'how do I know this?' before believing anything.`,
  },

  // ----------------------------------------------------------
  // 5. EXISTENTIALISM
  // ----------------------------------------------------------
  {
    id: 'existentialism-sartre-camus',
    patterns: [/\b(existentialism|mawjudiyat|sartre|jean paul sartre|camus|albert camus|absurdity|absurdism|freedom philosophy|existence precedes essence)\b/i],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `## Existentialism — Philosophy of Freedom and Absurdity

### What Is Existentialism?
Existentialism is a 20th-century European movement that places individual existence, freedom, and choice at the centre of philosophy. Its core claim: **existence precedes essence** — humans are not born with a fixed nature; we create ourselves through our choices.

### Key Figures
- **Søren Kierkegaard** (1813–1855) — Danish father of existentialism; stressed the leap of faith
- **Friedrich Nietzsche** (1844–1900) — declared 'God is dead'; urged self-overcoming
- **Jean-Paul Sartre** (1905–1980) — French exponent; wrote *Being and Nothingness*
- **Simone de Beauvoir** (1908–1986) — applied existentialism to feminism in *The Second Sex*
- **Albert Camus** (1913–1960) — novelist-philosopher of the absurd

### Core Themes
- **Radical freedom** — we are 'condemned to be free'; even refusing to choose is a choice
- **Responsibility** — we own the consequences of our actions
- **Angst** — anxiety before the weight of choice
- **Authenticity** — living in line with one's own values, not society's script
- **The Absurd** — the human search for meaning meets a silent universe

### Camus and the Myth of Sisyphus
Camus imagined Sisyphus pushing a boulder up a hill forever, only for it to roll back. He concluded: 'One must imagine Sisyphus happy.' Revolt against meaninglessness is itself meaningful.

### Existentialism and Religion
While Sartre was atheist, Kierkegaard and Marcel were Christians, and Iqbal drew on related themes. Existentialism is not necessarily godless — it simply insists that belief must be a lived, chosen, personal act, not inherited routine.

**Why it matters:** Existentialism teaches that no system, tradition, or authority can decide your life for you. In an era of mass media and algorithmic feeds, the call to live authentically — to choose your own meaning — is more urgent than ever.`,
  },

  // ----------------------------------------------------------
  // 6. STOICISM
  // ----------------------------------------------------------
  {
    id: 'stoicism-marcus-aurelius-epictetus',
    patterns: [/\b(stoicism|stoic|marcus aurelius|epictetus|seneca|stawik philosophy|tahammul|dichotomy of control|meditations aurelius)\b/i],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `## Stoicism — Philosophy of Inner Freedom

### What Is Stoicism?
Stoicism is an ancient Greek philosophy founded around 300 BCE by **Zeno of Citium**, who taught on a painted porch (*stoa poikile*) in Athens — hence the name. It teaches that virtue is the only true good, that we should accept what we cannot control, and that peace comes from mastering our own minds.

### The Three Great Stoics
| Thinker | Era | Notable Work |
|---------|-----|--------------|
| **Epictetus** (55–135 CE) | Freed slave | *Enchiridion* (the Handbook) |
| **Seneca** (4 BCE–65 CE) | Roman statesman | *Letters to Lucilius* |
| **Marcus Aurelius** (121–180 CE) | Roman emperor | *Meditations* |

### Core Principles
- **Dichotomy of control** — some things are up to us (our judgments, choices), most are not (other people, the weather, disease). Suffering arises when we forget the difference.
- **Virtue is enough** — wisdom, courage, justice, and temperance are the only true goods. Wealth, fame, and comfort are 'preferred indifferents'.
- **Live according to nature** — accept the rational order of the cosmos.
- **Negative visualization** — imagine losing what you have, to value it more.
- **View from above** — step back and see your life in cosmic perspective.

### Practical Stoic Exercises
- Each morning, anticipate what could go wrong and prepare your response
- Reframe obstacles as training
- Practice voluntary discomfort — cold showers, simple meals
- Ask 'Is this up to me?' before reacting

### Stoic Revival
Stoicism has surged in the 21st century through cognitive behavioural therapy (CBT — Albert Ellis said Stoicism was its philosophical origin), books like Ryan Holiday's *The Obstacle Is the Way*, and entrepreneurs, athletes, and soldiers who use it as a mental operating system.

**Why it matters:** Stoicism offers a portable mental toolkit that survives outside libraries and temples. It trains you to find calm in chaos — and to act with integrity regardless of reward.`,
  },

  // ----------------------------------------------------------
  // 7. UTILITARIANISM
  // ----------------------------------------------------------
  {
    id: 'utilitarianism-bentham-mill',
    patterns: [/\b(utilitarianism|bentham|jeremy bentham|john stuart mill|greatest good|greatest happiness|faida|bhalai ka faisla|consequentialism)\b/i],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `## Utilitarianism — The Greatest Good for the Greatest Number

### What Is Utilitarianism?
Utilitarianism is an ethical theory that judges actions by their consequences — specifically, by how much happiness or suffering they produce. The right action is the one that creates **the greatest happiness for the greatest number**. It emerged in 18th-century Britain as a reformist, scientific approach to morality.

### The Founders
- **Jeremy Bentham** (1748–1832) — English philosopher who proposed the 'principle of utility'. He designed the *felicific calculus* to measure pleasure by intensity, duration, certainty, and extent.
- **John Stuart Mill** (1806–1873) — refined Bentham's theory. In *Utilitarianism* (1861) he argued that pleasures differ in quality, not just quantity — 'It is better to be a human being dissatisfied than a pig satisfied.'

### Two Main Forms
| Type | Core Idea |
|------|-----------|
| **Act utilitarianism** | Judge each act individually by its consequences |
| **Rule utilitarianism** | Follow the rule that, if generally adopted, produces the most good |

### Strengths
- Simple, clear, and democratic — every person's happiness counts equally
- Justifies reforms: abolition of slavery, animal welfare, public health
- Provides a common currency for comparing difficult choices

### Famous Challenges
- **The Trolley Problem** — should you push one person to save five?
- **The Utility Monster** — what if one being can absorb more pleasure than everyone else?
- **Justice objection** — utilitarianism might permit sacrificing a minority for the majority
- **Measurement problem** — can happiness really be quantified?

### Modern Applications
Utilitarian reasoning underlies cost-benefit analysis in economics, effective altruism, healthcare triage, climate policy, and AI alignment debates. Peter Singer extends it to animals and global poverty.

**Why it matters:** When resources are finite and lives are at stake — pandemics, climate, poverty — utilitarianism offers a principled way to choose. Its blind spots (justice, rights) remind us that no single ethical theory is enough.`,
  },

  // ----------------------------------------------------------
  // 8. BUDDHIST PHILOSOPHY
  // ----------------------------------------------------------
  {
    id: 'buddhist-philosophy-four-noble-truths',
    patterns: [/\b(buddhism philosophy|buddha philosophy|four noble truths|eightfold path|dukkha|nirvana|buddh mat|siddhartha gautama|bodhi)\b/i],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `## Buddhist Philosophy — The Path to End Suffering

### Origins
Buddhist philosophy began in 5th-century BCE India with **Siddhartha Gautama**, the Buddha ('Awakened One'). After renouncing his royal life, he attained enlightenment under the Bodhi tree at Bodh Gaya and spent 45 years teaching a practical path to liberation from suffering.

### The Four Noble Truths
1. **Dukkha** — life is marked by suffering, dissatisfaction, and unsatisfactoriness
2. **Samudaya** — suffering arises from craving (*tanha*) and ignorance
3. **Nirodha** — suffering can end when craving ends (nirvana)
4. **Magga** — there is a path that leads to the end of suffering

### The Noble Eightfold Path
Grouped into three trainings:

| Group | Practices |
|-------|-----------|
| **Wisdom** (pañña) | Right View, Right Intention |
| **Ethics** (sila) | Right Speech, Right Action, Right Livelihood |
| **Meditation** (samadhi) | Right Effort, Right Mindfulness, Right Concentration |

### Core Doctrines
- **Anicca** — impermanence; everything changes
- **Anatta** — no permanent self; the 'I' is a flowing stream of processes
- **Dependent origination** — everything arises in dependence on causes and conditions
- **Karma** — intentional actions shape future experience
- **Nirvana** — extinguishing of greed, hatred, and delusion; ultimate peace

### Major Schools
- **Theravada** — older, text-based tradition dominant in Sri Lanka, Thailand, Myanmar
- **Mahayana** — emphasizes compassion and the bodhisattva ideal; spread to China, Japan, Korea
- **Vajrayana** — tantric tradition of Tibet and the Himalayas

### Modern Influence
Buddhist mindfulness practices have entered global psychology through MBSR (Mindfulness-Based Stress Reduction) by Jon Kabat-Zinn, and influenced neuroscience of meditation studied by Richard Davidson.

**Why it matters:** Buddhism offers a 2,500-year-old empirical psychology of mind — a non-theistic path that trains attention, weakens reactivity, and aims at the end of suffering. Its tools are now used in clinics, schools, and workplaces worldwide.`,
  },

  // ----------------------------------------------------------
  // 9. ISLAMIC PHILOSOPHY
  // ----------------------------------------------------------
  {
    id: 'islamic-philosophy-avicenna-averroes',
    patterns: [/\b(islamic philosophy|falsafa e islam|avicenna|ibn sina|averroes|ibn rushd|al farabi|al ghazali|golden age of islam|house of wisdom)\b/i],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `## Islamic Philosophy — Reason in the House of Revelation

### What Is Islamic Philosophy?
Islamic philosophy (*falsafa*) is the tradition of rational inquiry that flourished in the Islamic world from the 8th to the 14th centuries. It sought to harmonize Greek philosophy (especially Aristotle and Plato) with Quranic revelation, and produced some of the most influential thinkers of the Middle Ages.

### The Golden Age
From the 8th century, the **Translation Movement** in Baghdad rendered Greek, Persian, and Indian works into Arabic. Under the Abbasid caliphs — especially Al-Mamun's *House of Wisdom* — scholars of many faiths collaborated, and philosophy, mathematics, medicine, and astronomy advanced rapidly.

### Major Thinkers
| Name | Latinized | Era | Contribution |
|------|-----------|-----|--------------|
| **Al-Kindi** | Alkindus | 9th c. | First Arab philosopher |
| **Al-Farabi** | Alpharabius | 10th c. | Political philosophy, 'second teacher' after Aristotle |
| **Ibn Sina** | Avicenna | 11th c. | *The Book of Healing*; 'flying man' thought experiment |
| **Al-Ghazali** | Algazel | 11th c. | Critique of philosophers in *The Incoherence of the Philosophers* |
| **Ibn Rushd** | Averroes | 12th c. | Defended philosophy in *The Incoherence of the Incoherence* |
| **Ibn Khaldun** | — | 14th c. | Founder of sociology and historiography |

### Key Debates
- **Eternity of the world** — did God create in time, or is the universe eternal?
- **Causality** — Al-Ghazali argued God directly causes every event (occasionalism); Ibn Rushd defended natural causation
- **Immortality of the soul** — Avicenna argued the rational soul is immaterial and survives death
- **Faith vs reason** — what happens when philosophy and revelation disagree?

### Legacy to Europe
Through Toledo, Sicily, and Al-Andalus, Arabic texts reached Latin Europe. Averroes's commentaries on Aristotle shaped Thomas Aquinas, Maimonides, and the European scholastic tradition — a bridge that helped spark the Renaissance.

**Why it matters:** Islamic philosophy shows that faith and reason need not be enemies. Its rational tools — logic, debate, careful argument — shaped both Islamic theology and Western thought, and remain a living resource today.`,
  },

  // ----------------------------------------------------------
  // 10. CHINESE PHILOSOPHY
  // ----------------------------------------------------------
  {
    id: 'chinese-philosophy-confucianism-taoism',
    patterns: [/\b(confucianism|taoism|daoism|confucius|lao tzu|laozi|chinese philosophy|chini falsafa|junzi|dao de jing|yin yang|wu wei)\b/i],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `## Chinese Philosophy — Harmony, Order, and the Way

### Overview
Chinese philosophy is one of the world's oldest continuous traditions, rooted in the Spring and Autumn period (770–476 BCE). Rather than separating ethics, politics, and metaphysics, it asks one question: **how should humans live together in harmony with each other and with the cosmos?**

### The Hundred Schools of Thought
| School | Founder | Core Idea |
|--------|---------|-----------|
| **Confucianism** | Confucius (551–479 BCE) | Virtue, ritual, family, and social harmony |
| **Daoism** | Laozi (6th c. BCE) | Live in accord with the *Dao* (the Way) |
| **Legalism** | Han Feizi (3rd c. BCE) | Strict law and state power, not virtue |
| **Mohism** | Mozi (5th c. BCE) | Universal love and consequentialist ethics |
| **Chinese Buddhism** | Introduced 1st c. CE | Sinicized forms like Chan (Zen) |

### Confucianism in Brief
Confucius taught that society flourishes when people cultivate virtues through ritual (*li*) and humaneness (*ren*). Key concepts:
- **Ren** — humane benevolence, the highest virtue
- **Li** — proper ritual and etiquette
- **Xiao** — filial piety, respect for parents and ancestors
- **Junzi** — the noble person, refined through self-cultivation
- Five relationships: ruler–subject, parent–child, husband–wife, elder–younger, friend–friend

### Daoism in Brief
Where Confucianism orders society, Daoism returns to nature. Laozi's *Dao De Jing* and Zhuangzi teach:
- **Dao** — the ineffable Way that underlies all reality
- **Wu wei** — effortless action, flowing with circumstances
- **Natural simplicity** — distrust of artificial conventions
- **Yin and Yang** — complementary opposites in balance

### Legacy
Chinese philosophy shaped East Asian civilization for over two millennia and continues to influence government, medicine, martial arts, and aesthetics. Confucian ethics underpins contemporary debates on family, education, and authority across China, Korea, Japan, and Vietnam.

**Why it matters:** Chinese thought offers a third path between Western individualism and religious dogma — a pragmatic vision of life as relational, balanced, and embedded in nature. Its tools for harmony are increasingly relevant in a fragmented world.`,
  },

  // ----------------------------------------------------------
  // 11. COGNITIVE BIASES
  // ----------------------------------------------------------
  {
    id: 'cognitive-biases-thinking-errors',
    patterns: [/\b(cognitive bias|tashkeesi bias|confirmation bias|anchoring bias|daniel kahneman|kahneman|thinking fast and slow|bias kya hai|heuristic)\b/i],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `## Cognitive Biases — The Bugs in Human Thinking

### What Are Cognitive Biases?
Cognitive biases are systematic errors in thinking that distort our judgments, decisions, and memories. They arise because the brain uses mental shortcuts (*heuristics*) to process information quickly — useful most of the time, but unreliable in predictable ways.

### Why They Exist
The brain processes 11 million bits of information per second but only 50 bits reach conscious awareness. Evolution favored fast decisions over perfect ones — biases are the trade-off for speed.

### Common Biases
| Bias | What It Does |
|------|--------------|
| **Confirmation bias** | We seek and remember evidence that confirms our beliefs |
| **Anchoring** | First number or idea skews later judgments |
| **Availability heuristic** | Vivid examples feel more probable |
| **Dunning-Kruger** | The less skilled overestimate themselves; experts underestimate |
| **Framing effect** | '90% survival' sounds better than '10% mortality' |
| **Sunk cost fallacy** | We keep investing in failing projects |
| **Halo effect** | One positive trait colours our whole impression |
| **Bandwagon effect** | Beliefs spread because others hold them |
| **Negativity bias** | Bad news hits harder than good news |
| **Self-serving bias** | Success = my skill; failure = bad luck |

### Famous Researchers
- **Daniel Kahneman** and **Amos Tversky** — founders of behavioural economics; their *prospect theory* won Kahneman the 2002 Nobel Prize
- **Kahneman's book** *Thinking, Fast and Slow* popularized the dual-process model: System 1 (fast, intuitive) vs System 2 (slow, deliberate)

### How to Overcome Biases
- Slow down important decisions — engage System 2
- Actively seek disconfirming evidence
- Use checklists and pre-mortems (imagine the project failed — why?)
- Track your predictions and review them
- Diversify the voices you listen to
- Name the bias out loud when you spot it

**Why it matters:** Biases silently shape elections, hiring, medicine, justice, and investing. Learning to spot them is not about becoming a computer — it is about becoming a wiser, kinder, more honest human in a world engineered to exploit our mental shortcuts.`,
  },

  // ----------------------------------------------------------
  // 12. MEMORY
  // ----------------------------------------------------------
  {
    id: 'memory-how-brain-stores-past',
    patterns: [/\b(memory|yaadasht|yaad asht|short term memory|long term memory|how memory works|hippocampus|remember karna|working memory)\b/i],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `## Memory — How the Brain Stores the Past

### What Is Memory?
Memory is the mental process of encoding, storing, and retrieving information. It is not a video recording — it is a reconstructive act, rebuilt each time we remember, and therefore vulnerable to change. In Urdu it is called *yaadasht*.

### The Three Stages
1. **Encoding** — converting sensory input into a form the brain can hold
2. **Storage** — maintaining the information over time
3. **Retrieval** — bringing it back into conscious use

### Types of Memory
| Type | Duration | Capacity | Example |
|------|----------|----------|---------|
| **Sensory** | <1 second | Large | Brief flash of a face |
| **Short-term** | 15–30 sec | ~7 items | A phone number just heard |
| **Working** | Seconds | Limited | Doing mental arithmetic |
| **Long-term** | Minutes to lifetime | Vast | Childhood birthday |

### Long-Term Subtypes
- **Explicit (declarative)** — facts and events you can describe
  - *Episodic* — personal experiences ('my first day at school')
  - *Semantic* — general facts ('Islamabad is the capital of Pakistan')
- **Implicit (procedural)** — skills performed automatically — riding a bike, typing
- **Prospective** — remembering to do something in the future

### Brain Structures
- **Hippocampus** — forms new long-term memories; damaged in Alzheimer's
- **Amygdala** — emotional coloring of memories
- **Prefrontal cortex** — working memory
- **Cerebellum** — motor skills

### How to Improve Memory
- **Spaced repetition** — review at increasing intervals (Anki, Leitner boxes)
- **Active recall** — test yourself instead of rereading
- **Mnemonic devices** — method of loci (memory palace), acronyms, vivid imagery
- **Sleep** — consolidation happens during deep and REM sleep
- **Exercise** — boosts BDNF, a protein that supports neuron growth
- **Focus** — multitasking during encoding weakens recall

### Forgetting
Hermann Ebbinghaus's *forgetting curve* shows we lose about 50% of new information within an hour unless we review. Forgetting is not failure — it helps the brain discard noise and generalize.

**Why it matters:** Memory is the bridge between who you were and who you are. Understanding it lets us learn faster, age better, and treat memory disorders from dementia to PTSD.`,
  },

  // ----------------------------------------------------------
  // 13. INTELLIGENCE
  // ----------------------------------------------------------
  {
    id: 'intelligence-iq-multiple-intelligences',
    patterns: [/\b(intelligence|zaq|zaq o fitrat|iq|intelligence quotient|multiple intelligences|gardner|howard gardner|eq|emotional intelligence)\b/i],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `## Intelligence — What It Means to Be Smart

### What Is Intelligence?
Intelligence is the capacity to learn, reason, solve problems, and adapt to new situations. Most psychologists agree it includes abstract thinking, planning, comprehension, and learning from experience — but they debate its structure, measurement, and origins.

### The Big Debate: One or Many?
- **General intelligence (g factor)** — Charles Spearman (1904) argued a single underlying ability influences performance across all cognitive tasks
- **Fluid vs crystallized** — Raymond Cattell split *g* into:
  - *Fluid intelligence* — raw problem-solving, peaks in the 20s
  - *Crystallized intelligence* — accumulated knowledge, often grows with age

### Howard Gardner's Multiple Intelligences
Gardner (1983) proposed eight distinct intelligences:

| Intelligence | What It Captures |
|--------------|------------------|
| Linguistic | Language, writing |
| Logical-mathematical | Numbers, reasoning |
| Spatial | Mental imagery, navigation |
| Bodily-kinesthetic | Body control, athletics |
| Musical | Rhythm, pitch |
| Interpersonal | Understanding others |
| Intrapersonal | Self-awareness |
| Naturalistic | Patterns in nature |

(Naturalistic was added later; some add existential as a ninth.)

### IQ and Its Limits
The intelligence quotient (IQ) is a standardized score with a mean of 100 and standard deviation of 15. IQ tests predict academic performance and certain jobs reasonably well, but they miss creativity, wisdom, emotional depth, and practical sense. Critics note cultural bias and the risk of reducing a person to a number.

### Other Forms
- **Emotional intelligence (EQ)** — Salovey and Mayer; popularized by Daniel Goleman
- **Practical intelligence** — Robert Sternberg's 'street smarts'
- **Triarchic theory** — Sternberg combines analytical, creative, and practical

### Nature vs Nurture
Twin studies estimate IQ heritability at 50–80% in adults, but environment matters hugely — nutrition, schooling, stimulation, and stress all shape development. Genes set a range; experience determines where in that range you land.

**Why it matters:** How we define intelligence shapes education, hiring, and self-worth. A broader view frees people from the tyranny of a single score and reveals talent in places IQ tests never look.`,
  },

  // ----------------------------------------------------------
  // 14. CONSCIOUSNESS
  // ----------------------------------------------------------
  {
    id: 'consciousness-hard-problem',
    patterns: [/\b(consciousness|shaoor|awareness philosophy|hard problem of consciousness|qualia|david chalmers|chalmers|conscious experience|phenomenal consciousness)\b/i],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `## Consciousness — The Hardest Question in Science

### What Is Consciousness?
Consciousness is the felt quality of experience — what it is like to be you, to see red, taste mango, or feel pain. The word covers wakefulness, awareness of self, and subjective experience. In Urdu it is *shaoor*.

### Levels and Contents
- **Wakefulness** — being alert vs asleep or in a coma
- **Awareness** — noticing the world and one's own thoughts
- **Self-consciousness** — recognizing oneself as the subject of experience
- **Phenomenal consciousness** — the raw 'what it is like' (qualia)

### Major Theories
| Theory | Core Claim |
|--------|------------|
| **Dualism** (Descartes) | Mind and matter are separate substances |
| **Physicalism** | Consciousness is fully brain activity |
| **Functionalism** | Mind is what the brain *does*, not what it is made of |
| **Global Workspace** (Baars) | Consciousness = information broadcast across brain regions |
| **Integrated Information Theory** (Tononi) | Consciousness = integrated information (Φ) |
| **Higher-Order Theory** | A thought becomes conscious when another thought represents it |
| **Panpsychism** | Consciousness is a fundamental feature of matter |

### The Hard Problem
Philosopher **David Chalmers** (1995) distinguished:
- **Easy problems** — how the brain processes information, integrates senses, controls behaviour. Difficult but solvable with neuroscience.
- **The hard problem** — why any of this *feels* like anything at all. Why is there an inner movie?

Even a complete map of the brain would not explain why firing neurons produce the redness of red. This explanatory gap remains the deepest puzzle in the philosophy of mind.

### Measuring Consciousness
- EEG and fMRI reveal brain states
- The **coma recovery scale** tracks patients with severe brain injury
- Anesthesia research studies how consciousness turns off and on
- The **mirror test** probes self-awareness in animals and infants

**Why it matters:** Consciousness sits at the heart of ethics (who can suffer?), medicine (end-of-life decisions), AI (could a machine ever feel?), and our deepest sense of who we are. Solving it — or even asking it well — reshapes what we mean by being human.`,
  },

  // ----------------------------------------------------------
  // 15. HAPPINESS
  // ----------------------------------------------------------
  {
    id: 'happiness-science-positive-psychology',
    patterns: [/\b(happiness|khushi|khushi kaise hasil kare|positive psychology|seligman|martin seligman|well being|wellbeing|perma model|flourishing)\b/i],
    intent: 'factual_question',
    topic: 'psychology',
    response: () => `## Happiness — The Science of a Good Life

### What Is Happiness?
Happiness is a lasting state of well-being, not just a passing mood. Psychologists divide it into three parts:
- **Hedonic** — pleasure and the absence of pain
- **Eudaimonic** — meaning, growth, and living well (from Aristotle's *eudaimonia*)
- **Evaluative** — your overall judgment that life is going well

### Positive Psychology
In 1998 **Martin Seligman** launched positive psychology, shifting the field from fixing illness to flourishing. His **PERMA model** identifies five pillars of well-being:
- **P**ositive emotion
- **E**ngagement (flow)
- **R**elationships
- **M**eaning
- **A**ccomplishment

### What Actually Makes Us Happy?
The **World Happiness Report** and decades of research converge on a short list:

| Factor | Approx. Contribution |
|--------|----------------------|
| Genetics and temperament | ~50% |
| Life circumstances (income, health, geography) | ~10% |
| Intentional activity (habits, mindset, relationships) | ~40% |

The exact numbers are debated, but the lesson is clear: a large share of well-being is under our influence.

### Surprising Findings
- The **Easterlin paradox** — beyond a basic income, more money does not raise average happiness much
- **Hedonic adaptation** — we get used to changes, good or bad, faster than we expect
- Experiences bring more lasting joy than things
- Giving money away often boosts happiness more than spending it on yourself
- Strong relationships are the single strongest predictor of long-term happiness (Harvard Study of Adult Development, 85+ years)

### Evidence-Based Habits
- Gratitude journal — write three good things daily
- Regular exercise — as effective as antidepressants for mild depression
- Sleep 7–9 hours
- Meditate — even 10 minutes a day
- Nurture close relationships — call, meet, forgive
- Pursue meaningful goals, not just pleasurable ones
- Limit social media comparison

**Why it matters:** Happiness is not a luxury — it predicts health, productivity, longevity, and even stronger immune function. Treating it as a learnable skill, not a lottery ticket, may be the most practical philosophy of life.`,
  },
]
