import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, UserX, FileText, Globe, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GdprCompliance = () => {
  const principles = [
    {
      icon: Eye,
      title: 'Transparency',
      description: 'We clearly state what data we collect and why.',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: Lock,
      title: 'Control',
      description: 'You can revoke Google permissions anytime.',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: UserX,
      title: 'Right to Deletion',
      description: 'Request full data deletion via wizuplive@gmail.com.',
      gradient: 'from-pink-500 to-red-600'
    },
    {
      icon: FileText,
      title: 'Minimal Data',
      description: 'We collect only what\'s needed to verify watch time and engagement.',
      gradient: 'from-green-500 to-blue-600'
    },
    {
      icon: Shield,
      title: 'Storage',
      description: 'All data is encrypted and stored securely in Firebase.',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      icon: Globe,
      title: 'Full Access',
      description: 'View, export, or delete your data at any time.',
      gradient: 'from-cyan-500 to-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-white">
      {/* Header */}
      <header className="p-8">
        <Link to="/">
          <Button variant="ghost" className="group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-10 border border-purple-200/50"
        >
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center shadow-lg mx-auto">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent">
              GDPR Compliance Statement
            </h1>
            <p className="text-2xl text-gray-600 font-light">
              Your data, your rights
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            <p className="text-gray-700 leading-relaxed text-lg">
              WIZUP operates in full compliance with the EU General Data Protection Regulation (GDPR).
              We are committed to protecting your privacy and giving you complete control over your
              personal data.
            </p>

            {/* Key Principles */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Key Principles
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {principles.map((principle, index) => (
                  <motion.div
                    key={principle.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-white rounded-2xl p-6 border border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${principle.gradient} flex items-center justify-center shadow-lg mb-4`}>
                      <principle.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {principle.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {principle.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* What Data We Collect */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200/50"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                What Data We Collect
              </h2>
              <p className="text-gray-700 mb-4">
                We collect only the minimum data necessary to provide our service:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Profile information:</strong> Name, email, and profile picture from your Google account</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Watch activity:</strong> Videos watched, watch time, and engagement metrics (to calculate ZAPs)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Platform interactions:</strong> Community participation, comments, and rewards earned</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Technical data:</strong> Device type, browser, and anonymized performance metrics</span>
                </li>
              </ul>
            </motion.div>

            {/* Your Rights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border-2 border-purple-200"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Your GDPR Rights
              </h2>
              <p className="text-gray-700 mb-6">
                Under GDPR, you have the following rights:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-700 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Right to Access</h3>
                    <p className="text-gray-600 text-sm">Request a copy of all personal data we hold about you.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-700 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Right to Rectification</h3>
                    <p className="text-gray-600 text-sm">Correct any inaccurate or incomplete data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-700 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Right to Erasure</h3>
                    <p className="text-gray-600 text-sm">Request deletion of your personal data (Right to be Forgotten).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-700 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Right to Data Portability</h3>
                    <p className="text-gray-600 text-sm">Receive your data in a machine-readable format to transfer to another service.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-700 font-bold text-sm">5</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Right to Restrict Processing</h3>
                    <p className="text-gray-600 text-sm">Limit how we process your personal data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-700 font-bold text-sm">6</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Right to Object</h3>
                    <p className="text-gray-600 text-sm">Object to certain types of data processing.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Alpha Stage Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200/50"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                🌍 Alpha Stage Commitment
              </h2>
              <p className="text-gray-700">
                As of our Alpha stage, all users retain <strong>full access</strong> to view, export,
                or delete their data at any time. We are building WIZUP with privacy and transparency
                at its core from day one.
              </p>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white text-center"
            >
              <div className="inline-block mb-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">Exercise Your Rights</h3>
              <p className="text-purple-100 mb-6">
                To exercise any of your GDPR rights or if you have questions about how we process
                your data, please contact us:
              </p>
              <a href="mailto:wizuplive@gmail.com">
                <Button
                  size="lg"
                  className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  wizuplive@gmail.com
                </Button>
              </a>
            </motion.div>

            {/* Last Updated */}
            <div className="text-center pt-8 border-t border-purple-200">
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default GdprCompliance;
