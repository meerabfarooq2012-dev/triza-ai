/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — MATHEMATICS (Batch 14)
 * ============================================================
 *
 *  Foundational mathematics: numbers, arithmetic, algebra,
 *  geometry, calculus, statistics, probability, and logic.
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

export const MATH_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. NUMBERS AND NUMBER SYSTEMS
  // ----------------------------------------------------------------
  {
    id: 'math-numbers-systems',
    patterns: [/\b(number|numbers|number system|natural number|whole number|integer|integers|rational|irrational|real number|complex number|prime number|prime|adad|number kya hai)\b/i],
    keywords: ['number', 'integer', 'rational', 'irrational', 'prime', 'natural', 'whole', 'real', 'complex'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Numbers are the foundation of all mathematics. We start counting as children and never stop — but the number system we use is more layered than most people realize.

### The Number Families
We organize numbers in nested sets. Natural numbers are the counting numbers: 1, 2, 3, and so on. Add zero and we get whole numbers. Add the negatives (-1, -2, -3...) and we have the integers. Rational numbers are any number we can write as a fraction of two integers — so 3/4, -7, 0.25 are all rational. Irrational numbers cannot be written as fractions — pi and the square root of 2 are the famous examples; their decimals never repeat and never end.

Real numbers include everything rational and irrational together — every number that sits somewhere on the number line. Beyond the reals are complex numbers, which add an imaginary unit i where i squared equals -1. Complex numbers look like a + bi and they let us solve equations that real numbers alone cannot, like x squared plus one equals zero.

### Prime Numbers
A prime number is a natural number greater than 1 that has exactly two divisors: 1 and itself. The first primes are 2, 3, 5, 7, 11, 13, 17, and they go on forever — Euclid proved this around 300 BCE. Primes are the atoms of arithmetic because of the fundamental theorem of arithmetic: every integer greater than 1 is either prime itself or a unique product of primes. Modern encryption, including the security of internet banking, depends on the difficulty of factoring large numbers back into their primes.

### Why It Matters
Number theory was once called the purest branch of mathematics — study for its own sake, with no application. Today, primes protect every secure transaction online, irrational numbers describe circles and waves, and complex numbers power the equations of quantum mechanics and electrical engineering. The abstractions turned out to be the most practical things we ever invented.`,
  },

  // ----------------------------------------------------------------
  // 2. BASIC ARITHMETIC AND OPERATIONS
  // ----------------------------------------------------------------
  {
    id: 'math-arithmetic-operations',
    patterns: [/\b(arithmetic|addition|subtraction|multiplication|division|plus|minus|times|divide|operation|operations|bodmas|pemdas|order of operations|hisab|jod|ghatana|guna|bhag)\b/i],
    keywords: ['arithmetic', 'addition', 'subtraction', 'multiplication', 'division', 'bodmas', 'pemdas', 'operation'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Arithmetic is the oldest branch of mathematics — the four operations of addition, subtraction, multiplication, and division. Humanity has used them for at least 40,000 years, from tally sticks to modern spreadsheets.

### The Four Operations
Addition combines quantities — three plus four equals seven. Subtraction is its mirror, finding the difference between two quantities. Multiplication is repeated addition — four times three means four groups of three, giving twelve. Division splits a quantity into equal parts — twelve divided by three gives four, because four groups of three make twelve.

### Order of Operations
When an expression mixes operations, we need a rule for which to do first. The rule is remembered as BODMAS or PEMDAS: Brackets first, then Orders (powers and roots), then Division and Multiplication left to right, then Addition and Subtraction left to right. So three plus four times two is eleven, not fourteen, because the multiplication happens first. Brackets override everything — (three plus four) times two equals fourteen.

### Properties That Make Calculation Easier
Arithmetic follows clean rules that let us rearrange calculations. The commutative property says order does not matter for addition and multiplication — three plus four equals four plus three. The associative property says grouping does not matter — (two plus three) plus four equals two plus (three plus four). The distributive property links multiplication and addition — five times (three plus two) equals five times three plus five times two. These three properties are the scaffolding on which all of algebra is built.

### Why It Matters
Arithmetic is so basic that we forget it had to be invented. The place-value system, the concept of zero, the idea of negative numbers — each was a profound discovery. Today arithmetic runs quietly inside every calculator, every cash register, every computer, and every algorithm on Earth. Without it, nothing else in mathematics or technology could exist.`,
  },

  // ----------------------------------------------------------------
  // 3. FRACTIONS, DECIMALS, AND PERCENTAGES
  // ----------------------------------------------------------------
  {
    id: 'math-fractions-decimals',
    patterns: [/\b(fraction|fractions|decimal|decimals|percentage|percent|percentages|ratio|proportion|tasweer|hissa|daraj)\b/i],
    keywords: ['fraction', 'decimal', 'percentage', 'percent', 'ratio', 'proportion'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Fractions, decimals, and percentages are three different ways of writing the same idea — a part of a whole. Understanding that they are the same thing in different clothes is the key to using them confidently.

### Fractions
A fraction has two parts: the numerator on top and the denominator on the bottom. The denominator tells us how many equal parts the whole is split into, and the numerator tells us how many of those parts we have. So three-quarters means we split something into four equal parts and take three of them. Fractions are equivalent when they represent the same amount — one-half equals two-quarters equals four-eighths. We simplify fractions by dividing top and bottom by their greatest common divisor.

### Decimals
Decimals are fractions written in base 10, using a decimal point to separate whole numbers from fractional parts. The place values to the right of the point are tenths, hundredths, thousandths, and so on. So 0.75 means seven-tenths plus five-hundredths, which equals seventy-five hundredths, which is the same as three-quarters. Every fraction can be written as a decimal — either one that terminates (one-quarter is 0.25) or one that repeats (one-third is 0.3333...).

### Percentages
A percentage is simply a fraction out of one hundred. The word literally means "per hundred." So 25 percent means 25 out of every 100, which is the same as one-quarter or 0.25. Percentages are useful because they give us a common scale for comparison — a 15 percent tip, a 5 percent interest rate, a 20 percent discount all use the same yardstick. To convert between forms: a decimal becomes a percentage by multiplying by 100, and a percentage becomes a decimal by dividing by 100.

### Why It Matters
We use these three forms every single day, often without noticing. Cooking uses fractions (half a cup). Money uses decimals ($4.99). Sales, taxes, interest rates, and statistics use percentages. A person who can move fluently between the three forms has a practical superpower — they can compare a 25 percent discount to a one-third-off sale and instantly see which is better.`,
  },

  // ----------------------------------------------------------------
  // 4. ALGEBRA — THE LANGUAGE OF UNKNOWN
  // ----------------------------------------------------------------
  {
    id: 'math-algebra-basics',
    patterns: [/\b(algebra|variable|variables|equation|equations|solve for x|linear equation|quadratic|polynomial|expression|coefficient|tengi|almia|majhool)\b/i],
    keywords: ['algebra', 'variable', 'equation', 'linear', 'quadratic', 'polynomial', 'expression', 'coefficient'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Algebra is where mathematics stops being about specific numbers and starts being about relationships. The word itself comes from the Arabic "al-jabr," meaning the reunion of broken parts — a book by the 9th-century scholar Al-Khwarizmi gave the field its name and gave us the word "algorithm."

### The Core Idea: Variables
The breakthrough of algebra is the variable — a letter that stands for an unknown number. We usually use x, y, or n. Once we have variables, we can write general rules: instead of saying three plus four equals seven, we can say a plus b equals c, and that rule holds for every pair of numbers we choose. Variables let mathematics speak in generalities instead of specifics.

### Equations and Solving
An equation is a statement that two expressions are equal, like two times x plus three equals eleven. Solving means finding the value of x that makes the statement true. The rule is simple: whatever we do to one side, we must do to the other. Subtract three from both sides — two times x equals eight. Divide both sides by two — x equals four. That balance rule, kept since Al-Khwarizmi, is the entire heart of algebra.

### Types of Equations
Linear equations graph as straight lines — they have variables raised only to the first power, like y equals two x plus three. Quadratic equations have variables raised to the second power, like x squared minus five x plus six equals zero, and their graphs are parabolas. Polynomials can have many terms with different powers. Each type has its own solving techniques — quadratics yield to factoring, completing the square, or the quadratic formula.

### Why It Matters
Algebra is the bridge between arithmetic and every higher branch of mathematics. It is also the language of science and engineering — physics, chemistry, economics, computer science all express their laws as equations. When a satellite is launched, when a drug dose is calculated, when a financial model is built, algebra is doing the silent work underneath. Learning to read equations is learning to read the universe in its own language.`,
  },

  // ----------------------------------------------------------------
  // 5. GEOMETRY — SHAPE, SPACE, AND FORM
  // ----------------------------------------------------------------
  {
    id: 'math-geometry-basics',
    patterns: [/\b(geometry|shape|shapes|triangle|square|circle|rectangle|polygon|angle|angles|line|lines|parallel|perpendicular|hindasa|zavia|shakal)\b/i],
    keywords: ['geometry', 'triangle', 'square', 'circle', 'rectangle', 'polygon', 'angle', 'parallel', 'perpendicular'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Geometry is the mathematics of shape and space. The word means "earth measurement" in Greek — it began as a practical tool for measuring fields along the Nile after floods, and grew into one of the most beautiful branches of mathematics.

### The Building Blocks
Geometry starts with three undefined notions: points, lines, and planes. A point is a location with no size. A line is a straight path that extends forever in both directions. A plane is a flat surface that extends forever in all directions. From these, we build everything else — angles where lines meet, polygons where lines close into shapes, and solids when shapes extend into three dimensions.

### Angles
An angle measures the turn between two lines that meet. We measure angles in degrees, with a full turn being 360 degrees. A right angle is 90 degrees — the corner of a square. Angles less than 90 are acute, between 90 and 180 are obtuse, and exactly 180 form a straight line. The angles inside any triangle always add up to 180 degrees — a fact that holds whether the triangle is tiny or enormous.

### Common Shapes
Triangles are the simplest polygons, with three sides. Their classification by sides gives equilateral (all equal), isosceles (two equal), and scalene (no equal sides). By angles, triangles are acute (all angles less than 90), right (one 90-degree angle), or obtuse (one angle greater than 90). Quadrilaterals have four sides — squares, rectangles, parallelograms, trapezoids. A circle is the set of all points at a fixed distance (the radius) from a center point. The distance around a circle is its circumference, equal to two times pi times the radius.

### Why It Matters
Geometry is everywhere we look. Architecture, engineering, design, navigation, art, and nature all run on geometric principles. The Pythagorean theorem about right triangles lets us compute distances and powers GPS. The properties of circles describe orbits, wheels, and waves. The study of symmetry in shapes underlies crystallography, chemistry, and physics. Geometry is mathematics made visible — the only branch we can literally see.`,
  },

  // ----------------------------------------------------------------
  // 6. CALCULUS — THE MATHEMATICS OF CHANGE
  // ----------------------------------------------------------------
  {
    id: 'math-calculus-basics',
    patterns: [/\b(calculus|derivative|integral|differentiation|integration|limit|limits|rate of change|area under curve|jiskan|hisab e tagayur)\b/i],
    keywords: ['calculus', 'derivative', 'integral', 'differentiation', 'integration', 'limit', 'rate of change'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Calculus is the mathematics of change and accumulation. Where algebra handles static situations, calculus handles things that move, grow, shrink, or accumulate. It was developed independently by Isaac Newton in England and Gottfried Leibniz in Germany in the late 1600s, and their dispute over who got there first is one of the famous feuds of science.

### The Two Halves
Calculus has two complementary halves. Differential calculus studies rates of change — how fast something is changing at a particular instant. Integral calculus studies accumulation — the total amount of something that has built up, often visualized as the area under a curve. The deep miracle is that these two operations are inverses of each other — a result called the fundamental theorem of calculus.

### Derivatives
A derivative measures the slope of a curve at a single point. If a function describes where a car is at each moment, its derivative describes the car's speed at each moment — the rate of change of position. The derivative of speed is acceleration — the rate of change of speed. Derivatives let us answer questions like "at this exact instant, how fast is the population growing?" or "what is the marginal cost of producing one more unit?"

### Integrals
An integral adds up infinitely many infinitesimal pieces to get a total. If we know a car's speed at every moment, the integral of that speed gives us the total distance traveled. If we know the rate at which water flows into a tank, the integral tells us how much water is in the tank. Integrals compute areas, volumes, totals, and accumulations of all kinds.

### Why It Matters
Calculus is the language of physics, engineering, economics, biology, and data science. Newton's laws of motion are differential equations. The growth of populations, the spread of diseases, the decay of radioactive materials, the trajectory of rockets, the optimization of machine learning models — all are expressed and solved with calculus. Almost every quantitative science rests on this one branch of mathematics.`,
  },

  // ----------------------------------------------------------------
  // 7. STATISTICS AND DATA
  // ----------------------------------------------------------------
  {
    id: 'math-statistics-basics',
    patterns: [/\b(statistics|statistic|mean|median|mode|average|averages|range|variance|standard deviation|data|distribution|normal distribution|shumariyat|data ka tajzia)\b/i],
    keywords: ['statistics', 'mean', 'median', 'mode', 'average', 'range', 'variance', 'standard deviation', 'distribution'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Statistics is the science of learning from data. In a world drowning in numbers, statistics is the discipline that tells us which numbers matter, what they mean, and how much to trust them.

### Measures of Center
The first question we ask of a dataset is "what is typical here?" Three measures answer this. The mean is the arithmetic average — add all values, divide by the count. The median is the middle value when we sort the data — half the values are above it, half below. The mode is the most frequent value. For symmetric data these three are close together; for skewed data they can differ a lot. Income distributions, for example, are typically reported as median rather than mean because a few billionaires pull the mean far above what most people actually earn.

### Measures of Spread
Two datasets can have the same mean but tell completely different stories. Spread measures capture this. The range is the simplest — the difference between the highest and lowest values. The variance is the average squared distance of each point from the mean. The standard deviation is the square root of the variance, and it has the same units as the original data, which makes it more interpretable. A standard deviation of zero means every value is identical; a large standard deviation means the data is widely scattered.

### Distributions
A distribution describes how often each value occurs. The most famous is the normal distribution — the bell curve — where most values cluster around the mean and extreme values are rare. Heights, blood pressure, measurement errors, and many natural phenomena follow normal distributions. Knowing the shape of a distribution lets us make predictions: in a normal distribution, about 68 percent of values fall within one standard deviation of the mean, and about 95 percent fall within two.

### Why It Matters
Statistics is how we turn raw data into decisions. Medical trials, opinion polls, quality control, financial risk, machine learning, sports analytics, climate science — all rely on statistical reasoning. The famous saying is that there are three kinds of lies: lies, damned lies, and statistics. The deeper truth is that statistics done honestly is our best tool for seeing patterns hidden in noise, and statistics done dishonestly is our best tool for hiding them. Learning the difference is a civic skill.`,
  },

  // ----------------------------------------------------------------
  // 8. PROBABILITY — THE MATHEMATICS OF CHANCE
  // ----------------------------------------------------------------
  {
    id: 'math-probability-basics',
    patterns: [/\b(probability|chance|odds|likely|likelihood|random|randomness|coin flip|dice|bayes|conditional probability|ehtamal|qismat)\b/i],
    keywords: ['probability', 'chance', 'odds', 'random', 'dice', 'bayes', 'conditional'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Probability is the mathematics of uncertainty. It gives us a precise way to talk about chance — how likely an event is to occur, how to update our beliefs when new evidence arrives, and how to make good decisions when we cannot know the outcome for sure.

### The Basics
A probability is a number between 0 and 1 (or 0 percent to 100 percent). Zero means an event is impossible, one means it is certain, and everything in between measures the degree of belief or frequency. The probability of flipping heads on a fair coin is one-half. The probability of rolling a six on a fair die is one-sixth. Probabilities add when events are mutually exclusive — the probability of rolling either a five or a six is one-sixth plus one-sixth, or one-third.

### Independent and Dependent Events
Two events are independent if the outcome of one does not affect the other. Flipping two coins — the second flip does not care what the first showed. For independent events, we multiply probabilities: two heads in a row is one-half times one-half, or one-quarter. Events are dependent when one affects the other. Drawing two cards from a deck without replacing the first — the second draw depends on what we drew first. We adjust the second probability to reflect the new state of the deck.

### Conditional Probability and Bayes
Conditional probability is the probability of one event given that another has occurred. The notation P(A given B) reads as "the probability of A given B." Bayes' theorem is the rule for inverting this — it tells us how to update our belief in a hypothesis as new evidence arrives. If a medical test is 99 percent accurate and 1 percent of people have the disease, a positive test does not mean a 99 percent chance of having the disease — Bayes' theorem shows it is closer to 50 percent, because the false positives from the 99 healthy people nearly match the true positives from the 1 sick person. This counterintuitive result matters in medicine, law, and spam filtering.

### Why It Matters
Probability is the engine under insurance, weather forecasting, risk assessment, gambling, epidemiology, machine learning, and quantum mechanics. Whenever we make decisions under uncertainty — which is almost every decision we make — probability is the right tool. The 17th-century mathematician Blaise Pascal framed it as a way to reason about life itself: under uncertainty, we should weigh the expected value of each choice, not just the best or worst case.`,
  },

  // ----------------------------------------------------------------
  // 9. THE PYTHAGOREAN THEOREM
  // ----------------------------------------------------------------
  {
    id: 'math-pythagorean-theorem',
    patterns: [/\b(pythagoras|pythagorean|right triangle|hypotenuse|a squared|a square plus b square)\b/i],
    keywords: ['pythagoras', 'pythagorean', 'right triangle', 'hypotenuse'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `The Pythagorean theorem is one of the oldest and most useful facts in all of mathematics. In a right triangle — a triangle with one 90-degree angle — the square of the length of the longest side (the hypotenuse, the side opposite the right angle) equals the sum of the squares of the other two sides.

### The Statement
If the two shorter sides (called legs) have lengths a and b, and the hypotenuse has length c, then a squared plus b squared equals c squared. A triangle with legs 3 and 4 has a hypotenuse of 5, because 9 plus 16 equals 25. The triple (3, 4, 5) is the most famous Pythagorean triple — whole numbers that satisfy the equation. Others include (5, 12, 13) and (8, 15, 17).

### The History
The theorem is named after Pythagoras, the Greek philosopher who lived around 570 BCE, but the result was known long before him. The Babylonians had tables of Pythagorean triples 1,000 years before Pythagoras. The Indian Sulba Sutras from around 800 BCE state the theorem explicitly. The Chinese "Zhou Bi Suan Jing" gives a proof. What Pythagoras or his school contributed was likely the first formal proof within a deductive system — and there are now over 400 known proofs, including one by a young Albert Einstein and one by the American president James Garfield.

### The Converse
The converse is also true: if a triangle has sides a, b, c such that a squared plus b squared equals c squared, then it must be a right triangle. This converse is what builders and carpenters use to check that their corners are truly square — measure three units one way, four units the other way, and the diagonal should be exactly five units. If it is, the corner is a perfect right angle.

### Why It Matters
The theorem is the foundation of distance and measurement in two and three dimensions. The distance formula between two points in coordinate geometry is just the Pythagorean theorem in disguise. It underlies trigonometry, which underlies surveying, navigation, architecture, and astronomy. The theorem generalizes to higher dimensions — the diagonal of a rectangular box follows a three-dimensional version. In its most general form, it becomes the concept of a metric in geometry and physics, the foundation of how we measure distance in any space, including the curved spacetime of general relativity.`,
  },

  // ----------------------------------------------------------------
  // 10. TRIGONOMETRY — THE MATHEMATICS OF TRIANGLES AND WAVES
  // ----------------------------------------------------------------
  {
    id: 'math-trigonometry-basics',
    patterns: [/\b(trigonometry|sine|cosine|tangent|sin|cos|tan|radians|degrees|unit circle|trig|三角|zawiya)\b/i],
    keywords: ['trigonometry', 'sine', 'cosine', 'tangent', 'sin', 'cos', 'tan', 'radians', 'unit circle'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Trigonometry began as the mathematics of triangles, but it grew into the mathematics of waves, rotation, and periodic change. The word means "triangle measurement" in Greek, and it started as a tool for astronomy — predicting the positions of stars and planets.

### The Three Core Functions
In a right triangle, we pick one of the two non-right angles and call it theta. The three trigonometric functions are ratios of the sides. The sine of theta is the length of the side opposite the angle divided by the hypotenuse. The cosine of theta is the length of the adjacent side divided by the hypotenuse. The tangent of theta is the opposite side divided by the adjacent side — which also equals sine divided by cosine. These three functions, along with their reciprocals (cosecant, secant, cotangent), let us compute any side or angle of a right triangle from a few known pieces.

### The Unit Circle
The real power of trigonometry comes when we extend it beyond right triangles to any angle. We picture a circle of radius 1 centered at the origin, and an angle measured counterclockwise from the positive x-axis. The point where the angle's ray crosses the circle has coordinates (cosine of the angle, sine of the angle). This unit circle definition lets us compute sines and cosines of any angle, including angles greater than 90 degrees and negative angles. It also reveals the deep symmetry: cosine is an even function, sine is odd, and they oscillate between -1 and 1 forever.

### Waves and Periodicity
Here is where trigonometry becomes the language of waves. The graphs of sine and cosine are smooth, repeating waves. The sine curve starts at zero, rises to 1 at 90 degrees, returns to zero at 180, falls to -1 at 270, and returns to zero at 360 — then repeats. This periodicity — the wave repeats every full turn — is what makes trigonometric functions perfect for describing anything that cycles: sound, light, tides, seasons, heartbeats, alternating current, planetary orbits. Fourier analysis shows that essentially any repeating pattern can be broken into a sum of sine and cosine waves of different frequencies. This single insight underlies audio compression, image compression, signal processing, and quantum mechanics.

### Why It Matters
Trigonometry is everywhere there is rotation or oscillation. Engineers use it to analyze alternating current and mechanical vibrations. Surveyors use it to measure distances indirectly — they can compute the width of a river by measuring angles from one bank. GPS computes positions using trigonometry on signals from satellites. Computer graphics rotates and animates 3D objects with trigonometric matrices. Music synthesis, medical imaging, and wireless communication all run on the mathematics of sine waves. The triangle of ancient astronomers turned out to be the shape of every wave in the universe.`,
  },

  // ----------------------------------------------------------------
  // 11. SET THEORY AND LOGIC
  // ----------------------------------------------------------------
  {
    id: 'math-set-theory-logic',
    patterns: [/\b(set theory|set|sets|subset|union|intersection|venn|logic|boolean|proposition|predicate|and or not|conjunction|disjunction|negation|mantik)\b/i],
    keywords: ['set', 'set theory', 'subset', 'union', 'intersection', 'venn', 'logic', 'boolean', 'proposition'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Set theory and logic are the foundations on which all modern mathematics is built. Set theory gives us a single language for talking about collections of objects, and logic gives us the rules for reasoning rigorously about anything at all.

### Sets
A set is a collection of distinct objects, called elements or members. We can describe a set by listing its elements in braces: the set of vowels is {a, e, i, o, u}. Or we can describe it by a rule: the set of even numbers is {x such that x is an integer and x is divisible by 2}. Two sets are equal if they have exactly the same elements, regardless of order or repetition. A subset is a set whose every element is also in another set — the set {a, e} is a subset of the vowels.

### Set Operations
Sets combine through operations. The union of two sets is everything in either — {a, e} union {i, o} equals {a, e, i, o}. The intersection is what they share — {a, e, i} intersection {e, i, o} equals {e, i}. The complement of a set is everything not in it, relative to some larger universal set. These operations follow rules that mirror the rules of logic — union corresponds to "or," intersection to "and," complement to "not." Venn diagrams picture these relationships as overlapping circles.

### Logic
Logic studies valid reasoning. A proposition is a statement that is either true or false. "Two is even" is a true proposition. "The moon is made of cheese" is a false one. Compound propositions are built with connectives: "and" (conjunction), "or" (disjunction), "not" (negation), "if-then" (implication), "if and only if" (biconditional). The truth of a compound proposition depends on the truth of its parts through precise rules. Boolean algebra — the algebra of true and false — is the logic of computer circuits and search queries. Every processor on Earth is, at the transistor level, a vast physical implementation of Boolean logic.

### Why It Matters
Set theory became the foundation of mathematics in the early 20th century, when mathematicians realized that every mathematical object — numbers, functions, spaces — could be defined as a particular kind of set. Logic became the foundation of computer science, where programs are formal arguments and algorithms are constructive proofs. The search engine you use runs on Boolean queries. The database you query runs on set operations. The proof assistant that verifies mathematical theorems runs on formal logic. The whole digital world is set theory and logic made physical.`,
  },

  // ----------------------------------------------------------------
  // 12. FAMOUS MATHEMATICAL CONSTANTS
  // ----------------------------------------------------------------
  {
    id: 'math-famous-constants',
    patterns: [/\b(pi|π|euler|e number|golden ratio|phi|tau|imaginary unit|3\\.14|2\\.71|1\\.61|constants in math)\b/i],
    keywords: ['pi', 'euler', 'e number', 'golden ratio', 'phi', 'tau', 'imaginary unit', 'constant'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Certain numbers appear so often, in so many unrelated places, that mathematics calls them constants. They are not invented — they are discovered, waiting in the structure of reality for us to find them. Three of them matter most.

### Pi (π)
Pi is the ratio of a circle's circumference to its diameter. No matter how large or small the circle, this ratio is always the same — approximately 3.14159. Pi is irrational, meaning its decimal expansion never ends and never repeats. It is also transcendental, meaning it is not the solution to any polynomial equation with integer coefficients. Pi appears in formulas across mathematics and physics, often where no circle is visible — in the wave equation, in probability, in the infinite series for the natural numbers. The mathematician Leonhard Euler popularized the symbol pi (from the Greek word for perimeter) in the 1700s.

### Euler's Number (e)
The number e, approximately 2.71828, is the base of the natural logarithm. It arises naturally from the mathematics of growth. If you have one dollar in a bank account that pays 100 percent interest per year, and the interest is compounded more and more frequently, the amount after one year approaches e dollars. The function e to the power of x is its own derivative — the only function (up to scaling) whose rate of change equals its current value. This property makes e the natural base for calculus, and it appears everywhere growth or decay is happening continuously — populations, radioactive decay, temperature change, charging and discharging circuits.

### The Golden Ratio (φ)
The golden ratio, approximately 1.618, is the number phi. It arises when a line is divided so that the whole is to the longer part as the longer part is to the shorter part. This ratio appears in the geometry of the regular pentagon, in the spiral of a nautilus shell, in the arrangement of sunflower seeds and pineapple skin, in the proportions of the Parthenon and the paintings of Leonardo da Vinci. The Fibonacci sequence — 1, 1, 2, 3, 5, 8, 13, 21 — approaches the golden ratio as the numbers get larger. Whether the golden ratio is truly aesthetically special or whether we read significance into coincidences is debated, but its mathematical ubiquity is unmistakable.

### Why It Matters
Constants are the fixed points of mathematics — the numbers that show up again and again because they are baked into the structure of number, space, and change. Pi connects geometry to waves. E connects algebra to growth. Phi connects arithmetic to nature. The imaginary unit i (where i squared equals -1) connects algebra to geometry through the stunning identity e to the i pi plus 1 equals 0 — Euler's identity — which links all five most important constants in a single line. The mathematician Carl Friedrich Gauss called these the "magical" numbers, and the magic has not faded.`,
  },
]
