import { motion } from 'framer-motion';
import { Star, Handshake, Globe, Calendar, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/wiz/Footer';
import { Link } from 'react-router-dom';

const Partners = () => {
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
                <Handshake className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Partner with WIZUP
            </h1>
            <p className="text-2xl text-gray-700 font-light">
              Let's build the future of creator-led learning together.
            </p>
          </div>

          {/* Main Card */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl mb-16 border-2 border-purple-100">
            <CardContent className="p-10">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  We're open to <strong>strategic collaborations</strong>, educational alliances, and media partnerships that expand the reach of creators globally.
                </p>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Whether you're an educational institution, content platform, or creator network, we believe in building meaningful partnerships that benefit our shared communities.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Partnership Types */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <PartnerCard
              icon={<Globe className="w-8 h-8 text-white" />}
              title="Educational Partners"
              description="Integrate learning content and expand reach to new audiences."
              gradient="from-blue-500 to-blue-700"
            />
            <PartnerCard
              icon={<Star className="w-8 h-8 text-white" />}
              title="Content Platforms"
              description="Collaborate on creator tools and distribution strategies."
              gradient="from-purple-500 to-purple-700"
            />
            <PartnerCard
              icon={<Sparkles className="w-8 h-8 text-white" />}
              title="Creator Networks"
              description="Build bridges between communities and unlock new opportunities."
              gradient="from-pink-500 to-pink-700"
            />
          </div>

          {/* Coming Soon Section */}
          <Card className="bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-10 text-center relative">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
              </div>

              <div className="relative z-10">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
                <p className="text-lg mb-6 text-white/90 max-w-2xl mx-auto">
                  Official partner applications open after Beta launch. In the meantime, reach out to discuss potential collaborations.
                </p>
                <a
                  href="mailto:wizuplive@gmail.com"
                  className="inline-block px-8 py-3 bg-white text-purple-700 font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Get in Touch
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

const PartnerCard = ({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) => {
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

export default Partners;
