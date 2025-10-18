#!/usr/bin/env python3
"""
Cleanup script to remove duplicate course versions and placeholder courses
Requires: pip install firebase-admin
Usage: python3 cleanup-courses.py
"""

import firebase_admin
from firebase_admin import credentials, firestore
import sys
from collections import defaultdict

# Initialize Firebase Admin
try:
    cred = credentials.Certificate('/Users/Ira/Desktop/wiz-magic-platform-firebase-adminsdk-fbsvc-05d6906a7c.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Firebase initialized successfully\n")
except Exception as e:
    print(f"❌ Error initializing Firebase: {e}")
    print("\nPlease ensure you have:")
    print("1. Installed firebase-admin: pip install firebase-admin")
    print("2. Service account key file exists at the specified path")
    sys.exit(1)

def cleanup_duplicate_courses():
    print("🔍 Starting cleanup of duplicate courses and placeholders...\n")

    try:
        # Get all courses from community collection
        courses_ref = db.collection('courses_community')
        courses_docs = courses_ref.get()

        courses = []
        for doc in courses_docs:
            course_data = doc.to_dict()
            course_data['id'] = doc.id
            courses.append(course_data)

        print(f"📊 Found {len(courses)} total courses in community collection\n")

        # Categorize courses
        courses_by_original = defaultdict(list)
        standalone_versioned = []
        placeholders = []

        for course in courses:
            # Check for placeholder courses
            title = course.get('title', '')
            description = course.get('description', '')

            is_placeholder = (
                not title or
                title == 'Placeholder' or
                not description or
                description == 'Placeholder'
            )

            if is_placeholder:
                placeholders.append(course)
                continue

            # Group versioned courses
            if course.get('originalCourseId'):
                courses_by_original[course['originalCourseId']].append(course)
            elif course.get('version', 1) > 1:
                standalone_versioned.append(course)

        print("📋 Analysis Results:")
        print(f"   • Placeholder courses: {len(placeholders)}")
        print(f"   • Version chains: {len(courses_by_original)}")
        print(f"   • Standalone versioned courses: {len(standalone_versioned)}\n")

        # Display placeholder courses
        if placeholders:
            print("🗑️  Placeholder Courses to Remove:")
            for course in placeholders:
                print(f"   • {course['id']} - \"{course.get('title', '[No Title]')}\"")
            print()

        # Display version chains
        if courses_by_original:
            print("🔗 Version Chains Detected:")
            for original_id, versions in courses_by_original.items():
                print(f"\n   Original: {original_id}")
                versions.sort(key=lambda x: x.get('version', 1))
                for version in versions:
                    v_num = version.get('version', 1)
                    is_latest = version.get('isLatestVersion', False)
                    print(f"      v{v_num} - {version['id']} - \"{version['title']}\" (Latest: {is_latest})")
            print()

        # Display standalone versioned courses
        if standalone_versioned:
            print("⚠️  Standalone Versioned Courses (v2+ without originalCourseId):")
            for course in standalone_versioned:
                v_num = course.get('version', 1)
                print(f"   • v{v_num} - {course['id']} - \"{course['title']}\"")
            print()

        # Show cleanup plan
        print("━" * 60)
        print("🎯 CLEANUP PLAN:")
        print("   1. Remove all placeholder courses")
        print("   2. Remove duplicate versions (keep only latest in each chain)")
        print("   3. Remove standalone v2+ courses (likely created before fix)")
        print("━" * 60)
        print()

        # Confirm deletion
        if len(sys.argv) > 1 and sys.argv[1] == 'DELETE':
            response = 'DELETE'
            print("⚠️  DELETE command received from argument, proceeding with cleanup...")
        else:
            response = input("⚠️  Type 'DELETE' to proceed with cleanup (or anything else to cancel): ")

        if response.strip() != 'DELETE':
            print("\n❌ Cleanup cancelled.\n")
            return

        print("\n🚀 Starting cleanup...\n")

        deleted_count = 0
        batch = db.batch()
        batch_count = 0

        # Delete placeholder courses
        for course in placeholders:
            print(f"   ❌ Deleting placeholder: {course['id']}")
            course_ref = db.collection('courses_community').document(course['id'])
            batch.delete(course_ref)
            batch_count += 1
            deleted_count += 1

            if batch_count >= 500:
                batch.commit()
                print(f"   💾 Committed batch of {batch_count} operations")
                batch = db.batch()
                batch_count = 0

        # Delete older versions in chains (keep only latest)
        for original_id, versions in courses_by_original.items():
            versions.sort(key=lambda x: x.get('version', 1), reverse=True)
            latest = versions[0]

            # Delete all except latest
            for old_version in versions[1:]:
                v_num = old_version.get('version', 1)
                print(f"   ❌ Deleting old version: v{v_num} - {old_version['id']} - \"{old_version['title']}\"")
                course_ref = db.collection('courses_community').document(old_version['id'])
                batch.delete(course_ref)
                batch_count += 1
                deleted_count += 1

                if batch_count >= 500:
                    batch.commit()
                    print(f"   💾 Committed batch of {batch_count} operations")
                    batch = db.batch()
                    batch_count = 0

            # Ensure latest is marked correctly
            if not latest.get('isLatestVersion', False):
                print(f"   ✏️  Updating latest version flag: {latest['id']}")
                course_ref = db.collection('courses_community').document(latest['id'])
                batch.update(course_ref, {'isLatestVersion': True})
                batch_count += 1

                if batch_count >= 500:
                    batch.commit()
                    print(f"   💾 Committed batch of {batch_count} operations")
                    batch = db.batch()
                    batch_count = 0

        # Delete standalone versioned courses
        for course in standalone_versioned:
            v_num = course.get('version', 1)
            print(f"   ❌ Deleting standalone version: v{v_num} - {course['id']} - \"{course['title']}\"")
            course_ref = db.collection('courses_community').document(course['id'])
            batch.delete(course_ref)
            batch_count += 1
            deleted_count += 1

            if batch_count >= 500:
                batch.commit()
                print(f"   💾 Committed batch of {batch_count} operations")
                batch = db.batch()
                batch_count = 0

        # Commit remaining operations
        if batch_count > 0:
            batch.commit()
            print(f"   💾 Committed final batch of {batch_count} operations")

        print(f"\n✅ Cleanup complete! Deleted {deleted_count} courses.\n")

    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        sys.exit(1)

if __name__ == '__main__':
    cleanup_duplicate_courses()
