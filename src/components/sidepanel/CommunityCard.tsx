import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Settings, ExternalLink, Trash2, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface CommunityCardProps {
  id: string;
  name: string;
  icon?: string;
  memberCount: number;
  status: 'Published' | 'Draft';
  isActive?: boolean;
  isCollapsed?: boolean;
  onEdit?: (id: string) => void;
  onOpen?: (id: string) => void;
  onDelete?: (id: string) => void;
}

/**
 * CommunityCard Component (Phase 5)
 * - Display individual community in side panel
 * - Show icon, name, member count, status
 * - 3-dot menu for Edit/Open/Delete actions
 * - Active state with gradient border glow
 * - Collapsed mode shows only icon
 */
export const CommunityCard: React.FC<CommunityCardProps> = ({
  id,
  name,
  icon,
  memberCount,
  status,
  isActive = false,
  isCollapsed = false,
  onEdit,
  onOpen,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(id);
    setShowMenu(false);
  };

  const handleOpen = () => {
    onOpen?.(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
    setShowMenu(false);
  };

  // Collapsed mode - just the icon
  if (isCollapsed) {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className={cn(
          'relative w-12 h-12 rounded-full transition-all duration-300',
          isActive && 'ring-2 ring-purple-500 ring-offset-2 ring-offset-zinc-900'
        )}
      >
        <Avatar className="w-full h-full border-2 border-zinc-700">
          <AvatarImage src={icon} alt={name} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold">
            {name[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {status === 'Draft' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-zinc-900" />
        )}
      </motion.button>
    );
  }

  // Expanded mode - full card
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleOpen}
      className={cn(
        'relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300',
        'bg-zinc-900/50 hover:bg-zinc-800/60',
        isActive && 'bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-purple-900/30',
        isActive && 'border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
      )}
    >
      {/* Gradient Glow for Active */}
      {isActive && (
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-purple-500/20 pointer-events-none"
        />
      )}

      {/* Community Icon */}
      <motion.div
        animate={isHovered ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
        className="relative z-10"
      >
        <Avatar className="w-12 h-12 border-2 border-zinc-700 shadow-lg">
          <AvatarImage src={icon} alt={name} />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold text-lg">
            {name[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {status === 'Draft' && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">D</span>
          </div>
        )}
      </motion.div>

      {/* Community Info */}
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-white text-sm font-medium truncate">{name}</h3>
          <Badge
            variant="secondary"
            className={cn(
              'text-[10px] px-1.5 py-0',
              status === 'Published'
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            )}
          >
            {status}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-zinc-400 text-xs">
          <Users className="w-3 h-3" />
          <span>{memberCount.toLocaleString()} members</span>
        </div>
      </div>

      {/* 3-Dot Menu */}
      <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative z-10 p-2 rounded-lg hover:bg-zinc-700/50 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-zinc-400" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-zinc-900 border border-zinc-800 shadow-xl"
        >
          <DropdownMenuItem
            onClick={handleEdit}
            className="flex items-center gap-2 cursor-pointer text-white hover:bg-zinc-800"
          >
            <Settings className="w-4 h-4" />
            <span>Edit Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleOpen}
            className="flex items-center gap-2 cursor-pointer text-white hover:bg-zinc-800"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Community</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem
            onClick={handleDelete}
            className="flex items-center gap-2 cursor-pointer text-red-400 hover:bg-red-950/50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hover Highlight */}
      <AnimatePresence>
        {isHovered && !isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-purple-500/5 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
