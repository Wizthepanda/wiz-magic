/**
 * Anti-Cheat Video Player
 * Integrates WatchSession with ReactPlayer for fraud prevention
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactPlayer from 'react-player/youtube';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { WatchSession } from '@/lib/watch-session';
import { Shield, Eye, AlertTriangle, CheckCircle } from 'lucide-react';

interface AntiCheatVideoPlayerProps {
  url: string;
  videoId: string;
  videoDuration?: number;
  onXpEarned?: (xp: number, validatedSeconds: number) => void;
  onProgress?: (progress: number) => void;
  className?: string;
  showSecurityIndicator?: boolean;
}

export const AntiCheatVideoPlayer: React.FC<AntiCheatVideoPlayerProps> = ({
  url,
  videoId,
  videoDuration = 0,
  onXpEarned,
  onProgress,
  className = "w-full h-full",
  showSecurityIndicator = true
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const watchSessionRef = useRef<WatchSession | null>(null);
  const { user } = useAuth();
  const { addXp } = useXp();
  
  // State
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStats, setSessionStats] = useState<any>(null);
  const [securityStatus, setSecurityStatus] = useState<'secure' | 'monitoring' | 'warning' | 'blocked'>('secure');
  const [lastSeekFrom, setLastSeekFrom] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);
  const [actualDuration, setActualDuration] = useState(videoDuration);

  // Initialize watch session
  const initializeSession = useCallback(async () => {
    if (!user || !playerRef.current || !videoId) return;
    
    const duration = actualDuration || playerRef.current.getDuration() || 0;
    if (duration === 0) return;
    
    console.log('🔒 Initializing anti-cheat watch session');
    
    const session = new WatchSession({
      videoId,
      videoDuration: duration,
      userId: user.uid,
      heartbeatInterval: 10000,
      eventBatchInterval: 30000
    });
    
    const success = await session.start(playerRef.current);
    if (success) {
      watchSessionRef.current = session;
      setSessionActive(true);
      setSecurityStatus('monitoring');
      console.log('✅ Anti-cheat session started');
    } else {
      console.error('❌ Failed to start anti-cheat session');
      setSecurityStatus('warning');
    }
  }, [user?.uid, videoId, actualDuration]);

  // Cleanup session
  const cleanupSession = useCallback(async () => {
    if (watchSessionRef.current) {
      console.log('🔒 Closing anti-cheat session');
      const result = await watchSessionRef.current.close();
      
      if (result && result.xpAwarded > 0) {
        // Update XP context
        addXp(result.xpAwarded);
        onXpEarned?.(result.xpAwarded, result.validatedSeconds);
        
        console.log(`🎯 Anti-cheat XP awarded: ${result.xpAwarded} (${result.validatedSeconds}s validated)`);
      }
      
      // Update security status based on fraud score
      if (result?.fraudScore >= 12) {
        setSecurityStatus('blocked');
      } else if (result?.fraudScore >= 5) {
        setSecurityStatus('warning');
      } else {
        setSecurityStatus('secure');
      }
      
      watchSessionRef.current = null;
      setSessionActive(false);
    }
  }, [addXp, onXpEarned]);

  // Player event handlers with anti-cheat integration
  const handleReady = useCallback(() => {
    setIsReady(true);
    const duration = playerRef.current?.getDuration() || 0;
    if (duration > 0) {
      setActualDuration(duration);
    }
  }, []);

  const handlePlay = useCallback(() => {
    if (!sessionActive && isReady) {
      initializeSession();
    }
    
    if (watchSessionRef.current) {
      watchSessionRef.current.onPlay();
    }
  }, [sessionActive, isReady, initializeSession]);

  const handlePause = useCallback(() => {
    if (watchSessionRef.current) {
      watchSessionRef.current.onPause();
    }
  }, []);

  const handleProgress = useCallback(({ playedSeconds, played }: { playedSeconds: number; played: number }) => {
    if (watchSessionRef.current) {
      watchSessionRef.current.onTimeUpdate();
    }
    
    onProgress?.(played * 100);
  }, [onProgress]);

  const handleSeekChange = useCallback((seconds: number) => {
    if (watchSessionRef.current && lastSeekFrom !== undefined) {
      watchSessionRef.current.onSeek(lastSeekFrom, seconds);
    }
    setLastSeekFrom(seconds);
  }, [lastSeekFrom]);

  const handleEnded = useCallback(() => {
    if (watchSessionRef.current) {
      watchSessionRef.current.onEnded();
    }
    
    // Session will auto-close, cleanup handled in useEffect
    setTimeout(cleanupSession, 1000);
  }, [cleanupSession]);

  const handleError = useCallback((error: any) => {
    console.error('🚨 Video Player Error:', error);
    setSecurityStatus('warning');
    cleanupSession();
  }, [cleanupSession]);

  // Update session stats periodically
  useEffect(() => {
    if (!sessionActive || !watchSessionRef.current) return;
    
    const interval = setInterval(() => {
      if (watchSessionRef.current) {
        const stats = watchSessionRef.current.getStats();
        setSessionStats(stats);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [sessionActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSession();
    };
  }, [cleanupSession]);

  // Security indicator component
  const SecurityIndicator = () => {
    if (!showSecurityIndicator) return null;
    
    const getIndicatorConfig = () => {
      switch (securityStatus) {
        case 'secure':
          return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/20', text: 'Secure' };
        case 'monitoring':
          return { icon: Eye, color: 'text-blue-400', bg: 'bg-blue-900/20', text: 'Monitoring' };
        case 'warning':
          return { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/20', text: 'Warning' };
        case 'blocked':
          return { icon: Shield, color: 'text-red-400', bg: 'bg-red-900/20', text: 'Blocked' };
        default:
          return { icon: Shield, color: 'text-gray-400', bg: 'bg-gray-900/20', text: 'Unknown' };
      }
    };
    
    const { icon: Icon, color, bg, text } = getIndicatorConfig();
    
    return (
      <motion.div
        className={`absolute top-4 right-4 flex items-center space-x-2 px-3 py-1.5 rounded-full ${bg} backdrop-blur-sm border border-white/10 z-20`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`text-xs font-medium ${color}`}>{text}</span>
        {sessionActive && sessionStats && (
          <div className="text-xs text-gray-400 ml-2">
            {Math.floor(sessionStats.duration / 1000)}s
          </div>
        )}
      </motion.div>
    );
  };

  // Fraud warning overlay
  const FraudWarning = () => {
    if (securityStatus !== 'warning' && securityStatus !== 'blocked') return null;
    
    return (
      <AnimatePresence>
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-30"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gradient-to-br from-red-900/90 to-orange-900/90 rounded-lg p-6 border border-red-500/30 max-w-md mx-4"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-bold text-white">
                {securityStatus === 'blocked' ? 'XP Blocked' : 'Unusual Activity Detected'}
              </h3>
            </div>
            
            <p className="text-gray-300 mb-4">
              {securityStatus === 'blocked' 
                ? 'Your session has been flagged for suspicious behavior. No XP will be awarded.'
                : 'We\'ve detected unusual playback behavior. XP earning may be reduced.'}
            </p>
            
            <div className="text-sm text-gray-400">
              <p>• Avoid skipping large portions of the video</p>
              <p>• Keep the video tab active and visible</p>
              <p>• Watch at normal playback speed</p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <ReactPlayer
        ref={playerRef}
        url={url}
        controls={true}
        width="100%"
        height="100%"
        onReady={handleReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onProgress={handleProgress}
        onSeek={handleSeekChange}
        onEnded={handleEnded}
        onError={handleError}
        config={{
          youtube: {
            playerVars: {
              origin: window.location.origin,
              modestbranding: 1,
              rel: 0,
              autoplay: 0,
              controls: 1,
              disablekb: 0,
              fs: 1,
              playsinline: 1
            }
          }
        }}
      />
      
      <SecurityIndicator />
      <FraudWarning />
      
      {/* Debug panel (development only) */}
      {import.meta.env.DEV && sessionStats && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-xs p-3 rounded max-w-xs">
          <div className="font-bold mb-1">Anti-Cheat Debug</div>
          <div>Session: {sessionStats.sessionId.slice(-8)}</div>
          <div>Duration: {Math.floor(sessionStats.duration / 1000)}s</div>
          <div>Events: {sessionStats.eventCount}</div>
          <div>Seeks: {sessionStats.seekCount}</div>
          <div>Hidden: {Math.floor(sessionStats.hiddenTime / 1000)}s</div>
          <div>Status: {securityStatus}</div>
        </div>
      )}
    </div>
  );
};