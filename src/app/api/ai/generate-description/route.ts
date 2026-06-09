import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { generateWithAI } from '@/lib/ai-provider'
import { rateLimit, getRateLimitKey, aiRateLimit } from '@/lib/rate-limit'

import { withCsrf } from '@/lib/with-csrf';
import { validateInput, aiDescriptionSchema } from '@/lib/validation';
type DescriptionType = 'product' | 'shop' | 'gig'

interface GenerateDescriptionBody {
  type: DescriptionType
  name: string
  details?: string
  keywords?: string
}

const VALID_TYPES: DescriptionType[] = ['product', 'shop', 'gig']

function buildSystemPrompt(type: DescriptionType): string {
  const baseContext = `You are a professional copywriter for "Thiora", a leading Pakistani online marketplace platform. Thiora connects sellers and buyers across Pakistan, offering both physical and digital products as well as freelance services (gigs). The platform supports local Pakistani payment methods including Easypaisa, JazzCash, and bank transfers.`

  switch (type) {
    case 'product':
      return `${baseContext}

Your task is to write compelling product descriptions for sellers on Thiora. Follow these guidelines:

- Write a professional, engaging product description between 150-300 words
- Make it SEO-friendly by naturally incorporating relevant keywords
- Highlight key features and benefits that appeal to Pakistani buyers
- Use clear formatting with bullet points for key features where appropriate
- Mention practical benefits like nationwide delivery, secure payments via Easypaisa/JazzCash, and buyer protection where relevant
- Include a persuasive call-to-action encouraging buyers to purchase
- Use a warm, trustworthy tone that resonates with the Pakistani market
- Do NOT use placeholder text — write the full description as if ready to publish
- Output ONLY the description text, no meta-commentary or labels`

    case 'shop':
      return `${baseContext}

Your task is to write an "About" section for shops on Thiora. Follow these guidelines:

- Write a professional, welcoming shop description between 100-200 words
- Make it SEO-friendly by naturally incorporating relevant keywords
- Convey trustworthiness and reliability — key factors for Pakistani online shoppers
- Highlight the shop's strengths, product categories, and customer commitment
- Mention local payment convenience (Easypaisa/JazzCash) and reliable delivery across Pakistan
- Use a warm, personal tone that helps build a connection with potential customers
- Use bullet points for key shop highlights where appropriate
- Do NOT use placeholder text — write the full description as if ready to publish
- Output ONLY the description text, no meta-commentary or labels`

    case 'gig':
      return `${baseContext}

Your task is to write compelling freelance service (gig) descriptions for sellers on Thiora. Follow these guidelines:

- Write a professional, persuasive gig description between 150-250 words
- Make it SEO-friendly by naturally incorporating relevant keywords
- Clearly explain what the freelancer offers, the process, and deliverables
- Highlight the seller's expertise and why buyers should choose them
- Mention secure payment through Easypaisa/JazzCash and Thiora's escrow protection where relevant
- Use clear formatting with bullet points for what's included, process steps, or package details
- Include a persuasive call-to-action encouraging buyers to place an order
- Use a confident, professional tone that builds trust
- Do NOT use placeholder text — write the full description as if ready to publish
- Output ONLY the description text, no meta-commentary or labels`
  }
}

function buildUserPrompt(body: GenerateDescriptionBody): string {
  const { type, name, details, keywords } = body

  let prompt = `Generate a ${type} description for: "${name}"`

  if (details && details.trim()) {
    prompt += `\n\nAdditional details: ${details.trim()}`
  }

  if (keywords && keywords.trim()) {
    prompt += `\n\nTarget keywords to include naturally: ${keywords.trim()}`
  }

  return prompt
}

export const POST = withCsrf(async (request: NextRequest) => {
  // Rate limiting — AI is costly
  const rlKey = getRateLimitKey(request);
  const rlResult = rateLimit({ ...aiRateLimit, key: `ai-desc:${rlKey}` });
  if (!rlResult.success) {
    return NextResponse.json({ success: false, error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  const auth = authenticateRequest(request);
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }
  try {
    let body: GenerateDescriptionBody

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate input with Zod
    const validation = validateInput(aiDescriptionSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const systemPrompt = buildSystemPrompt(body.type)
    const userPrompt = buildUserPrompt(body)

    // Generate using smart AI provider (auto-switches Z-AI ↔ Gemini)
    const description = await generateWithAI(systemPrompt, userPrompt)

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'AI could not generate a description. Please try again with more details.' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { description },
    })
  } catch (error) {
    console.error('Generate description error:', error)

    return NextResponse.json(
      { success: false, error: 'Failed to generate description. Please try again.' },
      { status: 500 }
    )
  }
})
