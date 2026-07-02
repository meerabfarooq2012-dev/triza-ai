/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — ARTS DEEP (Batch 7-c)
 * ============================================================
 *
 *  Deeper subtopic entries for the arts. These go one level
 *  below the foundational batch-arts.ts entries: renaissance
 *  techniques, baroque and rococo style, post-impressionism,
 *  modern art movements, contemporary installations, painting
 *  mediums, sculpture methods, photography composition,
 *  architecture history, music theory, classical composer
 *  periods, theater genres, and film technique.
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries so TRIZA can match
 *  the specific subtopic terms (sfumato, tenebrism, pointillism,
 *  rule of thirds, lost-wax casting, sonata form, mise-en-scene,
 *  etc.) without colliding with the broad batch-arts.ts entries.
 *
 *  NO external LLM API is used. These are facts TRIZA has
 *  "learned" and will express in its own voice via the
 *  self-expression + narration engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const ARTS_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. RENAISSANCE ART TECHNIQUES
  // ----------------------------------------------------------------
  {
    id: 'renaissance-art-techniques',
    patterns: [/\b(linear perspective|sfumato|chiaroscuro|fresco painting|oil painting technique|brunelleschi perspective|renaissance techniques|underpainting|glazing technique|vanishing point|fresco vs oil|renaissance painting techniques)\b/i],
    keywords: ['linear perspective', 'sfumato', 'chiaroscuro', 'fresco', 'oil painting', 'brunelleschi', 'vanishing point', 'underpainting', 'glazing', 'renaissance techniques'],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `The Renaissance, roughly 1400 to 1600, remade Western art by reinventing how a painting could describe space, light, and the human body. The Florentine architect Filippo Brunelleschi demonstrated linear perspective around 1425 by painting the Florence Baptistery on a panel with a peephole and a mirror. Viewers saw an image indistinguishable from the real building. That demonstration handed painters a mathematical tool to project three-dimensional depth onto a flat surface, and it swept through Italian workshops within a generation.

### Linear Perspective
One-point perspective arranges all receding lines to converge at a single vanishing point on the horizon line, mimicking how the eye sees parallel rails meeting in the distance. Two-point perspective uses two vanishing points for objects seen at an angle, and three-point perspective adds a vertical axis for towering or aerial views. Masaccio's *Trinity* fresco of 1427 is the earliest confident deployment, and Piero della Francesca systematized the geometry in his treatise *De prospectiva pingendi*. Perspective gave painting the authority of mathematics.

### Sfumato and Chiaroscuro
Leonardo da Vinci perfected sfumato, the Italian word for something evaporated like smoke, by layering translucent oil glazes so finely that contours dissolve into shadow. The corners of the *Mona Lisa*'s mouth blur softly because Leonardo painted perhaps thirty translucent layers over them, never a hard edge. Chiaroscuro, by contrast, is the strong contrast of light and dark used to model three-dimensional volume. Raphael and Titian both used it to make figures look carved from the picture plane, and it set the stage for Caravaggio's later tenebrism.

### Fresco versus Oil
Fresco, painting with pigment brushed into wet lime plaster, was the monumental medium of the Renaissance. Michelangelo's Sistine Chapel ceiling of 1508 to 1512 is fresco, as is Raphael's *School of Athens*. The plaster absorbs the pigment chemically, so the color becomes part of the wall and lasts for centuries, but the painter must work fast before the plaster dries, in sections called giornate. Oil paint, refined in Flanders by Jan van Eyck and adopted south of the Alps by the late 1400s, dried slowly enough for blending, glazing, and infinite revision. It allowed the intimacy and detail of Leonardo, the chromatic depth of Titian, and eventually the layered glazes of the Baroque.

### The Patronage System
Renaissance art was commissioned, not made on speculation. The Medici in Florence, the papal court in Rome, the Sforza in Milan, and the doges of Venice financed altarpieces, portraits, tombs, and civic decoration. An artist's reputation depended on the patrons he could secure, and contracts specified subject, pigments (ultramarine blue from lapis lazuli was billed separately), and delivery dates. Patronage freed artists from market pressure but tied their subject matter to dynastic and civic agendas.

### Why It Matters
Renaissance techniques, perspective, sfumato, chiaroscuro, and the dual mastery of fresco and oil, are still the foundation of academic painting. Every art student today begins with linear perspective and a value scale. The Renaissance also professionalized the artist, transforming the medieval guild craftsman into an intellectual whose biography mattered. Giorgio Vasari's *Lives of the Most Excellent Painters* of 1550 turned painters into personalities, and that cultural elevation of the maker is the direct ancestor of how we still talk about art today.`,
  },

  // ----------------------------------------------------------------
  // 2. BAROQUE AND ROCOCO STYLES
  // ----------------------------------------------------------------
  {
    id: 'baroque-rococo-styles',
    patterns: [/\b(baroque art|rococo|tenebrism|caravaggio|rembrandt lighting|bernini|watteau|fragonard|counter-reformation art|baroque style|rococo style|baroque painting|rococo painting)\b/i],
    keywords: ['baroque', 'rococo', 'tenebrism', 'caravaggio', 'rembrandt lighting', 'bernini', 'watteau', 'fragonard', 'counter-reformation'],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `The Baroque style emerged in Rome around 1600 and spread across Europe for the next century and a half. Where Renaissance art favored balance and clarity, the Baroque pursued drama, movement, and emotional intensity. It was shaped in large part by the Catholic Church's Counter-Reformation, which commissioned art of immediate emotional and narrative power to communicate stories vividly to a wide congregation. Painting, sculpture, and architecture all embraced theatricality, sweeping curves, and contrast of light and dark.

### Caravaggio and Tenebrism
Michelangelo Merisi da Caravaggio (1571 to 1610) reinvented painting with tenebrism, a dramatic form of chiaroscuro in which figures emerge from a near-black background as if lit by a single hidden lamp. In *The Calling of Saint Matthew* and *The Supper at Emmaus*, ordinary people in contemporary clothes stand in a shaft of light that turns a humble room into a stage. Caravaggio painted directly from live models without preparatory drawings, which gave his figures an unprecedented physical presence. His style, called Caravaggism, spread rapidly through Italy, Spain (Ribera, Zurbaran), and the Netherlands (the Utrecht Caravaggisti).

### Rembrandt's Light
Dutch Baroque painter Rembrandt van Rijn (1606 to 1669) took chiaroscuro in a psychological direction. His light does not merely illuminate; it reveals character. In the *Night Watch* and in dozens of self-portraits across his life, faces emerge from warm brown shadow while hands and eyes catch the light. Rembrandt's technique of layering translucent glazes and impasto highlights became known as Rembrandt lighting in both painting and photography.

### Bernini and Baroque Sculpture
Gian Lorenzo Bernini (1598 to 1680) was the sculptor-architect of Baroque Rome. His *Apollo and Daphne* captures the moment Daphne's fingers sprout leaves as she flees Apollo, the marble so finely carved that the bark seems to ripple. His *Ecstasy of Saint Teresa* pairs a swooning figure with angled bronze rays of light, the whole chapel designed as a theater. Bernini also completed the colonnade of Saint Peter's Square, two sweeping arms of columns that embrace the visitor.

### The Rococo Reaction
By the early 1700s, the heavy drama of the Baroque gave way to the lighter, more playful Rococo, beginning in France under Louis XV. Rococo interiors were asymmetrical, gilded, and shell-ornamented (the word comes from *rocaille*, shellwork). Painters Jean-Antoine Watteau, Jean-Honore Fragonard, and Francois Boucher depicted garden parties, flirtations, and mythological shepherds in pastel pinks and blues. Fragonard's *The Swing* of 1767, with its pink dress flying upward through dappled light, is the Rococo in a single canvas.

### Why It Matters
The Baroque and Rococo together shaped the visual language of emotional persuasion. Caravaggio's tenebrism survives in film noir lighting and fashion photography. Bernini's integration of sculpture, architecture, and light anticipates installation art. The Rococo's emphasis on intimacy and decorative pleasure paved the way for interior design as an art form. Any modern image that relies on dramatic light against shadow, or any interior that uses asymmetrical ornament, is borrowing from this 17th- and 18th-century vocabulary.`,
  },

  // ----------------------------------------------------------------
  // 3. IMPRESSIONISM AND POST-IMPRESSIONISM
  // ----------------------------------------------------------------
  {
    id: 'impressionism-post-impressionism',
    patterns: [/\b(post-impressionism|post impressionism|cezanne|gauguin|seurat|pointillism|degas|renoir|toulouse-lautrec|broken color|pissarro|post-impressionist painters)\b/i],
    keywords: ['post-impressionism', 'cezanne', 'gauguin', 'seurat', 'pointillism', 'degas', 'renoir', 'toulouse-lautrec', 'pissarro', 'broken color'],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `Impressionism broke the Salon's hold on French painting in the 1870s by rejecting dark varnish and historical subjects in favor of modern life caught in fleeting light. By the 1880s a younger generation, later labeled Post-Impressionists, accepted the Impressionist use of bright color and modern subjects but pushed back against the Impressionist insistence on optical accuracy. They wanted painting to carry structure, emotion, symbol, or system. The four central figures of this reaction were Paul Cezanne, Georges Seurat, Paul Gauguin, and the older Edgar Degas, alongside Vincent van Gogh and Henri de Toulouse-Lautrec.

### Cezanne and Structure
Paul Cezanne (1839 to 1906) sought to make of Impressionism, as he put it, something solid and lasting like the art of museums. He reduced nature to cylinders, spheres, and cones, painting Mont Sainte-Victoire in southern France some eighty times. Cezanne used patches of color laid side by side to build form rather than describe light, abandoning single-point perspective in favor of multiple viewpoints within one canvas. His work pointed directly to Cubism, and Picasso later called him the father of us all.

### Seurat and Pointillism
Georges Seurat (1859 to 1891) approached painting as a science. He studied color theory, particularly the writings of Michel Eugene Chevreul on simultaneous contrast, and developed pointillism (also called divisionism), in which tiny dots of pure color sit side by side on the canvas to mix optically in the viewer's eye rather than on the palette. His *A Sunday on La Grande Jatte* of 1886, a monumental park scene of stiff middle-class figures, took two years and hundreds of preparatory drawings. The technique produces a luminous stillness very different from Impressionist spontaneity.

### Gauguin and Symbol
Paul Gauguin (1848 to 1903) abandoned a career as a stockbroker, then abandoned his wife and five children, to pursue a primitive ideal. After painting in Brittany alongside Emile Bernard, he sailed to Tahiti in 1891 seeking an unspoiled paradise. Works like *Where Do We Come From? What Are We? Where Are We Going?* use flat areas of bold, non-naturalistic color and heavy outlines. Gauguin's insistence that color should express emotion rather than describe reality opened the door to Fauvism and Symbolism.

### Degas, Renoir, and the Impressionist Circle
Edgar Degas (1834 to 1917) exhibited with the Impressionists but disliked the label. He worked indoors, drawing ballet dancers, laundresses, and racehorses in pastel and oil, often from unusual oblique viewpoints influenced by Japanese prints and the new medium of photography. Pierre-Auguste Renoir (1841 to 1919) stayed closest to Impressionist pleasure in *Bal du moulin de la Galette* and *Luncheon of the Boating Party*, warm figure paintings of Parisian leisure. Camille Pissarro, the eldest, was the only painter to show in all eight Impressionist exhibitions and acted as mentor to both Cezanne and Gauguin.

### Why It Matters
Post-Impressionism is the bridge between the Impressionist revolution of light and the abstract movements of the twentieth century. Cezanne's geometric reduction underwrites Cubism, Gauguin's symbolic color underwrites Fauvism, Seurat's optical science underwrites Op Art, and Van Gogh's emotional brushwork underwrites Expressionism. Almost every direction modern painting took between 1900 and 1950 can be traced back to one of these four or five painters working in France in the 1880s and 1890s.`,
  },

  // ----------------------------------------------------------------
  // 4. MODERN ART MOVEMENTS
  // ----------------------------------------------------------------
  {
    id: 'modern-art-movements',
    patterns: [/\b(fauvism|matisse|expressionism|edvard munch|the scream|kandinsky|dada|dadaism|surrealism|salvador dali|magritte|abstract expressionism|jackson pollock|de kooning|braque|modern art movements)\b/i],
    keywords: ['fauvism', 'matisse', 'expressionism', 'munch', 'kandinsky', 'dada', 'surrealism', 'dali', 'magritte', 'abstract expressionism', 'pollock', 'de kooning', 'braque'],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `Between 1900 and 1950 Western painting passed through a sequence of movements so rapid and so radical that the canvas itself was redefined several times over. Cubism fractured form, Fauvism liberated color, Expressionism distorted it for emotional truth, Dada rejected art altogether, Surrealism mined the unconscious, and Abstract Expressionism abandoned recognizable subject. Each movement was a polemic, often announced in a manifesto, and each left a permanent mark on the visual vocabulary of the twentieth century.

### Cubism and Georges Braque
Pablo Picasso's *Les Demoiselles d'Avignon* of 1907 shattered five centuries of Western perspective by showing five figures from multiple angles at once. Working side by side in Paris between 1909 and 1914, Picasso and Georges Braque developed Cubism into a system: objects analyzed into geometric facets, shown simultaneously from front, side, and top. Analytic Cubism used muted browns and grays. Synthetic Cubism, after 1912, introduced collage, newspaper, and bright color. Cubism's simultaneity of viewpoints reshaped not only painting but sculpture, poetry, and design.

### Fauvism and Matisse
Henri Matisse (1869 to 1954) led the brief but explosive Fauvist movement of 1905 to 1907. The Fauves, or wild beasts, used pure unmixed color straight from the tube, applied in flat patches, to express emotion rather than describe nature. *Woman with a Hat* and *The Joy of Life* outraged critics at the 1905 Salon d'Automne. Matisse later refined Fauvism into the cut-paper compositions of his last years, the *Jazz* series of 1947, in which color itself became the subject.

### Expressionism and Kandinsky
Expressionism, born in Germany with groups like Die Brucke (1905) and Der Blaue Reiter (1911), distorted color and form to express inner feeling. Edvard Munch's *The Scream* of 1893, with its blood-red sky and skull-like head on a bridge, is the movement's icon. Wassily Kandinsky (1866 to 1944) moved from Expressionist landscapes to the first entirely abstract paintings around 1911, arguing in *Concerning the Spiritual in Art* that color and line could carry the same emotional weight as music.

### Dada and Surrealism
Dada emerged in Zurich in 1916 as a revolt against the rational world that had produced the First World War. Marcel Duchamp's readymades, a urinal signed R. Mutt and submitted as *Fountain* in 1917, asked whether selection itself could be art. Surrealism, founded by Andre Breton in 1924, drew on Freud to paint the unconscious. Salvador Dali's melting clocks in *The Persistence of Memory* of 1931 and Rene Magritte's *The Treachery of Images* (a pipe labeled this is not a pipe) made the irrational visible.

### Abstract Expressionism
After the Second World War, the center of avant-garde painting shifted from Paris to New York. Jackson Pollock (1912 to 1956) dripped and poured industrial enamel onto canvas laid on the floor, his whole-body gesture becoming the subject, as in *Autumn Rhythm* of 1950. Willem de Kooning's *Woman* series attacked the figure with slashing brushwork. Mark Rothko stacked floating rectangles of luminous color. The scale, the all-over composition, and the emphasis on the artist's gesture defined a new American confidence in painting.

### Why It Matters
Modern art movements overturned the Renaissance assumption that painting should represent the visible world. By 1950, painting could be pure color, pure gesture, pure idea, or a urinal. This liberation underlies contemporary visual culture, from abstract logo design to digital art, and taught viewers to read a canvas as a record of decisions rather than a window onto nature.`,
  },

  // ----------------------------------------------------------------
  // 5. CONTEMPORARY ART AND INSTALLATIONS
  // ----------------------------------------------------------------
  {
    id: 'contemporary-art-installations',
    patterns: [/\b(pop art|andy warhol|lichtenstein|minimalism|conceptual art|installation art|performance art|digital art|nft|nfts|street art|banksy|basquiat|contemporary art)\b/i],
    keywords: ['pop art', 'warhol', 'lichtenstein', 'minimalism', 'conceptual art', 'installation art', 'performance art', 'digital art', 'nft', 'street art', 'banksy', 'basquiat'],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `Contemporary art, generally meaning art made from the 1960s onward, expanded the very definition of the artwork beyond painting and sculpture. Where modern movements like Cubism and Abstract Expressionism still produced objects to hang on a wall, contemporary artists turned to mass media, ideas, the body, the street, and the network as materials. The boundary between high art and popular culture, between art object and everyday object, became the central subject.

### Pop Art
Pop Art emerged in mid-1950s Britain and 1960s America, embracing advertising, comic books, and consumer products as subject matter. Andy Warhol (1928 to 1987), a former commercial illustrator, silkscreened Campbell's Soup cans, Marilyn Monroe, and electric chairs in identical repeated rows, erasing the distinction between fine art and mass production. Roy Lichtenstein enlarged comic-book panels, hand-painting the Benday dots of newspaper printing at monumental scale. Pop Art challenged the Abstract Expressionist belief in unique heroic gesture by celebrating the reproducible and the everyday.

### Minimalism and Conceptual Art
Minimalism, in the work of Donald Judd, Dan Flavin, and Agnes Martin, reduced sculpture and painting to simple geometric forms and industrial materials. Judd's stacked metal boxes, identical units bolted to a wall, refused composition and metaphor. Conceptual Art went further: Sol LeWitt defined artworks as sets of instructions, and Joseph Kosuth's *One and Three Chairs* displayed a chair, a photograph of that chair, and the dictionary definition of chair, arguing that the idea outranks the object.

### Installation and Performance
Installation art transforms an entire room or site into the artwork. Allan Kaprow's *Happenings* of the late 1950s merged theater, sculpture, and audience participation. Yayoi Kusama's *Infinity Mirror Rooms* surround the viewer in endless reflected light. Performance art uses the artist's body as medium: Marina Abramovic sat across from strangers in *The Artist Is Present* at MoMA in 2010 for 736 hours. These forms reject the passive viewer of traditional painting in favor of immersion and presence.

### Street Art and Banksy
Street art moved the gallery to the wall. Jean-Michel Basquiat (1960 to 1988) began as the graffiti poet SAMO in late-1970s Manhattan, then brought his raw, crown-topped figures into neo-expressionist painting. Banksy, the anonymous British artist, uses stencils to deliver political critique on city walls, from the *Girl with Balloon* to murals on the West Bank barrier. When his *Balloon Girl* self-shredded at auction in 2018, the act itself became the artwork.

### Digital Art and NFTs
Digital art dates to the 1960s but exploded with the internet. Generative artists like Casey Reas write code that produces images, and Refik Anadol trains AI on vast datasets to project living data sculptures. In 2021, Beeple's *Everydays: The First 5000 Days* sold at Christie's for sixty-nine million dollars as an NFT, a non-fungible token certifying ownership of a digital file. Whether NFTs endure as a market or not, they have forced the art world to confront what ownership means in a copyable medium.

### Why It Matters
Contemporary art asks not what is beautiful but what counts as art in the first place. That question has reshaped museums, art markets, design, advertising, and social media. The installation, the performance, the meme, and the blockchain certificate are all descendants of the same post-1960 decision to treat the frame around the artwork as part of the artwork itself. Understanding contemporary art means understanding the cultural assumptions we bring to any image, object, or act.`,
  },

  // ----------------------------------------------------------------
  // 6. OIL, ACRYLIC, AND WATERCOLOR PAINTING
  // ----------------------------------------------------------------
  {
    id: 'oil-painting-acrylic-watercolor',
    patterns: [/\b(oil paint|acrylic paint|watercolor|watercolour|gouache|tempera|painting mediums|glazing|impasto|varnish|linseed oil|painting medium)\b/i],
    keywords: ['oil paint', 'acrylic', 'watercolor', 'watercolour', 'gouache', 'tempera', 'glazing', 'impasto', 'varnish', 'linseed oil', 'painting mediums'],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `Painting mediums differ in how their pigment is bound, and that binder determines drying time, transparency, surface texture, and the entire range of techniques a painter can use. Oil, acrylic, watercolor, gouache, and tempera are the five major traditional mediums, and each one shaped a chapter of art history. The choice of medium is never neutral; it sets the limits of what a painting can look like.

### Oil Paint
Oil paint suspends pigment in a drying oil, traditionally linseed oil, sometimes walnut or poppy. Refined in Flanders by Jan van Eyck in the early 1400s and adopted across Europe by 1500, oil dries slowly, often over days or weeks. That slow drying permits blending on the canvas, layered glazes of translucent color over a monochrome underpainting, and the thick impasto passages of Van Gogh and Rembrandt. Oil colors stay rich and deep because the oil medium is itself transparent. Painters thin oil with turpentine or mineral spirits, and a final coat of varnish unifies the surface and protects it from dust and ultraviolet light.

### Acrylic Paint
Acrylic, invented in the mid-twentieth century and commercially available from the 1950s, suspends pigment in an acrylic polymer emulsion. It dries in minutes, can be thinned with water, and once dry is waterproof and flexible. Acrylic accepts a wide range of additives: gels for impasto, mediums for glazing, retarders to slow drying. David Hockney, Helen Frankenthaler, and Morris Louis exploited its fast drying and staining properties on unprimed canvas. Acrylic's main trade-off against oil is that its colors tend to dry slightly darker, and it cannot rival oil's slow, buttery blending.

### Watercolor
Watercolor suspends pigment in a water-soluble gum arabic binder, usually applied to absorbent paper. Its signature property is transparency: the white of the paper shines through thin washes, providing the highlights rather than white paint. Watercolor rewards the painter who works from light to dark, reserving whites and building layers of wet-on-wet and wet-on-dry washes. Turner's luminous skies, Winslow Homer's sea foam, and the transparent shadows of John Singer Sargent show the medium at its full power. Watercolor is unforgiving: once a dark mark is down, lifting it is difficult.

### Gouache and Tempera
Gouache is opaque watercolor, with chalk added to the pigment so that it covers what is beneath. Illustrators and designers love gouache for its flat, velvety color and matte finish; Henri Matisse used it for his late cut-paper *Jazz* series. Tempera, the dominant European medium before oil, binds pigment with egg yolk. It dries almost instantly to a hard, matte surface and cannot be blended wet, so tempera painters build up finely hatched and crosshatched strokes. Sandro Botticelli's *Birth of Venus* is egg tempera on panel.

### Why It Matters
The history of painting is in part a history of chemistry. Jan van Eyck's oil glazes enabled the luminous shadows of the Renaissance. The invention of metal paint tubes in 1841 let the Impressionists take oil outdoors. Acrylic's appearance in the 1950s made possible the large flat color fields of Color Field painting. Today's painters move freely among these mediums, often mixing them, but each one still carries the technical assumptions and the visual fingerprints of the centuries that shaped it. Choosing a medium is choosing a tradition.`,
  },

  // ----------------------------------------------------------------
  // 7. SCULPTURE TECHNIQUES AND MATERIALS
  // ----------------------------------------------------------------
  {
    id: 'sculpture-techniques-materials',
    patterns: [/\b(sculpture techniques|stone carving|wood carving|modeling clay|lost-wax casting|bronze casting|assemblage|marble sculpture|relief sculpture|monumental sculpture|sculpture materials|cire perdue)\b/i],
    keywords: ['sculpture', 'stone carving', 'wood carving', 'modeling', 'lost-wax casting', 'bronze casting', 'assemblage', 'marble', 'relief', 'monumental'],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `Sculpture is the art of three-dimensional form, and the four classic techniques, carving, modeling, casting, and assemblage, each correspond to a different family of materials and a different way of thinking. A carver subtracts, a modeler adds, a caster duplicates, and an assembler joins. The choice of method dictates the look, the scale, and the durability of the finished work, and each technique carries its own historical lineage.

### Carving Stone and Wood
Carving is subtractive: the sculptor removes material from a block until the form emerges. Marble, with its crystalline structure and slight translucency, was the prized stone of Greek, Renaissance, and Neoclassical sculpture. Michelangelo claimed he simply released the figure already imprisoned in the marble. Granite and basalt are harder and demand pneumatic tools. Wood carving, used for totems, altarpieces, and African sculpture, follows the grain and requires sensitivity to the natural growth of the tree. All carving is high-risk, since a single mistaken blow cannot be undone.

### Modeling Clay and Wax
Modeling is additive and forgiving: the sculptor builds up form in soft clay, wax, or plastilene. Clay can be kept wet and reworked indefinitely, which makes it the medium for preliminary studies (bozzetti) and for portrait heads from life. Auguste Rodin left many of his clay studies deliberately rough, with thumbprints visible, to preserve the energy of the maker's hand. A finished clay model is then typically fired into terracotta or used as the master from which a mold is taken for casting.

### Bronze Casting and Lost-Wax
Casting duplicates a model in a durable metal. The lost-wax method (cire perdue), used since the Bronze Age, begins with a full-size wax model. The model is encased in a ceramic shell, then heated so the wax melts and runs out, leaving a hollow mold. Molten bronze is poured into the cavity, the shell is broken away, and the bronze figure emerges. Greek bronzes like the *Riace Warriors*, Donatello's *David* (the first freestanding bronze nude since antiquity), and Rodin's *The Thinker* were all cast this way. Bronze is strong enough for monumental outdoor work and captures fine detail from the original model.

### Assemblage
Assemblage, the twentieth-century addition to the sculptor's toolkit, joins found or fabricated objects into a three-dimensional composition. Pablo Picasso's *Bull's Head* of 1942 was made from a bicycle saddle and handlebars. Louise Nevelson stacked wooden crates into monochrome walls. Assemblage opened the door to junk sculpture, kinetic art, and eventually installation. The technique rejects carving and casting in favor of joining, mirroring the industrial world the artists lived in.

### Monumental versus Relief
Sculpture is also classified by how it occupies space. Freestanding or sculpture-in-the-round is fully three-dimensional, designed to be walked around. Relief sculpture projects from a flat background: high relief (alto-rilievo) projects far, as on the Parthenon frieze, while low relief (bas-relief) is shallow, as on Egyptian temple walls. Monumental sculpture, like the Colossi of Memnon or Mount Rushmore, exceeds the human scale and shapes the landscape itself.

### Why It Matters
Sculpture is the art that shares our physical space. A painting hangs on a wall; a sculpture stands in the room. That bodily presence is why sculptors from Phidias to Anish Kapoor have been commissioned to mark civic sites, memorials, and sacred precincts. The four techniques, carving, modeling, casting, assemblage, are still the foundation of contemporary sculpture education, and the materials, marble, bronze, wood, clay, found objects, still define what a three-dimensional image can mean to a viewer who can walk around it.`,
  },

  // ----------------------------------------------------------------
  // 8. PHOTOGRAPHY COMPOSITION TECHNIQUES
  // ----------------------------------------------------------------
  {
    id: 'photography-composition-techniques',
    patterns: [/\b(rule of thirds|leading lines|depth of field|aperture|shutter speed|iso|exposure triangle|golden ratio|framing photography|portrait photography|landscape photography|photography composition)\b/i],
    keywords: ['rule of thirds', 'leading lines', 'depth of field', 'aperture', 'shutter speed', 'iso', 'exposure triangle', 'golden ratio', 'framing', 'portrait', 'landscape'],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `Photography composes with light and time. Where a painter adds pigment to a blank surface, a photographer decides what to include in the frame, when to release the shutter, and how to expose the sensor. Two layers govern the result: the exposure triangle of aperture, shutter speed, and ISO determines how much light reaches the sensor, and the compositional rules determine how that light is arranged within the rectangle. Mastery of both turns a snapshot into a photograph.

### The Exposure Triangle
Aperture, the diameter of the lens opening, is measured in f-stops. A low f-number like f/1.8 is a wide opening that admits a lot of light and produces a shallow depth of field, blurring the background behind a portrait subject. A high f-number like f/16 is a small opening with deep focus, used for landscapes. Shutter speed, the duration the sensor is exposed, ranges from thousands of a second (freezing a hummingbird's wings) to many seconds (turning a waterfall into silk). ISO is the sensor's sensitivity: low ISO produces clean images, high ISO adds grain but allows shooting in dim light. The three settings trade off against each other, and the photographer balances them for the desired effect.

### Rule of Thirds and Golden Ratio
The rule of thirds divides the frame into a three-by-three grid and places the main subject at one of the four intersections or along one of the lines. This off-center placement produces more dynamic balance than centering the subject, which can feel static. The golden ratio, approximately 1 to 1.618, generates a related spiral that has been used since the Renaissance to place focal points along a curve that guides the eye through the composition. Both rules are starting points; experienced photographers break them deliberately when symmetry or centering serves the image.

### Leading Lines and Framing
Leading lines are real or implied lines in the scene, a road, a fence, a river, a corridor, that draw the viewer's eye toward the subject. They add depth by establishing a clear path from foreground to background. Framing uses elements within the scene, an archway, a window, overhanging branches, to enclose the subject and direct attention inward. Both techniques exploit the two-dimensional nature of the photograph to imply the third dimension the viewer knows is there.

### Depth of Field and Background Control
Depth of field is the range of distance that appears acceptably sharp in an image. A portrait photographer often opens the aperture wide to throw a distracting background out of focus, isolating the subject. A landscape photographer stops down to keep everything from foreground flowers to distant mountains sharp. Selective focus is a compositional choice: it tells the viewer what is important by what it leaves blurred.

### Portrait and Landscape Genres
Portrait photography focuses on the face and the eyes, usually at a longer focal length (85mm to 135mm) that flatters facial proportions. Lighting, whether soft window light, a single studio strobe, or three-point setup, sculpts the features. Landscape photography favors wide-angle lenses, tripods for sharp long exposures, and attention to time of day. The golden hour just after sunrise or before sunset gives warm low-angle light prized for two centuries.

### Why It Matters
Photography is the visual language of the modern world, from journalism and advertising to social media and family memory. The rules of composition and exposure are not arbitrary; they encode how the human eye scans an image and how light describes form. Learning them gives any photographer control over what their images communicate. The same principles now govern cinematography, phone photography, and AI image generation.`,
  },

  // ----------------------------------------------------------------
  // 9. ARCHITECTURE STYLES HISTORY
  // ----------------------------------------------------------------
  {
    id: 'architecture-styles-history',
    patterns: [/\b(classical orders|doric|ionic|corinthian|gothic architecture|flying buttresses|stained glass|bauhaus|le corbusier|brutalist|brutalism|sustainable architecture|architectural styles|renaissance architecture)\b/i],
    keywords: ['classical orders', 'doric', 'ionic', 'corinthian', 'gothic', 'flying buttresses', 'stained glass', 'bauhaus', 'le corbusier', 'brutalist', 'sustainable architecture'],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `Architecture is the art we live inside. Unlike painting or sculpture, it must stand up, keep out the rain, and serve human use, and those structural demands have shaped every architectural style in history. From the classical orders of ancient Greece to the parametric facades of contemporary sustainable design, each style is a negotiation between engineering, climate, materials, and cultural ambition. A building is always also a statement about how its age wants to be remembered.

### Classical Orders
Greek architecture codified three orders, each a complete system of column, capital, entablature, and proportion. The Doric order, the oldest and plainest, has a sturdy column with no base and a simple cushion capital; the Parthenon is Doric. The Ionic order adds voluted (scroll-shaped) capitals and slenderer columns, as in the Erechtheion. The Corinthian order, the most ornate, has acanthus-leaf capitals and was favored by the Romans, who added two more orders (Tuscan and Composite). The orders governed proportion so strictly that a temple could be designed from the diameter of a single column.

### Gothic Architecture
Gothic architecture emerged in twelfth-century France and dominated Europe for four hundred years. Its three great innovations, the pointed arch, the ribbed vault, and the flying buttress, redistributed the weight of stone walls outward and downward, allowing walls to dissolve into stained glass. Chartres Cathedral and Notre-Dame de Paris flood their interiors with colored light that medieval viewers read as a metaphor for the divine. The Gothic cathedral, with its spires, gargoyles, and rose windows, remains the most ambitious structural system attempted before the steel frame.

### Renaissance and Baroque Architecture
Renaissance architects, beginning with Filippo Brunelleschi and Leon Battista Alberti in fifteenth-century Florence, returned to the classical orders and to symmetry, proportion, and the dome. Brunelleschi's dome for Florence Cathedral (1436) doubled the span of any dome since Rome. Andrea Palladio's villas near Vicenza codified a temple-fronted classical vocabulary that spread to English country houses and American plantation homes. The Baroque added curves, drama, and urban theatricality, as in Bernini's colonnade for Saint Peter's Square and the palaces of Versailles.

### Modernism and the Bauhaus
Twentieth-century Modernism rejected ornament as dishonest. The Bauhaus school, founded in Weimar in 1919 by Walter Gropius, unified craft, art, and industry under the slogan form follows function. Le Corbusier (1887 to 1965) proposed the house as a machine for living in, raising buildings on pilotis to free the ground plane; his Villa Savoye of 1931 is the prototype. Mies van der Rohe's glass-and-steel Seagram Building set the template for the postwar corporate skyscraper.

### Brutalism and Sustainable Architecture
Brutalism, from the French beton brut for raw concrete, emerged in the 1950s and 1960s. Le Corbusier's Unite d'Habitation in Marseille, with its exposed concrete and rooftop terrace, set the tone. Brutalist buildings like the Barbican in London divide opinion sharply, loved for their sculptural mass and hated for their coldness. Sustainable architecture, the dominant concern of the twenty-first century, responds to climate breakdown with passive solar design, green roofs, cross-laminated timber, and net-zero energy targets.

### Why It Matters
Every building is also a cultural artifact, and the styles of architecture are the visible record of what each era valued: the order of Greece, the aspiration of Gothic, the rationality of Modernism, the ecological responsibility of today. We spend ninety percent of our lives inside buildings, and their proportions, light, and materials shape our mood every day. To read architecture is to read history laid out in stone, steel, and glass.`,
  },

  // ----------------------------------------------------------------
  // 10. MUSIC THEORY AND HARMONY
  // ----------------------------------------------------------------
  {
    id: 'music-theory-harmony',
    patterns: [/\b(music theory|scales and intervals|chord progressions|counterpoint|sonata form|diatonic harmony|major scale|minor scale|musical form|key signature|time signature|melody and rhythm)\b/i],
    keywords: ['music theory', 'scales', 'intervals', 'chord progressions', 'counterpoint', 'sonata form', 'diatonic', 'major scale', 'minor scale', 'musical form', 'key signature', 'time signature'],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `Music theory is the grammar of organized sound. It describes how pitches combine into scales, how scales generate chords, how chords progress through time, and how rhythm and meter organize that progression. The vocabulary was codified in Europe between 1600 and 1900, but its concepts, tension and release, consonance and dissonance, hierarchy of keys, apply with variation to jazz, film music, and most popular song.

### Notes, Scales, and Intervals
A note is a pitched sound with a measurable frequency; the A above middle C vibrates at 440 Hz. The octave, the most fundamental interval, is the distance between a note and its double in frequency, and listeners across cultures hear octave-related pitches as somehow the same. The Western chromatic scale divides the octave into twelve equal semitones. Diatonic scales pick seven of those twelve to form a major or minor scale, with a pattern of whole and half steps that gives each its characteristic brightness or darkness. An interval is the distance between any two notes: a third, a fifth, an octave.

### Keys and Chords
A key is the tonal center around which a piece is organized, named for its tonic note and mode (C major, A minor). Chords are stacked thirds built on scale degrees: a triad has three notes (root, third, fifth), a seventh chord adds a fourth. The most important chords in any key are the tonic (I, home), the dominant (V, tension), and the subdominant (IV, departure). The cadence from V to I is the most powerful resolution in Western music.

### Chord Progressions and Roman Numerals
Theory labels chords with Roman numerals indicating their scale degree and quality: capital for major, lowercase for minor. The progression I to IV to V to I is the backbone of folk, blues, and rock. The I to V to vi to IV progression (in C: C, G, Am, F) underlies countless pop hits. Jazz harmony extends this with secondary dominants, tritone substitutions, and extended chords (ninths, elevenths, thirteenths) that add color and ambiguity.

### Rhythm, Meter, and Melody
Rhythm is the patterning of sound in time. Meter groups beats into recurring patterns, marked by time signatures: 4/4 has four quarter-note beats per bar, 3/4 has three (the waltz), 6/8 has six grouped in two. Syncopation places emphasis where it is not expected, the lifeblood of jazz, funk, and Latin music. Melody is a sequence of pitches organized rhythmically into a musical line; a strong melody usually balances stepwise motion with occasional leaps, and resolves convincingly to the tonic.

### Counterpoint and Musical Form
Counterpoint is the art of combining two or more independent melodic lines, perfected by Johann Sebastian Bach in his fugues. Each line must be melodic on its own, yet the combination must produce acceptable harmony. Musical form organizes an entire piece. The sonata form, the dominant structural plan of the Classical era, has three sections: an exposition that presents two contrasting themes, a development that fragments and recombines them, and a recapitulation that restates them in the home key. Symphonies, sonatas, and string quartets from Haydn through Mahler use this form.

### Why It Matters
Music theory is the shared language through which musicians communicate, composers structure their ideas, and listeners understand what they hear. The same principles that govern a Bach fugue govern a Beatles song, a film score, or a video game soundtrack, because human hearing has not changed. To learn theory is to learn how music creates expectation and then satisfies or frustrates it, which is the essence of why music moves us.`,
  },

  // ----------------------------------------------------------------
  // 11. CLASSICAL MUSIC COMPOSERS BY PERIOD
  // ----------------------------------------------------------------
  {
    id: 'classical-music-composers',
    patterns: [/\b(handel|vivaldi|haydn|chopin|tchaikovsky|brahms|stravinsky|debussy|romantic period music|romantic composers|20th century classical|classical music periods|baroque composers)\b/i],
    keywords: ['handel', 'vivaldi', 'haydn', 'chopin', 'tchaikovsky', 'brahms', 'stravinsky', 'debussy', 'romantic period', '20th century classical', 'classical music periods'],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `Western classical music is conventionally divided into four major periods, each with its own aesthetic, instrumentation, and roster of canonical composers. The Baroque (1600 to 1750) prized counterpoint and ornament; the Classical (1750 to 1820) prized clarity and form; the Romantic (1820 to 1900) prized emotion and individual voice; and the twentieth century prized rupture and reinvention. Bach, Mozart, and Beethoven anchor the first three periods, but the figures around them defined the texture of each era.

### Baroque: Handel and Vivaldi
George Frideric Handel (1685 to 1759), German-born and naturalized British, composed Italian opera in London before turning to the English oratorio, a form he essentially invented. *Messiah* of 1741, with its Hallelujah Chorus, remains the most performed choral work in the English-speaking world. Antonio Vivaldi (1678 to 1741), the Red Priest of Venice, wrote some five hundred concertos, of which *The Four Seasons* of 1725 is the best known. Vivaldi's fast-slow-fast three-movement concerto shape became the template for the Classical concerto. Both composers, alongside Bach, defined the tonal and contrapuntal language of the high Baroque.

### Classical: Haydn and the Era of Form
Joseph Haydn (1732 to 1809), called the father of the symphony and the father of the string quartet, wrote 104 symphonies and 68 quartets across a long career at the Esterhazy court. With Mozart, he shaped the Classical style: balanced phrases, clear cadences, and the sonata form that organizes serious instrumental music from 1750 onward. The symphony orchestra itself, with its strings-plus-winds layout, crystallized under Haydn. Wolfgang Amadeus Mozart, his younger contemporary, perfected the concerto, opera, and quartet before dying at thirty-five.

### Romantic: Chopin, Tchaikovsky, Brahms
The Romantic era expanded the orchestra, lengthened the symphony, and made the composer a heroic individual. Frederic Chopin (1810 to 1849), a Polish emigre in Paris, wrote almost exclusively for the piano: nocturnes, ballades, etudes, and polonaises that pushed the instrument's expressive range. Pyotr Ilyich Tchaikovsky (1840 to 1893) brought Russian melody and orchestral color to the symphony, the ballet (*Swan Lake*, *The Nutcracker*), and the concerto; his 1812 Overture includes actual cannon fire. Johannes Brahms (1833 to 1897), the great conservative of the late Romantic, carried the classical forms of Haydn and Beethoven into an era of harmonic richness, with four symphonies, two piano concertos, and the *German Requiem*.

### Twentieth Century: Stravinsky and Debussy
The twentieth century shattered the shared tonal language that had held for two hundred and fifty years. Claude Debussy (1862 to 1918), associated with Impressionism in music, used whole-tone and pentatonic scales to dissolve traditional harmony; *La Mer* and *Prelude to the Afternoon of a Faun* sound like no music before them. Igor Stravinsky (1882 to 1971) reinvented himself three times: the primitivist Russian ballets (*The Firebird*, *Petrushka*, *The Rite of Spring*, whose 1913 premiere caused a riot), the neoclassical works of the 1920s, and the serial works of the 1950s. The *Rite of Spring* alone rewrote the possibilities of rhythm and orchestral color.

### Why It Matters
The four-period framework is a simplification, but it captures a real evolution of musical language, instrumentation, and social role. The Baroque composer served church or court; the Classical composer served an emerging public concert; the Romantic composer served his own inner voice; the twentieth-century composer served a fragmented modernism. Listening across these periods, one hears the same twelve notes being organized in radically different ways. Understanding who wrote what, and when, turns the concert hall from a museum into a conversation across three centuries.`,
  },

  // ----------------------------------------------------------------
  // 12. THEATER AND DRAMA GENRES
  // ----------------------------------------------------------------
  {
    id: 'theater-drama-genres',
    patterns: [/\b(greek tragedy|greek comedy|shakespearean tragedy|ibsen|chekhov|realism theater|absurdism|beckett|ionesco|musical theater|stanislavski|method acting|theater genres|drama genres)\b/i],
    keywords: ['greek tragedy', 'greek comedy', 'shakespearean tragedy', 'ibsen', 'chekhov', 'realism', 'absurdism', 'beckett', 'ionesco', 'musical theater', 'stanislavski', 'method acting'],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `Theater is the art of live human action before an audience, and its genres are as old as the Western tradition itself. From the open-air stone theaters of fifth-century Athens to the proscenium stages of nineteenth-century Europe and the black-box studios of today, each era has reshaped what a play can do. The major genres, tragedy, comedy, realism, absurdism, and the musical, are different theories of how human life should be represented on a stage.

### Greek Tragedy and Comedy
Western theater begins in Athens in the fifth century BCE, where plays were performed at the festivals of Dionysus. Tragedy, as written by Aeschylus, Sophocles, and Euripides, presented elevated figures brought low by hubris and fate, with a chorus commenting on the action. Sophocles' *Oedipus Rex* remains the most analyzed plot in the Western tradition, and Aristotle's *Poetics* used it to define the form. Greek comedy, led by Aristophanes, was political and bawdy; *Lysistrata* has women withholding sex to end a war.

### Shakespearean Tragedy and Comedy
William Shakespeare (1564 to 1616) wrote roughly thirty-eight plays for the London public stage, in a fluid mix of verse and prose. His tragedies (*Hamlet*, *King Lear*, *Macbeth*, *Othello*) take Greek concern with fate and turn it inward, toward character flaw and psychological collapse. His comedies (*A Midsummer Night's Dream*, *Twelfth Night*) end in marriage and feature disguise and wordplay. His late romances (*The Tempest*, *The Winter's Tale*) blend tragedy and comedy into something stranger.

### Realism: Ibsen and Chekhov
Modern drama begins in the late nineteenth century with Henrik Ibsen (1828 to 1906) and Anton Chekhov (1860 to 1904). Ibsen, Norwegian, brought contemporary middle-class life and its hypocrisies onto the stage in *A Doll's House* and *Hedda Gabler*, scandalizing audiences with their frank treatment of marriage and women's autonomy. Chekhov, Russian, wrote *The Seagull*, *Uncle Vanya*, and *The Cherry Orchard* in a new key: the drama is in what is not said, in the long pause, in lives that fail to change.

### Absurdism: Beckett and Ionesco
Theater of the Absurd emerged after the Second World War, shaped by existentialist philosophy and the experience of meaninglessness. Samuel Beckett's *Waiting for Godot* (1953) has two men wait on a country road for someone who never arrives; the play strips plot to its skeleton and finds comedy in the void. Eugene Ionesco's *The Bald Soprano* and *Rhinoceros* turn language into nonsense and conformity into nightmare.

### Musical Theater
The musical, the great American contribution to theater, integrates song, dance, and spoken dialogue. It evolved from operetta and vaudeville through the integrated book musicals of Rodgers and Hammerstein (*Oklahoma!* of 1943, *South Pacific*) to the sung-through works of Stephen Sondheim and Andrew Lloyd Webber. The musical's central innovation is that song carries the plot forward rather than interrupting it.

### Acting Methods: Stanislavski and the Method
Konstantin Stanislavski (1863 to 1938), Russian actor and director, developed a system that asked actors to find interior truth rather than declaim, using given motive, objective, and the magic if. His principles traveled to America through Lee Strasberg's Actors Studio and became the Method, associated with Marlon Brando and Robert De Niro, transforming both stage and film acting.

### Why It Matters
Theater is the only art form whose medium is a living human being, and that liveness gives it unique power. The genres that evolved from Greek tragedy to absurdism are experiments in how truth can be staged: through fate, character, everyday conversation, or silence. Film and television borrowed their dramatic structures and acting methods from the stage.`,
  },

  // ----------------------------------------------------------------
  // 13. FILM AND CINEMA TECHNIQUES
  // ----------------------------------------------------------------
  {
    id: 'film-cinema-techniques',
    patterns: [/\b(shot types|close-up|wide shot|establishing shot|film editing|montage|mise-en-scene|sound design|film noir|western film|documentary film|auteur theory|film techniques|cinema techniques)\b/i],
    keywords: ['shot types', 'close-up', 'wide shot', 'establishing shot', 'film editing', 'montage', 'mise-en-scene', 'sound design', 'film noir', 'western', 'documentary', 'auteur theory'],
    intent: 'factual_question',
    topic: 'arts',
    response: () => `Cinema is the art of the moving image, and its techniques, shot, cut, frame, sound, and genre, are the grammar a director uses to tell a story. Film is built from fragments: separate shots edited to construct a continuous reality that never existed. Understanding the vocabulary is the difference between watching and reading a movie.

### Shot Types and the Frame
The shot is the basic unit of film, the length exposed between two cuts, classified by its relationship to the human figure. The extreme long shot or establishing shot places figures in a landscape to orient the audience at the start of a scene. The wide shot shows the full body, the medium shot from the waist up, the close-up isolates the face, and the extreme close-up focuses on an eye or hand. Each scale carries an implied emotional distance; the close-up is the cinema's unique access to the human face.

### Mise-en-Scene
Mise-en-scene, French for placing on stage, means everything inside the frame: set design, lighting, costume, blocking, color, and composition. A director's mise-en-scene is the visual signature of the film. Kubrick's symmetrical one-point perspectives, Anderson's flat frontal tableaux, and Wong Kar-wai's saturated neon interiors are recognizable from a single frame. Where editing controls time, mise-en-scene controls space.

### Editing and Montage
Editing is what makes film film. The cut joins two shots, and the join itself produces meaning: in Lev Kuleshov's famous 1920s experiment, the same shot of an actor's face read as hunger when paired with a bowl of soup, as grief when paired with a dead child, and as desire when paired with a woman. The Kuleshov effect is the foundation of film grammar. Soviet montage theory, developed by Sergei Eisenstein, argued that the collision of two shots produces a third idea; his *Battleship Potemkin* (1925) is the canonical demonstration. Classical Hollywood continuity editing hides the cut to maintain invisible flow.

### Sound Design
Sound arrived with *The Jazz Singer* in 1927 and transformed film. Three layers carry it: dialogue, music, and effects. Sound design is the art of building these layers, and Walter Murch's work on *Apocalypse Now* (1979) is often credited with naming the discipline. Silence, used deliberately, is one of its most powerful tools.

### Film Genres
Film genres are templates of subject and iconography. The western, from *Stagecoach* (1939) to *Unforgiven* (1992), explores the founding myth of the American frontier. Film noir, the cynical black-and-white crime dramas of 1940s and 1950s Hollywood, used high-contrast lighting and morally compromised protagonists to capture postwar anxiety. Documentary film, from Flaherty's *Nanook of the North* (1922) to modern direct cinema, claims to represent reality even as it must choose its cuts.

### Auteur Theory and Film History
Auteur theory, advanced by French critics of the 1950s *Cahiers du Cinema* and codified by Andrew Sarris, argues that the director is the primary author of a film, the figure whose themes and style unify a body of work. The theory elevated Hitchcock, Ford, Hawks, and Welles from studio craftsmen to artists. Film history is usually divided into the silent era (1895 to 1927), classical Hollywood (1930s to 1960s), the new waves of the 1960s, and the contemporary global era.

### Why It Matters
Film is the dominant narrative art form of the last century, and its techniques have been absorbed into television, advertising, music videos, and social media. Every TikTok is a tiny film, with shot types, cuts, and sound design. Knowing the vocabulary gives a viewer access to the decisions behind every image, and lets us see how meaning is built from fragments of time.`,
  },
]
