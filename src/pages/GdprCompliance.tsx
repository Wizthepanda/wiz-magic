import { motion } from 'framer-motion';
import { Star, Shield, CheckCircle, Lock, Eye, Trash2, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/components/wiz/Footer';
import { Link } from 'react-router-dom';

const GdprCompliance = () => {
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
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center shadow-xl">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              GDPR Compliance Statement
            </h1>
            <p className="text-2xl text-gray-700 font-light">
              Your data, your rights.
            </p>
          </div>

          {/* Introduction Card */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl mb-12 border-2 border-blue-100">
            <CardContent className="p-10">
              <p className="text-gray-700 leading-relaxed text-lg">
                WIZUP operates in compliance with the <strong>EU General Data Protection Regulation (GDPR)</strong>. We respect your privacy and provide full transparency about how we collect, use, and protect your data.
              </p>
            </CardContent>
          </Card>

          {/* Key Principles */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
              Key Principles
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <PrincipleCard
                icon={<Eye className="w-7 h-7 text-white" />}
                title="Transparency"
                description="We clearly state what data we collect and why. No hidden practices."
                gradient="from-purple-500 to-purple-700"
              />
              <PrincipleCard
                icon={<Lock className="w-7 h-7 text-white" />}
                title="Control"
                description="You can revoke Google permissions anytime through your account settings."
                gradient="from-blue-500 to-blue-700"
              />
              <PrincipleCard
                icon={<Trash2 className="w-7 h-7 text-white" />}
                title="Right to Deletion"
                description="Request full data deletion via wizuplive@gmail.com. We'll process it within 30 days."
                gradient="from-red-500 to-red-700"
              />
              <PrincipleCard
                icon={<Download className="w-7 h-7 text-white" />}
                title="Minimal Data"
                description="We collect only what's needed to verify watch time and engagement."
                gradient="from-green-500 to-green-700"
              />
            </div>
          </div>

          {/* Data Storage Section */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl mb-12 border-2 border-purple-100">
            <CardContent className="p-10">
              <div className="prose prose-lg max-w-none space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-purple-600" />
                  Data Storage & Security
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  All data is <strong>encrypted</strong> and stored securely in Firebase (Google Cloud Platform). We use industry-standard security practices including:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">End-to-end encryption for data in transit</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Encrypted storage at rest</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Regular security audits and updates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">Role-based access controls</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights Section */}
          <Card className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl mb-12 border-2 border-purple-100">
            <CardContent className="p-10">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  As of our Alpha stage, all users retain full access to:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>View</strong> all data we have collected about you</li>
                  <li><strong>Export</strong> your data in a machine-readable format</li>
                  <li><strong>Delete</strong> your account and all associated data</li>
                  <li><strong>Rectify</strong> any inaccurate personal information</li>
                  <li><strong>Object</strong> to specific data processing activities</li>
                  <li><strong>Restrict</strong> processing of your personal data</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-10 text-center relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              </div>

              <div className="relative z-10">
                <Shield className="w-12 h-12 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">Exercise Your Rights</h2>
                <p className="text-lg mb-6 text-white/90 max-w-2xl mx-auto">
                  To request data access, export, or deletion, please contact our data protection team.
                </p>
                <a
                  href="mailto:wizuplive@gmail.com?subject=GDPR Data Request"
                  className="inline-block px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  wizuplive@gmail.com
                </a>
                <p className="text-sm text-white/80 mt-4">
                  We will respond to your request within 30 days.
                </p>
              </div>
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

const PrincipleCard = ({ icon, title, description, gradient }: { icon: React.ReactNode; title: string; description: string; gradient: string }) => {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-2 border-transparent hover:border-purple-200 h-full">
        <CardContent className="p-6">
          <div className={`w-14 h-14 mb-4 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg`}>
            {icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GdprCompliance;
