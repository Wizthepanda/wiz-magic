import { CreatorService } from './creator-service';
import { CreatorVideo } from './creator-service';

// Test function to manually publish a video to discover
export const testPublishVideo = async (userId: string) => {
  try {
    console.log('🧪 Testing video publishing for user:', userId);
    
    const testVideo: Omit<CreatorVideo, 'addedToWiz' | 'lastUpdated'> = {
      id: 'test-video-' + Date.now(),
      videoId: 'test-video-' + Date.now(),
      title: 'Test Video - Published at ' + new Date().toLocaleTimeString(),
      description: 'This is a test video to verify the publishing pipeline',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: '3:30',
      publishedAt: new Date().toISOString(),
      views: '1K',
      categoryTags: ['music'],
      creatorId: userId,
      channelId: 'test-channel-123',
      status: 'active',
      isFeatured: true,
      originalYouTubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    };

    console.log('📝 Test video data:', testVideo);
    await CreatorService.publishVideosToDiscover([testVideo]);
    console.log('✅ Test video published successfully!');
    
    return testVideo;
  } catch (error) {
    console.error('❌ Test video publishing failed:', error);
    throw error;
  }
};

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testPublishVideo = testPublishVideo;
}