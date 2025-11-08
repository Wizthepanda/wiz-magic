# Create Firestore Index for Featured Creators

## Quick Fix - Click this link:

https://console.firebase.google.com/v1/r/project/wiz-magic-platform/firestore/indexes?create_composite=ClNwcm9qZWN0cy93aXotbWFnaWMtcGxhdGZvcm0vZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2NyZWF0b3JzL2luZGV4ZXMvXxABGg4KCmlzRmVhdHVyZWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC

## Or Manual Steps:

1. Go to: https://console.firebase.google.com/project/wiz-magic-platform/firestore/indexes

2. Click "Create Index"

3. Configure:
   - **Collection ID**: `creators`
   - **Fields to index**:
     - Field: `isFeatured`, Order: `Ascending`
     - Field: `createdAt`, Order: `Descending`
     - Field: `__name__`, Order: `Ascending`

4. Click "Create Index"

5. Wait 2-5 minutes for index to build

6. Refresh your app

## What this fixes:

The `useFeaturedCreators` hook queries:
```js
where('isFeatured', '==', true),
orderBy('createdAt', 'desc'),
limit(10)
```

This requires a composite index on both fields.
