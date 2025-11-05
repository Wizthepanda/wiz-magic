import { motion } from 'framer-motion';
import { Star, Cookie, Shield, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/wiz/Footer';
import { Link } from 'react-router-dom';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-lavender-50 to-white">
      {/* Header */}
      <header className="relative z-10 p-8 border-b border-purple-100 bg-white/50 backdrop-blur-sm">
        <Link to="/" className="flex items-center space-x-4 w-fit">
          <motion.div
            className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, rotate: 10 }}
            transition={{ duration: 0.3 }}
          >
            <Star className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent tracking-wide">
            WIZUP
          </h1>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-block mb-8"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center shadow-xl">
                <Cookie className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Cookie Policy
            </h1>
            <p className="text-2xl text-gray-700 font-light">
              How WIZUP uses cookies and similar technologies.
            </p>
          </div>

          {/* Main Content Card */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl mb-12 border-2 border-purple-100">
            <CardContent className="p-10">
              <div className="prose prose-lg max-w-none space-y-6">
                <p className="text-gray-700 leading-relaxed text-lg">
                  WIZUP uses <strong>minimal cookies</strong> to enhance functionality and security. We do <strong className="text-purple-700">not</strong> use tracking or advertising cookies.
                </p>

                <div className="my-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-purple-600" />
                    What Cookies We Use
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Cookies are limited to:
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Authentication sessions</strong> — Secure Google Authentication to keep you logged in</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Firestore caching</strong> — Improve app performance and reduce load times</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700"><strong>Analytics (Firebase Performance)</strong> — Monitor app stability and user experience</span>
                    </li>
                  </ul>
                </div>

                <div className="my-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Control</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Users can <strong>clear cookies</strong> or <strong>revoke permissions</strong> anytime through their browser settings. We comply with major browser privacy frameworks including Safari's Intelligent Tracking Prevention and Chrome's Privacy Sandbox.
                  </p>
                </div>

                <div className="my-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">No Tracking</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We <strong>do not sell</strong> your data. We <strong>do not track</strong> you across other websites. We <strong>do not use</strong> third-party advertising cookies.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy First Banner */}
          <Card className="bg-gradient-to-r from-green-500 to-green-700 text-white shadow-xl rounded-3xl">
            <CardContent className="p-8 text-center">
              <Shield className="w-10 h-10 mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-2">Privacy-First Approach</h3>
              <p className="text-white/90 text-lg">
                Your trust matters. We're committed to transparent, minimal data collection.
              </p>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicy;
