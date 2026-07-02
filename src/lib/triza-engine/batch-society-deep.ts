/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — SOCIETY DEEP (Batch 7-h)
 * ============================================================
 *
 *  Deeper subtopic entries for the society domain. These go
 *  one level below the foundational batch-society.ts entries:
 *  comparative government, electoral systems, ideologies,
 *  constitutional design, comparative law, stratification,
 *  gender and feminist theory, race and ethnicity, pedagogy,
 *  media and journalism, social movements, cultural
 *  globalisation, and demography/migration.
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries on specific
 *  subtopic tokens so TRIZA can match deeper questions
 *  without overlapping the broad batch-society.ts entries.
 *
 *  Entries describing "theocracy" or "religious law" are
 *  framed strictly as POLITICAL / LEGAL SYSTEMS (historical
 *  and comparative description), not as doctrine to believe.
 *
 *  NO external LLM API is used. These are facts TRIZA has
 *  "learned" and will express in its own voice via the
 *  self-expression + narration engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const SOCIETY_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. GOVERNMENT SYSTEMS AND REGIME TYPES
  // ----------------------------------------------------------------
  {
    id: 'government-systems-types',
    patterns: [/\b(monarchy|constitutional monarchy|absolute monarchy|republic|oligarchy|dictatorship|authoritarianism|totalitarianism|theocracy|hybrid regime|regime type)\b/i],
    keywords: ['monarchy', 'constitutional monarchy', 'absolute monarchy', 'republic', 'oligarchy', 'dictatorship', 'authoritarianism', 'totalitarianism', 'theocracy', 'hybrid regime'],
    intent: 'factual_question',
    topic: 'society',
    response: () => `A system of government is the formal structure by which a state distributes authority, makes laws, and enforces them. Political scientists classify these systems by where sovereignty lies and how leaders gain power, with most modern states falling somewhere on a spectrum from open democracy to closed autocracy.

### Democracy and Republics
Democracy places sovereign power in the people, who exercise it either directly or through elected representatives. Direct democracy, practised in ancient Athens and today in Swiss cantonal referendums, lets citizens vote on policies themselves. Representative democracy, the dominant modern form, delegates that work to elected legislators. A republic is a related but distinct idea: a state without a hereditary monarch where authority derives from the people. The United States, France, and India are republics; the United Kingdom and Japan are constitutional monarchies that operate democratically.

### Monarchy
Monarchy concentrates authority in a single hereditary ruler. In constitutional monarchies, like the United Kingdom, Spain, or Thailand, the monarch's role is largely ceremonial and lawmaking rests with an elected parliament. In absolute monarchies, like Saudi Arabia and Brunei, the sovereign holds substantive executive power and the throne is not constrained by a written constitution. Most surviving monarchies have evolved toward constitutional forms, retaining the crown as a unifying symbol while democratic institutions handle day-to-day governance.

### Oligarchy, Dictatorship, and Totalitarianism
Oligarchy vests power in a small elite — a party, a military junta, a wealthy class, or a clerical body. Dictatorship concentrates executive authority in a single leader who governs without meaningful electoral accountability. Authoritarian regimes permit some private autonomy but tightly restrict political competition; totalitarian regimes, like Stalin's Soviet Union or Nazi Germany, go further by seeking to control not only politics but also culture, economy, and private belief through mass party organisation and pervasive propaganda. The line between authoritarian and totalitarian is one of ambition and reach rather than kind.

### Theocracy and Hybrid Regimes
A theocracy is a political system where governmental authority is formally vested in clerical officials or justified by appeal to divine law. Iran's Guardian Council and Vatican City are contemporary examples; historical cases include Calvin's Geneva and the Papal States. Theocracy is best understood as a structural arrangement about the source of political legitimacy, separate from any specific doctrinal content. Hybrid regimes mix democratic procedures with autocratic control — they hold elections but manipulate media, courts, or candidate eligibility to entrench incumbents, as observers describe systems in modern Russia, Hungary, and Venezuela.

### Why It Matters
The choice of governing system shapes every other political outcome: whose voices count, how peacefully power transfers, whether dissent is criminalised, how minorities are protected, and whether markets flourish. Studying these systems comparatively reveals that no single blueprint guarantees liberty or prosperity — institutions matter more than labels, and even formal democracies can erode when courts, electoral commissions, and press freedoms weaken.`,
  },

  // ----------------------------------------------------------------
  // 2. ELECTORAL SYSTEMS AND VOTING MECHANICS
  // ----------------------------------------------------------------
  {
    id: 'electoral-systems-voting',
    patterns: [/\b(first past the post|first-past-the-post|fptp|proportional representation|ranked choice|ranked-choice voting|rcv|two-round system|electoral college|gerrymandering|voter suppression|compulsory voting)\b/i],
    keywords: ['first past the post', 'proportional representation', 'ranked choice voting', 'rcv', 'two-round system', 'electoral college', 'gerrymandering', 'voter suppression', 'compulsory voting'],
    intent: 'factual_question',
    topic: 'society',
    response: () => `Electoral systems are the rules that translate votes into seats. They seem technical, but small choices about how ballots are counted reshape party systems, representation of minorities, and the incentives facing politicians. Political scientists often quote Maurice Duverger's observation that plurality rules tend to produce two-party systems while proportional rules tend to produce multiparty systems.

### First-Past-The-Post and Proportional Representation
In first-past-the-post (FPTP), used in the United States, United Kingdom, and India, each district elects a single member with the most votes, regardless of whether that is a majority. FPTP is simple and ties representatives to geographic districts, but it can produce parliaments where the largest party won only a plurality of votes, and it routinely sidelines third parties whose support is broad but thinly spread. Proportional representation (PR), used in the Netherlands, South Africa, and much of Latin America, allocates seats in proportion to each party's vote share, so a party with fifteen percent of votes wins roughly fifteen percent of seats. PR improves representational fairness at the cost of weaker local accountability and frequent coalition governments.

### Ranked-Choice and Two-Round Systems
Ranked-choice voting (RCV), also called instant-runoff, asks voters to rank candidates in order of preference. If no candidate wins a majority of first choices, the lowest-ranked candidate is eliminated and their ballots are redistributed to voters' second choices, repeating until someone crosses fifty percent. RCV reduces vote-splitting and discourages negative campaigning. The two-round system used in French presidential elections runs a first round and, if no one wins a majority, a runoff between the top two candidates weeks later.

### Gerrymandering and the Electoral College
Gerrymandering is the deliberate drawing of electoral district boundaries to favour one party or group. The term dates to an 1812 Massachusetts map signed by Governor Elbridge Gerry that produced a salamander-shaped district. Modern gerrymandering uses voter data to pack opposition supporters into a few districts or crack them across many, diluting their influence. The Electoral College in the United States assigns each state electors equal to its congressional delegation, and except in Maine and Nebraska the statewide winner takes all electors — meaning a candidate can win the presidency while losing the national popular vote, as happened in 1876, 2000, and 2016.

### Voter Suppression and Compulsory Voting
Voter suppression includes any measure that makes voting harder — strict ID laws, polling-place closures, purges of voter rolls, or curtailed early voting. Compulsory voting, practised in Australia, Belgium, and Brazil, takes the opposite approach: turnout is mandatory and abstention incurs a small fine. Compulsory voting typically produces turnout above ninety percent and shifts campaign strategy away from mobilisation toward persuasion.

### Why It Matters
Electoral rules are not neutral plumbing. They decide whether governments reflect the will of majorities or pluralities, whether minority voices enter legislatures, whether votes feel wasted, and whether citizens trust that elections are fair. Reform debates about gerrymandering, ranked-choice voting, and voter access are debates about who counts as a political equal and how that equality is expressed at the ballot box.`,
  },

  // ----------------------------------------------------------------
  // 3. POLITICAL IDEOLOGIES
  // ----------------------------------------------------------------
  {
    id: 'political-ideologies',
    patterns: [/\b(liberalism|conservatism|socialism|communism|fascism|libertarianism|anarchism|nationalism|environmentalism|political ideology|political ideologies)\b/i],
    keywords: ['liberalism', 'conservatism', 'socialism', 'communism', 'fascism', 'libertarianism', 'anarchism', 'nationalism', 'environmentalism', 'political ideology'],
    intent: 'factual_question',
    topic: 'society',
    response: () => `A political ideology is a coherent set of ideas about the proper role of government, the organisation of the economy, and the rights and duties of citizens. Ideologies function as maps: they simplify complex political reality into a set of principles voters and leaders use to evaluate policies. They are not static — each major ideology contains internal factions and has evolved substantially over the past two centuries.

### Liberalism and Conservatism
Liberalism, in its classical nineteenth-century form, emphasised individual liberty, limited government, free markets, and tolerance — John Locke, Adam Smith, and John Stuart Mill are its foundational thinkers. Modern or social liberalism, associated with the post-war welfare state, accepts government intervention to protect citizens from poverty and discrimination while preserving civil liberties. Conservatism, articulated by Edmund Burke, values tradition, social continuity, and incremental reform over revolutionary change. Modern conservatives variously defend free markets, socially traditional norms, and strong national defence, though factions disagree about how active the state should be in enforcing those norms.

### Socialism and Communism
Socialism argues that the means of production should be socially owned or regulated so that wealth is distributed more equally and workers control their labour. Democratic socialists, as in much of post-war Western Europe, pursue these aims through parliamentary welfare states and mixed economies. Communism, as theorised by Marx and Engels and later implemented in the Soviet Union and Maoist China, calls for revolutionary overthrow of capitalism and the eventual withering of the state into a classless society. Twentieth-century communist regimes became one-party states with centralised planning, and the historical record of those regimes heavily shapes modern debates about socialism.

### Fascism, Libertarianism, and Anarchism
Fascism, which rose in interwar Italy and Germany, elevates nation and race above the individual, glorifies violence and militarism, and fuses authoritarian government with corporatist economics. Libertarianism prioritises individual liberty and treats taxation and most regulation as coercive; its theorists, from Robert Nozick to Murray Rothbard, defend minimal or even non-existent states. Anarchism goes further, arguing that all coercive hierarchy — including the state — is unjustified and that voluntary cooperation can organise society.

### Nationalism, Environmentalism, and Feminism
Nationalism holds that the nation — usually defined by shared language, culture, or ethnicity — should be the primary unit of political loyalty, and that each nation deserves its own state. It can be a unifying force in anti-colonial movements or a destructive one when it becomes exclusionary. Environmentalism emerged as a political ideology in the 1970s, arguing that ecological limits require restructuring economics and politics around sustainability. Feminism, treated as a political ideology as well as a movement, holds that political, economic, and social arrangements systematically disadvantage women and that these arrangements should be reformed — its different waves and schools are covered in the gender-roles entry.

### Why It Matters
Ideologies frame how people interpret news, choose candidates, and judge policies. Two citizens can observe the same economic data and reach opposite conclusions because they apply different ideological lenses. Understanding ideology helps decode political rhetoric, recognise which assumptions are being smuggled into an argument, and see the genealogy of today's debates — from Locke's property rights to Marx's critique of capital to contemporary disputes about climate policy and identity.`,
  },

  // ----------------------------------------------------------------
  // 4. CONSTITUTIONS, SEPARATION OF POWERS, AND HUMAN RIGHTS
  // ----------------------------------------------------------------
  {
    id: 'constitutions-human-rights',
    patterns: [/\b(separation of powers|checks and balances|judicial review|bill of rights|constitutionalism|universal declaration of human rights|udhr|montesquieu|marbury v madison)\b/i],
    keywords: ['separation of powers', 'checks and balances', 'judicial review', 'bill of rights', 'constitutionalism', 'universal declaration of human rights', 'udhr', 'montesquieu', 'marbury v madison'],
    intent: 'factual_question',
    topic: 'society',
    response: () => `A constitution is the supreme law that establishes a state's institutions, distributes authority among them, and sets limits on what those institutions may do. Constitutionalism is the broader principle that government itself must be governed by law — that even the most powerful officials are bound by rules they cannot rewrite at will. Where a constitution exists but constitutionalism does not, the document is largely decorative.

### Separation of Powers
The separation of powers, articulated by Montesquieu in The Spirit of the Laws (1748), divides governmental authority among legislative, executive, and judicial branches so that no single body can dominate. The legislature makes laws, the executive enforces them, and the judiciary interprets them. The United States Constitution embodies a strict separation with three co-equal branches. Parliamentary systems like the United Kingdom fuse executive and legislative authority — the prime minister and cabinet sit in Parliament — but the judiciary remains independent.

### Checks and Balances
Closely related is the doctrine of checks and balances: each branch is given tools to resist encroachment by the others. The U.S. president can veto congressional legislation; Congress can override that veto with a two-thirds vote, impeach the president, and confirm or reject appointments; the Supreme Court can strike down unconstitutional laws. The goal is not efficiency but the prevention of tyranny. Critics argue that excessive checks produce gridlock, while defenders counter that slow, blocked legislation is preferable to fast, sweeping error.

### Bill of Rights and the UDHR
A bill of rights enumerates fundamental liberties the state cannot infringe. The first ten amendments to the U.S. Constitution, the French Declaration of the Rights of Man and of the Citizen (1789), and the Canadian Charter of Rights and Freedoms (1982) are classic examples. Internationally, the Universal Declaration of Human Rights (UDHR), adopted by the United Nations General Assembly in 1948 in response to the atrocities of the Second World War, articulates thirty articles covering civil, political, economic, social, and cultural rights. Although not a treaty, the UDHR underpins binding covenants on civil and political rights and on economic, social, and cultural rights, and it has influenced more than eighty national constitutions.

### Judicial Review
Judicial review is the power of courts to invalidate laws and executive actions that conflict with the constitution. The U.S. Supreme Court claimed this power in Marbury v. Madison (1803); in Germany the Federal Constitutional Court exercises it; in the United Kingdom, which has no codified constitution, courts can review secondary legislation against the Human Rights Act but not primary legislation itself. Judicial review is the enforcement mechanism that makes a constitution real rather than aspirational, but it also places unelected judges in a position to overrule democratic majorities, raising enduring questions about the proper scope of judicial power.

### Why It Matters
Constitutions are the operating systems of states. They determine whether leaders can be removed peacefully, whether minorities have legal recourse, whether rights survive political panic, and whether the rules of political competition hold when losing becomes costly. The health of a constitutional order is measured less by its text than by whether officials, courts, and citizens actually enforce it.`,
  },

  // ----------------------------------------------------------------
  // 5. LEGAL SYSTEMS: COMMON, CIVIL, AND COMPARATIVE LAW
  // ----------------------------------------------------------------
  {
    id: 'legal-systems-common-civil',
    patterns: [/\b(common law|civil law system|precedent|case law|religious law|customary law|international law|criminal law|civil law|stare decisis|napoleonic code|corpus juris civilis)\b/i],
    keywords: ['common law', 'civil law system', 'precedent', 'case law', 'religious law', 'customary law', 'international law', 'criminal law', 'civil law', 'stare decisis', 'napoleonic code', 'corpus juris civilis'],
    intent: 'factual_question',
    topic: 'society',
    response: () => `A legal system is the body of rules, institutions, and procedures by which a society governs itself and resolves disputes. Comparative scholars usually classify the world's systems into a few major families, each with distinctive sources of law, roles for judges, and approaches to precedent. Understanding these families clarifies why a contract dispute in Paris unfolds differently from one in London or New Delhi.

### Common Law
Common law originated in medieval England and spread through the British Empire to the United States, Canada, Australia, India, and many African nations. Its defining feature is precedent: courts are bound by decisions of higher courts in similar cases, a doctrine known as stare decisis. Judges play an active role in developing the law through written opinions that future courts must follow. Statutes enacted by legislatures modify and supplement the common law, but the case-by-case accumulation of judicial decisions remains the system's backbone. Common law tends to be flexible, pragmatic, and adversarial.

### Civil Law
Civil law, descended from Roman law and codified in Justinian's Corpus Juris Civilis, was reshaped by the Napoleonic Code of 1804 and the German Civil Code of 1900. It is the dominant system in continental Europe, Latin America, parts of Asia, and most of Africa. Civil law relies on comprehensive written codes that aim to anticipate every legal question; judges apply the code to facts rather than create binding precedent. Court decisions are typically shorter, less discursive, and not formally binding on later courts, though in practice higher-court decisions carry weight. Civil law tends toward systematic coherence and a more inquisitorial role for judges.

### Religious and Customary Law
Religious law systems derive legal rules from religious texts and traditions; the principal historical examples are Islamic jurisprudence, canon law in medieval Europe, and Hindu legal traditions. In some contemporary states, religious courts have jurisdiction over family and personal-status matters — marriage, divorce, inheritance — while secular courts handle commercial and criminal cases. As a descriptive matter, these systems function as historical and legal frameworks with their own schools of interpretation, judges, and procedures. Customary law, found in many African and indigenous communities, consists of unwritten practices that have regulated land, marriage, and dispute resolution for generations; modern states often recognise it alongside formal codes for specified matters.

### International Law
International law governs relations among states and international organisations. Its sources include treaties, customary practice accepted as law, and the writings of eminent jurists. The International Court of Justice, the International Criminal Court, and the WTO dispute settlement body are key institutions. Unlike domestic law, international law lacks a global police force, so enforcement depends on state consent, sanctions, and reputational costs.

### Criminal and Civil Law
Within any system, criminal law addresses conduct the state punishes — murder, theft, fraud — with prosecutions brought by the state and penalties including imprisonment. Civil law, in this narrower sense, governs disputes between private parties — contracts, torts, property, family — and remedies are usually monetary damages or injunctions rather than punishment.

### Why It Matters
The choice of legal system shapes how businesses plan transactions, how citizens seek redress, and how quickly law adapts to new technologies. Comparative legal literacy helps lawyers, policymakers, and ordinary people navigate an interconnected world where a single transaction may implicate four jurisdictions and three legal traditions.`,
  },

  // ----------------------------------------------------------------
  // 6. SOCIAL STRATIFICATION AND CLASS
  // ----------------------------------------------------------------
  {
    id: 'social-stratification-class',
    patterns: [/\b(social stratification|social class|caste system|social mobility|meritocracy|socioeconomic status|cultural capital|gini coefficient|bourdieu)\b/i],
    keywords: ['social stratification', 'social class', 'caste system', 'social mobility', 'meritocracy', 'socioeconomic status', 'cultural capital', 'gini coefficient', 'bourdieu'],
    intent: 'factual_question',
    topic: 'society',
    response: () => `Social stratification is the way a society ranks groups of people into a hierarchy of access to resources, prestige, and power. Every complex society is stratified in some form; the question sociologists ask is how rigid the hierarchy is, what it is based on, and how it changes over time. Unlike simple inequality, stratification is structural — it persists across generations and shapes life chances in predictable ways.

### Social Class
Social class refers to groups whose members share similar economic positions — defined by occupation, income, wealth, and relationship to the means of production. Classical Marxian theory distinguished the bourgeoisie, who own capital, from the proletariat, who sell their labour. Modern sociologists often describe a four-fold scheme: an upper class of wealthy owners and executives, a middle class of professionals and managers, a working class of skilled and semi-skilled manual workers, and a lower class of precarious and irregularly employed people. Class shapes health, educational attainment, political participation, and even life expectancy.

### Caste Systems
Caste is an extreme form of stratification in which rank is hereditary, endogamous, and traditionally tied to occupation. The Indian caste system, formally abolished by the 1950 Constitution but persisting socially, sorted communities into broad varna categories with Dalit groups excluded entirely. Similar systems appear in other societies — for example, the Burakumin in Japan and historically rigid racial categories in the American South. Caste differs from class because caste membership is fixed at birth, while class theoretically permits mobility.

### Social Mobility and Meritocracy
Social mobility is the movement of individuals or families between social positions. Intergenerational mobility compares parents and children; intragenerational mobility compares an individual across their own lifetime. Mobility may be upward, downward, or horizontal. A society with high mobility is not necessarily equal — it can be unequal but fair if talent and effort determine outcomes. The ideology describing such an arrangement is meritocracy, a term coined by Michael Young in 1958 as a satirical warning; it has since become an aspirational ideal but also a target of critique on the grounds that it justifies inequality and ignores inherited advantage.

### Socioeconomic Status and Cultural Capital
Sociologists measure socioeconomic status (SES) using composite indicators of income, education, and occupational prestige. SES predicts outcomes from infant mortality to college completion. Pierre Bourdieu extended the analysis with the concept of cultural capital — the tastes, vocabulary, credentials, and informal knowledge that middle- and upper-class children absorb at home and that schools reward as natural intelligence. Cultural capital, Bourdieu argued, reproduces class across generations more effectively than money alone because it operates invisibly.

### The Gini Coefficient
The Gini coefficient summarises income or wealth inequality on a scale from zero (perfect equality) to one (one person has everything). Scandinavian countries sit around 0.25, the United States near 0.40, and the most unequal countries above 0.60. Trends in Gini coefficients over the past forty years show rising inequality in most advanced economies, driven by technological change, globalisation, and policy choices about taxation and labour.

### Why It Matters
Stratification is not a side effect of economic life — it is its central organising fact. It predicts who goes to college, who gets heart disease, who votes, who is imprisoned, and whose children repeat the pattern. Understanding its mechanisms is the first step toward deciding which forms of inequality a society should tolerate and which it should work to dismantle.`,
  },

  // ----------------------------------------------------------------
  // 7. GENDER ROLES AND WAVES OF FEMINISM
  // ----------------------------------------------------------------
  {
    id: 'gender-roles-feminism-waves',
    patterns: [/\b(gender roles|waves of feminism|first wave feminism|second wave feminism|third wave feminism|fourth wave feminism|patriarchy|gender wage gap|lgbtq rights|intersectionality)\b/i],
    keywords: ['gender roles', 'waves of feminism', 'first wave feminism', 'second wave feminism', 'third wave feminism', 'fourth wave feminism', 'patriarchy', 'gender wage gap', 'lgbtq rights', 'intersectionality'],
    intent: 'factual_question',
    topic: 'society',
    response: () => `Gender roles are the social expectations attached to being perceived as male or female — how one should dress, speak, work, and care for others. Although often presented as natural, these expectations vary widely across cultures and change over time. Sex refers to biological differences; gender refers to the social meanings layered onto those differences. Distinguishing the two lets sociologists ask which aspects of masculinity and femininity are socially constructed and therefore subject to revision.

### First Wave: Suffrage and Legal Personhood
The first wave of feminism, from the mid-nineteenth to early twentieth century, focused on legal equality. Activists in the United States and Britain — Susan B. Anthony, Elizabeth Cady Stanton, Emmeline Pankhurst — campaigned for women's suffrage, property rights, and access to higher education. New Zealand granted women the vote in 1893; the United States followed in 1920; Switzerland held out until 1971. The wave's achievements were substantial but largely benefited middle-class women in Western countries.

### Second Wave: Equality in Daily Life
The second wave, from the 1960s through the 1980s, expanded feminism beyond formal rights into the workplace, the home, and the body. Betty Friedan's The Feminine Mystique (1963) named the dissatisfaction of suburban housewives; Simone de Beauvoir's earlier The Second Sex provided theoretical foundations. Activists pushed for equal pay, access to professional schools, reproductive rights, and the criminalisation of marital rape and workplace harassment. The slogan "the personal is political" captured the insight that private arrangements of childcare and housework are political questions, not personal preferences.

### Third Wave: Intersectionality
The third wave, beginning in the early 1990s, rejected the assumption that there was a single universal female experience. Kimberlé Crenshaw's concept of intersectionality argued that race, class, sexuality, and gender interact to produce distinctive forms of disadvantage that cannot be addressed one axis at a time. Third-wave feminists embraced plurality, sex positivity, and the legitimacy of different choices — including the choice to engage with traditionally feminine aesthetics on one's own terms.

### Fourth Wave: Digital Activism
The fourth wave, emerging in the 2010s, is shaped by digital media. Hashtags like #MeToo, #TimesUp, and #NiUnaMenos have coordinated global conversations about sexual harassment, pay gaps, and femicide. Online platforms enable rapid mobilisation but also expose activists to harassment. Fourth-wave feminism is characterised by its transnational reach and its insistence on naming structural patterns rather than isolated incidents.

### Patriarchy, Wage Gap, and LGBTQ+ Rights
Patriarchy describes social systems in which men hold disproportionate power in political, economic, and cultural institutions. The gender wage gap — the difference between median male and female earnings — persists in nearly every country, narrowing in some places to a few percentage points and remaining above twenty percent in others, driven by occupational segregation, caregiving penalties, and discrimination. LGBTQ+ rights, while not identical to feminism, overlap with it in challenging rigid gender norms; legal recognition of same-sex marriage, anti-discrimination protections, and legal recognition of transgender people's identities are central contemporary issues.

### Why It Matters
Gender structures the most intimate moments of daily life as well as the largest patterns of labour and power. The waves of feminism show how a social movement evolves: each wave takes the previous one's gains as a baseline, critiques what was overlooked, and pushes the agenda further. Studying this history clarifies how change actually happens and which unfinished work remains.`,
  },

  // ----------------------------------------------------------------
  // 8. RACE, ETHNICITY, AND DISCRIMINATION
  // ----------------------------------------------------------------
  {
    id: 'race-ethnicity-discrimination',
    patterns: [/\b(race as social construct|ethnicity|systemic racism|structural racism|racial segregation|civil rights movement|affirmative action|microaggression|intersectionality|jim crow|apartheid)\b/i],
    keywords: ['race as social construct', 'ethnicity', 'systemic racism', 'structural racism', 'racial segregation', 'civil rights movement', 'affirmative action', 'microaggression', 'intersectionality', 'jim crow', 'apartheid'],
    intent: 'factual_question',
    topic: 'society',
    response: () => `Race is best understood as a social construct: a category of human variation that societies have invested with meaning, rather than a fixed biological fact. Geneticists have shown that there is more variation within any so-called racial group than between groups, and that the boundaries drawn between races differ across societies and eras. Ethnicity, by contrast, refers to shared cultural heritage — language, ancestry, customs — and is typically self-identified. The distinction matters because race organises power while ethnicity organises identity.

### Racism: Individual, Systemic, Structural
Racism operates at several levels. Individual racism is personal prejudice — slurs, avoidance, violence. Systemic racism refers to patterns embedded in institutions: policing practices that disproportionately stop minority citizens, school funding tied to local property values that reproduces segregation, hiring algorithms trained on biased data. Structural racism is the cumulative effect of these patterns across housing, education, employment, credit, and criminal justice, producing racial disparities in wealth, health, and mortality even when no single actor is overtly prejudiced.

### Segregation and the Civil Rights Movement
Racial segregation — the legal or de facto separation of groups in housing, schools, and public facilities — was official policy in the American South under Jim Crow laws, in South Africa under apartheid, and in many other societies. The U.S. civil rights movement of the 1950s and 1960s, led by figures such as Martin Luther King Jr., Rosa Parks, and John Lewis, used litigation, boycotts, marches, and civil disobedience to dismantle legal segregation. Landmark victories — Brown v. Board of Education (1954), the Civil Rights Act of 1964, the Voting Rights Act of 1965 — reshaped American law. Parallel movements against apartheid in South Africa, led by Nelson Mandela's African National Congress, achieved multiracial democracy in 1994.

### Affirmative Action
Affirmative action refers to policies that give preferential consideration to members of historically disadvantaged groups in education, employment, or contracting. The rationale is compensatory: that present inequalities reflect centuries of exclusion and that neutral policies will reproduce them. Critics argue that group-based preferences conflict with individual merit and may disadvantage members of non-targeted groups. The legal status of affirmative action varies by country and remains contested; the U.S. Supreme Court significantly narrowed race-conscious admissions in 2023.

### Microaggressions and Intersectionality
Microaggressions are subtle, often unintentional acts — being followed in a store, being told one speaks the language well, having one's name mispronounced repeatedly — that communicate lower status. Individually minor, their accumulation is associated with stress, depression, and reduced performance. The concept of intersectionality, developed by Kimberlé Crenshaw, emphasises that race, gender, class, and sexuality interact in ways that produce distinctive experiences of discrimination not captured by looking at any single category.

### Why It Matters
Race and ethnicity shape where people live, how they are treated by institutions, what wealth they inherit, and how long they live. Treating these categories as natural or neutral obscures the historical decisions that created them and the policy choices that sustain them. Studying discrimination as a structural phenomenon — rather than a matter of individual bad actors — clarifies why progress is uneven and why formal legal equality has not produced substantive equality in outcomes.`,
  },

  // ----------------------------------------------------------------
  // 9. EDUCATION SYSTEMS AND PEDAGOGY
  // ----------------------------------------------------------------
  {
    id: 'education-systems-pedagogy',
    patterns: [/\b(pedagogy|andragogy|progressive education|john dewey|montessori|standardized testing|standardised testing|education inequality|lifelong learning|formal education|informal education|non-formal education)\b/i],
    keywords: ['pedagogy', 'andragogy', 'progressive education', 'john dewey', 'montessori', 'standardized testing', 'standardised testing', 'education inequality', 'lifelong learning', 'formal education', 'informal education', 'non-formal education'],
    intent: 'factual_question',
    topic: 'society',
    response: () => `Education is the process by which a society transmits knowledge, skills, values, and norms across generations. Sociologists distinguish formal education (schools, colleges, universities with explicit curricula), informal education (unstructured learning from family and peers), and non-formal education (organised programmes outside the formal system, such as community literacy classes or vocational training). Most policy attention focuses on formal schooling, but informal and non-formal channels shape individuals as profoundly.

### Pedagogy and Andragogy
Pedagogy, derived from the Greek for "leading the child," is the theory and practice of teaching. Traditional pedagogy positions the teacher as the authority who dispenses knowledge to passive learners. Andragogy, articulated by Malcolm Knowles in the 1970s, describes adult learning specifically: adults are self-directed, draw on experience, want learning to be immediately applicable, and are motivated by internal rather than external factors. The distinction reshapes how adult education, professional development, and corporate training are designed.

### Progressive Education and Montessori
John Dewey, the leading American philosopher of progressive education, argued in books like Democracy and Education (1916) that schooling should cultivate critical thinking and democratic citizenship rather than rote memorisation. Dewey advocated for experiential learning, problem-solving, and connecting classroom work to students' lives. Maria Montessori developed a parallel approach in Italy: child-sized environments, self-chosen activities with structured materials, mixed-age classrooms, and respect for the child's natural curiosity. Montessori schools now operate worldwide. Both approaches sit within a broader progressive tradition that sees the learner as an active constructor of understanding.

### Standardised Testing
Standardised testing uses uniform assessments to compare students, schools, and systems. Advocates argue that objective measures expose inequalities and enforce accountability. Critics contend that tests narrow the curriculum to what is measured, encourage teaching to the test, and reflect socioeconomic background more than genuine ability. International comparisons like the OECD's PISA exam rank countries by student performance and shape education policy debates, but their methodology and assumptions remain contested.

### Education Inequality
Educational outcomes are strongly predicted by family background. Children from wealthier families enter school with larger vocabularies, more books at home, and greater access to enrichment activities; schools in wealthy neighbourhoods are better funded, offer more advanced courses, and attract more experienced teachers. The achievement gap between children of different socioeconomic backgrounds is visible before kindergarten and often widens over the school years. Reforms — from school finance equalisation to early childhood programmes to charter schools — attempt to close this gap with mixed results.

### Lifelong Learning
Lifelong learning extends education beyond childhood and adolescence into adulthood, recognising that rapid technological change makes skills obsolete quickly. Universities now offer continuing-education programmes, MOOCs (massive open online courses) reach millions of learners worldwide, and employers invest in reskilling workers displaced by automation. Lifelong learning reframes education from a finite stage of life to an ongoing practice of citizenship and economic adaptability.

### Why It Matters
Education systems reproduce a society's social structure and shape its future. They determine who becomes a doctor, a coder, or a citizen capable of evaluating political claims; they predict economic growth, public health, and democratic stability. Debates about pedagogy, testing, funding, and access are debates about what kind of society the next generation will inherit.`,
  },

  // ----------------------------------------------------------------
  // 10. MEDIA, JOURNALISM, AND ETHICS
  // ----------------------------------------------------------------
  {
    id: 'media-journalism-ethics',
    patterns: [/\b(journalistic ethics|press freedom|propaganda|disinformation|misinformation|media literacy|echo chamber|filter bubble|objectivity journalism|source protection|fake news)\b/i],
    keywords: ['journalistic ethics', 'press freedom', 'propaganda', 'disinformation', 'misinformation', 'media literacy', 'echo chamber', 'filter bubble', 'objectivity journalism', 'source protection', 'fake news'],
    intent: 'factual_question',
    topic: 'society',
    response: () => `The media are the channels through which information reaches mass audiences. Historians divide media into print (newspapers, magazines, books), broadcast (radio and television), and digital (websites, social platforms, podcasts). Each medium has its own economics, regulatory regime, and bias patterns, but all share the function of agenda-setting: deciding which stories audiences see, and therefore which issues they consider important.

### Journalistic Ethics
Professional journalism is governed by an ethical framework codified in codes like those of the Society of Professional Journalists. Core principles include seeking truth and reporting it accurately, minimising harm, acting independently of sources and political interests, and being accountable and transparent about methods. Objectivity — the ideal of reporting facts without personal bias — has been the dominant standard since the early twentieth century, though critics argue that pure objectivity is unattainable and that transparent disclosure of perspective is more honest. Source protection, including shield laws that allow journalists to refuse to name confidential sources, is essential for investigative reporting on powerful institutions.

### Press Freedom
Press freedom — the legal and political ability of journalists to report without government censorship or retaliation — is a cornerstone of liberal democracy. Organisations like Reporters Without Borders publish annual press freedom indices; the Committee to Protect Journalists tracks imprisonment and killings of reporters. The First Amendment to the U.S. Constitution protects the press from prior restraint, but many countries criminalise defamation or "fake news" in ways that chill reporting. The killing of journalists like Jamal Khashoggi and the imprisonment of reporters in many countries illustrate that press freedom remains fragile even where it is formally guaranteed.

### Propaganda, Misinformation, and Disinformation
Propaganda is the deliberate use of media to shape public opinion in service of a political cause, historically associated with wartime information campaigns and state propaganda ministries. Misinformation is false information shared without intent to deceive; disinformation is false information deliberately created and spread to deceive. The digital era has accelerated both: social platforms amplify emotionally charged content, algorithmic recommendation systems prioritise engagement over accuracy, and generative AI now produces convincing synthetic text, images, and audio at scale. Foreign interference operations in the 2016 U.S. and 2017 French elections demonstrated how disinformation campaigns can be waged across borders.

### Media Literacy and Echo Chambers
Media literacy is the skill of evaluating sources, distinguishing fact from opinion, recognising bias, and verifying claims before sharing them. Schools, libraries, and civil society organisations teach media literacy as a partial antidote to misinformation. Echo chambers describe situations in which individuals encounter only information that confirms their existing views, intensified by algorithmic personalisation that shows each user a different version of the news. Filter bubbles and echo chambers are associated with political polarisation and reduced capacity for constructive disagreement.

### Why It Matters
A society's information environment determines whether citizens can hold power accountable, make informed choices at the ballot box, and coordinate responses to crises from pandemics to climate change. The collapse of local newspapers, the rise of platform-mediated news, and the spread of synthetic media together constitute one of the most significant structural challenges facing contemporary democracies.`,
  },

  // ----------------------------------------------------------------
  // 11. SOCIAL MOVEMENTS AND ACTIVISM
  // ----------------------------------------------------------------
  {
    id: 'social-movements-activism',
    patterns: [/\b(civil disobedience|nonviolent resistance|nonviolent action|labour movement|labor movement|environmental activism|digital activism|collective action|social movement theory|gene sharp|satyagraha)\b/i],
    keywords: ['civil disobedience', 'nonviolent resistance', 'nonviolent action', 'labour movement', 'labor movement', 'environmental activism', 'digital activism', 'collective action', 'social movement theory', 'gene sharp', 'satyagraha'],
    intent: 'factual_question',
    topic: 'society',
    response: () => `A social movement is a sustained, organised effort by a large number of people to bring about or resist social change. Unlike a single protest or pressure group, a movement has collective identity, informal networks, and a shared diagnosis of what is wrong and what should be done. Sociologists study movements to understand how change happens outside formal politics.

### Civil Disobedience
Civil disobedience is the deliberate, public violation of a law that the violator regards as unjust, with a willingness to accept the legal consequences. Henry David Thoreau articulated the idea in his 1849 essay, refusing to pay taxes that would fund slavery and the Mexican-American War. Martin Luther King Jr. developed the practice into a strategy in the civil rights movement, explaining in his "Letter from Birmingham Jail" (1963) that one has a moral responsibility to break unjust laws openly and with regard for the broader community. Civil disobedience has been used by suffragists, anti-apartheid activists, environmentalists, and pro-democracy movements in Hong Kong.

### Nonviolent Resistance
Nonviolent resistance is the broader strategy of achieving political goals through protests, strikes, boycotts, sit-ins, and other forms of non-cooperation, without armed force. Mohandas Gandhi led the Indian independence movement using satyagraha — often translated as "truth-force" — a disciplined practice of nonviolence that included the 1930 Salt March. Gene Sharp's later scholarship catalogued 198 methods of nonviolent action and influenced movements from Serbia's Otpor to the Arab Spring. Research by Erica Chenoweth suggests that nonviolent campaigns are roughly twice as likely as armed ones to achieve their goals, partly because they attract broader participation and split elites from the regime.

### Labour, Environmental, and Digital Activism
The labour movement of the nineteenth and twentieth centuries organised workers into unions to bargain collectively for wages, hours, and safety; landmark wins include the eight-hour day, the weekend, and the abolition of child labour in industrialised countries. Environmental activism, from Rachel Carson's Silent Spring (1962) to the contemporary climate strikes led by young people, has produced clean air and water laws, endangered species protections, and international climate agreements. Digital activism uses social media, encrypted messaging, and online petitions to coordinate protest, document abuses, and raise funds; it lowers the cost of mobilisation but also makes movements easier for adversaries to monitor and disrupt.

### Social Movement Theory
Sociologists analyse movements through several lenses. Resource mobilisation theory emphasises that movements need organisations, money, leadership, and labour to succeed. Political opportunity theory argues that movements gain traction when external political conditions — divided elites, declining repression, international attention — open windows. Framing theory examines how movements construct compelling narratives that define a problem, name a villain, and propose a solution. Newer work on digital networks examines how decentralised coordination changes movement dynamics.

### Collective Action and Its Challenges
Mancur Olson's classic problem of collective action asks why individuals would contribute to a public good when they can free-ride on others' efforts. Movements address this through selective incentives, identity, and social pressure. Successful movements combine moral urgency with practical organisation.

### Why It Matters
Almost every expansion of rights in modern history — abolition of slavery, women's suffrage, decolonisation, civil rights, marriage equality, environmental protection — began as a marginal movement dismissed by the powerful. Studying how movements form, organise, and succeed or fail reveals the mechanics of democratic change and the conditions under which ordinary people reshape the rules under which they live.`,
  },

  // ----------------------------------------------------------------
  // 12. GLOBALIZATION AND CULTURAL HOMOGENIZATION
  // ----------------------------------------------------------------
  {
    id: 'globalization-culture-homogenization',
    patterns: [/\b(cultural imperialism|glocalization|glocalisation|mcdonaldization|mcdonaldisation|cultural hybridity|anti-globalization|anti-globalisation|transnational corporation|trade liberalization|trade liberalisation)\b/i],
    keywords: ['cultural imperialism', 'glocalization', 'glocalisation', 'mcdonaldization', 'mcdonaldisation', 'cultural hybridity', 'anti-globalization', 'anti-globalisation', 'transnational corporation', 'trade liberalization', 'trade liberalisation'],
    intent: 'factual_question',
    topic: 'society',
    response: () => `Globalisation is the deepening integration of economies, societies, and cultures across national borders, accelerated by falling transport costs, digital communication, and trade liberalisation since the 1970s. While globalisation is often discussed as an economic phenomenon, its cultural dimensions are equally significant — and contested. The central question is whether globalisation produces a single world culture, a mosaic of hybrid forms, or new hierarchies in which some cultures dominate others.

### Cultural Imperialism and McDonaldization
Cultural imperialism describes a flow in which powerful societies export their media, brands, and values to weaker ones, displacing local traditions. Critics in the 1970s argued that Hollywood films, American pop music, and English-language broadcasting marginalised local production and naturalised Western consumer norms. George Ritzer's concept of McDonaldization generalised the critique: the principles of the fast-food restaurant — efficiency, calculability, predictability, and control — were spreading to universities, medicine, publishing, and politics worldwide, replacing craft and local variation with standardised systems.

### Glocalization and Cultural Hybridity
Glocalization, a term coined from the Japanese word dochakuka, describes how global products are adapted to local contexts. McDonald's serves the McAloo Tikki in India and beer in Germany; MTV produces regional channels with local hosts. Cultural hybridity goes further, treating globalisation not as one-way imposition but as a process in which global and local elements fuse into something new. Examples include bhangra-influenced British pop, Nigerian Afrobeats sampled by American artists, and sushi rolls invented in Los Angeles. Theorists like Homi Bhabha and Stuart Hall argue that hybridity is the typical rather than exceptional outcome of cultural contact.

### Trade Liberalisation and Transnational Corporations
Economic globalisation is driven by trade liberalisation — the reduction of tariffs and quotas through agreements like the General Agreement on Tariffs and Trade (GATT), its successor the World Trade Organization (WTO), and regional blocs like the European Union and ASEAN. Supply chains now span dozens of countries; a modern smartphone contains components designed in California, fabricated in Taiwan, assembled in China, and shipped globally. Transnational corporations — Apple, Toyota, Unilever, Samsung — operate at scales that exceed the GDP of many states, raising questions about accountability, labour standards, and tax avoidance.

### Anti-Globalization Movements
Resistance to globalisation crystallised in the 1999 Seattle protests against the WTO and continued through the World Social Forum gatherings. Critics argue that liberalised trade displaces manufacturing workers in rich countries, exploits labour in poor ones, accelerates environmental damage, and undermines democratic control over economic policy. The 2008 financial crisis, the Brexit vote, and the rise of protectionist politics in the 2010s revived questions about whether the peak of globalisation has passed and what a more managed, plurilateral trading order might look like.

### Why It Matters
Cultural globalisation determines what music young people in Lagos and Lima grow up listening to, what languages survive, what food is available, and what stories are told. Economic globalisation determines wages, prices, and the location of entire industries. Understanding the processes — homogenisation, hybridisation, resistance — equips citizens to evaluate trade agreements, immigration policies, and cultural exchanges on clearer terms rather than treating globalisation as either inevitable progress or unrelenting loss.`,
  },

  // ----------------------------------------------------------------
  // 13. DEMOGRAPHY AND MIGRATION PATTERNS
  // ----------------------------------------------------------------
  {
    id: 'demography-migration-patterns',
    patterns: [/\b(push and pull factors|push factor|pull factor|immigration|emigration|refugee|asylum seeker|diaspora|brain drain|demographic transition|remittances)\b/i],
    keywords: ['push and pull factors', 'push factor', 'pull factor', 'immigration', 'emigration', 'refugee', 'asylum seeker', 'diaspora', 'brain drain', 'demographic transition', 'remittances'],
    intent: 'factual_question',
    topic: 'society',
    response: () => `Demography is the statistical study of populations — their size, structure, distribution, and changes over time. Migration is the movement of people across boundaries, whether within a country or between countries. Together these forces shape the size of economies, the age structure of societies, the composition of electorates, and the demands on housing, schools, and healthcare. Demographic shifts happen slowly but their effects compound over generations.

### Push and Pull Factors
Migration is typically explained through push and pull factors. Push factors drive people away from origin areas: war, persecution, economic collapse, environmental disasters, lack of opportunity. Pull factors attract them to destinations: jobs, political stability, family ties, education, higher wages. The decision to migrate usually involves both: a Syrian farmer pushed by civil war and pulled by relatives already in Germany; a Filipino nurse pushed by low wages at home and pulled by staffing shortages abroad. Networks of earlier migrants reduce the cost and risk for those who follow, producing migration streams that persist long after the original causes fade.

### Immigration, Emigration, Refugees, and Asylum Seekers
Immigration is arrival in a country of which one is not a native; emigration is departure from one's country of origin. Net migration is the difference between the two. Refugees are people who have crossed an international border owing to a well-founded fear of persecution on grounds of race, religion, nationality, political opinion, or membership in a particular social group, as defined by the 1951 Refugee Convention. Asylum seekers are people who have applied for refugee status but whose claims have not yet been adjudicated. The distinction matters legally: refugees have internationally recognised rights, while other migrants are subject to the receiving country's immigration laws.

### Diaspora and Brain Drain
A diaspora is a population descended from migrants of a common origin that maintains some connection to the homeland — the Armenian, Irish, Chinese, and Indian diasporas are prominent examples. Diasporas send remittances home (over 800 billion dollars globally in 2023), influence homeland politics, and build trade and cultural links between countries. Brain drain describes the migration of skilled workers from poorer to richer countries. It benefits receiving countries and individual migrants but can deprive origin countries of doctors, engineers, and scientists whose training was publicly subsidised. Some countries, like India and the Philippines, have built entire export industries around the migration of skilled labour.

### Integration and Assimilation
Integration refers to the process by which migrants and their descendants participate in the economic, social, and civic life of the receiving society while retaining elements of their cultural heritage. Assimilation describes a more complete adoption of the dominant culture, sometimes over multiple generations. Policies vary widely: Canada and Australia explicitly pursue multicultural models, France defends a more assimilationist republican ideal, and many countries fall somewhere in between, often inconsistently.

### Demographic Transition
The demographic transition describes the shift from high birth and death rates to low birth and death rates that accompanies economic development. Population grows rapidly during the transition as death rates fall before birth rates, then stabilises. Much of sub-Saharan Africa is mid-transition; Europe, Japan, and East Asia have completed it and now face declining populations and aging workforces, with consequences for pensions, healthcare, and immigration policy.

### Why It Matters
Demography sets the parameters within which politics and economics operate. Aging societies, climate migration, refugee crises, and labour shortages are not episodic events but structural shifts that will define the coming decades. Understanding how populations move and change is essential to planning for schools, pensions, climate adaptation, and the political stability of multiethnic states.`,
  },
]
