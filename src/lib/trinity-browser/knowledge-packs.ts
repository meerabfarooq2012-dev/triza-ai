/**
 * ============================================================
 *  Knowledge Packs — Pre-built Knowledge for TRINITY Brain
 * ============================================================
 *
 *  Yeh file pre-built knowledge packs define karti hai jo user
 *  apne TRINITY brain mein ONE-CLICK install kar sakta hai.
 *
 *  Har pack ka apna theme hai (JS functions, Urdu poetry, etc).
 *  Har entry:
 *    - input:  code ya text jo TRINITY seekhega
 *    - label:  short name (memory mein dikhega)
 *    - category: grouping tag
 *
 *  Pack install hone par har entry trinity.learn() se memory mein
 *  jaati hai. Phir Think tab pe user unka use kar sakta hai.
 * ============================================================
 */

export interface KnowledgeEntry {
  /** Code ya text jo sikhana hai */
  input: string
  /** Short human-friendly name */
  label: string
  /** Category/grouping tag */
  category: string
}

export interface KnowledgePack {
  /** Unique id */
  id: string
  /** Display name */
  name: string
  /** Short description */
  description: string
  /** Emoji icon */
  emoji: string
  /** Theme color (tailwind class fragment, e.g. 'purple') */
  color: 'purple' | 'pink' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' | 'violet'
  /** All entries in the pack */
  entries: KnowledgeEntry[]
}

// ════════════════════════════════════════════════════════════
//  PACK 1 — JavaScript Functions (beginner-friendly)
// ════════════════════════════════════════════════════════════

const JS_FUNCTIONS_PACK: KnowledgePack = {
  id: 'js-functions',
  name: 'JavaScript Functions',
  description: 'Basic JS functions — add, subtract, greet, factorial, fibonacci, etc. TRINITY ko code structure samajhne ke liye.',
  emoji: '🟨',
  color: 'amber',
  entries: [
    {
      input: 'function add(a, b) { return a + b }',
      label: 'add function',
      category: 'math',
    },
    {
      input: 'function subtract(a, b) { return a - b }',
      label: 'subtract function',
      category: 'math',
    },
    {
      input: 'function multiply(a, b) { return a * b }',
      label: 'multiply function',
      category: 'math',
    },
    {
      input: 'function divide(a, b) { return a / b }',
      label: 'divide function',
      category: 'math',
    },
    {
      input: 'function greet(name) { return "hello " + name }',
      label: 'greet function',
      category: 'string',
    },
    {
      input: 'function isEven(n) { return n % 2 === 0 }',
      label: 'isEven function',
      category: 'math',
    },
    {
      input: 'function factorial(n) { if (n <= 1) return 1; return n * factorial(n - 1) }',
      label: 'factorial function (recursive)',
      category: 'recursion',
    },
    {
      input: 'function fibonacci(n) { if (n < 2) return n; return fibonacci(n - 1) + fibonacci(n - 2) }',
      label: 'fibonacci function (recursive)',
      category: 'recursion',
    },
    {
      input: 'function reverseString(s) { return s.split("").reverse().join("") }',
      label: 'reverseString function',
      category: 'string',
    },
    {
      input: 'function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1) }',
      label: 'capitalize function',
      category: 'string',
    },
  ],
}

// ════════════════════════════════════════════════════════════
//  PACK 2 — Python Snippets
// ════════════════════════════════════════════════════════════

const PYTHON_PACK: KnowledgePack = {
  id: 'python-snippets',
  name: 'Python Snippets',
  description: 'Basic Python def functions, list comprehensions, loops. Doosri language bhi seekho.',
  emoji: '🐍',
  color: 'blue',
  entries: [
    {
      input: 'def greet(name):\n    return "hello " + name',
      label: 'python greet function',
      category: 'python',
    },
    {
      input: 'def add(a, b):\n    return a + b',
      label: 'python add function',
      category: 'python',
    },
    {
      input: 'def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, n):\n        if n % i == 0:\n            return False\n    return True',
      label: 'python is_prime function',
      category: 'python-math',
    },
    {
      input: 'squares = [x * x for x in range(10)]',
      label: 'python list comprehension (squares)',
      category: 'python-comprehension',
    },
    {
      input: 'for i in range(5):\n    print(i)',
      label: 'python for loop',
      category: 'python-loop',
    },
    {
      input: 'if x > 0:\n    print("positive")\nelse:\n    print("negative")',
      label: 'python if-else',
      category: 'python-conditional',
    },
  ],
}

// ════════════════════════════════════════════════════════════
//  PACK 3 — Urdu Poetry Moods (user is a poet!)
// ════════════════════════════════════════════════════════════

const POETRY_MOODS_PACK: KnowledgePack = {
  id: 'poetry-moods',
  name: 'Urdu Poetry Moods',
  description: 'Alag-alag shairi moods — dard, ishq, sukoon, inqilab, yaad, ruhani. TRINITY batayega tumhara shair kis mood mein hai.',
  emoji: '🌙',
  color: 'violet',
  entries: [
    {
      input: 'dil toot gaya raat bhar roya tanhai mein aansoo beh gaye',
      label: 'Sad / Dard poetry',
      category: 'poetry-mood',
    },
    {
      input: 'uski yaad aati hai har waqt uska chehra nazar aata hai',
      label: 'Nostalgic / Yaad poetry',
      category: 'poetry-mood',
    },
    {
      input: 'chand sitare chamak rahe hain raat sukoon bhari hai dil qaid hai',
      label: 'Peaceful / Sukoon poetry',
      category: 'poetry-mood',
    },
    {
      input: 'utho meri qaum ke log ab waqt aa gaya hai inqilab laao',
      label: 'Revolutionary / Inqilab poetry',
      category: 'poetry-mood',
    },
    {
      input: 'uske pyar mein pagal ho gaya hoon dil uske liye dhadakta hai',
      label: 'Romantic / Ishq poetry',
      category: 'poetry-mood',
    },
    {
      input: 'khuda ki bandgi karo roza namaz qaim rakho sabr shukar karo',
      label: 'Spiritual / Ruhani poetry',
      category: 'poetry-mood',
    },
  ],
}

// ════════════════════════════════════════════════════════════
//  PACK 4 — Common Bugs (so TRINITY can detect them)
// ════════════════════════════════════════════════════════════

const COMMON_BUGS_PACK: KnowledgePack = {
  id: 'common-bugs',
  name: 'Common Code Bugs',
  description: 'Galat patterns jo TRINITY pehchan sakta hai — off-by-one, infinite loop, missing await, typo, etc.',
  emoji: '🐛',
  color: 'rose',
  entries: [
    {
      input: 'for (let i = 0; i <= arr.length; i++) { console.log(arr[i]) }',
      label: 'BUG: off-by-one (<= should be <)',
      category: 'bug-off-by-one',
    },
    {
      input: 'while (true) { console.log("running") }',
      label: 'BUG: infinite loop (no exit condition)',
      category: 'bug-infinite-loop',
    },
    {
      input: 'async function fetchData() { const data = fetch(url); return data }',
      label: 'BUG: missing await on async call',
      category: 'bug-missing-await',
    },
    {
      input: 'function calculate(a, b) { return a + c }',
      label: 'BUG: undefined variable c (typo)',
      category: 'bug-undefined-var',
    },
    {
      input: 'if (x = 5) { console.log("x is 5") }',
      label: 'BUG: assignment instead of comparison (==)',
      category: 'bug-assign-vs-compare',
    },
    {
      input: 'function divide(a, b) { return a / b }',
      label: 'POTENTIAL: divide by zero not handled',
      category: 'bug-divide-zero',
    },
  ],
}

// ════════════════════════════════════════════════════════════
//  PACK 5 — Math Concepts (as text descriptions)
// ════════════════════════════════════════════════════════════

const MATH_CONCEPTS_PACK: KnowledgePack = {
  id: 'math-concepts',
  name: 'Math Concepts',
  description: 'Math concepts text roop mein — prime, even, factorial, fibonacci, sorting. Concepts samajhne ke liye.',
  emoji: '🔢',
  color: 'cyan',
  entries: [
    {
      input: 'a prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself',
      label: 'prime number definition',
      category: 'math-concept',
    },
    {
      input: 'an even number is an integer divisible by 2 with no remainder',
      label: 'even number definition',
      category: 'math-concept',
    },
    {
      input: 'factorial of n is the product of all positive integers from 1 to n denoted as n factorial',
      label: 'factorial definition',
      category: 'math-concept',
    },
    {
      input: 'fibonacci sequence is a series where each number is the sum of the two preceding ones starting from 0 and 1',
      label: 'fibonacci definition',
      category: 'math-concept',
    },
    {
      input: 'sorting is arranging elements of a list in ascending or descending order by some comparison',
      label: 'sorting definition',
      category: 'math-concept',
    },
    {
      input: 'recursion is when a function calls itself to solve smaller instances of the same problem',
      label: 'recursion definition',
      category: 'math-concept',
    },
  ],
}

// ════════════════════════════════════════════════════════════
//  PACK 6 — Roman Urdu Vocabulary
// ════════════════════════════════════════════════════════════

const ROMAN_URDU_PACK: KnowledgePack = {
  id: 'roman-urdu-vocab',
  name: 'Roman Urdu Vocabulary',
  description: 'Aam Roman Urdu phrases aur words. TRINITY ko Urdu samajhne ke liye.',
  emoji: '🗣️',
  color: 'emerald',
  entries: [
    {
      input: 'kaise ho aap theek hain shukriya',
      label: 'greeting phrases (kaise ho)',
      category: 'urdu-greeting',
    },
    {
      input: 'khana khaya aap ne kal kya kiya',
      label: 'daily life phrases (khana, kal)',
      category: 'urdu-daily',
    },
    {
      input: 'mujhe yaad aati hai woh din jab hum saath the',
      label: 'memory/nostalgia phrases',
      category: 'urdu-emotion',
    },
    {
      input: 'dard dil dukh tanha aansoo',
      label: 'sadness words (dard, dukh, tanha)',
      category: 'urdu-sad',
    },
    {
      input: 'khushi muskurahat raat sukoon chain',
      label: 'happiness words (khushi, sukoon)',
      category: 'urdu-happy',
    },
    {
      input: 'ishq mohabbat pyar dil dhadkan',
      label: 'love words (ishq, pyar)',
      category: 'urdu-love',
    },
    {
      input: 'utho ludo chalo aao jaldi karo',
      label: 'action words (utho, chalo)',
      category: 'urdu-action',
    },
  ],
}

// ════════════════════════════════════════════════════════════
//  PACK 7 — HTML / CSS Basics
// ════════════════════════════════════════════════════════════

const HTML_CSS_PACK: KnowledgePack = {
  id: 'html-css-basics',
  name: 'HTML & CSS Basics',
  description: 'HTML tags aur CSS properties. Web dev ke basic patterns.',
  emoji: '🎨',
  color: 'pink',
  entries: [
    {
      input: '<div class="container">content here</div>',
      label: 'HTML div with class',
      category: 'html',
    },
    {
      input: '<span style="color: red">text</span>',
      label: 'HTML span with inline style',
      category: 'html',
    },
    {
      input: '<a href="https://example.com">click here</a>',
      label: 'HTML anchor link',
      category: 'html',
    },
    {
      input: '<button onclick="handleClick()">Submit</button>',
      label: 'HTML button with onclick',
      category: 'html',
    },
    {
      input: '.container { display: flex; gap: 16px; padding: 20px; }',
      label: 'CSS flex container',
      category: 'css',
    },
    {
      input: '.card { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }',
      label: 'CSS card style',
      category: 'css',
    },
  ],
}

// ════════════════════════════════════════════════════════════
//  PACK 8 — Poetry Forms (ghazal, nazm, etc)
// ════════════════════════════════════════════════════════════

const POETRY_FORMS_PACK: KnowledgePack = {
  id: 'poetry-forms',
  name: 'Poetry Forms (Shairi)',
  description: 'Urdu shairi ki forms — ghazal, nazm, rubai, shayari, qata. Tum poet ho, yeh tumhari understanding badhaye.',
  emoji: '✒️',
  color: 'purple',
  entries: [
    {
      input: 'ghazal is a poetic form with rhyming couplets and a refrain each couplet is called a sher and has its own theme',
      label: 'ghazal form definition',
      category: 'poetry-form',
    },
    {
      input: 'nazm is a poem with a single theme flowing through all verses unlike ghazal where each sher is independent',
      label: 'nazm form definition',
      category: 'poetry-form',
    },
    {
      input: 'rubai is a four line poem with rhyme scheme aaba where three lines rhyme and the third does not',
      label: 'rubai form definition',
      category: 'poetry-form',
    },
    {
      input: 'shayari is the art of expressing emotions through verses often romantic or philosophical in nature',
      label: 'shayari form definition',
      category: 'poetry-form',
    },
    {
      input: 'qata is a four line poem where all four lines rhyme with each other in scheme aaaa',
      label: 'qata form definition',
      category: 'poetry-form',
    },
    {
      input: 'sher is a couplet two lines of poetry in urdu tradition each sher must be complete in meaning',
      label: 'sher (couplet) definition',
      category: 'poetry-form',
    },
  ],
}

// ════════════════════════════════════════════════════════════
//  ALL PACKS
// ════════════════════════════════════════════════════════════

export const KNOWLEDGE_PACKS: KnowledgePack[] = [
  JS_FUNCTIONS_PACK,
  PYTHON_PACK,
  POETRY_MOODS_PACK,
  COMMON_BUGS_PACK,
  MATH_CONCEPTS_PACK,
  ROMAN_URDU_PACK,
  HTML_CSS_PACK,
  POETRY_FORMS_PACK,
]

/** Total entries across all packs (for stats) */
export function totalKnowledgeEntries(): number {
  return KNOWLEDGE_PACKS.reduce((sum, p) => sum + p.entries.length, 0)
}

/** Get a pack by id */
export function getPackById(id: string): KnowledgePack | undefined {
  return KNOWLEDGE_PACKS.find((p) => p.id === id)
}
