/**
 * ============================================================
 *  TRIZA KNOWLEDGE BATCH — PHYSICS & CHEMISTRY
 * ============================================================
 *
 *  25 hand-written knowledge entries covering core physics
 *  and chemistry concepts. Each entry teaches TRIZA a factual
 *  answer in markdown form — the self-expression engine will
 *  later wrap these in TRIZA's own voice.
 *
 *  Topics: gravity, electricity, magnetism, light, sound,
 *  heat, energy, force/motion, atomic structure, periodic
 *  table, chemical bonds, reactions, states of matter,
 *  acids/bases, water, oxygen, carbon, hydrogen,
 *  metals/non-metals, nuclear energy, quantum physics,
 *  relativity, friction, pressure, electromagnetism.
 *
 *  Patterns include English + Roman Urdu phrasings.
 *  No external LLM. No double-quotes inside response strings.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const PHYSICS_CHEM_ENTRIES: KnowledgeEntry[] = [
  {
    id: 'gravity-explained',
    patterns: [/\b(gravity|gravitation|gravitational force|gravitational pull|gravity kya hai|gravity kaise|kashish|zameen ki kashish|wazan kyun)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Gravity — The Force That Pulls Everything Together

Gravity is one of the four fundamental forces of nature, and it is the one that keeps our feet on the ground, the Moon in orbit, and galaxies bound together. Every object that has mass attracts every other object that has mass — yes, even you and your phone are pulling on each other, just very weakly.

### Newton's Law of Universal Gravitation
In 1687, Isaac Newton proposed that the gravitational force between two objects depends on their **masses** and the **distance** between them. The formula is:

\`F = G × (m₁ × m₂) / r²\`

Where \`G\` is the gravitational constant (6.674 × 10⁻¹¹ N·m²/kg²), m₁ and m₂ are the masses, and r is the distance between their centres. Double the distance and the force becomes four times weaker.

### How It Actually Works
- **Bigger mass = stronger pull**: Earth pulls you hard because it is massive. You pull Earth too, but its huge mass barely moves.
- **Distance matters**: Gravity weakens rapidly with distance, but it never truly reaches zero.
- **Same fall rate**: In a vacuum, a feather and a hammer hit the ground together (proven on the Moon by Apollo 15).

### Key Facts
| Aspect | Detail |
|--------|--------|
| Discovered by | Isaac Newton (1687) |
| Refined by | Albert Einstein (General Relativity, 1915) |
| Strength | Weakest of the 4 fundamental forces |
| Range | Infinite (but weakens with distance) |
| Speed of gravity | Equal to speed of light |

**Why it matters:** Without gravity there would be no stars, no planets, no orbits, no atmosphere — and we would simply float away into space. It is the silent architect of the universe's structure.`,
  },

  {
    id: 'electricity-basics',
    patterns: [/\b(electricity|current|voltage|resistance|ohm|ampere|bijli|bijli kaise|bijli kya hai|current kya hai|voltage kya hai)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Electricity — The Flow of Tiny Charges

Electricity is the movement of electric charge, usually carried by tiny particles called **electrons** inside a wire. It powers almost everything in modern life — from your phone and lights to factories and trains. Understanding three key ideas unlocks the whole subject: **current**, **voltage**, and **resistance**.

### The Three Pillars
- **Current (I)**: The amount of charge flowing per second. Measured in **amperes (A)**. Think of it as how much water flows through a pipe.
- **Voltage (V)**: The push that drives the current. Measured in **volts (V)**. It is like water pressure — without pressure, nothing moves.
- **Resistance (R)**: How much a material opposes the flow. Measured in **ohms (Ω)**. A thin wire has high resistance, just like a narrow pipe reduces water flow.

### Ohm's Law
The relationship between these three is captured by Ohm's Law:

\`V = I × R\`

If you know any two, you can find the third. Double the voltage and the current doubles (if resistance stays the same).

### Types of Current
| Type | Description | Example |
|------|-------------|---------|
| DC (Direct Current) | Flows in one direction | Batteries, solar cells |
| AC (Alternating Current) | Reverses direction many times per second | Wall sockets (50–60 Hz) |

**Why it matters:** Electricity is the backbone of civilisation. Without understanding it, there would be no computers, no internet, no refrigeration, no modern medicine. The simple rule V = I × R is the foundation of all circuit design.`,
  },

  {
    id: 'magnetism-basics',
    patterns: [/\b(magnet|magnetism|magnetic field|magnetic pole|choombak|chumbak|magnet kaise|magnet kya hai|magnetic kya hai)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Magnetism — The Invisible Force of Poles

Magnetism is a force created by moving electric charges. Every magnet has two ends called **poles** — a north pole and a south pole. Opposite poles attract each other, while like poles push away. The Earth itself is a giant magnet, which is why compasses work.

### Magnetic Fields
A magnet does not need to touch something to affect it. It creates an invisible **magnetic field** around itself, made up of field lines that flow from north to south outside the magnet. Iron filings sprinkled around a magnet reveal these beautiful curved lines.

- **Field lines never cross**
- **Closer lines = stronger field**
- **The field exists even in empty space**

### How Magnets Work
Inside a magnet, billions of tiny regions called **domains** line up in the same direction. Each domain acts like a small magnet. When they all point the same way, their forces add up — and the material becomes magnetic. In an ordinary piece of iron, the domains point randomly, so they cancel out.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Two poles | North and South (cannot be separated) |
| Magnetic monopole | Has never been found |
| Earth's magnetic field | Protects us from solar wind |
| Electromagnet | Made by current in a coil (can be switched off) |
| Magnetic materials | Iron, Nickel, Cobalt |

**Why it matters:** Magnetism and electricity are two sides of the same coin — together they make **electromagnetism**, which gives us motors, generators, MRI machines, hard drives, and even light itself. Without magnets, modern technology would not exist.`,
  },

  {
    id: 'light-and-optics',
    patterns: [/\b(light|optics|reflection|refraction|spectrum|visible light|roshni|roshni kya hai|light kya hai|prism|rainbow)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Light — Waves, Colors, and Bending

Light is a form of energy that travels as an **electromagnetic wave**. It moves at the fastest speed in the universe — about **299,792 km per second** in a vacuum. Light has a dual nature: sometimes it behaves like a wave, and sometimes like a stream of particles called **photons**. This is known as wave-particle duality.

### The Visible Spectrum
White light is not really white — it is a mix of seven colors, each with a different wavelength:

| Color | Wavelength (nm) |
|-------|-----------------|
| Violet | 380–450 |
| Blue | 450–495 |
| Green | 495–570 |
| Yellow | 570–590 |
| Orange | 590–620 |
| Red | 620–750 |

Beyond visible light lie **infrared** (longer waves, felt as heat) and **ultraviolet** (shorter waves, cause sunburn). The full electromagnetic spectrum extends from radio waves to gamma rays.

### Reflection and Refraction
- **Reflection**: When light bounces off a surface. The angle of incidence equals the angle of reflection. Mirrors work this way.
- **Refraction**: When light bends as it passes from one medium to another (like air to water). This is why a straw in a glass looks broken.

### Other Behaviours
- **Diffraction**: Light bends around edges of obstacles
- **Dispersion**: A prism splits white light into colors (rainbow effect)
- **Absorption**: Dark surfaces absorb light; bright ones reflect it

**Why it matters:** Without light there would be no vision, no photosynthesis, no warmth, no colors. Almost everything we know about the universe comes from studying the light that reaches us from distant stars.`,
  },

  {
    id: 'sound-waves',
    patterns: [/\b(sound|sound wave|frequency|pitch|acoustics|awaaz|awaz|awaaz kaise|sound kya hai|dhun|echo|decibel)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Sound — Vibrations That Travel Through Matter

Sound is a mechanical wave created by vibrating objects. When something vibrates — like your vocal cords or a guitar string — it pushes the air molecules around it, creating areas of high and low pressure called **compressions** and **rarefactions**. These pressure waves travel outward until they reach your ears.

### Key Properties
- **Frequency**: How many waves pass a point per second. Measured in **hertz (Hz)**. Higher frequency means higher pitch.
- **Amplitude**: The size of the wave. Bigger amplitude means louder sound. Measured in **decibels (dB)**.
- **Wavelength**: The distance between two compressions.
- **Speed**: Sound travels at about **343 m/s in air**, much faster in water (1480 m/s) and steel (5960 m/s).

### The Human Hearing Range
| Range | Frequency | Notes |
|-------|-----------|-------|
| Infrasound | Below 20 Hz | Elephants use it |
| Human hearing | 20–20,000 Hz | Best around 2–4 kHz |
| Ultrasound | Above 20,000 Hz | Bats navigate with it |

### How Sound Behaves
- **Reflection**: Echoes happen when sound bounces off a surface
- **Refraction**: Sound bends when it enters a different medium
- **Doppler Effect**: A passing siren sounds higher as it approaches and lower as it moves away

**Why it matters:** Sound is how we communicate, enjoy music, and detect danger. Sonar uses it underwater, ultrasound scans look inside the human body, and the human ear is one of nature's most sensitive instruments — able to detect pressure changes smaller than the width of an atom.`,
  },

  {
    id: 'heat-temperature',
    patterns: [/\b(heat|temperature|thermodynamics|garmi|hararat|heat kya hai|temperature kya hai|kelvin|celsius|fahrenheit|entropy)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Heat and Temperature — Energy in Motion

Heat and temperature are related but very different ideas. **Temperature** measures how hot or cold something is — it tells you the average kinetic energy of the particles. **Heat** is the energy that flows from a hotter object to a colder one. A cup of coffee is at a higher temperature than a swimming pool, but the pool contains far more heat energy because it has so much more water.

### Temperature Scales
| Scale | Freezing Point of Water | Boiling Point |
|-------|--------------------------|---------------|
| Celsius (°C) | 0 | 100 |
| Fahrenheit (°F) | 32 | 212 |
| Kelvin (K) | 273.15 | 373.15 |

Kelvin is the SI unit and starts at **absolute zero** (0 K = -273.15 °C), the temperature at which all particle motion theoretically stops.

### How Heat Travels
- **Conduction**: Heat moves through a solid directly (a metal spoon in soup gets hot at the top)
- **Convection**: Heat moves in liquids and gases by currents (warm air rises)
- **Radiation**: Heat travels through empty space as infrared waves (the Sun's warmth)

### The Laws of Thermodynamics
1. **First Law**: Energy cannot be created or destroyed, only transformed
2. **Second Law**: Heat always flows from hot to cold; entropy (disorder) always increases
3. **Third Law**: Absolute zero can never be reached
4. **Zeroth Law**: If A and B are each in thermal equilibrium with C, then A and B are in equilibrium with each other

**Why it matters:** Thermodynamics governs engines, refrigerators, weather, stars, and even life itself. Every process in the universe — from a candle burning to a galaxy forming — obeys these laws.`,
  },

  {
    id: 'energy-types',
    patterns: [/\b(energy|kinetic energy|potential energy|energy conservation|taaqat|taqat|energy kya hai|kinetic|potential|renewable energy)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Energy — The Capacity to Do Work

Energy is the universal currency of the universe — it is what makes things happen. Anything that moves, lights up, heats up, or changes in any way is using energy. The most remarkable fact about energy is that it can never be created or destroyed; it can only change forms. This is the **Law of Conservation of Energy**.

### Major Forms of Energy
- **Kinetic Energy**: The energy of motion. A moving car, a flowing river, a falling stone — all have kinetic energy. Formula: \`KE = ½ × m × v²\`
- **Potential Energy**: Stored energy due to position. A book on a high shelf, a stretched rubber band, water behind a dam.
- **Thermal Energy**: The internal energy of moving particles (heat)
- **Chemical Energy**: Stored in bonds of molecules (food, fuel, batteries)
- **Electrical Energy**: Movement of charges
- **Light Energy**: Carried by photons
- **Nuclear Energy**: Stored in atomic nuclei

### Energy Conversion Examples
| Process | Conversion |
|---------|------------|
| Light bulb | Electrical → Light + Heat |
| Plants | Light → Chemical (photosynthesis) |
| Car engine | Chemical → Kinetic + Heat |
| Dam turbine | Potential → Electrical |
| Solar panel | Light → Electrical |

### Renewable vs Non-Renewable
- **Renewable**: Solar, wind, hydro, geothermal, biomass
- **Non-renewable**: Coal, oil, natural gas, uranium

**Why it matters:** Every civilisation in history has been shaped by its access to energy. The shift from coal to oil changed the 20th century, and the shift from fossil fuels to renewables is shaping the 21st. Understanding energy is understanding the limits and possibilities of human progress.`,
  },

  {
    id: 'force-motion-laws',
    patterns: [/\b(force|motion|newton|newton law|newton ke kanoon|force kya hai|newton first law|newton second law|newton third law|inertia)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Force and Motion — Newton's Three Laws

Force is a push or pull that can change the motion of an object. Sir Isaac Newton, in his 1687 masterpiece *Principia Mathematica*, described three simple laws that explain almost everything about how objects move — from a thrown ball to rockets reaching the Moon.

### The Three Laws

**1. The Law of Inertia (First Law)**
An object at rest stays at rest, and an object in motion stays in motion at the same speed and direction, unless acted upon by an external force. This is why passengers lurch forward when a car suddenly brakes — their bodies want to keep moving.

**2. F = m × a (Second Law)**
The acceleration of an object depends on the force applied and its mass. A heavier object needs more force to accelerate at the same rate. Push a bicycle and a truck with the same force — the bicycle accelerates far more.

**3. Action and Reaction (Third Law)**
For every action, there is an equal and opposite reaction. When you jump, you push the Earth down with the same force the Earth pushes you up. The Earth barely moves because it is so massive, but you go flying up.

### Key Units
| Quantity | Unit | Symbol |
|----------|------|--------|
| Force | Newton | N |
| Mass | Kilogram | kg |
| Acceleration | m/s² | a |

### Mass vs Weight
A common confusion: **mass** is how much matter is in an object (constant everywhere). **Weight** is the force of gravity on that mass (changes with location). An astronaut has the same mass on the Moon, but weighs only one-sixth as much.

**Why it matters:** Newton's laws are the foundation of engineering, aviation, space travel, ballistics, and machine design. Every bridge, every car, every rocket is built on these three simple rules.`,
  },

  {
    id: 'atomic-structure',
    patterns: [/\b(atom|atomic structure|proton|neutron|electron|nucleus|atom kya hai|atom kya hota hai|atom ki banawat|atomic number|isotope)\b/i],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `## Atomic Structure — The Building Blocks of Everything

Everything around you — your body, the air, the screen you are reading on — is made of atoms. An atom is the smallest unit of matter that retains the properties of an element. Despite being unimaginably tiny (about 10⁻¹⁰ meters across), every atom has a rich internal structure.

### The Three Subatomic Particles
| Particle | Charge | Location | Mass |
|----------|--------|----------|------|
| Proton | +1 | Nucleus | 1.67 × 10⁻²⁷ kg |
| Neutron | 0 | Nucleus | 1.67 × 10⁻²⁷ kg |
| Electron | -1 | Orbitals | 9.11 × 10⁻³¹ kg |

### The Nucleus
At the centre of the atom lies the **nucleus**, containing protons and neutrons packed tightly together. Despite being 100,000 times smaller than the whole atom, the nucleus holds almost all of the atom's mass. Protons carry positive charge, neutrons have no charge, and the strong nuclear force binds them together.

### Electrons and Orbitals
Electrons zip around the nucleus in regions called **orbitals** or **shells**. They do not orbit like planets — instead they exist in cloud-like probability zones. Each shell can hold only a fixed number of electrons (2, 8, 18, 32, ...). The arrangement of outer electrons determines how an atom reacts chemically.

### Atomic Number and Mass
- **Atomic Number**: Number of protons. It defines the element (Hydrogen = 1, Carbon = 6, Uranium = 92).
- **Mass Number**: Protons + neutrons.
- **Isotopes**: Same element, different number of neutrons. For example, Carbon-12 and Carbon-14.

**Why it matters:** The atom is the alphabet of chemistry. Every molecule, every reaction, every material is just atoms rearranging. Understanding the atom unlocked chemistry, nuclear energy, semiconductors, and modern biology.`,
  },

  {
    id: 'periodic-table-organised',
    patterns: [/\b(periodic table|element table|mendeleev|periodic table kya hai|jadari table|chemical elements|groups and periods|periodic table kaise)\b/i],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `## The Periodic Table — A Map of All Elements

The periodic table is one of the most powerful tools in science. It organises all 118 known elements into a grid where their position reveals their properties. Created by Russian chemist **Dmitri Mendeleev** in 1869, it even predicted elements that had not yet been discovered.

### How It Is Organised
- **Rows (Periods)**: There are 7 horizontal rows. Moving left to right, each element has one more proton than the last.
- **Columns (Groups)**: There are 18 vertical columns. Elements in the same column have the same number of outer electrons — and therefore similar chemical behaviour.
- **Atomic Number**: Increases by one as you move across the table.

### The Major Groups
| Group | Name | Properties |
|-------|------|------------|
| Group 1 | Alkali Metals | Very reactive, soft (Na, K) |
| Group 2 | Alkaline Earth Metals | Reactive, fairly hard (Mg, Ca) |
| Groups 3–12 | Transition Metals | Strong, conductive (Fe, Cu, Au) |
| Group 17 | Halogens | Very reactive non-metals (F, Cl) |
| Group 18 | Noble Gases | Inert, full outer shell (He, Ne) |

### The Big Divisions
- **Left of staircase**: Metals (shiny, conductive, malleable)
- **Right of staircase**: Non-metals (dull, poor conductors)
- **On the staircase**: Metalloids (semiconductors — like silicon)

### Periodic Trends
- **Atomic size** decreases across a period, increases down a group
- **Reactivity** of metals increases down a group
- **Reactivity** of non-metals decreases down a group

**Why it matters:** The periodic table is chemistry's grammar. With it, a scientist can predict how an unknown element will behave, design new materials, and understand why life on Earth is carbon-based rather than silicon-based.`,
  },

  {
    id: 'chemical-bonds',
    patterns: [/\b(chemical bond|ionic bond|covalent bond|metallic bond|bond kya hai|chemical bonding|molecule bond|ionic|covalent)\b/i],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `## Chemical Bonds — How Atoms Hold Hands

Atoms rarely exist alone. They join together to form molecules and compounds through **chemical bonds**. A bond forms when atoms share or transfer electrons so that each can achieve a more stable electron arrangement — usually a full outer shell of 8 electrons (the **octet rule**).

### The Three Main Types

**1. Ionic Bonds**
One atom gives electrons, another takes them. This happens between a metal and a non-metal. Sodium (Na) gives one electron to chlorine (Cl), forming Na⁺ and Cl⁻ ions. These oppositely charged ions attract strongly, creating **sodium chloride** — common table salt.

**2. Covalent Bonds**
Two atoms **share** electrons. This usually happens between non-metals. In a water molecule (H₂O), oxygen shares electrons with two hydrogen atoms. Shared electrons can be equal (non-polar) or unequal (polar, like water).

**3. Metallic Bonds**
In metals, the outer electrons break free from individual atoms and form a 'sea' of electrons that flows around positive metal ions. This is why metals conduct electricity so well and can be bent without breaking.

### Bond Comparison
| Property | Ionic | Covalent | Metallic |
|----------|-------|----------|----------|
| Formed by | Metal + Non-metal | Non-metals | Metal atoms |
| Electron behavior | Transfer | Sharing | Free flow |
| State at room temp | Solid | Solid/Liquid/Gas | Solid (except Hg) |
| Melting point | High | Varies | Varies |
| Conductivity | Only when dissolved | Usually poor | Excellent |

### Bond Strength
Bonds store energy. Breaking them requires energy (endothermic), forming them releases energy (exothermic). This simple fact powers everything from digestion to rocket fuel.

**Why it matters:** Without chemical bonds there would be no molecules, no water, no DNA, no food, no fuel. Every smell, taste, color, and texture you experience is a direct result of how atoms are bonded together.`,
  },

  {
    id: 'chemical-reactions',
    patterns: [/\b(chemical reaction|reaction|chemical equation|balancing equation|reaction types|combustion|decomposition|synthesis reaction|chemical reaction kya hai)\b/i],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `## Chemical Reactions — Atoms Rearranging Themselves

A chemical reaction is a process in which one or more substances (called **reactants**) change into new substances (called **products**) by rearranging their atoms. No atoms are created or destroyed — they simply break old bonds and form new ones. This principle is called the **Law of Conservation of Mass**.

### How to Recognise a Reaction
- Color change
- Gas bubbles form
- Temperature change (heat released or absorbed)
- Light or sound produced
- A precipitate (solid) forms in a liquid

### The Main Types
| Type | What Happens | Example |
|------|--------------|---------|
| Synthesis | A + B → AB | 2H₂ + O₂ → 2H₂O |
| Decomposition | AB → A + B | 2H₂O → 2H₂ + O₂ |
| Single Replacement | A + BC → AC + B | Zn + 2HCl → ZnCl₂ + H₂ |
| Double Replacement | AB + CD → AD + CB | NaCl + AgNO₃ → AgCl + NaNO₃ |
| Combustion | Substance + O₂ → CO₂ + H₂O | Burning of methane |

### Balancing Equations
Equations must obey the conservation of mass. The number of atoms of each element must be equal on both sides. For example, methane burning is balanced as:

\`CH₄ + 2O₂ → CO₂ + 2H₂O\`

One carbon on each side, four hydrogens on each side, four oxygens on each side. Balanced.

### Reaction Speed
Factors that speed up reactions include:
- Higher **temperature**
- Higher **concentration** of reactants
- Larger **surface area**
- Presence of a **catalyst** (lowers activation energy without being consumed)

**Why it matters:** Every biological process in your body — digestion, breathing, thinking — is a chain of chemical reactions. Cooking, rusting, photosynthesis, batteries, and even fire are all reactions. Mastering them built modern chemistry and industry.`,
  },

  {
    id: 'states-of-matter',
    patterns: [/\b(states of matter|solid|liquid|gas|plasma|matter|matter kya hai|solid liquid gas|state change|melting|evaporation|sublimation)\b/i],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `## States of Matter — Solid, Liquid, Gas, and Beyond

Matter is anything that has mass and takes up space. It exists in different **states** depending on how much energy (heat) its particles have. As you add energy, particles move faster and spread out, changing the state from solid to liquid to gas.

### The Four Common States

**1. Solid**
Particles are packed tightly in a fixed pattern and only vibrate in place. Solids have a definite shape and volume. Examples: ice, iron, diamond.

**2. Liquid**
Particles are close together but can slide past each other. Liquids have a definite volume but take the shape of their container. Examples: water, oil, mercury.

**3. Gas**
Particles are far apart and move freely at high speed. Gases have no fixed shape or volume — they fill any container. Examples: air, steam, helium.

**4. Plasma**
A high-energy state where atoms lose some of their electrons, creating a soup of charged particles. Plasma is the most common state of matter in the universe — stars, lightning, and neon signs are all plasma.

### State Changes
| Change | Process |
|--------|---------|
| Solid → Liquid | Melting |
| Liquid → Gas | Evaporation |
| Gas → Liquid | Condensation |
| Liquid → Solid | Freezing |
| Solid → Gas | Sublimation (dry ice) |
| Gas → Solid | Deposition (frost) |

### Beyond the Basics
Under extreme conditions, more exotic states exist: **Bose-Einstein condensates** (near absolute zero), **superfluids**, **quark-gluon plasma**, and **degenerate matter** inside neutron stars.

**Why it matters:** The state of water determines our weather and climate. The state of iron determines whether a building stands. Understanding matter lets engineers design everything from spacecraft heat shields to super-cold quantum computers.`,
  },

  {
    id: 'acids-bases-ph',
    patterns: [/\b(acid|base|ph scale|ph kya hai|acidic|basic|khatte|teekha|alkaline|litmus|neutralization|acid kya hai)\b/i],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `## Acids and Bases — The pH Scale and Beyond

Acids and bases are two opposite classes of chemicals that play vital roles in nature, industry, and your body. Their behaviour is measured on the **pH scale**, which runs from 0 to 14. The term pH stands for 'potential of hydrogen', and it measures how many hydrogen ions (H⁺) are in a solution.

### The pH Scale
| pH Range | Type | Examples |
|----------|------|----------|
| 0–3 | Strong acid | Battery acid, stomach acid |
| 4–6 | Weak acid | Lemon juice, vinegar, coffee |
| 7 | Neutral | Pure water, human blood (7.4) |
| 8–10 | Weak base | Baking soda, seawater |
| 11–14 | Strong base | Bleach, drain cleaner, soap |

Each step on the pH scale represents a **10x change** in acidity. A solution with pH 3 is ten times more acidic than one with pH 4, and one hundred times more acidic than pH 5.

### Properties
- **Acids**: Taste sour, turn blue litmus red, react with metals to release hydrogen gas, pH below 7
- **Bases**: Taste bitter, feel slippery, turn red litmus blue, pH above 7

### Neutralisation
When an acid meets a base, they react to form **salt and water**. This is called neutralisation. For example:

\`HCl + NaOH → NaCl + H₂O\`

This is why antacids (bases) calm an acidic stomach.

### Everyday Examples
- **Vitamin C** (ascorbic acid) keeps you healthy
- **Stomach acid** (HCl) digests food
- **Baking soda** (base) makes cakes rise
- **Soil pH** decides which plants can grow

**Why it matters:** The right pH keeps your blood, soil, oceans, and swimming pools healthy. Even a small pH shift in the wrong direction can disrupt enzymes, kill fish, or destroy crops.`,
  },

  {
    id: 'water-properties',
    patterns: [/\b(water|h2o|paani|pani|water properties|water kya hai|paani kya hai|universal solvent|water cycle|hydrogen bond)\b/i],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `## Water — The Molecule That Makes Life Possible

Water (H₂O) seems ordinary, but it is one of the most unusual and important molecules in the universe. A single oxygen atom bonded to two hydrogen atoms, water covers about **71% of Earth's surface** and makes up roughly **60% of your body**. Without its strange properties, life as we know it would not exist.

### Why Water Is Special

**1. The Bent Shape and Polarity**
The water molecule is not straight — it is bent at an angle of about **104.5°**. Oxygen pulls electrons more strongly than hydrogen, giving water a positive end and a negative end. This **polarity** lets water attract many different substances, earning it the title 'universal solvent'.

**2. Hydrogen Bonding**
The slight charges on water molecules cause them to stick together with weak bonds called **hydrogen bonds**. This gives water its high surface tension (which lets insects walk on water) and unusually high boiling point.

**3. Density Anomaly**
Almost every substance shrinks when it freezes. Water is one of the rare exceptions — **ice floats** because it is less dense than liquid water. This is why lakes freeze from the top, allowing fish to survive underneath.

### Key Properties
| Property | Value |
|----------|-------|
| Boiling point | 100 °C (at sea level) |
| Freezing point | 0 °C |
| pH | 7 (neutral) |
| Density (liquid) | 1 g/cm³ |
| Density (ice) | 0.92 g/cm³ |
| Specific heat | 4.18 J/g·°C (very high) |

### The Water Cycle
Water moves endlessly between Earth's surface and atmosphere: **evaporation** → **condensation** → **precipitation** → **collection** → repeat. This cycle has powered life for billions of years.

**Why it matters:** Water dissolves nutrients so cells can use them, transports heat around the planet, shapes the land through erosion, and forms the medium in which all biochemistry happens. Find liquid water on another world, and you may have found life.`,
  },

  {
    id: 'oxygen-element',
    patterns: [/\b(oxygen|oxygen element|o2|hawa|oxygen kya hai|oxygen ki ahmiyat|respiration|photosynthesis oxygen|ozone)\b/i],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `## Oxygen — The Breath of Life

Oxygen is element number 8 on the periodic table, with the symbol **O**. It is the third most abundant element in the universe and the most abundant in Earth's crust. About **21% of the air** you breathe is oxygen, and roughly **65% of your body mass** is oxygen — mostly tied up in water.

### Properties of Oxygen
- **Atomic number**: 8
- **Atomic mass**: 15.999 u
- **State at room temp**: Colorless, odorless gas
- **Common form**: O₂ (two oxygen atoms bonded)
- **Other form**: O₃, called **ozone**, found in the upper atmosphere

### Why It Is Essential
Oxygen is a powerful **oxidiser** — it reacts eagerly with many substances. This is what makes combustion (fire) possible and what lets your cells extract energy from food through a process called **cellular respiration**:

\`C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy\`

Without oxygen, complex animals could not exist. Your brain alone uses about 20% of the oxygen you breathe.

### Where Oxygen Comes From
Most of Earth's oxygen is produced by **photosynthesis** in plants, algae, and cyanobacteria. They use sunlight to split water molecules, releasing oxygen as a waste product. Early Earth had almost no oxygen — the rise of cyanobacteria about 2.4 billion years ago caused the **Great Oxygenation Event**, one of the most dramatic shifts in our planet's history.

### Common Uses
| Use | Form |
|-----|------|
| Breathing / medicine | Pure O₂ |
| Welding and cutting metal | With acetylene |
| Rocket fuel | Liquid oxygen (LOX) |
| Water treatment | Ozone (O₃) |

### Key Facts
| Aspect | Detail |
|--------|--------|
| Discovered by | Carl Scheele (1771), Joseph Priestley (1774) |
| Named by | Antoine Lavoisier |
| Liquid oxygen | Pale blue color |
| Highly reactive | Bonds with almost everything |

**Why it matters:** Oxygen is the difference between a dead rock and a living planet. It powers fire, breath, and industry. Without it, the night sky would be darker (no fire), the oceans would be empty (no fish), and you would not be reading this.`,
  },

  {
    id: 'carbon-element',
    patterns: [/\b(carbon|carbon element|organic chemistry|koyla|carbon kya hai|allotrope|diamond|graphite|graphene|carbon cycle)\b/i],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `## Carbon — The Backbone of Life

Carbon is element number 6 on the periodic table, with the symbol **C**. Despite being only the 15th most abundant element on Earth, it is the chemical foundation of all known life. The entire field of **organic chemistry** is the study of carbon-containing compounds.

### Why Carbon Is So Special
Carbon has **four valence electrons**, which means it can form four stable bonds with other atoms. This versatility lets carbon build long chains, branched structures, and rings — the architecture of every biological molecule. No other element can match carbon's ability to construct complex, stable, varied compounds.

### Allotropes of Carbon
Pure carbon can exist in dramatically different forms called **allotropes**:

| Allotrope | Structure | Properties |
|-----------|-----------|------------|
| Diamond | 3D crystal lattice | Hardest natural material, transparent |
| Graphite | Layered sheets | Soft, slippery, conducts electricity |
| Graphene | Single sheet of atoms | Strongest material known, flexible |
| Fullerenes | Hollow spheres (buckyballs) | Tiny, strong cages |
| Carbon nanotubes | Rolled-up sheets | Lighter than steel, far stronger |

### Carbon in Living Things
Carbon is the central atom in:
- **Carbohydrates** (sugars, starches) — energy
- **Lipids** (fats, oils) — storage and membranes
- **Proteins** — structure and enzymes
- **Nucleic acids** (DNA, RNA) — genetic information

### The Carbon Cycle
Carbon moves between the atmosphere (as CO₂), the oceans, living things, fossil fuels, and rocks. Plants pull CO₂ out of the air through photosynthesis. Animals eat plants. When living things die, some carbon returns to the air as CO₂, while some gets buried and slowly becomes coal, oil, or natural gas over millions of years.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Atomic number | 6 |
| Melting point | 3550 °C (highest of any element) |
| Age of carbon atoms in your body | Billions of years (from stars) |
| Forms on Earth | More compounds than all other elements combined |

**Why it matters:** Every cell, every gene, every meal, every fuel you use is built on carbon. Burning fossil fuels releases carbon that was locked away for millions of years — which is why it is destabilising our climate. Understanding carbon is understanding both life itself and the climate crisis.`,
  },

  {
    id: 'hydrogen-element',
    patterns: [/\b(hydrogen|hydrogen element|hydrogen fuel|h2|hydrogen kya hai|fuel cell|star fuel|deuterium|hydrogen kaise)\b/i],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `## Hydrogen — The First and Most Common Element

Hydrogen is element number 1 on the periodic table, with the symbol **H**. It is the simplest, lightest, and most abundant element in the universe — making up about **75% of all ordinary matter** by mass. Every star in the night sky is mostly hydrogen, including our Sun.

### Properties of Hydrogen
- **Atomic number**: 1 (just one proton and one electron)
- **Atomic mass**: 1.008 u
- **State at room temp**: Colorless, odorless gas (H₂)
- **Lightest of all gases** — about 14 times lighter than air
- **Highly flammable** — burns with an almost invisible blue flame

### Hydrogen in Stars
Stars are essentially giant balls of hydrogen undergoing **nuclear fusion**. Under enormous heat and pressure, four hydrogen nuclei fuse into one helium nucleus, releasing a tremendous amount of energy. This is the reaction that powers the Sun and has lit up the universe for billions of years:

\`4 ¹H → ⁴He + energy (as light and heat)\`

Every photon of sunlight you feel started as hydrogen fusing 150 million kilometers away.

### Hydrogen on Earth
Hydrogen rarely exists alone on Earth because it is so reactive. It is almost always found combined with other elements:
- **Water (H₂O)** — two hydrogens and one oxygen
- **Fossil fuels** (methane CH₄, oil, coal)
- **All living things** — hydrogen is part of every organic molecule

### Uses and the Hydrogen Economy
| Use | Detail |
|-----|--------|
| Fuel cells | Combine H₂ with O₂ to make electricity, only emission is water |
| Rocket fuel | Liquid hydrogen + liquid oxygen |
| Fertiliser production | Making ammonia (NH₃) for agriculture |
| Oil refining | Removing sulfur from fuels |

### The Promise and Challenge
Hydrogen is sometimes called the 'fuel of the future' because it produces **no carbon emissions** when used. The challenge is producing it cleanly — most hydrogen today is made from natural gas, which releases CO₂. Green hydrogen made by splitting water with renewable electricity could be a game-changer.

**Why it matters:** Hydrogen powered the birth of the universe and fuels every star. It may also power humanity's clean-energy future. From the Big Bang to fuel cells, the simplest element keeps shaping the largest stories.`,
  },

  {
    id: 'metals-nonmetals',
    patterns: [/\b(metals|non-metal|nonmetal|metalloid|dhaat|dhat|metal kya hai|metal properties|semiconductor|silicon|iron|copper)\b/i],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `## Metals and Non-Metals — Two Opposite Worlds

The elements of the periodic table can be broadly divided into **metals** and **non-metals**, with a small group of **metalloids** sitting on the boundary. About 80% of all elements are metals. The difference between the two groups comes down to how tightly their atoms hold onto their outer electrons.

### Properties of Metals
- **Shiny (lustrous)** surface when freshly cut or polished
- **Good conductors** of heat and electricity
- **Malleable** — can be hammered into sheets
- **Ductile** — can be drawn into wires
- **Solid** at room temperature (except mercury, which is liquid)
- **High melting and boiling points** (usually)
- Tend to **lose electrons** in reactions, forming positive ions

### Properties of Non-Metals
- **Dull** appearance (no shine)
- **Poor conductors** of heat and electricity (good insulators)
- **Brittle** if solid — break when hammered
- Can be **solid, liquid, or gas** at room temperature
- **Low melting and boiling points** (usually)
- Tend to **gain electrons** in reactions, forming negative ions

### Common Examples
| Metals | Non-Metals |
|--------|------------|
| Iron (Fe) | Oxygen (O) |
| Copper (Cu) | Carbon (C) |
| Gold (Au) | Nitrogen (N) |
| Aluminium (Al) | Sulfur (S) |
| Sodium (Na) | Chlorine (Cl) |

### Metalloids — The In-Between
Elements like **silicon, germanium, arsenic, and antimony** have properties of both. Silicon is the foundation of all computer chips because it can act as either a conductor or an insulator depending on conditions — a property called **semiconduction**.

### Why Metals Are Useful
- **Copper** → electrical wiring (excellent conductor)
- **Aluminium** → aircraft and cans (light, strong, resistant to corrosion)
- **Iron** → buildings, vehicles (cheap, strong, makes steel)
- **Gold** → electronics, jewellery (does not corrode, conducts well)

**Why it matters:** The story of human civilisation is written in metals — the Stone Age, Bronze Age, Iron Age, and now the Silicon Age. Almost every tool, machine, wire, and chip in your life depends on understanding the difference between metals and non-metals.`,
  },

  {
    id: 'nuclear-energy',
    patterns: [/\b(nuclear energy|nuclear fission|nuclear fusion|nuclear power|atom bomb|atomic energy|nuclear kya hai|nuclear reactor|radioactivity|uranium|plutonium)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Nuclear Energy — Splitting and Fusing Atoms

Nuclear energy is the energy stored inside the nucleus of an atom. It is by far the most concentrated form of energy known — a single kilogram of uranium can produce as much energy as about **100 tons of coal**. There are two ways to release this energy: **fission** (splitting atoms) and **fusion** (joining atoms).

### Nuclear Fission
In fission, a heavy nucleus (like **uranium-235** or **plutonium-239**) is struck by a neutron and splits into two smaller nuclei, releasing energy and several more neutrons. These neutrons then strike other nuclei, causing a **chain reaction**. This is the principle behind nuclear power plants and atomic bombs.

In a power plant, the reaction is carefully controlled. The heat produced is used to boil water, create steam, and spin turbines that generate electricity.

### Nuclear Fusion
In fusion, two light nuclei (usually **hydrogen isotopes** like deuterium and tritium) are forced together to form a heavier nucleus (helium), releasing even more energy per gram than fission. This is the reaction that powers every star, including our Sun.

Fusion is extremely difficult to achieve on Earth because it requires temperatures of **over 100 million degrees** and enormous pressure. Scientists have been working for decades to build a practical fusion reactor — it could provide nearly limitless clean energy with no long-lived radioactive waste.

### Types of Radiation
| Type | What it is | Penetration |
|------|-----------|-------------|
| Alpha (α) | Helium nucleus (2p+2n) | Stopped by paper |
| Beta (β) | High-speed electron | Stopped by aluminium |
| Gamma (γ) | Electromagnetic wave | Needs thick lead or concrete |

### Key Facts
| Aspect | Detail |
|--------|--------|
| Energy per kg | ~Million times more than chemical fuels |
| Waste problem | Long-lived radioactive isotopes |
| Carbon emissions | Effectively zero |
| Famous equation | E = mc² (Einstein) |

**Why it matters:** Nuclear energy is one of the few low-carbon sources that can power entire cities reliably. It also powers submarines, spacecraft (RTGs), and medical treatments. The challenge is balancing its enormous benefits against the risks of accidents, waste, and weapons.`,
  },

  {
    id: 'quantum-physics-basics',
    patterns: [/\b(quantum|quantum physics|quantum mechanics|quantum kya hai|heisenberg|schrodinger|schrodingers cat|wave particle duality|uncertainty principle|superposition|entanglement)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Quantum Physics — The Strange Rules of the Very Small

Quantum physics is the branch of physics that describes how matter and energy behave at the smallest scales — atoms, electrons, photons, and below. At this scale, the rules of everyday life break down completely. Particles can be in multiple places at once, predict only probabilities, and behave as both waves and particles.

### The Wave-Particle Duality
Light and matter show **dual nature**. An electron can act like a particle (a tiny dot) or like a wave (spread out and interfering with itself). The famous **double-slit experiment** showed that even single electrons can interfere with themselves — passing through two slits at once.

### Quantisation
Energy, light, and other quantities come in tiny discrete packets called **quanta**. Light, for example, is made of particles called **photons**. You cannot have half a photon — it is all or nothing. This is where the name 'quantum' comes from.

### The Uncertainty Principle
Werner Heisenberg proved in 1927 that you cannot know both the **exact position** and **exact momentum** of a particle at the same time. The more precisely you measure one, the less precisely you can know the other. This is not a limit of instruments — it is a fundamental property of nature.

\`Δx × Δp ≥ h / 4π\`

### Superposition and Entanglement
- **Superposition**: A quantum particle can exist in multiple states at once until it is measured. Schrödinger's cat (both alive and dead until you look) is the famous thought experiment.
- **Entanglement**: Two particles can become linked so that measuring one instantly tells you about the other, even across the universe. Einstein called it 'spooky action at a distance'.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Founded | 1900–1930 (Planck, Bohr, Heisenberg, Schrödinger) |
| Planck's constant (h) | 6.626 × 10⁻³⁴ J·s |
| Smallest length | Planck length: 1.6 × 10⁻³⁵ m |
| Applications | Lasers, MRI, semiconductors, quantum computers |

**Why it matters:** Without quantum physics, there would be no transistors, no computers, no lasers, no LEDs, no MRI scans, no smartphones. Quantum mechanics also underlies all of chemistry and most of modern technology. The weirdness is real, and it runs the modern world.`,
  },

  {
    id: 'relativity-einstein',
    patterns: [/\b(relativity|einstein|special relativity|general relativity|relativity kya hai|e mc2|time dilation|spacetime|einstein theory|theory of relativity)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Relativity — Einstein's Revolution

In 1905 and 1915, a young patent clerk named **Albert Einstein** published two theories that completely overturned our understanding of space, time, and gravity. Together they are called the **Special** and **General** Theories of Relativity, and they remain among the most precisely tested ideas in all of science.

### Special Relativity (1905)
Special relativity applies to objects moving at constant speed in a straight line, especially those moving close to the speed of light. Its two key postulates are:

1. The **laws of physics are the same** in all inertial frames.
2. The **speed of light is constant** for all observers, no matter how they move.

This leads to strange but proven results:
- **Time dilation**: Moving clocks run slower. Astronauts on the ISS age slightly less than people on Earth.
- **Length contraction**: Fast-moving objects appear shorter in the direction of motion.
- **Mass-energy equivalence**: The famous equation \`E = mc²\` — mass and energy are two forms of the same thing.

### General Relativity (1915)
General relativity extends these ideas to gravity. Einstein proposed that gravity is **not a force** but a **curvature of spacetime** caused by mass and energy. The classic analogy: place a heavy ball on a stretched rubber sheet — it creates a dip, and smaller balls roll toward it. That dip is what we feel as gravity.

### Predictions That Came True
| Prediction | Status |
|------------|--------|
| Light bends near the Sun | Confirmed in 1919 eclipse |
| Time runs slower in gravity (GPS) | Confirmed — GPS satellites correct for it |
| Black holes exist | Confirmed (2019 image by Event Horizon Telescope) |
| Gravitational waves | Detected in 2015 by LIGO |
| Expanding universe | Confirmed (Hubble, 1929) |

### The Famous Equation
\`E = mc²\` means a tiny amount of mass contains a huge amount of energy. This is the principle behind nuclear power and atomic bombs. One gram of mass, fully converted, equals about 25 million kilowatt-hours of energy.

**Why it matters:** Relativity reshaped physics, philosophy, and technology. Without it, GPS would drift kilometers per day, nuclear power would be impossible, and our picture of the universe — from black holes to the Big Bang — would not exist. Einstein showed that reality is stranger than intuition.`,
  },

  {
    id: 'friction-explained',
    patterns: [/\b(friction|friction force|ragad|ragad|friction kya hai|static friction|kinetic friction|rolling friction|coefficient of friction|lubricant)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Friction — The Force That Slows Everything Down

Friction is a force that opposes motion whenever two surfaces touch and slide against each other. It feels like a nuisance — it wears out shoes, heats up engines, and slows down bicycles. But without friction, you could not walk, hold a pen, or even light a match. Friction is one of the most useful forces in everyday life.

### How Friction Works
Even surfaces that look perfectly smooth are actually rough at the microscopic level. When two surfaces touch, their tiny bumps and valleys catch on each other. Atoms from one surface also form weak bonds with atoms on the other. To move, those bonds must constantly break and reform — and that resistance is friction.

### Types of Friction
| Type | Description | Example |
|------|-------------|---------|
| Static | Stops an object from starting to move | Pushing a heavy box that won't budge |
| Sliding (kinetic) | Opposes motion once sliding | A book sliding across a table |
| Rolling | Resists rolling objects (much smaller) | A car tyre on the road |
| Fluid | Acts on objects moving through liquids/gases | Air resistance on a falling skydiver |

### Factors That Affect Friction
- **Type of surfaces** (rough vs smooth)
- **Force pressing them together** (heavier = more friction)
- Surprisingly, **contact area usually does not matter** much
- **Fluid friction** depends on speed, shape, and viscosity

### Useful vs Harmful Friction
**Useful friction:**
- Walking (your feet grip the floor)
- Brakes on cars and bicycles
- Writing with a pencil
- Lighting a match

**Harmful friction:**
- Engine parts wearing out (reduced by lubricants)
- Tyres wearing down
- Energy lost as heat in machines

### Coefficient of Friction
Engineers use a number called the **coefficient of friction (μ)** to describe how slippery a pair of surfaces is. Ice on ice has μ ≈ 0.03 (very slippery). Rubber on dry asphalt has μ ≈ 0.9 (very grippy). The actual friction force is \`F = μ × N\`, where N is the normal force.

**Why it matters:** Almost every machine ever built has had to manage friction — either maximising it (brakes, tyres, shoes) or minimising it (bearings, oil, aerodynamics). Mastering friction made civilisation mobile, and continues to drive innovation in everything from artificial joints to spacecraft re-entry.`,
  },

  {
    id: 'pressure-explained',
    patterns: [/\b(pressure|atmospheric pressure|fluid pressure|dabaav|dabav|pressure kya hai|pascal|hydraulic|air pressure|pascals law|vacuum)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Pressure — Force Spread Over an Area

Pressure is the amount of force applied over a given area, captured by a simple formula:

\`Pressure = Force / Area\`

This is why a sharp knife cuts better than a blunt one — the same force concentrated on a tiny area creates huge pressure. The same force spread over a wide area creates little pressure. Pressure is measured in **pascals (Pa)**, where 1 Pa equals 1 newton per square meter.

### Atmospheric Pressure
The air around you has weight. Although we do not feel it, the atmosphere presses down on everything with a pressure of about **101,325 pascals** (or 1 atmosphere) at sea level — equivalent to a column of water about **10.3 meters** high. We do not notice it because the pressure inside our bodies pushes outward equally. But at high altitudes or deep underwater, the difference becomes very real.

### Fluid Pressure
Liquids and gases are called **fluids**, and they exert pressure in all directions. The deeper you go, the higher the pressure, because more fluid is pressing down from above. The formula is:

\`P = ρ × g × h\`

Where ρ is density, g is gravity (9.8 m/s²), and h is depth. This explains why submarines have thick hulls and why your ears hurt when you dive deep.

### Pressure in Everyday Life
| Example | How it works |
|---------|--------------|
| Sharp needle | Tiny area → huge pressure |
| Snowshoes | Wide area → low pressure → no sinking |
| Straw | Reduces air pressure; atmosphere pushes liquid up |
| Vacuum cleaner | Low pressure; air rushes in carrying dust |
| Hydraulic brakes | Pressure transmitted through fluid |

### Pascal's Principle
Pressure applied to a confined fluid is transmitted equally in all directions. This is the principle behind hydraulic lifts — a small force on a small piston can lift a heavy car on a large piston.

### Key Units
| Unit | Use |
|------|-----|
| Pascal (Pa) | SI unit |
| Atmosphere (atm) | Air pressure |
| Bar | Weather forecasts |
| mmHg (torr) | Blood pressure |

**Why it matters:** Pressure explains why planes fly, why submarines dive, why weather changes, and why blood flows. From car brakes to artificial hearts, mastering pressure is one of engineering's quiet triumphs.`,
  },

  {
    id: 'electromagnetism-spectrum',
    patterns: [/\b(electromagnetism|electromagnetic|em spectrum|electromagnetic spectrum|maxwell|faraday|electromagnetic wave|electromagnetism kya hai|radio wave|microwave|x-ray|gamma ray)\b/i],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `## Electromagnetism — The Spectrum That Connects Us All

Electromagnetism is one of the four fundamental forces of nature. It is the force between electrically charged particles, and it shapes almost everything we experience — from the light we see, to the magnets on our fridge, to the signals that let us call someone on the other side of the planet.

### Electricity and Magnetism — One Force
For centuries, electricity and magnetism were thought to be separate. Then, in the 1800s, scientists like Michael Faraday and James Clerk Maxwell showed they are two faces of the same coin. A moving electric charge creates a magnetic field, and a changing magnetic field creates an electric current. Maxwell's four equations unified them into a single elegant theory — **electromagnetism**.

### The Electromagnetic Spectrum
Electromagnetic waves come in many forms, all traveling at the speed of light. They differ only in wavelength and frequency:

| Type | Wavelength | Use |
|------|------------|-----|
| Radio waves | > 1 m | Radio, TV, mobile signals |
| Microwaves | 1 mm – 1 m | Ovens, Wi-Fi, radar |
| Infrared | 700 nm – 1 mm | Heat cameras, remote controls |
| Visible light | 400–700 nm | The light we see |
| Ultraviolet | 10–400 nm | Sterilisation, tanning |
| X-rays | 0.01–10 nm | Medical imaging, security |
| Gamma rays | < 0.01 nm | Cancer treatment, sterilisation |

### Everyday Applications
- **Electric motors and generators** convert between electrical and mechanical energy
- **Transformers** change voltage in power grids
- **Antennas and Wi-Fi** send and receive radio and microwave signals
- **MRI machines** use strong magnets and radio waves
- **Solar panels** turn light (EM waves) into electricity

### Key Facts
| Aspect | Detail |
|--------|--------|
| Speed of EM waves | 299,792 km/s (speed of light) |
| Carriers | Photons (massless particles) |
| Range | Infinite |
| Strength | Second strongest of the four forces |

**Why it matters:** Without electromagnetism there would be no atoms, no light, no chemistry, no technology. Every modern device — phones, computers, motors, medical scanners, the entire internet — depends on our mastery of the electromagnetic spectrum. It is the force that built the modern world.`,
  },
]
