/**
 * AboutSection - Creator bio and external links
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Mail, Globe, Twitter, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

interface AboutSectionProps {
  bio?: string;
  socialLinks?: SocialLink[];
  email?: string;
  website?: string;
  joinedDate?: string;
  className?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  bio,
  socialLinks,
  email,
  website,
  joinedDate,
  className,
}) => {
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
    return ExternalLink;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('space-y-8', className)}
    >
      {/* Bio Section */}
      {bio && (
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">About</h3>
          <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {bio}
          </p>
        </div>
      )}

      {/* Links Section */}
      {(socialLinks && socialLinks.length > 0) || email || website ? (
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Links</h3>
          <div className="space-y-3">
            {/* Website */}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl',
                  'bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md',
                  'border border-zinc-200 dark:border-zinc-800',
                  'hover:border-indigo-300 dark:hover:border-indigo-700',
                  'hover:shadow-md',
                  'transition-all duration-200',
                  'group'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Website</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{website}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </a>
            )}

            {/* Email */}
            {email && (
              <a
                href={`mailto:${email}`}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-xl',
                  'bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md',
                  'border border-zinc-200 dark:border-zinc-800',
                  'hover:border-indigo-300 dark:hover:border-indigo-700',
                  'hover:shadow-md',
                  'transition-all duration-200',
                  'group'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Email</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{email}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
              </a>
            )}

            {/* Social Links */}
            {socialLinks && socialLinks.map((link, index) => {
              const Icon = getIcon(link.platform);

              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl',
                    'bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md',
                    'border border-zinc-200 dark:border-zinc-800',
                    'hover:border-indigo-300 dark:hover:border-indigo-700',
                    'hover:shadow-md',
                    'transition-all duration-200',
                    'group'
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{link.platform}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">{link.url}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
                </a>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Joined Date */}
      {joinedDate && (
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Joined {new Date(joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!bio && (!socialLinks || socialLinks.length === 0) && !email && !website && (
        <div className="flex items-center justify-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">No information available</p>
        </div>
      )}
    </motion.div>
  );
};
