import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Eye, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

/**
 * World-Class Video Card Redesign
 *
 * Features:
 * - Purple glow profile section (#A259FF)
 * - Minimalist Lucide icons for meta info
 * - Premium ZAP reward badge with pulse animation
 * - 3-column flex layout: Profile | Meta | ZAP
 * - Fully responsive with smooth interactions
 */

export interface VideoCardData {
  id: string;
  title: string;
  thumbnail: string;
  thumbnailBlurred?: string;
  duration: string;
  creator: {
    id?: string;
    name: string;
    avatar: string;
    role?: string;
    verified?: boolean;
  };
  views: string;
  daysAgo: number;
  zapsReward: number;
  onClick?: () => void;
}

interface VideoCardRedesignProps {
  video: VideoCardData;
  onCreatorClick?: (creatorId: string) => void;
  className?: string;
}

export const VideoCardRedesign: React.FC<VideoCardRedesignProps> = ({
  video,
  onCreatorClick,
  className
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleCardClick = () => {
    if (video.onClick) {
      video.onClick();
    }
  };

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (video.creator.id) {
      if (onCreatorClick) {
        onCreatorClick(video.creator.id);
      } else {
        navigate(`/creator/${video.creator.id}`);
      }
    }
  };

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden cursor-pointer",
        "bg-white rounded-2xl",
        "shadow-sm hover:shadow-xl",
        "transition-shadow duration-300",
        className
      )}
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        scale: 1.01,
        transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
      }}
    >
      {/* Video Thumbnail Section */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {/* LQIP placeholder */}
        {!imageLoaded && video.thumbnailBlurred && (
          <img
            src={video.thumbnailBlurred}
            alt=""
            className="w-full h-full object-cover filter blur-sm scale-110"
          />
        )}

        {/* High-res thumbnail */}
        <img
          src={video.thumbnail}
          alt={video.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            "group-hover:scale-105",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />

        {/* Duration tag */}
        <div
          className="absolute bottom-3 right-3 px-3 py-1.5 text-white text-xs font-semibold rounded-full"
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {video.duration}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-400 flex items-center justify-center">
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
            initial={{ scale: 0 }}
            whileHover={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Play className="w-6 h-6 text-slate-800 ml-1" fill="currentColor" />
          </motion.div>
        </div>
      </div>

      {/* Card Content Section */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 font-sans">
          {video.title}
        </h3>

        {/* REDESIGNED 3-COLUMN LAYOUT */}
        <div className="flex items-center justify-between gap-3 flex-wrap">

          {/* LEFT COLUMN: Profile Section */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group/creator min-w-0 flex-1"
            onClick={handleCreatorClick}
            title="View Creator Profile"
          >
            {/* Profile icon with purple glow ring */}
            <div className="relative flex-shrink-0">
              {/* Purple glow effect on hover */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#A259FF] to-[#7C3AED] opacity-0 group-hover/creator:opacity-30 blur-sm transition-opacity duration-300" />

              {/* Profile image */}
              <img
                src={video.creator.avatar}
                alt={video.creator.name}
                className="relative w-9 h-9 rounded-full object-cover ring-2 ring-[#A259FF]/30 group-hover/creator:ring-[#A259FF]/60 transition-all duration-300"
                style={{
                  boxShadow: '0 2px 8px rgba(162, 89, 255, 0.15)'
                }}
              />
            </div>

            {/* Creator info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {/* Creator name */}
                <span
                  className="text-[14px] font-medium text-[#444] truncate group-hover/creator:text-[#A259FF] transition-colors duration-200"
                  style={{ lineHeight: '1.2' }}
                >
                  {video.creator.name}
                </span>

                {/* Verified badge */}
                {video.creator.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">✓</span>
                  </div>
                )}
              </div>

              {/* Optional role/bio */}
              {video.creator.role && (
                <span className="text-xs text-[#777] truncate block">
                  {video.creator.role}
                </span>
              )}
            </div>
          </div>

          {/* CENTER COLUMN: Meta Info (Views + Date) */}
          <div className="flex items-center gap-2.5 text-xs text-[#7A7A7A]">
            {/* Views */}
            <div className="flex items-center gap-1">
              <Eye
                className="w-4 h-4 opacity-70"
                strokeWidth={2}
                style={{ width: '16px', height: '16px' }}
              />
              <span
                className="font-medium"
                style={{ letterSpacing: '0.02em' }}
              >
                {video.views}
              </span>
            </div>

            {/* Separator dot */}
            <span className="text-[#7A7A7A]/50" style={{ fontSize: '10px' }}>·</span>

            {/* Upload date */}
            <div className="flex items-center gap-1">
              <Clock
                className="w-4 h-4 opacity-70"
                strokeWidth={2}
                style={{ width: '16px', height: '16px' }}
              />
              <span
                className="font-medium"
                style={{ letterSpacing: '0.02em' }}
              >
                {video.daysAgo}d ago
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: ZAP Reward Badge */}
          {video.zapsReward > 0 && (
            <motion.div
              className="group/zap relative flex items-center gap-1.5 px-[10px] py-1 cursor-pointer flex-shrink-0"
              style={{
                background: 'rgba(162, 89, 255, 0.1)',
                borderRadius: '10px',
                boxShadow: '0 1px 4px rgba(162, 89, 255, 0.2)',
              }}
              whileHover={{ scale: 1.05 }}
              title="Earned by engagement!"
              animate={{
                boxShadow: [
                  '0 1px 4px rgba(162, 89, 255, 0.2)',
                  '0 2px 8px rgba(162, 89, 255, 0.3)',
                  '0 1px 4px rgba(162, 89, 255, 0.2)',
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Lightning icon */}
              <Zap
                className="w-3.5 h-3.5 group-hover/zap:animate-pulse"
                fill="#A259FF"
                style={{ color: '#A259FF' }}
              />

              {/* ZAP amount */}
              <span
                className="text-xs font-semibold"
                style={{
                  color: '#A259FF',
                  fontWeight: 600,
                  letterSpacing: '0.01em'
                }}
              >
                +{video.zapsReward}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Example Usage:
 *
 * <VideoCardRedesign
 *   video={{
 *     id: 'video123',
 *     title: 'How to Build a Startup in 2025',
 *     thumbnail: '/thumbnails/startup.jpg',
 *     duration: '12:34',
 *     creator: {
 *       id: 'creator123',
 *       name: 'Alex Johnson',
 *       avatar: '/avatars/alex.jpg',
 *       role: 'Tech Entrepreneur',
 *       verified: true
 *     },
 *     views: '1.2M',
 *     daysAgo: 5,
 *     zapsReward: 3,
 *     onClick: () => console.log('Video clicked')
 *   }}
 *   onCreatorClick={(id) => console.log('Creator clicked:', id)}
 * />
 */
