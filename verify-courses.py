#!/usr/bin/env python3
"""
Verify remaining courses in the database
"""

import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin
cred = credentials.Certificate('/Users/Ira/Desktop/wiz-magic-platform-firebase-adminsdk-fbsvc-05d6906a7c.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

print("🔍 Verifying courses in community collection...\n")

# Get all courses
courses_ref = db.collection('courses_community')
courses_docs = courses_ref.get()

courses = []
for doc in courses_docs:
    course_data = doc.to_dict()
    course_data['id'] = doc.id
    courses.append(course_data)

print(f"📊 Total courses: {len(courses)}\n")

if courses:
    print("📚 Course List:")
    print("━" * 80)
    for course in courses:
        print(f"\n🎓 Course ID: {course['id']}")
        print(f"   Title: {course.get('title', 'N/A')}")
        print(f"   Version: {course.get('version', 1)}")
        print(f"   Latest: {course.get('isLatestVersion', 'N/A')}")
        print(f"   Original Course ID: {course.get('originalCourseId', 'N/A')}")
        print(f"   Creator: {course.get('creatorId', 'N/A')}")
        print(f"   Category: {course.get('category', 'N/A')}")
        print(f"   Status: {course.get('status', 'N/A')}")
        print(f"   Created: {course.get('createdAt', 'N/A')}")
else:
    print("❌ No courses found in community collection")

print("\n✅ Verification complete!\n")
