import { motion } from 'framer-motion';
import { Star, Rocket, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/wiz/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Help = () => {
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
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
            className="inline-block mb-8"
          >
            <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-r from-purple-500 to-purple-700 flex items-center justify-center shadow-2xl">
              <Rocket className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          {/* Coming Soon Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
              Coming Soon
            </span>
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Help Center
          </h1>

          {/* Description Card */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl mb-12 border-2 border-purple-100 max-w-3xl mx-auto">
            <CardContent className="p-10">
              <p className="text-xl text-gray-700 leading-relaxed mb-6">
                We're building something exciting — the <strong className="text-purple-700">WIZUP Help Center</strong> is coming soon!
              </p>
              <p className="text-gray-600 leading-relaxed">
                In the meantime, if you have any questions or need assistance, feel free to reach out to our support team directly.
              </p>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
            <Link to="/about">
              <motion.div whileHover={{ y: -4, scale: 1.02 }}>
                <Card className="bg-white/70 backdrop-blur-sm border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 rounded-2xl">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Learn About Us</h3>
                    <p className="text-sm text-gray-600">Discover WIZUP's mission and vision</p>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            <a href="https://discord.gg/wizup" target="_blank" rel="noopener noreferrer">
              <motion.div whileHover={{ y: -4, scale: 1.02 }}>
                <Card className="bg-white/70 backdrop-blur-sm border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 rounded-2xl">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Join Our Discord</h3>
                    <p className="text-sm text-gray-600">Connect with our community</p>
                  </CardContent>
                </Card>
              </motion.div>
            </a>
          </div>

          {/* Contact Section */}
          <Card className="bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-xl rounded-3xl max-w-2xl mx-auto overflow-hidden">
            <CardContent className="p-10 relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              </div>

              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-4">Need Help Now?</h2>
                <p className="text-white/90 mb-6">
                  Our support team is here to assist you. Send us an email and we'll get back to you as soon as possible.
                </p>
                <a href="mailto:wizuplive@gmail.com">
                  <Button
                    size="lg"
                    className="bg-white text-purple-700 font-semibold hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Contact Support
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;
