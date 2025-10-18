// Script to check and fix the "Cr8r Demo" video creator
const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to set this up)
console.log('🔍 Checking "Cr8r Demo" video in Firestore...');
console.log('Expected creator UID: ARd2KGyq1VSpCCwwfP6lrjRunIG3 (cr8rai@gmail.com)');
console.log('');
console.log('To fix this, run the following in Firebase Console:');
console.log('');
console.log('1. Go to Firestore Database');
console.log('2. Find the "creatorVideos" collection');
console.log('3. Search for document with title: "Cr8r Demo"');
console.log('4. Update the "creatorId" field to: ARd2KGyq1VSpCCwwfP6lrjRunIG3');
console.log('5. Update the "creator" field to: "Cr8r" (or your display name)');
console.log('6. Update the "creatorAvatar" field to your avatar URL');
