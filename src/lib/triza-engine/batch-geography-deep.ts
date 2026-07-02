/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — GEOGRAPHY DEEP (Batch 7-b)
 * ============================================================
 *
 *  Deeper subtopic entries for geography. These go one level
 *  below the foundational batch-geography.ts entries: instead
 *  of describing individual rivers, mountains, or deserts, the
 *  deep batch covers the underlying SYSTEMS and PROCESSES —
 *  plate tectonics and boundary types, the Pacific Ring of Fire,
 *  orogeny and mountain formation, thermohaline circulation,
 *  the Köppen climate classification, drainage basins and deltas,
 *  desert formation mechanisms, biomes and ecoregions,
 *  urbanisation and megacities, demography, natural-resource
 *  economics, polar systems, and cartographic projections.
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries with specific
 *  subtopic tokens so the deep entry triggers only on the more
 *  specialised phrasing (e.g. "ring of fire", "thermohaline",
 *  "köppen", "orogeny") rather than on broad terms like
 *  "volcano" or "climate" that the base batch already matches.
 *
 *  NO external LLM API is used. These are facts TRIZA has
 *  "learned" and will express in its own voice via the
 *  self-expression + narration engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const GEOGRAPHY_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. PLATE TECTONICS AND BOUNDARY TYPES
  // ----------------------------------------------------------------
  {
    id: 'plate-tectonics-boundaries',
    patterns: [/\b(plate tectonics|tectonic plate|plate boundary|divergent boundary|convergent boundary|transform boundary|subduction zone|continental drift|seafloor spreading|wilson cycle|lithosphere|asthenosphere)\b/i],
    keywords: ['plate tectonics', 'tectonic plate', 'plate boundary', 'divergent', 'convergent', 'transform', 'subduction', 'continental drift', 'seafloor spreading', 'wilson cycle', 'lithosphere', 'asthenosphere'],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `Plate tectonics is the unifying theory of geology. It explains that the Earth's outer shell is not a single solid layer but a mosaic of about fifteen large and small rigid plates that float on the hotter, ductile mantle beneath, slowly drifting, colliding, and pulling apart over geological time. The theory emerged in the 1960s by combining Alfred Wegener's 1912 idea of continental drift with evidence of seafloor spreading, and it revolutionised our understanding of earthquakes, volcanoes, mountain building, and the rock cycle.

### Lithosphere and Asthenosphere
The Earth's outer mechanical layer is the lithosphere — about one hundred kilometres thick, rigid, and broken into the tectonic plates. It includes the crust and the uppermost, coolest part of the mantle. Beneath it lies the asthenosphere, a hotter, partially molten layer that, while still solid, flows very slowly over geological timescales. The lithosphere floats on the asthenosphere, and convection currents in the asthenosphere — driven by heat from radioactive decay deep in the Earth — drag the plates above.

### Divergent Boundaries
At a divergent boundary, two plates pull apart, and molten rock rises from the mantle to fill the gap, creating new crust. The Mid-Atlantic Ridge is the classic example — a 16,000-kilometre underwater mountain chain where the Eurasian and North American plates separate at about 2.5 centimetres per year. Iceland sits directly on this ridge, which is why it has active volcanoes. The East African Rift is slowly tearing Africa apart and may one day produce a new ocean basin.

### Convergent Boundaries and Subduction
At convergent boundaries, two plates collide. When oceanic crust meets continental crust, the denser oceanic plate dives beneath in subduction, melting as it descends into the hot mantle. Subduction zones produce deep ocean trenches, explosive volcanic arcs like the Andes and Japan, and the most powerful earthquakes on Earth. When two continental plates collide, neither subducts easily — instead they crumple upward into vast mountain ranges. The collision of India with Asia about 50 million years ago continues to push up the Himalayas and the Tibetan Plateau today.

### Transform Boundaries
At transform boundaries, plates slide horizontally past one another, neither creating nor destroying crust. The San Andreas Fault in California is the famous example, where the Pacific Plate grinds northwest past the North American Plate. Friction locks the plates until stress builds past the breaking point, then they lurch suddenly — producing devastating earthquakes like the 1906 San Francisco event.

### The Wilson Cycle
The Wilson Cycle describes how oceans open and close over hundreds of millions of years: a continent rifts apart, an ocean basin widens by seafloor spreading, then the ocean begins to close as subduction consumes old crust, and finally the continents collide into a new mountain range. The Atlantic is currently widening; the Mediterranean is closing. The cycle shows that the Earth's surface is constantly being recycled.

### Why It Matters
Plate tectonics explains nearly every major geological feature: where mountains rise, where volcanoes erupt, where earthquakes strike, where islands form, and where mineral and fossil fuel deposits accumulate. Subduction zones recycle carbon and water deep into the Earth, helping regulate the climate over geological time. Without plate tectonics, Earth would have a static surface like Mars — no new crust, no mountain chains, probably no complex life. Reading the moving plates is how geologists predict volcanic hazards, locate oil and mineral reserves, and reconstruct ancient supercontinents like Pangaea.`,
  },

  // ----------------------------------------------------------------
  // 2. PACIFIC RING OF FIRE AND SEISMIC SCALES
  // ----------------------------------------------------------------
  {
    id: 'volcanoes-earthquakes-ring-of-fire',
    patterns: [/\b(ring of fire|pacific ring of fire|shield volcano|stratovolcano|cinder cone|richter scale|mercalli scale|moment magnitude|seismic wave|pyroclastic flow|lahar|tsunami formation)\b/i],
    keywords: ['ring of fire', 'shield volcano', 'stratovolcano', 'cinder cone', 'richter scale', 'mercalli', 'moment magnitude', 'seismic wave', 'pyroclastic', 'lahar', 'tsunami'],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `The Pacific Ring of Fire is a 40,000-kilometre horseshoe-shaped belt of intense volcanic and seismic activity that traces the margins of the Pacific Ocean. Roughly 75 percent of the world's active volcanoes and about 90 percent of all earthquakes occur along this single belt, which runs from New Zealand up through Indonesia, the Philippines, Japan, the Kamchatka Peninsula, across the Aleutian Islands to Alaska, and down the west coast of North and South America. The Ring of Fire exists because the Pacific Plate is surrounded almost entirely by convergent and transform boundaries where it is being subducted and ground against neighbouring plates.

### Volcano Types
Volcanoes come in three main shapes, each reflecting a different eruptive style. Shield volcanoes, like those of Hawaii, are broad and gently sloped; they form from low-viscosity basaltic lava that flows long distances, producing effusive rather than explosive eruptions. Stratovolcanoes, also called composite volcanoes, are tall and steep cones built from alternating layers of lava and ash; Mount St. Helens, Mount Fuji, and Mount Vesuvius are classic examples, and their viscous, gas-rich magma produces violent explosive eruptions. Cinder cones are the smallest and simplest — short, steep hills built from erupted cinders that pile up around a single vent.

### Eruption Hazards
Explosive eruptions shatter magma into ash and pumice, sending plumes tens of kilometres into the stratosphere, where ash can disrupt global aviation. Pyroclastic flows — fast-moving currents of hot gas and volcanic matter — race down slopes at hundreds of kilometres per hour and are among the most lethal natural forces. Lahars, or volcanic mudflows, can bury valleys kilometres from the vent, often triggered by rain on fresh ash.

### Earthquake Scales
Earthquake size is measured in two complementary ways. The Richter scale, and its modern successor the moment magnitude scale, quantifies the total energy released at the source — each whole-number step represents about 31 times more energy. The 2011 Tohoku earthquake in Japan measured magnitude 9.0. The Modified Mercalli Intensity scale, by contrast, describes observed effects at the surface, rated I (not felt) through XII (total destruction), and varies with distance from the epicentre.

### Seismic Waves
Earthquakes release energy as seismic waves. P-waves (primary) are compressional, fastest, and travel through both solids and liquids. S-waves (secondary) are shear waves, slower, and cannot pass through liquids — which revealed that the Earth has a liquid outer core. Surface waves (Love and Rayleigh) travel along the crust and cause most of the shaking damage to buildings. Seismographs record the arrival times of these waves to locate the epicentre and measure the magnitude.

### Tsunami Formation
Most tsunamis form when an undersea earthquake suddenly displaces a large volume of water — typically at a subduction zone where one plate jerks upward beneath another. The wave radiates outward at jet-airliner speed in the open ocean, only a few tens of centimetres tall. As it reaches shallow coastal water, friction with the seabed slows the front of the wave while the trailing water piles up — the wave grows into a towering wall of water that crashes ashore.

### Why It Matters
The Ring of Fire concentrates the most destructive geological hazards on Earth, but it also creates the conditions for rich soils, mineral deposits, and geothermal energy. Understanding volcano and earthquake behaviour saves lives: early-warning systems for tsunamis, building codes that resist shaking, and evacuation plans for volcanic crises all depend on the science of these powerful forces. Living along the Ring of Fire means living with risk, but also with the fertile land and dramatic landscapes that volcanic and tectonic activity create.`,
  },

  // ----------------------------------------------------------------
  // 3. MOUNTAIN FORMATION AND OROGENY
  // ----------------------------------------------------------------
  {
    id: 'mountain-ranges-formation',
    patterns: [/\b(fold mountain|fold mountains|thrust fault|thrust mountain|block mountain|volcanic mountain|orogeny|mountain formation|mountain building|how mountains form|how do mountains form|laramide orogeny)\b/i],
    keywords: ['fold mountain', 'thrust fault', 'block mountain', 'volcanic mountain', 'orogeny', 'mountain formation', 'mountain building', 'laramide'],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `Mountains form through several distinct geological processes that build the Earth's highest relief over millions of years. The science of mountain building is called orogeny, from the Greek for "mountain generating". Mountain ranges rarely form in isolation — they typically extend for thousands of kilometres along the boundaries of colliding tectonic plates, where the slow grind of continental drift crumples, lifts, and tilts enormous slabs of rock into the air.

### Fold Mountains
Fold mountains are the most common type and form when two continental plates collide, compressing thick sequences of sedimentary rock that once lay on the seafloor. The rock buckles into anticlines (up-folds) and synclines (down-folds), producing long parallel ridges and valleys. The Himalayas began forming about 50 million years ago when India, drifting north after breaking from Gondwana, slammed into Asia. The collision continues today — the Himalayas still rise about five millimetres per year — and the range contains the world's highest peaks, including Mount Everest at 8,849 metres. The Alps formed by the same mechanism when the African Plate collided with the Eurasian Plate.

### Thrust and Block Mountains
When compression is intense, rocks break along low-angle faults and large slabs are pushed over younger strata in a process called thrust faulting. The Rocky Mountains of western North America were shaped partly by thrusting during the Laramide orogeny. Block mountains form differently — they are created by tension that fractures the crust into large blocks, some of which sink to form rift valleys while others are lifted up as fault-block ranges. The Sierra Nevada in California is a tilted fault block, and the Basin and Range Province of the western United States is a vast mosaic of uplifted blocks and down-dropped basins.

### Volcanic Mountains
Volcanic mountains build up gradually from repeated eruptions of lava and ash. The Andes, the longest continental mountain range on Earth at about 7,000 kilometres, are a complex mix of fold and volcanic mountains formed where the oceanic Nazca Plate subducts beneath the South American Plate. The Cascades in the Pacific Northwest and the islands of Japan are similar volcanic arcs. Each eruption adds a new layer, and over hundreds of thousands of years a great peak like Mount Fuji or Mount Rainier emerges.

### Uplift and Erosion
Once mountains rise, erosion immediately begins to wear them down. Rivers cut deep V-shaped valleys, glaciers carve U-shaped valleys, and freeze-thaw cycles shatter rock into scree. The net elevation we see reflects the balance between tectonic uplift and erosion. Young, actively uplifting ranges like the Himalayas and New Zealand's Southern Alps have steep, jagged peaks because erosion has not yet caught up. Older ranges like the Appalachians in eastern North America were once as tall as the Rockies but have been worn down over 300 million years into rounded, forested ridges.

### Why It Matters
Mountain ranges shape climate by forcing moist air upward, cooling it, and dumping rain on the windward side while the leeward side stays dry — the orographic effect. They store water as snow and ice, feeding major rivers like the Ganges, Indus, Yangtze, and Colorado that supply billions of people downstream. Mountains concentrate mineral wealth from intruded magma and metamorphism, and they create natural barriers that have shaped human migration, trade, and culture for millennia. Reading mountain ranges is reading the Earth's tectonic biography.`,
  },

  // ----------------------------------------------------------------
  // 4. OCEAN CURRENTS AND THERMOHALINE CIRCULATION
  // ----------------------------------------------------------------
  {
    id: 'ocean-currents-thermohaline',
    patterns: [/\b(thermohaline|ocean current|ocean currents|gulf stream|kuroshio|coriolis effect|coriolis|ocean gyre|gyres|el nino|la nina|ocean conveyor belt|upwelling|downwelling)\b/i],
    keywords: ['thermohaline', 'ocean current', 'gulf stream', 'kuroshio', 'coriolis', 'gyre', 'el nino', 'la nina', 'conveyor belt', 'upwelling'],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `Ocean currents are the planet's great heat distribution system. They move warm water from the equator toward the poles and cold water back toward the tropics in vast, looping pathways that shape climate on every coast they touch. Driven by wind, by the Earth's rotation, and by differences in water density, currents flow both at the surface and in the deep ocean, together transporting about as much heat as the atmosphere does.

### Surface Currents and Gyres
Surface currents are driven mainly by global wind belts — the trade winds near the equator and the westerlies in the mid-latitudes. As wind pushes water, the Coriolis effect (caused by the Earth's rotation) deflects the flow right in the Northern Hemisphere and left in the Southern Hemisphere. The result is that surface currents organise into large circular systems called gyres that rotate clockwise in the north and anticlockwise in the south. The Gulf Stream, part of the North Atlantic Gyre, carries warm water from the Gulf of Mexico up the East Coast of North America and across to Europe, giving Western Europe a much milder climate than its latitude would suggest. The Kuroshio Current plays the same role in the Pacific, warming Japan.

### The Thermohaline Circulation
Beneath the wind-driven surface layer lies a slower, deeper system driven by differences in water density, which depends on temperature (thermo) and salinity (haline). Near Greenland and the Antarctic, surface water becomes cold and salty enough — and therefore dense enough — to sink to the ocean floor. This dense water creeps along the abyssal plains and slowly spreads through every ocean basin. The flow eventually rises back to the surface through upwelling, completing a journey that takes roughly a thousand years. The whole system is called the thermohaline circulation, or the global ocean conveyor belt, and it moves enormous quantities of carbon, nutrients, and heat.

### Upwelling and Productivity
Where surface currents diverge or winds blow offshore, cold, nutrient-rich deep water rises to replace them — a process called upwelling. Upwelling zones along Peru, California, and West Africa are among the most productive fisheries in the world because the nutrients fuel phytoplankton blooms that feed the entire marine food web. The reverse process, downwelling, carries oxygen down to deep waters.

### El Nino and La Nina
The El Nino-Southern Oscillation is a periodic fluctuation of sea surface temperatures and atmospheric pressure across the equatorial Pacific. During El Nino, the trade winds weaken, warm water sloshes east toward South America, and upwelling there collapses — devastating Peruvian fisheries and causing drought in Australia and Southeast Asia while bringing floods to the western Americas. La Nina is the opposite phase, with stronger trade winds and cooler eastern Pacific water. These cycles, occurring every two to seven years, shift weather patterns worldwide.

### Why It Matters
Ocean currents are the Earth's climate thermostat. They determine which coasts are fertile and which are desert, where hurricanes intensify, where fisheries thrive, and where monsoons fail. Warming climate is melting Greenland and Antarctic ice, freshening the North Atlantic and potentially weakening the conveyor belt — a slowdown could dramatically cool Europe while disrupting rainfall patterns that billions rely on. Reading the oceans is essential for predicting the climate of the next century.`,
  },

  // ----------------------------------------------------------------
  // 5. KOPPEN CLIMATE CLASSIFICATION
  // ----------------------------------------------------------------
  {
    id: 'climate-zones-koppen',
    patterns: [/\b(koppen climate|koppen classification|climate classification|tropical climate|arid climate|temperate climate|continental climate|polar climate|highland climate|microclimate|climograph)\b/i],
    keywords: ['koppen climate', 'koppen classification', 'climate classification', 'tropical climate', 'arid climate', 'temperate climate', 'continental climate', 'polar climate', 'highland climate', 'microclimate'],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `The Köppen climate classification, developed by Russian-German climatologist Wladimir Köppen in 1900, is the most widely used system for categorising the world's climates. It groups climates based on the kinds of vegetation that naturally grow in them, which in turn depends on patterns of temperature and precipitation through the year. The system uses a code of letters — first a capital letter for the main climate group, then lowercase letters for precipitation and temperature details — to encode the climate of any location on Earth.

### The Five Main Climate Groups
Group A climates are tropical — hot all year with no real winter, and rainfall heavy enough to support rainforest or savanna. The Amazon Basin, the Congo Basin, and much of Indonesia fall here. Group B climates are dry, where evaporation exceeds precipitation. They include the world's great deserts (Sahara, Arabian, Gobi) and the semi-arid steppes that border them. Group C climates are temperate — the warmest month averages above 10 degrees Celsius and the coldest between minus 3 and 18, with distinct seasons but no persistent snow cover. Most of Europe, the eastern United States, and parts of China and Japan belong here. Group D climates are continental, with at least one month averaging above 10 degrees and the coldest month below minus 3 — cold winters with snow, warm summers, covering much of Russia, Canada, and the northern United States. Group E climates are polar, where no month averages above 10 degrees, including tundra (ET) and permanent ice caps (EF) like Antarctica and central Greenland.

### The Highland Group H
Köppen added a sixth group, H, for highland climates where altitude overrides latitude. A tropical location at 4,000 metres elevation can have a climate closer to a temperate zone. The Andes, the Himalayas, and the East African highlands show how elevation creates vertical climate bands: warm crops in the foothills, temperate crops at middle elevations, and perpetual snow on the peaks.

### What Shapes a Climate
Three factors dominate a region's climate. Latitude determines how much solar energy arrives and how long the days are. Altitude cools the air about 6.5 degrees per kilometre of elevation. Distance from the sea matters because water heats and cools slowly, so coastal regions have mild, maritime climates while continental interiors have extreme, hot-summer and cold-winter climates. Ocean currents add another layer: the warm Gulf Stream gives Britain mild winters while the cold Humboldt Current chills the coast of Peru.

### Microclimates
Within any broad climate zone, small-scale variations called microclimates exist. A south-facing slope is warmer and drier than a north-facing one. A city centre is several degrees warmer than the surrounding countryside — the urban heat island effect. A forest floor is cooler, moister, and shadier than an adjacent meadow. These small differences determine which plants grow where, how frost pockets form, and where insects and birds can survive.

### Why It Matters
Köppen's map is more than a textbook curiosity — it is the foundation of agriculture, water planning, energy design, and disaster preparedness. Crops, building codes, road materials, and heating systems are all chosen based on the local climate zone. As climate change shifts temperature and rainfall patterns, the boundaries of Köppen zones are visibly moving: deserts are creeping poleward, temperate zones are warming, and polar climates are shrinking. Watching these shifts is one of the clearest ways to track the planet's transformation.`,
  },

  // ----------------------------------------------------------------
  // 6. RIVER SYSTEMS, MEANDERS, AND DELTAS
  // ----------------------------------------------------------------
  {
    id: 'river-systems-deltas',
    patterns: [/\b(drainage basin|watershed|catchment|river course|meander|meanders|oxbow lake|floodplain|river delta|delta formation|estuary|estuaries|river system|drainage divide)\b/i],
    keywords: ['drainage basin', 'watershed', 'catchment', 'river course', 'meander', 'oxbow lake', 'floodplain', 'delta', 'estuary', 'river system'],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `A river system is a branching network that collects water from a vast area of land and channels it downhill to the sea. Every river has a drainage basin — also called a watershed or catchment — the area of land from which all precipitation eventually flows to a single outlet. Drainage basins are separated by divides, which can be sharp ridges or barely perceptible rises. The Mississippi River's drainage basin covers about 40 percent of the contiguous United States, while the Amazon's covers more than a third of South America.

### The Three Courses of a River
Geographers divide a river into three sections. The upper course, in mountains or uplands, is steep and fast, cutting downward to form narrow V-shaped valleys with waterfalls and rapids. The river here carries coarse sediment and has high erosive power. The middle course has a gentler gradient — the river begins to wind from side to side, the valley widens, and tributaries join, increasing flow. The lower course, near the mouth, is nearly flat; the river spreads across a wide floodplain, deposits fine sediment, and moves slowly toward the sea.

### Meanders, Oxbow Lakes, and Floodplains
As a river crosses flat ground, it does not flow straight — it curves in loops called meanders. Water flows fastest on the outside of each bend, eroding the bank, while slow water on the inside deposits sediment. Over time, meanders grow wider and more curved until the river finally cuts across the neck of a loop during a flood, leaving the abandoned bend as an oxbow lake. The flat land that a river periodically floods is the floodplain, naturally fertilised by fresh silt — which is why the Nile, the Ganges, and the Mississippi have supported dense farming for thousands of years.

### Deltas Versus Estuaries
Where a river meets the sea, two different landforms can form. If the river carries more sediment than tides and currents can wash away, the sediment builds up into a delta — a fan-shaped mosaic of channels, levees, and islands. The Ganges-Brahmaputra Delta, the world's largest, covers most of Bangladesh and parts of India; the Mississippi Delta, the Nile Delta, and the Amazon Delta are other major examples. If, instead, tides are strong and sediment is low, the river mouth becomes an estuary — a wide, brackish funnel where saltwater and freshwater mix, like the Thames or Chesapeake Bay. Estuaries are extraordinarily productive nurseries for fish and shellfish.

### Major World Rivers
The Nile, at about 6,650 kilometres, is traditionally ranked the world's longest river, flowing north from East Africa to the Mediterranean. The Amazon carries more water than the next seven largest rivers combined and supports the world's largest rainforest. The Ganges, of immense cultural importance across the Indian subcontinent, drains the southern Himalayas and sustains half a billion people. The Mississippi-Missouri system drains the heart of North America. Each river system has shaped the civilisation that grew along its banks.

### Why It Matters
Rivers are the planet's freshwater arteries. They supply drinking water, irrigate crops, generate hydropower, transport goods, and deposit the fertile sediments that built the world's great agricultural plains. But they are also vulnerable: dams trap sediment, pollution starves downstream wetlands, climate change alters their flow, and over-extraction causes some — like the Colorado — to no longer reach the sea. Protecting river systems is inseparable from protecting the people and ecosystems that depend on them.`,
  },

  // ----------------------------------------------------------------
  // 7. DESERT FORMATION AND TYPES
  // ----------------------------------------------------------------
  {
    id: 'deserts-formation-types',
    patterns: [/\b(subtropical desert|rain shadow|rain-shadow desert|coastal desert|polar desert|desert formation|desertification|sand dune|dune types|oasis|hamada|erg|reg|arid land)\b/i],
    keywords: ['subtropical desert', 'rain shadow', 'coastal desert', 'polar desert', 'desert formation', 'desertification', 'sand dune', 'oasis', 'hamada', 'erg', 'arid'],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `Deserts are defined not by heat but by dryness — a desert is any region that receives less than about 250 millimetres of precipitation per year. About one third of the Earth's land surface is desert or semi-arid, and deserts occur on every continent. They form through several distinct mechanisms, each producing a different kind of desert with its own climate, landscape, and ecosystem.

### Subtropical Deserts
The world's great subtropical deserts — the Sahara in North Africa, the Arabian Desert, the Australian Outback — lie roughly between 15 and 30 degrees latitude north and south of the equator. At these latitudes, the global atmospheric circulation descends from high altitude, warming and drying as it compresses. This subtropical high-pressure belt suppresses cloud formation and rainfall. The Sahara is the largest hot desert on Earth, covering about nine million square kilometres, and is expanding southward into the Sahel.

### Rain-Shadow Deserts
When moist air from the ocean is forced up over a mountain range, it cools and dumps its moisture on the windward side. By the time the air descends on the leeward side, it is dry and warm, creating a rain shadow. The Gobi Desert in Central Asia lies in the rain shadow of the Himalayas. The deserts of eastern California and Nevada, including Death Valley, lie in the rain shadow of the Sierra Nevada and other western ranges. The Patagonian Desert in Argentina is in the rain shadow of the Andes.

### Coastal Deserts
Some deserts form along the western coasts of continents where cold ocean currents chill the air and suppress rainfall, even while fog provides moisture. The Atacama Desert in Chile, the driest non-polar desert on Earth, sits between the cold Humboldt Current and the Andes. Some weather stations in the Atacama have never recorded rainfall. The Namib Desert of southern Africa and the Baja California Desert follow the same pattern.

### Polar Deserts
Polar regions receive so little precipitation — usually as snow — that they qualify as deserts despite their ice cover. The Antarctic Desert, covering about 14 million square kilometres, is the largest desert in the world. The McMurdo Dry Valleys of Antarctica have not seen rain for millions of years. Cold air holds very little moisture, so even when polar regions are covered in ice, the air is essentially desert dry.

### Sand Dunes, Oases, and Desertification
Desert landscapes include rocky plateaus (hamadas), gravel plains (regs), and the rolling sand seas (ergs) of popular imagination, with dunes shaped by prevailing winds into crescents, ridges, and stars. Oases form where underground water reaches the surface, supporting isolated patches of vegetation and human settlement. Desertification — the spread of desert-like conditions into semi-arid land — is driven by overgrazing, deforestation, unsustainable irrigation, and climate change, and it threatens the livelihoods of hundreds of millions of people in the Sahel, Central Asia, and parts of China.

### Why It Matters
Deserts are not lifeless wastelands but adapted ecosystems with unique plants (cacti, deep-rooted shrubs), animals (camels, fennec foxes, scorpions), and surprising biodiversity. They hold vast mineral and solar resources and have shaped human migration, trade routes, and cultures for thousands of years. But they are also fragile: slow-growing desert soils take centuries to recover from disturbance, and the spread of deserts is one of the most pressing environmental challenges of the century.`,
  },

  // ----------------------------------------------------------------
  // 8. BIOMES AND ECOREGIONS
  // ----------------------------------------------------------------
  {
    id: 'biomes-ecoregions',
    patterns: [/\b(biome|biomes|ecoregion|ecoregions|tropical rainforest|tropical rain forest|savanna|taiga|boreal forest|temperate deciduous forest|tundra biome|mediterranean biome|biodiversity hotspot|chaparral|fynbos)\b/i],
    keywords: ['biome', 'ecoregion', 'tropical rainforest', 'savanna', 'taiga', 'boreal forest', 'temperate deciduous', 'tundra', 'mediterranean biome', 'biodiversity hotspot', 'chaparral', 'fynbos'],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `A biome is a large region of the Earth defined by its dominant vegetation and the climate that sustains it. The same biome can appear on different continents — tropical rainforest exists in the Amazon, the Congo, and Southeast Asia — because similar climates produce similar evolutionary solutions. Biomes are broader than ecosystems and overlap with climate zones, but they emphasise the living community rather than the temperature and rainfall alone.

### Forest Biomes
Tropical rainforests, clustered near the equator, are warm and wet year-round. They contain more than half of all plant and animal species on Earth despite covering only about six percent of the land surface. Temperate deciduous forests, dominated by trees that lose their leaves in winter, cover much of eastern North America, Europe, and East Asia. The boreal forest, or taiga, is the world's largest terrestrial biome — a vast belt of coniferous trees (spruce, fir, pine) stretching across Canada, Scandinavia, and Russia, surviving long, frozen winters and short, intense summers.

### Grasslands and Savannas
Grasslands dominate where it is too dry for forest but too wet for desert. Tropical savannas, like those of East Africa, have scattered trees and support vast herds of grazing mammals and their predators. Temperate grasslands — the prairies of North America, the steppes of Eurasia, the pampas of South America — have deep, fertile soils that have made them the world's breadbaskets.

### Deserts, Tundra, and Mediterranean Biomes
Deserts, already covered separately, support specialised drought-tolerant life. Tundra occurs at high latitudes and high altitudes where the growing season is too short for trees. The arctic tundra has permafrost beneath its surface; alpine tundra occurs on mountaintops. Mediterranean biomes — found around the Mediterranean Sea, California, central Chile, the Cape of South Africa, and southwestern Australia — have mild wet winters and hot dry summers, producing dense, fire-adapted shrublands (chaparral, maquis, fynbos) with extraordinary plant diversity.

### Freshwater and Marine Biomes
Aquatic biomes cover most of the Earth. Freshwater biomes include rivers, lakes, wetlands, and ponds, each stratified by depth, flow, and oxygen. Marine biomes include estuaries (where rivers meet the sea), coral reefs (the most biodiverse marine ecosystem), kelp forests, the open ocean pelagic zone, and the deep-sea benthic zone, where life survives in darkness under enormous pressure, often near hydrothermal vents.

### Ecoregions and Biodiversity Hotspots
Within each biome, ecologists identify finer units called ecoregions — areas with distinct species compositions and ecological processes. The World Wildlife Fund recognises 867 terrestrial ecoregions. Biodiversity hotspots are regions that contain at least 1,500 endemic plant species and have lost at least 70 percent of their original habitat. There are 36 recognised hotspots, including Madagascar, the tropical Andes, the Atlantic Forest of Brazil, and the Western Ghats of India. Though they cover only about 2.4 percent of the Earth's land surface, they support a huge share of the planet's species.

### Why It Matters
Biomes are the planet's life-support architecture. They regulate the carbon and water cycles, generate the oxygen we breathe, supply food, fibre, fuel, and medicines, and sustain cultures that have coexisted with them for millennia. Yet human activity is altering biomes faster than ever — deforestation, overgrazing, drainage, pollution, and climate change are shrinking rainforests, drying wetlands, bleaching coral reefs, and pushing taiga and tundra toward tipping points. Understanding biomes is essential for conserving the living Earth.`,
  },

  // ----------------------------------------------------------------
  // 9. URBANISATION AND MEGACITIES
  // ----------------------------------------------------------------
  {
    id: 'urbanization-megacities',
    patterns: [/\b(urbanization|urbanisation|megacity|megacities|urban sprawl|gentrification|smart city|smart cities|slum|slums|informal settlement|sustainable urban planning|rural to urban migration|megalopolis)\b/i],
    keywords: ['urbanization', 'megacity', 'urban sprawl', 'gentrification', 'smart city', 'slum', 'informal settlement', 'sustainable urban planning', 'rural to urban migration', 'megalopolis'],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `Urbanisation is the shift of human populations from rural to urban living. In 1800, only about three percent of the world's people lived in cities. Today more than half do, and the United Nations projects that nearly seven in ten people will be urban by 2050. This Great Migration is one of the largest demographic shifts in human history, reshaping economies, environments, and societies at every scale.

### Why People Move
Rural-to-urban migration is driven by push and pull factors. Push factors include poverty, land scarcity, lack of services, conflict, and climate stress in rural areas. Pull factors include jobs, education, healthcare, and the cultural attractions of city life. Once a city grows past a certain size, agglomeration effects — the clustering of industries, workers, and ideas — make it even more productive, attracting still more migrants in a self-reinforcing cycle.

### Megacities
A megacity is a metropolitan area with more than 10 million people. In 1950, only New York and Tokyo qualified. Today there are more than 30, including Tokyo (about 37 million), Delhi, Shanghai, São Paulo, Mexico City, Cairo, Mumbai, Beijing, Dhaka, and Lagos. The fastest growth is now in Asia and Africa, where cities like Kinshasa, Lagos, and Dhaka are doubling in size every 15 to 20 years. Some regions have grown so vast that neighbouring cities have merged into continuous urban corridors — the Pearl River Delta in China, the Northeast megalopolis of the United States, and Japan's Taiheiyo Belt.

### Urban Sprawl and Gentrification
Urban sprawl is the low-density, car-dependent outward expansion of cities, consuming farmland and natural habitat faster than population grows. Sprawl increases infrastructure costs, traffic, energy use, and carbon emissions. At the opposite end, gentrification occurs when investment flows into inner-city neighbourhoods, raising property values and displacing long-time, often lower-income residents. Both processes reshape who can afford to live where, with deep social consequences.

### Slums and Informal Settlements
About a billion people — roughly one in seven humans — live in slums or informal settlements, lacking secure tenure, clean water, sanitation, or durable housing. Names like favelas (Brazil), barrios (Venezuela), bustees (India), and bidonvilles (francophone Africa) describe locally specific versions of the same global phenomenon. Despite hardship, these neighbourhoods often show remarkable social organisation, microenterprise, and cultural vitality, and many residents use them as gateways to formal city life.

### Smart Cities and Sustainable Planning
Modern urban planning seeks to make cities denser, walkable, and transit-oriented, mixing housing, jobs, and services so daily life needs little driving. Smart cities use sensors, data, and digital services to manage traffic, energy, water, and waste more efficiently — Singapore, Seoul, and Barcelona are leading examples. Green infrastructure — parks, street trees, green roofs, permeable pavements — cools cities, absorbs stormwater, and improves mental health. Renewable energy, district heating, and electrified transit aim to make cities carbon-neutral.

### Why It Matters
Cities generate about 80 percent of global GDP and about 70 percent of carbon emissions. They concentrate both humanity's greatest creativity and its greatest inequalities. How cities are built in the next 30 years — dense or sprawling, inclusive or segregated, low-carbon or fossil-fuelled — will largely determine whether the planet can support ten billion people sustainably. Getting urbanisation right is arguably the central project of the 21st century.`,
  },

  // ----------------------------------------------------------------
  // 10. POPULATION AND DEMOGRAPHICS
  // ----------------------------------------------------------------
  {
    id: 'population-demographics',
    patterns: [/\b(population density|demographic transition|aging population|ageing population|demography|demographic dividend|population census|census data|migration pattern|forced migration|refugee crisis|population growth rate|birth rate|death rate|fertility rate)\b/i],
    keywords: ['population density', 'demographic transition', 'aging population', 'ageing population', 'demography', 'demographic dividend', 'census', 'migration pattern', 'refugee', 'fertility rate'],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `Demography is the statistical study of human populations — their size, structure, distribution, and changes over time. Demographers track births, deaths, migrations, ages, and household compositions to understand how societies are growing, aging, and moving. These patterns shape everything from school planning and pension systems to immigration policy and economic growth.

### Population Density and Distribution
Population density — people per square kilometre — varies enormously across the Earth. About 90 percent of people live in the Northern Hemisphere, and most inhabit a narrow band of temperate and tropical latitudes. Dense regions include the Ganges Plain, the Yangtze Delta, Java, the Nile Valley, and the northeastern United States. Vast areas — the Sahara, Siberia, the Australian interior, the Amazon — remain nearly empty. Density depends on climate, terrain, water availability, history, and economic opportunity.

### The Demographic Transition Model
The demographic transition model describes how populations change as societies modernise. In stage one, both birth and death rates are high, so population grows slowly. In stage two, better nutrition, sanitation, and medicine lower death rates sharply while birth rates stay high — population booms. In stage three, birth rates begin to fall as families choose smaller sizes, often because children become more expensive and women gain education and work. In stage four, both rates are low and population stabilises. Some countries, like Japan, Germany, and Italy, have entered stage five, where birth rates fall below death rates and populations shrink.

### Aging Populations
As life expectancy rises and birth rates fall, the median age of populations climbs. Japan has the world's oldest population, with nearly 30 percent over 65. Most of Europe, South Korea, and soon China face similar aging. Aging societies have fewer workers per retiree, straining pensions and healthcare, while also creating opportunities in automation, elder care, and lifelong learning. Reversing the trend through pro-natal policies has had limited success.

### Migration Patterns and Refugees
Migration — international and internal — is reshaping the global population. Migrants move for work, study, family reunification, and safety. The United States, Germany, Saudi Arabia, and Canada are top destinations. The United Nations counts more than 100 million forcibly displaced people worldwide, including refugees who cross international borders and internally displaced people who flee within their own countries, driven by war, persecution, disasters, and climate stress. Migration is controversial but demographically essential for countries with shrinking workforces.

### Census and Demographic Dividend
A census is a periodic official count of a population, usually every ten years, recording age, sex, household, occupation, and other variables. Censuses underpin democratic representation, public funding, and policy planning. The demographic dividend is the economic boost a country enjoys when its working-age population is large relative to dependents — a window that opens during the transition from high to low fertility. Countries like South Korea and China used this window to industrialise rapidly; whether sub-Saharan Africa, India, and other young regions can do the same is one of the defining questions of this century.

### Why It Matters
Demography shapes economies, politics, and environments. Aging societies face labour shortages and rising care costs; youthful societies face job creation pressure; migration reshapes cultures and politics; and population growth affects food, water, and climate. As one demographer put it, demography is destiny — but only partly. Policy choices about education, gender equity, migration, and sustainability determine whether population trends become crises or opportunities.`,
  },

  // ----------------------------------------------------------------
  // 11. NATURAL RESOURCES AND RESOURCE ECONOMICS
  // ----------------------------------------------------------------
  {
    id: 'natural-resources-economics',
    patterns: [/\b(renewable resource|non-renewable resource|nonrenewable resource|fossil fuel|fossil fuels|water scarcity|arable land|resource curse|paradox of plenty|circular economy|sustainable resource management|mineral resource|groundwater depletion)\b/i],
    keywords: ['renewable resource', 'non-renewable resource', 'fossil fuel', 'water scarcity', 'arable land', 'resource curse', 'paradox of plenty', 'circular economy', 'sustainable management', 'mineral resource'],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `Natural resources are the materials and services that nature provides and humans use to survive and prosper. They include the air we breathe, the water we drink, the soil that grows our food, the fossil fuels that power our machines, the minerals in our devices, the forests that absorb our carbon, and the fish in our oceans. The study of how societies extract, distribute, and conserve these resources is the heart of environmental and resource economics.

### Renewable and Non-Renewable Resources
Resources are classified by how fast they regenerate. Renewable resources — sunlight, wind, flowing water, biomass — replenish on a human timescale and can theoretically be used forever if not overharvested. Non-renewable resources — coal, oil, natural gas, and most minerals — form over millions of years and exist in finite quantities. Once burned or consumed, they are gone. Some resources, like groundwater and old-growth forests, are technically renewable but renew so slowly that overuse effectively makes them non-renewable.

### Fossil Fuels and Minerals
Fossil fuels — coal, oil, and natural gas — are the buried remains of ancient plants and microbes, transformed by heat and pressure over hundreds of millions of years. They powered the Industrial Revolution and still supply about 80 percent of global energy. Their combustion releases carbon dioxide, the main driver of climate change. Metallic minerals — iron, copper, aluminium, lithium, rare earths — are essential to construction, electronics, batteries, and renewable energy. Many of these minerals are concentrated in a few countries, creating geopolitical dependencies.

### Water and Arable Land
Freshwater is renewable through the water cycle but unevenly distributed. About 70 percent of fresh water is used in agriculture, 20 percent in industry, and 10 percent for domestic use. Aquifers like the Ogallala in the United States and the Ganges-Brahmaputra in India are being drained faster than they refill. Arable land — land suitable for crops — covers only about 11 percent of the Earth's surface and is shrinking under the pressure of urbanisation, erosion, salinisation, and desertification.

### The Resource Curse
The resource curse, or paradox of plenty, is the empirical observation that countries rich in non-renewable resources — oil in Nigeria and Venezuela, diamonds in Sierra Leone, copper in the Democratic Republic of Congo — often grow more slowly and suffer weaker institutions than resource-poor countries. Concentrated resource wealth can fuel corruption, authoritarianism, armed conflict, and economic volatility. Norway and Botswana are often cited as exceptions that managed resource wealth through transparent sovereign funds and inclusive governance.

### Sustainable Management
Sustainable resource management means using resources at rates that allow regeneration, recycling materials where possible, and substituting renewables for non-renewables. The circular economy reimagines production as a closed loop in which products are designed to be reused, repaired, and recycled rather than discarded. Renewable energy, regenerative agriculture, protected forests, and fisheries quotas are examples of sustainability in practice. The transition is uneven but accelerating as the costs of over-extraction — climate change, biodiversity loss, water scarcity — become impossible to ignore.

### Why It Matters
Every product, every meal, every joule of energy traces back to a natural resource. As population and consumption grow, the strain on the planet's resources intensifies. The United Nations projects global demand for water, food, and energy to rise 30 to 50 percent by 2050. Whether humanity can meet that demand without collapsing the ecosystems that supply it is the central economic and moral question of our time. Sustainable resource management is no longer optional — it is the price of a stable future.`,
  },

  // ----------------------------------------------------------------
  // 12. POLAR REGIONS — ARCTIC AND ANTARCTIC
  // ----------------------------------------------------------------
  {
    id: 'polar-regions-arctic-antarctic',
    patterns: [/\b(arctic ocean|arctic circle|ice cap|ice sheet|permafrost|antarctic treaty|polar research|research station|polar climate|indigenous peoples of the arctic|inuit|sami people|greenland ice sheet|west antarctic ice sheet|polar region|polar regions)\b/i],
    keywords: ['arctic ocean', 'arctic circle', 'ice cap', 'ice sheet', 'permafrost', 'antarctic treaty', 'polar research', 'research station', 'indigenous peoples of the arctic', 'inuit', 'sami', 'greenland ice sheet', 'polar region'],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `The polar regions — the Arctic in the north and the Antarctic in the south — are the coldest, iciest, and most extreme environments on Earth. Although both lie at the ends of the planet, they are profoundly different. The Arctic is a frozen ocean surrounded by continents; Antarctica is a frozen continent surrounded by ocean. Together they hold about 99 percent of the planet's freshwater ice and play an outsized role in regulating global climate.

### The Arctic
The Arctic centres on the Arctic Ocean, which is partly covered by sea ice that expands in winter and shrinks in summer. Eight countries — Russia, Canada, the United States (Alaska), Denmark (Greenland), Iceland, Norway, Sweden, and Finland — have territory above the Arctic Circle at 66.5 degrees north. The Arctic has no land-based ice sheet comparable to Antarctica's, though Greenland's ice sheet is over three kilometres thick in places. The tundra biome, with its low shrubs, mosses, and lichens above permafrost, covers much of the Arctic land area.

### Antarctica
Antarctica is the fifth-largest continent, covering about 14 million square kilometres — larger than Europe. It is the coldest, driest, and windiest continent, with winter temperatures regularly below minus 60 degrees Celsius and the lowest ever recorded temperature of minus 89 degrees Celsius at the Russian Vostok Station. About 98 percent of Antarctica is covered by an ice sheet that averages 2 kilometres in thickness. Beneath the ice lie mountain ranges, valleys, and hundreds of subglacial lakes, including Lake Vostok, sealed from the surface for millions of years.

### Permafrost and Ice Sheets
Permafrost is ground that stays below freezing for at least two consecutive years. It underlies about a quarter of the Northern Hemisphere's land, holding vast amounts of frozen organic matter. As the Arctic warms, permafrost thaws, releasing methane and carbon dioxide — a feedback that accelerates climate change. The Greenland and Antarctic ice sheets together contain enough water to raise global sea level by about 65 metres if they melted entirely. Even partial melting poses grave risks to coastal cities worldwide.

### Polar Research and Climate Change
Antarctica is governed by the 1959 Antarctic Treaty, which reserves the continent for peace and science, bans military activity and mining, and supports dozens of year-round and seasonal research stations run by countries including the United States, Russia, China, the United Kingdom, Argentina, and India. Arctic research is more fragmented across national territories. Both regions are warming two to four times faster than the global average — Arctic summer sea ice is shrinking dramatically, and Antarctic ice shelves are showing signs of instability. These changes disrupt ocean circulation, sea level, and weather patterns worldwide.

### Indigenous Peoples of the Arctic
The Arctic is not empty — it has been home to Indigenous peoples for thousands of years, including the Inuit of Canada, Greenland, and Alaska; the Sami of northern Scandinavia; the Chukchi and Nenets of Russia; and many others. Their languages, livelihoods — hunting, fishing, herding reindeer — and seasonal rhythms are adapted to the cold and now face existential threats from climate change, industrial development, and cultural assimilation.

### Why It Matters
The polar regions are the planet's thermostat and its clearest climate alarm. They reflect sunlight back to space, drive ocean circulation, store freshwater, and host unique species from polar bears to penguins, narwhals to emperor penguins. What happens in the Arctic and Antarctic does not stay there — it shapes sea levels, weather, and life everywhere on Earth. Protecting the poles is inseparable from protecting the future of the planet.`,
  },

  // ----------------------------------------------------------------
  // 13. CARTOGRAPHY AND MAP PROJECTIONS
  // ----------------------------------------------------------------
  {
    id: 'cartography-map-projections',
    patterns: [/\b(cartography|cartographer|map projection|mercator projection|robinson projection|peters projection|gall-peters|azimuthal projection|topographic map|thematic map|geographic information system|gis|gps satellite|satellite imagery|map scale|contour line)\b/i],
    keywords: ['cartography', 'cartographer', 'map projection', 'mercator', 'robinson', 'peters', 'gall-peters', 'azimuthal', 'topographic map', 'thematic map', 'gis', 'gps', 'satellite imagery', 'map scale', 'contour line'],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `Cartography is the science, art, and practice of making maps. A map is a scaled, symbolic representation of part of the Earth — or another celestial body — designed to communicate spatial information clearly. Maps are everywhere: in our phones, our weather forecasts, our navigation systems, our history books. The way a map is made profoundly shapes how we understand the world it depicts.

### Map Scale and Generalisation
Every map has a scale — the ratio between distances on the map and distances on the ground. A large-scale map (say 1:5,000) shows a small area in great detail, useful for city planning. A small-scale map (1:10,000,000) shows a whole continent but with little detail. Because reality is too rich to depict fully, every map generalises — selecting, simplifying, and symbolising features so the map's purpose comes through. A road map omits terrain; a topographic map omits road numbers.

### The Projection Problem
The fundamental challenge of cartography is that the Earth is a three-dimensional sphere (more precisely, an oblate spheroid) but maps are flat. Flattening a sphere inevitably distorts something — shape, area, distance, or direction. A map projection is the mathematical rule that translates points on the sphere to points on the flat surface. No projection preserves all four properties perfectly, so cartographers choose based on the map's purpose.

### Major Projections
The Mercator projection, introduced by Gerardus Mercator in 1569, preserves angles and shapes locally, making it ideal for marine navigation — straight lines on the map are constant-compass bearings. Its weakness is that it exaggerates areas near the poles: Greenland looks larger than Africa, though Africa is about 14 times bigger. The Robinson projection is a compromise that distorts everything slightly but nothing severely, and it is popular for world maps. The Peters projection (more accurately Gall-Peters) preserves area accurately, giving a fairer picture of the relative size of continents — useful for discussions of global inequality. Azimuthal projections show the Earth as if viewed from one point above, often used for polar maps and airline route maps centred on a hub.

### Topographic and Thematic Maps
Topographic maps show the shape of the land using contour lines that connect points of equal elevation, along with rivers, roads, settlements, and vegetation. Hikers, engineers, and military planners depend on them. Thematic maps focus on a single topic — population density, election results, climate zones, disease cases — using colour, symbols, or charts. Choropleth maps shade regions by value; dot maps place one dot per unit; flow maps show movement of people or goods.

### GIS, GPS, and Satellite Imagery
Geographic Information Systems (GIS) let mapmakers layer, analyse, and query spatial data on computers, transforming cartography from paper craft to dynamic science. The Global Positioning System (GPS), together with Russia's GLONASS, Europe's Galileo, and China's BeiDou, gives every smartphone a precise location anywhere on Earth. Satellite imagery — from Landsat, Sentinel, and commercial providers — provides up-to-date, high-resolution views of the whole planet, enabling deforestation monitoring, disaster response, and precision agriculture.

### Why It Matters
Maps are not neutral pictures — they are arguments. They decide which borders are recognised, which resources are claimed, which neighbourhoods are redrawn, which stories are told. The map in our pocket influences where we walk, who we meet, and how we vote. As satellites, sensors, and GIS make maps more powerful and more personal, the choices embedded in them matter more than ever. Learning to read a map — its projection, its scale, its symbols, its omissions — is learning to read the world itself.`,
  },
];
