/**
 * ============================================================
 *  TRIZA ENGINE — Knowledge Batch: Society, Law & Economics
 * ============================================================
 *
 *  15 hand-written entries covering human rights, democracy,
 *  constitutions, education, economics, banking, trade, the
 *  United Nations, climate policy, social media, AI ethics,
 *  and wealth inequality. Each entry includes English + Roman
 *  Urdu trigger patterns so TRIZA can respond to multilingual
 *  user queries natively.
 *
 *  All responses: 250-400 words, markdown formatted, factually
 *  accurate. No external LLM — pure TypeScript knowledge base.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const SOCIETY_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------
  // 1. HUMAN RIGHTS
  // ----------------------------------------------------------
  {
    id: 'human-rights',
    patterns: [/\b(human rights|insani haqooq|insaan ke haqooq|basic rights|civil rights|udhr|universal declaration)\b/i],
    intent: 'factual_question',
    topic: 'politics',
    response: () => `## Human Rights — The Universal Baseline

**Human rights** are the basic freedoms and protections that belong to every person simply by virtue of being human. They are universal (apply everywhere), inalienable (cannot be taken away), and indivisible (no right is more important than another).

### Historical Foundations
The modern human rights framework was built in the aftermath of World War II, when the world recoiled from atrocities of the Holocaust and colonial violence. On **10 December 1948**, the United Nations General Assembly adopted the **Universal Declaration of Human Rights (UDHR)** in Paris — a 30-article document drafted by a committee chaired by Eleanor Roosevelt.

### Core Categories
| Category | Example Rights |
|----------|----------------|
| Civil & Political | Life, free speech, fair trial, voting |
| Economic, Social & Cultural | Education, work, health, food |
| Collective / Solidarity | Self-determination, clean environment, peace |

### Key Treaties
- **ICCPR** (1966) — International Covenant on Civil and Political Rights
- **ICESCR** (1966) — International Covenant on Economic, Social and Cultural Rights
- **CRC** (1989) — Convention on the Rights of the Child
- **CEDAW** (1979) — Convention on the Elimination of All Forms of Discrimination Against Women

### Enforcement Gaps
Human rights law is famously weak on enforcement. The UN Human Rights Council can investigate and condemn, but cannot arrest. Regional courts — the European Court of Human Rights, Inter-American Court, and African Court — have stronger binding powers. National constitutions remain the primary guarantor.

### Common Violations Today
- Arbitrary detention and torture
- Suppression of press and protest
- Child labor and trafficking
- Discrimination by race, gender, religion
- Denial of education and healthcare

**Why it matters:** Human rights are the moral floor below which no society should fall. When states respect them, conflict drops, innovation rises, and human dignity flourishes. When ignored, the resulting grievance fuels migration, extremism, and war — making human rights not just an ethical cause but a practical foundation of global stability.`,
  },

  // ----------------------------------------------------------
  // 2. DEMOCRACY
  // ----------------------------------------------------------
  {
    id: 'democracy',
    patterns: [/\b(democracy|jamhuriat|jamhooriat|democratic|direct democracy|representative democracy|liberal democracy)\b/i],
    intent: 'factual_question',
    topic: 'politics',
    response: () => `## Democracy — Power Belongs to the People

**Democracy** comes from the Greek *demokratia* — *demos* (people) and *kratos* (rule). At its core it means government by consent of the governed, where leaders are chosen, laws are debated, and power is limited by rules.

### Main Types
| Type | How It Works | Example |
|------|--------------|---------|
| **Direct democracy** | Citizens vote on laws directly | Swiss referendums |
| **Representative democracy** | Citizens elect lawmakers | United Kingdom, India |
| **Liberal democracy** | Elected government + strong rights & courts | Canada, Germany |
| **Constitutional monarchy** | King/Queen + elected parliament | Japan, Spain |
| **Parliamentary** | Executive drawn from legislature | Pakistan, UK |
| **Presidential** | Separately elected president | USA, Brazil |

### Core Principles
- **Popular sovereignty** — ultimate authority rests with the people
- **Political equality** — one person, one vote
- **Rule of law** — even rulers must obey the law
- **Separation of powers** — executive, legislature, judiciary check each other
- **Free press and civil society** — independent voices hold power accountable
- **Regular free elections** — peaceful transfer of power

### Strengths and Weaknesses
Democracies tend to have higher incomes, fewer famines, and less war with each other (the 'democratic peace' thesis). But they can also suffer from polarization, populism, voter apathy, slow decision-making, and capture by moneyed interests.

### Quality Markers
The **Economist Intelligence Unit Democracy Index** rates countries on electoral process, civil liberties, government functioning, political participation, and political culture. Only about 20 countries qualify as 'full democracies'; many more are 'flawed democracies' or 'hybrid regimes'.

**Why it matters:** No system perfectly represents the people, but democracy is the only one that lets citizens fire their leaders without violence. Protecting it requires constant vigilance — fair courts, free media, and citizens who actually show up to vote, protest, and serve on juries.`,
  },

  // ----------------------------------------------------------
  // 3. CONSTITUTION
  // ----------------------------------------------------------
  {
    id: 'constitution',
    patterns: [/\b(constitution|aain|dastoor|qanoon e asasi|constitutional law|bill of rights)\b/i],
    intent: 'factual_question',
    topic: 'politics',
    response: () => `## Constitution — The Rulebook of a State

A **constitution** is the supreme law of a nation. It defines how the state is organized, what powers each branch holds, what rights citizens enjoy, and how the law itself can be changed. Every other law must comply with it — if not, courts strike it down.

### What a Constitution Does
- **Establishes institutions** — parliament, presidency, courts
- **Distributes power** — federal vs provincial, executive vs legislature
- **Guarantees rights** — speech, religion, life, equality
- **Sets the amendment process** — how to update itself
- **Limits the state** — what government cannot do to citizens

### Famous Examples
| Country | Year | Notable Feature |
|---------|------|-----------------|
| United States | 1787 | Oldest written national constitution, Bill of Rights |
| France | 1958 | Fifth Republic, strong presidency |
| India | 1950 | Longest written constitution, 470+ articles |
| United Kingdom | Uncodified | Built from Magna Carta (1215), statutes, conventions |
| South Africa | 1996 | Post-apartheid, sweeping rights |
| Pakistan | 1973 | Current form after 1956 and 1962 versions |

### Types
- **Written / codified** — a single document (India, USA, Pakistan)
- **Uncodified** — scattered statutes and conventions (UK, New Zealand)
- **Rigid** — hard to amend (USA, only 27 amendments in 230+ years)
- **Flexible** — easier to amend (India, amended 100+ times)

### Key Doctrines
- **Judicial review** — courts can invalidate laws violating the constitution
- **Basic structure** (India) — parliament cannot destroy the constitution's core
- **Due process** and **equal protection** clauses

**Why it matters:** A constitution is the contract between rulers and ruled. Without it, power is arbitrary and rights depend on the mood of whoever governs. A strong constitution — backed by independent courts — is the difference between law and tyranny. Citizens who understand theirs can defend it; those who do not, lose it.`,
  },

  // ----------------------------------------------------------
  // 4. EDUCATION SYSTEMS
  // ----------------------------------------------------------
  {
    id: 'education-systems',
    patterns: [/\b(education system|taleem nizam|nizam e taleem|school system|education model|finland education|montessori|stem education)\b/i],
    intent: 'factual_question',
    topic: 'society',
    response: () => `## Education Systems — How the World Learns

An **education system** is the structured way a society teaches its children — covering curriculum, schools, teachers, exams, and governance. There is no single global model; each country blends culture, economy, and politics into its own approach.

### Major Stages
1. **Early childhood** (ages 3-6) — pre-primary, kindergarten, Montessori
2. **Primary** (6-11) — basic literacy, numeracy
3. **Lower secondary** (11-14) — broader subjects
4. **Upper secondary** (15-18) — academic or vocational track
5. **Tertiary** — universities, colleges, technical institutes

### Famous National Models
| Country | Distinctive Feature |
|---------|---------------------|
| **Finland** | No standardized tests until age 16, highly trained teachers, short school days |
| **South Korea** | Intense exam culture, high PISA scores, long study hours |
| **Germany** | Tracks students into academic vs vocational paths early; strong apprenticeship system |
| **United States** | Decentralized — each state runs its own schools |
| **Japan** | Moral education, uniform culture, competitive entrance exams |
| **Singapore** | Streaming by ability, math and science focus, world-leading PISA results |

### Pedagogical Approaches
- **Montessori** — child-led, hands-on materials
- **Waldorf / Steiner** — arts-integrated, holistic development
- **IB (International Baccalaureate)** — inquiry-based, global curriculum
- **STEM** — Science, Technology, Engineering, Math emphasis
- **Madrasa** — traditional Islamic education, often including Quran, fiqh, Arabic

### Global Challenges
- **Access** — 244 million children out of school worldwide (UNESCO)
- **Quality** — many in school cannot read a simple sentence
- **Gender gap** — girls still disadvantaged in parts of South Asia and Africa
- **Digital divide** — broadband and devices unevenly distributed
- **Teacher shortage** — 44 million more teachers needed by 2030

**Why it matters:** Education is the single strongest predictor of national prosperity, health, and stability. A society that teaches its children well compounds returns across generations — better jobs, lower crime, healthier families, more informed voters. Reforming it well is among the highest-leverage investments any government can make.`,
  },

  // ----------------------------------------------------------
  // 5. SUPPLY AND DEMAND
  // ----------------------------------------------------------
  {
    id: 'supply-and-demand',
    patterns: [/\b(supply and demand|supply demand|talab aur arz|arz o talab|demand curve|supply curve|market equilibrium|price mechanism)\b/i],
    intent: 'factual_question',
    topic: 'economics',
    response: () => `## Supply and Demand — The Heart of Markets

**Supply and demand** is the most foundational model in economics. It explains how prices are set in free markets, why shortages and surpluses occur, and how resources get allocated without a central planner.

### The Two Laws
- **Law of Demand** — as price rises, quantity demanded falls (consumers buy less)
- **Law of Supply** — as price rises, quantity supplied rises (producers sell more)

These two curves intersect at the **equilibrium price** — the point where buyers and sellers agree. Above it, surplus builds. Below it, shortage appears.

### Why Curves Shift
| Factor | Demand Shifts When | Supply Shifts When |
|--------|-------------------|-------------------|
| Income | Rises or falls | — |
| Tastes | Preferences change | — |
| Substitutes | Price of alternatives changes | — |
| Input costs | — | Wages, fuel, materials change |
| Technology | — | Productivity improves |
| Government | Taxes, subsidies | Taxes, subsidies, regulations |
| Expectations | Future price or income shifts | Future price expectations shift |

### Examples
- A bad wheat harvest cuts supply → bread prices rise
- A new iPhone launches → high demand, long queues, premium price
- Government subsidizes solar panels → supply rises, prices fall, adoption grows
- Oil producers (OPEC) cut output → global prices climb

### Elasticity
**Elasticity** measures how strongly quantity responds to price. Insulin is *inelastic* — diabetics buy it almost regardless of price. Cinema tickets are *elastic* — small price hikes chase viewers to streaming. Elasticity shapes who actually bears the burden of a tax.

### Market Failures
Free markets misfire when:
- **Externalities** exist (pollution is not priced in)
- **Public goods** are underprovided (clean air, defense)
- **Monopolies** restrict supply to raise prices
- **Information asymmetry** tricks buyers

**Why it matters:** Almost every economic debate — minimum wage, rent control, tariffs, carbon taxes — is really a fight about supply and demand. Understanding the model lets you predict policy outcomes instead of relying on slogans, and explains why well-meaning price controls so often backfire.`,
  },

  // ----------------------------------------------------------
  // 6. INFLATION
  // ----------------------------------------------------------
  {
    id: 'inflation',
    patterns: [/\b(inflation|mehangai|mehngai|price inflation|cpi|consumer price index|hyperinflation|stagflation|deflation)\b/i],
    intent: 'factual_question',
    topic: 'economics',
    response: () => `## Inflation — When Money Buys Less

**Inflation** is the sustained rise in the general price level of goods and services over time. As prices climb, each unit of currency buys fewer goods — so the *real* value of money falls. Central banks typically target around **2% annual inflation** as healthy; too high erodes savings, too low (or negative, *deflation*) stalls spending and growth.

### How It Is Measured
- **Consumer Price Index (CPI)** — tracks a basket of household goods (food, rent, fuel, clothing)
- **Producer Price Index (PPI)** — measures costs at the wholesale level
- **Core inflation** — strips out volatile food and energy
- **GDP deflator** — broadest measure across the whole economy

### Main Types and Causes
| Type | Driver | Example |
|------|--------|---------|
| **Demand-pull** | Too much money chasing too few goods | Post-COVID reopening boom |
| **Cost-push** | Rising input costs | Oil shock, war, supply disruption |
| **Built-in** | Workers demand higher wages, prices rise again | Wage-price spiral |
| **Hyperinflation** | Loss of faith in currency | Zimbabwe 2008, Venezuela 2016 |
| **Stagflation** | High inflation + high unemployment + slow growth | 1970s oil crisis |

### Effects
- **Savers lose** — fixed deposits shrink in real value
- **Debtors gain** — fixed debts become cheaper to repay
- **Pensions erode** unless indexed
- **Wages lag** prices if unions are weak
- **Investment falls** when uncertainty is high

### Policy Tools
Central banks (like the State Bank of Pakistan or US Federal Reserve) fight inflation mainly by **raising interest rates**, which cools borrowing and spending. Governments can also cut spending, raise taxes, or release strategic reserves of commodities.

**Why it matters:** Inflation is a silent tax — it transfers wealth from savers, pensioners, and the poor (whose incomes are sticky) toward asset owners and debtors. Left unchecked, it topples governments, as seen in Weimar Germany, Argentina, and Sri Lanka. Stable prices are the foundation on which every other economic promise is built.`,
  },

  // ----------------------------------------------------------
  // 7. STOCK MARKET
  // ----------------------------------------------------------
  {
    id: 'stock-market',
    patterns: [/\b(stock market|share market|shares|stocks|saham|bourse|nyse|nasdaq|psx|investing|dividends|ipo)\b/i],
    intent: 'factual_question',
    topic: 'economics',
    response: () => `## Stock Market — Where Companies Meet Capital

A **stock market** is a marketplace where shares of publicly listed companies are bought and sold. Buying a share makes you a part-owner of that company — a *shareholder* — with a claim on its future profits and voting rights on major decisions.

### Key Concepts
- **Share / stock** — a unit of ownership in a company
- **IPO (Initial Public Offering)** — first sale of shares to the public
- **Dividend** — portion of profit paid out to shareholders
- **Capital gain** — profit from selling a share at a higher price
- **Index** — a basket tracking market performance (e.g., S&P 500, KSE-100)
- **Bull market** — rising prices; **Bear market** — falling prices

### Major Exchanges
| Exchange | Country | Founded |
|----------|---------|---------|
| New York Stock Exchange (NYSE) | USA | 1792 |
| NASDAQ | USA | 1971 |
| London Stock Exchange | UK | 1801 |
| Tokyo Stock Exchange | Japan | 1878 |
| Pakistan Stock Exchange (PSX) | Pakistan | 2016 (merged) |
| Saudi Tadawul | Saudi Arabia | 2007 |

### How Prices Move
Stock prices are set by **supply and demand** in real time. Buyers bid, sellers ask; trades happen when prices match. Prices reflect expectations of future earnings, interest rates, geopolitical risk, and broader sentiment. Short-term moves are noisy; long-term moves track corporate profits.

### Investment Approaches
- **Index investing** — buy a whole market via ETFs; low fees, diversified
- **Value investing** — buy undervalued companies (Warren Buffett style)
- **Growth investing** — chase fast-expanding firms, often tech
- **Day trading** — high risk, often loses money after fees
- **Dividend investing** — focus on steady income payers

### Risks
Markets can crash 20-50% in months — 2008 financial crisis, 2020 COVID crash. Diversification, long horizons, and emotional discipline are the main defenses.

**Why it matters:** Stock markets let ordinary people share in corporate profits and build retirement wealth, while giving companies capital to grow and create jobs. They are also a real-time barometer of economic confidence. Understanding them — and avoiding speculation — is one of the most useful financial skills a person can develop.`,
  },

  // ----------------------------------------------------------
  // 8. TAXES
  // ----------------------------------------------------------
  {
    id: 'taxes',
    patterns: [/\b(tax|taxes|mahsool|taxation|income tax|sales tax|gst|vat|corporate tax|property tax|tax return|fbr)\b/i],
    intent: 'factual_question',
    topic: 'economics',
    response: () => `## Taxes — The Price of Civilization

A **tax** is a compulsory payment to the government, used to fund public goods and services that markets underprovide — schools, roads, defense, courts, healthcare, and welfare. As US Supreme Court Justice Oliver Wendell Holmes put it, 'Taxes are what we pay for civilized society.'

### Main Types
| Type | What It Taxes | Example |
|------|---------------|---------|
| **Income tax** | Wages, salaries, profits | US federal income tax, Pakistan income tax |
| **Corporate tax** | Company profits | 21% US federal rate |
| **Sales tax / VAT / GST** | Goods and services | 17% standard GST in Pakistan, 20% UK VAT |
| **Property tax** | Real estate value | Local government funding |
| **Capital gains tax** | Profit from selling assets | Stocks, real estate |
| **Payroll tax** | Wages (employer + employee) | Social Security in US |
| **Excise / customs duty** | Specific goods, imports | Fuel, tobacco, alcohol |
| **Wealth tax** | Net worth | Spain, Norway (debated elsewhere) |

### Tax Systems
- **Progressive** — rate rises with income (most income taxes)
- **Proportional / flat** — same rate for all (Russia, some US states)
- **Regressive** — poor pay higher share of income (sales taxes often)

### Why Governments Tax
1. **Revenue** — fund schools, hospitals, defense, infrastructure
2. **Redistribution** — narrow inequality through transfers
3. **Behavior** — discourage smoking, carbon, sugar
4. **Stabilization** — fiscal policy to manage booms and busts

### Common Problems
- **Evasion** — hiding income, especially in cash economies
- **Avoidance** — legal use of loopholes and offshore structures
- **Narrow base** — few taxpayers carry the burden (Pakistan has under 5 million active filers)
- **Complexity** — long codes invite loopholes and lobbying

**Why it matters:** A government that cannot collect taxes cannot build schools, vaccinate children, or defend borders — and must borrow, fueling debt crises. But taxation also punishes work and investment if poorly designed. The art of tax policy is raising enough to fund a decent state without strangling the economy that produces the wealth.`,
  },

  // ----------------------------------------------------------
  // 9. BANKING SYSTEM
  // ----------------------------------------------------------
  {
    id: 'banking-system',
    patterns: [/\b(banking|banking system|bank|banks|central bank|commercial bank|interest rate|reserve ratio|fractional reserve|sbp|federal reserve)\b/i],
    intent: 'factual_question',
    topic: 'economics',
    response: () => `## Banking System — The Plumbing of the Economy

A **bank** is a financial institution that takes deposits, makes loans, and moves money. The full **banking system** — commercial banks, central banks, and regulators — channels savings toward productive investment and underpins the entire payment system.

### Types of Banks
| Type | Role | Example |
|------|------|---------|
| **Commercial banks** | Deposits, loans, payments | HBL, Meezan, Citibank |
| **Central banks** | Issue currency, set rates, regulate | State Bank of Pakistan, US Federal Reserve, ECB |
| **Investment banks** | Underwrite securities, advise on mergers | Goldman Sachs |
| **Islamic banks** | Shariah-compliant, profit-and-loss sharing | Meezan Bank, Dubai Islamic |
| **Cooperative / microfinance** | Small loans to underserved | Grameen Bank |
| **Development banks** | Long-term project finance | World Bank, ADB |

### How Banks Create Money
Banks use **fractional reserve banking** — they keep only a fraction of deposits as cash and lend out the rest. When a loan is made, new money enters the economy. This is why the *money supply* is far larger than physical currency.

### Central Bank Tools
- **Policy interest rate** — cost of borrowing (SBP's key lever)
- **Reserve requirements** — minimum cash banks must hold
- **Open market operations** — buying/selling government bonds
- **Quantitative easing** — large asset purchases to inject liquidity
- **Lender of last resort** — bail out failing banks in panics

### Key Risks
- **Bank runs** — depositors panic and withdraw; solved by deposit insurance
- **Bad loans / NPLs** — borrowers default, capital erodes
- **Systemic risk** — one big failure cascades (Lehman 2008)
- **Inflation** — if central bank prints too much

### Safeguards
The **Basel Accords** set global capital rules — banks must hold enough equity to absorb losses. National regulators (SBP, FDIC, ECB) supervise and stress-test institutions.

**Why it matters:** Modern economies run on trust. When banks work, savings flow to businesses, paychecks clear, and trade expands. When they fail — as in 1929 or 2008 — recession, unemployment, and hardship follow. Banking may seem technical, but its health decides whether families keep their homes and nations stay solvent.`,
  },

  // ----------------------------------------------------------
  // 10. INTERNATIONAL TRADE
  // ----------------------------------------------------------
  {
    id: 'international-trade',
    patterns: [/\b(international trade|imports|exports|trade|tariff|tariffs|free trade|wto|trade agreement|balance of trade|trade deficit)\b/i],
    intent: 'factual_question',
    topic: 'economics',
    response: () => `## International Trade — Nations Buying and Selling

**International trade** is the exchange of goods, services, and capital across borders. It lets countries specialize in what they produce best — Saudi Arabia in oil, Vietnam in textiles, Germany in machinery — and trade for everything else. The result is far more abundance than any nation could produce alone.

### Core Concepts
- **Import** — buying from abroad
- **Export** — selling abroad
- **Trade balance** — exports minus imports; deficit if imports exceed exports
- **Comparative advantage** — even if a country makes everything better, it pays to specialize where its edge is greatest (Ricardo's law)
- **Tariff** — tax on imports
- **Quota** — limit on import quantity
- **Exchange rate** — price of one currency in another; affects trade competitiveness

### Why Countries Trade
| Benefit | Mechanism |
|---------|-----------|
| Lower prices | Competition and scale economies |
| More variety | Tropical fruit in Norway, European cars in Pakistan |
| Specialization | Focus on what you do best |
| Technology transfer | Imports carry embedded know-how |
| Peace | Trading partners rarely go to war |

### Trade Agreements and Bodies
- **WTO** (1995) — global rule-setter, dispute settlement
- **GATT** — predecessor covering goods
- **USMCA** — US, Mexico, Canada (replaced NAFTA)
- **EU Single Market** — free movement of goods, services, capital, people
- **RCEP** — Asia-Pacific mega-bloc (2022)
- **SAARC / SAFTA** — South Asia (limited effectiveness)

### Ongoing Debates
- **Free trade vs protectionism** — globalization's losers (factory workers) vs winners (consumers)
- **Trade deficits** — often misread as 'losing'; really a capital inflow
- **Tariffs as weapon** — US-China trade war, semiconductor controls
- **Fair trade** — labor and environmental standards
- **Sanctions** — trade cutoffs as foreign policy tool

**Why it matters:** A smartphone contains parts from 40+ countries. Clothing, food, medicine, fuel — all flow through trade. When trade is open, prices fall and choice explodes; when choked by tariffs and war, inflation rises and growth stalls. Decisions made about trade shape jobs, prices, and even the odds of war — making it one of the most consequential areas of economic policy.`,
  },

  // ----------------------------------------------------------
  // 11. UNITED NATIONS
  // ----------------------------------------------------------
  {
    id: 'united-nations',
    patterns: [/\b(united nations|un|uno|un security council|general assembly|united nations organization|qoom e muttahida)\b/i],
    intent: 'factual_question',
    topic: 'politics',
    response: () => `## United Nations — The World's Diplomatic Floor

The **United Nations (UN)** is an international organization founded on **24 October 1945** after World War II, replacing the failed League of Nations. Its mission: prevent another world war, defend human rights, deliver humanitarian aid, promote development, and uphold international law. Today it has **193 member states** — nearly every country on Earth.

### Main Organs
| Organ | Role |
|-------|------|
| **General Assembly** | All 193 members; debates, sets budgets, passes non-binding resolutions |
| **Security Council** | 15 members — 5 permanent (USA, UK, France, Russia, China) with veto, plus 10 rotating; only body with binding force |
| **Secretariat** | Administrative arm, led by the Secretary-General (António Guterres since 2017) |
| **International Court of Justice** | Settles disputes between states, at The Hague |
| **Economic and Social Council** | Coordinates development, health, labor agencies |
| **Trusteeship Council** | Suspended since 1994 |

### Key Agencies
- **WHO** — global health
- **UNICEF** — children
- **UNHCR** — refugees
- **UNDP** — development
- **WFP** — food aid
- **UNESCO** — education, culture, heritage
- **UN Peacekeeping** — blue-helmet missions in conflict zones

### Strengths
- Averts and de-escalates conflicts
- Coordinates famine, refugee, and vaccination responses
- Provides a forum where rivals can talk instead of fight
- Codifies human rights and international law

### Weaknesses
- **Security Council veto** paralyzes action when a permanent member is involved
- **Slow bureaucracy** and underfunding
- **No standing army** — depends on volunteer troops from members
- **Limited enforcement** — resolutions often ignored
- Perceived double standards in interventions

### Famous Moments
- 1948 — Universal Declaration of Human Rights
- 1950 — Korean War authorization
- 1992 — Rio Earth Summit
- 2000 — Millennium Development Goals
- 2015 — Sustainable Development Goals (SDGs), Paris Agreement

**Why it matters:** Imperfect as it is, the UN is the only forum where every nation meets. Without it, refugee crises, pandemics, and conflicts would be far deadlier and harder to coordinate. Reforming its veto and funding is a generational challenge — but abandoning it would return the world to the raw power politics that produced two world wars.`,
  },

  // ----------------------------------------------------------
  // 12. CLIMATE POLICY
  // ----------------------------------------------------------
  {
    id: 'climate-policy',
    patterns: [/\b(climate policy|paris agreement|carbon target|net zero|carbon tax|emissions|cap and trade|cop|climate change policy)\b/i],
    intent: 'factual_question',
    topic: 'politics',
    response: () => `## Climate Policy — Governing a Warming Planet

**Climate policy** is the set of laws, treaties, and economic tools governments use to cut greenhouse gas emissions and adapt to a changing climate. With global average temperatures already about **1.2°C above pre-industrial levels**, climate policy has become one of the defining challenges of the 21st century.

### The Science in One Line
Burning fossil fuels — coal, oil, gas — releases CO₂ that traps heat. Methane from agriculture and leaks amplifies the warming. The 2015 **Paris Agreement** aims to hold warming 'well below 2°C' and ideally limit it to **1.5°C** above pre-industrial levels.

### Key Milestones
| Year | Event |
|------|-------|
| 1992 | Rio Earth Summit — UNFCCC created |
| 1997 | Kyoto Protocol — first binding targets for rich nations |
| 2015 | Paris Agreement — nationally determined contributions (NDCs) |
| 2021 | COP26 Glasgow — 'phase down' coal |
| 2023 | COP28 Dubai — first explicit 'transition away from fossil fuels' |

### Main Policy Tools
- **Carbon tax** — fixed price per ton of CO₂ emitted (Canada, Sweden)
- **Cap-and-trade** — limit total emissions, firms trade permits (EU ETS)
- **Renewable subsidies** — solar, wind, EV incentives
- **Phase-out bans** — ending coal plants, petrol cars by set dates
- **Green procurement** — governments buy low-carbon
- **Climate finance** — rich nations funding adaptation in poor ones (pledged $100B/yr)

### Net Zero Targets
Over 140 countries have pledged **net zero** by 2050 — meaning emissions are balanced by removals (forests, carbon capture). Pakistan has committed to 60% renewable electricity by 2030 and net zero by 2050, though implementation lags.

### Tensions
- **Developed vs developing** — who bears historic responsibility?
- **Energy security** — gas and coal return during crises (Ukraine war)
- **Loss and damage** — compensation for climate victims
- **Greenwashing** — corporate pledges without substance
- **Political backlash** — costs to consumers fuel populist resistance

**Why it matters:** Climate change is not a future threat but a present one — floods in Pakistan (2022), heatwaves in Europe, wildfires in California, droughts in the Horn of Africa. Policy decisions made this decade will shape coastlines, food supplies, and migration patterns for centuries. There is no 'outside' of climate policy — every budget, treaty, and tariff now plays into it.`,
  },

  // ----------------------------------------------------------
  // 13. SOCIAL MEDIA IMPACT
  // ----------------------------------------------------------
  {
    id: 'social-media-impact',
    patterns: [/\b(social media|social media impact|social media effects|facebook impact|twitter impact|instagram|tiktok|fake news|misinformation)\b/i],
    intent: 'factual_question',
    topic: 'society',
    response: () => `## Social Media Impact — A Society Rewired

**Social media** — Facebook, YouTube, WhatsApp, Instagram, TikTok, X (Twitter), and others — has restructured how humans communicate, learn, shop, govern, and even think. Roughly **5 billion people** use social media worldwide, spending on average 2.5 hours per day on it.

### Positive Impacts
- **Connectivity** — diaspora families, long-lost friends, niche communities
- **Information access** — real-time news, tutorials, citizen journalism
- **Political mobilization** — Arab Spring, #MeToo, climate strikes
- **Economic opportunity** — small businesses, creators, freelancers
- **Mental health support** — anonymous spaces for stigmatized issues
- **Education** — free courses, skill-building, language learning

### Negative Impacts
| Domain | Harm |
|--------|------|
| **Mental health** | Anxiety, depression, body image issues, especially teen girls |
| **Attention** | Reduced focus, dopamine-driven scroll addiction |
| **Misinformation** | Fake news spreads 6× faster than truth on Twitter (MIT) |
| **Polarization** | Algorithmic echo chambers deepen divides |
| **Elections** | Disinformation campaigns, micro-targeted ads |
| **Privacy** | Mass data collection, surveillance, leaks |
| **Children** | Cyberbullying, grooming, addictive design |

### How Platforms Hook Users
- Infinite scroll removes natural stopping cues
- Variable rewards (likes, notifications) mirror slot machines
- Algorithmic feeds push emotional, enraging content
- Personalization creates filter bubbles

### Policy Responses
- **EU Digital Services Act** (2022) — platform liability, transparency
- **US Section 230** debate — should platforms be sued for content?
- **China** — tight state control, real-name rules
- **Age limits** — Australia banned under-16 social media (2024)
- **Pakistani PECA** — controversial content takedown law

**Why it matters:** Social media is the public square, the marketplace, and the therapist's couch of the modern world — all run by profit-driven algorithms. Understanding how it shapes attention, opinion, and emotion is now basic literacy. Nations and families that ignore its effects pay in polarization, mental illness, and manipulated elections; those who design healthier rules gain a real advantage in attention, trust, and democracy.`,
  },

  // ----------------------------------------------------------
  // 14. AI ETHICS
  // ----------------------------------------------------------
  {
    id: 'ai-ethics',
    patterns: [/\b(ai ethics|artificial intelligence ethics|ai bias|ai regulation|ai jobs|algorithmic bias|ai safety|machine learning ethics)\b/i],
    intent: 'factual_question',
    topic: 'society',
    response: () => `## AI Ethics — Governing Intelligent Machines

**AI ethics** studies the moral and social consequences of artificial intelligence — from biased algorithms to job loss, surveillance, autonomous weapons, and the long-term risk of superintelligence. As AI reaches billions of users via tools like ChatGPT, ethics has shifted from academic debate to urgent policy.

### Core Issues
| Issue | What It Means |
|-------|---------------|
| **Bias and fairness** | Models trained on biased data discriminate by race, gender, class |
| **Transparency** | Many AI systems are 'black boxes' — even makers cannot explain outputs |
| **Privacy** | Training data may include personal info; outputs can leak it |
| **Accountability** | When AI errs — medical misdiagnosis, self-driving crash — who is liable? |
| **Employment** | Automation threatens routine jobs; cognitive automation now threatens creative work |
| **Misinformation** | Deepfakes, mass propaganda, fraud |
| **Concentration** | A few firms control frontier models — huge power, little oversight |
| **Safety** | Long-term risk of AI systems optimizing against human interests |

### Famous Cases
- **COMPAS** — US criminal-risk tool flagged Black defendants as higher risk
- **Amazon resume AI** — downranked women; scrapped in 2018
- ** facial recognition** — false arrests (Detroit, 2020)
- **GPT-3 medical misinformation** — confident but wrong answers
- **Deepfake political ads** — 2024 election cycles worldwide

### Emerging Regulation
- **EU AI Act** (2024) — risk-based tiers, bans social scoring, strict rules on high-risk AI
- **US Executive Order 14110** (2023) — safety reporting, watermarking standards
- **China** — algorithm registry, deepfake labeling
- **Pakistan** — Draft AI Policy 2024, still in consultation
- **Bletchley Declaration** (2023) — 28 nations pledge cooperation on frontier AI risk

### Principles
Most frameworks converge on: **human oversight, fairness, transparency, privacy, accountability, safety, and benefit to humanity.**

**Why it matters:** AI is the first technology that can make decisions on our behalf at scale — hiring, lending, diagnosing, judging. If ethics is bolted on later, harms are already baked into infrastructure and culture. Getting it right now — through inclusive datasets, red-teaming, regulation, and public literacy — decides whether AI becomes humanity's greatest tool or its most dangerous one.`,
  },

  // ----------------------------------------------------------
  // 15. WEALTH INEQUALITY
  // ----------------------------------------------------------
  {
    id: 'wealth-inequality',
    patterns: [/\b(wealth inequality|income inequality|gap between rich and poor|garibi|ameeri garibi|gini coefficient|economic inequality|wealth gap)\b/i],
    intent: 'factual_question',
    topic: 'economics',
    response: () => `## Wealth Inequality — The Widening Gap

**Wealth inequality** is the unequal distribution of assets — homes, savings, stocks, land, businesses — across a population. **Income inequality** is its cousin: unequal flow of wages and profits. Both have risen sharply in most economies since the 1980s, sparking political upheaval from Occupy Wall Street to populist elections.

### How It Is Measured
- **Gini coefficient** — 0 = perfect equality, 1 = one person owns everything. Most nations sit between 0.25 (Nordics) and 0.60 (South Africa, Brazil)
- **Top 1% / 10% share** — fraction of national income or wealth held by top earners
- **Palma ratio** — top 10% income vs bottom 40%
- **Piketty's r > g** — when return on capital exceeds growth, inequality rises

### Stark Facts
- The richest **1%** hold nearly half of global wealth
- The bottom **50%** hold under 2%
- Eight billionaires own as much as the poorest half of humanity (Oxfam)
- US wealth gap is at its widest since the 1920s

### Causes
| Driver | Mechanism |
|--------|-----------|
| **Technology** | Rewards skills, replaces routine labor |
| **Globalization** | Wins for skilled workers and capital; losses for factory workers |
| **Tax cuts** | Lower top rates, weak estate taxes |
| **Finance** | Executive pay and bonuses inflate top incomes |
| **Inheritance** | Wealth compounds across generations |
| **Monopoly power** | Big firms extract profits and stifle competition |
| **Education gap** | Premium on elite degrees keeps rising |

### Consequences
- Slower social mobility — birth predicts wealth more than talent
- Political capture — money buys policy
- Health gaps — rich live 10-15 years longer
- Social unrest, crime, extremism
- Lower aggregate demand — the rich save, the poor spend

### Proposed Solutions
- Progressive income, wealth, and inheritance taxes
- Universal basic services — health, education, housing
- Antitrust enforcement
- Worker bargaining power and minimum wage
- Baby bonds and asset-building programs for the poor
- Land and housing reform

**Why it matters:** Some inequality rewards skill and risk — useful for growth. But extreme inequality freezes mobility, poisons politics, and ultimately threatens democracy itself. The 20th century's lesson — spread opportunity widely and societies prosper; let wealth concentrate and they fracture — is being relearned the hard way in nations that forgot it.`,
  },
]
