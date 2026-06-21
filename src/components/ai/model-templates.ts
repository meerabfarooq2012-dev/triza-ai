/**
 * ============================================================
 *  MODEL TEMPLATES — Pre-built AI configurations
 * ============================================================
 *
 *  Har template ek ready-to-use AI hai. User "Create" dabati hai
 *  aur model apne aap ban jata hai with default categories.
 *
 *  Templates:
 *    1. Poetry Mood Detector — 6 moods
 *    2. Language Detector — Urdu/English/Roman Urdu/Hindi
 *    3. Sentiment Analyzer — Positive/Negative/Neutral
 *    4. Custom — blank slate (user khud categories banaye)
 * ============================================================
 */

export interface CategoryTemplate {
  name: string
  emoji: string
  color: string
  description: string
  exampleWords: string[]
}

export interface ModelTemplate {
  id: string
  name: string
  type: string
  description: string
  emoji: string
  gradient: string // CSS gradient for UI
  categories: CategoryTemplate[]
  useCases: string[]
}

export const MODEL_TEMPLATES: ModelTemplate[] = [
  // ============================================================
  // 1. POETRY MOOD DETECTOR
  // ============================================================
  {
    id: 'poetry-mood',
    name: 'Poetry Mood Detector',
    type: 'poetry-mood',
    description: 'Sher/poem ka mood pehchanta hai — sad, romantic, motivational, etc.',
    emoji: '🎭',
    gradient: 'linear-gradient(135deg, #ec4899, #9333ea)',
    useCases: [
      'Apna sher likho, AI mood batayega',
      'Different poets ka style compare karo',
      'Poetry collection organize karo mood-wise',
    ],
    categories: [
      {
        name: 'Sad / Dard',
        emoji: '😢',
        color: '#3b82f6',
        description: 'Dard, judaai, tanhai, gham',
        exampleWords: [
          'dard', 'gham', 'tanhai', 'judaai', 'aansoo', 'rota',
          'dukhi', 'udaas', 'virani', 'sham', 'raat', 'yaad',
          'bewafa', 'chale', 'gaye', 'bichhad', 'akela', 'toota',
        ],
      },
      {
        name: 'Romantic / Mohabbat',
        emoji: '💝',
        color: '#ec4899',
        description: 'Mohabbat, ishq, dil, pyar',
        exampleWords: [
          'mohabbat', 'ishq', 'dil', 'pyar', 'jaan', 'sanam',
          'mahboob', 'haseen', 'nazreen', 'lab', 'zulf', 'chehra',
          'milan', 'deewana', 'ashiq', 'tamanna', 'khwahish',
        ],
      },
      {
        name: 'Motivational / Junoon',
        emoji: '🔥',
        color: '#f59e0b',
        description: 'Himmat, junoon, buland, yaqeen',
        exampleWords: [
          'yaqeen', 'himmat', 'junoon', 'buland', 'manzil', 'raasta',
          'uth', 'chal', 'lado', 'tod', 'ban', 'sajaa',
          'taqat', 'jazba', 'behad', 'aasmaan', 'par', 'ud',
        ],
      },
      {
        name: 'Peaceful / Sukoon',
        emoji: '🌙',
        color: '#8b5cf6',
        description: 'Sukoon, raat, chaand, khamoshi',
        exampleWords: [
          'sukoon', 'khamoshi', 'raat', 'chaand', 'tare', 'sannata',
          'thandi', 'hawa', 'saaya', 'shab', 'sahar', 'chain',
          'itminan', 'nami', 'barish', 'pighla', 'mera',
        ],
      },
      {
        name: 'Angry / Ghussa',
        emoji: '⚡',
        color: '#ef4444',
        description: 'Ghussa, dushmani, tootna',
        exampleWords: [
          'ghussa', 'dushman', 'toot', 'tod', 'mar', 'larai',
          'aag', 'barbaad', 'nafrat', 'saaza', 'badla', 'khatam',
          'jala', 'raakh', 'tabah', 'ghamand', 'takabbur',
        ],
      },
      {
        name: 'Happy / Khushi',
        emoji: '✨',
        color: '#10b981',
        description: 'Khushi, muskurahat, bahar, chah',
        exampleWords: [
          'khushi', 'muskurahat', 'bahar', 'gul', 'gulshan', 'chaman',
          'khil', 'har', 'tar', 'rangeen', 'dhoop', 'subah',
          'roshan', 'ujla', 'zinda', 'chah', 'umeed', 'khush',
        ],
      },
    ],
  },

  // ============================================================
  // 2. LANGUAGE DETECTOR
  // ============================================================
  {
    id: 'language-detect',
    name: 'Language Detector',
    type: 'language-detect',
    description: 'Text ki language pehchanta hai — Urdu, English, Roman Urdu, Hindi',
    emoji: '🌐',
    gradient: 'linear-gradient(135deg, #22d3ee, #3b82f6)',
    useCases: [
      'Mixed text se language identify karo',
      'Urdu script vs Roman Urdu distinguish',
      'Multi-language content classify',
    ],
    categories: [
      {
        name: 'Urdu Script',
        emoji: '📜',
        color: '#10b981',
        description: 'Asli Urdu nastaliq script',
        exampleWords: [
          'اور', 'کے', 'میں', 'ہے', 'کو', 'نے',
          'پر', 'یہ', 'وہ', 'بھی', 'کہ', 'ایک',
          'ہم', 'آپ', 'کر', 'لیا', 'دیا', 'گيا',
        ],
      },
      {
        name: 'Roman Urdu',
        emoji: '🔤',
        color: '#22d3ee',
        description: 'Urdu roman script mein',
        exampleWords: [
          'kya', 'hai', 'main', 'tum', 'mera', 'tera',
          'karta', 'karti', 'hota', 'hoti', 'nahi', 'haan',
          'theek', 'achha', 'bura', 'pyaar', 'khushi', 'gham',
        ],
      },
      {
        name: 'English',
        emoji: '🇬🇧',
        color: '#3b82f6',
        description: 'Standard English text',
        exampleWords: [
          'the', 'is', 'are', 'was', 'were', 'have',
          'has', 'had', 'will', 'would', 'could', 'should',
          'and', 'but', 'because', 'however', 'although', 'through',
        ],
      },
      {
        name: 'Hindi (Devanagari)',
        emoji: '🇮🇳',
        color: '#f59e0b',
        description: 'Devanagari script Hindi',
        exampleWords: [
          'और', 'है', 'में', 'को', 'ने', 'पर',
          'यह', 'वह', 'भी', 'कि', 'एक', 'हम',
          'आप', 'कर', 'लिया', 'दिया', 'गया', 'था',
        ],
      },
    ],
  },

  // ============================================================
  // 3. SENTIMENT ANALYZER
  // ============================================================
  {
    id: 'sentiment',
    name: 'Sentiment Analyzer',
    type: 'sentiment',
    description: 'Text ka sentiment — positive, negative, ya neutral',
    emoji: '📊',
    gradient: 'linear-gradient(135deg, #10b981, #f59e0b)',
    useCases: [
      'Reviews ka sentiment samjho',
      'Comments ka mood analyze karo',
      'Feedback categorize karo',
    ],
    categories: [
      {
        name: 'Positive',
        emoji: '😊',
        color: '#10b981',
        description: 'Achhi, khush, pasand',
        exampleWords: [
          'achha', 'khoob', 'zabardast', 'lajawab', 'pyara', 'sundar',
          'umda', 'behtareen', 'shandaar', 'kamaal', 'dhansu', 'mast',
          'good', 'great', 'excellent', 'amazing', 'wonderful', 'love',
        ],
      },
      {
        name: 'Negative',
        emoji: '😞',
        color: '#ef4444',
        description: 'Bura, naraz, na-pasand',
        exampleWords: [
          'bura', 'kharab', 'be-kar', 'zhala', 'ghatia', 'disgusting',
          'boring', 'pathetic', 'useless', 'worse', 'worst', 'hate',
          'naraz', 'ghussa', 'dukhi', 'udaas', 'mayoos', 'toota',
        ],
      },
      {
        name: 'Neutral',
        emoji: '😐',
        color: '#9ca3af',
        description: 'Normal, factual',
        exampleWords: [
          'theek', 'normal', 'okay', 'fine', 'average', 'regular',
          'bas', 'chal', 'jaisa', 'waisa', 'thik', 'mehsoos', 'pata',
          'fact', 'information', 'detail', 'according', 'based', 'general',
        ],
      },
    ],
  },
]

// Custom template — blank slate for user
export const CUSTOM_TEMPLATE: Omit<ModelTemplate, 'categories'> & {
  categories: CategoryTemplate[]
} = {
  id: 'custom',
  name: 'Custom AI',
  type: 'custom',
  description: 'Bilkul apni AI — khud categories aur words define karo',
  emoji: '✨',
  gradient: 'linear-gradient(135deg, #9333ea, #ec4899)',
  useCases: [
    'Apne specific use case ke liye AI banao',
    'Poetry style classifier (tum vs dusre poets)',
    'Design feedback classifier',
  ],
  categories: [],
}

export function getTemplate(templateId: string): ModelTemplate | null {
  if (templateId === 'custom') return CUSTOM_TEMPLATE as ModelTemplate
  return MODEL_TEMPLATES.find((t) => t.id === templateId) || null
}

export function getAllTemplates(): (ModelTemplate & { isCustom?: boolean })[] {
  return [
    ...MODEL_TEMPLATES,
    { ...CUSTOM_TEMPLATE, isCustom: true } as ModelTemplate & {
      isCustom: boolean
    },
  ]
}
