import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Crown, Shield, Database, TestTube, CheckCircle, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const AdminTestPanel = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  // Debug logging
  console.log('🔍 AdminTestPanel Debug:', {
    user: user?.email,
    isAdmin: user?.isAdmin,
    permissions: user?.permissions,
    userObject: user
  });

  // Only show if user is admin
  if (!user?.isAdmin) {
    // Show a temporary debug panel for troubleshooting
    if (user?.email === 'wizsparkles@gmail.com') {
      return (
        <div className="fixed bottom-4 right-4 bg-red-900/90 backdrop-blur-lg rounded-2xl p-4 border border-red-400/30 shadow-2xl z-50 max-w-sm text-white text-sm">
          <h3 className="font-bold mb-2">🚨 Debug Info</h3>
          <p>Email: {user?.email}</p>
          <p>isAdmin: {user?.isAdmin ? 'true' : 'false'}</p>
          <p>This panel should help debug the admin detection issue.</p>
        </div>
      );
    }
    return null;
  }

  return (
    <motion.div
      className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-lg rounded-2xl border border-purple-400/30 shadow-2xl z-50 cursor-pointer"
      style={{ maxWidth: isExpanded ? '400px' : '320px' }}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5 }}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-bold text-white">Admin Test Panel</h3>
          <Shield className="w-4 h-4 text-green-400" />
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.div>
      </div>

      {/* Expandable Content */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : '0' }}
        style={{ overflow: 'hidden' }}
        transition={{ duration: 0.3 }}
      >
        <div className="px-4 pb-4 space-y-3 text-sm">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">Test User:</span>
            <span className="text-white font-medium truncate">{user.email}</span>
          </div>

          <div className="flex items-center space-x-2">
            <TestTube className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">Status:</span>
            <span className="text-green-400 font-medium">OAuth Verified</span>
          </div>

          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">Test Data:</span>
            <span className="text-purple-400 font-medium">Active</span>
          </div>

          {/* Test Data Preview */}
          {user.testUserData && (
            <motion.div
              className="mt-4 p-3 bg-black/30 rounded-lg border border-purple-400/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-sm font-semibold text-purple-300 mb-2">Demo Stats:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Level:</span>
                  <span className="text-white ml-1">{user.testUserData.level}</span>
                </div>
                <div>
                  <span className="text-gray-400">XP:</span>
                  <span className="text-white ml-1">{user.testUserData.xp.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Videos:</span>
                  <span className="text-white ml-1">{user.testUserData.videosWatched}</span>
                </div>
                <div>
                  <span className="text-gray-400">Streak:</span>
                  <span className="text-white ml-1">{user.testUserData.stats.dailyStreak}d</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Admin Dashboard Button */}
          <motion.button
            className="w-full mt-4 p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-white font-medium text-sm transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              window.open('https://console.firebase.google.com/project/wiz-magic-platform/overview', '_blank');
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            🎛️ Open Admin Dashboard
          </motion.button>

          {/* Features Available */}
          <div className="mt-4 space-y-1">
            <div className="text-xs text-gray-400">Available Features:</div>
            {[
              'Full Platform Access',
              'Firebase Console',
              'User Management',
              'Analytics View',
              'Content Moderation'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-purple-400/20 text-xs text-gray-400 text-center">
            Google OAuth Verification Ready
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};