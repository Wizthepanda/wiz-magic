import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, Users, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Careers = () => {
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
                <Briefcase className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Careers at WIZUP
            </h1>
            <p className="text-2xl text-gray-600 font-light">
              We're assembling the next generation of builders
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            <p className="text-gray-700 leading-relaxed text-lg">
              We're a small, fast-moving team building the creator economy's future. Our mission
              is to empower creators and learners worldwide through innovative technology and
              authentic community experiences.
            </p>

            <p className="text-gray-700 leading-relaxed text-lg">
              We're not hiring just yet — but if you're passionate about community, design, or AI,
              stay tuned for open roles soon.
            </p>

            {/* What We're Looking For */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-200/50"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    What We're Looking For
                  </h2>
                  <p className="text-gray-700 mb-4">
                    When we do open positions, we'll be seeking talented individuals in:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span><strong>Full-Stack Development</strong> - React, TypeScript, Firebase, Node.js</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span><strong>UI/UX Design</strong> - Creating beautiful, intuitive experiences</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span><strong>Community Management</strong> - Building and nurturing our creator community</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span><strong>AI/ML Engineering</strong> - Personalization and recommendation systems</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
                      <span><strong>Content Strategy</strong> - Helping creators succeed on our platform</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Stay Updated */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-8 text-white text-center"
            >
              <div className="inline-block mb-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3">Stay in the Loop</h3>
              <p className="text-purple-100 mb-6">
                🔔 <strong>Releasing soon</strong> — join our Discord to stay updated on career opportunities
                and be the first to know when we start hiring!
              </p>
              <a
                href="https://discord.gg/wizup"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Join Our Discord
                </Button>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Careers;
