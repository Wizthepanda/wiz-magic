# YouTube Publish Flow - Testing Checklist

## 🧪 Complete Testing Guide

Use this checklist to verify all changes are working correctly.

---

## ✅ Pre-Testing Setup

- [ ] Ensure you're logged into WIZUP with a valid account
- [ ] Have a YouTube channel ready to connect
- [ ] Make sure you have at least 5-10 videos on your YouTube channel
- [ ] Open browser DevTools console to monitor API calls and logs

---

## 📋 Test Scenarios

### **Test 1: YouTube Connection Flow**

**Steps:**
1. [ ] Navigate to Creator Studio → YouTube tab
2. [ ] Click "Connect YouTube Channel"
3. [ ] OAuth popup opens
4. [ ] Sign in and authorize WIZUP
5. [ ] Popup closes and redirects back

**Expected Results:**
- [ ] ✅ Successfully connected
- [ ] ✅ Channel info displays (name, avatar)
- [ ] ✅ Videos are fetched and displayed
- [ ] ✅ **ALL videos are pre-selected (auto-selected)**
- [ ] ✅ Progress indicator shows "Step 2 of 3"
- [ ] ✅ Header says "Select Videos & Categories"

**Console Check:**
- [ ] Look for `channelInfo.customUrl` in console logs
- [ ] Should show your YouTube handle (e.g., `@facelessavatars7049`)

---

### **Test 2: Video Selection & Deselection**

**Steps:**
1. [ ] After connecting, all videos should be selected
2. [ ] Click checkbox to deselect 2-3 videos
3. [ ] Click checkbox again to re-select them

**Expected Results:**
- [ ] ✅ Checkboxes respond to clicks
- [ ] ✅ Selected count updates in real-time
- [ ] ✅ Video cards show visual indication of selection (border highlight)
- [ ] ✅ Progress bar updates based on selected videos

---

### **Test 3: Category Assignment (Individual)**

**Steps:**
1. [ ] Select a video
2. [ ] Click "Category" dropdown
3. [ ] Choose "Tech"
4. [ ] Click "Subcategory" dropdown
5. [ ] Choose "AI & Machine Learning"
6. [ ] Repeat for another video with different category

**Expected Results:**
- [ ] ✅ Category dropdown shows all main categories
- [ ] ✅ After selecting category, subcategory dropdown becomes enabled
- [ ] ✅ Subcategory dropdown shows ONLY subcategories for selected category
- [ ] ✅ Progress bar updates (e.g., "2 of 6 videos")
- [ ] ✅ Category pills appear on video card

---

### **Test 4: Apply to All (Bulk Assignment)**

**Steps:**
1. [ ] Click "Apply to All Videos" button
2. [ ] Select "Money" category
3. [ ] Select "Investing & Stocks" subcategory
4. [ ] Click "Apply to All"

**Expected Results:**
- [ ] ✅ Popover closes
- [ ] ✅ ALL selected videos now have "Money" / "Investing & Stocks"
- [ ] ✅ Progress bar shows "6 of 6 videos" (or whatever total you have)
- [ ] ✅ All video cards show category pills

---

### **Test 5: Validation & Error Handling**

**Steps:**
1. [ ] Select 3 videos
2. [ ] Assign categories to only 2 of them
3. [ ] Try to click "Next: Publish"

**Expected Results:**
- [ ] ✅ "Next: Publish" button is DISABLED
- [ ] ✅ Progress bar shows incomplete (e.g., "2 of 3 videos")
- [ ] ✅ Cannot proceed to next step

**Then:**
4. [ ] Assign category to the 3rd video
5. [ ] Try to click "Next: Publish" again

**Expected Results:**
- [ ] ✅ "Next: Publish" button is now ENABLED
- [ ] ✅ Progress bar shows complete (e.g., "3 of 3 videos")
- [ ] ✅ Can proceed to next step

---

### **Test 6: Review & Publish**

**Steps:**
1. [ ] After categorizing all videos, click "Next: Publish"
2. [ ] Review page displays
3. [ ] Verify all videos are shown with their categories
4. [ ] Click "Publish to Discover"

**Expected Results:**
- [ ] ✅ Progress indicator shows "Step 3 of 3"
- [ ] ✅ Header says "Ready to Publish"
- [ ] ✅ All videos display with category tags
- [ ] ✅ Publish button is enabled
- [ ] ✅ Loading spinner shows while publishing
- [ ] ✅ Success message after publishing

**Console Check:**
- [ ] Look for console logs: `✅ Published video [id] to Discover with category: [category], subcategory: [subcategory]`
- [ ] Check that `creatorName` in payload is the YouTube handle, not Google displayName

---

### **Test 7: Discover Page Verification**

**Steps:**
1. [ ] After successful publish, click "View on Discover"
2. [ ] Or navigate to Discover page manually
3. [ ] Look for your published videos

**Expected Results:**
- [ ] ✅ Your videos appear in the Discover feed
- [ ] ✅ **Username shows YouTube handle (e.g., @facelessavatars7049) NOT "Irfan Dean"**
- [ ] ✅ Profile picture shows YouTube avatar
- [ ] ✅ Category is displayed correctly
- [ ] ✅ Videos are clickable and play correctly

---

### **Test 8: Category Filtering on Discover**

**Steps:**
1. [ ] On Discover page, look at category filter row
2. [ ] Click on the category you published videos to (e.g., "Tech")
3. [ ] Observe which videos appear

**Expected Results:**
- [ ] ✅ Filter row shows all available categories
- [ ] ✅ Clicking a category filters videos to that category only
- [ ] ✅ Your published videos appear when their category is selected
- [ ] ✅ Videos with different categories don't appear

---

### **Test 9: Back Navigation**

**Steps:**
1. [ ] Connect YouTube → Get to Step 2
2. [ ] Click "Back" button
3. [ ] Should return to Step 1

**Expected Results:**
- [ ] ✅ Returns to connection screen
- [ ] ✅ No errors in console
- [ ] ✅ Can reconnect if needed

**Then:**
4. [ ] Connect again → Get to Step 2 → Categorize videos → Get to Step 3
5. [ ] Click "Back" button
6. [ ] Should return to Step 2

**Expected Results:**
- [ ] ✅ Returns to categorization screen
- [ ] ✅ Previously assigned categories are preserved
- [ ] ✅ Can modify and proceed again

---

### **Test 10: Reset Flow**

**Steps:**
1. [ ] Complete entire flow to success screen
2. [ ] Click "Publish More Videos" or "Reset"
3. [ ] Should return to Step 1

**Expected Results:**
- [ ] ✅ Returns to connection screen
- [ ] ✅ All state is cleared
- [ ] ✅ Can start fresh flow

---

## 🔍 Edge Case Testing

### **Edge Case 1: No Videos on Channel**

**Steps:**
1. [ ] Connect a YouTube channel with 0 videos

**Expected Results:**
- [ ] ✅ Shows empty state message
- [ ] ✅ No errors in console
- [ ] ✅ User is informed to upload videos first

---

### **Edge Case 2: Channel Without Custom URL**

**Steps:**
1. [ ] Connect a brand new YouTube channel (< 100 subscribers)
2. [ ] These channels typically don't have a custom URL

**Expected Results:**
- [ ] ✅ Connection still works
- [ ] ✅ Falls back to `channelTitle` for username
- [ ] ✅ Videos publish successfully
- [ ] ✅ Username on Discover shows channel title instead of @handle

---

### **Edge Case 3: Network Errors**

**Steps:**
1. [ ] Start publishing videos
2. [ ] Turn off WiFi midway through
3. [ ] Observe error handling

**Expected Results:**
- [ ] ✅ Error message displayed
- [ ] ✅ User is notified of the issue
- [ ] ✅ Can retry after reconnecting

---

### **Edge Case 4: Token Expiration**

**Steps:**
1. [ ] Connect YouTube
2. [ ] Wait for access token to expire (or simulate by clearing Firestore tokens)
3. [ ] Try to publish

**Expected Results:**
- [ ] ✅ System attempts to refresh token
- [ ] ✅ If refresh succeeds, publish continues
- [ ] ✅ If refresh fails, user is prompted to reconnect

---

## 🐛 Known Issues to Verify

### **Issue 1: Username Display**
**Problem:** Username was showing "Irfan Dean" instead of "@facelessavatars7049"

**Test:**
- [ ] Publish videos
- [ ] Go to Discover page
- [ ] **Verify**: Username shows YouTube channel handle, NOT Google displayName

**Status:** ✅ Fixed (using `channelHandle` field)

---

### **Issue 2: Missing Firestore Permissions**
**Problem:** Publishing failed with "Missing or insufficient permissions"

**Test:**
- [ ] Publish videos
- [ ] Check console for errors
- [ ] **Verify**: No permission errors

**Status:** ✅ Fixed (Firestore rules deployed)

---

### **Issue 3: Step Count Mismatch**
**Problem:** Progress indicator showed incorrect step numbers

**Test:**
- [ ] Navigate through all steps
- [ ] **Verify**: Progress bar and step indicators match
  - Step 1: 25% progress
  - Step 2: 50% progress
  - Step 3: 75% progress
  - Step 4: 100% progress

**Status:** ✅ Fixed (updated from /5 to /4)

---

## 📊 Performance Testing

### **Load Time**
- [ ] Connection completes within 3-5 seconds
- [ ] Video fetching completes within 5-10 seconds
- [ ] Categorization UI is responsive (no lag)
- [ ] Publishing completes within 10-20 seconds (for 5-10 videos)

### **UI Responsiveness**
- [ ] Dropdowns open instantly
- [ ] Checkboxes respond immediately
- [ ] Progress bar updates smoothly
- [ ] No visual glitches or jumps

---

## 🎨 Visual Testing

### **Desktop (1920x1080)**
- [ ] All components render correctly
- [ ] No text overflow
- [ ] Buttons are properly sized
- [ ] Images load correctly

### **Tablet (iPad Air)**
- [ ] Responsive layout works
- [ ] Touch targets are large enough
- [ ] Scrolling is smooth

### **Mobile (iPhone 14)**
- [ ] Mobile layout adapts correctly
- [ ] Dropdowns work on mobile
- [ ] Touch interactions work

---

## 🔐 Security Testing

### **Authentication**
- [ ] Cannot access YouTube Studio without being logged in
- [ ] Cannot publish videos without YouTube connection
- [ ] Only creator can publish videos under their name

### **Data Validation**
- [ ] Cannot submit empty categories
- [ ] Cannot submit empty subcategories
- [ ] Firestore validates all required fields

---

## 📝 Final Verification

After completing all tests above:

- [ ] ✅ All 10 main test scenarios pass
- [ ] ✅ All 4 edge cases handled correctly
- [ ] ✅ No console errors
- [ ] ✅ Username displays correctly on Discover
- [ ] ✅ Categories filter correctly on Discover
- [ ] ✅ Performance is acceptable
- [ ] ✅ UI is responsive on all devices
- [ ] ✅ Security checks pass

---

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] All tests pass ✅
- [ ] Firestore rules deployed ✅
- [ ] No linter errors ✅
- [ ] Code reviewed
- [ ] Build succeeds (`npm run build`)
- [ ] Staging tested
- [ ] User documentation updated
- [ ] Analytics tracking in place
- [ ] Error monitoring configured

---

## 📞 Support

If you encounter any issues during testing:

1. **Check Console Logs**
   - Look for errors or warnings
   - Check network requests

2. **Verify Firestore Rules**
   - Run: `firebase deploy --only firestore:rules`
   - Check Firebase Console

3. **Clear Cache**
   - Clear browser cache
   - Clear localStorage
   - Hard refresh (Cmd/Ctrl + Shift + R)

4. **Check Dependencies**
   - Ensure all npm packages are up to date
   - Run: `npm install`

---

## 🎯 Success Criteria

The implementation is successful if:

1. ✅ Users can complete the flow in 3 steps (+ success)
2. ✅ All videos are auto-selected after connection
3. ✅ Categories and subcategories are assigned correctly
4. ✅ **Videos display with YouTube channel handle on Discover**
5. ✅ Category filtering works on Discover page
6. ✅ No errors in production
7. ✅ User feedback is positive

---

**Created**: November 4, 2025  
**Last Updated**: November 4, 2025  
**Status**: Ready for Testing ✅

