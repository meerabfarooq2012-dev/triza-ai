'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Send, Sparkles, Minimize2, ChevronRight, SkipForward, RotateCcw, Map, MessageCircle } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Thori — Thiora's AI Guide Mascot (3D Owl)
// - LEFT side: 3D owl tour guide (flies to sections, tours)
// - RIGHT side: Chat assistant panel
// - 3D CSS transforms for depth & perspective
// - Sparkle particles, floating animation, 3D orb base
// ─────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// Landing page tour steps
const LANDING_TOUR_STEPS = [
  {
    targetId: 'hero-section',
    title: 'Welcome to Thiora! 🎉',
    description: 'Create your shop, sell freelance services, digital downloads, or physical products — all in one international marketplace!',
  },
  {
    targetId: 'browse-by-type',
    title: 'Browse by Type 🔍',
    description: 'Explore three worlds: Digital Products, Physical Products, and Freelance Services — whatever you need!',
  },
  {
    targetId: 'commission-section',
    title: 'You Keep 90%! 💰',
    description: 'Sellers and freelancers keep 90% of earnings — only 10% commission. Much lower than competitors who take 25%!',
  },
  {
    targetId: 'features-section',
    title: 'Powerful Features ⚡',
    description: 'Custom shops, escrow payments, AI descriptions, order tracking, seller wallets, and much more!',
  },
  {
    targetId: 'how-it-works',
    title: 'Simple 3 Steps 📋',
    description: 'Sign Up → Pay Securely with Escrow (Easypaisa, JazzCash, PayFast, or crypto) → Confirm & Get Paid. It\'s that easy!',
  },
  {
    targetId: 'categories-section',
    title: 'Categories Galore! 🏷️',
    description: 'From Fashion to Electronics, Graphic Design to AI Services — find everything you need!',
  },
  {
    targetId: 'gigs-section',
    title: 'Freelance Services 🧑‍💻',
    description: 'Hire talented freelancers or offer your own services. Design, development, writing, marketing & more!',
  },
  {
    targetId: 'cta-section',
    title: 'Ready to Start? 🚀',
    description: 'Sign up for free and start selling or freelancing today. Work from anywhere, get paid globally!',
  },
]

// Post-login feature tour steps
const LOGIN_TOUR_STEPS = [
  {
    title: 'Welcome Back! 🎉',
    description: 'Let me show you around your Thiora dashboard! Here\'s everything you can do.',
  },
  {
    title: 'Your Dashboard 📊',
    description: 'Switch between Buyer and Seller dashboards. As a buyer, track orders and favorites. As a seller, manage products and analytics.',
  },
  {
    title: 'Create Your Shop 🏪',
    description: 'Set up a custom shop with your branding. Sell digital products, physical items, or freelance services (gigs)!',
  },
  {
    title: 'Offer Freelance Gigs 🧑‍💻',
    description: 'Create gig listings with Basic, Standard, and Premium packages. Earn 90% on every order!',
  },
  {
    title: 'Secure Escrow Payments 🔒',
    description: 'Payments are held safely until delivery is confirmed. Withdraw via PayPal, PayFast, bank transfer, or crypto.',
  },
  {
    title: 'Real-time Messages 💬',
    description: 'Chat with buyers, sellers, and freelancers in real-time. Quick responses lead to better ratings!',
  },
  {
    title: 'Track Orders 📦',
    description: 'Track orders from placement to delivery. File disputes if anything goes wrong — we\'ve got you covered.',
  },
  {
    title: 'Seller Wallet 💰',
    description: 'View your earnings, manage withdrawals, and track your income. Your money, your way!',
  },
  {
    title: 'Need Help? I\'m Here! ✨',
    description: 'Just tap me anytime! I can answer questions about any feature. Enjoy Thiora! 🌟',
  },
]

// Context-aware welcome messages
function getWelcomeMessage(isAuthenticated: boolean, userName?: string, currentView?: string): string {
  if (!isAuthenticated) {
    const greetings = [
      "Hey there! 👋 I'm Thori, your Thiora guide! I can help you explore our international marketplace — freelance services, digital downloads, and physical products, all in one place!",
      "Welcome to Thiora! ✨ I'm Thori, your personal guide! Here you can sell anything — freelance services, digital products, or physical items. Work from anywhere, get paid globally!",
      "Hi! 🌟 I'm Thori! Thiora is an international marketplace where sellers and freelancers keep 90% of earnings! Let me help you get started — just ask me anything!",
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  const name = userName ? ` ${userName}` : ''

  if (currentView === 'seller-dashboard') {
    return `Hey${name}! 🎉 Great to see you managing your shop! Need help with products, gigs, orders, or growing your sales? I'm here for you!`
  }

  if (currentView === 'buyer-dashboard') {
    return `Hey${name}! 👋 Looking for something special? I can help you find the perfect product, gig, or deal on Thiora!`
  }

  return `Hey${name}! 😊 I'm Thori, your Thiora guide! Whether you're buying, selling, or freelancing — I've got you covered. What can I help you with?`
}

// Suggested quick actions
function getSuggestedActions(isAuthenticated: boolean, currentView?: string): Array<{ label: string; message: string }> {
  if (!isAuthenticated) {
    return [
      { label: 'How does Thiora work?', message: 'How does Thiora work?' },
      { label: 'How to start selling?', message: 'How can I start selling on Thiora?' },
      { label: 'Payment methods', message: 'What payment methods does Thiora support?' },
    ]
  }

  if (currentView === 'seller-dashboard') {
    return [
      { label: 'Boost my sales', message: 'How can I boost my sales on Thiora?' },
      { label: 'Create a product', message: 'How do I create a new product listing?' },
      { label: 'Withdraw earnings', message: 'How do I withdraw my earnings?' },
    ]
  }

  if (currentView === 'buyer-dashboard') {
    return [
      { label: 'Find products', message: 'How do I find the best products?' },
      { label: 'Track my order', message: 'How do I track my order?' },
      { label: 'Escrow protection', message: 'How does escrow protection work?' },
    ]
  }

  return [
    { label: 'Explore features', message: 'What features does Thiora offer?' },
    { label: 'Become a freelancer', message: 'How can I start freelancing on Thiora?' },
    { label: 'Find freelancers', message: 'How do I find and hire freelancers?' },
  ]
}

export function AIGuideMascot() {
  const isAuthenticated = useMarketplaceStore((s) => s.isAuthenticated)
  const currentUser = useMarketplaceStore((s) => s.currentUser)
  const currentView = useMarketplaceStore((s) => s.currentView)

  // Chat state
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Tour state
  const [tourActive, setTourActive] = useState(false)
  const [tourStep, setTourStep] = useState(0)
  const [tourType, setTourType] = useState<'landing' | 'login'>('landing')
  const [showWelcome, setShowWelcome] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [tourCompleted, setTourCompleted] = useState(false)

  // 3D Mascot state
  const [isHovered, setIsHovered] = useState(false)
  const [mascotRotation, setMascotRotation] = useState({ x: 0, y: 0 })

  // Flying mascot state
  const [flyingToSection, setFlyingToSection] = useState(false)
  const [mascotPosition, setMascotPosition] = useState({ x: 0, y: 0 })
  const [returningHome, setReturningHome] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const mascotRef = useRef<HTMLDivElement>(null)
  const tourSeenRef = useRef<Set<string>>(new Set())
  const hasAutoStartedTour = useRef(false)

  // Check if tour was already seen
  useEffect(() => {
    try {
      const seen = localStorage.getItem('thiora-tour-seen')
      if (seen) tourSeenRef.current = new Set(JSON.parse(seen))
    } catch {}
  }, [])

  // Save tour as seen
  const markTourSeen = useCallback((tourId: string) => {
    tourSeenRef.current.add(tourId)
    try {
      localStorage.setItem('thiora-tour-seen', JSON.stringify([...tourSeenRef.current]))
    } catch {}
  }, [])

  // Clear tour history
  const clearTourHistory = useCallback(() => {
    tourSeenRef.current.clear()
    try {
      localStorage.removeItem('thiora-tour-seen')
    } catch {}
    setTourCompleted(false)
  }, [])

  // Show welcome bubble after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted && !tourActive) {
        setShowWelcome(true)
      }
    }, 2500)
    return () => clearTimeout(timer)
  }, [hasInteracted, tourActive])

  // Hide welcome bubble after time
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 7000)
      return () => clearTimeout(timer)
    }
  }, [showWelcome])

  // Auto-start landing page tour for new visitors
  useEffect(() => {
    if (hasAutoStartedTour.current) return
    if (currentView === 'landing' && !isAuthenticated && !tourActive && !tourCompleted) {
      const seen = tourSeenRef.current.has('landing')
      if (!seen) {
        hasAutoStartedTour.current = true
        const timer = setTimeout(() => {
          startLandingTour()
        }, 4000)
        return () => clearTimeout(timer)
      }
    }
  }, [currentView, isAuthenticated, tourActive, tourCompleted])

  // Auto-start login tour when user logs in for first time
  useEffect(() => {
    if (isAuthenticated && currentUser && !tourActive && !tourCompleted) {
      const seen = tourSeenRef.current.has(`login-${currentUser.id}`)
      if (!seen) {
        const timer = setTimeout(() => {
          startLoginTour()
        }, 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [isAuthenticated, currentUser, tourActive, tourCompleted])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  // 3D mouse tracking for mascot tilt effect
  useEffect(() => {
    if (!isHovered) {
      setMascotRotation({ x: 0, y: 0 })
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const mascotEl = mascotRef.current
      if (!mascotEl) return
      const rect = mascotEl.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      // Tilt based on mouse position relative to mascot center
      const rotY = ((e.clientX - centerX) / 200) * 15
      const rotX = -((e.clientY - centerY) / 200) * 15
      setMascotRotation({ x: rotX, y: rotY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isHovered])

  // Landing page tour
  const startLandingTour = useCallback(() => {
    setTourType('landing')
    setTourStep(0)
    setTourActive(true)
    setHasInteracted(true)
    setShowWelcome(false)
    setIsOpen(false)
    setReturningHome(false)
  }, [])

  // Login tour
  const startLoginTour = useCallback(() => {
    setTourType('login')
    setTourStep(0)
    setTourActive(true)
    setHasInteracted(true)
    setShowWelcome(false)
    setIsOpen(false)
    setReturningHome(false)
  }, [])

  // Fly mascot to a section element (positioned on left side)
  const flyToElement = useCallback((elementId: string) => {
    const el = document.getElementById(elementId)
    if (!el) return

    setFlyingToSection(true)
    const rect = el.getBoundingClientRect()
    const scrollToY = window.scrollY + rect.top - 120

    // Smooth scroll to the section
    window.scrollTo({ top: scrollToY, behavior: 'smooth' })

    // ALWAYS position mascot in the safe zone — top portion of viewport
    // This ensures the tooltip with Next button is always easily clickable
    // Mascot stays at a fixed safe Y position, NOT tied to section position
    const safeY = 100 // Always 100px from top — safe zone

    setTimeout(() => {
      setMascotPosition({ x: 20, y: safeY })
      setFlyingToSection(false)
    }, 600)
  }, [])

  // Handle tour step change
  useEffect(() => {
    if (!tourActive) return

    if (tourType === 'landing') {
      const step = LANDING_TOUR_STEPS[tourStep]
      if (step) {
        flyToElement(step.targetId)
      }
    }
  }, [tourStep, tourActive, tourType, flyToElement])

  // Complete tour and fly back home (to bottom-left)
  const completeTour = useCallback(() => {
    setReturningHome(true)

    setTimeout(() => {
      setTourActive(false)
      setReturningHome(false)
      setTourCompleted(true)
      setHasInteracted(false)

      if (tourType === 'landing') {
        markTourSeen('landing')
      } else if (currentUser?.id) {
        markTourSeen(`login-${currentUser.id}`)
      }
    }, 800)
  }, [tourType, currentUser, markTourSeen])

  const nextTourStep = useCallback(() => {
    const steps = tourType === 'landing' ? LANDING_TOUR_STEPS : LOGIN_TOUR_STEPS
    if (tourStep < steps.length - 1) {
      setTourStep((prev) => prev + 1)
    } else {
      completeTour()
    }
  }, [tourStep, tourType, completeTour])

  const skipTour = useCallback(() => {
    completeTour()
  }, [completeTour])

  // Chat functions
  const initializeChat = useCallback(() => {
    if (messages.length === 0) {
      const welcome = getWelcomeMessage(isAuthenticated, currentUser?.name, currentView)
      setMessages([{ id: 'welcome', role: 'assistant', content: welcome, timestamp: new Date() }])
    }
  }, [isAuthenticated, currentUser?.name, currentView, messages.length])

  const handleOpenChat = useCallback(() => {
    setHasInteracted(true)
    setShowWelcome(false)
    setIsOpen(true)
    setIsMinimized(false)
    initializeChat()
  }, [initializeChat])

  const handleCloseChat = useCallback(() => {
    setIsOpen(false)
    setIsMinimized(false)
  }, [])

  const handleMinimizeChat = useCallback(() => setIsMinimized(true), [])
  const handleRestoreChat = useCallback(() => setIsMinimized(false), [])

  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageText.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue('')
      setIsLoading(true)

      try {
        const response = await fetch('/api/ai/guide', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: messageText.trim(),
            history: messages.map((m) => ({ role: m.role, content: m.content })),
            context: {
              currentView,
              isAuthenticated,
              activeRole: currentUser?.role === 'seller' ? 'seller' : 'buyer',
              userName: currentUser?.name,
              hasShop: !!currentUser?.shop,
            },
          }),
        })

        const data = await response.json()

        if (data.success && data.data?.response) {
          setMessages((prev) => [
            ...prev,
            { id: `ai-${Date.now()}`, role: 'assistant', content: data.data.response, timestamp: new Date() },
          ])
        } else {
          setMessages((prev) => [
            ...prev,
            { id: `error-${Date.now()}`, role: 'assistant', content: "Oops! 😅 Could you try asking again? I'm here to help!", timestamp: new Date() },
          ])
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: `error-${Date.now()}`, role: 'assistant', content: "I lost my way! 🌀 Please try again in a moment.", timestamp: new Date() },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, messages, currentView, isAuthenticated, currentUser]
  )

  const handleSendMessage = useCallback(() => sendMessage(inputValue), [inputValue, sendMessage])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage]
  )

  const handleQuickAction = useCallback((message: string) => sendMessage(message), [sendMessage])

  const suggestedActions = getSuggestedActions(isAuthenticated, currentView)

  // Get current tour step data
  const currentTourStep = tourActive
    ? tourType === 'landing'
      ? LANDING_TOUR_STEPS[tourStep]
      : LOGIN_TOUR_STEPS[tourStep]
    : null

  const totalTourSteps = tourType === 'landing' ? LANDING_TOUR_STEPS.length : LOGIN_TOUR_STEPS.length

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          LANDING PAGE TOUR — Thori flies to each section (from LEFT)
          ═══════════════════════════════════════════════════════════ */}
      {tourActive && tourType === 'landing' && currentTourStep && (
        <>
          {/* Flying 3D Mascot near the section — LEFT side */}
          <div
            ref={mascotRef}
            className={`fixed z-[60] transition-all duration-700 ease-in-out ${
              flyingToSection
                ? 'opacity-40 scale-50 -translate-y-4'
                : returningHome
                ? 'opacity-0 scale-30 translate-x-[-100px] translate-y-[400px]'
                : 'opacity-100 scale-100'
            }`}
            style={{
              left: `${mascotPosition.x}px`,
              top: `${mascotPosition.y}px`,
            }}
          >
            {/* NO animate-float during tour — keeps mascot stable */}
            <div className="relative" style={{ perspective: '300px' }}>
              {/* 3D Mascot with perspective transform */}
              <div
                className="relative transition-transform duration-200 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateX(${mascotRotation.x}deg) rotateY(${mascotRotation.y}deg)`,
                }}
              >
                <img
                  src="/mascot-3d.png"
                  alt="Thori"
                  width={80}
                  height={80}
                  className="rounded-2xl ring-2 ring-amber-400/60 shadow-xl shadow-amber-400/30 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/30 object-cover"
                  style={{
                    transform: 'translateZ(10px)',
                    filter: 'drop-shadow(0 4px 8px rgba(180, 130, 30, 0.3))',
                  }}
                />
                {/* 3D depth layers */}
                <div
                  className="absolute inset-0 rounded-2xl bg-amber-400/10"
                  style={{ transform: 'translateZ(-5px)', filter: 'blur(2px)' }}
                />
                {/* 3D shadow underneath */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-14 h-3 bg-amber-900/10 dark:bg-amber-400/10 rounded-full blur-sm" />
              </div>
              {/* Sparkle trail */}
              <div className="absolute -top-3 -right-3 w-5 h-5">
                <Sparkles className="w-5 h-5 text-amber-400 animate-sparkle" />
              </div>
              <div className="absolute -bottom-2 -left-2 w-4 h-4">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-sparkle-delayed" />
              </div>
              {/* Magic wand trail dots */}
              <div className="absolute -right-5 top-1/2 w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              <div className="absolute -right-9 top-1/3 w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>

          {/* Tour Tooltip — appears to the RIGHT of the mascot, ALWAYS in safe zone */}
          <div
            className="fixed z-[59] transition-all duration-700 ease-in-out"
            style={{
              left: `${mascotPosition.x + 92}px`,
              top: `${Math.max(mascotPosition.y - 10, 16)}px`,
              maxWidth: '320px',
            }}
          >
            <div className="animate-fade-in bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-800 overflow-hidden">
              {/* Arrow pointing left to mascot */}
              <div className="absolute left-0 top-6 -translate-x-2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-white dark:border-r-gray-900" />
              {/* Header with progress */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/mascot-3d.png" alt="Thori" width={24} height={24} className="rounded-full bg-amber-200" />
                    <span className="text-sm font-semibold">Thori</span>
                  </div>
                  <span className="text-[11px] text-amber-100">{tourStep + 1}/{totalTourSteps}</span>
                </div>
                {/* Progress bar */}
                <div className="mt-1.5 h-1.5 bg-amber-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/80 rounded-full transition-all duration-500"
                    style={{ width: `${((tourStep + 1) / totalTourSteps) * 100}%` }}
                  />
                </div>
              </div>
              {/* Content */}
              <div className="px-4 py-3">
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-1">{currentTourStep.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{currentTourStep.description}</p>
              </div>
              {/* Actions — BIGGER and easier to click */}
              <div className="px-4 pb-3 flex items-center justify-between">
                <button
                  onClick={skipTour}
                  className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Skip tour
                </button>
                <button
                  onClick={nextTourStep}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                >
                  {tourStep < totalTourSteps - 1 ? 'Next' : 'Finish! 🏠'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          LOGIN TOUR — Feature highlights after login
          ═══════════════════════════════════════════════════════════ */}
      {tourActive && tourType === 'login' && currentTourStep && (
        <div className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${returningHome ? 'opacity-0' : 'opacity-100'}`}>
          <div className="animate-slide-up max-w-[400px] w-[90vw]">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-800 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-5 text-white text-center">
                <div className="flex justify-center mb-3">
                  {/* NO animate-float during tour — keeps mascot stable */}
                  <div style={{ perspective: '400px' }}>
                    <div className="relative">
                      <img
                        src="/mascot-3d.png"
                        alt="Thori"
                        width={90}
                        height={90}
                        className="rounded-2xl ring-3 ring-white/30 bg-amber-200 shadow-xl object-cover"
                        style={{
                          filter: 'drop-shadow(0 6px 12px rgba(180, 130, 30, 0.4))',
                        }}
                      />
                      {/* 3D reflection effect */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-3 bg-amber-900/10 rounded-full blur-sm" />
                    </div>
                  </div>
                </div>
                <h3 className="font-bold text-lg">{currentTourStep.title}</h3>
                <div className="mt-2 h-1.5 bg-amber-700/50 rounded-full overflow-hidden max-w-[200px] mx-auto">
                  <div
                    className="h-full bg-white/80 rounded-full transition-all duration-500"
                    style={{ width: `${((tourStep + 1) / totalTourSteps) * 100}%` }}
                  />
                </div>
              </div>
              {/* Content */}
              <div className="px-5 py-5 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{currentTourStep.description}</p>
              </div>
              {/* Actions */}
              <div className="px-5 pb-4 flex items-center justify-between">
                <button
                  onClick={skipTour}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <SkipForward className="w-3 h-3" />
                  Skip
                </button>
                <button
                  onClick={nextTourStep}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-full transition-colors shadow-md"
                >
                  {tourStep < totalTourSteps - 1 ? 'Next →' : "Let's Go! 🚀"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          LEFT SIDE — 3D Owl Mascot (Tour Guide)
          ═══════════════════════════════════════════════════════════ */}
      {!tourActive && (
        <div className="fixed bottom-20 left-6 z-50 flex flex-col items-start gap-2 md:bottom-6">
          {/* Welcome Bubble — appears above mascot */}
          {showWelcome && !isOpen && (
            <div className="animate-fade-in max-w-[260px] rounded-2xl bg-white dark:bg-gray-900 px-4 py-3 shadow-xl border border-amber-200 dark:border-amber-800 relative">
              <button
                onClick={() => { setShowWelcome(false); setHasInteracted(true) }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                ✕
              </button>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed pr-3">
                👋 Hey! I&apos;m <strong className="text-amber-600">Thori</strong>, your Thiora guide! Buy, sell, or freelance — I can help!
              </p>
              {/* Take tour buttons */}
              {!isAuthenticated && currentView === 'landing' && (
                <button
                  onClick={() => {
                    clearTourHistory()
                    startLandingTour()
                  }}
                  className="mt-2 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline"
                >
                  ✨ Take a quick tour?
                </button>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => {
                    clearTourHistory()
                    startLoginTour()
                  }}
                  className="mt-2 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline"
                >
                  ✨ Take a feature tour?
                </button>
              )}
            </div>
          )}

          {/* 3D Floating Mascot Button — LEFT side */}
          {!isOpen && (
            <button
              ref={mascotRef}
              onClick={handleOpenChat}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="group relative animate-float"
              aria-label="Open AI Guide"
            >
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-2xl animate-pulse-slow scale-125 pointer-events-none" />

              {/* Sparkles */}
              <div className="absolute -top-3 -right-3 animate-sparkle">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div className="absolute -bottom-2 -left-3 animate-sparkle-delayed">
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="absolute top-1/2 -right-5 animate-sparkle" style={{ animationDelay: '0.5s' }}>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </div>

              {/* 3D Mascot container with perspective */}
              <div
                className="relative transition-transform duration-300 ease-out"
                style={{
                  perspective: '600px',
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* 3D Rotating platform */}
                <div
                  className="relative transition-transform duration-200 ease-out"
                  style={{
                    transform: `rotateX(${mascotRotation.x}deg) rotateY(${mascotRotation.y}deg) translateZ(8px)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* 3D Owl image */}
                  <div className="relative w-[80px] h-[80px]">
                    {/* Background orb - 3D sphere effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-xl shadow-amber-500/30 overflow-hidden">
                      {/* 3D sphere highlight */}
                      <div className="absolute top-1 left-2 w-8 h-8 rounded-full bg-white/30 blur-sm" />
                      {/* 3D sphere shadow */}
                      <div className="absolute bottom-0 right-0 w-10 h-6 rounded-full bg-amber-700/30 blur-sm" />
                    </div>
                    {/* Owl mascot on top */}
                    <img
                      src="/mascot-3d.png"
                      alt="Thori - AI Guide"
                      width={76}
                      height={76}
                      className="absolute inset-0 m-auto w-[72px] h-[72px] rounded-full object-cover ring-2 ring-amber-300/50"
                      style={{
                        transform: 'translateZ(12px)',
                        filter: 'drop-shadow(0 4px 8px rgba(180, 130, 30, 0.35))',
                      }}
                    />
                    {/* 3D depth ring */}
                    <div
                      className="absolute inset-0 rounded-full ring-2 ring-amber-500/20"
                      style={{ transform: 'translateZ(-4px)' }}
                    />
                  </div>

                  {/* 3D Shadow below mascot */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-amber-900/10 dark:bg-amber-400/10 rounded-full blur-md transition-all duration-300 group-hover:w-20 group-hover:blur-lg pointer-events-none" />
                </div>
              </div>

              {/* Notification dot */}
              {!hasInteracted && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white dark:border-gray-900 animate-pulse" />
              )}

              {/* Hover tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 px-2 py-1 rounded-lg shadow-md whitespace-nowrap">
                  Click to chat!
                </span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          RIGHT SIDE — Minimized chat bubble
          ═══════════════════════════════════════════════════════════ */}
      {isOpen && isMinimized && !tourActive && (
        <button
          onClick={handleRestoreChat}
          className="animate-bounce-in fixed bottom-20 right-6 z-50 flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white pl-3 pr-4 py-2.5 shadow-xl transition-all hover:scale-105 md:bottom-6"
        >
          <img src="/mascot-3d.png" alt="Thori" width={28} height={28} className="rounded-full bg-amber-200 object-cover" />
          <span className="text-sm font-medium">Chat with Thori</span>
        </button>
      )}

      {/* ═══════════════════════════════════════════════════════════
          RIGHT SIDE — Chat Panel
          ═══════════════════════════════════════════════════════════ */}
      {isOpen && !isMinimized && !tourActive && (
        <div
          ref={chatContainerRef}
          className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] animate-slide-up"
        >
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[520px]">
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white">
              <div className="relative">
                <img src="/mascot-3d.png" alt="Thori" width={36} height={36} className="rounded-full ring-2 ring-white/30 object-cover" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">Thori</h3>
                <p className="text-[11px] text-amber-100">Your Thiora Guide ✨</p>
              </div>
              {/* Restart Tour Button */}
              <button
                onClick={() => {
                  clearTourHistory()
                  if (!isAuthenticated && currentView === 'landing') {
                    setIsOpen(false)
                    startLandingTour()
                  } else {
                    setIsOpen(false)
                    startLoginTour()
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-amber-600/50 transition-colors"
                aria-label="Restart Tour"
                title="Restart Tour"
              >
                <Map className="w-4 h-4" />
              </button>
              <button onClick={handleMinimizeChat} className="p-1.5 rounded-lg hover:bg-amber-600/50 transition-colors" aria-label="Minimize chat">
                <Minimize2 className="w-4 h-4" />
              </button>
              <button onClick={handleCloseChat} className="p-1.5 rounded-lg hover:bg-amber-600/50 transition-colors" aria-label="Close chat">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 min-h-[280px] max-h-[340px]">
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex gap-2 max-w-[85%]">
                        <div className="flex-shrink-0 mt-1">
                          <img src="/mascot-3d.png" alt="Thori" width={24} height={24} className="rounded-full object-cover" />
                        </div>
                        <div className="rounded-2xl rounded-tl-sm bg-amber-50 dark:bg-amber-950/30 px-3.5 py-2.5 text-sm text-gray-800 dark:text-gray-200 leading-relaxed border border-amber-100 dark:border-amber-900/50">
                          {msg.content}
                        </div>
                      </div>
                    )}
                    {msg.role === 'user' && (
                      <div className="rounded-2xl rounded-tr-sm bg-amber-500 text-white px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%]">
                        {msg.content}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="flex-shrink-0 mt-1">
                        <img src="/mascot-3d.png" alt="Thori" width={24} height={24} className="rounded-full object-cover" />
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-amber-50 dark:bg-amber-950/30 px-4 py-3 border border-amber-100 dark:border-amber-900/50">
                        <div className="flex gap-1.5 items-center">
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce-dot" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce-dot" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce-dot" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {suggestedActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action.message)}
                      className="text-[11px] px-2.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors truncate max-w-[160px]"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
                {/* Restart Tour quick action */}
                <button
                  onClick={() => {
                    clearTourHistory()
                    setIsOpen(false)
                    if (!isAuthenticated && currentView === 'landing') {
                      startLandingTour()
                    } else {
                      startLoginTour()
                    }
                  }}
                  className="mt-2 text-[11px] px-2.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restart Tour
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Thori anything..."
                  disabled={isLoading}
                  className="flex-1 text-sm border-amber-200 dark:border-amber-800 focus-visible:ring-amber-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  size="icon"
                  className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 h-9 w-9"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                Thori can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          LEFT SIDE — Small mascot hint when chat is open
          ═══════════════════════════════════════════════════════════ */}
      {isOpen && !tourActive && (
        <div className="fixed bottom-6 left-6 z-40">
          <div className="animate-fade-in flex flex-col items-center gap-1">
            <img
              src="/mascot-3d.png"
              alt="Thori"
              width={40}
              height={40}
              className="rounded-full opacity-60 animate-float object-cover"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(180, 130, 30, 0.2))' }}
            />
            <span className="text-[9px] text-muted-foreground">Thori</span>
          </div>
        </div>
      )}
    </>
  )
}

export default AIGuideMascot
