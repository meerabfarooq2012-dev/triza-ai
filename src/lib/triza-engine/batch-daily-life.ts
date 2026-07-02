/**
 * ============================================================
 *  TRIZA ENGINE — Knowledge Batch: Daily Life Skills
 * ============================================================
 *
 *  15 hand-written entries covering practical life skills —
 *  cooking, money, time, habits, study, relationships,
 *  productivity, cleaning, goals, and confidence. Each entry
 *  includes English + Roman Urdu trigger patterns so TRIZA
 *  can respond to multilingual user queries natively.
 *
 *  All responses: 250-400 words, markdown formatted, practical
 *  and actionable. No external LLM — pure TypeScript knowledge.
 * ============================================================
 */

import type { KnowledgeEntry } from './types'

export const DAILY_LIFE_ENTRIES: KnowledgeEntry[] = [
  // ----------------------------------------------------------
  // 1. COOK RICE PERFECTLY
  // ----------------------------------------------------------
  {
    id: 'cook-rice-perfectly',
    patterns: [/\b(cook rice|perfect rice|rice kaise banaye|chawal pakana|basmati rice|chawal kaise pakte hain|rice banana)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Cook Rice Perfectly

Perfect, fluffy rice is one of the most useful skills in any kitchen. Once you master the ratios and timing, you will never go back to mushy or crunchy pots again.

### The Golden Ratio
| Rice Type | Water : Rice | Notes |
|-----------|-------------|-------|
| White basmati | 1.5 : 1 | Rinse well, soak 20 min |
| White long-grain | 1.75 : 1 | No soak needed |
| Brown rice | 2.5 : 1 | Needs 40–45 min |
| Jasmine | 1.5 : 1 | Aromatic, sticky result |

### Step-by-Step Method
1. **Rinse the rice** — wash under cold water 3–4 times until water runs clear. This removes excess starch that causes clumping.
2. **Soak (optional)** — basmati soaked for 20 minutes cooks fluffier and faster.
3. **Combine and season** — add rice, water, a pinch of salt, and a teaspoon of oil or ghee to a pot.
4. **Bring to a boil** — medium-high heat, uncovered, until bubbles appear.
5. **Cover and simmer** — reduce to the lowest heat, cover with a tight lid, and cook 15 minutes (white) or 40 minutes (brown). Do NOT lift the lid.
6. **Rest** — remove from heat and let it sit covered for 10 minutes. This finishes steaming evenly.
7. **Fluff** — use a fork (never a spoon) to separate grains gently.

### Common Mistakes to Avoid
- Lifting the lid too early — releases steam needed for cooking
- Stirring during cooking — breaks grains into paste
- Too much water — results in sticky, mushy rice
- Skipping the rinse — leaves starch that makes rice gummy

### Quick Flavor Upgrades
- Cook in broth instead of water
- Add a bay leaf, cardamom pod, or cinnamon stick
- Sauté rice in butter for 1 minute before adding water (pilaf style)
- Stir in fresh herbs like cilantro or mint at the end

**Why it matters:** Rice is a daily staple for over half the world. Mastering it gives you a reliable, cheap, and healthy base for countless meals — and saves you from the disappointment of ruined dinner ever again.`,
  },

  // ----------------------------------------------------------
  // 2. BUDGET MONEY
  // ----------------------------------------------------------
  {
    id: 'budget-money',
    patterns: [/\b(budget money|how to budget|budget banana|paise ka hisab|money management|50\/30\/20 rule|monthly budget|kharcha ka hisab)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Budget Money

A budget is not a punishment — it is a permission slip to spend without guilt. The goal is awareness, not restriction.

### The 50/30/20 Rule
Popularized by Senator Elizabeth Warren, this simple framework divides your after-tax income:

| Category | % | Examples |
|----------|---|----------|
| **Needs** | 50 | Rent, utilities, groceries, transport, minimum debt payments |
| **Wants** | 30 | Dining out, streaming, hobbies, vacations |
| **Savings/Debt** | 20 | Emergency fund, retirement, extra debt payments |

If your needs exceed 50%, you may need to cut wants, increase income, or lower fixed costs.

### Step-by-Step Budgeting
1. **Calculate monthly income** — use net (after-tax) income only.
2. **List every expense** — track for one full month before deciding limits. Use a notebook, spreadsheet, or app like YNAB / Mint.
3. **Categorize** — split into needs, wants, and savings.
4. **Set limits** — assign every rupee a job before the month begins (zero-based budgeting).
5. **Review weekly** — 10-minute check-in keeps you accountable.
6. **Adjust monthly** — a budget should flex with your life, not fight it.

### Practical Tips
- **Pay yourself first** — automate 20% to savings the day salary arrives
- **Use the 24-hour rule** — wait a day before any non-essential purchase over Rs 2000
- **Build a Rs 50,000 emergency fund** before aggressive investing
- **Track subscriptions** — these silently drain accounts; cancel unused ones
- **Use cash envelopes** for problem categories like dining or shopping

### Common Pitfalls
- Forgetting annual expenses (insurance, car repairs) — divide by 12 and save monthly
- Budgeting to the last rupee with no buffer — leave 5% slack
- Comparing your budget to others — your income and needs are unique

**Why it matters:** Financial stress is one of the leading causes of anxiety and relationship conflict. A simple budget gives you control, reduces fear, and turns vague worries into a clear monthly plan you can actually follow.`,
  },

  // ----------------------------------------------------------
  // 3. MANAGE TIME
  // ----------------------------------------------------------
  {
    id: 'manage-time',
    patterns: [/\b(manage time|time management|waqt bachana|pomodoro|time table|productivity tips|waqt ki bandobasti|time kaise manage kare)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Manage Your Time

Time management is not about doing more — it is about doing what matters, on purpose. The goal is focus, not busyness.

### Core Techniques

#### 1. The Pomodoro Method
Work in focused 25-minute blocks, then take a 5-minute break. After 4 cycles, take a longer 20–30 minute break.
- Forces single-tasking
- Prevents burnout
- Builds measurable progress (count your pomodoros)

#### 2. The Eisenhower Matrix
Sort tasks into four boxes:
| | Urgent | Not Urgent |
|--|--------|------------|
| **Important** | Do now | Schedule |
| **Not important** | Delegate | Delete |

Most people live in the urgent-important box, constantly firefighting. The goal is more time in the not-urgent-important box — exercise, planning, learning.

#### 3. Time Blocking
Assign specific blocks of the day to specific tasks:
- 9–11 AM: Deep work (no meetings, no phone)
- 11–12 PM: Email and admin
- 2–4 PM: Meetings
- 4–5 PM: Learning or planning

### Building a Daily Plan
1. **Brain dump** — list everything on your mind each morning
2. **Pick 3 priorities** — the three tasks that, if done, make the day successful
3. **Time block** — assign each priority a slot
4. **Batch similar tasks** — answer all emails together, make all calls together
5. **Review at night** — 5-minute reflection: what worked, what did not

### Killing Common Time Wasters
- **Notifications** — turn off all non-human alerts during focus blocks
- **Multitasking** — switching tasks costs up to 40% efficiency
- **Decision fatigue** — plan tomorrow tonight, lay out clothes, prep meals
- **Perfectionism** — done is better than perfect for 90% of tasks

### Tools That Actually Help
- A simple paper planner beats most apps
- Google Calendar for shared events
- Todoist or TickTick for task lists
- Forest app to block phone during focus sessions

**Why it matters:** You cannot create more hours in a day, but you can decide where each one goes. Good time management turns a chaotic, reactive life into a calm, intentional one — leaving room for what you actually love.`,
  },

  // ----------------------------------------------------------
  // 4. STAY ORGANIZED
  // ----------------------------------------------------------
  {
    id: 'stay-organized',
    patterns: [/\b(stay organized|organization tips|declutter|saaf safai|systematic|ghar saaf karna|organized rehne ka tarika|decluttering)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Stay Organized

Organization is not about perfection — it is about reducing friction. Every item you own and every task you accept is a small claim on your attention.

### The 5-Step Decluttering Method
1. **Sort** — group items by category (clothes, papers, kitchen, electronics)
2. **Purge** — for each item, ask: 'Do I use this? Do I love this? Would I buy it again?' If no to all three, donate or discard
3. **Assign a home** — every kept item needs a specific place
4. **Containerize** — use boxes, baskets, and shelves to group like with like
5. **Label** — labels prevent slow drift back into chaos

### Building Daily Systems
- **One in, one out** — for every new item you bring home, remove one
- **2-minute rule** — if a task takes under 2 minutes, do it now
- **15-minute nightly reset** — tidy kitchen, lay out clothes, clear desk
- **Weekly reset** — Sunday evening: review calendar, plan meals, empty inbox
- **Inbox zero** — process emails to empty (archive, reply, delete, or schedule)

### Organizing Digital Life
- **Files** — use folders: 01 Work, 02 Personal, 03 Reference, 04 Archive
- **Email** — unsubscribe ruthlessly; use filters for newsletters
- **Photos** — delete duplicates monthly; back up to cloud
- **Passwords** — use a manager (Bitwarden, 1Password) — never reuse passwords

### Organizing Your Schedule
- One calendar only — syncing multiple causes missed appointments
- Recurring reminders for birthdays, bills, car service
- A 'waiting on' list — things you are waiting for from others
- A 'someday' list — dreams and ideas without a deadline

### The Cost of Clutter
- Visual noise raises background stress
- Lost items cost the average person 10 minutes a day
- Disorganized spaces correlate with procrastination and low mood
- A clean desk measurably improves focus and decision-making

### Quick Wins to Try Today
- Clear one surface completely (desk, kitchen counter, or tabletop)
- Empty your wallet, bag, or pockets
- Delete 10 unused apps from your phone
- Set up automatic bill payments

**Why it matters:** External order creates internal calm. When your environment, schedule, and files are organized, your mind frees up energy for creative and meaningful work instead of constantly searching, deciding, and catching up.`,
  },

  // ----------------------------------------------------------
  // 5. IMPROVE COMMUNICATION
  // ----------------------------------------------------------
  {
    id: 'improve-communication',
    patterns: [/\b(improve communication|communication skills|baat cheet|bolna seekhe|better communication|communication kaise sudhare|sunne ki adat)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Improve Your Communication

Good communication is less about speaking well and more about listening well. The best communicators are remembered not for what they said, but for how they made others feel.

### Active Listening
Most people listen to reply, not to understand. Practice these habits:
- **Eye contact** — steady, not staring, shows attention
- **Don't interrupt** — let the speaker finish their full thought
- **Reflect back** — 'So what you are saying is...'
- **Ask open questions** — 'How did that feel?' instead of 'Was it bad?'
- **Pause before responding** — a 2-second silence shows you considered their words

### Speaking with Clarity
- **Lead with the point** — say your main idea first, then explain
- **Use short sentences** — long, winding sentences lose listeners
- **Cut filler words** — 'um', 'like', 'you know' weaken your message
- **One idea per breath** — pause naturally instead of racing on
- **Adapt to your audience** — explain differently to a child, expert, or stranger

### Non-Verbal Communication
Over half of meaning comes from body language:
- **Posture** — open shoulders and relaxed arms signal confidence
- **Hands** — visible hands build trust; hidden hands create suspicion
- **Tone** — a calm, lower voice carries more authority than a high, fast one
- **Mirroring** — subtly matching the other person's energy builds rapport

### Handling Difficult Conversations
1. **Set the right setting** — private, unhurried, neutral ground
2. **Use 'I' statements** — 'I felt hurt when...' beats 'You always...'
3. **Acknowledge their view first** — 'I see why you would think that'
4. **Separate person from problem** — attack the issue, not the human
5. **End with a clear next step** — never leave a hard talk open-ended

### Written Communication
- Subject lines that say exactly what the email is about
- Bullet points for anything more than three items
- Read aloud before sending — if it sounds off, rewrite it
- Reply within 24 hours, even if just to say 'I will get back to you'

### Daily Practice
- Summarize what someone said before responding
- Record yourself explaining something and listen back
- Ask a trusted friend for honest feedback on your speaking

**Why it matters:** Nearly every opportunity in life — a job, a relationship, a deal — flows through communication. Improving this one skill compounds across every other area of your life.`,
  },

  // ----------------------------------------------------------
  // 6. BUILD GOOD HABITS
  // ----------------------------------------------------------
  {
    id: 'build-good-habits',
    patterns: [/\b(build good habits|atomic habits|habit building|aadat|good habits|habit kaise banaye|atomic habits book|habit formation)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Build Good Habits

Habits are the compound interest of self-improvement. A 1% change each day, repeated for a year, leaves you 37 times better. The trick is not motivation — it is design.

### The Habit Loop
Every habit follows the same four-step loop (popularized by James Clear in *Atomic Habits*):

| Stage | Question | Example |
|-------|----------|---------|
| **Cue** | What triggers it? | Phone buzzes |
| **Craving** | Why do you want it? | Want distraction |
| **Response** | What do you do? | Open Instagram |
| **Reward** | What do you get? | A small dopamine hit |

To build a good habit, design each stage. To break a bad one, make each stage harder.

### Four Laws of Behavior Change
For building a good habit:
1. **Make it obvious** — set a clear cue ('After I pour morning coffee, I will read one page')
2. **Make it attractive** — pair it with something you enjoy ('Listen to a favorite podcast only at the gym')
3. **Make it easy** — reduce friction (lay out gym clothes the night before)
4. **Make it satisfying** — track it visibly, reward yourself

For breaking a bad habit, invert each law: make it invisible, unattractive, difficult, and unsatisfying.

### Practical Strategies
- **Habit stacking** — attach a new habit to an existing one: 'After I brush my teeth, I will floss one tooth'
- **Two-minute rule** — shrink any new habit to under 2 minutes at first. Consistency before intensity
- **Never miss twice** — one missed day is normal; two starts a new (bad) habit
- **Identity-based habits** — say 'I am a runner' instead of 'I am trying to run more'

### Tracking and Reinforcement
- Use a wall calendar and mark an X for each day you complete the habit
- Aim for an unbroken chain — visual momentum is powerful
- Reward yourself at 7, 30, and 90 days
- Tell a friend or partner — accountability doubles success rates

### Common Mistakes
- Starting too big ('I will work out 1 hour daily') — start tiny
- Tracking too many habits at once — pick one or two
- Relying on willpower — design your environment instead
- Quitting after a single slip — the path is never linear

**Why it matters:** You do not rise to the level of your goals; you fall to the level of your systems. Habits are the architecture of your future self — small daily choices quietly become your life.`,
  },

  // ----------------------------------------------------------
  // 7. MANAGE STRESS
  // ----------------------------------------------------------
  {
    id: 'manage-stress',
    patterns: [/\b(manage stress|stress relief|tanav kam karna|anxiety tips|stress kaise kam kare|tension kam karna|relaxation techniques)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Manage Stress

Stress is not the enemy — chronic, unmanaged stress is. The goal is not to eliminate pressure (impossible) but to recover from it quickly and often.

### Immediate Calming Techniques
- **4-7-8 breathing** — inhale for 4 seconds, hold for 7, exhale slowly for 8. Repeat 4 times. Activates the parasympathetic nervous system within a minute
- **Box breathing** — inhale 4, hold 4, exhale 4, hold 4. Used by Navy SEALs before high-stress moments
- **5-4-3-2-1 grounding** — name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste. Pulls you out of spiraling thoughts
- **Cold water on face** — triggers the mammalian dive reflex, instantly lowering heart rate

### Lifestyle Foundations
| Pillar | Recommendation | Effect |
|--------|----------------|--------|
| **Sleep** | 7–9 hours, consistent times | Restores emotional regulation |
| **Exercise** | 30 min, 5 days a week | Burns off cortisol, boosts endorphins |
| **Diet** | Less caffeine, sugar, alcohol | Stabilizes mood and energy |
| **Sunlight** | 10–20 min morning light | Sets circadian rhythm, lifts mood |
| **Connection** | Daily talk with someone you trust | Lowers stress hormones measurably |

### Reframing Stressful Thoughts
Use the **ABC model** from cognitive behavioral therapy:
- **A** — Activating event (a deadline)
- **B** — Belief about it ('I will fail and look foolish')
- **C** — Consequence (anxiety, procrastination)

Most stress comes from B, not A. Challenge the belief: 'Is this true? Is it helpful? What would I tell a friend?'

### Building Recovery Into the Day
- Micro-breaks every 90 minutes (5 min walk, water, stretch)
- A daily 'worry window' — 15 minutes to write worries, then close the notebook
- Screen-free time 1 hour before bed
- One full rest day each week with no work, no chores

### When to Seek Help
Stress becomes a problem when it causes persistent insomnia, chest pain, panic attacks, or numbness to joy. A therapist or counselor is not weakness — it is a skilled guide for a stuck nervous system.

**Why it matters:** Unmanaged stress silently damages the heart, immune system, digestion, and memory. Learning to regulate it is one of the highest-return skills for both lifespan and quality of life.`,
  },

  // ----------------------------------------------------------
  // 8. SAVE MONEY
  // ----------------------------------------------------------
  {
    id: 'save-money',
    patterns: [/\b(save money|paise bachana|bachat|saving tips|money saving|paisa kaise bachaye|how to save|frugal living)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Save Money

Saving money is not about being cheap — it is about spending intentionally on what you value and quietly cutting what you do not.

### The Save-First Rule
Pay yourself first. The day your salary arrives, automatically transfer 20% (or whatever you can) into a separate savings account. What you never see, you will not spend. Treat savings like a non-negotiable monthly bill.

### High-Impact Saving Strategies

#### 1. Track Every Rupee
You cannot save what you cannot see. Use a notebook, spreadsheet, or app. Track for one full month — you will be shocked at where money leaks.

#### 2. Cut the Top 3 Categories
For most people, the biggest expenses are housing, transport, and food. Focus there:
- **Housing** — get a roommate, negotiate rent, or downsize if possible
- **Transport** — carpool, use public transit, walk short distances
- **Food** — cook at home, batch meals, limit food delivery apps

#### 3. The 30-Day Rule
For any non-essential purchase over Rs 5,000, wait 30 days. Most desires fade within a week. The purchases that survive the wait are usually worth it.

### Avoiding Common Money Drains
- **Subscriptions** — list them all, cancel anything used less than once a month
- **Impulse buys** — never grocery shop hungry; shop with a list
- **Brand loyalty** — try generic brands for basics; often identical at half price
- **Late fees** — automate bill payments; set calendar reminders
- **Bank fees** — switch to a no-fee account; avoid overdrafts

### Smart Shopping Habits
- Compare prices online before any purchase over Rs 2,000
- Buy used for books, furniture, electronics, and cars
- Time big purchases — sales in November, end of financial year, festive season
- Buy in bulk only for items you truly use monthly

### Quick Wins This Week
- Cancel one unused subscription
- Cook 5 extra meals at home instead of ordering
- Set up an automatic Rs 2,000 monthly transfer to savings
- Negotiate one bill (internet, phone, insurance)

**Why it matters:** Savings buy you freedom — the freedom to leave a bad job, take a risk, handle emergencies, and retire with dignity. Every rupee saved is a small piece of your future independence.`,
  },

  // ----------------------------------------------------------
  // 9. STUDY EFFECTIVELY
  // ----------------------------------------------------------
  {
    id: 'study-effectively',
    patterns: [/\b(study effectively|how to study|padhai kaise kare|yaad karna|active recall|spaced repetition|study tips|padhai ke tarike)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Study Effectively

Most students study the wrong way — re-reading, highlighting, cramming. Research consistently shows these feel productive but barely build lasting memory. Effective study is active, spaced, and tested.

### The Two Power Techniques

#### 1. Active Recall
Instead of re-reading notes, force your brain to retrieve information from memory:
- Close the book and write everything you remember
- Make flashcards (physical or Anki) and quiz yourself
- Answer practice questions without looking
- Explain the concept aloud as if teaching someone

Struggling to recall is what builds memory — ease is the enemy of learning.

#### 2. Spaced Repetition
Review information at increasing intervals: 1 day, 3 days, 1 week, 2 weeks, 1 month. Each review just before you would forget it strengthens memory dramatically.

Use the free **Anki** app — it automates the schedule using an algorithm.

### A Sample Study Session (Pomodoro Style)
1. **5 min** — preview the chapter (headings, summary, diagrams)
2. **25 min** — read one section actively, take notes in your own words
3. **5 min** — break
4. **25 min** — close notes, write everything you remember
5. **5 min** — break
6. **25 min** — check what you missed, make flashcards for those points
7. **5 min** — break
8. **25 min** — solve practice questions on the topic

### Note-Taking That Works
- **Cornell method** — split page: notes on right, key words on left, summary at bottom
- **Mind maps** — for connecting concepts visually
- **Feynman technique** — explain it simply; gaps reveal what you do not understand
- Avoid copying verbatim — rephrase in your own words to force understanding

### Avoiding Common Pitfalls
- **Cramming** — boosts short-term recall, destroys long-term retention
- **Highlighting** — feels productive, builds almost no memory
- **Multitasking** — phone notifications can cut retention by 50%
- **Studying in bed** — confuses your brain about whether to sleep or focus
- **Perfect notes** — pretty notebooks waste time; messy active notes win

### Lifestyle That Supports Memory
- **Sleep 7–9 hours** — memory consolidates during deep sleep
- **Exercise before study** — boosts blood flow and focus for 2 hours
- **Hydrate** — even mild dehydration lowers concentration
- **Study in varied places** — different contexts strengthen recall

**Why it matters:** Studying smarter, not longer, can halve your study time and double your results. The same hours, used with proven techniques, transform anxiety and last-minute panic into calm, confident mastery.`,
  },

  // ----------------------------------------------------------
  // 10. MAINTAIN RELATIONSHIPS
  // ----------------------------------------------------------
  {
    id: 'maintain-relationships',
    patterns: [/\b(maintain relationships|relationships|rishta nibhana|dosti|relationship tips|relationship kaise chalaye|trust in relationships|good relationships)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Maintain Healthy Relationships

Relationships do not survive on love alone — they survive on consistent attention, honesty, and repair. Whether with a partner, friend, or family member, the same principles apply.

### The Pillars of Strong Relationships

#### 1. Trust
Trust is built in small moments — keeping a promise, showing up on time, being honest when it is uncomfortable. It takes years to build and seconds to break.
- Do what you say you will do
- Admit mistakes quickly and without excuses
- Keep confidences — never share what was told in trust

#### 2. Communication
- **Listen to understand, not to reply** — let them finish before forming your response
- **Use 'I' statements** — 'I felt hurt' instead of 'You always hurt me'
- **Ask, do not assume** — most conflicts come from guessed motives

#### 3. Quality Time
Time together is not the same as time spent on phones in the same room. True quality time means eye contact, no screens, shared activity, even 20 focused minutes beats 3 distracted hours.

#### 4. Appreciation
- Express gratitude daily, even for small things
- Be specific — 'Thank you for making tea this morning' beats 'You are great'
- Five positive comments for every negative one (research by Dr. John Gottman)

### Handling Conflict Well
1. **Cool down first** — never argue when angry; take a 20-minute walk
2. **Address the issue, not the person** — attack the problem together
3. **Acknowledge their view** — 'I can see why you felt that way'
4. **Apologize properly** — name what you did, take responsibility, do not add 'but'
5. **Find a solution together** — compromise, do not win

### Common Relationship Killers
- **Contempt** — eye-rolling, sarcasm, name-calling. The #1 predictor of divorce
- **Stonewalling** — silent treatment and emotional withdrawal
- **Keeping score** — relationships are not transactions
- **Neglect** — assuming the relationship will run on autopilot

### Maintaining Long-Distance Bonds
- Schedule regular calls — consistency matters more than length
- Send unexpected messages ('Saw this and thought of you')
- Visit when possible — in-person time cannot be fully replaced
- Share small daily moments, not just big news

**Why it matters:** The Harvard Study of Adult Development (85 years long) found that the quality of close relationships predicts health and happiness more than wealth, fame, or career. Investing in relationships is investing in a longer, fuller life.`,
  },

  // ----------------------------------------------------------
  // 11. BE PRODUCTIVE
  // ----------------------------------------------------------
  {
    id: 'be-productive',
    patterns: [/\b(be productive|productivity|focus kaise badhaye|kaam karna|distraction|focus tips|productivity tips|concentration badhane ke tarike)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Be Productive

Productivity is not about doing more tasks — it is about doing the right tasks, deeply and consistently. Busy is the opposite of productive.

### The Deep Work Principle
Cal Newport's research shows that the most valuable work — writing, coding, problem-solving, learning — requires distraction-free focus for 90+ minutes at a time. Yet most people rarely get even 30 minutes of true deep work in a day.

### Eliminating Distractions
Your phone is the #1 enemy of focus. Take control:
- **Airplane mode** during focus blocks — even notifications on silent break attention
- **Remove social apps** from the home screen — out of sight, out of mind
- **Use website blockers** (Freedom, Cold Turkey) for tempting sites during work
- **Single tab rule** — close every tab not needed for the current task
- **Phone in another room** — physical distance beats willpower every time

### The Daily Productivity System
1. **Plan the night before** — write tomorrow's top 3 priorities
2. **Start with the hardest task** — Mark Twain called this 'eating the frog'
3. **Work in 90-minute blocks** — human focus cycles follow ultradian rhythms
4. **Take real breaks** — walk, stretch, water; not phone scrolling
5. **End with a shutdown ritual** — close tabs, write tomorrow's list, leave work behind

### Prioritization Frameworks

#### The 80/20 Rule (Pareto Principle)
80% of results come from 20% of effort. Identify your high-impact tasks and double down on them; ignore or delegate the rest.

#### The Ivy Lee Method
Each evening, write down the 6 most important tasks for tomorrow. Rank them. Tomorrow, work on task 1 until done, then task 2, and so on. Simple and remarkably effective.

### Common Productivity Traps
- **Multitasking** — switching tasks costs up to 40% efficiency
- **Email first thing** — hands your day's direction to other people
- **Meeting overload** — most meetings should be emails or messages
- **Perfectionism** — 90% quality shipped beats 100% quality never finished

### Energy Management
Productivity is not just time management — it is energy management:
- **Morning** — creative, deep work
- **Afternoon** — meetings, admin, calls
- **Evening** — planning, light reading, learning
- **Sleep, exercise, food** — these beat any productivity app

**Why it matters:** Most people spend 8 hours at work but produce only 2 hours of real output. Mastering focus can give you back entire days of your life — for family, hobbies, rest, or whatever you value most.`,
  },

  // ----------------------------------------------------------
  // 12. COOK BASIC MEALS
  // ----------------------------------------------------------
  {
    id: 'cook-basic-meals',
    patterns: [/\b(cook basic meals|basic cooking|khana banana|simple recipes|starter recipes|beginner cooking|asan khana|cooking for beginners)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Cook Basic Meals

Cooking is a survival skill, a money-saver, and a quiet form of self-care. You do not need fancy equipment or chef training — just three reliable meals you can cook without a recipe.

### The Beginner's Kitchen Toolkit
- One medium pot (for rice, pasta, soups)
- One frying pan (non-stick or cast iron)
- One sharp knife and one cutting board
- A spatula, ladle, and a measuring cup
- Salt, pepper, oil, and a few basic spices

That is enough to cook hundreds of meals.

### Meal 1: Lentil Stew (Daal)
1. Rinse 1 cup of yellow or red lentils until water is clear
2. Add to a pot with 3 cups of water, half a teaspoon of turmeric, and salt
3. Boil, then simmer for 20 minutes until soft
4. In a small pan, heat 2 tablespoons of oil, add cumin seeds, garlic, and dried red chilies
5. Pour this spiced oil mixture (called tarka) over the cooked lentils and cover for 2 minutes
6. Serve with rice or flatbread (roti)

### Meal 2: Egg Fried Rice
1. Cook 1 cup of rice (see the rice guide) and let it cool
2. Scramble 2 eggs in oil, set aside
3. Sauté chopped onion, garlic, and any vegetables (carrots, peas, capsicum) for 5 minutes
4. Add the rice, a splash of soy sauce, and the eggs
5. Toss for 3 minutes on high heat — done in 15 minutes total

### Meal 3: Simple Pasta
1. Boil pasta in salted water until just soft (8–10 minutes)
2. In a pan, sauté garlic in olive oil for 30 seconds
3. Add chopped tomatoes or tomato puree, salt, and oregano; simmer 10 minutes
4. Drain pasta, toss with sauce, top with cheese and black pepper

### Universal Cooking Principles
- **Taste as you cook** — adjust salt and acid throughout
- **Heat control matters** — medium for onions, high for searing, low for simmering
- **Prep first** — chop everything before lighting the stove

**Why it matters:** Cooking even three basic meals saves money, improves health, and frees you from dependence on delivery apps. It is one of the fastest skills to learn and one of the most useful for life.`,
  },

  // ----------------------------------------------------------
  // 13. CLEAN HOME EFFICIENTLY
  // ----------------------------------------------------------
  {
    id: 'clean-home-efficiently',
    patterns: [/\b(clean home|cleaning tips|ghar saaf karna|efficient cleaning|home cleaning|saaf safai ke tarike|clean house|cleaning checklist)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Clean Your Home Efficiently

Efficient cleaning is not about working harder — it is about working in the right order, with the right tools, on a simple schedule.

### The Golden Rule: Top to Bottom
Always clean from the highest point down. Dust falls — if you vacuum first and then wipe shelves, you will have to vacuum again.

**Order:** ceiling fans → shelves and surfaces → furniture → floors → trash

### The Zone Method
Divide your home into zones and clean one zone fully each day:

| Day | Zone | Tasks |
|-----|------|-------|
| Monday | Kitchen | Wipe counters, stove, sink, sweep and mop |
| Tuesday | Bathrooms | Toilet, sink, mirror, floor |
| Wednesday | Living room | Dust, vacuum sofa, floor |
| Thursday | Bedrooms | Change sheets, dust, vacuum |
| Friday | Floors & dusting | Whole-house sweep and mop |
| Saturday | Laundry & errands | Wash clothes, restock supplies |
| Sunday | Rest | Light tidy only |

This breaks a 4-hour marathon into 20-minute daily sessions.

### The Essential Toolkit
- Microfiber cloths (color-coded: kitchen vs bathroom)
- All-purpose cleaner (or vinegar + water mix)
- Glass cleaner
- Toilet brush and bowl cleaner
- Broom, mop, bucket
- A caddy to carry supplies room to room

### Speed-Cleaning Techniques
- **Set a timer** — 20 minutes per room forces speed and focus
- **Carry one basket** — anything out of place goes in, sort it later
- **Two-hand cleaning** — spray with one hand, wipe with the other
- **Do not switch products mid-room** — finish what you started
- **Music or a podcast** — turns cleaning into me-time

### Daily 10-Minute Maintenance
- Wipe kitchen counters after every meal
- Run the dishwasher each night, empty each morning
- Make the bed the moment you wake up
- Squeegee the shower after use — prevents mold

### Tackling Tough Areas
- **Microwave** — heat a bowl of water with lemon for 5 minutes, wipe clean
- **Burnt pan** — fill with water and baking soda, boil 10 minutes
- **Greasy stove** — baking soda paste, let sit, scrub
- **Smelly drain** — pour baking soda and vinegar, flush with hot water

### Preventive Habits
- Shoes off at the door cuts floor dirt by 70%
- A doormat on each side of the entrance
- Clean spills immediately — they take 10 seconds now, 10 minutes later

**Why it matters:** A clean home reduces allergies, lowers stress, and creates mental space. The trick is small, regular effort — not exhausting weekend marathons that leave you dreading cleaning altogether.`,
  },

  // ----------------------------------------------------------
  // 14. SET AND ACHIEVE GOALS
  // ----------------------------------------------------------
  {
    id: 'set-achieve-goals',
    patterns: [/\b(set goals|achieve goals|smart goals|hadaf|target|goal setting|hadaf kaise banaye|goal kaise achieve kare|goal setting tips)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Set and Achieve Goals

A goal without a plan is just a wish. The difference between people who reach their goals and those who do not is rarely talent — it is structure, clarity, and consistency.

### The SMART Framework
Every serious goal should pass the SMART test:

| Letter | Meaning | Question |
|--------|---------|----------|
| **S** | Specific | What exactly do I want? |
| **M** | Measurable | How will I know I reached it? |
| **A** | Achievable | Is it realistic given my life? |
| **R** | Relevant | Does it matter to me? |
| **T** | Time-bound | By when? |

Vague: 'I want to get fit.' SMART: 'I will run 5 km without stopping by June 30, training 3 times a week.'

### The Goal-Setting Process
1. **Dream big first** — write your ideal life in 5 years without filtering
2. **Pick one or two goals** — chasing ten goals means achieving none
3. **Reverse-engineer** — break the goal into monthly, weekly, daily steps
4. **Make it visible** — write it on paper, put it where you will see it daily
5. **Set a review cadence** — weekly check-in, monthly deep review

### Staying Motivated
- **Focus on identity** — 'I am a writer' beats 'I am trying to write'
- **Track progress visually** — a chart, calendar, or habit tracker
- **Celebrate small wins** — every weekly target met deserves a reward
- **Find an accountability partner** — weekly check-ins double follow-through

### Handling Setbacks
- **Expect them** — no path is linear
- **Never miss twice** — one slip is human; two starts a new pattern
- **Adjust, do not abandon** — a goal can change shape without dying

### Common Goal-Killers
- Setting too many goals at once
- No deadline ('someday' means 'never')
- No daily action — goals need daily nourishment
- Quitting after one bad week

### A Simple Weekly Ritual
Each Sunday, ask: 'What one action this week, if done, moves me closest to my goal?' Schedule it first. Everything else fits around it.

**Why it matters:** Goals give direction to energy that would otherwise scatter. People who write down their goals are roughly 40% more likely to achieve them — a few minutes of clarity can change the trajectory of your entire life.`,
  },

  // ----------------------------------------------------------
  // 15. DEVELOP SELF-CONFIDENCE
  // ----------------------------------------------------------
  {
    id: 'develop-self-confidence',
    patterns: [/\b(self confidence|confidence|bharosa|self esteem|develop confidence|confidence kaise badhaye|apne par bharosa|self assurance)\b/i],
    intent: 'how_to',
    topic: 'skills',
    response: () => `## How to Develop Self-Confidence

Confidence is not a personality trait you are born with — it is a skill built through action. The feeling follows the behavior, not the other way around.

### The Core Loop: Competence → Confidence
True confidence is not 'believing you are great' — it is knowing you can handle situations because you have faced them before. The loop is:

1. Take small action
2. Survive and learn
3. Repeat slightly harder action
4. Confidence grows naturally

Skip step 1 and no amount of positive thinking will help.

### Daily Practices to Build Confidence

#### 1. Keep Small Promises to Yourself
Every time you say 'I will wake at 6' and do, your self-trust grows. Self-confidence is, at its core, self-trust.

#### 2. Improve Your Posture
Research by Amy Cuddy shows that standing tall with open shoulders for 2 minutes measurably raises confidence hormones. The body leads the mind.

#### 3. Speak Slower and Lower
Nervous people speak fast and high. Confident people take their time. Practicing slow, clear speech literally makes you feel more confident.

#### 4. Dress Slightly Better Than Required
When you look put-together, you act put-together. This is not vanity — it is using appearance as a tool.

### Reframing Common Confidence Killers

#### Fear of Judgment
Most people are too busy worrying about themselves to judge you. Even when they do, their opinion does not pay your bills or write your story.

#### Perfectionism
Confident people ship imperfect work and improve in public. Perfectionists never start. Aim for 'good enough' and refine later.

### Practical Action Steps
- **Volunteer to speak once per meeting** — voice builds with use
- **Learn one new skill each quarter** — competence compounds
- **Exercise 3 times a week** — physical strength feeds mental strength
- **Say no when you mean no** — boundary-setting is confidence in action

### The Confidence Bank Account
- **Deposits** — kept promises, learned skills, faced fears
- **Withdrawals** — broken commitments, avoiding challenges, harsh self-talk

You do not need a huge deposit every day. Small consistent ones compound.

### When Confidence Wobbles
- Recall three past wins — write them down
- Take one tiny action immediately — momentum beats motivation
- Remember: even confident people feel afraid. They act anyway.

**Why it matters:** Confidence unlocks nearly every good thing in life — better jobs, healthier relationships, bolder decisions. It is not the result of success; it is the precondition for it.`,
  },
]
