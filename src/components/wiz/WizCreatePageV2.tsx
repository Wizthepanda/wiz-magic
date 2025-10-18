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
  Edit,
  Eye,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { PublishedCreationsManager } from './PublishedCreationsManager';
import { ConnectYouTubeButton } from './ConnectYouTubeButton';
import CreateCommunityPage from './CreateCommunityPage';

type CreationType = 'community' | 'course' | 'coaching' | 'product' | null;

// Creation type cards data
const creationTypes = [
  {
    id: 'community',
    title: 'Community',
    subtitle: 'Launch private hubs',
    icon: Users,
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    description: 'Create exclusive communities'
  },
  {
    id: 'course',
    title: 'Course',
    subtitle: 'Build learning paths',
    icon: BookOpen,
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]',
    description: 'Design educational experiences'
  },
  {
    id: 'coaching',
    title: 'Coaching',
    subtitle: '1-on-1 sessions',
    icon: User,
    gradient: 'from-emerald-500 to-teal-500',
    bgGradient: 'from-emerald-50 to-teal-50',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]',
    description: 'Offer personalized guidance'
  },
  {
    id: 'product',
    title: 'Digital Product',
    subtitle: 'Sell downloads',
    icon: Package,
    gradient: 'from-orange-500 to-amber-500',
    bgGradient: 'from-orange-50 to-amber-50',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]',
    description: 'Monetize digital assets'
  }
];

// Filter options for Published Hub
const filterOptions = [
  { id: 'all', label: 'All', icon: null },
  { id: 'communities', label: 'Communities', icon: Users },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'coaching', label: 'Coaching', icon: User },
  { id: 'products', label: 'Products', icon: Package }
];

const WizCreatePageV2 = () => {
  console.log('🎨 🎨 🎨 WizCreatePageV2 LOADED - NEW DESIGN 🎨 🎨 🎨');
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [selectedCreationType, setSelectedCreationType] = useState<CreationType>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCommunityCreate, setShowCommunityCreate] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  const handleCreateClick = (type: string) => {
    if (type === 'community') {
      setShowCommunityCreate(true);
    } else {
      setSelectedCreationType(type as CreationType);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Sticky Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Create Anything on WIZ ✨
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Communities, Courses, Coaching, and Digital Products — all powered by ZAPs
              </p>
            </div>

            {/* Compact progress indicator - shown when creating */}
            {selectedCreationType && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="hidden md:flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full"
              >
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-sm font-medium text-purple-700">Creating...</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* ========================================
            CREATION HUB (Top Section)
        ======================================== */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-16"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Creation Hub</h2>
            <p className="text-gray-600">Choose what you want to create</p>
          </motion.div>

          {/* 2x2 Grid for Desktop, Horizontal Scroll for Mobile */}
          <motion.div
            variants={itemVariants}
            className={cn(
              "grid gap-6 mb-12",
              isMobile
                ? "grid-cols-1 overflow-x-auto pb-4"
                : "grid-cols-2 md:grid-cols-4"
            )}
          >
            {creationTypes.map((type) => (
              <CreationCard
                key={type.id}
                type={type}
                onClick={() => handleCreateClick(type.id)}
                isMobile={isMobile}
              />
            ))}
          </motion.div>

          {/* Divider */}
          <div className="relative mb-12">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
            </div>
          </div>

          {/* YouTube Connect Callout */}
          <YouTubeConnectCallout variants={itemVariants} />
        </motion.section>

        {/* ========================================
            PUBLISHED HUB (Bottom Section)
        ======================================== */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-20"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Your Published Creations</h2>
              <p className="text-sm text-gray-600">Manage all your published content</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {filterOptions.map((filter) => (
              <FilterPill
                key={filter.id}
                filter={filter}
                isActive={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
              />
            ))}
          </div>

          {/* Published Creations Grid */}
          <PublishedCreationsManager />
        </motion.section>
      </div>
    </div>
  );
};

// ========================================
// CREATION CARD COMPONENT
// ========================================
interface CreationCardProps {
  type: typeof creationTypes[0];
  onClick: () => void;
  isMobile: boolean;
}

const CreationCard = ({ type, onClick, isMobile }: CreationCardProps) => {
  const Icon = type.icon;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      {/* Neumorphic Glass Card */}
      <Card className={cn(
        "relative overflow-hidden border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)]",
        "bg-gradient-to-br bg-white/70 backdrop-blur-xl",
        "rounded-2xl transition-all duration-300",
        type.hoverGlow
      )}>
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          `bg-gradient-to-br ${type.bgGradient}`
        )} />

        {/* New Badge with Shimmer */}
        <div className="absolute top-4 right-4 z-10">
          <Badge
            className={cn(
              "bg-gradient-to-r text-white border-0 px-3 py-1 text-xs font-semibold",
              "shadow-lg animate-shimmer",
              type.gradient
            )}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            New
          </Badge>
        </div>

        {/* Content */}
        <div className="relative p-6 space-y-4">
          {/* Icon Circle */}
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center",
            "bg-gradient-to-br shadow-lg transform group-hover:scale-110 transition-transform duration-300",
            type.gradient
          )}>
            <Icon className="w-7 h-7 text-white" />
          </div>

          {/* Text */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
              {type.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">{type.subtitle}</p>
          </div>

          {/* Action Button */}
          <Button
            variant="ghost"
            className={cn(
              "w-full group-hover:bg-gradient-to-r group-hover:text-white",
              "transition-all duration-300",
              `group-hover:${type.gradient}`
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

// ========================================
// YOUTUBE CONNECT CALLOUT
// ========================================
const YouTubeConnectCallout = ({ variants }: { variants: any }) => {
  return (
    <motion.div variants={variants}>
      <Card className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-gradient-to-r from-red-50 to-pink-50">
          {/* Left Side */}
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Connect Your YouTube Channel</h3>
              <p className="text-sm text-gray-600">Import videos and publish to WIZ instantly</p>
            </div>
          </div>

          {/* Right Side - Connect Button */}
          <ConnectYouTubeButton />
        </div>
      </Card>
    </motion.div>
  );
};

// ========================================
// FILTER PILL COMPONENT
// ========================================
interface FilterPillProps {
  filter: typeof filterOptions[0];
  isActive: boolean;
  onClick: () => void;
}

const FilterPill = ({ filter, isActive, onClick }: FilterPillProps) => {
  const Icon = filter.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300 whitespace-nowrap",
        "flex items-center gap-2 border-2",
        isActive
          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          : "bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {filter.label}
    </motion.button>
  );
};

export { WizCreatePageV2 };
export default WizCreatePageV2;
