import { useEffect } from 'react';
import { Header } from '@/components/homepage-v2/Header';
import { Hero } from '@/components/homepage-v2/Hero';
import { HowItWorks } from '@/components/homepage-v2/HowItWorks';
import { RewardsShowcase } from '@/components/homepage-v2/RewardsShowcase';
import { PlatformFeatures } from '@/components/homepage-v2/PlatformFeatures';
import { FeaturedCreators } from '@/components/homepage-v2/FeaturedCreators';
import { Footer } from '@/components/homepage-v2/Footer';

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
        {/* Hero Section - Above the fold */}
        <Hero />

        {/* How It Works - 3 Step Process */}
        <HowItWorks />

        {/* Rewards Showcase - Featured Deals */}
        <RewardsShowcase />

        {/* Platform Features - "One Platform. All The Features." */}
        <PlatformFeatures />

        {/* Featured Creators - Carousel */}
        <FeaturedCreators />
      </main>

      {/* Footer - CTA + Links */}
      <Footer />
    </div>
  );
}
