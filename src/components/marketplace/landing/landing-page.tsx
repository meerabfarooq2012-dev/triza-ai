'use client'

import { HeroSection } from './hero-section'
import { FeaturesSection } from './features-section'
import { HowItWorksSection } from './how-it-works-section'
import { CategoriesSection } from './categories-section'
import { GigsSection } from './gigs-section'
import { AboutSection } from './about-section'
import { CTASection } from './cta-section'
import { CommissionSection } from './commission-section'
import { BrowseByTypeSection } from './browse-by-type-section'
import { FlashDealsSection } from './flash-deals-section'
import { RecentlyViewedSection } from '@/components/marketplace/shared/recently-viewed-section'
import { StoryBar } from '@/components/marketplace/social/story-bar'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StoryBar />
      <RecentlyViewedSection hideWhenEmpty />
      <BrowseByTypeSection />
      <FlashDealsSection />
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
