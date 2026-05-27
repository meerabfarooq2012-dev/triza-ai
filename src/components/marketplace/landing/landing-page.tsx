'use client'

import { HeroSection } from './hero-section'
import { FeaturesSection } from './features-section'
import { HowItWorksSection } from './how-it-works-section'
import { CategoriesSection } from './categories-section'
import { FeaturedProductsSection } from './featured-products-section'
import { PopularShopsSection } from './popular-shops-section'
import { TestimonialsSection } from './testimonials-section'
import { CTASection } from './cta-section'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <PopularShopsSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  )
}
