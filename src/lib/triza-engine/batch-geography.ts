/**
 * ============================================================
 *  TRIZA ENGINE — Geography & Nature Knowledge Batch
 * ============================================================
 *
 *  25 learned facts about mountains, rivers, oceans, deserts,
 *  climate, and natural ecosystems. TRIZA expresses these in
 *  its own voice — these are the raw memorised facts.
 *
 *  Topics covered:
 *   1. Mount Everest          2. Amazon River
 *   3. Nile River             4. Mississippi River
 *   5. Ganges River           6. Indus River
 *   7. Gobi Desert            8. Antarctica
 *   9. Arctic Circle         10. Pacific Ocean
 *  11. Atlantic Ocean        12. Himalayas
 *  13. Alps                  14. Andes
 *  15. Congo Rainforest      16. Great Barrier Reef
 *  17. Grand Canyon          18. Kalahari Desert
 *  19. Volcanoes             20. Earthquakes
 *  21. Tsunamis              22. Climate Zones
 *  23. Cloud Forests         24. Wetlands & Swamps
 *  25. Coral Reefs
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const GEOGRAPHY_ENTRIES: KnowledgeEntry[] = [
  {
    id: 'mount-everest',
    patterns: [/\b(mount everest|everest|sagarmatha|chomolungma|everest pahar|sab se uncha pahar|sabse uncha pahar|unga pahar)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Mount Everest — Roof of the Earth

Mount Everest is the **highest mountain on Earth** above sea level, rising to **8,848.86 metres (29,031.7 ft)** at its summit. It sits in the **Mahalangur Himal** sub-range of the **Himalayas**, exactly on the international border between **Nepal** (Sagarmatha Zone) and **Tibet Autonomous Region of China**. In Nepal it is called **Sagarmatha** ('forehead of the sky') and in Tibet **Chomolungma** ('Goddess Mother of the World').

### Formation and Geology
Everest, like the rest of the Himalayas, was born when the **Indian tectonic plate slammed into the Eurasian plate** roughly 50 million years ago. Astonishingly, the summit rock is **limestone containing marine fossils** — proof the peak was once the floor of an ancient sea. The mountain is still rising about **4 mm per year** as India keeps pushing north.

### Human History
- **1856**: First identified as the world's highest peak by the Great Trigonometrical Survey of India, named after Surveyor General Sir George Everest.
- **29 May 1953**: First confirmed ascent by **Sir Edmund Hillary** (New Zealand) and **Tenzing Norgay** (Sherpa of Nepal/India) via the southeast ridge.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Elevation | 8,848.86 m (29,031.7 ft) |
| Location | Nepal–China border |
| First ascent | 29 May 1953 |
| Youngest climber | 13 years old |
| Two main routes | Southeast Ridge (Nepal) & North Ridge (Tibet) |

### Climbing Challenge
Above 8,000 m lies the **Death Zone** where oxygen is only one-third of sea level. The body literally begins to die — most tragedies happen during descent when exhaustion and weather close in. The icy **Khumbu Icefall**, with its shifting crevasses and towering seracs, is one of the most dangerous sections.

**Why it matters:** Everest is more than a peak — it is the boundary where geology, climate, and human ambition collide. It teaches us that the highest places on Earth are still growing, still changing, and still demand humility from anyone who climbs them.`,
  },
  {
    id: 'amazon-river',
    patterns: [/\b(amazon river|amazon darya|amazon nadi|amazon naddi|south america ka darya|amaz?on nadhi)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Amazon River — The Mightiest Flow of Water

The Amazon River is the **largest river in the world by discharge volume**, releasing an average of **209,000 cubic metres per second** into the Atlantic Ocean — more than the next seven largest independent rivers combined. By length it is debated: measurements between **6,400 km and 7,000 km** place it either slightly shorter than or longer than the Nile, and Brazilian scientists argue the Amazon wins.

### Source and Course
The Amazon originates high in the **Andes Mountains of Peru**, from glacial streams on **Nevado Mismi** about 5,200 m above sea level. It is fed by over **1,100 tributaries**, 17 of which are longer than 1,500 km. The river crosses Peru, Colombia, and Brazil before emptying into the Atlantic. Its mouth is so wide — over **320 km** — that ocean-going ships can sail inland.

### The Basin
The **Amazon Basin** covers roughly **7 million square kilometres**, of which about **5.5 million km² is rainforest** — the largest tropical rainforest on Earth. It produces roughly **20% of the world's oxygen** and holds an estimated **10% of all species** on the planet.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Length | 6,400–7,000 km (2nd or 1st longest) |
| Discharge | 209,000 m³/second |
| Basin area | ~7,000,000 km² |
| Countries | Brazil, Peru, Colombia + 4 others |
| Width at mouth | ~320 km |

### Life Within
- **Pink river dolphins** (boto) swim its murky waters.
- **Arapaima**, one of the largest freshwater fish, can reach 3 m.
- The **Pirarucu** and **electric eel** share the channels with **caimans**, **anacondas**, and **giant otters**.
- During flood season the river rises **up to 15 metres**, drowning forests and creating floating ecosystems.

**Why it matters:** The Amazon is the planet's main freshwater artery and its biggest tropical lung. Cutting it down is not just an ecological loss — it disrupts rainfall patterns across two continents and accelerates global climate change.`,
  },
  {
    id: 'nile-river',
    patterns: [/\b(nile river|nile darya|nile nadi|masr ka darya|nile nadhi|egypt ka darya|white nile|blue nile)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Nile River — The Lifeline of Ancient Egypt

The Nile is traditionally regarded as the **longest river in the world**, flowing approximately **6,650 kilometres (4,130 miles)** from deep in the African interior to the Mediterranean Sea. It runs **northward** through **11 countries**: Tanzania, Uganda, Rwanda, Burundi, DR Congo, Kenya, Ethiopia, Eritrea, South Sudan, Sudan, and Egypt. The Greek historian Herodotus famously called Egypt **'the gift of the Nile'**.

### Two Main Branches
The Nile has two major tributaries that meet near **Khartoum, Sudan**:
- **The White Nile** — the longer and primary headstream, originating from **Lake Victoria** (fed by rivers from Burundi and Rwanda).
- **The Blue Nile** — carries about **80% of the water and silt**, beginning at **Lake Tana** in the Ethiopian highlands.

### Ancient Egypt and Civilisation
Every summer the Nile **flooded its banks**, depositing a thin layer of rich black silt that made the surrounding desert fertile for farming wheat, flax, and papyrus. This predictable flooding cycle enabled **ancient Egyptian civilisation** to flourish for over 3,000 years. The river was so sacred the Egyptians worshipped **Hapi**, the god of the annual inundation.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Length | ~6,650 km |
| Flow direction | South to North |
| Mouth | Mediterranean Sea (delta) |
| Major dam | Aswan High Dam (1970) |
| Capital on its banks | Cairo, Khartoum, Jinja |

### Modern Importance
- The **Aswan High Dam** ended the annual floods but created **Lake Nasser**, the world's largest artificial reservoir.
- The dam provides **hydroelectric power** and **irrigation water** for Egypt's 100+ million people.
- The river still supplies about **97% of Egypt's freshwater**.
- The **Nile Delta** is one of the most densely populated and fertile regions of the Mediterranean.

**Why it matters:** The Nile proves that rivers build civilisations. Without its predictable floods, the pyramids, hieroglyphs, and pharaohs might never have existed — and today 250 million Africans still depend on its waters.`,
  },
  {
    id: 'mississippi-river',
    patterns: [/\b(mississippi river|mississippi|north america ka darya|mississippi nadi|mississipi)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Mississippi River — America's Backbone

The Mississippi River is the **second-longest river in North America**, flowing approximately **3,730 kilometres (2,320 miles)** from its source at **Lake Itasca in northern Minnesota** to the Gulf of Mexico south of New Orleans. The name comes from the **Ojibwe word 'Misi-ziibi'**, meaning 'Great River'. Together with its major tributary the **Missouri River**, it forms the world's **fourth-longest river system** at about 6,275 km.

### Course and Basin
The Mississippi drains all or part of **31 U.S. states** and **two Canadian provinces**, covering a basin of roughly **3.2 million square kilometres** — about 40% of the contiguous United States. From Minnesota it runs south through or along the borders of **Wisconsin, Iowa, Illinois, Missouri, Kentucky, Tennessee, Arkansas, Mississippi, and Louisiana**.

### Historical Importance
- The river was the **western boundary of the early United States** until the **Louisiana Purchase of 1803**.
- **Mark Twain** immortalised the Mississippi in *Life on the Mississippi* and *Huckleberry Finn*.
- Steamboats in the 1800s made it the main artery for cotton, grain, and coal.
- The city of **St. Louis** was the launch point for the Lewis and Clark expedition.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Length | ~3,730 km |
| Source | Lake Itasca, Minnesota |
| Mouth | Gulf of Mexico |
| Major tributary | Missouri River |
| Delta size | ~12,000 km² (Louisiana) |

### Modern Role and Threats
- Moves roughly **500 million tons of cargo** annually — grain, petroleum, chemicals, coal.
- The **levee system** protects cities from floods, but record floods in 1927, 1993, and 2011 caused catastrophic damage.
- **Nitrogen fertiliser runoff** from Midwest farms creates a massive **dead zone** in the Gulf each summer.
- The delta is **sinking and eroding** — Louisiana loses about a football field of land every hour due to levees blocking sediment and oil-extraction subsidence.

**Why it matters:** The Mississippi shaped the economic and cultural map of America. From Mark Twain's steamboats to today's grain barges, it remains the most economically important river on the continent — but human engineering now threatens its delta's survival.`,
  },
  {
    id: 'ganges-river',
    patterns: [/\b(ganges|ganga|ganga nadi|ganga darya|ganga nadhi|sacred river india|gangotri)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Ganges River — Sacred Current of India

The Ganges (called **Ganga** in Hindi and most Indian languages) is the **longest river in India**, flowing about **2,525 kilometres (1,569 miles)** from the **Gangotri Glacier** in the Indian Himalayas to the **Bay of Bengal**. To over a billion people it is not just a river — it is **Ganga Ma** ('Mother Ganga'), a living goddess descended from heaven.

### Course and Geography
- **Source**: Gangotri Glacier in Uttarakhand, at about 4,000 m elevation.
- **Major tributaries**: Yamuna, Ghaghara, Gandak, Kosi, Son.
- **Cities on its banks**: Rishikesh, Haridwar, Kanpur, Varanasi, Patna, Kolkata.
- **Delta**: The world's largest delta — the **Sundarbans** — where the Ganges meets the Brahmaputra, covering about 105,000 km² of mangrove forest that is home to the **Bengal tiger**.

### Religious Significance
According to Hindu mythology, Ganga originally flowed only in heaven. King Bhagiratha performed intense penance to bring her down to Earth to liberate the souls of his ancestors. To prevent the force of her descent from shattering the planet, **Lord Shiva caught her in his matted hair**, releasing her gently as a river. Hindus believe bathing in the Ganges washes away sins, and **Varanasi** (Kashi) — the world's oldest continuously inhabited city — is the holiest place to die and be cremated on its banks.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Length | ~2,525 km |
| Source | Gangotri Glacier, Uttarakhand |
| Mouth | Bay of Bengal (Sundarbans delta) |
| Basin population | ~400 million |
| Religious status | Goddess in Hinduism |

### Pollution Crisis
Despite its holiness, the Ganges is among the **world's most polluted rivers**. Daily inputs include untreated sewage from dozens of cities, industrial chemicals from Kanpur's leather tanneries, religious offerings, and partially-cremated bodies. The **Ganga Action Plan** launched in 1985 and later **Namami Gange** (2014) have spent billions on cleanup, but progress remains slow.

**Why it matters:** The Ganges sustains 400 million people and the spiritual life of Hinduism. The paradox of a river worshipped as pure while being ecologically broken captures the deepest tension between faith and modern environmental responsibility.`,
  },
  {
    id: 'indus-river',
    patterns: [/\b(indus river|indus darya|sindh darya|sindh nadi|indus valley civilization|darya e sindh)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Indus River — Cradle of South Asian Civilisation

The Indus River flows about **3,180 kilometres (1,976 miles)** from its source near **Lake Mansarovar** in Tibet, through the **Ladakh region of India** and the length of **Pakistan**, before emptying into the **Arabian Sea** near Karachi. The name 'India' itself derives from 'Indus' — the ancient Persians and Greeks called the land beyond this river **Hindos** or **Indos**.

### Course and Geography
- **Source**: Near Lake Mansarovar in Tibet, at about 5,200 m elevation.
- **Indian stretch**: Flows northwest through Ladakh, then through the Karakoram range.
- **Pakistani stretch**: Enters at the Baltistan region, then runs the entire length of Pakistan to the Arabian Sea.
- **Major tributaries**: Jhelum, Chenab, Ravi, Beas, Sutlej (the **five rivers of Punjab**, whose name means 'land of five waters').

### The Indus Valley Civilisation
Around **2600–1900 BCE**, the Indus gave birth to one of the world's earliest urban civilisations, alongside Mesopotamia and Egypt. Major cities **Mohenjo-daro** and **Harappa** had:
- **Grid-planned streets** and standardised brick sizes.
- **Sophisticated drainage** and indoor plumbing — better than many cities today.
- A still-undeciphered script with about 400 symbols.
- Trade links reaching Mesopotamia.

The civilisation mysteriously declined, likely due to **river course shifts, climate change, and tectonic activity**.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Length | ~3,180 km |
| Source | Lake Mansarovar, Tibet |
| Mouth | Arabian Sea, near Karachi |
| Basin countries | China, India, Pakistan, Afghanistan |
| Oldest cities | Harappa, Mohenjo-daro |

### Modern Importance and Water Conflict
- The **Indus Waters Treaty of 1960** between India and Pakistan, brokered by the **World Bank**, is one of the longest-standing water-sharing agreements between rival nations.
- Pakistan's agriculture — especially wheat, rice, and cotton in **Punjab and Sindh** — depends almost entirely on Indus irrigation.
- The **Tarbela Dam** and **Mangla Dam** provide hydroelectricity and flood control.
- Climate change is shrinking the Himalayan glaciers that feed the river, threatening long-term water security for 200+ million people.

**Why it matters:** The Indus is older than history itself — it named a subcontinent and cradled its first cities. Today its waters decide the fate of two nuclear-armed nations and remain a fragile thread of cooperation in a volatile region.`,
  },
  {
    id: 'gobi-desert',
    patterns: [/\b(gobi desert|gobi|asia ka sehra|gobi sehra|gobi ka sehra|mongolia ka sehra)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Gobi Desert — Asia's Cold Desert

The Gobi is a vast **rain-shadow desert** in **northern China and southern Mongolia**, covering roughly **1,295,000 square kilometres** (about 500,000 sq miles). Unlike the hot sandy Sahara, the Gobi is a **cold winter desert** — temperatures can plunge to **-40°C** in January and soar to **+45°C** in July. Its name comes from the **Mongolian word 'gobi'**, meaning 'waterless place'.

### Geography and Climate
- Bounded by the **Altai Mountains** and **Mongolian steppes** to the north and the **Tibetan Plateau** to the southwest.
- Lies in the **Himalayan rain shadow** — moisture from the Indian Ocean is blocked by the high mountains.
- Mostly **rocky and gravelly** (called 'hamada'), with only about **5% sand dunes**.
- Receives as little as **100–200 mm** of precipitation annually, much of it as snow.

### History and the Silk Road
The Gobi was a critical section of the ancient **Silk Road**, the trade network connecting China with Central Asia and Europe. Famous Silk Road cities on or near its edges include:
- **Dunhuang** — site of the Mogao Caves with thousands of Buddhist murals.
- **Kashgar** — trading hub linking China, India, and Persia.
- **Samarkand** and **Bukhara** (further west).

**Genghis Khan** and his Mongol Empire launched their conquests from the Gobi's northern steppes in the 13th century.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Area | ~1,295,000 km² |
| Location | China and Mongolia |
| Type | Cold winter desert |
| Annual rainfall | 100–200 mm |
| Temperature range | -40°C to +45°C |

### Wildlife and Dinosaurs
The Gobi is home to **Bactrian camels** (two-humped), **snow leopards**, **Gobi bears** (one of the rarest bears on Earth, fewer than 40 left), and **Mongolian wild asses**. It is also one of the world's richest **fossil beds** — Roy Chapman Andrews' 1920s expeditions discovered the first **dinosaur eggs** here, along with **Velociraptor** and **Oviraptor** skeletons.

### Modern Threat
The Gobi is **expanding rapidly** due to **desertification** caused by overgrazing, deforestation, and climate change. China is fighting back with the **'Great Green Wall'** — the world's largest afforestation project — planting millions of trees along the desert's southern edge to slow the sand's advance toward Beijing.

**Why it matters:** The Gobi is a living museum of Earth's deep past — preserving dinosaur eggs, Silk Road cities, and rare cold-desert wildlife. Its advancing sands are a warning about how human pressure turns grasslands into desert.`,
  },
  {
    id: 'antarctica-continent',
    patterns: [/\b(antarctica|antarctica continent|south pole|south pole ka continent|antarktika|baraf ka continent)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Antarctica — The Frozen Continent

Antarctica is the **fifth-largest continent**, covering about **14 million square kilometres** — roughly twice the size of Australia. It is the **coldest, driest, windiest, and highest** of all continents, with an average elevation of about **2,500 metres** due to its massive ice sheet. About **98% of its surface is covered by ice** averaging 1.9 km thick.

### Geography
- Located almost entirely **south of the Antarctic Circle** (66°33′S).
- Surrounded by the **Southern Ocean** (also called the Antarctic Ocean).
- Divided by the **Transantarctic Mountains** into **West Antarctica** (smaller, mostly below sea level) and **East Antarctica** (larger, bulkier ice dome).
- Holds about **60% of the world's fresh water** locked in ice.
- If all Antarctic ice melted, global sea levels would rise by about **58 metres**.

### Climate
- **Coldest temperature recorded**: -89.2°C at Russia's **Vostok Station** in July 1983 (later satellite data suggests -98°C in some spots).
- Coastal temperatures in summer barely reach **+5°C**.
- The interior is a **polar desert** — parts of the Dry Valleys have not had rain for **2 million years**.
- **Katabatic winds** race down the ice dome at speeds over 200 km/h.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Area | ~14,000,000 km² |
| Ice cover | 98% of surface |
| Population | ~1,000 winter, ~5,000 summer (researchers only) |
| Lowest temp | -89.2°C (Vostok) |
| Governing treaty | Antarctic Treaty (1959) |

### Wildlife
Despite the harshness, life thrives in the surrounding ocean:
- **Emperor penguins** — the only species that breeds during the brutal winter.
- **Adélie, Chinstrap, and Gentoo penguins** nest on the peninsula.
- **Weddell, leopard, and crabeater seals**.
- **Krill** — tiny shrimp-like creatures that form the base of the entire food web, weighing a combined 500 million tonnes.

### Science and Governance
The **Antarctic Treaty**, signed in 1959 by 12 nations and now joined by 54, **bans military activity, mining, and nuclear waste** on the continent. It dedicates Antarctica exclusively to **peaceful scientific research**. Research stations from many countries study climate history by drilling **ice cores** that contain air bubbles up to 800,000 years old, revealing past CO2 levels.

**Why it matters:** Antarctica is Earth's thermostat — its ice reflects sunlight, cools the planet, and drives ocean currents. Its ice cores hold the climate memory of our planet, and the 1959 treaty stands as proof that nations can cooperate to protect wilderness for science instead of profit.`,
  },
  {
    id: 'arctic-circle',
    patterns: [/\b(arctic circle|arctic|north pole|north pole ka ilaqa|arktik|tundra region)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Arctic Circle — Land of the Midnight Sun

The **Arctic Circle** is one of Earth's five major circles of latitude, located at approximately **66°33′ North**. Everything north of this line experiences at least **one day per year when the sun never sets** (the midnight sun around the June solstice) and **one day when it never rises** (the polar night around the December solstice). The exact position of the circle shifts slightly each year as Earth's axial tilt wobbles between 22.1° and 24.5°.

### Geography
- Passes through **eight countries**: Norway, Sweden, Finland, Russia, the United States (Alaska), Canada, Denmark (Greenland), and Iceland (just touching Grímsey island).
- Total Arctic region covers about **14.5 million km²** of land and ocean.
- Includes the **Arctic Ocean**, which is largely covered by **sea ice** that expands in winter and shrinks in summer.

### Climate and Tundra
The Arctic has a **polar climate** with long, cold winters and short, cool summers. Most land is **tundra** — a treeless biome where **permafrost** (permanently frozen ground) extends hundreds of metres deep. Only the top layer thaws in summer, allowing low plants like **mosses, lichens, sedges, and dwarf shrubs** to grow. Trees cannot survive because their roots cannot penetrate the permafrost — the line where trees stop is called the **tree line**.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Latitude | 66°33′N (approximate) |
| Countries | 8 |
| Indigenous peoples | Inuit, Sámi, Nenets, Chukchi, Yupik |
| Ocean | Arctic Ocean |
| Largest island | Greenland (within Arctic) |

### Wildlife
- **Polar bears** hunt seals on sea ice — classified as marine mammals.
- **Arctic foxes** change fur from white (winter) to brown (summer).
- **Reindeer (caribou)**, **musk oxen**, **walruses**, **narwhals**, and **beluga whales**.
- **Arctic terns** migrate from Arctic to Antarctic each year — the longest annual migration of any animal.

### Indigenous Peoples and Modern Threats
About **4 million people** live in the Arctic, including the **Inuit**, **Sámi**, **Nenets, Chukchi, and Yupik**. Their cultures are built around hunting, herding reindeer, and surviving extreme cold. The Arctic is warming roughly **four times faster** than the global average — summer sea ice is shrinking, threatening polar bears, indigenous cultures, and accelerating warming through the **albedo effect** (less ice = less sunlight reflected = more warming).

**Why it matters:** The Arctic is the early-warning system for climate change. What happens to its ice, permafrost, and wildlife is a preview of what the rest of the planet will face — and indigenous cultures that have survived here for millennia may not survive the next century.`,
  },
  {
    id: 'pacific-ocean',
    patterns: [/\b(pacific ocean|pacific samandar|sab se bara samandar|pacifik|pacific sea)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Pacific Ocean — The Largest Body of Water

The **Pacific Ocean** is the **largest and deepest ocean on Earth**, covering about **165.25 million square kilometres** (64 million sq miles) — larger than all of Earth's landmasses combined. It contains roughly **half of the planet's open ocean water** and stretches from the **Arctic in the north to the Southern Ocean in the south**, bounded by **Asia and Australia on the west** and **the Americas on the east**. Its name was given in 1521 by Portuguese explorer **Ferdinand Magellan**, who called it 'Mar Pacífico' ('peaceful sea') after finding unusually calm waters while crossing it.

### Geography
- **Widest point**: about 19,800 km between Colombia and the Malay Peninsula.
- **Deepest point**: the **Challenger Deep** in the **Mariana Trench**, at **10,935 metres** below sea level — deeper than Mount Everest is tall.
- **Volume**: about 710 million cubic kilometres of water.
- **Equator divides** it into the **North Pacific** and **South Pacific**.

### The Ring of Fire
The Pacific is bordered by the **Pacific Ring of Fire**, a horseshoe-shaped belt of intense volcanic and seismic activity that:
- Contains about **75% of the world's active volcanoes**.
- Produces about **90% of the world's earthquakes**.
- Includes the **Japan Trench**, the **Chile-Peru Trench**, and the long subduction zones off Alaska and Kamchatka.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Area | 165,250,000 km² |
| Deepest point | Mariana Trench (10,935 m) |
| Avg depth | 4,280 m |
| Islands | ~25,000 (more than any other ocean) |
| Major currents | North & South Equatorial, Kuroshio, California, Humboldt |

### Island Groups
The Pacific holds roughly **25,000 islands** — more than the rest of the world's oceans combined. They are grouped into three cultural regions:
- **Melanesia** — Papua New Guinea, Fiji, Solomon Islands, Vanuatu.
- **Micronesia** — Guam, Palau, Marshall Islands.
- **Polynesia** — Hawaii, New Zealand, Samoa, Tonga, Tahiti, Easter Island.

### Threats
- **Plastic pollution**: the **Great Pacific Garbage Patch**, a swirling gyre of floating debris, is estimated at **1.6 million km²** — about three times the size of France.
- **Coral bleaching** from warming seas.
- **Overfishing** of tuna, sharks, and other species.
- **Sea-level rise** threatens low-lying island nations like Kiribati and Tuvalu, which may become uninhabitable within this century.

**Why it matters:** The Pacific is the beating heart of Earth's climate system — its currents carry heat from equator to poles, its phytoplankton produce much of our oxygen, and its Ring of Fire constantly reshapes the planet's surface. Whatever happens to the Pacific happens to the world.`,
  },
  {
    id: 'atlantic-ocean',
    patterns: [/\b(atlantic ocean|atlantic samandar|doosra bara samandar|atlantik ocean|atlantic sea)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Atlantic Ocean — The Ocean Between Worlds

The **Atlantic Ocean** is the **second-largest ocean on Earth**, covering about **106.46 million square kilometres** — roughly 20% of the Earth's surface and 29% of its ocean water. It separates the **Old World** (Europe and Africa) from the **New World** (the Americas), and its name comes from **Greek mythology** — the sea beyond the **Pillars of Hercules** (the Strait of Gibraltar), named after the Titan **Atlas**.

### Geography
- **Shape**: an elongated S-shaped basin between the Americas (west) and Europe/Africa (east).
- **Equator divides** it into the **North Atlantic** and **South Atlantic**.
- **Connects** to the Arctic (north), Pacific (via Drake Passage and Panama Canal), Indian (around South Africa), and Southern Oceans.
- **Average depth**: 3,646 m; **deepest point**: the **Milwaukee Deep** in the **Puerto Rico Trench** at 8,376 m.

### The Mid-Atlantic Ridge
Running like a giant spine down the centre of the Atlantic is the **Mid-Atlantic Ridge** — the longest mountain range on Earth, about **65,000 km long** and mostly underwater. Here, tectonic plates pull apart and **new oceanic crust is born** from rising magma. Iceland sits directly on this ridge, which is why it has so many active volcanoes and hot springs.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Area | 106,460,000 km² |
| Deepest point | Milwaukee Deep (8,376 m) |
| Avg depth | 3,646 m |
| Major seas | Caribbean, Mediterranean, Baltic, Black, North Sea |
| Notable currents | Gulf Stream, North Atlantic Drift, Canary Current |

### The Gulf Stream — A Climate Superpower
The **Gulf Stream** is a powerful warm ocean current that originates in the **Gulf of Mexico**, flows up the east coast of North America, and crosses the Atlantic as the **North Atlantic Drift**. It carries warmth to **Western Europe**, which is why:
- **London and Paris** have milder winters than cities at similar latitudes in Canada.
- **Palm trees grow** in southwest England and western Scotland.
- Norway's coast stays ice-free despite being above the Arctic Circle.

### Human History
- Highway for **Columbus's 1492 voyage** and the **Columbian Exchange** of plants, animals, diseases, and people.
- Carried the **transatlantic slave trade** — roughly **12 million Africans** were forcibly transported between the 16th and 19th centuries.

### Modern Threats
- **Slowing Gulf Stream**: Greenland meltwater freshens the North Atlantic, weakening the current that keeps Europe warm.
- **Hurricanes** like Katrina and Maria intensify over the warm tropical Atlantic.
- **Oil spills** (Deepwater Horizon, 2010) and **overfishing** of cod, tuna, and sharks.

**Why it matters:** The Atlantic is the ocean that connected — and often violently collided — the world's civilisations. Its currents decide European climate, its storms shape American coasts, and its history still echoes through the cultures of four continents.`,
  },
  {
    id: 'himalaya-mountains',
    patterns: [/\b(himalaya|himalayas|himalaya pahar|himalaya ka silsila|him?alay mountains|himalay)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## The Himalayas — The Roof of the World

The **Himalayas** are the **highest mountain range on Earth**, stretching about **2,400 kilometres (1,500 miles)** from the **Indus River valley in the west** to the **Brahmaputra River valley in the east**. They span **five countries**: India, Nepal, Bhutan, China (Tibet), and Pakistan. The name comes from **Sanskrit** — 'hima' means 'snow' and 'ālaya' means 'abode', so **Himalaya means 'Abode of Snow'**.

### Formation
The Himalayas are the **youngest fold mountains on Earth**, born about **50 million years ago** when the **Indian tectonic plate** broke off from **Gondwana**, drifted north, and slammed into the **Eurasian plate**. The collision **crumpled and uplifted** the ancient **Tethys Sea sediments** — which is why marine fossils of **ammonites and sea lilies** are found at Everest's summit. India is still pushing north and the Himalayas continue rising about **5 mm per year**.

### Geography and Major Peaks
The Himalayas contain **all 14 of Earth's peaks above 8,000 metres**, including:
- **Mount Everest** (8,849 m) — highest in the world.
- **K2** (8,611 m) — second highest, in the Karakoram range.
- **Kangchenjunga** (8,586 m) — third highest, on the India–Nepal border.
- **Annapurna**, **Nanga Parbat**, **Makalu**, **Lhotse**, **Manaslu**.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Length | ~2,400 km |
| Width | 150–350 km |
| Highest peak | Mount Everest (8,849 m) |
| Age | ~50 million years |
| Countries | India, Nepal, Bhutan, China, Pakistan |

### Rivers Born Here
The Himalayas are the **source of three major river systems** that sustain nearly **2 billion people**:
- The **Indus** and its five Punjab tributaries.
- The **Ganges** with Yamuna, Ghaghara, and Kosi.
- The **Brahmaputra** (called Yarlung Tsangpo in Tibet).

These rivers carry Himalayan snowmelt across the plains of South Asia, making them among the most fertile and densely populated regions on Earth.

### Climate and Life
- **Lower foothills (Shivaliks)**: subtropical forests with tigers, elephants, and rhinos.
- **Middle ranges**: temperate forests of oak, rhododendron, and pine.
- **Alpine zone (above 3,500 m)**: meadows with blue sheep, marmots, and the elusive **snow leopard**.
- **High Himalaya (above 5,000 m)**: permanent ice and rock, inhabited only by hardy birds like the **Himalayan griffon** and the snowcock.

**Why it matters:** The Himalayas act as Asia's great **climate wall** — they block cold Central Asian winds from reaching India and trap the **monsoon** moisture that waters a billion farms. They are also Earth's third pole, holding the largest store of ice and fresh water outside the Arctic and Antarctic.`,
  },
  {
    id: 'alps-mountains',
    patterns: [/\b(alps|alps mountain|alps pahar|europe ke pahar|alpine mountains)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## The Alps — Europe's Mountain Heart

The **Alps** are the highest and most extensive mountain range system that lies **entirely in Europe**, stretching about **1,200 kilometres (750 miles)** across **eight countries**: France, Monaco, Italy, Switzerland, Liechtenstein, Austria, Germany, and Slovenia. They form a crescent shape from the **Mediterranean coast of France** in the west to the **Pannonian Basin near Vienna** in the east.

### Formation
Like the Himalayas, the Alps are **fold mountains** formed by the collision of the **African and Eurasian tectonic plates**. This process began about **65 million years ago** and continues today — the Alps are still rising, but erosion keeps their height roughly stable. Marine fossils found high in the Alps (such as on the ** Matterhorn's summit**) prove these rocks were once at the bottom of an ancient sea called **Tethys**.

### Geography and Peaks
- **Highest peak**: **Mont Blanc** (4,809 m / 15,777 ft), on the France–Italy border.
- **Matterhorn** (4,478 m) — iconic pyramid-shaped peak on the Swiss–Italian border.
- **Jungfrau, Eiger, and Mönch** — famous trio in the Swiss Bernese Oberland.
- **Großglockner** (3,798 m) — highest in Austria.
- **Piz Bernina** (4,049 m) — highest in the Eastern Alps.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Length | ~1,200 km |
| Highest peak | Mont Blanc (4,809 m) |
| Countries | 8 |
| Major passes | Brenner, Gotthard, Mont Cenis, Great St Bernard |
| Climate influence | Blocks cold northern winds from reaching Mediterranean |

### Climate and Water Tower
The Alps are often called **'the water tower of Europe'** — their snowmelt feeds major rivers including the **Rhine, Rhône, Danube, and Po**, supplying water to roughly **170 million people**. They also shape Europe's climate by acting as a barrier between the mild Mediterranean south and the colder continental north.

### Wildlife
Despite heavy human pressure, the Alps still host:
- **Alpine ibex** — sure-footed mountain goat with huge curved horns.
- **Chamois** — agile goat-antelope.
- **Golden eagle** and **bearded vulture** (lammergeier).
- **Marmots**, **lynx**, and a slowly returning **brown bear** population.
- Edelweiss — the iconic white alpine flower.

### Human Culture
- About **120 million tourists per year** visit for skiing, hiking, and mountaineering.
- **Chamonix, France** hosted the first **Winter Olympics in 1924**.
- Traditional alpine culture includes **yodelling, alphorn music, and cattle transhumance** (seasonal herd movement).

### Threats
- The Alps have lost about **60% of their glacier volume since 1850**; many small glaciers may vanish by 2050.
- **Permafrost thaw** causes rockfalls on peaks like the Matterhorn.
- **Biodiversity loss** from ski-resort expansion.

**Why it matters:** The Alps are the green heart of Europe — they shape its weather, supply its rivers, host its most-loved tourist regions, and define the cultural identity of Switzerland, Austria, and parts of France, Italy, and Germany. Their melting glaciers are a clear warning of how fast climate is changing.`,
  },
  {
    id: 'andes-mountains',
    patterns: [/\b(andes|andes mountains|andes pahar|south america ke pahar|andes mountain range)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## The Andes — The Longest Mountain Range on Earth

The **Andes** are the **longest continental mountain range in the world**, stretching about **7,000 kilometres (4,350 miles)** along the entire western edge of **South America** — from **Venezuela in the north** through Colombia, Ecuador, Peru, Bolivia, Chile, and Argentina, all the way to **Tierra del Fuego in the south**. They are also the **highest mountain range outside Asia**, with an average elevation of about 4,000 m.

### Formation
The Andes are a relatively young mountain range, formed by the **subduction of the oceanic Nazca Plate** beneath the **South American Plate**. As the Nazca plate dives under, it melts, and the rising magma feeds a chain of volcanoes and pushes the land upward. The range is **still actively rising**, and the region experiences frequent **earthquakes and volcanic eruptions**.

### Highest Peaks
- **Aconcagua** (6,961 m) — highest peak in the Andes, the Americas, and the Southern Hemisphere. Located in Argentina near the Chilean border.
- **Ojos del Salado** (6,893 m) — highest active volcano in the world, on the Argentina–Chile border.
- **Monte Pissis** (6,793 m) and **Huascarán** (6,768 m) in Peru.
- **Chimborazo** (6,263 m) in Ecuador — its summit is the **farthest point on Earth from the centre** (because Earth bulges at the equator).

### Key Facts
| Aspect | Detail |
|--------|--------|
| Length | ~7,000 km |
| Highest peak | Aconcagua (6,961 m) |
| Countries | 7 (Venezuela to Argentina) |
| Avg elevation | ~4,000 m |
| Age | ~65 million years (still rising) |

### Climate and Ecosystems
The Andes span an extraordinary range of climates:
- **Tropical cloud forests** on the eastern slopes (Colombia, Ecuador).
- The **Altiplano** — a high plateau averaging 3,750 m, home to Lake Titicaca (the world's highest navigable lake).
- **Atacama Desert** — the driest non-polar desert on Earth, in the Andean rain shadow of northern Chile.
- **Patagonian Andes** in the south — heavily glaciated, with fjords and ice fields.

### Cultural Heritage
- The Andes were the home of the **Inca Empire** (1438–1533), whose capital **Cusco** sits at 3,400 m.
- **Machu Picchu**, the famous Inca citadel, perches on an Andean ridge at 2,430 m.
- **Quinoa, potatoes, and tomatoes** were domesticated in Andean valleys — these crops now feed the world.
- Indigenous peoples like the **Quechua and Aymara** still farm terraced Andean slopes using techniques developed before the Incas.

### Resources and Threats
- The Andes hold huge deposits of **copper, silver, gold, lithium, and tin** — Chile and Peru are the world's top copper producers.
- **Glaciers are retreating** rapidly, threatening water supplies for millions in cities like **La Paz, Quito, and Lima**.
- Mining causes **water pollution** and conflicts with indigenous communities.

**Why it matters:** The Andes are the spine of South America — they shape its weather, hold its water, host its oldest civilisations, and supply minerals the modern world depends on. The fate of millions in Andean cities is tied to the fate of their glaciers.`,
  },
  {
    id: 'congo-rainforest',
    patterns: [/\b(congo rainforest|congo forest|congo jungle|africa ka jungle|congo basin|congo barish ka jungle)\b/i],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `## Congo Rainforest — Africa's Green Heart

The **Congo Rainforest** is the **second-largest tropical rainforest in the world** after the Amazon, covering about **1.5 million square kilometres** across the **Congo Basin** of central Africa. It spans six countries — the **Democratic Republic of the Congo** (largest share), **Republic of the Congo, Gabon, Cameroon, Equatorial Guinea, and the Central African Republic**.

### Geography and Climate
- Sits on either side of the **Equator**, in the drainage basin of the **Congo River** — the world's second-largest river by discharge.
- Receives **1,500 to 2,000 mm** of rain annually, distributed fairly evenly through the year.
- Humidity stays above **80%** and temperatures hover between **23°C and 28°C** year-round.
- Contains the deepest river in the world — the Congo River reaches depths over **220 metres**.

### Unique Wildlife
The Congo is the only place on Earth where certain species live:
- **Bonobos** — close relatives of chimpanzees, found only south of the Congo River. They are famously peaceful, matriarchal, and resolve conflict through social bonding rather than violence.
- **Okapi** — a giraffe-relative with zebra-like stripes on its legs, found only in the **Ituri Forest** of the DRC.
- **Eastern and Western lowland gorillas** — the largest living primates.
- **Forest elephants** — smaller and straighter-tusked than savanna elephants.
- **Congo peacock, bongo antelope, and pangolins**.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Area | ~1,500,000 km² |
| Location | Central Africa (6 countries) |
| Annual rainfall | 1,500–2,000 mm |
| Major river | Congo River (2nd largest by discharge) |
| Endemic species | Bonobo, okapi, Congo peacock |

### Carbon Storage
The Congo rainforest stores an estimated **25–30 billion tonnes of carbon** in its trees and soils — making it one of Earth's most important carbon sinks. It also generates much of the rainfall that sustains agriculture across the Sahel and parts of southern Africa through a process called **'the forests pump rain'** — trees release moisture that falls again hundreds of kilometres away.

### Indigenous Peoples
The **Mbuti, Baka, Twa, and Aka peoples** — often called **'Pygmies'** though the term is sometimes considered derogatory — have lived as **hunter-gatherers** in the Congo forest for tens of thousands of years. Their cultures, music, and deep knowledge of the forest are part of humanity's oldest continuous traditions.

### Threats
- **Commercial logging** opens roads that bring poachers.
- **Bushmeat hunting** threatens gorillas, chimpanzees, and forest elephants.
- **Mining** for **coltan, cobalt, gold, and diamonds** destroys habitat; these minerals end up in smartphones and electric-car batteries.
- A drying climate trend may convert parts of the forest to savanna by the end of the century.

**Why it matters:** The Congo rainforest is Africa's greatest natural treasure — home to species found nowhere else, indigenous cultures older than history, and a carbon store the planet cannot afford to lose. Every smartphone contains minerals that may have passed through it.`,
  },
  {
    id: 'great-barrier-reef',
    patterns: [/\b(great barrier reef|barrier reef|australia ka reef|coral reef australia|queensland reef)\b/i],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `## Great Barrier Reef — The Largest Living Structure on Earth

The **Great Barrier Reef** is the **world's largest coral reef system**, stretching about **2,300 kilometres (1,400 miles)** along the northeast coast of **Australia** in the **Coral Sea**, off the state of **Queensland**. It is so vast — covering roughly **344,400 square kilometres** — that it is **visible from space** and is the **only living structure visible from outer orbit**. It consists of about **2,900 individual reefs** and **900 islands**.

### Formation
The reef was built over **millions of years** by tiny animals called **coral polyps**, which secrete calcium carbonate skeletons. Each polyp is only a few millimetres across, but colonies of billions of them create massive reef structures. The current living reef sits on older dead reef foundations that are up to **2 million years old**.

### Biodiversity
The Great Barrier Reef is one of the most biodiverse ecosystems on Earth:
- Over **1,500 species of fish** — clownfish, parrotfish, reef sharks.
- About **400 hard coral** and **150 soft coral** species.
- **Six of the world's seven sea turtle species**.
- About **30 species of marine mammals** — whales, dolphins, dugongs.
- Over **200 species of birds** nest on its islands.
- **Giant clams** can weigh over 200 kg and live for 100 years.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Length | ~2,300 km |
| Area | 344,400 km² |
| Reefs | ~2,900 individual |
| Islands | ~900 |
| Species of fish | 1,500+ |

### Importance
- **Economic value**: contributes about **AUD $6.4 billion** to the Australian economy each year through tourism, supporting about **64,000 jobs**.
- **Cultural significance**: Aboriginal and Torres Strait Islander peoples have maintained a spiritual and practical connection to the reef for over **60,000 years**.
- **Protection**: declared a **Marine Park in 1975** and listed as a **UNESCO World Heritage Site in 1981**.

### Threats and Bleaching
- **Mass coral bleaching** events occurred in **2016, 2017, 2020, 2022, and 2024** — caused by marine heatwaves. When water gets too warm, corals expel the symbiotic algae (**zooxanthellae**) that give them colour and food, turning them white. If temperatures stay high, the coral dies.
- **Crown-of-thorns starfish** outbreaks eat coral polyps; they are controlled by divers injecting them with bile salts.
- **Cyclones** physically smash reef structures.
- **Agricultural runoff** carries fertilisers that feed algae and crown-of-thorns larvae.
- The reef has lost roughly **50% of its coral cover** since the 1980s.

**Why it matters:** The Great Barrier Reef is a living wonder visible from space, an economic engine for Australia, and the home of thousands of species. Its repeated bleaching is one of the clearest signs that the oceans are warming faster than reefs can adapt — and once the coral goes, the fish, turtles, and tourism go with it.`,
  },
  {
    id: 'grand-canyon',
    patterns: [/\b(grand canyon|grand canyon usa|grand canyon arizona|colorado river canyon|grand kan?yon)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Grand Canyon — Earth's Greatest Geological Storybook

The **Grand Canyon** is a massive canyon carved by the **Colorado River** in the **U.S. state of Arizona**. It is about **446 kilometres (277 miles) long**, up to **29 kilometres (18 miles) wide**, and reaches depths of more than **1,857 metres (6,093 feet)**. Its layered bands of red, orange, brown, and grey rock expose nearly **2 billion years of Earth's geological history** — one of the most complete rock records visible anywhere on the planet.

### Formation
The canyon was carved by the **Colorado River** over the past **5 to 6 million years** as the **Colorado Plateau was uplifted**. The combination of uplift and relentless river erosion cut through layer after layer of sedimentary rock. The canyon is still **widening and deepening** today — the river carries about **half a million tons of sediment** per day toward the Gulf of California.

### Geologic Layers
Walking down into the canyon is like walking back in time. Key layers from rim to river include:
- **Kaibab Limestone** (~270 Ma) — top rim, formed at the bottom of an ancient sea.
- **Coconino Sandstone** (~275 Ma) — fossilised desert sand dunes.
- **Redwall Limestone** (~340 Ma) — cliff-forming marine limestone.
- **Tapeats Sandstone** (~525 Ma) — ancient beach deposits.
- At the very bottom, the **Vishnu Basement Rocks** (~1.7 billion years old) — ancient metamorphic schist and granite.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Length | 446 km |
| Width | up to 29 km |
| Depth | up to 1,857 m |
| Carved by | Colorado River |
| Youngest rock | Kaibab Limestone (~270 Ma) |
| Oldest rock | Vishnu Basement (~1.7 Ga) |

### Human History
- **Native American peoples** — including the **Hualapai, Havasupai, Hopi, Navajo, and Paiute** — have lived in and around the canyon for thousands of years. The Havasupai still live in a village deep inside the canyon called **Supai**, accessible only by foot, mule, or helicopter.
- **First European sighting**: **Francisco Vázquez de Coronado** in 1540, led there by Hopi guides.
- **Major John Wesley Powell** led the first river expedition through the canyon in **1869**, in wooden boats.
- Designated a **U.S. National Monument in 1908** by Theodore Roosevelt and a **National Park in 1919**.

### Tourism and Threats
- Receives about **6 million visitors per year** — one of the most-visited U.S. national parks.
- **Hiking rim-to-rim** takes 2–3 days on the Bright Angel or South Kaibab trails.
- About **12 deaths per year** occur from heat exhaustion, dehydration, and falls.
- **Constrained flows** from Glen Canyon Dam have changed the river's temperature, harming native fish like the **humpback chub**.

**Why it matters:** The Grand Canyon is more than scenery — it is a window into deep time. Standing on its rim, you can see almost 2 billion years of Earth's story written in stone. Protecting it means protecting one of the clearest records of how our planet was made.`,
  },
  {
    id: 'kalahari-desert',
    patterns: [/\b(kalahari desert|kalahari|africa ka sehra|kalahari sehra|kalahari ka sehra)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Kalahari Desert — Africa's Living Sand

The **Kalahari Desert** is a large **semi-arid sandy savanna** covering about **900,000 square kilometres (350,000 sq miles)** across **southern Africa** — extending into **Botswana, Namibia, and South Africa**, with edges reaching Zimbabwe and Angola. Despite being called a desert, the Kalahari is not a true desert — it receives too much rain (between 100 and 500 mm per year) to qualify as one. It is technically a **'thirstland'** or semi-desert, where deep sands prevent surface water from accumulating.

### Geography and Climate
- **Vast sand sheet**: averages about 200 m deep, part of the ancient **Kalahari Basin**.
- **Red colour**: caused by iron oxide coating the sand grains.
- **Summer rainfall** (December to February) brings dramatic thunderstorms.
- **Temperatures** can swing from -10°C on winter nights to +45°C on summer days.
- Most water drains into **pans** (shallow depressions) like **Makgadikgadi Pan** in Botswana, one of the largest salt flats in the world.

### Vegetation and Wildlife
Unlike the bare Sahara, the Kalahari is covered in **grasses, acacia trees, and scrub** supporting abundant wildlife:
- **Kalahari lion** — hunts in family prides with darker manes.
- **Meerkats** (suricates) — live in cooperative colonies with upright sentinels.
- **Gemsbok (oryx)** — antelope with long straight horns that can survive without drinking water.
- **Springbok, wildebeest, hartebeest, and eland**.
- **Brown hyena, Cape fox, and the rare wild dog**.
- **Camelthorn trees** — acacia species whose roots reach water 50 m below the surface.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Area | ~900,000 km² |
| Countries | Botswana, Namibia, South Africa |
| Annual rainfall | 100–500 mm |
| Type | Semi-arid sandy savanna |
| Largest pan | Makgadikgadi Pan |

### Indigenous Peoples
The **San people** (also called Bushmen or Basarwa) have lived in the Kalahari for at least **20,000 years** — one of the oldest continuous human cultures on Earth. They are famous for **persistence hunting** (chasing antelope for hours until it collapses), click languages, deep knowledge of plants like the **hoodia** (which suppresses hunger), and rock art dating back thousands of years. Tragically, many San have been **evicted from their ancestral lands** for game reserves and diamond mining — a continuing human-rights issue.

### Modern Importance
- The **Central Kalahari Game Reserve** is one of the largest protected areas in Africa (52,800 km²).
- The Kalahari sits above the **largest continuous stretch of sand in the world** — the ancient Kalahari Sand Sea.
- Cattle ranching and sheep farming have replaced much of the wild savanna in the south.

**Why it matters:** The Kalahari is a desert that is not really a desert — a place where life thrives on hidden water, where the San have lived for 20,000 years, and where meerkats and lions teach us how animals adapt to extremes. Its treatment of indigenous peoples is also a mirror for the world's broader injustices.`,
  },
  {
    id: 'volcanoes-explained',
    patterns: [/\b(volcano|volcanoes|jwalamukhi|volcano kaise phat'ta hai|volcano kaise phatta|jwalamukhi kaise banta|active volcano|dormant volcano)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Volcanoes — Earth's Pressure Valves

A **volcano** is an opening in the **Earth's crust** through which **molten rock (magma), gases, ash, and rock fragments** escape from deep underground to the surface. When this material erupts, it is called **lava** once it reaches the air. Volcanoes are essentially the planet's **pressure valves** — they release heat and gases from the Earth's interior.

### Why Volcanoes Form
Earth's outer shell is broken into about **15 major tectonic plates** that float on the hot, semi-liquid mantle below. Volcanoes form mainly in three settings:
1. **Subduction zones** — one plate dives under another, melts, and the magma rises. Examples: **Pacific Ring of Fire**, Andes, Japan.
2. **Divergent boundaries** — plates pull apart, allowing magma to rise. Example: **Mid-Atlantic Ridge**, Iceland.
3. **Hot spots** — plumes of hot mantle rise independently of plate boundaries. Examples: **Hawaii**, **Yellowstone**, **Galápagos**.

### Types of Volcanoes
- **Shield volcanoes** — broad, gently sloping, formed by fluid basaltic lava. Example: **Mauna Loa** in Hawaii.
- **Stratovolcanoes (composite)** — tall, steep, explosive, built from alternating layers of ash and lava. Examples: **Mount Fuji**, **Mount St. Helens**, **Vesuvius**.
- **Cinder cones** — small, steep hills formed from ejected cinders. Example: **Parícutin** in Mexico (born in a farmer's field in 1943).
- **Calderas** — huge depressions formed when a volcano's magma chamber empties and the summit collapses. Example: **Yellowstone**, **Crater Lake** (Oregon).
- **Fissure eruptions** — long cracks that ooze lava over wide areas. Example: **Laki** in Iceland (1783).

### Key Facts
| Aspect | Detail |
|--------|--------|
| Active volcanoes worldwide | ~1,500 |
| Underwater volcanoes | over 1 million estimated |
| Hottest lava | ~1,200°C (basalt) |
| Most active volcano | Kīlauea (Hawaii) |
| Deadliest eruption | Tambora (1815) — 71,000+ deaths |

### Famous Eruptions
- **Vesuvius (79 CE)** — buried Pompeii and Herculaneum in ash; about 2,000 died.
- **Tambora (1815)** — largest eruption in recorded history; caused the **'Year Without a Summer'** in 1816, with about 71,000–100,000 deaths.
- **Krakatoa (1883)** — explosion heard 4,800 km away; tsunamis killed 36,000+.
- **Mount St. Helens (1980)** — lateral blast killed 57 and flattened 600 km² of forest.
- **Eyjafjallajökull (2010)** — ash cloud shut down European airspace for weeks.

### Volcanic Benefits
- Create **fertile soil** (Java, Italy, Hawaii) — volcanic ash weathers into rich mineral soil.
- Source of **geothermal energy** (Iceland gets ~30% of electricity from geothermal).
- Many **islands** are entirely volcanic — Hawaii, Iceland, Galápagos, Tonga.
- Produce **precious minerals** like sulphur, pumice, and diamonds (from very deep eruptions).

**Why it matters:** Volcanoes built much of Earth's atmosphere and continue to create new land. They are dangerous neighbours but generous ones — they give us fertile soil, geothermal energy, islands, and a record of the planet's deep inner life.`,
  },
  {
    id: 'earthquakes-explained',
    patterns: [/\b(earthquake|earthquakes|zalzala|bhukamp|richter scale|richter|seismic waves|zalzala kaise aata)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Earthquakes — When the Earth Shakes

An **earthquake** is the sudden release of energy in the **Earth's crust** that creates **seismic waves** — vibrations that travel through the ground and shake the surface. Earthquakes happen when rocks under stress suddenly break or slip along a **geological fault**, releasing stored energy that has built up over decades or centuries.

### Why Earthquakes Happen
Earth's **lithosphere** is broken into about **15 major tectonic plates** that constantly move — typically a few centimetres per year. Where plates meet, they **push against each other** (convergent), **pull apart** (divergent), or **slide past each other** (transform, like California's **San Andreas Fault**). Stress builds up as rocks deform; when it exceeds the rock's strength, the rock snaps — releasing energy as seismic waves. The underground point where the rupture begins is the **focus (hypocentre)**; the point on the surface directly above is the **epicentre**.

### Types of Seismic Waves
- **P waves (Primary)** — fastest, push-pull motion, travel through solids, liquids, and gases.
- **S waves (Secondary)** — slower, side-to-side motion, travel only through solids (they don't cross the outer core — proving it's liquid).
- **Surface waves (Love and Rayleigh)** — slowest but most damaging; they roll along the surface, destroying buildings.

### Measuring Earthquakes
- **Richter Scale** (1935) — logarithmic; each whole number is 10x larger amplitude and ~32x more energy.
- **Moment Magnitude Scale (Mw)** — modern standard, based on actual energy released.
- **Modified Mercalli Intensity** — measures damage felt by people, on a scale of I to XII.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Earthquakes per year | ~500,000 detectable (~100 cause damage) |
| Largest ever recorded | Valdivia, Chile (22 May 1960) — Mw 9.5 |
| Most active zone | Pacific Ring of Fire (~80% of all quakes) |
| Seismograph | instrument that records seismic waves |
| Tsunami trigger | undersea quakes Mw 7.5+ |

### Famous Earthquakes
- **Lisbon (1755)** — Mw ~8.5; killed up to 100,000; sparked Enlightenment philosophy.
- **San Francisco (1906)** — Mw 7.9; fire destroyed the city; about 3,000 died.
- **Valdivia, Chile (1960)** — Mw 9.5; strongest ever recorded.
- **Sumatra (2004)** — Mw 9.1; caused the Indian Ocean tsunami, killing about **227,000 people**.
- **Haiti (2010)** — Mw 7.0; ~220,000 deaths due to poor construction.
- **Tōhoku, Japan (2011)** — Mw 9.0; tsunami triggered the **Fukushima nuclear disaster**.

### Predicting and Surviving
Earthquakes **cannot yet be reliably predicted**. Survival tips:
- **Drop, Cover, Hold On** — get under a sturdy table, cover your head, hold on.
- Stay away from windows, mirrors, and tall furniture.
- If outside, move to open ground away from buildings and power lines.
- If near the coast and shaking lasts more than 20 seconds — **head to high ground immediately**; a tsunami may arrive within minutes.

**Why it matters:** Earthquakes are the most deadly of natural hazards — they strike without warning, destroy cities in seconds, and can trigger tsunamis, fires, and landslides. Understanding plate tectonics and building earthquake-resistant structures is the difference between life and death for millions living on the Ring of Fire.`,
  },
  {
    id: 'tsunamis-explained',
    patterns: [/\b(tsunami|tsunamis|sunami|samandari toofan|sea wave earthquake|tsunami kaise banta|samundari lah?er)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Tsunamis — The Silent Waves of Destruction

A **tsunami** is a series of **enormous ocean waves** caused by a large, sudden displacement of seawater. The word comes from the **Japanese** 'tsu' (harbour) and 'nami' (wave) — meaning **'harbour wave'** — because Japanese fishermen would return home to find their harbours devastated by waves they never saw in the open ocean. Tsunamis are **not tidal waves**; they have nothing to do with tides.

### Causes
Tsunamis are triggered by any event that suddenly moves a huge volume of water:
- **Undersea earthquakes** (most common cause, ~80%) — when one tectonic plate thrusts up under another, the entire water column above is shoved upward.
- **Underwater volcanic eruptions** — like the **2022 Hunga Tonga eruption**, which sent a tsunami across the Pacific.
- **Landslides** into the ocean, including volcanic flank collapses.
- **Meteorite impacts** — rare but historically devastating.

### How Tsunamis Travel
- In the **deep ocean**, tsunami waves travel at jet-speed — about **800 km/h (500 mph)** — but are only **0.5–1 metre** tall, so ships barely notice them.
- As they approach **shallow coastal water**, they **slow to 30–80 km/h** but their energy compresses, growing to **10–30 metres tall**.
- They arrive as a **series** called a 'wave train', with the **third or fourth wave often the largest**.
- Before arrival, the sea often **rapidly recedes from the beach** — a deadly warning sign that frequently lures curious people to their deaths.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Open-ocean speed | ~800 km/h |
| Open-ocean height | 0.5–1 m |
| Coastal height | up to 30 m (record: 524 m in Lituya Bay 1958) |
| Wave spacing | 10–60 minutes between waves |
| Triggers | Earthquakes, volcanoes, landslides, impacts |

### Deadliest Tsunamis
- **2004 Indian Ocean tsunami** — triggered by **Mw 9.1 Sumatra earthquake** on 26 December 2004. Waves up to 30 m hit Indonesia, Sri Lanka, India, Thailand, and 10 other countries. Killed about **227,000 people** — one of the deadliest natural disasters in recorded history.
- **2011 Tōhoku tsunami** — triggered by **Mw 9.0 earthquake** off Japan. Waves up to 40 m killed about **19,000 people** and caused the **Fukushima Daiichi nuclear disaster**.
- **1883 Krakatoa** — volcano eruption generated tsunamis killing 36,000+ in Java and Sumatra.

### Warning Signs and Survival
- **Natural warning signs**: strong shaking lasting 20+ seconds near coast, sudden seawater recession, loud roaring from the ocean.
- The **Pacific Tsunami Warning Center** (PTWC, Hawaii) and **Indian Ocean Tsunami Warning System** monitor seismometers and ocean buoys (**DART system**).
- If you feel a strong earthquake near the coast — **do not wait for an official alert**. Run inland or uphill immediately — climbing to the **3rd floor or higher of a reinforced concrete building** can save you.
- Never go to the beach to watch a tsunami arrive — you cannot outrun a wave moving at highway speed.

**Why it matters:** Tsunamis are among the most lethal natural hazards — they cross entire oceans in hours, strike without much warning, and can kill a quarter of a million people in a single day. Knowing the natural warning signs and reacting instantly is the single most important survival skill for anyone living on a coast near a subduction zone.`,
  },
  {
    id: 'climate-zones',
    patterns: [/\b(climate zones|climate|mausam ke zone|tropical temperate polar|koppen|koppen classification|climate zones of earth)\b/i],
    intent: 'factual_question',
    topic: 'geography',
    response: () => `## Climate Zones — Earth's Great Climate Belts

A **climate zone** is a region of the Earth that has a relatively uniform pattern of **temperature, precipitation, and seasonal variation** over a long period (typically 30+ years). Climate zones are determined mainly by **latitude** (distance from the equator), but also by **altitude, ocean currents, prevailing winds, and distance from the sea**.

### The Three Main Climate Zones
The simplest classification divides Earth into **three broad latitudinal bands**:

1. **Tropical Zone (between 23.5°N and 23.5°S)**
   - Warm year-round; little temperature variation.
   - Includes **tropical rainforest, savanna, and monsoon** climates.
   - Examples: Amazon basin, Congo basin, Indonesia, central India.
   - Annual rainfall varies from 1,500 mm (savanna) to over 4,000 mm (rainforest).

2. **Temperate Zone (between 23.5° and 66.5°, both north and south)**
   - Four distinct seasons — spring, summer, autumn, winter.
   - Includes **Mediterranean, humid subtropical, marine west coast, humid continental, and subarctic** climates.
   - Examples: most of Europe, eastern North America, China, southern Australia, Argentina.

3. **Polar Zone (above 66.5°N and 66.5°S)**
   - Cold all year; summers short and cool, winters long and dark.
   - Includes **tundra** (some summer thaw) and **ice cap** (permanently frozen) climates.
   - Examples: Antarctica, Greenland, northern Siberia, Arctic Ocean coast.

### Köppen Climate Classification
The most widely used system was developed by **Wladimir Köppen** in 1884 and divides climates into **five main groups** (plus Highland H):

| Symbol | Climate Group | Example |
|--------|--------------|---------|
| **A** | Tropical | Singapore, Manaus |
| **B** | Dry (arid/semi-arid) | Sahara, Gobi |
| **C** | Temperate (mild mid-latitude) | London, New York |
| **D** | Continental (cold) | Moscow, Montreal |
| **E** | Polar | Antarctica, Siberia |
| **H** | Highland (altitude-driven) | La Paz, Quito |

### Key Facts
| Aspect | Detail |
|--------|--------|
| Main zones | 3 (tropical, temperate, polar) |
| Köppen main groups | 5 (A, B, C, D, E) |
| Köppen sub-types | ~30 |
| Deciding factors | latitude, altitude, currents, winds |
| Coldest zone | Polar ice cap (Antarctica) |

### Why Climate Zones Matter
- They determine **what crops can grow** — rice in tropical, wheat in temperate, almost nothing in polar.
- They shape **architecture and clothing** — flat roofs in dry climates, steep roofs in snowy ones.
- They drive **natural ecosystems** — tropical rainforests in A, deserts in B, temperate forests in C, taiga in D, tundra in E.
- About **40% of the world's population** lives in tropical and subtropical climates.

### Climate Change Impact
Global warming is **shifting climate zones** — deserts are expanding, tropical diseases are spreading poleward, the Arctic tundra is thawing, and areas once reliably temperate now face droughts, heatwaves, and wildfires. The **Köppen map of 2100** is projected to look noticeably different from today's, with significant agricultural and ecological consequences.

**Why it matters:** Climate zones are the planet's basic blueprint — they decide what lives where, what grows where, and how humans build their civilisations. Their shifting under climate change is one of the biggest threats to food security, biodiversity, and human settlement in this century.`,
  },
  {
    id: 'cloud-forests',
    patterns: [/\b(cloud forest|cloud forests|dhundh ka jungle|montane cloud forest|mist forest|nebulose forest)\b/i],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `## Cloud Forests — The Misty Mountain Jungles

A **cloud forest** (also called a **montane cloud forest**) is a tropical or subtropical evergreen forest that is **persistently covered by low-level cloud or mist**, usually at the **canopy level**. These unique ecosystems form on mountain slopes where warm, moisture-laden air is forced upward, cools, and condenses into a near-permanent blanket of fog. They are typically found between **1,200 and 3,000 metres elevation** in the tropics.

### Where Cloud Forests Are Found
- **Central and South America**: Costa Rica's **Monteverde** (the most famous cloud forest), the Andean cloud forests of Colombia, Ecuador, Peru, and Bolivia.
- **Africa**: the highlands of Cameroon, Ethiopia, and the Eastern Arc Mountains of Tanzania.
- **Asia**: the Western Ghats of India, mountains of Sri Lanka, the Himalayan foothills, Borneo, and the Philippines.
- **Caribbean**: Cuba, Hispaniola, Jamaica, and Puerto Rico.

### How Cloud Forests Work
Cloud forests are wet not just from rain (typically 1,500–3,000 mm/year) but from **cloud water interception** — leaves capture mist from passing clouds, and the water drips down to the ground. This 'horizontal precipitation' can add **20–60% more water** to the ecosystem than rainfall alone. Trees often have **small, thick leaves** to reduce water loss, and the canopy is permanently cool and humid.

### Biodiversity — Hotspots Within Hotspots
Cloud forests cover less than **1% of the world's land area** but contain remarkable biodiversity, with many **endemic species** found in a single mountain range:
- **Resplendent quetzal** — sacred bird of the Maya and Aztecs (Central America).
- **Mountain gorilla** — only in the cloud forests of Rwanda, Uganda, and DR Congo (Virunga Mountains).
- **Spectacled bear** — South America's only bear, inspiration for **Paddington Bear**.
- **Golden toad** of Costa Rica — declared extinct in 1989, an early victim of climate change.
- **Orchids**: cloud forests have the highest orchid diversity on Earth, plus carpeting **bromeliads, mosses, ferns, and lichens**.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Elevation | 1,200–3,000 m (typical) |
| Annual rainfall | 1,500–3,000 mm |
| Extra cloud water | +20–60% of rainfall |
| Global land area | under 1% |
| Endemism | extremely high |

### Importance as Water Towers
Cloud forests act as **natural sponges and water capture systems** for millions of people. Cities like **Quito, San José, and Bogotá** depend on cloud-forest catchments for their drinking water. The slow release of captured mist keeps mountain streams flowing year-round.

### Threats
- **Climate change** — as temperatures rise, the cloud base lifts higher up the mountains. Many cloud forests may dry out and convert to regular tropical forest within decades.
- **Deforestation** for agriculture, cattle grazing, and coffee plantations.
- **Fragmentation** — many cloud forests are now small, isolated patches.
- **Air pollution** — clouds in some tropical mountains have become more acidic.

**Why it matters:** Cloud forests are misty jewels of biodiversity — small in area but packed with species found nowhere else, and they water the cities of the tropics. Their slow disappearance under climate change is one of the most worrying and least-discussed environmental crises.`,
  },
  {
    id: 'wetlands-swamps',
    patterns: [/\b(wetland|wetlands|swamp|swamps|daldal|marsh|marshland|bog|fen|everglades|pantanal|sundarbans wetland)\b/i],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `## Wetlands and Swamps — Earth's Living Filters

**Wetlands** are ecosystems where **water is the primary factor** controlling the environment and the plants and animals that live there. They occur where the **water table is at or near the surface**, or where land is covered by shallow water — typically less than 6 metres deep. They include **swamps, marshes, bogs, fens, mangroves, and floodplains**, and they exist on every continent except Antarctica.

### Types of Wetlands
- **Marshes** — dominated by herbaceous plants (reeds, cattails); fresh, brackish, or salt water.
- **Swamps** — dominated by trees and shrubs; usually freshwater (e.g., **Okefenokee Swamp**).
- **Bogs** — acidic freshwater wetlands that build up **peat** (partially decayed plant matter); common in Ireland, Scandinavia, Russia.
- **Fens** — less acidic than bogs, fed by groundwater.
- **Mangroves** — coastal salt-tolerant forests; the **Sundarbans** is the world's largest, home to Bengal tigers.
- **Floodplains** — land beside rivers that floods seasonally.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Global coverage | about 6% of Earth's surface |
| Carbon stored | ~30% of all land-based carbon (peatlands) |
| Ramsar Convention | signed 1971, protects wetlands worldwide |
| Lost since 1700 | about 87% of wetlands |
| Largest wetland | Pantanal (Brazil, Bolivia, Paraguay) |

### Famous Wetlands
- **The Pantanal** — world's largest tropical wetland (~195,000 km²); highest density of jaguars on Earth.
- **The Everglades** (Florida, USA) — 'River of Grass', a slow-moving freshwater river 100 km wide.
- **The Sundarbans** — vast mangrove forest in the Ganges–Brahmaputra delta, home to swimming Bengal tigers.
- **Okavango Delta** (Botswana) — inland delta that floods the Kalahari each year.
- **Iraqi Marshes** — once drained by Saddam Hussein, partly restored after 2003; home of the **Marsh Arabs**.

### Why Wetlands Matter
- **Water purification** — wetland plants and microbes filter pollutants, nutrients, and heavy metals.
- **Flood control** — they absorb storm water like sponges, reducing flood peaks downstream.
- **Carbon storage** — peatlands store about **30% of all land-based carbon** despite covering just 3% of land.
- **Biodiversity** — wetlands support about **40% of all species** and are essential breeding grounds for fish, amphibians, and birds.
- **Coastal protection** — mangroves reduce storm-surge heights and protect coastlines from tsunamis.
- **Livelihoods** — hundreds of millions depend on wetlands for fishing, rice farming, and tourism.

### Threats
- **Drainage for agriculture and urban development** — the biggest cause of wetland loss.
- **Pollution** from fertilisers (causing algae blooms and dead zones) and industrial waste.
- **Climate change** — sea-level rise threatens coastal wetlands; droughts dry out inland ones.
- **Invasive species** like water hyacinth and nutria overwhelm native ecosystems.
- **Peat fires** — draining tropical peatlands in Indonesia causes massive CO₂-releasing fires.

### Protection
The **Ramsar Convention** (signed in Ramsar, Iran in 1971) is the international treaty for wetland conservation; over **2,500 Ramsar sites** cover more than 250 million hectares worldwide.

**Why it matters:** Wetlands are among the most productive and valuable ecosystems on Earth — they purify our water, store our carbon, protect our coasts, and shelter our wildlife. Yet we have destroyed 87% of them in 300 years. Protecting what remains is one of the cheapest and most effective tools against both climate change and biodiversity loss.`,
  },
  {
    id: 'coral-reefs-ecology',
    patterns: [/\b(coral reef|coral reefs|marjaari|coral biodiversity|coral ecology|reef ecosystem)\b/i],
    intent: 'factual_question',
    topic: 'nature',
    response: () => `## Coral Reefs — Rainforests of the Sea

**Coral reefs** are massive underwater structures built by tiny animals called **coral polyps**, which secrete calcium carbonate skeletons that accumulate over thousands of years into reefs. Although coral reefs cover **less than 1% of the ocean floor**, they support an estimated **25% of all marine species** — making them the most biodiverse marine ecosystems on Earth and earning them the nickname **'rainforests of the sea'**.

### What Corals Actually Are
A coral polyp is a tiny **cnidarian** animal — a soft-bodied sac with a mouth surrounded by stinging tentacles, related to jellyfish and sea anemones. The magic of reef-building corals is their partnership with **zooxanthellae** — single-celled algae that live inside the polyp's tissues. The algae photosynthesise, providing the coral with **up to 90% of its food** (sugars and amino acids), giving it **vibrant colour** (brown, green, yellow, pink), and helping it build its calcium carbonate skeleton faster. In return, the coral gives the algae a safe home and nutrients. This symbiosis is why reef corals need **clear, shallow, sunlit water** warmer than 18°C.

### Types of Reefs
- **Fringing reefs** — grow directly along coastlines; the most common type. Example: Red Sea reefs.
- **Barrier reefs** — separated from land by a lagoon. Example: **Great Barrier Reef** (Australia).
- **Atolls** — ring-shaped reefs surrounding a lagoon, formed when a volcanic island sinks. Example: **Maldives**, **Tuamotu Archipelago**.
- **Patch reefs** — small, isolated reefs within a lagoon.

### Key Facts
| Aspect | Detail |
|--------|--------|
| Ocean floor covered | less than 1% |
| Marine species supported | ~25% |
| Largest reef | Great Barrier Reef (2,300 km) |
| Coral species | ~6,000 known |
| Required temperature | 23–29°C (best) |

### Where Reefs Are Found
Coral reefs thrive in **tropical waters** between 30°N and 30°S, mainly in:
- The **Coral Triangle** (Indonesia, Philippines, Malaysia, Papua New Guinea, Solomon Islands, Timor-Leste) — the most biodiverse reef region on Earth.
- The **Great Barrier Reef** (Australia) — the largest single reef system.
- The **Red Sea** reefs — unusually heat-tolerant.
- The **Mesoamerican Reef** (Caribbean coast of Central America) — largest in the Atlantic.

### Biodiversity and Human Value
Reefs host thousands of species — **clownfish, parrotfish, reef sharks, manta rays, moray eels, octopuses, sea turtles, giant clams, and 4,000+ species of fish**. They protect coastlines from storms, support **500 million people** through food and tourism, and contribute about **$375 billion per year** to the global economy.

### Threats
- **Coral bleaching** — when water gets too warm (even 1–2°C above normal), corals expel their zooxanthellae, turn white, and slowly starve. Mass bleaching has hit every reef on Earth in the last decade.
- **Ocean acidification** — as the ocean absorbs more CO₂, water becomes more acidic, making it harder for corals to build skeletons.
- **Overfishing** of herbivorous fish lets algae smother corals.
- **Crown-of-thorns starfish** outbreaks eat coral polyps.
- **Pollution** from agricultural runoff and sunscreen chemicals.
- **Destructive fishing** — cyanide and blast fishing destroy reef structure.

Scientists estimate **50% of reefs are already dead or severely damaged**, and without drastic climate action, **90% could be gone by 2050**.

**Why it matters:** Coral reefs are the most beautiful and biodiverse structures in the ocean — they shelter a quarter of all sea life, feed half a billion people, and protect coastlines from storms. They are also among the most fragile ecosystems on Earth, and may become the first major planetary ecosystem to collapse under climate change.`,
  },
]
