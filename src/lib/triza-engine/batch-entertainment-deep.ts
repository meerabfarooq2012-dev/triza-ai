/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — ENTERTAINMENT DEEP (Batch 7-g)
 * ============================================================
 *
 *  Deeper subtopic entries for entertainment. These go one
 *  level below the foundational batch-entertainment.ts
 *  entries: film genre history, the production pipeline,
 *  music genre evolution, studio recording, game development,
 *  game genres, sports rules systems, Olympic history, the
 *  television-to-streaming arc, celebrity culture, theme
 *  park design, animation techniques, and comedy theory.
 *
 *  Each entry follows the KnowledgeEntry schema from
 *  types.ts. Patterns use \b(...)\b/i word boundaries so
 *  TRIZA can match specific subtopic phrasings.
 *
 *  NO external LLM API is used. These are facts TRIZA has
 *  "learned" and will express in its own voice via the
 *  self-expression + narration engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const ENTERTAINMENT_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. FILM GENRES AND CINEMA HISTORY
  // ----------------------------------------------------------------
  {
    id: 'film-genres-history',
    patterns: [/\b(film genre|film noir|western film|new hollywood|golden age of cinema|blockbuster era|korean cinema|nollywood|bollywood genre|sci-fi film|horror film genre|romance film|genre convention)\b/i],
    keywords: ['film genre', 'film noir', 'western', 'new hollywood', 'golden age', 'blockbuster era', 'korean cinema', 'nollywood', 'sci-fi film', 'horror genre', 'romance film', 'genre convention'],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `Film genres are evolving contracts between filmmaker and audience: each one bundles a set of expected settings, character types, plot beats, and visual styles so viewers know what emotional ride they are signing up for. Tracing genre history means tracing how the movie industry itself grew up, from factory-line studio product to globe-spanning digital art form.

### The Hollywood Golden Age (1930s to 1950s)
Under the studio system, the major studios each cultivated signature genres. Warner Bros. made hard-edged gangster films and social problem pictures. MGM specialised in glossy musicals and melodramas. Universal owned horror, launching Frankenstein, Dracula, and the Creature from the Black Lagoon. The era produced film noir — a cycle of cynical, shadow-drenched crime dramas like Double Indemnity and The Maltese Falcon — born from German Expressionist cinematographers fleeing Europe and a postwar mood of disillusionment. Westerns dominated Saturday matinees and codified the mythology of the American frontier.

### New Hollywood (Late 1960s to 1970s)
When the studios collapsed under television pressure and antitrust rulings, a young generation of film-school-trained directors took over. Bonnie and Clyde, The Graduate, and Easy Rider shattered the Production Code. Francis Coppola, Martin Scorsese, Robert Altman, and Peter Bogdanovich made personal, ambiguous, often violent films that treated audiences as adults. New Hollywood genre pictures subverted their own conventions: the western became elegiac in The Wild Bunch, the gangster film became tragedy in Coppola's Corleone epic, and the horror film became political in Night of the Living Dead.

### The Blockbuster Era (1975 onward)
Jaws in 1975 and Star Wars in 1977 turned the summer release window into a marketing arms race. Wide releases on thousands of screens, television ad campaigns, and tie-in merchandising replaced the slow platform rollouts of the studio era. Genre films became tentpoles: science fiction franchises, superhero adaptations, fantasy series, and animated family films. The 1980s polished the high-concept action film, the 1990s pushed computer-generated imagery into Jurassic Park and Terminator 2, and the 2000s handed the industry to comic book adaptations and young adult dystopias.

### International Cinema
Bollywood, based in Mumbai, produces the largest number of films in the world and blends romance, family melodrama, and elaborate musical numbers into its signature masala format. Nollywood, the Nigerian industry, emerged in the 1990s on direct-to-video budgets and now ranks among the largest by output, telling local stories in English, Yoruba, and Hausa. Korean cinema gained global attention through Parasite, Oldboy, and auteur directors like Bong Joon-ho and Park Chan-wook. Iranian, Japanese, French, and Mexican cinemas all sustain distinctive genre traditions.

### Why It Matters
Genres are how audiences navigate an ocean of content and how filmmakers converse with their predecessors. Every western references Stagecoach, every noir shadows The Maltese Falcon, every space opera rhymes with Star Wars. Understanding genre history reveals that no film stands alone — each one is a move in a century-long conversation about what stories look like, what they mean, and who gets to tell them.`,
  },

  // ----------------------------------------------------------------
  // 2. FILM PRODUCTION PROCESS
  // ----------------------------------------------------------------
  {
    id: 'film-production-process',
    patterns: [/\b(film production|pre-production|post-production|film editing|cinematography|storyboard|casting call|sound design|color grading|vfx pipeline|film distribution|film shoot|production schedule)\b/i],
    keywords: ['film production', 'pre-production', 'post-production', 'film editing', 'cinematography', 'storyboard', 'casting', 'sound design', 'color grading', 'vfx', 'film distribution', 'film shoot'],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `Making a feature film is a multi-year industrial project that passes through three broad phases: pre-production, production, and post-production, followed by distribution. Each phase has its own specialists, budgets, and risks, and a slip in any one can sink the whole venture.

### Pre-Production
Pre-production is the planning phase, where the screenplay is finalised, the budget is locked, and every creative decision is made on paper before a single camera rolls. The producer secures financing, attaches a director and lead actors, and hires department heads. The screenwriter polishes the script through drafts and revisions. Casting directors hold auditions and screen tests. The production designer sketches sets, the costume designer plans wardrobes, and the cinematographer scouts locations. Storyboards translate the script into shot-by-shot drawings, and shot lists specify camera, lens, and movement for every setup. A breakdown sheet tracks every prop, vehicle, animal, and effect each scene requires. A typical pre-production lasts two to six months, sometimes longer for effects-heavy films.

### Production
Production is the shooting phase, when the plans are executed on a soundstage or location. The crew is divided into departments: camera, lighting, grip, art, costume, hair and makeup, sound, special effects, and stunts. Days are long, often twelve to sixteen hours, and a feature might shoot for twenty to eighty days. The cinematographer (also called the director of photography) operates or supervises the camera, chooses lenses, and designs the lighting with the gaffer and key grip. Coverage means capturing a master shot plus coverage from multiple angles so the editor has options. Sound is recorded by a production mixer using boom and lavalier microphones, while a script supervisor logs continuity. Production is expensive — every minute on set can cost thousands of dollars — so the assistant director keeps the day on schedule.

### Post-Production
Post-production assembles the raw footage into a finished film. The picture editor cuts the footage into a rough cut, then refines it through director and studio notes into a final cut. Visual effects teams composite computer-generated creatures, environments, and effects that could not be captured in camera. Color grading balances shots and gives the film its visual mood — cool teal shadows and warm orange highlights for thrillers, bleached desaturation for war films. Sound design layers dialogue, Foley (recreated footsteps and props), ambient beds, and effects, while the composer writes and records the score. The final mix balances all audio into stereo or surround formats.

### Distribution
Distribution carries the finished film to audiences. Studios schedule release dates, design marketing campaigns, cut trailers, and negotiate theatrical, digital, broadcast, and physical windowing. Film festivals like Cannes, Sundance, and Toronto serve as launchpads and marketplaces. Streaming platforms increasingly bypass theatrical windows entirely.

### Why It Matters
The production process is the bridge between an idea and an experience shared by millions. Understanding it demystifies why films cost what they do, why credits scroll for ten minutes, and why some brilliant scripts never reach the screen. Every frame you watch is the residue of hundreds of specialists coordinating a logistical miracle.`,
  },

  // ----------------------------------------------------------------
  // 3. MUSIC GENRES HISTORY
  // ----------------------------------------------------------------
  {
    id: 'music-genres-history',
    patterns: [/\b(music genre history|classical music origin|jazz origin|blues origin|rock and roll|hip hop origin|electronic dance music|reggae history|country music origin|world music|streaming era music)\b/i],
    keywords: ['music genre history', 'classical music', 'jazz', 'blues', 'rock and roll', 'hip hop', 'electronic dance music', 'reggae', 'country music', 'world music', 'streaming era'],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `Music genres are living traditions, each born from specific places, technologies, and social conditions. Tracing their histories reveals how sounds travel, hybridise, and split into subgenres — and how each generation borrows from the last to invent something new.

### Classical Origins
Western classical music grew from early medieval chant in Europe, bloomed into polyphony in the Renaissance, and reached formal maturity in the Baroque era of Bach and Handel. The Classical period of Mozart and Haydn refined symphony and sonata form, and the Romantic era of Beethoven, Chopin, and Wagner pushed expression, scale, and orchestration to new heights. Twentieth-century composers like Stravinsky and Schoenberg shattered tonal conventions, while film scoring carried symphonic writing into popular culture.

### Jazz, Blues, and Their Roots
Blues emerged in the late nineteenth-century American South from work songs, field hollers, and rural folk singing. Its twelve-bar structure and bent blue notes became the foundation of twentieth-century popular music. Jazz grew up in New Orleans around 1900, blending African rhythms, European harmony, and blues. Louis Armstrong's trumpet defined the 1920s, swing big bands dominated the 1930s, bebop pushed jazz into art music in the 1940s, and free jazz and fusion stretched its boundaries thereafter. Jazz directly shaped rhythm and blues, rock, and hip-hop.

### Rock, Pop, and Their Descendants
Rock and roll exploded in the 1950s when Chuck Berry, Little Richard, and Elvis Presley fused blues with country. The British Invasion of the 1960s — the Beatles, the Rolling Stones — re-exported the form back to America. The 1970s splintered rock into progressive, punk, heavy metal, and disco, and the 1980s added new wave, synth-pop, and alternative. Hip-hop emerged in 1970s Bronx block parties where DJs looped drum breaks and MCs toasted over them. By the 1990s, hip-hop was a global force, and today it is the most-streamed genre on Earth. Pop, less a genre than a sensibility, absorbs whatever is current — disco, synth, Max Martin choruses, Latin reggaeton, K-pop production.

### Electronic, Reggae, Country, and World Music
Electronic dance music grew from synthesizers and drum machines in 1970s Detroit techno, Chicago house, and German kosmische music, then exploded through rave culture and EDM festivals. Reggae emerged in 1960s Jamaica from ska and rocksteady, with Bob Marley carrying it worldwide. Country music grew from Appalachian folk and cowboy ballads, with Nashville's songwriting tradition and the Bakersfield and outlaw movements pushing it forward. World music is a marketing umbrella for traditions as diverse as West African kora music, Indian classical ragas, Brazilian samba, and Andean panpipe ensembles.

### The Streaming Era
Streaming platforms unbundled the album, made playlists the new listening unit, and shortened song structures to fit autoplay attention spans. Algorithms now shape what genres cross over, while microgenres like lo-fi hip hop and hyperpop emerge and dissipate in months.

### Why It Matters
Genres are the family trees of sound. Every track you hear has ancestors — a guitar tone from a 1950s bluesman, a drum break from a 1970s funk record, a chord progression from a 19th-century hymn. Knowing the history turns passive listening into a conversation with centuries of musicians who built the vocabulary your favorite songs speak.`,
  },

  // ----------------------------------------------------------------
  // 4. MUSIC PRODUCTION AND RECORDING
  // ----------------------------------------------------------------
  {
    id: 'music-production-recording',
    patterns: [/\b(music production|recording studio|multitrack recording|mixing console|audio mastering|digital audio workstation|pro tools|logic pro|ableton live|audio sampling|synthesizer|midi protocol)\b/i],
    keywords: ['music production', 'recording studio', 'multitrack recording', 'mixing', 'mastering', 'digital audio workstation', 'pro tools', 'logic pro', 'ableton', 'sampling', 'synthesizer', 'midi'],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `Music production is the craft of capturing, shaping, and assembling sound into a finished recording. The modern studio is a hybrid of acoustic engineering and digital software, and the producer is part technician, part arranger, part taste-maker. Understanding the pipeline explains why a professionally produced track feels different from a bedroom demo, even when the song is identical.

### The Recording Studio
A recording studio is built around acoustic isolation and signal flow. Live rooms and isolation booths prevent bleed between instruments. Microphones convert sound into electrical signals, which travel through cables to a mixing console or audio interface. Condenser microphones capture detail on vocals and acoustic instruments, dynamic microphones handle loud sources like drums and guitar amps, and ribbon microphones add warmth to horns and electric guitars. The control room houses monitors, the console, and outboard gear, all acoustically treated so the engineer hears an honest representation of the recording.

### Multitrack Recording
Multitrack recording revolutionised music in the 1950s and 1960s. Instead of capturing a whole band in one take onto a single track, engineers record each instrument onto its own track — eight, sixteen, twenty-four, and now effectively unlimited in software. Each track can be individually balanced, processed, and edited later. Les Paul pioneered overdubbing, and the Beatles' Sgt. Pepper turned multitrack manipulation into art. Today a session might combine live drums on twelve tracks, bass and guitars on several more, vocals doubled and harmonised, and software instruments triggered by MIDI.

### Mixing
Mixing balances the recorded tracks into a coherent whole. The mixer adjusts volume, panning, and processing on every channel. Equalisation (EQ) shapes frequency content — boosting vocal presence, thinning muddy bass, brightening cymbals. Compression reduces dynamic range so quiet and loud parts sit together, adding punch and consistency. Reverb and delay place sounds in a virtual space, from a small room to a vast cathedral. Automation moves faders and effect parameters over time so the mix evolves across the song. A great mix makes every element audible without crowding any frequency band.

### Mastering
Mastering is the final polish applied to a stereo mix. The mastering engineer balances overall tonal balance, matches loudness to industry standards, sequences an album, and prepares files for every distribution format — streaming services, vinyl, CD, cassette. Loudness mastering, driven by the loudness war, pushed average levels up through brick-wall limiters, though streaming normalization has recently eased the pressure.

### DAWs, Sampling, and Synthesis
The digital audio workstation is the modern studio's brain. Pro Tools dominates professional recording, Logic Pro is favored by songwriters, and Ableton Live drives electronic production and performance. Sampling records short audio snippets (often from old records) and replays them at different pitches, the foundation of hip-hop and house. Synthesizers generate sound electronically — subtractive analog synths like the Moog, FM synths like the Yamaha DX7, and software soft-synths. MIDI is a digital protocol that carries note, velocity, and control data rather than audio, letting composers program entire orchestras from a keyboard.

### Why It Matters
Production decisions shape how a song hits you as much as the writing does. A great producer can elevate a simple chord progression to a generational anthem, while a bad mix can bury a brilliant melody. Knowing the pipeline helps listeners hear music as a constructed object — a layered, balanced, mastered artefact rather than a single magical performance.`,
  },

  // ----------------------------------------------------------------
  // 5. VIDEO GAME DEVELOPMENT
  // ----------------------------------------------------------------
  {
    id: 'video-game-development',
    patterns: [/\b(game development|game design document|unity engine|unreal engine|game programming|game art|level design|playtesting|game monetization|indie game|aaa game|game studio)\b/i],
    keywords: ['game development', 'game design document', 'unity engine', 'unreal engine', 'game programming', 'game art', 'level design', 'playtesting', 'monetization', 'indie game', 'aaa game'],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `Video game development is the assembly of code, art, audio, and design into an interactive experience. A modern game is the product of a dozen disciplines coordinating across years, and the pipeline from concept to ship date is one of the most complex in entertainment.

### The Game Design Document
A game design document (GDD) is the project's bible: it specifies mechanics, controls, levels, characters, story, art direction, and monetization. Modern studios often keep the GDD as a living wiki rather than a fixed paper, because design evolves through iteration. The document anchors the team on a shared vision so a level designer and a combat programmer both know what the player is supposed to feel at minute forty.

### Programming and Engines
Most studios build on a commercial engine rather than from scratch. Unity uses C and powers everything from mobile casual games to ambitious indie titles. Unreal Engine uses C and Blueprints visual scripting and dominates high-fidelity AAA and console development. Custom engines like EA's Frostbite or Rockstar's RAGE are reserved for studios with the budget to maintain them. Programmers specialise in systems programming (physics, rendering, networking), gameplay programming (rules and mechanics), AI programming (enemy behavior), and tools programming (editor features and pipelines).

### Art and Animation
Game artists create 2D sprites, 3D models, textures, and animations. Concept artists set the visual style, environment artists build levels and props, character artists sculpt heroes and creatures, and animators rig and animate them. Motion capture records actors' performances and retargets them to digital skeletons. Technical artists bridge art and code, writing shaders that control how surfaces catch light and optimising assets to fit memory budgets.

### Level Design and Playtesting
Level designers arrange geometry, enemies, puzzles, and rewards to teach mechanics and pace the player's experience. A good level starts safe, teaches a new wrinkle, then tests mastery. Playtesting puts real players in front of unfinished builds and watches where they get stuck, bored, or frustrated. Telemetry — anonymized gameplay data sent back to the studio — shows where players die, quit, or backtrack, feeding back into design iterations.

### Monetization Models
The business model shapes the design. Premium games charge upfront. Free-to-play games give the game away and monetize through cosmetics, battle passes, and time-saver purchases. Subscription services like Xbox Game Pass pay developers based on engagement. Live-service games release regular content updates to keep players spending over years. Loot boxes, once common, face regulatory scrutiny in many countries.

### Indie Versus AAA
AAA games are made by hundreds of developers over three to seven years with budgets exceeding one hundred million dollars. Indie games are made by small teams — sometimes one person — on modest budgets, often in engines like Unity or GameMaker. Indies innovate on mechanics and aesthetics that AAA cannot risk, while AAA delivers polish, scale, and fidelity that indies cannot match. Games like Stardew Valley, Hollow Knight, and Hades prove a small team can reach millions.

### Why It Matters
Game development sits at the intersection of every digital art form — writing, music, visual art, animation, and code — plus the unique discipline of interactive design. Understanding the pipeline reveals why games take so long, cost so much, and crunch so hard, and it gives players a richer appreciation of the countless invisible decisions behind every frame they touch.`,
  },

  // ----------------------------------------------------------------
  // 6. VIDEO GAME GENRES
  // ----------------------------------------------------------------
  {
    id: 'video-game-genres',
    patterns: [/\b(video game genre|action game|adventure game|role playing game|rpg|strategy game|simulation game|sports game|puzzle game|first person shooter|fps|moba|battle royale|sandbox game|narrative game|esports)\b/i],
    keywords: ['video game genre', 'action game', 'adventure game', 'rpg', 'strategy game', 'simulation game', 'sports game', 'puzzle game', 'fps', 'moba', 'battle royale', 'sandbox game', 'narrative game', 'esports'],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `Video game genres are defined less by tone or setting than by the verbs they ask the player to perform. Two games can look completely different yet belong to the same genre because the core interaction — shooting, jumping, commanding, solving — is the same. Understanding genres is understanding the design vocabulary that lets players and developers talk about what a game actually is.

### Action and Adventure
Action games reward reflexes and hand-eye coordination. Platformers like Super Mario and Celeste emphasise precise jumping. Hack-and-slash games like Devil May Cry and Bayonetta chain together combos. Adventure games emphasise exploration, puzzle-solving, and narrative; point-and-click adventures like Monkey Island and modern walking simulators like Firewatch focus on story discovery. Action-adventure hybrids like The Legend of Zelda and Tomb Raider combine the two.

### Role-Playing Games
Role-playing games (RPGs) centre character growth, choice, and storytelling. Western RPGs like The Elder Scrolls and The Witcher emphasise open worlds and player agency. Japanese RPGs like Final Fantasy and Persona lean into scripted stories, turn-based combat, and ensemble casts. Action RPGs like Dark Souls blend real-time combat with stat progression. Roguelikes and roguelites permute death and restart, with runs that build on each other through persistent unlocks.

### Strategy, Simulation, and Puzzle
Strategy games reward planning over reflexes. Turn-based strategy like Civilization and XCOM gives players time to weigh decisions. Real-time strategy like StarCraft demands rapid multitasking. Tower defense games task players with holding territory against waves. Simulation games model systems — city builders like SimCity, life simulators like The Sims, farming simulators like Stardew Valley. Puzzle games like Tetris, Portal, and The Witness revolve around rules and pattern recognition.

### Shooters, MOBAs, and Battle Royale
First-person shooters (FPS) like Doom, Half-Life, Counter-Strike, and Call of Duty put the camera behind the weapon. Third-person shooters like Gears of War and Fortnite pull the camera back. Multiplayer online battle arenas (MOBAs) like League of Legends and Dota 2 pit two teams of five against each other on a single map, each player controlling one hero that levels up over a thirty- to forty-minute match. Battle royale games like PUBG, Apex Legends, and Fortnite drop one hundred players onto a shrinking map until one survives.

### Sports, Sandbox, and Narrative
Sports games like FIFA, Madden, and NBA 2K simulate athletic competition with licensed teams and players. Racing games range from arcade thrills like Mario Kart to simulation realism like Gran Turismo. Sandbox games like Minecraft and Roblox hand players tools and let them build, with no set goals. Narrative games like Detroit: Become Human and Disco Elysium prioritise story and choice over reflexes.

### Esports
Competitive games have spawned a professional ecosystem. Esports tournaments fill stadiums and stream to millions, with top games including League of Legends, Dota 2, Counter-Strike, Valorant, and StarCraft II. Professional players sign contracts with teams, salaries reach into the millions, and the industry is increasingly structured along traditional sports lines.

### Why It Matters
Genres help players find games they will love and help developers position their work in a crowded marketplace. Hybrid genres — action RPGs, puzzle platformers, battle royale shooters — drive innovation by combining verbs in new ways. Knowing the genre map turns a wall of game boxes into a navigable landscape and reveals how every game is, in part, a remix of what came before.`,
  },

  // ----------------------------------------------------------------
  // 7. SPORTS RULES AND SYSTEMS
  // ----------------------------------------------------------------
  {
    id: 'sports-rules-systems',
    patterns: [/\b(sports rules|offside rule|scoring system|instant replay|var video assistant referee|overtime rules|tournament format|knockout stage|league format|doping regulation|fair play|referee)\b/i],
    keywords: ['sports rules', 'offside rule', 'scoring system', 'instant replay', 'var', 'overtime rules', 'tournament format', 'knockout', 'league format', 'doping', 'fair play', 'referee'],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `Rules are the invisible architecture of sport. They make a kick worth three points in one code and a try worth five in another, they decide when a goal counts and when it does not, and they turn a free-flowing physical contest into something a stadium of strangers can agree is fair. Understanding the systems behind sports reveals how arbitrary decisions harden into lasting tradition.

### Scoring Systems
Scoring systems shape strategy as much as rules do. In association football, a single goal is so valuable that defensive play is often rewarded. In basketball, points accumulate rapidly — two for a regular basket, three from long range, one per free throw — encouraging constant attack. In tennis, the unusual 15-30-40 counting system and the requirement to win by two create pressure points at deuce. In golf, the lowest stroke count wins, rewarding consistency. In boxing and figure skating, judges score on criteria, introducing subjectivity that fuels debate.

### The Offside Rule
Association football's offside rule is among the most misunderstood yet most elegant in sport. A player is offside if they are nearer to the opponent's goal line than both the ball and the second-last opponent at the moment the ball is played to them — but only if they are actively involved in play. The rule prevents attackers from camping by the goal waiting for long passes. Offside is judged by assistant referees on the touchline and increasingly by semi-automated offside technology that tracks limb positions with cameras. Similar concepts exist in ice hockey (the blue-line offside) and rugby (the onside kick), each shaped to its game's rhythm.

### Instant Replay and VAR
Instant replay entered American football in 1986 and has spread to cricket, tennis, rugby, baseball, and basketball. Video Assistant Referee (VAR) in football reviews goals, penalties, red cards, and mistaken identity, with the referee consulting a pitchside monitor. Hawk-Eye tracks balls in tennis, cricket, and soccer goal-line decisions to within millimetres. Replay reduces howling errors but slows the game and is contested when marginal calls go against a team.

### Overtime and Tiebreakers
Different sports resolve ties differently. Association football uses thirty minutes of extra time and then a penalty shootout. American football plays a sudden-death overtime period with guaranteed possession. Ice hockey plays three-on-three for five minutes before a shootout. Baseball simply keeps playing extra innings until someone leads. Cricket uses Super Overs in limited-overs matches. Each system balances fairness, drama, and broadcast schedules.

### Tournament Formats
League formats — round-robin double or single — reward consistency over a season, with the English Premier League a classic example. Playoff formats seed teams into knockout brackets, with the NBA and NFL as exemplars. Knockout tournaments like the FIFA World Cup group stage feeding into single-elimination rounds produce high drama but expose strong teams to early exits. Swiss-system tournaments in chess and esports pair players with similar records round after round.

### Doping Regulations
Performance-enhancing drugs undermine fair competition, and the World Anti-Doping Agency maintains a prohibited list and code enforced by national agencies. Biological passports track athletes' blood values over time to detect sophisticated doping. Sanctions range from competition bans to stripped medals. Doping scandals have hit cycling, athletics, and weightlifting hardest.

### Why It Matters
Rules and systems are what separate sport from mere play. They make records comparable across eras, give meaning to winning, and produce the rituals — anthem, handshake, trophy lift — that bind communities. Understanding them turns passive spectating into informed appreciation and explains why a marginal offside call can break a nation's heart.`,
  },

  // ----------------------------------------------------------------
  // 8. OLYMPIC GAMES HISTORY
  // ----------------------------------------------------------------
  {
    id: 'olympic-games-history',
    patterns: [/\b(olympic games|ancient olympics|modern olympics|pierre de coubertin|summer olympics|winter olympics|olympic rings|olympic torch|host city|amateur athlete|olympic controversy|paralympic games)\b/i],
    keywords: ['olympic games', 'ancient olympics', 'modern olympics', 'coubertin', 'summer olympics', 'winter olympics', 'olympic rings', 'olympic torch', 'host city', 'amateur', 'olympic controversy', 'paralympic'],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `The Olympic Games are the world's oldest recurring sporting event and its largest peaceful gathering of nations. Held every four years and rotating among host cities, the Olympics fuse athletic competition, ceremony, geopolitics, and spectacle into a single eighteen-day festival that commands the attention of billions.

### The Ancient Olympics
The ancient Olympics began in 776 BCE at Olympia in Greece as a celebration of athletic excellence. Held every four years for over a millennium, they featured running, wrestling, boxing, chariot racing, and the pentathlon. Athletes competed naked, and only freeborn Greek men could enter. An Olympic truce suspended wars so competitors and spectators could travel safely. The games declined under Roman rule and were abolished in 393 CE by the emperor Theodosius as part of a campaign against the old traditions of the empire.

### The Modern Revival
The Olympics were revived in 1896 by the French educator Pierre de Coubertin, who founded the International Olympic Committee in 1894. The first modern Games in Athens drew 280 athletes from thirteen nations competing in forty-three events. Coubertin's vision was part athletic, part educational: he believed international sport could build peace and character. The Olympic motto — faster, higher, stronger — captured the spirit, and the modern addition of "together" reflects the cooperative ideal.

### Summer and Winter Games
The Summer Olympics have run every four years since 1896, interrupted only by the World Wars. The Winter Olympics began in 1924 in Chamonix for snow and ice sports. Until 1992 the Summer and Winter Games were held in the same year; since 1994 they alternate every two years. The Paralympic Games, founded by Sir Ludwig Guttmann in 1960 for athletes with disabilities, are held in the same host city immediately after the Olympic Games.

### Symbols and Ceremony
The five Olympic rings, designed by Coubertin in 1913, represent the five inhabited continents interlinked in friendship; their colours (blue, yellow, black, green, red) on a white background were chosen because every national flag contains at least one of them. The Olympic torch relay, introduced for the 1936 Berlin Games, carries a flame lit from the Sun's rays at Olympia to the host city. The opening ceremony's parade of nations, oaths, and lighting of the cauldron are watched by billions.

### Host Cities and Economics
Host cities invest billions in stadiums, villages, transport, and security. The 1976 Montreal Games left the city with debt that took thirty years to repay; the 1984 Los Angeles Games, by contrast, used existing venues and turned a profit. Recent hosts — Beijing, London, Rio, Tokyo, Paris — face scrutiny over cost, displacement, and post-Games use of facilities. The IOC now favors cities that can repurpose infrastructure rather than build from scratch.

### Amateur to Professional
Coubertin's amateur ideal collapsed as state-sponsored athletes from the Eastern Bloc blurred the line. The 1992 US basketball Dream Team, with NBA professionals, marked the formal arrival of professional athletes. Today most Olympic sports are open to professionals.

### Controversies
The Olympics have weathered political boycotts (Moscow 1980, Los Angeles 1984), terrorist attacks (Munich 1972), doping scandals (state-sponsored Russian programs), judging scandals (Salt Lake 2002 figure skating), and corruption investigations into bid cities. The Games remain a contested but enduring institution.

### Why It Matters
The Olympics compress four years of training, a lifetime of ambition, and a planet's attention into a few weeks. They offer a rare ritual where nations march together, records fall, and individual athletes become symbols of what the human body can do. Understanding their history shows how sport, commerce, and politics braid together whenever the world gathers.`,
  },

  // ----------------------------------------------------------------
  // 9. TELEVISION AND STREAMING EVOLUTION
  // ----------------------------------------------------------------
  {
    id: 'television-streaming-evolution',
    patterns: [/\b(television history|broadcast tv|cable television|golden age of television|streaming revolution|netflix original|binge watching|on demand streaming|hbo max|disney plus|prestige tv)\b/i],
    keywords: ['television history', 'broadcast tv', 'cable television', 'golden age of television', 'streaming revolution', 'netflix original', 'binge watching', 'streaming', 'hbo max', 'disney plus', 'prestige tv'],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `Television evolved from a handful of national broadcast channels into a planetary web of on-demand streaming services. Each era reshaped not only how stories reached audiences but what kinds of stories could be told — from sitcom length and commercial breaks to novelistic long-form dramas built for binge consumption.

### The Broadcast Era
Broadcast television began experimentally in the 1920s and reached mass audiences in the late 1940s. In the United States, three national networks — NBC, CBS, and ABC — dominated viewing for forty years. Programming was scheduled in fixed time slots, sponsored by advertisers, and shaped by the rhythm of commercial breaks. Sitcoms and procedural dramas were built in self-contained episodes that could air in any order. Live drama anthologies like Playhouse 90 and variety shows like The Ed Sullivan Show filled early prime time.

### Cable Television
Cable TV spread in the 1980s and shattered the three-network oligopoly. CNN launched 24-hour news in 1980, MTV reshaped music and youth culture in 1981, ESPN built an empire on live sport, and HBO turned premium subscription television into a home for uncut, serialized, adult drama. By the 1990s, narrowcasting replaced broadcasting: dozens of niche channels addressed tiny audiences with specialty programming — food, history, science, home improvement, reality television.

### The Golden Age of Television
The late 1990s and 2000s saw a creative explosion on cable and premium television. The Sopranos, which premiered on HBO in 1999, demonstrated that television could sustain morally complex antiheroes and novelistic storytelling across seasons. The Wire examined American institutions with documentary depth. Mad Men, Breaking Bad, and The West Wing followed, each treating the hour-long drama as a serious literary form. Showrunners like David Chase, David Simon, and Vince Gilligan became authors in their own right, and the phrase "golden age of television" entered the critical vocabulary.

### The Streaming Revolution
Netflix launched streaming in 2007 and original programming in 2013 with House of Cards, released all at once and built for binge-watching. Amazon Prime Video, Hulu, Disney+, HBO Max (now Max), Apple TV+, and Paramount+ followed. Studios pulled their libraries from Netflix to feed their own platforms, fragmenting what had been a single streaming commons. Subscriber growth, churn, ad-supported tiers, and password-sharing crackdowns define the current competitive landscape.

### Binge-Watching and Original Content
Releasing entire seasons at once changed how stories were structured — cliffhangers became less important than episode-to-episode momentum, and viewers consumed a season in a weekend. Streaming data, invisible to the public, informs renewal and cancellation decisions. Original content — Stranger Things, The Crown, Squid Game, Ted Lasso, Succession — became the differentiator in a crowded market, with global reach delivering hits across languages.

### Why It Matters
Television is the medium through which most people experience long-form storytelling today. Its evolution from broadcast to streaming has rewritten how stories are funded, scheduled, written, and watched. Understanding that arc explains why a 2020 drama looks so different from a 1985 sitcom, and why the boundary between film and television has nearly dissolved — the screen is the screen, and the story is the story.`,
  },

  // ----------------------------------------------------------------
  // 10. CELEBRITY AND POP CULTURE
  // ----------------------------------------------------------------
  {
    id: 'celebrity-pop-culture',
    patterns: [/\b(celebrity culture|paparazzi|social media influencer|parasocial relationship|fan culture|stan culture|celebrity branding|cancel culture|fandom|celebrity endorsement)\b/i],
    keywords: ['celebrity culture', 'paparazzi', 'social media influencer', 'parasocial relationship', 'fan culture', 'stan culture', 'celebrity branding', 'cancel culture', 'fandom', 'celebrity endorsement'],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `Celebrity is the cultural technology that turns individuals into public property. It scales the ancient instinct to gossip about the powerful into an industrial system of image production, distribution, and consumption. Tracing its history reveals how fame has shifted from earned achievement to manufactured persona to algorithm-driven micro-influence.

### The Origins of Celebrity Culture
Modern celebrity emerged in the late nineteenth century with the mass-circulation newspaper and the photograph. Stage actresses, boxers, and politicians became the first faces recognised by strangers across continents. Hollywood's studio system industrialised the phenomenon in the 1920s and 1930s: studios manufactured stars under exclusive contracts, controlled their public images through fan magazines and gossip columnists like Louella Parsons and Hedda Hopper, and leased them to films as brands. To be a star was to play a public self curated by a corporation.

### Paparazzi and Tabloid Journalism
The postwar paparazzi — named after a photographer in Fellini's La Dolce Vita — hunted candid shots of stars off-duty, selling them to tabloid magazines. The economics of the candid shot inverted the studio-controlled image: the more raw and unflattering, the higher the price. Princess Diana's death in a 1997 car crash while being pursued by photographers marked a turning point in public attitudes toward paparazzi, though demand for candid celebrity images never disappeared.

### Social Media and the Influencer
Social media platforms gave celebrities a direct channel to audiences, bypassing traditional gatekeepers. They also created a new category: the influencer, who is famous for being famous on a platform rather than for any traditional achievement. Instagram models, YouTube vloggers, TikTok dancers, and Twitch streamers build audiences through consistent content and algorithmic favour, then monetize through brand deals, merchandise, and subscriptions. The line between celebrity, content creator, and small business has blurred.

### Parasocial Relationships
Parasocial relationships are one-sided emotional bonds where the audience feels they know a celebrity personally, though the celebrity does not know them. Daily vlogs, behind-the-scenes content, and confessional posting intensify these bonds. Research in media psychology shows parasocial bonds can provide genuine comfort and community, but also enable unhealthy fixation and disappointment when a celebrity behaves contrary to their public image.

### Fandom and Stan Culture
Fandom is the organised collective dimension of celebrity culture. Fan clubs, conventions, fan fiction, fan art, and online forums turn individual admiration into shared identity. Stan culture — named after an Eminem song about an obsessive fan — describes intensely loyal, organised fan bases that mobilise to stream, vote, defend, and attack on behalf of their favourites. Stans can elevate careers but also harass rivals and the celebrity's own romantic partners.

### Celebrity Branding and Cancel Culture
Celebrities license their image to products, from perfumes to athleisure lines to tequila brands. The celebrity becomes a brand whose endorsement carries commercial value — and whose missteps carry commercial risk. Cancel culture describes the practice of withdrawing support from a public figure after perceived wrongdoing, often coordinated through social media. Critics call it accountability; defenders of those cancelled call it mob justice. The economic logic underneath is brand risk: when audience sentiment turns, partners distance themselves to protect their own reputations.

### Why It Matters
Celebrity culture shapes what we value, what we buy, what we aspire to, and who we trust. It is the most powerful attention economy in modern life, distributing not only money but cultural priority. Understanding its machinery — production, distribution, parasocial bonding, fandom mobilisation, brand risk — equips us to engage with fame critically rather than being swept along by it.`,
  },

  // ----------------------------------------------------------------
  // 11. THEME PARKS AND ATTRACTIONS
  // ----------------------------------------------------------------
  {
    id: 'theme-parks-attractions',
    patterns: [/\b(theme park|disneyland|roller coaster|dark ride|imagineering|themed land|theme park attendance|ride safety engineering|immersive experience|amusement park|theme park design)\b/i],
    keywords: ['theme park', 'disneyland', 'roller coaster', 'dark ride', 'imagineering', 'themed land', 'attendance', 'ride safety', 'immersive experience', 'amusement park', 'theme park design'],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `Theme parks are the meeting point of theatre, engineering, and urban design. They stage environments where visitors step out of everyday life into a curated fiction, and the rides inside them are physical narratives — stories told through motion, scenery, and sound. Understanding how parks are designed reveals how storytelling, safety engineering, and crowd psychology combine into a single walkable experience.

### The Disneyland Origin
The modern theme park was invented by Walt Disney with Disneyland, which opened in Anaheim, California, in July 1955. Disney was frustrated with the dirty, chaotic amusement parks of the era and wanted a clean, family-friendly park where storytelling led. Disneyland introduced the berm that hid the outside world, the hub-and-spoke layout that funnelled guests through a central castle, and the strictly enforced thematic boundaries of lands like Frontierland, Fantasyland, and Tomorrowland. The park's success transformed amusement into themed entertainment and made the Disney company a real-estate and engineering powerhouse.

### Imagineering
Walt Disney Imagineering — the design and engineering arm of the Disney Parks — was founded in 1952 to build Disneyland. Imagineers are hybrid artists and engineers: writers, architects, set designers, mechanical engineers, audio engineers, and software developers working together on attractions. They coined the term "audio-animatronics" for robotic figures that move in sync with recorded speech and music, first seen in the Enchanted Tiki Room in 1963 and perfected in Pirates of the Caribbean. Imagineering treats a ride as a story the guest moves through physically, with sight lines, music, and lighting choreographed as carefully as a film scene.

### Ride Design
Roller coasters are the headline attraction, descended from Russian ice slides and the late-nineteenth-century Switchback Railway at Coney Island. Modern coasters use steel tubular track for inversions and launches, or wooden track for the classic rattle. Designers balance thrills (drops, loops, airtime) against rider tolerance for g-forces. Dark rides like the Haunted Mansion and Harry Potter and the Forbidden Journey carry guests through indoor scenes with animatronics, projections, and motion-base vehicles. Flat rides (carousels, tea cups), water rides (flumes, rapids), and immersive simulators round out the lineup.

### Themed Lands and Immersion
Modern parks compete on immersion: themed lands designed to feel like real places, with architecture, signage, music, costumes, food, and smell coordinated. Universal's Wizarding World of Harry Potter, Disney's Galaxy's Edge, and Animal Kingdom's Pandora push the concept deep — cast members stay in character, and the backstage is hidden from every guest sight line. The goal is the suspension of disbelief that turns a Saturday outing into a visit to another world.

### Attendance and Economics
Theme parks are capital-intensive businesses. A single flagship attraction can cost upward of one hundred million dollars, and parks rely on year-round attendance, hotels, restaurants, and merchandise to recoup investment. Dynamic pricing, seasonal events like Halloween horror nights, and tiered fast-pass systems extract additional revenue. Crowds are managed through queue design, virtual queues, and capacity engineering.

### Safety Engineering
Ride safety is rigorous and regulated. Computerised block systems prevent trains from colliding, redundancy is built into brakes and restraints, and daily inspections catch wear. Industry associations publish standards for design, maintenance, and operation. Accidents are rare but high-profile, and parks invest heavily in minimising them.

### Why It Matters
Theme parks show how design disciplines converge to manufacture emotion at scale. The same principles — staging, sight lines, themed architecture, choreographed crowd flow — shape retail environments, museums, and urban plazas. Studying parks is a masterclass in how a physical space tells a story, and a reminder that the line between play and serious design is thin.`,
  },

  // ----------------------------------------------------------------
  // 12. ANIMATION TECHNIQUES AND HISTORY
  // ----------------------------------------------------------------
  {
    id: 'animation-techniques-history',
    patterns: [/\b(cel animation|traditional animation|stop motion animation|cgi animation|3d animation|pixar animation|anime|motion capture|rotoscoping|key frame animation|squash and stretch|animation principle)\b/i],
    keywords: ['cel animation', 'traditional animation', 'stop motion', 'cgi animation', '3d animation', 'pixar', 'anime', 'motion capture', 'rotoscoping', 'key frame animation', 'squash and stretch', 'animation principle'],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `Animation is the art of giving life to drawings, objects, and digital models by sequencing images faster than the eye can separate them. Each technique — hand-drawn, stop-motion, computer-generated — has its own history, aesthetics, and labour, and the principles that bind them trace back to a small studio in 1920s Hollywood.

### Traditional Cel Animation
Cel animation dominated the twentieth century. Each frame was drawn by hand onto transparent celluloid sheets (cels), then photographed against painted backgrounds. Walt Disney's studio industrialised the process and pushed its artistic ambition: Snow White and the Seven Dwarfs (1937) was the first full-length cel-animated feature. Animators specialised — key animators drew the main poses, in-betweeners filled the gaps, clean-up artists refined the lines, and ink-and-paint departments transferred drawings to cels. The pipeline was laborious: a six-minute short could take months.

### The Twelve Principles
Disney animators Ollie Johnston and Frank Thomas codified the twelve principles of animation in their 1981 book The Illusion of Life: squash and stretch, anticipation, staging, straight-ahead versus pose-to-pose, follow-through and overlapping action, slow in and slow out, arcs, secondary action, timing, exaggeration, solid drawing, and appeal. These principles — that a bouncing ball squashes on impact and stretches in flight, that a character winds up before a jump — apply to every technique, computer or otherwise, and remain the foundation of animation education.

### Stop Motion
Stop-motion animation moves physical objects frame by frame. Puppets with replaceable mouths and articulated skeletons are posed, photographed, re-posed, and re-photographed; twenty-four frames make a second of footage. Willis O'Brien's King Kong (1933), Ray Harryhausen's creature features, Aardman's Wallace and Gromit, and Laika's Coraline demonstrate the medium's range. Stop motion has a handmade texture CGI cannot replicate.

### CGI and the Pixar Revolution
Computer-generated imagery (CGI) animation emerged in the 1970s and 1980s at research labs and at Pixar, which began as the computer division of Lucasfilm. Pixar's Toy Story (1995) was the first fully computer-animated feature, transforming the industry. Studios moved from cels to 3D modeling, rigging, key-frame animation, simulation, and rendering. DreamWorks, Blue Sky, Sony Pictures Animation, and Disney's own CGI studio followed. By the 2010s, hand-drawn feature animation had nearly vanished from American screens, though it persisted in Studio Ghibli's work.

### Anime and International Traditions
Japanese anime developed its own visual language — limited animation techniques that reused drawings, emphasized held frames with subtle motion, and leaned on strong layout and colour. Osamu Tezuka's Astro Boy (1963) set the production model, Studio Ghibli under Hayao Miyazaki elevated anime to fine art, and modern hits like Attack on Titan, Demon Slayer, and Your Name compete globally. European animation, French in particular, sustains distinctive independent traditions.

### Motion Capture and Rotoscoping
Rotoscoping, invented by Max Fleischer in 1915, traces over live-action footage frame by frame — used in Disney's Snow White's human characters, in Ralph Bakshi's Lord of the Rings, and in Richard Linklater's Waking Life. Motion capture (mocap) records actors' performances via markers or suits and applies them to digital characters, central to Gollum in Lord of the Rings, the Na'vi in Avatar, and modern video game cinematics.

### Why It Matters
Animation is the most free visual medium, unbound by physics, budget, or casting. Every technique carries an aesthetic signature — the warmth of a hand-drawn line, the weight of a stop-motion puppet, the fluid physics of CGI. Understanding the techniques and principles reveals why animation feels different from live action even when the story is the same, and why the medium keeps reinventing itself with each technological shift.`,
  },

  // ----------------------------------------------------------------
  // 13. COMEDY THEORY AND STANDUP
  // ----------------------------------------------------------------
  {
    id: 'comedy-theory-standup',
    patterns: [/\b(comedy theory|superiority theory|relief theory|incongruity theory|standup comedy|setup and punchline|callback joke|sketch comedy|improv comedy|yes and|satire|parody|comedic timing)\b/i],
    keywords: ['comedy theory', 'superiority theory', 'relief theory', 'incongruity theory', 'standup comedy', 'setup', 'punchline', 'callback', 'sketch comedy', 'improv', 'yes and', 'satire', 'parody', 'comedic timing'],
    intent: 'factual_question',
    topic: 'entertainment',
    response: () => `Comedy is the art of producing laughter, and behind the apparent spontaneity of a great joke lies a body of theory and craft that stretches from ancient philosophy to modern club technique. Understanding the theories that explain why we laugh, and the structures that deliver laughs reliably, turns a vague sense of "funny" into a workable craft.

### The Three Theories of Comedy
Philosophers have proposed three main theories of laughter. Superiority theory, traced to Plato, Aristotle, and Thomas Hobbes, holds that we laugh from a sense of triumph over others' folly or misfortune — slapstick, put-downs, and embarrassment comedy fit here. Relief theory, articulated by Herbert Spencer and Sigmund Freud, frames laughter as the release of built-up psychic tension — the punchline discharges the suspense the setup created. Incongruity theory, favored by Kant and Schopenhauer, says we laugh when expectation collides with reality, when the punchline breaks the pattern the setup led us to predict. Most jokes work through a combination of all three.

### Standup Structure
A standup routine is built from jokes, and a joke is built from a setup and a punchline. The setup creates expectation and context; the punchline violates that expectation with a turn. The misdirection — leading the audience one way, then jumping another — is the engine. Callbacks refer back to an earlier joke, rewarding attentive listeners and giving the set a sense of unity. Tags add secondary punchlines after the main one, squeezing extra laughs from a single setup. A tight five — a polished five-minute routine — is the working comedian's calling card.

### Sketch Comedy
Sketch comedy presents short, self-contained scenes that build a comic premise to an absurd extreme. Monty Python's Flying Circus, Saturday Night Live, Kids in the Hall, and Key and Peele exemplify the form. A sketch typically escalates: it establishes a normal world, introduces a comic wrinkle, then doubles down on that wrinkle until the scene collapses under its own absurdity. Sketch shows often use recurring characters and callbacks to bind episodes together.

### Improv and Yes-And
Improvised comedy is performed without a script, often based on audience suggestions. The foundational rule is "yes, and" — accept whatever your scene partner offers, then add to it. The Viola Spolin and Del Close traditions shaped modern long-form improv, with formats like the Harold weaving multiple scenes into a single half-hour piece. Improv trains performers in listening, commitment, and ensemble work, and many film and television comedians began in improv troupes like Second City and Upright Citizens Brigade.

### Satire, Parody, and Timing
Satire uses humour to expose folly or vice, with Jonathan Swift's A Modest Proposal as a canonical example. Parody mimics a specific work or style to comic effect, like Spaceballs parodying Star Wars or Weird Al Yankovic parodying pop songs. Both depend on the audience's familiarity with the target. Comedic timing — the pause before the punchline, the look to camera, the held beat — separates the professional from the amateur. A half-second too long kills a joke; a half-second too short buries it.

### Why It Matters
Comedy is the most social of the arts: it requires a live response, builds community through shared laughter, and lets societies discuss uncomfortable truths through the safety valve of humour. Understanding its theory and craft explains why the same premise can die in one mouth and kill in another, why timing is everything, and why every culture, in every era, has needed people whose job it is to make the room laugh.`,
  },
]
