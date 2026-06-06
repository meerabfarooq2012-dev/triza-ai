'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Share2, UserCheck, FileText, ArrowLeft, Cookie, BarChart3, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

const sections = [
  {
    icon: <Eye className="h-5 w-5" />,
    title: 'Information We Collect',
    content:
      'We may collect basic information such as your name, email address, contact details, and profile information when you sign up as a buyer, seller, or freelancer. We also collect data related to your activity on the platform, such as orders, listings, and transactions.',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'How We Use Your Information',
    content:
      'Your information is used to create and manage your account, enable buying, selling, and freelance services, process orders and payments securely, improve platform performance and user experience, and provide customer support and resolve disputes.',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: 'Data Protection',
    content:
      'We use secure systems, encryption, and protected databases to keep your data safe. Only authorized systems and administrators have access to necessary information.',
    gradient: 'from-amber-500 to-yellow-600',
  },
  {
    icon: <Share2 className="h-5 w-5" />,
    title: 'Sharing of Information',
    content:
      'We do not sell your personal data. Information may only be shared when required to complete transactions, comply with legal obligations, or protect platform safety.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: <UserCheck className="h-5 w-5" />,
    title: 'Your Rights',
    content:
      'You can update or delete your account information at any time through your profile settings.',
    gradient: 'from-orange-500 to-sky-600',
  },
  {
    icon: <Cookie className="h-5 w-5" />,
    title: 'Cookie Policy',
    content:
      'We use cookies and similar tracking technologies to provide and improve our services. Essential cookies are required for authentication, shopping cart functionality, and security (e.g., CSRF protection) — these cannot be disabled. Analytics cookies help us understand how visitors interact with our platform by collecting anonymous usage data. Marketing cookies are used to track visitors across websites and display relevant advertisements. You can manage your cookie preferences at any time through the cookie consent banner or your browser settings. Third-party services we use (such as payment processors and analytics tools) may also set their own cookies.',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'Changes to Policy',
    content:
      'Marketo may update this Privacy Policy from time to time. Any changes will be posted on this page.',
    gradient: 'from-amber-500 to-amber-600',
  },
]

export function PrivacyPolicy() {
  const { setCurrentView } = useMarketplaceStore()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-amber-100/30 dark:from-amber-950/30 dark:via-background dark:to-amber-950/20 py-16 sm:py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2ZDYxZjEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41Ii8+PC9nPjwvZz48L3N2Zz4=')] dark:opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="mb-6 text-muted-foreground hover:text-foreground"
              onClick={() => setCurrentView('landing')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>

            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-950/50 px-4 py-1.5 mb-6 text-sm text-amber-700 dark:text-amber-300 font-medium">
              <Shield className="h-3.5 w-3.5" />
              Legal
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Privacy{' '}
              <span className="gold-gradient-text bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              At Marketo, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group rounded-2xl border border-border/50 bg-background p-6 sm:p-8 hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="flex items-start gap-4">
                  <div className={`inline-flex shrink-0 rounded-xl bg-gradient-to-r ${section.gradient} p-3 text-white shadow-lg`}>
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {section.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detailed Cookie Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/50 via-background to-amber-50/30 dark:from-amber-950/20 dark:via-background dark:to-amber-950/10 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg">
                <Cookie className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">Detailed Cookie Information</h2>
            </div>

            <div className="space-y-5">
              {/* Essential */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mt-0.5">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">Essential Cookies</h3>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">Always Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    These cookies are strictly necessary for the website to function. They enable core features such as authentication (session tokens), shopping cart persistence, security (CSRF protection), and page navigation. You cannot opt out of essential cookies.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 mt-0.5">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">Analytics Cookies</h3>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">Optional</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    These cookies help us understand how visitors interact with our platform by collecting anonymous data about pages visited, time spent, and navigation patterns. This information is used to improve the user experience and platform performance. No personally identifiable information is collected.
                  </p>
                </div>
              </div>

              {/* Marketing */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 mt-0.5">
                  <Megaphone className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">Marketing Cookies</h3>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400">Optional</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    These cookies are used to track visitors across websites to display relevant and engaging advertisements. They may be set by third-party advertising partners and help measure the effectiveness of advertising campaigns. Opting out does not remove advertisements but makes them less relevant.
                  </p>
                </div>
              </div>

              {/* Third-party */}
              <div className="flex items-start gap-3">
                <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground mt-0.5">
                  <Share2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Third-Party Cookies</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Some cookies are placed by third-party services that appear on our pages. These include payment processors for secure transactions, analytics services for traffic measurement, and embedded content providers. We do not control these cookies — please refer to the respective third-party privacy policies for more information.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-amber-200/50 dark:border-amber-800/30">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Managing Your Preferences:</strong> You can change your cookie preferences at any time by clicking the cookie icon in the consent banner, or by adjusting your browser settings to block or delete cookies. Note that disabling certain cookies may affect the functionality of some parts of our website.
              </p>
            </div>
          </motion.div>

          {/* Agreement note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 rounded-2xl gold-gradient p-8 sm:p-10 text-center"
          >
            <p className="text-lg text-white/90 font-medium">
              By using Marketo, you agree to this Privacy Policy.
            </p>
            <p className="text-sm text-white/70 mt-2">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
