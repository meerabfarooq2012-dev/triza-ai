'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Share2, UserCheck, FileText, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

const sections = [
  {
    icon: <Eye className="h-5 w-5" />,
    title: 'Information We Collect',
    content:
      'We may collect basic information such as your name, email address, contact details, and profile information when you sign up as a buyer, seller, or freelancer. We also collect data related to your activity on the platform, such as orders, listings, and transactions.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'How We Use Your Information',
    content:
      'Your information is used to create and manage your account, enable buying, selling, and freelance services, process orders and payments securely, improve platform performance and user experience, and provide customer support and resolve disputes.',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: 'Data Protection',
    content:
      'We use secure systems, encryption, and protected databases to keep your data safe. Only authorized systems and administrators have access to necessary information.',
    gradient: 'from-emerald-500 to-teal-600',
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
    gradient: 'from-cyan-500 to-sky-600',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'Changes to Policy',
    content:
      'Marketo may update this Privacy Policy from time to time. Any changes will be posted on this page.',
    gradient: 'from-fuchsia-500 to-purple-600',
  },
]

export function PrivacyPolicy() {
  const { setCurrentView } = useMarketplaceStore()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-rose-50 dark:from-violet-950/30 dark:via-background dark:to-rose-950/20 py-16 sm:py-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2ZDYxZjEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41Ii8+PC9nPjwvZz48L3N2Zz4=')] dark:opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl" />

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

            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 dark:bg-violet-950/50 px-4 py-1.5 mb-6 text-sm text-violet-700 dark:text-violet-300 font-medium">
              <Shield className="h-3.5 w-3.5" />
              Legal
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Privacy{' '}
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 bg-clip-text text-transparent">
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
                className="group rounded-2xl border border-border/50 bg-background p-6 sm:p-8 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/5"
              >
                <div className="flex items-start gap-4">
                  <div className={`inline-flex shrink-0 rounded-xl bg-gradient-to-r ${section.gradient} p-3 text-white shadow-lg`}>
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
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

          {/* Agreement note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-rose-500 p-8 sm:p-10 text-center"
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
