/**
 * ============================================================
 *  TRIZA KNOWLEDGE BASE — ECONOMICS, FINANCE & BUSINESS (Batch 15)
 * ============================================================
 *
 *  How markets, money, companies, and trade actually work:
 *  supply and demand, inflation, interest rates, investing,
 *  entrepreneurship, GDP, budgeting, marketing, globalization,
 *  and cryptocurrency.
 *
 *  Each entry follows the KnowledgeEntry schema from types.ts.
 *  Patterns use \b(...)\b/i word boundaries so TRIZA can match
 *  precise questions about money and markets.
 *
 *  NO external LLM API is used. These are facts TRIZA has
 *  "learned" and will express in its own voice via the
 *  self-expression + narration engine.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const BUSINESS_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------------
  // 1. SUPPLY, DEMAND, AND EQUILIBRIUM
  // ----------------------------------------------------------------
  {
    id: 'economics-supply-demand',
    patterns: [/\b(supply|demand|equilibrium|equilibrium price|market price|supply curve|demand curve|elasticity|price elasticity|law of demand|law of supply|shift in demand|shift in supply)\b/i],
    keywords: ['supply', 'demand', 'equilibrium', 'elasticity', 'market price', 'supply curve', 'demand curve'],
    intent: 'factual_question',
    topic: 'economics',
    response: () => `Supply and demand is the most powerful idea in economics. Almost every question about prices, wages, shortages, and surpluses comes back to it. The model was first sketched by Adam Smith in 1776 and sharpened by Alfred Marshall in 1890 into the crossing curves we still draw today.

### The Law of Demand
The law of demand says that, all else equal, when the price of something rises, the quantity people want to buy falls. When the price falls, the quantity demanded rises. This is not a moral claim — it is an observation about behavior. At a higher price, some buyers drop out, some switch to substitutes, and some simply buy less. The demand curve slopes downward.

### The Law of Supply
The law of supply says that, all else equal, when the price of something rises, the quantity producers want to sell rises. Higher prices make production more profitable, so existing firms produce more and new firms enter the market. The supply curve slopes upward.

### Equilibrium Price
Where the two curves cross, the quantity buyers want equals the quantity sellers want to sell. That crossing point is the equilibrium, or market-clearing, price. At this price there is no shortage and no surplus — the market clears. If the price is above equilibrium, supply exceeds demand and unsold goods pile up, forcing sellers to cut prices. If the price is below equilibrium, demand exceeds supply, shortages appear, and buyers bid prices up.

### Shifts Versus Movements
This distinction trips up many students. A change in the price of the good moves us along the existing curve — that is a movement. A change in anything else shifts the whole curve. Demand shifts when income changes, tastes change, the price of substitutes changes, or the number of buyers changes. Supply shifts when input costs change, technology improves, taxes change, or the number of sellers changes. A rightward demand shift with supply unchanged raises both price and quantity.

### Elasticity
Elasticity measures how strongly quantity responds to price. If a 10 percent price rise causes a 20 percent drop in quantity demanded, demand is elastic — buyers are sensitive. If it causes only a 2 percent drop, demand is inelastic — buyers are stuck. necessities like insulin and gasoline are inelastic; luxuries and goods with many substitutes are elastic.

### Why It Matters
Supply and demand explains why concert tickets cost more than movies, why snow shovels cost more after a blizzard, why ride-share prices surge on New Year's Eve, and why salaries rise in fast-growing industries. It is the lens through which almost every market outcome becomes intelligible.`,
  },

  // ----------------------------------------------------------------
  // 2. INFLATION
  // ----------------------------------------------------------------
  {
    id: 'economics-inflation',
    patterns: [/\b(inflation|deflation|hyperinflation|disinflation|cpi|consumer price index|purchasing power|demand[- ]pull|cost[- ]push|stagflation|price level)\b/i],
    keywords: ['inflation', 'deflation', 'hyperinflation', 'cpi', 'consumer price index', 'purchasing power', 'stagflation'],
    intent: 'factual_question',
    topic: 'economics',
    response: () => `Inflation is the general rise in prices across an economy over time. When inflation is positive, each unit of currency buys fewer goods and services than it did before — the purchasing power of money falls. A low and steady inflation rate, around 2 percent per year, is what most central banks aim for. Too much inflation erodes savings and wages; too little, or negative inflation, can stall an economy.

### Measuring Inflation: The CPI
The most common measure is the Consumer Price Index, or CPI. Statisticians build a basket of goods and services that a typical household buys — rent, food, fuel, clothing, healthcare, education — and track how much that basket costs over time. If the basket cost 100 last year and 103 this year, inflation is 3 percent. Other measures include the Producer Price Index, which tracks what producers pay, and the GDP deflator, which covers all goods produced in the economy.

### Causes of Inflation
Economists sort causes into two main types. Demand-pull inflation happens when total demand in the economy grows faster than supply — too much money chasing too few goods. A boom, a surge in government spending, or a rapid expansion of credit can all pull prices up. Cost-push inflation happens when the cost of production rises — a spike in oil prices, a jump in wages, or a supply chain breakdown — and producers pass the higher costs on to consumers. Sometimes expectations alone drive inflation: if businesses and workers expect higher prices, they raise prices and wages preemptively, and the expectation becomes self-fulfilling.

### Hyperinflation
Hyperinflation is inflation gone wild — prices rising by 50 percent or more per month. Germany in 1923, Zimbabwe in 2008, and Venezuela in recent years are grim examples. A loaf of bread that cost one mark in the morning could cost billions by evening. Hyperinflation usually happens when a government prints money to cover enormous deficits, destroys trust in the currency, and watches people flee to foreign money or barter.

### Deflation
Deflation is the opposite — a general fall in prices. It sounds pleasant, but it is dangerous. When prices fall, consumers delay purchases expecting lower prices tomorrow, demand drops, businesses cut wages and jobs, and the spiral deepens. Japan has fought deflation for decades. Central banks generally fear deflation more than moderate inflation.

### Stagflation
Stagflation is the unhappy combination of stagnant growth, high unemployment, and rising prices. The 1970s oil shocks produced stagflation across the industrial world, and it confounded economists who had thought inflation and unemployment moved in opposite directions.

### Why It Matters
Inflation quietly redistributes wealth — from creditors to debtors, from savers to borrowers, from people on fixed incomes to people whose wages rise with prices. Understanding it is essential for negotiating wages, choosing investments, and judging economic policy.`,
  },

  // ----------------------------------------------------------------
  // 3. INTEREST RATES
  // ----------------------------------------------------------------
  {
    id: 'finance-interest-rates',
    patterns: [/\b(interest rate|interest rates|simple interest|compound interest|apr|annual percentage rate|apy|central bank|federal reserve|fed funds rate|discount rate|monetary policy)\b/i],
    keywords: ['interest rate', 'simple interest', 'compound interest', 'apr', 'central bank', 'federal reserve', 'monetary policy'],
    intent: 'factual_question',
    topic: 'finance',
    response: () => `An interest rate is the price of money. When you borrow, it is what you pay for using someone else's money. When you save or invest, it is what you earn for letting others use yours. Small differences in interest rates, compounded over years, make enormous differences in outcomes — for individuals, companies, and whole countries.

### Simple Versus Compound Interest
Simple interest is calculated only on the original amount, called the principal. If you lend 100 dollars at 5 percent simple interest for three years, you earn 5 dollars each year, for a total of 15 dollars. Compound interest is calculated on the principal plus all previously earned interest. The same 100 dollars at 5 percent compounded annually earns 5 dollars the first year, 5.25 dollars the second year (5 percent of 105), and about 5.51 dollars the third year. Albert Einstein is often quoted as calling compound interest the eighth wonder of the world; whether or not he said it, the math is genuinely astonishing. Over 30 years, 100 dollars invested at 7 percent compounded annually grows to about 761 dollars — without adding another cent.

### APR and APY
The Annual Percentage Rate, or APR, is the yearly cost of borrowing, including interest and most fees, expressed as a single percentage. The Annual Percentage Yield, or APY, is the yearly return on savings, with compounding already factored in. A savings account advertised at 5 percent APY on 1,000 dollars pays about 50 dollars over a year. A credit card with a 24 percent APR charges roughly 2 percent per month on any unpaid balance. Always compare APRs when borrowing and APYs when saving.

### How Central Banks Set Rates
Interest rates throughout the economy trace back to one number set by a central bank — the Federal Reserve in the United States, the European Central Bank in the eurozone, the Bank of England, and so on. The central bank sets a target for the rate at which commercial banks lend to each other overnight (in the U.S. this is the federal funds rate). When the central bank lowers that target, money becomes cheaper throughout the economy — mortgage rates fall, business loans cheapen, and spending tends to rise. When the central bank raises the target, money becomes more expensive, borrowing falls, and inflation tends to cool.

### Why Interest Rates Matter
Interest rates are the gravity of finance. They set the cost of every loan, the return on every bond, and the discount rate used to value every future cash flow. When rates rise, existing bonds fall in value, mortgage payments get heavier, and stock valuations tend to drop. When rates fall, the opposite happens. Whole industries — housing, banking, private equity — expand and contract with the rate cycle. Watching central bank decisions is one of the most important habits in personal finance and investing.`,
  },

  // ----------------------------------------------------------------
  // 4. INVESTING — STOCKS, BONDS, AND FUNDS
  // ----------------------------------------------------------------
  {
    id: 'finance-investing-stocks',
    patterns: [/\b(stocks?|shares?|bonds?|mutual funds?|index funds?|etf|etfs|diversification|risk and return|risk vs return|compounding|investing|investment|portfolio)\b/i],
    keywords: ['stocks', 'shares', 'bonds', 'mutual funds', 'index funds', 'etf', 'diversification', 'risk', 'return', 'portfolio'],
    intent: 'factual_question',
    topic: 'finance',
    response: () => `Investing is the act of putting money to work so it grows over time. Saving keeps money safe; investing puts it at risk in exchange for the chance of higher returns. The gap between the two — the risk premium — is the engine that has built most private wealth in the modern era.

### Stocks
A stock is a share of ownership in a company. When you buy one share of a company, you own a tiny slice of its assets and its future profits. Stockholders make money in two ways: the share price can rise as the company grows, and the company may pay dividends — a portion of profits distributed to shareholders. Stocks are riskier than savings because prices swing widely and companies can fail entirely, but historically they have delivered the highest long-term returns of any major asset class. The U.S. stock market has averaged roughly 10 percent annual returns over the last century, before inflation.

### Bonds
A bond is a loan you make to a borrower — usually a government or a large corporation — in exchange for regular interest payments and the return of your principal at a set date. Bonds are generally less risky than stocks because bondholders are paid first if a company goes bankrupt, but their returns are also lower. Government bonds from stable countries are considered virtually risk-free and serve as the benchmark for all other interest rates.

### Mutual Funds and ETFs
A mutual fund pools money from many investors and buys a basket of stocks, bonds, or other assets, managed by a professional. An Exchange-Traded Fund, or ETF, does the same but trades on an exchange like a stock, so you can buy and sell it throughout the day. Index funds — a special kind of mutual fund or ETF — simply hold all the stocks in a market index like the S&P 500, with no active management. Because they require almost no work, their fees are extremely low, and decades of research show they beat the vast majority of actively managed funds over long periods.

### Diversification
Diversification is the only free lunch in investing, as the saying goes. By spreading money across many different assets — different companies, industries, and countries — you reduce the chance that any single failure ruins you. A single stock can go to zero; a broadly diversified index fund cannot. Diversification cannot eliminate market-wide risk, but it sharply reduces the company-specific kind.

### Risk Versus Return
The core law of investing is that higher expected return comes with higher risk. Treasury bonds pay little because they are safe. Startup equity can pay enormous returns because most startups fail. Each investor must decide how much risk they can afford — financially and emotionally — and build a portfolio to match.

### Compounding
Returns earned on prior returns is compounding, and over decades it is the most powerful force in personal finance. The earlier you start investing, even with small amounts, the more time compounding has to work. Someone who invests 5,000 dollars a year from age 25 to 35 and then stops will typically end up with more at retirement than someone who invests 5,000 dollars a year from age 35 to 65. Time, not timing, is what builds wealth.`,
  },

  // ----------------------------------------------------------------
  // 5. ENTREPRENEURSHIP AND THE STARTUP LIFECYCLE
  // ----------------------------------------------------------------
  {
    id: 'business-entrepreneurship',
    patterns: [/\b(entrepreneur|entrepreneurs|entrepreneurship|startup|startups|business plan|funding|seed funding|series a|series b|venture capital|vc|angel investor|ipo|initial public offering|business model|founder|founders)\b/i],
    keywords: ['entrepreneur', 'startup', 'business plan', 'seed funding', 'series a', 'venture capital', 'angel investor', 'ipo', 'founder'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `An entrepreneur is someone who identifies a problem or opportunity, organizes resources to address it, and takes on financial risk in exchange for the chance of reward. Entrepreneurship is the engine that produces most new jobs, most new products, and most of the disruption that keeps economies dynamic. It is also brutally hard — most new businesses fail within five years.

### What Entrepreneurs Actually Do
The popular image is the visionary with a brilliant idea. In practice, entrepreneurship is mostly execution. Founders identify a real customer pain, design a solution, test it with users, raise money, hire a team, set priorities, manage cash, and adapt constantly when reality refuses to cooperate. Surveys of successful founders consistently find that the quality of execution matters far more than the originality of the idea.

### The Startup Lifecycle
A startup is a young company built to grow fast. The lifecycle typically moves through several stages. In the idea or pre-seed stage, founders refine the concept, build a prototype, and search for the first few customers. In the seed stage, they raise a small amount of money to prove the product fits a real market — what investors call product-market fit. With that proof, they raise a Series A round to scale the business, a Series B to expand further, and later rounds (Series C, D, and beyond) to enter new markets or prepare for acquisition or public offering.

### Funding Stages
Money at each stage comes from different sources. Founders, friends, and family often fund the earliest work. Angel investors — wealthy individuals — provide seed capital in exchange for equity. Venture capital firms manage funds that invest larger sums in Series A and beyond, taking significant ownership and board seats in return. Each round dilutes the founders' ownership but ideally raises the company's value enough that everyone ends up with more.

### The Business Plan
A business plan lays out the opportunity, the product, the target market, the competitive landscape, the business model (how the company makes money), the team, the milestones, and the financial projections. Modern startups often replace the heavy written plan with a Lean Canvas — a one-page summary — and iterate quickly based on customer feedback.

### The IPO
An Initial Public Offering, or IPO, is the moment a private company sells shares to the public on a stock exchange. It raises a large amount of capital, lets early investors and employees cash in some of their equity, and exposes the company to public reporting requirements and quarterly earnings pressure. Companies like Apple, Amazon, and Tesla all began as small startups and grew into public giants through this path.

### Why It Matters
Almost every product, service, and technology you use daily came from an entrepreneur willing to take a risk. Understanding how startups form and grow demystifies how innovation moves from idea to industry, and helps anyone — employee, investor, customer, or future founder — navigate the modern economy.`,
  },

  // ----------------------------------------------------------------
  // 6. GDP AND ECONOMIC GROWTH
  // ----------------------------------------------------------------
  {
    id: 'economics-gdp-growth',
    patterns: [/\b(gdp|gross domestic product|real gdp|nominal gdp|recession|depression|economic growth|business cycle|boom|bust|expansion|contraction|per capita gdp)\b/i],
    keywords: ['gdp', 'gross domestic product', 'real gdp', 'nominal gdp', 'recession', 'economic growth', 'business cycle'],
    intent: 'factual_question',
    topic: 'economics',
    response: () => `Gross Domestic Product, or GDP, is the broadest single measure of an economy's size and activity. It is the total value of all goods and services produced within a country during a given period, usually a year or a quarter. When you hear that the U.S. economy is 25 trillion dollars, or that China's economy grew 5 percent, GDP is what is being talked about.

### How GDP Is Measured
GDP can be calculated three ways, and all three should give the same answer. The production approach adds up the value of everything produced. The income approach adds up everything earned — wages, profits, rents, taxes. The expenditure approach — the most common — adds up everything spent: consumption by households, investment by businesses, government spending, and net exports (exports minus imports). The familiar formula is C plus I plus G plus (X minus M).

### Nominal Versus Real GDP
Nominal GDP is measured in current prices — it can rise simply because prices rose, even if the economy produced no more. Real GDP adjusts for inflation, so it reflects actual changes in output. If nominal GDP grows 6 percent but inflation is 4 percent, real GDP grew only 2 percent. Real GDP is the number economists watch when judging whether the economy is genuinely expanding.

### Per Capita GDP
Total GDP tells you how big an economy is; GDP per capita — total GDP divided by population — tells you how rich, on average, each person is. India has a larger GDP than Switzerland, but Switzerland's per capita GDP is many times higher because its population is far smaller. Per capita GDP is a rough proxy for average living standards.

### The Business Cycle
Economies do not grow in a straight line. They move in waves called the business cycle: expansion, peak, contraction (recession), and trough, then expansion again. During an expansion, output, employment, incomes, and trade all rise. At the peak, growth tops out. During a contraction, output falls, unemployment rises, and profits shrink. At the trough, the decline bottoms out and recovery begins.

### Recessions and Depressions
A common rule of thumb defines a recession as two consecutive quarters of falling real GDP, though the official call in the U.S. is made by the National Bureau of Economic Research based on a broader set of indicators. Recessions are painful — jobs are lost, businesses close, savings shrink. A depression is a severe and prolonged recession; the Great Depression of the 1930s saw U.S. unemployment peak near 25 percent and global output collapse by about 15 percent.

### Why It Matters
GDP is imperfect — it ignores unpaid work, environmental damage, and inequality — but it remains the single most useful summary of economic activity. Whether wages will rise, whether jobs will be plentiful, whether tax revenues will fund public services: all of these trace back, in large part, to whether real GDP is growing and how fast.`,
  },

  // ----------------------------------------------------------------
  // 7. PERSONAL BUDGETING AND SAVING
  // ----------------------------------------------------------------
  {
    id: 'finance-budgeting-saving',
    patterns: [/\b(budget|budgeting|saving|savings|emergency fund|50\/30\/20|debt payoff|retirement|retirement savings|401k|ira|compound savings|personal finance|expense tracking)\b/i],
    keywords: ['budget', 'budgeting', 'saving', 'savings', 'emergency fund', '50/30/20', 'debt payoff', 'retirement', '401k', 'ira'],
    intent: 'factual_question',
    topic: 'finance',
    response: () => `A budget is simply a plan for your money — a decision made in advance about what comes in and what goes out. Without a budget, money tends to leak toward whatever feels urgent at the moment. With one, the same income can pay down debt, build savings, and still fund a comfortable life. Personal finance is not about getting rich quickly; it is about making consistent, boring, deliberate choices that compound over decades.

### The 50/30/20 Rule
A popular starting framework is the 50/30/20 rule, popularized by Senator Elizabeth Warren. It suggests splitting after-tax income into three buckets: 50 percent for needs (rent, groceries, utilities, transportation, insurance, minimum debt payments), 30 percent for wants (dining out, entertainment, travel, hobbies), and 20 percent for savings and extra debt payments. The exact split varies by situation — a high-cost city may push needs above 50 percent — but the rule is a useful first draft.

### The Emergency Fund
Before any other financial goal, build an emergency fund. This is cash, kept in a safe and accessible account, equal to three to six months of essential expenses. Its purpose is not investment growth but survival: a job loss, medical bill, car repair, or family crisis should never force you into high-interest debt. Without an emergency fund, every setback becomes a financial emergency. With one, the same setbacks are merely inconveniences.

### Paying Down Debt
High-interest debt — especially credit cards — is the single biggest threat to most household finances. A 24 percent APR means unpaid balances double in about three years. Two common payoff strategies are the avalanche method (pay the highest-interest debt first, which is mathematically cheapest) and the snowball method (pay the smallest balance first, which is psychologically motivating). Both work; the best one is whichever you will actually finish.

### Saving for Retirement
Retirement savings work best when started early, because compounding has more years to operate. Employer-sponsored plans like a 401(k) in the United States often include an employer match — free money that should always be captured first. Individual Retirement Accounts, or IRAs, offer similar tax advantages for those without employer plans. A common guideline is to save 15 percent of gross income for retirement starting in your 20s or 30s. The earlier the start, the smaller the monthly effort needed.

### Tracking and Reviewing
A budget only works if you check it. Many people track every expense for a month or two, identify leaks, and then move to a lighter monthly review. Apps, spreadsheets, or simple notebook entries all work. The point is awareness — most people are surprised by where their money actually goes, and that surprise is the first step toward change.

### Why It Matters
Financial stress is one of the largest sources of anxiety in modern life, and most of it is preventable with a handful of boring habits. A budget, an emergency fund, and early retirement contributions do not require a high income — they require consistency. The reward is not luxury but peace of mind: the quiet confidence that comes from knowing your money is working for you, not against you.`,
  },

  // ----------------------------------------------------------------
  // 8. MARKETING BASICS
  // ----------------------------------------------------------------
  {
    id: 'business-marketing-basics',
    patterns: [/\b(marketing|4 ps|four ps|product|price|place|promotion|target audience|target market|branding|brand|digital marketing|seo|social media marketing|advertising|positioning)\b/i],
    keywords: ['marketing', '4 ps', 'product', 'price', 'place', 'promotion', 'target audience', 'branding', 'digital marketing', 'seo'],
    intent: 'factual_question',
    topic: 'business',
    response: () => `Marketing is the set of activities a business uses to connect its products with the people who will value them most. It is often confused with advertising, but advertising is only one slice. Marketing covers everything from understanding what customers want, to designing the right offer, to delivering it, to communicating it. The goal is not to trick anyone into buying, but to match a real need with a real solution.

### The 4 Ps
The classic framework, introduced by E. Jerome McCarthy in 1960, is the marketing mix — four levers a business can pull, all starting with P. Product is what is being sold: its features, quality, design, packaging, and brand. Price is what customers pay and how that compares to perceived value — a low price can signal cheapness, a high price can signal prestige. Place is how the product reaches customers: stores, websites, apps, distributors, logistics. Promotion is how customers learn about it: advertising, content, social media, public relations, sales. A coherent marketing strategy aligns all four Ps to serve a single target customer.

### Target Audience
No product serves everyone. A target audience is the specific group of people a business aims to reach, defined by demographics (age, income, location, gender), psychographics (values, interests, lifestyles), and behavior (what they buy, how they shop, what problems they face). A vegan meal kit targets health-conscious professionals in cities, not rural meat-and-potatoes households. Defining the target audience sharpens every other marketing decision — a campaign aimed at everyone usually reaches no one.

### Branding
A brand is the sum of perceptions, feelings, and associations a customer has about a company or product. It lives in the customer's mind, not in a logo. Strong brands like Apple, Coca-Cola, and Nike evoke immediate, consistent feelings and command premium prices because customers trust what they will get. Building a brand takes years of consistent product quality, design, messaging, and customer experience. Destroying one takes a single memorable failure.

### Digital Marketing
Digital channels have transformed marketing by making it measurable. Search Engine Optimization, or SEO, is the practice of making a website rank higher in unpaid search results. Search and social media advertising lets businesses target specific audiences and pay only when users click. Email marketing keeps existing customers engaged at low cost. Content marketing — blogs, videos, podcasts — builds trust and authority. Analytics tools show exactly which messages drive which results, allowing constant refinement impossible in the era of billboards and TV spots.

### Positioning
Positioning is the place a brand occupies in the customer's mind relative to competitors. Volvo positions around safety. Tesla around innovation and sustainability. Walmart around low prices. A clear positioning makes the brand easy to remember and easy to choose. Trying to stand for everything usually results in standing for nothing.

### Why It Matters
Even the best product fails if no one knows it exists or understands why it matters. Marketing is how good ideas find the people who need them. Understanding its fundamentals helps not only business owners but also consumers, who can recognize the techniques shaping their own choices.`,
  },

  // ----------------------------------------------------------------
  // 9. INTERNATIONAL TRADE AND GLOBALIZATION
  // ----------------------------------------------------------------
  {
    id: 'economics-trade-globalization',
    patterns: [/\b(international trade|globalization|comparative advantage|absolute advantage|tariff|tariffs|trade deficit|trade surplus|imports|exports|wto|world trade organization|free trade|protectionism|trade war)\b/i],
    keywords: ['international trade', 'globalization', 'comparative advantage', 'tariff', 'trade deficit', 'imports', 'exports', 'wto', 'free trade', 'protectionism'],
    intent: 'factual_question',
    topic: 'economics',
    response: () => `International trade is the exchange of goods, services, and capital across national borders. Globalization is the broader process by which economies, cultures, and populations become more interconnected through that trade, along with migration, investment, and information flows. Together they have shaped the modern world more than almost any other economic force.

### Why Countries Trade: Comparative Advantage
The deepest insight in trade theory is comparative advantage, articulated by David Ricardo in 1817. Even if one country is better at producing everything than another, both still benefit from trade if each specializes in what it produces most efficiently relative to other goods. Imagine a lawyer who is also a faster typist than her assistant. She should still hire the assistant for typing and focus on law, because her opportunity cost of typing — the legal work she gives up — is higher. The same logic applies to countries. Specializing where opportunity cost is lowest and trading for the rest raises total output for everyone.

### Imports, Exports, and the Balance of Trade
Imports are goods and services bought from abroad; exports are those sold abroad. The difference is the trade balance. When a country imports more than it exports, it runs a trade deficit. When it exports more, it runs a trade surplus. Deficits are not automatically bad — they often mean consumers can buy more and cheaper goods — but persistent large deficits can reflect deeper imbalances and may require borrowing from the rest of the world to finance.

### Tariffs and Protectionism
A tariff is a tax on imports. Tariffs make foreign goods more expensive, which can protect domestic industries from competition. The case for tariffs usually rests on saving jobs, nurturing infant industries, or retaliating against unfair trade practices. The case against them is that they raise prices for consumers, invite retaliation, and often destroy more jobs in export industries than they save in protected ones. The Smoot-Hawley tariffs of 1930 deepened the Great Depression by triggering a global trade war. Protectionism is the broader policy of shielding domestic industries through tariffs, quotas, or subsidies.

### The WTO and Trade Agreements
The World Trade Organization, established in 1995, is the international body that oversees trade rules among its member nations. It provides a forum for negotiating trade agreements and a mechanism for resolving disputes. Regional agreements like the European Union's single market, the United States-Mexico-Canada Agreement, and the Association of Southeast Asian Nations free trade area go further by reducing barriers among neighboring countries. These structures have steadily lowered tariffs worldwide since World War II, fueling an enormous expansion in global trade.

### The Debate Over Globalization
Globalization has lifted hundreds of millions out of poverty, especially in China, India, and Southeast Asia, by integrating them into global supply chains. It has also lowered prices for consumers in rich countries and accelerated the spread of technology. The costs fall unevenly: factory workers in wealthy countries may lose jobs to lower-wage competitors abroad, and supply chains can be fragile, as recent pandemic and geopolitical disruptions showed. The political debate is not whether to trade, but how to distribute its gains and cushion its losses.

### Why It Matters
The phone in your pocket, the clothes on your back, and the food on your table were almost certainly produced through global trade. Understanding how it works — and why almost every economist still supports it on balance — is essential for making sense of news, policy debates, and the shape of the modern economy.`,
  },

  // ----------------------------------------------------------------
  // 10. CRYPTOCURRENCY
  // ----------------------------------------------------------------
  {
    id: 'finance-cryptocurrency',
    patterns: [/\b(cryptocurrency|crypto|bitcoin|btc|ethereum|eth|blockchain|digital currency|wallet|crypto wallet|decentralized finance|defi|stablecoin|altcoin|token|mining|proof of work|proof of stake)\b/i],
    keywords: ['cryptocurrency', 'crypto', 'bitcoin', 'ethereum', 'blockchain', 'wallet', 'defi', 'stablecoin', 'mining', 'proof of work'],
    intent: 'factual_question',
    topic: 'finance',
    response: () => `Cryptocurrency is a digital form of money that uses cryptography to secure transactions and operates without a central authority like a bank or government. The idea had been discussed for decades, but it became real in January 2009, when an anonymous developer known as Satoshi Nakamoto launched Bitcoin and mined its first block. Since then, thousands of cryptocurrencies have emerged, along with a vast ecosystem of exchanges, wallets, and applications.

### The Blockchain
A blockchain is the technology underneath almost every cryptocurrency. It is a public ledger — a list of every transaction ever made — that is duplicated across thousands of computers worldwide. When someone sends cryptocurrency, the transaction is broadcast to the network, verified by participants, grouped into a block, and chained to the previous block using cryptography. Once added, a block cannot be altered without redoing all the work that came after it, which makes the history effectively tamper-proof. The blockchain is the innovation: a way for strangers to agree on a shared record without trusting any single party.

### Bitcoin
Bitcoin was the first cryptocurrency and remains the largest by market value. Its supply is capped at 21 million coins, with new coins issued as rewards to miners — computers that compete to validate transactions through a process called proof of work. Because solving the cryptographic puzzles requires enormous computing power and electricity, Bitcoin is often criticized for its environmental footprint. Supporters see it as digital gold: a scarce, censorship-resistant store of value outside any government's control.

### Ethereum
Ethereum, launched in 2015 by Vitalik Buterin and others, took the blockchain idea further by allowing programs called smart contracts to run on it. A smart contract is code that automatically executes an agreement when conditions are met — for example, releasing funds only when a delivery is confirmed. Ethereum's flexibility spawned an entire ecosystem of decentralized applications, including Decentralized Finance (DeFi) protocols that recreate loans, exchanges, and savings products without traditional intermediaries. In 2022, Ethereum switched from energy-intensive proof of work to proof of stake, reducing its energy use by over 99 percent.

### Wallets
A cryptocurrency wallet is a tool that stores the cryptographic keys needed to access and spend your coins. Wallets come in two main types. Hot wallets are connected to the internet — convenient for frequent use but more exposed to hacking. Cold wallets are offline devices, often hardware sticks, that keep keys isolated from online threats. The critical fact about wallets is that they do not store coins themselves — coins always live on the blockchain. The wallet stores the keys that prove ownership. Lose the keys, and the coins are unrecoverable.

### Risks and Volatility
Cryptocurrencies are famously volatile. Bitcoin has swung from under a dollar in 2010 to over 60,000 dollars and back down by more than half, multiple times. Beyond price swings, the ecosystem carries risks unique to it: exchanges can be hacked or fail (the collapse of FTX in 2022 wiped out billions of customer funds), scams are common, regulation is still evolving, and the irreversible nature of transactions means a mistake or theft cannot be undone. Stablecoins, designed to track the value of a fiat currency like the dollar, attempt to reduce volatility but have themselves failed spectacularly in some cases.

### Why It Matters
Cryptocurrency sits at the intersection of money, technology, and governance. Whether it becomes a routine part of the financial system or remains a volatile niche is still unsettled. Understanding the underlying mechanics — blockchain, keys, consensus — helps separate the genuine innovation from the speculation, and lets anyone evaluate crypto claims with appropriate skepticism.`,
  },
]
