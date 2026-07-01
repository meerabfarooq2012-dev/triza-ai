/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — SPACE & ASTRONOMY (Batch 2d)
 * ============================================================
 *
 *  The solar system, stars, galaxies, cosmology, telescopes,
 *  gravity, and space exploration. Twelve detailed entries
 *  covering what humans have learned about the universe.
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

export const SPACE_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. THE SOLAR SYSTEM
  // ----------------------------------------------------------------
  {
    id: 'space-solar-system',
    patterns: [/\b(solar system|sun and planets|planets orbit|asteroid|asteroids|comet|comets|kuiper belt|oort cloud|neighbourhood of the sun|suraj ka nizam)\b/i],
    keywords: ['solar system', 'sun', 'planets', 'asteroid', 'comet', 'kuiper belt', 'oort cloud'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `The solar system is the family of objects bound by gravity to the Sun. It formed about 4.6 billion years ago from a collapsing cloud of gas and dust, and almost everything in it still orbits the Sun in the same flat plane, in the same direction, the legacy of that original spinning cloud.

### The Sun at the Center
The Sun holds 99.86 percent of all the mass in the solar system. It is a ball of hot plasma 1.4 million kilometers across, so large that about 1.3 million Earths would fit inside it. Its gravity is what holds everything else in orbit — from the innermost planet Mercury, only 58 million kilometers away, to the distant Oort Cloud of comets nearly a light-year out. Without the Sun's energy, Earth would be a dark, frozen rock near absolute zero.

### The Eight Planets
Eight planets orbit the Sun, divided into two clear families. The four inner planets — Mercury, Venus, Earth, and Mars — are small, rocky, dense, and have solid surfaces. The four outer planets — Jupiter, Saturn, Uranus, and Neptune — are enormous, mostly hydrogen and helium, and have no solid surface in the usual sense. Pluto, once the ninth planet, was reclassified as a dwarf planet in 2006 because it has not cleared its orbit of other debris.

### Asteroids and Comets
Between Mars and Jupiter lies the asteroid belt, a ring of rocky fragments left over from the solar system's formation. Most asteroids are irregular lumps of rock and metal; the largest, Ceres, is itself a dwarf planet. Comets are different — they are made of ice, dust, and rock, and they come from two colder reservoirs: the Kuiper Belt beyond Neptune and the far more distant Oort Cloud. When a comet swings toward the Sun, solar heat vaporizes its ices, producing a glowing coma and a long tail that always points away from the Sun.

### The Edge of the Solar System
Beyond Neptune, the Kuiper Belt stretches from about 30 to 50 astronomical units (Earth-Sun distances) and contains Pluto, Eris, Haumea, and Makemake among its dwarf planets, plus countless smaller icy bodies. Even further lies the heliosphere — the bubble of solar wind pushed outward against interstellar space — and beyond that, the Oort Cloud, a spherical shell of trillions of frozen comet nuclei extending perhaps halfway to the nearest star. The Voyager 1 spacecraft, launched in 1977, crossed the heliopause in 2012 and is now the first human-made object in interstellar space.`,
  },

  // ----------------------------------------------------------------
  // 2. THE SUN AND STARS
  // ----------------------------------------------------------------
  {
    id: 'space-sun-stars',
    patterns: [/\b(star|stars|the sun|nuclear fusion|main sequence|red giant|white dwarf|stellar lifecycle|stellar evolution|suraj|tara)\b/i],
    keywords: ['star', 'sun', 'nuclear fusion', 'main sequence', 'red giant', 'white dwarf', 'stellar evolution'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `A star is a giant ball of hot gas held together by its own gravity, so hot and compressed at its core that atoms fuse together and release enormous energy. The Sun is the star closest to Earth — ordinary by stellar standards, but extraordinary to us because it powers nearly every process on our planet.

### How Stars Shine
Stars shine by nuclear fusion. In the Sun's core, the temperature reaches about 15 million degrees Celsius and the pressure is roughly 250 billion times Earth's atmospheric pressure. Under these extreme conditions, hydrogen nuclei smash together to form helium. Four hydrogen atoms become one helium atom, and the tiny difference in mass — about 0.7 percent — is converted into energy by Einstein's equation E equals m c squared. Every second, the Sun converts about 600 million tons of hydrogen into helium, releasing energy that took 100,000 years to crawl from the core to the surface, and then just eight minutes to reach Earth as sunlight.

### The Main Sequence
Stars spend most of their lives in a stable phase called the main sequence, fusing hydrogen into helium in their cores. The Sun is currently in the middle of its main-sequence life, about 4.6 billion years old, with roughly 5 billion years to go. A star's main-sequence lifetime depends on its mass — surprisingly, the largest stars live the shortest lives. A star 10 times the Sun's mass burns so fiercely that it exhausts its fuel in just 10 million years, while a small red dwarf, only a tenth the Sun's mass, can quietly fuse hydrogen for trillions of years, far longer than the current age of the universe.

### The Sun's Future
When the Sun runs out of core hydrogen, it will leave the main sequence. Its core will contract and heat up, while its outer layers expand and cool. The Sun will swell into a red giant, large enough to swallow Mercury and Venus and possibly Earth itself. After about a billion years as a red giant, the Sun will shed its outer layers into space, forming a glowing shell called a planetary nebula, and leave behind its exposed core — a small, incredibly dense star called a white dwarf, about the size of Earth but with half the Sun's mass. The white dwarf will slowly cool for trillions of years until it fades into darkness.

### Why It Matters
Stars are the universe's factories of heavy elements. The early universe contained only hydrogen and helium. Every carbon atom in your cells, every oxygen atom you breathe, every iron atom in your blood was forged inside a star and scattered across space when that star died. The astronomer Carl Sagan put it plainly: we are made of star-stuff. Understanding stellar lifecycles is therefore the story of how the raw material of the early cosmos became planets, oceans, and life.`,
  },

  // ----------------------------------------------------------------
  // 3. EARTH, MOON, SEASONS, AND ECLIPSES
  // ----------------------------------------------------------------
  {
    id: 'space-earth-moon',
    patterns: [/\b(earth and moon|the moon|moon phases|seasons|solstice|equinox|tides|eclipse|eclipses|solar eclipse|lunar eclipse|chand|zameen)\b/i],
    keywords: ['earth', 'moon', 'moon phases', 'seasons', 'solstice', 'equinox', 'tides', 'eclipse'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `Earth is the third planet from the Sun and the only one known to support life. The Moon is Earth's only natural satellite, and together they perform a slow gravitational dance that shapes our days, our tides, and our seasons.

### Earth's Orbit and the Seasons
Earth orbits the Sun at an average distance of about 150 million kilometers, traveling at roughly 30 kilometers per second. One orbit takes 365.25 days — the extra quarter-day is why we add a leap day every four years. Seasons are not caused by Earth's distance from the Sun but by the tilt of its axis. Earth's rotational axis is tilted about 23.5 degrees from vertical. As Earth orbits, each hemisphere leans toward the Sun for half the year and away from it for the other half. When the Northern Hemisphere leans toward the Sun, it receives more direct sunlight and longer days — that is summer. Six months later it leans away, and winter arrives. The solstices in June and December mark the extremes of this tilt; the equinoxes in March and September mark the moments when day and night are roughly equal everywhere on Earth.

### Moon Phases
The Moon orbits Earth about once every 27.3 days, and it also rotates once in the same period — so it always shows us the same face, a phenomenon called tidal locking. The Moon does not produce its own light; it reflects sunlight. As the Moon orbits Earth, the angle between the Sun, Moon, and Earth changes, and we see different portions of the Moon's sunlit half. The cycle begins with the new moon (the lit side faces away from us), then crescent, first quarter, gibbous, and full moon (the entire sunlit side faces us), then back through gibbous, last quarter, crescent, and new moon again. The full cycle, from new moon to new moon, takes about 29.5 days — the basis of our calendar month.

### Tides
Tides are the regular rise and fall of sea levels caused mainly by the Moon's gravity pulling on Earth's oceans. The Moon pulls the water on the near side of Earth toward it, creating a bulge. A second bulge forms on the opposite side, because there the Moon's gravitational pull is weaker and Earth itself is pulled slightly more than the water. As Earth rotates, coastlines pass through these two bulges each day, producing two high tides and two low tides roughly every 24 hours and 50 minutes. The Sun also contributes, and when Sun, Moon, and Earth align at new or full moon, the combined gravity produces the highest tides, called spring tides. When the Sun and Moon pull at right angles, we get the smallest tides, called neap tides.

### Eclipses
A solar eclipse happens when the Moon passes directly between the Sun and Earth, casting its shadow on us. Because the Moon is about 400 times smaller than the Sun but also about 400 times closer, the two appear nearly the same size in our sky — a remarkable coincidence that allows the Moon to just barely cover the Sun. A lunar eclipse happens when Earth passes between the Sun and Moon, casting its shadow on the Moon. Eclipses do not occur every month because the Moon's orbit is tilted about 5 degrees from Earth's orbital plane, so the three bodies usually miss perfect alignment.`,
  },

  // ----------------------------------------------------------------
  // 4. THE INNER ROCKY PLANETS
  // ----------------------------------------------------------------
  {
    id: 'space-mars-planets',
    patterns: [/\b(mercury|venus|mars|inner planets|rocky planets|terrestrial planets|red planet)\b/i],
    keywords: ['mercury', 'venus', 'mars', 'inner planets', 'rocky planets', 'terrestrial planets', 'red planet'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `The four inner planets of the solar system — Mercury, Venus, Earth, and Mars — are called the terrestrial or rocky planets. They are small, dense, and have solid surfaces, in sharp contrast to the gas giants further out. They share a common origin, yet each has become a radically different world.

### Mercury
Mercury is the smallest planet and the closest to the Sun, orbiting at an average distance of 58 million kilometers. A year on Mercury is just 88 Earth days, but a single day-night cycle on its surface lasts about 176 Earth days because the planet rotates so slowly. Mercury has almost no atmosphere, so it has no insulation: daytime temperatures reach 430 degrees Celsius, while nighttime temperatures plunge to minus 180 degrees. Its surface is heavily cratered and looks much like Earth's Moon. Despite the heat, permanently shadowed craters near its poles hold water ice deposited by comet impacts over billions of years.

### Venus
Venus is nearly the same size as Earth, which is why it is sometimes called Earth's twin — but it is a twin that went catastrophically wrong. Its atmosphere is 96 percent carbon dioxide, and the surface pressure is 90 times that of Earth, equivalent to being a kilometer underwater. This thick atmosphere traps heat through a runaway greenhouse effect, making Venus the hottest planet in the solar system at about 465 degrees Celsius, hotter even than Mercury. Sulfuric acid clouds wrap the planet, and it rains sulfuric acid. Venus also rotates backwards compared to most planets, and so slowly that a Venusian day (243 Earth days) is longer than its year (225 Earth days).

### Earth
Earth is the largest of the rocky planets and the only one known to have liquid water on its surface, an oxygen-rich atmosphere, and life. Its surface is 71 percent water, its atmosphere is 78 percent nitrogen and 21 percent oxygen, and its magnetic field shields the surface from harmful solar radiation. Earth's single large Moon stabilizes the planet's axial tilt, which keeps the climate stable over long periods — a quiet but important factor in the long-term habitability of our world.

### Mars
Mars, the Red Planet, gets its color from iron oxide — rust — on its surface. It is about half the diameter of Earth, with a thin atmosphere of mostly carbon dioxide that gives it a surface pressure less than 1 percent of Earth's. Mars has the largest volcano in the solar system, Olympus Mons, three times the height of Mount Everest, and a canyon system, Valles Marineris, that stretches 4,000 kilometers. Evidence from rovers and orbiters shows that Mars once had rivers, lakes, and possibly an ocean, and that liquid water flowed on its surface billions of years ago. Today water survives mainly as ice in the polar caps and underground. Mars is the most explored planet beyond Earth and the leading target in the search for past or present microbial life.

### Why It Matters
The inner planets show how small differences in size, distance from the Sun, and atmospheric composition lead to vastly different outcomes. Earth became a living world; Venus became a runaway greenhouse; Mars froze and lost most of its atmosphere; Mercury was scorched bare. Studying them helps us understand what makes a planet habitable, and what fragile conditions we depend on here at home.`,
  },

  // ----------------------------------------------------------------
  // 5. THE GAS GIANTS
  // ----------------------------------------------------------------
  {
    id: 'space-gas-giants',
    patterns: [/\b(jupiter|saturn|uranus|neptune|gas giant|gas giants|ice giant|planetary rings|jupiter moons|saturn rings)\b/i],
    keywords: ['jupiter', 'saturn', 'uranus', 'neptune', 'gas giant', 'ice giant', 'planetary rings'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `Beyond Mars and the asteroid belt lie the four outer planets — Jupiter, Saturn, Uranus, and Neptune. They are enormous compared to the rocky planets, they lack solid surfaces, and they each come with their own system of rings and dozens of moons. Together they hold most of the planetary mass of the solar system outside the Sun.

### Jupiter
Jupiter is the largest planet, more than twice the mass of all the other planets combined. It is about 143,000 kilometers across — so large that 1,300 Earths could fit inside it. Jupiter is mostly hydrogen and helium, the same ingredients as the Sun, but it never became massive enough to ignite nuclear fusion. Its rapid 10-hour rotation flattens the planet at the poles and produces dramatic cloud bands of ammonia and ammonium hydrosulfide. The Great Red Spot is a giant storm, larger than Earth, that has been raging for at least 350 years. Jupiter has at least 95 known moons. The four largest — Io, Europa, Ganymede, and Callisto — are called the Galilean moons after Galileo Galilei, who discovered them in 1610. Europa is particularly interesting because beneath its icy crust lies a global ocean of liquid water, making it one of the most promising places to search for life.

### Saturn
Saturn is famous for its spectacular rings, but it is also the second-largest planet and the least dense — it would float in water if you could find a bathtub large enough. Its rings are made of billions of pieces of ice and rock, ranging from grains of sand to chunks the size of houses, spread across a disk 280,000 kilometers wide but only about 10 meters thick. The rings are thought to be the shattered remains of a comet, asteroid, or small moon torn apart by Saturn's gravity. Saturn has 146 known moons. The largest, Titan, is bigger than the planet Mercury and has a thick nitrogen atmosphere and lakes of liquid methane — the only place besides Earth with stable surface liquid.

### Uranus
Uranus is an ice giant, made mostly of water, methane, and ammonia ices around a small rocky core. Its most unusual feature is its tilt — the planet's axis lies almost in the plane of its orbit, tilted about 98 degrees, so Uranus essentially rolls around the Sun on its side. This tilt produces extreme seasons: each pole gets 42 years of continuous sunlight followed by 42 years of darkness. Methane in Uranus's atmosphere absorbs red light and reflects blue-green, giving the planet a pale cyan color. Uranus has a faint ring system and 28 known moons.

### Neptune
Neptune, the outermost planet, is a deep blue ice giant about the same size as Uranus. It has the strongest winds in the solar system, reaching 2,100 kilometers per hour. Neptune was the first planet discovered by mathematical prediction rather than observation — astronomers noticed that Uranus was being tugged off its predicted path and calculated where an unseen planet must be. In 1846, Neptune was found within one degree of the predicted position. It has 16 known moons, including Triton, which orbits Neptune backwards and is almost certainly a captured Kuiper Belt object similar to Pluto.

### Why It Matters
The gas giants reshaped our understanding of what a planet can be. Their moons, especially Europa, Enceladus, and Titan, have replaced Mars as the most exciting places to search for life in our solar system. Their gravity also shields the inner solar system from comets — Jupiter in particular acts as a cosmic vacuum cleaner, deflecting or absorbing many objects that might otherwise threaten Earth.`,
  },

  // ----------------------------------------------------------------
  // 6. BLACK HOLES
  // ----------------------------------------------------------------
  {
    id: 'space-black-holes',
    patterns: [/\b(black hole|black holes|event horizon|singularity|hawking radiation|schwarzschild|stellar collapse|gravity of a black hole)\b/i],
    keywords: ['black hole', 'event horizon', 'singularity', 'hawking radiation', 'stellar collapse'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `A black hole is a region of space where gravity is so strong that nothing — not even light — can escape from it. They are among the strangest objects predicted by physics, and over the past century they have moved from a mathematical curiosity to a confirmed reality observed across the universe.

### How They Form
Most black holes form from the deaths of massive stars. A star at least 20 to 25 times the mass of the Sun ends its life in a supernova explosion when it runs out of nuclear fuel. The star's core, no longer held up by fusion, collapses under its own gravity. If the remaining core is more than about three times the mass of the Sun, no known force can stop the collapse. The core crushes itself down to a point of effectively infinite density called a singularity. There are also supermassive black holes at the centers of nearly every large galaxy, with masses ranging from millions to tens of billions of Suns. How they grew so large so early in the universe remains an open question.

### The Event Horizon
Around the singularity lies the event horizon — the boundary beyond which escape becomes impossible. The event horizon is not a physical surface; it is a mathematical boundary in space. The distance from the singularity to the event horizon is called the Schwarzschild radius. For a black hole with the mass of the Sun, this radius is only about 3 kilometers. For the supermassive black hole at the center of our galaxy, Sagittarius A*, it is about 12 million kilometers — roughly the size of Mercury's orbit. Once anything crosses the event horizon, its future lies inside the black hole.

### The Singularity
At the very center of a black hole, our current physics breaks down. General relativity predicts that all the mass collapses to a point of zero volume and infinite density — a singularity. Physicists do not believe this is literally what happens; rather, they believe general relativity stops being the right theory at these extreme scales and that a future theory of quantum gravity will replace the singularity with something more comprehensible. We do not yet have that theory.

### Hawking Radiation
For decades, black holes were thought to be perfectly black — objects that could only swallow, never emit. In 1974, Stephen Hawking showed that when quantum mechanics is combined with general relativity, black holes must actually emit a faint glow of radiation, now called Hawking radiation. Over unimaginably long timescales, this radiation causes black holes to slowly lose mass and eventually evaporate. A black hole the mass of the Sun would take roughly 10 to the power of 67 years to evaporate — vastly longer than the current age of the universe.

### Why It Matters
Black holes are the ultimate laboratories for physics, because they are the only places in the universe where the two great theories of modern physics — general relativity (the very large) and quantum mechanics (the very small) — must both be used at the same time, and where they currently contradict each other. Solving that contradiction is the path to a theory of everything. In 2015, the LIGO observatory detected gravitational waves from two merging black holes, confirming a century-old prediction of Einstein, and in 2019, the Event Horizon Telescope produced the first direct image of a black hole's shadow at the center of a distant galaxy.`,
  },

  // ----------------------------------------------------------------
  // 7. GALAXIES
  // ----------------------------------------------------------------
  {
    id: 'space-galaxies',
    patterns: [/\b(galaxy|galaxies|milky way|andromeda|spiral galaxy|elliptical galaxy|irregular galaxy|local group|galactic center)\b/i],
    keywords: ['galaxy', 'galaxies', 'milky way', 'andromeda', 'spiral galaxy', 'elliptical galaxy', 'local group'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `A galaxy is a vast collection of stars, gas, dust, and dark matter bound together by gravity. The observable universe contains at least 200 billion galaxies, ranging from small dwarf galaxies with only a few million stars to giant ellipticals containing trillions. Our own Sun is one of about 100 to 400 billion stars in the Milky Way galaxy.

### The Milky Way
The Milky Way is our home galaxy. It is a barred spiral, meaning it has a central bar-shaped structure of stars with spiral arms branching off the ends of the bar. The visible disk is about 100,000 light-years across and only about 1,000 light-years thick. The Sun is located about 26,000 light-years from the galactic center, on a minor spiral arm called the Orion Spur. The Milky Way takes about 230 million years to rotate once — a period sometimes called a galactic year. At the very center of the galaxy lies Sagittarius A*, a supermassive black hole with a mass of about 4 million Suns. When we look up at a dark sky and see the Milky Way as a faint band of light, we are seeing the combined glow of millions of stars in the disk of our own galaxy, viewed from inside.

### Types of Galaxies
Galaxies come in three main shapes. Spiral galaxies, like the Milky Way and Andromeda, have flat rotating disks with spiral arms winding out from a central bulge; they are still actively forming new stars, especially in their arms. Elliptical galaxies are ball-shaped or football-shaped, contain mostly older stars, and have little gas left to make new ones — they are often the result of two galaxies colliding and merging. Irregular galaxies have no clear shape and are usually small; the Large and Small Magellanic Clouds, visible from the southern hemisphere, are irregular satellite galaxies of the Milky Way.

### Andromeda and the Local Group
The Milky Way is not alone. It belongs to a small cluster of about 80 galaxies called the Local Group. The two largest members are the Milky Way and the Andromeda Galaxy, a spiral galaxy about 2.5 million light-years away and the most distant object visible to the naked eye. Andromeda is moving toward the Milky Way at about 110 kilometers per second, and the two galaxies are expected to collide and merge in about 4.5 billion years, eventually forming a single large elliptical galaxy sometimes nicknamed Milkomeda. Simulations suggest the Sun is unlikely to collide directly with another star, but the night sky will be completely transformed.

### Why It Matters
Galaxies are the building blocks of the large-scale universe. They are not scattered randomly through space but clustered into groups, clusters, and superclusters along vast filaments, with immense cosmic voids between them. The existence and behavior of galaxies was one of the first strong pieces of evidence for dark matter — most galaxies rotate so fast that visible matter alone cannot hold them together, so there must be far more mass present than we can see. Studying distant galaxies also lets us look back in time, because their light has taken billions of years to reach us, giving us snapshots of the universe at every stage of its history.`,
  },

  // ----------------------------------------------------------------
  // 8. THE BIG BANG AND THE AGE OF THE UNIVERSE
  // ----------------------------------------------------------------
  {
    id: 'space-big-bang',
    patterns: [/\b(big bang|cosmic microwave background|cmb|expansion of the universe|age of the universe|hubble expansion|13.8 billion|cosmology|origin of the universe)\b/i],
    keywords: ['big bang', 'cosmic microwave background', 'cmb', 'expansion', 'age of the universe', 'cosmology'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `The Big Bang theory is our best explanation for the origin and evolution of the universe. According to this theory, the universe began about 13.8 billion years ago in an extremely hot, dense state and has been expanding and cooling ever since. The name "Big Bang" was actually coined by a skeptic, Fred Hoyle, on a radio show in 1949 — he meant it dismissively, but it stuck.

### The Expanding Universe
In 1929, the American astronomer Edwin Hubble made one of the most important discoveries in the history of science. He found that distant galaxies are moving away from us, and the further away a galaxy is, the faster it is receding. This relationship, now called Hubble's Law, means the universe is expanding. If the universe is getting larger today, then in the past it must have been smaller — and if you run the clock far enough back, all of space and all of matter was once compressed into a single point of extraordinary temperature and density. Importantly, the Big Bang was not an explosion in space — it was the expansion of space itself. There is no center to the expansion; every point in the universe is moving away from every other point, like dots on the surface of an inflating balloon.

### The Cosmic Microwave Background
The strongest evidence for the Big Bang is the cosmic microwave background, or CMB. In the early universe, space was so hot that atoms could not form — it was a glowing fog of free electrons and nuclei. About 380,000 years after the Big Bang, the universe cooled enough for electrons and nuclei to combine into neutral atoms, and light was finally able to travel freely through space. That ancient light has been stretched by the expansion of the universe from visible light into microwave radiation, and it fills all of space today at a temperature of about 2.725 degrees above absolute zero. It was first detected accidentally in 1964 by Arno Penzias and Robert Wilson, who at first thought the signal was pigeon droppings in their antenna. The CMB is literally the afterglow of the Big Bang, and it is remarkably uniform in every direction — to one part in 100,000.

### A Timeline of the Universe
The first stars did not form until about 100 to 200 million years after the Big Bang. The first galaxies assembled within the first billion years. Our Sun and Earth formed about 9.2 billion years after the Big Bang — so Earth is roughly a third of the age of the universe. The CMB's tiny temperature variations are the seeds of all structure: the slightly denser regions pulled in more matter by gravity and eventually grew into galaxies, stars, and planets.

### Why It Matters
The Big Bang model is supported by three independent lines of evidence: the expansion of the universe, the cosmic microwave background, and the observed abundances of light elements (hydrogen, helium, and lithium) which match what nuclear physics predicts was produced in the first few minutes. In 1998, astronomers discovered that the expansion is not slowing down but accelerating, driven by a mysterious dark energy that makes up about 68 percent of the universe. Dark matter makes up another 27 percent, leaving only about 5 percent as the ordinary matter of stars, planets, and people. The Big Bang model is one of the most successful theories in science — but the nature of dark matter and dark energy remain the greatest unsolved puzzles in cosmology.`,
  },

  // ----------------------------------------------------------------
  // 9. MEASURING DISTANCE IN SPACE
  // ----------------------------------------------------------------
  {
    id: 'space-light-years-distance',
    patterns: [/\b(light year|light years|astronomical unit|parsec|parsec|parallax|redshift|cosmic distance ladder|how far is a star)\b/i],
    keywords: ['light year', 'astronomical unit', 'parsec', 'parallax', 'redshift', 'cosmic distance ladder'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `Space is so vast that ordinary units like kilometers become useless. The Moon is about 384,000 kilometers away, the Sun about 150 million, and the nearest star 40 trillion. To handle these numbers, astronomers use a ladder of progressively larger units, each suited to a particular range of distances.

### The Astronomical Unit
The astronomical unit (AU) is the average distance between Earth and the Sun — about 150 million kilometers. It is the natural unit for distances within the solar system. Mars is about 1.5 AU from the Sun, Jupiter about 5.2 AU, and Neptune about 30 AU. The Voyager 1 spacecraft, currently in interstellar space, is more than 160 AU away. The AU is convenient because it relates directly to Earth's orbit and can be measured very precisely by radar.

### The Light-Year
For distances to stars and beyond, astronomers use the light-year — the distance light travels in one year, about 9.46 trillion kilometers. Light moves at about 300,000 kilometers per second in a vacuum, the fastest anything can travel according to physics. The nearest star to the Sun, Proxima Centauri, is about 4.24 light-years away — meaning its light takes 4.24 years to reach us. When we look at that star, we see it as it was 4.24 years ago. The center of the Milky Way is about 26,000 light-years away, and the Andromeda Galaxy about 2.5 million light-years away. Looking into deep space is literally looking back in time. The most distant galaxies we can observe appear as they were over 13 billion years ago, not long after the Big Bang.

### The Parsec
Professional astronomers often prefer a unit called the parsec, equal to about 3.26 light-years. The name comes from "parallax of one arcsecond." Parallax is the apparent shift in the position of a nearby star against the background of distant stars as Earth orbits the Sun — the same effect you see when you hold up a finger and blink between eyes, making the finger seem to jump. By measuring a star's position six months apart (from opposite sides of Earth's orbit), astronomers can calculate its distance. A star exactly one parsec away would shift by one arcsecond (1/3600 of a degree). A parsec equals 3.26 light-years; a kiloparsec is 1,000 parsecs; a megaparsec is one million.

### The Cosmic Distance Ladder
No single method works at all distances. The cosmic distance ladder chains together techniques, each calibrating the next. For nearby stars, we use parallax. For more distant stars within our galaxy, we use standard candles — objects of known brightness, such as Cepheid variable stars, whose true brightness can be calculated from their pulsation period. By comparing the true brightness to the apparent brightness, we get the distance. For still greater distances, we use Type Ia supernovae, which all reach nearly the same peak brightness. At the very largest scales, we use redshift: as the universe expands, light from distant galaxies is stretched to longer, redder wavelengths. The further away a galaxy is, the more its light is redshifted. Measuring that shift gives both the distance and how fast the universe is expanding.

### Why It Matters
The cosmic distance ladder is how we know the size of the universe and our place in it. It is also how we discovered that the universe is expanding and that the expansion is accelerating. Each rung of the ladder required decades of careful work and ingenuity, and each was essential to the next.`,
  },

  // ----------------------------------------------------------------
  // 10. TELESCOPES
  // ----------------------------------------------------------------
  {
    id: 'space-telescopes',
    patterns: [/\b(telescope|telescopes|hubble|james webb|webb telescope|jwst|ground based telescope|space telescope|reflecting telescope|refracting telescope)\b/i],
    keywords: ['telescope', 'hubble', 'james webb', 'jwst', 'ground based', 'space telescope', 'reflecting', 'refracting'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `A telescope is an instrument that collects more light than the human eye can, allowing us to see fainter and more distant objects. Since Galileo turned his small instrument toward the sky in 1609, telescopes have been the engine of astronomical discovery, and each new generation of telescopes has rewritten our picture of the universe.

### How Telescopes Work
Telescopes work by gathering light with a large opening (the aperture) and focusing it into an image. A bigger aperture collects more light, which means fainter objects become visible. The two main designs are refracting telescopes, which use lenses, and reflecting telescopes, which use curved mirrors. Reflecting telescopes are preferred for large instruments because mirrors can be supported from behind, while large lenses sag under their own weight. Almost every major research telescope in the world today is a reflector. Modern professional telescopes also collect light invisible to the human eye — infrared, ultraviolet, X-ray, and radio — because each band of the electromagnetic spectrum reveals different physical processes.

### The Hubble Space Telescope
The Hubble Space Telescope, launched in 1990, orbits about 540 kilometers above Earth. From above the atmosphere, Hubble avoids the distortion and absorption that limit ground-based telescopes, producing images of stunning sharpness. Hubble's discoveries include pinning down the age of the universe (about 13.8 billion years), confirming that almost every large galaxy has a supermassive black hole at its center, and providing the deepest image of the universe ever made — the Hubble Deep Field, which captured thousands of galaxies in a tiny patch of seemingly empty sky. After a famous initial flaw in its main mirror was repaired by astronauts in 1993, Hubble has operated continuously for over three decades, and is still in use today.

### The James Webb Space Telescope
The James Webb Space Telescope (JWST), launched in December 2021, is Hubble's much larger successor. JWST observes mainly in infrared light, which lets it see through dust clouds that block visible light and detect the heat glow of the most distant, redshifted galaxies. Its primary mirror is 6.5 meters across — over six times the collecting area of Hubble's — and it operates about 1.5 million kilometers from Earth at the second Lagrange point, where the Sun and Earth's gravity balance in a way that lets the telescope stay shaded behind a sunshield the size of a tennis court. JWST's discoveries include detailed atmospheric readings of exoplanets, images of galaxies from less than a billion years after the Big Bang, and stunning new views of star-forming nebulae within our own galaxy.

### Ground-Based Telescopes
Space telescopes get the headlines, but most astronomy is still done from the ground. Modern observatories like the Very Large Telescope in Chile and the upcoming Extremely Large Telescopes use mirrors 8 to 39 meters across. Adaptive optics — technology that deforms the mirror hundreds of times per second to cancel out the twinkling of the atmosphere — allows ground-based telescopes to rival the sharpness of space telescopes at a fraction of the cost. Radio telescopes, like the Square Kilometre Array, observe at wavelengths where the atmosphere is transparent and can see through dust that blocks optical telescopes.

### Why It Matters
Telescopes are time machines. Because light takes time to travel, looking deep into space means looking deep into the past. Every improvement in telescope technology has revealed that the universe is larger, older, stranger, and more beautiful than we previously imagined. They are our eyes on everything beyond our own small world.`,
  },

  // ----------------------------------------------------------------
  // 11. GRAVITY
  // ----------------------------------------------------------------
  {
    id: 'space-gravity',
    patterns: [/\b(gravity|newton gravity|newton's law of gravitation|general relativity|gravitational waves|orbit|orbits|spacetime|curvature of spacetime)\b/i],
    keywords: ['gravity', 'newton', 'general relativity', 'gravitational waves', 'orbit', 'spacetime'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `Gravity is the force that holds the universe together. It keeps your feet on the ground, keeps the Moon in orbit around Earth, keeps Earth orbiting the Sun, and holds entire galaxies together. It is by far the weakest of the four fundamental forces, but it is the only one that operates over unlimited distances and only attracts, never repels — so on the largest scales, gravity always wins.

### Newton's Law of Universal Gravitation
In 1687, Isaac Newton published one of the most consequential ideas in science: every object in the universe attracts every other object with a force proportional to the product of their masses and inversely proportional to the square of the distance between them. Double the distance between two objects and the gravitational force drops to a quarter; halve it and the force quadruples. Newton's law explained why apples fall, why the Moon orbits Earth, and why planets follow elliptical orbits — and it unified the heavens and the Earth under a single set of physical laws for the first time. Newton's law is still accurate enough for almost all everyday purposes, including sending spacecraft to other planets.

### Einstein's General Relativity
In 1915, Albert Einstein published general relativity, which completely reframed gravity. According to Einstein, gravity is not a force at all in the usual sense — it is the curvature of spacetime. Massive objects like the Sun warp the fabric of space and time around them, and other objects move along the curves. A planet's orbit is not being pulled by the Sun; it is simply following the straightest possible path through curved spacetime. The physicist John Wheeler summarized it in one sentence: matter tells spacetime how to curve, and spacetime tells matter how to move. General relativity predicted phenomena Newton's theory could not: the precise orbit of Mercury, the bending of starlight by the Sun (confirmed during a 1919 solar eclipse), the slowing of clocks in strong gravity, and the existence of black holes and the expansion of the universe.

### Gravitational Waves
General relativity also predicted that violent events should produce ripples in spacetime itself — gravitational waves, which travel at the speed of light. These waves are extraordinarily faint and went undetected for a century. On September 14, 2015, the Laser Interferometer Gravitational-Wave Observatory (LIGO) finally detected them, from the merger of two black holes 1.3 billion light-years away. The detection confirmed the last major prediction of general relativity and opened an entirely new way to observe the universe. Before 2015, all astronomy relied on light (or other electromagnetic radiation). Gravitational waves let us hear events that produce no light at all — colliding black holes, merging neutron stars, and possibly the Big Bang itself.

### Orbits
An orbit is simply falling and continuously missing. The International Space Station is constantly falling toward Earth under gravity, but it is also moving sideways so fast (about 28,000 kilometers per hour) that the ground curves away beneath it as fast as it falls. The same principle applies to the Moon around Earth, Earth around the Sun, and the Sun around the center of the Milky Way. Orbital speed and distance are linked: the closer an orbit is to the body it circles, the faster it must move to stay in orbit. Kepler's third law describes this precisely, and Newton showed it follows directly from his law of gravity.

### Why It Matters
Gravity is the architect of the cosmos. It pulled together the first galaxies, formed stars and planets from clouds of gas, and shapes the large-scale structure of the entire universe. It is also the only one of the four fundamental forces that we still cannot reconcile with quantum mechanics — finding a theory of quantum gravity is the great unfinished project of modern physics.`,
  },

  // ----------------------------------------------------------------
  // 12. SPACE EXPLORATION
  // ----------------------------------------------------------------
  {
    id: 'space-space-exploration',
    patterns: [/\b(space exploration|apollo|moon landing|iss|international space station|mars rover|rover|voyager|space mission|spacecraft|space travel)\b/i],
    keywords: ['space exploration', 'apollo', 'moon landing', 'iss', 'mars rover', 'voyager', 'space mission', 'spacecraft'],
    intent: 'factual_question',
    topic: 'astronomy',
    response: () => `Space exploration is one of the great adventures of the human species. In a single lifetime we went from theoretical rocketry to walking on the Moon, sending probes past every planet, and living continuously in orbit. The story is a mix of Cold War competition, scientific ambition, and persistent engineering.

### The Apollo Moon Landings
The Apollo program was NASA's effort, announced by President Kennedy in 1961, to land a human on the Moon before the end of the decade. On July 20, 1969, Apollo 11 achieved it: Neil Armstrong and Buzz Aldrin became the first humans to walk on another world while Michael Collins orbited overhead. Over the next three years, six more missions landed, and twelve men in total walked on the Moon. Apollo was driven by Cold War competition with the Soviet Union, but it produced enormous scientific returns — the astronauts brought back 382 kilograms of lunar rocks, placed instruments that are still working today (including laser reflectors used to measure the Moon's distance to within millimeters), and fundamentally changed how humans saw our own planet. The famous "Earthrise" photograph, taken from lunar orbit, helped launch the modern environmental movement.

### The International Space Station
The International Space Station (ISS) is the largest human-built structure in space. Assembly began in 1998 and involved cooperation between the United States, Russia, Europe, Japan, and Canada — one of the most ambitious international science projects ever undertaken. It orbits about 400 kilometers above Earth at 28,000 kilometers per hour, circling the planet every 90 minutes. Since November 2000, it has been continuously occupied — there has been a human presence in space every single day for more than two decades. The ISS is a laboratory where scientists study the effects of long-duration spaceflight on the human body, grow crystals, test materials, and observe Earth and the cosmos. It is also a stepping stone: the lessons learned there are essential for any future mission to Mars.

### Mars Rovers
Mars has been visited by more spacecraft than any other planet beyond Earth. Rovers — robotic vehicles that can drive across the surface and analyze rocks — have been central to this exploration. NASA's Sojourner (1997), Spirit and Opportunity (2004), Curiosity (2012), and Perseverance (2021) have collectively driven more than 80 kilometers across Mars, drilled into rocks, and searched for signs of ancient water and life. Opportunity, designed for a 90-day mission, operated for nearly 15 years. Perseverance is collecting samples for a future mission to return to Earth, and it carried Ingenuity, a small helicopter that became the first aircraft to make powered, controlled flight on another planet. Mars orbiters have mapped the entire surface, discovered vast underground ice deposits, and even detected methane plumes whose origin remains a mystery.

### Voyager and the Outer Solar System
The two Voyager spacecraft, launched in 1977, are among the most successful missions in history. Voyager 1 and Voyager 2 visited Jupiter and Saturn, and Voyager 2 went on to Uranus and Neptune — still the only spacecraft ever to visit those two planets. They returned the first close-up images of the outer planets and their moons, discovering active volcanoes on Jupiter's moon Io, hints of an ocean on Europa, and geysers on Neptune's moon Triton. In 2012, Voyager 1 became the first human-made object to cross the heliopause and enter interstellar space; Voyager 2 followed in 2018. Both spacecraft are still operating, communicating with Earth from over 24 billion kilometers away, though their signals take more than 22 hours to arrive. Each carries a Golden Record with sounds and images of Earth, intended as a message to any civilization that might one day find them.

### Why It Matters
Space exploration has reshaped our view of Earth and our place in the universe. Technologies developed for space — satellites, GPS, weather forecasting, water purification, medical imaging — touch our daily lives. The current generation of missions aims to return humans to the Moon through the Artemis program, land the first humans on Mars in the coming decades, and search for life on the ocean moons of the outer planets. The ultimate question — whether humanity will become a multi-planet species — is no longer purely science fiction.`,
  },
]
