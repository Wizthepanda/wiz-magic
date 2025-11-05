import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, Shield, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CookiePolicy = () => {
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
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg mx-auto">
                <Cookie className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Cookie Policy
            </h1>
            <p className="text-2xl text-gray-600 font-light">
              How WIZUP uses cookies and similar technologies
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            <p className="text-gray-700 leading-relaxed text-lg">
              WIZUP uses minimal cookies to enhance functionality and security. We believe in
              transparency and user control, which is why we've designed our platform to use
              only essential cookies necessary for the service to function properly.
            </p>

            {/* What We Don't Do */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200/50"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Privacy First Approach
                  </h2>
                  <p className="text-gray-700 mb-3 font-semibold">
                    We do <strong className="text-red-600">NOT</strong> use:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 text-xl">✗</span>
                      <span>Tracking cookies</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 text-xl">✗</span>
                      <span>Advertising cookies</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 text-xl">✗</span>
                      <span>Third-party marketing cookies</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-3 text-xl">✗</span>
                      <span>Cross-site tracking mechanisms</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* What We Use */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border-2 border-purple-200"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Cookies We Use
              </h2>
              <p className="text-gray-700 mb-6">
                Cookies are limited to essential functions only:
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Authentication Sessions</h3>
                    <p className="text-gray-600 text-sm">
                      Google Auth session cookies to keep you securely logged in and verify your identity.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Firestore Caching</h3>
                    <p className="text-gray-600 text-sm">
                      Local storage for caching your data to improve performance and reduce server requests.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Check className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">Analytics (Firebase Performance)</h3>
                    <p className="text-gray-600 text-sm">
                      Anonymous performance monitoring to ensure the platform runs smoothly and identify technical issues.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Your Control */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200/50"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Your Control
              </h2>
              <p className="text-gray-700 mb-4">
                You have full control over your data and cookies:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Clear cookies or revoke permissions anytime through your browser settings</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Revoke Google authentication permissions through your Google account settings</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Request complete data deletion by contacting us at wizuplive@gmail.com</span>
                </li>
              </ul>
            </motion.div>

            {/* Browser Compliance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Browser Privacy Frameworks
              </h2>
              <p className="text-gray-700">
                We comply with major browser privacy frameworks including:
              </p>
              <ul className="space-y-2 text-gray-700 mt-4">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  Safari Intelligent Tracking Prevention (ITP)
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  Firefox Enhanced Tracking Protection (ETP)
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  Chrome SameSite cookie policies
                </li>
              </ul>
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

export default CookiePolicy;
