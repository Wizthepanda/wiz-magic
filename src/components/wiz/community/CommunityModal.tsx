import React, { useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Zap, Users, Share2, Bookmark, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react';

interface CommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: any;
  onJoin?: (community: any) => void;
}

export const CommunityModal: React.FC<CommunityModalProps> = ({
  open,
  onOpenChange,
  community,
  onJoin
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (!community) return null;

  const banners = community.coverMedia?.slice(0, 5) || [];
  const zapPrice = community.zapsRequired || community.price?.zaps || 0;
  const usdPrice = community.usdCoPay || community.price?.usd || 0;
  const isFree = zapPrice === 0 && usdPrice === 0;
  const membersClaimed = community.limit?.claimed || 0;
  const membersTotal = community.limit?.seats || community.slotsAvailable || '∞';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1100px] max-h-[90vh] p-0 overflow-y-auto bg-white rounded-2xl">
        <div className="flex flex-col lg:flex-row gap-6 p-6">
          {/* Left column - Media carousel and details */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* 5-slot Carousel */}
            <div className="rounded-xl overflow-hidden bg-slate-50 relative">
              <div className="embla overflow-hidden" ref={emblaRef}>
                <div className="embla__container flex">
                  {banners.length > 0 ? (
                    banners.map((banner: any, index: number) => (
                      <div key={index} className="embla__slide min-w-full relative">
                        {banner.type === 'image' ? (
                          <img
                            src={banner.url}
                            alt={`${community.title} - slide ${index + 1}`}
                            className="w-full h-64 lg:h-96 object-cover"
                          />
                        ) : banner.type === 'youtube' ? (
                          <div className="w-full h-64 lg:h-96 bg-black">
                            <iframe
                              src={banner.url}
                              title={`${community.title} - video ${index + 1}`}
                              className="w-full h-full"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-64 lg:h-96 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                            <p className="text-slate-500">Media {index + 1}</p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="embla__slide min-w-full">
                      <div className="w-full h-64 lg:h-96 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <p className="text-slate-500">No media available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Carousel controls */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={scrollPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-800" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transition-all"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-800" />
                  </button>

                  {/* Dot indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {scrollSnaps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === selectedIndex ? 'w-8 bg-white' : 'w-2 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Community details */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs bg-indigo-100 text-indigo-800">
                      {community.category || 'General'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {community.privacy || 'Public'}
                    </Badge>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {community.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={community.creatorAvatar || community.creator?.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {(community.creatorName || community.creator?.name || 'C')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {community.creatorName || community.creator?.name || 'Creator'}
                      </span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{community.membersCount || 0} members</span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-sm text-slate-500">
                    Progress: {membersClaimed}/{membersTotal}
                  </div>
                  {!isFree && (
                    <div className="flex items-center gap-2 text-lg font-bold">
                      {zapPrice > 0 && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <Zap className="w-5 h-5 text-yellow-500 fill-current" />
                          {zapPrice}
                        </span>
                      )}
                      {zapPrice > 0 && usdPrice > 0 && <span className="text-slate-400">+</span>}
                      {usdPrice > 0 && <span className="text-green-600">${usdPrice}</span>}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {community.longDescription || community.shortDescription || community.description}
              </p>

              {/* Tags */}
              {community.tags && community.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {community.tags.map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={() => onJoin?.(community)}
                  className="h-11 px-6 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-400 text-white hover:from-indigo-700 hover:to-cyan-500 font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {isFree ? 'Join Free' : `Join — ${zapPrice > 0 ? `${zapPrice} ⚡` : ''}${zapPrice > 0 && usdPrice > 0 ? ' + ' : ''}${usdPrice > 0 ? `$${usdPrice}` : ''}`}
                </Button>
                <Button
                  variant="outline"
                  className="h-11 px-6 rounded-full bg-gradient-to-r from-amber-400 to-lime-400 text-white border-0 hover:from-amber-500 hover:to-lime-500 font-semibold"
                >
                  Tip Creator
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full border hover:bg-slate-50"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 rounded-full border hover:bg-slate-50"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right column - Join info */}
          <aside className="w-full lg:w-1/3">
            <div className="rounded-xl p-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100 space-y-4 sticky top-6">
              <h4 className="font-semibold text-gray-900">Community Access</h4>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Access Type:</span>
                  <Badge variant="secondary" className="text-xs">
                    {community.privacy || 'Public'}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Duration:</span>
                  <span className="font-medium">{community.accessWindow || 'Lifetime'}</span>
                </div>

                {membersTotal !== '∞' && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Slots Available:</span>
                    <span className="font-medium">{membersTotal - membersClaimed} / {membersTotal}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-indigo-200">
                <Button
                  onClick={() => onJoin?.(community)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-400 text-white hover:from-indigo-700 hover:to-cyan-500 font-semibold shadow-md"
                >
                  {isFree ? '🎉 Join Free' : `Join Now`}
                </Button>
                <p className="text-xs text-slate-500 mt-3 text-center">
                  {isFree
                    ? 'Free community - join instantly!'
                    : 'Secure payment powered by ZAPs'}
                </p>
              </div>

              {/* Creator info */}
              <div className="pt-4 border-t border-indigo-200 space-y-3">
                <h5 className="text-sm font-semibold text-gray-900">About the Creator</h5>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-white">
                    <AvatarImage src={community.creatorAvatar || community.creator?.avatarUrl} />
                    <AvatarFallback>
                      {(community.creatorName || community.creator?.name || 'C')[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {community.creatorName || community.creator?.name || 'Creator'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Level {community.creator?.level || 1}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modules preview */}
              {community.modules && community.modules.length > 0 && (
                <div className="pt-4 border-t border-indigo-200 space-y-2">
                  <h5 className="text-sm font-semibold text-gray-900">
                    Content ({community.modules.length} modules)
                  </h5>
                  <div className="space-y-1">
                    {community.modules.slice(0, 3).map((module: any, idx: number) => (
                      <div key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-indigo-400" />
                        <span className="truncate">{module.title || `Module ${idx + 1}`}</span>
                      </div>
                    ))}
                    {community.modules.length > 3 && (
                      <div className="text-xs text-indigo-600 font-medium">
                        +{community.modules.length - 3} more...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Close button */}
        <DialogClose className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all">
          <X className="w-5 h-5 text-gray-600" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityModal;
