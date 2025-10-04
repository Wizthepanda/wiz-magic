import React from "react";
import { Zap, Users, Star, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CommunityCardProps {
  community: any;
  onOpen: () => void;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({ community, onOpen }) => {
  const bannerUrl = community.coverMedia?.[0]?.type === 'image'
    ? community.coverMedia[0].url
    : community.coverMedia?.[0]?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&auto=format';

  const zapPrice = community.zapsRequired || community.price?.zaps || 0;
  const usdPrice = community.usdCoPay || community.price?.usd || 0;
  const isFree = zapPrice === 0 && usdPrice === 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer h-full"
    >
      {/* Thumbnail with 5-slot indicator */}
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        <img
          src={bannerUrl}
          alt={community.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&auto=format';
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
            <Play className="w-7 h-7 text-gray-800 ml-1" />
          </div>
        </div>

        {/* Badge overlay */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-xs font-semibold">
          {community.privacy === 'private' ? '🔒 Private' :
           community.isFeatured ? '⭐ Featured' :
           '🌐 Community'}
        </div>

        {/* 5-slot media indicator */}
        {community.coverMedia && community.coverMedia.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5">
            {[...Array(Math.min(5, community.coverMedia.length))].map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === 0 ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <Badge variant="secondary" className="text-xs mb-2 bg-indigo-100 text-indigo-800">
            {community.category || 'General'}
          </Badge>
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-purple-600 transition-colors">
            {community.title}
          </h3>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2">
          {community.shortDescription || community.description}
        </p>

        {/* Creator info */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8 border-2 border-white/50">
              <AvatarImage src={community.creatorAvatar || community.creator?.avatarUrl} />
              <AvatarFallback className="text-xs">
                {(community.creatorName || community.creator?.name || 'C')[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {community.creatorName || community.creator?.name || 'Creator'}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {community.membersCount || 0} members
              </div>
            </div>
          </div>

          {/* Price badge */}
          <div className="flex-shrink-0">
            {isFree ? (
              <Badge className="bg-green-100 text-green-800 text-xs">Free</Badge>
            ) : (
              <div className="bg-white/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5 text-sm font-semibold shadow-sm">
                {zapPrice > 0 && (
                  <>
                    <Zap className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                    {zapPrice}
                  </>
                )}
                {zapPrice > 0 && usdPrice > 0 && <span className="text-slate-400">+</span>}
                {usdPrice > 0 && <span className="text-green-600">${usdPrice}</span>}
              </div>
            )}
          </div>
        </div>

        {/* View button */}
        <Button
          onClick={onOpen}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 text-white hover:from-indigo-600 hover:to-cyan-500 transition-all duration-300 shadow-md hover:shadow-lg font-semibold"
        >
          View Details
        </Button>
      </div>
    </motion.article>
  );
};

export default CommunityCard;
