'use client'

import { useState, useEffect } from 'react'
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
  Quote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { useMarketplaceStore } from '@/store/use-marketplace-store'
import { api } from '@/lib/api'
import { PLATFORM_NAME, PLATFORM_TAGLINE, USER_ROLE_LABELS, USER_ROLE_DESCRIPTIONS } from '@/lib/constants'
import type { UserRole, User as UserType } from '@/types'

type AuthTab = 'login' | 'register'

export function AuthModal() {
  const [tab, setTab] = useState<AuthTab>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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

  const { login, setCurrentView } = useMarketplaceStore()

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!loginEmail || !loginPassword) {
      setError('Please fill in all fields')
      return
    }
    setIsLoading(true)
    try {
      const res = await api.auth.login(loginEmail, loginPassword)
      if (res.success && res.data) {
        const user = res.data.user || res.data
        login(user)
        navigateAfterAuth(user)
      } else {
        setError(res.error || 'Login failed')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setError('Please fill in all fields')
      return
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!regTerms) {
      setError('You must agree to the terms and conditions')
      return
    }
    setIsLoading(true)
    try {
      const res = await api.auth.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
      })
      if (res.success && res.data) {
        const user = res.data.user || res.data
        login(user)
        navigateAfterAuth(user)
      } else {
        setError(res.error || 'Registration failed')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left - Branding / Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-rose-500">
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
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-rose-500">
                <Store className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold">{PLATFORM_NAME}</span>
            </div>
            <p className="text-muted-foreground text-sm">{PLATFORM_TAGLINE}</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-muted p-1 mb-8">
            <button
              onClick={() => { setTab('login'); setError('') }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setError('') }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

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
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button
                      type="button"
                      className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
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
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white shadow-lg"
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
                    onClick={() => { setTab('register'); setError('') }}
                    className="text-violet-600 hover:text-violet-700 dark:text-violet-400 font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </motion.form>
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
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
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
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
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
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showRegConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30 ring-2 ring-violet-500/20'
                            : 'border-border hover:border-violet-300'
                        }`}
                        onClick={() => setRegRole(opt.value)}
                      >
                        <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                          <div className={`rounded-xl p-2 ${
                            regRole === opt.value
                              ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400'
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

                {/* Terms */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={regTerms}
                    onCheckedChange={(checked) => setRegTerms(checked === true)}
                    disabled={isLoading}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <span className="text-violet-600 dark:text-violet-400 font-medium">Terms of Service</span>{' '}
                    and{' '}
                    <span className="text-violet-600 dark:text-violet-400 font-medium">Privacy Policy</span>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600 text-white shadow-lg"
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
                    onClick={() => { setTab('login'); setError('') }}
                    className="text-violet-600 hover:text-violet-700 dark:text-violet-400 font-medium"
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
  )
}
