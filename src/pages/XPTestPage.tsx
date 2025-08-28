import React from 'react';
import { XPTestPanel } from '@/components/wiz/XPTestPanel';
import { WizProfileBar } from '@/components/wiz/WizProfileBar';
import WizXPProgressBar from '@/components/ui/WizXPProgressBar';

export const XPTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation with Profile Bar */}
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-white">
            🎯 WIZ XP System Test
          </div>
          <WizProfileBar />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">XP System Test Environment</h1>
          <p className="text-gray-400">
            Test the WIZ XP progression system with real-time updates to your profile
          </p>
        </div>

        {/* Progress Bar Demo */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Real-time Progress Bar</h2>
          <WizXPProgressBar />
          <p className="text-sm text-gray-400 mt-4">
            This progress bar updates automatically as you earn XP using the buttons below.
          </p>
        </div>

        {/* XP Test Panel */}
        <XPTestPanel />

        {/* Instructions */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">How to Test</h2>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start space-x-3">
              <span className="text-blue-400 font-bold">1.</span>
              <div>
                <strong>Watch Time XP:</strong> Click "Watch 60s" to simulate 60 seconds of video watch time.
                This awards +6 XP (1 XP per 10 seconds). Limited by daily cap of 360 XP.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-400 font-bold">2.</span>
              <div>
                <strong>Video Completion:</strong> Click "Complete Video" to simulate completing a 100-second video.
                This awards +11 XP (10 XP for watch time + 10% completion bonus).
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-purple-400 font-bold">3.</span>
              <div>
                <strong>Share XP:</strong> Click "Share Video" to simulate sharing a video.
                This awards +20 XP with no daily limit.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-yellow-400 font-bold">4.</span>
              <div>
                <strong>Referral XP:</strong> Click "Referral Signup" to simulate a successful referral.
                This awards +50 XP with no daily limit.
              </div>
            </div>
          </div>
        </div>

        {/* Level Thresholds */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Level Thresholds</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { level: 1, xp: 100 },
              { level: 2, xp: 300 },
              { level: 3, xp: 800 },
              { level: 4, xp: 1600 },
              { level: 5, xp: 3000 },
              { level: 6, xp: 6000 },
              { level: 7, xp: 12000 },
              { level: 8, xp: 24000 },
              { level: 9, xp: 50000 },
              { level: 10, xp: 100000 },
            ].map(({ level, xp }) => (
              <div key={level} className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">Lv {level}</div>
                <div className="text-sm text-gray-400">{xp.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
              <div className="text-green-400 font-semibold">✅ Firestore Rules</div>
              <div className="text-sm text-green-300">Fixed permissions for XP updates</div>
            </div>
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
              <div className="text-green-400 font-semibold">✅ Real-time Sync</div>
              <div className="text-sm text-green-300">Progress bars update instantly</div>
            </div>
            <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
              <div className="text-green-400 font-semibold">✅ Daily Caps</div>
              <div className="text-sm text-green-300">360 XP daily limit enforced</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};