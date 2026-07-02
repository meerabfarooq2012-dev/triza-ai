/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — MATHEMATICS DEEP (Batch 6-e)
 * ============================================================
 *
 *  Deeper subtopic entries for mathematics. These go one level
 *  below the foundational batch-math.ts entries: systems of
 *  equations, quadratics, polynomials, coordinate geometry,
 *  linear algebra, limits, derivatives, integrals, probability
 *  distributions, and statistical inference.
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

export const MATH_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. LINEAR EQUATIONS AND SYSTEMS
  // ----------------------------------------------------------------
  {
    id: 'math-deep-linear-systems',
    patterns: [/\b(linear equation|linear system|system of equations|simultaneous equation|substitution method|elimination method|inconsistent system|consistent system|no solution|infinitely many solutions|solve the system|do linear equation|kram rule|cramer rule)\b/i],
    keywords: ['linear equation', 'linear system', 'system of equations', 'simultaneous', 'substitution', 'elimination', 'inconsistent', 'consistent', 'cramer'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `A linear equation is an equation in which every variable is raised only to the first power and no two variables are multiplied together. The graph of a linear equation in two variables is always a straight line, and finding where two such lines meet is the art of solving systems of equations.

### One-Variable Linear Equations
A linear equation in one variable looks like three x minus five equals ten. The goal is to isolate x using inverse operations: add five to both sides (three x equals fifteen), then divide by three (x equals five). The balance rule from algebra — whatever we do to one side we do to the other — is the only principle we need. Every one-variable linear equation has exactly one solution, which makes it the simplest kind to solve.

### Two-Variable Systems
When we move to two variables, a single equation like two x plus y equals seven is no longer enough — it describes an entire line of solutions. To pin down a unique answer, we need a second equation. A system of two linear equations in two unknowns has three possible outcomes: exactly one solution (the lines intersect at a single point), no solution (the lines are parallel and never meet — the system is inconsistent), or infinitely many solutions (the two equations describe the same line — the system is dependent).

### Solving Methods
Three classic techniques solve two-equation systems. Substitution solves one equation for one variable and plugs the result into the other — clean when one variable already has a coefficient of one. Elimination adds or subtracts multiples of the equations to cancel a variable — fast when coefficients line up. Graphing plots both lines and reads off the intersection — visually intuitive but limited by precision. For larger systems, Cramer's rule uses determinants, and Gaussian elimination scales to any number of equations and unknowns.

### Inconsistent and Dependent Systems
When elimination produces a statement like zero equals five, we know the system is inconsistent — there is no point that satisfies both equations, because the lines are parallel. When elimination produces zero equals zero, the second equation is just a disguised copy of the first — every point on the line is a solution, so there are infinitely many. Recognising these cases from the algebra (without graphing) is a key skill.

### Why It Matters
Systems of linear equations are the workhorse of applied mathematics. They model supply and demand in economics, currents in electrical circuits, force balance in structural engineering, and chemical reaction stoichiometry. Every linear programming problem in operations research, every input-output model in economics, and most machine learning training algorithms ultimately reduce to solving large systems of linear equations. Mastering the small two-by-two case is the doorway to all of it.`,
  },

  // ----------------------------------------------------------------
  // 2. QUADRATIC EQUATIONS
  // ----------------------------------------------------------------
  {
    id: 'math-deep-quadratic-equations',
    patterns: [/\b(quadratic equation|quadratic formula|discriminant|completing the square|vertex form|factoring trinomials|quadratic|parabola vertex|axis of symmetry|roots of quadratic)\b/i],
    keywords: ['quadratic equation', 'quadratic formula', 'discriminant', 'completing the square', 'vertex form', 'parabola', 'axis of symmetry', 'roots'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `A quadratic equation is any equation that can be written in the standard form a x squared plus b x plus c equals zero, where a is not zero. Its graph is a parabola — a smooth U-shaped curve that opens upward when a is positive and downward when a is negative. Quadratics model projectile motion, area optimisation, and countless natural curves, so solving them efficiently is a core algebraic skill.

### The Four Solving Techniques
The simplest method is factoring: if the quadratic splits into two binomials, then by the zero-product property each binomial gives a root. For x squared minus five x plus six, we factor as (x minus two)(x minus three), so x equals two or x equals three. When factoring is messy or impossible, completing the square rewrites the equation as a perfect square plus a constant. The quadratic formula — x equals negative b plus or minus the square root of (b squared minus four a c), all divided by two a — is the universal method that always works. Graphing gives a visual estimate of the roots where the parabola crosses the x-axis.

### The Discriminant
The expression under the square root, b squared minus four a c, is called the discriminant, and it tells us the nature of the roots without solving. If the discriminant is positive, there are two distinct real roots and the parabola crosses the x-axis twice. If it is zero, there is exactly one real root (a repeated root) and the parabola just touches the x-axis at its vertex. If it is negative, there are no real roots — only two complex conjugate roots — and the parabola floats entirely above or below the x-axis.

### Vertex Form and the Axis of Symmetry
Completing the square also converts a quadratic from standard form into vertex form: y equals a times (x minus h) squared plus k, where (h, k) is the vertex. The vertex is the highest or lowest point of the parabola, and the vertical line x equals h is the axis of symmetry that splits the parabola into mirror halves. The h value equals negative b divided by two a, and plugging that back in gives k. Vertex form is invaluable for optimisation problems — finding maximum profit, minimum cost, or the peak of a projectile's arc.

### Why It Matters
Quadratics describe anything that accelerates uniformly — falling objects, thrown balls, braking cars, satellite sub-orbital hops. The trajectory of every basketball shot is a parabola. In engineering, the cable of a suspension bridge hangs in a parabolic curve. In business, revenue and profit functions are often quadratic, and finding the vertex finds the optimal price. The technique of completing the square even generalises to higher mathematics — it is how we derive the quadratic formula, and the same idea reappears in calculus and linear algebra as the method of completing squares to analyse forms.`,
  },

  // ----------------------------------------------------------------
  // 3. POLYNOMIALS IN DEPTH
  // ----------------------------------------------------------------
  {
    id: 'math-deep-polynomials',
    patterns: [/\b(polynomial|polynomials|degree of polynomial|factor theorem|remainder theorem|synthetic division|roots of polynomial|leading coefficient|monic|binomial theorem|factorising polynomials)\b/i],
    keywords: ['polynomial', 'degree', 'factor theorem', 'remainder theorem', 'synthetic division', 'roots', 'leading coefficient', 'monic', 'binomial theorem'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `A polynomial is an expression built by adding and multiplying constants and variables raised to non-negative integer powers. Three x to the fourth minus five x squared plus x minus seven is a polynomial of degree four. Polynomials are the bread and butter of algebra: they generalise linear and quadratic equations, model curves of any shape, and underpin calculus, computer graphics, and numerical analysis.

### Degree and Operations
The degree of a polynomial is the highest power of the variable. Linear polynomials have degree one, quadratics degree two, cubics degree three, quartics degree four, and so on. The leading coefficient is the coefficient of that highest term. Polynomials add by combining like terms and multiply by distributing — when we multiply two polynomials of degree m and n, the result has degree m plus n. A degree-n polynomial can have at most n roots (counting multiplicity), a result known as the fundamental theorem of algebra.

### Factoring Techniques
Factoring rewrites a polynomial as a product of simpler ones. Common techniques include pulling out the greatest common factor, recognising special patterns like the difference of squares (a squared minus b squared equals (a plus b)(a minus b)), perfect square trinomials, grouping for four-term polynomials, and trial-and-error factoring of quadratics. For higher-degree polynomials, the rational root theorem narrows down candidates: any rational root p over q must have p dividing the constant term and q dividing the leading coefficient.

### Remainder and Factor Theorems
The remainder theorem says that when we divide a polynomial P(x) by (x minus c), the remainder equals P evaluated at c. The factor theorem is the special case: if P(c) equals zero, then (x minus c) is a factor of P. These theorems give us a quick test — plug in a candidate value, and if the result is zero, we have found a factor. Synthetic division then lets us divide out that factor efficiently, reducing a cubic to a quadratic that we can solve with the standard methods.

### Roots and the Binomial Theorem
The roots of a polynomial are the values of x that make it zero. Complex roots of polynomials with real coefficients always come in conjugate pairs, so a cubic with real coefficients has either three real roots or one real root and a complex conjugate pair. The binomial theorem tells us how to expand (a plus b) to the nth power using binomial coefficients — the entries of Pascal's triangle — and gives us combinations and probability theory as a bonus.

### Why It Matters
Polynomials approximate almost any function through Taylor series, which means they are the universal language of numerical computation. Polynomial regression fits curves to data in statistics. Computer-aided design represents curves and surfaces with polynomial splines. Error-correcting codes built on polynomial arithmetic power every QR code and CD. Cryptography relies on polynomial rings. Whenever a computer needs to model a smooth curve or solve an equation, polynomials are almost certainly doing the work underneath.`,
  },

  // ----------------------------------------------------------------
  // 4. COORDINATE GEOMETRY AND CONIC SECTIONS
  // ----------------------------------------------------------------
  {
    id: 'math-deep-coordinate-geometry',
    patterns: [/\b(coordinate geometry|cartesian plane|slope formula|midpoint formula|distance formula|point-slope|slope-intercept|conic section|conic sections|ellipse|hyperbola|equation of a line|two point form)\b/i],
    keywords: ['coordinate geometry', 'cartesian plane', 'slope', 'midpoint', 'distance formula', 'point-slope', 'slope-intercept', 'conic section', 'ellipse', 'hyperbola'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Coordinate geometry — also called analytic geometry — marries algebra to geometry by placing shapes on a coordinate plane. René Descartes introduced the idea in 1637, and it changed mathematics forever: every geometric figure could now be described by an equation, and every equation could be pictured as a figure. The two-way translation between algebra and pictures is the foundation of graphing, calculus, computer graphics, and physics.

### The Cartesian Plane
The Cartesian plane has two perpendicular axes: the x-axis running horizontally and the y-axis running vertically. Every point is identified by an ordered pair (x, y). The axes divide the plane into four quadrants. The distance between two points (x1, y1) and (x2, y2) is the square root of (x2 minus x1) squared plus (y2 minus y1) squared — the Pythagorean theorem in coordinate form. The midpoint is simply the average of the coordinates: ((x1 plus x2)/2, (y1 plus y2)/2).

### Equations of Lines
A line is fully determined by its slope and a point on it. The slope m is the rise over run: (y2 minus y1) divided by (x2 minus x1). Slope tells us the steepness and direction — positive slopes climb, negative slopes fall, zero slopes are horizontal, and vertical lines have undefined slope. The slope-intercept form y equals m x plus b captures the slope m and the y-intercept b in one tidy equation. The point-slope form y minus y1 equals m times (x minus x1) is most useful when we know a point and the slope. Two lines are parallel if their slopes are equal, and perpendicular if their slopes multiply to negative one.

### Conic Sections
When a plane cuts through a double cone, the intersection is one of four curves — the conic sections. A circle is the curve when the plane is horizontal: x squared plus y squared equals r squared. An ellipse appears when the plane is tilted but cuts through one nap of the cone: x squared over a squared plus y squared over b squared equals one — planets orbit the Sun in ellipses. A parabola forms when the plane is parallel to the side of the cone: y equals a x squared (the trajectory of a projectile). A hyperbola forms when the plane cuts through both nappes: x squared over a squared minus y squared over b squared equals one — the shape used in LORAN navigation and certain telescope mirrors.

### Why It Matters
Coordinate geometry is the bridge that lets every equation have a picture and every picture have an equation. Computer graphics renders 3D scenes by transforming coordinates with matrices. GPS computes positions by triangulating distances between satellites and receivers — pure coordinate geometry. Architecture and engineering design curves with conic sections because they have clean algebraic equations and predictable geometric properties. Machine learning algorithms operate on points in high-dimensional coordinate spaces. Descartes's simple idea — numbering the points on a plane — turned out to be the geometric language in which modern science is written.`,
  },

  // ----------------------------------------------------------------
  // 5. VECTORS AND MATRICES (LINEAR ALGEBRA)
  // ----------------------------------------------------------------
  {
    id: 'math-deep-vectors-matrices',
    patterns: [/\b(vector|vectors|dot product|cross product|scalar|matrix|matrices|determinant|inverse matrix|identity matrix|linear transformation|eigenvector|eigenvalue|linear algebra)\b/i],
    keywords: ['vector', 'dot product', 'cross product', 'matrix', 'matrices', 'determinant', 'inverse matrix', 'identity matrix', 'linear transformation', 'eigenvector', 'eigenvalue', 'linear algebra'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Linear algebra is the mathematics of vectors and matrices — quantities that have direction as well as magnitude, and arrays of numbers that can be manipulated wholesale. Where ordinary algebra handles one number at a time, linear algebra handles whole tables of numbers simultaneously, which is exactly what computers are good at. It is the single most useful branch of mathematics for the digital age.

### Vectors
A vector is a quantity with both magnitude and direction — like velocity (fifty kilometres per hour northeast) or force (ten newtons straight down). We represent a vector in two or three dimensions as a column of components, such as (3, 4). The magnitude is the length, found by the Pythagorean theorem — five for (3, 4). Vectors add component by component, and we can scale them by multiplying every component by a number (a scalar).

### Dot Product and Cross Product
The dot product of two vectors is the sum of the products of their components: (a1, a2) dot (b1, b2) equals a1 b1 plus a2 b2. Geometrically, it equals the product of their magnitudes times the cosine of the angle between them — so a dot product of zero means the vectors are perpendicular. The dot product measures how much two vectors point in the same direction and is used to compute work, projections, and angles. The cross product exists only in three dimensions; it produces a new vector perpendicular to both inputs, with magnitude equal to the area of the parallelogram they span. The cross product powers torque, magnetic force, and surface-normal calculations.

### Matrices
A matrix is a rectangular array of numbers arranged in rows and columns. Matrices add when they have the same shape, and they multiply when the inner dimensions match — the product of an m-by-n matrix and an n-by-p matrix is an m-by-p matrix. Matrix multiplication is not commutative: A times B is generally not the same as B times A. The identity matrix has ones on the diagonal and zeros elsewhere, and multiplying by it leaves a matrix unchanged — it is the matrix analogue of the number one.

### Determinants, Inverses, and Transformations
The determinant of a square matrix is a single number that tells us how the matrix scales areas (in 2D) or volumes (in 3D). A determinant of zero means the matrix squashes space flat and has no inverse — it is singular. A non-zero determinant means the matrix has an inverse that undoes its effect. A linear transformation is a function that maps vectors to vectors while preserving linear combinations, and every such transformation corresponds to multiplication by a matrix. Eigenvectors are the special directions that the transformation only stretches or shrinks without rotating, and the eigenvalues tell us by how much.

### Why It Matters
Linear algebra is the language of almost every quantitative discipline. Computer graphics rotates and projects 3D scenes with matrix multiplication. Quantum mechanics represents states as vectors in Hilbert space and observables as matrices. Machine learning trains neural networks by computing with enormous matrices of weights. Google's PageRank, image compression via singular value decomposition, and the solution of differential equations all rely on eigenvalues and eigenvectors. The reason linear algebra is everywhere is that computers can do it blindingly fast — matrix multiplication parallelises beautifully on GPUs — so any problem that can be linearised can be solved at scale.`,
  },

  // ----------------------------------------------------------------
  // 6. LIMITS AND CONTINUITY
  // ----------------------------------------------------------------
  {
    id: 'math-deep-limits-continuity',
    patterns: [/\b(limit|limits|one-sided limit|continuity|continuous function|indeterminate form|l'hopital|l'hopital's rule|squeeze theorem|sandwich theorem|epsilon delta|left hand limit|right hand limit)\b/i],
    keywords: ['limit', 'one-sided limit', 'continuity', 'continuous', 'indeterminate form', "l'hopital", 'squeeze theorem', 'sandwich theorem', 'epsilon delta'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `The limit is the precise mathematical tool that lets us talk about what a function is approaching, even when it never actually arrives. Limits are the foundation of calculus — derivatives and integrals are both defined as limits — and they let us handle infinity, instantaneous change, and points where formulas break down. Augustin-Louis Cauchy and Karl Weierstrass built the rigorous theory in the 1800s, giving calculus the unshakable logical base it had been missing for two centuries.

### The Concept of a Limit
We say the limit of f(x) as x approaches c equals L if we can make f(x) as close as desired to L by choosing x sufficiently close to c (but not equal to c). Crucially, the function does not need to be defined at c — only near it. The limit cares about the approach, not the destination. So a function with a hole at x equals two can still have a perfectly good limit there, equal to the value the function would have if the hole were filled in.

### One-Sided Limits and the Squeeze Theorem
The left-hand limit is what f approaches as x moves toward c from below; the right-hand limit is what f approaches as x moves toward c from above. The two-sided limit exists only when the one-sided limits agree. If they disagree, the function has a jump — common with piecewise functions and step functions. The squeeze (or sandwich) theorem is a clever tool: if we can trap a function between two others that both approach the same limit L, then the trapped function must also approach L. This is how we prove that the limit of sine of x over x equals one as x approaches zero, a result used throughout calculus.

### Limit Laws and Indeterminate Forms
Limit laws let us break complicated limits into simpler pieces: the limit of a sum is the sum of the limits (when both exist), the limit of a product is the product of the limits, and so on. But some limits produce indeterminate forms like zero over zero, infinity over infinity, or zero times infinity — expressions that look like they have no answer but actually have a definite value once we analyse them more carefully. Algebraic tricks like factoring, rationalising, or simplifying often resolve them.

### Continuity
A function is continuous at a point if its value equals its limit there — no jumps, no holes, no asymptotes. A function continuous on an interval can be drawn without lifting the pen. Continuity is essential for many theorems: the intermediate value theorem guarantees that a continuous function on a closed interval takes every value between its endpoints, and the extreme value theorem guarantees it reaches a maximum and minimum. These two results justify why we can find roots by bisection and why optimisation problems have answers.

### L'Hopital's Rule
When a limit produces zero over zero or infinity over infinity, L'Hopital's rule says we can take the derivative of numerator and denominator separately and try again. Often one application resolves the indeterminate form; sometimes two or three are needed. Published by Guillaume de l'Hopital in 1696 (but actually discovered by Johann Bernoulli), the rule is one of the most useful computational tools in calculus.

### Why It Matters
Without limits, calculus would collapse. The derivative is the limit of the average rate of change as the interval shrinks to zero. The integral is the limit of Riemann sums as the partition gets finer. The number e is defined as a limit. Infinite series converge or diverge based on limits. Beyond calculus, limits underpin the rigorous definition of real numbers, the analysis of algorithms in computer science, and the study of dynamical systems in physics. The limit is the bridge between the discrete world of algebra and the continuous world of nature.`,
  },

  // ----------------------------------------------------------------
  // 7. DERIVATIVES IN DEPTH
  // ----------------------------------------------------------------
  {
    id: 'math-deep-derivatives',
    patterns: [/\b(derivative|differentiation|power rule|product rule|quotient rule|chain rule|implicit differentiation|second derivative|optimization|related rates|critical point|concavity|inflection point|tangent line)\b/i],
    keywords: ['derivative', 'differentiation', 'power rule', 'product rule', 'quotient rule', 'chain rule', 'implicit differentiation', 'second derivative', 'optimization', 'related rates', 'critical point', 'inflection'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `The derivative is the instantaneous rate of change of a function — the slope of the tangent line at a single point. If a function describes position over time, its derivative is velocity; the derivative of velocity is acceleration. Anywhere something is changing smoothly, the derivative is the precise mathematical tool that tells us how fast, in which direction, and at what instant.

### The Definition and Power Rule
Formally, the derivative of f at x is the limit as h approaches zero of (f of (x plus h) minus f of x) divided by h. This difference quotient captures the average rate of change over a tiny interval, and the limit shrinks that interval to a single instant. In practice we rarely use the definition — we use rules derived from it. The power rule says the derivative of x to the n is n times x to the (n minus one). So the derivative of x cubed is three x squared, and the derivative of x to the fifth is five x to the fourth. Constants drop out (the derivative of five is zero), and the derivative of a constant times a function is the constant times the derivative.

### Product, Quotient, and Chain Rules
The product rule handles the derivative of a product: the derivative of f times g is f prime times g plus f times g prime — first times derivative of second, plus second times derivative of first. The quotient rule handles division: the derivative of f over g is (f prime times g minus f times g prime) over g squared. The chain rule is the most powerful of the three — it differentiates compositions. The derivative of f of g of x is f prime of g of x times g prime of x. The chain rule is what lets us differentiate nested functions, trigonometric compositions, exponentials, and logarithms. Mastering the chain rule is the single most important skill in first-year calculus.

### Implicit Differentiation and Higher Derivatives
When y is defined implicitly by an equation like x squared plus y squared equals one (a circle), we can still find dy/dx by differentiating both sides with respect to x and treating y as a function of x. The result, negative x over y, gives the slope at any point on the circle. The second derivative — the derivative of the derivative — tells us about concavity: positive second derivative means concave up (a smile shape), negative means concave down (a frown), and zero signals a possible inflection point where the concavity flips.

### Applications: Optimisation and Related Rates
Optimisation uses the first derivative to find critical points where the function might have a maximum or minimum. We set the derivative equal to zero, solve, then test each critical point. The closed-interval method also checks the endpoints. Related rates problems link two changing quantities — say, the radius of an inflating balloon and its volume — and use the chain rule to find how fast one changes given how fast the other does. These problems model real situations: a ladder sliding down a wall, water filling a conical tank, a shadow lengthening as someone walks away from a light.

### Why It Matters
Derivatives are the engine of optimisation. Machine learning trains neural networks by computing derivatives of a loss function and walking downhill — a process called gradient descent. Engineers use derivatives to find maximum stress in a beam and minimum material in a design. Economists use them to define marginal cost and marginal revenue. Physicists use them in every differential equation that models the natural world. The derivative is the precise answer to the question "how is this changing, right now, at this exact point?" — and that question appears in every quantitative discipline we have.`,
  },

  // ----------------------------------------------------------------
  // 8. INTEGRATION IN DEPTH
  // ----------------------------------------------------------------
  {
    id: 'math-deep-integration',
    patterns: [/\b(integral|integration|antiderivative|fundamental theorem of calculus|integration by parts|u-substitution|definite integral|indefinite integral|area under curve|riemann sum|trapezoidal rule|volume of revolution)\b/i],
    keywords: ['integral', 'integration', 'antiderivative', 'fundamental theorem of calculus', 'integration by parts', 'u-substitution', 'definite integral', 'indefinite integral', 'area under curve', 'riemann sum'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Integration is the second great operation of calculus, and it does the opposite of differentiation. Where a derivative breaks a function apart to find its instantaneous rate of change, an integral assembles infinitely many tiny pieces to find a total. The integral is the tool for areas, volumes, totals, accumulations, averages, and probabilities — anywhere we need to add up an uncountable number of infinitesimal contributions.

### Indefinite and Definite Integrals
An indefinite integral is the reverse of differentiation: it asks "what function, when differentiated, gives this one?" The result is the antiderivative, written with a plus C because differentiation kills constants and we cannot recover them. The integral of two x is x squared plus C. A definite integral, by contrast, has bounds — the integral of f from a to b — and it produces a number, not a function. That number is the (signed) area between the curve and the x-axis from a to b.

### The Fundamental Theorem of Calculus
The fundamental theorem of calculus ties differentiation and integration together as inverse operations. It has two parts. The first part says that if F is the antiderivative of f, then the definite integral of f from a to b equals F of b minus F of a — we can compute an area by evaluating an antiderivative at the endpoints. The second part says that if we define a new function as the integral of f from a fixed lower bound to a variable upper bound x, then differentiating that function gives back f. The theorem is one of the most beautiful and useful results in all of mathematics, and Newton and Leibniz discovered it independently in the 1660s and 1670s.

### Techniques: Substitution and Integration by Parts
U-substitution is the reverse of the chain rule. We pick a part of the integrand, call it u, and rewrite the integral in terms of u — often the new form is simpler. The key is choosing u well, which comes with practice. Integration by parts is the reverse of the product rule and is captured by the formula: the integral of u dv equals u times v minus the integral of v du. It is useful for products of unlike functions — polynomials times exponentials, polynomials times logarithms, exponentials times trigonometric functions. For more stubborn integrals we use partial fractions, trigonometric substitution, or numerical methods when no closed form exists.

### Applications
The integral computes the area under a curve directly, but its applications go far beyond geometry. The volume of a solid of revolution — formed by rotating a curve around an axis — is found by the disk or shell method, both integrals. The average value of a function over an interval is its integral divided by the length of the interval. In physics, work is the integral of force over distance, distance is the integral of velocity over time, and the centre of mass is an integral of position weighted by density. In probability, the probability that a continuous random variable falls in a range is the integral of its density function over that range.

### Why It Matters
Every continuous accumulation in nature is an integral. The water in a reservoir is the integral of the inflow rate. The total charge delivered by a circuit is the integral of the current. The distance travelled by a spacecraft is the integral of its velocity. Medical imaging reconstructs body slices from integral measurements (CT scans literally compute integrals of X-ray attenuation). Financial mathematics prices options using integrals of probability densities. Whenever something builds up smoothly over time, space, or probability, the integral is the right tool to total it up.`,
  },

  // ----------------------------------------------------------------
  // 9. PROBABILITY DISTRIBUTIONS
  // ----------------------------------------------------------------
  {
    id: 'math-deep-probability-distributions',
    patterns: [/\b(probability distribution|binomial distribution|poisson distribution|geometric distribution|normal distribution|bell curve|uniform distribution|exponential distribution|random variable|expected value|probability mass function|probability density function)\b/i],
    keywords: ['probability distribution', 'binomial', 'poisson', 'geometric distribution', 'normal distribution', 'bell curve', 'uniform distribution', 'exponential distribution', 'random variable', 'expected value'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `A probability distribution is a complete description of how the possible values of a random variable are spread out — which outcomes are likely, which are rare, and how the probabilities add up to one. Distributions are the workhorses of statistics and data science: choose the right distribution and we can model coin flips, queues, lifetimes, measurement errors, and a great deal more.

### Discrete Distributions
A discrete random variable takes countable values, often integers. The simplest is the Bernoulli distribution — a single yes/no trial with success probability p. The binomial distribution generalises this to n independent trials: it counts how many successes occur. Its mean is n p and its variance is n p times (one minus p). The binomial describes coin flips, defective items in a batch, and surveyed voters in a poll. The geometric distribution counts how many trials until the first success — useful in reliability and queueing. The Poisson distribution models the number of events in a fixed interval when events occur independently at a constant average rate (lambda): it describes arrivals at a call centre, mutations in a DNA strand, and radioactive decays per second.

### Continuous Distributions
A continuous random variable can take any value in a range. The uniform distribution spreads probability evenly across an interval — every value is equally likely, and the density is a flat rectangle. The normal distribution — the famous bell curve — is the most important distribution in all of statistics. Its density is a smooth symmetric curve centred at the mean mu with spread controlled by the standard deviation sigma. About 68 percent of values fall within one sigma of the mean, 95 percent within two, and 99.7 percent within three. The exponential distribution models the waiting time between independent events — the lifetime of a lightbulb, the gap between arrivals at a queue, the time until a radioactive atom decays.

### Mean, Variance, and Standard Deviation
Every distribution has a mean (also called the expected value) — the long-run average of many observations. It is computed as the sum (or integral) of each value times its probability. The variance measures spread — the average squared distance of values from the mean. The standard deviation is the square root of the variance, in the same units as the original data, making it easier to interpret. Two distributions can have the same mean but very different spreads, so both statistics matter.

### The Central Limit Theorem
The central limit theorem is the reason the normal distribution appears everywhere. It says that the sum (or average) of many independent random variables — regardless of their original distribution — tends toward a normal distribution as the number of variables grows. This is why sample means are approximately normal, why measurement errors are approximately normal, and why the normal distribution is the default model in so many statistical procedures.

### Why It Matters
Probability distributions turn raw uncertainty into a workable mathematical object. Insurance companies model claim sizes with log-normal and Pareto distributions. Quality engineers use the binomial and Poisson to set acceptance sampling plans. Financial analysts model stock returns with normal and t-distributions. AI researchers initialise neural network weights using uniform or normal distributions. Every forecast, every confidence interval, every hypothesis test is built on top of a probability distribution. Knowing which distribution fits a situation is the first step toward making reliable predictions about an uncertain world.`,
  },

  // ----------------------------------------------------------------
  // 10. STATISTICAL INFERENCE
  // ----------------------------------------------------------------
  {
    id: 'math-deep-statistical-inference',
    patterns: [/\b(statistical inference|hypothesis test|null hypothesis|alternative hypothesis|p-value|confidence interval|correlation|causation|regression|linear regression|population|sample|statistical significance|type i error|type ii error)\b/i],
    keywords: ['statistical inference', 'hypothesis test', 'null hypothesis', 'alternative hypothesis', 'p-value', 'confidence interval', 'correlation', 'causation', 'regression', 'linear regression', 'population', 'sample', 'significance'],
    intent: 'factual_question',
    topic: 'mathematics',
    response: () => `Statistical inference is the science of drawing conclusions about a whole population from a limited sample. Descriptive statistics summarises what we have seen; inferential statistics risks claims about what we have not. Every opinion poll, every clinical trial, every A/B test on a website, and every scientific paper reporting "significant" results relies on inference — and getting it wrong has consequences ranging from wasted money to harmful medical advice.

### Population and Sample
The population is the entire group we want to learn about — every voter, every patient, every product. The sample is the subset we actually observe. We use sample statistics (like the sample mean) to estimate population parameters (like the population mean). The law of large numbers says that as the sample size grows, the sample mean converges to the population mean. The standard error quantifies how much the sample mean typically varies from sample to sample — it shrinks as the sample size grows, which is why bigger samples give more precise estimates.

### Hypothesis Testing
A hypothesis test sets up two competing claims: the null hypothesis (usually "no effect" or "no difference") and the alternative hypothesis ("there is an effect"). We collect data and ask: if the null were true, how surprising would this data be? The p-value is the probability of observing data at least as extreme as ours, assuming the null is true. A small p-value (typically below 0.05) is considered evidence against the null, and we reject it. A large p-value means the data is consistent with the null, and we fail to reject it — note that "fail to reject" is not the same as "accept."

### Type I and Type II Errors
Hypothesis testing has two failure modes. A Type I error (false positive) rejects a true null — we declare an effect that does not exist. The probability of a Type I error is alpha, the significance level we choose (often 0.05). A Type II error (false negative) fails to reject a false null — we miss a real effect. The probability of a Type II error is beta, and (one minus beta) is the power of the test. There is always a trade-off: lowering alpha reduces false positives but raises false negatives. Sample size, effect size, and chosen significance level all trade off against each other.

### Confidence Intervals
A confidence interval gives a range of plausible values for a parameter, along with a confidence level — typically 95 percent. A 95 percent confidence interval means that if we repeated the sampling procedure many times, about 95 percent of the resulting intervals would contain the true parameter. Confidence intervals are more informative than a bare p-value because they show both the estimate and its uncertainty. A narrow interval means a precise estimate; a wide interval means the data does not pin down the parameter tightly.

### Correlation, Causation, and Regression
Correlation measures how strongly two variables move together, ranging from negative one (perfectly opposite) through zero (no linear relationship) to positive one (perfectly aligned). But correlation does not imply causation — ice cream sales and drowning deaths are correlated, but one does not cause the other; both rise with summer heat. Linear regression fits a straight line that best predicts one variable from another, using the method of least squares. Regression underlies forecasting, trend analysis, and much of machine learning. Establishing causation requires controlled experiments, randomisation, and careful design — not just statistical patterns.

### Why It Matters
Statistical inference is how we make decisions under uncertainty at scale. Drug approvals hinge on clinical trials with hypothesis tests and confidence intervals. Election forecasting combines polls with regression models. A/B testing on websites picks which design earns more revenue. Quality control in manufacturing accepts or rejects batches based on samples. But inference is also widely misused — p-hacking, ignoring multiple comparisons, confusing correlation with causation, and over-claiming from tiny samples. Understanding inference is not just a technical skill; it is a defence against being misled by numbers in a world full of them.`,
  },
]
