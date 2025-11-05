import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Zap, Rocket, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const About = () => {
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
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              About WIZUP
            </h1>
            <p className="text-2xl text-gray-600 font-light">
              Empowering the next generation of creators
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-gray-700 leading-relaxed text-lg">
              WIZUP is an alpha-stage creator economy platform that rewards users for learning,
              watching, and engaging through XP (ZAPs). Our mission is to bridge education,
              entertainment, and earning through authentic community participation.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              We're building a new wave of digital empowerment — where creators, learners,
              and fans thrive together.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Our Vision</h2>
                <p className="text-gray-700 leading-relaxed">
                  Democratize opportunity through creator-driven learning. We believe everyone should
                  have access to quality educational content while being rewarded for their time and
                  engagement. WIZUP makes learning accessible, engaging, and financially rewarding.
                </p>
              </div>
            </motion.div>

            {/* Model */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-700 flex items-center justify-center shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Our Model</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The WIZUP experience is simple and rewarding:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    <span><strong>Watch</strong> educational and entertaining content from creators</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    <span><strong>Earn ZAPs</strong> (XP points) for your watch time and engagement</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    <span><strong>Level Up</strong> and unlock exclusive rewards and benefits</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                    <span><strong>Unlock Opportunities</strong> for learning, earning, and growing</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Status */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-700 flex items-center justify-center shadow-lg">
                  <Rocket className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Status</h2>
                <div className="mb-4">
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold rounded-full text-sm">
                    🚀 Currently in Alpha
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  We're in the early stages of building something amazing. Expect new features,
                  content drops, and improvements as we grow together with our community. Your
                  feedback helps shape the future of WIZUP!
                </p>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <Mail className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Contact</h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Have questions, feedback, or want to get involved? We'd love to hear from you!
                </p>
                <a
                  href="mailto:wizuplive@gmail.com"
                  className="inline-flex items-center text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  wizuplive@gmail.com
                </a>
              </div>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link to="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Journey
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default About;
