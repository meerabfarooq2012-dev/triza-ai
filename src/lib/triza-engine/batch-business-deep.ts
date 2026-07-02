/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — BUSINESS & ECONOMICS DEEP (Batch 7-i)
 * ============================================================
 *
 *  Deeper subtopic entries for business and economics. These
 *  go one level below the foundational batch-business.ts
 *  entries: microeconomic market structures and surplus,
 *  macroeconomic aggregates and policy, schools of economic
 *  thought, equity-market mechanics, corporate accounting,
 *  marketing mix strategy, startup methodology, trade theory,
 *  banking systems, blockchain finance, behavioral economics,
 *  supply chain logistics, and corporate ethics/ESG.
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries and target
 *  SPECIFIC subtopic terms so they do not collide with the
 *  broader patterns in batch-business.ts.
 *
 *  NO external LLM API is used. These are facts TRIZA has
 *  "learned" and will express in its own voice via the
 *  self-expression + narration engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const BUSINESS_DEEP_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. MICROECONOMICS — SUPPLY, DEMAND, AND MARKET STRUCTURES
  // ----------------------------------------------------------------
  {
    id: 'microeconomics-supply-demand',
    patterns: [/\b(consumer surplus|producer surplus|deadweight loss|price ceiling|price floor|perfect competition|monopoly|oligopoly|monopolistic competition|price elasticity of demand|income elasticity|cross[- ]price elasticity|market structure|price taker)\b/i],
    keywords: ['consumer surplus', 'producer surplus', 'deadweight loss', 'price ceiling', 'perfect competition', 'monopoly', 'oligopoly', 'monopolistic competition', 'price elasticity', 'income elasticity', 'cross-price elasticity', 'market structure'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `Microeconomics studies how individual consumers, firms, and markets make decisions. The two foundational concepts are the law of demand — as price rises, quantity demanded falls — and the law of supply — as price rises, quantity supplied rises. Where the supply and demand curves cross, we find the equilibrium price, the single price at which buyers want to buy exactly what sellers want to sell.

### Elasticity

Elasticity measures how strongly quantity responds to price. Price elasticity of demand is the percentage change in quantity demanded divided by the percentage change in price. Goods with many substitutes, like soft drinks, are elastic — a small price rise causes a big drop in demand. Goods with no substitutes, like insulin, are inelastic — demand barely moves. Income elasticity captures how demand shifts when income changes (luxury goods rise sharply), and cross-price elasticity describes how demand for one good reacts when the price of another changes (substitutes up, complements down).

### Consumer and Producer Surplus

When a buyer would have paid twenty dollars but the market price is twelve, the buyer keeps eight dollars of value — that gap is consumer surplus. Aggregated across all buyers, it is the area below the demand curve and above the price. Producer surplus is the mirror image: the area above the supply curve and below the price, measuring the difference between what sellers received and the minimum they would have accepted. Together, the two surpluses add up to total economic welfare, and free competitive markets maximise this total.

### Market Structures

Markets fall on a spectrum of competition. In perfect competition, many small firms sell identical products, no one firm can set the price, and profits are competed to zero in the long run. A monopoly has a single seller with no close substitutes, allowing it to set prices above marginal cost and earn persistent profits. Oligopoly has a few large firms (like airlines or carmakers) whose decisions are interdependent — each must anticipate rivals' reactions. Monopolistic competition sits between the two: many firms, differentiated products (restaurants, clothing brands), and free entry.

### Price Controls and Deadweight Loss

When governments impose price ceilings (rent control) or price floors (minimum wage), the market cannot clear, and shortages or surpluses result. The lost trades create deadweight loss — welfare that simply disappears because mutually beneficial transactions no longer happen. Taxes also create deadweight loss by driving a wedge between what buyers pay and what sellers receive.

### Why It Matters

Microeconomics is the lens through which we understand everyday commerce. Every pricing decision, every product launch, every tax proposal, and every antitrust case rests on these ideas. Firms use elasticity to set prices that maximise revenue. Regulators use market structure analysis to decide whether to block a merger. Consumers, even without naming the concepts, behave exactly as the models predict — substituting, hunting bargains, and walking away when prices rise too far.`,
  },

  // ----------------------------------------------------------------
  // 2. MACROECONOMICS — GDP, INFLATION, AND POLICY
  // ----------------------------------------------------------------
  {
    id: 'macroeconomics-gdp-inflation',
    patterns: [/\b(nominal gdp|real gdp|gdp per capita|consumer price index|cpi|producer price index|ppi|phillips curve|frictional unemployment|structural unemployment|cyclical unemployment|natural rate of unemployment|fiscal policy|monetary policy|aggregate demand|aggregate supply|business cycle|expansion|recession|trough|peak)\b/i],
    keywords: ['nominal gdp', 'real gdp', 'gdp per capita', 'consumer price index', 'cpi', 'producer price index', 'ppi', 'phillips curve', 'frictional unemployment', 'structural unemployment', 'cyclical unemployment', 'fiscal policy', 'monetary policy', 'aggregate demand', 'business cycle'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `Macroeconomics studies the economy as a whole — output, prices, employment, and the policies that move them. Its three headline measures are gross domestic product, inflation, and unemployment, and its two main policy levers are fiscal policy and monetary policy.

### Gross Domestic Product

GDP measures the total value of all final goods and services produced within a country in a given period. Nominal GDP uses current prices, so it rises whenever prices rise — even if output is flat. Real GDP strips out price changes by using constant prices from a base year, giving a true picture of whether an economy actually grew. GDP per capita divides the total by population and is a rough proxy for average living standards, though it ignores unpaid work, environmental damage, and inequality.

### Measuring Inflation

Inflation is a sustained rise in the general price level. The Consumer Price Index (CPI) tracks a fixed basket of goods that a typical urban household buys — food, housing, transport, healthcare — and compares its cost over time. The Producer Price Index (PPI) measures prices at the factory gate, often a leading indicator for CPI. Central banks usually target around two percent inflation: high enough to give them room to cut rates in a downturn, low enough to preserve purchasing power. Hyperinflation (prices rising by thousands of percent) and deflation (prices falling, which crushes borrowers) are both dangerous.

### Unemployment

Economists distinguish three types. Frictional unemployment is the short-term gap between jobs — healthy, because it reflects workers seeking better matches. Structural unemployment occurs when workers' skills no longer match available jobs, as when manufacturing declines and software jobs expand. Cyclical unemployment rises during recessions when demand collapses. The natural rate of unemployment — frictional plus structural — is the floor below which inflation tends to accelerate, a relationship captured by the Phillips curve.

### Fiscal and Monetary Policy

Fiscal policy uses government spending and taxation. In a recession, governments can run deficits to boost demand; in a boom, they should run surpluses to cool it. Monetary policy uses interest rates and the money supply, managed by central banks. Cutting rates makes borrowing cheaper and stimulates investment; raising rates does the reverse. The two levers can reinforce or contradict each other, and political disagreements about which to use are unending.

### Business Cycles

Economies move in cycles: expansion (output and employment rising), peak (the top, often with inflation), recession (output falling for two or more quarters), and trough (the bottom, after which expansion begins again). Recessions destroy jobs and businesses; booms inflate bubbles. No cycle is identical, but the rhythm recurs.

### Why It Matters

Macroeconomic aggregates shape every household's prosperity. A few percentage points of GDP growth, sustained over decades, transform a poor country into a rich one. A few percentage points of unexpected inflation can wipe out a retiree's savings. Voters reward or punish politicians largely on macroeconomic performance, which is why governments watch GDP, inflation, and unemployment so closely — and why managing them is as much art as science.`,
  },

  // ----------------------------------------------------------------
  // 3. KEYNESIAN VERSUS MONETARIST ECONOMICS
  // ----------------------------------------------------------------
  {
    id: 'keynesian-vs-monetarist-economics',
    patterns: [/\b(keynesian|keynesian economics|keynesian multiplier|aggregate demand management|monetarist|monetarism|milton friedman|austrian school|friedrich hayek|supply[- ]side economics|laffer curve|trickle down|sound money|malinvestment|general theory)\b/i],
    keywords: ['keynesian', 'keynesian multiplier', 'aggregate demand', 'monetarist', 'monetarism', 'milton friedman', 'austrian school', 'friedrich hayek', 'supply-side economics', 'laffer curve', 'trickle down'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `Economics is not just a set of tools — it is also a battlefield of ideas. The deepest fault line of the twentieth century runs between Keynesian economics, which argues that aggregate demand drives the economy and government intervention can stabilise it, and monetarism, which argues that money supply is the key lever and that government intervention usually does more harm than good.

### Keynesian Economics

John Maynard Keynes published his General Theory in 1936, in the depths of the Great Depression. Classical economics could not explain how an economy could stay stuck below full employment for years. Keynes argued that aggregate demand — the total spending by consumers, firms, and government — could be insufficient, leaving factories idle and workers unemployed. The solution was countercyclical fiscal policy: government should borrow and spend during downturns to boost demand, even at the cost of deficits. The Keynesian multiplier amplifies this — a dollar of government spending becomes income for workers, who spend most of it, generating further income, so the total impact exceeds the initial injection.

### Monetarism and Milton Friedman

Milton Friedman led the monetarist counter-revolution in the 1960s and 1970s. He argued that inflation is always and everywhere a monetary phenomenon — too much money chasing too few goods. The Great Depression, he claimed, was caused not by a failure of markets but by the Federal Reserve allowing the money supply to collapse. Monetarists believe that stable growth of the money supply, not activist fiscal policy, is the best stabiliser. Friedman later qualified his famous line "we are all Keynesians now" by reminding readers that in the long run money still matters.

### The Austrian School

The Austrian school, rooted in the work of Friedrich Hayek and Ludwig von Mises, goes further than monetarism. Austrians argue that government intervention distorts the price signals markets need to coordinate, that central-bank credit expansion creates unsustainable booms that must end in busts, and that recessions are necessary corrections. They favour sound money, minimal intervention, and letting malinvestments clear rather than propping them up.

### Supply-Side Economics

Supply-side economics, prominent in the 1980s, shifts focus from demand to production. Lower marginal tax rates and lighter regulation, it argues, incentivise work, saving, and investment. The Laffer curve claims that beyond some point, higher tax rates collect less revenue because they discourage activity. Critics reply that the curve's low-tax sweet spot is rarely where politicians claim, and that "trickle down" gains rarely reach workers as promised.

### Modern Debates

After the 2008 financial crisis and again during the COVID-19 recession, Keynesian ideas saw a resurgence as governments ran large deficits. The 2022 inflation surge revived monetarist arguments about money growth. Most modern economists are pragmatic eclectics — Keynesian in recessions, monetarist on inflation — but the deeper philosophical divide about how much governments should intervene remains unresolved.

### Why It Matters

These debates are not academic. They determine whether a government responds to a recession with stimulus or austerity, whether central banks prioritise unemployment or inflation, and how tax burdens are distributed. Every budget, every interest-rate decision, and every election is, in part, an argument between Keynes and Friedman.`,
  },

  // ----------------------------------------------------------------
  // 4. STOCK MARKET INVESTING
  // ----------------------------------------------------------------
  {
    id: 'stock-market-investing',
    patterns: [/\b(p\/e ratio|price[- ]to[- ]earnings|market cap|market capitalization|bull market|bear market|dollar[- ]cost averaging|index fund|s&p 500|sp 500|dow jones|nasdaq composite|dividend yield|value investing|growth investing|nyse|nasdaq|stock exchange)\b/i],
    keywords: ['p/e ratio', 'price-to-earnings', 'market cap', 'market capitalization', 'bull market', 'bear market', 'dollar-cost averaging', 'index fund', 's&p 500', 'dow jones', 'nasdaq', 'dividend yield', 'value investing', 'growth investing', 'nyse'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `A stock market is where shares of public companies are bought and sold, allowing firms to raise capital and investors to share in their growth. The two largest United States exchanges are the New York Stock Exchange (NYSE), founded in 1792, and NASDAQ, founded in 1971 as the first electronic exchange. Together they list thousands of companies and trade billions of shares daily.

### Stocks, Bonds, and Market Indices

A stock represents partial ownership in a company; a bond is a loan to a company or government that pays fixed interest. Stocks offer higher expected returns but more risk; bonds offer steadier income but lower returns. To track overall market performance, investors use indices. The S&P 500 covers the 500 largest US companies and is the most widely cited benchmark. The Dow Jones Industrial Average tracks 30 large established firms. The NASDAQ Composite is weighted toward technology.

### Valuation: Price-to-Earnings, Market Cap, and Dividends

The price-to-earnings (P/E) ratio compares a stock's price to its earnings per share. A high P/E suggests investors expect fast growth; a low one suggests value or pessimism. Market capitalisation — share price times shares outstanding — classifies companies as large-cap, mid-cap, or small-cap, each with different risk and return profiles. Dividends are regular cash payments to shareholders, usually from mature companies; the dividend yield expresses the annual dividend as a percentage of the share price. Growth stocks reinvest profits instead of paying dividends.

### Bull and Bear Markets

A bull market is a sustained period of rising prices, usually accompanied by optimism and economic expansion. A bear market is a drop of twenty percent or more from peak, accompanied by pessimism and often recession. Bear markets are shorter than bull markets but can erase years of gains quickly. The worst, like 2008 or 1929, reshape regulation and investor psychology for a generation.

### Active Picking versus Index Funds

Most professional stock pickers fail to beat the market over long horizons after fees. Index funds and exchange-traded funds (ETFs) that mirror an index offer broad diversification at near-zero cost and have grown to dominate retirement accounts. Value investing (buying undervalued stocks, à la Warren Buffett) and growth investing (buying fast-rising companies) are the two classic active styles, each with devoted followers.

### Dollar-Cost Averaging

Dollar-cost averaging means investing a fixed amount at regular intervals, regardless of price. It buys more shares when prices are low and fewer when they are high, reducing the risk of putting everything in at a market peak. Combined with broad index funds and a long time horizon, it is the simplest, most reliable strategy for most individual investors.

### Why It Matters

Stock markets are how millions of households build retirement wealth and how companies finance expansion. They aggregate information — millions of buyers and sellers continuously repricing every company — and reward long-term discipline. Understanding valuation, diversification, and market cycles helps ordinary investors avoid the panic and greed that destroy returns.`,
  },

  // ----------------------------------------------------------------
  // 5. CORPORATE FINANCE AND ACCOUNTING
  // ----------------------------------------------------------------
  {
    id: 'corporate-finance-accounting',
    patterns: [/\b(balance sheet|income statement|cash flow statement|double[- ]entry bookkeeping|gaap|ifrs|return on equity|roe|return on assets|roa|debt[- ]to[- ]equity|current ratio|auditing|accrual accounting|financial statement|solvency|liquidity ratio)\b/i],
    keywords: ['balance sheet', 'income statement', 'cash flow statement', 'double-entry bookkeeping', 'gaap', 'ifrs', 'return on equity', 'roe', 'return on assets', 'roa', 'debt-to-equity', 'auditing', 'accrual accounting'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `Corporate finance and accounting are the languages of business. Accounting records what happened; finance decides what to do next. Together they answer three questions for any firm: How are we doing? What are we worth? What should we invest in?

### The Three Financial Statements

The balance sheet is a snapshot of what a company owns and owes on a single day. Assets (cash, inventory, equipment) equal liabilities (debt, payables) plus shareholders' equity — the accounting equation that must always balance. The income statement, also called the profit and loss statement, summarises revenue, expenses, and profit over a period; its bottom line is net income. The cash flow statement tracks actual cash moving in and out, broken into operating, investing, and financing activities. Profitable companies can still go bankrupt if cash runs dry, which is why the cash flow statement matters as much as the income statement.

### Double-Entry Bookkeeping

Every transaction is recorded in at least two accounts — a debit and a credit — so the books stay balanced. Sell a product for cash: debit cash, credit revenue. Buy a machine with cash: debit equipment, credit cash. This system, codified by the Renaissance mathematician Luca Pacioli in 1494, catches errors because every entry must be matched. Modern accounting software automates the mechanics, but the logic remains unchanged.

### GAAP versus IFRS

Generally Accepted Accounting Principles (GAAP), used mainly in the United States, are detailed rules-based standards set by the Financial Accounting Standards Board. International Financial Reporting Standards (IFRS), used in over 140 countries, are more principles-based. The two systems differ on inventory methods, intangible assets, and revenue recognition, complicating comparisons across borders. Convergence efforts have narrowed the gap but not eliminated it.

### Financial Ratios

Ratios turn raw statements into comparable signals. Return on equity (ROE) measures how efficiently a company generates profit from shareholders' capital. Return on assets (ROA) measures profit per dollar of assets. The debt-to-equity ratio shows how much leverage a firm carries — high leverage amplifies returns in good times and losses in bad. Liquidity ratios like the current ratio test whether a firm can pay its short-term bills. Analysts read these ratios together to assess health, compare peers, and forecast.

### Auditing and Internal Controls

External auditors examine financial statements and issue an opinion on whether they fairly represent the company's position. The clean or unqualified opinion is what public companies need. Auditors test internal controls — the procedures that prevent fraud and error — and rely on sampling, since checking every transaction is impossible. Scandals like Enron and WorldCom led to tighter rules (the Sarbanes-Oxley Act of 2002) and greater auditor independence.

### Why It Matters

Investors, lenders, suppliers, employees, and tax authorities all rely on these statements to make decisions. A firm that cannot read its own numbers cannot manage itself; an investor who cannot read them cannot judge what a share is worth. The discipline of accounting, dull as it sounds, is the bedrock on which capitalism's transparency rests — without reliable numbers, markets cannot function.`,
  },

  // ----------------------------------------------------------------
  // 6. MARKETING STRATEGY — 4 PS, SEGMENTATION, BRAND
  // ----------------------------------------------------------------
  {
    id: 'marketing-strategy-4ps',
    patterns: [/\b(marketing mix|4 ps of marketing|four ps of marketing|penetration pricing|skimming pricing|value[- ]based pricing|market segmentation|psychographic|demographic segmentation|positioning statement|brand equity|customer lifetime value|clv|aida model|aida funnel|marketing funnel|marketing automation|positioning strategy)\b/i],
    keywords: ['marketing mix', '4 ps of marketing', 'penetration pricing', 'skimming pricing', 'value-based pricing', 'market segmentation', 'psychographic', 'demographic segmentation', 'positioning statement', 'brand equity', 'customer lifetime value', 'clv', 'aida model', 'marketing funnel', 'marketing automation'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `The 4 Ps — Product, Price, Place, and Promotion — form the classic marketing mix, introduced by E. Jerome McCarthy in 1960. Every marketing decision falls somewhere in this framework: what to offer, what to charge, where to make it available, and how to communicate it.

### Product, Price, Place, Promotion

Product decisions cover features, design, packaging, branding, and lifecycle — from introduction through growth and maturity to decline. Price decisions include list price, discounts, allowances, and credit terms; pricing strategies range from penetration pricing (low price to grab share) to skimming pricing (high price that falls over time) to value-based pricing tied to perceived worth. Place is about distribution — which channels (retail, wholesale, direct online), which geographies, and how inventory reaches the customer. Promotion is the communication toolkit: advertising, public relations, sales promotion, personal selling, and increasingly content and social media.

### Segmentation, Targeting, and Positioning

Mass marketing is rare today. Instead, firms segment the market — splitting it by demographics (age, income, gender), geography, psychographics (values, lifestyle), and behaviour (usage rate, loyalty). They then target one or more segments whose needs they can serve better than competitors. Positioning is the act of carving a distinct place in the customer's mind: Volvo owns safety, Tesla owns electric performance, Walmart owns low prices. A clear positioning statement — "for this target, our brand is the category that provides this benefit" — guides every downstream choice.

### Brand Equity and Customer Lifetime Value

Brand equity is the extra value a recognised brand adds beyond the generic product. It lets a company charge more, launch new products more easily, and survive missteps. Building it takes years of consistent messaging and product quality. Customer lifetime value (CLV) estimates the total profit a customer will generate over the relationship. Comparing CLV to customer acquisition cost tells a firm whether its marketing is profitable; a healthy ratio is at least three to one.

### The AIDA Funnel and Digital Marketing

The AIDA model — Attention, Interest, Desire, Action — describes the stages a buyer moves through. Modern marketing extends it with retention and advocacy. Digital channels have transformed every stage: search engine optimisation attracts attention at the moment of need, search engine marketing buys visibility, social media builds interest and community, and email nurtures desire and action. Marketing automation lets firms tailor messages to each customer's behaviour at scale.

### Why It Matters

Marketing is how good ideas find their audiences. Without it, even the best product languishes unseen. The 4 Ps remain useful because they force marketers to make coherent choices — a luxury brand cannot discount heavily without destroying its positioning; a low-cost brand cannot spend lavishly on advertising without eroding margins. The discipline of the framework keeps strategy honest.`,
  },

  // ----------------------------------------------------------------
  // 7. ENTREPRENEURSHIP AND STARTUPS
  // ----------------------------------------------------------------
  {
    id: 'entrepreneurship-startups',
    patterns: [/\b(business model canvas|lean startup|minimum viable product|mvp\b|product[- ]market fit|bootstrapping|pitch deck|pivot|persevere|accelerator|incubator|angel investor|series a|series b|venture capital|unicorn startup|exit strategy|co[- ]founder)\b/i],
    keywords: ['business model canvas', 'lean startup', 'minimum viable product', 'mvp', 'product-market fit', 'bootstrapping', 'pitch deck', 'pivot', 'accelerator', 'incubator', 'angel investor', 'series a', 'series b', 'venture capital', 'unicorn', 'exit strategy'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `A startup is a temporary organisation designed to search for a repeatable and scalable business model under extreme uncertainty. The phrase, coined by Steve Blank, captures what makes startups different from established businesses: they are not smaller versions of big companies, they are experiments in search of a model that works.

### The Business Model Canvas

The Business Model Canvas, developed by Alexander Osterwalder, fits a complete business plan on a single page using nine blocks: customer segments, value propositions, channels, customer relationships, revenue streams, key resources, key activities, key partnerships, and cost structure. Founders use it to map assumptions, spot gaps, and rapidly test alternatives without writing a fifty-page document nobody reads.

### The Lean Startup

Eric Ries's Lean Startup methodology applies the scientific method to entrepreneurship. Founders build a minimum viable product (MVP) — the smallest thing that lets them learn — measure how customers respond, and decide whether to persevere or pivot. A pivot is a structured change in strategy based on learning: the same product to a new customer, a new feature to the same customer, or a different revenue model. The mantra is build-measure-learn, fast and cheap, with each cycle refining the model.

### Funding: Bootstrapping, Angels, and Venture Capital

Bootstrapping means growing without external funding, reinvesting early revenue. It preserves ownership and discipline but limits speed. Angel investors — wealthy individuals — provide early capital, often in exchange for equity, plus mentorship. Venture capital firms invest larger sums across stages: seed, Series A, B, C, and beyond, each round buying a slice of the company and fuelling growth. Venture capitalists expect most startups to fail but need a few breakout winners — unicorns valued over one billion dollars — to fund the portfolio.

### Pitch Decks and Product-Market Fit

A pitch deck is the ten-to-fifteen slide presentation founders use to raise money: problem, solution, market size, product, traction, business model, team, competition, financials, and the ask. The holy grail of early-stage work is product-market fit — the moment when a product genuinely satisfies a sizable market, customers pull it from the founders rather than being pushed to buy, and growth becomes a question of execution rather than discovery.

### Scaling and Exit

Once fit is found, the challenge shifts to scaling: hiring fast, building processes, expanding geographically, and preserving culture. Many startups die from indigestion (growing too fast) rather than starvation. Exit strategies include acquisition by a larger firm (most common), an initial public offering on a stock exchange (rare, reserved for the largest), or occasionally staying private indefinitely.

### Why It Matters

Startups drive a disproportionate share of new jobs, innovation, and productivity growth. They commercialise university research, attack complacent incumbents, and lower prices for consumers. Understanding how they are built — and why most fail — helps founders avoid common traps and helps investors, employees, and policymakers support the ecosystems that produce them.`,
  },

  // ----------------------------------------------------------------
  // 8. INTERNATIONAL TRADE THEORY
  // ----------------------------------------------------------------
  {
    id: 'international-trade-theory',
    patterns: [/\b(comparative advantage|absolute advantage|heckscher[- ]ohlin|opportunity cost trade|terms of trade|free trade agreement|trade bloc|european union|nafta|usmca|asean|balance of trade|trade deficit|trade surplus|exchange rate|currency depreciation|purchasing power parity|smoot[- ]hawley)\b/i],
    keywords: ['comparative advantage', 'absolute advantage', 'heckscher-ohlin', 'terms of trade', 'free trade agreement', 'trade bloc', 'european union', 'nafta', 'usmca', 'asean', 'balance of trade', 'trade deficit', 'trade surplus', 'exchange rate', 'currency depreciation', 'purchasing power parity'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `International trade theory explains why countries exchange goods and what they gain. The surprising answer, first formalised over two centuries ago, is that trade benefits both sides even when one country is more productive at everything.

### Absolute and Comparative Advantage

Adam Smith introduced absolute advantage: if one country can produce wine more efficiently and another can produce cloth more efficiently, both gain by specialising and trading. David Ricardo went deeper with comparative advantage in 1817. Even if one country is more productive in every industry, it should specialise in what it is comparatively best at, and the other country in what it is comparatively least bad at. The opportunity cost of producing each good differs across countries, and trade lets both consume beyond their own production frontiers. The Heckscher-Ohlin model refines this: countries export goods that use their abundant factors intensively — labour-rich countries export labour-intensive goods, capital-rich countries export capital-intensive goods.

### Free Trade versus Protectionism

Free trade maximises total welfare but distributes the gains unevenly — consumers win, but some producers and workers lose. Protectionism — tariffs, quotas, subsidies — shields domestic industries but raises prices and reduces choice. The 1930 Smoot-Hawley tariffs deepened the Great Depression by triggering retaliation. Modern trade agreements and the World Trade Organization try to reduce barriers through negotiated reciprocity.

### Trade Blocs and Currency Exchange

Trade blocs deepen integration among neighbours. The European Union is a customs union and single market with a common currency (the euro) for most members. NAFTA, now replaced by the USMCA, links the United States, Canada, and Mexico. ASEAN ties Southeast Asian economies. Inside a bloc, goods and often labour move freely; outside, tariffs apply. The balance of trade — exports minus imports — measures a country's net position; chronic deficits are not inherently bad if they fund productive investment, but persistent ones can strain currency and debt.

Exchange rates set the price of one currency in another. A depreciation makes exports cheaper and imports dearer, often correcting trade deficits. Purchasing power parity theory says exchange rates should adjust so identical goods cost the same everywhere, but in practice capital flows, interest rates, and expectations move currencies far from parity for years.

### Why It Matters

Trade policy shapes factory locations, job markets, and consumer prices in every country. A tariff on steel helps domestic steelmakers but raises costs for carmakers and homebuilders. Trade wars disrupt supply chains and squeeze farmers who lose export markets. Understanding the theory helps citizens judge whether a proposed tariff, agreement, or sanction will help or hurt — and reminds us that the gains from trade, though real, are never automatically shared.`,
  },

  // ----------------------------------------------------------------
  // 9. BANKING SYSTEMS AND CENTRAL BANKS
  // ----------------------------------------------------------------
  {
    id: 'banking-systems-central-banks',
    patterns: [/\b(commercial bank|central bank|federal reserve|european central bank|bank of japan|bank of england|fractional reserve banking|reserve requirement|open market operations|discount window|discount rate|lender of last resort|bank run|deposit insurance|fdic|quantitative easing|bank capital|liquidity buffer)\b/i],
    keywords: ['commercial bank', 'central bank', 'federal reserve', 'european central bank', 'bank of japan', 'bank of england', 'fractional reserve banking', 'reserve requirement', 'open market operations', 'discount window', 'discount rate', 'lender of last resort', 'bank run', 'deposit insurance', 'fdic', 'quantitative easing'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `A banking system has two layers: commercial banks that serve households and firms, and central banks that oversee the system and the currency. Together they create money, allocate credit, and transmit monetary policy through the entire economy.

### Commercial Banks

Commercial banks take deposits from savers and lend to borrowers, profiting from the spread between the interest they pay and the interest they charge. They also process payments, issue credit cards, and offer hedging products. Modern banking rests on fractional reserve banking: banks hold only a fraction of deposits as reserves and lend out the rest. A new loan creates a new deposit, expanding the money supply. The money multiplier tells us how much the total money supply grows from each dollar of reserves — roughly the inverse of the reserve requirement ratio.

### Central Banks

The central bank is the bank for banks and for the government. Major examples include the Federal Reserve (United States), the European Central Bank, the Bank of Japan, and the Bank of England. Central banks conduct monetary policy, supervise commercial banks, manage foreign reserves, and act as lender of last resort during crises. Their goals vary — the Fed has a dual mandate for stable prices and maximum employment, while the European Central Bank focuses on price stability.

### Tools of Monetary Policy

Central banks steer the economy through several tools. Open market operations — buying or selling government bonds — expand or shrink reserves in the banking system. The discount rate is the interest rate central banks charge commercial banks for emergency loans through the discount window; lowering it eases conditions, raising it tightens them. Reserve requirements set the minimum reserves banks must hold; changing them is a blunt instrument used rarely. Since 2008, central banks have also used quantitative easing — large-scale purchases of long-term securities — to push down long-term rates when short-term rates hit zero.

### Bank Runs and Deposit Insurance

Because banks lend out deposits, they cannot repay everyone at once. A bank run — depositors rushing to withdraw — can collapse even a healthy bank. To prevent this, most countries have deposit insurance (the FDIC in the United States insures deposits up to a cap), central banks stand ready to lend against good collateral, and regulators require capital and liquidity buffers. The 2008 failure of Lehman Brothers and the 2023 runs on Silicon Valley Bank showed that runs still happen, especially when uninsured deposits and digital banking let money leave in minutes.

### Why It Matters

Banks are the plumbing of the modern economy. When credit flows freely, businesses invest and households buy homes; when it freezes, recessions follow. Central banks, with a few keystrokes, can move trillions of dollars and shift the cost of every mortgage on Earth. Understanding how the system works — and how fragile it can be — is essential for anyone who uses money, which is to say everyone.`,
  },

  // ----------------------------------------------------------------
  // 10. CRYPTOCURRENCY AND BLOCKCHAIN FINANCE
  // ----------------------------------------------------------------
  {
    id: 'cryptocurrency-blockchain-finance',
    patterns: [/\b(satoshi nakamoto|digital gold|stablecoin|central bank digital currency|cbdc|smart contract|decentralized exchange|dex|yield farming|automated market maker|amm|non[- ]fungible token|nft|layer 2|rollup|tokenomics|proof of stake|proof of work|crypto regulation|markets in crypto[- ]assets|tokenized securities)\b/i],
    keywords: ['satoshi nakamoto', 'digital gold', 'stablecoin', 'central bank digital currency', 'cbdc', 'smart contract', 'decentralized exchange', 'dex', 'yield farming', 'automated market maker', 'amm', 'non-fungible token', 'nft', 'layer 2', 'rollup', 'tokenomics', 'proof of stake', 'proof of work', 'crypto regulation'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `Blockchain is a distributed ledger that records transactions in blocks linked by cryptographic hashes, so altering any past record requires redoing all subsequent work. Cryptocurrencies use this technology to transfer value without a trusted intermediary. Bitcoin, launched in 2009 by the pseudonymous Satoshi Nakamoto, was the first and remains the largest by market value.

### Bitcoin as Digital Gold

Bitcoin's fixed supply cap of 21 million coins and its energy-intensive proof-of-work consensus make it scarce and expensive to produce, properties its proponents compare to gold. It is held as a hedge against fiat inflation, though its price volatility undermines the store-of-value claim. Critics point to energy use and slow transaction throughput; supporters reply that the security model is worth the cost. Ethereum, the second-largest cryptocurrency, took a different direction: a programmable blockchain that runs smart contracts and now uses proof of stake.

### Stablecoins, DeFi, and DEXs

Stablecoins peg their value to a fiat currency, usually the US dollar, using reserves or algorithms. They act as a bridge between traditional and crypto markets and as a medium of exchange within decentralised finance. DeFi protocols recreate financial services on chain: lending platforms let users earn interest on deposits or borrow against collateral, decentralised exchanges (DEXs) let users swap tokens without an order book using automated market makers, and yield farming lets users earn token rewards for providing liquidity. Returns can be high, but so are the risks of bugs, exploits, and sudden liquidations.

### CBDCs and NFTs

Central bank digital currencies (CBDCs) are digital forms of fiat money issued directly by central banks. Unlike cryptocurrencies, they are centralised and programmable, raising both efficiency hopes (faster payments, financial inclusion) and privacy concerns. China's digital yuan and Nigeria's eNaira are early live examples. Non-fungible tokens (NFTs) represent unique digital items — artwork, collectibles, in-game assets — on a blockchain. Their 2021 boom and subsequent collapse illustrated both the potential of verifiable digital ownership and the dangers of speculative mania.

### Smart Contracts and Layer 2

Smart contracts are self-executing code that runs on a blockchain, enforcing agreements without lawyers or escrow agents. They power DeFi, NFT marketplaces, and decentralised autonomous organisations. Because blockchains are slow and costly, layer-2 networks like payment channels and rollups process transactions off-chain and settle on-chain, scaling throughput without sacrificing security.

### Regulation and Enterprise Use

Regulation is catching up. The European Union's Markets in Crypto-Assets regulation, United States securities enforcement, and anti-money-laundering rules are reshaping the industry. Beyond currency, blockchain is used in supply chain finance to track invoices, in trade finance to speed letter-of-credit processing, and in tokenised securities to settle trades instantly.

### Why It Matters

Whether cryptocurrency becomes the foundation of a new financial system or remains a niche asset class, the underlying technology is already reshaping how value is recorded and transferred. Understanding its mechanics — and its limits — helps users and policymakers separate genuine innovation from hype, and avoid the losses that have accompanied every crypto cycle.`,
  },

  // ----------------------------------------------------------------
  // 11. BEHAVIORAL ECONOMICS AND BIASES
  // ----------------------------------------------------------------
  {
    id: 'behavioral-economics-biases',
    patterns: [/\b(behavioral economics|behavioural economics|prospect theory|loss aversion|endowment effect|anchoring bias|confirmation bias|availability heuristic|bounded rationality|nudge theory|choice architecture|default option|libertarian paternalism|daniel kahneman|amos tversky|richard thaler)\b/i],
    keywords: ['behavioral economics', 'behavioural economics', 'prospect theory', 'loss aversion', 'endowment effect', 'anchoring bias', 'confirmation bias', 'availability heuristic', 'bounded rationality', 'nudge theory', 'choice architecture', 'default option', 'libertarian paternalism', 'daniel kahneman', 'amos tversky', 'richard thaler'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `Classical economics assumes rational agents who maximise utility with perfect information. Behavioral economics, pioneered by Daniel Kahneman and Amos Tversky in the 1970s, showed that real humans consistently deviate from this ideal in predictable ways. The findings have reshaped finance, marketing, public policy, and medicine.

### Prospect Theory and Loss Aversion

Prospect theory, described by Kahneman and Tversky in 1979, replaced expected utility theory as a description of how people actually choose under risk. The key insight is that gains and losses are evaluated relative to a reference point, not in absolute terms — and losses loom larger than equivalent gains. The pain of losing one hundred dollars is roughly twice the pleasure of winning it. This loss aversion explains why people hold losing stocks too long, refuse to sell houses below their purchase price, and demand much more to give up something they own than they would pay to acquire it (the endowment effect).

### Anchoring, Confirmation, and Availability

Anchoring bias is the tendency to rely too heavily on the first piece of information encountered. A seller who lists a house at an inflated price biases buyers upward, even if they know the price is high. Confirmation bias leads people to seek and credit evidence that supports their existing beliefs while dismissing contrary evidence, fuelling bubbles and polarisation. The availability heuristic makes vivid recent events feel more probable than they are — plane crashes after a headline crash feel riskier even though statistics are unchanged.

### Bounded Rationality and Heuristics

Herbert Simon's bounded rationality, the intellectual ancestor of behavioral economics, observed that humans have limited time, information, and cognitive capacity, so they satisfice — pick good-enough options rather than optimal ones. They use heuristics, mental shortcuts that work most of the time but fail systematically in predictable situations. Recognising these patterns lets policymakers design institutions that work with human nature rather than against it.

### Nudge Theory and Choice Architecture

Richard Thaler and Cass Sunstein's nudge theory argues that the way choices are presented — choice architecture — strongly influences what people pick, even when all options remain available. Default options are extraordinarily powerful: enrolment in retirement savings plans jumps when employees must opt out rather than opt in. Organ donation rates rise sharply with presumed consent. A nudge preserves freedom of choice while steering people toward better outcomes, an approach Thaler and Sunstein call libertarian paternalism.

### Applications and Limits

Behavioral insights now shape tax reminders, health campaigns, and consumer protection rules. They have also been criticised: nudges can be manipulative, their effects are often small, and they can distract from structural reforms. The replication crisis has touched some classic studies.

### Why It Matters

Behavioral economics humanises the discipline. It explains why markets are not always efficient, why consumers do not always act in their interest, and why policies designed for rational agents often fail. For individuals, knowing these biases is the first defence against them — recognising a sunk cost, questioning an anchor, or seeking disconfirming evidence can change a decision, a career, or a portfolio.`,
  },

  // ----------------------------------------------------------------
  // 12. SUPPLY CHAIN AND LOGISTICS
  // ----------------------------------------------------------------
  {
    id: 'supply-chain-logistics',
    patterns: [/\b(supply chain management|just[- ]in[- ]time|just[- ]in[- ]case|jit inventory|jic inventory|lean manufacturing|six sigma|lean six sigma|bullwhip effect|nearshoring|friendshoring|third[- ]party logistics|3pl|containerization|warehouse management|inventory holding cost|toyota production system)\b/i],
    keywords: ['supply chain management', 'just-in-time', 'just-in-case', 'jit inventory', 'jic inventory', 'lean manufacturing', 'six sigma', 'lean six sigma', 'bullwhip effect', 'nearshoring', 'friendshoring', 'third-party logistics', '3pl', 'containerization', 'warehouse management', 'toyota production system'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `A supply chain is the network of organisations, people, activities, information, and resources that move a product from raw materials to the final customer. Managing it well is the difference between a profitable firm and a failing one — and, as recent crises have shown, between essential goods reaching shelves and not.

### Supply Chain Management

Supply chain management coordinates procurement, production, inventory, transportation, and distribution so that the right goods are in the right place at the right time at the right cost. It involves trade-offs: lower inventory reduces holding cost but raises the risk of stockouts; longer production runs cut unit cost but increase inventory. Optimising across these trade-offs is a core operations discipline.

### Inventory: JIT versus JIC

Just-in-time (JIT) inventory, pioneered by Toyota in the mid-twentieth century, aims to hold minimal stock by receiving parts exactly when needed. It cuts warehousing costs, exposes quality problems quickly, and forces tight supplier coordination. Just-in-case (JIC) inventory holds larger buffers to absorb disruptions. After COVID-19, the semiconductor shortage, and shipping crises, many firms shifted back toward JIC, accepting higher carrying costs for resilience.

### Lean Manufacturing and Six Sigma

Lean manufacturing, derived from the Toyota Production System, eliminates waste — overproduction, waiting, transport, over-processing, inventory, motion, and defects. Six Sigma, developed at Motorola in the 1980s, uses statistical methods to reduce variation and defects to fewer than 3.4 per million opportunities. Lean Six Sigma combines the two. Together they have transformed manufacturing, healthcare, and services, though critics note they can stifle innovation when over-applied.

### Logistics: Shipping and Warehousing

Logistics is the physical movement and storage of goods. Containerisation, standardised in the 1960s, slashed shipping costs and enabled globalisation; a single forty-foot container can move from a factory in Asia to a warehouse in Europe for a few thousand dollars. Warehousing has evolved from passive storage to active fulfilment centres, with robotics, conveyor systems, and warehouse-management software picking and packing individual orders in minutes. Third-party logistics providers (3PLs) run these operations for firms that prefer not to.

### The Bullwhip Effect and Disruptions

The bullwhip effect describes how small fluctuations in consumer demand amplify upstream through the supply chain. A ten percent rise in retail sales can become a fifty percent spike at the factory as each layer orders extra to be safe. Information sharing and shorter lead times dampen the whip. Recent disruptions — COVID lockdowns, the Suez Canal blockage, wars — exposed the fragility of long, lean supply chains. Nearshoring and friendshoring, moving production closer to home or to allied countries, are now reshaping global manufacturing.

### Why It Matters

Supply chains determine product availability, prices, and the resilience of entire economies. A shortage of one component can halt car production on three continents; a port closure can empty shelves within weeks. Understanding how supply chains work — and where they break — helps firms design robust operations, governments prepare for crises, and consumers appreciate the extraordinary complexity behind everyday goods.`,
  },

  // ----------------------------------------------------------------
  // 13. BUSINESS ETHICS AND CORPORATE RESPONSIBILITY
  // ----------------------------------------------------------------
  {
    id: 'business-ethics-corporate-responsibility',
    patterns: [/\b(corporate social responsibility|csr\b|esg|environmental social governance|stakeholder theory|shareholder theory|friedman doctrine|corporate governance|greenwashing|sustainability reporting|triple bottom line|business roundtable|sarbanes[- ]oxley|board independence|executive compensation|ethical framework)\b/i],
    keywords: ['corporate social responsibility', 'csr', 'esg', 'environmental social governance', 'stakeholder theory', 'shareholder theory', 'friedman doctrine', 'corporate governance', 'greenwashing', 'sustainability reporting', 'triple bottom line', 'business roundtable', 'sarbanes-oxley', 'board independence', 'executive compensation'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `Business ethics asks how firms should behave when law and profit pull in different directions. The field has evolved from "do no harm" compliance to broader questions about whom companies serve and what duties they owe society.

### Shareholder versus Stakeholder Theory

Milton Friedman's 1970 essay argued that the sole social responsibility of business is to increase profits for shareholders within the rules of the game — the shareholder theory, often called the Friedman doctrine. Anything else, he claimed, was spending someone else's money without consent. Stakeholder theory, advanced by R. Edward Freeman, counters that firms have obligations to all who affect or are affected by them — employees, customers, suppliers, communities, and the environment — not just shareholders. The Business Roundtable's 2019 statement redefining corporate purpose marked a high-water mark for stakeholder thinking, though how much has actually changed is contested.

### Corporate Social Responsibility

Corporate social responsibility (CSR) covers voluntary actions that go beyond legal compliance: philanthropy, community investment, fair labour practices, and environmental stewardship. Early CSR was often philanthropic window dressing, but modern CSR integrates ethics into strategy. Companies publish CSR or sustainability reports, set emissions targets, and tie executive pay to social metrics. Critics argue much of this is performative; defenders reply that even imperfect disclosure drives improvement.

### ESG: Environmental, Social, Governance

ESG is a framework for measuring non-financial factors that affect risk and return. Environmental criteria cover carbon emissions, resource use, and pollution. Social criteria cover labour practices, diversity, and community impact. Governance criteria cover board independence, executive compensation, and shareholder rights. ESG investing, now worth tens of trillions of dollars, channels capital toward higher-rated firms. The acronym is criticised for lacking rigour and inviting greenwashing, but it has forced companies to disclose data they previously ignored.

### Corporate Governance

Corporate governance is the system of rules, practices, and processes by which firms are directed and controlled. It separates ownership (shareholders) from control (managers) and tries to align the two through boards, audits, compensation, and shareholder rights. Weak governance enabled scandals from Enron to Wirecard. Strong governance — independent directors, transparent accounting, accountable executives — reduces fraud and improves long-term performance.

### Greenwashing and Sustainability Reporting

Greenwashing is the practice of exaggerating or fabricating environmental credentials to win customers and investors. Examples range from vague "eco-friendly" labels to claims of carbon neutrality based on dubious offsets. Regulators in the European Union and United States are tightening disclosure rules and standardising reporting frameworks so that sustainability claims can be audited like financial statements.

### Why It Matters

Ethical failures destroy value — fines, boycotts, and reputational damage can exceed any short-term gain. More importantly, businesses shape the societies they operate in: they employ billions of people, consume vast resources, and influence politics. Decisions about whom to serve, what to disclose, and how to balance profit against impact are not just questions of compliance but of what kind of economy we want to live in.`,
  },
]
