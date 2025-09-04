import { collection, getDocs, query, where, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

interface VideoSyncDebugInfo {
  videoId: string;
  title: string;
  inCreatorVideos: boolean;
  inVideosCollection: boolean;
  creatorId?: string;
  addedToWiz?: Date;
  status?: string;
}

export class VideoSyncDebug {
  /**
   * Check sync status between creatorVideos and videos collections
   */
  static async checkVideoSyncStatus(creatorId?: string): Promise<VideoSyncDebugInfo[]> {
    try {
      console.log('🔍 Checking video sync status...');
      
      // Get all videos from creatorVideos collection
      const creatorVideosRef = collection(db, 'creatorVideos');
      let creatorQuery = creatorVideosRef;
      
      if (creatorId) {
        creatorQuery = query(creatorVideosRef, where('creatorId', '==', creatorId));
      }
      
      const [creatorVideosSnapshot, videosSnapshot] = await Promise.all([
        getDocs(creatorQuery),
        getDocs(collection(db, 'videos'))
      ]);
      
      // Create maps for quick lookup
      const creatorVideosMap = new Map();
      const videosMap = new Map();
      
      creatorVideosSnapshot.docs.forEach(doc => {
        const data = doc.data();
        creatorVideosMap.set(data.videoId, {
          ...data,
          addedToWiz: data.addedToWiz?.toDate?.() || new Date(data.addedToWiz)
        });
      });
      
      videosSnapshot.docs.forEach(doc => {
        const data = doc.data();
        videosMap.set(data.videoId, {
          ...data,
          addedToWiz: data.addedToWiz?.toDate?.() || new Date(data.addedToWiz)
        });
      });
      
      // Combine all unique video IDs
      const allVideoIds = new Set([...creatorVideosMap.keys(), ...videosMap.keys()]);
      
      const syncStatus: VideoSyncDebugInfo[] = [];
      
      allVideoIds.forEach(videoId => {
        const creatorVideo = creatorVideosMap.get(videoId);
        const publicVideo = videosMap.get(videoId);
        
        syncStatus.push({
          videoId,
          title: creatorVideo?.title || publicVideo?.title || 'Unknown',
          inCreatorVideos: !!creatorVideo,
          inVideosCollection: !!publicVideo,
          creatorId: creatorVideo?.creatorId || publicVideo?.creatorId,
          addedToWiz: creatorVideo?.addedToWiz || publicVideo?.addedToWiz,
          status: creatorVideo?.status || publicVideo?.status
        });
      });
      
      // Log results
      console.log('📊 Video Sync Status Report:');
      console.log(`Total videos found: ${syncStatus.length}`);
      
      const onlyInCreator = syncStatus.filter(v => v.inCreatorVideos && !v.inVideosCollection);
      const onlyInPublic = syncStatus.filter(v => !v.inCreatorVideos && v.inVideosCollection);
      const inBoth = syncStatus.filter(v => v.inCreatorVideos && v.inVideosCollection);
      
      console.log(`✅ In both collections: ${inBoth.length}`);
      console.log(`⚠️  Only in creatorVideos: ${onlyInCreator.length}`);
      console.log(`🔍 Only in videos collection: ${onlyInPublic.length}`);
      
      if (onlyInCreator.length > 0) {
        console.log('📝 Videos missing from public discover feed:');
        onlyInCreator.forEach(video => {
          console.log(`  - ${video.title} (${video.videoId})`);
        });
      }
      
      return syncStatus;
    } catch (error) {
      console.error('❌ Error checking video sync status:', error);
      return [];
    }
  }
  
  /**
   * Sync missing videos from creatorVideos to videos collection
   */
  static async syncMissingVideos(creatorId: string): Promise<void> {
    try {
      console.log('🔄 Starting video sync for creator:', creatorId);
      
      const syncStatus = await this.checkVideoSyncStatus(creatorId);
      const missingVideos = syncStatus.filter(v => v.inCreatorVideos && !v.inVideosCollection);
      
      if (missingVideos.length === 0) {
        console.log('✅ All videos are already synced!');
        return;
      }
      
      console.log(`📤 Syncing ${missingVideos.length} missing videos...`);
      
      // Get the full creator video data for missing videos
      const creatorVideosRef = collection(db, 'creatorVideos');
      const promises = [];
      
      for (const missingVideo of missingVideos) {
        const creatorVideoRef = doc(creatorVideosRef, missingVideo.videoId);
        promises.push(getDocs(query(creatorVideosRef, where('videoId', '==', missingVideo.videoId))));
      }
      
      const creatorVideoDocs = await Promise.all(promises);
      
      // Create batch operations to add missing videos to public collection
      for (let i = 0; i < creatorVideoDocs.length; i++) {
        const docs = creatorVideoDocs[i];
        if (!docs.empty) {
          const creatorVideoData = docs.docs[0].data();
          
          // Add to main videos collection for Discover feed
          const publicVideoRef = doc(db, 'videos', creatorVideoData.videoId);
          
          const publicVideoData = {
            videoId: creatorVideoData.videoId,
            title: creatorVideoData.title,
            description: creatorVideoData.description,
            thumbnail: creatorVideoData.thumbnail,
            duration: creatorVideoData.duration,
            creatorId: creatorVideoData.creatorId,
            creatorName: creatorVideoData.creatorName,
            creatorAvatar: creatorVideoData.creatorAvatar,
            channelId: creatorVideoData.channelId,
            channelName: creatorVideoData.channelName || 'Unknown Creator',
            channelAvatar: creatorVideoData.channelAvatar || '',
            isCreatorContent: true,
            publishedAt: creatorVideoData.publishedAt,
            addedToWiz: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            status: 'active',
            originalUrl: creatorVideoData.originalYouTubeUrl || `https://www.youtube.com/watch?v=${creatorVideoData.videoId}`
          };
          
          await setDoc(publicVideoRef, publicVideoData);
          console.log(`✅ Synced video: ${creatorVideoData.title}`);
        }
      }
      
      console.log('🎉 Video sync completed!');
    } catch (error) {
      console.error('❌ Error syncing videos:', error);
      throw error;
    }
  }
}

// Make it available globally for browser console debugging
(window as any).VideoSyncDebug = VideoSyncDebug;