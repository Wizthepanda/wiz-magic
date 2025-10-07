import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Youtube, RefreshCw, Unplug, CheckCircle, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';

interface ManageYouTubeTabProps {
  isConnected?: boolean;
}

export const ManageYouTubeTab: React.FC<ManageYouTubeTabProps> = ({ isConnected = false }) => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  if (isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header Card with Channel Info */}
        <Card className="border-0 bg-gradient-to-br from-red-50 to-pink-50 backdrop-blur-xl shadow-xl overflow-hidden relative">
          {/* Animated background glow */}
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-400 to-pink-400 rounded-full blur-3xl opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <CardContent className="p-8 relative">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center relative"
                >
                  <Youtube className="w-8 h-8 text-white" />
                  {/* Live pulse indicator */}
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-slate-900">Cr8r Channel</h2>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>12.5K subscribers</span>
                    </div>
                    <Badge className="bg-green-500/10 text-green-700 border-green-200">
                      Connected
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm">
                <div className="text-sm text-slate-600 mb-1">Last Synced</div>
                <div className="text-lg font-bold text-slate-900">2 hours ago</div>
              </div>
              <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm">
                <div className="text-sm text-slate-600 mb-1">Videos Tracked</div>
                <div className="text-lg font-bold text-slate-900">24</div>
              </div>
              <div className="p-4 rounded-xl bg-white/60 backdrop-blur-sm">
                <div className="text-sm text-slate-600 mb-1">ZAPs Earned</div>
                <div className="text-lg font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                  +156 ZAPs
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSync}
                disabled={syncing}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>

              <Button
                variant="outline"
                className="border-2 border-red-300 text-red-600 hover:bg-red-50"
              >
                <Unplug className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Tooltip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-blue-50 border border-blue-200"
        >
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Keep your channel synced to earn ZAPs from verified views and engagement.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // Not Connected State
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="min-h-[500px] flex items-center justify-center"
    >
      <div className="text-center max-w-md relative">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: 'radial-gradient(circle, rgba(239, 68, 68, 0.1) 0%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        {/* YouTube Logo with Pulse */}
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center relative"
          animate={{
            boxShadow: [
              '0 0 20px rgba(239, 68, 68, 0.3)',
              '0 0 40px rgba(239, 68, 68, 0.5)',
              '0 0 20px rgba(239, 68, 68, 0.3)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <Youtube className="w-12 h-12 text-white" />
        </motion.div>

        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          Connect your YouTube Channel
        </h2>
        
        <p className="text-slate-600 mb-8">
          Sync your creator data to unlock ZAP rewards and XP tracking. 
          Start earning from every verified view!
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all px-8 py-6 text-lg"
          >
            <Youtube className="w-5 h-5 mr-2" />
            Connect YouTube
          </Button>
        </motion.div>

        <p className="text-xs text-slate-400 mt-6">
          🔒 Secure OAuth 2.0 authentication • We never access private data
        </p>
      </div>
    </motion.div>
  );
};

