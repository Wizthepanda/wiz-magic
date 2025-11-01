/**
 * Video Service
 * Handles fetching and transforming video data from Firestore
 */

import { collection, getDocs, query, where, limit, orderBy, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Video, FirestoreVideo, VideoCardData } from '@/types/video';

/**
 * Safely parse numeric values from Firestore
 */
const parseNumber = (value: any, fallback: number = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

/**
 * Format duration from seconds to MM:SS or H:MM:SS
 */
export const formatDuration = (seconds: number | string): string => {
  const totalSeconds = parseNumber(seconds, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format view count with K/M suffixes
 */
export const formatViews = (views: number | string): string => {
  const numViews = parseNumber(views, 0);

  if (numViews >= 1_000_000) {
    return `${(numViews / 1_000_000).toFixed(1)}M`;
  }
  if (numViews >= 1_000) {
    return `${(numViews / 1_000).toFixed(1)}K`;
  }
  return numViews.toString();
};

/**
 * Calculate ZAP reward based on video duration
 * Default: 0.5 ZAPs per second
 */
export const calculateZAPReward = (duration: number | string): number => {
  const seconds = parseNumber(duration, 0);
  return Math.floor(seconds * 0.5);
};

/**
 * Transform Firestore document to Video object
 */
const transformFirestoreVideo = (docId: string, data: FirestoreVideo): Video => {
  const duration = parseNumber(data.duration, 0);
  const views = parseNumber(data.views, 0);

  // Get creator info (fallback chain)
  const creatorName = data.creatorName || data.channelName || 'Unknown Creator';
  const creatorAvatar = data.creatorAvatar || data.channelAvatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${creatorName}`;

  return {
    id: docId,
    videoId: data.videoId || docId,
    title: data.title || 'Untitled Video',
    description: data.description,
    thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`,

    creatorId: data.creatorId,
    creatorName,
    creatorAvatar,
    channelId: data.channelId,
    channelName: data.channelName,
    channelAvatar: data.channelAvatar,

    views,
    duration,
    uploadDate: data.uploadDate,
    createdAt: data.createdAt,

    zapReward: data.zapReward || calculateZAPReward(duration),
    xpReward: data.xpReward,

    status: (data.status as any) || 'active',
    isFeatured: data.isFeatured || false,

    category: data.category,
    tags: data.tags,
  };
};

/**
 * Transform Video to VideoCardData for UI display
 */
export const toVideoCardData = (video: Video): VideoCardData => ({
  id: video.id,
  videoId: video.videoId,
  title: video.title,
  thumbnail: video.thumbnail,
  duration: formatDuration(video.duration),
  creatorName: video.creatorName,
  creatorAvatar: video.creatorAvatar,
  creatorId: video.creatorId,
  views: formatViews(video.views),
  zapReward: video.zapReward,
});

/**
 * Fetch all videos from Firestore
 */
export const fetchAllVideos = async (): Promise<Video[]> => {
  try {
    const videosCollection = collection(db, 'videos');
    const snapshot = await getDocs(videosCollection);

    return snapshot.docs.map((doc) =>
      transformFirestoreVideo(doc.id, doc.data() as FirestoreVideo)
    );
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

/**
 * Fetch featured videos
 */
export const fetchFeaturedVideos = async (maxResults: number = 10): Promise<Video[]> => {
  try {
    const videosCollection = collection(db, 'videos');
    const constraints: QueryConstraint[] = [
      where('isFeatured', '==', true),
      limit(maxResults),
    ];

    const q = query(videosCollection, ...constraints);
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs.map((doc) =>
        transformFirestoreVideo(doc.id, doc.data() as FirestoreVideo)
      );
    }

    // Fallback: get recent active videos
    const fallbackQuery = query(
      videosCollection,
      where('status', '==', 'active'),
      limit(maxResults)
    );
    const fallbackSnapshot = await getDocs(fallbackQuery);

    return fallbackSnapshot.docs.map((doc) =>
      transformFirestoreVideo(doc.id, doc.data() as FirestoreVideo)
    );
  } catch (error) {
    console.error('Error fetching featured videos:', error);
    // Last resort: get any videos
    try {
      const videosCollection = collection(db, 'videos');
      const anyQuery = query(videosCollection, limit(maxResults));
      const snapshot = await getDocs(anyQuery);

      return snapshot.docs.map((doc) =>
        transformFirestoreVideo(doc.id, doc.data() as FirestoreVideo)
      );
    } catch (fallbackError) {
      console.error('Error in fallback video fetch:', fallbackError);
      return [];
    }
  }
};

/**
 * Fetch videos for "Up Next" section
 * Excludes the current video and returns formatted data
 */
export const fetchUpNextVideos = async (
  currentVideoId: string,
  maxResults: number = 4
): Promise<VideoCardData[]> => {
  try {
    const videos = await fetchFeaturedVideos(maxResults + 5); // Get extra in case current video is included

    return videos
      .filter((video) => video.id !== currentVideoId && video.videoId !== currentVideoId)
      .slice(0, maxResults)
      .map(toVideoCardData);
  } catch (error) {
    console.error('Error fetching up next videos:', error);
    return [];
  }
};
