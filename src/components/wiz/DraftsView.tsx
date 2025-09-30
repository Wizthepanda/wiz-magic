import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Clock,
  Edit,
  Trash2,
  Calendar,
  Users,
  Loader,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDraftCommunities } from '@/hooks/useCommunity';
import { formatDistanceToNow } from 'date-fns';

interface DraftsViewProps {
  onBack: () => void;
  onEditDraft: (draftId: string) => void;
}

export const DraftsView: React.FC<DraftsViewProps> = ({ onBack, onEditDraft }) => {
  const isMobile = useIsMobile();
  const { data: drafts, isLoading } = useDraftCommunities();

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';

    try {
      // Handle Firestore Timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin mx-auto text-violet-500" />
          <p className="text-gray-500">Loading your drafts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Premium gradient background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(79, 70, 229, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, rgba(250, 250, 255, 0.8) 0%, rgba(245, 245, 255, 0.9) 100%)
          `
        }}
      />

      <div className={cn(
        "max-w-7xl mx-auto space-y-8",
        isMobile ? "p-4 py-8" : "p-6 py-12"
      )}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Create
          </Button>

          <div>
            <h1 className={cn(
              "font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent",
              isMobile ? "text-4xl" : "text-5xl md:text-6xl"
            )}>
              Your Drafts
            </h1>
            <p className={cn(
              "text-gray-600 mt-4",
              isMobile ? "text-base" : "text-lg"
            )}>
              Continue working on your saved communities
            </p>
          </div>
        </motion.div>

        {/* Drafts Grid */}
        {drafts && drafts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
              "grid gap-6",
              isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {drafts.map((draft, index) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                  <CardContent className="p-0">
                    {/* Cover Image */}
                    <div className="relative aspect-video bg-gradient-to-br from-violet-100 to-purple-100 overflow-hidden">
                      {draft.coverMedia && draft.coverMedia.length > 0 ? (
                        <img
                          src={draft.coverMedia[0].thumbnail || draft.coverMedia[0].url}
                          alt={draft.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-12 h-12 text-violet-300" />
                        </div>
                      )}

                      {/* Draft Badge */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-yellow-500 text-white border-0">
                          Draft
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-bold text-lg line-clamp-2 mb-2">
                          {draft.title || 'Untitled Community'}
                        </h3>
                        {draft.shortDescription && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {draft.shortDescription}
                          </p>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(draft.updatedAt)}</span>
                        </div>
                        {draft.category && (
                          <Badge variant="outline" className="text-xs">
                            {draft.category}
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Button
                          className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                          onClick={() => onEditDraft(draft.id)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Continue Editing
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center py-20"
          >
            <Card className="max-w-md mx-auto border-0 shadow-lg">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-violet-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  No drafts yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start creating a community and it will be automatically saved as a draft
                </p>
                <Button
                  onClick={onBack}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 text-white"
                >
                  Create Your First Community
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DraftsView;