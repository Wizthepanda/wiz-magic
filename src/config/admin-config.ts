// Admin and Test User Configuration
// This file contains admin emails and test user configurations for OAuth verification

export const ADMIN_CONFIG = {
  // Admin emails - these users get full access to all features
  adminEmails: [
    // Add your primary admin/test email here
    'wizsparkles@gmail.com', // Admin email for Google OAuth verification
    
    // You can add multiple admin emails if needed
    // 'secondary-admin@gmail.com',
  ],
  
  // Test user configuration for Google OAuth verification
  testUsers: {
    primary: {
      email: 'YOUR_GMAIL_ADDRESS_HERE@gmail.com', // ← Replace with your actual Gmail address
      role: 'admin',
      permissions: ['all'],
      description: 'Primary test account with full admin access for Google OAuth verification'
    }
  },
  
  // Feature flags for admin users
  adminFeatures: {
    enableAllFeatures: true,
    bypassLimits: true,
    accessAnalytics: true,
    moderateContent: true,
    manageUsers: true,
  }
};

// Helper function to check if user is admin
export const isAdmin = (email: string): boolean => {
  return ADMIN_CONFIG.adminEmails.includes(email.toLowerCase());
};

// Helper function to get user permissions
export const getUserPermissions = (email: string) => {
  if (isAdmin(email)) {
    return {
      isAdmin: true,
      permissions: ['all'],
      features: ADMIN_CONFIG.adminFeatures
    };
  }
  
  return {
    isAdmin: false,
    permissions: ['basic'],
    features: {}
  };
};

// Test user demo data for OAuth verification
export const TEST_USER_DEMO_DATA = {
  xp: 15000,
  level: 15,
  videosWatched: 150,
  totalWatchTime: 25000, // in minutes
  achievements: [
    'First Video Watched',
    'Level 10 Reached', 
    'YouTube Master',
    'Watch Streak Champion'
  ],
  stats: {
    dailyStreak: 30,
    favoriteCategory: 'Tech Reviews',
    averageSessionTime: 45
  }
};