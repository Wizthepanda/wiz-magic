// Demo YouTube data for testing UI flow without API setup
// This is only used when VITE_DEMO_MODE=true is set

export const demoChannelInfo = {
  id: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
  name: 'Your Channel Name',
  avatar: 'https://yt3.ggpht.com/ytc/AIdro_kVh5-6n0p8OwGS5_5Wm-rHnNn8Wk9-BkOsHiZz7w=s88-c-k-c0x00ffffff-no-rj',
  subscriberCount: '12.5K',
  customUrl: 'your-channel-url'
};

export const demoVideos = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'How I Built My First Mobile App',
    description: 'Complete walkthrough of building a React Native app from scratch',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '15:23',
    publishedAt: '3 days ago',
    views: '8.9K',
    tags: ['react native', 'mobile development', 'tutorial']
  },
  {
    id: 'jNQXAC9IVRw',
    title: 'Advanced JavaScript Concepts You Need to Know',
    description: 'Deep dive into closures, promises, and async programming',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
    duration: '22:45',
    publishedAt: '1 week ago',
    views: '15.2K',
    tags: ['javascript', 'programming', 'web development']
  },
  {
    id: 'ScMzIvxBSi4',
    title: 'Building a Full-Stack SaaS Application',
    description: 'Complete guide to building a SaaS app with modern tech stack',
    thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    duration: '28:17',
    publishedAt: '2 weeks ago',
    views: '23.7K',
    tags: ['saas', 'full stack', 'entrepreneurship']
  },
  {
    id: '2M4asXviuoo',
    title: 'Machine Learning for Beginners',
    description: 'Introduction to ML concepts and practical applications',
    thumbnail: 'https://img.youtube.com/vi/2M4asXviuoo/maxresdefault.jpg',
    duration: '18:52',
    publishedAt: '3 weeks ago',
    views: '11.4K',
    tags: ['machine learning', 'ai', 'python']
  },
  {
    id: 'L_j_8sCcU6s',
    title: 'Docker & Kubernetes Deployment Guide',
    description: 'Learn to deploy applications using containerization',
    thumbnail: 'https://img.youtube.com/vi/L_j_8sCcU6s/maxresdefault.jpg',
    duration: '19:33',
    publishedAt: '1 month ago',
    views: '6.8K',
    tags: ['docker', 'kubernetes', 'devops']
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Database Design Best Practices',
    description: 'Essential patterns and principles for database architecture',
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
    duration: '25:19',
    publishedAt: '1 month ago',
    views: '19.3K',
    tags: ['database', 'sql', 'architecture']
  }
];

export const isDemoMode = () => {
  return import.meta.env.VITE_DEMO_MODE === 'true';
};