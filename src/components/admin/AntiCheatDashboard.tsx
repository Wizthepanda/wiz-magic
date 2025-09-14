/**
 * Anti-Cheat Admin Dashboard
 * Monitor and review flagged sessions
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Shield, AlertTriangle, Eye, CheckCircle, Flag, User, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WatchSession {
  sessionId: string;
  userId: string;
  videoId: string;
  videoDuration: number;
  startTimestamp: number;
  endTimestamp?: number;
  fraudScore: number;
  validatedSeconds: number;
  xpAwarded: number;
  status: 'active' | 'completed' | 'flagged' | 'invalid';
  events: any[];
  deviceFingerprint?: any;
}

interface DashboardStats {
  totalSessions: number;
  flaggedSessions: number;
  blockedSessions: number;
  averageFraudScore: number;
  totalXPAwarded: number;
  totalXPBlocked: number;
}

export function AntiCheatDashboard() {
  const [sessions, setSessions] = useState<WatchSession[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    flaggedSessions: 0,
    blockedSessions: 0,
    averageFraudScore: 0,
    totalXPAwarded: 0,
    totalXPBlocked: 0
  });
  const [selectedSession, setSelectedSession] = useState<WatchSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'blocked' | 'active'>('all');

  // Load sessions and stats
  useEffect(() => {
    console.log('📊 Loading anti-cheat dashboard data');
    
    // Query for recent sessions
    let sessionsQuery = query(
      collection(db, 'watchSessions'),
      orderBy('startTimestamp', 'desc'),
      limit(100)
    );
    
    // Apply filter
    if (filter !== 'all') {
      sessionsQuery = query(
        collection(db, 'watchSessions'),
        where('status', '==', filter),
        orderBy('startTimestamp', 'desc'),
        limit(100)
      );
    }
    
    const unsubscribe = onSnapshot(sessionsQuery, (snapshot) => {
      const sessionsData: WatchSession[] = [];
      let totalXPAwarded = 0;
      let totalXPBlocked = 0;
      let totalFraudScore = 0;
      let flaggedCount = 0;
      let blockedCount = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data() as WatchSession;
        sessionsData.push(data);
        
        // Calculate stats
        totalXPAwarded += data.xpAwarded || 0;
        totalFraudScore += data.fraudScore || 0;
        
        if (data.status === 'flagged') {
          flaggedCount++;
          totalXPBlocked += (data.fraudScore >= 12 ? 10 : 0); // Estimated blocked XP
        }
        
        if (data.status === 'invalid' || data.fraudScore >= 12) {
          blockedCount++;
        }
      });
      
      setSessions(sessionsData);
      setStats({
        totalSessions: sessionsData.length,
        flaggedSessions: flaggedCount,
        blockedSessions: blockedCount,
        averageFraudScore: sessionsData.length > 0 ? totalFraudScore / sessionsData.length : 0,
        totalXPAwarded,
        totalXPBlocked
      });
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [filter]);

  // Manual review actions
  const handleApproveSession = async (sessionId: string) => {
    try {
      await updateDoc(doc(db, 'watchSessions', sessionId), {
        status: 'completed',
        manualReview: {
          action: 'approved',
          timestamp: Date.now(),
          reason: 'Manual review - legitimate session'
        }
      });
      console.log('✅ Session approved:', sessionId);
    } catch (error) {
      console.error('Error approving session:', error);
    }
  };

  const handleBlockSession = async (sessionId: string) => {
    try {
      await updateDoc(doc(db, 'watchSessions', sessionId), {
        status: 'invalid',
        xpAwarded: 0,
        manualReview: {
          action: 'blocked',
          timestamp: Date.now(),
          reason: 'Manual review - fraudulent behavior confirmed'
        }
      });
      console.log('🚫 Session blocked:', sessionId);
    } catch (error) {
      console.error('Error blocking session:', error);
    }
  };

  // Get status color and icon
  const getStatusDisplay = (session: WatchSession) => {
    if (session.fraudScore >= 12) {
      return { color: 'bg-red-500', icon: Shield, text: 'Blocked' };
    } else if (session.status === 'flagged' || session.fraudScore >= 5) {
      return { color: 'bg-yellow-500', icon: AlertTriangle, text: 'Flagged' };
    } else if (session.status === 'active') {
      return { color: 'bg-blue-500', icon: Activity, text: 'Active' };
    } else {
      return { color: 'bg-green-500', icon: CheckCircle, text: 'Valid' };
    }
  };

  // Format duration
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading anti-cheat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Anti-Cheat Dashboard</h1>
            <p className="text-gray-600">Monitor and review watch sessions</p>
          </div>
        </div>
        
        {/* Filter */}
        <div className="flex items-center space-x-2">
          {(['all', 'flagged', 'blocked', 'active'] as const).map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterOption)}
              className="capitalize"
            >
              {filterOption}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flag className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.flaggedSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Blocked</p>
                <p className="text-2xl font-bold text-red-600">{stats.blockedSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Avg Fraud Score</p>
              <p className="text-2xl font-bold">{stats.averageFraudScore.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">XP Awarded</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalXPAwarded}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">XP Blocked</p>
              <p className="text-2xl font-bold text-red-600">{stats.totalXPBlocked}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => {
              const statusDisplay = getStatusDisplay(session);
              const duration = session.endTimestamp 
                ? session.endTimestamp - session.startTimestamp 
                : Date.now() - session.startTimestamp;
              
              return (
                <motion.div
                  key={session.sessionId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedSession(session)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center space-x-4">
                    {/* Status indicator */}
                    <div className={`w-3 h-3 rounded-full ${statusDisplay.color}`} />
                    
                    {/* Session info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{session.sessionId.slice(-8)}</span>
                        <Badge variant="outline">{statusDisplay.text}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Video: {session.videoId} • User: {session.userId.slice(-8)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-4 text-sm">
                      <div>
                        <span className="text-gray-600">Fraud Score:</span>
                        <span className={`ml-1 font-bold ${
                          session.fraudScore >= 12 ? 'text-red-600' :
                          session.fraudScore >= 5 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {session.fraudScore}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">XP:</span>
                        <span className="ml-1 font-bold">{session.xpAwarded}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-1">{formatDuration(duration)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Session Details</h2>
              <Button variant="ghost" onClick={() => setSelectedSession(null)}>
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Session Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Session Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Session ID:</strong> {selectedSession.sessionId}</div>
                    <div><strong>User ID:</strong> {selectedSession.userId}</div>
                    <div><strong>Video ID:</strong> {selectedSession.videoId}</div>
                    <div><strong>Duration:</strong> {selectedSession.videoDuration}s</div>
                    <div><strong>Status:</strong> {selectedSession.status}</div>
                    <div><strong>Fraud Score:</strong> {selectedSession.fraudScore}</div>
                    <div><strong>Validated Time:</strong> {selectedSession.validatedSeconds}s</div>
                    <div><strong>XP Awarded:</strong> {selectedSession.xpAwarded}</div>
                  </div>
                </div>
                
                {/* Actions */}
                {selectedSession.status === 'flagged' && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Manual Review Actions</h3>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleApproveSession(selectedSession.sessionId)}
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleBlockSession(selectedSession.sessionId)}
                      >
                        Block
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Events Timeline */}
              <div>
                <h3 className="font-semibold mb-2">Events Timeline ({selectedSession.events.length})</h3>
                <div className="max-h-64 overflow-y-auto space-y-1 text-xs">
                  {selectedSession.events.map((event, index) => (
                    <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="font-mono">{event.type}</span>
                      <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}