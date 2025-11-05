import { motion } from 'framer-motion';
import { Star, Users, Rocket, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/wiz/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Careers = () => {
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
                <Rocket className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Careers at WIZUP
            </h1>
            <p className="text-2xl text-gray-700 font-light">
              We're assembling the next generation of builders.
            </p>
          </div>

          {/* Main Card */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl mb-12 border-2 border-purple-100">
            <CardContent className="p-10">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  We're a <strong>small, fast-moving team</strong> building the creator economy's future.
                </p>
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  We're not hiring just yet — but if you're passionate about community, design, or AI, stay tuned for open roles soon.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Section */}
          <Card className="bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-10 text-center relative">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
              </div>

              <div className="relative z-10">
                <Sparkles className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">Releasing Soon</h2>
                <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
                  We're building something special. Join our Discord community to be the first to know when we start hiring.
                </p>
                <a
                  href="https://discord.gg/wizup"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="bg-white text-purple-700 font-semibold hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Join Our Discord
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* What We're Looking For */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              What We Value
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: '🎨 Design Excellence', desc: 'Craft beautiful, intuitive experiences' },
                { title: '🚀 Move Fast', desc: 'Ship quickly, iterate constantly' },
                { title: '❤️ User-First', desc: 'Creators and learners come first' },
              ].map((value, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="bg-white/70 backdrop-blur-sm border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 rounded-2xl">
                    <CardContent className="p-6 text-center">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                      <p className="text-gray-600">{value.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Careers;
