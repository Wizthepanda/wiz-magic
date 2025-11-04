import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogleAndRedirect } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Sparkles, Twitter, Github, Linkedin, Mail, Heart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const footerLinks = {
  product: [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Rewards', href: '#rewards' },
    { label: 'Creators', href: '#creators' },
    { label: 'Pricing', href: '#' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Community', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Partners', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy.html' },
    { label: 'Terms of Service', href: '/terms.html' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'GDPR', href: '#' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
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

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Ready to start earning?
              </span>
            </h2>

            {/* Subheadline */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              No credit card required. Start watching, earning, and unlocking premium content in under 30 seconds.
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
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  WIZUP
                </span>
              </div>
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
                      className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-violet-500 flex items-center justify-center group transition-all"
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>© {new Date().getFullYear()} WIZUP. Made with</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>for learners</span>
              </div>

              {/* Additional Links */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Status
                </a>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Changelog
                </a>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
