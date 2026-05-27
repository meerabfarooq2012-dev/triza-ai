'use client'

import { HeroSection } from './hero-section'
import { FeaturesSection } from './features-section'
import { HowItWorksSection } from './how-it-works-section'
import { CategoriesSection } from './categories-section'
import { AboutSection } from './about-section'
import { CTASection } from './cta-section'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CategoriesSection />
      <CTASection />
    </div>
  )
}
