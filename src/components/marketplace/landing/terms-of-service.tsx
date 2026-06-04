'use client'

import { motion } from 'framer-motion'
import { Scale, Users, Shield, ShoppingBag, Briefcase, CreditCard, Ban, XCircle, FileText, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMarketplaceStore } from '@/store/use-marketplace-store'

const sections = [
  {
    icon: <Users className="h-5 w-5" />,
    number: '1',
    title: 'Use of Platform',
    content:
      'Marketo is a marketplace where users can join as buyers, sellers, freelancers, or both. You agree to use the platform only for legal and appropriate purposes.',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    number: '2',
    title: 'Accounts',
    content:
      'You are responsible for maintaining the security of your account. Any activity under your account is your responsibility. Providing false information or misusing the platform may result in account suspension.',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    icon: <ShoppingBag className="h-5 w-5" />,
    number: '3',
    title: 'Buying and Selling',
    content:
      'Sellers are responsible for the accuracy of their listings, products, and services. Buyers agree to pay for orders they place. Marketo is not responsible for disputes between users but may help in resolving them.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: <Briefcase className="h-5 w-5" />,
    number: '4',
    title: 'Freelance Services',
    content:
      'Freelancers must deliver services as promised. Clients must communicate clearly and provide required information for work completion.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    number: '5',
    title: 'Payments',
    content:
      'All payments must be made through the platform\'s approved payment methods. Unauthorized transactions or fraud are strictly prohibited.',
    gradient: 'from-cyan-500 to-sky-600',
  },
  {
    icon: <Ban className="h-5 w-5" />,
    number: '6',
    title: 'Prohibited Activities',
    content: null,
    gradient: 'from-red-500 to-amber-600',
    list: [
      'Upload illegal or harmful content',
      'Attempt to hack or damage the system',
      'Mislead or scam other users',
      'Use the platform for unauthorized purposes',
    ],
  },
  {
    icon: <XCircle className="h-5 w-5" />,
    number: '7',
    title: 'Termination',
    content:
      'Marketo reserves the right to suspend or terminate accounts that violate these terms without prior notice.',
    gradient: 'from-amber-500 to-amber-600',
  },
  {
    icon: <FileText className="h-5 w-5" />,
    number: '8',
    title: 'Changes to Terms',
    content:
      'We may update these Terms of Service at any time. Continued use of the platform means you accept the updated terms.',
    gradient: 'from-amber-500 to-amber-600',
  },
]

export function TermsOfService() {
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
              <Scale className="h-3.5 w-3.5" />
              Legal
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Terms of{' '}
              <span className="gold-gradient-text bg-clip-text text-transparent">
                Service
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Welcome to Marketo. By using our platform, you agree to follow these Terms of Service. Please read them carefully before using the website.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="group rounded-2xl border border-border/50 bg-background p-6 sm:p-8 hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`inline-flex shrink-0 rounded-xl bg-gradient-to-r ${section.gradient} p-3 text-white shadow-lg`}>
                      {section.icon}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">{section.number}.</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {section.title}
                    </h2>
                    {section.content && (
                      <p className="text-muted-foreground leading-relaxed">
                        {section.content}
                      </p>
                    )}
                    {section.list && (
                      <ul className="space-y-2.5 mt-2">
                        {section.list.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-muted-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
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
            className="mt-12 rounded-2xl gold-gradient p-8 sm:p-10 text-center"
          >
            <p className="text-lg text-white/90 font-medium">
              By using Marketo, you agree to these Terms of Service.
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
