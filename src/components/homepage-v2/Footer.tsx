import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogleAndRedirect } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Twitter, Youtube, Mail, Heart, Zap, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { WizupLogo } from '@/components/homepage-v2/WizupLogo';

const footerLinks = {
  product: [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Rewards', href: '#rewards' },
    { label: 'Pricing', href: '/pricing' },
  ],
  creators: [
    { label: 'Creator Tools', href: '/creator' },
    { label: 'Apply as Creator', href: '/creator/apply' },
    { label: 'Affiliate Program', href: '/partners' },
  ],
  learn: [
    { label: 'Discover', href: '/discover' },
    { label: 'Communities', href: '/communities' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy.html' },
    { label: 'Terms of Service', href: '/terms.html' },
    { label: 'GDPR & Compliance', href: '/gdpr-compliance' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/wizup_live', label: 'Twitter' },
  { icon: Youtube, href: 'https://youtube.com/@wizup', label: 'YouTube' },
  { icon: MessageCircle, href: 'https://discord.gg/wizup', label: 'Discord' },
  { icon: Mail, href: 'mailto:wizuplive@gmail.com', label: 'Email' },
];

export function Footer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGetStarted = async () => {
    if (user) {
      navigate('/discover');
      return;
    }

    setIsAuthenticating(true);
    try {
      await signInWithGoogleAndRedirect(navigate);
    } catch (err) {
      console.error('Get started failed:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <footer className="relative bg-gradient-to-b from-white to-gray-50 border-t border-gray-200">
      {/* CTA Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Orb */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-200/40 to-violet-200/40 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-lg border border-violet-200 shadow-lg mb-6">
              <Zap className="w-4 h-4 text-violet-600 fill-violet-600" />
              <span className="text-sm font-semibold text-gray-700">
                Join 50,000+ learners today
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
              Ready to start earning for what you learn?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              No credit card. No paywall. Just your attention — converted into rewards you actually
              want.
            </p>

            {/* CTA Button */}
            <Button
              onClick={handleGetStarted}
              disabled={isAuthenticating}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-full px-10 py-6 text-lg font-semibold shadow-2xl hover:scale-105 transition-transform"
            >
              {isAuthenticating ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : user ? (
                'Go to Dashboard'
              ) : (
                'Get Started Free'
              )}
            </Button>
            <button
              type="button"
              onClick={() => navigate('/discover')}
              className="mt-4 inline-flex items-center justify-center text-sm font-semibold text-gray-700 underline-offset-4 hover:underline"
            >
              Explore creators →
            </button>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-gray-600">
              <span>✓ Free forever</span>
              <span>✓ No credit card</span>
              <span>✓ Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Footer */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Footer Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Logo Column */}
            <div className="col-span-2 space-y-4">
              <WizupLogo />
              <p className="text-sm text-gray-600 mb-4">
                Watch. Earn. Unlock. Turn your attention into rewards.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target={social.href.startsWith('http') ? '_blank' : undefined}
                      rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-violet-500 flex items-center justify-center group transition-all"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>

            {Object.entries(footerLinks).map(([label, links]) => (
              <div key={label}>
                <h4 className="font-semibold text-gray-900 mb-4 capitalize">{label}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        onClick={(e) => {
                          if (link.href.startsWith('http') || link.href.startsWith('mailto:')) {
                            return;
                          }
                          e.preventDefault();
                          navigate(link.href);
                        }}
                        className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>WIZUP · Turn attention into rewards.</span>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <a href="mailto:wizuplive@gmail.com" className="hover:text-indigo-600 transition-colors">
                  Contact
                </a>
                <span className="text-gray-500">© {new Date().getFullYear()} All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
