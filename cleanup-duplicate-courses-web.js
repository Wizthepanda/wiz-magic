/**
 * Cleanup script to remove duplicate course versions and placeholder courses
 * Uses Firebase Web SDK (no service account needed)
 * Run with: node cleanup-duplicate-courses-web.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, writeBatch, query, where } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import * as readline from 'readline';

// Firebase config from your project
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function cleanupDuplicateCourses() {
  console.log('🔍 Starting cleanup of duplicate courses and placeholders...\n');

  try {
    // Get admin email/password from command line arguments or environment
    const email = process.argv[2] || process.env.ADMIN_EMAIL;
    const password = process.argv[3] || process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error('❌ Please provide admin credentials:');
      console.error('   node cleanup-duplicate-courses-web.js <email> <password>');
      console.error('   Or set ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
      process.exit(1);
    }

    // Authenticate
    console.log('🔐 Authenticating...');
    await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Authenticated successfully\n');

    // Get all courses from community collection
    const coursesSnapshot = await getDocs(collection(db, 'courses_community'));

    console.log(`📊 Found ${coursesSnapshot.size} total courses in community collection\n`);

    const courses = [];
    coursesSnapshot.forEach(docSnap => {
      courses.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Group courses by originalCourseId to find version chains
    const coursesByOriginal = new Map();
    const standaloneVersionedCourses = [];
    const placeholderCourses = [];

    courses.forEach(course => {
      // Check for placeholder courses (missing essential fields)
      const isPlaceholder = !course.title ||
                           course.title === 'Placeholder' ||
                           course.title === '' ||
                           !course.description ||
                           course.description === 'Placeholder' ||
                           course.description === '';

      if (isPlaceholder) {
        placeholderCourses.push(course);
        return;
      }

      // Group versioned courses
      if (course.originalCourseId) {
        if (!coursesByOriginal.has(course.originalCourseId)) {
          coursesByOriginal.set(course.originalCourseId, []);
        }
        coursesByOriginal.get(course.originalCourseId).push(course);
      } else if (course.version && course.version > 1) {
        // Versioned course without originalCourseId reference
        standaloneVersionedCourses.push(course);
      }
    });

    console.log('📋 Analysis Results:');
    console.log(`   • Placeholder courses: ${placeholderCourses.length}`);
    console.log(`   • Version chains: ${coursesByOriginal.size}`);
    console.log(`   • Standalone versioned courses: ${standaloneVersionedCourses.length}\n`);

    // Display placeholder courses to be removed
    if (placeholderCourses.length > 0) {
      console.log('🗑️  Placeholder Courses to Remove:');
      placeholderCourses.forEach(course => {
        console.log(`   • ${course.id} - "${course.title || '[No Title]'}" (Created: ${course.createdAt?.toDate?.() || 'Unknown'})`);
      });
      console.log('');
    }

    // Display version chains
    if (coursesByOriginal.size > 0) {
      console.log('🔗 Version Chains Detected:');
      coursesByOriginal.forEach((versions, originalId) => {
        console.log(`\n   Original: ${originalId}`);
        versions.sort((a, b) => (a.version || 1) - (b.version || 1));
        versions.forEach(version => {
          console.log(`      v${version.version || 1} - ${version.id} - "${version.title}" (Latest: ${version.isLatestVersion || false})`);
        });
      });
      console.log('');
    }

    // Display standalone versioned courses
    if (standaloneVersionedCourses.length > 0) {
      console.log('⚠️  Standalone Versioned Courses (v2+ without originalCourseId):');
      standaloneVersionedCourses.forEach(course => {
        console.log(`   • v${course.version} - ${course.id} - "${course.title}"`);
      });
      console.log('');
    }

    // Prompt for confirmation
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 CLEANUP PLAN:');
    console.log('   1. Remove all placeholder courses');
    console.log('   2. Remove duplicate versions (keep only latest in each chain)');
    console.log('   3. Remove standalone v2+ courses (likely created before fix)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('⚠️  Type "DELETE" to proceed with cleanup (or anything else to cancel): ', async (answer) => {
      if (answer.trim() === 'DELETE') {
        console.log('\n🚀 Starting cleanup...\n');

        let deletedCount = 0;
        const batch = writeBatch(db);
        let batchCount = 0;

        // Delete placeholder courses
        for (const course of placeholderCourses) {
          console.log(`   ❌ Deleting placeholder: ${course.id}`);
          batch.delete(doc(db, 'courses_community', course.id));
          batchCount++;
          deletedCount++;

          // Firestore batch limit is 500 operations
          if (batchCount >= 500) {
            await batch.commit();
            console.log(`   💾 Committed batch of ${batchCount} operations`);
            batchCount = 0;
          }
        }

        // Delete older versions in version chains (keep only latest)
        for (const [originalId, versions] of coursesByOriginal) {
          versions.sort((a, b) => (b.version || 1) - (a.version || 1));
          const latestVersion = versions[0];

          // Delete all except the latest
          for (const oldVersion of versions.slice(1)) {
            console.log(`   ❌ Deleting old version: v${oldVersion.version} - ${oldVersion.id} - "${oldVersion.title}"`);
            batch.delete(doc(db, 'courses_community', oldVersion.id));
            batchCount++;
            deletedCount++;

            if (batchCount >= 500) {
              await batch.commit();
              console.log(`   💾 Committed batch of ${batchCount} operations`);
              batchCount = 0;
            }
          }

          // Ensure latest version is marked correctly
          if (!latestVersion.isLatestVersion) {
            console.log(`   ✏️  Updating latest version flag: ${latestVersion.id}`);
            batch.update(doc(db, 'courses_community', latestVersion.id), {
              isLatestVersion: true
            });
            batchCount++;

            if (batchCount >= 500) {
              await batch.commit();
              console.log(`   💾 Committed batch of ${batchCount} operations`);
              batchCount = 0;
            }
          }
        }

        // Delete standalone versioned courses
        for (const course of standaloneVersionedCourses) {
          console.log(`   ❌ Deleting standalone version: v${course.version} - ${course.id} - "${course.title}"`);
          batch.delete(doc(db, 'courses_community', course.id));
          batchCount++;
          deletedCount++;

          if (batchCount >= 500) {
            await batch.commit();
            console.log(`   💾 Committed batch of ${batchCount} operations`);
            batchCount = 0;
          }
        }

        // Commit any remaining operations
        if (batchCount > 0) {
          await batch.commit();
          console.log(`   💾 Committed final batch of ${batchCount} operations`);
        }

        console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} courses.\n`);
      } else {
        console.log('\n❌ Cleanup cancelled.\n');
      }

      rl.close();
      await auth.signOut();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupDuplicateCourses();
