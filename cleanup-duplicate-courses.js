/**
 * Cleanup script to remove duplicate course versions and placeholder courses
 * Run with: node cleanup-duplicate-courses.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanupDuplicateCourses() {
  console.log('🔍 Starting cleanup of duplicate courses and placeholders...\n');

  try {
    // Get all courses from community collection
    const coursesSnapshot = await db.collection('courses_community').get();

    console.log(`📊 Found ${coursesSnapshot.size} total courses in community collection\n`);

    const courses = [];
    coursesSnapshot.forEach(doc => {
      courses.push({
        id: doc.id,
        ...doc.data()
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

    // For safety, we'll do a dry run first
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('⚠️  Type "DELETE" to proceed with cleanup (or anything else to cancel): ', async (answer) => {
      if (answer.trim() === 'DELETE') {
        console.log('\n🚀 Starting cleanup...\n');

        let deletedCount = 0;
        const batch = db.batch();

        // Delete placeholder courses
        placeholderCourses.forEach(course => {
          console.log(`   ❌ Deleting placeholder: ${course.id}`);
          batch.delete(db.collection('courses_community').doc(course.id));
          deletedCount++;
        });

        // Delete older versions in version chains (keep only latest)
        coursesByOriginal.forEach((versions) => {
          versions.sort((a, b) => (b.version || 1) - (a.version || 1));
          const latestVersion = versions[0];

          // Delete all except the latest
          versions.slice(1).forEach(oldVersion => {
            console.log(`   ❌ Deleting old version: v${oldVersion.version} - ${oldVersion.id} - "${oldVersion.title}"`);
            batch.delete(db.collection('courses_community').doc(oldVersion.id));
            deletedCount++;
          });

          // Ensure latest version is marked correctly
          if (!latestVersion.isLatestVersion) {
            console.log(`   ✏️  Updating latest version flag: ${latestVersion.id}`);
            batch.update(db.collection('courses_community').doc(latestVersion.id), {
              isLatestVersion: true
            });
          }
        });

        // Delete standalone versioned courses
        standaloneVersionedCourses.forEach(course => {
          console.log(`   ❌ Deleting standalone version: v${course.version} - ${course.id} - "${course.title}"`);
          batch.delete(db.collection('courses_community').doc(course.id));
          deletedCount++;
        });

        // Commit the batch
        await batch.commit();

        console.log(`\n✅ Cleanup complete! Deleted ${deletedCount} courses.\n`);
      } else {
        console.log('\n❌ Cleanup cancelled.\n');
      }

      readline.close();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupDuplicateCourses();
