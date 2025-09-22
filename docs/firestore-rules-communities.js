// Firestore Security Rules for Communities Collection
// Add these rules to your firestore.rules file

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Communities collection rules
    match /communities/{communityId} {

      // Allow read access to published communities for all users
      // Allow read access to drafts only for the creator
      allow read: if resource.data.status == 'published' ||
                     (request.auth != null &&
                      request.auth.uid == resource.data.creatorId);

      // Allow create only for authenticated users
      // Ensure the creatorId matches the authenticated user
      allow create: if request.auth != null &&
                       request.auth.uid == request.resource.data.creatorId &&
                       isValidCommunityData(request.resource.data) &&
                       request.resource.data.status in ['draft', 'scheduled'];

      // Allow update only for the creator
      // Prevent changing creatorId and other protected fields
      allow update: if request.auth != null &&
                       request.auth.uid == resource.data.creatorId &&
                       request.auth.uid == request.resource.data.creatorId &&
                       isValidCommunityUpdate(request.resource.data, resource.data);

      // Allow delete only for the creator (for drafts only)
      allow delete: if request.auth != null &&
                       request.auth.uid == resource.data.creatorId &&
                       resource.data.status == 'draft';
    }

    // Community members subcollection
    match /communities/{communityId}/members/{memberId} {
      // Allow read for community creator and the member themselves
      allow read: if request.auth != null &&
                     (request.auth.uid == memberId ||
                      isCreatorOfCommunity(communityId, request.auth.uid));

      // Allow create for authenticated users joining a community
      allow create: if request.auth != null &&
                       request.auth.uid == memberId &&
                       isValidMemberData(request.resource.data);

      // Allow update for the member themselves or community creator
      allow update: if request.auth != null &&
                       (request.auth.uid == memberId ||
                        isCreatorOfCommunity(communityId, request.auth.uid));

      // Allow delete for the member themselves or community creator
      allow delete: if request.auth != null &&
                       (request.auth.uid == memberId ||
                        isCreatorOfCommunity(communityId, request.auth.uid));
    }
  }

  // Helper functions

  // Validate community data structure
  function isValidCommunityData(data) {
    return data.keys().hasAll(['title', 'category', 'shortDescription', 'creatorId', 'status']) &&
           data.title is string &&
           data.title.size() >= 5 &&
           data.title.size() <= 120 &&
           data.category is string &&
           data.shortDescription is string &&
           data.shortDescription.size() >= 10 &&
           data.shortDescription.size() <= 300 &&
           data.creatorId is string &&
           data.status in ['draft', 'published', 'scheduled'] &&

           // Validate pricing fields
           (data.zapsRequired is number && data.zapsRequired >= 0) &&
           (data.usdCoPay is number && data.usdCoPay >= 0) &&

           // Validate privacy setting
           data.privacy in ['public', 'private', 'invite'] &&

           // Validate cover media array
           (data.coverMedia is list && data.coverMedia.size() <= 5) &&

           // Validate tags array
           (!data.keys().hasAny(['tags']) ||
            (data.tags is list && data.tags.size() <= 10));
  }

  // Validate community update (prevent changing protected fields)
  function isValidCommunityUpdate(newData, oldData) {
    return newData.creatorId == oldData.creatorId &&
           newData.createdAt == oldData.createdAt &&
           isValidCommunityData(newData) &&

           // Only allow status change from draft to published/scheduled
           // or from scheduled to published (server functions only)
           (oldData.status == 'draft' ||
            (oldData.status == 'scheduled' && newData.status == 'published')) &&

           // Prevent publishing without server validation
           (newData.status != 'published' || oldData.status == 'scheduled');
  }

  // Check if user is creator of a community
  function isCreatorOfCommunity(communityId, userId) {
    return get(/databases/$(database)/documents/communities/$(communityId)).data.creatorId == userId;
  }

  // Validate member data
  function isValidMemberData(data) {
    return data.keys().hasAll(['userId', 'joinedAt', 'role']) &&
           data.userId is string &&
           data.joinedAt is timestamp &&
           data.role in ['member', 'moderator', 'admin'];
  }
}

// Example server-side function rules (Cloud Functions)
// These would be implemented in your Cloud Functions

/*
// Only server functions can publish communities
exports.publishCommunity = functions.firestore
  .document('communities/{communityId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // If status changed to published, validate and process
    if (oldData.status !== 'published' && newData.status === 'published') {

      // Validate all required fields are present
      if (!validateRequiredFields(newData)) {
        throw new Error('Missing required fields for publishing');
      }

      // Route to appropriate discovery system
      if (newData.zapsRequired === 0 && newData.usdCoPay === 0) {
        // Route to Community Discovery
        await routeToCommunityDiscovery(context.params.communityId, newData);
      } else {
        // Route to XP Shop/Rewards
        await routeToRewardsMarketplace(context.params.communityId, newData);
      }

      // Update publishedAt timestamp
      await change.after.ref.update({
        publishedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

function validateRequiredFields(data) {
  return data.title &&
         data.category &&
         data.shortDescription &&
         data.privacy &&
         typeof data.zapsRequired === 'number' &&
         typeof data.usdCoPay === 'number';
}

async function routeToCommunityDiscovery(communityId, data) {
  // Call existing community discovery API
  // DO NOT CHANGE - uses existing backend logic
  await admin.firestore()
    .collection('community_discovery')
    .doc(communityId)
    .set({
      ...data,
      discoveryType: 'community',
      tier: 'free',
      publishedAt: admin.firestore.FieldValue.serverTimestamp()
    });
}

async function routeToRewardsMarketplace(communityId, data) {
  // Call existing rewards/XP shop API
  // DO NOT CHANGE - uses existing backend logic
  await admin.firestore()
    .collection('xp_rewards')
    .doc(communityId)
    .set({
      ...data,
      rewardType: 'community',
      tier: 'paid',
      zapsCost: data.zapsRequired,
      usdPrice: data.usdCoPay,
      publishedAt: admin.firestore.FieldValue.serverTimestamp()
    });
}
*/

// Additional security considerations:

// 1. Rate limiting for community creation (max 5 per day per user)
// 2. Content moderation hooks for title/description
// 3. Image/media URL validation
// 4. Spam prevention for tags
// 5. Payment validation for paid communities
// 6. Community member limits enforcement
// 7. Access control for private/invite-only communities