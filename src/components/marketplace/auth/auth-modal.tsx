'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShoppingBag,
  Store,
  Sparkles,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Quote,
  AlertCircle,
  Check,
  X,
  MailCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import { PLATFORM_NAME, PLATFORM_TAGLINE, USER_ROLE_LABELS, USER_ROLE_DESCRIPTIONS } from '@/lib/constants'
import type { UserRole, User as UserType } from '@/types'
import { EmailVerificationDialog } from '@/components/marketplace/auth/email-verification-dialog'
import { TwoFactorVerify } from '@/components/marketplace/auth/two-factor-verify'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLanguage } from '@/hooks/use-language'

type AuthTab = 'login' | 'register' | 'forgotPassword'

// Shaking animation variants for error box
const shakeVariants = {
  initial: { opacity: 0, y: -10, x: 0 },
  animate: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.5 },
  },
}

export function AuthModal() {
  const [tab, setTab] = useState<AuthTab>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorKey, setErrorKey] = useState(0) // Used to re-trigger shake animation

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [regRole, setRegRole] = useState<UserRole>('buyer')
  const [regTerms, setRegTerms] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)

  // Touched state for inline validation
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [termsError, setTermsError] = useState(false)
  const [termsPulse, setTermsPulse] = useState(false)

  // Ref for auto-scrolling to error
  const errorRef = useRef<HTMLDivElement>(null)

  // Use individual selectors (Zustand best practice) — prevents corrupted localStorage
  // from overriding action functions with non-function values, which causes
  // "TypeError: X is not a function" in production (minified to "ew is not a function")
  const login = useMarketplaceStore((s) => s.login)
  const setAuthToken = useMarketplaceStore((s) => s.setAuthToken)
  const setRefreshToken = useMarketplaceStore((s) => s.setRefreshToken)
  const setCurrentView = useMarketplaceStore((s) => s.setCurrentView)

  const { t } = useLanguage()

  // Email verification dialog state
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [verificationUserId, setVerificationUserId] = useState<string | undefined>()
  const [verificationEmail, setVerificationEmail] = useState<string | undefined>()

  // 2FA pending state
  const [twoFactorPending, setTwoFactorPending] = useState<{ tempToken: string; userId: string; email: string } | null>(null)

  // Privacy/Terms dialog state
  const [showPolicy, setShowPolicy] = useState<'privacy' | 'terms' | null>(null)

  // Mark a field as touched
  const markTouched = useCallback((field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
  }, [])

  // Show error with shake animation
  const showError = useCallback((message: string) => {
    setError(message)
    setErrorKey((prev) => prev + 1)
  }, [])

  // Auto-scroll to error when it appears
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [error, errorKey])

  // Motivational quotes rotation
  const motivationalQuotes = [
    { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
    { text: 'Every expert was once a beginner. Start your journey today.', author: 'Unknown' },
    { text: 'Your marketplace. Your rules. Your success story starts here.', author: 'Marketo' },
    { text: 'Don\'t wait for opportunity. Create it.', author: 'Unknown' },
    { text: 'The best time to start was yesterday. The next best time is now.', author: 'Unknown' },
    { text: 'Turn your passion into profit. Your shop is just one click away.', author: 'Marketo' },
    { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
    { text: 'Dream big. Start small. Act now.', author: 'Unknown' },
  ]
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [motivationalQuotes.length])

  // Password validation helpers
  const hasMinLength = regPassword.length >= 6
  const passwordsMatch = regPassword.length > 0 && regConfirmPassword.length > 0 && regPassword === regConfirmPassword
  const passwordsMismatch = regPassword.length > 0 && regConfirmPassword.length > 0 && regPassword !== regConfirmPassword

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setTouchedFields({ loginEmail: true, loginPassword: true })

    if (!loginEmail || !loginPassword) {
      showError('Please fill in all fields')
      return
    }
    // Defensive: verify store actions are available (prevents corrupted localStorage crash)
    if (typeof login !== 'function' || typeof setAuthToken !== 'function') {
      showError('Session error. Please refresh the page and try again.')
      // Clear corrupted storage and reload
      try { localStorage.removeItem('marketo-storage') } catch {}
      setTimeout(() => window.location.reload(), 1500)
      return
    }
    setIsLoading(true)
    try {
      const res = await api.auth.login(loginEmail, loginPassword)
      // Check if 2FA is required
      const responseData = res.data as Record<string, unknown> | undefined
      if (res.success && responseData?.requiresTwoFactor) {
        setTwoFactorPending({
          tempToken: responseData.tempToken as string,
          userId: responseData.userId as string,
          email: responseData.email as string,
        })
        setIsLoading(false)
        return
      }
      if (res.success && res.data) {
        const user = res.data.user || res.data
        const token = res.data.token
        const refreshToken = (res.data as Record<string, unknown>)?.refreshToken as string | undefined
        if (token) {
          setAuthToken(token)
          // Also set httpOnly cookies server-side for extra security
          api.auth.setAuthCookies(token, refreshToken).catch(() => {})
        }
        if (refreshToken) {
          setRefreshToken(refreshToken)
        }
        login(user)
        navigateAfterAuth(user)
      } else {
        showError(res.error || 'Login failed')
      }
    } catch (err: unknown) {
      // If the error looks like a corrupted store issue, clear localStorage
      const message = err instanceof Error ? err.message : 'Login failed'
      if (message.includes('is not a function')) {
        try { localStorage.removeItem('marketo-storage') } catch {}
        showError('Session error. Refreshing...')
        setTimeout(() => window.location.reload(), 1500)
        return
      }
      showError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setTouchedFields({
      regName: true,
      regEmail: true,
      regPassword: true,
      regConfirmPassword: true,
    })

    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      showError('Please fill in all fields')
      return
    }
    if (regPassword.length < 6) {
      showError('Password must be at least 6 characters')
      return
    }
    if (regPassword !== regConfirmPassword) {
      showError('Passwords do not match')
      return
    }
    if (!regTerms) {
      setTermsError(true)
      setTermsPulse(true)
      setTimeout(() => setTermsPulse(false), 2000)
      showError('You must agree to the terms and conditions')
      return
    }
    setTermsError(false)
    setIsLoading(true)
    try {
      const res = await api.auth.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        termsAccepted: true,
      })
      if (res.success && res.data) {
        const user = res.data.user || res.data
        const token = res.data.token
        const refreshToken = (res.data as Record<string, unknown>)?.refreshToken as string | undefined
        if (token) {
          setAuthToken(token)
          // Also set httpOnly cookies server-side for extra security
          api.auth.setAuthCookies(token, refreshToken).catch(() => {})
        }
        if (refreshToken) {
          setRefreshToken(refreshToken)
        }
        login(user)
        // Show email verification dialog if email is not verified
        if (!user.emailVerified) {
          setVerificationUserId(user.id)
          setVerificationEmail(user.email)
          setShowEmailVerification(true)
        }
        navigateAfterAuth(user)
      } else {
        showError(res.error || 'Registration failed')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      showError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const navigateAfterAuth = (user: UserType) => {
    if (!user) return
    if (user.isAdmin) {
      setCurrentView('admin')
    } else if (user.role === 'seller' || user.role === 'both') {
      setCurrentView('seller-dashboard')
    } else {
      setCurrentView('buyer-dashboard')
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setTouchedFields({ forgotEmail: true })

    if (!forgotEmail) {
      showError('Please enter your email address')
      return
    }
    setIsLoading(true)
    try {
      const res = await api.auth.forgotPassword(forgotEmail)
      if (res.success) {
        setForgotSuccess(true)
      } else {
        showError(res.error || 'Failed to send reset link')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset link'
      showError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      showError('Google Sign-In is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Load Google Identity Services script
      if (!window.google) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://accounts.google.com/gsi/client'
          script.async = true
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Google SDK'))
          document.head.appendChild(script)
        })
      }

      // Determine role for Google auth
      const googleRole = tab === 'register' ? regRole : 'buyer'

      // Use the popup token client for a reliable OAuth flow
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: (tokenResponse: { access_token: string; error?: string }) => {
          if (tokenResponse.error) {
            showError('Google sign-in failed: ' + tokenResponse.error)
            setIsLoading(false)
            return
          }
          // Send access token to backend
          fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken: tokenResponse.access_token,
              role: googleRole,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.data) {
                const token = data.data.token
                const refreshToken = data.data.refreshToken
                if (token) {
                  setAuthToken(token)
                  api.auth.setAuthCookies(token, refreshToken).catch(() => {})
                }
                if (refreshToken) {
                  setRefreshToken(refreshToken)
                }
                const user = data.data.user || data.data
                login(user)
                navigateAfterAuth(user)
              } else {
                showError(data.error || 'Google sign-in failed')
              }
            })
            .catch(() => showError('Google sign-in failed'))
            .finally(() => setIsLoading(false))
        },
      })

      tokenClient.requestAccessToken()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed'
      showError(message)
      setIsLoading(false)
    }
  }

  // Check if Google Sign-In is configured
  const isGoogleConfigured = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const roleOptions: { value: UserRole; icon: React.ReactNode; title: string; desc: string }[] = [
    {
      value: 'buyer',
      icon: <ShoppingBag className="h-6 w-6" />,
      title: USER_ROLE_LABELS.buyer,
      desc: USER_ROLE_DESCRIPTIONS.buyer,
    },
    {
      value: 'seller',
      icon: <Store className="h-6 w-6" />,
      title: USER_ROLE_LABELS.seller,
      desc: USER_ROLE_DESCRIPTIONS.seller,
    },
    {
      value: 'both',
      icon: <Sparkles className="h-6 w-6" />,
      title: USER_ROLE_LABELS.both,
      desc: USER_ROLE_DESCRIPTIONS.both,
    },
  ]

  // Helper to get inline validation class for input
  const getInputValidationClass = (fieldValue: string, fieldName: string) => {
    if (!touchedFields[fieldName]) return ''
    return fieldValue.trim() === ''
      ? 'border-red-400 dark:border-red-500 focus-visible:ring-red-500/30'
      : 'border-amber-400 dark:border-amber-500 focus-visible:ring-amber-500/30'
  }

  // Helper for inline hint text
  const getInlineHint = (fieldValue: string, fieldName: string, hintText: string) => {
    if (!touchedFields[fieldName] || fieldValue.trim() !== '') return null
    return (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1"
      >
        <AlertCircle className="h-3 w-3 shrink-0" />
        {hintText}
      </motion.p>
    )
  }

  return (
    <>
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left - Branding / Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-amber-600 via-amber-600 to-amber-500">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Store className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4">{PLATFORM_NAME}</h1>
            <p className="text-xl text-white/80 mb-8">{PLATFORM_TAGLINE}</p>
            <div className="mt-10 max-w-xs mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <Quote className="h-8 w-8 text-white/30 mx-auto mb-3" />
                  <p className="text-lg font-medium leading-relaxed text-white/90 italic">
                    &ldquo;{motivationalQuotes[quoteIndex].text}&rdquo;
                  </p>
                  <p className="text-sm text-white/50 mt-3">
                    — {motivationalQuotes[quoteIndex].author}
                  </p>
                </motion.div>
              </AnimatePresence>
              {/* Quote indicators */}
              <div className="flex justify-center gap-1.5 mt-5">
                {motivationalQuotes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setQuoteIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === quoteIndex ? 'w-6 bg-white/70' : 'w-1.5 bg-white/25 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        {/* Decorative floating shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 right-20 h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-32 left-16 h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, -12, 0], x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 right-1/4 h-12 w-12 rounded-lg bg-white/10 backdrop-blur-sm rotate-45"
        />
      </div>

      {/* Right - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-background">
        <div className="w-full max-w-md relative">
          {/* Loading overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl"
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                  <p className="text-sm text-muted-foreground font-medium">
                    {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-500">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold">{PLATFORM_NAME}</span>
            </div>
            <p className="text-muted-foreground text-sm">{PLATFORM_TAGLINE}</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-muted p-1 mb-8">
            <button
              onClick={() => { setTab('login'); setError(''); setTouchedFields({}); setForgotSuccess(false) }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('auth.signIn')}
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); setTouchedFields({}); setForgotSuccess(false) }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('auth.signUp')}
            </button>
          </div>

          {/* Error Display - Enhanced with shake animation, alert icon, larger text */}
          <AnimatePresence>
            {error && (
              <motion.div
                key={errorKey}
                variants={shakeVariants}
                initial="initial"
                animate={['animate', 'shake']}
                ref={errorRef}
                className="mb-6 rounded-lg border border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-950/50 p-4 flex items-start gap-3 shadow-sm"
              >
                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-700 dark:text-red-300 leading-relaxed">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                {isGoogleConfigured && (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      aria-label="Sign in with Google"
                      className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </button>
                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">or continue with email</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      onBlur={() => markTouched('loginEmail')}
                      className={`pl-10 ${getInputValidationClass(loginEmail, 'loginEmail')}`}
                      disabled={isLoading}
                    />
                  </div>
                  {getInlineHint(loginEmail, 'loginEmail', 'Email is required')}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button
                      type="button"
                      onClick={() => { setTab('forgotPassword'); setError(''); setTouchedFields({}); setForgotSuccess(false) }}
                      className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      onBlur={() => markTouched('loginPassword')}
                      className={`pl-10 pr-10 ${getInputValidationClass(loginPassword, 'loginPassword')}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {getInlineHint(loginPassword, 'loginPassword', 'Password is required')}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white dark:text-gray-900 shadow-lg"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Sign In
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('register'); setError(''); setTouchedFields({}); setForgotSuccess(false) }}
                    className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </motion.form>
            ) : tab === 'forgotPassword' ? (
              <motion.div
                key="forgotPassword"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <div>
                  <h2 className="text-xl font-semibold">Reset your password</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>

                {forgotSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-6 text-center space-y-4"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                      <MailCheck className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        If an account with that email exists, we&apos;ve sent a reset link.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Check your inbox and spam folder.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => { setTab('login'); setError(''); setTouchedFields({}); setForgotSuccess(false) }}
                      className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white dark:text-gray-900 shadow-lg"
                      size="lg"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Sign In
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="you@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          onBlur={() => markTouched('forgotEmail')}
                          className={`pl-10 ${getInputValidationClass(forgotEmail, 'forgotEmail')}`}
                          disabled={isLoading}
                        />
                      </div>
                      {getInlineHint(forgotEmail, 'forgotEmail', 'Email is required')}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white dark:text-gray-900 shadow-lg"
                      disabled={isLoading}
                      size="lg"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      Send Reset Link
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => { setTab('login'); setError(''); setTouchedFields({}); setForgotSuccess(false) }}
                        className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium inline-flex items-center gap-1"
                      >
                        <ArrowLeft className="h-3 w-3" />
                        Back to Sign In
                      </button>
                    </p>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister}
                className="space-y-5"
              >
                {isGoogleConfigured && (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      aria-label="Sign up with Google"
                      className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Sign Up with Google
                    </button>
                    {/* Compact role selector for Google sign-up */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Role for Google sign-up</Label>
                      <div className="flex gap-2">
                        {roleOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setRegRole(opt.value)}
                            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                              regRole === opt.value
                                ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 ring-1 ring-amber-500/20'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
                            }`}
                          >
                            {opt.icon}
                            <span className="hidden sm:inline">{opt.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">or sign up with email</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="John Doe"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      onBlur={() => markTouched('regName')}
                      className={`pl-10 ${getInputValidationClass(regName, 'regName')}`}
                      disabled={isLoading}
                    />
                  </div>
                  {getInlineHint(regName, 'regName', 'Full name is required')}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      onBlur={() => markTouched('regEmail')}
                      className={`pl-10 ${getInputValidationClass(regEmail, 'regEmail')}`}
                      disabled={isLoading}
                    />
                  </div>
                  {getInlineHint(regEmail, 'regEmail', 'Email is required')}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showRegPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      onBlur={() => markTouched('regPassword')}
                      className={`pl-10 pr-10 ${getInputValidationClass(regPassword, 'regPassword')}`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {getInlineHint(regPassword, 'regPassword', 'Password is required')}
                  {/* Password requirement indicator */}
                  {regPassword.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center gap-1.5 mt-1"
                    >
                      {hasMinLength ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                          <span className="text-xs text-amber-600 dark:text-amber-400">Minimum 6 characters</span>
                        </>
                      ) : (
                        <>
                          <X className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                          <span className="text-xs text-red-500 dark:text-red-400">
                            {6 - regPassword.length} more character{6 - regPassword.length !== 1 ? 's' : ''} needed
                          </span>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-confirm-password"
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      onBlur={() => markTouched('regConfirmPassword')}
                      className={`pl-10 pr-10 ${
                        getInputValidationClass(regConfirmPassword, 'regConfirmPassword') ||
                        (passwordsMismatch ? 'border-red-400 dark:border-red-500 focus-visible:ring-red-500/30' : '') ||
                        (passwordsMatch ? 'border-amber-400 dark:border-amber-500 focus-visible:ring-amber-500/30' : '')
                      }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showRegConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {getInlineHint(regConfirmPassword, 'regConfirmPassword', 'Please confirm your password')}
                  {/* Password match/mismatch indicator */}
                  {regConfirmPassword.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex items-center gap-1.5 mt-1"
                    >
                      {passwordsMatch ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                          <span className="text-xs text-amber-600 dark:text-amber-400">Passwords match</span>
                        </>
                      ) : passwordsMismatch ? (
                        <>
                          <X className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                          <span className="text-xs text-red-500 dark:text-red-400">Passwords don&apos;t match</span>
                        </>
                      ) : null}
                    </motion.div>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <Label>Choose Your Role</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {roleOptions.map((opt) => (
                      <Card
                        key={opt.value}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          regRole === opt.value
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 ring-2 ring-amber-500/20'
                            : 'border-border hover:border-amber-300'
                        }`}
                        onClick={() => setRegRole(opt.value)}
                      >
                        <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                          <div className={`rounded-xl p-2 ${
                            regRole === opt.value
                              ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {opt.icon}
                          </div>
                          <div className="text-xs font-semibold">{opt.title}</div>
                          <div className="text-[10px] text-muted-foreground leading-tight hidden sm:block">{opt.desc}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Terms - Enhanced with validation, pulsing animation, required hint */}
                <div className="space-y-1">
                  <div className={`flex items-start gap-3 rounded-lg p-3 -m-3 transition-colors ${
                    termsError
                      ? 'bg-red-50 dark:bg-red-950/30'
                      : ''
                  }`}>
                    <motion.div
                      animate={termsPulse ? {
                        scale: [1, 1.2, 1, 1.2, 1],
                      } : { scale: 1 }}
                      transition={{ duration: 0.8 }}
                      className="mt-0.5"
                    >
                      <Checkbox
                        id="terms"
                        checked={regTerms}
                        onCheckedChange={(checked) => {
                          setRegTerms(checked === true)
                          if (checked) {
                            setTermsError(false)
                          }
                        }}
                        disabled={isLoading}
                        className={`${
                          termsError
                            ? 'border-red-400 dark:border-red-500 data-[state=unchecked]:border-red-400 dark:data-[state=unchecked]:border-red-500'
                            : ''
                        }`}
                      />
                    </motion.div>
                    <Label
                      htmlFor="terms"
                      className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none"
                    >
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={() => setShowPolicy('terms')}
                        className="text-amber-600 dark:text-amber-400 font-medium hover:underline"
                      >
                        Terms of Service
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        onClick={() => setShowPolicy('privacy')}
                        className="text-amber-600 dark:text-amber-400 font-medium hover:underline"
                      >
                        Privacy Policy
                      </button>
                      <span className="text-red-500 dark:text-red-400 ml-0.5" aria-hidden="true">*</span>
                    </Label>
                  </div>
                  {termsError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 pl-0"
                    >
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      Please accept the terms to continue
                    </motion.p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white dark:text-gray-900 shadow-lg"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Create Account
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setTab('login'); setError(''); setTouchedFields({}); setForgotSuccess(false) }}
                    className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium"
                  >
                    Sign In
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Back to landing */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setCurrentView('landing')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Back to home
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Email Verification Dialog */}
    <EmailVerificationDialog
      open={showEmailVerification}
      onOpenChange={setShowEmailVerification}
      userId={verificationUserId}
      userEmail={verificationEmail}
    />

    {/* 2FA Verification Dialog */}
    <TwoFactorVerify
      open={!!twoFactorPending}
      onOpenChange={(open) => { if (!open) setTwoFactorPending(null) }}
      userId={twoFactorPending?.userId || ''}
      email={twoFactorPending?.email || ''}
      tempToken={twoFactorPending?.tempToken || ''}
    />

    {/* Privacy Policy / Terms of Service Dialog */}
    <Dialog open={!!showPolicy} onOpenChange={(open) => { if (!open) setShowPolicy(null) }}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-xl">
            {showPolicy === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-6">
            {showPolicy === 'privacy' ? (
              <>
                <p className="text-muted-foreground leading-relaxed">
                  At Marketo, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Information We Collect</h3>
                    <p className="text-sm text-muted-foreground">We may collect basic information such as your name, email address, contact details, and profile information when you sign up as a buyer, seller, or freelancer. We also collect data related to your activity on the platform, such as orders, listings, and transactions.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">How We Use Your Information</h3>
                    <p className="text-sm text-muted-foreground">Your information is used to create and manage your account, enable buying, selling, and freelance services, process orders and payments securely, improve platform performance and user experience, and provide customer support and resolve disputes.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Data Protection</h3>
                    <p className="text-sm text-muted-foreground">We use secure systems, encryption, and protected databases to keep your data safe. Only authorized systems and administrators have access to necessary information.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Sharing of Information</h3>
                    <p className="text-sm text-muted-foreground">We do not sell your personal data. Information may only be shared when required to complete transactions, comply with legal obligations, or protect platform safety.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Your Rights</h3>
                    <p className="text-sm text-muted-foreground">You can update or delete your account information at any time through your profile settings.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Changes to Policy</h3>
                    <p className="text-sm text-muted-foreground">Marketo may update this Privacy Policy from time to time. Any changes will be posted on this page.</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Marketo. By using our platform, you agree to follow these Terms of Service. Please read them carefully before using the website.
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">1. Use of Platform</h3>
                    <p className="text-sm text-muted-foreground">Marketo is a marketplace where users can join as buyers, sellers, freelancers, or both. You agree to use the platform only for legal and appropriate purposes.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">2. Accounts</h3>
                    <p className="text-sm text-muted-foreground">You are responsible for maintaining the security of your account. Any activity under your account is your responsibility. Providing false information or misusing the platform may result in account suspension.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">3. Buying and Selling</h3>
                    <p className="text-sm text-muted-foreground">Sellers are responsible for the accuracy of their listings, products, and services. Buyers agree to pay for orders they place. Marketo is not responsible for disputes between users but may help in resolving them.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">4. Payments</h3>
                    <p className="text-sm text-muted-foreground">All payments must be made through the platform&apos;s approved payment methods. Unauthorized transactions or fraud are strictly prohibited.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">5. Prohibited Activities</h3>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Upload illegal or harmful content</li>
                      <li>Attempt to hack or damage the system</li>
                      <li>Mislead or scam other users</li>
                      <li>Use the platform for unauthorized purposes</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">6. Termination</h3>
                    <p className="text-sm text-muted-foreground">Marketo reserves the right to suspend or terminate accounts that violate these terms without prior notice.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">7. Changes to Terms</h3>
                    <p className="text-sm text-muted-foreground">We may update these Terms of Service at any time. Continued use of the platform means you accept the updated terms.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
    </>
  )
}
