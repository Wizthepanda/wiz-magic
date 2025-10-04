import React, { useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Zap, Users, Globe, Lock, ChevronLeft, ChevronRight, Share2, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from "@/lib/utils";

interface CinematicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: any;
  onJoin?: (community: any) => void;
}

export const CinematicModal: React.FC<CinematicModalProps> = ({
  open,
  onOpenChange,
  community,
  onJoin
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  if (!community) return null;

  const banners = community.coverMedia?.slice(0, 5) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-[1200px] max-h-[95vh] p-0 bg-white border-gray-200 shadow-2xl overflow-hidden rounded-2xl">
        {/* 3D Parallax motion container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3, type: "spring", ease: [0.2, 0.9, 0.17, 1] }}
          className="flex flex-col lg:flex-row h-full max-h-[95vh] overflow-hidden bg-white"
        >
          {/* Left Side - Banner & Details */}
          <div className="w-full lg:w-2/3 overflow-y-auto custom-scrollbar">
            {/* Banner Carousel */}
            <div className="relative bg-black">
              <div className="embla overflow-hidden" ref={emblaRef}>
                <div className="embla__container flex">
                  {banners.length > 0 ? (
                    banners.map((banner: any, index: number) => (
                      <div key={index} className="embla__slide min-w-full">
                        {banner.type === 'image' ? (
                          <img
                            src={banner.url}
                            alt={`${community.title} - ${index + 1}`}
                            className="w-full h-[400px] object-cover"
                          />
                        ) : (
                          <iframe
                            src={banner.url}
                            title={`Video ${index + 1}`}
                            className="w-full h-[400px]"
                            allowFullScreen
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-[400px] bg-gradient-to-br from-purple-900/30 to-cyan-900/30 flex items-center justify-center">
                      <p className="text-gray-400">No media available</p>
                    </div>
                  )}
                </div>
              </div>

              {banners.length > 1 && (
                <>
                  <button
                    onClick={scrollPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Title & Tags */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    #{community.category || 'community'}
                  </Badge>
                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    {community.privacy || 'public'}
                  </Badge>
                  {community.tags?.slice(0, 3).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-gray-300 border-white/20">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <h2 className="text-4xl font-bold text-white mb-4">{community.title}</h2>

                {/* Creator */}
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="w-12 h-12 border-2 border-white/20">
                    <AvatarImage src={community.creator?.avatarUrl} />
                    <AvatarFallback>{(community.creator?.name || 'C')[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-lg font-semibold text-white">{community.creator?.name}</div>
                    <div className="text-sm text-gray-400">Level {community.creator?.level} Creator</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed text-lg">
                  {community.longDescription || community.shortDescription || community.description}
                </p>
              </div>

              {/* All Tags */}
              {community.tags && community.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  {community.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-gray-400 border-white/10 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors cursor-pointer">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Join Panel */}
          <div className="w-full lg:w-1/3 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border-l border-white/10 p-8 space-y-6 overflow-y-auto custom-scrollbar">
            <h3 className="text-2xl font-bold text-white">Community Access</h3>

            {/* Access Info */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Access Type:</span>
                <Badge className="bg-white/10 text-white">{community.privacy || 'Public'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white font-medium">{community.accessWindow || 'Lifetime'}</span>
              </div>
              {community.slotsAvailable && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Slots:</span>
                  <span className="text-white font-medium">{community.slotsAvailable - (community.slotsClaimed || 0)} / {community.slotsAvailable}</span>
                </div>
              )}
            </div>

            {/* Join Button */}
            <Button
              onClick={() => onJoin?.(community)}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-lg shadow-2xl relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 fill-current" />
                Secure Access with ZAPs
              </span>
            </Button>

            <p className="text-xs text-center text-gray-400">Powered by ZAPs</p>

            {/* About Creator */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <h4 className="text-lg font-semibold text-white">About the Creator</h4>
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14 border-2 border-white/20">
                  <AvatarImage src={community.creator?.avatarUrl} />
                  <AvatarFallback>{(community.creator?.name || 'C')[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-white">{community.creator?.name}</div>
                  <div className="text-sm text-gray-400">Level {community.creator?.level}</div>
                </div>
              </div>
            </div>

            {/* Content Modules */}
            {community.modules && community.modules.length > 0 && (
              <div className="pt-6 border-t border-white/10 space-y-3">
                <h4 className="text-lg font-semibold text-white">Content ({community.modules.length} modules)</h4>
                {community.modules.slice(0, 5).map((module: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{module.title || `Module ${idx + 1}`}</span>
                  </div>
                ))}
                {community.modules.length > 5 && (
                  <div className="text-sm text-cyan-400 font-medium">
                    +{community.modules.length - 5} more modules
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Close button */}
        <DialogClose className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-all z-50">
          <X className="w-6 h-6 text-white" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default CinematicModal;
