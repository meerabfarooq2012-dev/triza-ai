/**
 * ============================================================
 *  TRIZA ENGINE — Knowledge Batch: History & Civilizations
 * ============================================================
 *
 *  15 hand-written entries covering world history: ancient
 *  civilizations, empires, revolutions, and modern conflicts.
 *  Each entry includes English + Roman Urdu trigger patterns
 *  so TRIZA can respond to multilingual user queries natively.
 *
 *  All responses: 250-400 words, markdown formatted,
 *  factually accurate. No external LLM — pure TypeScript
 *  knowledge base.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const HISTORY_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------
  // 1. ANCIENT GREECE
  // ----------------------------------------------------------
  {
    id: 'ancient-greece',
    patterns: [/\b(ancient greece|athens|sparta|greek democracy|plato|socrates|aristotle|younan|younan ka tareekh|athens democracy|sparta war|greece history)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## Ancient Greece — Cradle of Western Civilization

Flourishing between the 8th and 4th centuries BCE, **Ancient Greece** was not a single nation but a network of independent city-states called *polis*. The two most influential were **Athens** and **Sparta**, representing sharply different visions of society.

### Athens and the Birth of Democracy
Around 508 BCE, the reformer **Cleisthenes** introduced *demokratia* — rule by the people. Male citizens voted directly on laws, served on juries, and debated in the Assembly on the Pnyx hill. Athens also became the intellectual capital of the Mediterranean, hosting philosophers, dramatists, and sculptors whose works still shape Western thought.

### Sparta: The Warrior State
Sparta was organized entirely around military discipline. Boys entered the *agoge* training system at age seven. The state was ruled by two kings and a council of elders, and depended on the labor of enslaved *helots* who vastly outnumbered citizens.

### Philosophy and Learning
- **Socrates** (470-399 BCE) — questioned everything through dialogue; executed by hemlock
- **Plato** (428-348 BCE) — founded the Academy; wrote *The Republic*
- **Aristotle** (384-322 BCE) — tutored Alexander the Great; systematized logic, biology, ethics

### Key Periods
| Period | Years | Highlight |
|--------|-------|-----------|
| Archaic | 800-500 BCE | Homer's epics, city-states form |
| Classical | 500-323 BCE | Golden Age, Parthenon built |
| Hellenistic | 323-30 BCE | Alexander's empire spreads Greek culture |

The Greeks defeated Persia at Marathon (490 BCE) and Salamis (480 BCE), then turned on each other in the **Peloponnesian War** (431-404 BCE), which exhausted both Athens and Sparta.

**Why it matters:**
Ancient Greece laid the foundations of Western philosophy, democratic governance, theater, and rational inquiry. Ideas first debated in the Athenian Assembly and Plato's Academy — citizenship, logic, beauty, and the examined life — remain central to how the modern world thinks about politics, science, and the human condition.`,
  },

  // ----------------------------------------------------------
  // 2. ROMAN REPUBLIC
  // ----------------------------------------------------------
  {
    id: 'roman-republic',
    patterns: [/\b(roman republic|rome senate|punic wars|hannibal|julius caesar|qadeem rome|rome ka tareekh|roman empire before|republic rome|roman law)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## Roman Republic — Senate, Legions, and the Punic Wars

Founded in **509 BCE** after Romans expelled their Etruscan king Tarquin the Proud, the Roman Republic lasted nearly five centuries before transforming into the Empire. Power was deliberately divided to prevent any one man from ruling alone.

### Structure of Government
- **Senate** — 300 patrician elders who controlled finance and foreign policy
- **Consuls** — two elected annually; commanded armies and led the state
- **Tribunes of the Plebs** — defended common citizens (plebeians) against patrician abuse
- **Dictator** — appointed for six months only in crisis

### The Punic Wars (264-146 BCE)
Three wars against Carthage made Rome master of the Mediterranean.
| War | Years | Decisive Moment |
|-----|-------|-----------------|
| First Punic | 264-241 BCE | Rome builds its first navy, wins Sicily |
| Second Punic | 218-201 BCE | Hannibal crosses the Alps; Scipio defeats him at Zama |
| Third Punic | 149-146 BCE | Carthage burned to the ground |

### Conquest and Crisis
Victory brought wealth, slaves, and vast new territories — but also inequality. Small farmers lost land to senatorial estates, while generals like **Marius**, **Sulla**, **Pompey**, and **Julius Caesar** used loyal armies to dominate politics. Caesar crossed the Rubicon in 49 BCE, was declared dictator for life, and was assassinated on the Ides of March 44 BCE by senators fearing monarchy.

### Fall of the Republic
Caesar's heir **Octavian** defeated Mark Antony and Cleopatra at Actium in 31 BCE. In 27 BCE the Senate gave him the title *Augustus*. The Republic's institutions remained in name, but real power now rested with one man — the first Roman emperor.

**Why it matters:**
The Roman Republic bequeathed to posterity the concepts of mixed government, checks and balances, written law, and civic virtue. The American Founding Fathers studied Rome closely — naming their upper house 'Senate' and citing Cincinnatus and Cato as models. The Republic's collapse also warns how inequality, militarism, and ambitious leaders can erode a free constitution from within.`,
  },

  // ----------------------------------------------------------
  // 3. BYZANTINE EMPIRE
  // ----------------------------------------------------------
  {
    id: 'byzantine-empire',
    patterns: [/\b(byzantine empire|constantinople|eastern roman empire|byzantium|istanbul history|fall of constantinople|byzantine|justinian)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## Byzantine Empire — Rome's Eastern Heir

When Emperor **Diocletian** split the Roman Empire in 285 CE for easier administration, the eastern half gradually became what historians call the **Byzantine Empire**. Its capital, **Constantinople**, was founded by **Constantine the Great** in 330 CE on the site of ancient Byzantium, commanding the Bosphorus strait between Europe and Asia.

### A Greek-Speaking Rome
While the West fell to Germanic tribes in 476 CE, the East survived another thousand years. Byzantines called themselves *Romaioi* (Romans), but their everyday language was Greek, their religion Orthodox Christianity, and their culture a fusion of Roman law, Greek learning, and Christian faith.

### Justinian's Golden Age
Emperor **Justinian I** (r. 527-565) attempted to reconquer the Western Empire — briefly retaking Italy, North Africa, and southern Spain. His greater legacy was the **Corpus Juris Civilis**, the codification of Roman law that still underlies civil law in much of Europe.

### Landmarks and Achievements
- **Hagia Sophia** (537 CE) — dome 31 meters wide, marvel of engineering
- **Cyrillic script** — devised by Byzantine missionaries Cyril and Methodius for the Slavs
- **Greek fire** — secret incendiary weapon that saved Constantinople from Arab sieges
- **Iconography and mosaics** — defining Eastern Christian art

### Long Decline and Final Fall
| Century | Threat | Outcome |
|---------|--------|---------|
| 7th | Arab conquests | Lost Syria, Egypt, North Africa |
| 11th | Seljuk Turks | Lost Anatolia at Manzikert 1071 |
| 13th | Fourth Crusade | Crusaders sack Constantinople 1204 |
| 15th | Ottoman Turks | City falls May 29, 1453 |

The last emperor, **Constantine XI**, died fighting on the walls. Sultan Mehmed II renamed the city Istanbul and made Hagia Sophia a mosque.

**Why it matters:**
For a thousand years the Byzantine Empire was Europe's eastern shield, absorbing Persian, Arab, and Turkic invasions while Western Europe was still fragmented. It preserved Greco-Roman literature, codified Roman law, and converted the Slavic world to Orthodox Christianity — shaping Russia, Greece, the Balkans, and much of Eastern European identity today.`,
  },

  // ----------------------------------------------------------
  // 4. OTTOMAN EMPIRE
  // ----------------------------------------------------------
  {
    id: 'ottoman-empire',
    patterns: [/\b(ottoman empire|osman|suleiman magnificent|constantinople 1453|ottoman caliphate|sultan mehmed|khilafat usmania|usmani saltanat|turkey empire history|ottoman sultan)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## Ottoman Empire — Six Centuries of Sultans

Founded around **1299 CE** by **Osman I**, a Turkic tribal leader in Anatolia, the Ottoman Empire grew from a small frontier principality into a transcontinental superpower that ruled parts of three continents for over 600 years. It was finally abolished in 1922.

### Rise to Power
The Ottomans expanded into the vacuum left by the declining Byzantine and Seljuk states. In **1453**, the 21-year-old Sultan **Mehmed II** conquered Constantinople, ending the Byzantine Empire and making the city — renamed Istanbul — his capital. Successive sultans pushed into the Balkans, Egypt, Arabia, and Hungary.

### Suleiman the Magnificent
Reigning 1520-1566, **Suleiman I** (known in the East as *Suleiman the Lawgiver*) marked the empire's zenith. Under him the Ottomans besieged Vienna (1529), conquered Belgrade and Rhodes, dominated the Mediterranean, and reformed law, taxation, and education. His architect **Mimar Sinan** designed the Suleymaniye Mosque, a masterpiece of Islamic architecture.

### Society and Administration
- **Millet system** — religious communities (Christian, Jewish, Muslim) governed their own civil affairs
- **Devshirme** — Christian boys levied, converted, and trained as Janissaries or officials
- **Janissaries** — elite infantry corps that became a powerful political force
- **Topkapi Palace** — political heart of the empire for four centuries

### Decline and End
| Period | Event |
|--------|-------|
| 1683 | Second Siege of Vienna fails; slow retreat begins |
| 19th c. | Nationalist revolts; losses to Russia |
| 1914-18 | Sides with Germany in WWI; empire dismantled |
| 1922 | Sultanate abolished by Mustafa Kemal Ataturk |
| 1924 | Caliphate formally ended |

**Why it matters:**
The Ottoman Empire was the last great Islamic caliphate and the dominant power of the Mediterranean for nearly three centuries. Its legal pluralism, military organization, and architectural legacy shaped the Middle East, Balkans, and North Africa. The empire's 1914 collapse redrew the map of the modern Arab world — and its end gave birth to more than 30 successor states whose borders still provoke conflict today.`,
  },

  // ----------------------------------------------------------
  // 5. BRITISH EMPIRE
  // ----------------------------------------------------------
  {
    id: 'british-empire',
    patterns: [/\b(british empire|british colonization|british colonies|empire sun never sets|east india company|britain empire|angrez empire|british raj|imperial britain)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## British Empire — History's Largest Empire

At its peak in the early 1920s, the **British Empire** covered roughly **25% of the world's land surface** and ruled over **more than 400 million people** — so vast that 'the sun never sets on it'. It grew in waves of exploration, trade, conquest, and settlement between the late 15th and early 20th centuries.

### Origins and Growth
The empire began with **overseas plantations** in Ireland and the founding of Jamestown, Virginia in 1607. The **East India Company**, chartered in 1600, slowly shifted from trade to territory in India, eventually controlling the subcontinent after the 1757 Battle of Plassey.

### Three Waves of Expansion
| Period | Focus |
|--------|-------|
| 1600s | North American and Caribbean colonies |
| 1700s-1800s | India, Australia, Cape Colony, Southeast Asia |
| Late 1800s | 'Scramble for Africa' — Egypt, Sudan, Nigeria, Kenya, South Africa |

### How It Was Ruled
- **Colonies of settlement** — Canada, Australia, New Zealand (largely self-governing)
- **Crown colonies** — directly ruled from London (e.g., India after 1858)
- **Protectorates and mandates** — local rulers under British oversight
- **Dominions** — formally independent but tied to the Crown

### Decline and Decolonization
The **American Revolution** (1776-1783) was the first major loss. World War II bankrupted Britain and discredited imperial rule. Between 1945 and 1965, dozens of colonies gained independence — beginning with India and Pakistan in **1947** and culminating in Africa and the Caribbean. Hong Kong's handover to China in **1997** effectively closed the imperial chapter.

### Legacy
English as a global lingua franca, common-law legal systems, parliamentary democracy, cricket, and the Commonwealth of Nations all trace back to British rule — as do deeper scars of slavery, indentured labor, drawn borders, and economic extraction.

**Why it matters:**
The British Empire reshaped the modern world more than any political entity since Rome. Its language, institutions, sports, and borders define how billions of people live today — and its unresolved legacies, from Israel-Palestine to Kashmir to African borders, continue to drive conflict and conversation about justice, memory, and decolonization.`,
  },

  // ----------------------------------------------------------
  // 6. MONGOL EMPIRE
  // ----------------------------------------------------------
  {
    id: 'mongol-empire',
    patterns: [/\b(mongol empire|genghis khan|changhez khan|largest land empire|mongols|kublai khan|golden horde|tamerlane|mongol history|chagatai)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## Mongol Empire — Largest Land Empire in History

Born on the cold steppes of Central Asia, the **Mongol Empire** became the **largest contiguous land empire ever** — stretching from Korea to Hungary and from Siberia to the Persian Gulf. At its peak around 1280, it covered some **24 million square kilometers**, roughly 17% of the Earth's land surface.

### Genghis Khan
Born **Temujin** around 1162, the future **Genghis Khan** united the warring Mongol tribes at a *kurultai* (assembly) in **1206**. He reorganized society into decimal military units — squads of 10, companies of 100, regiments of 1,000, and tumens of 10,000 — and fused loyalty, mobility, and discipline into an army that could ride 100 km a day.

### Conquests
| Direction | Target | Year |
|-----------|--------|------|
| West | Khwarezmian Empire (Persia) | 1219-1221 |
| North | Volga Bulgars, Kievan Rus | 1237-1240 |
| East | Jin dynasty (northern China) | 1211-1234 |
| South | Song dynasty (southern China) | 1235-1279 |
| West | Baghdad, Syria, Hungary | 1258-1260 |

### Pax Mongolica
After the conquests came the **Mongol Peace** — a century of safe travel along the **Silk Road**. Marco Polo journeyed to Kublai Khan's China; paper money, gunpowder, and printing moved westward; Persian astronomers and Chinese engineers worked side by side. The empire guaranteed religious tolerance and protected merchants.

### Division and Legacy
Genghis died in 1227; within decades the empire split into four khanates:
- **Yuan dynasty** in China (Kublai Khan)
- **Ilkhanate** in Persia
- **Golden Horde** in Russia
- **Chagatai Khanate** in Central Asia

Most had collapsed by the 14th-15th centuries, though the Mughal and Timurid dynasties later claimed Mongol descent.

**Why it matters:**
The Mongol Empire transformed Eurasia. It connected East and West as never before, spread technologies like gunpowder and printing westward, and may have carried the bubonic plague that devastated 14th-century Europe. The empire's sheer scale reshaped trade, demography, and diplomacy — and its memory still echoes in the borders, languages, and family stories of dozens of modern nations.`,
  },

  // ----------------------------------------------------------
  // 7. WORLD WAR 1
  // ----------------------------------------------------------
  {
    id: 'world-war-1',
    patterns: [/\b(world war 1|ww1|first world war|great war|sarajevo|treaty of versailles|gallipoli|jang-e-azeem|pehli jang-e-azeem|world war i)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## World War I — The Great War, 1914-1918

Fought from **July 1914 to November 1918**, World War I killed more than **16 million people** — soldiers and civilians alike — and wounded another 20 million. It was the first truly industrialized conflict, the first to use tanks, poison gas, and aircraft on a mass scale, and the war that destroyed four empires.

### Causes
- **Assassination** — Archduke Franz Ferdinand of Austria-Hungary killed in Sarajevo on June 28, 1914 by Gavrilo Princip
- **Alliance system** — Europe split into two armed camps
- **Imperial rivalry** — Germany, Britain, France competing for colonies
- **Militarism and nationalism** — arms race and belligerent patriotism

### Two Armed Alliances
| Allies (Entente) | Central Powers |
|------------------|----------------|
| France, Britain, Russia | Germany, Austria-Hungary |
| Italy (from 1915) | Ottoman Empire |
| USA (from 1917) | Bulgaria |

### Key Battles
- **Marne** (1914) — stopped German advance on Paris; began trench warfare
- **Verdun** (1916) — 700,000 casualties for almost no movement
- **Somme** (1916) — first use of tanks; 60,000 British casualties on day one
- **Gallipoli** (1915-16) — disastrous Allied amphibious assault; defined ANZAC memory

### New Technologies
Machine guns, barbed wire, heavy artillery, poison gas (chlorine, mustard), tanks (Britain's Mark I, 1916), submarines (U-boats), and the first fighter planes transformed warfare into a slaughterhouse of static fronts.

### Aftermath
The **Armistice** of November 11, 1918 ended the fighting. The **Treaty of Versailles** (1919) blamed Germany, forced huge reparations, and redrew the map of Europe — dissolving the Austro-Hungarian, Ottoman, Russian, and German empires. The League of Nations was founded but failed. Within twenty years, the unresolved grievances of Versailles helped ignite World War II.

**Why it matters:**
World War I ended the long 19th century and ushered in the brutal modern age. It broke four empires, gave women the vote in many countries, inspired independence movements from India to Ireland to Vietnam, and introduced weapons of mass destruction. Historians often call it the 'original catastrophe' of the 20th century — the wound from which almost every later conflict flowed.`,
  },

  // ----------------------------------------------------------
  // 8. INDUSTRIAL REVOLUTION
  // ----------------------------------------------------------
  {
    id: 'industrial-revolution',
    patterns: [/\b(industrial revolution|steam engine|factories|james watt|textile industry|industrialization|sanati inqilab|sanati intiqal|factory system|spinning jenny)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## Industrial Revolution — When Machines Reshaped Humanity

Beginning in **Britain around 1760**, the **Industrial Revolution** replaced muscle with machinery. Hand production gave way to factories; wind and water yielded to coal and steam; villages emptied into cities. Within a century, human productivity, population, and pollution all exploded beyond anything seen before.

### Why Britain First
- **Coal and iron** deposits close to water transport
- **Stable institutions** — property rights, patents, capital markets
- **Colonial empire** — captive markets and raw cotton from India and the Americas
- **Agricultural surplus** — enclosure freed rural labor for factory work
- **Scientific culture** — Royal Society, mechanical tinkering

### Key Inventions
| Year | Invention | Inventor |
|------|-----------|----------|
| 1712 | Atmospheric steam engine | Thomas Newcomen |
| 1769 | Improved steam engine | James Watt |
| 1733 | Flying shuttle | John Kay |
| 1764 | Spinning jenny | James Hargreaves |
| 1769 | Water frame | Richard Arkwright |
| 1785 | Power loom | Edmund Cartwright |
| 1825 | Passenger railway | George Stephenson |

### Social Upheaval
The factory system uprooted centuries of rural life. Cities like Manchester and Birmingham grew tenfold in a single generation — choked with smoke, sewage, and disease. Children as young as six worked 14-hour shifts in textile mills and coal mines. Wages rose over time, but inequality soared.

### Reform and Spread
Outrage sparked reform: Britain's Factory Acts limited child labor from 1833, trade unions won legal recognition, and the **Communist Manifesto** (1848) by Marx and Engels gave the new working class a political voice. By the mid-19th century, industrialization had spread to Belgium, France, Germany, and the United States. Japan's Meiji Restoration (1868) brought it to Asia; by 1900 a **Second Industrial Revolution** driven by steel, electricity, chemicals, and oil was underway.

**Why it matters:**
The Industrial Revolution is the dividing line of modern history. It multiplied human output, lengthened life expectancy, and created the consumer economy — but it also birthed climate change, urban slums, labor struggle, and global inequality. Every laptop, factory, and supply chain today descends directly from Watt's steam engine and Arkwright's water frame. The choices made during that century still shape who is rich, who is poor, and who decides.`,
  },

  // ----------------------------------------------------------
  // 9. AGE OF EXPLORATION
  // ----------------------------------------------------------
  {
    id: 'age-of-exploration',
    patterns: [/\b(age of exploration|columbus|magellan|vasco da gama|discovery of america|trade routes|tajassus ka daur|age of discovery|spice route|caravel)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## Age of Exploration — When the World Became Connected

Roughly spanning **1450 to 1650**, the **Age of Exploration** was the period when European sailors mapped the globe, founded overseas empires, and stitched together continents that had been largely isolated from one another. It began as a search for pepper and ended as the remaking of the world.

### Motives
- **Spices** — pepper, clove, nutmeg worth their weight in gold; Ottoman control of land routes made sea routes attractive
- **Gold and silver** — to fund European wars
- **Christian mission** — convert new peoples
- **Curiosity and prestige** — Renaissance spirit of inquiry

### Pioneering Voyages
| Year | Explorer | Achievement |
|------|----------|-------------|
| 1488 | Bartolomeu Dias | First to round Cape of Good Hope |
| 1492 | Christopher Columbus | Reaches the Caribbean, 'discovers' Americas for Europe |
| 1498 | Vasco da Gama | First sea route from Europe to India |
| 1513 | Vasco Nunez de Balboa | European to sight the Pacific |
| 1519-22 | Ferdinand Magellan's crew | First circumnavigation of the globe |
| 1494 | Treaty of Tordesillas | Spain and Portugal divide the non-Christian world |

### New Technologies
The **caravel** and **carrack** — maneuverable ships combining lateen and square sails — let sailors tack against the wind. The **magnetic compass**, **astrolabe**, and improved **portolan charts** made open-ocean navigation possible. Cannons allowed small crews to dominate larger local forces.

### Consequences
The Columbian Exchange transferred crops, animals, and microbes between hemispheres — maize and potatoes fed Europe; horses and wheat transformed the Americas; smallpox and measles killed an estimated **90% of indigenous Americans** within a century. The **Atlantic slave trade** shipped 12 million Africans to the New World. Spain extracted Bolivian silver that fueled global commerce and inflation from Beijing to Madrid.

**Why it matters:**
The Age of Exploration created the first truly global economy and the modern colonial order. It united humanity biologically — exchanging the crops that now feed seven billion people — but did so through disease, enslavement, and conquest. Every modern map, trade route, language boundary, and demographic mix in the Americas, Africa, and Asia traces back to the sails that left Lisbon, Seville, and Bristol in this era.`,
  },

  // ----------------------------------------------------------
  // 10. ANCIENT CHINA
  // ----------------------------------------------------------
  {
    id: 'ancient-china',
    patterns: [/\b(ancient china|chinese dynasties|great wall of china|qin dynasty|han dynasty|chinese inventions|cheen ka tareekh|china history|china civilization|confucius)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## Ancient China — Five Thousand Years of Civilization

Chinese civilization emerged along the **Yellow River** more than 4,000 years ago and is one of the few continuous cultures on Earth. Ruled by dynasties — families holding the **Mandate of Heaven** — China developed philosophy, technology, and bureaucracy that shaped all of East Asia.

### Major Dynasties
| Dynasty | Years | Contribution |
|---------|-------|--------------|
| Xia | c. 2070-1600 BCE | Legendary first dynasty |
| Shang | c. 1600-1046 BCE | Oracle bones, bronze casting, earliest Chinese writing |
| Zhou | 1046-256 BCE | Mandate of Heaven, Confucius, Laozi |
| Qin | 221-206 BCE | First unified empire, Great Wall begun, terracotta army |
| Han | 206 BCE-220 CE | Silk Road, paper, civil service exams |
| Tang | 618-907 | Golden age of poetry and Buddhism |
| Song | 960-1279 | Printing, gunpowder, compass, paper money |
| Ming | 1368-1644 | Forbidden City, Zheng He's voyages |
| Qing | 1644-1912 | Last imperial dynasty |

### The Great Wall
Begun under **Qin Shi Huang** in the 3rd century BCE by linking earlier walls, the Great Wall was extended and rebuilt over centuries — most of what visitors see today dates to the **Ming dynasty**. Stretching more than **21,000 km** with watchtowers and garrison stations, it defended against nomadic raids from the Mongolian steppe.

### Four Great Inventions
- **Paper** (Han, c. 105 CE) — attributed to court eunuch Cai Lun
- **Printing** — woodblock by 700 CE; movable type by Bi Sheng around 1040
- **Gunpowder** — discovered by alchemists around 850 CE
- **Compass** — used for navigation by the Song dynasty

### Thought and Society
**Confucius** (551-479 BCE) taught ethics of duty, family, and ritual that still anchor Chinese culture. **Laozi** founded Taoism around the same time. The Han civil service exam — open to any literate male — created one of history's first merit-based bureaucracies.

**Why it matters:**
Ancient China invented or refined many tools that built the modern world — paper, printing, gunpowder, the compass — while creating a model of stable bureaucratic governance that lasted two millennia. Its philosophies, writing system, and aesthetics shaped Japan, Korea, and Vietnam. Today, as China re-emerges as a global power, understanding its deep history is essential to grasping how it sees itself and its place in the world.`,
  },

  // ----------------------------------------------------------
  // 11. MESOPOTAMIA
  // ----------------------------------------------------------
  {
    id: 'mesopotamia',
    patterns: [/\b(mesopotamia|sumer|babylon|cradle of civilization|hammurabi|babylonian empire|dajla farat|tigris euphrates|ur city|akkadian)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## Mesopotamia — The Cradle of Civilization

Greek for 'land between the rivers', **Mesopotamia** lay between the **Tigris and Euphrates** in what is now Iraq, Syria, and Kuwait. From roughly **3500 BCE**, it was home to the world's first cities, writing systems, codes of law, and wheeled vehicles — earning it the title 'cradle of civilization'.

### Major Peoples
| People | Period | Legacy |
|-------|--------|--------|
| Sumerians | c. 3500-2000 BCE | First cities, cuneiform writing, ziggurats |
| Akkadians | c. 2334-2154 BCE | First empire under Sargon |
| Babylonians | c. 1894-539 BCE | Hammurabi's code, astronomy |
| Assyrians | c. 2500-609 BCE | Military machine, library of Nineveh |
| Chaldeans | 626-539 BCE | Nebuchadnezzar, Hanging Gardens |

### Cities and Writings
**Uruk**, around 3200 BCE, was likely the world's first true city — home to perhaps 50,000 people and the legendary King Gilgamesh. Sumerian scribes developed **cuneiform**, pressing wedge-shaped marks into clay tablets with reed styluses. The **Epic of Gilgamesh**, written around 2100 BCE, is the oldest substantial literary work in existence — predating Homer by 1,500 years.

### Inventions
- **Writing** — record-keeping for grain and temple accounts
- **The wheel** — first as potter's tool, then as transport
- **Mathematics** — base-60 system still used for hours and degrees
- **Astronomy** — mapped the zodiac and lunar calendar
- **Irrigation** — canals that turned desert into farmland

### Hammurabi's Code
King **Hammurabi** of Babylon (r. 1792-1750 BCE) inscribed 282 laws on a black stone stele. The code famously used **lex talionis** — 'an eye for an eye' — and covered theft, marriage, slavery, wages, and trade. Though harsh by modern standards, it was a landmark attempt to make justice predictable and public.

### End and Legacy
Mesopotamia was conquered by Persia under **Cyrus the Great** in 539 BCE and never regained independence. Yet its inventions — writing, the wheel, the 60-minute hour, the seven-day week, codified law — became the foundation of every civilization that followed.

**Why it matters:**
Mesopotamia is where humans first crossed from prehistory into history. By inventing writing, cities, law, and timekeeping, its people created the very tools of civilization itself. Modern contracts, our calendars, and our sense of ordered justice all carry Sumerian and Babylonian DNA. To study Mesopotamia is to study the first answer humanity gave to the question: how do we live together in large numbers?`,
  },

  // ----------------------------------------------------------
  // 12. ANCIENT OLYMPICS
  // ----------------------------------------------------------
  {
    id: 'ancient-olympics',
    patterns: [/\b(ancient olympics|olympic games origin|greek olympics|olympia games|ancient sports|olympic history|olympic origin|zeus festival)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## Ancient Olympics — Greece's Sacred Games

The **Olympic Games** were the most prestigious athletic festival of the ancient Greek world. Held every four years at **Olympia** in the western Peloponnese, they began in **776 BCE** — the year Greek historians used as their calendar's Year One — and continued for nearly 1,200 years until abolished in **393 CE**.

### Origin and Purpose
The Games honored **Zeus Olympios**, king of the gods. According to legend, they were founded by **Heracles** (Hercules), who measured the first stadium with his own footsteps. A sacred truce (*ekecheiria*) halted wars across Greece so athletes and spectators could travel safely — the earliest recorded example of international sports diplomacy.

### The Events
| Event | Description |
|-------|-------------|
| Stadion | 192-meter foot race; the only event until 724 BCE |
| Diaulos | Two-stade race (about 384 m) |
| Dolichos | Long-distance race of 20+ laps |
| Hoplitodromos | Race in bronze armor with shield |
| Pale | Wrestling, often brutal |
| Pankration | No-holds-barred mix of boxing and wrestling |
| Pentathlon | Discus, javelin, long jump, running, wrestling |
| Chariot racing | Four-horse teams; owner, not driver, won the crown |

### The Athletes
Competitors were freeborn Greek men who trained for months at Olympia. They performed **naked** (the word *gymnasium* comes from *gymnos*, 'naked') — both to honor the gods and to celebrate the male body. Married women were forbidden to attend on pain of death, though unmarried girls had their own festival, the **Heraia**.

### Prizes and Glory
There was no money — only a wreath of wild olive cut from Zeus's sacred tree. Yet victors returned home as heroes: cities broke walls in their honor, poets like Pindar wrote odes, and statues were raised at Olympia. A champion was set for life.

### End and Revival
In **393 CE**, the Christian emperor **Theodosius I** abolished the Games as a pagan festival. Olympia fell into ruin, buried by earthquakes and floods. Only in **1896** did French educator **Baron Pierre de Coubertin** revive them as the modern Olympic Games in Athens — restoring a tradition that now gathers more than 200 nations.

**Why it matters:**
The ancient Olympics were the first sustained experiment in using sport to bring rival peoples together under shared rules. They created the ideal of athletic excellence for its own sake, the concept of an international truce, and a model of fair competition that survives — however imperfectly — every two years when the modern Games light their torch at Olympia.`,
  },

  // ----------------------------------------------------------
  // 13. PARTITION OF INDIA
  // ----------------------------------------------------------
  {
    id: 'partition-of-india',
    patterns: [/\b(partition of india|1947 partition|india pakistan division|batwara|taqseem-e-hind|radcliffe line|independence 1947|partition 1947|hijrat 1947)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## Partition of India — 1947

In August **1947**, British India was divided into two independent nations — **India** and **Pakistan** — in one of the largest and most violent mass migrations in human history. Within months, an estimated **12 to 20 million people** were displaced, and between **1 and 2 million** were killed in communal violence.

### Background and Causes
- **Two-nation theory** — proposed by Sir Syed Ahmed Khan, later championed by Muhammad Ali Jinnah and the Muslim League: Hindus and Muslims were distinct nations
- **Congress vs Muslim League** — the Indian National Congress sought a united secular India; the League demanded a separate Muslim state
- **British exhaustion** — after WWII, Britain could no longer afford or morally justify colonial rule
- **Communal riots** — 1946 violence in Calcutta and Bihar killed thousands, hardening positions
- **Mountbatten Plan** — announced June 3, 1947; rushed partition through in just 73 days

### The Radcliffe Line
British lawyer **Cyril Radcliffe** arrived in India in July 1947 with no prior knowledge of the region. He had five weeks to draw the border between India and the new Pakistan — splitting the provinces of **Bengal** and **Punjab** along religious lines. He used outdated census maps and population figures, never visited the boundary, and submitted his plan on August 9.

### The Migration
When borders were announced on **August 17** — two days after independence — millions found themselves on the wrong side. Trains of refugees crossed both directions across Punjab and Bengal; many arrived carrying only the dead.

### Human Cost
| Region | Displaced | Killed |
|--------|-----------|--------|
| Punjab | ~7 million | Up to 1 million |
| Bengal | ~5 million | 100,000+ |
| Total | 12-20 million | 1-2 million |

Women were targeted on all sides — abduction, assault, and 'honor killings' were widespread. Trains arrived at Lahore and Delhi filled with corpses.

### Legacy
Pakistan was born on **August 14**, India on **August 15**. The trauma seeded four wars, the Kashmir dispute, ongoing nuclear rivalry, and generations of mistrust. Yet it also produced two of the world's largest nations and a vast South Asian diaspora.

**Why it matters:**
Partition is the foundational wound of modern South Asia — the event that shaped the borders, armies, and identities of more than a fifth of humanity. Its unresolved questions about religion, minority rights, and belonging still drive conflict between two nuclear-armed neighbors. The stories of its survivors remind us how quickly neighbors can turn on one another, and how thin the line between coexistence and catastrophe can be.`,
  },

  // ----------------------------------------------------------
  // 14. FRENCH REVOLUTION
  // ----------------------------------------------------------
  {
    id: 'french-revolution',
    patterns: [/\b(french revolution|bastille|napoleon bonaparte|louis xvi|robespierre|french revolution 1789|inqilab-e-france|storming of bastille|reign of terror)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## French Revolution — 1789

Beginning in **1789**, the **French Revolution** overthrew a thousand-year-old monarchy, executed a king and queen, abolished feudal privilege, declared the **Rights of Man**, and unleashed a wave of war and ideology that remade Europe. Its motto — *Liberte, Egalite, Fraternite* — still defines modern democratic politics.

### Causes
- **Bankruptcy** — France was bankrupted by aid to the American Revolution and royal extravagance
- **Inequality** — clergy and nobility paid almost no tax; peasants and workers bore the burden
- **Enlightenment ideas** — Rousseau, Voltaire, Montesquieu argued for popular sovereignty and rights
- **Bad harvests** — 1788-89 famine doubled bread prices; Parisians were starving
- **Weak king** — Louis XVI was indecisive and out of touch

### Key Events
| Date | Event |
|------|-------|
| May 1789 | Estates-General meets for the first time in 175 years |
| June 17, 1789 | Third Estate declares itself the National Assembly |
| July 14, 1789 | **Storming of the Bastille** — Parisian crowd seizes the royal prison |
| Aug 26, 1789 | Declaration of the Rights of Man and of the Citizen |
| Jan 1793 | Louis XVI executed by guillotine |
| Sept 1793-July 1794 | **Reign of Terror** under Robespierre; 40,000+ executed |
| 1799 | Napoleon Bonaparte seizes power in the coup of 18 Brumaire |

### Factions
- **Jacobins** — radical republicans led by Robespierre
- **Girondins** — moderate republicans
- **Sans-culottes** — Parisian working-class militants
- **Royalists** — defenders of the monarchy

### Napoleon's Rise
Out of the chaos emerged **Napoleon Bonaparte** — a brilliant Corsican artillery officer who rose through the ranks of the revolutionary army. After his 1799 coup he crowned himself Emperor in 1804, reformed law (the **Code Napoleon**), and conquered most of Europe before his final defeat at Waterloo in 1815.

### Legacy
The Revolution abolished feudalism, secularized the state, established merit-based advancement, and exported nationalism and human rights across Europe. It also showed how quickly idealism can turn into terror — a lesson echoed in every revolution since.

**Why it matters:**
The French Revolution is the hinge between the medieval and modern worlds. It gave us left and right politics, human rights as a universal concept, the metric system, and the very word 'revolution' as we use it today. Its promise — that ordinary people can remake their government — and its warning — that liberty can devour itself — remain the central tension of every democracy on Earth.`,
  },

  // ----------------------------------------------------------
  // 15. ANCIENT JAPAN
  // ----------------------------------------------------------
  {
    id: 'ancient-japan',
    patterns: [/\b(ancient japan|samurai|shogun|edo period|tokugawa|japanese history|samurai warrior|japan ka tareekh|shogunate|bushido|meiji restoration)\b/i],
    intent: 'factual_question',
    topic: 'history',
    response: () => `## Ancient Japan — Land of the Samurai

Japan's history stretches back thousands of years, but its classical and feudal eras — roughly **794 to 1868 CE** — produced the culture most associated with the country today: emperors, shoguns, samurai, Zen Buddhism, and the code of *bushido*. Cut off from the Asian mainland by sea, Japan developed a civilization at once deeply influenced by China and profoundly its own.

### Major Periods
| Period | Years | Highlights |
|--------|-------|------------|
| Heian | 794-1185 | Imperial court, *Tale of Genji*, refined aristocratic culture |
| Kamakura | 1185-1333 | First shogunate; samurai class rises; Mongol invasions repelled |
| Muromachi | 1336-1573 | Zen Buddhism, ink painting, tea ceremony |
| Sengoku | 1467-1603 | Warring States; castle-building; first European contact |
| Azuchi-Momoyama | 1568-1603 | Nobunaga and Hideyoshi unify Japan |
| Edo | 1603-1868 | Tokugawa shogunate, isolation, urban culture |

### The Samurai
Emerging in the Heian and Kamakura periods, the **samurai** were mounted warriors bound to lords by personal loyalty. Their code, **bushido** ('way of the warrior'), demanded courage, honor, frugality, and — above all — readiness to die. A samurai carried two swords (the *katana* and *wakizashi*) and was expected to commit *seppuku* (ritual suicide) rather than face disgrace.

### Shoguns and the Emperor
Japan's emperor — supposedly descended from the sun goddess **Amaterasu** — reigned from Kyoto. But from 1185 real power lay with the **shogun**, a military dictator based in Kamakura, then Kyoto, then Edo (modern Tokyo). The Tokugawa shogunate (1603-1868) kept the emperor as a ceremonial figurehead for 265 years.

### Edo Isolation
Under the Tokugawa, Japan pursued **sakoku** — closed-country policy. Foreign trade was restricted to a single Dutch outpost at Nagasaki. Christianity was banned and brutally suppressed. Yet internally, Japan flourished: roads were safe, cities boomed, kabuki theater and *ukiyo-e* woodblock prints defined urban culture, and literacy reached perhaps the highest level in the world.

### End of the Old Order
In **1853**, US Commodore **Matthew Perry** sailed his 'Black Ships' into Tokyo Bay and forced Japan to open trade. The shock triggered the **Meiji Restoration** of 1868 — the shogunate was abolished, the emperor restored, and Japan launched a crash modernization that within 40 years made it a world power.

**Why it matters:**
Ancient Japan shows how a society can borrow foreign ideas — Chinese writing, Indian Buddhism, Korean craftsmanship — and transform them into something entirely original. Its samurai ethos, Zen aesthetics, and political structure shaped modern Japan's discipline, design sense, and corporate culture. Understanding the Edo period also helps explain how Japan modernized so rapidly after 1868.`,
  },
]
