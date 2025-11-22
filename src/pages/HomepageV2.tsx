import { useEffect } from 'react';
import { Header } from '@/components/homepage-v2/Header';
import { Hero } from '@/components/homepage-v2/Hero';
import { HowItWorks } from '@/components/homepage-v2/HowItWorks';
import { RewardsShowcase } from '@/components/homepage-v2/RewardsShowcase';
import { PlatformFeatures } from '@/components/homepage-v2/PlatformFeatures';
import { FeaturedCreators } from '@/components/homepage-v2/FeaturedCreators';
import { Footer } from '@/components/homepage-v2/Footer';
import { SpotlightSection } from '@/components/homepage-v2/SpotlightSection';
import { SeriousLearnersSection } from '@/components/homepage-v2/SeriousLearnersSection';
import { ZapRewardsGrid } from '@/components/homepage-v2/ZapRewardsGrid';
import { GlobalReachSection } from '@/components/homepage-v2/GlobalReachSection';
import { NewsletterSection } from '@/components/homepage-v2/NewsletterSection';

export default function HomepageV2() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header - Sticky Navigation */}
      <Header />

      {/* Main Content */}
      <main>
        <Hero />
        <SpotlightSection />
        <SeriousLearnersSection />

        {/* How It Works - 3 Step Process */}
        <PlatformFeatures />
        <HowItWorks />
        <ZapRewardsGrid />
        <RewardsShowcase />
        <FeaturedCreators />
        <GlobalReachSection />
        <NewsletterSection />
      </main>

      {/* Footer - CTA + Links */}
      <Footer />
    </div>
  );
}
