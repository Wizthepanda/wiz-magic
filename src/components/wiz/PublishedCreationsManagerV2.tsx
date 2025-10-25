import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  MessageSquare,
  Package,
  Zap,
  Edit3,
  Trash2,
  X,
  Eye,
  Star,
  BadgeCheck,
  Search,
  BarChart3,
  Plus,
  Settings2,
  TrendingUp,
  Clock,
  CheckSquare,
  Square,
  MessageCircle,
  Youtube,
  Sparkles,
  Filter
} from 'lucide-react';
import { CreationCardV2, AnalyticsModal, PreviewModalV2 } from './PublishedCreationsComponents';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Import type from components file
import type { PublishedCreation } from './PublishedCreationsComponents';

const creationTypes = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'community', label: 'Communities', icon: Users },
  { id: 'course', label: 'Courses', icon: GraduationCap },
  { id: 'coaching', label: 'Coaching', icon: MessageSquare },
  { id: 'product', label: 'Products', icon: Package },
  { id: 'youtube', label: 'YouTube', icon: Youtube }
];

const sortOptions = [
  { id: 'date', label: 'Most Recent' },
  { id: 'views', label: 'Most Views' },
  { id: 'members', label: 'Most Members' },
  { id: 'zaps', label: 'Most ZAPs' },
  { id: 'alphabetical', label: 'A-Z' }
];

interface PublishedCreationsManagerV2Props {
  onEditDraft?: (draftId: string, type: 'community' | 'course' | 'coaching' | 'product') => void;
}

export const PublishedCreationsManagerV2: React.FC<PublishedCreationsManagerV2Props> = ({ onEditDraft }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // State
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [creations, setCreations] = useState<PublishedCreation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreation, setSelectedCreation] = useState<PublishedCreation | null>(null);
  const [analyticsCreation, setAnalyticsCreation] = useState<PublishedCreation | null>(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch creations
  const fetchCreations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const fetchedCreations: PublishedCreation[] = [];

      // Fetch communities
      const communitiesQuery = query(
        collection(db, 'communities'),
        where('creatorId', '==', user.uid)
      );
      const communitiesSnapshot = await getDocs(communitiesQuery);

      communitiesSnapshot.forEach((doc) => {
        const data = doc.data();
        const zapsRequired = data.zapsRequired || 0;
        const usdCoPay = data.usdCoPay || 0;

        let monetizationType: 'zaps-only' | 'zaps-usd' | 'free' = 'free';
        if (zapsRequired > 0 && usdCoPay > 0) {
          monetizationType = 'zaps-usd';
        } else if (zapsRequired > 0) {
          monetizationType = 'zaps-only';
        }

        const creation: PublishedCreation = {
          id: doc.id,
          title: data.title || 'Untitled',
          description: data.shortDescription || data.longDescription || '',
          type: 'community',
          thumbnail: data.coverMedia?.[0]?.thumbnail || data.coverMedia?.[0]?.url || '/api/placeholder/400/300',
          zapsRequired,
          usdCoPay: usdCoPay > 0 ? usdCoPay : undefined,
          monetizationType,
          status: data.status === 'published' ? 'live' : 'draft',
          creatorName: data.creatorName || user.displayName || 'Creator',
          creatorAvatar: data.creatorAvatar || user.photoURL || '/api/placeholder/60/60',
          stats: {
            views: data.viewsCount || Math.floor(Math.random() * 1000),
            members: data.membersCount || 0,
            comments: data.commentsCount || Math.floor(Math.random() * 50),
            zapsClaimed: data.zapsClaimedCount || 0,
            rating: data.rating || 4.5
          },
          tags: data.tags || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt || data.createdAt
        };

        fetchedCreations.push(creation);
      });

      // Fetch courses
      const coursesQuery = query(
        collection(db, 'courses_community'),
        where('creatorId', '==', user.uid)
      );
      const coursesSnapshot = await getDocs(coursesQuery);

      coursesSnapshot.forEach((doc) => {
        const data = doc.data();
        const zapsRequired = data.zapsRequired || 0;
        const usdCoPay = data.usdCoPay || 0;

        let monetizationType: 'zaps-only' | 'zaps-usd' | 'free' = 'free';
        if (zapsRequired > 0 && usdCoPay > 0) {
          monetizationType = 'zaps-usd';
        } else if (zapsRequired > 0) {
          monetizationType = 'zaps-only';
        }

        const creation: PublishedCreation = {
          id: doc.id,
          title: data.title || 'Untitled Course',
          description: data.description || '',
          type: 'course',
          thumbnail: data.coverImage || '/api/placeholder/400/300',
          zapsRequired,
          usdCoPay: usdCoPay > 0 ? usdCoPay : undefined,
          monetizationType,
          status: data.status === 'published' ? 'live' : 'draft',
          creatorName: data.creatorName || user.displayName || 'Creator',
          creatorAvatar: data.creatorAvatar || user.photoURL || '/api/placeholder/60/60',
          stats: {
            views: data.viewsCount || Math.floor(Math.random() * 500),
            members: data.enrollmentCount || 0,
            comments: data.commentsCount || Math.floor(Math.random() * 30),
            rating: data.rating || 4.5
          },
          tags: data.tags || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt || data.createdAt
        };

        fetchedCreations.push(creation);
      });

      // Helper function to safely get timestamp
      const getTimestamp = (timestamp: any): number => {
        if (!timestamp) return 0;
        if (typeof timestamp.toMillis === 'function') return timestamp.toMillis();
        if (typeof timestamp === 'number') return timestamp;
        if (timestamp.seconds) return timestamp.seconds * 1000;
        return 0;
      };

      // Deduplicate by title - keep only the most recently updated version
      const deduplicatedCreations = Object.values(
        fetchedCreations.reduce((acc, creation) => {
          const existing = acc[creation.title];
          const creationTime = getTimestamp(creation.updatedAt || creation.createdAt);
          const existingTime = getTimestamp(existing?.updatedAt || existing?.createdAt);

          if (!existing || creationTime > existingTime) {
            acc[creation.title] = creation;
          }
          return acc;
        }, {} as Record<string, PublishedCreation>)
      );

      console.log(`✨ Fetched ${fetchedCreations.length} creations, showing ${deduplicatedCreations.length} unique`);
      setCreations(deduplicatedCreations);

      toast({
        title: '✅ Synced',
        description: `${deduplicatedCreations.length} creations loaded`,
      });
    } catch (error) {
      console.error('Error fetching creations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your published creations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreations();
  }, [user]);

  // Filter, search, and sort
  const processedCreations = useMemo(() => {
    let result = [...creations];

    // Filter by type
    if (activeFilter !== 'all') {
      result = result.filter(c => c.type === activeFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return (b.stats?.views || 0) - (a.stats?.views || 0);
        case 'members':
          return (b.stats?.members || 0) - (a.stats?.members || 0);
        case 'zaps':
          return b.zapsRequired - a.zapsRequired;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          const getTime = (ts: any) => {
            if (!ts) return 0;
            if (typeof ts.toMillis === 'function') return ts.toMillis();
            if (typeof ts === 'number') return ts;
            if (ts.seconds) return ts.seconds * 1000;
            return 0;
          };
          return getTime(b.updatedAt || b.createdAt) - getTime(a.updatedAt || a.createdAt);
      }
    });

    return result;
  }, [creations, activeFilter, searchQuery, sortBy]);

  // Handlers
  const handleDelete = async (creationId: string) => {
    if (!confirm('Are you sure you want to delete this creation? This action cannot be undone.')) {
      return;
    }

    try {
      const creation = creations.find(c => c.id === creationId);
      if (!creation) throw new Error('Creation not found');

      const collectionName = creation.type === 'course' ? 'courses_community' : 'communities';

      // Delete the specific document
      await deleteDoc(doc(db, collectionName, creationId));

      // Also find and delete any duplicates with the same title (to prevent re-appearing)
      if (user) {
        const duplicatesQuery = query(
          collection(db, collectionName),
          where('creatorId', '==', user.uid),
          where('title', '==', creation.title)
        );
        const duplicatesSnapshot = await getDocs(duplicatesQuery);

        // Delete all duplicates
        const deletePromises = duplicatesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log(`🗑️ Deleted ${duplicatesSnapshot.docs.length + 1} total documents (including duplicates)`);
      }

      // Remove from local state
      setCreations(prev => prev.filter(c => c.title !== creation.title));
      setSelectedCreation(null);

      toast({
        title: '🗑️ Deleted',
        description: 'Your creation has been permanently removed'
      });
    } catch (error) {
      console.error('Error deleting creation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete creation',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (creation: PublishedCreation) => {
    console.log('🖊️ Edit clicked for:', creation.title, 'Status:', creation.status);

    // For communities, navigate to the new wizard with draft ID
    if (creation.type === 'community') {
      toast({
        title: 'Opening Editor',
        description: `Loading ${creation.title} for editing...`
      });

      // Navigate to create page with community type and draft ID as query params
      navigate(`/create?type=community&draftId=${creation.id}`);
      return;
    }

    // For other types, use the old handler
    toast({
      title: 'Opening Editor',
      description: `Loading ${creation.title} for editing...`
    });

    if ((window as any).__creationHubEditHandler) {
      (window as any).__creationHubEditHandler(creation.id, creation.type);

      setTimeout(() => {
        const createSection = document.querySelector('[data-section="create"]');
        if (createSection) {
          createSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleView = (creation: PublishedCreation) => {
    if (creation.type === 'community') {
      navigate(`/community/${creation.id}`);
    } else if (creation.type === 'course') {
      navigate(`/course/${creation.id}`);
    }
  };

  const toggleBulkSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Delete ${selectedIds.size} selected creations? This cannot be undone.`)) {
      return;
    }

    try {
      for (const id of selectedIds) {
        await handleDelete(id);
      }
      setSelectedIds(new Set());
      setBulkEditMode(false);

      toast({
        title: '🗑️ Bulk Delete Complete',
        description: `Removed ${selectedIds.size} creations`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete bulk delete',
        variant: 'destructive'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-16 space-y-8 relative"
    >
      {/* Parallax Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-purple-200/20 to-pink-200/20 blur-3xl"
          animate={{ y: [-20, 20, -20], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-blue-200/20 to-indigo-200/20 blur-3xl"
          animate={{ y: [20, -20, 20], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        {/* Glassmorphic Header Card */}
        <div className="relative rounded-3xl p-8 bg-white/5 backdrop-blur-lg shadow-[0_0_20px_-5px_rgba(0,0,0,0.4)] border border-white/10">
          {/* Title & Subtitle */}
          <div className="text-center space-y-2 mb-6">
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-[#9b5de5] to-[#f15bb5] bg-clip-text text-transparent"
            >
              Published Creations
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-600 max-w-2xl mx-auto"
            >
              Everything you've launched lives here — organized and ready to manage.
            </motion.p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button
              onClick={() => navigate('/create')}
              className="h-11 px-6 bg-gradient-to-r from-[#9b5de5] to-[#f15bb5] hover:shadow-[0_0_25px_-5px_rgba(155,93,229,0.5)] transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Creation
            </Button>

            <Button
              onClick={() => setBulkEditMode(!bulkEditMode)}
              variant={bulkEditMode ? "default" : "outline"}
              className={cn(
                "h-11 px-6",
                bulkEditMode && "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
              )}
            >
              <Settings2 className="w-4 h-4 mr-2" />
              {bulkEditMode ? 'Exit Bulk Edit' : 'Manage All'}
            </Button>

            {bulkEditMode && selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Button
                  onClick={handleBulkDelete}
                  variant="outline"
                  className="h-11 px-6 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedIds.size})
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filter & Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {/* Filter Bubbles */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 p-1.5 rounded-full bg-white/60 backdrop-blur-xl border border-gray-200 shadow-lg">
            {creationTypes.map((type) => {
              const Icon = type.icon;
              const isActive = activeFilter === type.id;

              return (
                <motion.button
                  key={type.id}
                  onClick={() => setActiveFilter(type.id)}
                  className={cn(
                    "relative px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 border backdrop-blur-xl",
                    isActive
                      ? "bg-gradient-to-r from-[#9b5de5] to-[#f15bb5] text-white border-transparent shadow-lg"
                      : "bg-white/50 text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md"
                  )}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9b5de5]/40 to-[#f15bb5]/40 blur-md -z-10"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.4, 0.6, 0.4],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{type.label}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Search & Sort Row */}
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search your creations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 pr-4 bg-white/80 backdrop-blur-xl border-gray-200 rounded-2xl shadow-sm focus:shadow-md transition-shadow"
            />
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 h-12 bg-white/80 backdrop-blur-xl border-gray-200 rounded-2xl shadow-sm">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="h-[420px] rounded-3xl bg-white/40 backdrop-blur-xl animate-pulse"
            />
          ))}
        </div>
      ) : processedCreations.length === 0 ? (
        <EmptyState searchQuery={searchQuery} activeFilter={activeFilter} />
      ) : (
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {processedCreations.map((creation, index) => (
              <CreationCardV2
                key={creation.id}
                creation={creation}
                index={index}
                bulkEditMode={bulkEditMode}
                isSelected={selectedIds.has(creation.id)}
                onToggleSelect={() => toggleBulkSelect(creation.id)}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAnalytics={() => setAnalyticsCreation(creation)}
                onPreview={() => setSelectedCreation(creation)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Analytics Modal */}
      <AnimatePresence>
        {analyticsCreation && (
          <AnalyticsModal
            creation={analyticsCreation}
            onClose={() => setAnalyticsCreation(null)}
          />
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedCreation && (
          <PreviewModalV2
            creation={selectedCreation}
            onClose={() => setSelectedCreation(null)}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAnalytics={() => {
              setAnalyticsCreation(selectedCreation);
              setSelectedCreation(null);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Empty State Component
const EmptyState: React.FC<{ searchQuery: string; activeFilter: string }> = ({ searchQuery, activeFilter }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20"
    >
      <div className="relative">
        {/* Floating Orb with Animation */}
        <motion.div
          className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center relative overflow-hidden"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <Package className="w-16 h-16 text-purple-400 relative z-10" />
        </motion.div>

        {searchQuery || activeFilter !== 'all' ? (
          <>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="rounded-xl"
            >
              Clear Filters
            </Button>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">You haven't published anything yet ✨</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start by creating your first community, course, or video.
            </p>
            <Button
              onClick={() => navigate('/create')}
              className="h-12 px-8 bg-gradient-to-r from-[#9b5de5] to-[#f15bb5] hover:shadow-lg rounded-2xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Now
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
};

// Enhanced Creation Card Component (continued in next message due to length)
