import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Play, Clock, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

interface HistoryItem {
  id: string;
  date: string;
  videoTitle: string;
  channelName: string;
  channelAvatar: string;
  duration: string;
  zapsEarned: number;
  timestamp: string;
}

const mockHistory: HistoryItem[] = [
  {
    id: '1',
    date: 'Oct 6',
    videoTitle: 'Advanced React Patterns & Best Practices',
    channelName: 'Code Master',
    channelAvatar: '/Profile Pics/FERA.jpg',
    duration: '24:15',
    zapsEarned: 12,
    timestamp: '2 hours ago',
  },
  {
    id: '2',
    date: 'Oct 6',
    videoTitle: 'AI-Powered Development Tools',
    channelName: 'Tech Wizard',
    channelAvatar: '/Profile Pics/Ale.jpg',
    duration: '18:30',
    zapsEarned: 8,
    timestamp: '5 hours ago',
  },
  {
    id: '3',
    date: 'Oct 5',
    videoTitle: 'Web3 Fundamentals Explained',
    channelName: 'Crypto Sage',
    channelAvatar: '/Profile Pics/Bogdan.jpg',
    duration: '32:45',
    zapsEarned: 15,
    timestamp: '1 day ago',
  },
];

export const ViewHistoryTab = () => {
  const [filter, setFilter] = useState('all');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] bg-clip-text text-transparent">
            View History
          </h2>
          <p className="text-sm text-slate-500 mt-1">Track your learning journey and ZAP earnings</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter('all')}>All Time</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('week')}>This Week</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter('month')}>This Month</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Animated spark particle */}
        <motion.div
          className="absolute left-6 top-0 w-2 h-2 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] rounded-full blur-sm"
          animate={{
            y: [0, 100, 200, 300],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {mockHistory.length > 0 ? (
          mockHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="grid grid-cols-[auto,1fr] gap-6"
            >
              {/* Left: Date & ZAPs */}
              <div className="flex flex-col items-end text-right pt-2 min-w-[100px]">
                <div className="text-sm font-semibold text-slate-700">{item.date}</div>
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-1 mt-1"
                >
                  <span className="text-xs font-bold bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] bg-clip-text text-transparent">
                    +{item.zapsEarned}
                  </span>
                  <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                </motion.div>
              </div>

              {/* Right: Activity Card */}
              <motion.div
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="border-0 bg-gradient-to-br from-white/90 to-white/60 backdrop-blur-xl shadow-md hover:shadow-xl transition-all relative overflow-hidden group">
                  {/* Gradient bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#06B6D4] to-[#3B82F6]" />
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-[#06B6D4]/10 to-[#3B82F6]/10" />

                  <CardContent className="p-4 relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">
                          {item.videoTitle}
                        </h3>
                        
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <img
                              src={item.channelAvatar}
                              alt={item.channelName}
                              className="w-5 h-5 rounded-full"
                            />
                            <span>{item.channelName}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.duration}</span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-400 mt-2">{item.timestamp}</div>
                      </div>

                      {/* ZAP Badge */}
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] blur-lg opacity-50 group-hover:opacity-100 transition-opacity" />
                        <Badge className="relative bg-gradient-to-r from-[#06B6D4] to-[#3B82F6] text-white border-0 px-3 py-1">
                          <Zap className="w-3 h-3 mr-1 fill-current" />
                          {item.zapsEarned}
                        </Badge>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#06B6D4]/20 to-[#3B82F6]/20 flex items-center justify-center">
              <Play className="w-12 h-12 text-[#06B6D4]" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No history yet</h3>
            <p className="text-slate-500">Start earning ZAPs by watching videos ⚡️</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

