#!/usr/bin/env node

// YouTube API Setup Verification Script
// Run with: node test-youtube-setup.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎬 WIZ YouTube API Setup Verification\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  console.log('📋 Create .env.local with your YouTube API credentials\n');
  process.exit(1);
}

// Read environment variables
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

let hasClientId = false;
let hasApiKey = false;

console.log('🔍 Checking environment variables...\n');

lines.forEach(line => {
  const [key, value] = line.split('=');
  
  if (key === 'VITE_YOUTUBE_CLIENT_ID') {
    hasClientId = true;
    if (value && value !== 'your-client-id-here.googleusercontent.com') {
      console.log('✅ VITE_YOUTUBE_CLIENT_ID: Configured');
      if (value.includes('.googleusercontent.com')) {
        console.log('  ✓ Format looks correct');
      } else {
        console.log('  ⚠️  Format may be incorrect (should end with .googleusercontent.com)');
      }
    } else {
      console.log('❌ VITE_YOUTUBE_CLIENT_ID: Not configured');
    }
  }
  
  if (key === 'VITE_YOUTUBE_API_KEY') {
    hasApiKey = true;
    if (value && value !== 'your-api-key-here') {
      console.log('✅ VITE_YOUTUBE_API_KEY: Configured');
      if (value.startsWith('AIza')) {
        console.log('  ✓ Format looks correct');
      } else {
        console.log('  ⚠️  Format may be incorrect (should start with AIza)');
      }
    } else {
      console.log('❌ VITE_YOUTUBE_API_KEY: Not configured');
    }
  }
});

if (!hasClientId) {
  console.log('❌ VITE_YOUTUBE_CLIENT_ID: Missing');
}

if (!hasApiKey) {
  console.log('❌ VITE_YOUTUBE_API_KEY: Missing');
}

console.log('\n📋 Setup Checklist:');

if (hasClientId && hasApiKey) {
  console.log('✅ Environment variables configured');
  console.log('✅ Ready to test YouTube connection');
  console.log('\n🚀 Next steps:');
  console.log('1. Restart your dev server: npm run dev');
  console.log('2. Go to Create page');
  console.log('3. Click "Connect YouTube Channel"');
  console.log('4. Should open Google OAuth popup');
} else {
  console.log('❌ Missing YouTube API credentials');
  console.log('\n📝 To fix:');
  console.log('1. Follow COMPLETE_SETUP_GUIDE.md');
  console.log('2. Get credentials from Google Cloud Console');
  console.log('3. Update .env.local file');
  console.log('4. Run this script again');
}

console.log('\n🔗 Helpful links:');
console.log('• Google Cloud Console: https://console.cloud.google.com/');
console.log('• YouTube Data API: https://console.cloud.google.com/apis/library/youtube.googleapis.com');
console.log('• Complete Setup Guide: ./COMPLETE_SETUP_GUIDE.md');

console.log('\n🎯 Current Create page status:');
if (hasClientId && hasApiKey) {
  console.log('✅ Should work with real YouTube connection');
} else {
  console.log('⚠️  Will show configuration warning');
}

console.log('\n💡 Tips:');
console.log('• Make sure to enable YouTube Data API v3 in Google Cloud');
console.log('• Configure OAuth consent screen');  
console.log('• Add correct authorized origins');
console.log('• Restart dev server after updating .env.local');