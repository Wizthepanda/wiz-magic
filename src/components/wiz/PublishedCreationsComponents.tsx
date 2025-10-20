import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  BarChart3,
  TrendingUp,
  Clock,
  CheckSquare,
  Square,
  MessageCircle,
  Youtube,
  Calendar,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Type interface (shared with main component)
export interface PublishedCreation {
  id: string;
  title: string;
  description: string;
  type: 'community' | 'course' | 'coaching' | 'product' | 'youtube';
  thumbnail: string;
  zapsRequired: number;
  usdCoPay?: number;
  monetizationType: 'zaps-only' | 'zaps-usd' | 'free';
  status: 'live' | 'draft';
  creatorName: string;
  creatorAvatar: string;
  stats?: {
    views?: number;
    members?: number;
    sales?: number;
    comments?: number;
    zapsClaimed?: number;
    rating?: number;
  };
  tags?: string[];
  createdAt: any;
  updatedAt?: any;
}

// Enhanced Creation Card Component
export const CreationCardV2: React.FC<{
  creation: PublishedCreation;
  index: number;
  bulkEditMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
  onView: (creation: PublishedCreation) => void;
  onEdit: (creation: PublishedCreation) => void;
  onDelete: (id: string) => void;
  onAnalytics: () => void;
  onPreview: () => void;
}> = ({ creation, index, bulkEditMode, isSelected, onToggleSelect, onView, onEdit, onDelete, onAnalytics, onPreview }) => {
  const [isHovered, setIsHovered] = useState(false);

  const typeConfig = {
    community: { icon: Users, color: 'from-blue-500 to-cyan-500', label: 'Community' },
    course: { icon: GraduationCap, color: 'from-purple-500 to-pink-500', label: 'Course' },
    coaching: { icon: MessageSquare, color: 'from-green-500 to-emerald-500', label: 'Coaching' },
    product: { icon: Package, color: 'from-orange-500 to-red-500', label: 'Product' },
    youtube: { icon: Youtube, color: 'from-red-500 to-pink-500', label: 'YouTube' }
  };

  const monetizationBadge = {
    'zaps-only': { label: '⚡ ZAPs', color: 'bg-gradient-to-r from-indigo-500 to-violet-600' },
    'zaps-usd': { label: '⚡+💵', color: 'bg-gradient-to-r from-blue-500 to-green-500' },
    'free': { label: 'Free', color: 'bg-gradient-to-r from-green-500 to-emerald-500' }
  };

  const config = typeConfig[creation.type];
  const TypeIcon = config.icon;
  const badge = monetizationBadge[creation.monetizationType];

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={bulkEditMode ? onToggleSelect : onPreview}
      className="group relative cursor-pointer"
    >
      {/* Bulk Edit Checkbox */}
      <AnimatePresence>
        {bulkEditMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-3 left-3 z-20"
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all",
                isSelected
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg"
                  : "bg-white/90 backdrop-blur-xl border-2 border-gray-300"
              )}
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-white" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="relative h-[480px] rounded-3xl overflow-hidden backdrop-blur-3xl border shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,248,252,0.98) 100%)',
          borderColor: isHovered ? 'rgba(155, 93, 229, 0.4)' : 'rgba(255, 255, 255, 0.6)',
          boxShadow: isHovered
            ? '0 30px 70px rgba(0, 0, 0, 0.15), 0 0 50px rgba(155, 93, 229, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
            : '0 10px 30px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        }}
        whileHover={{
          scale: 1.02,
          y: -10,
          transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Thumbnail with Parallax Effect */}
        <motion.div
          className="relative h-56 overflow-hidden bg-gray-100"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <img
            src={creation.thumbnail}
            alt={creation.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Monetization Badge */}
          <motion.div
            className="absolute top-4 left-4"
            whileHover={{ scale: 1.1 }}
          >
            <div className={cn("px-4 py-2 rounded-full text-white text-xs font-bold shadow-lg", badge.color)}>
              {badge.label}
            </div>
          </motion.div>

          {/* Type Badge */}
          <motion.div
            className="absolute top-4 right-4"
            whileHover={{ scale: 1.1 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl border border-white/40 bg-white/90 shadow-lg">
              <TypeIcon className="w-4 h-4 text-gray-700" />
              <span className="text-xs font-semibold text-gray-700">{config.label}</span>
            </div>
          </motion.div>

          {/* Status Badge */}
          <div className="absolute bottom-4 right-4">
            <div className={cn(
              "px-4 py-2 rounded-full text-xs font-bold shadow-lg backdrop-blur-xl",
              creation.status === 'live'
                ? "bg-green-500/90 text-white"
                : "bg-yellow-500/90 text-white"
            )}>
              {creation.status === 'live' ? '● Live' : '○ Draft'}
            </div>
          </div>

          {/* Last Updated */}
          <div className="absolute bottom-4 left-4">
            <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white text-xs font-medium flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {formatDate(creation.updatedAt || creation.createdAt)}
            </div>
          </div>
        </motion.div>

        {/* Content Section */}
        <div className="p-6 flex flex-col justify-between h-[calc(100%-14rem)]">
          <div>
            {/* Title */}
            <h3 className="text-xl font-extrabold text-gray-900 mb-2 line-clamp-2 leading-tight">
              {creation.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
              {creation.description || 'No description available'}
            </p>

            {/* Stats Row */}
            {creation.stats && (
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 flex-wrap">
                {creation.stats.views !== undefined && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-gray-700">{creation.stats.views}</span>
                  </span>
                )}
                {creation.stats.members !== undefined && creation.stats.members > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold text-gray-700">{creation.stats.members}</span>
                  </span>
                )}
                {creation.stats.comments !== undefined && (
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-gray-700">{creation.stats.comments}</span>
                  </span>
                )}
                {creation.stats.rating && (
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                    <span className="font-semibold text-gray-700">{creation.stats.rating.toFixed(1)}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="space-y-3">
            {/* Cost Display */}
            {(creation.zapsRequired > 0 || creation.usdCoPay) && (
              <div className="flex items-center gap-2">
                {creation.zapsRequired > 0 && (
                  <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 shadow-md">
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-4 h-4" fill="currentColor" />
                      {creation.zapsRequired}
                    </span>
                  </div>
                )}
                {creation.usdCoPay && (
                  <div className="px-4 py-2 rounded-xl bg-green-50 border border-green-200">
                    <span className="text-sm font-bold text-green-700">
                      +${creation.usdCoPay}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons - Show on Hover */}
            <AnimatePresence>
              {isHovered && !bulkEditMode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-2"
                >
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(creation);
                      }}
                      className="h-10 bg-white/90 hover:bg-white border border-gray-200 text-gray-700 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAnalytics();
                      }}
                      className="h-10 bg-white/90 hover:bg-white border border-gray-200 text-gray-700 shadow-sm"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(creation.id);
                      }}
                      className="h-10 bg-white/90 hover:bg-red-50 border border-red-200 text-red-600 shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(creation);
                    }}
                    className="w-full h-10 bg-gradient-to-r from-[#9b5de5] to-[#f15bb5] hover:shadow-lg text-white shadow-md"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Live
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#9b5de5]/10 to-[#f15bb5]/10 pointer-events-none"
              style={{ mixBlendMode: 'multiply' }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Ripple Effect on Click */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        initial={{ scale: 0, opacity: 0.5 }}
        whileTap={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'radial-gradient(circle, rgba(155, 93, 229, 0.3) 0%, transparent 70%)',
        }}
      />
    </motion.article>
  );
};

// Analytics Modal Component
export const AnalyticsModal: React.FC<{
  creation: PublishedCreation;
  onClose: () => void;
}> = ({ creation, onClose }) => {
  const stats = creation.stats || {};

  const analyticsData = [
    { label: 'Views', value: stats.views || 0, icon: Eye, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { label: 'Members', value: stats.members || 0, icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { label: 'Comments', value: stats.comments || 0, icon: MessageCircle, color: 'text-green-500', bgColor: 'bg-green-50' },
    { label: 'ZAPs Claimed', value: stats.zapsClaimed || 0, icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-2xl z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl overflow-hidden border border-white/60 max-w-2xl w-full"
        >
          {/* Header */}
          <div className="relative p-8 bg-gradient-to-r from-[#9b5de5] to-[#f15bb5] text-white">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold mb-1">{creation.title}</h2>
                <p className="text-white/80">Performance Analytics</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="p-8">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {analyticsData.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn("p-6 rounded-2xl border", stat.bgColor)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon className={cn("w-6 h-6", stat.color)} />
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900 mb-1">{stat.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Engagement Score */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Engagement Score</span>
                <Activity className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="relative h-3 bg-white rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">Above average performance</p>
            </div>

            {/* Close Button */}
            <Button
              onClick={onClose}
              className="w-full mt-6 h-12 bg-gradient-to-r from-[#9b5de5] to-[#f15bb5] hover:shadow-lg rounded-xl"
            >
              Close Analytics
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

// Enhanced Preview Modal Component
export const PreviewModalV2: React.FC<{
  creation: PublishedCreation;
  onClose: () => void;
  onView: (creation: PublishedCreation) => void;
  onEdit: (creation: PublishedCreation) => void;
  onDelete: (id: string) => void;
  onAnalytics: () => void;
}> = ({ creation, onClose, onView, onEdit, onDelete, onAnalytics }) => {
  const typeConfig = {
    community: { icon: Users },
    course: { icon: GraduationCap },
    coaching: { icon: MessageSquare },
    product: { icon: Package },
    youtube: { icon: Youtube }
  };

  const TypeIcon = typeConfig[creation.type].icon;

  const monetizationBadge = {
    'zaps-only': { label: '⚡ ZAPs Only', color: 'bg-gradient-to-r from-indigo-500 to-violet-600' },
    'zaps-usd': { label: '⚡ ZAPs + 💵 USD', color: 'bg-gradient-to-r from-blue-500 to-green-500' },
    'free': { label: 'Free Access', color: 'bg-gradient-to-r from-green-500 to-emerald-500' }
  };

  const badge = monetizationBadge[creation.monetizationType];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-3xl z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative bg-white/90 backdrop-blur-3xl rounded-3xl shadow-2xl overflow-hidden border border-white/60 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/90 hover:bg-white backdrop-blur-xl flex items-center justify-center transition-all shadow-lg group"
          >
            <X className="w-6 h-6 text-gray-700 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Banner Image */}
          <div className="relative h-80 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            <img
              src={creation.thumbnail}
              alt={creation.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Creator Info */}
            <div className="flex items-center space-x-4 p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-gray-200 shadow-sm">
              <Avatar className="w-16 h-16 border-2 border-white shadow-md">
                <AvatarImage src={creation.creatorAvatar} />
                <AvatarFallback>{creation.creatorName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-xl">{creation.creatorName}</span>
                  <BadgeCheck className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm text-gray-500">Creator</span>
              </div>
            </div>

            {/* Title & Badges */}
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200">
                  <TypeIcon className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-semibold text-gray-700 capitalize">{creation.type}</span>
                </div>
                <div className={cn("px-4 py-2 rounded-full text-white text-sm font-bold shadow-lg", badge.color)}>
                  {badge.label}
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold shadow-lg ml-auto",
                  creation.status === 'live'
                    ? "bg-green-500 text-white"
                    : "bg-yellow-500 text-white"
                )}>
                  {creation.status === 'live' ? '● Live' : '○ Draft'}
                </div>
              </div>
              <h2 className="text-4xl font-black text-gray-900 leading-tight mb-3">
                {creation.title}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {creation.description || 'No description available'}
              </p>
            </div>

            {/* Stats Grid */}
            {creation.stats && (
              <div className="grid grid-cols-4 gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50 border border-indigo-100">
                {creation.stats.views !== undefined && (
                  <div className="text-center">
                    <p className="text-3xl font-black text-gray-900">{creation.stats.views}</p>
                    <p className="text-xs text-gray-600 font-medium">Views</p>
                  </div>
                )}
                {creation.stats.members !== undefined && (
                  <div className="text-center">
                    <p className="text-3xl font-black text-gray-900">{creation.stats.members}</p>
                    <p className="text-xs text-gray-600 font-medium">Members</p>
                  </div>
                )}
                {creation.stats.comments !== undefined && (
                  <div className="text-center">
                    <p className="text-3xl font-black text-gray-900">{creation.stats.comments}</p>
                    <p className="text-xs text-gray-600 font-medium">Comments</p>
                  </div>
                )}
                {creation.stats.rating && (
                  <div className="text-center">
                    <p className="text-3xl font-black text-gray-900 flex items-center justify-center gap-1">
                      <Star className="w-6 h-6 text-yellow-500" fill="currentColor" />
                      {creation.stats.rating.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-600 font-medium">Rating</p>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {creation.tags && creation.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {creation.tags.map((tag, i) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <Button
                onClick={() => {
                  onView(creation);
                  onClose();
                }}
                className="w-full h-14 bg-gradient-to-r from-[#9b5de5] to-[#f15bb5] hover:shadow-lg text-white font-bold text-lg rounded-2xl"
              >
                <Eye className="w-5 h-5 mr-2" />
                View Live Page
              </Button>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => {
                    onEdit(creation);
                    onClose();
                  }}
                  variant="outline"
                  className="h-12 border-2 border-gray-300 hover:bg-gray-100 font-bold rounded-xl"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => {
                    onAnalytics();
                  }}
                  variant="outline"
                  className="h-12 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-bold rounded-xl"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                <Button
                  onClick={() => {
                    onDelete(creation.id);
                    onClose();
                  }}
                  variant="outline"
                  className="h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-bold rounded-xl"
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
