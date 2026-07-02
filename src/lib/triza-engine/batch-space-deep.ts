/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — SPACE & ASTRONOMY DEEP DIVE (Batch 2d-deep)
 * ============================================================
 *
 *  Deeper subtopics in astronomy and space science: stellar
 *  evolution by mass, spectral classification, exoplanets,
 *  dark matter and dark energy, neutron stars and pulsars,
 *  quasars and active galactic nuclei, the cosmic microwave
 *  background in detail, asteroids and comets and meteors,
 *  deep space missions, planetary atmospheres, large-scale
 *  structure of the universe, and the origin of the elements.
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

export const SPACE_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. STELLAR EVOLUTION BY MASS
  // ----------------------------------------------------------------
  {
    id: 'space-stellar-evolution-deep',
    patterns: [/\b(stellar evolution|life cycle of a star|star life cycle|stellar lifecycle|protostar|red giant|red supergiant|planetary nebula|supernova|supernovae|hypernova|tara ka dor|star formation stages)\b/i],
    keywords: ['stellar evolution', 'life cycle', 'protostar', 'red giant', 'red supergiant', 'planetary nebula', 'supernova', 'hypernova', 'white dwarf', 'stellar collapse'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `A star's life is a long battle between gravity, which wants to crush it, and nuclear fusion, which pushes back. The mass a star is born with decides how the battle ends. Stars span an enormous range, from less than a tenth the mass of the Sun to more than a hundred times it, and their life stories are radically different.

### Protostar — The Common Beginning
Every star begins as a dense clump inside a cold cloud of gas and dust. Gravity pulls more material in, the clump heats up, and a spinning disk forms around it. When the core temperature reaches about ten million degrees, hydrogen fusion ignites. The protostar becomes a true star, and the leftover disk may go on to form planets. This stage lasts from a few hundred thousand to a few million years.

### Low-Mass Stars — Red Dwarfs
Stars below about half the Sun's mass are called red dwarfs. They are small, cool, dim, and extremely frugal with their fuel. Their interiors mix completely, so they burn almost all their hydrogen before leaving the main sequence. A red dwarf's life span is measured in trillions of years — far longer than the current age of the universe, so no red dwarf has ever died of old age. They will end as small white dwarfs after a long, slow blue phase that no human has ever witnessed.

### Sun-Like Stars — The Middle Path
Stars between roughly half and eight solar masses follow the path the Sun will take. They spend about ten billion years on the main sequence fusing hydrogen into helium. When core hydrogen runs out, the core contracts and the outer layers swell and cool — the star becomes a red giant, large enough to swallow inner planets. Eventually the core gets hot enough to fuse helium into carbon and oxygen. The star pulses, sheds its outer layers into a beautiful glowing shell called a planetary nebula, and leaves behind a hot, dense core: a white dwarf, about the size of Earth but with the mass of a star, which will slowly cool for eternity.

### Massive Stars — Supernovae and Aftermaths
Stars above about eight solar masses live fast and die violently. They fuse hydrogen, then helium, then carbon, neon, oxygen, and silicon, building layers like an onion. The chain ends at iron, whose fusion absorbs energy rather than releasing it. With no more fuel, the core collapses in a fraction of a second, forming a neutron star or — for the most massive stars — a black hole. The outer layers rebound in a titanic explosion called a Type II supernova, briefly outshining an entire galaxy and seeding space with heavy elements. The most extreme cases produce hypernovae and long gamma-ray bursts, the brightest electromagnetic events known.

### Why It Matters
Stellar evolution is the story of how the universe became complex. The first stars contained only hydrogen and helium. Every heavier element — the carbon in your cells, the oxygen you breathe, the iron in your blood, the gold in your jewelry — was forged inside stars and released into space when they died. You are, quite literally, recycled star dust. Understanding stellar life cycles is understanding the origin of everything you are made of.`,
  },

  // ----------------------------------------------------------------
  // 2. STELLAR CLASSIFICATION — SPECTRAL TYPES AND THE HR DIAGRAM
  // ----------------------------------------------------------------
  {
    id: 'space-stellar-classification',
    patterns: [/\b(spectral type|spectral classification|o b a f g k m|hertzsprung russell|hr diagram|luminosity class|main sequence star|stellar classification|tara ki qisam|oh be a fine girl)\b/i],
    keywords: ['spectral type', 'spectral classification', 'hertzsprung russell', 'hr diagram', 'luminosity class', 'main sequence', 'super giant', 'white dwarf'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `When astronomers classify stars, they sort them by two properties that together tell almost the whole story: surface temperature and intrinsic brightness. The system they use is one of the great organizing achievements of 20th-century astronomy, and the diagram that plots these two properties is arguably the most informative single picture in all of stellar physics.

### Spectral Types — O B A F G K M
In the late 1800s, astronomers at Harvard Observatory sorted the spectra of thousands of stars by the strength of their hydrogen absorption lines. The original alphabet ran from A to Q, but it turned out the real underlying variable was temperature. Reordered by temperature, the useful sequence is O, B, A, F, G, K, M — hottest to coolest. The classic mnemonic is "Oh Be A Fine Girl/Guy, Kiss Me." O stars are blue-hot, above 30,000 Kelvin. M stars are red-cool, below 3,500 Kelvin. The Sun is a G star, around 5,800 Kelvin at its surface. Each letter is subdivided into ten digits, so the Sun is officially a G2 star. Annie Jump Cannon, working at Harvard from 1896 onward, personally classified hundreds of thousands of stars and built much of this system.

### The Hertzsprung-Russell Diagram
Around 1911 to 1913, Ejnar Hertzsprung and Henry Norris Russell independently had the same idea: plot stars on a graph with temperature (or color) on one axis and luminosity on the other. The result is the Hertzsprung-Russell, or H-R, diagram, and it revealed something stunning. Stars do not scatter randomly across this graph; they clump into distinct bands. About 90 percent of stars lie along a diagonal strip running from hot-bright to cool-dim — the main sequence, where stars spend most of their lives fusing hydrogen. Above the main sequence are the red giants and supergiants — cool but enormously bright because they are huge. Below it are the white dwarfs — hot but faint because they are tiny.

### Luminosity Classes
Spectral type alone gives temperature, not size. To pin down where a star sits on the H-R diagram, astronomers add a luminosity class, written in Roman numerals. Class I are supergiants, II bright giants, III normal giants, IV subgiants, and V main-sequence stars (sometimes called dwarfs). The Sun's full classification is G2V — a main-sequence star of moderate temperature. A giant and a dwarf can share the same spectral type but differ in radius by a factor of a hundred, with luminosity differing by a factor of ten thousand.

### Why It Matters
Once you know a star's spectral type and luminosity class, you can read off its mass, its radius, its age, and how long it has left to live — all from a single spectrum. The H-R diagram turned stellar astronomy from a catalog of individual objects into a unified science of stellar populations. It is the tool that lets us look at a star thousands of light-years away and confidently say what it is, how it works, and what its fate will be.`,
  },

  // ----------------------------------------------------------------
  // 3. EXOPLANETS — PLANETS BEYOND THE SOLAR SYSTEM
  // ----------------------------------------------------------------
  {
    id: 'space-exoplanets',
    patterns: [/\b(exoplanet|exoplanets|extrasolar planet|transit method|radial velocity|habitable zone|goldilocks zone|kepler mission|trappist|kepler-452b|proxima b|hot jupiter|super earth)\b/i],
    keywords: ['exoplanet', 'extrasolar', 'transit', 'radial velocity', 'habitable zone', 'goldilocks', 'kepler', 'trappist', 'hot jupiter', 'super earth'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `For most of human history, we knew of exactly one planetary system — our own. The idea that other stars might host planets was old, but proving it was extraordinarily difficult. That changed in the 1990s, and the pace of discovery since has been one of the great revolutions in modern astronomy. We now know of more than 5,500 confirmed exoplanets, with thousands more candidates waiting for confirmation.

### How We Find Them
Direct imaging is hard because planets are tiny and dim next to their stars, so most are found indirectly. The radial velocity method measures the tiny wobble a planet induces in its star as both orbit their common center of mass. The first exoplanet around a Sun-like star, 51 Pegasi b, was found this way in 1995 by Michel Mayor and Didier Queloz — work that won the 2019 Nobel Prize in Physics. The transit method watches for the slight dip in a star's brightness when a planet crosses in front of it. Most of the exoplanets we know today were discovered this way, especially by the Kepler space telescope. A third method, gravitational microlensing, can find planets thousands of light-years away by watching how a star's gravity briefly magnifies the light of a background star.

### Varieties of Exoplanets
The first discoveries surprised everyone. Many were "hot Jupiters" — gas giants orbiting closer to their stars than Mercury does to the Sun, a configuration impossible in our solar system. We have since found a rich zoo: super-Earths (rocky planets two to ten times Earth's mass, the most common type in the galaxy), mini-Neptunes, lava planets, ocean worlds, and even rogue planets drifting alone with no star at all.

### The Habitable Zone
The habitable zone, sometimes called the Goldilocks zone, is the orbital region around a star where a planet could have liquid water on its surface — not too hot, not too cold. For the Sun it roughly spans the orbits of Venus to Mars. For a cooler red dwarf, the habitable zone sits much closer in. A planet in the zone is not automatically habitable; Venus and Mars are both technically in the Sun's zone, but neither is friendly to life as we know it. Still, the habitable zone is the best starting filter we have for narrowing thousands of candidates down to the few dozen worth detailed study.

### Notable Discoveries
The TRAPPIST-1 system, announced in 2017, contains seven Earth-sized planets orbiting a single ultra-cool red dwarf 40 light-years away — three of them in the habitable zone. Proxima Centauri b, the closest known exoplanet at just over 4 light-years, orbits in its star's habitable zone. Kepler-452b, nicknamed Earth's older cousin, is a super-Earth in a near-Earth orbit around a Sun-like star 1,400 light-years away.

### Why It Matters
The discovery of thousands of exoplanets has answered one of humanity's oldest questions — are planets common? — with a resounding yes. The new question, far harder, is whether any of them host life. The next generation of telescopes, especially JWST and the upcoming Extremely Large Telescopes, will be able to study exoplanet atmospheres for signs of water, oxygen, methane, and other potential biosignatures. We may be living through the decades that finally answer whether we are alone.`,
  },

  // ----------------------------------------------------------------
  // 4. DARK MATTER AND DARK ENERGY
  // ----------------------------------------------------------------
  {
    id: 'space-dark-matter-energy',
    patterns: [/\b(dark matter|dark energy|vera rubin|galaxy rotation curve|rotation curves|wimp|wimps|axion|modified gravity|mond|cosmological constant|lambda-cdm|taria madah|dark universe)\b/i],
    keywords: ['dark matter', 'dark energy', 'vera rubin', 'rotation curve', 'wimp', 'axion', 'mond', 'cosmological constant', 'lambda-cdm', 'dark universe'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `When astronomers add up everything they can see in the universe — every star, planet, gas cloud, and dust grain — they reach only about five percent of what must be there. The remaining 95 percent is invisible and undetectable except through its gravitational effects. We have split it into two profoundly mysterious components: dark matter and dark energy. Together they are the biggest unsolved puzzle in cosmology.

### Dark Matter — The Invisible Scaffolding
The first strong evidence came in the 1970s from the astronomer Vera Rubin. She measured how fast stars and gas orbit within galaxies. According to Newton's law of gravity, stars far from the bright center should orbit much more slowly, just as distant planets orbit the Sun more slowly than Mercury does. Rubin found that they do not — the orbital speed stays roughly constant out to the edge of the visible galaxy, and even beyond. The only explanation is that galaxies are embedded in a huge halo of unseen mass, roughly five to ten times more massive than the visible stars and gas. Without it, galaxies would fly apart. We call this mass dark matter. Further evidence comes from galaxy cluster dynamics, gravitational lensing of distant galaxies by foreground mass, and the cosmic microwave background. Dark matter does not emit, absorb, or reflect light — it interacts only through gravity, and possibly the weak nuclear force.

### What Is Dark Matter?
We do not know. The leading candidates are WIMPs (Weakly Interacting Massive Particles), hypothetical particles predicted by several extensions of the Standard Model of particle physics, and axions, extremely light particles proposed to solve a different problem in quantum chromodynamics. Decades of direct detection experiments deep underground have produced no confirmed signal. Some physicists favor alternatives like Modified Newtonian Dynamics (MOND), which would change the laws of gravity rather than add invisible matter. But MOND struggles to explain the cosmic microwave background and the structure of galaxy clusters, while dark matter explains all of it coherently. The case for dark matter is strong, but its identity remains unknown.

### Dark Energy — The Accelerating Expansion
In 1998, two independent teams studying distant Type Ia supernovae discovered something shocking: the expansion of the universe is not slowing down, as gravity should cause, but speeding up. Some unknown form of energy, dubbed dark energy, is pushing space itself apart. Dark energy makes up about 68 percent of the total energy of the universe, dark matter about 27 percent, and ordinary matter the remaining 5 percent. The simplest model treats dark energy as a cosmological constant — the energy of empty space itself — but its measured density is many orders of magnitude smaller than quantum field theory predicts, a mismatch called the worst prediction in physics.

### The Lambda-CDM Model
The current standard cosmological model is called Lambda-CDM: a cosmological constant Lambda for dark energy, plus Cold Dark Matter. It reproduces the observed cosmic microwave background, the distribution of galaxies, the abundance of light elements, and the accelerating expansion. It is also a model in which 95 percent of the universe is stuff we cannot directly identify.

### Why It Matters
Dark matter and dark energy are the frontiers of fundamental physics. Solving them could open entirely new branches of particle physics, rewrite general relativity, or reveal a deeper theory of space and time. They also determine the ultimate fate of the universe. If dark energy stays constant, the cosmos will expand forever, growing colder and emptier until every galaxy is isolated. We are fortunate to live in a moment when the universe is still rich, visible, and knowable.`,
  },

  // ----------------------------------------------------------------
  // 5. NEUTRON STARS AND PULSARS
  // ----------------------------------------------------------------
  {
    id: 'space-neutron-stars-pulsars',
    patterns: [/\b(neutron star|pulsar|pulsars|magnetar|jocelyn bell|bell burnell|gw170817|neutron star merger|crab pulsar|parkes observatory|kilonova)\b/i],
    keywords: ['neutron star', 'pulsar', 'magnetar', 'jocelyn bell', 'kilonova', 'gw170817', 'crab pulsar', 'neutron star merger'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `When a massive star ends its life in a supernova, the collapsing core may become one of the strangest objects in the universe: a neutron star. A neutron star packs the mass of one or two Suns into a sphere only about 20 kilometers across — the size of a city. It is so dense that a single sugar-cube-sized chunk would weigh about a billion tons on Earth. Matter at this density behaves in ways we cannot reproduce in any laboratory.

### Formation
A neutron star forms when the collapsing core of a dead massive star is compressed so hard that electrons and protons fuse into neutrons. If the core is between about 1.4 and 3 solar masses, neutron pressure halts the collapse. Above that limit, nothing can stop it, and a black hole forms instead. There are likely hundreds of millions of neutron stars in the Milky Way, but most are old, cold, and invisible. We detect them mainly when they are young, hot, or doing something dramatic.

### Pulsars — Cosmic Lighthouses
In 1967, a graduate student named Jocelyn Bell Burnell, working with radio telescopes in Cambridge, noticed a radio signal pulsing with extreme regularity — exactly once every 1.337 seconds. The signal was so precise that the team half-jokingly considered whether it might be an alien beacon, and they labeled the source LGM-1, for Little Green Men. The truth was just as startling: a rotating neutron star beaming radiation out of its magnetic poles. As the star spins, the beam sweeps across space like a lighthouse, and if Earth happens to be in its path, we see a pulse. These objects were named pulsars. Bell Burnell's supervisor Antony Hewish shared the 1974 Nobel Prize for the discovery; many scientists felt Bell herself should have been included.

### Magnetars — The Most Magnetic Objects Known
Some neutron stars have magnetic fields a thousand times stronger than ordinary pulsars — a quadrillion times stronger than Earth's. These are magnetars, the most magnetic objects in the known universe. Their fields are so intense that they can distort atoms, crack the star's crust in starquakes, and power brilliant flashes of X-rays and gamma rays. The most famous, SGR 1806-20, produced a flare in 2004 that was briefly brighter than the full Moon in gamma rays despite being 50,000 light-years away.

### Binary Neutron Star Mergers
On August 17, 2017, LIGO and Virgo detected gravitational waves from a neutron star merger 130 million light-years away, an event labeled GW170817. Within seconds, telescopes around the world and in space detected the resulting explosion, a kilonova, across the electromagnetic spectrum. This single event confirmed several predictions at once: that neutron star mergers produce gravitational waves, that they create short gamma-ray bursts, and that the heavier elements in the universe — gold, platinum, uranium — are forged in these catastrophic collisions. The ring on your finger may be debris from a neutron star merger billions of years ago.

### Why It Matters
Neutron stars are natural laboratories for physics at extremes we cannot recreate. They test general relativity, nuclear physics, plasma physics, and electromagnetism all at once. Pulsars are so regular they can be used as cosmic clocks, and arrays of pulsars are now being used to detect gravitational waves from supermassive black hole mergers. Every neutron star we study stretches our understanding of matter to its limits.`,
  },

  // ----------------------------------------------------------------
  // 6. QUASARS AND ACTIVE GALACTIC NUCLEI
  // ----------------------------------------------------------------
  {
    id: 'space-quasars-agn',
    patterns: [/\b(quasar|quasars|active galactic nucleus|agn|blazar|seyfert galaxy|radio galaxy|relativistic jet|accretion disk|3c 273|quasi stellar)\b/i],
    keywords: ['quasar', 'agn', 'active galactic nucleus', 'blazar', 'seyfert', 'radio galaxy', 'relativistic jet', 'accretion disk', '3c 273'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `In the 1950s and 1960s, astronomers discovered objects that looked like stars in photographs but were powerful sources of radio emission. When they finally measured their distances in 1963, the result was almost unbelievable: these "quasi-stellar radio sources," or quasars, were not stars at all but the most distant and luminous objects ever found. Today we know that quasars are a sign of something violent happening at the very center of a galaxy — a supermassive black hole devouring matter at a furious rate.

### The Engine — Accretion Disks Around Black Holes
Nearly every large galaxy has a supermassive black hole at its center, ranging from millions to tens of billions of solar masses. Most of the time these black holes sit quietly. But when gas, dust, or even whole stars wander too close, they fall into orbit around the black hole and form a swirling, flattened structure called an accretion disk. As material spirals inward, friction heats it to millions of degrees, causing it to radiate enormous amounts of energy across the spectrum — visible light, ultraviolet, X-rays. A modest amount of inflowing matter can outshine the entire rest of the galaxy. When this happens, the galaxy is said to host an Active Galactic Nucleus, or AGN.

### Quasars — The Brightest AGN
Quasars are the most luminous subclass of AGN. A single quasar can be thousands of times brighter than an entire galaxy of a hundred billion stars, and they are seen across most of the observable universe. The first identified quasar, 3C 273, lies about 2.4 billion light-years away and is still the brightest quasar in our sky. The most distant known quasars are seen as they were less than a billion years after the Big Bang, telling us that supermassive black holes existed and grew extremely rapidly in the early universe — a puzzle that theorists are still working to explain.

### Jets and Blazars
Many AGN fire out twin jets of plasma moving at nearly the speed of light, perpendicular to the accretion disk. These relativistic jets can stretch hundreds of thousands of light-years into intergalactic space, far larger than the host galaxy itself. When a jet happens to point almost directly at Earth, the AGN appears anomalously bright because of relativistic beaming. Such objects are called blazars, and they are the most variable AGN, sometimes changing brightness by a factor of two in a single night.

### A Unified Picture
AGN appear in many forms — type 1 and type 2 Seyfert galaxies, radio galaxies, quasars, blazars, LINERs — but astronomers now believe most are the same basic engine seen from different angles and at different luminosities. The differences come largely from how much dust obscures our view of the central engine and how the jets are oriented relative to us. This unified model was one of the great syntheses of late-20th-century astrophysics.

### Why It Matters
Quasars are beacons from the young universe. Because they are so bright, they can be seen across cosmic time and used to probe the gas between galaxies along the line of sight, mapping the cosmic web in remarkable detail. They also mark the growth of supermassive black holes, which are tightly linked to the evolution of their host galaxies — the mass of a galaxy's central black hole correlates closely with the mass of its central bulge, suggesting they grew together. Understanding AGN is essential to understanding how galaxies, including our own Milky Way, came to be the way they are.`,
  },

  // ----------------------------------------------------------------
  // 7. COSMIC MICROWAVE BACKGROUND IN DEPTH
  // ----------------------------------------------------------------
  {
    id: 'space-cmb-deep',
    patterns: [/\b(cosmic microwave background|cmb anisotropy|cobe|wmap|planck mission|b-mode polarization|acoustic peaks|cmb temperature|recombination epoch|surface of last scattering)\b/i],
    keywords: ['cosmic microwave background', 'cmb', 'cobe', 'wmap', 'planck', 'anisotropy', 'b-mode', 'acoustic peaks', 'recombination'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `The cosmic microwave background, or CMB, is the oldest light in the universe — the afterglow of the hot Big Bang, cooled and stretched over 13.8 billion years into a faint microwave glow that fills all of space. It was discovered accidentally in 1964 by Arno Penzias and Robert Wilson, who at first thought their antenna was picking up noise from pigeon droppings. That discovery confirmed the Big Bang model and earned them the 1978 Nobel Prize. But the real revolution came later, when astronomers began to study the CMB's tiny temperature variations in exquisite detail.

### Recombination — When Light Got Free
For the first 380,000 years after the Big Bang, the universe was so hot that electrons and protons could not combine into atoms. Space was filled with a glowing fog of free electrons that scattered photons constantly — light could not travel freely. When the universe cooled to about 3,000 Kelvin, electrons finally combined with nuclei in an event called recombination. The fog cleared, and the photons that had been trapped streamed off in every direction. That same light, stretched by the expansion of the universe from visible orange to a faint microwave hiss, is the CMB we detect today. It comes from what astronomers call the surface of last scattering, a spherical shell surrounding us at the edge of the observable universe.

### The COBE, WMAP, and Planck Missions
To the earliest detectors, the CMB looked perfectly uniform — the same temperature of about 2.725 Kelvin in every direction. But theory predicted tiny variations, the seeds of all cosmic structure. In 1992, the COBE satellite found them: temperature differences of about one part in 100,000 across the sky. COBE leaders John Mather and George Smoot won the 2006 Nobel Prize. The WMAP satellite, launched in 2001, mapped these anisotropies far more sharply and pinned down the age, geometry, and composition of the universe with unprecedented precision. The European Space Agency's Planck mission, launched in 2009, refined the picture further still, confirming that the universe is flat to high precision, that it is 13.8 billion years old, and that dark energy, dark matter, and ordinary matter make up about 68, 27, and 5 percent respectively.

### Acoustic Peaks and What They Reveal
The CMB temperature map is not random noise. It has structure — a characteristic pattern of hot and cold spots of particular sizes. This pattern comes from sound waves that ran through the early plasma, compressing and rarefying matter in what physicists call baryon acoustic oscillations. The angular size of the largest peak tells us the geometry of space; the relative heights of subsequent peaks tell us the density of ordinary matter, dark matter, and dark energy. From a single map of the microwave sky, we can read off the contents, age, and shape of the entire cosmos.

### Polarization and B-Modes
The CMB is also polarized, and the pattern of that polarization carries even more information. One component, called E-mode polarization, comes from density fluctuations and is well measured. A fainter component called B-mode polarization could in principle come from gravitational waves produced during cosmic inflation a tiny fraction of a second after the Big Bang. A claimed detection in 2014 by the BICEP2 experiment turned out to be largely dust in our own galaxy, but the search continues. A confirmed primordial B-mode signal would be the first direct evidence of inflation and would probe physics at energies far beyond any particle accelerator.

### Why It Matters
The CMB is a baby picture of the universe, taken when it was just 380,000 years old. Its tiny ripples are the seeds of every galaxy, star, planet, and person alive today. By studying it, cosmology has turned from a speculative science into a precision science, with measurements agreeing with theory to several decimal places. The CMB is also our best hope of glimpsing what happened in the first tiny fraction of a second after the Big Bang — a window onto physics at energies we may never reach any other way.`,
  },

  // ----------------------------------------------------------------
  // 8. ASTEROIDS, COMETS, AND METEORS IN DETAIL
  // ----------------------------------------------------------------
  {
    id: 'space-asteroids-comets-meteors-deep',
    patterns: [/\b(meteor|meteorite|meteoroid|meteor shower|near earth object|near-earth object|neo|halley's comet|hale-bopp|neowise|carbonaceous asteroid|ceres|vesta|shahab-e-saqib)\b/i],
    keywords: ['meteor', 'meteorite', 'meteoroid', 'meteor shower', 'near earth object', 'halley', 'hale-bopp', 'neowise', 'carbonaceous', 'ceres', 'vesta'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `Beyond the eight major planets, the solar system is filled with smaller bodies left over from its formation — asteroids, comets, and the rocky fragments we call meteors. Though often confused in everyday speech, these are physically different objects with different origins, and studying them is studying the raw material that built the planets 4.6 billion years ago.

### Asteroids — Rocky Leftovers
Asteroids are rocky or metallic bodies, mostly irregular in shape, ranging from pebbles to objects hundreds of kilometers across. Most orbit in the asteroid belt between Mars and Jupiter, but there are significant populations elsewhere, including the Trojan asteroids that share Jupiter's orbit and the near-Earth asteroids that cross our path. The largest belt object, Ceres, is classified as a dwarf planet at about 950 kilometers across. Vesta, the second largest, was visited by the Dawn spacecraft in 2011. Asteroids are classified by composition: C-type (carbonaceous, dark, common in the outer belt), S-type (silicaceous or stony, brighter, common in the inner belt), and M-type (metallic, thought to be fragments of shattered metallic cores of larger bodies).

### Comets — Icy Visitors from the Cold
Comets are made of ice, dust, and rock — often described as dirty snowballs. They spend most of their lives in two vast reservoirs: the Kuiper Belt beyond Neptune and the far more distant Oort Cloud. When gravitational perturbations send one falling toward the Sun, solar heat vaporizes its ices, releasing gas and dust. The solid body, the nucleus, is typically only a few kilometers across. Around it forms a glowing coma of gas and dust up to a million kilometers wide. Two tails form and always point away from the Sun: a curved dust tail shining by reflected sunlight, and a straight blue ion tail pushed straight out by the solar wind. Halley's Comet, the most famous, returns every 76 years and is next due in 2061. Hale-Bopp, the great comet of 1997, and NEOWISE in 2020 are recent bright visitors.

### The Difference Between Meteor, Meteoroid, and Meteorite
These three words describe one object at different stages. A meteoroid is a small rocky or metallic body drifting through space, smaller than an asteroid. When it enters Earth's atmosphere and burns up, the streak of light it produces is a meteor — what most people call a shooting star. If part of the object survives to hit the ground, that surviving fragment is a meteorite. Most meteorites are pieces of asteroids, but a few rare ones come from the Moon or Mars, blasted off by ancient impacts.

### Meteor Showers
When Earth passes through the debris stream left behind by a comet, we see a meteor shower — many meteors radiating from a single point in the sky. The Perseids in August, the Geminids in December, and the Leonids in November are among the most reliable. The Geminids are unusual in that they come from an asteroid, 3200 Phaethon, rather than a comet. The Leonids occasionally produce spectacular meteor storms with thousands of meteors per hour, most famously in 1833 and 1966.

### Near-Earth Objects
Asteroids and comets whose orbits bring them close to Earth are called near-Earth objects. Hundreds of thousands have been cataloged, and surveys find new ones every night. Most are harmless, but a handful are large enough to cause serious damage, and a few have a small but non-zero chance of impacting Earth in the coming centuries. NASA's DART mission in 2022 deliberately crashed into the small asteroid Dimorphos and successfully changed its orbit — the first demonstration that humanity could, in principle, deflect a threatening object.

### Why It Matters
Asteroids and comets are time capsules from the birth of the solar system. Their unprocessed material tells us what the planets formed from, while their impacts have shaped planetary surfaces and even the history of life — the dinosaurs' extinction 66 million years ago was triggered by an asteroid impact. Missions like OSIRIS-REx, which returned samples of asteroid Bennu in 2023, are giving us pristine material to study. These small worlds are also potential future resources: water from comets could supply deep-space missions, and rare metals in asteroids may one day be mined. The small bodies of the solar system are no longer just curiosities; they are keys to our past and possibly our future.`,
  },

  // ----------------------------------------------------------------
  // 9. DEEP SPACE MISSIONS — PROBES BEYOND EARTH ORBIT
  // ----------------------------------------------------------------
  {
    id: 'space-deep-missions',
    patterns: [/\b(cassini huygens|new horizons|galileo spacecraft|parker solar probe|juno spacecraft|artemis program|chang'e mission|mangalyaan|dawn mission|deep space probe|deep space mission)\b/i],
    keywords: ['cassini', 'huygens', 'new horizons', 'galileo', 'parker solar probe', 'juno', 'artemis', 'chang-e', 'mangalyaan', 'dawn'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `Beyond the iconic Apollo Moon landings, the Voyager probes, and the Hubble and Webb space telescopes, dozens of other robotic missions have explored the solar system in extraordinary detail. Each of these spacecraft extended humanity's reach to a new destination, and together they have transformed the planets from dots of light into real, complex worlds.

### Cassini-Huygens at Saturn
The Cassini spacecraft, a joint NASA-ESA-ASI mission, arrived at Saturn in 2004 and spent 13 years orbiting the ringed planet. It returned breathtaking images of Saturn's rings and moons, watched storms churn through Saturn's atmosphere, and discovered geysers of water ice erupting from the moon Enceladus — evidence of a subsurface ocean that may harbor life. Cassini also carried the Huygens probe, which parachuted down to the surface of Saturn's moon Titan in 2005, the first landing on a body in the outer solar system. Titan turned out to have lakes and rivers of liquid methane and a thick nitrogen atmosphere, a frigid world with a chemistry that may resemble early Earth. Cassini ended its mission in 2017 by deliberately plunging into Saturn to prevent any chance of contaminating its moons.

### New Horizons at Pluto and Beyond
Launched in 2006, New Horizons flew past Pluto in July 2015, giving humanity its first close-up view of the famous dwarf planet. Pluto turned out to be a stunningly complex world with nitrogen glaciers, towering water-ice mountains, a thin blue atmosphere, and a vast heart-shaped plain of frozen nitrogen. On New Year's Day 2019, New Horizons flew past the Kuiper Belt object Arrokoth, the most distant object ever visited by a spacecraft — a 36-kilometer contact binary that turned out to be surprisingly smooth and ancient, a pristine remnant of solar system formation.

### Galileo, Juno, and the Jupiter System
The Galileo spacecraft orbited Jupiter from 1995 to 2003 and was the first to fly close to its moons. Galileo found strong evidence that Europa has a subsurface ocean of liquid water beneath its icy crust, making Europa one of the most promising places to search for life. Juno, in orbit since 2016, is studying Jupiter's deep atmosphere, gravity, and magnetic field, revealing that the giant planet's iconic bands extend thousands of kilometers deep and that its core is diffuse rather than solid.

### Parker Solar Probe — Touching the Sun
The Parker Solar Probe, launched in 2018, is the fastest human-made object ever and the first to enter the Sun's outer atmosphere, the corona. Flying within about 7 million kilometers of the Sun's surface — far closer than Mercury — it is solving the long-standing mystery of why the corona is hundreds of times hotter than the visible surface beneath it. Parker has already flown through coronal mass ejections and survived, sending back unprecedented data on the solar wind.

### Artemis — Return to the Moon
NASA's Artemis program aims to return humans to the Moon, with the first crewed landing planned for the mid-2020s and a long-term lunar outpost to follow. Unlike Apollo, Artemis is explicitly a stepping stone to Mars, with international partners and a focus on sustained presence rather than brief visits.

### International Missions
Other space agencies have made remarkable contributions. China's Chang'e program landed on the lunar far side in 2019 — a first — and returned samples from the Moon in 2020. India's Mangalyaan orbiter reached Mars in 2014 on a remarkably small budget, and the Chandrayaan-3 mission in 2023 made India the fourth country to soft-land on the Moon. Japan's Hayabusa2 and NASA's OSIRIS-REx both returned samples of asteroids to Earth in 2020 and 2023.

### Why It Matters
These missions turn points of light into worlds. Every destination we have visited has surprised us — active geology on Io, oceans beneath ice, complex organic chemistry on Titan, ancient landscapes preserved on Pluto. Beyond scientific discovery, these missions are also preparations for humanity's future in space, testing technologies that will one day carry humans to Mars and beyond. They remind us how much there still is to explore.`,
  },

  // ----------------------------------------------------------------
  // 10. PLANETARY ATMOSPHERES
  // ----------------------------------------------------------------
  {
    id: 'space-planetary-atmospheres',
    patterns: [/\b(planetary atmosphere|atmospheres of planets|venus greenhouse|mars atmosphere|jupiter great red spot|saturn hexagon|atmospheric escape|aurora on planets|exoplanet atmosphere|gas giant atmosphere)\b/i],
    keywords: ['planetary atmosphere', 'venus greenhouse', 'mars atmosphere', 'great red spot', 'saturn hexagon', 'atmospheric escape', 'aurora', 'exoplanet atmosphere'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `A planet's atmosphere is the thin shell of gas that wraps its solid surface, shields it from radiation, transports heat, and shapes its weather and climate. Earth's atmosphere makes our world habitable, but it is just one example in a solar system full of radically different atmospheric worlds. Studying them both illuminates our own planet and prepares us to read the atmospheres of distant exoplanets.

### Venus — A Runaway Greenhouse
Venus has roughly the same size, mass, and composition as Earth, but its atmosphere is a nightmare. The surface pressure is 90 times Earth's, equivalent to being a kilometer underwater, and the air is 96 percent carbon dioxide. That CO2 traps heat so efficiently that the surface temperature is about 465 degrees Celsius — hotter than the side of Mercury facing the Sun, even though Venus is further out. Sulfuric acid clouds hide the surface from view. Venus is the textbook example of a runaway greenhouse effect, and a sobering reminder of what can happen when too much greenhouse gas builds up. Venus may once have had oceans, but they boiled away as the greenhouse spiraled out of control.

### Mars — A Thin and Frozen Air
Mars's atmosphere is also 95 percent carbon dioxide, but it is less than one percent as dense as Earth's — so thin that liquid water cannot exist on the surface for long without boiling or freezing. Billions of years ago Mars had a thicker atmosphere, flowing rivers, and possibly oceans, but without a magnetic field the solar wind stripped the atmosphere away over eons in a process called atmospheric escape. The remnants we see today produce thin water-ice clouds, dust storms that can wrap the entire planet for months, and seasonal frost at the poles. Mars is a cautionary case of how a planet can lose its air.

### The Gas Giants — Weather Without Surfaces
Jupiter's atmosphere is mostly hydrogen and helium, with colorful bands of ammonia and other compounds. The famous Great Red Spot is a storm larger than Earth that has been raging for at least 350 years, though it appears to be slowly shrinking. Jupiter also has auroras at its poles, far brighter than Earth's, powered by particles from its moon Io. Saturn's atmosphere has similar bands but is paler and hazier; at its north pole sits a striking six-sided hexagonal jet stream, hundreds of kilometers across, that has remained stable for decades. Uranus and Neptune have atmospheres rich in methane, which gives them their blue-green color. Neptune has the fastest winds in the solar system, reaching 2,100 kilometers per hour.

### Earth — The Exception
Earth's atmosphere is 78 percent nitrogen, 21 percent oxygen, with trace amounts of argon, carbon dioxide, and water vapor. The oxygen is the strangest feature — it is so reactive that it should vanish within a few million years unless constantly replenished. The only reason we have it is life. Plants and cyanobacteria have been pumping oxygen into the air for over two billion years. Our atmosphere is, in a real sense, a signature of life visible from space.

### Exoplanet Atmospheres
With JWST and ground-based telescopes, astronomers are now beginning to study the atmospheres of planets around other stars. By watching starlight filter through an exoplanet's atmosphere during transit, they can identify the gases present — water vapor, sodium, carbon dioxide, and in some cases hints of methane. The long-term goal is to find an Earth-like atmosphere around an Earth-like planet, with oxygen and methane together, which would be a strong hint of life.

### Why It Matters
Atmospheres control whether a planet is habitable, what its surface looks like, and whether we could ever visit. Understanding them helps us model Earth's climate, recognize the warning signs of greenhouse runaway on our own world, and target the search for life elsewhere. The next great discovery in this field — the atmosphere of an Earth-sized exoplanet — could come within the next decade.`,
  },

  // ----------------------------------------------------------------
  // 11. GALAXY CLUSTERS AND LARGE-SCALE STRUCTURE
  // ----------------------------------------------------------------
  {
    id: 'space-galaxy-clusters-large-scale',
    patterns: [/\b(galaxy cluster|galaxy clusters|supercluster|laniakea|virgo cluster|coma cluster|cosmic web|large scale structure|cosmic filaments|cosmic voids|great attractor|great wall)\b/i],
    keywords: ['galaxy cluster', 'supercluster', 'laniakea', 'virgo cluster', 'coma cluster', 'cosmic web', 'large scale structure', 'filaments', 'voids', 'great attractor'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `Galaxies are not scattered randomly through space. They clump together into groups, clusters, and vast superclusters, linked by filaments of dark matter and gas, with immense empty voids in between. This grand pattern, called the cosmic web, is the largest known structure in the universe — and on these scales, the dominant material is not stars or gas but dark matter.

### From Groups to Clusters
The smallest gatherings are galaxy groups. The Milky Way belongs to the Local Group, a small collection of about 80 galaxies dominated by the Milky Way and Andromeda. Larger collections are called galaxy clusters, containing hundreds to thousands of galaxies held together by gravity. The Virgo Cluster, about 54 million light-years away, contains over 1,300 galaxies and is the nearest major cluster. The Coma Cluster, much larger, contains more than 10,000 galaxies packed into a region about 20 million light-years across. Clusters are filled with hot X-ray-emitting gas between the galaxies — in fact, the gas has more mass than all the galaxies combined.

### Superclusters and Laniakea
Clusters themselves group into superclusters, the largest gravitationally associated structures known. In 2014 a team led by Brent Tully mapped the motions of galaxies in our neighborhood and defined a vast structure called Laniakea, Hawaiian for "immense heaven." Laniakea contains about 100,000 galaxies across 520 million light-years, with the Milky Way on its outer fringe. Beyond Laniakea lie other superclusters, including the Shapley Supercluster and the newly identified South Pole Wall.

### The Cosmic Web
On the largest scales, the universe resembles a sponge or foam. Galaxies, clusters, and gas are strung along filaments — long, thin strands of dark matter and gas — that intersect at massive nodes where the richest clusters sit. Between the filaments are vast cosmic voids, regions nearly empty of galaxies, some hundreds of millions of light-years across. This pattern was first predicted by computer simulations in the 1980s and has since been confirmed by enormous galaxy surveys like the Sloan Digital Sky Survey and the 2dF Galaxy Redshift Survey, which have mapped millions of galaxies across a substantial fraction of the observable universe.

### The Great Attractor
In the 1980s, astronomers noticed that the Milky Way and many nearby galaxies are moving in the same direction at about 600 kilometers per second, as if pulled by something massive. They named the unseen concentration the Great Attractor. It lies behind the plane of the Milky Way, hidden from optical view by dust, but X-ray and radio observations have revealed it as a region rich in galaxy clusters called the Shapley Supercluster and the Norma Cluster. The same surveys have since shown that the pull extends even further, to what is sometimes called the Shapley Attractor.

### How It All Formed
The cosmic web grew from the tiny density variations imprinted on the cosmic microwave background. Regions slightly denser than average pulled in more matter by gravity, regions slightly less dense lost matter, and over billions of years the contrast grew. Dark matter was the scaffolding — it began clumping first because it does not interact with light, and ordinary matter fell into its gravitational wells to form galaxies along the filaments. The cosmic web we see today is essentially a snapshot of dark matter's gravitational architecture, decorated with luminous galaxies.

### Why It Matters
The large-scale structure of the universe is the deepest test of cosmology. By comparing the observed cosmic web to simulations, astronomers can measure the amount of dark matter, the expansion rate of the universe, and the properties of dark energy. It is also our cosmic address — we live on a planet, orbiting a star, in a galaxy, in a small group, on the edge of a supercluster, in a filament, in a universe-spanning web. Knowing this structure tells us where we are.`,
  },

  // ----------------------------------------------------------------
  // 12. ORIGINS OF THE ELEMENTS
  // ----------------------------------------------------------------
  {
    id: 'space-origins-of-elements',
    patterns: [/\b(nucleosynthesis|origin of elements|stellar nucleosynthesis|big bang nucleosynthesis|supernova nucleosynthesis|r-process|s-process|b2fh|element formation|how elements are made|hydrogen to helium)\b/i],
    keywords: ['nucleosynthesis', 'origin of elements', 'stellar nucleosynthesis', 'big bang nucleosynthesis', 'supernova nucleosynthesis', 'r-process', 's-process', 'b2fh', 'element formation'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `Every atom in your body was made somewhere in the universe by a specific physical process. Hydrogen was made in the Big Bang. Carbon and oxygen were forged inside stars. Gold and uranium were created in the violent collisions of neutron stars. The story of where the elements come from — called nucleosynthesis — is one of the great unifications of astrophysics, chemistry, and history, and it tells the story of how a universe of pure hydrogen became a universe rich enough to contain chemistry, planets, and life.

### The Big Bang — Hydrogen and Helium
In the first few minutes after the Big Bang, the universe was hot and dense enough for nuclear reactions to occur. Protons and neutrons fused to form the nuclei of hydrogen, helium, and a tiny amount of lithium. By the time the universe had cooled enough to stop these reactions, about three minutes in, it was about 75 percent hydrogen and 25 percent helium by mass, with a trace of lithium. Every other element was made later. This process is called Big Bang nucleosynthesis, and the fact that the observed abundances match the predictions is one of the strongest pieces of evidence for the Big Bang model.

### Stellar Nucleosynthesis — Up to Iron
The first stars formed from this pristine hydrogen and helium and began to fuse hydrogen into helium in their cores. As they aged, they fused helium into carbon, carbon into oxygen and neon, then silicon, sulfur, and finally iron. Each step requires a hotter core, and only the most massive stars get all the way to iron. The energy released by these fusion reactions is what holds the star up against gravity. The process is called stellar nucleosynthesis, and it was laid out in a landmark 1957 paper by Margaret Burbidge, Geoffrey Burbidge, William Fowler, and Fred Hoyle, known universally as B2FH. Their work explained how stars build the elements from carbon to iron and showed that we are, in Carl Sagan's famous phrase, made of star stuff.

### Beyond Iron — Supernovae and the R-Process
Fusion of elements heavier than iron does not release energy — it absorbs it. So iron is the end of the line for ordinary stellar fusion. Heavier elements must be made by other processes, generally involving neutrons. There are two main pathways. The s-process (slow neutron capture) occurs in the late stages of giant stars, gradually building heavier elements up to bismuth over thousands of years. The r-process (rapid neutron capture) requires an extreme environment with a flood of neutrons, in which nuclei capture dozens of neutrons in seconds before they have time to decay. For decades the r-process site was uncertain, but the 2017 neutron star merger GW170817 confirmed that these collisions are a major source of r-process elements, including gold, platinum, and uranium. Ordinary supernovae also contribute, especially the collapsing cores of massive stars.

### Cosmic Rays and Spallation
A few light elements — beryllium, boron, and some lithium — are not made in stars or the Big Bang. They are produced when high-energy cosmic rays smash into heavier atoms in interstellar gas and break them apart, a process called spallation. Though minor in total mass, these elements play important roles in geology and technology.

### The Cosmic Cycle
Stars forge elements, die, and return them to space. New stars and planets form from the enriched gas, and the cycle repeats. Each generation of stars has more heavy elements than the last. The Sun, born about 4.6 billion years ago, is at least a third-generation star, containing material from earlier generations that lived and died before it. Earth and everything on it — including you — are the product of this cosmic recycling.

### Why It Matters
The periodic table is, in a real sense, a map of cosmic history. Each element carries the signature of where and how it was made, and by studying the abundances of elements in stars of different ages, astronomers can read the chemical evolution of the galaxy. This story also gives us a profound perspective: the calcium in your bones, the iron in your blood, the oxygen in your lungs were forged in the hearts of ancient stars and in the mergers of neutron stars billions of years before the Sun was born. The story of the elements is, in the most literal sense, the story of us.`,
  },
]
