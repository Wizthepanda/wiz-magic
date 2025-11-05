import { motion } from 'framer-motion';
import { Star, Zap, Users, TrendingUp, Sparkles, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/wiz/Footer';
import { Link } from 'react-router-dom';

const About = () => {
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 mb-6"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                Alpha Stage
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              About WIZUP
            </h1>
            <p className="text-2xl text-gray-700 font-light">
              Empowering the next generation of creators.
            </p>
          </div>

          {/* Main Card */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl mb-16 border-2 border-purple-100">
            <CardContent className="p-10">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  WIZUP is an <strong>alpha-stage creator economy platform</strong> that rewards users for learning, watching, and engaging through XP (ZAPs).
                </p>
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  Our mission is to bridge education, entertainment, and earning through authentic community participation. We're building a new wave of digital empowerment — where creators, learners, and fans thrive together.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feature Sections */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <FeatureCard
              icon={<Heart className="w-8 h-8 text-white" />}
              title="Our Vision"
              description="Democratize opportunity through creator-driven learning and authentic engagement."
              gradient="from-pink-500 to-pink-700"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-white" />}
              title="Our Model"
              description="Watch → Earn ZAPs → Level Up → Unlock Opportunities"
              gradient="from-purple-500 to-purple-700"
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-white" />}
              title="Status"
              description="🚀 Currently in Alpha — expect new drops and features soon."
              gradient="from-blue-500 to-blue-700"
            />
          </div>

          {/* Contact Section */}
          <Card className="bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-xl rounded-3xl">
            <CardContent className="p-10 text-center">
              <Users className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-lg mb-6 text-white/90">
                Have questions or want to learn more? We'd love to hear from you.
              </p>
              <a
                href="mailto:wizuplive@gmail.com"
                className="inline-block px-8 py-3 bg-white text-purple-700 font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                wizuplive@gmail.com
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-2 border-transparent hover:border-purple-200 h-full">
        <CardContent className="p-8 text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default About;
