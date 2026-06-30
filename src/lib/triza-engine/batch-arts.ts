/**
 * ============================================================
 *  TRIZA ENGINE — Knowledge Batch: Arts, Culture & Literature
 * ============================================================
 *
 *  25 hand-written entries covering world literature, visual
 *  arts, music, cinema, and calligraphy. Each entry includes
 *  English + Roman Urdu trigger patterns so TRIZA can respond
 *  to multilingual user queries natively.
 *
 *  All responses: 250-400 words, markdown formatted, factually
 *  accurate. No external LLM — pure TypeScript knowledge base.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const ARTS_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------
  // 1. LEO TOLSTOY
  // ----------------------------------------------------------
  {
    id: 'leo-tolstoy',
    patterns: [/\b(tolstoy|leo tolstoy|war and peace|anna karenina|tolstoy kaun|tolstoy ki kitab|russian adab)\b/i],
    intent: 'factual_question',
    topic: 'literature',
    response: () => `## Leo Tolstoy — Voice of Russian Literature

Born in 1828 at Yasnaya Polyana, Count **Lev Nikolayevich Tolstoy** is widely regarded as one of the greatest novelists in world literature. His epics combine vast historical sweep with deep psychological insight, exploring war, faith, family, and moral transformation.

### Major Works
Tolstoy's two colossal novels define 19th-century fiction. **War and Peace** (1869) follows Russian aristocratic families during the Napoleonic Wars — over 1,200 pages with hundreds of characters. **Anna Karenina** (1877) examines love, betrayal, and social hypocrisy through its tragic heroine.

### Themes and Philosophy
- **Pacifism and non-violence** — later influenced Gandhi and Martin Luther King Jr.
- **Christian anarchism** — rejected state and church authority
- **Simplicity and peasant life** — dressed as a muzhik, gave away his wealth
- **Inner moral struggle** — every major character wrestles with conscience

### Notable Works
| Work | Year | Significance |
|------|------|--------------|
| War and Peace | 1869 | Masterpiece of historical realism |
| Anna Karenina | 1877 | Tragic study of love and society |
| The Death of Ivan Ilyich | 1886 | Meditation on mortality |
| Resurrection | 1899 | Critique of justice and privilege |
| Hadji Murad | 1912 | Posthumous novella of Caucasus war |

### Spiritual Crisis
In the 1870s Tolstoy suffered a profound existential crisis, documented in *A Confession*. He abandoned his earlier aristocratic life, embraced a personal Christianity of love and non-resistance, and was eventually excommunicated by the Russian Orthodox Church in 1901.

**Legacy:**
Tolstoy died in 1910 at a remote railway station while fleeing his estate. His fusion of literary realism with moral philosophy reshaped modern fiction — Faulkner called him 'the greatest of all novelists', and his ideas on non-violence rippled far beyond Russia into the global freedom movements of the 20th century.`,
  },

  // ----------------------------------------------------------
  // 2. MARK TWAIN
  // ----------------------------------------------------------
  {
    id: 'mark-twain',
    patterns: [/\b(mark twain|samuel clemens|huckleberry finn|huck finn|tom sawyer|twain kaun|american humorist)\b/i],
    intent: 'factual_question',
    topic: 'literature',
    response: () => `## Mark Twain — America's First Great Humorist

Born **Samuel Langhorne Clemens** in 1835 in Missouri, Mark Twain grew up along the Mississippi River — the landscape that would define his fiction. Before becoming a novelist he worked as a printer's apprentice, riverboat pilot, silver miner, and newspaper reporter, gathering the raw material of American life.

### Signature Works
- **The Adventures of Tom Sawyer** (1876) — mischievous boyhood in St. Petersburg, a fictionalized Hannibal
- **Adventures of Huckleberry Finn** (1884) — a runaway boy and an enslaved man, Jim, flee down the Mississippi. Hemingway declared: 'All modern American literature comes from one book by Mark Twain called Huckleberry Finn.'
- **A Connecticut Yankee in King Arthur's Court** (1889) — satirical time-travel tale
- **The Prince and the Pauper** (1881) — social class swap fable

### Voice and Style
Twain pioneered the **American vernacular voice** — writing in the actual speech of ordinary people rather than formal English. His humor was sharp, ironic, often dark, lampooning slavery, imperialism, greed, and religious hypocrisy.

### Themes
- **Race and conscience** — Huck's moral crisis over helping Jim escape
- **Anti-imperialism** — outspoken critic of the Philippine-American War
- **Human folly** — Twain grew more cynical with age
- **Childhood freedom** — the river as symbol of escape

### Notable Works
| Work | Year | Form |
|------|------|------|
| The Celebrated Jumping Frog | 1865 | Short story |
| Roughing It | 1872 | Travel memoir |
| Life on the Mississippi | 1883 | Memoir |
| The Mysterious Stranger | 1916 | Posthumous novella |

**Legacy:**
Twain died in 1910, the year Halley's Comet returned — as he had predicted. He was America's first true celebrity author, photographed by Brady, befriended by presidents, and quoted endlessly. His white suit, cigar, and untamed hair became icons of American wit. The Mark Twain Prize for American Humor continues to honor his legacy today.`,
  },

  // ----------------------------------------------------------
  // 3. JANE AUSTEN
  // ----------------------------------------------------------
  {
    id: 'jane-austen',
    patterns: [/\b(jane austen|pride and prejudice|sense and sensibility|emma novel|regency novel|austen kaun|british adab)\b/i],
    intent: 'factual_question',
    topic: 'literature',
    response: () => `## Jane Austen — Master of the Regency Novel

Born in 1775 at the rectory in Steventon, Hampshire, **Jane Austen** wrote quietly, sometimes hiding her manuscripts when visitors arrived. She published anonymously during her lifetime — her novels appeared simply as 'By a Lady'. Despite this obscurity, she became one of the most beloved and studied novelists in English literature.

### Her World
Austen wrote about the **gentry class of Regency England** — clergymen, minor landowners, and their families. Her stage is small: drawing rooms, assembly balls, country walks. Yet within that small stage she mapped the entire architecture of human vanity, longing, and moral growth.

### Major Novels
- **Sense and Sensibility** (1811) — sisters Elinor (restraint) and Marianne (passion)
- **Pride and Prejudice** (1813) — Elizabeth Bennet and Mr. Darcy's slow mutual awakening
- **Mansfield Park** (1814) — shy Fanny Price in a morally decaying household
- **Emma** (1815) — a wealthy young matchmaker who misreads everyone, including herself
- **Northanger Abbey** (1817) — parody of Gothic novels
- **Persuasion** (1817) — autumnal second-chance love

### Signature Style
- **Free indirect discourse** — sliding between narrator and character's thought
- **Ironic narration** — the famous opening of *Pride and Prejudice*
- **Dialogue as duel** — every conversation reveals class and character
- **Marriage plot** — but always with economic and moral seriousness

### Notable Works
| Novel | Year | Heroine |
|------|------|---------|
| Sense and Sensibility | 1811 | Elinor & Marianne |
| Pride and Prejudice | 1813 | Elizabeth Bennet |
| Mansfield Park | 1814 | Fanny Price |
| Emma | 1815 | Emma Woodhouse |
| Persuasion | 1817 | Anne Elliot |

**Legacy:**
Austen died at 41 in 1817, probably of Addison's disease or Hodgkin's lymphoma. She was largely unknown outside literary circles until her nephew's 1869 memoir sparked 'Austenolatry'. Today her six novels sell millions, inspire endless film adaptations, and fuel fan cultures from the Jane Austen Society to modern 'Austenreticulations'. Her sharp eye for social comedy remains unmatched.`,
  },

  // ----------------------------------------------------------
  // 4. CHARLES DICKENS
  // ----------------------------------------------------------
  {
    id: 'charles-dickens',
    patterns: [/\b(charles dickens|dickens|oliver twist|great expectations|a tale of two cities|dickens kaun|victorian novelist)\b/i],
    intent: 'factual_question',
    topic: 'literature',
    response: () => `## Charles Dickens — The Voice of Victorian England

Born in 1812 in Portsmouth, **Charles John Huffam Dickens** became the most popular novelist of the Victorian era and arguably the first true global literary celebrity. His childhood was scarred when his father was imprisoned for debt — twelve-year-old Charles was forced to work in a blacking warehouse pasting labels onto boot-polish pots. That trauma of abandoned childhood and social shame echoes through every page he later wrote.

### Major Themes
- **Childhood suffering** — orphans, workhouses, exploited children
- **London as character** — fog, mud, crooked streets, gaslight
- **Social critique** — debtors' prisons, factories, brutal schools, corrupt law
- **Memorable names** — Mr. Micawber, Uriah Heep, Ebenezer Scrooge, Miss Havisham

### Serialized Storytelling
Dickens wrote in **monthly installments**, each episode ending on a cliffhanger. Readers in New York waited at the docks shouting to incoming ships: 'Is Little Nell dead?' This serial form shaped the rhythm of his prose — every chapter a small performance.

### Notable Works
| Work | Year | Significance |
|------|------|--------------|
| The Pickwick Papers | 1836 | First novel, comic success |
| Oliver Twist | 1837 | Workhouse orphan, Fagin's gang |
| A Christmas Carol | 1843 | Redemption of Ebenezer Scrooge |
| David Copperfield | 1850 | Most autobiographical novel |
| Bleak House | 1852 | Critique of Chancery law |
| Great Expectations | 1861 | Pip, Miss Havisham, Estella |
| A Tale of Two Cities | 1859 | French Revolution epic |

### Public Readings
Dickens toured Britain and America giving dramatic readings of his own works — exhausting, theatrical performances that earned huge sums but likely hastened his death.

**Legacy:**
Dickens died in 1870 and was buried in Poets' Corner at Westminster Abbey. He invented the modern idea of Christmas as we know it (turkey, family, charity), created more enduring characters than any English novelist, and turned fiction into an instrument of social reform. No writer has ever made Victorian London live so vividly.`,
  },

  // ----------------------------------------------------------
  // 5. ERNEST HEMINGWAY
  // ----------------------------------------------------------
  {
    id: 'ernest-hemingway',
    patterns: [/\b(hemingway|ernest hemingway|old man and the sea|the sun also rises|a farewell to arms|hemingway kaun|minimalist writer)\b/i],
    intent: 'factual_question',
    topic: 'literature',
    response: () => `## Ernest Hemingway — Master of the Lean Sentence

Born in 1899 in Oak Park, Illinois, **Ernest Miller Hemingway** reshaped 20th-century prose with his spare, declarative style. Before he was a novelist he was a reporter for the *Kansas City Star*, then an ambulance driver on the Italian front in World War I — both experiences forging the discipline and the wounds that would fuel his fiction.

### The Iceberg Theory
Hemingway's famous **theory of omission** held that a writer could omit crucial details, leaving them implicit beneath the surface — like an iceberg, seven-eighths underwater. The result is prose stripped of ornament, where emotion lives in what is *not* said. This style broke decisively from the Victorian eloquence of the previous century.

### Life of Action
Hemingway lived as dramatically as he wrote: bullfighting in Pamplona, big-game hunting in East Africa, deep-sea fishing off Cuba, reporting on the Spanish Civil War and D-Day, surviving two plane crashes in two days in 1954. He served as a model for his own masculine heroes.

### Notable Works
| Work | Year | Setting |
|------|------|---------|
| The Sun Also Rises | 1926 | Lost Generation in Paris & Pamplona |
| A Farewell to Arms | 1929 | Italian front, WWI |
| For Whom the Bell Tolls | 1940 | Spanish Civil War |
| The Old Man and the Sea | 1952 | Cuban fisherman Santiago |
| A Moveable Feast | 1964 | Posthumous Paris memoir |

### Themes
- **Courage under pressure** — 'grace under pressure' was his definition of courage
- **War and disillusionment** — broken bodies, broken faith
- **Man vs. nature** — the marlin, the lion, the elephant
- **Masculinity and mortality** — stoic men, quiet deaths

**Legacy:**
Hemingway won the **Nobel Prize in Literature in 1954**. Plagued by depression, concussions, and electroshock therapy, he died by suicide in 1961 in Ketchum, Idaho — his father, brother, and sister had also taken their own lives. His style remains the most imitated of any modern writer, his legend inseparable from the hard-boiled myth of the writer as adventurer.`,
  },

  // ----------------------------------------------------------
  // 6. GABRIEL GARCIA MARQUEZ
  // ----------------------------------------------------------
  {
    id: 'marquez-magical-realism',
    patterns: [/\b(marquez|garcia marquez|gabriel garcia|one hundred years of solitude|cien anos|magical realism|magic realism|marquez kaun|latino adab)\b/i],
    intent: 'factual_question',
    topic: 'literature',
    response: () => `## Gabriel Garcia Marquez — Architect of Magical Realism

Born in 1927 in Aracataca, a sleepy banana-town in northern Colombia, **Gabriel Jose de la Concha Garcia Marquez** was raised by his grandparents, whose superstitions, ghost stories, and political fury became the soil of his fiction. He worked as a journalist in Cartagena, Paris, and Havana before transforming Latin American literature forever.

### One Hundred Years of Solitude
Published in 1967, **Cien anos de soledad** tells the multi-generational saga of the Buendia family in the fictional village of Macondo. It opens with one of literature's most famous lines — Colonel Aureliano Buendia standing before a firing squad, remembering the ice his father took him to discover. Yellow butterflies follow lovers, rain falls for four years eleven months, a priest levitates after drinking hot chocolate. The impossible and the ordinary share one seamless surface.

### Magical Realism
Garcia Marquez did not invent the term, but he made it the signature mode of Latin American fiction. In magical realism:
- Supernatural events are narrated in a **flat, journalistic tone**
- Real historical violence (colonialism, civil war, dictatorship) appears **more absurd than magic**
- Myth and memory braid together without explanation

### Other Major Works
| Work | Year | Theme |
|------|------|-------|
| No One Writes to the Colonel | 1961 | Aging veteran's quiet dignity |
| Leaf Storm | 1955 | Macondo's founding |
| The Autumn of the Patriarch | 1975 | Dictator novel |
| Love in the Time of Cholera | 1985 | Love deferred for 51 years |
| Chronicle of a Death Foretold | 1981 | Honor killing, collective guilt |
| News of a Kidnapping | 1996 | Non-fiction, Medellin cartel |

### Politics and Friendship
A lifelong friend of Fidel Castro, Garcia Marquez was a committed leftist who used his fame to defend Latin American dignity. He helped found **SAN, the New Latin American Foundation for Cinema**, and mentored a generation of writers from Mexico to Buenos Aires.

**Legacy:**
He won the **Nobel Prize in Literature in 1982**. He died in Mexico City in 2014. By then *One Hundred Years of Solitude* had sold over 50 million copies in 46 languages, and Macondo had become a permanent synonym for Latin America itself — its beauty, its tragedy, its impossible dreams.`,
  },

  // ----------------------------------------------------------
  // 7. ALLAMA IQBAL
  // ----------------------------------------------------------
  {
    id: 'allama-iqbal',
    patterns: [/\b(allama iqbal|iqbal|sir muhammad iqbal|shikwa|jawab e shikwa|shikwa jawab|bang e dara|iqbal ki shayri|iqbal ki nazm|iqbal kaun|mufakkir e pakistan)\b/i],
    intent: 'factual_question',
    topic: 'literature',
    response: () => `## Allama Iqbal — Poet of the East

Born in 1877 in Sialkot, **Sir Muhammad Iqbal** is widely known as **Mufakkir-e-Pakistan** (the Thinker of Pakistan) and **Shair-e-Mashriq** (Poet of the East). He wrote in Urdu, Persian, and Arabic, and his poetry became the philosophical foundation for the idea of a separate Muslim homeland in South Asia.

### The Shikwa and Jawab-e-Shikwa
Iqbal's most explosive Urdu work came in 1912 and 1913. In **Shikwa** (The Complaint), the Muslim community rises to question God — why, after centuries of faith and sacrifice, have they fallen behind other nations? The poem shocked clerics who called it blasphemous. In **Jawab-e-Shikwa** (The Answer), God replies: it is the Muslims themselves who abandoned the spirit of Islam. Together they became a mirror of a civilization's self-examination.

### Major Works
| Work | Year | Language |
|------|------|----------|
| Asrar-e-Khudi | 1915 | Persian |
| Rumuz-e-Bekhudi | 1918 | Persian |
| Bang-e-Dara | 1924 | Urdu |
| Zabur-e-Ajam | 1927 | Persian |
| Javid Nama | 1932 | Persian |
| Bal-e-Jibril | 1935 | Urdu |
| Zarb-e-Kalim | 1936 | Urdu |
| Armughan-e-Hijaz | 1938 | Urdu & Persian |

### Core Philosophy
- **Khudi** (selfhood) — awakening the inner divine spark
- **Momin** (true believer) — the ideal man of action, faith, and creativity
- **Iqbal's eagle (shaheen)** — symbol of the aspiring Muslim soul
- **Critique of Western materialism** — reason without spirit, democracy without justice
- **Reconstruction of religious thought** — his 1930 lectures argued for **ijtihad** (independent reasoning)

### Political Vision
In his **Allahabad Address of December 1930**, Iqbal first articulated the idea of a consolidated Muslim state in northwestern India — the seed that became Pakistan. He died in Lahore in 1938, nine years before independence.

**Legacy:**
Iqbal's verses are recited in homes, schools, and parades across Pakistan and the Urdu-speaking world. *Lab pe aati hai dua ban ke tamanna meri* is sung in morning assemblies. *Sare Jahan se Achha* became India's patriotic anthem — proof that his voice transcended the borders his vision helped draw.`,
  },

  // ----------------------------------------------------------
  // 8. MIRZA GHALIB
  // ----------------------------------------------------------
  {
    id: 'mirza-ghalib',
    patterns: [/\b(ghalib|mirza ghalib|mirza asadullah|ghalib ki shayri|ghalib ki ghazal|ghalib kaun|dabir ul mulk|urdoo ghazal)\b/i],
    intent: 'factual_question',
    topic: 'literature',
    response: () => `## Mirza Ghalib — The Last Master of the Urdu Ghazal

Born in 1797 in Agra as **Mirza Asadullah Baig Khan**, he later took the pen-name **Ghalib** ('dominant' or 'conqueror'). After his father's death he moved to Delhi, where he lived through the catastrophic decline of Mughal power and the 1857 uprising that ended the old world forever. His pen-name and titles — *Dabir-ul-Mulk*, *Najm-ud-Daula* — were Mughal honors from a court that was itself dissolving.

### The Ghazal Form
A **ghazal** is a sequence of two-line couplets, each one a self-contained universe — linked not by narrative but by a shared rhyme and refrain. Ghalib perfected this form. His couplets are quoted like proverbs: *'Hazaaron khwahishein aisi ke har khwahish pe dam nikle'* — 'Thousands of desires, each worth dying for.' Or: *'Yeh na thi hamari qismat ke wisal-e-yaar hota'* — 'It was not my fate that I should meet my beloved.'

### Ghalib's Distinctive Voice
- **Philosophical skepticism** — he questioned dogma, fate, and easy piety
- **Wordplay and ambiguity** — every couplet opens onto multiple readings
- **The unfathomable self** — man as a riddle to himself
- **Humor in sorrow** — his letters in Urdu are playful, witty, revolutionary

### Major Works
| Work | Year | Significance |
|------|------|--------------|
| Diwan-e-Ghalib | 1841 | Collected Urdu ghazals |
| Kuliyat-e-Ghalib (Farsi) | 1865 | Persian divan |
| Oud-e-Hindi (letters) | 1868 | Pioneer of modern Urdu prose |
| Qati-e-Burhan | 1862 | Critique of Persian lexicon |

### Life and Struggle
Ghalib never held steady employment, surviving on pensions he endlessly petitioned the British to restore. He drank wine, gambled at chess, and attended mushairas (poetry gatherings) in Delhi. After 1857 he was imprisoned for suspected ties to the rebels, then released. His later years were marked by debt, illness, and the death of his seven children in infancy.

**Legacy:**
Ghalib died in Delhi in 1869. His tomb in Nizamuddin is still visited by lovers of Urdu. The Indian TV series *Mirza Ghalib* (1989), with Naseeruddin Shah and ghazals by Jagjit Singh, revived him for a new generation. Ghalib remains the poet of the in-between — neither pure devotion nor pure rebellion, but the eternal honest bewilderment of the human heart.`,
  },

  // ----------------------------------------------------------
  // 9. RUMI
  // ----------------------------------------------------------
  {
    id: 'rumi-sufi-poet',
    patterns: [/\b(rumi|jalaluddin rumi|mawlana|mevlana|masnavi|mathnawi|rumi ki shayri|rumi kaun|sufi poet|persian sufi)\b/i],
    intent: 'factual_question',
    topic: 'literature',
    response: () => `## Rumi — The Sufi Poet of Love

Born in 1207 in Balkh (now Afghanistan) as **Jalal ad-Din Muhammad Balkhi**, he settled with his family in Konya (now Turkey) where he became known as **Mawlana** ('our master') — and in Persian simply as **Rumi**, the man of Rum, the Byzantine lands. He was a jurist, a theologian, a teacher — until a single encounter transformed him into one of the greatest mystical poets in history.

### The Meeting with Shams
In 1244 Rumi met **Shams-e Tabrizi**, a wandering dervish whose spiritual intensity shattered Rumi's orderly world. They became inseparable companions in contemplation. When Shams mysteriously disappeared (likely murdered by Rumi's jealous disciples), Rumi was plunged into grief that became creative fire. From this loss poured the *Divan-e Shams-e Tabrizi* — 40,000 verses of lyric poetry addressed to his vanished beloved.

### The Masnavi
Rumi's masterpiece, the **Masnavi-ye Ma'navi** ('Spiritual Couplets'), is a six-book poem of about 25,000 verses. Written in rhyming couplets, it weaves parables, Quranic commentary, folk tales, and direct mystical teaching into what Sufis call 'the Quran in Persian'. It opens with the famous reed-flute lament — a torn reed crying to return to its origin.

### Core Teachings
- **Fana and baqa** — annihilation of the ego, then return as pure being
- **Ishq** — divine love as the only true force moving the cosmos
- **Sama** — the whirling dance of dervishes, turning the body into prayer
- **The religion of love** — 'The lamps are different, but the Light is the same'

### Notable Works
| Work | Form | Significance |
|------|------|--------------|
| Divan-e Shams-e Tabrizi | Ghazals | Lyric poems to Shams |
| Masnavi | Didactic couplets | 'Quran in Persian' |
| Fihi Ma Fihi | Prose discourses | Sermons and conversations |
| Majales-e Sab'a | Sermons | Seven formal orations |

**Legacy:**
Rumi died in Konya in 1273. His son Sultan Walad founded the **Mevlevi Order** — the whirling dervishes. In the 21st century Rumi became the best-selling poet in the United States, his verses translated by Coleman Barks and others. Across eight centuries his voice remains the same: a call to dissolve the walls of the small self and meet the Friend who was always inside.`,
  },

  // ----------------------------------------------------------
  // 10. RABINDRANATH TAGORE
  // ----------------------------------------------------------
  {
    id: 'tagore-bengali',
    patterns: [/\b(tagore|rabindranath tagore|gurudev|gitanjali|bengali poet|tagore kaun|nobel prize literature 1913|tagore ki shayri)\b/i],
    intent: 'factual_question',
    topic: 'literature',
    response: () => `## Rabindranath Tagore — Bengal's Universal Voice

Born in 1861 in Calcutta into the wealthy Tagore family of Jorasanko, **Rabindranath Tagore** was a poet, novelist, playwright, composer, painter, and philosopher. He reshaped Bengali literature, composed two national anthems (India's *Jana Gana Mana* and Bangladesh's *Amar Shonar Bangla*), and became the first non-European to win the **Nobel Prize in Literature** in 1913.

### Gitanjali and the Nobel
**Gitanjali** ('Song Offerings') is a collection of 157 Bengali devotional poems that Tagore himself translated into English prose-poetry. When W. B. Yeats read the manuscript he was electrified. The 1913 Nobel citation praised his 'profoundly sensitive, fresh and beautiful verse'. Overnight, Tagore became a global literary figure — and a strident critic of the very nationalism that India's independence movement was then embracing.

### Range of Work
Tagore wrote across every literary form:
- **Poetry** — Gitanjali, Manasi, Balaka
- **Novels** — Gora, Ghare-Baire (The Home and the World), Chokher Bali
- **Short stories** — over 80, including *Kabuliwala* and *The Postmaster*
- **Drama** — Red Oleanders, Chandalika
- **Music** — over 2,000 songs, called **Rabindra Sangeet**, a whole genre of Bengali music

### Philosophy
- **Universal humanism** — 'Where the mind is without fear' (from *Gitanjali* 35)
- **Critique of narrow nationalism** — argued in lectures across Europe and Asia
- **Education** — founded **Visva-Bharati University** at Shantiniketan in 1921, blending East and West, nature and learning
- **Spiritual but anti-dogma** — he resigned from Hindu reform movements when they grew rigid

### Notable Works
| Work | Year | Form |
|------|------|------|
| Gitanjali | 1910 | Poetry (Nobel 1913) |
| The Home and the World | 1916 | Novel |
| Gora | 1910 | Novel |
| The Postmaster | 1891 | Short story |
| Red Oleanders | 1926 | Drama |

**Legacy:**
Tagore died in 1941, before independence arrived. He had his critics — some Bengalis thought he was too Western, some Westerners later thought he was too Eastern. But he remains the most translated Indian author of the 20th century, the composer of two nations' anthems, and the founder of a university that still experiments with education as the cultivation of the whole human being. His beard, robe, and flowing hair became the global image of the wise Indian sage.`,
  },

  // ----------------------------------------------------------
  // 11. GEORGE ORWELL
  // ----------------------------------------------------------
  {
    id: 'george-orwell',
    patterns: [/\b(george orwell|orwell|eric blair|1984 novel|animal farm|big brother|nineteen eighty four|orwell kaun|dystopian novel)\b/i],
    intent: 'factual_question',
    topic: 'literature',
    response: () => `## George Orwell — Prophet of Totalitarianism

Born **Eric Arthur Blair** in 1903 in Motihari, India, the son of a minor British colonial official, he took the pen-name **George Orwell** when he published his first book. Educated at Eton on scholarship, he served as a colonial police officer in Burma — an experience that turned him permanently against imperialism and gave him *Burmese Days* (1934).

### Political Education
Orwell lived his politics. He **lived among tramps in Paris and London** (research for *Down and Out in Paris and London*), taught in cheap private schools, fought in the **Spanish Civil War** with the POUM militia, and was shot through the throat by a sniper at Huesca. In Spain he saw how the Soviet-backed communists crushed the independent left — a betrayal that fueled his lifelong hatred of totalitarian lies.

### The Two Masterpieces
- **Animal Farm** (1945) — a fairy-tale fable where farm animals overthrow their human farmer and slide into pig-led dictatorship. Its slogan 'All animals are equal, but some animals are more equal than others' entered every language.
- **Nineteen Eighty-Four** (1949) — Winston Smith secretly hates the Party, loves Julia, is broken by O'Brien in Room 101. The novel gave the world **Big Brother**, **doublethink**, **thoughtcrime**, **Newspeak**, and the **two-minutes hate**.

### Themes and Concepts
- **Language as control** — Newspeak shrinks thought by shrinking words
- **Surveillance state** — 'Big Brother is watching you'
- **Manipulation of truth** — the Ministry of Truth rewrites history
- **Honesty in prose** — Orwell's 1946 essay *Politics and the English Language* is still a writer's manual

### Notable Works
| Work | Year | Form |
|------|------|------|
| Down and Out in Paris and London | 1933 | Memoir |
| Homage to Catalonia | 1938 | Spanish Civil War memoir |
| Animal Farm | 1945 | Political fable |
| Nineteen Eighty-Four | 1949 | Dystopian novel |
| Politics and the English Language | 1946 | Essay |

**Legacy:**
Orwell died of tuberculosis in 1950 at 46, just months after *1984* was published. The adjective **'Orwellian'** now describes any form of authoritarian double-talk, surveillance, or reality-distortion. In the age of mass digital surveillance, fake news, and algorithmic manipulation, his warnings feel more current than ever — making him perhaps the most quoted English writer of the 21st century.`,
  },

  // ----------------------------------------------------------
  // 12. AGATHA CHRISTIE
  // ----------------------------------------------------------
  {
    id: 'agatha-christie',
    patterns: [/\b(agatha christie|christie|mystery writer|hercule poirot|miss marple|murder on the orient express|and then there were none|christie kaun|queen of crime)\b/i],
    intent: 'factual_question',
    topic: 'literature',
    response: () => `## Agatha Christie — Queen of Crime

Born in 1890 in Torquay, England, **Agatha Mary Clarissa Christie** is the **best-selling novelist of all time** — only the Bible and Shakespeare have sold more. Her books have sold over **two billion copies** and been translated into at least 103 languages. She wrote 66 detective novels, 14 short-story collections, the world's longest-running play (*The Mousetrap*, on stage since 1952), and 6 romance novels under the pseudonym Mary Westmacott.

### Two Immortal Detectives
- **Hercule Poirot** — a former Belgian police officer, fastidious, vain, devoted to 'the little grey cells'. With his waxed moustache and patent-leather shoes, he appeared in 33 novels and 51 short stories. His final case, *Curtain*, was written in the 1940s but locked away to be published in 1975.
- **Miss Jane Marple** — an elderly spinster in the village of St. Mary Mead who solves crimes through knowledge of human nature. She appeared in 12 novels and 20 stories.

### Signature Works
| Novel | Year | Detective |
|------|------|-----------|
| The Mysterious Affair at Styles | 1920 | First Poirot |
| The Murder of Roger Ackroyd | 1926 | Famous controversial twist |
| Murder on the Orient Express | 1934 | Poirot, stranded train |
| And Then There Were None | 1939 | 10 strangers, no detective |
| The ABC Murders | 1936 | Serial killer vs. Poirot |
| A Murder Is Announced | 1950 | Miss Marple |
| The Mousetrap | 1952 | Longest-running play ever |

### The Disappearance
In December 1926 Christie vanished for 11 days after her husband asked for a divorce. Her car was found abandoned. She was eventually discovered at a Harrogate hotel registered under the name of her husband's mistress. She never explained what happened, and the episode remains one of literature's great mysteries.

### Style
Christie perfected the **'cozy mystery'** — a closed circle of suspects, a brilliant detective, fair-play clues, and a final drawing-room revelation. She also pioneered the unreliable narrator and the 'least likely suspect' twist that influenced every crime writer who followed.

**Legacy:**
Christie died in 1976. Her characters live on — David Suchet's Poirot, Joan Hickson's Marple, Kenneth Branagh's glossy film adaptations. The formula she perfected remains the backbone of the global mystery genre, from Sherlock Holmes successors to every modern detective show.`,
  },

  // ----------------------------------------------------------
  // 13. J.R.R. TOLKIEN
  // ----------------------------------------------------------
  {
    id: 'tolkien-fantasy',
    patterns: [/\b(tolkien|jrr tolkien|j\.r\.r\. tolkien|lord of the rings|the hobbit|middle earth|silmarillion|tolkien kaun|fantasy author)\b/i],
    intent: 'factual_question',
    topic: 'literature',
    response: () => `## J.R.R. Tolkien — Architect of Middle-earth

Born in 1892 in Bloemfontein, South Africa, **John Ronald Reuel Tolkien** was an English philologist, Oxford professor, and the writer who essentially invented the modern high-fantasy genre. He was Rawlinson and Bosworth Professor of Anglo-Saxon at Oxford (1925-1945) and later Merton Professor of English Language and Literature (1945-1959). His academic specialty — Old English, Beowulf, and the evolution of Germanic languages — fed directly into his fiction.

### The Invented World
Tolkien's lifelong obsession was **language construction**. He invented Elvish (Quenya and Sindarin), Dwarvish (Khuzdul), Orcish, and the Common Speech (Westron) — then built an entire mythology, history, geography, and genealogy to give those languages a home. That home was **Middle-earth**.

### Major Works
| Work | Year | Scope |
|------|------|-------|
| The Hobbit | 1937 | Children's book, Bilbo's quest |
| The Fellowship of the Ring | 1954 | Volume I of LOTR |
| The Two Towers | 1954 | Volume II |
| The Return of the King | 1955 | Volume III |
| The Silmarillion | 1977 | Posthumous mythology |
| The Children of Hurin | 2007 | Posthumous tale |

### The Lord of the Rings
Written over **12 years** (1937-1949), it follows the hobbit Frodo Baggins on a quest to destroy the One Ring forged by the Dark Lord Sauron. The story braids together nine walkers, two towers, and one terrible choice — to carry power into the very land of power in order to unmake it. Tolkien insisted it was **not an allegory** of World War II, though he had fought in the trenches of the Somme.

### Themes
- **Power corrupts** — the Ring tempts every bearer
- **Friendship and sacrifice** — Sam and Frodo, Aragorn and Boromir
- **Death and immortality** — elves leave, men must die
- **Nature vs. industry** — the Shire vs. Mordor, Ents vs. Saruman
- **Sub-creation** — Tolkien's term for the writer as a 'maker' under God

**Legacy:**
Tolkien died in 1973. Peter Jackson's film trilogy (2001-2003) grossed nearly $3 billion and won 17 Oscars. *The Lord of the Rings* has sold over 150 million copies. Almost every fantasy novel since — from Dungeons & Dragons to *Game of Thrones* — exists in the world Tolkien made possible. He proved that invented mythologies could be as serious and as beautiful as inherited ones.`,
  },

  // ----------------------------------------------------------
  // 14. LEONARDO DA VINCI
  // ----------------------------------------------------------
  {
    id: 'leonardo-da-vinci',
    patterns: [/\b(leonardo|da vinci|leonardo da vinci|mona lisa|the last supper|vitruvian man|renaissance polymath|leonardo kaun)\b/i],
    intent: 'factual_question',
    topic: 'art',
    response: () => `## Leonardo da Vinci — The Original Renaissance Man

Born in 1452 in the Tuscan hill-town of Vinci, **Leonardo di ser Piero da Vinci** was the illegitimate son of a notary and a peasant woman. That status barred him from formal university education — perhaps the accident that freed him to become a painter, anatomist, engineer, mathematician, architect, and inventor all at once. He is the **archetype of the Renaissance polymath**.

### Painter
Though Leonardo left behind only about **15 finished paintings**, two of them are among the most famous images on Earth:
- **The Mona Lisa** (c. 1503-1519) — portrait of Lisa Gherardini, wife of a Florentine merchant. Famous for her enigmatic smile and Leonardo's **sfumato** technique — soft, smoke-like transitions with no hard outlines. Stolen from the Louvre in 1911, the theft made her globally famous.
- **The Last Supper** (1495-1498) — a mural in the refectory of Santa Maria delle Grazie in Milan. It captures the moment Christ says 'one of you will betray me'. Leonardo's experimental oil-tempera on dry wall began flaking within his lifetime.

### Other Famous Works
| Work | Year | Note |
|------|------|------|
| Virgin of the Rocks | 1483-1486 | Two versions, London & Paris |
| Vitruvian Man | 1490 | Pen drawing, proportions of man |
| Lady with an Ermine | 1489-1490 | Portrait of Cecilia Gallerani |
| Salvator Mundi | c. 1500 | Most expensive painting ever sold ($450M) |

### Notebooks
Leonardo left over **7,200 surviving notebook pages**, written in mirror-script (right to left, perhaps to deter copyists or simply because he was left-handed). They contain drawings of flying machines, helicopters, tanks, parachute, anatomy, water flow, plant growth, and the human heart — many centuries ahead of their time.

### Anatomist
Leonardo dissected over **30 human corpses**. He was the first to draw the human fetus in the womb, the curved spine of the elderly, and the valves of the heart. Had his anatomical work been published, it would have transformed Renaissance medicine.

**Legacy:**
Leonardo died in 1519 at the French court of Francis I. He had no formal school and founded no movement — yet his notebooks, paintings, and endless curiosity remain the gold standard of what a single human mind can attempt. He is the patron saint of interdisciplinary thinking.`,
  },

  // ----------------------------------------------------------
  // 15. MICHELANGELO
  // ----------------------------------------------------------
  {
    id: 'michelangelo',
    patterns: [/\b(michelangelo|david statue|pieta|sistine chapel|creation of adam|michelangelo kaun|renaissance sculptor)\b/i],
    intent: 'factual_question',
    topic: 'art',
    response: () => `## Michelangelo — The Divine Sculptor

Born in 1475 in Caprese near Arezzo, **Michelangelo di Lodovico Buonarroti Simoni** considered himself a sculptor above all — 'I saw the angel in the marble and carved until I set him free.' Yet he produced some of the greatest paintings, architecture, and poetry of the Italian Renaissance. He was the first Western artist to see his biography published in his lifetime.

### Sculpture
- **The Pieta** (1498-1499) — carved when Michelangelo was just 23. Mary holds the dead Christ across her lap, her face impossibly young. It is the only work he ever signed — across Mary's sash — after overhearing visitors attribute it to a rival.
- **David** (1501-1504) — 17 feet tall, carved from a single block of marble that two earlier sculptors had abandoned. The young hero stands tense and watchful before facing Goliath, eyes fixed on a distant foe. It became the symbol of the Florentine Republic.

### The Sistine Chapel Ceiling
Commissioned reluctantly by Pope Julius II (1508-1512), Michelangelo painted **over 5,000 square feet of fresco** on a curved ceiling 60 feet above the floor. Working largely alone, often lying on his back, he depicted the **Book of Genesis** in nine scenes — the Separation of Light and Darkness, the Creation of Adam (the iconic finger-touch), the Fall, the Flood — surrounded by prophets, sibyls, and ancestors of Christ.

### Poetry and Temperament
Michelangelo wrote over 300 sonnets, many addressed to his young friend Tommaso de' Cavalieri and the widow Vittoria Colonna. He was famously proud, solitary, and difficult — once punching his own nose in a quarrel with fellow sculptor Torrigiano.

**Legacy:**
Michelangelo died in 1564 at 88. His body was smuggled out of Rome in a bale of hay and buried in Santa Croce, Florence. Vasari, his first biographer, called him 'the supreme artist' — and his David, his Pieta, and his Sistine ceiling remain touchstones against which every figurative artist is still measured. The term **'terribilita'** — awe-inspiring power — was coined to describe him.`,
  },

  // ----------------------------------------------------------
  // 16. VINCENT VAN GOGH
  // ----------------------------------------------------------
  {
    id: 'van-gogh',
    patterns: [/\b(van gogh|vincent van gogh|starry night|sunflowers|post impressionist|van gogh kaun|dutch painter)\b/i],
    intent: 'factual_question',
    topic: 'art',
    response: () => `## Vincent van Gogh — The Painter Who Sold Only One Canvas

Born in 1853 in Zundert, Netherlands, **Vincent Willem van Gogh** sold exactly **one painting** in his lifetime — *The Red Vineyard*, for 400 francs. He died at 37 from a gunshot wound, probably self-inflicted, in the wheat fields of Auvers-sur-Oise. Yet within two decades of his death he had become one of the most influential painters in the history of art.

### Life of Conviction
Van Gogh was a late bloomer. He worked as an art dealer, a teacher, and — most intensely — a lay preacher to coal miners in the Borinage of Belgium, dismissed for 'excessive zeal'. Only at 27 did he commit to art, supported financially and emotionally by his younger brother **Theo**, an art dealer in Paris. The 650 surviving letters between them are a literary masterpiece of their own.

### The Major Periods
- **Netherlands (1880-1885)** — dark, earthy palette. Masterpiece: *The Potato Eaters* (1885)
- **Paris (1886-1888)** — discovered Impressionism and Japanese prints. Color lightened.
- **Arles (1888-1889)** — southern France, blazing sun. The Yellow House, sunflower series, Gauguin's disastrous visit, the ear-cutting incident.
- **Saint-Remy asylum (1889-1890)** — voluntary patient. *The Starry Night* (June 1889), swirling cypress and stars over a sleeping village.
- **Auvers (1890)** — under Dr. Gachet's care. 70 paintings in 70 days. *Wheatfield with Crows*. Then the fatal shot.

### Famous Works
| Painting | Year | Location |
|------|------|---------|
| The Potato Eaters | 1885 | Amsterdam |
| Sunflowers | 1888 | Multiple museums |
| The Starry Night | 1889 | MoMA, New York |
| Bedroom in Arles | 1888 | Amsterdam |
| Self-Portrait with Bandaged Ear | 1889 | London |

### Style and Influence
Van Gogh used **thick impasto**, swirling directional brushstrokes, and saturated complementary colors — yellow against blue, red against green. His work bridged **Post-Impressionism** and **Expressionism**, opening the door to Munch, Matisse, and the Fauves.

**Legacy:**
Van Gogh's fame began with an exhibition in Paris in 1901, eleven years after his death. His *Portrait of Dr. Gachet* fetched $82.5 million in 1990. The Van Gogh Museum in Amsterdam is the second-most visited museum in the Netherlands. The myth of the tormented genius — unrecognized in life, immortal after death — is largely his.`,
  },

  // ----------------------------------------------------------
  // 17. PABLO PICASSO
  // ----------------------------------------------------------
  {
    id: 'pablo-picasso',
    patterns: [/\b(picasso|pablo picasso|cubism|guernica|les demoiselles|picasso kaun|spanish painter)\b/i],
    intent: 'factual_question',
    topic: 'art',
    response: () => `## Pablo Picasso — The Man Who Reinvented Painting

Born in 1881 in Malaga, Spain, **Pablo Diego Jose Francisco de Paula Juan Nepomuceno Maria de los Remedios Cipriano de la Santisima Trinidad Ruiz y Picasso** produced an estimated **50,000 artworks** in his 91 years — paintings, sculptures, drawings, ceramics, prints, and tapestries. He is widely regarded as the most influential artist of the 20th century.

### The Blue and Rose Periods
- **Blue Period (1901-1904)** — mournful blue-green palette, beggars, blind men, prostitutes, mothers with dead children. Triggered by the suicide of his friend Carlos Casagemas. *La Vie* (1903), *The Old Guitarist* (1903).
- **Rose Period (1904-1906)** — warmer pinks and earth tones, circus performers, harlequins. *Family of Saltimbanques* (1905).

### Cubism — The Revolution
In 1907 Picasso painted **Les Demoiselles d'Avignon** — five angular, mask-faced women whose bodies fracture into shards. Influenced by African and Iberian masks, it broke 500 years of Western perspective. With Georges Braque he then developed **Cubism** (1907-1917): objects analyzed into geometric facets, shown from multiple viewpoints simultaneously. There were two phases:
- **Analytic Cubism** — muted browns and grays, dense faceted surfaces
- **Synthetic Cubism** — collage, newspaper, bright color

### Guernica
In 1937, Nazi Germany's Condor Legion bombed the Basque town of Guernica at Franco's request — the first carpet-bombing of a civilian population. Picasso responded with **Guernica**, a 25-foot black-and-white mural of screaming horses, shattered mothers, fallen warriors, and a single light bulb like a cold eye. It toured the world, became a universal symbol of anti-war protest, and now hangs at the Reina Sofia in Madrid.

### Major Works
| Work | Year | Movement |
|------|------|----------|
| The Old Guitarist | 1903 | Blue Period |
| Les Demoiselles d'Avignon | 1907 | Proto-Cubism |
| Three Musicians | 1921 | Synthetic Cubism |
| Guernica | 1937 | Political mural |
| The Weeping Woman | 1937 | Studies for Guernica |
| Les Femmes d'Alger | 1955 | After Delacroix |

**Legacy:**
Picasso died in 1973, working until the end. He co-founded Cubism, invented collage, reinvented classical sculpture, designed ballet sets for Diaghilev, and joined the French Communist Party in 1944. His estate was so vast that it took six years to inventory and triggered a change in French inheritance tax law. His name is shorthand for the modern artist as restless revolutionary genius.`,
  },

  // ----------------------------------------------------------
  // 18. CLAUDE MONET
  // ----------------------------------------------------------
  {
    id: 'claude-monet',
    patterns: [/\b(monet|claude monet|water lilies|impression sunrise|impressionist painter|monet painting|monet kaun|garden at giverny)\b/i],
    intent: 'factual_question',
    topic: 'art',
    response: () => `## Claude Monet — The Father of Impressionism

Born in 1840 in Paris, **Oscar-Claude Monet** grew up in Le Havre on the Normandy coast, where as a teenager he drew satirical caricatures of locals for money. He met landscape painter Eugene Boudin, who taught him to paint outdoors — **en plein air** — directly from nature. That single lesson changed the history of art.

### The Movement's Name
In 1874 Monet exhibited a small painting called **Impression, soleil levant** (*Impression, Sunrise*) — a hazy harbor at Le Havre, the sun a flat orange disk reflected in broken strokes on the water. The critic Louis Leroy mocked it as mere 'impression' rather than finished art. He meant it as an insult; the artists adopted it as their banner. **Impressionism** was born.

### Painting Light Itself
Monet's obsession was **the changing quality of light**. He painted the same subject over and over at different hours, seasons, and weathers — cathedrals, haystacks, poplars, the Thames — to capture how the same form dissolves and rebuilds as light shifts. He famously said: 'For me, a landscape does not exist in its own right, since its appearance changes at every moment.'

### Series Paintings
| Series | Years | Subject |
|------|------|---------|
| Haystacks | 1890-1891 | 25 canvases of grain stacks |
| Rouen Cathedral | 1892-1894 | 30+ facades at different times |
| Houses of Parliament | 1900-1904 | London fog and light |
| Water Lilies | 1899-1926 | 250+ paintings of his garden pond |

### Giverny
In 1883 Monet moved to **Giverny**, a village northwest of Paris, where he created one of the most famous gardens in art history. He diverted a stream to make a pond, planted water lilies, built a Japanese bridge draped with wisteria, and turned his garden into a living studio. The water-lily series, painted here for nearly 30 years, became his final, almost abstract obsession.

**Legacy:**
Monet is buried in the Giverny churchyard. His water-lily panels — installed in two oval rooms at the **Orangerie Museum in Paris** — were his gift to France after World War I. He remains the artist who taught the world to see light.`,
  },

  // ----------------------------------------------------------
  // 19. FRIDA KAHLO
  // ----------------------------------------------------------
  {
    id: 'frida-kahlo',
    patterns: [/\b(frida kahlo|frida|self portrait mexican|mexican painter|the two fridas|diego and frida|frida kaun)\b/i],
    intent: 'factual_question',
    topic: 'art',
    response: () => `## Frida Kahlo — Painter of Pain and Identity

Born in 1907 in Coyoacan, Mexico City, **Magdalena Carmen Frida Kahlo y Calderon** is one of the most recognizable artists of the 20th century — known for her uncompromising self-portraits, her unibrow, her traditional Tehuana dresses, and her fearless exploration of physical pain and Mexican identity.

### The Accident
In 1925 an iron handrail pierced Frida's pelvis in a bus collision. She was 18. The crash fractured her spine, collarbone, ribs, and right leg, and crushed her foot. Confined to a full-body plaster cast for months, she abandoned plans to study medicine and began to paint — using a mirror mounted above her bed. 'I paint myself because I am so often alone and because I am the subject I know best.' She would undergo **over 30 surgeries** and live in chronic pain for the rest of her life.

### Marriage to Diego Rivera
In 1929 Frida married the muralist **Diego Rivera**, 20 years her senior. Their marriage was passionate, politically radical, and famously unfaithful on both sides — she had affairs with Leon Trotsky (during his exile in Mexico) and others. They divorced in 1939 and remarried in 1940. She called it the marriage of 'an elephant and a dove'.

### Notable Works
| Painting | Year | Theme |
|------|------|-------|
| The Two Fridas | 1939 | Two selves after Rivera divorce |
| The Broken Column | 1944 | Spine as cracked Ionic pillar |
| Self-Portrait with Thorn Necklace | 1940 | Christ-like suffering |
| Henry Ford Hospital | 1932 | Miscarriage in Detroit |

### First Solo Exhibition
In 1938 Kahlo had her first solo exhibition at the Julien Levy Gallery in New York. In 1953, too ill to attend her first Mexican solo show, she had her four-poster bed carried into the gallery and arrived by ambulance to preside from her bed.

**Legacy:**
Frida Kahlo died in 1954 at 47, possibly by suicide. Her **Casa Azul** in Coyoacan is now a museum. In the 1980s she became an icon for feminists, the LGBTQ+ community, Chicano artists, and disability activists. Her face is on the 500-peso note. She remains a global symbol of unapologetic self-creation in the face of pain.`,
  },

  // ----------------------------------------------------------
  // 20. IMPRESSIONISM MOVEMENT
  // ----------------------------------------------------------
  {
    id: 'impressionism-movement',
    patterns: [/\b(impressionism|impressionist|impressionist movement|en plein air|impressionist painters|impressionism movement)\b/i],
    intent: 'factual_question',
    topic: 'art',
    response: () => `## Impressionism — The Movement That Broke the Salon

In April 1874, thirty rejected painters held their own exhibition in the studio of photographer Nadar at 35 Boulevard des Capucines in Paris. Among them were Claude Monet, Pierre-Auguste Renoir, Camille Pissarro, Edgar Degas, Berthe Morisot, and Alfred Sisley. A critic, Louis Leroy, sneered at Monet's *Impression, soleil levant* and titled his review 'The Exhibition of the Impressionists'. The label stuck. **Impressionism** — initially a slur — became one of the most beloved movements in art history.

### What They Rebelled Against
The official French art world was controlled by the **Salon**, a state-sponsored annual exhibition that favored mythological, historical, and religious subjects painted in smooth, invisible brushwork and dark, varnished tones. The Impressionists wanted none of it. They painted:
- **Modern life** — cafes, dance halls, train stations, suburban gardens
- **Ordinary people** — laundresses, ballet dancers, boaters, family members
- **Light at a single moment** — not idealized forms but fleeting sensation

### The Eight Impressionist Exhibitions
Between 1874 and 1886 the group held eight independent exhibitions, defying the Salon entirely. Membership shifted — Cezanne exhibited in the first two, Gauguin in the later ones. By the final show the group was fragmenting into Post-Impressionism.

### Key Figures
| Artist | Speciality |
|------|------------|
| Claude Monet | Light, water, garden series |
| Pierre-Auguste Renoir | Warm figure painting |
| Edgar Degas | Ballet, off-center compositions |
| Camille Pissarro | Landscapes, peasant scenes |
| Berthe Morisot | Domestic interiors |
| Mary Cassatt | Mothers and children |

### Technical Innovations
- **Plein air painting** — portable easels and newly invented metal paint tubes let artists leave the studio
- **Broken brushwork** — short separate strokes that mix in the eye, not on the palette
- **Complementary colors** — shadows painted in violet instead of black
- **Cropping** — influenced by photography and Japanese woodblock prints
- **Modern pigments** — synthetic ultramarine, cobalt, cadmium yellow

### Reception and Legacy
Early reviews were brutal — critics called the work 'unfinished', 'a disgrace', 'wallpaper in its embryonic state'. By the 1890s dealers like Paul Durand-Ruel were selling Impressionist canvases to wealthy collectors in Paris and New York. Today the movement cleared the path for Post-Impressionism, Fauvism, and eventually abstraction — by proving that a painting could be a record of **seeing** rather than of **things seen**.`,
  },

  // ----------------------------------------------------------
  // 21. CLASSICAL COMPOSERS
  // ----------------------------------------------------------
  {
    id: 'classical-composers',
    patterns: [/\b(classical music|bach|mozart|beethoven|classical composers|baroque|classical symphony|vienna composers|classical music history)\b/i],
    intent: 'factual_question',
    topic: 'music',
    response: () => `## The Three Pillars of Western Classical Music

The tradition commonly called 'classical music' stretches across centuries and styles — but three composers stand as its central monuments: **Johann Sebastian Bach** (Baroque), **Wolfgang Amadeus Mozart** (Classical), and **Ludwig van Beethoven** (bridge to Romanticism). Together they defined what Western art music could be.

### Johann Sebastian Bach (1685-1750)
A German Lutheran organist and choirmaster at St. Thomas Church in Leipzig, Bach wrote over **1,100 surviving works** — cantatas, passions, organ preludes, concertos, fugues. He perfected **counterpoint** — the art of weaving multiple independent melodic lines into a unified whole. The *Well-Tempered Clavier* (48 preludes and fugues in every key) was written 'for the profit and use of musical youth'. The *Mass in B Minor* and *St. Matthew Passion* are summit achievements of sacred music. Bach was not famous beyond church circles in his lifetime — Mendelssohn's 1829 revival restored him to the canon.

### Wolfgang Amadeus Mozart (1756-1791)
Born in Salzburg, Mozart was a child prodigy who composed from age five and toured Europe's royal courts with his father Leopold. He wrote over **600 works** in 35 years — 41 symphonies, 27 piano concertos, 22 operas (including *The Marriage of Figaro*, *Don Giovanni*, *The Magic Flute*), string quartets, sonatas, and the unfinished *Requiem* he composed on his deathbed. He died at 35 in Vienna and was buried in a common grave.

### Ludwig van Beethoven (1770-1827)
Born in Bonn, Beethoven moved to Vienna at 22 and became the bridge between Classical restraint and Romantic passion. His **9 symphonies** transformed the form — the third (*Eroica*) doubled its length, the fifth made rhythm itself the subject, the ninth added a chorus singing Schiller's *Ode to Joy*. He wrote 32 piano sonatas (the *Moonlight*, *Pathetique*), 16 string quartets, the opera *Fidelio*, and the *Missa Solemnis*. Most astonishingly, **Beethoven grew deaf** — by his forties he could barely hear, yet composed his greatest late works in complete silence.

### Comparison
| Composer | Era | Output | Defining Trait |
|------|------|--------|----------------|
| Bach | Baroque | 1,100+ works | Counterpoint, sacred music |
| Mozart | Classical | 600+ works | Melodic perfection |
| Beethoven | Classical/Romantic | ~700 works | Deaf genius, symphony expanded |

**Legacy:**
The Bach-Mozart-Beethoven axis became the foundation of conservatory training and the symphony orchestra. Their harmonic language underlies film scores, jazz harmony, and modern pop.`,
  },

  // ----------------------------------------------------------
  // 22. JAZZ ORIGINS
  // ----------------------------------------------------------
  {
    id: 'jazz-origins',
    patterns: [/\b(jazz|jazz music|jazz origins|new orleans jazz|louis armstrong|duke ellington|jazz history|swing era)\b/i],
    intent: 'factual_question',
    topic: 'music',
    response: () => `## Jazz — America's Original Art Form

Jazz is widely considered the **first truly American art form** — born in the early 20th century from a collision of African musical traditions, European harmony, blues, ragtime, and the specific social conditions of New Orleans. It is improvisational at its core: a jazz performance is created in the moment, never the same twice.

### Roots in New Orleans
New Orleans around 1900 was a uniquely mixed city — French, Spanish, African, Caribbean, Italian, and American cultures all crammed together. **Congo Square** was one of the few places in the American South where enslaved people had been legally permitted to drum, dance, and preserve African rhythm. After the Civil War, brass bands from military and funeral traditions filled the streets. Out of this stew came a new music — a fusion of blues vocal feeling, ragtime syncopation, and collective improvisation.

### Key Figures
- **Buddy Bolden** (1877-1931) — the legendary 'first' jazz trumpeter of New Orleans, never recorded
- **Jelly Roll Morton** (1890-1941) — pianist, composer, braggart who claimed to have 'invented' jazz in 1902
- **Louis Armstrong** (1901-1971) — trumpet virtuoso and singer. His Hot Five and Hot Seven recordings (1925-1928) shifted jazz from collective ensemble music to a soloist's art. His scat singing reshaped popular singing itself.
- **Duke Ellington** (1899-1974) — pianist, bandleader, composer of over 1,000 works
- **Charlie Parker** (1920-1955) — alto saxophonist, co-inventor of bebop
- **Miles Davis** (1926-1991) — trumpeter who reinvented himself every decade

### Major Eras
| Era | Years | Style |
|------|------|-------|
| Traditional / Dixieland | 1900-1920 | Collective improvisation |
| Swing | 1930s | Big bands, dance music |
| Bebop | 1940s | Small groups, virtuosic speed |
| Cool & Hard Bop | 1950s | Modal, blues-drenched |
| Free Jazz | 1960s | Avant-garde, atonal |
| Fusion | 1970s | Jazz + rock + funk |

### The Great Migration
From 1910 to 1970, six million African Americans left the South for northern cities. Chicago, Kansas City, Detroit, and New York each developed distinctive jazz scenes. The music became a soundtrack of Black urban modernity.

**Legacy:**
Jazz spread worldwide by the 1930s, shaping Latin music, Bollywood arrangements, French chanson, and Japanese club culture. UNESCO designated April 30 as **International Jazz Day** in 2011. Jazz taught the world that improvisation is itself an art form.`,
  },

  // ----------------------------------------------------------
  // 23. BOLLYWOOD CINEMA
  // ----------------------------------------------------------
  {
    id: 'bollywood-cinema',
    patterns: [/\b(bollywood|hindi cinema|indian cinema|hindi film|bombay film industry|bollywood history|filmi music)\b/i],
    intent: 'factual_question',
    topic: 'art',
    response: () => `## Bollywood — The World's Largest Film Industry by Output

The term **'Bollywood'** — a portmanteau of 'Bombay' (now Mumbai) and 'Hollywood' — refers to the **Hindi-language film industry** based in Mumbai. By number of films produced, India's cinema is the largest in the world, producing over **1,500 feature films a year** across Hindi, Tamil, Telugu, Bengali, Malayalam, Kannada, Punjabi, Marathi, and other languages. Bollywood alone typically releases 200-300 films annually.

### Origins
Indian cinema began almost as soon as world cinema itself. **Dadasaheb Phalke** released *Raja Harishchandra* in 1913 — India's first full-length feature film. The first Indian talkie, **Alam Ara** (1931) by Ardeshir Irani, arrived just four years after *The Jazz Singer*. Its songs made clear that **music would be central** to Indian cinema — a feature that would define Bollywood forever.

### Studio Era (1930s-1940s)
Bombay became a major production center alongside Calcutta and Madras. Studios like **Bombay Talkies** and **Prabhat Studios** produced social reform dramas, mythologicals, and historical epics.

### Golden Age (1940s-1960s)
- **Raj Kapoor** — actor-director, *Awaara* (1951), *Shree 420* (1955)
- **Guru Dutt** — *Pyaasa* (1957), *Kaagaz ke Phool* (1959), admired by Truffaut and Kurosawa
- **Mehboob Khan** — *Mother India* (1957), India's first Oscar nominee
- **Bimal Roy** — *Do Bigha Zamin* (1953), social realism

### Masala Era (1970s)
The formula of **multi-genre entertainment** — action, romance, comedy, family melodrama, songs, dances — crystallized. **Amitabh Bachchan** became the 'angry young man' in *Zanjeer* (1973), *Deewaar* (1975), and *Sholay* (1975), still the most-watched Hindi film ever.

### Contemporary Era (1990s-present)
| Film | Year | Note |
|------|------|------|
| Hum Aapke Hain Koun..! | 1994 | Family romance blockbuster |
| Dilwale Dulhania Le Jayenge | 1995 | Longest-running Indian film ever |
| Lagaan | 2001 | Oscar nominee |
| 3 Idiots | 2009 | Highest-grossing of its era |
| Dangal | 2016 | Massive global hit, China release |

### Global Reach
Bollywood films screen in over 90 countries. The diaspora audience in the UK, US, Gulf, and Southeast Asia is enormous, and its song-and-dance sequences influenced Hollywood (*Moulin Rouge!*, *Slumdog Millionaire*).

**Legacy:**
Bollywood is a cultural language for over a billion people — its stars are demi-gods, its songs are the soundtrack of weddings and festivals, and its melodramatic embrace of love, family, and destiny remains one of the world's most distinctive film cultures.`,
  },

  // ----------------------------------------------------------
  // 24. HOLLYWOOD GOLDEN AGE
  // ----------------------------------------------------------
  {
    id: 'hollywood-golden-age',
    patterns: [/\b(hollywood golden age|golden age of hollywood|classic hollywood|studio system|old hollywood|1930s hollywood|1940s hollywood|hollywood history)\b/i],
    intent: 'factual_question',
    topic: 'art',
    response: () => `## Hollywood's Golden Age — When the Studios Ruled

The **Golden Age of Hollywood** is generally dated from the late 1920s — when synchronized sound arrived with *The Jazz Singer* (1927) — to the early 1960s, when the studio system collapsed under antitrust rulings and the rise of television. In those three decades American cinema produced some of the most enduring films ever made and established the visual language that still governs global mainstream filmmaking.

### The Studio System
Eight major studios — the **'Big Five'** (Paramount, MGM, Warner Bros., 20th Century-Fox, RKO) and the **'Little Three'** (Columbia, Universal, United Artists) — controlled almost every aspect of filmmaking. They owned the production lots, the stars (under ironclad contracts), the directors, and the **movie theaters** where films were shown. This **vertical integration** let a studio produce, market, and force theaters to show a film. The 1948 *Paramount Decree* ordered divestiture — the beginning of the end.

### The Stars
Studios manufactured stars with ruthless efficiency. Greta Garbo, Clark Gable, Humphrey Bogart, Cary Grant, Katharine Hepburn, Bette Davis, James Stewart, John Wayne, Marilyn Monroe — each a carefully constructed persona. The 'star system' was the engine of box office.

### Defining Films
| Film | Year | Note |
|------|------|------|
| Gone with the Wind | 1939 | Civil War epic, highest grossing adjusted for inflation |
| The Wizard of Oz | 1939 | Technicolor fantasy |
| Citizen Kane | 1941 | Orson Welles, often called greatest film ever |
| Casablanca | 1942 | Bogart and Bergman |
| Singin' in the Rain | 1952 | Musical about the sound transition |

### The Hays Code
From 1934 to 1968 Hollywood films were governed by the **Motion Picture Production Code**, nicknamed the Hays Code after censor Will Hays. It mandated that crime must be punished, sexuality hinted at not shown, and 'good' triumph.

### The End of an Era
By the late 1950s television had stolen the family audience, the Paramount Decree had broken studio monopolies, and a new generation influenced by European art cinema was rising. The 1960s collapse gave birth to the **New Hollywood** of Coppola, Scorsese, and Spielberg.

**Legacy:**
The Golden Age left behind the **three-act structure**, the 90-120 minute feature, the star vehicle, and the genre picture (western, noir, musical, screwball comedy). Its glamour remains the popular image of 'Hollywood' itself.`,
  },

  // ----------------------------------------------------------
  // 25. CALLIGRAPHY
  // ----------------------------------------------------------
  {
    id: 'calligraphy-art',
    patterns: [/\b(calligraphy|islamic calligraphy|arabic calligraphy|chinese calligraphy|khattati|thuluth|nastaliq|art of writing)\b/i],
    intent: 'factual_question',
    topic: 'art',
    response: () => `## Calligraphy — The Art of the Written Word

**Calligraphy** — from the Greek *kallos* (beauty) and *graphein* (to write) — is the art of beautiful handwriting. Across civilizations it has elevated writing from mere communication to a visual art form practiced for meditation, devotion, and aesthetic pleasure. The two greatest traditions are **Islamic** and **Chinese** calligraphy.

### Islamic Calligraphy
In Islamic culture, calligraphy holds a sacred status. Because the **Quran is the literal word of God** in Arabic, and Islamic theology discouraged figurative representation in religious contexts, the written word itself became the primary visual art of the Muslim world. Mosques, ceramics, coins, and manuscripts were adorned with verses in flowing scripts.

#### Major Scripts
| Script | Origin | Use |
|------|--------|-----|
| Kufic | 7th century | Early Quranic, angular |
| Naskh | 9th century | Standard Quranic print script |
| Thuluth | 9th century | Decorative headings |
| Nastaliq | 14th century | Persian and Urdu, 'bride of scripts' |
| Diwani | 16th century | Ottoman court, dense and flowing |

**Nastaliq** — developed in 14th-century Persia and perfected in Mughal India — is the signature script of Urdu and Persian poetry.

### Chinese Calligraphy
In China, calligraphy is considered the supreme visual art — above painting. Every educated person was expected to be a competent calligrapher. The four treasures of the study are **brush, ink, paper, and inkstone**. Major scripts evolved:
- **Seal script** (zhuanshu) — ancient, used on seals
- **Clerical script** (lishu) — Han dynasty official script
- **Regular script** (kaishu) — standard, taught in schools
- **Cursive script** (caoshu) — wild, abstract, expressive

Master calligraphers like **Wang Xizhi** (303-361 CE) — author of the *Lantingji Xu*, often called the greatest piece of Chinese calligraphy — are revered like saints. Each stroke is judged for **qi** (energy).

### Other Traditions
- **Western calligraphy** — Roman capitals, Uncial, Gothic blackletter, Italic; flourished in manuscripts like the **Book of Kells**.
- **Japanese** — *Shodo* is a Zen practice.

### Practice and Spirit
In all traditions, calligraphy demands decades of practice. The stroke must be made in a single unhesitating motion. Masters describe the state of mind as meditation.

**Legacy:**
Calligraphy survives today as a living sacred art (Quranic copying, Chinese scholar painting) and as a contemporary fine art — graffiti artists, type designers, and digital typographers all draw on its principles.`,
  },
]
