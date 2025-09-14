import { useState, useEffect } from 'react';
import { Play, Eye, Heart, Share2, CheckCircle, Zap, ChevronLeft, ChevronRight, Crown, Medal, Trophy, Star, Users, Award, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';
import { WizVideoPlayer } from './wiz-video-player';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { WizShorts } from './WizShorts';
import { ClaimPreviewSection } from './ClaimPreviewSection';
import { WizMobileFilters } from './WizMobileFilters';
import { WizPremiumLeaderboard } from './WizPremiumLeaderboard';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs, getDoc, doc } from 'firebase/firestore';
import { VideoSyncDebug } from '@/lib/video-sync-debug';
import { testPublishVideo } from '@/lib/test-video-sync';
import { VideoCompletionService } from '@/lib/video-completion-service';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'all', label: 'All', color: 'bg-wiz-primary', dotColor: 'bg-blue-400' },
  { id: 'ai', label: 'AI', color: 'bg-wiz-secondary', dotColor: 'bg-red-400' },
  { id: 'tech', label: 'Tech', color: 'bg-wiz-accent', dotColor: 'bg-orange-400' },
  { id: 'music', label: 'Music', color: 'bg-wiz-magic', dotColor: 'bg-pink-400' },
  { id: 'money', label: 'Money', color: 'bg-emerald-500', dotColor: 'bg-green-400' },
  { id: 'health', label: 'Health', color: 'bg-rose-500', dotColor: 'bg-red-400' },
  { id: 'gaming', label: 'Gaming', color: 'bg-purple-500', dotColor: 'bg-purple-400' },
  { id: 'movies', label: 'Movies', color: 'bg-indigo-500', dotColor: 'bg-indigo-400' },
  { id: 'news', label: 'News', color: 'bg-cyan-500', dotColor: 'bg-cyan-400' },
  { id: 'podcast', label: 'Podcast', color: 'bg-teal-500', dotColor: 'bg-teal-400' },
  { id: 'art', label: 'Art', color: 'bg-violet-500', dotColor: 'bg-violet-400' },
  { id: 'fashion', label: 'Fashion', color: 'bg-fuchsia-500', dotColor: 'bg-fuchsia-400' },
  { id: 'relationships', label: 'Relationships', color: 'bg-pink-500', dotColor: 'bg-pink-400' },
  { id: 'lifestyle', label: 'Lifestyle', color: 'bg-amber-500', dotColor: 'bg-amber-400' },
];

// Exactly 8 video panels with category tags
const videos = [
  {
    id: 1,
    title: 'WIZ Magic Demo Video',
    creator: 'WIZ Magic',
    avatar: 'https://ui-avatars.com/api/?name=WIZ+Magic&background=8B5CF6&color=ffffff&size=128',
    thumbnail: '',
    duration: '0:27',
    xpReward: 25,
    category: 'ai',
    categoryLabel: 'AI',
    views: '1K',
    watched: false,
    progress: 0,
    videoId: '2M4asXviuoo',
    isNew: true
  },
  {
    id: 2,
    title: 'Building Wealth Through Tech Investments',
    creator: 'MoneyWizard',
    avatar: 'https://ui-avatars.com/api/?name=MoneyWizard&background=10B981&color=ffffff&size=128',
    thumbnail: '',
    duration: '18:30',
    xpReward: 220,
    category: 'money',
    categoryLabel: 'MONEY',
    views: '78K',
    watched: false,
    progress: 65,
    videoId: 'jNQXAC9IVRw',
    isNew: false
  },
  {
    id: 3,
    title: 'React 19 Features You Need to Know',
    creator: 'CodeMaster',
    avatar: 'https://ui-avatars.com/api/?name=CodeMaster&background=3B82F6&color=ffffff&size=128',
    thumbnail: '',
    duration: '15:20',
    xpReward: 180,
    category: 'tech',
    categoryLabel: 'TECH',
    views: '32K',
    watched: true,
    progress: 100,
    videoId: 'ScMzIvxBSi4',
    isNew: false
  },
  {
    id: 4,
    title: 'Music Production Secrets Revealed',
    creator: 'BeatCreator',
    avatar: 'https://ui-avatars.com/api/?name=BeatCreator&background=EC4899&color=ffffff&size=128',
    thumbnail: '',
    duration: '22:15',
    xpReward: 280,
    category: 'music',
    categoryLabel: 'MUSIC',
    views: '56K',
    watched: false,
    progress: 0,
    videoId: 'ZbZSe6N_BXs',
    isNew: true
  },
  {
    id: 5,
    title: 'Advanced Machine Learning Techniques',
    creator: 'MLExpert',
    avatar: 'https://ui-avatars.com/api/?name=MLExpert&background=8B5CF6&color=ffffff&size=128',
    thumbnail: '',
    duration: '25:40',
    xpReward: 320,
    category: 'ai',
    categoryLabel: 'AI',
    views: '89K',
    watched: false,
    progress: 0,
    videoId: 'dQw4w9WgXcQ',
    isNew: false
  },
  {
    id: 6,
    title: 'Cryptocurrency Trading Strategies',
    creator: 'CryptoKing',
    avatar: 'https://ui-avatars.com/api/?name=CryptoKing&background=F59E0B&color=ffffff&size=128',
    thumbnail: '',
    duration: '19:55',
    xpReward: 240,
    category: 'money',
    categoryLabel: 'MONEY',
    views: '67K',
    watched: false,
    progress: 30,
    videoId: 'jNQXAC9IVRw',
    isNew: false
  },
  {
    id: 7,
    title: 'Fitness Transformation in 30 Days',
    creator: 'HealthGuru',
    avatar: 'https://ui-avatars.com/api/?name=HealthGuru&background=EF4444&color=ffffff&size=128',
    thumbnail: '',
    duration: '16:45',
    xpReward: 200,
    category: 'health',
    categoryLabel: 'HEALTH',
    views: '91K',
    watched: false,
    progress: 0,
    videoId: 'ZbZSe6N_BXs',
    isNew: false
  },
  {
    id: 8,
    title: 'Electronic Music Composition',
    creator: 'SynthMaster',
    avatar: 'https://ui-avatars.com/api/?name=SynthMaster&background=EC4899&color=ffffff&size=128',
    thumbnail: '',
    duration: '24:30',
    xpReward: 260,
    category: 'music',
    categoryLabel: 'MUSIC',
    views: '54K',
    watched: false,
    progress: 0,
    videoId: 'dQw4w9WgXcQ',
    isNew: true
  }
];



// Creators data for WIZ Premiere section
const creators = [
  {
    id: 1,
    name: 'FERA',
    username: '@imagineFERA',
    subscribers: '125K',
    videos: 89,
    totalViews: '2.3M',
    specialty: 'Creative Visionary',
    thumbnail: '/Profile Pics/FERA.jpg',
    avatar: '/Profile Pics/FERA.jpg',
    verified: true,
    rating: 4.9,
    twitterUrl: 'https://x.com/imagineFERA'
  },
  {
    id: 2,
    name: 'Captain HaHaa',
    username: '@CaptainHaHaa',
    subscribers: '89K',
    videos: 156,
    totalViews: '1.8M',
    specialty: 'Gaming & Entertainment',
    thumbnail: '/Profile Pics/Captain Hahaa.jpg',
    avatar: '/Profile Pics/Captain Hahaa.jpg',
    verified: true,
    rating: 4.7,
    twitterUrl: 'https://x.com/CaptainHaHaa'
  },
  {
    id: 3,
    name: 'RoyalKongz',
    username: '@RoyalKongz',
    subscribers: '203K',
    videos: 234,
    totalViews: '4.1M',
    specialty: 'Digital Art & Animation',
    thumbnail: '/Profile Pics/RoyalKongz.jpg',
    avatar: '/Profile Pics/RoyalKongz.jpg',
    verified: true,
    rating: 4.8,
    twitterUrl: 'https://x.com/RoyalKongz'
  },
  {
    id: 4,
    name: 'Alexandria',
    username: '@AleRVG',
    subscribers: '67K',
    videos: 78,
    totalViews: '1.2M',
    specialty: 'Tech & Innovation',
    thumbnail: '/Profile Pics/Ale.jpg',
    avatar: '/Profile Pics/Ale.jpg',
    verified: true,
    rating: 4.6,
    twitterUrl: 'https://x.com/AleRVG'
  },
  {
    id: 5,
    name: 'Bogdan',
    username: '@SMKP_Films',
    subscribers: '145K',
    videos: 198,
    totalViews: '3.2M',
    specialty: 'Film & Photography',
    thumbnail: '/Profile Pics/Bogdan.jpg',
    avatar: '/Profile Pics/Bogdan.jpg',
    verified: true,
    rating: 4.9,
    twitterUrl: 'https://x.com/SMKP_Films'
  },
  {
    id: 6,
    name: 'MadPencil',
    username: '@madpencil_',
    subscribers: '98K',
    videos: 134,
    totalViews: '2.1M',
    specialty: 'Art & Design',
    thumbnail: '/Profile Pics/MadPencil.jpg',
    avatar: '/Profile Pics/MadPencil.jpg',
    verified: true,
    rating: 4.8,
    twitterUrl: 'https://x.com/madpencil_'
  }
];

// Top creators and wizards data
const topCreators = [
  { rank: 1, name: 'AIGuru42', xp: 125000, level: 47, videos: 89, views: '2.3M', specialty: 'AI & ML' },
  { rank: 2, name: 'CodeMaster', xp: 98000, level: 42, videos: 156, views: '1.8M', specialty: 'Development' },
  { rank: 3, name: 'MoneyWizard', xp: 87000, level: 39, videos: 78, views: '1.5M', specialty: 'Finance' },
  { rank: 4, name: 'HealthGuru', xp: 76000, level: 35, videos: 134, views: '1.2M', specialty: 'Health' },
  { rank: 5, name: 'BeatCreator', xp: 65000, level: 32, videos: 92, views: '980K', specialty: 'Music' }
];

const topWizards = [
  { rank: 1, name: 'WizMaster', xp: 45000, level: 28, watchTime: '340h', streak: 89 },
  { rank: 2, name: 'LearningNinja', xp: 38000, level: 25, watchTime: '280h', streak: 67 },
  { rank: 3, name: 'KnowledgeSeeker', xp: 32000, level: 22, watchTime: '245h', streak: 54 },
  { rank: 4, name: 'StudyWiz', xp: 28000, level: 19, watchTime: '210h', streak: 43 },
  { rank: 5, name: 'ContentConsumer', xp: 24000, level: 17, watchTime: '180h', streak: 32 }
];

// Helper functions for category styling
const getCategoryGradient = (category: string) => {
  const gradients = {
    ai: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
    tech: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', 
    music: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    money: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    health: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
  };
  return gradients[category] || gradients.ai;
};

const getCategoryShadow = (category: string) => {
  const shadows = {
    ai: '0 4px 12px rgba(59, 130, 246, 0.3)',
    tech: '0 4px 12px rgba(6, 182, 212, 0.3)',
    music: '0 4px 12px rgba(236, 72, 153, 0.3)', 
    money: '0 4px 12px rgba(245, 158, 11, 0.3)',
    health: '0 4px 12px rgba(16, 185, 129, 0.3)',
  };
  return shadows[category] || shadows.ai;
};

export const WizDiscoverSection = () => {
  const { user } = useAuth();
  const navigate = useSafeNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [leaderboardTab, setLeaderboardTab] = useState('creators');
  const [isPremiereVideoPlaying, setIsPremiereVideoPlaying] = useState(false);
  const [dynamicVideos, setDynamicVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  // Debug function - can be called from browser console
  const debugFirestoreVideos = async () => {
    try {
      console.log('🔍 Manual Firestore Debug Check');
      const videosRef = collection(db, 'videos');
      const snapshot = await getDocs(videosRef);
      console.log('📊 Total documents in videos collection:', snapshot.docs.length);
      snapshot.docs.forEach((doc, index) => {
        console.log(`📺 Video ${index + 1} (${doc.id}):`, doc.data());
      });
      return snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
    } catch (error) {
      console.error('❌ Debug check failed:', error);
      return [];
    }
  };

  // Expose debug functions to window for console access
  useEffect(() => {
    (window as any).debugFirestoreVideos = debugFirestoreVideos;
    (window as any).testPublishVideoForUser = (userId: string) => testPublishVideo(userId);
    (window as any).cleanupDuplicates = async (creatorId: string) => {
      const { CreatorService } = await import('../../lib/creator-service');
      return CreatorService.removeDuplicateVideos(creatorId);
    };
    (window as any).checkVideoSync = (creatorId?: string) => VideoSyncDebug.checkVideoSyncStatus(creatorId);
    (window as any).syncMissingVideos = (creatorId: string) => VideoSyncDebug.syncMissingVideos(creatorId);
    return () => {
      delete (window as any).debugFirestoreVideos;
      delete (window as any).testPublishVideoForUser;
      delete (window as any).cleanupDuplicates;
      delete (window as any).checkVideoSync;
      delete (window as any).syncMissingVideos;
    };
  }, []);

  // Helper function to map category tags to standard categories
  const mapCategoryToStandard = (tags) => {
    if (!tags || tags.length === 0) return { category: 'tech', categoryLabel: 'TECH' };
    const tagStr = tags.join(' ').toLowerCase();
    
    if (tagStr.includes('ai') || tagStr.includes('artificial') || tagStr.includes('machine learning')) {
      return { category: 'ai', categoryLabel: 'AI' };
    }
    if (tagStr.includes('tech') || tagStr.includes('programming') || tagStr.includes('code')) {
      return { category: 'tech', categoryLabel: 'TECH' };
    }
    if (tagStr.includes('music') || tagStr.includes('beat') || tagStr.includes('song')) {
      return { category: 'music', categoryLabel: 'MUSIC' };
    }
    if (tagStr.includes('money') || tagStr.includes('finance') || tagStr.includes('wealth')) {
      return { category: 'money', categoryLabel: 'MONEY' };
    }
    if (tagStr.includes('health') || tagStr.includes('fitness') || tagStr.includes('wellness')) {
      return { category: 'health', categoryLabel: 'HEALTH' };
    }
    if (tagStr.includes('gaming') || tagStr.includes('game') || tagStr.includes('esports')) {
      return { category: 'gaming', categoryLabel: 'GAMING' };
    }
    if (tagStr.includes('movie') || tagStr.includes('film') || tagStr.includes('cinema')) {
      return { category: 'movies', categoryLabel: 'MOVIES' };
    }
    if (tagStr.includes('news') || tagStr.includes('current') || tagStr.includes('politics')) {
      return { category: 'news', categoryLabel: 'NEWS' };
    }
    if (tagStr.includes('podcast') || tagStr.includes('interview') || tagStr.includes('discussion')) {
      return { category: 'podcast', categoryLabel: 'PODCAST' };
    }
    if (tagStr.includes('art') || tagStr.includes('design') || tagStr.includes('creative') || tagStr.includes('painting')) {
      return { category: 'art', categoryLabel: 'ART' };
    }
    if (tagStr.includes('fashion') || tagStr.includes('style') || tagStr.includes('clothing') || tagStr.includes('trends')) {
      return { category: 'fashion', categoryLabel: 'FASHION' };
    }
    if (tagStr.includes('relationship') || tagStr.includes('dating') || tagStr.includes('love') || tagStr.includes('couples')) {
      return { category: 'relationships', categoryLabel: 'RELATIONSHIPS' };
    }
    if (tagStr.includes('lifestyle') || tagStr.includes('living') || tagStr.includes('daily') || tagStr.includes('routine')) {
      return { category: 'lifestyle', categoryLabel: 'LIFESTYLE' };
    }
    if (tagStr.includes('movie') || tagStr.includes('film') || tagStr.includes('cinema') || tagStr.includes('review')) {
      return { category: 'movie', categoryLabel: 'MOVIE' };
    }
    
    return { category: 'tech', categoryLabel: 'TECH' };
  };

  // Helper function to calculate XP reward based on duration
  const calculateXPReward = (duration) => {
    if (!duration) return 10;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 10;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');  
    const seconds = parseInt(match[3] || '0');
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    return Math.max(10, Math.floor(totalSeconds / 10));
  };

  // Helper function to format view count
  const formatViewCount = (views) => {
    const num = parseInt(views);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return views;
  };

  // Helper function to format duration
  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Load videos from Firestore with deduplication
  useEffect(() => {
    const loadVideos = async () => {
      try {
        console.log('🔍 Discover: Loading videos with deduplication...');
        
        // Fetch from both collections
        const [videosSnapshot, creatorVideosSnapshot] = await Promise.all([
          // Fetch from videos collection
          getDocs(query(collection(db, 'videos'), limit(15))).catch(err => {
            console.warn('🔍 Videos collection query failed:', err);
            return { docs: [] };
          }),
          // Fetch from creatorVideos collection
          getDocs(query(collection(db, 'creatorVideos'), orderBy('addedToWiz', 'desc'), limit(15))).catch(err => {
            console.warn('🔍 CreatorVideos collection query failed:', err);
            return { docs: [] };
          })
        ]);

        console.log('🔍 Discover: Fetched videos -', videosSnapshot.docs.length, 'from videos,', creatorVideosSnapshot.docs.length, 'from creatorVideos');
        
        const loadedVideos = [];
        const processedVideoIds = new Map(); // Track processed videos with timestamp for deduplication
        const creatorVideoCount = new Map(); // Track videos per creator
        
        // Get completed videos for the current user
        const completedVideos = user ? await VideoCompletionService.getUserCompletedVideos() : [];
        console.log('📚 User completed videos:', completedVideos);
        
        // Fetch creator profile data for avatar fallbacks
        const creatorProfiles = new Map();
        const uniqueCreatorIds = new Set();
        
        // Collect unique creator IDs from both snapshots
        [...videosSnapshot.docs, ...creatorVideosSnapshot.docs].forEach(doc => {
          const data = doc.data();
          if (data.creatorId) uniqueCreatorIds.add(data.creatorId);
        });
        
        // Fetch creator profiles for avatar fallbacks
        if (uniqueCreatorIds.size > 0) {
          for (const creatorId of uniqueCreatorIds) {
            try {
              const profileDoc = await getDoc(doc(db, 'creatorProfiles', creatorId));
              if (profileDoc.exists()) {
                creatorProfiles.set(creatorId, profileDoc.data());
              }
            } catch (error) {
              console.warn(`Could not fetch creator profile for ${creatorId}:`, error);
            }
          }
        }
        
        // Process videos from both collections with deduplication and creator limits
        // Prioritize creatorVideos collection first so uploaded videos take precedence
        const allSnapshots = [
          ...creatorVideosSnapshot.docs.map(doc => ({ doc, source: 'creatorVideos' })),
          ...videosSnapshot.docs.map(doc => ({ doc, source: 'videos' }))
        ];
        
        // Sort by lastUpdated date first (for fresh uploads), then addedToWiz date
        allSnapshots.sort((a, b) => {
          const dataA = a.doc.data();
          const dataB = b.doc.data();
          
          // Get lastUpdated dates
          const lastUpdatedA = new Date(dataA.lastUpdated?.toDate?.() || dataA.lastUpdated || 0).getTime();
          const lastUpdatedB = new Date(dataB.lastUpdated?.toDate?.() || dataB.lastUpdated || 0).getTime();
          
          // Get addedToWiz dates
          const addedA = new Date(dataA.addedToWiz?.toDate?.() || dataA.addedToWiz || 0).getTime();
          const addedB = new Date(dataB.addedToWiz?.toDate?.() || dataB.addedToWiz || 0).getTime();
          
          // If both have recent lastUpdated times (within last hour), prioritize those
          const oneHourAgo = Date.now() - (60 * 60 * 1000);
          if (lastUpdatedA > oneHourAgo || lastUpdatedB > oneHourAgo) {
            return lastUpdatedB - lastUpdatedA;
          }
          
          // Otherwise sort by addedToWiz date
          return addedB - addedA;
        });
        
        allSnapshots.forEach(({ doc, source }) => {
            const data = doc.data();
            
            // Skip shorts - they should only appear in the Shorts section
            if (data.contentType === 'short') {
              console.log(`🎬 Skipping short video "${data.title}" from Latest Videos section`);
              return;
            }
            
            // Enhanced duplicate detection - prioritize newer uploads
            const getTimestamp = (data) => {
              // Try multiple timestamp fields in priority order
              const fields = [
                data.lastUpdated?.toDate ? data.lastUpdated.toDate() : null,
                data.lastUpdated ? new Date(data.lastUpdated) : null,
                data.addedToWiz?.toDate ? data.addedToWiz.toDate() : null,
                data.addedToWiz ? new Date(data.addedToWiz) : null
              ].filter(date => date && !isNaN(date.getTime())); // Filter out invalid dates
              
              // Return the most recent valid timestamp, or current time if none found
              return fields.length > 0 ? Math.max(...fields.map(d => d.getTime())) : Date.now();
            };
            
            const currentTimestamp = getTimestamp(data);
            
            if (processedVideoIds.has(data.videoId)) {
              const existingTimestamp = processedVideoIds.get(data.videoId);
              
              // Debug log the timestamps for comparison
              const currentDate = new Date(currentTimestamp);
              const existingDate = new Date(existingTimestamp);
              console.log(`🔍 Duplicate detection for ${data.title}:`, {
                videoId: data.videoId,
                currentTime: !isNaN(currentDate.getTime()) ? currentDate.toISOString() : 'Invalid Date',
                existingTime: !isNaN(existingDate.getTime()) ? existingDate.toISOString() : 'Invalid Date',
                isNewer: currentTimestamp > existingTimestamp,
                source,
                lastUpdated: data.lastUpdated,
                addedToWiz: data.addedToWiz
              });
              
              if (currentTimestamp <= existingTimestamp) {
                console.log(`⚠️ Skipping older duplicate video: ${data.title} (${data.videoId})`);
                return;
              } else {
                console.log(`🔄 Replacing older video with newer version: ${data.title}`);
                // Remove the older version from loadedVideos
                const oldIndex = loadedVideos.findIndex(v => v.videoId === data.videoId);
                if (oldIndex !== -1) {
                  loadedVideos.splice(oldIndex, 1);
                  // Also need to decrease the creator count
                  const oldCreatorKey = loadedVideos[oldIndex]?.creatorId || loadedVideos[oldIndex]?.channelId || 'unknown';
                  const oldCount = creatorVideoCount.get(oldCreatorKey) || 0;
                  if (oldCount > 0) {
                    creatorVideoCount.set(oldCreatorKey, oldCount - 1);
                  }
                }
                processedVideoIds.set(data.videoId, currentTimestamp);
              }
            } else {
              processedVideoIds.set(data.videoId, currentTimestamp);
            }
            
            // Limit videos per creator to 20 to allow creators to showcase more content
            const creatorKey = data.creatorId || data.channelId || data.creator || 'unknown';
            const currentCount = creatorVideoCount.get(creatorKey) || 0;
            if (currentCount >= 20) {
              console.log(`⚠️ Skipping video from ${data.creatorName || data.creator}: max 20 videos per creator reached`);
              return;
            }
            
            console.log(`🔍 Processing video doc ${doc.id}:`, data);
            
            const { category, categoryLabel } = mapCategoryToStandard(data.categoryTags || []);
            const isWatched = completedVideos.includes(data.videoId);
            
            // Enhanced avatar fallback logic with unique generation
            const creatorProfile = creatorProfiles.get(data.creatorId);
            const creatorName = data.creatorName || data.channelName || data.channelTitle || 'Unknown Creator';
            
            // Generate unique avatar using creator name and video title for uniqueness
            const uniqueAvatarSeed = `${creatorName}_${data.videoId || Math.random()}`;
            const avatarColors = ['8B5CF6', 'EC4899', '06B6D4', 'F59E0B', '10B981', 'EF4444', '6366F1', 'F97316'];
            const colorIndex = uniqueAvatarSeed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % avatarColors.length;
            const avatarColor = avatarColors[colorIndex];
            
            console.log(`🎭 Avatar debug for ${data.title}:`, {
              creatorId: data.creatorId,
              creatorName: data.creatorName,
              channelName: data.channelName,
              videoAvatar: data.creatorAvatar,
              channelAvatar: data.channelAvatar,
              channelThumbnail: data.channelThumbnail,
              hasCreatorProfile: !!creatorProfile,
              profileAvatar: creatorProfile?.youtubeData?.thumbnailUrl,
              profilePicture: creatorProfile?.youtubeData?.profilePicture,
              uniqueSeed: uniqueAvatarSeed,
              selectedColor: avatarColor
            });
            
            const avatarUrl = data.creatorAvatar || 
                             data.channelAvatar || 
                             data.channelThumbnail ||
                             creatorProfile?.youtubeData?.thumbnailUrl ||
                             creatorProfile?.youtubeData?.profilePicture ||
                             creatorProfile?.channelAvatar ||
                             // Generate unique fallback avatar with creator-specific color
                             `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName.slice(0, 2))}&background=${avatarColor}&color=ffffff&size=128&bold=true&format=svg`;
            
            console.log(`🎭 Final avatar URL for ${data.title}: ${avatarUrl}`);
            
            const video = {
              id: doc.id,
              title: data.title || 'Untitled Video',
              creator: creatorName,
              avatar: avatarUrl,
              thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`,
              duration: formatDuration(data.duration),
              xpReward: calculateXPReward(data.duration),
              category,
              categoryLabel,
              views: formatViewCount(data.views || '0'),
              watched: isWatched,
              progress: isWatched ? 100 : 0,
              videoId: data.videoId,
              channelId: data.channelId || '',
              isNew: new Date(data.addedToWiz?.toDate?.() || data.addedToWiz || new Date()).getTime() > Date.now() - 24 * 60 * 60 * 1000,
            };
            
            // Update creator count (processedVideoIds already updated above)
            creatorVideoCount.set(creatorKey, currentCount + 1);
            
            console.log(`✅ Processed video "${video.title}": watched=${isWatched}`, video);
            loadedVideos.push(video);
          });

          // Already sorted by processing order, limit to 12 for better performance
          const finalVideos = loadedVideos.slice(0, 12);

          console.log('📺 Loaded videos from Firestore:', finalVideos.length);
          console.log('📺 Final loaded videos:', finalVideos);
          setDynamicVideos(finalVideos);
          setLoading(false);
        } catch (error) {
          console.error('❌ Error loading videos:', error);
          setLoading(false);
        }
      };

      loadVideos();
  }, [user]);

  // Combine dynamic videos with static videos, prioritizing dynamic videos
  // Only show static videos if no dynamic videos are loaded to prevent dummy content flash
  const allVideos = dynamicVideos.length > 0 ? dynamicVideos : (loading ? [] : videos);
  
  const filteredVideos = activeCategory === 'all' 
    ? allVideos 
    : allVideos.filter(video => video.category === activeCategory);

  const handleWatchVideo = (videoId: number | string) => {
    const video = allVideos.find(v => v.id === videoId);
    if (video) {
      // Navigate to watch page instead of opening popup
      const searchParams = new URLSearchParams({
        title: video.title,
        creator: video.creator,
        xp: video.xpReward.toString(),
        views: video.views.toString(),
        ...(video.avatar && { avatar: video.avatar }),
        ...(video.channelId && { channelId: video.channelId }),
        level: '1'
      });
      
      navigate(`/watch/${video.videoId}?${searchParams.toString()}`);
    }
  };

  const handleCreatorClick = (channelId: string, creatorName: string) => {
    if (channelId) {
      navigate(`/creator/${channelId}`);
    } else {
      console.warn('No channelId provided for creator:', creatorName);
    }
  };

  const handleVideoReward = async (xp: number) => {
    if (selectedVideo) {
      console.log(`🎯 Earned ${xp} XP for watching ${selectedVideo.title}`);
      
      // Mark video as completed in Firebase to persist the completion status
      try {
        const watchTime = 30; // Minimum watch time in seconds for completion
        const marked = await VideoCompletionService.markVideoCompleted(
          selectedVideo.videoId, 
          xp, 
          watchTime
        );
        
        if (marked) {
          console.log(`✅ Video ${selectedVideo.videoId} marked as completed in Firebase`);
        } else {
          console.warn(`⚠️ Failed to mark video ${selectedVideo.videoId} as completed`);
        }
      } catch (error) {
        console.error(`❌ Error marking video as completed:`, error);
      }
      
      // Update the video's state to show it's been watched
      setDynamicVideos(prevVideos => 
        prevVideos.map(video => 
          video.id === selectedVideo.id 
            ? { ...video, watched: true, progress: 100 }
            : video
        )
      );
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400/20 to-yellow-600/20 border-yellow-500/30';
    if (rank === 2) return 'from-gray-300/20 to-gray-500/20 border-gray-400/30';
    if (rank === 3) return 'from-orange-400/20 to-orange-600/20 border-orange-500/30';
    return 'from-slate-100/20 to-slate-300/20 border-slate-200/30';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-6 h-6 text-orange-500" />;
    return <div className="w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center text-white text-xs font-bold">{rank}</div>;
  };

  return (
    <div className="relative min-h-screen">
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      <div className={cn(
        "max-w-7xl mx-auto space-y-6 sm:space-y-8",
        isMobile ? "p-0" : "p-3 sm:p-6"
      )}>
        {/* Section Title - Only show on mobile since desktop has it in header */}
        {isMobile && (
          <div className="px-2">
            <h2 className="text-2xl font-bold mb-4" style={{
              color: '#1f2937',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>Discover</h2>
          </div>
        )}

        {/* Category Filter Section - Mobile vs Desktop */}
        <div className="mb-6 sm:mb-8">
          {isMobile ? (
            <div className="sticky top-[72px] z-20 bg-background/80 backdrop-blur-lg -mx-3 px-3 py-3">
              <WizMobileFilters
                activeFilter={activeCategory}
                onFilterChange={setActiveCategory}
              />
            </div>
          ) : (
            <div className="relative w-full">
              {/* Horizontal scroll container */}
              <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-2 sm:px-0 pb-1">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    onClick={() => setActiveCategory(category.id)}
                    className={`${activeCategory === category.id ? category.color : ''} transition-all duration-200 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 flex-shrink-0 snap-start`}
                  >
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${category.dotColor}`} />
                    <span className="whitespace-nowrap">{category.label}</span>
                  </Button>
                ))}
              </div>

            </div>
          )}
        </div>

        {/* Discover Content - Mobile responsive scrolling */}
        <div className="relative mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6 px-2 sm:px-0">
            <h3 
              className="text-lg sm:text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #e879f9 0%, #a855f7 30%, #6366f1 70%, #c4b5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4))'
              }}
            >
              Latest Videos
            </h3>
            <div className="hidden sm:flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const container = document.getElementById('discover-container');
                  if (container) container.scrollBy({ left: -400, behavior: 'smooth' });
                }}
                className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-wiz-primary/10 rounded-full"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const container = document.getElementById('discover-container');
                  if (container) container.scrollBy({ left: 400, behavior: 'smooth' });
                }}
                className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-wiz-primary/10 rounded-full"
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
          
          <div
            id="discover-container"
            className={cn(
              "pb-4 scroll-smooth",
              isMobile 
                ? "space-y-4 px-3" 
                : "flex space-x-3 sm:space-x-6 overflow-x-auto scrollbar-hide px-2 sm:px-0"
            )}
            style={!isMobile ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
          >
            {loading ? (
              // Loading skeleton
              Array.from({ length: isMobile ? 3 : 4 }).map((_, index) => (
                <div 
                  key={`skeleton-${index}`}
                  className={cn(
                    "group animate-pulse",
                    isMobile 
                      ? "w-full" 
                      : "flex-shrink-0 w-64 sm:w-80"
                  )}
                >
                  {isMobile ? (
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                      <div className="aspect-video bg-gray-300 rounded-t-2xl"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-80 sm:h-96 bg-white rounded-2xl shadow-xl overflow-hidden">
                      <div className="h-48 bg-gray-300"></div>
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                        </div>
                        <div className="h-8 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : filteredVideos.map((video) => (
              <div 
                key={video.id} 
                className={cn(
                  "group",
                  isMobile 
                    ? "w-full" 
                    : "flex-shrink-0 w-64 sm:w-80"
                )}
              >
                {isMobile ? (
                  /* YouTube-Style Mobile Card */
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
                    <CardContent className="p-0">
                      {/* 16:9 Thumbnail Section */}
                      <div className="relative aspect-video bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden rounded-t-2xl">
                        <img 
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      
                        {/* Category Badge - Top Left Small Pill */}
                        <div className="absolute top-2 left-2 z-20">
                          <Badge 
                            className="px-2 py-0.5 text-xs font-semibold text-white"
                            style={{
                              background: video.isNew 
                                ? 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)'
                                : getCategoryGradient(video.category),
                              borderRadius: '8px',
                              fontSize: '10px'
                            }}
                          >
                            {video.isNew ? 'NEW' : video.categoryLabel}
                          </Badge>
                        </div>

                        {/* Duration - Bottom Right Pill */}
                        <div className="absolute bottom-2 right-2 z-20 px-2 py-0.5 bg-black/80 rounded-md text-xs text-white font-medium">
                          {video.duration}
                        </div>


                        {/* Progress Bar */}
                        {video.progress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 z-20">
                            <div className="w-full bg-white/30 h-1">
                              <div 
                                className="bg-gradient-to-r from-wiz-primary to-wiz-secondary h-1 transition-all duration-300"
                                style={{ width: `${video.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content Section - YouTube Style */}
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          {/* Left: Video Info */}
                          <div className="flex-1 pr-4">
                            {/* Title - Bold and larger */}
                            <h4 className="font-bold text-base text-gray-900 line-clamp-2 leading-snug mb-2">
                              {video.title}
                            </h4>
                            
                            {/* Creator Profile & Views - Horizontal layout */}
                            <div className="flex items-center justify-between">
                              {/* Left: Creator Profile */}
                              {video.avatar && (
                                <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       handleCreatorClick(video.channelId, video.creator);
                                     }}>
                                  <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200/50 hover:border-gray-300 transition-colors duration-200">
                                    <img 
                                      src={video.avatar} 
                                      alt={`${video.creator}'s profile`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="text-sm text-gray-600 font-medium hover:text-gray-800 transition-colors duration-200">
                                    {video.creator}
                                  </span>
                                </div>
                              )}
                              
                              {/* Right: Views */}
                              <div className="flex items-center text-xs text-gray-500 space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{video.views}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Floating Watch CTA */}
                          <div className="flex-shrink-0">
                            <Button 
                              size="sm"
                              className={`font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-4 py-2 ${
                                video.watched 
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                                  : 'bg-gradient-to-r from-wiz-primary to-wiz-secondary hover:from-wiz-secondary hover:to-wiz-primary'
                              }`}
                              onClick={() => handleWatchVideo(video.id)}
                            >
                              {video.watched ? (
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="w-3 h-3" />
                                  <span className="text-xs">Watched</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-1">
                                  <Play className="w-3 h-3" fill="currentColor" />
                                  <span className="text-xs">Watch</span>
                                </div>
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* XP Earned Display */}
                        {video.watched && (
                          <div className="mt-3 text-sm font-semibold"
                               style={{
                                 background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                                 WebkitBackgroundClip: 'text',
                                 WebkitTextFillColor: 'transparent',
                                 backgroundClip: 'text'
                               }}>
                            XP Earned: +{video.xpReward} XP
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Desktop Card Layout */
                  <Card className="h-80 sm:h-96 overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '20px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                        }}>
                    <CardContent className="p-0 h-full flex flex-col">
                      {/* Thumbnail Section */}
                      <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden rounded-t-2xl">
                        <img 
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        
                        {/* Category Badge - Top Left */}
                        <div className="absolute top-3 left-3 z-20">
                          {video.isNew ? (
                            <Badge className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wide"
                                   style={{
                                     background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                                     borderRadius: '12px',
                                     boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                                   }}>
                              NEW
                            </Badge>
                          ) : (
                            <Badge className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wide"
                                   style={{
                                     background: getCategoryGradient(video.category),
                                     borderRadius: '12px',
                                     boxShadow: getCategoryShadow(video.category)
                                   }}>
                              {video.categoryLabel}
                            </Badge>
                          )}
                        </div>

                        {/* XP Badge - Top Right */}
                        <div className="absolute top-3 right-3 z-20">
                          <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold"
                               style={{
                                 background: 'radial-gradient(circle, rgba(255, 215, 0, 0.9) 0%, rgba(255, 165, 0, 0.8) 100%)',
                                 color: '#1F2937',
                                 boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                               }}>
                            <Zap className="w-3 h-3" />
                            <span>{video.xpReward}</span>
                          </div>
                        </div>

                        {/* Duration - Bottom Right */}
                        <div className="absolute bottom-3 right-3 z-20 px-2 py-1 bg-black/70 rounded-lg text-xs text-white font-semibold">
                          {video.duration}
                        </div>


                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            size="lg"
                            onClick={() => handleWatchVideo(video.id)}
                            className="h-16 w-16 rounded-full p-0 text-wiz-primary shadow-2xl hover:scale-110 transition-transform duration-300"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                              backdropFilter: 'blur(10px)'
                            }}
                          >
                            <Play className="w-7 h-7 ml-0.5" fill="currentColor" />
                          </Button>
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10" />

                        {/* Progress Bar */}
                        {video.progress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 z-20">
                            <div className="w-full bg-white/30 h-1">
                              <div 
                                className="bg-gradient-to-r from-wiz-primary to-wiz-secondary h-1 transition-all duration-300"
                                style={{ width: `${video.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-5 flex flex-col">
                        {/* Title */}
                        <h4 className="font-bold text-lg text-gray-800 line-clamp-2 mb-3 group-hover:text-wiz-primary transition-colors leading-tight">
                          {video.title}
                        </h4>
                        
                        {/* Creator Profile & Views - Horizontal layout */}
                        <div className="flex items-center justify-between mb-3">
                          {/* Left: Creator Profile */}
                          {video.avatar && (
                            <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleCreatorClick(video.channelId, video.creator);
                                 }}>
                              <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200/50 hover:border-gray-300 hover:scale-105 transition-all duration-200">
                                <img 
                                  src={video.avatar} 
                                  alt={`${video.creator}'s profile`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="text-sm text-gray-600 font-medium hover:text-gray-800 transition-colors duration-200">
                                {video.creator}
                              </span>
                            </div>
                          )}
                          
                          {/* Right: Views */}
                          <div className="flex items-center text-sm text-gray-600 space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{video.views}</span>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3 mt-auto">
                          <Button 
                            className={`flex-1 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
                              video.watched 
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' 
                                : 'bg-gradient-to-r from-wiz-primary to-wiz-secondary hover:from-wiz-secondary hover:to-wiz-primary'
                            }`}
                            onClick={() => handleWatchVideo(video.id)}
                            style={{ borderRadius: '12px' }}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {video.watched ? 'Watched' : 'Watch'}
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="p-2 hover:bg-pink-50 hover:text-pink-500 hover:border-pink-300 transition-all duration-300"
                            style={{ borderRadius: '10px' }}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="p-2 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-300 transition-all duration-300"
                            style={{ borderRadius: '10px' }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* XP Earned Display */}
                        {video.watched && (
                          <div className="mt-3 text-sm font-semibold"
                               style={{
                                 background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
                                 WebkitBackgroundClip: 'text',
                                 WebkitTextFillColor: 'transparent',
                                 backgroundClip: 'text'
                               }}>
                            XP Earned: +{video.xpReward} XP
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 🎬 Shorts Section */}
        <div className={cn("mb-8", isMobile && "px-3")}>
          <WizShorts />
        </div>

        {/* 🎁 Claim Preview Section */}
        <div className={cn("mb-8", isMobile && "px-3")}>
          <ClaimPreviewSection />
        </div>


        {/* WIZ Premiere — Elevated Abstract UI */}
        <div className={cn("mb-8", isMobile && "px-3")}>
          {/* Remove duplicate mobile title */}
          <motion.div 
            className="relative w-full overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
          >
          {/* Abstract Backdrop */}
          <div
            className="relative rounded-3xl py-16 px-8"
            style={{
              background: `
                linear-gradient(135deg, #0d0d0f 0%, #1a0129 100%),
                radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.15) 0%, transparent 60%),
                radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.12) 0%, transparent 60%)
              `,
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Floating Abstract Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Glassy Orbs */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`orb-${i}`}
                  className="absolute rounded-full opacity-20"
                  style={{
                    width: `${60 + i * 20}px`,
                    height: `${60 + i * 20}px`,
                    background: `
                      radial-gradient(circle, 
                        rgba(${i % 3 === 0 ? '168, 85, 247' : i % 3 === 1 ? '99, 102, 241' : '139, 92, 246'}, 0.3) 0%, 
                        transparent 70%
                      )
                    `,
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    left: `${10 + (i * 15)}%`,
                    top: `${15 + (i * 12)}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, 15, 0],
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 8 + i * 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 1.2
                  }}
                />
              ))}

              {/* Flowing Waveforms */}
              <motion.div
                className="absolute inset-0 opacity-10"
                style={{
                  background: `
                    repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 80px,
                      rgba(168, 85, 247, 0.1) 81px,
                      rgba(168, 85, 247, 0.1) 83px
                    )
                  `
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%']
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              {/* Subtle Starfield */}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className="absolute w-1 h-1 rounded-full bg-purple-400"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    opacity: 0.3
                  }}
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>

            {/* Hero Header */}
            <motion.div 
              className="text-center mb-12 relative z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {/* Abstract Glowing Arc */}
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-48 h-24 opacity-50"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.6), transparent)',
                  borderRadius: '50%',
                  filter: 'blur(20px)'
                }}
                animate={{
                  scaleX: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Mobile-Optimized Title with Purple-to-Pink Gradient */}
              <motion.h2 
                className="text-2xl sm:text-5xl md:text-6xl font-bold mb-4 relative"
                style={{
                  // Mobile: 24px gradient text, Desktop: original styling
                  background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 30%, #ec4899 60%, #f97316 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 4px 20px rgba(168, 85, 247, 0.8))'
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                WIZ Premiere
              </motion.h2>
              
              {/* Mobile-Optimized Tagline */}
              <motion.p 
                className="text-sm sm:text-xl text-gray-300 font-light max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Hollywood-level AI animation brought to life by visionary creators
              </motion.p>
            </motion.div>

            {/* Trailer Showcase */}
            <motion.div 
              className="relative mb-16 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.8 }}
            >
              <motion.div
                className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden group cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(26, 1, 41, 0.9) 100%)',
                  border: '2px solid rgba(168, 85, 247, 0.4)',
                  boxShadow: '0 0 40px rgba(168, 85, 247, 0.3)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 0 60px rgba(168, 85, 247, 0.5)'
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Glassy Frame Effect */}
                <div 
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(168, 85, 247, 0.1) 100%)',
                    backdropFilter: 'blur(1px)'
                  }}
                />
                
                {/* Interactive Video Player */}
                <div 
                  className="w-full h-full relative cursor-pointer group rounded-xl overflow-hidden"
                  onClick={() => setIsPremiereVideoPlaying(!isPremiereVideoPlaying)}
                  style={{ minHeight: '315px' }}
                >
                  {!isPremiereVideoPlaying ? (
                    <>
                      {/* Panda Thumbnail */}
                      <div 
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: 'url("/wiz-premiere-panda.svg")',
                          minHeight: '315px'
                        }}
                      >
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-all duration-300">
                          <div className="w-20 h-20 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                            <Play className="w-10 h-10 text-black ml-1" />
                          </div>
                        </div>
                        
                        {/* Quality Badge */}
                        <div className="absolute top-4 left-4">
                          <div className="flex items-center space-x-1 px-3 py-1 bg-black/80 text-white text-xs font-semibold rounded-full">
                            <Star className="w-3 h-3 fill-current text-yellow-400" />
                            <span>4K Ultra HD</span>
                          </div>
                        </div>
                        
                        {/* Duration Badge */}
                        <div className="absolute bottom-4 right-4">
                          <div className="px-3 py-1 bg-black/80 text-white text-sm font-semibold rounded">
                            2:45
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <iframe
                      className="w-full h-full rounded-xl"
                      src="https://www.youtube.com/embed/2M4asXviuoo?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&hd=1&vq=hd1080&enablejsapi=1&origin=https://wizxp.com"
                      title="WIZ Premiere Trailer"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 1, 41, 0.8) 100%)',
                        minHeight: '315px'
                      }}
                    />
                  )}
                </div>

                {/* Purple Ripple Glow on Hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.2) 0%, transparent 70%)'
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />

                {/* Trailer Badge */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                     style={{
                       background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                       backdropFilter: 'blur(10px)'
                     }}>
                  🎬 PREMIERE TRAILER
                </div>
              </motion.div>
            </motion.div>

            {/* Creator Constellation Grid - Mobile Responsive */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 1.0 }}
            >
              {/* Desktop: Constellation with Connection Lines */}
              <div className="hidden lg:block">
                <div className="relative min-h-[600px]">
                  {/* Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
                    <defs>
                      <linearGradient id="constellationGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(168, 85, 247, 0.6)" />
                        <stop offset="50%" stopColor="rgba(99, 102, 241, 0.4)" />
                        <stop offset="100%" stopColor="rgba(139, 92, 246, 0.6)" />
                      </linearGradient>
                      <filter id="glowEffect">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Constellation Lines */}
                    <motion.path
                      d="M120,100 L320,80 L520,160 L380,300 L180,280 L120,100"
                      stroke="url(#constellationGlow)"
                      strokeWidth="1.5"
                      fill="none"
                      filter="url(#glowEffect)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.7 }}
                      transition={{ duration: 3, delay: 2, ease: "easeInOut" }}
                    />
                    <motion.path
                      d="M600,120 L520,160 L680,260 L780,200"
                      stroke="url(#constellationGlow)"
                      strokeWidth="1.5"
                      fill="none"
                      filter="url(#glowEffect)"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.5 }}
                      transition={{ duration: 2.5, delay: 2.5, ease: "easeInOut" }}
                    />
                  </svg>

                  {/* Creator Tiles - Organic Asymmetrical Layout */}
                  {creators.slice(0, 6).map((creator, index) => {
                    const positions = [
                      { x: '8%', y: '10%', size: 200 },
                      { x: '45%', y: '5%', size: 180 },
                      { x: '75%', y: '15%', size: 190 },
                      { x: '15%', y: '55%', size: 185 },
                      { x: '55%', y: '50%', size: 195 },
                      { x: '80%', y: '60%', size: 175 }
                    ];
                    
                    const pos = positions[index];
                    
                    return (
                      <motion.div
                        key={creator.id}
                        className="absolute group cursor-pointer z-10"
                        style={{
                          left: pos.x,
                          top: pos.y,
                          width: `${pos.size}px`,
                          height: `${pos.size}px`,
                        }}
                        initial={{ 
                          opacity: 0, 
                          scale: 0,
                          y: 50
                        }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          y: 0
                        }}
                        transition={{ 
                          duration: 0.8, 
                          delay: 1.8 + index * 0.2,
                          type: "spring",
                          bounce: 0.3
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          transition: { duration: 0.3, ease: "easeOut" }
                        }}
                      >
                    {/* Video Showcase */}
                    <div
                      className="relative w-full h-full rounded-2xl overflow-hidden transition-all duration-700"
                      style={{
                        background: `
                          linear-gradient(135deg, 
                            rgba(0, 0, 0, 0.9) 0%, 
                            rgba(168, 85, 247, 0.1) 30%,
                            rgba(99, 102, 241, 0.1) 70%,
                            rgba(0, 0, 0, 0.9) 100%
                          )
                        `,
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        boxShadow: '0 8px 32px rgba(168, 85, 247, 0.2)',
                      }}
                    >
                      {/* Video Content */}
                      <div className="absolute inset-4 rounded-xl overflow-hidden">
                        <img 
                          src={creator.thumbnail}
                          alt={`${creator.name}'s showcase`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        
                        {/* Glow Spread on Hover */}
                        <motion.div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: `
                              radial-gradient(circle at center, 
                                rgba(168, 85, 247, 0.3) 0%, 
                                rgba(99, 102, 241, 0.2) 40%, 
                                transparent 70%
                              )
                            `
                          }}
                        />
                      </div>

                      {/* Profile Image - Overlapping Bottom-Left */}
                      <motion.div 
                        className="absolute -bottom-4 left-4 z-20"
                        animate={{
                          boxShadow: [
                            '0 0 20px rgba(168, 85, 247, 0.6)',
                            '0 0 30px rgba(168, 85, 247, 0.8)',
                            '0 0 20px rgba(168, 85, 247, 0.6)'
                          ]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        whileHover={{
                          scale: 1.1,
                          boxShadow: '0 0 40px rgba(168, 85, 247, 1)'
                        }}
                      >
                        <div
                          className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30"
                          style={{
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.3))',
                            backdropFilter: 'blur(10px)',
                          }}
                        >
                          <img 
                            src={creator.avatar} 
                            alt={creator.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </motion.div>

                      {/* Twitter/X Icon - Top Right */}
                      <motion.button
                        className="absolute top-3 right-3 p-2 rounded-lg transition-all duration-300 z-20"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                        whileHover={{
                          scale: 1.1,
                          background: 'rgba(29, 155, 240, 0.3)',
                          boxShadow: '0 0 15px rgba(29, 155, 240, 0.5)'
                        }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(creator.twitterUrl, '_blank');
                        }}
                      >
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </motion.button>

                      {/* Glow Ripple Effect */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100"
                        style={{
                          background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
                          filter: 'blur(15px)'
                        }}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0, 0.5, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    </div>

                    {/* Name + Role - Centered Below */}
                    <motion.div 
                      className="text-center mt-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.2 + index * 0.2 }}
                    >
                      <motion.h3 
                        className="text-lg font-bold text-white mb-1"
                        whileHover={{
                          background: 'linear-gradient(90deg, #ffffff, #a855f7, #6366f1, #ffffff)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                          backgroundPosition: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                          }
                        }}
                      >
                        {creator.name}
                      </motion.h3>
                      <motion.p 
                        className="text-sm text-gray-400"
                        whileHover={{ color: '#a855f7' }}
                      >
                        {creator.specialty}
                      </motion.p>
                    </motion.div>
                  </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile: Vertical Card Showcase - One Card Per Row */}
              <div className="block lg:hidden relative">
                {/* Soft Gradient Background with Animated Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {/* Soft gradient background */}
                  <div 
                    className="absolute inset-0 opacity-40"
                    style={{
                      background: `
                        linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(30, 64, 175, 0.1) 100%),
                        radial-gradient(circle at 30% 20%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, rgba(30, 64, 175, 0.05) 0%, transparent 50%)
                      `
                    }}
                  />
                  
                  {/* Abstract animated lines */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: `
                        repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 100px,
                          rgba(155, 0, 255, 0.02) 101px,
                          rgba(155, 0, 255, 0.02) 103px
                        )
                      `
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%']
                    }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  {/* Subtle particle sparkles */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={`particle-${i}`}
                      className="absolute rounded-full opacity-20"
                      style={{
                        width: `${1 + Math.random() * 2}px`,
                        height: `${1 + Math.random() * 2}px`,
                        background: 'linear-gradient(135deg, rgba(155, 0, 255, 0.8) 0%, rgba(30, 64, 175, 0.8) 100%)',
                      }}
                      initial={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * 800,
                      }}
                      animate={{
                        x: Math.random() * window.innerWidth,
                        y: Math.random() * 800,
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.5, 0.2]
                      }}
                      transition={{
                        duration: 12 + Math.random() * 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>

                {/* Mobile Cards: Full-width with generous padding */}
                <div className="mobile-creator-showcase px-4 sm:px-6 space-y-4 max-w-lg mx-auto">
                  {creators.slice(0, 6).map((creator, index) => (
                    <motion.div
                      key={creator.id}
                      className="group cursor-pointer relative w-full"
                      initial={{ 
                        opacity: 0, 
                        y: 40,
                        scale: 0.95
                      }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        scale: 1
                      }}
                      transition={{ 
                        duration: 0.8, 
                        delay: 0.15 * index,
                        ease: "easeOut",
                        type: "spring",
                        stiffness: 100
                      }}
                      whileInView={{
                        opacity: 1,
                        transition: { duration: 0.6 }
                      }}
                      whileTap={{ 
                        scale: 1.05,
                        transition: { duration: 0.2 }
                      }}
                    >
                      {/* Glow Pulse Animation on Tap */}
                      <motion.div
                        className="absolute inset-0 rounded-3xl pointer-events-none"
                        style={{
                          background: 'radial-gradient(circle, rgba(155, 0, 255, 0.3) 0%, rgba(30, 64, 175, 0.2) 50%, transparent 70%)',
                          filter: 'blur(4px)',
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 0, opacity: 0 }}
                        whileTap={{
                          scale: [0, 1.1, 1.3],
                          opacity: [0, 0.8, 0]
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />

                      {/* Rounded-Square Creator Card (1:1.1 ratio) */}
                      <div 
                        className="mobile-creator-card relative w-full aspect-[10/11] rounded-3xl overflow-hidden transition-all duration-500"
                        style={{
                          background: `
                            linear-gradient(135deg, 
                              rgba(255, 255, 255, 0.05) 0%, 
                              rgba(240, 240, 250, 0.03) 100%
                            )
                          `,
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: `
                            0 0 20px rgba(155, 0, 255, 0.15),
                            0 8px 32px rgba(30, 64, 175, 0.1),
                            inset 0 1px 0 rgba(255, 255, 255, 0.05)
                          `,
                        }}
                      >
                        {/* Purple-to-Blue Edge Glow Animation */}
                        <motion.div
                          className="absolute inset-0 rounded-3xl pointer-events-none"
                          style={{
                            background: 'linear-gradient(135deg, rgba(155, 0, 255, 0.1) 0%, rgba(30, 64, 175, 0.1) 100%)',
                            filter: 'blur(1px)',
                          }}
                          animate={{
                            opacity: [0.5, 0.8, 0.5],
                            scale: [0.98, 1, 0.98]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        {/* Full-Bleed Creator Artwork */}
                        <div className="h-3/5 relative overflow-hidden"
                             style={{ borderRadius: '24px 24px 0 0' }}>
                          <img 
                            src={creator.thumbnail}
                            alt={`${creator.name}'s showcase`}
                            className="mobile-creator-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {/* Enhanced Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          
                          {/* Enhanced Twitter Button - Larger Touch Target */}
                          <motion.button
                            className="mobile-twitter-btn absolute top-4 right-4 p-3 bg-white/95 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
                            style={{
                              minWidth: '44px',
                              minHeight: '44px'
                            }}
                            whileHover={{ 
                              scale: 1.1,
                              backgroundColor: 'rgba(29, 155, 240, 0.1)'
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(creator.twitterUrl, '_blank');
                            }}
                            aria-label={`Visit ${creator.name}'s Twitter profile`}
                          >
                            <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </motion.button>

                          {/* Enhanced Verification Badge */}
                          {creator.verified && (
                            <div className="absolute top-4 left-4">
                              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/90 backdrop-blur-sm rounded-full">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-medium text-white">Verified</span>
                              </div>
                            </div>
                          )}

                          {/* Followers Count Badge */}
                          <div className="absolute bottom-4 left-4">
                            <div className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                              <span className="text-xs font-semibold text-gray-700">{creator.subscribers} subscribers</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mobile Creator Info Section */}
                        <div className="relative h-2/5 p-4 flex flex-col justify-between">
                          {/* Micro-Avatar Badge - Overlapping bottom of image */}
                          <motion.div 
                            className="absolute -top-6 left-4 z-10"
                            initial={{ scale: 0, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                          >
                            <div 
                              className="w-12 h-12 rounded-full overflow-hidden border-3 border-white shadow-lg"
                              style={{
                                boxShadow: '0 4px 16px rgba(155, 0, 255, 0.3)'
                              }}
                            >
                              <img 
                                src={creator.avatar} 
                                alt={creator.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </motion.div>

                          {/* Creator Info - Beneath Image */}
                          <div className="mt-6 text-center space-y-2">
                            {/* Creator Name - Bold 16px Gradient */}
                            <motion.h3 
                              className="font-bold text-base leading-tight"
                              style={{
                                background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 70%, #ec4899 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                              }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                            >
                              {creator.name}
                            </motion.h3>
                            
                            {/* AI Animation Artist - Light Grey 13px */}
                            <motion.p 
                              className="text-sm text-gray-400 font-medium"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + index * 0.1 }}
                            >
                              AI Animation Artist
                            </motion.p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Join the Watch Party Button - Bottom Center */}
            <motion.div 
              className="flex justify-center mt-12 relative z-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.0, duration: 0.8 }}
            >
              <motion.button
                className="group relative px-8 py-4 font-bold text-lg rounded-2xl overflow-hidden"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(147, 51, 234, 0.9) 0%, 
                      rgba(99, 102, 241, 0.9) 50%, 
                      rgba(139, 92, 246, 0.9) 100%
                    )
                  `,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(147, 51, 234, 0.4)',
                  color: '#ffffff'
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '0 12px 40px rgba(147, 51, 234, 0.6)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Shimmer Effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  style={{
                    background: `
                      linear-gradient(45deg, 
                        transparent 30%, 
                        rgba(255, 255, 255, 0.3) 50%, 
                        transparent 70%
                      )
                    `
                  }}
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                />
                
                <div className="relative flex items-center space-x-3">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🎬
                  </motion.div>
                  <span>Join the Watch Party</span>
                </div>
              </motion.button>
            </motion.div>
          </div>
          </motion.div>
        </div>

        {/* 🏆 Epic Premium Leaderboard */}
        <div className={cn("mb-8", isMobile && "px-3")}>
          {/* Remove duplicate mobile title */}
          <div className="relative">
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div 
              className="rounded-3xl overflow-hidden bg-white shadow-xl"
              style={{
                border: '1px solid rgba(0, 0, 0, 0.05)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div className="p-4 sm:p-6 lg:p-8">
                <WizPremiumLeaderboard />
              </div>
            </div>
          </motion.div>
          </div>
        </div>

      </div>
    </div>
  );
};