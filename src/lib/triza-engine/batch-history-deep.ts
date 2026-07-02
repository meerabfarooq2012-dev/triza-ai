/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — HISTORY DEEP (Batch 7-a)
 * ============================================================
 *
 *  Deeper subtopic entries for world history. These go one
 *  level below the foundational batch-history.ts entries,
 *  covering specific eras, movements, conflicts, and
 *  cultural developments: ancient Mesopotamia, Egypt, Greece,
 *  Rome, medieval Europe, the Islamic Golden Age, Renaissance
 *  and Reformation, the Industrial Revolution, both world
 *  wars, the Cold War, decolonization, and modern
 *  globalization.
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries with English
 *  subtopic-specific tokens so TRIZA can match deeper
 *  history questions that the broad batch-history.ts entries
 *  do not fully address.
 *
 *  No external LLM API is used. These are facts TRIZA has
 *  "learned" and will express in its own voice via the
 *  self-expression + narration engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const HISTORY_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. ANCIENT MESOPOTAMIA — CIVILIZATIONS DEEP
  // ----------------------------------------------------------------
  {
    id: 'history-deep-mesopotamia-civilizations',
    patterns: [/\b(cuneiform|ziggurat|hammurabi code|code of hammurabi|sumer city|uruk|akkadian empire|babylonian|assyrian empire|nineveh|epic of gilgamesh|sumerian writing|sumerian civilization|akkad empire|neo-assyrian|babylonian empire|mesopotamian civilization)\b/i],
    keywords: ['cuneiform', 'ziggurat', 'hammurabi', 'sumer', 'akkad', 'babylon', 'assyria', 'nineveh', 'gilgamesh', 'mesopotamia'],
    intent: 'factual_question',
    topic: 'history',
    response: () => `Mesopotamia, the land between the Tigris and Euphrates rivers in modern-day Iraq, is often called the cradle of civilization. From roughly 3500 BCE onward, successive peoples — Sumerians, Akkadians, Babylonians, and Assyrians — built the world's first cities, invented writing, drafted law codes, and organised empires whose innovations rippled outward for thousands of years.

### The Sumerian City-States
By 3000 BCE, southern Mesopotamia was dotted with city-states like Uruk, Ur, Eridu, and Lagash. Each city was organised around a central complex dedicated to its patron deity and ruled by a priest-king called an en or lugal. The Sumerians invented cuneiform writing around 3200 BCE — the world's first script — pressing reed styluses into wet clay tablets to record grain shipments, offerings, and contracts. Cuneiform began as pictographs but evolved into abstract wedge-shaped marks that could represent sounds, syllables, and ideas.

### Akkad: The First Empire
Around 2334 BCE, Sargon of Akkad united the Sumerian city-states under one rule, creating what is often called the world's first true empire. His Akkadian-speaking forces stretched from the Persian Gulf to the Mediterranean. The Akkadians adopted Sumerian cuneiform to write their own Semitic language, and this bilingual culture set a pattern: Mesopotamia would remain multilingual for millennia. The Akkadian Empire lasted roughly two centuries before collapsing under invasion and internal strain.

### Babylon and Hammurabi's Code
The Babylonian Empire rose around 1894 BCE under Amorite kings, reaching its height under Hammurabi (reigned 1792–1750 BCE). His famous Code of Hammurabi is one of the oldest deciphered writings of significant length, listing 282 laws carved into a basalt stele. The code covers trade, marriage, slavery, theft, and liability, with punishments often scaled by social class — "an eye for an eye" applied between equals, but a noble who injured a commoner paid a fine rather than suffering the same injury. Though harsh by modern standards, the code established the principle that laws should be public, predictable, and written down.

### Assyria: The Military Machine
To the north, the Assyrians built a brutal but efficient empire centred on cities like Assur, Kalhu, and Nineveh. At its peak (around 900–612 BCE), the Neo-Assyrian Empire stretched from Egypt to Persia. The Assyrians pioneered siege warfare, iron weapons, standing armies, and a postal relay system that allowed royal orders to travel across the empire in days. The Library of Ashurbanipal at Nineveh preserved thousands of cuneiform tablets — including the Epic of Gilgamesh, the world's oldest surviving great work of literature.

### Ziggurats and Astronomy
Each major Mesopotamian city built a ziggurat — a stepped pyramid of baked mud-brick — as the dwelling of its patron deity. The best preserved is the Ziggurat of Ur, built around 2100 BCE. Specialists climbed its stairs to perform rituals and observe celestial movements, blending ceremony with early astronomy. The sexagesimal (base-60) number system the Mesopotamians developed still survives in our sixty-minute hour and 360-degree circle.

### Why It Matters
Mesopotamia gave humanity its first cities, first writing, first written law code, first empire, and first organised astronomy. Concepts we take for granted — the sixty-minute hour, the seven-day week, written contracts, urban planning, codified law — trace directly to Sumerian, Babylonian, and Assyrian innovation. When later civilisations including the Persians, Greeks, and Romans built their own empires, they were walking a road already paved between the Tigris and Euphrates.`,
  },

  // ----------------------------------------------------------------
  // 2. ANCIENT EGYPT — PHARAOHS AND PYRAMIDS DEEP
  // ----------------------------------------------------------------
  {
    id: 'history-deep-egypt-pharaohs-pyramids',
    patterns: [/\b(old kingdom egypt|middle kingdom egypt|new kingdom egypt|egyptian pharaoh|pharaohs|egyptian pyramids|great pyramid|pyramid of giza|hieroglyphics|egyptian hieroglyphs|rosetta stone|mummification|egyptian mummy|valley of the kings|tutankhamun|ramses ii|cleopatra|khufu|hatshepsut|amarna period|book of the dead)\b/i],
    keywords: ['pharaoh', 'pyramid', 'hieroglyphics', 'rosetta stone', 'mummification', 'valley of the kings', 'tutankhamun', 'ramses', 'cleopatra', 'old kingdom', 'new kingdom'],
    intent: 'factual_question',
    topic: 'history',
    response: () => `Ancient Egyptian civilisation emerged along the Nile River around 3100 BCE, when King Narmer unified Upper and Lower Egypt into a single kingdom. For the next three thousand years, Egypt was ruled by a succession of pharaohs whose kingdom is traditionally divided into three main periods of strength — the Old, Middle, and New Kingdoms — separated by intermediate periods of fragmentation.

### Old Kingdom: Age of Pyramids
The Old Kingdom (c. 2686–2181 BCE) is the era of pyramid building. The earliest was Djoser's Step Pyramid at Saqqara, designed by the architect Imhotep around 2650 BCE — the world's first major stone monument. The most famous are the three pyramids at Giza, built for pharaohs Khufu, Khafre, and Menkaure. The Great Pyramid of Khufu, completed around 2560 BCE, stood 146 metres tall and remained the tallest man-made structure on Earth for nearly four thousand years. Construction required tens of thousands of labourers — not slaves, as once thought, but paid workers organised in rotating gangs.

### Middle Kingdom: Reorganisation
After a chaotic First Intermediate Period, the Middle Kingdom (c. 2055–1650 BCE) restored central rule from Thebes. Pharaohs like Mentuhotep II and Senusret III reformed administration, expanded trade with Nubia and the Levant, and produced some of Egypt's finest literature and art. Massive fortresses were built at Buhen and elsewhere to secure the southern frontier. The era ended when the Hyksos, a foreign dynasty using horse-drawn chariots, took over the Nile Delta.

### New Kingdom: Empire and the Valley of the Kings
The New Kingdom (c. 1550–1077 BCE) was Egypt's imperial age. Pharaohs like Thutmose III, Amenhotep III, and Ramses II pushed borders into Syria and deep into Nubia. Akhenaten's short-lived Amarna period introduced sweeping changes to Egyptian tradition that were reversed after his death. Instead of pyramids, New Kingdom pharaohs were buried in rock-cut tombs hidden in the Valley of the Kings near Thebes. Most were looted, but Tutankhamun's small tomb survived largely intact until Howard Carter opened it in 1922, yielding over five thousand artefacts.

### Writing, Mummification, and the Rosetta Stone
Egyptian hieroglyphics combined logograms and phonetic signs and were used for monumental inscriptions; a faster cursive called hieratic served everyday writing. Mummification preserved bodies for the afterlife through a seventy-day process of removing organs, desiccating with natron salt, wrapping in linen, and entombing with grave goods described in the Book of the Dead. After Egypt fell to Greek and then Roman rule, hieroglyphics became unreadable to later generations until the 1799 discovery of the Rosetta Stone — inscribed in hieroglyphic, demotic, and Greek — allowed Jean-Francois Champollion to crack the code in 1822.

### Major Pharaohs and Cleopatra
Hatshepsut, one of the few female pharaohs, ruled as a man and built a magnificent mortuary temple at Deir el-Bahri. Ramses II, called "the Great," reigned 66 years and signed the world's earliest recorded peace treaty with the Hittites. The last pharaoh of independent Egypt was Cleopatra VII, who died in 30 BCE; after her, Egypt became a Roman province.

### Why It Matters
Egyptian civilisation's longevity is unmatched — three millennia of continuous cultural identity. Its monuments still define what humanity imagines by the word "ancient." Its engineering, medicine, mathematics, and writing systems shaped the Greek, Roman, and later Mediterranean worlds. The decipherment of hieroglyphics founded the discipline of Egyptology and showed that "lost" civilisations can speak again.`,
  },

  // ----------------------------------------------------------------
  // 3. ANCIENT GREECE — ATHENS, SPARTA, AND ALEXANDER DEEP
  // ----------------------------------------------------------------
  {
    id: 'history-deep-greece-athens-sparta',
    patterns: [/\b(athenian democracy|spartan militarism|spartan society|persian wars|peloponnesian war|delian league|peloponnesian league|battle of marathon|battle of thermopylae|battle of salamis|pericles|solon|cleisthenes|lycurgus|alexander the great|hellenistic period|macedonian empire|philip of macedon|greek city-states|polis greek)\b/i],
    keywords: ['athenian democracy', 'spartan', 'persian wars', 'peloponnesian war', 'delian league', 'thermopylae', 'marathon', 'salamis', 'pericles', 'alexander the great', 'hellenistic'],
    intent: 'factual_question',
    topic: 'history',
    response: () => `Ancient Greek civilisation flourished between roughly 800 and 146 BCE across hundreds of independent city-states called poleis. Although united by language and culture, the poleis were politically independent, and the two most powerful — Athens and Sparta — embodied starkly opposite visions of how a society should be organised.

### Athenian Democracy
Athens developed the world's first democracy in stages. Solon (c. 594 BCE) cancelled debts and reorganised citizens into wealth classes rather than birth classes. Cleisthenes (508 BCE) broke aristocratic power by reorganising citizens into ten mixed tribes, and by the 460s BCE, Ephialtes and Pericles had handed most decisions to the Assembly, in which every adult male citizen could speak and vote. Women, slaves, and resident foreigners were excluded, so the system was far from universal — but it pioneered the principle that political power should rest with the citizen body rather than a king.

### Spartan Militarism
Sparta took the opposite path. After conquering neighbouring Messenia around 700 BCE, Sparta reduced the Messenians to helots — state-owned serfs who vastly outnumbered Spartan citizens. To prevent helot revolt, Sparta reshaped its entire society around military training. Boys left home at age seven for the agoge, a brutal state boarding school that produced the most feared hoplites in Greece. Spartan women, unusually for the ancient world, trained physically and owned property, because men were often away on campaign.

### The Persian Wars (499–449 BCE)
When Greek cities in Ionia rebelled against Persian rule, Athens and Eretria sent help, provoking Persian reprisal. Darius I invaded in 490 BCE but was defeated at Marathon — a stunning upset of the world's superpower by a single city. Ten years later, Xerxes returned with a vast army and navy. A small Greek force led by the Spartan king Leonidas held the pass at Thermopylae for three days before being outflanked and annihilated. Athens was evacuated and burned, but the Greek fleet under Themistocles crushed the Persian navy at Salamis, and a final land victory at Plataea in 479 BCE ended the invasion.

### The Peloponnesian War (431–404 BCE)
Athens used its navy and the Delian League treasury to build an empire, frightening Sparta and its Peloponnesian League. The resulting thirty-year war devastated Greece. A plague killed perhaps a quarter of Athens' population, including Pericles. Sparta eventually built a fleet with Persian gold and shattered the Athenian navy at Aegospotami in 405 BCE. Athens surrendered the next year, its walls torn down and its empire dismantled. The war weakened every Greek city and set the stage for outside conquest.

### Alexander the Great and the Hellenistic World
Within seventy years of the Peloponnesian War, Philip II of Macedon subjugated the exhausted Greek cities. His son Alexander (reigned 336–323 BCE) crossed into Asia and in thirteen years conquered the Persian Empire, reaching as far as the Indus River before his army refused to go further. Alexander died at thirty-two, but his successors carved the empire into Hellenistic kingdoms that spread Greek language, science, and art from Egypt to Central Asia for three centuries, until Rome absorbed them.

### Why It Matters
Greek experiments with democracy, civic identity, philosophy, drama, and rational inquiry laid the foundations of Western civilisation. The Peloponnesian War remains a classic case study of how great-power rivalry can destroy both sides. Alexander's conquests fused Greek and Near Eastern cultures and created the cosmopolitan world into which later Mediterranean civilisations spread.`,
  },

  // ----------------------------------------------------------------
  // 4. ANCIENT ROME — REPUBLIC TO EMPIRE DEEP
  // ----------------------------------------------------------------
  {
    id: 'history-deep-rome-republic-empire',
    patterns: [/\b(roman republic|punic wars|hannibal|carthage|julius caesar|augustus caesar|octavian|pax romana|fall of rome|fall of western rome|western roman empire|rubicon|ides of march|constantine|diocletian|roman senate|twelve tables|imperial rome)\b/i],
    keywords: ['roman republic', 'punic wars', 'hannibal', 'carthage', 'julius caesar', 'augustus', 'pax romana', 'fall of rome', 'rubicon', 'ides of march'],
    intent: 'factual_question',
    topic: 'history',
    response: () => `Roman civilisation dominated the Mediterranean for over a thousand years, evolving from a small Italian city-state into a republic, then a sprawling empire whose cultural, legal, and linguistic legacy still shapes Europe, the Middle East, and the Americas today.

### The Roman Republic (509–27 BCE)
Rome threw out its last king in 509 BCE and became a republic governed by elected magistrates, a Senate of patricians, and popular assemblies. The Twelve Tables (c. 450 BCE) codified Roman law and hung in the Forum for all to read. Over centuries, Rome expanded through military grit and political flexibility. A crucial innovation was the gradual extension of citizenship to conquered Italian peoples, which built loyalty rather than resentment and gave Rome a deep manpower pool that defeated rivals could not match.

### The Punic Wars (264–146 BCE)
Three wars with the Phoenician city of Carthage made Rome master of the western Mediterranean. The First Punic War was a naval struggle for Sicily. In the Second, the Carthaginian general Hannibal crossed the Alps with elephants and crushed Roman armies at Trebia, Trasimene, and Cannae, killing perhaps fifty thousand Romans in a single afternoon. Rome refused to surrender and, after sixteen years of attrition, counter-invaded Africa under Scipio Africanus, defeating Hannibal at Zama in 202 BCE. The Third Punic War ended with Carthage's total destruction in 146 BCE, the same year Rome also sacked Corinth and absorbed Greece.

### The Fall of the Republic
Conquest brought wealth, slaves, and inequality to Rome. Small farmers lost land to vast estates worked by slaves; the army changed from citizen levies to professional legions loyal to their generals. Reformers like the Gracchi brothers were murdered, and politics broke into factional civil war. Julius Caesar, after conquering Gaul, crossed the Rubicon in 49 BCE — "the die is cast" — and defeated his rival Pompey. On the Ides of March 44 BCE, senators stabbed Caesar to death, hoping to save the Republic. Instead they triggered another round of war from which Caesar's adopted son Octavian emerged victorious.

### Augustus and the Pax Romana
In 27 BCE, Octavian was granted the title Augustus and became Rome's first emperor, though he carefully preserved republican forms. He reorganised the army, rebuilt much of Rome in marble, established a standing fire service and police force, and began two centuries of relative peace known as the Pax Romana. Under emperors from Augustus to Marcus Aurelius (27 BCE–180 CE), the empire reached its greatest extent, trade flourished along roads whose paving stones still survive, and Roman law was systematised across provinces.

### Crisis and the Fall of Western Rome
After 180 CE the empire strained under inflation, plague, barbarian pressure, and succession crises. Diocletian (284–305) split rule into four parts and Constantine (306–337) founded a new eastern capital at Constantinople in 330, shifting gravity eastward. The western half, poorer and more exposed, gradually lost provinces to Germanic kingdoms. In 476 CE the Germanic chieftain Odoacer deposed the last western emperor, Romulus Augustulus, and the Western Roman Empire ended. The eastern half survived as the Byzantine Empire for another thousand years.

### Why It Matters
Rome gave the West its alphabet, much of its law, its engineering vocabulary (arch, aqueduct, concrete), and the Latin root of languages from Portuguese to Romanian. Concepts like presumption of innocence, contracts, municipal government, and codified law descend directly from Roman jurists. The fall of the western empire in 476 remains the textbook end of classical antiquity and the beginning of the Middle Ages, a hinge that shaped every European story that followed.`,
  },

  // ----------------------------------------------------------------
  // 5. MEDIEVAL EUROPE — FEUDALISM AND CRUSADES DEEP
  // ----------------------------------------------------------------
  {
    id: 'history-deep-medieval-feudalism-crusades',
    patterns: [/\b(feudal system|feudalism|manorialism|holy roman empire|charlemagne|crusades|first crusade|fourth crusade|saladin|black death|bubonic plague|magna carta|king john|knights medieval|vassal|serf|medieval europe|hundred years war|carolingian renaissance)\b/i],
    keywords: ['feudalism', 'manorialism', 'holy roman empire', 'charlemagne', 'crusades', 'saladin', 'black death', 'magna carta', 'knights', 'serf'],
    intent: 'factual_question',
    topic: 'history',
    response: () => `Medieval Europe spans roughly a thousand years from the fall of the Western Roman Empire in 476 CE to the dawn of the Renaissance around 1450. Often misremembered as a "dark age," the period was dynamic: it built the foundations of modern European kingdoms, universities, parliaments, and legal systems, even as it weathered invasions, plagues, and wars.

### The Feudal System
After Rome fell, central government collapsed across western Europe. Kings could not protect distant lands, so landowners turned to local armed lords for security. In the feudal system, a king granted land (a fief) to a noble vassal in exchange for military service and loyalty. That vassal granted parts of his fief to lesser vassals, creating a chain of obligations from king down to knight. Land and loyalty, not cash or bureaucracy, held society together.

### Manorialism and the Peasant Economy
Most people lived in villages on a lord's manor. Peasants called serfs were legally bound to the land — not slaves, but not free to leave without permission. In exchange for a strip of land, they owed the lord labour on his demesne fields, a share of their harvest, and fees to use his mill and oven. The three-field rotation (winter grain, spring grain, fallow) sustained yields for centuries. This economy was self-sufficient and almost cashless.

### Charlemagne and the Holy Roman Empire
In 800 CE, Charlemagne, king of the Franks, was crowned Emperor of the Romans by the Pope. His Carolingian Renaissance promoted literacy, standardised script (Carolingian minuscule, the basis of our lower-case letters), and reformed education across monasteries. After his death his empire split, and its eastern portion evolved into the Holy Roman Empire, a confederation of German and Italian principalities that lasted until Napoleon dissolved it in 1806.

### The Crusades (1095–1291)
In 1095, Pope Urban II called on European knights to reclaim Jerusalem from Muslim rule. Nine major crusades followed over two centuries. The First Crusade captured Jerusalem in 1099 and established four "Crusader States" on the Levantine coast. Saladin retook Jerusalem in 1187. The Fourth Crusade (1202–1204) sacked Constantinople, fatally weakening the Byzantine Empire. The Crusades opened trade routes, brought Greek and Arabic learning into Europe, and strengthened royal power — but they also left a legacy of mistrust between Christian and Muslim worlds that endures today.

### The Black Death (1347–1351)
A pandemic of bubonic plague, carried by rat fleas along trade routes from Central Asia, killed perhaps a third to half of Europe's population in four years. Cities emptied, fields went untilled, and entire villages disappeared. The labour shortage that followed shattered the manorial system: serfs could now demand wages or move to towns, accelerating the end of feudalism and shaking confidence in the Church and other institutions that had failed to stop it.

### Magna Carta and the Roots of Liberty
In 1215, English barons rebelling against King John forced him to sign Magna Carta at Runnymede. It established that even the king was subject to the law, that taxation required consent, and that free men had a right to judgement by their peers. Though originally a feudal document protecting baronial privileges, Magna Carta became the symbolic root of constitutional government, due process, and limited monarchy — cited centuries later by drafters of the United States Constitution.

### Why It Matters
The medieval period built Europe's universities, parliaments, legal codes, cathedrals, and nations. Feudalism's personal contracts evolved into constitutional government, the Crusades and Black Death reshaped economies, and Magna Carta proved that written limits on power could outlast kings. Modern Europe is the institutional inheritance of the Middle Ages.`,
  },

  // ----------------------------------------------------------------
  // 6. ISLAMIC GOLDEN AGE — CALIPHATES AND SCHOLARSHIP DEEP
  // ----------------------------------------------------------------
  {
    id: 'history-deep-islamic-golden-age',
    patterns: [/\b(islamic golden age|abbasid caliphate|umayyad caliphate|house of wisdom|baghdad scholarship|al-khwarizmi|algebra origin|ibn sina|avicenna|ibn rushd|averroes|al-razi|rhazes|al-biruni|al-andalus|cordoba caliphate|arabic numerals|translation movement|spherical astrolabe)\b/i],
    keywords: ['islamic golden age', 'abbasid', 'umayyad', 'house of wisdom', 'baghdad', 'al-khwarizmi', 'algebra', 'ibn sina', 'avicenna', 'al-andalus'],
    intent: 'factual_question',
    topic: 'history',
    response: () => `The Islamic Golden Age, roughly 750 to 1258 CE, was a period of extraordinary intellectual, scientific, and cultural flourishing across the caliphates that stretched from Spain to Central Asia. Centred on Baghdad's House of Wisdom but with parallel centres in Cairo, Damascus, Cordoba, and Samarkand, scholars translated, synthesised, and extended Greek, Persian, and Indian knowledge, producing breakthroughs that later seeded the European Renaissance.

### The Umayyad and Abbasid Caliphates
The Umayyad Caliphate (661–750) established Arabic as the administrative language of a vast empire from Spain to the Indus, creating a common scholarly tongue across dozens of cultures. In 750, the Abbasid Caliphate replaced the Umayyads and shifted the capital to Baghdad, founded in 762. Baghdad sat at the crossroads of trade routes linking the Mediterranean, Persia, India, and China, and the Abbasids cultivated an environment in which scholars of many backgrounds could work.

### The House of Wisdom
Caliph Harun al-Rashid (786–809) and his son al-Ma'mun (813–833) founded and expanded the Bayt al-Hikma, or House of Wisdom — a combination library, translation bureau, and research academy. Translation teams (often Christian, Jewish, and Muslim scholars working together) rendered Greek texts by Aristotle, Euclid, Ptolemy, and Galen into Arabic, often via Syriac intermediaries. This translation movement rescued much Greek science that had been lost in western Europe and made it available for further study.

### Mathematics and Algebra
Muhammad ibn Musa al-Khwarizmi (c. 780–850), working at the House of Wisdom, wrote a book whose Arabic title gave us the word "algebra" — "al-jabr" means "the reunion of broken parts." His systematic treatment of linear and quadratic equations established algebra as an independent discipline. Al-Khwarizmi's name, Latinised as Algoritmi, also gave us the word "algorithm." The Hindu-Arabic numerals (including zero) that he popularised reached Europe through Arabic texts and replaced Roman numerals.

### Medicine and Optics
Ibn Sina, known in Europe as Avicenna (980–1037), wrote *The Canon of Medicine*, an encyclopaedia of diagnosis, pharmacology, and treatment that remained a standard medical textbook in European universities for six hundred years. Al-Razi (Rhazes) distinguished smallpox from measles and gave the first clinical description of both. Ibn al-Haytham (Alhazen, 965–1040) proved that vision works by light entering the eye, and his seven-volume *Book of Optics* shaped European optics for centuries.

### Astronomy and Geography
Al-Biruni (973–1048) calculated the Earth's circumference to within a few percent of the modern value using trigonometric surveying. Astronomers built large observatories in Baghdad, Damascus, Maragha, and Samarkand, refined the astrolabe, and produced precise star catalogues (*Zij*) that later guided Copernicus. Mapmakers produced world atlases that European navigators consulted into the 1500s.

### Al-Andalus and the End
The western wing of the Islamic world, Al-Andalus in Spain, became a parallel centre. The Umayyad Caliphate of Cordoba (929–1031) boasted libraries of four hundred thousand manuscripts and street lighting in a city of perhaps half a million people. Christians, Jews, and Muslims collaborated there on translation and scholarship, and through Al-Andalus much Greek and Arabic learning re-entered western Europe. The Golden Age ended when the Mongols sacked Baghdad in 1258 and destroyed the House of Wisdom, though scholarship continued in Cairo, Andalus, and Persia for centuries more.

### Why It Matters
Without the Islamic Golden Age, much of Greek science and mathematics would have been lost, and the European Renaissance would have had fewer classical texts to build on. The words "algebra," "algorithm," "zero," "cipher," and many stars' names entered European languages from Arabic. Hospitals, observatories, and universities as organised research institutions have roots in Abbasid practice. The period shows how open translation and mixed scholarly communities can drive rapid scientific progress.`,
  },

  // ----------------------------------------------------------------
  // 7. RENAISSANCE AND REFORMATION DEEP
  // ----------------------------------------------------------------
  {
    id: 'history-deep-renaissance-reformation',
    patterns: [/\b(italian renaissance|renaissance art|leonardo da vinci|michelangelo|raphael|medici|humanism renaissance|printing press|gutenberg bible|protestant reformation|martin luther|95 theses|ninety-five theses|john calvin|henry viii|counter-reformation|council of trent|scientific revolution|copernicus|galileo|vesalius)\b/i],
    keywords: ['renaissance', 'leonardo', 'michelangelo', 'medici', 'humanism', 'printing press', 'gutenberg', 'reformation', 'martin luther', '95 theses', 'copernicus', 'galileo'],
    intent: 'factual_question',
    topic: 'history',
    response: () => `The Renaissance and Reformation, unfolding roughly from 1350 to 1650, jointly dismantled the medieval worldview and launched the modern age. The Renaissance rediscovered classical learning and re-centred human experience; the Reformation shattered the religious unity of western Europe; together they set the stage for the scientific revolution and the modern nation-state.

### The Italian Renaissance
Beginning in the wealthy city-states of Florence, Venice, Milan, and Genoa — enriched by Mediterranean trade — the Renaissance ("rebirth") revived interest in classical Greek and Roman texts, many brought by scholars fleeing Constantinople in 1453. The Medici family bankrolled artists and thinkers for generations. Florence produced an outpouring of art and ideas that has rarely been matched.

### Humanism and Art
Renaissance humanism shifted focus from theological questions to the human being — history, literature, ethics, and politics. Scholars like Petrarch and Erasmus searched libraries for lost classical manuscripts and applied new critical methods to ancient texts. In art, painters developed linear perspective, anatomical accuracy, and classical proportions. Leonardo da Vinci painted the *Mona Lisa* and *The Last Supper* while filling notebooks with engineering and anatomy studies. Michelangelo carved the *David* and painted the Sistine Chapel ceiling. Raphael's *School of Athens* gathered the philosophers of antiquity into one idealised scene.

### The Printing Press
Around 1450, Johannes Gutenberg of Mainz invented movable-type printing in Europe. The Gutenberg Bible (1455) was the first major book printed with movable type. Within fifty years, presses operated in over two hundred European cities and had produced millions of books. The printing press slashed the cost of books, made literacy economically useful, allowed ideas to spread faster than any government could control, and turned scholarship from a monastic monopoly into a continent-wide conversation. Without it, the Reformation would likely have remained a local German dispute.

### The Protestant Reformation
On 31 October 1517, the German monk Martin Luther nailed (or mailed) his Ninety-Five Theses to the door of the Wittenberg church, challenging the sale of indulgences and arguing that salvation came through faith and scripture rather than church mediation. The theses went viral in Latin and German, thanks to the new press. Luther was excommunicated in 1521 but protected by sympathetic German princes. John Calvin developed a parallel Reformed theology in Geneva, and in England, King Henry VIII broke with Rome in 1534, founding the Church of England.

### Catholic Counter-Reformation
The Catholic Church responded with the Council of Trent (1545–1563), which clarified doctrine, reformed clerical abuses, and reaffirmed traditional teachings. New orders like the Jesuits emphasised education and missionary work. The Counter-Reformation revitalised Catholicism in southern Europe and carried it to the Americas and Asia, but it could not reunify western Christendom. A century of religious wars followed, ending in the Peace of Westphalia (1648), which made state sovereignty the new principle of European politics.

### Seeds of the Scientific Revolution
The same critical spirit that questioned church authority questioned Aristotle. Nicolaus Copernicus (1473–1543) proposed a heliocentric solar system. Andreas Vesalius (1514–1564) corrected Galen's anatomy through dissection. By the early 1600s, Galileo Galilei's telescope and experiments established physics and astronomy on empirical foundations. The Renaissance conviction that the human mind could understand nature became the foundation of modern science.

### Why It Matters
The Renaissance and Reformation broke the unified medieval worldview and replaced it with pluralism — many religions, many national churches, many competing theories. The printing press democratised knowledge. The new emphasis on individual conscience and empirical observation became the intellectual DNA of modern democracy, science, and capitalism. Europe's religious diversity, scientific culture, and insistence on freedom of thought all trace to these two centuries.`,
  },

  // ----------------------------------------------------------------
  // 8. INDUSTRIAL REVOLUTION — CAUSES AND EFFECTS DEEP
  // ----------------------------------------------------------------
  {
    id: 'history-deep-industrial-revolution',
    patterns: [/\b(first industrial revolution|second industrial revolution|factory system|urbanization 19th century|james watt|steam engine|spinning jenny|spinning mule|power loom|enclosure acts|luddite|bourgeoisie|proletariat|industrial capitalism|coal mining history|steam locomotive|textile mill|manchester industrial)\b/i],
    keywords: ['industrial revolution', 'factory system', 'urbanization', 'james watt', 'steam engine', 'spinning jenny', 'enclosure acts', 'luddite', 'bourgeoisie', 'proletariat'],
    intent: 'factual_question',
    topic: 'history',
    response: () => `The Industrial Revolution, beginning in Britain around 1760 and spreading across Europe, North America, and Japan over the next 150 years, transformed humanity from a farming and handicraft species into a manufacturing and urban one. It reordered work, family, cities, class, energy use, and humanity's impact on the planet more thoroughly than any change since the agricultural revolution ten thousand years earlier.

### Why Britain First
Several conditions converged in mid-eighteenth-century Britain. Britain had abundant coal and iron ore, an agriculture made more productive by enclosure acts and crop rotation (which freed rural labour), a stable government that protected property and contracts, a global empire that supplied raw cotton and captive markets, a strong navy, and a culture that prized practical invention. Banks and joint-stock companies made capital available for large ventures. Together these turned isolated tinkering into systematic industrialisation.

### The Textile Revolution
The first industry to mechanise was textiles. James Hargreaves's spinning jenny (1764), Richard Arkwright's water frame (1769), and Samuel Crompton's spinning mule (1779) gradually replaced hand-spinning. Edmund Cartwright's power loom (1785) did the same for weaving. Output per worker soared, yarn prices collapsed, and the putting-out system — rural families spinning and weaving at home — was replaced by centralised mills. The factory was born.

### Steam Power
The decisive breakthrough was James Watt's improved steam engine, patented in 1769 and commercially viable by 1776. Earlier Newcomen engines wasted enormous energy; Watt's separate condenser doubled efficiency. Steam power freed factories from riverside sites and made mines deeper. Steam locomotives and steamships after 1820 slashed transport costs, knitting distant markets into single economies. By 1850 Britain produced more iron than the rest of the world combined.

### Urbanisation and Social Change
Industry drew workers to the cities. Manchester grew from twenty-five thousand people in 1772 to three hundred thousand by 1850, with similar explosions in Birmingham, Glasgow, and Chicago. Housing could not keep up; families crowded into poorly built tenements with no sanitation, and cholera killed thousands. Working hours were twelve to sixteen a day, with children as young as six employed in mines and mills. A new class structure emerged: the industrial bourgeoisie who owned the factories, and the proletariat who sold their labour — the division Karl Marx made famous.

### The Second Industrial Revolution (1870–1914)
After 1870 a second wave spread to Germany, the United States, and Japan. Steel replaced iron (Bessemer and open-hearth processes), electricity supplemented steam, chemicals produced synthetic dyes and fertilisers, petroleum fuelled internal-combustion engines, and assembly lines made mass production possible. Germany's investment in technical universities and corporate research made it a leader in chemicals and electrical engineering. The United States pioneered mass production at Ford's Highland Park plant in 1913.

### Responses and Reform
Industrialisation provoked fierce debate. Luddites smashed textile machinery. Labour unions won legal recognition. Factory acts from 1833 onward limited child labour. Reformers like Engels documented urban misery; Marx and Engels's *Communist Manifesto* (1848) argued that industrial capitalism contained contradictions that would lead to its overthrow. By 1900 most industrial countries had adopted labour legislation, public schools, and rudimentary social insurance.

### Why It Matters
The Industrial Revolution is the hinge of modern history. Living standards, life expectancy, literacy, and material abundance that had barely changed for a thousand years suddenly soared — but only in industrial regions, widening global inequality. Cities, wage labour, commuting, environmental pollution, climate change, mass education, and consumer culture all descend from the factory, the steam engine, and the assembly line. Every economic and ecological debate of the twenty-first century is, at root, a debate about what began in eighteenth-century Britain.`,
  },

  // ----------------------------------------------------------------
  // 9. WORLD WAR I — CAUSES AND TRENCH WARFARE DEEP
  // ----------------------------------------------------------------
  {
    id: 'history-deep-world-war-1',
    patterns: [/\b(main causes of ww1|militarism alliances imperialism nationalism|triple entente|triple alliance|central powers|allied powers|franz ferdinand|gavrilo princip|black hand|trench warfare|western front|no man's land|battle of verdun|battle of the somme|gallipoli|schlieffen plan|unrestricted submarine warfare|armistice 1918|league of nations)\b/i],
    keywords: ['world war 1', 'main causes', 'triple entente', 'triple alliance', 'central powers', 'franz ferdinand', 'gavrilo princip', 'trench warfare', 'verdun', 'somme', 'league of nations'],
    intent: 'factual_question',
    topic: 'history',
    response: () => `World War I (1914–1918) was the first total war of the industrial age. It killed roughly seventeen million people, destroyed four empires (Russian, Ottoman, German, Austro-Hungarian), and reshaped the map of Europe and the Middle East. Its unresolved aftermath made a second world war twenty years later almost inevitable.

### The MAIN Causes
Historians summarise the long-term causes with the acronym MAIN: Militarism, Alliances, Imperialism, and Nationalism. Militarism: the great powers built enormous conscript armies. Alliances: Europe had divided into two armed camps — the Triple Entente (France, Russia, Britain) and the Triple Alliance (Germany, Austria-Hungary, Italy) — so a local conflict could become a continental war. Imperialism: competition for colonies created diplomatic friction. Nationalism: ethnic minorities in the Austro-Hungarian and Ottoman empires demanded independence, and Slavic nationalism in the Balkans was especially volatile.

### The Spark: Sarajevo, June 1914
On 28 June 1914, Archduke Franz Ferdinand was assassinated in Sarajevo by Gavrilo Princip, a Bosnian Serb nationalist of the Black Hand. Austria-Hungary, encouraged by Germany's "blank cheque" of support, issued an ultimatum to Serbia; its partial acceptance was deemed insufficient, and Austria-Hungary declared war on 28 July. Within a week the alliance system activated: Russia mobilised, Germany declared war on Russia and France, and on invading Belgium, Britain entered the war.

### Trench Warfare on the Western Front
Both sides expected a short, mobile war. Instead, the German advance was halted at the Marne in September 1914, and both sides dug in. Within weeks, two parallel trench systems stretched from the Swiss border to the North Sea. Trenches were protected by barbed wire, machine guns, and artillery; the open ground between them was called no man's land. Offensives followed a grim pattern: a days-long artillery bombardment, then infantry going "over the top" into machine-gun fire. At Verdun (1916) roughly seven hundred thousand men fell for no strategic gain. At the Somme (1916), Britain lost sixty thousand men on the first day.

### New Weapons and Global War
The war accelerated military technology. Machine guns made frontal assaults suicidal. Poison gas (chlorine, then mustard gas) was first used by Germany at Ypres in 1915. Tanks appeared in 1916, aircraft evolved from reconnaissance to fighters and bombers, and submarines blockaded Britain with torpedoes. The war's reach was global: fighting raged in the Alps, Mesopotamia, Palestine, Gallipoli, East Africa, and at sea. Colonial troops from India, Africa, and Indochina fought and died in European trenches.

### The End and the Treaty
Germany's unrestricted submarine warfare — sinking ships like the Lusitania in 1915 and resuming the campaign in 1917 — pushed the United States into the war in April 1917. Russia's war-weariness fuelled the 1917 revolutions, and the new Bolshevik government signed the Treaty of Brest-Litovsk in March 1918, exiting the war. Germany launched a final western offensive in spring 1918 but was halted by American reinforcements. On 11 November 1918 the armistice took effect. The 1919 Treaty of Versailles blamed Germany for the war, stripped it of territory, limited its army, and imposed crushing reparations. The League of Nations was founded to prevent future wars, but the U.S. Senate refused to join, and the League proved toothless.

### Why It Matters
World War I destroyed four empires, unleashed the Russian Revolution, and brought the United States to the centre of global power. It normalised total war — mobilisation of entire economies, conscription of millions, and targeting of civilian populations. The postwar settlement's flaws made World War II likely. Trench warfare remains the symbol of industrial slaughter, and the war's memory shaped the pacifism and modernism of the 1920s and 1930s.`,
  },

  // ----------------------------------------------------------------
  // 10. WORLD WAR II — BATTLES AND HOLOCAUST DEEP
  // ----------------------------------------------------------------
  {
    id: 'history-deep-world-war-2',
    patterns: [/\b(world war 2|wwii|second world war|axis powers|allied powers|battle of stalingrad|d-day|normandy landings|battle of midway|pearl harbor|holocaust|final solution|auschwitz|atomic bomb|hiroshima|nagasaki|united nations formation|un charter|operation barbarossa)\b/i],
    keywords: ['world war 2', 'axis', 'allied', 'stalingrad', 'd-day', 'normandy', 'midway', 'pearl harbor', 'holocaust', 'hiroshima'],
    intent: 'factual_question',
    topic: 'history',
    response: () => `World War II (1939–1945) was the deadliest conflict in human history, killing perhaps seventy million people — soldiers and civilians in roughly equal numbers. It reshaped the global order, ended European colonialism, produced the United Nations, and launched the nuclear age. No part of the world was untouched.

### The Two Alliances
The Axis powers — Nazi Germany, Fascist Italy, and Imperial Japan — sought to build new empires by force. The Allies, led by Britain, the Soviet Union, and the United States, opposed them. The Soviets had briefly been allied with Germany under the Molotov-Ribbentrop Pact of 1939, but Germany's invasion of the USSR in June 1941 brought them onto the Allied side. The United States entered in December 1941. China had fought Japan since 1937.

### The European Theatre
Germany's blitzkrieg overran Poland in 1939, France in 1940, and the Balkans and North Africa in 1941. Britain survived the Battle of Britain (1940) — the first major campaign fought entirely in the air. The turning point in Europe was Stalingrad (August 1942 to February 1943), where the entire German Sixth Army was destroyed. The Soviet Union absorbed roughly twenty-five million war deaths.

### D-Day and the Fall of Germany
On 6 June 1944 — D-Day — Allied forces landed on five beaches in Normandy, France, in the largest amphibious invasion in history. Within a year, Allied armies from the west and Soviet armies from the east crushed Nazi Germany. Berlin fell in April 1945, Hitler committed suicide, and Germany surrendered on 8 May 1945.

### The Pacific Theatre
Japan's expansion across East Asia and the Pacific accelerated after Pearl Harbor on 7 December 1941, when Japanese aircraft sank much of the U.S. Pacific Fleet. The turning point was the Battle of Midway (June 1942), where American dive bombers sank four Japanese aircraft carriers in a single day, shifting the balance in the Pacific. From 1943 to 1945, American forces conducted an "island-hopping" campaign toward Japan, capturing Iwo Jima and Okinawa.

### The Holocaust
In occupied Europe, Nazi Germany carried out the Holocaust — the systematic murder of six million Jews, along with Roma, people with disabilities, and others the regime deemed undesirable. At the Wannsee Conference in January 1942, Nazi officials coordinated the "Final Solution," using extermination camps like Auschwitz, Treblinka, and Sobibor. The Holocaust remains the central example of genocide in modern history and reshaped international law.

### The Atomic Bombs and the End
Fearing that invading Japan would cost a million Allied casualties, the United States dropped atomic bombs on Hiroshima (6 August 1945) and Nagasaki (9 August 1945), killing roughly two hundred thousand people, most civilians. Japan surrendered on 2 September 1945. The bombings remain morally debated, but they ended the war and ushered humanity into the nuclear age.

### The United Nations and Aftermath
In June 1945, fifty nations signed the United Nations Charter in San Francisco, creating an organisation to prevent a third world war through collective security and international law. The Nuremberg and Tokyo trials prosecuted Axis leaders for war crimes, establishing that individuals — not just states — could be held accountable. Europe was divided between an American-allied west and a Soviet-allied east, beginning the Cold War.

### Why It Matters
World War II destroyed the old European empires and produced a bipolar world dominated by two superpowers. It normalised the targeting of civilians from the air, made genocide a codified crime, and gave humanity nuclear weapons. The United Nations, the Universal Declaration of Human Rights, the World Bank, and the postwar trade order all date from its aftermath.`,
  },

  // ----------------------------------------------------------------
  // 11. COLD WAR AND SPACE RACE DEEP
  // ----------------------------------------------------------------
  {
    id: 'history-deep-cold-war-space-race',
    patterns: [/\b(cold war|containment policy|truman doctrine|marshall plan|berlin blockade|berlin wall|cuban missile crisis|korean war|vietnam war|space race|sputnik|apollo 11|yuri gagarin|neil armstrong|fall of the soviet union|collapse of ussr|detente|perestroika|glasnost)\b/i],
    keywords: ['cold war', 'containment', 'truman doctrine', 'marshall plan', 'berlin wall', 'cuban missile crisis', 'space race', 'sputnik', 'apollo 11', 'soviet union'],
    intent: 'factual_question',
    topic: 'history',
    response: () => `The Cold War (1947–1991) was a forty-four-year geopolitical and military struggle between the United States and its allies on one side and the Soviet Union and its allies on the other. It never produced a direct clash between superpowers — hence "cold" — but killed millions in proxy wars, divided Europe for two generations, and ended with the Soviet collapse.

### Containment and the Truman Doctrine
In 1947, President Truman announced the Truman Doctrine, pledging support to nations threatened by Soviet expansion. The strategy, called containment, aimed to prevent communism from spreading. The Marshall Plan (1948) pumped roughly thirteen billion dollars into rebuilding Western Europe, anchoring it in the American orbit. The Soviet Union responded by tightening control over Eastern Europe.

### Divided Germany and the Berlin Wall
Germany was divided into four occupation zones after World War II. The western zones became the Federal Republic of Germany (West Germany) in 1949, while the Soviet zone became the German Democratic Republic (East Germany). Berlin was likewise divided. In 1948–49 the Soviets blockaded West Berlin; the Allies airlifted supplies for a year. In 1961, East Germany built the Berlin Wall to stop East Germans fleeing west — the symbol of the Cold War's division of Europe until its fall in 1989.

### The Cuban Missile Crisis
In October 1962, American spy planes discovered Soviet missile sites under construction in Cuba, ninety miles from Florida. President Kennedy ordered a naval blockade and demanded their removal. For thirteen days the world stood closer to nuclear war than at any other moment in history. Khrushchev agreed to remove the missiles in exchange for a public American promise not to invade Cuba and a secret promise to remove American missiles from Turkey. Both sides established a hotline and began arms control.

### Proxy Wars
The Cold War's proxy conflicts were in the developing world. The Korean War (1950–1953) began when communist North Korea invaded South Korea; a UN force pushed back, China intervened, and the war ended in an armistice at the original border, with millions dead and the peninsula still divided. The Vietnam War (1955–1975) saw the United States support South Vietnam against communist North Vietnam; after years of escalation and roughly fifty-eight thousand American and two million Vietnamese deaths, the United States withdrew and Vietnam was unified under communism. Soviet interventions in Hungary, Czechoslovakia, and Afghanistan bogged down Soviet ambitions.

### The Space Race
The Cold War reached into orbit. The Soviet Union launched Sputnik, the first artificial satellite, in October 1957. In April 1961, Yuri Gagarin became the first human in space. Kennedy committed the United States to land a man on the Moon within the decade. Apollo achieved it on 20 July 1969, when Neil Armstrong stepped onto the Moon. The Space Race produced communications satellites and miniaturised electronics.

### Detente and Collapse
After the Cuban crisis, both sides pursued detente through the 1970s, signing arms-control treaties. Tensions rose after the 1979 Soviet invasion of Afghanistan. By the mid-1980s, Mikhail Gorbachev introduced perestroika (restructuring) and glasnost (openness), hoping to save the system. Instead, the reforms unleashed forces he could not control. The Berlin Wall fell in November 1989, and the Soviet Union dissolved in December 1991.

### Why It Matters
The Cold War shaped the second half of the twentieth century — alliances, economies, technology, and the shadow of nuclear war. Its proxy wars reshaped Korea, Vietnam, Afghanistan, and Central America. Its end left the United States as the sole superpower, opened Eastern Europe to democracy, and produced the world we still inhabit, including NATO expansion and the conflicts after 1991.`,
  },

  // ----------------------------------------------------------------
  // 12. DECOLONIZATION AND INDEPENDENCE MOVEMENTS DEEP
  // ----------------------------------------------------------------
  {
    id: 'history-deep-decolonization',
    patterns: [/\b(decolonization|african decolonization|kwame nkrumah|patrice lumumba|jomo kenyatta|algerian war|vietnamese independence|ho chi minh|suez crisis 1956|pan-african|non-aligned movement|sykes-picot|mandate system|southeast asian decolonization|sukarno|neocolonialism|post-colonial)\b/i],
    keywords: ['decolonization', 'african independence', 'kwame nkrumah', 'patrice lumumba', 'algerian war', 'vietnamese independence', 'suez crisis', 'pan-african', 'non-aligned movement', 'sykes-picot'],
    intent: 'factual_question',
    topic: 'history',
    response: () => `Decolonization — the dismantling of European colonial empires between 1945 and roughly 1980 — was one of the largest political transformations in history. In less than four decades, hundreds of millions of people in Asia, Africa, the Middle East, and the Pacific moved from colonial subjecthood to national citizenship, and dozens of new states joined the United Nations. The process reshaped global politics, economics, and culture.

### The Catalysts of Decolonization
World War II weakened European colonial powers financially and militarily, exposing the myth of European invincibility (Japan had overrun European colonies across Asia in 1941–1942). The Atlantic Charter of 1941, signed by Roosevelt and Churchill, affirmed the right of peoples to choose their own form of government. The new United Nations placed self-determination in its charter. The United States and the Soviet Union both opposed the old European empires. The costs of holding colonies now exceeded the benefits.

### South and Southeast Asia
Britain granted independence to India and Pakistan in August 1947. The Partition divided the subcontinent along religious lines, displacing roughly fifteen million people and killing perhaps a million in communal violence. The Dutch fought a four-year war in Indonesia before recognising independence under Sukarno in 1949. France was defeated at Dien Bien Phu in 1954 after an eight-year war in Indochina; the Geneva Accords split Vietnam, setting the stage for the Vietnam War. The British withdrew from Malaya, Burma, and Singapore by the early 1960s.

### African Decolonization
Africa's transformation was the most dramatic. Ghana (formerly the Gold Coast) became independent in 1957 under Kwame Nkrumah. In 1960 alone — the "Year of Africa" — seventeen African states gained independence. By 1980 almost the entire continent was self-governing. The process was sometimes peaceful and sometimes violent. Algeria's war of independence from France (1954–1962) killed perhaps a million people. In the Congo, the assassination of Patrice Lumumba in 1961 inaugurated decades of instability. Apartheid South Africa held out until 1994, when Nelson Mandela became president after twenty-seven years in prison.

### The Middle East and Mandates
The Ottoman Empire's collapse after World War I left Britain and France holding League of Nations mandates over much of the Arab world, under the Sykes-Picot Agreement of 1916. After World War II these mandates became independent kingdoms and republics: Syria (1946), Jordan (1946), Israel (1948), Lebanon, and Iraq. The 1956 Suez Crisis — when Britain, France, and Israel invaded Egypt and were forced to withdraw by American and Soviet pressure — marked the end of Britain and France as Middle Eastern powers. The Arab-Israeli conflict and many regional tensions date from this period of hasty border-drawing.

### Post-Colonial Challenges
Independence did not bring instant prosperity. Many new states inherited colonial-era borders that cut across ethnic and linguistic lines, leading to civil wars (Nigeria's Biafra, Sudan, Congo). Economies were often monocultural — dependent on a single export — making them vulnerable to price swings. Cold War superpowers propped up friendly dictators, fuelling proxy conflicts. Kwame Nkrumah warned of neocolonialism, in which political independence coexisted with economic dependency. The Non-Aligned Movement, founded in 1961 in Belgrade, tried to chart a third path between the American and Soviet blocs.

### Why It Matters
Decolonization created the political map of the modern world. The United Nations grew from fifty-one founding members in 1945 to 193 today, mostly because of decolonization. Post-colonial literature and development economics emerged as major currents. The unfinished business — unequal trade, debt, climate justice, border disputes, and the shadow of slavery — continues to shape global politics. Understanding the colonial era is essential to understanding the modern world.`,
  },

  // ----------------------------------------------------------------
  // 13. MODERN GLOBALIZATION AND THE 21ST CENTURY DEEP
  // ----------------------------------------------------------------
  {
    id: 'history-deep-modern-globalization',
    patterns: [/\b(digital revolution|information age|internet history|world wide web|european union formation|eu history|fall of the soviet union|globalization|globalisation|war on terror|9 11 attacks|september 11 attacks|climate change awareness|paris agreement|social media history|arab spring|financial crisis 2008|brexit)\b/i],
    keywords: ['digital revolution', 'internet', 'european union', 'globalization', 'war on terror', 'climate change', 'social media', 'arab spring', 'financial crisis 2008'],
    intent: 'factual_question',
    topic: 'history',
    response: () => `The decades from 1980 to the present have been shaped by three intertwined forces — digital technology, globalisation, and the geopolitical reordering after the Cold War — together with challenges like climate change, terrorism, and the 2008 financial crisis. Historians call this the Information Age, transforming work, communication, politics, and daily life more rapidly than any previous era.

### The Digital Revolution
The digital revolution began with the silicon microchip and personal computing in the 1970s and 1980s. The Internet, originally a U.S. Defense Department network called ARPANET, expanded into a global system in the 1980s. In 1989, Tim Berners-Lee at CERN invented the World Wide Web. By 2000, roughly five percent of the world was online; by 2020, more than sixty percent. Smartphones after 2007 put a connected computer in every pocket. Whole industries — newspapers, music, retail, photography, banking — were rebuilt within a generation.

### Globalisation and the European Union
After the Cold War, the dominant idea was that free trade and integrated supply chains would bind the world together. The World Trade Organisation was founded in 1995. China joined the WTO in 2001 and became the "factory of the world," lifting hundreds of millions out of poverty but hollowing out manufacturing in older industrial regions. The European Union expanded from twelve to twenty-eight members, adopted the euro in 2002, and dissolved most internal border controls.

### The End of the Cold War and the "Unipolar Moment"
The collapse of the Soviet Union in 1991 left the United States as the sole superpower, a "unipolar moment." NATO expanded eastward, democracy spread across Eastern Europe, and many observers predicted an "end of history" in which liberal democracy would become universal. The 1990s saw rapid growth, the rise of the Web, and democratisation across Latin America, Africa, and Asia — but also failed interventions in Rwanda and the Balkans.

### September 11 and the War on Terror
The 11 September 2001 al-Qaeda attacks killed nearly three thousand people. America responded by invading Afghanistan (2001) to destroy al-Qaeda's base, and Iraq (2003) to remove Saddam Hussein. The Iraq War and long Afghan occupation cost trillions of dollars and hundreds of thousands of lives, destabilised the region, and produced new movements like ISIS. The Arab Spring of 2011 toppled governments across the Middle East but mostly led to civil war or renewed authoritarianism.

### Climate Change Awareness
By the 1990s, scientific evidence that human greenhouse-gas emissions were warming the climate had become overwhelming. The 1997 Kyoto Protocol and the 2015 Paris Agreement committed countries to limit emissions. Despite these agreements, global emissions kept rising, and visible effects — record heatwaves, wildfires, melting ice, stronger storms — made climate change the defining long-term challenge of the century.

### Social Media and the 2008 Crisis
Platforms like Facebook (2004), YouTube (2005), and Twitter (2006) reshaped how people communicate, organise politically, and consume news. Social media enabled movements from the Arab Spring to #MeToo but also accelerated misinformation and polarisation. The 2008 global financial crisis, triggered by the U.S. subprime mortgage collapse, caused the worst recession since the 1930s, led to bailouts and austerity, and shook confidence in globalised capitalism — fuelling populist movements like Brexit (2016).

### Why It Matters
The decades since 1980 have produced more technological change than the previous two centuries. They have connected billions, lifted hundreds of millions out of poverty, and created unprecedented prosperity — but also deepening inequality, ecological crisis, and political backlash. The internet, globalisation, climate change, and the post-9/11 security state frame every contemporary issue, from public health to democracy to artificial intelligence.`,
  },
]
