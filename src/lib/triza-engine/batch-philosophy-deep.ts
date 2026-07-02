/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — PHILOSOPHY DEEP (Batch 7-d)
 * ============================================================
 *
 *  Deeper subtopic entries for philosophy. These go one level
 *  below the foundational batch-philosophy.ts entries: instead
 *  of "ethics" or "stoicism" in general, this batch drills into
 *  named schools, thinkers, and arguments — pre-Socratics,
 *  Socratic method, Aristotle's metaphysics, Roman Stoicism,
 *  Epicureanism and skepticism, medieval scholasticism, early
 *  modern rationalism and empiricism, Kant's transcendental
 *  philosophy, Hegel and Marx, existentialism, analytic
 *  philosophy, and the philosophy of mind.
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries with specific
 *  subtopic terms (thinker names, book titles, technical
 *  concepts) so TRIZA matches deeper questions that the broad
 *  batch would answer generically.
 *
 *  All entries are framed as intellectual history and
 *  philosophical argument, never as doctrine to believe.
 *  No external LLM API is used — these are facts TRIZA has
 *  "learned" and will express in its own voice through the
 *  self-expression + narration engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const PHILOSOPHY_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. PRE-SOCRATIC PHILOSOPHERS
  // ----------------------------------------------------------------
  {
    id: 'pre-socratic-philosophers',
    patterns: [/\b(pre socratic|pre-socratic|thales|anaximander|anaximenes|heraclitus|parmenides|democritus|pythagoras|zeno of elea|empedocles|anaxagoras|arche|first principle|apeiron|panta rhei|flux heraclitus|being parmenides|atomic theory democritus)\b/i],
    keywords: ['pre-socratic', 'thales', 'anaximander', 'heraclitus', 'parmenides', 'democritus', 'pythagoras', 'arche', 'apeiron', 'flux', 'atomism'],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `Before Socrates turned philosophy toward human questions, a series of Greek thinkers in the sixth and fifth centuries BCE tried to explain the natural world by reason rather than myth. Aristotle later called them the physiologoi — those who gave an account of nature. Their shared project was to find the arche, the first principle or underlying substance from which everything else emerges.

### Thales and the Milesian School
Thales of Miletus (c. 624 to 546 BCE), traditionally the first Western philosopher, proposed that water was the arche. The choice seems odd today, but the reasoning was bold: water can be solid, liquid, or vapour, life depends on it, and it appears to circulate endlessly through the world. Anaximander, his student, rejected any familiar stuff and posited the apeiron — the boundless or indefinite — as the source, arguing that the original principle could not itself be one of the things it generates. Anaximenes brought the answer back to a familiar element, air, which condenses into wind, cloud, water, and stone, or rarefies into fire.

### Heraclitus and Parmenides
Two thinkers defined the great debate that would run through all later metaphysics. Heraclitus of Ephesus argued that reality is constant change: "You cannot step into the same river twice." His famous phrase panta rhei — everything flows — claimed that the appearance of stability is an illusion produced by balanced opposing tensions. Fire, always consuming and renewing itself, was his image of reality.

Parmenides of Elea argued the exact opposite. Using pure logic, he concluded that change is impossible: what is, is; what is not, is not; and nothing can come from what is not. Therefore being is one, uncreated, indestructible, and unchanging. The world of change we perceive must be a deception. Parmenides' student Zeno of Elea defended this view with his famous paradoxes (Achilles and the tortoise, the flying arrow) showing that motion leads to logical contradictions.

### The Atomists and Pythagoras
Democritus (c. 460 to 370 BCE), building on Leucippus, resolved the Heraclitus-Parmenides dispute with atomism: reality consists of tiny indivisible particles (atoma) moving through empty space (the void). Change is real, but only as the rearrangement of unchanging atoms. This astonishingly modern view anticipated physics by two thousand years. Pythagoras, meanwhile, identified the arche with number — the ratios behind musical harmony and geometric forms. His insight that reality has a mathematical structure seeded Plato's later theory of forms and the entire Western tradition of mathematical science.

### Why It Matters
The pre-Socratics invented the very idea that the world is rationally intelligible — that it can be explained without appeal to myth, and that arguments should be evaluated on their logic rather than their authority. Their specific proposals about atoms, mathematical structure, and the primacy of change or being set the agenda for every philosopher who followed. When modern physics speaks of fundamental particles and conservation laws, it is answering questions the pre-Socratics first asked.`,
  },

  // ----------------------------------------------------------------
  // 2. SOCRATIC METHOD AND PLATO'S FORMS
  // ----------------------------------------------------------------
  {
    id: 'socratic-method-plato-forms',
    patterns: [/\b(socratic method|socratic elenchus|elenchus|socratic dialogue|plato|platonic|theory of forms|allegory of the cave|cave allegory|philosopher king|the republic|republic plato|platonic forms|dialectic plato|socrates|apology socrates|symposium plato)\b/i],
    keywords: ['socratic method', 'elenchus', 'plato', 'forms', 'allegory of the cave', 'philosopher king', 'republic', 'dialectic', 'socrates'],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `Socrates (470 to 399 BCE) wrote nothing. What we know of him comes through his students, above all Plato, who made him the central character of dozens of philosophical dialogues. Together they reshaped philosophy from a study of nature into a study of concepts, definitions, and the moral life — and they built the framework in which Western philosophy would operate for two thousand years.

### The Socratic Method
Socrates' signature technique was the elenchus, or cross-examination. He would approach someone who claimed knowledge — a politician, a poet, a general — and ask for a definition of a key concept like justice, courage, or piety. He would then show, through a chain of questions, that the definition contradicted other things the person believed. The result was not a new doctrine but aporia — a state of puzzled awareness that one did not really know what one had thought one knew. Socrates described himself as a midwife of ideas: he brought no views of his own, only helped others examine theirs. His claim to wisdom, as the oracle at Delphi had hinted, was that he knew he did not know.

### Plato and the Theory of Forms
Plato (c. 428 to 348 BCE) inherited the Socratic demand for definitions and pushed it into metaphysics. The everyday world we perceive, Plato argued, is a world of shifting, imperfect copies. But for any concept — beauty, justice, equality, the good — there must be a perfect, eternal, unchanging original, which he called a Form or Idea. The Form of Beauty is what makes all beautiful things beautiful; the Form of Justice is what makes just acts just. The Forms exist in a separate intelligible realm, not in space or time, and they are more real than the physical objects that participate in them.

### The Allegory of the Cave
In Book VII of the Republic Plato pictured humans as prisoners chained in a cave, watching shadows cast on a wall and taking them for reality. The philosopher is one who breaks free, climbs out into the sunlight, and sees the real world — the Forms — for the first time. The climb is painful and blinding, but the returned philosopher has a duty to go back down and try to free the others, even if they mock him. The allegory dramatises both the ascent from opinion to knowledge and the political fate of the philosopher in a society that prefers comfortable shadows.

### The Philosopher-King
The Republic is Plato's vision of a just city. He argued that justice in the state mirrors justice in the soul: reason should rule, spirit should enforce, appetite should obey. The corresponding rulers are the philosopher-kings — those who have grasped the Form of the Good and therefore know what is truly best. Plato's politics is aristocratic and anti-democratic, shaped by his experience of Athens executing Socrates; later readers have found it both profound and troubling.

### Why It Matters
The Socratic method remains the model for honest intellectual inquiry: state your view, expose it to counter-argument, and revise. Plato's Forms seeded the entire Western distinction between appearance and reality, between empirical fact and necessary truth. Mathematics, theoretical science, and abstract metaphysics all live in the world Plato opened. The Republic's question — what would a truly just society look like? — has never stopped being asked.`,
  },

  // ----------------------------------------------------------------
  // 3. ARISTOTLE — LOGIC, METAPHYSICS, AND ETHICS
  // ----------------------------------------------------------------
  {
    id: 'aristotle-logic-metaphysics',
    patterns: [/\b(aristotle|aristotelian|four causes|material cause|formal cause|efficient cause|final cause|syllogism|syllogistic|categories aristotle|hylomorphism|substance aristotle|potentiality and actuality|golden mean|virtue ethics aristotle|nicomachean ethics|organon)\b/i],
    keywords: ['aristotle', 'four causes', 'syllogism', 'categories', 'hylomorphism', 'substance', 'potentiality', 'actuality', 'golden mean', 'virtue ethics'],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `Aristotle (384 to 322 BCE), Plato's most famous student, systematised human knowledge on a scale no one had attempted before. His lectures covered logic, physics, biology, metaphysics, ethics, politics, rhetoric, and poetics, and for two thousand years his works were the standard textbooks of Europe and the Islamic world. Where Plato pointed upward to abstract Forms, Aristotle pointed outward to the world of individual things and asked how they work.

### The Four Causes
Aristotle argued that to explain anything fully we must give four causes. The material cause is what a thing is made of — bronze for a statue. The formal cause is its structure or essence — the shape of the statue. The efficient cause is what brings it into being — the sculptor's work. The final cause (telos) is its purpose — to honour a hero. Aristotle saw teleology everywhere in nature: an acorn exists in order to become an oak. The four causes give a richer explanation than modern science typically aims for, since modern science largely restricts itself to material and efficient causes.

### Syllogistic Logic
Aristotle invented formal logic. A syllogism is a structured argument in which a conclusion follows necessarily from two premises. The classic example: All humans are mortal. Socrates is human. Therefore Socrates is mortal. Aristotle catalogued the valid forms of syllogism and the fallacies that masquerade as them in his Organon. This logic was so complete that nothing essential was added to it until Frege in the late nineteenth century. The very idea that reasoning can be formalised — reduced to rules that operate on the shape of arguments regardless of their content — is Aristotle's gift.

### Categories and Hylomorphism
In his Categories Aristotle classified the basic ways we can predicate things of a subject: substance, quantity, quality, relation, place, time, position, state, action, affection. Substance is primary — it is what a thing is in itself. His hylomorphism says every physical substance is a compound of matter (hyle) and form (morphe). The matter is the potential; the form is what actualises it. A block of marble has the potential to be a statue; the sculptor's design is the form that actualises that potential.

### Potentiality and Actuality
This distinction is one of Aristotle's deepest ideas. Change is the transition from potentiality to actuality: a seed is potentially a tree, and when it grows it actualises what it already contained. The fully actual is the fully real. At the top of Aristotle's metaphysics sits the Unmoved Mover — pure actuality with no potential, since any potential would imply a prior cause. The Unmoved Mover moves the cosmos not by pushing it but as an object of love and aspiration.

### The Golden Mean
In the Nicomachean Ethics Aristotle defined the good life as eudaimonia — flourishing, not just pleasure. Virtue is a settled disposition to act well, and each virtue is a mean between two vices: courage between cowardice and recklessness, generosity between stinginess and extravagance. The mean is the right amount, at the right time, toward the right person, as a wise person would judge.

### Why It Matters
Aristotle's logic structured European and Islamic thought for nearly two millennia. His empirical method — observe, classify, explain — is the ancestor of biology and the natural sciences. His virtue ethics has been revived by modern philosophers like Alasdair MacIntyre as an alternative to Kantian duty and utilitarian calculation. The four causes, hylomorphism, and the potentiality-actuality distinction remain live tools in contemporary metaphysics. Whenever we ask what a thing is for, we are thinking in Aristotle's voice.`,
  },

  // ----------------------------------------------------------------
  // 4. STOICISM — EPICTETUS, MARCUS AURELIUS, SENECA
  // ----------------------------------------------------------------
  {
    id: 'stoicism-epictetus-marcus-aurelius',
    patterns: [/\b(stoic ethics|stoic physics|stoic logic|apatheia|prohairesis|logos stoic|stoic philosopher|enchiridion|meditations aurelius|dichotomy of control|preferred indifferent|negative visualization|view from above|seneca letters|epictetus|marcus aurelius|roman stoic)\b/i],
    keywords: ['stoic ethics', 'stoic physics', 'stoic logic', 'apatheia', 'prohairesis', 'logos', 'enchiridion', 'meditations', 'dichotomy of control', 'seneca', 'epictetus', 'marcus aurelius'],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `Stoicism, founded by Zeno of Citium around 300 BCE, became the most influential philosophical school of the Roman world. Its three surviving giants — Epictetus, Seneca, and Marcus Aurelius — came from a freed slave, a statesman, and an emperor, and between them they turned Stoicism from an abstract school into a practical art of living. The system rests on three connected parts: logic, physics, and ethics.

### The Stoic System
Stoic logic taught how to reason without error, including a sophisticated theory of perception and inference. Stoic physics held that the universe is a rational, providential whole animated by the logos — a divine reason that pervades everything. Stoic ethics followed from this cosmology: since the universe is rationally ordered, the good life is to live in agreement with nature, which means living in agreement with reason and virtue.

### The Dichotomy of Control
Epictetus opens the Enchiridion with Stoicism's most famous distinction: some things are up to us (eph' hemin), and some are not. Up to us are our judgements, intentions, desires, and aversions — the inner life. Not up to us are our body, possessions, reputation, the weather, other people's opinions, and the events of the world. Suffering arises when we try to control the uncontrollable or pin our happiness on outcomes we cannot guarantee. The Stoic trains to want only what is already in her power: to act virtuously, whatever the result.

### Apatheia and Prohairesis
The Stoic ideal is apatheia — not coldness, but freedom from destructive passions (pathe) that arise from false beliefs about good and evil. Anger, fear, grief, and craving all rest on the mistaken belief that externals can genuinely harm us. Once we see that only vice can harm the soul, the passions lose their grip. The faculty that makes this possible is prohairesis — our capacity for rational choice, our moral character. Epictetus, who had been a slave, insisted that prohairesis is the one thing no tyrant can chain.

### Seneca and Marcus Aurelius
Seneca (4 BCE to 65 CE), tutor to the emperor Nero and one of Rome's richest men, wrote letters and essays that read like a friend's advice on anger, grief, time, and death. His Letters to Lucilius urge the reader to study philosophy daily, to reflect on mortality (memento mori), and to measure wealth by need rather than desire. Marcus Aurelius (121 to 180 CE), emperor during wars, plague, and betrayal, wrote his Meditations in Greek as a private journal, never for publication. He reminds himself each morning that he will meet the ungrateful, the arrogant, and the selfish — and that none of them can harm his character unless he lets them.

### Stoic Exercises
Stoicism is a discipline, not a theory. Morning premeditation of evils prepares the mind for setbacks. The view from above zooms out until one's life looks like a dot in cosmic time. Negative visualisation imagines losing what one has, to value it properly. The evening review examines the day's judgements: where did I act well, where did I drift toward vice?

### Why It Matters
Stoicism is the philosophical ancestor of cognitive behavioural therapy; Albert Ellis openly credited Epictetus as a source. Modern readers from soldiers to entrepreneurs use Marcus Aurelius and Seneca as a mental operating system for high-stress lives. The dichotomy of control is a portable tool that survives outside libraries and temples, training the mind to find calm in chaos and to act with integrity regardless of reward.`,
  },

  // ----------------------------------------------------------------
  // 5. EPICUREANISM AND SKEPTICISM
  // ----------------------------------------------------------------
  {
    id: 'epicureanism-skepticism',
    patterns: [/\b(epicureanism|epicurus|epicurean|ataraxia|aponia|hedonic calculus|hedonism epicurean|katastematic pleasure|epicurean vs stoic|pyrrhonism|pyrrho|pyrrhonian skepticism|academic skepticism|epoch|epoche|carneades|sextus empiricus|skeptical tropes)\b/i],
    keywords: ['epicureanism', 'epicurus', 'ataraxia', 'aponia', 'hedonic calculus', 'pyrrhonism', 'academic skepticism', 'epochē', 'sextus empiricus'],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `Two rival Hellenistic schools offered alternatives to Stoic discipline. The Epicureans pursued pleasure — but defined pleasure so carefully that it looked more like tranquillity than indulgence. The Skeptics went further, suspending judgement about truth altogether. Both schools shaped Western thought for centuries and remain live options in contemporary philosophy.

### Epicurus on Pleasure
Epicurus (341 to 270 BCE) founded his school, the Garden, just outside Athens. He taught that the goal of life is pleasure — but his definition of pleasure was negative: the absence of pain in the body (aponia) and the absence of disturbance in the soul (ataraxia). The highest pleasure is not maximal stimulation but the quiet contentment of a self-sufficient life with friends. The famous Epicurean tetrapharmakos (four-part cure) summarises the path: do not fear God, do not fear death, the good is easy to get, the terrible is easy to endure.

### Hedonic Calculus and the Types of Desire
Epicurus classified desires into three groups. Natural and necessary desires (hunger, thirst, rest) are easy to satisfy and bring the body to aponia. Natural but unnecessary desires (luxurious food, sexual variety) are avoidable and bring more disturbance than satisfaction. Vain and empty desires (fame, political power, immortality) can never be satisfied and torment those who pursue them. The hedonic calculus asks us to weigh pleasure against pain over the long term: a short-term pleasure that brings long-term pain is to be rejected, and a short-term pain that brings long-term pleasure is to be chosen.

### Epicurean vs Stoic
The two schools share more than either admitted. Both aim at tranquillity, both value self-sufficiency, both urge us to focus on what is in our control. They differ on the highest good: Epicurus says pleasure, the Stoics say virtue. Epicurus treats virtue as a means to pleasure; the Stoics treat virtue as identical to the good and pleasure as a preferred indifferent. The Stoic sage endures the world's evils with dignity; the Epicurean sage withdraws to the Garden to escape them.

### Pyrrhonian Skepticism
Pyrrho of Elis (c. 360 to 270 BCE) inspired a radical tradition: for any argument there is an equally strong counter-argument, so the only honest response is epochē — suspension of judgement. Sextus Empiricus (c. 160 to 210 CE), our main source, recorded the Ten Modes of skepticism: differences in animals, in humans, in senses, in circumstances, in positions, in mixtures, in quantities, in frequency, in relativity, and in custom. For any appearance, a contradictory appearance can be produced. The Skeptic does not deny that things appear — only that we can know how they really are.

### Academic Skepticism
The Academy (Plato's school) under Arcesilaus and Carneades took a different line: knowledge is impossible, but some beliefs are more plausible than others, and we should act on the plausible without claiming certainty. Carneades famously argued both sides of the justice question in Rome on successive days, scandalising the senators. The Academic and Pyrrhonian traditions debated whether even the claim "I know nothing" was itself a piece of knowledge.

### Why It Matters
Epicurean atomism (taken from Democritus) shaped modern materialist science and the revival of atomism in the seventeenth century. The hedonic calculus is the ancestor of utilitarianism. Skepticism's insistence that beliefs should match their evidence, and that conflicting arguments deserve equal weight, is the seed of the scientific method's humility. Both schools model a kind of intellectual therapy: philosophy not as a system of doctrines but as a way to live with uncertainty without despair.`,
  },

  // ----------------------------------------------------------------
  // 6. MEDIEVAL SCHOLASTICISM AND AQUINAS
  // ----------------------------------------------------------------
  {
    id: 'medieval-scholasticism-aquinas',
    patterns: [/\b(scholasticism|scholastic method|scholastic philosophy|thomas aquinas|aquinas|summa theologica|five ways aquinas|unmoved mover aquinas|faith and reason|fides et ratio|nominalism vs realism|william of ockham|ockham|ockham's razor|duns scotus|peter abelard|universals debate|medieval philosophy)\b/i],
    keywords: ['scholasticism', 'aquinas', 'summa theologica', 'five ways', 'faith and reason', 'nominalism', 'realism', 'ockham', "ockham's razor", 'universals'],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `Scholasticism was the dominant intellectual method of medieval European universities from roughly 1100 to 1500 CE. As intellectual history, it represents one of the most ambitious attempts ever made to build a complete rational system of the world by reconciling ancient Greek philosophy, especially Aristotle, with Christian theology. Whether or not one accepts its conclusions, the scholastic project shaped how the West reasons.

### The Scholastic Method
The scholastic method worked by posing a question (quaestio), gathering authoritative sources on both sides, resolving the contradiction through reasoned argument, and replying to each objection. Peter Abelard's Yes and No pioneered the technique by listing apparently contradictory passages from Church authorities and forcing students to harmonise them through dialectic. Thomas Aquinas' Summa Theologica is the masterwork of the genre — thousands of articles, each proceeding through objections, a sed contra, the body of the argument, and replies to every objection. The discipline of stating the strongest opposing view before answering it remains a model of intellectual honesty.

### Faith and Reason
The central philosophical problem of the period was the relationship between faith and reason. Aquinas (1225 to 1274) argued that the two were harmonious: truths about God's existence could be demonstrated philosophically (the preambles of faith), while doctrines like the Trinity exceeded reason and required revelation. Duns Scotus and William of Ockham later pushed back, arguing that God's will was absolutely free and not bound by rational necessity — a sharp break from Aquinas' confidence in rational theology and a move toward a voluntarist picture of the world.

### Aquinas' Five Ways
As a philosophical argument, the Five Ways in the Summa Theologica tried to demonstrate God's existence from features of the natural world rather than from authority. The First Way argues from motion to an unmoved mover. The Second from efficient causation to an uncaused cause. The Third from contingency to a necessary being. The Fourth from degrees of perfection to a maximum. The Fifth from the order of natural things to an intelligent ordering cause. Whether one accepts the conclusions or not, the Five Ways are historically important as one of the most influential attempts to argue metaphysically rather than from scripture.

### The Debate Over Universals
The medieval debate over universals asked whether general terms like "humanity" or "redness" correspond to real existing entities. Realists, following Plato and Augustine, held that universals exist independently of particular things. Nominalists, especially William of Ockham, denied this: only individual things exist, and universals are merely names (nomina) we use to group similar particulars. Conceptualists took a middle path, holding that universals exist as concepts in the mind.

### Ockham's Razor
William of Ockham (c. 1287 to 1347) gave his name to the principle of parsimony: entities should not be multiplied beyond necessity. The simplest explanation that fits the facts is to be preferred. As a methodological rule, Ockham's razor became one of the most influential ideas in the history of science, even though Ockham himself used it primarily in metaphysical disputes.

### Why It Matters
Scholasticism shaped European intellectual life for four centuries and produced tools — disputation, citation, systematic questioning, the strongest-objection-first format — that still underwrite academic philosophy. The faith-reason debate set the terms in which the Scientific Revolution and Enlightenment would later define themselves. Ockham's razor is now a standard principle in scientific model-building. Read as intellectual history rather than doctrine, the scholastics' discipline of arguing carefully from explicit premises left a permanent mark on how the West reasons.`,
  },

  // ----------------------------------------------------------------
  // 7. RATIONALISM — DESCARTES, SPINOZA, LEIBNIZ
  // ----------------------------------------------------------------
  {
    id: 'rationalism-descartes-spinoza-leibniz',
    patterns: [/\b(rationalism|rationalist|descartes|rene descartes|cogito ergo sum|cogito|methodological doubt|cartesian dualism|mind body dualism|evil demon|meditations on first philosophy|spinoza|baruch spinoza|ethics spinoza|substance monism|pantheism spinoza|deus sive natura|leibniz|monadology|monad|prestablished harmony|innate ideas|principle of sufficient reason)\b/i],
    keywords: ['rationalism', 'descartes', 'cogito', 'methodological doubt', 'dualism', 'spinoza', 'monism', 'pantheism', 'leibniz', 'monadology', 'innate ideas'],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `The seventeenth-century rationalists — Descartes, Spinoza, and Leibniz — held that the mind can reach substantive truths about reality through reason alone, independent of sensory experience. They shared a confidence in clear and distinct ideas, deductive method, and a mathematical ideal of philosophy. Together they launched modern philosophy and set the agenda the empiricists would soon contest.

### Descartes' Methodological Doubt
Rene Descartes (1596 to 1650) resolved to rebuild knowledge from scratch. In his Meditations on First Philosophy (1641) he applied methodological doubt to every belief: the senses sometimes deceive us; dreams feel real while we dream; even mathematics might be the work of an evil demon dedicated to misleading him. The one thing he could not doubt was that he was doubting. Cogito ergo sum — I think, therefore I am — became the indubitable foundation on which he rebuilt knowledge, arguing outward via the existence of a non-deceiving God to the reliability of clear and distinct ideas and the existence of the material world.

### Cartesian Dualism
Descartes concluded that reality contains two fundamentally different kinds of substance: res cogitans (thinking stuff, the mind) and res extensa (extended stuff, matter). The mind is unextended and indivisible; matter is extended and divisible. This mind-body dualism gave physics a clean, purely mechanical world to study but left the mind-body interaction as a permanent puzzle — how does an unextended mind move a material body? Descartes suggested the pineal gland as the point of contact, a hypothesis no one found convincing.

### Spinoza's Monism
Baruch Spinoza (1632 to 1677) thought Descartes had botched the substance question. If substance is defined as something that exists in itself and is conceived through itself, then there can be only one substance — the whole of reality, which Spinoza called God-or-Nature (deus sive natura). What Descartes called mind and matter are not separate substances but two attributes of the one substance, known in different ways. Spinoza's Ethics (1677) proceeds in geometrical order — definitions, axioms, propositions, proofs — to argue that everything follows necessarily from the nature of this single substance. There is no contingency, no free will in the ordinary sense, no supernatural realm. Human freedom lies in understanding necessity, an idea that deeply influenced later thinkers from Goethe to Einstein.

### Leibniz's Monads and Sufficient Reason
Gottfried Wilhelm Leibniz (1646 to 1716) rejected both Descartes' dualism and Spinoza's monism. Reality, he argued in the Monadology (1714), is composed of monads — simple, indivisible, immaterial centres of perception. Monads have no windows; they do not interact. They unfold according to their own internal laws, and God has arranged a pre-established harmony among them so that each monad's perceptions mirror the universe from its own perspective. Leibniz grounded this picture in the principle of sufficient reason: nothing happens without a reason why it is so rather than otherwise. This led him to conclude that the actual world is the best of all possible worlds — a view Voltaire later satirised in Candide.

### Why It Matters
Descartes' cogito is the moment modern philosophy begins, with the first-person thinker as the foundation of certainty. Mind-body dualism still shapes how medicine, law, and common sense think about consciousness. Spinoza's monism anticipates contemporary naturalism and continues to inspire philosophers of mind. Leibniz's principle of sufficient reason underwrites the very idea that the universe is rationally intelligible — the assumption on which all science rests.`,
  },

  // ----------------------------------------------------------------
  // 8. EMPIRICISM — LOCKE, BERKELEY, HUME
  // ----------------------------------------------------------------
  {
    id: 'empiricism-locke-berkeley-hume',
    patterns: [/\b(empiricism|empiricist british|john locke|locke essay|tabula rasa|blank slate|primary qualities|secondary qualities|george berkeley|berkeley idealism|subjective idealism|esse est percipi|to be is to be perceived|david hume|hume problem of induction|problem of induction|bundle theory of self|hume fork|impressions and ideas|treatise of human nature)\b/i],
    keywords: ['empiricism', 'locke', 'tabula rasa', 'primary qualities', 'secondary qualities', 'berkeley', 'idealism', 'esse est percipi', 'hume', 'problem of induction', 'bundle theory'],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `The British empiricists — Locke, Berkeley, and Hume — answered the rationalists by insisting that all ideas ultimately derive from sensory experience. The mind, they argued, is not stocked with innate concepts but built up from what the senses deliver. Their work laid the groundwork for modern psychology and skepticism.

### Locke's Tabula Rasa
John Locke (1632 to 1704) attacked the doctrine of innate ideas in his Essay Concerning Human Understanding (1690). At birth the mind is a tabula rasa — a blank slate — and all its contents come from experience. Experience has two sources: sensation, which supplies ideas of colour, sound, and heat; and reflection, which supplies ideas of the mind's own operations like thinking, willing, and doubting. Simple ideas combine into complex ideas through the mind's active powers. Locke conceded that some ideas (like God or infinity) are not directly sensed but argued they are still constructed from sensed materials.

### Primary and Secondary Qualities
Locke distinguished primary qualities — inseparable from the object, such as solidity, extension, figure, motion, and number — from secondary qualities — powers in the object to produce sensations in us, such as colour, taste, and smell. A snowball is really round, cold, and solid (primary); its whiteness and cold-feeling are effects in us, not properties of the snow itself.

### Berkeley's Subjective Idealism
George Berkeley (1685 to 1753) pushed empiricism to a startling conclusion. If, as Locke said, we only ever perceive our own ideas, what justifies the belief in a material substance behind them? Berkeley argued there is no such substance. To be is to be perceived — esse est percipi. The table exists only as a bundle of ideas perceived by some mind. When no finite mind perceives it, it continues to exist in the mind of God, who sustains the regularity of experience. Berkeley aimed to defeat skepticism and materialism at one stroke: if matter does not exist, neither does the threat that our ideas misrepresent an external world.

### Hume's Problem of Induction
David Hume (1711 to 1776) carried empiricism to its logical limit in A Treatise of Human Nature (1739) and the Enquiries. He distinguished impressions (vivid sensory experiences) from ideas (their faint copies in thought). His most famous result is the problem of induction: there is no non-circular rational justification for believing that the future will resemble the past. We see the sun rise every morning and expect it tomorrow, but no logical argument compels that expectation. We are creatures of habit, not reason, in our causal judgments.

### The Bundle Theory of Self and Hume's Fork
Hume also turned his skepticism inward. Searching his own mind, he found only a stream of perceptions — pains, pleasures, memories — but no impression of a continuous self. The self is not a substance but a bundle of perceptions linked by relations of resemblance and causation; personal identity is a useful fiction we construct, not a thing we discover. Hume's Fork divided all genuine knowledge into relations of ideas (true by definition, like mathematics) and matters of fact (knowable only by experience). Anything that fits neither category — metaphysics, speculative philosophy — was consigned to the flames.

### Why It Matters
Locke's tabula rasa seeded modern psychology and the social sciences' assumption that human nature is shaped by environment. Berkeley's idealism remains a live option in philosophy of perception and anticipates contemporary "simulation" thought experiments. Hume's problem of induction is still unsolved and haunts every scientific generalisation. The empiricist insistence that claims must answer to evidence remains the operating principle of science.`,
  },

  // ----------------------------------------------------------------
  // 9. KANT'S COPERNICAN REVOLUTION
  // ----------------------------------------------------------------
  {
    id: 'kant-copernican-revolution',
    patterns: [/\b(immanuel kant|kant|copernican revolution kant|synthetic a priori|categorical imperative|critique of pure reason|transcendental idealism|phenomenon|phenomena and noumena|noumenon|categories of understanding|transcendental deduction|kingdom of ends|categorical vs hypothetical imperative|kantian ethics)\b/i],
    keywords: ['kant', 'copernican revolution', 'synthetic a priori', 'categorical imperative', 'critique of pure reason', 'transcendental idealism', 'phenomenon', 'noumenon', 'categories'],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `Immanuel Kant (1724 to 1804) is widely regarded as the pivot of modern philosophy. He set out to rescue knowledge from Hume's skepticism while preserving the limits the empiricists had exposed. His solution was a "Copernican revolution" in philosophy: instead of asking how the mind conforms to objects, he asked how objects conform to the mind. The result transformed epistemology, metaphysics, and ethics.

### Synthetic A Priori
Kant distinguished analytic judgments (where the predicate is contained in the subject, like "all bachelors are unmarried") from synthetic judgments (where the predicate adds new information, like "this bachelor is tall"). He also distinguished a priori knowledge (independent of experience) from a posteriori knowledge (grounded in experience). The burning question was whether synthetic a priori judgments exist — truths informative yet knowable without experience. Kant argued yes: mathematics ("seven plus five equals twelve"), natural science ("every event has a cause"), and metaphysics all involve such judgments. Hume had denied the possibility; Kant made it the foundation of his system.

### The Categories of Understanding
Kant's Copernican move was to say that the mind does not passively receive reality; it actively structures it. The raw material of sensation must be ordered through two a priori forms of intuition — space and time — and then through twelve categories of understanding, including unity, plurality, causality, and substance. These categories are not derived from experience; they make experience possible. We cannot know things as they are in themselves (the noumena) but only as they appear to us structured by these forms (the phenomena).

### Phenomenon and Noumenon
Kant's distinction between appearance and thing-in-itself is the heart of transcendental idealism. The phenomenal world is shaped by our cognitive apparatus; the noumenal world, as it is independently of us, is forever beyond direct knowledge. Kant was not a skeptic: within the phenomenal world we can have objective, scientific knowledge. But speculative metaphysics about God, freedom, and the soul fails, because those topics concern noumena, which exceed the bounds of possible experience.

### The Categorical Imperative
In the Critique of Pure Reason (1781) Kant reformed metaphysics; in the Critique of Practical Reason (1788) he reformed ethics. He sought a moral law that binds all rational agents regardless of desire or consequence. The categorical imperative commands: act only according to that maxim by which you can at the same time will that it should become a universal law. A second formulation runs: act so that you treat humanity, whether in your own person or in another, always as an end and never merely as a means. Unlike hypothetical imperatives (if you want X, do Y), the categorical imperative applies unconditionally.

### Kingdom of Ends and Autonomy
Kant pictured an ideal community — the kingdom of ends — in which all rational beings legislate universal moral law for themselves and treat one another as ends in themselves. Moral action is autonomous: the rational agent gives the law to himself, rather than being driven by inclination. Kant tied morality to freedom: only a free being can act from duty, and only action from duty has genuine moral worth.

### Why It Matters
Kant's synthesis of rationalism and empiricism set the agenda for two centuries of philosophy. German Idealism, Neo-Kantianism, phenomenology, and contemporary analytic ethics all define themselves against him. The categorical imperative remains one of the three leading moral theories alongside utilitarianism and virtue ethics. The idea that the mind actively structures experience underwrites modern cognitive science. Whenever we ask what we can know and what we must merely believe, we are Kant's heirs.`,
  },

  // ----------------------------------------------------------------
  // 10. HEGEL AND MARX — DIALECTIC
  // ----------------------------------------------------------------
  {
    id: 'hegel-marx-dialectic',
    patterns: [/\b(hegel|hegelian|georg wilhelm friedrich hegel|dialectic hegel|thesis antithesis synthesis|absolute idealism|master slave dialectic|lordship and bondage|phenomenology of spirit|marx|karl marx|historical materialism|dialectical materialism|alienation marx|base and superstructure|class struggle|capital marx|communist manifesto)\b/i],
    keywords: ['hegel', 'dialectic', 'absolute idealism', 'master-slave dialectic', 'phenomenology of spirit', 'marx', 'historical materialism', 'alienation', 'base and superstructure', 'class struggle'],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `Georg Wilhelm Friedrich Hegel (1770 to 1831) and Karl Marx (1818 to 1883) together built the most influential dialectical philosophy of the modern era. Hegel turned the dialectic into a metaphysics of history; Marx turned it against Hegel and made it a tool of social and economic analysis. Their ideas reshaped nineteenth- and twentieth-century politics, sociology, and critical theory.

### Hegel's Dialectic
Hegel's dialectic is often summarised as thesis-antithesis-synthesis, though he himself rarely used those terms. The idea is that any concept or historical formation (thesis) carries internal contradictions that generate its opposite (antithesis), and the conflict is resolved at a higher level (synthesis, or what Hegel called Aufhebung — a German verb meaning simultaneously to cancel, preserve, and lift up). The synthesis preserves what was true in both earlier stages while transcending them. Each synthesis becomes a new thesis, and the dialectic continues.

### Absolute Idealism
Hegel held that reality is the self-development of Geist — spirit or mind — coming to know itself through history. Reality is rational, and the rational is real. History is the progressive unfolding of freedom: in the ancient world one was free (the despot), in the classical world some were free (the citizens), and in the modern constitutional state all are free (at least in principle). The Phenomenology of Spirit (1807) traces the dialectical education of consciousness from raw sense-experience through self-consciousness, reason, and spirit to absolute knowing.

### The Master-Slave Dialectic
One of the Phenomenology's most famous passages is the master-slave dialectic (lordship and bondage). Two self-consciousnesses meet; each wants recognition from the other. A struggle ensues, and one side submits, becoming the slave while the other becomes the master. But the recognition the master receives is worthless, because it comes from a slave rather than an equal. The slave, forced to labour on the material world, develops skills, self-discipline, and ultimately self-consciousness through work. The dialectic reverses: the master becomes dependent, the slave becomes independent. This passage influenced Marx, existentialism, and postcolonial theory.

### Marx's Historical Materialism
Marx accepted Hegel's dialectical method but "stood it on its head." Where Hegel saw Geist driving history, Marx saw material conditions — the ways humans produce their livelihood — doing the driving. Historical materialism argues that the economic base (forces and relations of production) shapes the superstructure (law, politics, religion, art, philosophy). Each historical epoch is defined by a mode of production: ancient slavery, feudalism, capitalism. Class struggle between those who own the means of production and those who labour is the engine of historical change.

### Alienation and Ideology
In the Economic and Philosophic Manuscripts of 1844 Marx described four ways capitalism alienates the worker: from the product of her labour (which belongs to the capitalist), from the act of labour itself (which is rote rather than creative), from her species-being (her human essence as a free producer), and from other workers (whom she meets as competitors). Capital (1867) analysed how surplus value is extracted from labour-power and reinvested for accumulation. The base-superstructure model holds that the dominant ideas of an epoch are the ideas of its ruling class, seeding ideology critique from Gramsci to the Frankfurt School to Foucault.

### Why It Matters
Hegel's dialectic reshaped how we think about historical change and contradiction; almost every later social theory either adopts or reacts against it. Marx's analysis of capitalism — commodification, alienation, crises of overaccumulation — remains a starting point for political economy and critical theory. The master-slave dialectic, the labour theory of value, and the base-superstructure model are unavoidable tools for thinking about power, ideology, and historical change.`,
  },

  // ----------------------------------------------------------------
  // 11. EXISTENTIALISM — KIERKEGAARD, NIETZSCHE, SARTRE, CAMUS
  // ----------------------------------------------------------------
  {
    id: 'existentialism-kierkegaard-sartre',
    patterns: [/\b(soren kierkegaard|kierkegaard|leap of faith|fear and trembling|anxiety kierkegaard|angst|friedrich nietzsche|nietzsche|ubermensch|will to power|genealogy of morals|thus spoke zarathustra|god is dead|jean paul sartre|sartre|being and nothingness|bad faith|mauvaise foi|existence precedes essence|albert camus|camus|the myth of sisyphus|the absurd|the stranger camus|absurdism)\b/i],
    keywords: ['kierkegaard', 'leap of faith', 'anxiety', 'nietzsche', 'ubermensch', 'will to power', 'sartre', 'bad faith', 'existence precedes essence', 'camus', 'absurd'],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `Existentialism is the nineteenth- and twentieth-century movement that places individual existence, freedom, and responsibility at the centre of philosophy. Its roots lie in Kierkegaard's rebellion against Hegel's system and Nietzsche's demolition of inherited values; its mature form appears in Sartre, de Beauvoir, and Camus after the Second World War. Against all systems that explain the human being from outside — biology, history, society — existentialism insists that the individual is what she makes of herself.

### Kierkegaard's Leap and Anxiety
Soren Kierkegaard (1813 to 1855) attacked Hegel's vast rational system as a betrayal of the existing individual. Truth is not objective and abstract but subjective and lived. In Fear and Trembling he dramatised the leap of faith — the moment when the individual stands alone before the absolute, beyond the universal ethical law. Whether one accepts Kierkegaard's religious frame or not, his point about commitment stands: some choices cannot be justified by reasoning and must be made in passionate inwardness. In The Concept of Anxiety he argued that freedom itself produces anxiety (angst): standing before infinite possibility, the self feels vertigo.

### Nietzsche and the Will to Power
Friedrich Nietzsche (1844 to 1900) announced that "God is dead" — meaning the Christian-moral worldview had lost its cultural force — and asked what would follow. Without inherited values, humanity faced nihilism. Nietzsche's response was the will to power: the drive not merely to survive but to overcome, to create, to impose form. The Ubermensch is the figure who creates new values in the absence of any transcendent source. In On the Genealogy of Morals he argued that morality itself has a history, that "good and evil" grew out of a slave revolt that inverted the aristocratic "good and bad." His genealogical method reshaped twentieth-century thought from Foucault to contemporary metaethics.

### Sartre: Existence Precedes Essence
Jean-Paul Sartre (1905 to 1980) gave existentialism its clearest formulation. In Being and Nothingness (1943) he argued that for humans, existence precedes essence. A paperknife is designed for a purpose — its essence comes first. A human being first exists, then defines herself through choices. There is no human nature to discover, only one to create. This radical freedom brings crushing responsibility: we cannot blame our nature, our circumstances, or our upbringing.

### Bad Faith
Sartre's most famous ethical concept is bad faith (mauvaise foi): the lie we tell ourselves when we pretend we are not free. The waiter who plays at being a waiter, the student who says she "had no choice" but to defer to her father — all deny their freedom by fleeing into a fixed role. Authenticity means accepting that we are the authors of our choices and their consequences.

### Camus and the Absurd
Albert Camus (1913 to 1960) refused the label "existentialist" but shared its themes. In The Myth of Sisyphus (1942) he argued that the human search for meaning meets a silent, indifferent universe — this confrontation is the Absurd. Camus rejected both suicide and religious leap as responses. Sisyphus, condemned to push a boulder up a hill forever, can still affirm his fate: "One must imagine Sisyphus happy." Revolt against meaninglessness is itself meaningful.

### Why It Matters
Existentialism emerged from the wreckage of two world wars and the collapse of inherited certainties. Its insistence that individuals author their own lives shaped post-war ethics, literature, and psychotherapy. Nietzsche's genealogy reshaped how we study morality and power. Sartre's bad faith remains a tool for spotting self-deception. The call to live authentically is more urgent than ever in an age of algorithmic feeds and inherited scripts.`,
  },

  // ----------------------------------------------------------------
  // 12. ANALYTIC PHILOSOPHY AND WITTGENSTEIN
  // ----------------------------------------------------------------
  {
    id: 'analytic-philosophy-wittgenstein',
    patterns: [/\b(analytic philosophy|gottlob frege|frege|bertrand russell|russell|logicism|principia mathematica|on denoting|wittgenstein|ludwig wittgenstein|tractatus logico-philosophicus|tractatus|picture theory|philosophical investigations|language games|private language argument|form of life|logical positivism|vienna circle|ayer|verification principle|quine|two dogmas of empiricism|w v o quine)\b/i],
    keywords: ['analytic philosophy', 'frege', 'russell', 'logicism', 'wittgenstein', 'tractatus', 'picture theory', 'philosophical investigations', 'language games', 'logical positivism', 'vienna circle', 'quine'],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `Analytic philosophy emerged in the early twentieth century around the project of applying the new formal logic to philosophical problems. Its founding figures — Frege, Russell, and the early Wittgenstein — believed that many traditional puzzles arose from misunderstandings of language, and that careful logical analysis could either solve them or dissolve them.

### Frege and Russell's Logicism
Gottlob Frege (1848 to 1925) invented modern quantificational logic and tried to show that arithmetic is reducible to logic — a project called logicism. Bertrand Russell (1872 to 1970) extended the project but discovered the paradox that bears his name: the set of all sets that do not contain themselves both must and must not contain itself. The paradox broke Frege's system and forced Russell into the theory of types, codified in Principia Mathematica (1910 to 1913), written with Alfred North Whitehead. Russell's On Denoting (1905) showed how puzzles about meaning (the present King of France is bald) could be dissolved by analysis of definite descriptions.

### The Early Wittgenstein: Tractatus
Ludwig Wittgenstein (1889 to 1951) arrived in Cambridge to study with Russell and produced the Tractatus Logico-Philosophicus (1921). Its picture theory of meaning held that a proposition is a picture of reality: it shares its logical form with the fact it represents. Meaningful propositions fall into two kinds: empirical statements about the world, and tautologies of logic. Everything else — ethics, aesthetics, religion, the meaning of life — is literally unsayable, though it can show itself in how we live. The book ends: "Whereof one cannot speak, thereof one must be silent."

### Logical Positivism and the Vienna Circle
The Vienna Circle, led by Moritz Schlick in the 1920s, built logical positivism on the Tractatus. The verification principle held that a statement is meaningful only if it is either analytic (true by definition) or empirically verifiable. Metaphysics, theology, and ethics were dismissed as cognitively meaningless. A. J. Ayer imported the doctrine in Language, Truth and Logic (1936). The movement was self-undermining: the verification principle itself is neither analytic nor verifiable, so by its own standard it is meaningless.

### The Later Wittgenstein: Language Games
Wittgenstein returned to philosophy in 1929 and radically changed his mind. The posthumous Philosophical Investigations (1953) rejected the picture theory. Meaning is not a logical mapping to facts; it is use. The same word means different things in different contexts, and each context is a language game embedded in a form of life. There is no essence of language underlying all these games — only family resemblances. The private language argument tried to show that a language understandable by only one person in principle is impossible, because meaning requires public criteria of correctness.

### Quine and the Web of Belief
W. V. O. Quine (1908 to 2000) delivered another blow to logical positivism in Two Dogmas of Empiricism (1951). He attacked the analytic-synthetic distinction, arguing there is no sharp line between truths true by meaning and truths true by fact. He also rejected reductionism, the idea that each statement can be reduced to immediate sensory experience. Quine replaced both with a holistic picture: beliefs form a web that faces the tribunal of experience as a whole, and any belief (even logic) can be revised if enough else changes.

### Why It Matters
Analytic philosophy brought the precision of formal logic to questions of meaning, reference, mind, and science. Frege's quantifiers underlie every modern logic course and computer science curriculum. The two Wittgensteins frame a debate about meaning that still defines philosophy of language. Quine's holism reshaped epistemology, and analytic philosophy's toolkit is now philosophy's common property.`,
  },

  // ----------------------------------------------------------------
  // 13. PHILOSOPHY OF MIND AND CONSCIOUSNESS
  // ----------------------------------------------------------------
  {
    id: 'philosophy-mind-consciousness',
    patterns: [/\b(philosophy of mind|mind body problem|dualism philosophy|substance dualism|property dualism|physicalism|materialism philosophy|identity theory|functionalism|qualia|hard problem of consciousness|david chalmers|chalmers|mary's room|mary the colour scientist|chinese room|searle|john searle|intentionality|zombie argument|philosophical zombie|epiphenomenalism|consciousness philosophy)\b/i],
    keywords: ['philosophy of mind', 'dualism', 'physicalism', 'functionalism', 'qualia', 'hard problem of consciousness', 'chalmers', "mary's room", 'chinese room', 'searle', 'intentionality'],
    intent: 'factual_question',
    topic: 'philosophy',
    response: () => `The philosophy of mind asks what the mind is, how it relates to the brain and body, and how to make sense of conscious experience. The rise of neuroscience and artificial intelligence has made these questions urgent. The central tension is between two undeniable facts: the mind is somehow produced by the brain, and yet conscious experience seems unlike anything physical.

### Dualism and Physicalism
Substance dualism, descending from Descartes, holds that mind and body are fundamentally different kinds of stuff. The attraction is that it takes subjective experience seriously; the cost is the mind-body interaction problem and the difficulty of fitting mental substance into a physical worldview. Property dualism is a softer option: there is only one kind of substance (physical), but it has both physical and mental properties, and the mental properties cannot be reduced to the physical.

Physicalism, in its strongest form the identity theory, holds that mental states just are brain states — pain is identical to the firing of C-fibres, full stop. The challenge is multiple realisability: an octopus, a robot, and an alien might all feel pain without having C-fibres. If pain is identical to C-fibre firing, that seems to rule out non-human pain by definition, which is implausible.

### Functionalism
Functionalism, developed by Hilary Putnam and others, defines mental states by what they do rather than what they are made of. A belief, desire, or pain is a state that plays a certain causal role — produced by certain inputs, interacting with other mental states, and producing certain outputs. Anything that realises that functional organisation, whether neurons or silicon, has the mental state. Functionalism underwrites AI and handles multiple realisability elegantly. But critics ask whether function exhausts the nature of mind, or whether the felt quality of experience is left out.

### Qualia and the Hard Problem
Qualia are the subjective feels of experience: the redness of red, the painfulness of pain, the smell of coffee. David Chalmers (born 1966) framed the hard problem of consciousness: why is there subjective experience at all? Even if we fully explain the brain's mechanisms, the question of why these mechanisms are accompanied by experience remains. Chalmers argues that consciousness may be a fundamental feature of the universe.

### Mary's Room
Frank Jackson's thought experiment imagines Mary, a colour scientist who knows every physical fact about colour vision but has lived her entire life in a black-and-white room. When she finally leaves and sees red for the first time, does she learn something new? If yes — and most say yes — then physicalism is false, because there are facts about experience that physical facts do not capture.

### The Chinese Room
John Searle (1932 to 2025) targeted functionalism and strong AI. Imagine a person who does not speak Chinese locked in a room with a rulebook. Chinese characters come in through a slot; following the rules, she manipulates them and passes other characters out. To an outside observer the room seems to understand Chinese, but the person inside understands nothing. Searle argued that syntax is not semantics: a computer manipulates symbols by rules but understands nothing, however clever the output.

### Why It Matters
The philosophy of mind shapes how we think about artificial intelligence, mental health, end-of-life decisions, and personal identity. Whether a chatbot can think, whether a brain-damaged patient is still a person, whether pain medication should be withheld because "it is only physical" — all turn on positions in this field. The hard problem of consciousness remains unsolved and may demand a conceptual revolution as deep as any in the history of science.`,
  },
]
