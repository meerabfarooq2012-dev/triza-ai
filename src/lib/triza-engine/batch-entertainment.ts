/**
 * ============================================================
 *  TRIZA ENGINE — Knowledge Batch: Entertainment & Media
 * ============================================================
 *
 *  15 hand-written entries covering cinema, music, gaming,
 *  theater, photography, dance, streaming, social media, and
 *  comedy. Each entry includes English + Roman Urdu trigger
 *  patterns so TRIZA can respond to multilingual queries
 *  natively.
 *
 *  All responses: 250-400 words, markdown formatted, factually
 *  accurate. No external LLM — pure TypeScript knowledge base.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const ENTERTAINMENT_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------
  // 1. HISTORY OF CINEMA
  // ----------------------------------------------------------
  {
    id: 'history-of-cinema',
    patterns: [/\b(cinema|film history|movies origin|silent era|talkies|motion picture|film ki tareekh|silent film|talkie|picture house)\b/i],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `## History of Cinema — From Lumière to Streaming

Cinema was born in the late 19th century when inventors combined photography, projection, and the persistence-of-vision principle. On **December 28, 1895**, the Lumière brothers held the first public film screening in Paris, showing short actualities like *Workers Leaving the Lumière Factory*. Earlier, in 1888, Thomas Edison and William Dickson had developed the Kinetoscope for individual viewing.

### The Silent Era (1895–1927)
- **Georges Méliès** — *A Trip to the Moon* (1902), pioneer of special effects
- **D. W. Griffith** — *The Birth of a Nation* (1915), controversial but technically groundbreaking
- **Charlie Chaplin, Buster Keaton, Harold Lloyd** — silent comedy icons
- **Soviet montage** — Eisenstein's *Battleship Potemkin* (1925) defined film editing

### The Talkie Revolution
In **1927**, Warner Bros. released *The Jazz Singer* — the first feature-length motion picture with synchronized dialogue. Sound transformed the industry overnight, ending many silent careers and launching the musical genre.

### Golden Ages Worldwide
- **Hollywood 1930s–50s** — studio system, Technicolor, film noir
- **Italian Neorealism** (1940s) — De Sica, Rossellini
- **French New Wave** (1950s–60s) — Godard, Truffaut
- **New Hollywood** (1970s) — Coppola, Scorsese, Spielberg

### Modern Era
Digital cameras (2000s), CGI blockbusters, IMAX, and now streaming have reshaped how films are made and watched. Directors like Nolan and Villeneuve champion physical film stock while studios embrace virtual production.

### Key Milestones
| Year | Milestone |
|------|-----------|
| 1895 | First public screening |
| 1927 | First talkie |
| 1939 | *Gone with the Wind*, *Wizard of Oz* in color |
| 1977 | *Star Wars* launches blockbuster era |
| 2009 | *Avatar* pushes 3D and mocap |

**Why it matters:** Cinema is the defining art form of the modern age — combining image, sound, story, and technology to shape how billions of people see the world, dream, and remember.`,
  },

  // ----------------------------------------------------------
  // 2. HOLLYWOOD
  // ----------------------------------------------------------
  {
    id: 'hollywood-studios',
    patterns: [/\b(hollywood|hollywood studios|golden age of hollywood|blockbuster|movie industry america|la film|studio system| Paramount |warner bros|disney studio)\b/i],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `## Hollywood — The American Film Capital

Hollywood, a neighborhood in Los Angeles, became the center of American filmmaking in the early 1910s. Filmmakers moved west to escape Thomas Edison's film trust patents and to enjoy reliable sunshine, varied landscapes, and cheap land.

### The Studio System (1920s–1950s)
The **Big Five** studios dominated production, distribution, and exhibition:
- **Paramount Pictures** — Cecil B. DeMille epics
- **Warner Bros.** — gangster films, Bogart, Bugs Bunny
- **MGM** — 'more stars than there are in heaven'
- **20th Century Fox** — Marilyn Monroe, musicals
- **RKO** — *Citizen Kane* (1941), Fred Astaire

The **Little Three** — Universal, Columbia, United Artists — rounded out the system. Stars were under exclusive contracts; writers, directors, and crews were salaried. Films rolled off assembly lines at staggering pace.

### Golden Age Highlights
- **1939** — *Gone with the Wind*, *The Wizard of Oz*, *Mr. Smith Goes to Washington*
- **Film noir** (1940s–50s) — dark, cynical crime dramas
- **The Hays Code** censored content from 1934 to 1968

### Collapse and New Hollywood
The 1948 **Paramount Decree** forced studios to sell their theaters. TV eroded audiences. By the late 1960s Hollywood was in crisis — until a new generation of film-school brats (Spielberg, Scorsese, Lucas, Coppola) revived it with *Jaws* (1975), *Star Wars* (1977), and *The Godfather* (1972).

### Blockbuster Era
Spielberg's *Jaws* invented the summer blockbuster. *Star Wars* turned merchandising into a billion-dollar industry. Today franchise IP — Marvel, DC, Fast & Furious, Jurassic — drives global box office, with China and streaming reshaping revenue.

### Modern Studios
| Studio | Owner |
|--------|-------|
| Walt Disney | Disney (also owns Pixar, Marvel, Lucasfilm, Fox) |
| Warner Bros. | Warner Bros. Discovery |
| Universal | Comcast / NBCUniversal |
| Paramount | Paramount Global |
| Sony Pictures | Sony |

**Why it matters:** Hollywood exported American culture, language, and values worldwide for a century — shaping global fashion, music, and dreams more powerfully than any government could.`,
  },

  // ----------------------------------------------------------
  // 3. BOLLYWOOD
  // ----------------------------------------------------------
  {
    id: 'bollywood-cinema',
    patterns: [/\b(bollywood|hin2di cinema|indian film|mumbai film industry|shah rukh khan|amitabh bachchan|srk|hindi film|filmi|bollywood stars|khans of bollywood)\b/i],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `## Bollywood — The Hindi Film Industry

**Bollywood** is the informal name for the Hindi-language film industry based in Mumbai (formerly Bombay), the world's largest by number of films produced. The term blends 'Bombay' and 'Hollywood' and emerged in the 1970s.

### Origins and Golden Age
Indian cinema began with **Dadasaheb Phalke's** *Raja Harishchandra* (1913) — the first Indian feature film. The 1940s–60s are considered the **Golden Age**, with filmmakers like **Raj Kapoor**, **Guru Dutt**, and **Bimal Roy** producing socially conscious masterpieces such as *Mother India* (1957), *Pyaasa* (1957), and *Awara* (1951).

### The Masala Formula
Bollywood's signature style blends:
- **Song-and-dance sequences** — often 6–8 per film
- **Melodrama** — family, romance, betrayal, revenge
- **Action, comedy, and romance** in one package
- **Playback singers** — Lata Mangeshkar, Kishore Kumar, Mohammad Rafi

### The Khans Era (1990s–2020s)
Three unrelated actors named Khan dominated Bollywood for three decades:
- **Shah Rukh Khan** — 'King of Romance' (*DDLJ*, *Kuch Kuch Hota Hai*)
- **Aamir Khan** — 'Mr. Perfectionist' (*Lagaan*, *Dangal*, *3 Idiots*)
- **Salman Khan** — mass-action hero (*Bajrangi Bhaijaan*, *Sultan*)

Other legends include **Amitabh Bachchan** (the 'Angry Young Man' of the 1970s), **Rajinikanth** (Tamil crossover icon), **Deepika Padukone**, **Priyanka Chopra**, and **Amitabh Bachchan**.

### Major Studios and Awards
- **Yash Raj Films, Dharma Productions, Red Chillies** — top producers
- **Filmfare Awards** — India's Oscar equivalent since 1954
- **National Film Awards** — government honors

### Global Reach
Bollywood sells tickets across South Asia, the Middle East, Africa, Southeast Asia, and among the global diaspora. *Baahubali 2* (2017) and *RRR* (2022), though Telugu-language, expanded Indian cinema's global audience — *RRR's* *Naatu Naatu* won the 2023 Oscar for Best Original Song.

### Key Films
| Film | Year | Significance |
|------|------|--------------|
| Mother India | 1957 | Oscar-nominated epic |
| Sholay | 1975 | 'Curry Western' classic |
| Dilwale Dulhania Le Jayenge | 1995 | Ran for 25 years |
| Lagaan | 2001 | Oscar-nominated |
| RRR | 2022 | Global crossover hit |

**Why it matters:** Bollywood gives voice to over a billion South Asians, blending music, dance, and melodrama into a uniquely Indian art form that has shaped global popular culture.`,
  },

  // ----------------------------------------------------------
  // 4. FAMOUS MOVIE DIRECTORS
  // ----------------------------------------------------------
  {
    id: 'famous-directors',
    patterns: [/\b(spielberg|scorsese|nolan|kurosawa|tarantino|hitchcock|movie director|film director|famous director|director kaun|best director)\b/i],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `## Famous Movie Directors — Architects of Cinema

Film directors shape every frame, performance, and cut — turning scripts into the most collaborative of all art forms. A handful have so transformed the medium that their names alone evoke entire styles.

### Steven Spielberg (b. 1946)
America's most commercially successful director redefined the blockbuster. **Jaws** (1975) invented the summer tentpole; **E.T.** (1982), **Jurassic Park** (1993), and **Indiana Jones** made wonder his signature. His serious works — *Schindler's List* (1993), *Saving Private Ryan* (1998), *Lincoln* (2012) — won Oscars and redefined historical filmmaking.

### Martin Scorsese (b. 1942)
The poet of American guilt and violence. From **Taxi Driver** (1976) and **Raging Bull** (1980) to **Goodfellas** (1990) and **The Departed** (2006), Scorsese's kinetic camera, voice-over narration, and rock soundtracks built a style endlessly imitated. Frequent star **Robert De Niro** and editor **Thelma Schoonmaker** are key collaborators. *Killers of the Flower Moon* (2023) extended his late-career stride.

### Christopher Nolan (b. 1970)
The thinking person's blockbuster auteur. Nolan favors practical effects, non-linear narratives, and IMAX cinematography. **Memento** (2000), **The Dark Knight** (2008), **Inception** (2010), **Interstellar** (2014), **Dunkirk** (2017), and **Oppenheimer** (2023) — which won him his first Best Director Oscar — explore time, memory, and morality on a colossal scale.

### Akira Kurosawa (1910–1998)
Japan's greatest filmmaker. **Rashomon** (1950) introduced the world to Japanese cinema and gave us the term 'Rashomon effect'. **Seven Samurai** (1954) inspired *The Magnificent Seven*; *Yojimbo* became *A Fistful of Dollars*. Kurosawa's dynamic compositions, weather, and movement influenced Spielberg, Lucas, Scorsese, and Coppola.

### Other Titans
| Director | Signature Work |
|----------|----------------|
| Alfred Hitchcock | *Psycho*, *Vertigo*, *Rear Window* |
| Quentin Tarantino | *Pulp Fiction*, *Kill Bill*, *Django Unchained* |
| Stanley Kubrick | *2001*, *The Shining*, *A Clockwork Orange* |
| Federico Fellini | *La Dolce Vita*, *8½* |
| Satyajit Ray | *Pather Panchali*, *Apu Trilogy* |
| Francis Ford Coppola | *The Godfather*, *Apocalypse Now* |

**Why it matters:** Directors are the authors of cinema. Their distinct visual languages, themes, and obsessions shape not just movies but how entire generations see the world.`,
  },

  // ----------------------------------------------------------
  // 5. ANIMATION HISTORY
  // ----------------------------------------------------------
  {
    id: 'animation-history',
    patterns: [/\b(animation|animated film|cartoon|disney|pixar|anime|studio ghibli|miyazaki|2d animation|3d animation|cartoon film)\b/i],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `## History of Animation — From Flipbooks to CGI

Animation creates the illusion of movement by sequencing slightly different images — a technique as old as cinema itself. From hand-drawn cels to computer-generated worlds, animation has grown into a multibillion-dollar global art form.

### Early Years (1900–1928)
- **Émile Cohl's** *Fantasmagorie* (1908) — first fully animated film
- **Winsor McCay's** *Gertie the Dinosaur* (1914) — first character with personality
- **Otto Messmer's** *Felix the Cat* (1919) — first cartoon star

### The Disney Revolution
**Walt Disney** transformed animation into a feature art form. Milestones include:
- **Steamboat Willie** (1928) — Mickey Mouse, synchronized sound
- **Snow White and the Seven Dwarfs** (1937) — first full-length cel-animated feature
- **Multiplane camera** (1937) — depth of field in 2D
- **Cinderella** (1950), **Sleeping Beauty** (1959) — restored Disney's fortunes
- **The Little Mermaid** (1989) — launched the Disney Renaissance

### Television and Rivals
- **Warner Bros.** Looney Tunes — Bugs Bunny, Daffy Duck
- **Hanna-Barbera** — *Tom & Jerry*, *The Flintstones*, *Scooby-Doo*
- **Hentai and adult animation** — *The Simpsons* (1989–) changed TV forever
- **Nickelodeon** and **Cartoon Network** defined 1990s kids' TV

### CGI and Pixar
**Pixar** released *Toy Story* (1995) — the first fully computer-animated feature. Led by **John Lasseter** and Steve Jobs' investment, Pixar's storytelling (*Finding Nemo*, *Up*, *Inside Out*) redefined animation for adults too. Disney acquired Pixar in 2006; rivals DreamWorks (*Shrek*) and Blue Sky (*Ice Age*) followed.

### Japanese Anime
Anime evolved from **Osamu Tezuka's** *Astro Boy* (1963). **Studio Ghibli**, founded by **Hayao Miyazaki** in 1985, produced *My Neighbor Totoro*, *Spirited Away* (Oscar-winning, 2001), and *Princess Mononoke*. Anime's global fanbase now drives streaming hits like *Demon Slayer*, *Attack on Titan*, and *Jujutsu Kaisen*.

### Major Studios Today
| Studio | Notable Films |
|--------|---------------|
| Walt Disney Animation | *Frozen*, *Moana*, *Encanto* |
| Pixar | *Toy Story*, *WALL-E*, *Coco* |
| DreamWorks | *Shrek*, *Kung Fu Panda*, *How to Train Your Dragon* |
| Studio Ghibli | *Spirited Away*, *Princess Mononoke* |
| Sony Animation | *Spider-Verse* films |

**Why it matters:** Animation frees storytellers from the laws of physics and budget of live-action, allowing the impossible to become visible — and giving children and adults alike a shared visual imagination.`,
  },

  // ----------------------------------------------------------
  // 6. MUSIC GENRES
  // ----------------------------------------------------------
  {
    id: 'music-genres',
    patterns: [/\b(music genre|rock music|pop music|jazz|classical music|hip hop|hip-hop|electronic|country music|blues|reggae|folk music|sangeet|gana|mosiqi)\b/i],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `## Music Genres — The Sound of Human Culture

Musical genres are categories defined by instrumentation, rhythm, harmony, and cultural context. They evolve, blend, and rebel against each other — each one a fingerprint of its time.

### Classical
Western classical music spans **Baroque** (Bach, Handel, 1600–1750), **Classical** (Mozart, Haydn, 1750–1820), **Romantic** (Beethoven, Chopin, Tchaikovsky, 1820–1900), and **20th-century** (Stravinsky, Shostakovich). Indian classical divides into **Hindustani** (North) and **Carnatic** (South) traditions, both rooted in raga and tala.

### Jazz
Born in early-1900s New Orleans from African American blues, ragtime, and spirituals. Key figures include **Louis Armstrong**, **Duke Ellington**, **Charlie Parker** (bebop), **Miles Davis** (cool jazz, fusion), and **John Coltrane**. Jazz prizes improvisation and swing rhythm.

### Blues and Country
- **Blues** — Delta blues (Robert Johnson), Chicago blues (Muddy Waters). The foundation of rock.
- **Country** — Appalachian folk + blues; Hank Williams, Johnny Cash, Dolly Parton, Taylor Swift crossover.

### Rock
Rock exploded in the 1950s (Elvis, Chuck Berry) and dominated for 50 years:
- **1960s** — Beatles, Rolling Stones, Led Zeppelin
- **1970s** — Pink Floyd, Queen, punk (Sex Pistols, Ramones)
- **1980s** — metal (Metallica), new wave, U2
- **1990s** — grunge (Nirvana), alternative (Radiohead), Britpop (Oasis)

### Pop
Short, catchy, radio-friendly songs. From **The Beatles** and **Michael Jackson** to **Madonna**, **Beyoncé**, **Taylor Swift**, and **BTS**. Pop absorbs every other genre.

### Hip-Hop
Born 1973 at a Bronx party by **DJ Kool Herc**. Four elements: MCing, DJing, breakdance, graffiti. From **Grandmaster Flash** and **Run-DMC** to **Tupac**, **Biggie**, **Eminem**, **Jay-Z**, **Kendrick Lamar**, and **Drake** — hip-hop is now the world's most-streamed genre.

### Other Major Genres
| Genre | Origin | Key Artist |
|-------|--------|------------|
| Reggae | Jamaica 1960s | Bob Marley |
| Electronic/EDM | 1970s Europe | Daft Punk, Kraftwerk |
| R&B/Soul | US 1950s | Aretha Franklin, Marvin Gaye |
| Folk | Traditional | Bob Dylan, Joan Baez |
| Latin | Caribbean + LatAm | Bad Bunny, Shakira |

**Why it matters:** Music crosses language, class, and borders faster than any other art — every genre is a record of how a community heard itself, and a soundtrack for billions of lives.`,
  },

  // ----------------------------------------------------------
  // 7. FAMOUS MUSICIANS
  // ----------------------------------------------------------
  {
    id: 'famous-musicians',
    patterns: [/\b(beethoven|mozart|the beatles|beatles|michael jackson|elvis|madonna|freddie mercury|bach|chopin|famous musician|composer|sangeetkar)\b/i],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `## Famous Musicians — Composers and Performers Who Changed Sound

Across four centuries a few musicians have so reshaped their art that all later composers and performers measure themselves against them.

### Wolfgang Amadeus Mozart (1756–1791)
Austrian child prodigy who composed his first symphony at eight. Mozart wrote over **600 works** — symphonies, concertos, operas (*The Marriage of Figaro*, *Don Giovanni*, *The Magic Flute*), and the haunting *Requiem* he died composing. His music blends grace, drama, and mathematical precision. He died poor at 35 and was buried in a common grave.

### Ludwig van Beethoven (1770–1827)
German composer who bridged Classical and Romantic eras. His **Symphony No. 9** — final movement's *Ode to Joy* — was the first choral symphony. Famously, he continued composing after going **deaf around 1818**, completing masterpieces like the *Late String Quartets* and *Missa Solemnis* he could never hear performed. His *Symphony No. 5* opens with the most famous four notes in history.

### The Beatles (1960–1970)
**John Lennon, Paul McCartney, George Harrison, Ringo Starr** — four Liverpool lads who became the most influential rock band ever. From *Please Please Me* (1963) to *Abbey Road* (1969), they revolutionized studio recording, songwriting, and pop culture itself. *Sgt. Pepper's Lonely Hearts Club Band* (1967) is widely considered the first concept album. They sold over **600 million records** worldwide.

### Michael Jackson (1958–2009)
The 'King of Pop' began as a child star in **The Jackson 5**, then transformed pop with *Off the Wall* (1979), *Thriller* (1982) — the best-selling album of all time at ~70 million copies — and *Bad* (1987). Jackson's music videos (*Thriller*, *Billie Jean*, *Smooth Criminal*) turned MTV into a global force and made him one of the most famous humans alive.

### Other Legends
| Artist | Era | Legacy |
|--------|-----|--------|
| J. S. Bach | 1685–1750 | Baroque master of counterpoint |
| Elvis Presley | 1935–1977 | King of Rock and Roll |
| Freddie Mercury | 1946–1991 | Queen's theatrical frontman |
| Madonna | b. 1958 | Queen of Pop |
| Bob Marley | 1945–1981 | Brought reggae to the world |
| Aretha Franklin | 1942–2018 | Queen of Soul |

**Why it matters:** These musicians gave humanity a shared emotional vocabulary — melodies and rhythms recognized from Tokyo to Lagos, capable of moving millions across centuries.`,
  },

  // ----------------------------------------------------------
  // 8. VIDEO GAMES HISTORY
  // ----------------------------------------------------------
  {
    id: 'video-games-history',
    patterns: [/\b(video game|gaming history|arcade games|console|playstation|xbox|nintendo|atar i|game boy|video game industry|gaming ki tareekh|game khel)\b/i],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `## History of Video Games — From Pong to the Metaverse

Video games are the youngest major entertainment medium — barely 70 years old — yet generate more revenue than music and film combined. Their evolution tracks the rise of computing itself.

### Early Beginnings (1950s–1960s)
- **1958** — *Tennis for Two*, an oscilloscope game by William Higinbotham
- **1962** — *Spacewar!* on MIT's PDP-1, the first true computer game
- **1972** — **Magnavox Odyssey**, the first home console (designed by Ralph Baer)

### The Arcade Boom (1972–1983)
**Atari** released *Pong* in 1972 and arcades exploded. Hits like *Space Invaders* (1978, Taito), *Pac-Man* (1980, Namco), and *Donkey Kong* (1981, Nintendo) became cultural phenomena. By 1981 arcades earned more than both US movie box offices and the music industry.

### The 1983 Crash
A flood of low-quality games — especially Atari's *E.T.* — collapsed the US market. Atari buried cartridges in a New Mexico landfill.

### The Nintendo Resurrection (1985)
**Nintendo's NES** launched in North America in 1985 with **Super Mario Bros.** — designed by **Shigeru Miyamoto**, who also created *The Legend of Zelda* and *Donkey Kong*. The 'Seal of Quality' rebuilt consumer trust; the **Game Boy** (1989) made handheld gaming mass-market.

### The Console Wars
- **1990s** — Sega Genesis vs. SNES; Sony **PlayStation** (1994) introduced CD-ROMs and 3D gaming
- **2000s** — PS2 became the best-selling console ever (~155M units); Microsoft entered with **Xbox** (2001) and *Halo*
- **2010s** — PS4 and Xbox One; Nintendo's **Wii** (2006) brought motion controls to families
- **2020s** — PS5, Xbox Series X/S, Nintendo Switch — ray tracing, 4K, SSDs

### PC, Mobile, and Cloud
PC gaming flourished with *Doom* (1993), *World of Warcraft* (2004), and **Steam** (2003, Valve). Smartphones turned everyone into a gamer — *Angry Birds*, *Candy Crush*, *Genshin Impact*. **Cloud gaming** (GeForce Now, Xbox Cloud) streams AAA titles to any screen.

### Industry Today
| Segment | Example |
|---------|---------|
| AAA studios | EA, Ubisoft, Activision Blizzard |
| Console makers | Sony, Microsoft, Nintendo |
| Mobile giants | Tencent, Supercell, miHoYo |
| Indie scene | *Minecraft*, *Stardew Valley*, *Hades* |

**Why it matters:** Games are now the largest entertainment industry on Earth — and the only one where the audience actively shapes the story, making them the most immersive art form ever invented.`,
  },

  // ----------------------------------------------------------
  // 9. POPULAR VIDEO GAMES
  // ----------------------------------------------------------
  {
    id: 'popular-video-games',
    patterns: [/\b(minecraft|super mario|mario|fortnite|pokemon|genshin impact|league of legends|call of duty|gta|grand theft auto|famous game|popular game|famous video game)\b/i],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `## Popular Video Games — Cultural Landmarks of Play

A handful of video games have so captured the global imagination that they transcend gaming itself — becoming brands, communities, and shared languages across generations.

### Minecraft (2011)
Created by **Markus 'Notch' Persson** and later expanded by **Mojang** (acquired by Microsoft for $2.5 billion in 2014), Minecraft is the **best-selling video game of all time** — over **300 million copies** sold. Its blocky sandbox lets players mine, craft, build, and survive in infinite procedurally generated worlds. It has become a teaching tool in schools and a virtual Lego for the digital age.

### Super Mario (1981–)
Nintendo's mustachioed plumber is the most recognized video game character on Earth. **Shigeru Miyamoto** designed *Donkey Kong* (1981); *Super Mario Bros.* (1985) saved the console industry. Spin-offs include *Mario Kart* (the best-selling racing franchise) and *Super Smash Bros*. The **Super Mario Bros. Movie** (2023) grossed over $1.3 billion.

### Fortnite (2017)
Epic Games' free-to-play battle royale drops 100 players onto an island until one survives. **Cross-platform play**, **live in-game concerts** (Travis Scott, Ariana Grande), and **season-based content** turned Fortnite into a social platform — not just a game. It generated over **$9 billion** in its first two years and pioneered the modern battle pass model.

### Pokémon (1996–)
Created by **Satoshi Tajiri** for the Game Boy, Pokémon combined collecting, battling, and trading. *Pokémon GO* (2016, Niantic) used AR to send millions hunting creatures in real cities — earning over **$6 billion**. Pokémon is the **highest-grossing media franchise ever**, with over $130 billion in lifetime revenue.

### Other Global Phenomena
| Game | Year | Significance |
|------|------|--------------|
| Tetris | 1984 | Most-portable game ever |
| Grand Theft Auto V | 2013 | Third best-selling (~200M) |
| League of Legends | 2009 | Esports giant |
| World of Warcraft | 2004 | Defined modern MMOs |
| Genshin Impact | 2020 | Chinese gacha global hit |

### Esports and Streaming
Games like *League of Legends*, *Dota 2*, and *Counter-Strike* fill stadiums with millions watching online. Streamers on Twitch and YouTube turn gameplay into celebrity — sometimes earning more than traditional athletes.

**Why it matters:** These games are no longer just products — they are social spaces, art forms, and economies that define how hundreds of millions of people play, compete, and connect every day.`,
  },

  // ----------------------------------------------------------
  // 10. THEATER AND BROADWAY
  // ----------------------------------------------------------
  {
    id: 'theater-broadway',
    patterns: [/\b(theater|theatre|broadway|west end|stage play|musical theater|stage show|drama stage|natya|natak|stage performance|live theater)\b/i],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `## Theater and Broadway — The Living Art of the Stage

Theater is humanity's oldest performance art — actors embodying characters live before an audience. Every film, TV show, and video game ultimately descends from the stage.

### Ancient Roots
- **Ancient Greece** (5th century BCE) — tragedies of **Aeschylus, Sophocles, Euripides**; comedies of **Aristophanes**. The Theatre of Dionysus held 17,000.
- **Roman theater** — Plautus, Seneca; engineering of stage machinery
- **Sanskrit drama** — *Natya Shastra* (c. 200 BCE–200 CE), Kalidasa's *Shakuntala*
- **Noh and Kabuki** in Japan (14th–17th centuries)

### Shakespeare and the Elizabethan Stage
**William Shakespeare** (1564–1616) wrote 39 plays at the **Globe Theatre** in London — *Hamlet*, *Macbeth*, *King Lear*, *A Midsummer Night's Dream*, *Romeo and Juliet*. His verse, complex characters, and universal themes set the standard for Western drama.

### Modern Theater Forms
- **Realism** — Ibsen, Chekhov, Strindberg (late 19th century)
- **Absurdism** — Beckett's *Waiting for Godot*, Ionesco
- **American drama** — Arthur Miller, Tennessee Williams, Eugene O'Neill

### Broadway
**Broadway** refers to the 41 professional theaters in Manhattan's Theater District (500+ seats each). It is the global capital of commercial theater, especially the **musical** — a uniquely American form blending song, dance, and story.

### Longest-Running Broadway Shows
| Show | Years | Composer |
|------|-------|----------|
| The Phantom of the Opera | 1988–2023 | Andrew Lloyd Webber |
| Chicago (revival) | 1996– | Kander & Ebb |
| The Lion King | 1997– | Elton John, Tim Rice |
| Hamilton | 2015– | Lin-Manuel Miranda |
| Wicked | 2003– | Stephen Schwartz |

### Landmark Musicals
- **Show Boat** (1927) — first serious musical
- **Oklahoma!** (1943) — integrated song and story
- **West Side Story** (1957) — Bernstein, Sondheim
- **Cats** (1982) — megamusical era
- **Rent** (1996) — rock musical, Gen X voice
- **Hamilton** (2015) — hip-hop history, 11 Tony Awards

### London's West End
Britain's equivalent to Broadway — *The Mousetrap* has run since 1952, the world's longest-running play.

**Why it matters:** Theater is the only art form where performer and audience share the same room and moment — every show is unique, every night alive, making it the most human of all entertainments.`,
  },

  // ----------------------------------------------------------
  // 11. PHOTOGRAPHY BASICS
  // ----------------------------------------------------------
  {
    id: 'photography-basics',
    patterns: [/\b(photography|photo|camera|dslr|mirrorless|composition|lighting|aperture|shutter speed|iso|tasveer|photo kaise|lens|exposure|portrait photo)\b/i],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `## Photography Basics — The Art of Capturing Light

The word photography means 'drawing with light' (Greek *phos* + *graphé*). A great photograph is rarely accident — it is the controlled interaction of light, time, composition, and a decisive moment.

### The Exposure Triangle
Every photo balances three controls:
- **Aperture (f-stop)** — size of the lens opening. Lower f-number = wider opening = more light + shallower depth of field (blurry background, great for portraits). Higher f-number = sharper across the scene, ideal for landscapes.
- **Shutter speed** — how long the sensor sees light. Fast (1/1000s) freezes sports; slow (1/15s) blurs water and motion.
- **ISO** — sensor sensitivity. Low ISO (100) = clean, sharp; high ISO (3200+) = grainy but usable in darkness.

### Composition Rules
- **Rule of thirds** — place subjects on imaginary grid lines
- **Leading lines** — roads, rivers, fences draw the eye
- **Framing** — use windows, arches, branches to surround the subject
- **Symmetry and patterns** — powerful for architecture
- **Negative space** — emptiness that emphasizes the subject
- **Fill the frame** — get close to your subject

### Lighting
Light is everything in photography.
- **Golden hour** — first and last hour of sunlight; warm, soft, magical
- **Blue hour** — twilight, cool and moody
- **Hard light** — midday sun, sharp shadows
- **Soft light** — overcast days, diffused; flattering for portraits
- **Direction** — front, side, back, each telling a different story

### Camera Types
| Type | Use |
|------|-----|
| Smartphone | Everyday, AI-computed images |
| DSLR | Pro photography, optical viewfinder |
| Mirrorless | Modern pro standard (Sony, Canon, Nikon) |
| Action cam | GoPro — sports, underwater |
| Film camera | Analog revival, deliberate shooting |

### Major Genres
Portrait, landscape, street, wildlife, sports, macro, architecture, fashion, documentary, astrophotography — each demands different gear and seeing.

### Brief History
- **1839** — Louis Daguerre reveals the daguerreotype
- **1888** — Kodak No. 1 makes photography consumer-grade
- **1975** — Steven Sasson invents the digital camera at Kodak
- **2007** — iPhone begins the smartphone-photo era

**Why it matters:** Photography lets ordinary people preserve memories, document injustice, and create art — turning fleeting moments into images that outlast lifetimes and shape how history remembers itself.`,
  },

  // ----------------------------------------------------------
  // 12. DANCE FORMS
  // ----------------------------------------------------------
  {
    id: 'dance-forms',
    patterns: [/\b(dance|ballet|hip hop dance|salsa|tango|kathak|bharatanatyam|breakdance|breakdancing|contemporary dance|folk dance|nacha|nritya|dance style|dance form)\b/i],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `## Dance Forms — The Body as Instrument

Dance is the art of moving the human body rhythmically, expressively, and intentionally. Every culture on Earth has developed dances — for ritual, courtship, war, worship, and joy.

### Ballet
Originated in 15th-century Italian Renaissance courts, refined in France under **King Louis XIV** (himself a dancer). Ballet's vocabulary — *plié, arabesque, pirouette, pas de deux* — is French worldwide. Major traditions include:
- **Classical** — *Swan Lake*, *The Nutcracker* (Tchaikovsky, Petipa)
- **Romantic** — *Giselle*, *La Sylphide*
- **Neoclassical** — George Balanchine's 20th-century reform
- **Contemporary ballet** — blends with modern dance

Pointe shoes, turnout, and lifted posture define the ballerina. Major companies: Paris Opera, Royal Ballet (London), Bolshoi (Moscow), ABT and NYCB (New York).

### Hip-Hop Dance
Grew from 1970s Bronx block parties alongside hip-hop music. Sub-styles include:
- **Breaking (breakdance)** — toprock, footwork, power moves, freezes
- **Popping and locking** — West Coast funk styles
- **Krumping** — expressive, aggressive L.A. style
- **Turfing, jerkin', lyrical hip-hop**

*Street Dance* and dance crews (Jabbawockeez, Kinjaz) took hip-hop global. Breaking debuts at the **Paris 2024 Olympics** as an official sport.

### Latin Dances
- **Salsa** — Cuban/Puerto Rican origins, partner dance
- **Tango** — Argentine, dramatic close embrace
- **Samba** — Brazilian Carnival rhythm
- **Bachata, merengue, cha-cha, rumba**

### Indian Classical Dance
Eight traditions recognized by the Sangeet Natak Akademi:
- **Bharatanatyam** (Tamil Nadu) — temple origins, geometric precision
- **Kathak** (North India) — storytelling, footwork, spins
- **Odissi** (Odisha) — sinuous, devotional
- **Kathakali** (Kerala) — masked dance-drama
- **Mohiniyattam, Manipuri, Kuchipudi, Sattriya**

### Other Major Forms
| Dance | Origin |
|-------|--------|
| Contemporary | 20th-century US/Europe (Graham, Cunningham) |
| Flamenco | Andalusia, Spain |
| Irish stepdance | *Riverdance* fame |
| Bhangra | Punjab |
| Hula | Hawaii |
| Capoeira | Brazil (martial dance) |

### Folk and Social Dances
Waltz, foxtrot, line dance, square dance, dabke (Levant), garba (Gujarat) — folk dances bind communities; social dances (TikTok trends, viral moves) define generations.

**Why it matters:** Dance is the art that needs no tools — only the body itself. It carries culture, courtship, worship, and protest across centuries and continents, expressing what words cannot.`,
  },

  // ----------------------------------------------------------
  // 13. STREAMING SERVICES
  // ----------------------------------------------------------
  {
    id: 'streaming-services',
    patterns: [/\b(netflix|spotify|streaming service|streaming|youtube premium|disney plus|hulu|amazon prime video|apple music|tidal|online streaming|jio cinema)\b/i],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `## Streaming Services — How the Internet Reshaped Entertainment

Streaming delivers audio and video over the internet without storing the full file on the user's device. What began as a tech experiment has rewritten the entire entertainment industry in under two decades.

### How Streaming Works
Content is broken into small packets, buffered briefly, and played as more data arrives — using adaptive bitrate to switch quality based on connection speed. Behind the scenes: CDNs (content delivery networks), recommendation algorithms, and massive server farms.

### Music Streaming
**Spotify** launched in 2008 in Sweden and pioneered the freemium ad-supported model. Today music streaming dominates industry revenue:
| Service | Owner | Subscribers |
|---------|-------|-------------|
| Spotify | Spotify AB | 250M+ paid |
| Apple Music | Apple | 100M+ |
| Amazon Music | Amazon | ~100M |
| YouTube Music | Google | 100M+ |
| Tencent Music | Tencent | 100M+ |

### Video Streaming
**Netflix** pivoted from DVD rentals to streaming in 2007 and upended Hollywood. Original hits — *House of Cards* (2013), *Stranger Things*, *Squid Game*, *Bridgerton* — proved streamers could out-create studios.

### Major Players
- **Netflix** — 270M+ subscribers worldwide
- **Disney+** — Disney, Pixar, Marvel, Star Wars, Fox content
- **Amazon Prime Video** — bundled with Prime shipping; *The Boys*, *Lord of the Rings: Rings of Power*
- **Max (HBO)** — prestige TV (*Succession*, *Game of Thrones*)
- **Apple TV+** — *Ted Lasso*, *Severance*
- **Hulu, Paramount+, Peacock** — US-focused
- **YouTube** — world's largest free video platform; 2.5B+ users
- **JioCinema, Hotstar** — India's streaming giants

### Impact on Entertainment
- **Binge-watching** replaced weekly episodes
- **Algorithms** decide what we discover
- **Cord-cutting** gutted cable TV subscriptions
- **Global content** — Korean *Squid Game*, Spanish *Money Heist* cross borders instantly
- **Shorter seasons, bigger budgets** — streaming economics favor event TV
- **Theatrical windows** collapsed — films arrive home in weeks

### Industry Disruption
Streaming is now reshaping sports (Amazon NFL, Apple MLS), gaming (Xbox Cloud, GeForce Now), and live events. The battle has shifted to **ad-supported tiers**, **password sharing crackdowns**, and **sports rights**.

**Why it matters:** Streaming put the world's music, films, and shows in every pocket — democratizing access but also concentrating cultural power in a handful of tech giants whose algorithms increasingly decide what art we see.`,
  },

  // ----------------------------------------------------------
  // 14. SOCIAL MEDIA
  // ----------------------------------------------------------
  {
    id: 'social-media',
    patterns: [/\b(social media|facebook|instagram|tiktok|twitter|youtube|linkedin|snapchat|whatsapp|telegram|social network|online platform|media sharing)\b/i],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `## Social Media — The Network That Ate the World

Social media platforms let users create profiles, share content, and connect with networks of friends, followers, or strangers. In two decades they have transformed communication, commerce, politics, and mental health.

### Brief History
- **1997** — **SixDegrees**, first recognizable social network
- **2003** — **MySpace** peaks; **LinkedIn** launches for professionals
- **2004** — **Facebook** founded by Mark Zuckerberg at Harvard
- **2005** — **YouTube** launches; sold to Google in 2006 for $1.65B
- **2006** — **Twitter** (rebranded **X** in 2023) creates the microblog
- **2010** — **Instagram** launches; acquired by Facebook in 2012 for $1B
- **2011** — **Snapchat** introduces disappearing stories
- **2016** — **TikTok** (ByteDance) fuses short video with powerful AI recommendation

### Major Platforms
| Platform | Users | Strength |
|----------|-------|----------|
| Facebook | 3B+ | Friends + family + groups |
| YouTube | 2.5B+ | Long + short video |
| WhatsApp | 2B+ | Encrypted messaging |
| Instagram | 2B+ | Photos, Reels, Stories |
| TikTok | 1.5B+ | Algorithmic short video |
| WeChat | 1.3B+ | China's super-app |
| X (Twitter) | 600M+ | Real-time news + debate |
| LinkedIn | 1B+ | Professional networking |
| Telegram | 900M+ | Channels, large groups |

### How They Shape Society
- **Communication** — instant global messaging; voice notes replace calls
- **Politics** — Arab Spring, #MeToo, election campaigns, misinformation
- **Commerce** — influencer marketing worth $20B+; live shopping dominates Asia
- **Celebrity** — influencers (MrBeast, Khaby Lame, Kylie Jenner) rival Hollywood stars
- **News** — most people discover news via feeds, not newspapers
- **Mental health** — links to anxiety, depression, body image issues, especially teens

### Business Model
Most platforms are **free to users** and monetize through **targeted advertising** based on personal data, **subscriptions** (X Premium, YouTube Premium), **creator tools** (TikTok Creator Fund), and **marketplace and commerce** fees.

### Concerns and Regulation
Privacy scandals (Cambridge Analytica), algorithmic radicalization, child safety, and election interference have triggered GDPR in Europe, the **Digital Services Act**, and US lawsuits. **Section 230** shields US platforms from liability for user content.

**Why it matters:** Social media has rewired how 5 billion humans communicate, learn, fall in love, fight, vote, and shop — making it perhaps the most consequential technology of the 21st century so far, for both good and ill.`,
  },

  // ----------------------------------------------------------
  // 15. STAND-UP COMEDY
  // ----------------------------------------------------------
  {
    id: 'stand-up-comedy',
    patterns: [/\b(stand up comedy|standup|comedian|comedy show|comedy special|joke|humorist|hasya kavi|mazak|funny man|stand-up|comedy club)\b/i],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `## Stand-Up Comedy — One Person, One Mic, One Room

Stand-up comedy is a performance art where a single comedian speaks directly to a live audience, delivering jokes, stories, observations, and characters. It is the most exposed form of entertainment — no script, no co-stars, no safety net.

### Origins
Stand-up grew from **vaudeville** (1880s–1930s), British **music hall**, and the **Borscht Belt** — Catskills resorts where Jewish comedians like Milton Berle, Henny Youngman, and Rodney Dangerfield honed rapid-fire one-liners. The term 'stand-up comic' emerged in the 1940s.

### The Comedy Boom
- **1950s–60s** — **Lenny Bruce** broke taboos with profane, political sets; repeatedly arrested
- **1960s–70s** — **Richard Pryor** transformed comedy with raw autobiographical truth about race, addiction, and America
- **1970s** — **George Carlin's** 'Seven Words You Can Never Say on Television' reached the US Supreme Court
- **1980s** — **Eddie Murphy, Robin Williams, Whoopi Goldberg** became arena-scale stars; comedy clubs exploded nationwide

### The Special Era
**HBO** and later **Netflix** made the comedy special the medium's defining format. Records became video albums — *Delirious* (Murphy, 1983), *Live on the Sunset Strip* (Pryor, 1982). In the 2010s Netflix paid comedians **$20M+ per special** for talents like Dave Chappelle, Chris Rock, and Ali Wong.

### Legendary Comedians
| Comedian | Style |
|----------|-------|
| Richard Pryor | Raw, autobiographical truth |
| George Carlin | Intellectual anti-authoritarian |
| Joan Rivers | Trailblazing insult comic |
| Eddie Murphy | Sharpest impressionist of his era |
| Dave Chappelle | Social satire, race in America |
| Chris Rock | Surgical cultural observation |
| Kevin Hart | Highest-grossing tour comic |
| Ali Wong | Feminist raunch trailblazer |

### Global Comedy Scenes
- **Britain** — Ricky Gervais, Eddie Izzard, Michael McIntyre
- **Canada** — Norm Macdonald, Jim Carrey
- **India** — Vir Das (Emmy winner), Zakir Khan, Kenny Sebastian
- **Pakistan** — Saad Haroon, Ali Gul Pir, Anwar Maqsood

### The Craft
A tight hour takes **years** to develop — testing jokes in small clubs, killing weak material, finding rhythm. Comedians study **setups, punchlines, callbacks, tags, misdirection**, and crowd work. Legendary venues — **The Comedy Store** (LA), **London's Comedy Store**, **Mumbai's Canvas Laugh Club** — incubate new talent.

**Why it matters:** Stand-up is society's truth-telling mirror — using laughter to expose hypocrisy and deflate power. In every free society, comedians test what can still be said out loud.`,
  },
]
