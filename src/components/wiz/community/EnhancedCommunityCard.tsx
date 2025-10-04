import React from "react";
import { motion } from "framer-motion";
import { Play, Users, Zap, DollarSign, Gift, Edit, Trash2, Eye } from "lucide-react";
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
    <motion.div
      className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
    >
      {/* Light bloom effect on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-cyan-500/0 to-purple-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
        initial={false}
      />

      {/* Banner Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-900/20 to-cyan-900/20">
        <img
          src={bannerUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&auto=format';
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl">
            <Play className="w-8 h-8 text-gray-800 ml-1" />
          </div>
        </div>

        {/* Category tag */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-semibold">
          {item.category || item.itemType}
        </div>

        {/* Reward label */}
        <div className="absolute top-3 right-3">
          <motion.div
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg",
              `bg-gradient-to-r ${rewardLabel.gradient}`
            )}
            whileHover={{ scale: 1.05 }}
          >
            {/* Glow effect for ZAP rewards */}
            {rewardLabel.glow && (
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-full blur-md opacity-60",
                  `bg-gradient-to-r ${rewardLabel.gradient}`
                )}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {rewardLabel.icon}
              {rewardLabel.label}
            </span>
          </motion.div>
        </div>

        {/* "View Details" button (appears on hover) */}
        <motion.div
          className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          initial={{ y: 10 }}
          whileHover={{ y: 0 }}
        >
          <Button
            onClick={onView}
            size="sm"
            className="bg-white/90 hover:bg-white text-gray-900 font-semibold rounded-full shadow-lg"
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            View Details
          </Button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-cyan-300 transition-colors">
          {item.title}
        </h3>

        {/* Creator info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar className="w-9 h-9 border-2 border-white/20">
              <AvatarImage src={item.creator.avatarUrl} />
              <AvatarFallback className="text-xs">
                {(item.creator.name || 'C')[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium text-white truncate max-w-[120px]">
                {item.creator.name}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <span>Level {item.creator.level}</span>
              </div>
            </div>
          </div>

          {/* Member count */}
          <div className="flex items-center gap-1.5 text-gray-300 text-sm">
            <Users className="w-4 h-4" />
            <span>{item.membersCount || 0}</span>
          </div>
        </div>

        {/* Action buttons */}
        {isCreatorView ? (
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={onEdit}
              size="sm"
              className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl"
            >
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
            <Button
              onClick={onDelete}
              size="sm"
              variant="destructive"
              className="flex-1 rounded-xl"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        ) : (
          <Button
            onClick={onView}
            className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold shadow-md"
          >
            {item.rewardType === 'free' ? 'Join Now' : 'Claim Now'}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedCommunityCard;
