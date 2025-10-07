import React, { useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Users, Clock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface CommunityAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: any;
}

export const CommunityAccessModal: React.FC<CommunityAccessModalProps> = ({
  open,
  onOpenChange,
  community,
}) => {
  const navigate = useNavigate();
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
  const membersClaimed = community.limit?.claimed || community.membersCount || 0;
  const membersTotal = community.limit?.seats || community.slotsAvailable || '∞';

  const handleGoToCommunity = () => {
    navigate(`/community/${community.slug || community.id}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-[1100px] max-h-[95vh] p-0 bg-white border-gray-200 shadow-2xl overflow-hidden rounded-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3, type: "spring", ease: [0.2, 0.9, 0.17, 1] }}
          className="flex flex-col lg:flex-row h-full max-h-[95vh] overflow-hidden bg-white"
        >
          {/* Left Side - Banner Carousel */}
          <div className="w-full lg:w-2/3 overflow-y-auto custom-scrollbar">
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
                            className="w-full h-[450px] object-cover"
                          />
                        ) : (
                          <iframe
                            src={banner.url}
                            title={`Video ${index + 1}`}
                            className="w-full h-[450px]"
                            allowFullScreen
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-[450px] bg-gradient-to-br from-[#8B5CF6]/20 to-[#3B82F6]/20 flex items-center justify-center">
                      <p className="text-gray-400">No media available</p>
                    </div>
                  )}
                </div>
              </div>

              {banners.length > 1 && (
                <>
                  <button
                    onClick={scrollPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center transition-all shadow-lg"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-800" />
                  </button>
                </>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Content Details */}
            <div className="p-8 space-y-6 bg-white">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white border-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Access Granted
                  </Badge>
                  <Badge variant="outline" className="text-gray-600 border-gray-300">
                    {community.privacy || 'Public'}
                  </Badge>
                </div>

                <h2 className="text-4xl font-bold text-gray-900 mb-4">{community.title}</h2>

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

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed text-base">
                  {community.longDescription || community.shortDescription || community.description}
                </p>
              </div>

              {community.tags && community.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  {community.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-gray-600 border-gray-300 hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-colors cursor-pointer">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Access Panel */}
          <div className="w-full lg:w-1/3 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] border-l border-gray-200 p-8 space-y-6 overflow-y-auto custom-scrollbar">
            <h3 className="text-xl font-bold text-gray-900">Your Access</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#8B5CF6]" />
                  Access Type
                </span>
                <span className="font-medium text-gray-900">
                  {community.rewardType === 'free' || community.rewardType === 'free-zaps' ? 'Free' : 'Paid'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#8B5CF6]" />
                  Duration
                </span>
                <span className="font-medium text-gray-900">Lifetime Access</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#8B5CF6]" />
                  Members
                </span>
                <span className="font-medium text-gray-900">{membersClaimed} joined</span>
              </div>
            </div>

            <Button
              onClick={handleGoToCommunity}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:shadow-[0_0_24px_rgba(139,92,246,0.5)] text-white font-bold text-base shadow-lg transition-all"
            >
              Go to Community
            </Button>

            <p className="text-xs text-center text-gray-500">Access granted • Explore content now</p>

            {community.modules && community.modules.length > 0 && (
              <div className="pt-6 border-t border-gray-300 space-y-3">
                <h4 className="text-base font-bold text-gray-900">Content ({community.modules.length} module{community.modules.length > 1 ? 's' : ''})</h4>
                {community.modules.slice(0, 5).map((module: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                    <span>{module.title || `Module ${idx + 1}`}</span>
                  </div>
                ))}
                {community.modules.length > 5 && (
                  <div className="text-sm text-[#8B5CF6] font-medium">
                    +{community.modules.length - 5} more modules
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <DialogClose className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm transition-all z-50 shadow-md">
          <X className="w-5 h-5 text-gray-700" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityAccessModal;

