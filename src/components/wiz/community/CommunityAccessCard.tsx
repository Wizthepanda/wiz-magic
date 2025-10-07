import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, MessageCircle, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CommunityAccessCardProps {
  community: any;
  onEnter?: () => void;
}

export const CommunityAccessCard: React.FC<CommunityAccessCardProps> = ({
  community,
  onEnter,
}) => {
  const navigate = useNavigate();

  const bannerUrl = community.coverMedia?.[0]?.url ||
    community.coverMedia?.[0]?.thumbnail ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&auto=format';

  const moduleCount = community.modules?.length || 0;
  const progress = 0; // TODO: Calculate based on user's actual progress

  const handleEnterCommunity = () => {
    if (onEnter) {
      onEnter();
    } else {
      // Navigate directly to community dashboard
      navigate(`/community/${community.slug || community.id}`);
    }
  };

  return (
    <motion.article
      className="group relative bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-md transition-all duration-300 flex flex-col h-[420px]"
      whileHover={{
        y: -6,
        boxShadow: '0 0 0 6px rgba(139,92,246,0.08), 0 12px 40px rgba(11,14,24,0.08)'
      }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, ease: [0.2, 0.9, 0.17, 1] }}
    >
      {/* Banner with overlay */}
      <div className="relative h-44 overflow-hidden bg-slate-200">
        <img
          src={bannerUrl}
          alt={community.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&auto=format';
          }}
        />
        {/* Darkened overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        
        {/* Access Granted Badge */}
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
          <CheckCircle className="w-3.5 h-3.5" />
          Access Granted
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-lg line-clamp-2 text-slate-900 mb-2">
          {community.title}
        </h3>

        {/* Creator Info */}
        <div className="flex items-center gap-2 text-sm mb-3">
          <img
            src={community.creator?.avatarUrl || '/Profile Pics/FERA.jpg'}
            alt={community.creator?.name}
            className="w-6 h-6 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/Profile Pics/FERA.jpg';
            }}
          />
          <span className="flex-1 truncate font-medium text-slate-700">{community.creator?.name || 'Unknown Creator'}</span>
          <span className="text-xs rounded-full px-2 py-0.5 bg-white/40 text-slate-600">
            {community.category || community.itemType}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>Your Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Mini Icon Row */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{moduleCount} Modules</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Discussions</span>
          </div>
          <div className="flex items-center gap-1">
            <Gift className="w-3.5 h-3.5" />
            <span>Rewards</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto">
          <button
            onClick={handleEnterCommunity}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white font-semibold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all shadow-sm flex items-center justify-center gap-2"
          >
            Enter Community
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default CommunityAccessCard;

