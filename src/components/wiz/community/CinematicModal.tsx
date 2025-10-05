import React, { useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Zap, Users, Globe, Lock, ChevronLeft, ChevronRight, Share2, Bookmark, Instagram, Twitter, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from "@/lib/utils";

interface CinematicModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: any;
  onJoin?: (community: any) => void;
  isProcessing?: boolean;
}

export const CinematicModal: React.FC<CinematicModalProps> = ({
  open,
  onOpenChange,
  community,
  onJoin,
  isProcessing = false
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
            <div className="p-8 space-y-6 bg-white">
              {/* Title & Tags */}
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    #{community.category || 'community'}
                  </Badge>
                  <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">
                    {community.privacy || 'public'}
                  </Badge>
                  {community.tags?.slice(0, 3).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-gray-600 border-gray-300">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <h2 className="text-4xl font-bold text-gray-900 mb-4">{community.title}</h2>

                {/* Creator */}
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="w-12 h-12 border-2 border-gray-200">
                    <AvatarImage src={community.creator?.avatarUrl} />
                    <AvatarFallback>{(community.creator?.name || 'C')[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{community.creator?.name}</div>
                    <div className="text-sm text-gray-500">Level {community.creator?.level} Creator</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-base">
                  {community.longDescription || community.shortDescription || community.description}
                </p>
              </div>

              {/* All Tags */}
              {community.tags && community.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  {community.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-gray-600 border-gray-300 hover:border-purple-400 hover:text-purple-700 transition-colors cursor-pointer">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Join Panel */}
          <div className="w-full lg:w-1/3 bg-[#E8E4F3] border-l border-gray-200 p-8 space-y-6 overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-bold text-gray-900">Community Access</h3>

            {/* Access Info */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Access Type</span>
                <span className="font-medium text-gray-900">{community.privacy || 'public'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium text-gray-900">{community.accessWindow || 'lifetime'}</span>
              </div>
              {community.slotsAvailable && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Slots</span>
                  <span className="font-medium text-gray-900">{community.slotsAvailable - (community.slotsClaimed || 0)} / {community.slotsAvailable}</span>
                </div>
              )}
            </div>

            {/* Join Button */}
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isProcessing) {
                  onJoin?.(community);
                }
              }}
              disabled={isProcessing}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isProcessing && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isProcessing ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    Claim Now
                    <Zap className="w-4 h-4 fill-current ml-1" />
                    {community.zapRequired || community.zapsRequired || 100} ZAPs
                  </>
                )}
              </span>
            </Button>

            <p className="text-xs text-center text-gray-500">Powered by ZAPs</p>

            {/* About Creator */}
            <div className="pt-6 border-t border-gray-300 space-y-4">
              <h4 className="text-base font-bold text-gray-900">About the Creator</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-gray-300">
                    <AvatarImage src={community.creator?.avatarUrl} />
                    <AvatarFallback>{(community.creator?.name || 'C')[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{community.creator?.name}</div>
                    <div className="text-sm text-gray-600">Level {community.creator?.level} Creator</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4 text-gray-600 hover:text-purple-600" />
                  </motion.button>
                  <motion.button
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Twitter"
                  >
                    <Twitter className="w-4 h-4 text-gray-600 hover:text-blue-500" />
                  </motion.button>
                  <motion.button
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Chat"
                  >
                    <MessageCircle className="w-4 h-4 text-gray-600 hover:text-green-600" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Content Modules */}
            {community.modules && community.modules.length > 0 && (
              <div className="pt-6 border-t border-gray-300 space-y-3">
                <h4 className="text-base font-bold text-gray-900">Content ({community.modules.length} module{community.modules.length > 1 ? 's' : ''})</h4>
                {community.modules.slice(0, 5).map((module: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-purple-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    <span>{module.title || `Module ${idx + 1}`}</span>
                  </div>
                ))}
                {community.modules.length > 5 && (
                  <div className="text-sm text-purple-600 font-medium">
                    +{community.modules.length - 5} more modules
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Close button */}
        <DialogClose className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm transition-all z-50 shadow-md">
          <X className="w-5 h-5 text-gray-700" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default CinematicModal;
