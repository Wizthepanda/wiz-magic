import React from "react";
import { motion } from "framer-motion";
import { Play, Users, Star, Zap, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface HeroFeaturedProps {
  community?: any;
  onOpen?: (community: any) => void;
  className?: string;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  community,
  onOpen,
  className = ""
}) => {
  if (!community) return null;

  const bannerUrl = community.coverMedia?.[0]?.type === 'image'
    ? community.coverMedia[0].url
    : community.coverMedia?.[0]?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=480&fit=crop&auto=format';

  const zapPrice = community.zapsRequired || community.price?.zaps || 0;
  const usdPrice = community.usdCoPay || community.price?.usd || 0;
  const isFree = zapPrice === 0 && usdPrice === 0;
  const membersClaimed = community.slotsClaimed || 0;
  const membersTotal = community.slotsTotal || 1000;
  const progressPercentage = (membersClaimed / membersTotal) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`group relative ${className}`}
    >
      <Card className="overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer bg-white/60 backdrop-blur-md">
        <div className="relative aspect-[2.5/1] overflow-hidden">
          {/* Background image */}
          <img
            src={bannerUrl}
            alt={community.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=480&fit=crop&auto=format';
            }}
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Featured badge */}
          <div className="absolute top-6 left-6">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-4 py-2 text-sm font-bold shadow-lg">
              <Star className="w-4 h-4 mr-2 fill-current" />
              ⭐ Featured Community
            </Badge>
          </div>

          {/* Bookmark button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all"
          >
            <Bookmark className="w-4 h-4 text-white" />
          </Button>

          {/* Content overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-3xl space-y-6">
              {/* Title and description */}
              <div className="space-y-3">
                <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {community.title}
                </h2>
                <p className="text-white/90 text-lg leading-relaxed line-clamp-2">
                  {community.shortDescription || community.description || 'Join this amazing community'}
                </p>
              </div>

              {/* Creator and stats */}
              <div className="flex items-center flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-white/40">
                    <AvatarImage src={community.creatorAvatar || community.creator?.avatarUrl} />
                    <AvatarFallback>
                      {(community.creatorName || community.creator?.name || 'C')[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-white font-semibold text-lg">
                      {community.creatorName || community.creator?.name || 'Expert Creator'}
                    </div>
                    <div className="text-white/70 text-sm">Community Creator</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-white/90">
                  {community.rating && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold text-lg">{community.rating}</span>
                      {community.reviews && (
                        <span className="text-sm">({community.reviews.toLocaleString()})</span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">
                      {(community.membersCount || community.members || 0).toLocaleString()} members
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing and CTA */}
              <div className="flex items-end justify-between gap-6 flex-wrap">
                <div className="space-y-3">
                  {/* Price */}
                  {!isFree ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {zapPrice > 0 && (
                          <div className="flex items-center gap-2 text-3xl font-bold text-white">
                            <Zap className="w-7 h-7 text-yellow-400 fill-current" />
                            {zapPrice.toLocaleString()}
                          </div>
                        )}
                        {zapPrice > 0 && usdPrice > 0 && (
                          <span className="text-2xl text-white/70">+</span>
                        )}
                        {usdPrice > 0 && (
                          <div className="text-3xl font-bold text-green-400">
                            ${usdPrice}
                          </div>
                        )}
                      </div>
                      {community.originalPrice && (
                        <div className="text-white/60 line-through text-xl">
                          ${community.originalPrice}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-5 py-2 text-lg font-semibold">
                      🎉 Free Community
                    </Badge>
                  )}

                  {/* Availability progress */}
                  {membersTotal > 0 && (
                    <div className="space-y-2">
                      <div className="text-white/80 text-sm font-medium">
                        {membersClaimed.toLocaleString()} / {membersTotal.toLocaleString()} slots claimed
                      </div>
                      <Progress
                        value={progressPercentage}
                        className="w-64 h-2.5 bg-white/20"
                      />
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-indigo-600 to-cyan-400 hover:from-indigo-700 hover:to-cyan-500 text-white"
                  onClick={() => onOpen?.(community)}
                >
                  <Play className="w-5 h-5 mr-3" />
                  View Community
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default HeroFeatured;
