/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — PHYSICS & CHEMISTRY (DEEP, Batch 15)
 * ============================================================
 *
 *  Deeper subtopic entries that go beyond the general
 *  batch-physics-chem.ts coverage. Where the base batch
 *  introduces atoms, bonds, light, sound, energy, the periodic
 *  table, acids and bases, this batch dives one level deeper:
 *  the Standard Model of particles, nuclear decay laws, the
 *  Schrodinger equation, Lorentz transformations, the four
 *  laws of thermodynamics, photon energies, reaction types,
 *  organic functional groups, periodic trends, VSEPR geometry,
 *  Brønsted-Lowry / Lewis acid-base theory, electrochemical
 *  cells, fluid mechanics, lens equations, and acoustic
 *  phenomena such as the Doppler effect and harmonics.
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

export const PHYSICS_CHEM_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. SUBATOMIC PARTICLES AND THE STANDARD MODEL
  // ----------------------------------------------------------------
  {
    id: 'subatomic-particles-standard-model',
    patterns: [/\b(subatomic|quark|quarks|lepton|leptons|boson|bosons|standard model|higgs|gluon|neutrino|muon|tau|charm quark|strange quark|top quark|bottom quark|up quark|down quark|antiparticle|zarah|zarra)\b/i],
    keywords: ['quark', 'lepton', 'boson', 'standard model', 'higgs', 'gluon', 'neutrino', 'muon', 'tau', 'antiparticle', 'subatomic'],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `Beneath the familiar protons, neutrons, and electrons lies a deeper layer of particles described by the Standard Model of particle physics. This framework, built between the 1960s and 1970s and confirmed again with the 2012 discovery of the Higgs boson, is the most precisely tested theory in science.

### The Three Families
The Standard Model sorts elementary particles into three families. Quarks are the constituents of protons and neutrons. There are six quarks, grouped in three generations: up and down (the light, stable ones that make ordinary matter), charm and strange, and top and bottom (the heaviest, which exist only briefly in high-energy environments). Leptons are the other matter particles, also six in number: the electron, the muon, the tau, and a neutrino paired with each. Gauge bosons are force carriers: photons carry electromagnetism, gluons carry the strong force that binds quarks, and W and Z bosons carry the weak force responsible for radioactive beta decay.

### Color Charge and Confinement
Quarks carry a property called color charge, which comes in three varieties (red, green, blue). Gluons, which themselves carry color, mediate the strong force between quarks. A striking feature is confinement: no isolated quark has ever been observed. Pull two quarks apart and the energy stored in the gluon field grows until it converts into new quark-antiquark pairs, so what emerges is always composite particles called hadrons. Protons and neutrons are hadrons made of three quarks each; pions are made of a quark and an antiquark.

### Antiparticles and the Higgs
Every matter particle has a corresponding antiparticle with the same mass but opposite charge. When a particle meets its antiparticle they annihilate, converting their mass entirely into energy. The Higgs boson, discovered at CERN in 2012, is the quantum excitation of the Higgs field that pervades all space. Interactions with this field are what give the W and Z bosons, quarks, and leptons their mass; particles that interact weakly with the Higgs field, like photons and gluons, remain massless.

### Why It Matters
The Standard Model is the foundation of modern physics. It explains why stars shine, how the sun fuses hydrogen into helium, how radioactive decay proceeds, and how every atom in our bodies stays together. Particle accelerators test it to one part in a trillion. Its gaps — no explanation for dark matter, no inclusion of gravity, undetermined neutrino masses — are the frontiers where physics is now working, but as a description of the visible universe it stands as one of the great achievements of human thought.`,
  },

  // ----------------------------------------------------------------
  // 2. NUCLEAR PHYSICS — DECAY, HALF-LIFE, BINDING ENERGY
  // ----------------------------------------------------------------
  {
    id: 'nuclear-physics-deep',
    patterns: [/\b(half life|half-life|radioactive decay|alpha decay|beta decay|gamma decay|binding energy|mass defect|decay constant|decay chain|nuclear medicine|isotope|isotopes|curie|becquerel|nuclear physics)\b/i],
    keywords: ['half life', 'radioactive decay', 'alpha decay', 'beta decay', 'gamma decay', 'binding energy', 'mass defect', 'decay constant', 'isotope', 'nuclear medicine'],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `Nuclear physics studies the nucleus of the atom — the dense core of protons and neutrons — and the processes that change it. Where chemistry rearranges electrons, nuclear physics rearranges the nucleus itself, releasing energies a million times greater per atom than any chemical reaction.

### Radioactive Decay
Unstable nuclei release energy and particles to become more stable, a process called radioactive decay. Three classical forms exist. Alpha decay emits a helium nucleus (two protons and two neutrons), reducing the parent's mass number by four and its atomic number by two; it is stopped by a sheet of paper. Beta decay converts a neutron into a proton (or vice versa) and emits a fast electron or positron along with a neutrino; it takes aluminium to stop it. Gamma decay releases excess energy as a high-energy photon with no change in the nucleus's identity; only thick lead or concrete can shield it.

### Half-Life and the Decay Law
The half-life of a nuclide is the time required for half of a sample to decay. Each nuclide has its own characteristic half-life, ranging from microseconds to billions of years. Decay follows an exponential law: the number of nuclei remaining after time t equals the initial number times e raised to the power of minus lambda times t, where lambda is the decay constant related to the half-life by lambda equals the natural log of two divided by the half-life. Carbon-14, with a half-life of about 5,730 years, is the basis of radiocarbon dating of archaeological artefacts. Uranium-238, with a half-life of 4.5 billion years, lets geologists date the oldest rocks on Earth.

### Mass Defect and Binding Energy
A nucleus always weighs less than the sum of its individual protons and neutrons. This missing mass, called the mass defect, has been converted into binding energy through Einstein's relation E equals m c squared. The binding energy per nucleon rises steeply from hydrogen to iron-56 (the most tightly bound nucleus) and then declines gradually toward uranium. Splitting a heavy nucleus below the iron peak or fusing light nuclei above it both release energy — this is why both fission and fusion can power reactors and stars. The binding-energy curve is one of the most important graphs in physics.

### Why It Matters
Nuclear physics drives much of modern life. Nuclear power plants supply about 10 percent of the world's electricity with no carbon emissions. Nuclear medicine uses isotopes like technetium-99m and iodine-131 for imaging and therapy. Smoke detectors rely on a tiny amount of americium-241. Radiocarbon dating rewrites history by placing exact ages on ancient bones and manuscripts. And the same nuclear reactions studied in laboratories are what power every star in the sky, including our own sun.`,
  },

  // ----------------------------------------------------------------
  // 3. QUANTUM MECHANICS — SCHRODINGER EQUATION AND QUANTUM NUMBERS
  // ----------------------------------------------------------------
  {
    id: 'quantum-mechanics-deep',
    patterns: [/\b(schrodinger equation|wavefunction|wave function|quantum numbers|principal quantum number|azimuthal|magnetic quantum|spin quantum|orbital|orbitals|pauli exclusion|quantum tunneling|quantum tunnelling|born interpretation|probability density)\b/i],
    keywords: ['schrodinger equation', 'wavefunction', 'quantum numbers', 'orbital', 'pauli exclusion', 'quantum tunneling', 'probability density', 'spin'],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `Quantum mechanics is the mathematical framework that describes matter and energy at atomic and subatomic scales. Where the basics speak of duality and uncertainty, the deeper theory supplies an equation that actually predicts the behaviour of electrons in atoms, molecules, and solids.

### The Wavefunction
At the heart of quantum mechanics is the wavefunction, usually written as the Greek letter psi. The wavefunction is a complex-valued function of position and time that contains everything that can be known about a particle. Max Born's interpretation, proposed in 1926, is that the square of its magnitude gives the probability density of finding the particle at a given location. The particle is not definitely anywhere until a measurement is made; until then, its state is a cloud of probability described by psi.

### The Schrodinger Equation
Erwin Schrodinger, also in 1926, wrote down the equation that governs how psi evolves. The time-dependent Schrodinger equation plays the role that Newton's second law plays in classical mechanics: given the present state, it predicts the future state. For atoms, where the potential energy is fixed, physicists solve the time-independent Schrodinger equation to find allowed stationary states and their energies. For the hydrogen atom, the solutions reproduce the experimental energy levels observed in spectroscopy, a triumph that convinced the physics community the theory was correct.

### Quantum Numbers
Solving the Schrodinger equation for an atom yields four quantum numbers that label every electron state. The principal quantum number n (1, 2, 3, ...) sets the energy shell and the average distance from the nucleus. The azimuthal number l (0 to n minus 1) sets the shape of the orbital, giving the s, p, d, and f subshells. The magnetic number m sub l (minus l to plus l) sets the orbital's orientation in space. The spin number m sub s (plus or minus one-half) sets the intrinsic angular momentum of the electron. The Pauli exclusion principle states that no two electrons in an atom can share all four quantum numbers — this single rule explains the entire structure of the periodic table.

### Tunneling
Because the wavefunction can extend into classically forbidden regions, a particle has a small probability of appearing on the other side of an energy barrier it could not climb over classically. This is quantum tunneling. It is how alpha particles escape nuclei in alpha decay, how electrons move across barriers in semiconductors, and how the sun fuses hydrogen despite the protons not having enough classical energy to overcome their mutual repulsion. Scanning tunneling microscopes use it to image individual atoms on a surface.

### Why It Matters
Quantum mechanics is the most successful physical theory ever devised, with predictions matching experiment to better than ten decimal places. It underlies all of chemistry (through the Schrodinger equation for electrons in molecules), all of solid-state physics (transistors, LEDs, solar cells), lasers, atomic clocks, MRI scanners, and the emerging field of quantum computing. The deeper theory — quantum field theory — extends these ideas to combine special relativity with quantum mechanics and forms the basis of the Standard Model of particle physics.`,
  },

  // ----------------------------------------------------------------
  // 4. RELATIVITY — LORENTZ TRANSFORMS, EQUIVALENCE, GRAVITATIONAL WAVES
  // ----------------------------------------------------------------
  {
    id: 'relativity-deep',
    patterns: [/\b(lorentz transformation|equivalence principle|frame dragging|gravitational lensing|cosmological constant|ligo|gravitational wave|gravitational waves|length contraction|relativistic mass|proper time|spacetime interval|general relativity deep)\b/i],
    keywords: ['lorentz transformation', 'equivalence principle', 'frame dragging', 'gravitational lensing', 'cosmological constant', 'ligo', 'gravitational wave', 'length contraction', 'proper time'],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `Einstein's relativity is two theories: special relativity (1905) about observers in uniform motion, and general relativity (1915) about gravity as the curvature of spacetime. The deeper details reveal why the theory has survived more than a century of experimental tests and how it shapes technologies we use every day.

### Lorentz Transformations
The mathematical core of special relativity is the Lorentz transformations, derived originally by Hendrik Lorentz and given physical meaning by Einstein. They relate measurements of space and time between two observers moving at constant velocity relative to each other. Unlike the Galilean transformations of Newtonian physics, the Lorentz versions mix space and time: a moving clock ticks slowly by a factor of one over the square root of one minus v squared over c squared, and a moving rod contracts in the direction of motion by the same factor. As the relative velocity approaches c, time dilation and length contraction become extreme; at exactly c they would diverge, which is why no massive object can reach the speed of light.

### Proper Time and the Spacetime Interval
Different observers disagree about the time between two events, but they all agree on a quantity called the spacetime interval, which combines spatial separation and temporal separation in a way that is invariant. The proper time along a worldline is the time measured by a clock travelling that worldline — and it is maximised for a free-falling (inertial) path. This is the origin of the twin paradox: the twin who accelerates to turn around ages less because their worldline has less proper time, not because of any mystical effect.

### Equivalence Principle and Curvature
General relativity rests on the equivalence principle: locally, the effects of gravity and acceleration are indistinguishable. A person in a sealed, freely falling elevator feels weightless, just as they would in deep space far from any mass. From this Einstein concluded that gravity is not a force in the Newtonian sense but a manifestation of spacetime curvature. Mass and energy tell spacetime how to curve; curved spacetime tells matter how to move. Planets orbit the sun not because of a pull but because they follow straight paths (geodesics) through curved spacetime.

### Predictions and Confirmations
General relativity predicts effects absent from Newtonian gravity: the bending of starlight near the sun (confirmed by Eddington's 1919 eclipse expedition), the precession of Mercury's perihelion (which Newtonian gravity could not explain), the slowing of clocks in gravitational fields (corrected for in GPS satellites, without which positions would drift by kilometres per day), gravitational lensing that produces Einstein rings around massive galaxies, and frame dragging (the Lense-Thirring effect), in which a rotating massive body twists spacetime around it.

### Gravitational Waves
When massive objects accelerate, they emit ripples in spacetime called gravitational waves. Predicted in 1916, they were finally detected in September 2015 by the LIGO observatories, opening a new window onto the universe. The first detection came from two black holes, about 1.3 billion light-years away, spiralling together and merging. Since then, dozens of mergers have been observed, including neutron-star collisions that confirmed the origin of heavy elements like gold and platinum.

### Why It Matters
Relativity is not just abstract theory. GPS satellites carry atomic clocks that must be corrected for both special-relativistic time dilation (satellites move fast) and general-relativistic time acceleration (they sit higher in Earth's gravitational well); without these corrections the system would fail within minutes. Relativity also drives cosmology — the expanding universe, the Big Bang, black holes, and the cosmic microwave background all follow from its equations. The deeper theory continues to be tested and continues to pass.`,
  },

  // ----------------------------------------------------------------
  // 5. THERMODYNAMICS — FOUR LAWS, ENTROPY, CARNOT CYCLE
  // ----------------------------------------------------------------
  {
    id: 'thermodynamics-laws',
    patterns: [/\b(thermodynamics|first law of thermodynamics|second law|third law|zeroth law|entropy|enthalpy|heat engine|carnot cycle|carnot|heat pump|refrigerator|specific heat|latent heat|isothermal|adiabatic)\b/i],
    keywords: ['thermodynamics', 'entropy', 'enthalpy', 'heat engine', 'carnot cycle', 'specific heat', 'latent heat', 'isothermal', 'adiabatic', 'zeroth law'],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `Thermodynamics is the physics of heat, work, and energy transfer. Developed in the 19th century from the study of steam engines, it grew into one of the most general and powerful frameworks in science — its laws apply equally to power plants, refrigerators, biological cells, and the entire universe.

### The Four Laws
Thermodynamics is built on four laws, numbered oddly because the zeroth was added after the others. The zeroth law defines temperature: if two systems are each in thermal equilibrium with a third, they are in equilibrium with each other. This transitive property lets us define thermometers. The first law is conservation of energy: the change in a system's internal energy equals the heat added to it minus the work done by it. Energy can be converted between forms but never created or destroyed. The second law introduces entropy and states that the total entropy of an isolated system never decreases — natural processes move toward states of greater probability and disorder. The third law says that as temperature approaches absolute zero, the entropy of a perfect crystal approaches zero, and that absolute zero itself cannot be reached in a finite number of steps.

### Entropy and Enthalpy
Entropy, symbol S, is often described as disorder, but more precisely it is the number of microscopic arrangements consistent with a system's macroscopic state. High entropy means many possible arrangements; low entropy means few. Enthalpy, symbol H, combines internal energy with the product of pressure and volume, and is useful for analysing chemical reactions at constant pressure. A reaction with negative enthalpy change releases heat (exothermic); one with positive enthalpy change absorbs heat (endothermic). Gibbs free energy combines enthalpy and entropy into a single quantity that determines whether a reaction is spontaneous at a given temperature.

### Heat Engines and the Carnot Cycle
A heat engine converts thermal energy into mechanical work by moving heat from a hot reservoir to a cold one. Sadi Carnot proved in 1824 that no engine operating between two temperatures can be more efficient than a reversible one, now called the Carnot cycle. Its efficiency equals one minus the cold temperature divided by the hot temperature (both in kelvin). This sets an absolute ceiling that no real engine can exceed, and explains why higher operating temperatures improve power-plant efficiency. Refrigerators and heat pumps run the same cycle in reverse, using work to move heat against its natural flow.

### Why It Matters
Thermodynamics governs every energy technology we have. Steam turbines in power plants, internal-combustion engines in cars, jet engines in aircraft, refrigerators and air conditioners in homes, and heat pumps in green buildings are all heat engines or refrigerators bounded by Carnot's limit. Biology is also thermodynamic: living organisms maintain low internal entropy by exporting heat and waste to their surroundings, in accordance with the second law. Even the fate of the universe — the so-called heat death, in which all energy is evenly distributed and no more work can be done — is a thermodynamic prediction.`,
  },

  // ----------------------------------------------------------------
  // 6. ELECTROMAGNETIC SPECTRUM — PHOTON ENERGY AND APPLICATIONS
  // ----------------------------------------------------------------
  {
    id: 'em-spectrum-deep',
    patterns: [/\b(photon energy|e hf|planck equation|blackbody radiation|blackbody|wiens law|stefan boltzmann|atmospheric window|radio wave|microwave|infrared|visible light|ultraviolet|x ray|x-ray|gamma ray|em spectrum|electromagnetic spectrum deep)\b/i],
    keywords: ['photon energy', 'blackbody', 'wiens law', 'stefan boltzmann', 'radio wave', 'microwave', 'infrared', 'visible light', 'ultraviolet', 'x ray', 'gamma ray', 'em spectrum'],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `The electromagnetic spectrum is the full continuum of electromagnetic waves, ordered by frequency or wavelength. Visible light is a tiny sliver of this spectrum; the rest — radio, microwave, infrared, ultraviolet, X-ray, and gamma — is invisible to our eyes but central to modern technology and to our understanding of the universe.

### The Wave Relation
All electromagnetic waves travel at the speed of light in vacuum, about 300,000 kilometres per second. Their frequency f, wavelength lambda, and speed c are linked by the simple relation c equals f times lambda. Long-wavelength radio waves have low frequencies (kilohertz to gigahertz); short-wavelength gamma rays have extraordinarily high frequencies (10 to the power of 19 hertz and beyond). The energy of a single photon is given by Planck's relation E equals h times f, where h is Planck's constant. Higher frequency means more energetic photons: a gamma-ray photon carries millions of times more energy than a photon of visible light.

### The Bands and Their Uses
Radio waves, with wavelengths from centimetres to kilometres, carry broadcast signals, Wi-Fi, mobile-phone traffic, and are emitted by hydrogen clouds in interstellar space. Microwaves penetrate clouds and are used for radar, satellite communication, and cooking (water molecules absorb them efficiently). Infrared radiation is heat felt from a warm object; it powers thermal cameras, remote controls, and short-range data links. Visible light, the narrow band from about 400 to 700 nanometres in wavelength, is what our eyes detect; within it, different wavelengths appear as different colours from violet (shortest) to red (longest). Ultraviolet light carries enough energy to tan skin and damage DNA; it is used to sterilise water and medical equipment. X-rays penetrate soft tissue but are absorbed by bone, making medical and security imaging possible. Gamma rays, the most energetic, are produced in nuclear reactions and cosmic events; they are used in cancer therapy and to sterilise medical equipment.

### Blackbody Radiation
Any object above absolute zero emits electromagnetic radiation with a spectrum that depends only on its temperature. This is blackbody radiation. Wien's displacement law states that the wavelength of peak emission is inversely proportional to temperature: a hotter object's spectrum peaks at a shorter wavelength. Stefan's law states that the total power radiated per unit area is proportional to the fourth power of absolute temperature. The sun, at about 5,800 kelvin, peaks in the visible; a human body, at about 310 kelvin, peaks deep in the infrared, which is why thermal cameras see people in the dark.

### Why It Matters
Different bands interact with matter differently, which is why the spectrum enables such a range of technologies. Earth's atmosphere is transparent to visible light, some infrared, and radio waves — the so-called atmospheric windows — but absorbs most ultraviolet, X-rays, and gamma rays, protecting life and enabling ground-based astronomy. Every wireless device we own, every medical scan, every fire-safety sensor, and much of astrophysics exists because we have learned to detect, generate, and interpret these invisible waves.`,
  },

  // ----------------------------------------------------------------
  // 7. CHEMICAL REACTION TYPES
  // ----------------------------------------------------------------
  {
    id: 'chemical-reaction-types',
    patterns: [/\b(synthesis reaction|decomposition reaction|single displacement|double displacement|combustion|redox|oxidation|reduction|neutralization|precipitation|reaction type|reaction types|balancing equations|activation energy|reaction rate)\b/i],
    keywords: ['synthesis', 'decomposition', 'single displacement', 'double displacement', 'combustion', 'redox', 'oxidation', 'reduction', 'neutralization', 'precipitation', 'activation energy'],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `Chemical reactions transform one set of substances into another by breaking and forming bonds. Although the number of possible reactions is essentially infinite, they fall into a small number of recognisable patterns. Learning these patterns lets us predict what will happen when two chemicals meet.

### The Five Major Patterns
A synthesis reaction combines two or more reactants into a single product: A plus B gives AB. The rusting of iron, in which iron reacts with oxygen to form iron oxide, is a synthesis. A decomposition reaction does the reverse: a single compound breaks down into two or more products, often when heated. Calcium carbonate heated in a kiln decomposes into calcium oxide and carbon dioxide, the first step in making cement.

A single displacement reaction has one element replacing another in a compound: A plus BC gives AC plus B. The classic school demonstration of zinc dissolving in hydrochloric acid to release hydrogen gas is single displacement. A double displacement reaction swaps partners between two compounds: AB plus CD gives AD plus CB. Mixing silver nitrate with sodium chloride produces silver chloride (a white precipitate) and sodium nitrate; this is also a precipitation reaction, a common subtype.

### Combustion
Combustion is a rapid reaction with oxygen that releases heat and light. Hydrocarbon combustion produces carbon dioxide and water vapour: for methane, CH4 plus 2 O2 gives CO2 plus 2 H2O. Complete combustion requires sufficient oxygen; incomplete combustion produces carbon monoxide or soot, which is why poorly ventilated heaters are dangerous. Combustion powers cars, jets, rockets, and most of the world's electricity generation.

### Redox Reactions
Oxidation-reduction (redox) reactions involve the transfer of electrons. Oxidation is the loss of electrons; reduction is the gain. The two always occur together — what one reactant loses, another gains. The mnemonic OIL RIG (Oxidation Is Loss, Reduction Is Gain) is how students remember it. Rusting, combustion, respiration, photosynthesis, battery operation, and the refining of metals from ores are all redox reactions. Assigning oxidation numbers lets us track which atom is oxidised and which is reduced.

### Rates and Activation Energy
Reactions vary widely in speed. The minimum energy required for reactants to transform into products is the activation energy, an energy barrier that must be crossed even when the products are more stable. Catalysts lower this barrier without being consumed, which is why enzymes in our bodies and catalysts in industrial plants speed reactions enormously. Temperature also raises rates because molecules collide more often and more energetically, as described by the Arrhenius equation.

### Why It Matters
Recognising reaction types is the foundation of practical chemistry. Cooking, rusting, digestion, photosynthesis, the manufacturing of steel, plastic, fertiliser, and pharmaceuticals, the operation of batteries, and the chemistry of climate change are all governed by these patterns. Once we can classify a reaction, we can predict its products, balance its equation, control its rate, and harness it safely.`,
  },

  // ----------------------------------------------------------------
  // 8. ORGANIC CHEMISTRY — HYDROCARBONS AND FUNCTIONAL GROUPS
  // ----------------------------------------------------------------
  {
    id: 'organic-chemistry-hydrocarbons',
    patterns: [/\b(organic chemistry|alkane|alkanes|alkene|alkenes|alkyne|alkynes|aromatic|benzene|functional group|hydroxyl|alcohol|aldehyde|ketone|carboxylic acid|ester|amine|isomer|isomers|iupac|hydrocarbon|hydrocarbons)\b/i],
    keywords: ['organic chemistry', 'alkane', 'alkene', 'alkyne', 'aromatic', 'benzene', 'functional group', 'alcohol', 'aldehyde', 'ketone', 'carboxylic acid', 'ester', 'amine', 'isomer', 'iupac', 'hydrocarbon'],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `Organic chemistry is the chemistry of carbon. Of all the elements, carbon is uniquely able to form long, stable chains and rings, which is why it underpins the molecules of life — proteins, fats, carbohydrates, DNA — and the synthetic molecules of plastics, fuels, dyes, and pharmaceuticals.

### Hydrocarbon Families
Hydrocarbons contain only carbon and hydrogen. They are classified by the type of carbon-carbon bonds they contain. Alkanes have only single bonds and are said to be saturated; their general formula is CnH2n+2. Methane (CH4), ethane (C2H6), propane, and butane are the first four; the series continues through octane (a major component of petrol) up to long chains that form waxes. Alkenes contain at least one carbon-carbon double bond and have the formula CnH2n; ethene (C2H4) is the most-produced organic chemical in the world, the feedstock for plastics. Alkynes contain a carbon-carbon triple bond and have the formula CnH2n-2; acetylene is used in welding torches.

Aromatic hydrocarbons contain a special ring of six carbon atoms with delocalised electrons, of which benzene (C6H6) is the parent. The stability of the benzene ring, far greater than a simple alternating single-double bond picture would predict, was one of the great puzzles of 19th-century chemistry and led to the modern theory of electron delocalisation.

### Functional Groups
The carbon skeleton of an organic molecule defines its size and shape, but its chemistry is set by functional groups — specific arrangements of atoms that react in characteristic ways. An alcohol has a hydroxyl group (OH) attached to a carbon; ethanol in drinks is the most familiar example. An aldehyde has a carbonyl group (C=O) bonded to at least one hydrogen; formaldehyde and the odour of almonds (benzaldehyde) are aldehydes. A ketone has the carbonyl between two carbons; acetone (in nail-polish remover) is a ketone. A carboxylic acid has the COOH group; acetic acid in vinegar is the simplest. An ester, formed from a carboxylic acid and an alcohol, is responsible for the fragrance of fruits. An amine contains nitrogen; the amino group is the building block of amino acids and proteins.

### Isomers
Isomers are molecules with the same molecular formula but different structures. Butane and isobutane, both C4H10, are structural isomers with different boiling points. Stereoisomers have the same connections but different spatial arrangements; thalidomide is a tragic case study where one stereoisomer is a useful drug and the other causes birth defects. The number of possible isomers grows explosively with size — a single formula like C10H22 has 75 isomers.

### Why It Matters
Organic chemistry is the chemistry of life and of most modern materials. Pharmaceuticals are organic molecules designed to interact with biological targets. Polymers — polyethylene, PVC, polyester, nylon — are long organic chains. Fuels such as petrol, diesel, and natural gas are hydrocarbon mixtures. Dyes, fragrances, flavours, pesticides, and solvents are all organic compounds. The rules of organic chemistry — functional groups, isomerism, and reactivity — let us design new molecules with desired properties, making it perhaps the most creative branch of chemistry.`,
  },

  // ----------------------------------------------------------------
  // 9. PERIODIC TABLE TRENDS
  // ----------------------------------------------------------------
  {
    id: 'periodic-trends',
    patterns: [/\b(atomic radius|ionic radius|ionization energy|ionisation energy|electron affinity|electronegativity|effective nuclear charge|shielding effect|periodic trend|periodic trends|atomic size|group trend|period trend)\b/i],
    keywords: ['atomic radius', 'ionization energy', 'electron affinity', 'electronegativity', 'effective nuclear charge', 'shielding effect', 'periodic trend', 'atomic size'],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `The periodic table is not just a chart; it is a map of trends. Properties of the elements change in predictable ways as we move across a period (row) or down a group (column). Understanding these trends lets us predict how an element will behave without having to test it.

### Atomic and Ionic Radius
Atomic radius is the distance from the nucleus to the outermost electron. Across a period from left to right, atoms get smaller even though they gain electrons, because each new electron enters the same shell while the nuclear charge increases by one. The stronger pull on the same shell draws electrons inward. Down a group, atoms get larger because each new period adds a new electron shell. Ionic radius follows the same trends but with a twist: a positive ion (cation) is smaller than its parent atom because it has lost an outer electron, and a negative ion (anion) is larger because it has gained one.

### Ionization Energy
Ionization energy is the energy needed to remove an electron from a gaseous atom. Across a period it generally increases, because the nucleus holds its electrons more tightly. Down a group it decreases, because the outermost electron is in a higher shell, farther from the nucleus and more shielded by inner electrons. The pattern is not perfectly smooth: ionization energy dips slightly at group 2 to group 13 and at group 15 to group 16, reflecting the stability of half-filled and fully filled subshells.

### Electron Affinity
Electron affinity is the energy change when an electron is added to a neutral atom. The halogens (group 17) have the most negative electron affinities because adding one electron completes their outer shell. Noble gases have positive electron affinities because their shells are already full and any added electron must start a new shell, which is unfavourable.

### Electronegativity
Electronegativity, formalised by Linus Pauling, measures how strongly an atom in a bond attracts the shared electrons. It increases across a period and decreases down a group, just like ionization energy. Fluorine, in the top right (excluding noble gases), is the most electronegative element; caesium, in the bottom left, is among the least. The difference in electronegativity between two bonded atoms predicts whether the bond is covalent (small difference), polar covalent (moderate difference), or ionic (large difference).

### Effective Nuclear Charge and Shielding
All these trends share a common cause. The effective nuclear charge felt by an outer electron is the actual nuclear charge minus the shielding provided by inner electrons. Across a period, nuclear charge grows but shielding stays roughly constant, so effective charge rises and pulls electrons in. Down a group, additional shells add shielding that mostly offsets the increased nuclear charge, so outer electrons feel a similar effective charge but at a greater distance. Two simple ideas — effective charge and distance — explain nearly every periodic trend.

### Why It Matters
Periodic trends let chemists predict reactivity without experimentation. They explain why sodium reacts violently with water while magnesium barely reacts, why fluorine is the most aggressive halogen, and why noble gases are inert. They guide the design of alloys, semiconductors, catalysts, and drugs. The periodic table's patterns are the algebra of chemistry — a compact code from which the behaviour of every element can be derived.`,
  },

  // ----------------------------------------------------------------
  // 10. CHEMICAL BONDING — VSEPR AND HYBRIDIZATION
  // ----------------------------------------------------------------
  {
    id: 'chemical-bonding-deep',
    patterns: [/\b(vsepr|vsepr theory|hybridization|hybridisation|sp3|sp2|sp hybrid|sigma bond|pi bond|hydrogen bond|hydrogen bonding|intermolecular force|van der waals|dipole dipole|coordinate bond|lone pair|molecular geometry)\b/i],
    keywords: ['vsepr', 'hybridization', 'sp3', 'sp2', 'sigma bond', 'pi bond', 'hydrogen bond', 'intermolecular force', 'van der waals', 'dipole', 'coordinate bond', 'lone pair', 'molecular geometry'],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `Chemical bonding explains how atoms stick together to form molecules and crystals. The deepest question in bonding is not just whether atoms bond, but what three-dimensional shape the resulting molecule takes — because shape dictates behaviour.

### Covalent Bonding and Bond Order
In a covalent bond, two atoms share one or more pairs of electrons. A single bond has one shared pair, a double bond has two, and a triple bond has three. Triple bonds are shortest and strongest, single bonds longest and weakest. The shared electrons occupy regions of space called orbitals; a sigma bond forms by head-on overlap along the bond axis, while a pi bond forms by side-on overlap of p orbitals. A double bond is one sigma plus one pi; a triple bond is one sigma plus two pi.

### VSEPR Theory
Valence Shell Electron Pair Repulsion (VSEPR) theory predicts molecular shape by minimising the repulsion between electron pairs in the valence shell. Electron pairs — whether in bonds or as lone pairs — arrange themselves as far apart as possible. Two pairs give a linear shape (180 degrees), three pairs a trigonal planar shape (120 degrees), and four pairs a tetrahedral arrangement (109.5 degrees). Five pairs give trigonal bipyramidal geometry, and six pairs give octahedral.

Lone pairs repel more strongly than bonding pairs, so they distort the shape. Ammonia (NH3) has four electron pairs but one is a lone pair, so its shape is trigonal pyramidal rather than tetrahedral, with bond angles of about 107 degrees. Water has two lone pairs and two bonds, giving a bent shape with an angle of about 104.5 degrees. These small angular differences explain why water is a polar molecule with such unusual properties.

### Hybridization
Carbon's ground-state electron configuration seems to allow only two bonds, yet carbon forms four. Linus Pauling resolved this with hybridization: atomic orbitals mix to form hybrid orbitals with new shapes. Mixing one s and three p orbitals gives four sp3 hybrids arranged tetrahedrally (as in methane). Mixing one s and two p orbitals gives three sp2 hybrids in a plane, leaving one unhybridised p orbital for a pi bond (as in ethene). Mixing one s and one p orbital gives two sp hybrids in a line, leaving two p orbitals for two pi bonds (as in ethyne). Hybridization is the bridge between the quantum mechanics of orbitals and the observed geometry of molecules.

### Intermolecular Forces
Beyond the bonds inside a molecule, weaker forces act between molecules. Hydrogen bonds — special dipole-dipole attractions when hydrogen sits between fluorine, oxygen, or nitrogen — are strong enough to give water its high boiling point, hold DNA's double helix together, and shape protein folding. Van der Waals forces, including London dispersion forces from temporary dipoles, are weaker but universal; they explain why even nonpolar gases condense at low temperatures. The balance of these forces determines melting points, boiling points, viscosity, and solubility.

### Why It Matters
Molecular shape is destiny in chemistry. The lock-and-key fit of a drug into its receptor, the double-helix of DNA, the catalytic activity of an enzyme, the strength of a polymer, and the viscosity of a lubricant all depend on geometry at the atomic scale. VSEPR and hybridization give us the tools to predict these shapes from a Lewis structure alone, turning chemistry from a list of facts into a discipline we can reason about.`,
  },

  // ----------------------------------------------------------------
  // 11. ACIDS AND BASES — ARRHENIUS, BRONSTED-LOWRY, LEWIS, BUFFERS
  // ----------------------------------------------------------------
  {
    id: 'acids-bases-deep',
    patterns: [/\b(arrhenius|bronsted lowry|brønsted|lewis acid|lewis base|strong acid|weak acid|strong base|weak base|dissociation constant|pka|pkb|buffer|buffer solution|henderson hasselbalch|titration|titration curve|indicator|conjugate acid|conjugate base)\b/i],
    keywords: ['arrhenius', 'bronsted lowry', 'lewis acid', 'lewis base', 'strong acid', 'weak acid', 'buffer', 'henderson hasselbalch', 'titration', 'indicator', 'conjugate acid', 'conjugate base', 'pka'],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `Acids and bases are among the oldest categories in chemistry, but a deeper look reveals three different theories, each more general than the last, plus a quantitative framework for measuring strength and a mechanism — the buffer — that life depends on.

### Three Theories
The Arrhenius theory, from the 1880s, defines acids as substances that release hydrogen ions in water and bases as substances that release hydroxide ions. Hydrochloric acid is an Arrhenius acid; sodium hydroxide is an Arrhenius base. This works well for water solutions but cannot explain ammonia, which is basic without containing hydroxide itself.

The Brønsted-Lowry theory, from 1923, broadens the picture: an acid is a proton (H+ ion) donor and a base is a proton acceptor. Ammonia is basic because it accepts a proton from water to form the ammonium ion. Every acid-base reaction becomes a transfer of a proton from one species to another, with the products forming a conjugate acid-base pair. Water can act as either acid or base depending on what it reacts with — it is amphiprotic.

Also in 1923, Gilbert Lewis proposed an even more general theory: an acid is an electron-pair acceptor and a base is an electron-pair donor. This includes the Brønsted-Lowry cases but also covers reactions with no proton transfer at all, such as the reaction of boron trifluoride with ammonia. Lewis theory underlies much of modern inorganic and organic chemistry, including catalysis and coordination compounds.

### Strong versus Weak
Strong acids and bases dissociate completely in water. The common strong acids are hydrochloric, nitric, sulfuric, perchloric, and the hydrohalic acids HBr and HI; the common strong bases are the hydroxides of group 1 and heavier group 2 metals. Weak acids and bases dissociate only partially, establishing an equilibrium described by the acid dissociation constant Ka (or pKa, its negative log). Acetic acid has a pKa of about 4.76, meaning a typical vinegar solution contains a mixture of acetic acid molecules and acetate ions. The smaller the pKa, the stronger the acid.

### Buffers and Titration
A buffer is a solution that resists pH change when small amounts of acid or base are added, made from a weak acid and its conjugate base (or a weak base and its conjugate acid). The Henderson-Hasselbalch equation gives its pH: pH equals pKa plus the log of the ratio of base to acid. Blood is buffered at about pH 7.4 by the carbonic acid / bicarbonate system; without this buffer, the carbon dioxide we produce would acidify our blood to lethal levels in minutes.

A titration measures the concentration of an unknown acid or base by slowly adding a known one until equivalence is reached. Plotting pH against added titrant gives a titration curve that rises steeply at the equivalence point, where an indicator changes colour. The shape of the curve, and the choice of indicator, depends on the strength of the acid and base involved.

### Why It Matters
Acid-base chemistry underlies digestion, blood chemistry, soil fertility, baking, fermentation, swimming-pool maintenance, and most industrial chemical processes. The choice of buffer can determine whether a protein folds correctly, whether a drug is absorbed, and whether a battery works. Understanding which theory to apply and how to calculate pH gives us control over a vast swathe of chemistry that we encounter every day.`,
  },

  // ----------------------------------------------------------------
  // 12. ELECTROCHEMISTRY — CELLS, BATTERIES, ELECTROLYSIS
  // ----------------------------------------------------------------
  {
    id: 'electrochemistry',
    patterns: [/\b(electrochemistry|galvanic cell|voltaic cell|electrolytic cell|electrolysis|standard reduction potential|emf series|battery|batteries|lithium ion|lead acid|faraday law|faradays law|corrosion|rusting|anode|cathode|salt bridge|electroplating)\b/i],
    keywords: ['electrochemistry', 'galvanic cell', 'voltaic cell', 'electrolytic cell', 'electrolysis', 'standard reduction potential', 'battery', 'lithium ion', 'lead acid', 'faraday law', 'corrosion', 'anode', 'cathode', 'electroplating'],
    intent: 'factual_question',
    topic: 'chemistry',
    response: () => `Electrochemistry is the study of the link between chemical reactions and electricity. Where ordinary redox reactions transfer electrons directly between reactants, electrochemistry separates the two half-reactions into different electrodes, forcing the electrons to travel through an external circuit where they can do useful work.

### Galvanic Cells
A galvanic (or voltaic) cell converts a spontaneous redox reaction into electrical energy. The classic example is the Daniell cell, which uses a zinc electrode in zinc sulfate and a copper electrode in copper sulfate, connected by a salt bridge. Zinc is more easily oxidised, so at the zinc anode it gives up electrons and dissolves as Zn2+ ions. The electrons flow through the external circuit to the copper cathode, where they reduce Cu2+ ions from solution onto the metal. The salt bridge allows ions to migrate and keeps the solutions electrically neutral.

The voltage of the cell depends on which half-reactions are involved. Standard reduction potentials, tabulated for many half-cells at standard conditions, let us predict the cell voltage: subtract the anode's reduction potential from the cathode's. The resulting electromotive force series (EMF series) ranks metals by their tendency to be oxidised, with the most reactive (lithium, potassium) at one end and the noble metals (gold, platinum) at the other.

### Electrolytic Cells
An electrolytic cell does the reverse: it uses an external power source to drive a non-spontaneous reaction. The industrial extraction of aluminium from bauxite, the electroplating of jewellery and cutlery, the recharging of any rechargeable battery, and the production of chlorine and sodium hydroxide from brine are all electrolytic processes. Faraday's laws of electrolysis quantify the relationship: the mass of substance produced at an electrode is proportional to the charge passed, and to the substance's equivalent weight.

### Batteries
A battery is one or more galvanic cells packaged for use. Primary batteries (alkaline, zinc-carbon) are single-use; once their reactants are consumed, the battery is dead. Secondary batteries are rechargeable because their reactions are reversible. The lead-acid battery, used in most cars for over a century, has electrodes of lead and lead dioxide in sulfuric acid. The nickel-cadmium and nickel-metal-hydride batteries powered early laptops and phones. The lithium-ion battery, developed commercially in the 1990s, dominates today because of its high energy density, low self-discharge, and long cycle life. Its invention was recognised with the 2019 Nobel Prize in Chemistry.

### Corrosion
Corrosion is an unwelcome electrochemical reaction — the slow oxidation of metals by their environment. Rusting of iron requires both oxygen and water and proceeds at a rate accelerated by salt and acid. Galvanising (coating iron with zinc) protects it because zinc is more easily oxidised, so it corrodes first. Cathodic protection, used on pipelines and ship hulls, connects the metal to be protected to a more reactive sacrificial metal that supplies electrons and keeps the protected metal reduced.

### Why It Matters
Electrochemistry powers the modern mobile world. Every smartphone, laptop, electric vehicle, and wearable device runs on a battery. The transition from fossil fuels to renewables depends on better batteries to store intermittent solar and wind energy. Electrochemical sensors monitor blood glucose in diabetics. Electroplating protects and beautifies countless metal objects. And the same principles that drive a battery drive corrosion, which costs the world economy trillions of dollars a year — money that good electrochemical engineering can save.`,
  },

  // ----------------------------------------------------------------
  // 13. FLUID MECHANICS — PRESSURE, BUOYANCY, BERNOULLI
  // ----------------------------------------------------------------
  {
    id: 'fluid-mechanics',
    patterns: [/\b(fluid mechanics|fluid dynamics|fluid statics|pressure|pascal principle|archimedes|buoyancy|buoyant force|bernoulli|bernoullis principle|viscosity|laminar flow|turbulent flow|reynolds number|continuity equation|aerodynamics|hydrostatics)\b/i],
    keywords: ['fluid mechanics', 'pressure', 'pascal principle', 'archimedes', 'buoyancy', 'bernoulli', 'viscosity', 'laminar flow', 'turbulent flow', 'reynolds number', 'continuity equation', 'aerodynamics'],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `Fluid mechanics is the physics of liquids and gases in motion and at rest. From the blood in our veins to the air around an aircraft wing, fluids obey a small set of principles that govern an enormous range of natural and engineered systems.

### Pressure and Pascal's Principle
Pressure is force per unit area, measured in pascals (one pascal is one newton per square metre). Because a fluid's weight creates pressure, pressure in a static fluid increases with depth: at depth h in a fluid of density rho, the pressure exceeds the surface pressure by rho times g times h. This is why the pressure at the bottom of the ocean is enormous and why our ears pop when we dive into a deep pool. Pascal's principle states that pressure applied to an enclosed fluid is transmitted undiminished to every part of the fluid — the basis of hydraulic systems. A small force on a small piston can lift a heavy car on a large piston because the pressure is the same throughout the fluid.

### Buoyancy and Archimedes
Archimedes, in the third century BCE, discovered that any object immersed in a fluid experiences an upward buoyant force equal to the weight of the fluid it displaces. If the object's weight is less than the displaced fluid's weight, it floats; if more, it sinks. Steel is denser than water, but a steel ship floats because its hull shape displaces a volume of water whose weight exceeds the ship's weight. Submarines adjust their buoyancy by filling or emptying ballast tanks with water or air.

### Bernoulli's Principle
For a fluid in motion, Bernoulli's principle states that where the fluid's speed is higher, its pressure is lower. This follows from conservation of energy along a streamline: kinetic, potential, and pressure energy together remain constant. The principle explains why a shower curtain sucks inward when the water runs, why a spinning baseball curves, and (in part) why an aircraft wing generates lift: air moves faster over the curved top of the wing, reducing pressure there, and the higher pressure below pushes the wing up. Engineers combine Bernoulli's principle with the continuity equation — which says that mass flow is conserved, so a fluid speeds up when a pipe narrows — to design everything from carburettors to wind tunnels.

### Viscosity, Laminar and Turbulent Flow
Viscosity is a fluid's resistance to flow — honey is more viscous than water. At low speeds, fluid flows in smooth parallel layers, called laminar flow. At higher speeds, the flow breaks up into chaotic swirls and eddies, called turbulent flow. The Reynolds number, a dimensionless ratio of inertial to viscous forces, predicts which regime a flow will be in: low Reynolds number means laminar, high means turbulent. Turbulence dramatically increases drag and mixing, which is why a smooth golf ball flies farther than a rough one (counterintuitively, dimples trip the boundary layer into turbulence that delays separation and reduces drag) and why piping systems are designed to stay laminar where possible.

### Why It Matters
Fluid mechanics shapes our physical world and our technology. Aerodynamics determines the fuel economy of cars and the lift of aircraft. Hydrodynamics governs ship design and submarine stealth. Blood flow in arteries is a fluid-mechanical problem; when plaque narrows an artery, Bernoulli's principle means the blood speeds up and the wall pressure drops, sometimes enough to cause collapse. Weather prediction, water supply, oil pipelines, and air conditioning all rely on fluid mechanics. It is one of the few branches of physics whose equations — the Navier-Stokes equations — remain unsolved in general, a problem so important that the Clay Mathematics Institute offers a million-dollar prize for a solution.`,
  },

  // ----------------------------------------------------------------
  // 14. OPTICS — REFRACTION, LENSES, TOTAL INTERNAL REFLECTION
  // ----------------------------------------------------------------
  {
    id: 'optics-deep',
    patterns: [/\b(refraction|refract|snells law|snell|lens|lenses|convex lens|concave lens|focal length|total internal reflection|fibre optic|fiber optic|dispersion|chromatic aberration|thin lens equation|magnification|optical density|critical angle)\b/i],
    keywords: ['refraction', 'snells law', 'lens', 'convex', 'concave', 'focal length', 'total internal reflection', 'fibre optic', 'dispersion', 'chromatic aberration', 'thin lens equation', 'magnification', 'critical angle'],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `Optics is the study of light and its interactions with matter. Beyond simple reflection in a mirror, the deeper theory explains why a straw appears to bend in a glass of water, how a lens focuses an image, and how a single glass fibre can carry millions of phone calls across an ocean.

### Reflection and Refraction
When light meets a surface, part of it reflects and part enters the new medium. Reflection follows the law that the angle of incidence equals the angle of reflection, both measured from the normal (the line perpendicular to the surface). Refraction — the bending of light as it crosses into a new medium — follows Snell's law: the ratio of the sines of the incident and refracted angles equals the ratio of the speeds of light in the two media, a ratio called the refractive index. Light slows when entering a denser medium like glass or water, so it bends toward the normal. This is why a straw in a glass of water looks broken at the surface.

### Lenses and the Thin Lens Equation
A lens uses refraction to focus or spread light. A converging (convex) lens is thicker in the middle and brings parallel rays to a focus at a distance called the focal length. A diverging (concave) lens is thinner in the middle and spreads parallel rays as if they came from a virtual focus. The thin lens equation relates focal length f, object distance u, and image distance v: one over f equals one over u plus one over v. Magnification is the ratio of image height to object height, equal to minus v over u. By combining these equations we can predict where a lens will form an image and whether it will be real or virtual, upright or inverted, enlarged or reduced.

Cameras, microscopes, telescopes, and the human eye itself are all lens systems governed by these equations. The eye focuses light by changing the curvature of its lens; when this fails (nearsightedness, farsightedness), corrective lenses restore a sharp image on the retina.

### Total Internal Reflection and Fibre Optics
When light travels from a denser medium to a less dense one (say, glass to air), there is a critical angle of incidence beyond which no light escapes — it reflects entirely back into the denser medium. This is total internal reflection, and it is the principle behind fibre optics. An optical fibre is a thin glass strand with a high-index core and a lower-index cladding; once light enters the core at a shallow enough angle, it bounces along by total internal reflection and emerges at the other end with very little loss. A single fibre thinner than a human hair can carry terabits of data per second. The entire modern internet — transoceanic cables, neighbourhood broadband, endoscope imaging in medicine — runs on this one piece of physics.

### Dispersion and Aberration
The refractive index of a material varies slightly with wavelength, so different colours of light bend by slightly different amounts. This is dispersion — the phenomenon that splits white light into a rainbow through a prism. The same effect causes chromatic aberration in lenses, where different colours focus at slightly different points, producing colour fringes. Lens designers use achromatic doublets (two lenses of different glass cemented together) to cancel the effect. The rainbow itself is a natural dispersion event: sunlight refracts into spherical raindrops, reflects off the inside surface, and refracts again on the way out, separating into colours.

### Why It Matters
Optics underlies vision, photography, microscopy, astronomy, telecommunications, laser surgery, and a vast range of sensors. The lens in your eye, the camera in your phone, the microscope that revealed cells, the telescope that found galaxies, the endoscope used in surgery, and the fibre-optic backbone of the internet all run on the same handful of principles. Mastering optics is mastering how humanity sees the world — and how we send what we see across it.`,
  },

  // ----------------------------------------------------------------
  // 15. SOUND AND ACOUSTICS — DOPPLER, RESONANCE, HARMONICS
  // ----------------------------------------------------------------
  {
    id: 'sound-acoustics-deep',
    patterns: [/\b(acoustics|speed of sound|doppler effect|doppler|resonance|harmonics|overtone|overtones|fundamental frequency|ultrasound|infrasound|beats|pitch|amplitude|decibel|sonar|echo)\b/i],
    keywords: ['acoustics', 'speed of sound', 'doppler effect', 'resonance', 'harmonics', 'overtone', 'fundamental frequency', 'ultrasound', 'infrasound', 'beats', 'pitch', 'decibel', 'sonar'],
    intent: 'factual_question',
    topic: 'physics',
    response: () => `Sound is a mechanical wave — a travelling pressure disturbance that requires a medium. Unlike light, sound cannot travel through a vacuum, which is why the long-held idea that "in space, no one can hear you scream" is literally correct. The deeper study of sound, called acoustics, explains how musical instruments work, how bats and submarines navigate, and how medical imaging sees inside the body.

### Wave Properties
A sound wave is characterised by its frequency (the number of pressure cycles per second, measured in hertz), its wavelength (the distance between successive compressions), its amplitude (the size of the pressure variation, related to loudness), and its speed. These are linked by the universal wave relation: speed equals frequency times wavelength. Human hearing spans roughly 20 hertz to 20,000 hertz; below 20 hertz lies infrasound (produced by earthquakes, elephants, and large machinery) and above 20 kilohertz lies ultrasound (used by bats, dolphins, and medical scanners).

The speed of sound depends on the medium. In air at room temperature it is about 343 metres per second; in water it is roughly 1,500 metres per second; in steel it exceeds 5,000 metres per second. Sound travels faster in stiff, dense media because the restoring force between particles is stronger. The speed also rises with temperature in gases, because faster-moving molecules transmit disturbances more quickly.

### The Doppler Effect
When a sound source and a listener move relative to each other, the frequency the listener hears is shifted. As a source approaches, each successive wave is emitted from a closer position, so the waves bunch up and the listener hears a higher pitch. As the source recedes, the waves spread out and the pitch drops. This is the Doppler effect, named after Christian Doppler, who described it in 1842. The effect is most familiar from the wail of an ambulance siren as it passes: the pitch is high as it approaches and drops sharply as it speeds away. Astronomers use the same principle with light to measure the motion of stars and galaxies — the cosmic redshift that revealed the expanding universe is a Doppler effect for light.

### Resonance and Harmonics
Every object that can vibrate has natural frequencies at which it oscillates most easily. When a periodic force matches one of these natural frequencies, the amplitude of vibration grows dramatically — this is resonance. A singer can shatter a wine glass by singing its resonant frequency; the Tacoma Narrows Bridge collapsed in 1940 when wind excited one of its torsional resonances. A string fixed at both ends vibrates at a fundamental frequency and a series of higher frequencies called harmonics or overtones, which are integer multiples of the fundamental. The combination of fundamental and harmonics gives each musical instrument its characteristic timbre — the reason a violin and a flute playing the same note sound completely different.

### Beats and Ultrasound
When two sound waves of slightly different frequencies are played together, they interfere to produce a slow pulsing called beats, at a beat frequency equal to the difference of the two frequencies. Piano tuners use beats to tune strings: when the beats disappear, the strings are in tune. Ultrasound, at frequencies above human hearing, has many applications. Medical ultrasound scans the body with pulses of high-frequency sound, reading the echoes to build images of unborn babies, hearts, and internal organs without using ionising radiation. Sonar uses the same idea underwater to map the sea floor and detect submarines. Bats and dolphins evolved echolocation, emitting ultrasound pulses and reading the echoes to hunt in total darkness.

### Why It Matters
Acoustics is everywhere we hear and many places we cannot. Musical instruments and concert halls are exercises in controlled resonance. Noise-cancelling headphones use destructive interference to silence background sound. Ultrasound diagnoses disease and inspects welds for hidden cracks. Seismic waves — sound waves in rock — reveal the structure of Earth's interior and the location of oil deposits. And the same wave mathematics that describes sound describes ocean waves, light, and quantum particles, making acoustics one of the most universally applicable branches of physics.`,
  },
]
