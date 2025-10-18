import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  BookOpen,
  User,
  Package,
  Youtube,
  Sparkles,
  ArrowRight,
  Plus,
  Zap,
  Video,
  Play,
  CheckCircle2,
  Edit,
  Eye,
  Trash2,
  BarChart3,
  Grid3x3,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { PublishedCreationsManager } from './PublishedCreationsManager';
import { ConnectYouTubeButton } from './ConnectYouTubeButton';
import CreateCommunityPage from './CreateCommunityPage';

type FilterType = 'creation' | 'youtube' | 'published';
type CreationType = 'community' | 'course' | 'coaching' | 'product';

// Filter navigation data
const filters = [
  { id: 'creation', label: 'Creation Hub', icon: Sparkles },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'published', label: 'Published', icon: CheckCircle2 }
];

// Creation types for Filter 1
const creationTypes = [
  {
    id: 'community',
    title: 'Community',
    subtitle: 'Gather your learners, fans, or followers',
    description: 'Create exclusive communities where members connect, learn, and grow together.',
    icon: Users,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    isPrimary: true
  },
  {
    id: 'course',
    title: 'Course',
    subtitle: 'Build courses that teach and inspire',
    description: 'Design structured learning experiences with modules, lessons, and rewards.',
    icon: BookOpen,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50'
  },
  {
    id: 'coaching',
    title: 'Coaching',
    subtitle: 'Host live or recorded sessions',
    description: 'Offer personalized 1-on-1 guidance directly with your audience.',
    icon: User,
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50'
  },
  {
    id: 'product',
    title: 'Digital Product',
    subtitle: 'Sell e-books, templates, or assets',
    description: 'Monetize your creative work with direct payments or ZAPs.',
    icon: Package,
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'from-orange-50 to-amber-50'
  }
];

// Sub-filters for Published section
const publishedFilters = [
  { id: 'all', label: 'All', icon: null },
  { id: 'communities', label: 'Communities', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'coaching', label: 'Coaching', icon: User },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'youtube', label: 'YouTube', icon: Youtube }
];

export const WizCreatePageV3 = () => {
  console.log('🎨 🎨 🎨 WizCreatePageV3 LOADED - FILTER BUBBLE DESIGN 🎨 🎨 🎨');
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const [activeFilter, setActiveFilter] = useState<FilterType>('creation');
  const [activePublishedFilter, setActivePublishedFilter] = useState('all');
  const [showCommunityCreate, setShowCommunityCreate] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 }
    }
  };

  const handleCreateClick = (type: CreationType) => {
    if (type === 'community') {
      setShowCommunityCreate(true);
    } else {
      // TODO: Handle other creation types
      console.log(`Creating ${type}...`);
    }
  };

  if (showCommunityCreate) {
    return (
      <CreateCommunityPage
        onBack={() => setShowCommunityCreate(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Sticky Filter Navigation */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Main Header */}
          <div className="mb-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Creator Dashboard
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Your complete creation toolkit — powered by ZAPs
            </p>
          </div>

          {/* Filter Bubbles */}
          <div className={cn(
            "flex gap-3",
            isMobile ? "overflow-x-auto scrollbar-hide pb-2" : ""
          )}>
            {filters.map((filter) => (
              <FilterBubble
                key={filter.id}
                filter={filter}
                isActive={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id as FilterType)}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeFilter === 'creation' && (
            <motion.div
              key="creation"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <CreationHubSection
                creationTypes={creationTypes}
                onCreateClick={handleCreateClick}
                isMobile={isMobile}
              />
            </motion.div>
          )}

          {activeFilter === 'youtube' && (
            <motion.div
              key="youtube"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <YouTubeIntegrationSection isMobile={isMobile} />
            </motion.div>
          )}

          {activeFilter === 'published' && (
            <motion.div
              key="published"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <PublishedSection
                activeSubFilter={activePublishedFilter}
                onSubFilterChange={setActivePublishedFilter}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Floating Create Button */}
      {isMobile && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <Button
            onClick={() => setActiveFilter('creation')}
            className={cn(
              "w-14 h-14 rounded-full shadow-2xl",
              "bg-gradient-to-r from-purple-600 to-pink-600",
              "hover:from-purple-700 hover:to-pink-700",
              "hover:scale-110 transition-transform"
            )}
          >
            <Plus className="w-6 h-6 text-white" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

// ========================================
// FILTER BUBBLE COMPONENT
// ========================================
interface FilterBubbleProps {
  filter: typeof filters[0];
  isActive: boolean;
  onClick: () => void;
}

const FilterBubble = ({ filter, isActive, onClick }: FilterBubbleProps) => {
  const Icon = filter.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "relative px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300",
        "flex items-center gap-2 whitespace-nowrap",
        isActive
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_30px_rgba(168,85,247,0.5)]"
          : "bg-white/60 text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeFilterGlow"
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-xl opacity-50"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <Icon className={cn("w-4 h-4 relative z-10", isActive && "animate-pulse")} />
      <span className="relative z-10">{filter.label}</span>
    </motion.button>
  );
};

// ========================================
// FILTER 1: CREATION HUB SECTION
// ========================================
interface CreationHubSectionProps {
  creationTypes: typeof creationTypes;
  onCreateClick: (type: CreationType) => void;
  isMobile: boolean;
}

const CreationHubSection = ({ creationTypes, onCreateClick, isMobile }: CreationHubSectionProps) => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What do you want to create today?</h2>
        <p className="text-gray-600">Choose a creation type to get started</p>
      </div>

      {/* 2x2 Grid or Stacked Cards */}
      <div className={cn(
        "grid gap-6",
        isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
      )}>
        {creationTypes.map((type, index) => (
          <CreationTypeCard
            key={type.id}
            type={type}
            onClick={() => onCreateClick(type.id as CreationType)}
            delay={index * 0.1}
          />
        ))}
      </div>
    </div>
  );
};

interface CreationTypeCardProps {
  type: typeof creationTypes[0];
  onClick: () => void;
  delay: number;
}

const CreationTypeCard = ({ type, onClick, delay }: CreationTypeCardProps) => {
  const Icon = type.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-3xl overflow-hidden",
        "bg-gradient-to-br bg-white/70 backdrop-blur-xl",
        "border-2 border-transparent hover:border-purple-300",
        "shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_40px_rgba(168,85,247,0.2)]",
        "transition-all duration-300",
        type.isPrimary && "ring-2 ring-purple-400/50"
      )}
    >
      {/* Background Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        `bg-gradient-to-br ${type.bgGradient}`
      )} />

      {/* Primary Badge */}
      {type.isPrimary && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className={cn(
            "bg-gradient-to-r text-white border-0 px-3 py-1",
            "shadow-lg animate-shimmer",
            type.gradient
          )}>
            <Sparkles className="w-3 h-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      {/* Floating Particles (optional) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute w-2 h-2 rounded-full",
              `bg-gradient-to-r ${type.gradient}`,
              "opacity-0 group-hover:opacity-30"
            )}
            animate={{
              y: [0, -100],
              x: [0, Math.random() * 50 - 25],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5
            }}
            style={{
              left: `${20 + i * 30}%`,
              bottom: 0
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative p-8 space-y-4">
        {/* Icon */}
        <div className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center",
          "bg-gradient-to-br shadow-lg",
          "transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300",
          type.gradient
        )}>
          <Icon className="w-8 h-8 text-white" />
        </div>

        {/* Text */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
            {type.title}
          </h3>
          <p className="text-sm text-gray-600 mb-1 font-medium">{type.subtitle}</p>
          <p className="text-sm text-gray-500">{type.description}</p>
        </div>

        {/* CTA Button */}
        <Button
          className={cn(
            "w-full mt-4 group-hover:bg-gradient-to-r group-hover:text-white",
            "transition-all duration-300 font-semibold",
            `group-hover:${type.gradient}`,
            "group-hover:shadow-lg"
          )}
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create {type.title}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </motion.div>
  );
};

// ========================================
// FILTER 2: YOUTUBE INTEGRATION SECTION
// ========================================
interface YouTubeIntegrationSectionProps {
  isMobile: boolean;
}

const YouTubeIntegrationSection = ({ isMobile }: YouTubeIntegrationSectionProps) => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 p-12 text-center"
      >
        {/* Animated Background Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Content */}
        <div className="relative z-10 space-y-6">
          {/* Animated YouTube Logo */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-pink-500 items-center justify-center shadow-2xl"
          >
            <Youtube className="w-12 h-12 text-white" />
          </motion.div>

          <div>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3">
              Connect Your YouTube Channel
            </h2>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-2">
              One click to connect. We'll auto-fetch your videos for easy publishing.
            </p>
            <p className="text-gray-500 text-sm">
              No re-auth required after first setup.
            </p>
          </div>

          {/* Connect Button */}
          <div className="flex justify-center">
            <ConnectYouTubeButton />
          </div>
        </div>
      </motion.div>

      {/* Instructions/Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Play,
            title: 'Auto-Fetch Videos',
            description: 'We automatically import your latest YouTube content'
          },
          {
            icon: Zap,
            title: 'One-Click Publish',
            description: 'Publish videos to WIZUP instantly with ZAP rewards'
          },
          {
            icon: Video,
            title: 'Stay Synced',
            description: 'Keep your content updated across both platforms'
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.3 }}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ========================================
// FILTER 3: PUBLISHED SECTION (REDESIGNED)
// ========================================
interface PublishedSectionProps {
  activeSubFilter: string;
  onSubFilterChange: (filter: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const PublishedSection = ({
  activeSubFilter,
  onSubFilterChange,
  viewMode,
  onViewModeChange
}: PublishedSectionProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'zaps'>('date');
  const isMobile = useIsMobile();

  return (
    <div className="space-y-8">
      {/* Header Section - Glassmorphic */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-xl bg-white/60 rounded-3xl p-8 border border-white/40 shadow-[0_0_20px_-5px_rgba(0,0,0,0.1)]"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Published Creations
            </h2>
            <p className="text-sm text-gray-600">
              Everything you've launched lives here — organized, elegant, and ready to manage.
            </p>
          </div>

          {/* Action Buttons */}
          {!isMobile && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Manage All
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>
          )}
        </div>

        {/* Gradient divider */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-purple-300/50 to-transparent" />
      </motion.div>

      {/* Filter & Sort Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search your creations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full px-5 py-3 pl-12 rounded-2xl",
              "bg-white/60 backdrop-blur-sm border border-gray-200",
              "focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent",
              "transition-all duration-300",
              "text-gray-900 placeholder:text-gray-500"
            )}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filter Pills + Sort */}
        <div className="flex items-center justify-between gap-4">
          {/* Sub-Filter Bubbles */}
          <div className={cn(
            "flex gap-2",
            isMobile ? "overflow-x-auto scrollbar-hide pb-2 flex-1" : "flex-wrap"
          )}>
            {publishedFilters.map((filter) => (
              <motion.button
                key={filter.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSubFilterChange(filter.id)}
                className={cn(
                  "px-4 py-2 rounded-full font-medium text-xs transition-all duration-300 whitespace-nowrap",
                  "flex items-center gap-1.5",
                  activeSubFilter === filter.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    : "bg-white/60 text-gray-700 border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                )}
              >
                {filter.icon && <filter.icon className="w-3.5 h-3.5" />}
                {filter.label}
              </motion.button>
            ))}
          </div>

          {/* Sort Dropdown */}
          {!isMobile && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={cn(
                "px-4 py-2 rounded-xl",
                "bg-white/60 backdrop-blur-sm border border-gray-200",
                "focus:outline-none focus:ring-2 focus:ring-purple-400/50",
                "text-sm text-gray-700 cursor-pointer"
              )}
            >
              <option value="date">Sort by: Date</option>
              <option value="views">Sort by: Views</option>
              <option value="zaps">Sort by: ZAPs</option>
            </select>
          )}
        </div>
      </div>

      {/* Creation Grid */}
      <PublishedCreationsGrid
        searchQuery={searchQuery}
        activeFilter={activeSubFilter}
        sortBy={sortBy}
        viewMode={viewMode}
      />
    </div>
  );
};

// ========================================
// PUBLISHED CREATIONS GRID
// ========================================
interface PublishedCreationsGridProps {
  searchQuery: string;
  activeFilter: string;
  sortBy: 'date' | 'views' | 'zaps';
  viewMode: 'grid' | 'list';
}

const PublishedCreationsGrid = ({
  searchQuery,
  activeFilter,
  sortBy,
  viewMode
}: PublishedCreationsGridProps) => {
  const isMobile = useIsMobile();

  // Mock data - replace with real data from your backend
  const mockCreations = [
    {
      id: '1',
      type: 'community',
      title: 'Cyberpunk Wolf Forge',
      thumbnail: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400',
      description: 'A creative community for cyberpunk enthusiasts',
      views: 1234,
      comments: 45,
      zaps: 567,
      lastUpdated: '2 days ago',
      publishedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      type: 'course',
      title: 'React Mastery Course',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
      description: 'Learn React from scratch to advanced',
      views: 5678,
      comments: 123,
      zaps: 890,
      lastUpdated: '5 hours ago',
      publishedAt: new Date('2024-01-10')
    },
    {
      id: '3',
      type: 'youtube',
      title: 'How to Build SaaS Apps',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
      description: 'Complete guide to building SaaS applications',
      views: 12345,
      comments: 234,
      zaps: 1234,
      lastUpdated: '1 week ago',
      publishedAt: new Date('2024-01-05')
    }
  ];

  // Filter and sort logic
  const filteredCreations = mockCreations.filter(creation => {
    const matchesSearch = creation.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' ||
      (activeFilter === 'communities' && creation.type === 'community') ||
      (activeFilter === 'courses' && creation.type === 'course') ||
      (activeFilter === 'youtube' && creation.type === 'youtube');
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'zaps') return b.zaps - a.zaps;
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });

  // Empty state
  if (filteredCreations.length === 0) {
    return <EmptyState />;
  }

  return (
    <motion.div
      layout
      className={cn(
        "grid gap-6",
        viewMode === 'grid'
          ? isMobile
            ? "grid-cols-1"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1"
      )}
    >
      {filteredCreations.map((creation, index) => (
        <CreationCard
          key={creation.id}
          creation={creation}
          delay={index * 0.05}
          viewMode={viewMode}
        />
      ))}
    </motion.div>
  );
};

// ========================================
// CREATION CARD COMPONENT
// ========================================
interface CreationCardProps {
  creation: any;
  delay: number;
  viewMode: 'grid' | 'list';
}

const CreationCard = ({ creation, delay, viewMode }: CreationCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = {
    community: { icon: Users, gradient: 'from-purple-500 to-pink-500', label: 'Community' },
    course: { icon: BookOpen, gradient: 'from-blue-500 to-cyan-500', label: 'Course' },
    coaching: { icon: User, gradient: 'from-emerald-500 to-teal-500', label: 'Coaching' },
    product: { icon: Package, gradient: 'from-orange-500 to-amber-500', label: 'Product' },
    youtube: { icon: Youtube, gradient: 'from-red-500 to-pink-500', label: 'YouTube' }
  };

  const config = typeConfig[creation.type as keyof typeof typeConfig];
  const TypeIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300 }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "group relative cursor-pointer rounded-2xl overflow-hidden",
        "bg-white/70 backdrop-blur-sm",
        "border border-gray-200/50 hover:border-purple-300/50",
        "shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)]",
        "transition-all duration-300"
      )}
    >
      {/* Hover Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
        `bg-gradient-to-br ${config.gradient}`,
        "pointer-events-none"
      )} />

      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={creation.thumbnail}
          alt={creation.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={cn(
            "bg-gradient-to-r text-white border-0 px-3 py-1 text-xs font-semibold",
            "shadow-lg",
            config.gradient
          )}>
            <TypeIcon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {/* Hover Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-3 right-3 flex gap-2"
            >
              <button className="p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors">
                <Edit className="w-4 h-4 text-gray-700" />
              </button>
              <button className="p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors">
                <BarChart3 className="w-4 h-4 text-gray-700" />
              </button>
              <button className="p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-colors">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        {/* Title */}
        <h3 className="font-medium text-base md:text-lg text-gray-900 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
          {creation.title}
        </h3>

        {/* Mini Stats Row */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{creation.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{creation.comments}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{creation.zaps}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{creation.lastUpdated}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ========================================
// EMPTY STATE COMPONENT
// ========================================
const EmptyState = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full flex items-center justify-center py-20"
    >
      <div className="relative text-center max-w-md">
        {/* Gradient Glow Ring */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl" />

        {/* Content Card */}
        <div className="relative backdrop-blur-xl bg-white/60 rounded-3xl p-12 border border-white/40 shadow-[0_0_20px_-5px_rgba(0,0,0,0.1)]">
          {/* Gradient Orb Illustration */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-80 blur-sm"
          />

          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            You haven't published anything yet ✨
          </h3>
          <p className="text-gray-600 mb-6">
            Start by creating your first course, community, or video.
          </p>

          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default WizCreatePageV3;
