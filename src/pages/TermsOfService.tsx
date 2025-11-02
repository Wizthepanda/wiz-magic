import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Shield, Gem, Rocket, Lock, Users, XCircle, Mail, ArrowLeft, Home, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TermsOfService = () => {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 1,
      icon: Users,
      title: 'Use of Service',
      content: [
        {
          items: [
            { text: 'WIZUP is a creator and community engagement platform where users earn XP (ZAPs) for participating in quests, watching educational content, or engaging with creator challenges.' },
          ],
        },
        {
          heading: 'Age Requirements',
          items: [
            { text: '✅ You must be 13 years or older to use WIZUP.' },
            { text: '👨‍👩‍👧 If under 18, you must have parental or guardian consent before creating an account.' },
          ],
        },
      ],
    },
    {
      id: 2,
      icon: Shield,
      title: 'YouTube API Usage',
      content: [
        {
          items: [
            { text: 'By signing in through Google OAuth, you grant WIZUP read-only access to verify your YouTube watch activity for XP and quest progression.' },
            { text: '❌ We do not post, edit, or delete any of your YouTube content.' },
            { text: '✅ We fully comply with the YouTube Terms of Service and Google Privacy Policy.' },
            { text: '🎯 Your YouTube data is used strictly for engagement verification — never for marketing or resale.' },
          ],
        },
      ],
    },
    {
      id: 3,
      icon: Gem,
      title: 'Rewards',
      content: [
        {
          items: [
            { text: '⚡ XP (ZAP Points) are earned based on verified activity and engagement within the platform.' },
            { text: '🎁 XP may unlock in-platform rewards, achievements, or levels, but has no inherent monetary value or external convertibility unless explicitly stated by WIZUP.' },
          ],
        },
      ],
    },
    {
      id: 4,
      icon: Lock,
      title: 'User Conduct',
      content: [
        {
          items: [
            { text: '✅ You agree to use WIZUP responsibly and in good faith.' },
          ],
        },
        {
          heading: 'Prohibited Actions',
          items: [
            { text: '🤖 Using bots or automation to simulate engagement' },
            { text: '⚠️ Attempting to hack, exploit, or bypass reward systems' },
            { text: '🚫 Posting or distributing harmful, offensive, or illegal content' },
            { text: '⚖️ Any violation of these terms may result in account suspension or termination.' },
          ],
        },
      ],
    },
    {
      id: 5,
      icon: XCircle,
      title: 'Account Termination',
      content: [
        {
          items: [
            { text: 'WIZUP reserves the right to suspend or permanently terminate any user account found in violation of:' },
          ],
        },
        {
          heading: 'Violation Reasons',
          items: [
            { text: '📋 These Terms of Service' },
            { text: '🔒 The Privacy Policy' },
            { text: '⚖️ Applicable laws or ethical standards' },
            { text: '⚠️ Termination may result in the loss of accumulated XP or rewards.' },
          ],
        },
      ],
    },
    {
      id: 6,
      icon: Rocket,
      title: 'Disclaimer',
      content: [
        {
          items: [
            { text: 'WIZUP is provided "as is" and "as available" without any warranties of uninterrupted service, accuracy, or guaranteed monetary value of rewards.' },
            { text: '⚠️ We are not responsible for data loss, service interruptions, or third-party outages (e.g., YouTube API downtime).' },
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
              <Scale className="w-8 h-8 text-white" />
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
              Terms of Service
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-6"
          >
            How we operate, reward, and protect creators and users
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
                <div className="relative rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 p-8">
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

          {/* Important Notice Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-8 text-center"
          >
            <Scale className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Agreement to Terms</h3>
            <p className="text-white/90 mb-6">
              By using WIZUP, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/privacy"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-violet-600 font-semibold hover:bg-white/90 transition-all transform hover:scale-105 shadow-lg"
              >
                <Shield className="w-5 h-5" />
                View Privacy Policy
              </a>
              <a
                href="mailto:wizuplive@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold hover:bg-white/30 transition-all transform hover:scale-105 border border-white/20"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </a>
            </div>
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

export default TermsOfService;
