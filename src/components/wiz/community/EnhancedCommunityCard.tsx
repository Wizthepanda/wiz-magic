import React from "react";
import { motion } from "framer-motion";
import { Play, Users, Zap, DollarSign, Gift, Edit, Trash2, Eye, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnhancedCommunityCardProps {
  item: any;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isCreatorView?: boolean;
}

export const EnhancedCommunityCard: React.FC<EnhancedCommunityCardProps> = ({
  item,
  onView,
  onEdit,
  onDelete,
  isCreatorView = false
}) => {
  const bannerUrl = item.coverMedia?.[0]?.url ||
    item.coverMedia?.[0]?.thumbnail ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&auto=format';

  // Determine reward label and styling
  const getRewardLabel = () => {
    switch (item.rewardType) {
      case 'free':
        return {
          label: 'FREE',
          gradient: 'from-green-500 to-emerald-600',
          icon: <Gift className="w-3.5 h-3.5" />,
          glow: false
        };
      case 'free-zaps':
        return {
          label: `FREE +${item.zapReward} ⚡`,
          gradient: 'from-blue-500 to-cyan-500',
          icon: <Zap className="w-3.5 h-3.5 fill-current" />,
          glow: true
        };
      case 'paid':
        return {
          label: `$${item.usdCoPay}`,
          gradient: 'from-yellow-500 to-amber-600',
          icon: <DollarSign className="w-3.5 h-3.5" />,
          glow: false
        };
      case 'paid-zaps':
        return {
          label: `${item.zapRequired} ⚡`,
          gradient: 'from-purple-500 to-violet-600',
          icon: <Zap className="w-3.5 h-3.5 fill-current" />,
          glow: true
        };
      case 'zaps-usd':
        return {
          label: `${item.zapRequired} ⚡ + $${item.usdCoPay}`,
          gradient: 'from-purple-500 via-yellow-500 to-cyan-500',
          icon: (
            <div className="flex items-center gap-0.5">
              <Zap className="w-3 h-3 fill-current" />
              <DollarSign className="w-3 h-3" />
            </div>
          ),
          glow: true
        };
      default:
        return {
          label: 'FREE',
          gradient: 'from-gray-500 to-gray-600',
          icon: <Gift className="w-3.5 h-3.5" />,
          glow: false
        };
    }
  };

  const rewardLabel = getRewardLabel();

  return (
    <motion.article
      className="group relative bg-white/70 backdrop-blur-md rounded-xl2 overflow-hidden shadow-card transition-all duration-300 flex flex-col h-[380px]"
      whileHover={{
        y: -6,
        boxShadow: '0 0 0 6px rgba(108,94,248,0.06), 0 12px 40px rgba(11,14,24,0.08)'
      }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, ease: [0.2, 0.9, 0.17, 1] }}
    >

      {/* Banner Image */}
      <div className="relative h-44 overflow-hidden bg-slate-200">
        <img
          src={bannerUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&auto=format';
          }}
        />

        {/* Reward label */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-sm">
          {rewardLabel.label}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg line-clamp-2 text-slate-900 mb-2">
          {item.title}
        </h3>

        {/* Creator Info */}
        <div className="mt-2 flex items-center gap-2 text-sm">
          <img
            src={item.creator?.avatarUrl || '/Profile Pics/FERA.jpg'}
            alt={item.creator?.name}
            className="w-6 h-6 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/Profile Pics/FERA.jpg';
            }}
          />
          <span className="flex-1 truncate font-medium text-slate-700">{item.creator?.name || 'Unknown Creator'}</span>
          <span className="text-xs rounded-full px-2 py-0.5 bg-white/40 text-slate-600">
            {item.category || item.itemType}
          </span>
        </div>

        {/* Stats Row - Rating + Members */}
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{item.rating || '4.8'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{item.membersCount || 268} / {item.maxMembers || 2000}</span>
          </div>
          <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-50 to-blue-50">
            <Zap className="w-3 h-3 fill-zap text-zap" />
            <span className="font-semibold text-zap text-xs">
              {item.rewardType === 'free' || item.rewardType === 'free-zaps' ? 'Free' : 'Paid'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Progress</span>
            <span className="font-medium">{Math.round(((item.membersCount || 268) / (item.maxMembers || 2000)) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(((item.membersCount || 268) / (item.maxMembers || 2000)) * 100)}%` }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="mt-auto pt-3 flex items-center gap-3">
          <button
            onClick={onView}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-tr from-purple-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current" />
            {item.rewardType === 'free' || item.rewardType === 'free-zaps' ? 'Join' : 'Claim Now'}
          </button>
          {(item.zapRequired || item.usdCoPay) && (
            <div className="text-xs bg-white/40 px-3 py-1.5 rounded-full text-slate-800 font-bold flex items-center gap-1 backdrop-blur-sm">
              <Zap className="w-3 h-3 fill-current text-zap" />
              {item.zapRequired || 0}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default EnhancedCommunityCard;
