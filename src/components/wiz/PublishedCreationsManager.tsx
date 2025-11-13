import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  MessageSquare,
  Package,
  Zap,
  DollarSign,
  Edit3,
  Trash2,
  X,
  Eye,
  Star,
  BadgeCheck,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// Published Creation Interface
interface PublishedCreation {
  id: string;
  title: string;
  description: string;
  type: 'community' | 'course' | 'coaching' | 'product';
  thumbnail: string;
  zapsRequired: number;
  usdCoPay?: number;
  monetizationType: 'zaps-only' | 'zaps-usd' | 'free';
  status: 'live' | 'draft';
  creatorName: string;
  creatorAvatar: string;
  stats?: {
    members?: number;
    sales?: number;
    rewards?: number;
    rating?: number;
  };
  tags?: string[];
  createdAt: any;
}

const creationTypes = [
  { id: 'all', label: 'All', icon: null },
  { id: 'community', label: 'Communities', icon: Users },
  { id: 'course', label: 'Courses', icon: GraduationCap },
  { id: 'coaching', label: 'Coaching', icon: MessageSquare },
  { id: 'product', label: 'Digital Products', icon: Package }
];

interface PublishedCreationsManagerProps {
  onEditDraft?: (draftId: string, type: 'community' | 'course' | 'coaching' | 'product') => void;
}

export const PublishedCreationsManager: React.FC<PublishedCreationsManagerProps> = ({ onEditDraft }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [creations, setCreations] = useState<PublishedCreation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreation, setSelectedCreation] = useState<PublishedCreation | null>(null);

  // Define fetchCreations outside useEffect so it can be called from handleFixBlobUrls
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

        // Process communities
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
              members: data.membersCount || 0,
              sales: data.salesCount || 0,
              rewards: data.rewardsClaimedCount || 0,
              rating: data.rating || 4.5
            },
            tags: data.tags || [],
            createdAt: data.createdAt
          };

          fetchedCreations.push(creation);
        });

        // Fetch courses from courses_community collection
        const coursesQuery = query(
          collection(db, 'courses_community'),
          where('creatorId', '==', user.uid)
        );
        const coursesSnapshot = await getDocs(coursesQuery);

        // Process courses
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
              members: data.enrollmentCount || 0,
              sales: 0,
              rewards: 0,
              rating: data.rating || 4.5
            },
            tags: data.tags || [],
            createdAt: data.createdAt
          };

          fetchedCreations.push(creation);
        });

        console.log(`📦 Fetched ${communitiesSnapshot.size} communities and ${coursesSnapshot.size} courses`);

        // Helper function to safely get timestamp
        const getTimestamp = (timestamp: any): number => {
          if (!timestamp) return 0;
          if (typeof timestamp.toMillis === 'function') {
            return timestamp.toMillis();
          }
          if (typeof timestamp === 'number') {
            return timestamp;
          }
          if (timestamp.seconds) {
            return timestamp.seconds * 1000;
          }
          return 0;
        };

        // Deduplicate by title - keep only the most recently updated version
        const deduplicatedCreations = Object.values(
          fetchedCreations.reduce((acc, creation) => {
            const existing = acc[creation.title];
            const creationTime = getTimestamp(creation.createdAt);
            const existingTime = getTimestamp(existing?.createdAt);

            if (!existing || creationTime > existingTime) {
              acc[creation.title] = creation;
            }
            return acc;
          }, {} as Record<string, PublishedCreation>)
        );

        console.log(`📦 Fetched ${fetchedCreations.length} creations, showing ${deduplicatedCreations.length} unique`);
        setCreations(deduplicatedCreations);
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

  // Fetch user's published creations on mount
  useEffect(() => {
    fetchCreations();
  }, [user?.uid, toast]);

  const filteredCreations = creations.filter(creation =>
    activeFilter === 'all' || creation.type === activeFilter
  );

  const handleDelete = async (creationId: string) => {
    if (!confirm('Are you sure you want to delete this creation? This action cannot be undone.')) {
      return;
    }

    try {
      // Find the creation to determine its type
      const creation = creations.find(c => c.id === creationId);
      if (!creation) {
        throw new Error('Creation not found');
      }

      // Determine the correct collection based on type
      const collectionName = creation.type === 'course' ? 'courses_community' : 'communities';

      await deleteDoc(doc(db, collectionName, creationId));
      setCreations(prev => prev.filter(c => c.id !== creationId));
      setSelectedCreation(null);
      toast({
        title: 'Deleted',
        description: 'Your creation has been deleted successfully'
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

  const handleFixBlobUrls = async () => {
    if (!user || !confirm('This will clear blob URLs from all your communities. You\'ll need to re-upload images. Continue?')) {
      return;
    }

    try {
      console.log('🔍 Scanning your communities for blob URLs...');

      const communitiesQuery = query(
        collection(db, 'communities'),
        where('creatorId', '==', user.uid)
      );
      const snapshot = await getDocs(communitiesQuery);

      let fixed = 0;
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        if (!data.coverMedia || !Array.isArray(data.coverMedia)) {
          continue;
        }

        const hasBlobUrls = data.coverMedia.some(
          (media: any) => media.url?.startsWith('blob:') || media.thumbnail?.startsWith('blob:')
        );

        if (hasBlobUrls) {
          console.log(`📝 Fixing: ${data.title}`);
          await updateDoc(doc(db, 'communities', docSnap.id), {
            coverMedia: []
          });
          fixed++;
        }
      }

      toast({
        title: 'Migration Complete',
        description: `Fixed ${fixed} communities. Please re-upload images for each.`
      });

      // Refresh the list
      fetchCreations();
    } catch (error) {
      console.error('Error fixing blob URLs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fix blob URLs',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (creation: PublishedCreation) => {
    console.log('🖊️ Edit clicked for:', creation.title, creation.id, creation.type);

    toast({
      title: 'Opening Editor',
      description: `Loading ${creation.title} for editing...`
    });

    // Call the CreationHub edit handler if available
    if ((window as any).__creationHubEditHandler) {
      console.log('✅ Found handler, calling it...');
      (window as any).__creationHubEditHandler(creation.id, creation.type);

      // Scroll to the Create section
      setTimeout(() => {
        const createSection = document.querySelector('[data-section="create"]');
        console.log('📍 Create section found:', !!createSection);
        if (createSection) {
          createSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      console.error('❌ CreationHub edit handler not found!');
    }
  };

  const handleView = (creation: PublishedCreation) => {
    console.log('👁️ View clicked for:', creation.title, creation.id, creation.type);

    // Navigate to the public page based on creation type
    if (creation.type === 'community') {
      navigate(`/community/${creation.id}`);
    } else if (creation.type === 'course') {
      navigate(`/course/${creation.id}`);
    } else if (creation.type === 'coaching') {
      navigate(`/coaching/${creation.id}`);
    } else if (creation.type === 'product') {
      navigate(`/product/${creation.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-16 space-y-8"
    >
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 bg-clip-text text-transparent">
          Your Published Creations
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage the communities, courses, coaching, and products you've published.
        </p>
        <div className="pt-2">
          <Button
            onClick={handleFixBlobUrls}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🔧 Fix Missing Images
          </Button>
        </div>
      </div>

      {/* Filter Row */}
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
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-300"
                    : "bg-white/50 text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md"
                )}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 opacity-40 blur-md -z-10"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <span className="flex items-center space-x-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{type.label}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[420px] rounded-3xl bg-white/40 backdrop-blur-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredCreations.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Creations Yet</h3>
          <p className="text-gray-600 mb-6">
            Start creating communities, courses, or products above!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreations.map((creation, index) => (
            <CreationCard
              key={creation.id}
              creation={creation}
              index={index}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPreview={() => setSelectedCreation(creation)}
            />
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedCreation && (
          <PreviewModal
            creation={selectedCreation}
            onClose={() => setSelectedCreation(null)}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Creation Card Component
const CreationCard: React.FC<{
  creation: PublishedCreation;
  index: number;
  onView: (creation: PublishedCreation) => void;
  onEdit: (creation: PublishedCreation) => void;
  onDelete: (id: string) => void;
  onPreview: () => void;
}> = ({ creation, index, onView, onEdit, onDelete, onPreview }) => {
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = {
    community: { icon: Users, color: 'from-blue-500 to-cyan-500', label: 'Community' },
    course: { icon: GraduationCap, color: 'from-purple-500 to-pink-500', label: 'Course' },
    coaching: { icon: MessageSquare, color: 'from-green-500 to-emerald-500', label: 'Coaching' },
    product: { icon: Package, color: 'from-orange-500 to-red-500', label: 'Product' }
  };

  const monetizationBadge = {
    'zaps-only': { label: '⚡ ZAPs Only', color: 'bg-gradient-to-r from-indigo-500 to-violet-600' },
    'zaps-usd': { label: '⚡ ZAPs + 💵 USD', color: 'bg-gradient-to-r from-blue-500 to-green-500' },
    'free': { label: 'Free', color: 'bg-gradient-to-r from-green-500 to-emerald-500' }
  };

  const config = typeConfig[creation.type];
  const TypeIcon = config.icon;
  const badge = monetizationBadge[creation.monetizationType];

  return (
    <motion.article
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPreview}
      className="group relative cursor-pointer"
    >
      <motion.div
        className="relative h-[420px] rounded-3xl overflow-hidden backdrop-blur-3xl border shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,248,252,0.95) 100%)',
          borderColor: isHovered ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.6)',
          boxShadow: isHovered
            ? '0 25px 60px rgba(0, 0, 0, 0.15), 0 0 40px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 0 rgba(0, 0, 0, 0.05)'
            : '0 8px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 0 rgba(0, 0, 0, 0.03)',
        }}
        whileHover={{
          scale: 1.03,
          y: -8,
          transition: { duration: 0.3 },
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Thumbnail */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          <img
            src={creation.thumbnail}
            alt={creation.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Monetization Badge - Top Left */}
          <div className="absolute top-3 left-3">
            <div className={cn("px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg", badge.color)}>
              {badge.label}
            </div>
          </div>

          {/* Type Badge - Top Right */}
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-xl border border-white/40 bg-white/80">
              <TypeIcon className="w-3.5 h-3.5 text-gray-700" />
              <span className="text-xs font-semibold text-gray-700">{config.label}</span>
            </div>
          </div>

          {/* Status Badge - Bottom Right */}
          <div className="absolute bottom-3 right-3">
            <div className={cn(
              "px-3 py-1.5 rounded-full text-xs font-bold shadow-lg",
              creation.status === 'live'
                ? "bg-green-500 text-white"
                : "bg-yellow-500 text-white"
            )}>
              {creation.status === 'live' ? '● Live' : '○ Draft'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col justify-between h-[calc(100%-13rem)]">
          <div>
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
              {creation.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
              {creation.description}
            </p>

            {/* Stats */}
            {creation.stats && (
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                {creation.stats.members !== undefined && (
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {creation.stats.members}
                  </span>
                )}
                {creation.stats.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500" fill="currentColor" />
                    {creation.stats.rating.toFixed(1)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="space-y-3">
            {/* Cost */}
            <div className="flex items-center gap-2">
              {creation.zapsRequired > 0 && (
                <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 shadow-md">
                  <span className="text-sm font-bold text-white flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" fill="currentColor" />
                    {creation.zapsRequired}
                  </span>
                </div>
              )}
              {creation.usdCoPay && (
                <div className="px-3 py-1.5 rounded-lg bg-green-50 border border-green-200">
                  <span className="text-sm font-bold text-green-700">
                    +${creation.usdCoPay}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(creation);
                }}
                className="w-full h-9 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                View Public Page
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(creation);
                  }}
                  className="flex-1 h-9 bg-white/80 hover:bg-white border border-gray-200 text-gray-700 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(creation.id);
                  }}
                  variant="outline"
                  className="flex-1 h-9 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
};

// Preview Modal Component
const PreviewModal: React.FC<{
  creation: PublishedCreation;
  onClose: () => void;
  onView: (creation: PublishedCreation) => void;
  onEdit: (creation: PublishedCreation) => void;
  onDelete: (id: string) => void;
}> = ({ creation, onClose, onView, onEdit, onDelete }) => {
  const typeConfig = {
    community: { icon: Users },
    course: { icon: GraduationCap },
    coaching: { icon: MessageSquare },
    product: { icon: Package }
  };

  const TypeIcon = typeConfig[creation.type].icon;

  const monetizationBadge = {
    'zaps-only': { label: '⚡ ZAPs Only', color: 'bg-gradient-to-r from-indigo-500 to-violet-600' },
    'zaps-usd': { label: '⚡ ZAPs + 💵 USD', color: 'bg-gradient-to-r from-blue-500 to-green-500' },
    'free': { label: 'Free', color: 'bg-gradient-to-r from-green-500 to-emerald-500' }
  };

  const badge = monetizationBadge[creation.monetizationType];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-3xl z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative bg-white/80 backdrop-blur-3xl rounded-3xl shadow-2xl overflow-hidden border border-white/60 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/90 hover:bg-white backdrop-blur-xl flex items-center justify-center transition-all shadow-lg group"
          >
            <X className="w-6 h-6 text-gray-700 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Banner Image */}
          <div className="relative h-80 bg-gradient-to-br from-gray-100 to-gray-200">
            <img
              src={creation.thumbnail}
              alt={creation.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.3)]" />
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Creator Info */}
            <div className="flex items-center space-x-3 p-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-gray-200">
              <Avatar className="w-14 h-14 border-2 border-white shadow-md">
                <AvatarImage src={creation.creatorAvatar} />
                <AvatarFallback>{creation.creatorName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-lg">{creation.creatorName}</span>
                  <BadgeCheck className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm text-gray-500">Creator</span>
              </div>
            </div>

            {/* Title & Type */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200">
                  <TypeIcon className="w-4 h-4 text-gray-700" />
                  <span className="text-sm font-semibold text-gray-700 capitalize">{creation.type}</span>
                </div>
                <div className={cn("px-3 py-1.5 rounded-full text-white text-sm font-bold shadow-lg", badge.color)}>
                  {badge.label}
                </div>
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-bold shadow-lg ml-auto",
                  creation.status === 'live'
                    ? "bg-green-500 text-white"
                    : "bg-yellow-500 text-white"
                )}>
                  {creation.status === 'live' ? '● Live' : '○ Draft'}
                </div>
              </div>
              <h2 className="text-4xl font-black text-gray-900 leading-tight">
                {creation.title}
              </h2>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed text-base">
              {creation.description}
            </p>

            {/* Stats */}
            {creation.stats && (
              <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border border-indigo-100">
                {creation.stats.members !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-black text-gray-900">{creation.stats.members}</p>
                    <p className="text-xs text-gray-600 font-medium">Members</p>
                  </div>
                )}
                {creation.stats.rating && (
                  <div className="text-center">
                    <p className="text-2xl font-black text-gray-900 flex items-center justify-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                      {creation.stats.rating.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">Rating</p>
                  </div>
                )}
                {creation.stats.rewards !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-black text-gray-900">{creation.stats.rewards}</p>
                    <p className="text-xs text-gray-600 font-medium">Rewards Claimed</p>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {creation.tags && creation.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {creation.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom CTA Row */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <Button
                onClick={() => {
                  onView(creation);
                  onClose();
                }}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Public Page
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    onEdit(creation);
                    onClose();
                  }}
                  variant="outline"
                  className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-100 font-bold rounded-xl"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    onDelete(creation.id);
                    onClose();
                  }}
                  variant="outline"
                  className="flex-1 h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold rounded-xl"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};
