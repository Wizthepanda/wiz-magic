import React, { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, ThumbsUp, Pin, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface DiscussionFeedProps {
  communityId: string;
}

export function DiscussionFeed({ communityId }: DiscussionFeedProps) {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState("");

  // Mock discussions - replace with real data from Firestore
  const discussions = [
    {
      id: "1",
      title: "Welcome to the community!",
      content: "Hey everyone! So excited to have you here. Feel free to introduce yourself and share what you're working on! 🎉",
      author: {
        uid: "creator1",
        name: "Creator",
        avatarUrl: "/Profile Pics/FERA.jpg",
        level: 15
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      replies: 23,
      likes: 45,
      isPinned: true
    },
    {
      id: "2",
      title: "Quick question about Module 2",
      content: "Has anyone completed the advanced techniques lesson? I'm stuck on the third assignment.",
      author: {
        uid: "user1",
        name: "Alex Chen",
        level: 8
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      replies: 5,
      likes: 12,
      isPinned: false
    }
  ];

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;
    // TODO: Implement Firestore submission
    console.log("Posting:", newPost);
    setNewPost("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* New Post Card */}
      {user && (
        <div className="rounded-2xl p-6 bg-white/70 backdrop-blur-sm shadow-sm">
          <div className="flex items-start gap-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-[#8B5CF6] to-[#3B82F6] text-white">
                {(user.displayName || 'U')[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share your thoughts, ask questions, or start a discussion..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px] resize-none bg-white border-slate-200 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
              />
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Be respectful and constructive
                </div>
                <Button
                  onClick={handlePostSubmit}
                  disabled={!newPost.trim()}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discussions List */}
      <div className="space-y-3">
        {discussions.map((discussion, idx) => (
          <motion.div
            key={discussion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-2xl p-6 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="w-11 h-11">
                <AvatarImage src={discussion.author.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700">
                  {discussion.author.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900">
                    {discussion.author.name}
                  </span>
                  {discussion.author.level && (
                    <Badge variant="outline" className="text-xs">
                      Lv. {discussion.author.level}
                    </Badge>
                  )}
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(discussion.createdAt, { addSuffix: true })}
                  </span>
                  {discussion.isPinned && (
                    <Badge className="bg-amber-100 text-amber-700 border-0">
                      <Pin className="w-3 h-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <h4 className="font-semibold text-slate-900 mb-2">
                {discussion.title}
              </h4>
              <p className="text-slate-700 text-sm leading-relaxed">
                {discussion.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-slate-200">
              <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#8B5CF6] transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span>{discussion.replies} {discussion.replies === 1 ? 'reply' : 'replies'}</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#8B5CF6] transition-colors">
                <ThumbsUp className="w-4 h-4" />
                <span>{discussion.likes}</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {discussions.length === 0 && (
        <div className="rounded-2xl p-12 bg-white/70 backdrop-blur-sm shadow-sm text-center">
          <MessageCircle className="w-16 h-16 mx-auto text-slate-300 mb-3" />
          <h4 className="text-lg font-semibold text-slate-700">No discussions yet</h4>
          <p className="text-sm text-slate-500 mt-2">
            Be the first to start a conversation!
          </p>
        </div>
      )}
    </motion.div>
  );
}

