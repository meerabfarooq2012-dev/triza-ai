/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — NATURE DEEP (Batch 7-f)
 * ============================================================
 *
 *  Deeper subtopic entries for the nature domain. These go
 *  one level below the broad batch-nature.ts entries: instead
 *  of covering "weather" or "rainforests" generically, they
 *  drill into atmospheric pressure systems, hurricanes,
 *  tornadoes, monsoons, food chains, biogeochemical cycles,
 *  evolution, animal behaviour, plant biology, marine
 *  ecosystems, forest types, conservation science, and the
 *  mechanics of climate change.
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries and target
 *  SPECIFIC subtopic terms (e.g. "zooxanthellae",
 *  "mesocyclone", "calvin cycle", "hardy weinberg",
 *  "IUCN red list") so they do not duplicate the broad
 *  batch-nature.ts patterns.
 *
 *  All content is scientific, English only, secular,
 *  no emojis.
 *
 *  NO external LLM API is used. These are facts TRIZA has
 *  "learned" and will express in its own voice via the
 *  self-expression + narration engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const NATURE_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. WEATHER, ATMOSPHERIC LAYERS, AND PRESSURE SYSTEMS
  // ----------------------------------------------------------------
  {
    id: 'nature-deep-weather-atmosphere-pressure-systems',
    patterns: [/\b(troposphere|stratosphere|mesosphere|thermosphere|atmospheric layers|high pressure system|low pressure system|cold front|warm front|occluded front|jet stream|coriolis effect|isobar|isobars|pressure system|air mass|meteorology)\b/i],
    keywords: ['troposphere', 'stratosphere', 'mesosphere', 'atmospheric layers', 'high pressure system', 'low pressure system', 'cold front', 'warm front', 'occluded front', 'jet stream', 'coriolis effect', 'isobar', 'pressure system', 'air mass'],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `Earth's atmosphere is a thin blanket of gases held to the surface by gravity. Although it extends hundreds of kilometres upward, almost all weather happens in the lowest layer, the troposphere, where temperature drops with altitude and convection churns the air. Understanding how the atmosphere is layered and how pressure systems move within it is the foundation of meteorology.

### The Atmospheric Layers

The atmosphere is divided into five layers based on how temperature changes with altitude. The troposphere, rising about twelve kilometres, is where nearly all weather occurs; temperature falls with height because the surface, not the air, is the heat source. The stratosphere above contains the ozone layer, which absorbs ultraviolet radiation and causes temperature to rise with altitude, an inversion that stabilises the air and prevents weather from forming there. The mesosphere is the coldest layer, where meteors burn up. The thermosphere absorbs extreme UV and X-rays, reaching temperatures above a thousand degrees Celsius even though the air is so thin it would feel freezing to a body. The exosphere fades into space.

### High and Low Pressure Systems

Air has weight, and atmospheric pressure is the force exerted by the column of air above a point. Pressure is mapped using isobars, lines connecting points of equal pressure. In a high pressure system, air descends, warms, and suppresses cloud formation, bringing clear skies and calm weather. In a low pressure system, air rises, cools, and condenses into clouds and precipitation. Lows are the engines of stormy weather; highs are the engines of fair weather. Pressure differences drive wind, which always flows from high to low pressure.

### Fronts and Air Masses

When two air masses of different temperature and humidity meet, the boundary is called a front. A cold front, where cold air wedges under warm air, produces sharp, short-lived storms and a sudden temperature drop. A warm front, where warm air glides over retreating cold air, brings gentler, more prolonged precipitation and gradual warming. An occluded front forms when a fast cold front catches a warm front, lifting the warm air entirely off the ground. Stationary fronts stall, producing days of dreary rain.

### Jet Streams and the Coriolis Effect

Jet streams are high-altitude rivers of fast-moving air, typically at the boundary between cold polar air and warmer tropical air. They steer storm systems across continents. The Coriolis effect, caused by Earth's rotation, deflects moving air to the right in the Northern Hemisphere and to the left in the Southern Hemisphere, giving weather systems their characteristic spin and preventing air from flowing straight from high to low pressure.

### Why It Matters

Atmospheric pressure systems govern every weather pattern on Earth: the timing of monsoons, the tracks of hurricanes, the formation of tornadoes, and the arrival of cold snaps. Aviation, agriculture, shipping, and disaster planning all depend on reading the pressure map correctly. Climate change is shifting jet streams and pressure belts, which is why familiar weather patterns are becoming less predictable.`,
  },

  // ----------------------------------------------------------------
  // 2. HURRICANES AND TROPICAL CYCLONES
  // ----------------------------------------------------------------
  {
    id: 'nature-deep-hurricanes-tropical-cyclones',
    patterns: [/\b(hurricane|tropical cyclone|typhoon|tropical depression|tropical storm|saffir simpson|storm surge|eyewall|hurricane eye|atlantic hurricane|pacific typhoon|cyclone category|hurricane category)\b/i],
    keywords: ['hurricane', 'tropical cyclone', 'typhoon', 'tropical depression', 'tropical storm', 'saffir simpson', 'storm surge', 'eyewall', 'hurricane eye', 'atlantic hurricane', 'pacific typhoon', 'cyclone category'],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `A hurricane is the most powerful storm on Earth, a vast rotating engine of wind and rain that can stretch hundreds of kilometres across and release the energy of a ten-megaton nuclear bomb every twenty minutes. Born over warm tropical oceans, these storms are called hurricanes in the Atlantic and Northeast Pacific, typhoons in the Northwest Pacific, and simply tropical cyclones in the South Pacific and Indian Ocean.

### Birth: From Depression to Hurricane

A tropical cyclone begins as a tropical disturbance, a cluster of thunderstorms over warm ocean water of at least 26.5 degrees Celsius. When winds at the surface organise and strengthen to between 37 and 62 kilometres per hour, it becomes a tropical depression. If sustained winds reach 63 km/h, it is upgraded to a tropical storm and given a name. Once winds exceed 119 km/h, the storm is officially a hurricane or tropical cyclone. The whole sequence takes days and depends on warm water, moist air, and low wind shear; without these ingredients, the storm falls apart.

### The Eye and the Eyewall

The defining structure of a mature hurricane is the eye, a circle of surprising calm at the storm's centre, typically 20 to 60 kilometres across. The eye forms when the storm's rotation flings air outward and the Coriolis effect spins it into a tight vortex; sinking air in the centre warms and clears the clouds. Surrounding the eye is the eyewall, a ring of towering thunderstorms where winds are fastest, rainfall heaviest, and pressure lowest. The strongest winds in any hurricane are always in the eyewall.

### The Saffir-Simpson Scale

Hurricanes are ranked by sustained wind speed on the Saffir-Simpson scale, from Category 1 (119 to 153 km/h, some damage) to Category 5 (252 km/h or higher, catastrophic). Category 3 and above are called major hurricanes. Wind gets the headlines, but the deadliest hazard is usually storm surge, a wall of seawater pushed ashore by the storm's winds and low pressure. Storm surges of six to nine metres have drowned entire coastal towns.

### Naming and Basin Differences

Storms are named from rotating lists maintained by the World Meteorological Organization; names of deadly storms are retired. The Atlantic hurricane season runs from June to November and averages about a dozen named storms. The Northwest Pacific is the most active basin on Earth, producing roughly a third of the world's tropical cyclones year-round. Warmer oceans from climate change are increasing the proportion of storms that reach Category 4 and 5.

### Why It Matters

Tropical cyclones kill more people than any other natural hazard, reshape coastlines, and cause hundreds of billions of dollars in damage each decade. Hurricane Katrina in 2005, Typhoon Haiyan in 2013, and Hurricane Maria in 2017 each left lasting marks on entire regions. Forecasting, early warning, building codes, and mangrove restoration are the best defences we have.`,
  },

  // ----------------------------------------------------------------
  // 3. TORNADOES AND SUPERCELLS
  // ----------------------------------------------------------------
  {
    id: 'nature-deep-tornadoes-supercells',
    patterns: [/\b(tornado|tornadoes|supercell|mesocyclone|enhanced fujita|fujita scale|tornado alley|wall cloud|hook echo|doppler radar|tornadic|twister|funnel cloud)\b/i],
    keywords: ['tornado', 'tornadoes', 'supercell', 'mesocyclone', 'enhanced fujita', 'fujita scale', 'tornado alley', 'wall cloud', 'hook echo', 'doppler radar', 'tornadic', 'twister', 'funnel cloud'],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `A tornado is a violently rotating column of air extending from a thunderstorm to the ground. With wind speeds that can exceed 480 kilometres per hour, tornadoes are the most concentrated destructive force in meteorology, narrow funnels that can lift cars, peel roofs off houses, and drive straw into telephone poles. The vast majority of the world's most violent tornadoes form in the central United States.

### Supercell Thunderstorms

The most powerful tornadoes come from supercells, large rotating thunderstorms with a long-lived updraft called a mesocyclone. A supercell is distinguished from an ordinary thunderstorm by its persistent rotation, which organises the storm into a self-sustaining engine that can last for hours and travel hundreds of kilometres. Supercells form when warm moist air at the surface meets cold dry air aloft, creating instability, and when winds change speed and direction with height (wind shear), creating a rolling tube of rotating air that eventually tilts upright into a vertical mesocyclone.

### Tornado Formation

Inside the supercell, rain and hail falling in the rear of the storm drag air downward, creating a cold pool known as the rear-flank downdraft. This downdraft wraps around the mesocyclone, tightening its rotation. A lowering of the cloud base called a wall cloud forms beneath the mesocyclone. If rotation intensifies further, a funnel cloud appears; when that funnel touches the ground, it is officially a tornado. The whole process from supercell to tornado can take under an hour.

### The Enhanced Fujita Scale

Tornado intensity is rated after the fact using the Enhanced Fujita (EF) scale, which estimates wind speed from the damage left behind. EF-0 tornadoes (105 to 137 km/h) cause light damage to chimneys and branches. EF-3 (218 to 266 km/h) tears roofs off well-built houses and overturns trains. EF-5 (over 322 km/h) is total devastation, with well-anchored houses swept off foundations and asphalt peeled from roads. Less than one percent of tornadoes reach EF-5, but they account for a disproportionate share of deaths.

### Tornado Alley and Detection

Tornado Alley, the plains of Texas, Oklahoma, Kansas, and Nebraska, produces more tornadoes per unit area than anywhere on Earth, thanks to the collision of dry Rocky Mountain air, warm moist Gulf air, and strong jet-stream winds. Detection relies on Doppler radar, which measures the velocity of precipitation particles. A classic tornado signature on radar is the hook echo, a curl of reflectivity wrapping around the mesocyclone, and the tornadic debris signature, where radar picks up objects lofted into the air by the vortex.

### Why It Matters

Tornadoes kill an average of seventy people per year in the United States and cause billions in property damage. The 1925 Tri-State Tornado killed 695 people across Missouri, Illinois, and Indiana, the deadliest in recorded history. Modern Doppler radar, weather radio, and improved warning lead times (now averaging thirteen minutes) have sharply reduced death tolls, but the storms remain dangerous and unpredictable.`,
  },

  // ----------------------------------------------------------------
  // 4. MONSOON CLIMATE SYSTEMS
  // ----------------------------------------------------------------
  {
    id: 'nature-deep-monsoon-climate-systems',
    patterns: [/\b(monsoon|monsoon season|asian monsoon|indian monsoon|itcz|intertropical convergence zone|wet season|dry season|monsoon forecast|monsoonal|southwest monsoon|northeast monsoon)\b/i],
    keywords: ['monsoon', 'monsoon season', 'asian monsoon', 'indian monsoon', 'itcz', 'intertropical convergence zone', 'wet season', 'dry season', 'monsoon forecast', 'monsoonal', 'southwest monsoon', 'northeast monsoon'],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `A monsoon is a seasonal reversal of wind direction that brings dramatic shifts between wet and dry seasons. The word comes from the Arabic mawsim, meaning season, and monsoon systems dominate the climate of South and Southeast Asia, West Africa, and parts of Australia and the Americas. More than half the world's population lives under the influence of monsoons.

### The Mechanism: Thermal Contrast

Monsoons work on the same principle as a land-and-sea breeze, scaled up to a continental size. In summer, land heats faster than the ocean. The warm air rises, creating low pressure over the continent and drawing in moist air from the cooler ocean. This onshore flow dumps enormous amounts of rain. In winter, the pattern reverses: the land cools faster than the ocean, high pressure builds over the continent, and dry air flows outward toward the sea. The seasonal wind reversal is the defining feature.

### The Asian Summer Monsoon

The most powerful monsoon on Earth is the Asian summer monsoon, which has two branches. The Southwest (or Indian) monsoon reaches India in June, splitting into the Arabian Sea branch (drenching the Western Ghats) and the Bay of Bengal branch (flooding the northeast and Bangladesh). The East Asian monsoon advances northward from southern China, reaching Korea and Japan by midsummer. Together, these branches deliver 70 to 90 percent of the region's annual rainfall in just three to four months.

### The ITCZ and Migration

The monsoon is tied to the seasonal migration of the Intertropical Convergence Zone (ITCZ), a belt of low pressure near the equator where trade winds from the Northern and Southern Hemispheres meet. The ITCZ shifts north in the Northern Hemisphere's summer and south in winter, pulled by the sun's apparent movement. When the ITCZ moves north over Asia, it carries its belt of rising air, clouds, and rain with it; that is the summer monsoon.

### Forecasting and El Nino

Monsoon forecasting is a high-stakes science. India's economy still depends heavily on the summer monsoon for agriculture and water supply; a weak monsoon triggers drought, food inflation, and rural distress. Forecasters track sea surface temperatures in the Pacific and Indian Oceans, snowpack in Eurasia, and wind patterns. El Nino years tend to suppress the Indian monsoon, while La Nina years tend to enhance it. Climate change is intensifying monsoon extremes, with fewer rainy days overall but more bursts of intense rainfall.

### Why It Matters

Monsoons feed two billion people. Rice, wheat, sugarcane, and cotton across Asia are timed to the rains. A delayed monsoon postpones planting; an early withdrawal shrinks yields; a cloudburst floods cities. Monsoons also recharge aquifers, fill reservoirs, and shape everything from wedding dates to hydropower output. Reading the monsoon correctly has been a matter of survival in Asia for thousands of years.`,
  },

  // ----------------------------------------------------------------
  // 5. ECOSYSTEMS, FOOD CHAINS, AND TROPHIC LEVELS
  // ----------------------------------------------------------------
  {
    id: 'nature-deep-ecosystems-food-chains',
    patterns: [/\b(food chain|food web|trophic level|producer consumer|decomposer|energy pyramid|keystone species|ecological niche|biomass|ten percent rule|apex predator|trophic cascade)\b/i],
    keywords: ['food chain', 'food web', 'trophic level', 'producer consumer', 'decomposer', 'energy pyramid', 'keystone species', 'ecological niche', 'biomass', 'ten percent rule', 'apex predator', 'trophic cascade'],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `Every ecosystem runs on the same currency: energy captured from sunlight and passed from one organism to the next. The path energy takes through a community is called a food chain, and the interconnected network of all such paths in an ecosystem is a food web. Together they describe who eats whom, and how the sun's energy ultimately powers every living thing on Earth.

### Trophic Levels

Organisms in a food chain occupy distinct trophic levels. At the bottom are producers, green plants, algae, and cyanobacteria, which capture sunlight through photosynthesis and turn it into chemical energy. Above them sit primary consumers (herbivores that eat plants), secondary consumers (carnivores that eat herbivores), tertiary consumers (top predators), and finally decomposers, bacteria, fungi, and detritivores like earthworms and vultures, which break down dead organic matter and return nutrients to the soil. Decomposers close the loop, making materials available for new producers.

### The Ten Percent Rule

Energy flows through ecosystems but is never recycled; only nutrients are. At each trophic level, roughly ten percent of the energy stored in biomass is passed on to the next level; the other ninety percent is used for the organism's own metabolism, growth, and reproduction, or lost as heat. This is why an energy pyramid is always wide at the bottom and narrow at the top: a thousand kilograms of phytoplankton can support a hundred kilograms of small fish, which support ten kilograms of bigger fish, which support just one kilogram of tuna or shark. There simply is not enough energy at the top to support many layers of predators.

### Food Webs and Keystone Species

Real ecosystems are not linear chains but tangled webs; most organisms eat many things and are eaten by many things. Within these webs, certain species have an outsized influence disproportionate to their numbers. A keystone species holds the ecosystem together; remove it and the structure collapses. The classic example is the sea otter: by eating sea urchins, otters keep urchin populations in check and protect kelp forests from being grazed to bare rock. When otters were hunted out, kelp forests disappeared in what ecologists call a trophic cascade.

### Niche and Biomass

Every species occupies a unique ecological niche, its specific role, including what it eats, what eats it, where it lives, and when it is active. The total mass of living organisms at each trophic level is the biomass, and it almost always shrinks as you move up the pyramid. Apex predators, lions, sharks, eagles, sit at the top, scarce but powerful, regulating the populations below them.

### Why It Matters

Food webs make ecosystems resilient, or, when simplified by human activity, fragile. Overfishing, pesticide use, and the loss of top predators can cause cascading collapses that nobody predicted. Protecting keystone species and preserving trophic structure is often more important than protecting individual species in isolation.`,
  },

  // ----------------------------------------------------------------
  // 6. BIOGEOCHEMICAL CYCLES
  // ----------------------------------------------------------------
  {
    id: 'nature-deep-biogeochemical-cycles',
    patterns: [/\b(biogeochemical cycle|nitrogen cycle|phosphorus cycle|nitrogen fixation|nitrification|denitrification|nutrient cycle|sulfur cycle|haber bosch|legume nitrogen|nutrient cycling)\b/i],
    keywords: ['biogeochemical cycle', 'nitrogen cycle', 'phosphorus cycle', 'nitrogen fixation', 'nitrification', 'denitrification', 'nutrient cycle', 'sulfur cycle', 'haber bosch', 'legume nitrogen'],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `Living things need more than energy; they need atoms. Carbon, nitrogen, phosphorus, sulfur, and a handful of other elements form the physical stuff of every cell. These elements cycle between the living and non-living parts of the Earth in pathways called biogeochemical cycles, because they involve biological, geological, and chemical processes. Without these cycles, life would quickly run out of raw materials.

### The Nitrogen Cycle

Nitrogen is the most limiting nutrient for plant growth, even though the atmosphere is 78 percent nitrogen gas. The problem is that plants cannot use N2 directly; its triple bond is too strong. Nitrogen fixation, performed by bacteria in the soil and in the root nodules of legumes like peas, beans, and clover, breaks N2 apart and converts it into ammonia, which plants can absorb. Lightning also fixes small amounts of nitrogen. Once in the soil, nitrifying bacteria convert ammonia to nitrites and then to nitrates, the form most plants prefer. When plants die or are eaten, the nitrogen returns to the soil as waste, and denitrifying bacteria convert some of it back to N2, completing the cycle. Modern agriculture shortcuts this by manufacturing synthetic nitrogen fertiliser through the Haber-Bosch process, a breakthrough that feeds billions but pollutes waterways and produces nitrous oxide, a potent greenhouse gas.

### The Phosphorus Cycle

Unlike nitrogen and carbon, phosphorus has no significant atmospheric phase; it cycles through rock, soil, water, and organisms. Phosphorus is locked in sedimentary rock as phosphate minerals, and weathering slowly releases it into soil and water, where plants take it up to build DNA, ATP, and cell membranes. Animals get phosphorus by eating plants. When organisms die, decomposers return the phosphorus to the soil, and runoff carries some to the oceans, where it eventually settles into new sedimentary rock. The cycle is geologically slow; millions of years can pass between phosphorus entering the ocean and reappearing on land.

### Interlocking Cycles

The biogeochemical cycles are not independent. The carbon, nitrogen, phosphorus, and sulfur cycles all flow through living tissue, soil, water, and rock, and each affects the others. Burning fossil fuels releases not just carbon dioxide but nitrogen and sulfur oxides, producing acid rain. Phosphorus runoff from farms feeds algal blooms that, when they die and decompose, strip oxygen from lakes and coastal waters, the dead zones at the mouths of major rivers.

### Human Disruption

Humans now move more nitrogen and phosphorus than all natural processes combined. Fertiliser, sewage, fossil fuel combustion, and land-use change have doubled the natural rate of nitrogen fixation and tripled the flow of phosphorus into the oceans.

### Why It Matters

Every living cell is built from atoms that have been recycled countless times through biogeochemical cycles. Understanding these cycles lets us manage fertilisers, predict algal blooms, and gauge the planetary boundaries within which humanity can safely operate.`,
  },

  // ----------------------------------------------------------------
  // 7. EVOLUTION AND NATURAL SELECTION
  // ----------------------------------------------------------------
  {
    id: 'nature-deep-evolution-natural-selection',
    patterns: [/\b(evolution|natural selection|darwin|adaptation|speciation|allopatric|sympatric|genetic drift|hardy weinberg|punctuated equilibrium|fitness|descent with modification|darwinian)\b/i],
    keywords: ['evolution', 'natural selection', 'darwin', 'adaptation', 'speciation', 'allopatric', 'sympatric', 'genetic drift', 'hardy weinberg', 'punctuated equilibrium', 'fitness', 'descent with modification'],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `Evolution is the central unifying principle of biology, the process by which living things change over generations through inherited variation. Charles Darwin and Alfred Russel Wallace independently proposed natural selection as its mechanism in 1858, and over a century and a half of genetics, palaeontology, and molecular biology have confirmed and extended their insight. Every living species, including humans, is the product of evolution by natural selection acting on random variation.

### Darwin's Theory

Darwin's argument rests on three observations. First, individuals in a population vary; no two are exactly alike. Second, some of that variation is heritable, passed from parents to offspring. Third, more offspring are produced than can possibly survive, because resources are limited. From these three facts, natural selection follows logically: individuals with heritable traits that suit their environment are more likely to survive and reproduce, passing those traits to the next generation. Over many generations, favourable traits accumulate and unfavourable ones disappear. Darwin called this descent with modification.

### Variation, Inheritance, and Fitness

Variation arises from random mutations in DNA, from genetic recombination during sexual reproduction, and from gene flow between populations. Inheritance, which Darwin could observe but not explain, is governed by genes, segments of DNA that code for proteins. Fitness, in evolutionary terms, is not strength or speed but reproductive success: an organism's ability to survive, mate, and leave fertile offspring. A peacock's tail reduces survival but increases mating success, so it is selected for. Fitness is always relative to a specific environment; what works in one setting may fail in another.

### Speciation

When populations of a single species become isolated, they accumulate different mutations and adapt to different environments until they can no longer interbreed. This is speciation. In allopatric speciation, a physical barrier such as a mountain range, river, or glacier splits the population. The Galapagos finches, with their specialised beaks, are a classic example. In sympatric speciation, new species arise without geographic separation, often through polyploidy in plants (a doubling of chromosome number) or through behavioural and ecological divergence within the same area.

### Genetic Drift and Other Forces

Natural selection is not the only driver of evolution. Genetic drift, random changes in allele frequency especially in small populations, can fix or eliminate traits by chance alone. The founder effect (a small group colonising new territory) and population bottlenecks (catastrophic crashes) are powerful forms of drift. Gene flow between populations can either homogenise them or introduce new variation. The Hardy-Weinberg principle describes the conditions under which a population does not evolve (no selection, no mutation, no migration, no drift, random mating), giving biologists a baseline to detect when evolution is happening.

### Why It Matters

Evolution explains antibiotic resistance in bacteria, pesticide resistance in insects, the emergence of new viruses, and the patterns of life across continents. It underpins modern medicine, agriculture, and conservation. Skipping evolution in biology would be like trying to do physics without gravity.`,
  },

  // ----------------------------------------------------------------
  // 8. ANIMAL BEHAVIOUR AND ETHOLOGY
  // ----------------------------------------------------------------
  {
    id: 'nature-deep-animal-behavior-ethology',
    patterns: [/\b(animal behavior|animal behaviour|ethology|imprinting|fixed action pattern|kin selection|altruism|territoriality|animal migration|animal communication|mating system|konrad lorenz|ethologist)\b/i],
    keywords: ['animal behavior', 'animal behaviour', 'ethology', 'imprinting', 'fixed action pattern', 'kin selection', 'altruism', 'territoriality', 'animal migration', 'animal communication', 'mating system', 'konrad lorenz'],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `Ethology is the scientific study of animal behaviour in the natural environment, pioneered in the mid-twentieth century by Konrad Lorenz, Niko Tinbergen, and Karl von Frisch, who shared the 1973 Nobel Prize for their work. Where earlier psychologists studied animals in laboratories, ethologists watched them in the wild, and discovered that much of what animals do is innate, adaptive, and exquisitely tuned to their ecology.

### Innate Versus Learned Behaviour

Some behaviours are hard-wired from birth; others are shaped by experience. A newborn sea turtle instinctively heads for the brightest horizon (the sea), while a chimpanzee learns which tools work to crack nuts by watching its mother. Most animals show a mix: fixed action patterns, stereotyped triggered sequences like a greylag goose rolling an egg back into the nest, sit at one end, while flexible learning sits at the other. Imprinting, famously studied by Lorenz, sits in between: during a brief sensitive period after hatching, goslings bond to the first moving object they see, normally their mother but, in Lorenz's experiments, the man himself.

### Kin Selection and Altruism

A puzzle for Darwin was altruism; why would a worker bee sacrifice herself for the hive, or a ground squirrel give a warning call that draws a hawk's attention to herself? William Hamilton's answer is kin selection: an animal can pass on its genes not only through its own offspring but through the offspring of close relatives. A bee shares more genes with her sisters (the queen's other daughters) than she would with her own young, so helping the hive is genetically rational. Kin selection explains almost all apparent self-sacrifice in nature.

### Territoriality and Mating Systems

Many animals defend territories, areas of land, water, or food that they protect against rivals. Territoriality reduces conflict by settling disputes through display rather than combat, and it ensures that the territory holder has access to mates and resources. Mating systems vary with ecology: monogamy is common where young need extensive parental care (many birds); polygyny where a male can control many females (elephant seals); polyandry where males incubate eggs and females compete (jacanas, phalaropes).

### Migration and Communication

Animal migration is among the most astonishing phenomena in biology. Arctic terns fly from the Arctic to the Antarctic and back each year, a round trip of 70,000 kilometres. Monarch butterflies travel 4,000 kilometres across North America to overwintering grounds they have never seen. Navigation uses the sun, stars, Earth's magnetic field, and even smell. Communication is equally varied: birdsong marks territory and attracts mates, honeybees dance to show the direction and distance of nectar, and vervet monkeys have distinct alarm calls for leopard, eagle, and snake.

### Why It Matters

Ethology shows that human behaviour is part of a continuum, not a thing apart. Insights from animal behaviour shape conservation, animal welfare, robotics, and even economics. Understanding how animals learn, communicate, and cooperate helps us design better protected areas, reduce human-wildlife conflict, and appreciate the complexity of minds very different from our own.`,
  },

  // ----------------------------------------------------------------
  // 9. PLANT BIOLOGY AND PHOTOSYNTHESIS
  // ----------------------------------------------------------------
  {
    id: 'nature-deep-plant-biology-photosynthesis',
    patterns: [/\b(photosynthesis|chloroplast|chlorophyll|calvin cycle|light dependent reaction|light independent reaction|stomata|transpiration|c3 plants|c4 plants|cam plants|plant hormone|auxin|gibberellin|tropism|phototropism|gravitropism|rubisco)\b/i],
    keywords: ['photosynthesis', 'chloroplast', 'chlorophyll', 'calvin cycle', 'light dependent reaction', 'light independent reaction', 'stomata', 'transpiration', 'c3 plants', 'c4 plants', 'cam plants', 'plant hormone', 'auxin', 'gibberellin', 'tropism', 'phototropism', 'gravitropism', 'rubisco'],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `Plants are the foundation of nearly every terrestrial food chain, the source of the oxygen we breathe, and the largest living things on Earth. Their biology is built around a single chemical trick: capturing sunlight and using it to build sugar from carbon dioxide and water. That trick, photosynthesis, powers almost all life on the planet.

### Chloroplasts and Chlorophyll

Photosynthesis happens inside chloroplasts, the green organelles in plant cells. Chloroplasts are descended from cyanobacteria that were engulfed by an ancestral plant cell about a billion years ago, an event called endosymbiosis. Inside each chloroplast is chlorophyll, a green pigment that absorbs red and blue light and reflects green (which is why plants look green). Chlorophyll sits embedded in the thylakoid membranes, stacked like coins into grana, where the light-dependent reactions take place.

### Light-Dependent Reactions

In the light-dependent reactions, chlorophyll absorbs photons and uses their energy to split water molecules into oxygen, hydrogen ions, and electrons. The oxygen is released as a waste product, fortunately for us. The electrons and hydrogen ions flow through an electron transport chain, producing ATP (the cell's energy currency) and NADPH (a carrier of high-energy electrons). These two molecules power the next stage.

### The Calvin Cycle

The Calvin cycle, also called the light-independent or dark reactions, takes place in the stroma, the fluid surrounding the thylakoids. Here an enzyme called RuBisCO captures carbon dioxide from the air and attaches it to a five-carbon sugar. Through a series of reactions powered by ATP and NADPH from the light-dependent stage, the captured carbon is built into glucose. The Calvin cycle turns twice to produce one molecule of glucose, using six molecules of CO2 and twelve of water.

### Stomata, Transpiration, and C3, C4, CAM Plants

Carbon dioxide enters the leaf through tiny pores called stomata, which can open and close to balance CO2 intake against water loss. When stomata open, water evaporates from the leaf, a process called transpiration. A single large tree can transpire hundreds of litres of water per day, drawing more water up from the roots and cooling the leaf. Most plants use the basic C3 pathway, where RuBisCO fixes CO2 directly into a three-carbon compound. In hot, dry climates this is inefficient because stomata must close to save water, CO2 levels drop, and RuBisCO starts grabbing oxygen instead, a wasteful process called photorespiration. C4 plants (corn, sugarcane, sorghum) evolved a workaround that concentrates CO2 inside specialised cells. CAM plants (cacti, pineapples, orchids) open their stomata only at night, storing CO2 for use during the day, a strategy that lets them thrive in deserts.

### Plant Hormones and Tropisms

Plants coordinate their growth with hormones. Auxins lengthen cells and cause stems to bend toward light (phototropism); gibberellins stretch stems and trigger seed germination; cytokinins promote cell division; ethylene ripens fruit; abscisic acid closes stomata during drought. Tropisms, directed growth toward or away from stimuli, let plants move by growing: shoots up toward light, roots down toward gravity (gravitropism).

### Why It Matters

Photosynthesis produces the oxygen in every breath we take and the calories in every meal we eat. Understanding it lets us breed drought-resistant crops, engineer faster-growing biofuels, and protect the forests that regulate Earth's climate.`,
  },

  // ----------------------------------------------------------------
  // 10. MARINE ECOSYSTEMS: CORAL REEFS, MANGROVES, KELP FORESTS
  // ----------------------------------------------------------------
  {
    id: 'nature-deep-marine-ecosystems-coral-reefs',
    patterns: [/\b(coral polyp|zooxanthellae|fringing reef|barrier reef|atoll|ocean acidification|mangrove|mangroves|kelp forest|kelp forests|marine ecosystem|marine biodiversity|reef building|polyp symbiosis)\b/i],
    keywords: ['coral polyp', 'zooxanthellae', 'fringing reef', 'barrier reef', 'atoll', 'ocean acidification', 'mangrove', 'kelp forest', 'marine ecosystem', 'marine biodiversity', 'reef building', 'polyp symbiosis'],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `Coral reefs cover less than one percent of the ocean floor but support roughly a quarter of all marine species, a biodiversity density that rivals tropical rainforests. Built grain by grain over thousands of years by tiny animals, reefs are both living ecosystems and geological structures, and they are among the most threatened environments on the planet.

### Coral Polyps and Zooxanthellae

A coral reef is built by coral polyps, tiny soft-bodied animals related to jellyfish and anemones. Each polyp secretes a hard skeleton of calcium carbonate, and generation after generation of polyps stack these skeletons into the massive structures we call reefs. Inside the tissues of every reef-building coral live millions of microscopic algae called zooxanthellae. This is one of nature's most important symbioses: the algae photosynthesise and share sugar with the coral, while the coral gives the algae shelter and nutrients. The algae also give coral its colour; without them, coral turns white.

### Reef Types: Fringing, Barrier, and Atoll

Charles Darwin first proposed that reef types form a sequence. A fringing reef grows directly along a coastline, separated from shore by shallow water. As the land slowly subsides or sea level rises, the reef grows upward and a lagoon opens between it and the shore, forming a barrier reef. The Great Barrier Reef, over 2,300 kilometres long, is the largest structure built by living things. When the land sinks entirely below the waves, only a ring of coral enclosing a central lagoon remains: an atoll. The Maldives and the Marshall Islands are classic atoll nations.

### Bleaching and Ocean Acidification

When sea temperatures rise even one degree above the normal summer maximum, corals expel their zooxanthellae in stress, a phenomenon called coral bleaching. Bleached coral is not dead, but it is starving, and if the heat persists the coral dies. Mass bleaching events have hit the Great Barrier Reef repeatedly since 1998. A second threat, ocean acidification, comes from the same carbon dioxide that warms the climate: as CO2 dissolves in seawater it forms carbonic acid, lowering the pH and making it harder for corals to build their calcium-carbonate skeletons.

### Mangroves and Kelp Forests

Other marine ecosystems are equally vital. Mangrove forests line tropical coastlines, their tangled roots sheltering young fish, filtering runoff, and protecting shorelines from storm surge. They store carbon at four times the rate of a tropical rainforest. Kelp forests, found in colder waters, are built by giant brown algae that can grow half a metre a day. Sea otters, sea urchins, and kelp form a three-species web: when otters disappear, urchins explode and graze the kelp to bare rock, destroying the nursery for hundreds of species.

### Why It Matters

Reefs protect coastlines from erosion, feed hundreds of millions of people, and yield compounds used in medicines from cancer drugs to sunscreens. Their loss would be both an ecological and economic catastrophe. Cutting carbon emissions, protecting mangroves, and expanding marine protected areas are the best tools we have.`,
  },

  // ----------------------------------------------------------------
  // 11. FOREST ECOSYSTEMS: TYPES, LAYERS, SUCCESSION
  // ----------------------------------------------------------------
  {
    id: 'nature-deep-forest-ecosystems-types',
    patterns: [/\b(tropical rainforest layers|emergent layer|canopy layer|understory|forest floor|temperate deciduous forest|boreal forest|taiga|forest succession|old growth forest|coniferous forest|deciduous forest)\b/i],
    keywords: ['tropical rainforest layers', 'emergent layer', 'canopy layer', 'understory', 'forest floor', 'temperate deciduous forest', 'boreal forest', 'taiga', 'forest succession', 'old growth forest', 'coniferous forest', 'deciduous forest'],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `Forests cover about thirty percent of Earth's land area and hold the majority of the world's terrestrial biodiversity. They are not all the same: a tropical rainforest, a temperate oak woodland, and a boreal spruce taiga have radically different structures, species, and ecological roles. Understanding what makes each forest type distinct is essential for managing them in a warming world.

### The Layers of a Tropical Rainforest

A tropical rainforest is the most structurally complex ecosystem on land, divided into four or five vertical layers. The emergent layer contains the tallest trees, giants up to 70 metres that pierce above the rest and tolerate full sun and wind. Below them lies the canopy, a dense roof of interlocking crowns 25 to 40 metres up that absorbs most of the sunlight and houses the majority of rainforest animals, monkeys, toucans, sloths, and countless insects. The understory, shaded and humid, holds young trees, shrubs, and vines adapted to low light. The forest floor is the darkest layer; dead leaves decompose rapidly in the warm wet conditions, and the thin layer of nutrients is quickly reabsorbed by shallow roots.

### Temperate Deciduous Forests

Temperate deciduous forests dominate the eastern United States, Europe, and parts of East Asia, where winters are cold and summers are warm and wet. Trees such as oak, maple, beech, and birch lose their leaves each autumn to conserve water and avoid freezing, then regrow them in spring. This seasonal cycle supports a distinct community of migratory birds, hibernating mammals, and spring wildflowers that bloom on the forest floor before the canopy closes. The soils are richer than in the tropics because decomposition slows in winter, allowing organic matter to accumulate.

### Boreal Forests (Taiga)

The boreal forest, or taiga, is the world's largest land biome, a vast belt of coniferous trees circling the Northern Hemisphere across Canada, Scandinavia, and Russia. Long cold winters and short cool summers favour evergreen conifers like spruce, fir, and pine, whose needle-shaped leaves and conical shape shed snow and allow photosynthesis to start the moment temperatures permit. The soils are acidic and slowly decomposing, storing enormous amounts of carbon in peat and permafrost. The taiga is critical to the global climate: it holds roughly twice as much carbon as the world's tropical forests.

### Succession and Carbon Sequestration

Forests change over time through succession. After a fire, landslide, or clear-cut, fast-growing pioneer species colonise bare ground; slower-growing shade-tolerant species replace them over decades or centuries until a mature old-growth forest develops. Forests sequester carbon by pulling CO2 from the air during photosynthesis and locking it in wood, roots, and soil. Old-growth forests, long thought to be carbon-neutral, continue accumulating carbon for centuries.

### Why It Matters

Forests cool the planet, purify water, prevent soil erosion, and provide timber, food, and medicine to billions. Deforestation, particularly in the tropics, releases stored carbon and accelerates extinction. Reforestation and sustainable forestry are among the cheapest and most effective climate solutions available.`,
  },

  // ----------------------------------------------------------------
  // 12. WILDLIFE CONSERVATION AND ENDANGERED SPECIES
  // ----------------------------------------------------------------
  {
    id: 'nature-deep-wildlife-conservation-endangered',
    patterns: [/\b(IUCN red list|critically endangered|threatened species|habitat loss|habitat fragmentation|poaching|invasive species|biodiversity hotspot|CITES|species reintroduction|conservation strategy|wildlife corridor)\b/i],
    keywords: ['IUCN red list', 'critically endangered', 'threatened species', 'habitat loss', 'habitat fragmentation', 'poaching', 'invasive species', 'biodiversity hotspot', 'CITES', 'species reintroduction', 'conservation strategy', 'wildlife corridor'],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `Wildlife conservation is the science and practice of protecting species and ecosystems from human-caused decline. The current rate of extinction is estimated to be a hundred to a thousand times the natural background rate, driven by habitat loss, overexploitation, pollution, invasive species, and climate change. Conservation biology emerged in the 1980s as a crisis discipline, a science whose findings must often be acted on before they are fully settled.

### The IUCN Red List

The International Union for Conservation of Nature (IUCN) maintains the Red List of Threatened Species, the global standard for extinction risk. Species are assessed against quantitative criteria and placed in categories: Least Concern, Near Threatened, Vulnerable, Endangered, Critically Endangered, Extinct in the Wild, and Extinct. Threatened is the umbrella term for the three highest categories: Vulnerable, Endangered, and Critically Endangered. More than 40,000 species are threatened with extinction, including a quarter of all mammals and a third of all reef-building corals.

### Habitat Loss and Fragmentation

Habitat loss is the single biggest driver of extinction. Forests are cleared for agriculture, wetlands drained for development, grasslands ploughed for crops. Even where habitat remains, it is often fragmented into isolated patches too small to support viable populations. Fragmentation also blocks migration routes, isolates breeding groups (causing inbreeding), and creates more edge habitat where invasive species and predators thrive. Wildlife corridors, strips of protected habitat connecting larger patches, are a key tool for restoring gene flow.

### Poaching and the Wildlife Trade

Poaching for ivory, rhino horn, pangolin scales, exotic pets, and traditional medicines has driven species like the black rhino, the tiger, and the vaquita to the brink. The illegal wildlife trade is estimated at tens of billions of dollars a year, ranking among the largest illicit markets on Earth. CITES, the Convention on International Trade in Endangered Species of Wild Fauna and Flora, regulates cross-border trade in threatened species, though enforcement is uneven. Demand reduction campaigns, anti-poaching patrols, and community-based conservation all play complementary roles.

### Invasive Species

Invasive species are the second biggest driver of extinction, especially on islands. Brown tree snakes from Australia have wiped out most of Guam's forest birds. Cane toads, introduced to control pests, now poison Australian predators. Zebra mussels clog North American water intakes. Invasives outcompete, prey on, or bring disease to native species that evolved without defences against them. Biosecurity at borders, rapid response to new incursions, and restoration of native communities are the main defences.

### Biodiversity Hotspots and Reintroduction

Biodiversity hotspots, regions with exceptionally high endemism that are also highly threatened, concentrate conservation dollars where they will save the most species. Madagascar, the tropical Andes, and the Caribbean islands are examples. Species reintroduction, returning captive-bred or relocated animals to their former range, has rescued species like the California condor, the Arabian oryx, and the gray wolf from the brink.

### Why It Matters

Biodiversity underpins food security, medicine, water purification, pollination, and climate stability. Each species lost is a unique evolutionary lineage millions of years in the making. Conservation is not just about saving charismatic animals; it is about preserving the living systems that sustain us.`,
  },

  // ----------------------------------------------------------------
  // 13. CLIMATE CHANGE AND THE GREENHOUSE EFFECT
  // ----------------------------------------------------------------
  {
    id: 'nature-deep-climate-change-greenhouse-effect',
    patterns: [/\b(IPCC|methane emissions|nitrous oxide|enhanced greenhouse effect|sea level rise|climate feedback|climate mitigation|climate adaptation|radiative forcing|permafrost thaw|intergovernmental panel on climate change|climate forcing)\b/i],
    keywords: ['IPCC', 'methane emissions', 'nitrous oxide', 'enhanced greenhouse effect', 'sea level rise', 'climate feedback', 'climate mitigation', 'climate adaptation', 'radiative forcing', 'permafrost thaw', 'intergovernmental panel on climate change', 'climate forcing'],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `Climate change is the defining environmental challenge of our era. The Earth has warmed by about 1.1 degrees Celsius since the late nineteenth century, and the cause is unambiguous: human activities have raised the concentration of heat-trapping gases in the atmosphere. The science rests on a foundation of physics first worked out in the nineteenth century and now confirmed by satellites, ice cores, and increasingly precise climate models.

### The Greenhouse Effect

The greenhouse effect is a natural process that keeps Earth about 33 degrees Celsius warmer than it would otherwise be. Sunlight passes through the atmosphere and warms the surface; the surface then radiates infrared heat back toward space. But certain gases in the atmosphere, water vapour, carbon dioxide, methane, nitrous oxide, and ozone, absorb some of that infrared radiation and re-emit it in all directions, including back down to the surface. Without the natural greenhouse effect, Earth would be frozen. The problem is the enhanced greenhouse effect: by burning fossil fuels, clearing forests, and intensifying agriculture, humans have raised atmospheric CO2 from about 280 parts per million before the industrial revolution to over 420 today, a level not seen in millions of years.

### The Major Greenhouse Gases

Carbon dioxide is the most abundant human-made greenhouse gas and accounts for the largest share of warming. Methane (CH4) is far less abundant but traps about 28 times more heat per molecule over a century; it leaks from natural gas systems, rice paddies, and livestock. Nitrous oxide (N2O), from fertilisers and industrial processes, is nearly 300 times more potent and also depletes ozone. Fluorinated gases, CFCs, HFCs, and their replacements, are rare but extremely powerful. Water vapour is the most abundant greenhouse gas overall, but its concentration responds to temperature rather than driving it directly.

### The IPCC and the Consensus

The Intergovernmental Panel on Climate Change (IPCC), established in 1988, synthesises the peer-reviewed work of thousands of scientists. Its reports make clear that warming since the mid-twentieth century is dominated by human activity, that every additional increment of warming brings larger impacts, and that limiting warming to 1.5 degrees requires rapid cuts in emissions this decade. The distinction between global warming (the rise in average temperature) and climate change (the broader shifts in weather, oceans, and ice that follow) is more than semantic; the latter captures the full cascade of consequences.

### Sea Level Rise and Feedback Loops

Sea level is rising, about 21 centimetres since 1900, from the thermal expansion of warming seawater and the melting of glaciers and ice sheets. Even if emissions stop tomorrow, sea level will keep rising for centuries. Climate feedback loops amplify the warming: as Arctic ice melts, dark ocean absorbs more sunlight, warming further and melting more ice. As permafrost thaws, it releases methane, which warms the planet and thaws more permafrost.

### Mitigation and Adaptation

Mitigation means cutting emissions, switching to renewables, electrifying transport, halting deforestation, improving efficiency. Adaptation means preparing for the warming already locked in, building seawalls, breeding heat-tolerant crops, relocating vulnerable communities. Both are essential; neither alone is enough.

### Why It Matters

Climate change multiplies every other environmental stress, water scarcity, food insecurity, biodiversity loss, extreme weather, displacement. The decisions made in this decade will shape the planet for thousands of years.`,
  },
]
