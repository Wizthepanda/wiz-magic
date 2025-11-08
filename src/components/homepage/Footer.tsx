import { useRef } from 'react';
import { Twitter, Youtube, Mail, Heart, Star, MessageCircle } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const testimonials = [
  {
    quote: 'WIZUP transformed how I monetize my content. My community loves earning ZAPs!',
    author: 'Sarah Chen',
    role: 'Tech Educator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    quote: 'Finally, a platform that rewards viewers for learning. The engagement is incredible.',
    author: 'Michael Torres',
    role: 'Course Creator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
  },
  {
    quote: "I've unlocked 5 premium courses just by watching content I love. It's amazing!",
    author: 'Emma Wilson',
    role: 'Student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
  },
];

const faqs = [
  {
    question: 'What are ZAPs?',
    answer:
      'ZAPs are rewards you earn by watching content on WIZUP. You can use them to unlock premium courses, coaching sessions, and exclusive communities without spending money.',
  },
  {
    question: 'How do I earn ZAPs?',
    answer:
      'You earn ZAPs automatically as you watch videos from creators. The longer you watch, the more ZAPs you earn. Active participation like commenting and sharing can also boost your earnings.',
  },
  {
    question: 'Can creators cash out ZAPs?',
    answer:
      'Yes! Creators can convert ZAPs earned from their content into USD. We offer an 85% revenue share, one of the best in the industry.',
  },
  {
    question: 'Is WIZUP free to use?',
    answer:
      'Yes, WIZUP is completely free for learners. You can watch content, earn ZAPs, and unlock rewards without any upfront cost. Creators have free and paid options based on their needs.',
  },
];

const footerLinks = {
  company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Partners', href: '/partners' },
  ],
  resources: [
    { label: 'Discover', href: '/discover' },
    { label: 'Communities', href: '/communities' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Rewards', href: '/rewards' },
    { label: 'Help Center', href: '/help' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy.html' },
    { label: 'Terms of Service', href: '/terms.html' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
    { label: 'GDPR Compliance', href: '/gdpr-compliance' },
  ],
  connect: [
    { label: 'Contact', href: 'mailto:wizuplive@gmail.com', external: true },
    { label: 'Twitter', href: 'https://twitter.com/wizup_live', external: true },
    { label: 'Discord', href: 'https://discord.gg/wizup', external: true },
    { label: 'YouTube', href: 'https://youtube.com/@wizup', external: true },
  ],
};

export function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const navigate = useNavigate();

  return (
    <footer
      ref={ref}
      className="relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800"
    >
      {/* Testimonials Section */}
      <section
        id="pricing"
        className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Loved by Creators & Learners
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg p-6 shadow-lg"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h3>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg px-6 border-0 shadow-md"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 dark:text-white hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      {/* Footer Links */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Company */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">🪴 Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (!link.external) {
                          e.preventDefault();
                          navigate(link.href);
                        }
                      }}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">⚙️ Resources</h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (!link.external) {
                          e.preventDefault();
                          navigate(link.href);
                        }
                      }}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">⚖️ Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        if (!link.external) {
                          e.preventDefault();
                          navigate(link.href);
                        }
                      }}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">✉️ Connect</h4>
              <ul className="space-y-3">
                {footerLinks.connect.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Logo & Copyright */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  © 2025 WIZUP. Made with{' '}
                  <Heart className="w-4 h-4 inline text-red-500 fill-red-500" /> for learners
                </span>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a
                  href="https://twitter.com/wizup_live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="https://youtube.com/@wizup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
                <a
                  href="https://discord.gg/wizup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  aria-label="Discord"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href="mailto:wizuplive@gmail.com"
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
