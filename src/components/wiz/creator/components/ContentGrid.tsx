import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Video,
  PlayCircle,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Plus
} from 'lucide-react';

interface ContentGridProps {
  userId: string;
}

interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'short' | 'live';
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  publishedAt: string;
  duration: string;
  status: 'published' | 'draft' | 'scheduled';
}

export const CreatorContentGrid: React.FC<ContentGridProps> = ({ userId }) => {
  const isMobile = useIsMobile();
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Fetch user's content from multiple sources
        const [contentSnapshot, creatorVideosSnapshot] = await Promise.all([
          // Fetch from content collection (user-created content)
          getDocs(query(
            collection(db, 'content'),
            where('creatorId', '==', userId),
            orderBy('publishedAt', 'desc'),
            limit(10)
          )),
          // Fetch from creatorVideos collection (synced YouTube content)
          getDocs(query(
            collection(db, 'creatorVideos'),
            where('creatorId', '==', userId),
            orderBy('addedToWiz', 'desc'),
            limit(10)
          ))
        ]);
        
        // Combine and transform content from both sources
        const contentData: ContentItem[] = [];
        
        // Add content collection items
        contentSnapshot.docs.forEach(doc => {
          const data = doc.data();
          contentData.push({
            id: doc.id,
            title: data.title || 'Untitled',
            type: data.type || 'video',
            thumbnail: data.thumbnail || '/placeholder-thumbnail.jpg',
            views: data.views || 0,
            likes: data.likes || 0,
            comments: data.comments || 0,
            shares: data.shares || 0,
            publishedAt: data.publishedAt || new Date().toISOString(),
            duration: data.duration || '0:00',
            status: data.status || 'published'
          });
        });
        
        // Add YouTube videos from creatorVideos collection
        creatorVideosSnapshot.docs.forEach(doc => {
          const data = doc.data();
          contentData.push({
            id: doc.id,
            title: data.title || 'Untitled Video',
            type: 'video',
            thumbnail: data.thumbnail || '/placeholder-thumbnail.jpg',
            views: parseInt(data.views || '0') || 0,
            likes: Math.floor((parseInt(data.views || '0') || 0) * 0.05), // Estimate 5% like rate
            comments: Math.floor((parseInt(data.views || '0') || 0) * 0.02), // Estimate 2% comment rate
            shares: Math.floor((parseInt(data.views || '0') || 0) * 0.01), // Estimate 1% share rate
            publishedAt: data.publishedAt || data.addedToWiz?.toDate?.()?.toISOString() || new Date().toISOString(),
            duration: data.duration || '0:00',
            status: data.status === 'active' ? 'published' : 'draft'
          });
        });
        
        // Sort all content by publish date (most recent first)
        contentData.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        
        // Limit to 20 items total
        const limitedContent = contentData.slice(0, 20);
        
        setContent(limitedContent);
        console.log(`📹 Loaded ${limitedContent.length} content items for creator (${contentSnapshot.size} from content, ${creatorVideosSnapshot.size} from YouTube)`);
        
      } catch (error) {
        console.error('❌ Error fetching content:', error);
        // Fall back to empty array if there's an error
        setContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [userId]);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'short': return PlayCircle;
      case 'live': return Calendar;
      default: return Video;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-yellow-100 text-yellow-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Your Content</h2>
          <p className="text-slate-600">Manage and track your videos, shorts, and live streams</p>
        </div>
        
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Content
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mr-3"></div>
          <p className="text-slate-600">Loading your content...</p>
        </div>
      )}

      {/* Content Grid */}
      {!loading && (
        <div className={cn(
          "grid gap-6",
          isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
        )}>
          {content.map((contentItem) => {
            const IconComponent = getContentIcon(contentItem.type);
          
          return (
            <Card 
              key={contentItem.id}
              className="group overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={contentItem.thumbnail}
                  alt={contentItem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay Icons */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute top-2 left-2">
                  <IconComponent className="w-5 h-5 text-white drop-shadow-lg" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {content.duration}
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <Badge className={cn("text-xs", getStatusColor(content.status))}>
                    {content.status}
                  </Badge>
                </div>

                {/* Action Menu */}
                <div className="absolute top-2 right-14 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                    onClick={() => setSelectedContent(selectedContent === content.id ? null : content.id)}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                  
                  {selectedContent === content.id && (
                    <div className="absolute top-10 right-0 bg-white rounded-lg shadow-lg border z-10 py-1 min-w-[140px]">
                      <button className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <button className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-red-600">
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Info */}
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                  {content.title}
                </h3>
                
                <div className="flex items-center text-xs text-slate-500 mb-3 gap-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(content.publishedAt).toLocaleDateString()}
                  </div>
                  {content.status === 'published' && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor(Math.random() * 30) + 1}d ago
                    </div>
                  )}
                </div>

                {/* Stats */}
                {content.status === 'published' && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Eye className="w-3 h-3" />
                      <span>{formatViews(content.views)} views</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Heart className="w-3 h-3" />
                      <span>{formatViews(content.likes)} likes</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <MessageSquare className="w-3 h-3" />
                      <span>{formatViews(content.comments)} comments</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Share2 className="w-3 h-3" />
                      <span>{formatViews(content.shares)} shares</span>
                    </div>
                  </div>
                )}

                {content.status === 'draft' && (
                  <div className="mt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      Continue Editing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && content.length === 0 && (
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Video className="w-16 h-16 text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No content yet</h3>
            <p className="text-slate-600 mb-6 max-w-md">
              Start creating magical content to engage with your audience and grow your wizard community.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Video
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Load More */}
      {!loading && content.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
            Load More Content
          </Button>
        </div>
      )}
    </div>
  );
};