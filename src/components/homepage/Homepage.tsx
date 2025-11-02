import { Header } from './Header';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { RewardsShowcase } from './RewardsShowcase';
import { CreatorBenefits } from './CreatorBenefits';
import { FeaturedCreators } from './FeaturedCreators';
import { Footer } from './Footer';

/**
 * Premium WIZUP Homepage
 * Apple-like design with seamless Google Auth integration
 *
 * Features:
 * - Sticky header with theme toggle and auth CTAs
 * - Hero section with glassmorphic player and ZAP orb
 * - How It Works (3-step process)
 * - ZAPs Rewards showcase with carousel
 * - Creator benefits and monetization models
 * - Featured communities/creators
 * - Social proof, testimonials, and FAQ
 * - Comprehensive footer
 *
 * Auth Flow:
 * - Sign In / Get Started buttons trigger signInWithPopup
 * - On success, user is redirected to /discover
 * - No page reload or flicker
 * - Handles popup blocking with redirect fallback
 */
export function Homepage() {
  return (
    <div className="relative min-h-screen">
      {/* Sticky Header */}
      <Header />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <Hero />

        {/* How It Works */}
        <HowItWorks />

        {/* Rewards Showcase */}
        <RewardsShowcase />

        {/* Creator Benefits */}
        <CreatorBenefits />

        {/* Featured Creators/Communities */}
        <FeaturedCreators />
      </main>

      {/* Footer with Social Proof */}
      <Footer />
    </div>
  );
}
