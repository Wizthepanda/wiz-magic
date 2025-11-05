import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Handshake, Rocket, Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Partners = () => {
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
                <Handshake className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Partner with WIZUP
            </h1>
            <p className="text-2xl text-gray-600 font-light">
              Let's build the future of creator-led learning together
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            <p className="text-gray-700 leading-relaxed text-lg">
              We're open to strategic collaborations, educational alliances, and media partnerships
              that expand the reach of creators globally. Together, we can empower the next
              generation of learners and content creators.
            </p>

            {/* Partnership Types */}
            <div className="grid md:grid-cols-2 gap-6 my-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg mb-4">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Educational Partnerships
                </h3>
                <p className="text-gray-700 text-sm">
                  Partner with universities, online learning platforms, and educational institutions
                  to provide quality content and reward learners.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center shadow-lg mb-4">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Creator Networks
                </h3>
                <p className="text-gray-700 text-sm">
                  Collaborate with creator networks, talent agencies, and media companies to bring
                  diverse content to our growing community.
                </p>
              </motion.div>
            </div>

            {/* What We Offer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 border-2 border-purple-200"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                What We Offer Partners
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Access to an engaged community</strong> of learners and creators passionate about growth</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Innovative reward mechanisms</strong> that drive real engagement and completion rates</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Co-marketing opportunities</strong> across our platform and social channels</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Analytics and insights</strong> to understand your audience and content performance</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                  <span><strong>Early access</strong> to new features and platform capabilities</span>
                </li>
              </ul>
            </motion.div>

            {/* Coming Soon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white text-center"
            >
              <div className="inline-block mb-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">Partnership Applications</h3>
              <p className="text-purple-100 mb-6">
                📅 <strong>Coming Soon</strong> — Official partner applications will open after Beta launch.
                In the meantime, reach out to discuss early partnership opportunities.
              </p>
              <a href="mailto:wizuplive@gmail.com">
                <Button
                  size="lg"
                  className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Us
                </Button>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Partners;
