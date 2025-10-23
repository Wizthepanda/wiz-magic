import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { CommunityCard } from './CommunityCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Community {
  id: string;
  name: string;
  icon?: string;
  memberCount: number;
  status: 'Published' | 'Draft';
}

interface CommunityPanelProps {
  communities: Community[];
  activeCommunityId?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCreateNew?: () => void;
  onEditCommunity?: (id: string) => void;
  onOpenCommunity?: (id: string) => void;
  onDeleteCommunity?: (id: string) => void;
}

/**
 * CommunityPanel Component (Phase 5)
 * - Side panel displaying all user communities
 * - Scrollable vertical list with CommunityCards
 * - Create new community button
 * - Collapse/expand toggle
 * - Active community highlighting
 * - No layout bleed when toggled
 */
export const CommunityPanel: React.FC<CommunityPanelProps> = ({
  communities,
  activeCommunityId,
  isCollapsed = false,
  onToggleCollapse,
  onCreateNew,
  onEditCommunity,
  onOpenCommunity,
  onDeleteCommunity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCommunities = communities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedCount = communities.filter((c) => c.status === 'Published').length;
  const draftCount = communities.filter((c) => c.status === 'Draft').length;

  return (
    <motion.div
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'relative h-full bg-zinc-950 border-r border-zinc-800',
        'flex flex-col overflow-hidden'
      )}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-zinc-800">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-bold text-lg">Communities</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleCollapse}
                  className="h-8 w-8 p-0 hover:bg-zinc-800"
                >
                  <ChevronLeft className="w-4 h-4 text-zinc-400" />
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  {publishedCount} Published
                </span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  {draftCount} Drafts
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="h-8 w-8 p-0 hover:bg-zinc-800"
              >
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create New Button */}
      <div className="flex-shrink-0 p-4">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="expanded-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                onClick={onCreateNew}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/30 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Community
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center"
            >
              <Button
                onClick={onCreateNew}
                size="sm"
                className="h-10 w-10 p-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/30 rounded-full"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Communities List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredCommunities.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              {!isCollapsed && (
                <>
                  <div className="text-4xl mb-3">🏘️</div>
                  <p className="text-zinc-500 text-sm">No communities yet</p>
                  <p className="text-zinc-600 text-xs mt-1">Create your first one!</p>
                </>
              )}
            </motion.div>
          ) : (
            filteredCommunities.map((community, index) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <CommunityCard
                  {...community}
                  isActive={community.id === activeCommunityId}
                  isCollapsed={isCollapsed}
                  onEdit={onEditCommunity}
                  onOpen={onOpenCommunity}
                  onDelete={onDeleteCommunity}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {!isCollapsed && communities.length > 0 && (
        <div className="flex-shrink-0 p-4 border-t border-zinc-800">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-zinc-500"
          >
            {communities.length} {communities.length === 1 ? 'Community' : 'Communities'}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
