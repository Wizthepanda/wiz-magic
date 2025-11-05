import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, Rocket, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Help = () => {
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
                <HelpCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Help Center
            </h1>
            <p className="text-2xl text-gray-600 font-light">
              Coming Soon
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="py-12"
            >
              <div className="inline-block mb-8">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-2xl mx-auto">
                  <Rocket className="w-16 h-16 text-white" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                We're Building Something Exciting!
              </h2>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                The WIZUP Help Center is coming soon with comprehensive guides, FAQs, video tutorials,
                and troubleshooting resources to help you get the most out of the platform.
              </p>
            </motion.div>

            {/* Temporary Help Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200/50 text-left"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Need Help Now?
              </h3>
              <p className="text-gray-700 mb-6 text-center">
                While we're building our comprehensive Help Center, you can reach us through:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <motion.a
                  href="mailto:wizuplive@gmail.com"
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="block"
                >
                  <div className="bg-white rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all shadow-lg hover:shadow-xl">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-4">
                      <HelpCircle className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">Email Support</h4>
                    <p className="text-sm text-gray-600">
                      wizuplive@gmail.com
                    </p>
                  </div>
                </motion.a>

                <motion.a
                  href="https://discord.gg/wizup"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="block"
                >
                  <div className="bg-white rounded-xl p-6 border-2 border-purple-200 hover:border-purple-400 transition-all shadow-lg hover:shadow-xl">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center mb-4">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">Join Discord</h4>
                    <p className="text-sm text-gray-600">
                      Get help from our community
                    </p>
                  </div>
                </motion.a>
              </div>
            </motion.div>

            {/* Coming Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border-2 border-purple-200 text-left"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                What's Coming to the Help Center
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Getting Started guides for new users</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Video tutorials on earning ZAPs and leveling up</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Creator guides for uploading and managing content</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Community guidelines and best practices</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>Troubleshooting common issues</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span>FAQ section with answers to popular questions</span>
                </li>
              </ul>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="pt-8"
            >
              <Link to="/">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Return to Homepage
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Help;
