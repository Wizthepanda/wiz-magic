import { useQuery } from '@tanstack/react-query';
import { getTopCommunityPosts, Post, FeedOptions } from '@/lib/queries';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityFeedContainerProps {
  communityId?: string;
  userId?: string;
  sortBy?: 'recent' | 'popular' | 'trending';
  limit?: number;
}

export const CommunityFeedContainer = ({
  communityId,
  userId,
  sortBy = 'recent',
  limit = 50
}: CommunityFeedContainerProps) => {
  const feedOptions: FeedOptions = {
    communityId,
    userId,
    sortBy,
    limitCount: limit
  };

  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['communityPosts', feedOptions],
    queryFn: () => getTopCommunityPosts(feedOptions),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-wiz-primary" />
        <span className="ml-3 text-muted-foreground">Loading posts...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 dark:text-red-400 mb-2">Failed to load posts</p>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">No posts found</p>
        <p className="text-sm text-muted-foreground">
          Be the first to create a post in this community!
        </p>
      </div>
    );
  }

  // Success state - render posts
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const formattedDate = post.createdAt
    ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })
    : 'Unknown date';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.userAvatar} alt={post.userName} />
              <AvatarFallback className="bg-wiz-primary text-white">
                {post.userName?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{post.userName || 'Anonymous'}</h3>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>{formattedDate}</span>
                {post.communityName && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {post.communityName}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Post Title */}
        <h2 className="text-xl font-bold text-foreground">{post.title}</h2>

        {/* Post Content */}
        <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>

        {/* Post Image */}
        {post.imageUrl && (
          <div className="rounded-lg overflow-hidden">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Interaction Buttons */}
        <div className="flex items-center space-x-4 pt-2 border-t">
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <Heart className="w-4 h-4" />
            <span className="text-sm">{post.likes || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">{post.comments || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
