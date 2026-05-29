'use client'

import { HeroSection } from './hero-section'
import { FeaturesSection } from './features-section'
import { HowItWorksSection } from './how-it-works-section'
import { CategoriesSection } from './categories-section'
import { GigsSection } from './gigs-section'
import { AboutSection } from './about-section'
import { CTASection } from './cta-section'
import { CommissionSection } from './commission-section'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <CommissionSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CategoriesSection />
      <GigsSection />
      <CTASection />
    </div>
  )
}
