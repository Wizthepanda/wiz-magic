# User Account Deletion Instructions

## Overview
This guide explains how to completely delete user accounts from WizXP, including all associated data (XP, ZAPs, watch history, communities, videos, etc.).

## Accounts to Delete
- beacontags@gmail.com
- wiztym@gmail.com
- wizsparkles@gmail.com

---

## Method 1: Using the Web Tool (Recommended - Easiest)

### Step 1: Open the Deletion Tool
1. Open the file `scripts/delete-users.html` in your web browser
2. Or serve it locally: `npx serve scripts/` and navigate to `http://localhost:3000/delete-users.html`

### Step 2: Enter Details
- **Admin Secret**: `DELETE_USERS_SECRET_2024` (pre-filled)
- **Email Addresses**: The three emails are pre-filled, one per line:
  ```
  beacontags@gmail.com
  wiztym@gmail.com
  wizsparkles@gmail.com
  ```

### Step 3: Delete
1. Click the "Delete Accounts" button
2. Confirm the deletion in the popup
3. Wait for the process to complete (usually 10-30 seconds)
4. Review the results showing what was deleted

---

## Method 2: Using Firebase Console (Manual)

If you prefer to do this manually through Firebase Console:

### Firebase Authentication
1. Go to https://console.firebase.google.com/project/wiz-magic-platform/authentication/users
2. Search for each email:
   - beacontags@gmail.com
   - wiztym@gmail.com
   - wizsparkles@gmail.com
3. Click on each user → "Delete account"

### Firestore Data
For each user, delete documents from these collections:
1. `users/{userId}`
2. `userXP/{userId}`
3. `userZAPs/{userId}`
4. `userProfiles/{userId}`
5. `userSettings/{userId}`
6. `users/{userId}/watchHistory` (subcollection - delete all documents)

And remove them from:
- `communities` collection where `members` array contains their userId
- `videos` collection where `createdBy` equals their userId
- `transactions` collection where `userId` equals their userId

**⚠️ WARNING**: This manual method is error-prone and time-consuming. Use Method 1 instead.

---

## What Gets Deleted

The deletion process removes:

### ✅ Firebase Authentication
- User account and authentication data

### ✅ Firestore Collections
- `users/{userId}` - User profile data
- `userXP/{userId}` - XP and level data
- `userZAPs/{userId}` - ZAP balance and transactions
- `userProfiles/{userId}` - Extended profile information
- `userSettings/{userId}` - User preferences

### ✅ Subcollections
- `users/{userId}/watchHistory` - All watch history entries

### ✅ Community Memberships
- Removed from `members` array in all communities
- Community `memberCount` decremented

### ✅ Created Content
- Videos from `videos` collection
- Videos from `creatorVideos` collection
- Communities from `communities` collection
- Courses from `courses_community` collection

### ✅ Transactions
- All transaction records in `transactions` collection

---

## After Deletion

Once deleted, these email accounts can sign up fresh with:
- ✅ New unique user IDs
- ✅ Zero XP
- ✅ Zero ZAPs
- ✅ No watch history
- ✅ No community memberships
- ✅ Clean slate - like a brand new user

---

## Troubleshooting

### "User not found" error
- The account may already be deleted
- Check if the email is spelled correctly

### "Invalid admin secret" error
- Make sure you're using: `DELETE_USERS_SECRET_2024`
- The secret is case-sensitive

### Function timeout
- If deleting many accounts at once, try deleting them one at a time
- Large accounts with lots of data may take 20-30 seconds

### Permission denied
- Make sure the Cloud Function `deleteUserAccount` is deployed
- Check Firebase Console logs for detailed errors

---

## Cloud Function Details

The deletion is handled by the Cloud Function: `deleteUserAccount`

**Location**: `functions/src/deleteUserAccount.ts`

**Deployed to**: us-central1

**Security**: Requires admin secret to prevent unauthorized deletions

---

## Re-deployment (if needed)

If you need to redeploy the function:

```bash
cd "/Users/Ira/Desktop/Wiz Magic"
firebase deploy --only functions:deleteUserAccount
```

---

## Support

If you encounter any issues:
1. Check the browser console for errors (F12 → Console tab)
2. Check Firebase Functions logs: https://console.firebase.google.com/project/wiz-magic-platform/functions/logs
3. Verify the function is deployed: `firebase functions:list`

---

**Last Updated**: October 20, 2025
