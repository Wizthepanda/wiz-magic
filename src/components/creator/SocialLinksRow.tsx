/**
 * SocialLinksRow - Icon buttons with hover glow for social media links
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Youtube, Globe, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

interface SocialLinksRowProps {
  links?: SocialLink[];
  className?: string;
}

export const SocialLinksRow: React.FC<SocialLinksRowProps> = ({ links, className }) => {
  if (!links || links.length === 0) {
    return null;
  }

  const getIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();

    if (platformLower.includes('twitter') || platformLower.includes('x.com')) {
      return Twitter;
    }
    if (platformLower.includes('youtube')) {
      return Youtube;
    }
    if (platformLower.includes('website') || platformLower.includes('site')) {
      return Globe;
    }
    return Link2;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className={cn('flex items-center gap-2', className)}
    >
      {links.map((link, index) => {
        const Icon = getIcon(link.platform);

        return (
          <motion.a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'w-10 h-10 rounded-full',
              'bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md',
              'border border-zinc-200 dark:border-zinc-700',
              'flex items-center justify-center',
              'text-zinc-600 dark:text-zinc-400',
              'hover:text-indigo-600 dark:hover:text-indigo-400',
              'hover:border-indigo-300 dark:hover:border-indigo-600',
              'hover:shadow-lg hover:shadow-indigo-500/20',
              'transition-all duration-200',
              'group'
            )}
            aria-label={`Visit ${link.platform}`}
          >
            <Icon className="w-4 h-4" />
          </motion.a>
        );
      })}
    </motion.div>
  );
};
