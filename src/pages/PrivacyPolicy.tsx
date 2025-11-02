import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, Eye, Database, UserCheck, FileText, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 1,
      icon: Eye,
      title: 'Information We Collect',
      content: [
        {
          heading: 'Google Account Data (via OAuth)',
          items: [
            { label: 'Scope:', text: 'youtube.readonly' },
            { label: 'Purpose:', text: 'To verify YouTube watch history and engagement data (watched videos).' },
            { label: 'Note:', text: 'We only track which videos are watched — we do not access likes, comments, or uploads. This verification is strictly used for quest completion and XP (ZAP) reward calculation.' },
          ],
        },
        {
          heading: 'What We Request',
          items: [
            { text: '📧 Email Address (Google Sign-In) — Used solely for account management and authentication.' },
            { text: '⚡ XP Transactions & Engagement Records — Stored securely to record quest completions and reward distributions.' },
          ],
        },
        {
          heading: 'What We DON\'T Access',
          items: [
            { text: '❌ We do not request any scopes that allow posting, editing, uploading, or deleting content.' },
            { text: '❌ We do not access private messages or subscriber data.' },
          ],
        },
      ],
    },
    {
      id: 2,
      icon: Shield,
      title: 'How We Use Your Data',
      content: [
        {
          items: [
            { text: '✅ Verify quest completion and award ZAP/XP rewards' },
            { text: '✅ Manage user progress and unlock new features' },
            { text: '✅ Support account operations (e.g., password resets)' },
            { text: '❌ We do not use your data for marketing, advertising, profiling, or resale to third parties.' },
          ],
        },
      ],
    },
    {
      id: 3,
      icon: Database,
      title: 'Data Storage, Retention & Deletion',
      content: [
        {
          items: [
            { label: 'Storage:', text: 'Data is securely stored in Google Firebase Firestore, encrypted both at rest and in transit.' },
            { label: 'Retention:', text: 'Data is retained only as long as necessary. Accounts inactive for 12 months are automatically deleted.' },
            { label: 'Deletion Request:', text: 'You can request deletion at any time by emailing wizuplive@gmail.com — all personal data will be permanently erased within 7 business days.' },
          ],
        },
      ],
    },
    {
      id: 4,
      icon: Lock,
      title: 'Data Security',
      content: [
        {
          items: [
            { text: '🔒 End-to-end encryption enabled at all times' },
            { text: '🛡️ Restricted access through Firebase Security Rules' },
            { text: '🔍 Regular audits and incident response measures' },
          ],
        },
      ],
    },
    {
      id: 5,
      icon: UserCheck,
      title: 'Third-Party Sharing',
      content: [
        {
          items: [
            { text: '✅ We do not sell or share your personal data with advertisers or brokers.' },
            { text: 'Data is shared only with trusted, secure processors, such as:' },
          ],
        },
        {
          heading: 'Trusted Partners',
          items: [
            { text: '• Google Cloud / Firebase (for storage and authentication)' },
            { text: '• Operational partners under NDA (for hosting and monitoring support)' },
          ],
        },
      ],
    },
    {
      id: 6,
      icon: FileText,
      title: 'Your Rights & Controls',
      content: [
        {
          items: [
            { label: 'Revoke Access:', text: 'You can revoke Google permissions anytime via your Google Account Permissions.' },
            { label: 'Delete Data:', text: 'Request deletion via wizuplive@gmail.com.' },
            { label: 'Request Copy:', text: 'You may request a copy of your stored data using the same contact.' },
          ],
        },
      ],
    },
    {
      id: 7,
      icon: Mail,
      title: 'Contact Us',
      content: [
        {
          items: [
            { text: '📧 Email: wizuplive@gmail.com' },
            { text: '🌐 Website: https://wizup.live' },
          ],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Liquid Glass Gradient Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(199, 210, 254, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(221, 214, 254, 0.15) 0%, transparent 50%),
            linear-gradient(135deg, #ffffff 0%, #f9fafb 50%, #f3f4f6 100%)
          `,
        }}
      />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-200/30 to-violet-200/30 blur-3xl"
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
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-violet-200/30 to-purple-200/30 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center justify-center mb-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center shadow-2xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6"
          >
            Transparency & Trust — How WIZUP protects your data
          </motion.p>

          {/* Effective Date */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg border border-white/20 shadow-lg"
          >
            <FileText className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Effective Date: August 12, 2025
            </span>
          </motion.div>
        </div>
      </motion.section>

      {/* Content Sections */}
      <section className="relative pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Glass Card */}
                <div className="relative rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 shadow-xl p-8">
                  {/* Section Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-500 to-violet-400 bg-clip-text text-transparent">
                      {section.id}. {section.title}
                    </h2>
                  </div>

                  {/* Section Content */}
                  <div className="space-y-6">
                    {section.content.map((block, blockIndex) => (
                      <div key={blockIndex} className="space-y-3">
                        {block.heading && (
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {block.heading}
                          </h3>
                        )}
                        <div className="space-y-2">
                          {block.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="text-base leading-relaxed">
                              {item.label ? (
                                <p className="text-gray-700 dark:text-gray-300">
                                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                    {item.label}
                                  </span>{' '}
                                  {item.text}
                                </p>
                              ) : (
                                <p className="text-gray-700 dark:text-gray-300">{item.text}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Glowing Bottom Border */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
                </div>
              </motion.div>
            );
          })}

          {/* Contact Card with Email Link */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-8 text-center"
          >
            <Mail className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Have Questions?</h3>
            <p className="text-white/90 mb-6">
              We're here to help. Reach out anytime for privacy concerns or data requests.
            </p>
            <a
              href="mailto:wizuplive@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-violet-600 font-semibold hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg"
            >
              <Mail className="w-5 h-5" />
              wizuplive@gmail.com
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative border-t border-white/20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {/* Dashboard Button */}
            <Button
              onClick={() => navigate('/discover')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-semibold shadow-lg hover:scale-105 transition-transform"
            >
              <Home className="w-5 h-5" />
              Back to Dashboard
            </Button>
          </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} WIZUP. All rights reserved.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default PrivacyPolicy;
