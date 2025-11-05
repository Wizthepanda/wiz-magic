import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Mail, Twitter, MessageCircle, Youtube } from 'lucide-react';

export const Footer = () => {
  const footerSections = [
    {
      title: 'Company',
      links: [
        { name: 'About', path: '/about' },
        { name: 'Careers', path: '/careers' },
        { name: 'Partners', path: '/partners' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Discover', path: '/discover' },
        { name: 'Communities', path: '/communities' },
        { name: 'Leaderboard', path: '/leaderboard' },
        { name: 'Rewards', path: '/rewards' },
        { name: 'Help Center', path: '/help', badge: 'Coming soon' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', path: '/privacy.html' },
        { name: 'Terms of Service', path: '/terms.html' },
        { name: 'Cookie Policy', path: '/cookie-policy' },
        { name: 'GDPR Compliance', path: '/gdpr-compliance' },
      ],
    },
  ];

  const socialLinks = [
    {
      name: 'Email',
      icon: Mail,
      href: 'mailto:wizuplive@gmail.com',
      color: 'hover:text-red-500'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      href: 'https://twitter.com/wizup_live',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Discord',
      icon: MessageCircle,
      href: 'https://discord.gg/wizup',
      color: 'hover:text-indigo-500'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      href: 'https://youtube.com/@wizup',
      color: 'hover:text-red-600'
    },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-purple-50 via-lavender-50 to-white border-t border-purple-200/50 mt-20">
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 mb-6"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                <Star className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                WIZUP
              </h2>
            </motion.div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Empowering the next generation of creators through learning, watching, and earning. Join the WIZUP Alpha experience.
            </p>

            {/* Social Links */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Connect
              </h3>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-lg bg-white/70 backdrop-blur-sm border border-purple-200/50 text-gray-600 ${social.color} transition-all duration-300 shadow-sm hover:shadow-md`}
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links Sections */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center group"
                    >
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {link.name}
                      </span>
                      {link.badge && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-purple-200/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} WIZUP. All rights reserved.
            </p>

            {/* Alpha Badge */}
            <div className="flex items-center space-x-2">
              <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200/50">
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🚀 WIZUP Alpha v0.1
                </span>
              </div>
            </div>

            {/* Made with love */}
            <p className="text-sm text-gray-600">
              Made with 💜 for creators worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent pointer-events-none" />
    </footer>
  );
};
