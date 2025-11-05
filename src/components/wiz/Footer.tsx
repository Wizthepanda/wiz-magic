import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-white to-purple-50 border-t border-purple-100">
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                WIZUP
              </h3>
            </motion.div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Empowering the next generation of creators through learning, watching, and earning.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                Alpha Stage
              </span>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Company
            </h4>
            <ul className="space-y-3">
              <FooterLink to="/about" label="About" />
              <FooterLink to="/careers" label="Careers" />
              <FooterLink to="/partners" label="Partners" />
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Resources
            </h4>
            <ul className="space-y-3">
              <FooterLink to="/discover" label="Discover" />
              <FooterLink to="/communities" label="Communities" />
              <FooterLink to="/leaderboard" label="Leaderboard" />
              <FooterLink to="/rewards" label="Rewards" />
              <FooterLink to="/help" label="Help Center" comingSoon />
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Legal
            </h4>
            <ul className="space-y-3">
              <FooterLink to="/privacy.html" label="Privacy Policy" />
              <FooterLink to="/terms.html" label="Terms of Service" />
              <FooterLink to="/cookie-policy" label="Cookie Policy" />
              <FooterLink to="/gdpr-compliance" label="GDPR Compliance" />
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Connect
            </h4>
            <ul className="space-y-3">
              <FooterExternalLink href="mailto:wizuplive@gmail.com" label="Contact" />
              <FooterExternalLink href="https://twitter.com/wizup_live" label="Twitter" />
              <FooterExternalLink href="https://discord.gg/wizup" label="Discord" />
              <FooterExternalLink href="https://youtube.com/@wizup" label="YouTube" />
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-purple-200 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} WIZUP. All rights reserved.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-blue-100 border border-purple-200"
          >
            <p className="text-sm font-medium bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              ✨ Built with magic for creators
            </p>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, label, comingSoon }: { to: string; label: string; comingSoon?: boolean }) => {
  return (
    <li>
      <Link to={to}>
        <motion.span
          whileHover={{ x: 4 }}
          className="text-sm text-gray-600 hover:text-purple-700 transition-colors inline-flex items-center gap-2"
        >
          {label}
          {comingSoon && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
              Soon
            </span>
          )}
        </motion.span>
      </Link>
    </li>
  );
};

const FooterExternalLink = ({ href, label }: { href: string; label: string }) => {
  return (
    <li>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <motion.span
          whileHover={{ x: 4 }}
          className="text-sm text-gray-600 hover:text-purple-700 transition-colors inline-block"
        >
          {label}
        </motion.span>
      </a>
    </li>
  );
};
