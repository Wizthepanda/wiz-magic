/**
 * Anti-Cheat System Test Page
 * Demonstrates the anti-cheat video player functionality
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Eye, CheckCircle } from 'lucide-react';
import { AntiCheatVideoPlayer } from '@/components/ui/anti-cheat-video-player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AntiCheatTest() {
  const handleXpEarned = (xp: number, validatedSeconds: number) => {
    console.log(`🎯 Test XP earned: ${xp} for ${validatedSeconds}s of validated watch time`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Anti-Cheat System Test</h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto">
            This page demonstrates the comprehensive anti-cheat system protecting your watch-to-earn platform.
            Try different behaviors to see how the system responds.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Protected Video Player</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video">
                  <AntiCheatVideoPlayer
                    url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    videoId="dQw4w9WgXcQ"
                    videoDuration={212} // 3:32 video duration
                    onXpEarned={handleXpEarned}
                    onProgress={(progress) => console.log(`Progress: ${progress.toFixed(1)}%`)}
                    className="w-full h-full rounded-lg overflow-hidden"
                    showSecurityIndicator={true}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Panel */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Security Features */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Session Token Authentication</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Real-time Event Validation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Behavioral Fraud Scoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Device Fingerprinting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Rate Limiting Protection</span>
                </div>
              </CardContent>
            </Card>

            {/* Detection Signals */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Fraud Detection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Large Forward Seeks</span>
                    <Badge variant="destructive">+3 pts</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">High Playback Speed</span>
                    <Badge variant="destructive">+4 pts</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Background Watching</span>
                    <Badge variant="destructive">+3 pts</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Rapid Sessions</span>
                    <Badge variant="destructive">+5 pts</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">Bot Patterns</span>
                    <Badge variant="destructive">+6 pts</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Instructions */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Test Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-300 text-sm">
                  <strong>Normal Watching:</strong> Play video normally to see green "Secure" status
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Skip Test:</strong> Seek forward multiple times to trigger warnings
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Speed Test:</strong> Change playback rate to see speed detection
                </p>
                <p className="text-gray-300 text-sm">
                  <strong>Background Test:</strong> Switch tabs to test visibility tracking
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Status Bar */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-black/20 border-white/10 inline-block">
            <CardContent className="p-4">
              <p className="text-gray-300 text-sm">
                🔒 <strong>Anti-Cheat System:</strong> Active and monitoring all video interactions
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}