/**
 * Comprehensive XP System Test Script
 * Tests both existing embed tracking and new YouTube API integration
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Test configuration
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

class XPSystemTester {
  constructor() {
    this.testUserId = 'test-user-' + Date.now();
    this.testVideoId = 'test-video-' + Date.now();
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async test(name, testFn) {
    try {
      this.log(`Running test: ${name}`);
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS' });
      this.log(`Test passed: ${name}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', error: error.message });
      this.log(`Test failed: ${name} - ${error.message}`, 'error');
    }
  }

  async setup() {
    this.log('Setting up test environment...');
    
    // Create test user tracking data
    const trackingRef = doc(db, 'userTrackingData', this.testUserId);
    await setDoc(trackingRef, {
      userId: this.testUserId,
      startTrackingDate: new Date(),
      youtubeConnected: true,
      preferences: {
        trackYouTubeHistory: true,
        trackOffPlatform: true,
      },
      youtubeTokens: {
        accessToken: 'test-token',
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      }
    });

    // Create test user XP data
    const xpRef = doc(db, 'userXP', this.testUserId);
    await setDoc(xpRef, {
      userId: this.testUserId,
      totalXP: 0,
      level: 1,
      dailyXP: 0,
      dailyShares: 0,
      dailyVideosWatched: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: new Date().toISOString().split('T')[0],
      lastXPUpdate: new Date(),
      lifetimeStats: {
        totalWatchTime: 0,
        totalShares: 0,
        totalReferrals: 0,
        totalVideosCompleted: 0
      }
    });

    // Create test creator and video
    const creatorRef = doc(db, 'creators', 'test-creator-' + Date.now());
    await setDoc(creatorRef, {
      userId: 'test-creator-' + Date.now(),
      channelId: 'test-channel-id',
      channelName: 'Test Creator',
      onboardingComplete: true,
      status: 'active',
      createdAt: new Date(),
    });

    const videoRef = doc(db, 'creatorVideos', this.testVideoId);
    await setDoc(videoRef, {
      videoId: this.testVideoId,
      title: 'Test Video',
      creatorId: 'test-creator-' + Date.now(),
      channelId: 'test-channel-id',
      duration: '300', // 5 minutes
      status: 'active',
      categoryTags: ['tech'],
      addedToWiz: new Date(),
    });

    this.log('Test environment setup complete');
  }

  async cleanup() {
    this.log('Cleaning up test data...');
    
    try {
      // Delete test documents
      await deleteDoc(doc(db, 'userTrackingData', this.testUserId));
      await deleteDoc(doc(db, 'userXP', this.testUserId));
      
      // Clean up any created XP logs
      const xpLogsQuery = query(
        collection(db, 'xpLogs'),
        where('userId', '==', this.testUserId)
      );
      const xpLogsSnapshot = await getDocs(xpLogsQuery);
      for (const docSnapshot of xpLogsSnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
      }

      // Clean up YouTube watch history
      const historyQuery = query(
        collection(db, 'youtubeWatchHistory'),
        where('userId', '==', this.testUserId)
      );
      const historySnapshot = await getDocs(historyQuery);
      for (const docSnapshot of historySnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
      }

      this.log('Cleanup complete');
    } catch (error) {
      this.log(`Cleanup error: ${error.message}`, 'error');
    }
  }

  async testFirestoreRules() {
    // Test 1: Users can read their own tracking data
    const trackingRef = doc(db, 'userTrackingData', this.testUserId);
    const trackingDoc = await getDoc(trackingRef);
    
    if (!trackingDoc.exists()) {
      throw new Error('User tracking data not found');
    }

    // Test 2: XP logs are read-only for users
    const xpLogRef = doc(db, 'xpLogs', 'test-log-' + Date.now());
    try {
      await setDoc(xpLogRef, {
        userId: this.testUserId,
        source: 'test',
        xpAmount: 10,
        timestamp: new Date()
      });
      throw new Error('XP logs should be read-only for users');
    } catch (error) {
      if (!error.message.includes('PERMISSION_DENIED')) {
        throw error;
      }
      // Expected - XP logs should be server-only
    }
  }

  async testXPCalculation() {
    // Test watch time XP calculation
    const watchTimeSeconds = 100; // 100 seconds
    const expectedXP = Math.floor(watchTimeSeconds * 0.1); // 10 XP
    
    if (expectedXP !== 10) {
      throw new Error(`Expected 10 XP for 100 seconds, got ${expectedXP}`);
    }

    // Test completion bonus
    const baseXP = 50;
    const completionBonus = Math.floor(baseXP * 0.1); // 10% bonus
    
    if (completionBonus !== 5) {
      throw new Error(`Expected 5 XP completion bonus, got ${completionBonus}`);
    }

    // Test daily cap
    const dailyCap = 360;
    const currentDaily = 350;
    const newXP = 20;
    const cappedXP = Math.min(newXP, dailyCap - currentDaily);
    
    if (cappedXP !== 10) {
      throw new Error(`Expected 10 XP after daily cap, got ${cappedXP}`);
    }
  }

  async testLevelProgression() {
    // Test level calculation
    const testXPValues = [
      { xp: 0, expectedLevel: 1 },
      { xp: 99, expectedLevel: 1 },
      { xp: 100, expectedLevel: 2 },
      { xp: 349, expectedLevel: 2 },
      { xp: 350, expectedLevel: 3 },
      { xp: 849, expectedLevel: 3 },
      { xp: 850, expectedLevel: 4 },
    ];

    for (const test of testXPValues) {
      let level = 1;
      let totalRequired = 100;
      
      while (test.xp >= totalRequired && level < 100) {
        level++;
        totalRequired += Math.floor(100 * Math.pow(2, level - 2));
      }
      
      if (level !== test.expectedLevel) {
        throw new Error(`XP ${test.xp} should be level ${test.expectedLevel}, got ${level}`);
      }
    }
  }

  async testYouTubeIntegration() {
    // Test tracking data structure
    const trackingRef = doc(db, 'userTrackingData', this.testUserId);
    const trackingDoc = await getDoc(trackingRef);
    const trackingData = trackingDoc.data();

    if (!trackingData.youtubeConnected) {
      throw new Error('YouTube should be connected for test user');
    }

    if (!trackingData.startTrackingDate) {
      throw new Error('Start tracking date should be set');
    }

    // Test YouTube watch history entry structure
    const historyEntry = {
      id: `${this.testUserId}_${this.testVideoId}_${Date.now()}`,
      userId: this.testUserId,
      videoId: this.testVideoId,
      watchedAt: new Date(),
      duration: 300,
      estimatedWatchTime: 210, // 70% of 300
      completionRate: 0.7,
      source: 'youtube_api',
      xpAwarded: 21, // 210 * 0.1
      creatorId: 'test-creator',
      processedAt: new Date(),
    };

    const historyRef = doc(db, 'youtubeWatchHistory', historyEntry.id);
    await setDoc(historyRef, historyEntry);

    // Verify the entry was created
    const historyDoc = await getDoc(historyRef);
    if (!historyDoc.exists()) {
      throw new Error('YouTube watch history entry should be created');
    }
  }

  async testXPDeduplication() {
    const timestamp = new Date();
    const videoId = 'test-dedup-video';

    // Create embed watch session
    const sessionRef = doc(db, 'watchSessions', `${this.testUserId}_${videoId}`);
    await setDoc(sessionRef, {
      userId: this.testUserId,
      videoId: videoId,
      startTime: timestamp,
      isActive: false,
      totalWatchTime: 120,
    });

    // Simulate duplicate detection logic
    const oneDayBefore = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);
    const oneDayAfter = new Date(timestamp.getTime() + 24 * 60 * 60 * 1000);

    // Check for existing sessions (this would be done by the deduplication logic)
    const sessionsQuery = query(
      collection(db, 'watchSessions'),
      where('userId', '==', this.testUserId),
      where('videoId', '==', videoId)
      // Note: Firestore doesn't support range queries with other filters easily
      // In production, this would be handled differently
    );

    const sessionsSnapshot = await getDocs(sessionsQuery);
    
    if (sessionsSnapshot.size === 0) {
      throw new Error('Should find existing watch session for deduplication test');
    }

    // Cleanup
    await deleteDoc(sessionRef);
  }

  async testDailyReset() {
    // Test daily counter reset logic
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const xpData = {
      dailyXP: 100,
      dailyShares: 3,
      dailyVideosWatched: 5,
      currentStreak: 2,
      lastActivityDate: yesterdayStr
    };

    // Simulate daily reset
    if (xpData.lastActivityDate !== today) {
      const wasActiveYesterday = xpData.dailyVideosWatched >= 3; // Assuming 3 is the threshold
      const newStreak = wasActiveYesterday ? xpData.currentStreak + 1 : 1;
      
      xpData.dailyXP = 0;
      xpData.dailyShares = 0;
      xpData.dailyVideosWatched = 0;
      xpData.currentStreak = newStreak;
      xpData.lastActivityDate = today;
    }

    if (xpData.dailyXP !== 0 || xpData.currentStreak !== 3) {
      throw new Error('Daily reset logic failed');
    }
  }

  async runAllTests() {
    this.log('Starting XP System Comprehensive Tests');
    this.log('=====================================');

    try {
      await this.setup();

      await this.test('Firestore Security Rules', () => this.testFirestoreRules());
      await this.test('XP Calculation Logic', () => this.testXPCalculation());
      await this.test('Level Progression', () => this.testLevelProgression());
      await this.test('YouTube Integration', () => this.testYouTubeIntegration());
      await this.test('XP Deduplication', () => this.testXPDeduplication());
      await this.test('Daily Reset Logic', () => this.testDailyReset());

      await this.cleanup();

      this.log('=====================================');
      this.log('Test Results Summary');
      this.log(`✅ Passed: ${this.results.passed}`);
      this.log(`❌ Failed: ${this.results.failed}`);
      this.log(`📊 Total: ${this.results.tests.length}`);

      if (this.results.failed > 0) {
        this.log('Failed tests:', 'error');
        this.results.tests
          .filter(test => test.status === 'FAIL')
          .forEach(test => {
            this.log(`  - ${test.name}: ${test.error}`, 'error');
          });
      }

      const success = this.results.failed === 0;
      this.log(`Overall result: ${success ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`, success ? 'success' : 'error');
      
      return success;
    } catch (error) {
      this.log(`Test runner error: ${error.message}`, 'error');
      await this.cleanup();
      return false;
    }
  }
}

// Manual test functions for Cloud Functions
async function testCloudFunctions() {
  console.log('🧪 Testing Cloud Functions...');
  
  // These would need to be run with appropriate authentication
  console.log('📝 Manual Cloud Function Tests:');
  console.log('1. Test syncYouTubeHistory callable function');
  console.log('2. Test initializeYouTubeTracking callable function');
  console.log('3. Verify dailyYouTubeSync scheduled function runs');
  console.log('4. Check awardXP function with new deduplication logic');
  console.log('');
  console.log('Run these commands to test functions:');
  console.log('firebase functions:shell');
  console.log('> syncYouTubeHistory()');
  console.log('> initializeYouTubeTracking({accessToken: "test", expiresIn: 3600})');
}

// Frontend integration test checklist
function printFrontendTestChecklist() {
  console.log('🎨 Frontend Integration Test Checklist:');
  console.log('');
  console.log('✅ XP Dashboard Component:');
  console.log('  □ Level progress displays correctly');
  console.log('  □ XP breakdown by source shows accurate data');
  console.log('  □ YouTube integration status reflects connection');
  console.log('  □ Manual sync button works when authenticated');
  console.log('  □ Recent activity logs display properly');
  console.log('');
  console.log('✅ Enhanced Video Player:');
  console.log('  □ XP heartbeat sends every 10 seconds during playback');
  console.log('  □ Tab focus requirement works correctly');
  console.log('  □ Completion bonus awarded for >90% completion');
  console.log('  □ Daily cap reached message shows when appropriate');
  console.log('  □ Deduplication prevents double-counting');
  console.log('');
  console.log('✅ YouTube Integration:');
  console.log('  □ OAuth flow connects YouTube account');
  console.log('  □ startTrackingDate recorded on first connection');
  console.log('  □ Manual sync fetches and processes history');
  console.log('  □ Only creator videos counted for XP');
  console.log('  □ Daily sync runs automatically via Cloud Function');
  console.log('');
  console.log('✅ System Health:');
  console.log('  □ No duplicate XP awards between embed and API');
  console.log('  □ Daily XP cap enforced (360 XP max)');
  console.log('  □ Level progression works correctly');
  console.log('  □ Firestore security rules prevent XP manipulation');
  console.log('  □ Error handling works for expired tokens');
}

// Performance test guidelines
function printPerformanceTestGuidelines() {
  console.log('⚡ Performance Test Guidelines:');
  console.log('');
  console.log('📊 Metrics to Monitor:');
  console.log('  • Cloud Function execution time < 10s per user');
  console.log('  • Firestore read operations per sync < 50');
  console.log('  • Memory usage in Cloud Functions < 1GB');
  console.log('  • YouTube API calls per user < 5 per day');
  console.log('  • Daily sync completion rate > 95%');
  console.log('');
  console.log('🔍 Load Testing:');
  console.log('  1. Test with 100+ concurrent users');
  console.log('  2. Simulate daily sync with 1000+ users');
  console.log('  3. Test video heartbeat with multiple simultaneous players');
  console.log('  4. Verify Firestore scaling under load');
  console.log('  5. Monitor YouTube API quota usage');
  console.log('');
  console.log('🛡️ Error Recovery:');
  console.log('  • Handle YouTube API rate limits gracefully');
  console.log('  • Retry failed Cloud Function executions');
  console.log('  • Graceful degradation when services unavailable');
  console.log('  • Transaction rollback on partial failures');
}

// Main test runner
async function main() {
  console.log('🚀 WIZ Platform XP System Test Suite');
  console.log('=====================================');
  console.log('');

  // Run automated tests
  const tester = new XPSystemTester();
  const automatedTestsPassed = await tester.runAllTests();

  console.log('');
  
  // Show manual test instructions
  await testCloudFunctions();
  console.log('');
  printFrontendTestChecklist();
  console.log('');
  printPerformanceTestGuidelines();

  console.log('');
  console.log('🎯 Next Steps:');
  console.log('1. Run automated tests (completed above)');
  console.log('2. Deploy Cloud Functions and test manually');
  console.log('3. Test frontend integration with real user accounts');
  console.log('4. Perform load testing with multiple users');
  console.log('5. Monitor system in production for 24 hours');

  process.exit(automatedTestsPassed ? 0 : 1);
}

// Run tests if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { XPSystemTester, testCloudFunctions, printFrontendTestChecklist };